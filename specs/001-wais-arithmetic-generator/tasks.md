# Tasks: WAIS-IV 算数サブテスト 自動問題生成エンジン

**Input**: Design documents from `specs/001-wais-arithmetic-generator/`

**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/ ✅ quickstart.md ✅

**Organization**: ユーザーストーリー単位でフェーズを構成。各フェーズ完了後に独立してテスト可能。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並列実行可能（異なるファイル、依存タスク完了不要）
- **[Story]**: 対応するユーザーストーリー（US1〜US5）
- 各タスクに正確なファイルパスを記載

---

## Phase 1: Setup（共有インフラ）

**Purpose**: プロジェクトディレクトリ・HTML スケルトン・CSS ベースライン・タイマーモジュールの準備

- [ ] T001 `css/` ディレクトリと `js/` ディレクトリを作成し、`index.html` を空ファイルで配置してプロジェクト構造を確立する
- [ ] T002 `index.html` に DOCTYPE・`<head>`（viewport, charset, style.css リンク）・3 画面分の `<section class="screen">` 骨格（`screen-top` / `screen-question` / `screen-result`）と script 読み込み順（patterns.js → generator.js → speech.js → timer.js → game.js → app.js）を記述する
- [ ] T003 [P] `css/style.css` を作成し、digit-span の `style.css` をベースに `.screen` / `.container` / `.btn` / `.countdown` / `.history-display` / `.speed-control` 等の共通スタイルを移植・適応する
- [ ] T004 [P] `js/timer.js` を作成し、digit-span の `CountdownTimer`（ドリフト補正付き `setInterval`）をそのまま移植する（コンストラクター・`start` / `stop` / `reset` / `getRemaining` メソッド）

**Checkpoint**: `index.html` をブラウザで開き、空白の画面が崩れずに表示されることを確認する

---

## Phase 2: Foundational（全ユーザーストーリーの前提）

**Purpose**: 辞書データ・パターン骨格・音声モジュールの基盤を整備。全 US が依存するため、この フェーズ完了まで US 実装を開始しない

**⚠️ CRITICAL**: このフェーズが完了するまで Phase 3 以降を開始しない

- [ ] T005 `js/patterns.js` の先頭に `ITEM_DICT`（fruits / stationery / food / animals / vehicles の各配列）と `PERSON_DICT`（single 配列・roles オブジェクト）のグローバル定数を定義し、`ProblemPattern` オブジェクトの配列 `ALL_PATTERNS = []` を空で初期化する
- [ ] T006 [P] `js/speech.js` を作成し、digit-span の `speech.js` をベースに `SpeechSettings`（`rate: 1.0`, `joined: false`）・`isSupported()`・`speakText(text, onComplete)` 関数（句読点「、。？」でセグメント分割して個別 Utterance 連鎖読み上げ＝区切りモード / 全文 1 Utterance＝つなげるモード）・無音ウォームアップ処理を実装する（lang: `ja-JP`）

**Checkpoint**: ブラウザコンソールで `isSupported()` が `true` を返し、`speakText("テスト。確認です。", function(){console.log("done")})` で音声が鳴ることを確認する

---

## Phase 3: User Story 1 — 問題の自動生成と即時取得 (Priority: P1) 🎯 MVP

**Goal**: `generate_problem("level1")` 〜 `"level4"` が呼び出せ、常に整数解の問題オブジェクトを返す

**Independent Test**: ブラウザコンソールで `for(var i=0;i<100;i++) console.log(generate_problem("level1").answer)` を実行し、全出力が正の整数であることを目視確認する

### Implementation

