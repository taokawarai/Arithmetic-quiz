# Quickstart: WAIS-IV 算数テスト

**Date**: 2026-05-17

---

## 動作確認（開発環境）

### 前提

- モダンブラウザ（Chrome / Safari / Edge）
- Web Speech API が有効であること
- ビルドツール・サーバー不要

### ファイルを開く

```
C:\study\Arithmetic-quiz\index.html
```

ブラウザで直接ダブルクリック、または VS Code の Live Server 拡張で開く。

---

## ディレクトリ構成

```
Arithmetic-quiz/
├── index.html
├── css/
│   └── style.css
└── js/
    ├── patterns.js     # 問題パターン・辞書データ
    ├── generator.js    # 問題生成エンジン
    ├── speech.js       # 読み上げモジュール
    ├── timer.js        # カウントダウンタイマー
    ├── game.js         # クイズフロー
    └── app.js          # UI・イベント
```

---

## 操作フロー

1. **レベル選択**: TOP 画面でレベル 1〜4 のボタンをタップ
2. **読み上げ設定**: 速度スライダー（デフォルト ×1.0）・読み方（デフォルト「区切る」）を必要に応じて変更
3. **開始**: 「開始」ボタンを押すと問題文が日本語で読み上げられる
4. **回答**: 読み上げ完了後、カウントダウン（30 秒 or 60 秒）が始まる。数字を入力して「回答」または Enter キー
5. **結果確認**: 正誤と正解値が表示される。「次の問題」または「TOPへ戻る」

---

## ブラウザコンソールでの動作確認

問題生成エンジンの単体確認：

```js
// レベル1の問題を 10 回生成
for (var i = 0; i < 10; i++) {
  console.log(generate_problem("level1"));
}

// サブカテゴリ指定
console.log(generate_problem("level3", "speed"));

// エラーケース
console.log(generate_problem("level9"));  // → { error: true, code: "INVALID_LEVEL", ... }
```

読み上げ動作確認：

```js
speakText("3個のリンゴと5個のミカンがあります。合わせて何個ですか？", function() {
  console.log("読み上げ完了");
});
```

---

## Web Speech API が使えない場合

起動時に画面上部にエラーメッセージが表示されます。
Chrome または Edge に切り替えてください。

---

## digit-span プロジェクトとの関係

`js/timer.js` は `C:\study\digit-span\js\timer.js` の移植版です。  
`js/speech.js` は digit-span の同名ファイルをベースに文章読み上げ向けに適応しています。  
CSS も digit-span の `style.css` をベースに拡張しています。
