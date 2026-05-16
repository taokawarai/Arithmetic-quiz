# Research: WAIS-IV 算数サブテスト 自動問題生成エンジン

**Phase**: 0 — Outline & Research  
**Date**: 2026-05-17  
**Status**: Complete

---

## 1. 技術スタック選定

### Decision
HTML5 + Vanilla JavaScript (ES5) + CSS3。フレームワーク・ビルドツールなし。

### Rationale
同リポジトリの兄弟プロジェクト `digit-span` が同一スタックで実装済みであり、
speech.js・timer.js のアーキテクチャを直接継承できる。依存関係ゼロで
オフライン動作・ブラウザ直開きが可能。

### Alternatives Considered
- **React / Vue SPA**: コンポーネント再利用性は高いが、ビルド環境が必要で digit-span との統一性が崩れる → 却下
- **TypeScript**: 型安全性が増すが、コンパイルステップが必要 → スコープ外

---

## 2. 問題生成エンジン設計

### Decision
`generate_problem(level_id, sub_category)` 関数を `generator.js` に実装。
内部でリトライループ（デフォルト上限 100 回）を持ち、制約違反の変数を棄却・再抽選する。
Level 4 の逆算パターンは専用ジェネレーター関数（例: `_buildAgePattern()`）が変数を逆算してから問題を組み立てる。

### Rationale
- リトライ上限を設けることで無限ループを防止（FR-004）
- 逆算アプローチにより Level 4 の整数解保証が 100% 達成可能（FR-011, SC-006）
- パターン定義を `patterns.js` に分離することで、将来のパターン追加が generator.js を変更せずに行える

### Alternatives Considered
- **候補リストを事前列挙してランダム選択**: 整数解を保証しやすいが、バリエーションが固定値に限定される → リトライ方式の方が組み合わせ爆発を活かせる
- **制約ソルバーライブラリ**: オーバーエンジニアリング、外部依存が生じる → 却下

---

## 3. 音声読み上げ設計

### Decision
digit-span の `speech.js`（`speakDigits`）をベースに `speakText(text, onComplete)` 関数として適応。
- **区切りモード (joined=false)**: 問題文を日本語句読点（`、`・`。`・`？`）で分割し、
  各セグメントを個別 `SpeechSynthesisUtterance` で連鎖読み上げ（digit-span の digit-by-digit 方式と同一パターン）。
  セグメント間隔は `Math.max(80, Math.round(500 / rate))` ms。
- **つなげるモード (joined=true)**: 全文を 1 つの Utterance で読み上げ（digit-span の joined モードと同一）。
- **ウォームアップ**: digit-span と同様に無音 Utterance でウォームアップしクリッピングを防止。
- **数字の日本語読み上げ**: 句読点で分割した後、各セグメント内の算用数字はブラウザのデフォルト TTS エンジンに委ねる（`ja-JP` ロケールでは「3」→「さん」と読む）。必要に応じてプリプロセッサーで算用数字を漢数字/ひらがな表記に変換するユーティリティを用意する（例: `normalizeNumbersForSpeech(text)`）。

### Rationale
digit-span 実装の実績あるパターンを再利用することで実装リスクを最小化。
数字の読み上げ問題はプリプロセス変換で確実に対処できる。

### Alternatives Considered
- **SSML による細粒度制御**: Web Speech API の SSML サポートはブラウザ依存で信頼性が低い → 却下
- **音声ファイル録音**: 録音コストが高く変数が無限なため非現実的 → 却下

---

## 4. カウントダウンタイマー設計

### Decision
digit-span の `CountdownTimer`（ドリフト補正付き `setInterval` 実装）をそのまま移植。
`duration` を `time_limit`（30 秒 or 60 秒）から受け取り、`onTick` で残り秒数を更新、
`onExpire` で自動不正解処理を呼び出す。
残り 10 秒以下で `countdown-value` 要素に `warning` クラスを付与（赤色表示）。

### Rationale
digit-span の実装で ±1 秒以内の精度が実証済み（SC-010 を満たす）。コードの重複を
最小化でき、バグが入り込む余地が少ない。

---

## 5. 画面構成

### Decision
digit-span と同じ「複数 `<section class="screen">` を CSS で切り替える SPA」パターン。

```
screen-top       : レベル選択（1〜4）+ Web Speech API チェック
screen-question  : 問題提示・読み上げコントロール・カウントダウン・回答入力
screen-result    : 正誤結果・もう一度 / TOP へ戻る
```

設定パネル（読み上げ速度スライダー・読み方切替）は `screen-question` 内に内蔵。

### Rationale
digit-span と同一 UX パターンで一貫性を保ちつつ、実装コストを最小化。

---

## 6. 問題文数字の日本語読み上げ対策

### Decision
`normalizeNumbersForSpeech(text)` ユーティリティ関数を `generator.js` 内に実装。
問題文生成時に算用数字を「読み上げ用テキスト」に変換したフィールド `questionForSpeech` を
ProblemOutput に追加する。

変換ルール:
- 整数（0〜99）: 数字をそのまま残す（Chrome/Safari `ja-JP` では自然に読まれる）
- 単位付き数字（例: `3個`, `500円`）: `3 個`, `500 円` のようにスペースを挿入して
  読み上げエンジンの解析を補助
- 割合・小数（例: `30%`, `1.5倍`）: `三十パーセント`, `一・五倍` に変換

実際の読み上げ確認は Chrome DevTools の TTS テストで行う。

### Rationale
算用数字をそのまま TTS に渡すと読み上げが不安定になりうる（SC-008 の対策）。
`questionForSpeech` を別フィールドで持つことで、表示用テキスト（`question`）を変えずに済む。

---

## 7. 未解決事項（なし）

全 NEEDS CLARIFICATION は spec.md で解決済み。追加調査項目なし。