- [ ] T007 [US1] `js/patterns.js` にレベル1の 7 パターン（L1-ADD, L1-SUB, L1-MUL, L1-DIV, L1-CHANGE, L1-TIME, L1-LINE）を `ALL_PATTERNS.push(...)` で追加する。各パターンに `id`, `level:1`, `sub_category`, `time_limit:30`, `situations`（各1件）, `constraints(vars)`, `generate()`, `formula(vars)` を実装する
- [ ] T008 [US1] `js/patterns.js` にレベル2の 6 パターン（L2-MULTI, L2-AVG, L2-DOZEN, L2-FRAC, L2-SHORT, L2-AGE）を追加する。L2-AGE は逆算ロジック（`yearsLater` → `multiplier` → `fatherAge`）で `generate()` を実装する
- [ ] T009 [US1] `js/patterns.js` にレベル3の 6 パターン（L3-DISC, L3-SPEED, L3-CHASE, L3-RATIO, L3-PLANT, L3-SET）を追加する。`time_limit:60`。L3-CHASE は `(X×T) % (Y-X) === 0` の制約を満たす組み合わせを列挙から選択する
- [ ] T010 [US1] `js/patterns.js` にレベル4の 4 パターン（L4-MEET, L4-NESTED, L4-CRANE, L4-CONC）を追加する。`time_limit:60`。全パターンに逆算 `generate()` を実装し、整数解を保証する
- [ ] T011 [US1] `js/generator.js` に `generate_problem(level_id, sub_category)` を実装する。①レベル検証（INVALID_LEVEL エラー）②パターン絞り込み（sub_category 指定時は INVALID_SUB_CATEGORY チェック）③`pattern.generate()` でリトライループ（上限 100 回、超過時は MAX_RETRIES_EXCEEDED エラー）④`pattern.formula(vars)` で解を計算⑤テンプレートに変数・アイテム名を挿入して `question` 文字列を生成⑥`normalizeNumbersForSpeech(question)` で `questionForSpeech` を生成⑦`ProblemOutput` オブジェクトを返す
- [ ] T012 [US1] `js/generator.js` に `normalizeNumbersForSpeech(text)` を実装する。単位前後にスペースを挿入（`3個` → `3 個`）し、`%` を `パーセント` に変換するなど、TTS エンジンの誤読を防ぐ最小限の正規化を行う

**Checkpoint**: コンソールで `generate_problem("level1")` 〜 `generate_problem("level4")` が正常オブジェクトを返し、`generate_problem("level9")` が `{error:true, code:"INVALID_LEVEL"}` を返すことを確認する

---

## Phase 4: User Story 2 — 問題文の読み上げとカウントダウン (Priority: P1)

**Goal**: 「開始」ボタン → 問題文を読み上げ → カウントダウン → 回答受付 → 正誤表示、の一連フローが動作する

**Independent Test**: ブラウザで `index.html` を開き、レベルを選択して「開始」を押したとき、問題文が読み上げられてから指定秒のカウントダウンが始まり、回答を入力して「回答」ボタンを押すと正誤が表示されることを確認する

### Implementation

- [ ] T013 [US2] `js/game.js` に `AppState`（`currentLevel`, `currentProblem`, `phase`, `isSpeaking`, `isAwaitingAnswer`, `history`）と `showScreen(id)` / `hideAllScreens()` を実装する
- [ ] T014 [US2] `js/game.js` に `startQuestion()` を実装する。`generate_problem(AppState.currentLevel)` を呼び出し、`AppState.currentProblem` にセットし、`AppState.isSpeaking = true` の後 `speakText(problem.questionForSpeech, onSpeakComplete)` を呼び出す。読み上げ中は回答フォームを `disabled` にする
- [ ] T015 [US2] `js/game.js` に `startAnswerPhase()` を実装する。読み上げ完了コールバック内から呼ばれ、回答フォームを有効化し、`CountdownTimer(problem.time_limit, onTick, onExpire)` を生成・開始する。`onTick` で残り秒を表示・残り 10 秒以下で `warning` クラス付与。`onExpire` で `handleAnswerSubmit("")` を呼び出す
- [ ] T016 [US2] `js/game.js` に `handleAnswerSubmit(inputStr)` を実装する。`!AppState.isAwaitingAnswer` なら早期リターン。タイマーを停止し、正解値（`currentProblem.answer`）とユーザー入力を数値比較で採点し、`appendHistoryEntry()` を呼び出す。その後 `showResult()` へ遷移する
- [ ] T017 [US2] `js/game.js` に `appendHistoryEntry(isCorrect, problem, userInput)` と `showResult()` を実装する。履歴エントリーを `#history-display` に先頭追記（○/×・問題文・正解・入力値）し、結果画面では正誤サマリーを表示する
- [ ] T018 [US2] `index.html` の `screen-question` 内に問題ステータステキスト・カウントダウン表示（`#countdown-display` / `#countdown-value`）・回答フォーム（`#answer-input` / `#btn-answer-submit`）・読み上げ速度スライダー（min=0.5, max=2.0, step=0.1, value=1.0）・読み方セグメントボタン（「つなげる」 / 「区切る」active）・「開始」ボタン（`#btn-question-start`）を追加し、`screen-result` に正誤サマリー・「次の問題」・「TOPへ戻る」ボタンを追加する
- [ ] T019 [US2] `js/app.js` に `DOMContentLoaded` ハンドラーを実装する。①`isSupported()` チェック（false なら `#speech-error` を表示し開始ボタンを無効化）②速度スライダーの `input` イベント（`SpeechSettings.rate` 更新・表示同期）③読み方ボタンの `click` イベント（`SpeechSettings.joined` 更新・active クラス同期）④`#btn-question-start` クリック → `startQuestion()`⑤`#btn-answer-submit` クリック + `#answer-input` Enter キー → `handleAnswerSubmit()`⑥「次の問題」→ `startQuestion()`⑦「TOPへ戻る」→ `showScreen("screen-top")`
- [ ] T020 [US2] `css/style.css` に読み上げ中の入力無効スタイル（`input:disabled`, `button:disabled` の opacity）・カウントダウン警告スタイル（`.warning` テキスト赤色）・履歴エントリースタイル（`.correct` / `.wrong` 背景色）を追加する

