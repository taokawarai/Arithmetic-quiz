# Data Model: WAIS-IV 算数サブテスト 自動問題生成エンジン

**Phase**: 1 — Design & Contracts  
**Date**: 2026-05-17

---

## エンティティ一覧

### 1. ProblemPattern（問題の骨組み）

`patterns.js` に定義される静的オブジェクト配列の各要素。

| フィールド | 型 | 説明 |
|-----------|---|------|
| `id` | string | 一意 ID（例: `"L1-ADD"`, `"L4-CRANE"`） |
| `level` | number | 難易度レベル（1〜4） |
| `sub_category` | string | サブカテゴリ（例: `"addition"`, `"speed"`, `"age"`, `"mixture"`） |
| `time_limit` | number | 制限時間（秒）。レベル1・2 = 30, レベル3・4 = 60 |
| `situations` | Situation[] | このパターンで使用できるシチュエーション一覧（1件以上） |
| `constraints` | function(vars) → boolean | 変数セットが制約を満たすか判定する関数 |
| `generate` | function() → VariableSet | 有効な変数セットを生成・返す関数（逆算 or リトライ込み） |
| `formula` | function(vars) → number | 解を計算して返す関数 |

---

### 2. Situation（問題の皮）

`ProblemPattern.situations` の各要素。同一パターンに複数登録可能。

| フィールド | 型 | 説明 |
|-----------|---|------|
| `label` | string | シチュエーション名（例: `"買い物"`, `"工場"`, `"乗り物"`） |
| `template` | string | 問題文テンプレート。`{A}`, `{item_a}` 等をプレースホルダーとして使用 |
| `unit` | string | 答えの単位（例: `"個"`, `"円"`, `"分"`, `"%"`） |
| `item_category` | string \| null | アイテム辞書のカテゴリ名（不要なら null） |

---

### 3. VariableSet（バリデーション済み変数）

`generate()` が返すプレーンオブジェクト。フィールドはパターンによって異なる。

例（L1-ADD 加算パターン）:
```js
{ A: 5, B: 3, item_a: "リンゴ", item_b: "ミカン" }
```

例（L4-AGE 年齢算パターン）:
```js
{ fatherAge: 34, childAge: 10, multiplier: 3, yearsLater: 2 }
```

---

### 4. ProblemOutput（生成済み問題）

`generate_problem()` が返すオブジェクト。

| フィールド | 型 | 説明 |
|-----------|---|------|
| `question` | string | 表示用問題文（算用数字・日本語混在） |
| `questionForSpeech` | string | 読み上げ用問題文（単位前後にスペース挿入等の正規化済み） |
| `answer` | number | 正解値（整数 or 小数点1〜2桁） |
| `unit` | string | 答えの単位 |
| `level` | number | レベル番号（1〜4） |
| `time_limit` | number | 制限時間（秒） |
| `sub_category` | string | サブカテゴリ名 |

---

### 5. ItemDictionary（アイテム名辞書）

`patterns.js` 内のグローバル定数。

```js
var ITEM_DICT = {
  fruits:     ["リンゴ", "ミカン", "カキ", "ナシ", "バナナ", "ブドウ", "メロン", "イチゴ"],
  stationery: ["ノート", "鉛筆", "消しゴム", "定規", "ペン"],
  food:       ["クッキー", "チョコレート", "キャンディ", "ケーキ", "プリン"],
  animals:    ["ネコ", "イヌ", "ウサギ", "ハムスター"],
  vehicles:   ["電車", "バス", "自転車", "自動車"]
};
```

---

### 6. PersonDictionary（人物名辞書）

```js
var PERSON_DICT = {
  single:  ["太郎", "花子", "次郎", "三郎", "サトシ", "ユイ"],
  roles:   { elder: "兄", younger: "弟", sister: "姉", father: "お父さん", child: "子供" }
};
```

---

### 7. AppState（アプリ状態）

`app.js` / `game.js` で管理するグローバル状態オブジェクト。

| フィールド | 型 | 説明 |
|-----------|---|------|
| `currentLevel` | number \| null | 選択中のレベル（1〜4） |
| `currentProblem` | ProblemOutput \| null | 現在表示中の問題 |
| `phase` | string | `'idle'` / `'speaking'` / `'answering'` / `'result'` |
| `isSpeaking` | boolean | 読み上げ中フラグ |
| `isAwaitingAnswer` | boolean | 回答受付中フラグ |
| `history` | HistoryEntry[] | 問題ごとの正誤履歴（今セッション分） |

---

### 8. HistoryEntry（解答履歴）

| フィールド | 型 | 説明 |
|-----------|---|------|
| `question` | string | 問題文 |
| `correctAnswer` | number | 正解値 |
| `userAnswer` | string | ユーザー入力値（空文字 = タイムアウト） |
| `isCorrect` | boolean | 正誤 |
| `level` | number | レベル |

---

## 状態遷移図

```
idle
  ↓ レベル選択
speaking   ← 「開始」ボタン押下 → 問題生成 → 読み上げ開始
  ↓ 読み上げ完了（onComplete）
answering  ← カウントダウン開始・回答フォーム有効化
  ↓ 回答送信 or タイムアウト
result     ← 正誤判定・履歴追記
  ↓ 「次の問題」または「TOPへ戻る」
idle / speaking（次問）
```

---

## 問題パターン一覧（ID 定義）

| ID | レベル | サブカテゴリ | 計算式概要 |
|----|-------|------------|-----------|
| L1-ADD | 1 | addition | A + B |
| L1-SUB | 1 | subtraction | A - B |
| L1-MUL | 1 | multiplication | A × B |
| L1-DIV | 1 | division | A ÷ B |
| L1-CHANGE | 1 | change | B - A（お釣り） |
| L1-TIME | 1 | time | B + C 分後 |
| L1-LINE | 1 | line_order | B + C + 1（列の順番） |
| L2-MULTI | 2 | multi_total | C - (A×X + B×Y) |
| L2-AVG | 2 | average | (A+B+C) ÷ 3 |
| L2-DOZEN | 2 | dozen | A×12 - B |
| L2-FRAC | 2 | fraction | A - A÷B |
| L2-SHORT | 2 | shortage | B×C - A |
| L2-AGE | 2 | age | (A - B×C) ÷ (C-1) |
| L3-DISC | 3 | discount | A × (1 - B/10) |
| L3-SPEED | 3 | speed | A × (B/60) |
| L3-CHASE | 3 | chase | (X×T) ÷ (Y-X) |
| L3-RATIO | 3 | ratio | A × X÷(X+Y) |
| L3-PLANT | 3 | plant | A÷B + 1 |
| L3-SET | 3 | set | (B+C) - (A-D) |
| L4-MEET | 4 | meeting | 逆算（複合） |
| L4-NESTED | 4 | nested_ratio | C ÷ (1-1/B) ÷ (1-1/A) |
| L4-CRANE | 4 | crane_turtle | (B - 50×A) ÷ 50 |
| L4-CONC | 4 | concentration | (A×B) ÷ (B+C) |
