# Public API Contract: 問題生成エンジン

**Module**: `js/generator.js`  
**Date**: 2026-05-17

---

## generate_problem(level_id, sub_category)

問題を 1 問生成して返す。

### シグネチャ

```js
generate_problem(level_id [, sub_category]) → ProblemOutput | ErrorObject
```

### 引数

| 引数 | 型 | 必須 | 説明 |
|-----|---|-----|------|
| `level_id` | string | ✅ | `"level1"` 〜 `"level4"` |
| `sub_category` | string | ❌ | 省略時はそのレベル全パターンから無作為選択 |

### 戻り値（成功）: ProblemOutput

```js
{
  question:          "3個のリンゴと5個のミカンがあります。合わせて何個ですか？",
  questionForSpeech: "3個 の リンゴ と 5個 の ミカン が あります。合わせて何個ですか？",
  answer:            8,
  unit:              "個",
  level:             1,
  time_limit:        30,
  sub_category:      "addition"
}
```

### 戻り値（失敗）: ErrorObject

```js
{
  error:   true,
  code:    "INVALID_LEVEL",   // "INVALID_LEVEL" | "INVALID_SUB_CATEGORY" | "MAX_RETRIES_EXCEEDED"
  message: "level_id 'level9' is not valid. Use 'level1'–'level4'."
}
```

### エラーコード一覧

| code | 原因 |
|------|------|
| `INVALID_LEVEL` | `level_id` が `"level1"〜"level4"` 以外 |
| `INVALID_SUB_CATEGORY` | 指定した `sub_category` がそのレベルに存在しない |
| `MAX_RETRIES_EXCEEDED` | バリデーション通過の変数組み合わせが上限回数内に見つからない |

### 制約・保証

- 成功時の `answer` は整数または小数点以下 1〜2 桁以内の正の数
- 例外（throw）は発生しない。エラーは必ず ErrorObject として返す
- 実行時間：平均 100ms 以内（再抽選が上限に達する場合を除く）

---

## speakText(text, onComplete)

問題文を日本語で読み上げる。

**Module**: `js/speech.js`

```js
speakText(text, onComplete)
```

| 引数 | 型 | 説明 |
|-----|---|------|
| `text` | string | 読み上げる文字列 |
| `onComplete` | function | 読み上げ完了時コールバック（引数なし） |

- `SpeechSettings.rate`・`SpeechSettings.joined` に従って動作
- Web Speech API 非対応時は `onComplete()` を即座に呼び出す（テスト開始は別途ブロック）

---

## CountdownTimer(duration, onTick, onExpire)

ドリフト補正付きカウントダウンタイマー。

**Module**: `js/timer.js`（digit-span より移植）

```js
var t = new CountdownTimer(30, onTick, onExpire);
t.start();
t.stop();
t.reset();
t.getRemaining(); // → number（残り秒、切り上げ）
```

| メソッド | 説明 |
|---------|------|
| `start()` | タイマー開始 |
| `stop()` | タイマー停止 |
| `reset()` | 停止してカウンターを `duration` にリセット |
| `getRemaining()` | 残り秒数（切り上げ整数）を返す |