**Checkpoint**: `index.html` でレベル選択 → 開始 → 読み上げ → カウントダウン → 回答 → ○× 表示 の全フローを動作確認する

---

## Phase 5: User Story 3 — レベル別・サブカテゴリ別問題の取得 (Priority: P2)

**Goal**: レベル 1〜4 の選択が画面から行え、制限時間が問題のレベルに応じて自動設定される。無効レベル指定時はエラーを画面表示する

**Independent Test**: レベル1 → 問題生成 → time_limit が 30 秒のカウントダウン開始を確認。レベル3 → 60 秒のカウントダウン開始を確認する

### Implementation

- [ ] T021 [US3] `index.html` の `screen-top` にレベル選択ボタン 4 つ（`data-level="level1"` 〜 `"level4"`）とレベル説明テキスト（制限時間・問題例の概要）を追加する
- [ ] T022 [US3] `js/app.js` のレベル選択ボタン `click` ハンドラーで `AppState.currentLevel` を更新し、`showScreen("screen-question")` に遷移する処理を追加する
- [ ] T023 [US3] `js/game.js` の `startQuestion()` で `generate_problem()` が `error:true` を返した場合、`#question-status` にエラーメッセージを表示し、開始ボタンを再有効化するエラーハンドリングを追加する

**Checkpoint**: レベル1 選択 → time_limit=30 秒のカウントダウン、レベル3 選択 → 60 秒のカウントダウン、それぞれブラウザで確認する

---

## Phase 6: User Story 4 — シチュエーション（皮）の多様化 (Priority: P3)

**Goal**: 同じ計算骨組みに対して複数のシチュエーションがランダム選択され、10 回連続生成で 3 種類以上の異なる問題文が出現する

**Independent Test**: コンソールで `for(var i=0;i<10;i++) console.log(generate_problem("level1").question)` を実行し、少なくとも 3 種類以上の問題文表現が出現することを確認する

### Implementation

- [ ] T024 [US4] `js/patterns.js` のレベル 1 各パターンの `situations` 配列に 2〜3 件のシチュエーション（買い物・工場・乗り物・学校など文脈違いのテンプレートと unit）を追加する
- [ ] T025 [P] [US4] `js/patterns.js` のレベル 2 各パターンの `situations` 配列にシチュエーションを追加する（L2-MULTI: 文具と食品、L2-AVG: テストとゲームスコア 等）
- [ ] T026 [P] [US4] `js/patterns.js` のレベル 3・4 各パターンの `situations` 配列にシチュエーションを追加する
- [ ] T027 [US4] `js/generator.js` の `generate_problem()` を修正し、`pattern.situations` からランダムに 1 件を選択してテンプレートを決定する処理を追加する（現在 1 件想定のコードをランダム選択に変更）

**Checkpoint**: コンソール連続呼び出しで複数シチュエーションの出現を確認する

---

## Phase 7: User Story 5 — サブカテゴリ指定による問題絞り込み (Priority: P4)

**Goal**: `generate_problem("level3", "speed")` のようにサブカテゴリを指定すると、そのカテゴリのパターンのみから問題が生成される

**Independent Test**: コンソールで `generate_problem("level3", "speed")` を 5 回呼び出し、全て速さ問題（L3-SPEED）が返ることを確認する

### Implementation

- [ ] T028 [US5] `js/generator.js` の `generate_problem()` の `sub_category` フィルタリング処理を完成させる。`sub_category` が指定されかつマッチするパターンが 0 件の場合に `INVALID_SUB_CATEGORY` エラーを返すよう修正する（T011 でスタブ実装済みの部分を確定させる）

**Checkpoint**: `generate_problem("level3", "speed")` → L3-SPEED 問題のみ、`generate_problem("level3", "invalid")` → `{error:true, code:"INVALID_SUB_CATEGORY"}` を確認する

---

## Phase 8: Polish（横断的改善）

**Purpose**: レスポンシブ対応・エッジケース処理・ブラウザ互換性の仕上げ

