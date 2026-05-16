# Implementation Plan: WAIS-IV 算数サブテスト 自動問題生成エンジン

**Branch**: `001-wais-arithmetic-generator` | **Date**: 2026-05-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-wais-arithmetic-generator/spec.md`

---

## Summary

WAIS-IV の算数サブテストを模した問題を自動生成・音声提示する純粋クライアントサイド Web アプリを実装する。
digit-span プロジェクト（`C:\study\digit-span`）と同じ技術スタック（バニラ JS / HTML / CSS、フレームワーク・ビルドツールなし）を採用し、音声読み上げモジュール・カウントダウンタイマーのアーキテクチャを継承・適応する。

コアは問題生成エンジン（4 レベル・16 パターン・整数解バリデーション）、
音声読み上げ層（Web Speech API `ja-JP`、rate=1.0 デフォルト、区切りモード）、
カウントダウン層（ドリフト補正付き、30 秒 / 60 秒）の 3 層構成。

---

## Technical Context

**Language/Version**: HTML5 + Vanilla JavaScript (ES5 互換) + CSS3

**Primary Dependencies**: なし（ブラウザ標準 API のみ: Web Speech API, setInterval）

**Storage**: なし（セッション内メモリのみ、サーバーサイド不要）

**Testing**: 手動テスト（ブラウザコンソール）＋ `generate_problem` のコンソール連続呼び出しスクリプト

**Target Platform**: モダンブラウザ（Chrome, Safari, Edge）デスクトップ・モバイル両対応

**Project Type**: シングルページ Web アプリ（静的ファイル、サーバー不要）

**Performance Goals**: 問題生成 1 回あたり平均 100ms 以内、カウントダウン精度 ±1 秒

**Constraints**: オフライン動作可能、外部 API 不使用、Web Speech API 非対応時はエラー表示して停止

**Scale/Scope**: 4 レベル × 16 問題パターン、スクリーン数 3〜4（TOP / 問題提示 / 結果）

---

## Constitution Check

*Constitution ファイルはプレースホルダーのみのため、プロジェクト慣行（digit-span 実装）を規範として扱う。*

| 確認事項 | 判定 | 根拠 |
|---------|------|------|
| フレームワークなしの純粋 JS | ✅ PASS | digit-span と同一スタック |
| クライアントサイドのみ | ✅ PASS | サーバー・DB 不使用 |
| Web Speech API 依存 | ✅ PASS | 非対応ブラウザは起動時にエラーを表示して明示的に停止 |
| 外部 CDN・API | ✅ PASS | 使用なし |

---

## Project Structure

### Documentation (this feature)

```text
specs/001-wais-arithmetic-generator/
├── plan.md              ← このファイル
├── research.md          ← Phase 0 成果物
├── data-model.md        ← Phase 1 成果物
├── quickstart.md        ← Phase 1 成果物
├── contracts/
│   └── generator-api.md ← Phase 1 成果物
└── tasks.md             ← /speckit.tasks コマンドで生成（未作成）
```

### Source Code (repository root)

```text
index.html               # 全画面を含む SPA エントリポイント

css/
└── style.css            # 全スタイル（digit-span の style.css をベースに拡張）

js/
├── patterns.js          # 問題パターン定義・アイテム辞書・人物辞書
├── generator.js         # 変数生成・制約バリデーター・問題ビルダー (generate_problem)
├── speech.js            # Web Speech API ラッパー（digit-span speech.js を文章読み上げ向けに適応）
├── timer.js             # ドリフト補正付きカウントダウンタイマー（digit-span timer.js を移植）
├── game.js              # クイズフロー状態機械（問題提示・タイマー制御・採点）
└── app.js               # DOM イベントバインド・画面遷移
```

**Structure Decision**: digit-span と同一の単一プロジェクト構成を採用。ロールごとにファイル分割し、依存関係は `<script>` タグのロード順で解決（patterns.js → generator.js → speech.js → timer.js → game.js → app.js）。

---

## Complexity Tracking

*Constitution Check に違反なし。記入不要。*


[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION]

**Primary Dependencies**: [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION]

**Storage**: [if applicable, e.g., PostgreSQL, CoreData, files or N/A]

**Testing**: [e.g., pytest, XCTest, cargo test or NEEDS CLARIFICATION]

**Target Platform**: [e.g., Linux server, iOS 15+, WASM or NEEDS CLARIFICATION]

**Project Type**: [e.g., library/cli/web-service/mobile-app/compiler/desktop-app or NEEDS CLARIFICATION]

**Performance Goals**: [domain-specific, e.g., 1000 req/s, 10k lines/sec, 60 fps or NEEDS CLARIFICATION]

**Constraints**: [domain-specific, e.g., <200ms p95, <100MB memory, offline-capable or NEEDS CLARIFICATION]

**Scale/Scope**: [domain-specific, e.g., 10k users, 1M LOC, 50 screens or NEEDS CLARIFICATION]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

[Gates determined based on constitution file]

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