- [ ] T029 [P] `css/style.css` にモバイルレスポンシブスタイルを追加する（`@media` ブレークポイント・タッチターゲット最小 44px・スライダー幅調整・`inputmode="numeric"` 対応のキーパッド表示確認）
- [ ] T030 [P] `js/speech.js` の `speakText()` に cancel 直後クリッピング防止のウォームアップ処理（無音 Utterance）を追加する（digit-span の warmup パターン移植）
- [ ] T031 `js/app.js` のレベル選択ボタンに読み上げ中・回答中は新たな問題開始を防ぐガード条件（`AppState.phase !== 'idle'` チェック）を追加する
- [ ] T032 `quickstart.md` の手順に従ってブラウザ（Chrome / Edge / Safari）で全ユーザーストーリーの動作を最終確認し、確認済みチェックリストをコンソールログで記録する

---

## Dependencies & Execution Order

### フェーズ依存関係

- **Phase 1 (Setup)**: 依存なし — 即開始可能
- **Phase 2 (Foundational)**: Phase 1 完了後 — **全 US をブロック**
- **Phase 3 (US1)**: Phase 2 完了後 — Phase 4 をブロック
- **Phase 4 (US2)**: Phase 3 完了後（`generate_problem` が必要）
- **Phase 5 (US3)**: Phase 4 完了後（UI 画面が必要）
- **Phase 6 (US4)**: Phase 3 完了後（patterns.js 拡張のみ）— Phase 5 と並列可
- **Phase 7 (US5)**: Phase 3 完了後（generator.js 修正のみ）— Phase 5・6 と並列可
- **Phase 8 (Polish)**: Phase 5 完了後

### ユーザーストーリー依存関係

```
Phase1 → Phase2 → US1(Phase3) → US2(Phase4) → US3(Phase5)
                         ↓
                  US4(Phase6) ← Phase3完了後に着手可
                  US5(Phase7) ← Phase3完了後に着手可
```

### 並列実行チャンス

| 並列グループ | タスク |
|------------|-------|
| Phase 1 内 | T003 (css) ‖ T004 (timer.js) |
| Phase 2 内 | T005 (patterns.js 辞書) ‖ T006 (speech.js) |
| Phase 3 完了後 | US4(T024-T027) ‖ US5(T028) ‖ US3(T021-T023)（UI 未完でも generator 単体は可） |
| Phase 6 内 | T025 (Lv2 situations) ‖ T026 (Lv3-4 situations) |
| Polish 内 | T029 (CSS) ‖ T030 (speech warmup) |

---

## Parallel Example: User Story 1

```js
// Phase 3 の各タスクを順番に実施（全て patterns.js → generator.js を対象とするため順次）:
// T007: Lv1パターン定義 → T008: Lv2 → T009: Lv3 → T010: Lv4 → T011: generate_problem() → T012: normalize

// 完了後コンソール確認:
generate_problem("level1");   // → { question, answer, unit, level:1, time_limit:30 }
generate_problem("level4");   // → { question, answer, unit, level:4, time_limit:60 }
generate_problem("level9");   // → { error:true, code:"INVALID_LEVEL" }
for (var i = 0; i < 1000; i++) {
  var r = generate_problem("level" + (Math.floor(Math.random()*4)+1));
  if (r.error || !Number.isInteger(r.answer)) console.error("FAIL", r);
}
```

---

## Implementation Strategy

### MVP（User Story 1 + 2 のみ）

1. Phase 1: Setup 完了
2. Phase 2: Foundational 完了
3. Phase 3 (US1): 問題生成エンジン完成
4. Phase 4 (US2): UI + 音声 + カウントダウン完成
5. **STOP & VALIDATE**: `index.html` で全レベルの動作確認
6. ブラウザで確認できたら MVP 完成

### 段階的デリバリー

1. Setup + Foundational → 基盤完成
2. US1 → コンソールで問題生成確認（MVP-engine）
3. US2 → ブラウザで全フロー確認（MVP-app）
4. US3 → レベル選択 UI 追加
5. US4 → 問題バリエーション増加
6. US5 → サブカテゴリ絞り込み追加

---

## Notes

- [P] タスク = ファイルが異なり依存なし（並列実行可能）
- [Story] ラベルはトレーサビリティのためユーザーストーリーとタスクを紐付ける
- patterns.js は全パターン追加が完了するまで game.js / app.js の実装を開始しない
- digit-span プロジェクト（`C:\study\digit-span\js\`）を参照実装として積極的に活用する
- 各 Checkpoint でブラウザコンソール確認を必ず行い、次フェーズに進む前に解決する
