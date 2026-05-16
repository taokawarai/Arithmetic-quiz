/**
 * 問題パターン定義（全23パターン）
 */

/* ===== ヘルパー関数 ===== */
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function pickTwo(arr) {
  var i = Math.floor(Math.random() * arr.length);
  var j;
  do { j = Math.floor(Math.random() * arr.length); } while (j === i);
  return [arr[i], arr[j]];
}
function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }

/* ===== 辞書 ===== */
var ITEM_DICT = {
  fruits:     ['リンゴ', 'ミカン', 'カキ', 'ナシ', 'モモ', 'スイカ'],
  snacks:     ['バナナ', 'ブドウ', 'メロン', 'イチゴ', 'サクランボ', 'キウイ'],
  stationery: ['ノート', '消しゴム', '色鉛筆', 'クレヨン', 'マーカー'],
  pens:       ['ボールペン', 'シャープペン', '蛍光ペン', '万年筆'],
  clothing:   ['シャツ', 'セーター', 'ジャケット', 'スカート', 'コート'],
  candy:      ['あめ', 'チョコ', 'グミ', 'クッキー', 'せんべい'],
  cards:      ['カード', 'シール', 'スタンプ', 'メダル'],
  books:      ['本', '漫画', '図鑑', '絵本', '雑誌'],
};
var PERSON_DICT = {
  children:  ['A', 'B', 'C', 'D', 'E'],
  siblings:  [['兄', '弟'], ['姉', '妹'], ['兄', '妹'], ['姉', '弟']],
  family:    ['お父さん', 'お母さん', 'おじいさん', 'おばあさん'],
  names:     ['たろう', 'はなこ', 'けんた', 'さくら', 'ゆうき'],
};

/* ===== 旅人算ルックアップテーブル ===== */
var CHASE_TABLE = [
  {X: 60,  Y: 180, T: 10, answer: 5},
  {X: 60,  Y: 180, T: 6,  answer: 3},
  {X: 60,  Y: 240, T: 12, answer: 4},
  {X: 60,  Y: 240, T: 15, answer: 5},
  {X: 80,  Y: 200, T: 6,  answer: 4},
  {X: 80,  Y: 200, T: 9,  answer: 6},
  {X: 70,  Y: 210, T: 10, answer: 5},
  {X: 70,  Y: 280, T: 12, answer: 4},
];

/* ===== 入れ子割合テーブル ===== */
var NESTED_TABLE = [
  {A: 3, B: 2, C: 400, answer: 1200},
  {A: 3, B: 2, C: 600, answer: 1800},
  {A: 4, B: 2, C: 300, answer: 800},
  {A: 4, B: 2, C: 600, answer: 1600},
  {A: 4, B: 3, C: 400, answer: 800},
  {A: 4, B: 3, C: 600, answer: 1200},
];
var NESTED_TABLE_PEOPLE = [
  {A: 3, B: 2, C: 6,  answer: 18},
  {A: 3, B: 2, C: 8,  answer: 24},
  {A: 4, B: 2, C: 6,  answer: 16},
  {A: 4, B: 2, C: 9,  answer: 24},
  {A: 4, B: 3, C: 6,  answer: 12},
  {A: 4, B: 3, C: 8,  answer: 16},
];

/* ===== 濃度算テーブル ===== */
var CONC_TABLE = [
  {A: 10, B: 300, C: 200, answer: 6},
  {A: 20, B: 200, C: 200, answer: 10},
  {A: 15, B: 200, C: 100, answer: 10},
  {A: 5,  B: 200, C: 50,  answer: 4},
  {A: 8,  B: 300, C: 300, answer: 4},
  {A: 12, B: 200, C: 100, answer: 8},
  {A: 10, B: 200, C: 300, answer: 4},
  {A: 15, B: 300, C: 200, answer: 9},
  {A: 20, B: 300, C: 200, answer: 12},
];

/* ===== ALL_PATTERNS ===== */
var ALL_PATTERNS = [

  /* ---- LEVEL 1 ---- */

  // L1-ADD: 加算
  {
    id: 'L1-ADD',
    level: 1,
    sub_category: '加算',
    time_limit: 30,
    situations: [
      {
        template: '{item_a}が{A}個、{item_b}が{B}個あります。合わせて何個ですか？',
        unit: '個'
      },
      {
        template: '公園に子供が{A}人います。あとから{B}人来ました。全部で何人になりましたか？',
        unit: '人'
      },
      {
        template: 'バスに{A}人乗っています。次のバス停で{B}人乗ってきました。今何人いますか？',
        unit: '人'
      }
    ],
    generate: function(situation) {
      var A = randInt(2, 9);
      var B;
      do { B = randInt(2, 9); } while (B === A);
      var items = pickTwo(ITEM_DICT.fruits.concat(ITEM_DICT.snacks));
      return {A: A, B: B, item_a: items[0], item_b: items[1]};
    },
    formula: function(vars) { return vars.A + vars.B; }
  },

  // L1-SUB: 減算
  {
    id: 'L1-SUB',
    level: 1,
    sub_category: '減算',
    time_limit: 30,
    situations: [
      {
        template: '{item_a}が{A}個あります。そのうち{B}個を人にあげました。残りは何個ですか？',
        unit: '個'
      },
      {
        template: '駐車場に車が{A}台あります。{B}台出ていきました。残りは何台ですか？',
        unit: '台'
      },
      {
        template: '電車に{A}人乗っています。駅で{B}人降りました。残りは何人ですか？',
        unit: '人'
      }
    ],
    generate: function(situation) {
      var A = randInt(6, 15);
      var B = randInt(2, A - 1);
      var item_a = randItem(ITEM_DICT.fruits.concat(ITEM_DICT.snacks));
      return {A: A, B: B, item_a: item_a};
    },
    formula: function(vars) { return vars.A - vars.B; }
  },

  // L1-MUL: 乗算
  {
    id: 'L1-MUL',
    level: 1,
    sub_category: '乗算',
    time_limit: 30,
    situations: [
      {
        template: '1袋に{item_a}が{A}個入っています。この袋が{B}つあると、{item_a}は全部で何個ですか？',
        unit: '個'
      },
      {
        template: '1箱に{item_b}が{A}個入っています。{B}箱買うと全部で何個になりますか？',
        unit: '個'
      },
      {
        template: '1皿に{item_a}が{A}個のっています。{B}皿分では何個になりますか？',
        unit: '個'
      }
    ],
    generate: function(situation) {
      var A = randInt(3, 9);
      var B = randInt(3, 5);
      var items = pickTwo(ITEM_DICT.fruits.concat(ITEM_DICT.candy));
      return {A: A, B: B, item_a: items[0], item_b: items[1]};
    },
    formula: function(vars) { return vars.A * vars.B; }
  },

  // L1-DIV: 除算
  {
    id: 'L1-DIV',
    level: 1,
    sub_category: '除算',
    time_limit: 30,
    situations: [
      {
        template: '{A}個の{item_a}を、{B}人で等しく分けると、1人何個になりますか？',
        unit: '個'
      },
      {
        template: '{A}枚の{cards_item}を{B}人に同じ枚数ずつ配ると、1人何枚になりますか？',
        unit: '枚'
      },
      {
        template: '{A}本の花を、{B}本ずつ花瓶に差すと、何瓶分になりますか？',
        unit: '瓶'
      }
    ],
    generate: function(situation) {
      var B = randInt(2, 5);
      var quotient = randInt(3, 9);
      var A = B * quotient;
      var item_a = randItem(ITEM_DICT.fruits);
      var cards_item = randItem(ITEM_DICT.cards);
      return {A: A, B: B, item_a: item_a, cards_item: cards_item};
    },
    formula: function(vars) { return vars.A / vars.B; }
  },

  // L1-CHANGE: お釣り計算
  {
    id: 'L1-CHANGE',
    level: 1,
    sub_category: 'お釣り計算',
    time_limit: 30,
    situations: [
      {
        template: '{A}円の{stationery_item}を買い、{B}円出しました。お釣りはいくらですか？',
        unit: '円'
      },
      {
        template: '{A}円の{candy_item}を買い、{B}円払いました。お釣りはいくらですか？',
        unit: '円'
      },
      {
        template: '{A}円の{item_b}を買って{B}円出しました。おつりは何円ですか？',
        unit: '円'
      }
    ],
    generate: function(situation) {
      var coins = [100, 200, 500, 1000];
      var B = randItem(coins);
      var A;
      var tries = 0;
      do {
        A = B - randInt(2, 9) * 10;
        tries++;
      } while ((A <= 0 || B - A < 20) && tries < 50);
      if (A <= 0 || B - A < 20) { A = B - 20; }
      var stationery_item = randItem(ITEM_DICT.stationery);
      var candy_item = randItem(ITEM_DICT.candy);
      var item_b = randItem(ITEM_DICT.snacks);
      return {A: A, B: B, stationery_item: stationery_item, candy_item: candy_item, item_b: item_b};
    },
    formula: function(vars) { return vars.B - vars.A; }
  },

  // L1-TIME: 時間の順算
  {
    id: 'L1-TIME',
    level: 1,
    sub_category: '時間計算',
    time_limit: 30,
    situations: [
      {
        template: '今、時計は{A}時{B}分を指しています。あと{C}分経つと、何分になりますか？',
        unit: '分'
      }
    ],
    generate: function(situation) {
      var A = randInt(8, 17);
      var Blist = [0, 5, 10, 15, 20, 25, 30];
      var Clist = [5, 10, 15, 20];
      var B, C;
      var tries = 0;
      do {
        B = randItem(Blist);
        C = randItem(Clist);
        tries++;
      } while (B + C >= 60 && tries < 100);
      if (B + C >= 60) { B = 10; C = 10; }
      return {A: A, B: B, C: C};
    },
    formula: function(vars) { return vars.B + vars.C; }
  },

  // L1-LINE: 列の順番
  {
    id: 'L1-LINE',
    level: 1,
    sub_category: '列の順番',
    time_limit: 30,
    situations: [
      {
        template: '{name_a}さんの前に{B}人、後ろに{C}人います。子供たちは全部で何人いますか？',
        unit: '人'
      },
      {
        template: '本棚に本が一列に並んでいます。ある本の左に{B}冊、右に{C}冊あります。本は全部で何冊ですか？',
        unit: '冊'
      }
    ],
    generate: function(situation) {
      var B = randInt(2, 9);
      var C;
      do { C = randInt(2, 9); } while (C === B);
      var name_a = randItem(PERSON_DICT.names);
      return {B: B, C: C, name_a: name_a};
    },
    formula: function(vars) { return vars.B + vars.C + 1; }
  },

  /* ---- LEVEL 2 ---- */

  // L2-TOTAL: 複数アイテム合計とお釣り
  {
    id: 'L2-TOTAL',
    level: 2,
    sub_category: '複数購入とお釣り',
    time_limit: 30,
    situations: [
      {
        template: '1冊{A}円の{stationery_item}を{X}冊と、1本{B}円の{pen_item}を{Y}本買い、{C}円払いました。お釣りはいくらですか？',
        unit: '円'
      },
      {
        template: '1個{A}円の{candy_item}を{X}個と、1本{B}円の飲み物を{Y}本買って、{C}円払いました。お釣りはいくらですか？',
        unit: '円'
      },
      {
        template: '{item_a}が1個{A}円、{item_b}が1個{B}円です。それぞれ{X}個と{Y}個買って{C}円出しました。お釣りはいくらですか？',
        unit: '円'
      }
    ],
    generate: function(situation) {
      var Avals = [100, 120, 150, 200];
      var Bvals = [80, 100, 120, 150];
      var A = randItem(Avals);
      var B = randItem(Bvals);
      var X = randInt(2, 4);
      var Y = randInt(2, 4);
      var total = A * X + B * Y;
      var Cvals = [500, 1000, 2000];
      var validC = [];
      for (var i = 0; i < Cvals.length; i++) {
        if (Cvals[i] > total) validC.push(Cvals[i]);
      }
      if (validC.length === 0) validC = [2000];
      var C = randItem(validC);
      var stationery_item = randItem(ITEM_DICT.stationery);
      var pen_item = randItem(ITEM_DICT.pens);
      var candy_item = randItem(ITEM_DICT.candy);
      var items = pickTwo(ITEM_DICT.fruits.concat(ITEM_DICT.snacks));
      return {
        A: A, B: B, X: X, Y: Y, C: C,
        stationery_item: stationery_item,
        pen_item: pen_item,
        candy_item: candy_item,
        item_a: items[0],
        item_b: items[1]
      };
    },
    formula: function(vars) { return vars.C - (vars.A * vars.X + vars.B * vars.Y); }
  },

  // L2-AVG: 平均値
  {
    id: 'L2-AVG',
    level: 2,
    sub_category: '平均値',
    time_limit: 30,
    situations: [
      {
        template: '3回のテストの点数が{A}点、{B}点、{C}点でした。平均点は何点ですか？',
        unit: '点'
      },
      {
        template: '3日間の気温が{A}度、{B}度、{C}度でした。平均気温は何度ですか？',
        unit: '度'
      },
      {
        template: '{name_a}さんは3回マラソンを走りました。タイムが{A}分、{B}分、{C}分でした。平均タイムは何分ですか？',
        unit: '分'
      }
    ],
    generate: function(situation) {
      var min, max;
      var idx = situation ? situation.template.indexOf('気温') : -1;
      if (idx >= 0) {
        min = 10; max = 35;
      } else if (situation && situation.template.indexOf('マラソン') >= 0) {
        min = 20; max = 50;
      } else {
        min = 50; max = 95;
      }
      var tries = 0;
      var A, B, C, target;
      do {
        target = randInt(min + 5, max - 5);
        A = target + randInt(-8, 8);
        B = target + randInt(-8, 8);
        C = 3 * target - A - B;
        tries++;
      } while ((C < min || C > max || (A + B + C) % 3 !== 0) && tries < 200);
      if (tries >= 200) { A = target; B = target; C = target; }
      var name_a = randItem(PERSON_DICT.names);
      return {A: A, B: B, C: C, name_a: name_a};
    },
    formula: function(vars) { return (vars.A + vars.B + vars.C) / 3; }
  },

  // L2-DOZEN: ダース換算
  {
    id: 'L2-DOZEN',
    level: 2,
    sub_category: 'ダース換算',
    time_limit: 30,
    situations: [
      {
        template: '{A}ダースある鉛筆のうち、{B}本使いました。残りは何本ですか？',
        unit: '本'
      },
      {
        template: '{A}ダースの卵のうち、{B}個割れてしまいました。残りは何個ですか？',
        unit: '個'
      }
    ],
    generate: function(situation) {
      var A = randInt(1, 3);
      var B = randInt(2, A * 12 - 3);
      return {A: A, B: B};
    },
    formula: function(vars) { return vars.A * 12 - vars.B; }
  },

  // L2-FRAC: 分数・割合
  {
    id: 'L2-FRAC',
    level: 2,
    sub_category: '分数・割合',
    time_limit: 30,
    situations: [
      {
        template: '{A}個の{item_a}のうち、全体の{B}分の1を食べました。残りは何個ですか？',
        unit: '個'
      },
      {
        template: '{A}枚の{cards_item}のうち、{B}分の1を友達にあげました。残りは何枚ですか？',
        unit: '枚'
      },
      {
        template: 'クラスの生徒{A}人のうち、{B}分の1が女子です。男子は何人ですか？',
        unit: '人'
      }
    ],
    generate: function(situation) {
      var B = randItem([3, 4, 5]);
      var multiplier = randInt(3, 8);
      var A = B * multiplier;
      var item_a = randItem(ITEM_DICT.fruits);
      var cards_item = randItem(ITEM_DICT.cards);
      return {A: A, B: B, item_a: item_a, cards_item: cards_item};
    },
    formula: function(vars) { return vars.A - vars.A / vars.B; }
  },

  // L2-DIFF: 差集め算・過不足
  {
    id: 'L2-DIFF',
    level: 2,
    sub_category: '過不足算',
    time_limit: 30,
    situations: [
      {
        template: '{A}枚の{cards_item}を{B}人の子供に{C}枚ずつ配ろうとしたところ足りません。あと何枚あれば全員に配れますか？',
        unit: '枚'
      },
      {
        template: '{A}個の{item_a}を{B}人に{C}個ずつ配りたいのですが足りません。あと何個必要ですか？',
        unit: '個'
      }
    ],
    generate: function(situation) {
      var B = randInt(3, 6);
      var C = randInt(3, 8);
      var needed = B * C;
      var shortage = randInt(1, B - 1);
      var A = needed - shortage;
      var cards_item = randItem(ITEM_DICT.cards);
      var item_a = randItem(ITEM_DICT.fruits.concat(ITEM_DICT.candy));
      return {A: A, B: B, C: C, cards_item: cards_item, item_a: item_a};
    },
    formula: function(vars) { return vars.B * vars.C - vars.A; }
  },

  // L2-AGE: 年齢算（逆算）
  {
    id: 'L2-AGE',
    level: 2,
    sub_category: '年齢算',
    time_limit: 30,
    situations: [
      {
        template: '現在{name_a}さんは{A}歳、子供は{B}歳です。{name_a}さんの年齢が子供の年齢のちょうど{C}倍になるのは今から何年後ですか？',
        unit: '年後'
      },
      {
        template: 'お父さんは{A}歳、{name_b}さんは{B}歳です。お父さんの年齢が{name_b}さんの{C}倍になるのは何年後ですか？',
        unit: '年後'
      }
    ],
    generate: function(situation) {
      var tries = 0;
      var A, B, C, X;
      do {
        X = randInt(2, 8);
        C = randItem([2, 3, 4]);
        B = randInt(5, 15);
        // After X years: A+X = C*(B+X) → A = C*(B+X) - X
        A = C * (B + X) - X;
        tries++;
      } while ((A < 20 || A > 60) && tries < 200);
      if (tries >= 200) { X = 5; C = 3; B = 10; A = C * (B + X) - X; }
      var names = pickTwo(PERSON_DICT.names);
      return {A: A, B: B, C: C, name_a: names[0], name_b: names[1]};
    },
    formula: function(vars) { return (vars.A - vars.B * vars.C) / (vars.C - 1); }
  },

  /* ---- LEVEL 3 ---- */

  // L3-DISCOUNT: 割引
  {
    id: 'L3-DISCOUNT',
    level: 3,
    sub_category: '割引計算',
    time_limit: 60,
    situations: [
      {
        template: '定価{A}円の{clothing_item}が{B}割引で売られています。この値段はいくらですか？',
        unit: '円'
      },
      {
        template: '{A}円の商品が{B}割引きセール中です。いくらになりますか？',
        unit: '円'
      },
      {
        template: '定価{A}円の{book_item}が{B}割引になっています。割引後の値段は何円ですか？',
        unit: '円'
      }
    ],
    generate: function(situation) {
      var Avals = [1000, 2000, 3000, 4000, 5000, 6000, 8000, 10000];
      var A = randItem(Avals);
      var B = randInt(1, 4);
      var clothing_item = randItem(ITEM_DICT.clothing);
      var book_item = randItem(ITEM_DICT.books);
      return {A: A, B: B, clothing_item: clothing_item, book_item: book_item};
    },
    formula: function(vars) { return vars.A * (10 - vars.B) / 10; }
  },

  // L3-SPEED: 速さ・時間・距離
  {
    id: 'L3-SPEED',
    level: 3,
    sub_category: '速さ・距離・時間',
    time_limit: 60,
    situations: [
      {
        template: '時速{A}キロの自転車で{B}分走ると、何キロ進みますか？',
        unit: 'キロ'
      },
      {
        template: '分速{A}メートルの速さで{B}分歩くと、何メートル進みますか？',
        unit: 'メートル'
      }
    ],
    generate: function(situation) {
      if (situation && situation.unit === 'キロ') {
        var Bvals = [15, 20, 30, 60];
        var B = randItem(Bvals);
        var multiplierMap = {'15': 4, '20': 3, '30': 2, '60': 1};
        var mult = multiplierMap[String(B)];
        var A = randInt(1, 5) * mult;
        return {A: A, B: B, answer: A * B / 60};
      } else {
        var A2 = randItem([60, 80, 100, 120]);
        var B2 = randInt(3, 12);
        return {A: A2, B: B2, answer: A2 * B2};
      }
    },
    formula: function(vars) { return vars.answer; }
  },

  // L3-CHASE: 旅人算・追いつき
  {
    id: 'L3-CHASE',
    level: 3,
    sub_category: '旅人算',
    time_limit: 60,
    situations: [
      {
        template: '{name_a}さんは分速{X}メートルで歩いて出発しました。その{T}分後に、{name_b}さんが分速{Y}メートルで自転車で追いかけました。{name_b}さんは何分後に追いつきますか？',
        unit: '分後'
      },
      {
        template: '{name_a}さんが分速{X}メートルで先に出発しました。{T}分後に{name_b}さんが分速{Y}メートルで追いかけます。{name_b}さんが追いつくのは、{name_b}さんが出発してから何分後ですか？',
        unit: '分後'
      }
    ],
    generate: function(situation) {
      var entry = randItem(CHASE_TABLE);
      var names = pickTwo(PERSON_DICT.names);
      return {
        X: entry.X,
        Y: entry.Y,
        T: entry.T,
        answer: entry.answer,
        name_a: names[0],
        name_b: names[1]
      };
    },
    formula: function(vars) { return vars.answer; }
  },

  // L3-PLANT: 植木算
  {
    id: 'L3-PLANT',
    level: 3,
    sub_category: '植木算',
    time_limit: 60,
    situations: [
      {
        template: '長さ{A}メートルの道路の片側に、端から端まで{B}メートルおきに木を植えます。木は全部で何本必要ですか？',
        unit: '本'
      },
      {
        template: '{A}メートルのまっすぐな道に、両端から{B}メートルおきに電柱を立てます。電柱は全部で何本必要ですか？',
        unit: '本'
      }
    ],
    generate: function(situation) {
      var Bvals = [5, 10, 20, 25];
      var B = randItem(Bvals);
      var A = B * randInt(4, 12);
      return {A: A, B: B};
    },
    formula: function(vars) { return vars.A / vars.B + 1; }
  },

  // L3-VENN: 集合算
  {
    id: 'L3-VENN',
    level: 3,
    sub_category: '集合算',
    time_limit: 60,
    situations: [
      {
        template: 'クラスの生徒{A}人のうち、犬を飼っている人は{B}人、猫を飼っている人は{C}人です。どちらも飼っていない人が{D}人いるとき、両方飼っている人は何人ですか？',
        unit: '人'
      },
      {
        template: '生徒{A}人のうち、算数が好きな人は{B}人、国語が好きな人は{C}人です。どちらも好きでない人が{D}人のとき、両方好きな人は何人ですか？',
        unit: '人'
      }
    ],
    generate: function(situation) {
      var tries = 0;
      var A, B, C, D, both;
      do {
        both = randInt(2, 6);
        D = randInt(2, 8);
        B = randInt(10, 18);
        C = randInt(8, 15);
        A = B + C - both + D;
        tries++;
      } while ((A > 35 || A < 25 || both >= B || both >= C) && tries < 200);
      if (tries >= 200) { both = 3; D = 5; B = 12; C = 10; A = B + C - both + D; }
      return {A: A, B: B, C: C, D: D};
    },
    formula: function(vars) { return vars.B + vars.C - (vars.A - vars.D); }
  },

  // L3-RATIO: 比率と分配
  {
    id: 'L3-RATIO',
    level: 3,
    sub_category: '比と分配',
    time_limit: 60,
    situations: [
      {
        template: '{A}円のお小遣いを、兄と弟で{X}対{Y}の割合で分けます。兄の取り分はいくらですか？',
        unit: '円'
      },
      {
        template: '{A}個の{item_a}を、姉と妹で{X}対{Y}に分けます。姉の分は何個ですか？',
        unit: '個'
      },
      {
        template: '{A}グラムの砂糖を{X}対{Y}に分けます。多い方は何グラムですか？',
        unit: 'グラム'
      }
    ],
    generate: function(situation) {
      var tries = 0;
      var X, Y, A;
      do {
        X = randInt(1, 4);
        Y = randInt(1, 4);
        tries++;
      } while (gcd(X, Y) !== 1 && tries < 100);
      if (gcd(X, Y) !== 1) { X = 2; Y = 3; }
      // For グラム, use X as larger
      if (situation && situation.unit === 'グラム' && X < Y) {
        var tmp = X; X = Y; Y = tmp;
      }
      var k = randInt(3, 8) * 100;
      A = (X + Y) * k;
      var item_a = randItem(ITEM_DICT.fruits);
      return {A: A, X: X, Y: Y, item_a: item_a};
    },
    formula: function(vars) { return vars.A * vars.X / (vars.X + vars.Y); }
  },

  /* ---- LEVEL 4 ---- */

  // L4-MEET: 向かい合って出会う（逆算）
  {
    id: 'L4-MEET',
    level: 4,
    sub_category: '出会い算',
    time_limit: 60,
    situations: [
      {
        template: '{A}地点と{B}地点は{D}メートル離れています。{name_a}さんが分速{V1}メートルで{A}地点から、{name_b}さんが分速{V2}メートルで{B}地点から、同時に向かい合って歩き出しました。何分後に出会いますか？',
        unit: '分後'
      },
      {
        template: '2つの町は{D}メートル離れています。{name_a}さんは分速{V1}メートルで出発し、同時に{name_b}さんが分速{V2}メートルで反対側から向かいます。何分後に出会いますか？',
        unit: '分後'
      }
    ],
    generate: function(situation) {
      var V1vals = [60, 70, 80];
      var V2vals = [120, 140, 160, 180];
      var tries = 0;
      var answer, V1, V2, D;
      do {
        answer = randInt(3, 10);
        V1 = randItem(V1vals);
        V2 = randItem(V2vals);
        D = answer * (V1 + V2);
        tries++;
      } while ((D < 500 || D > 2000) && tries < 200);
      if (tries >= 200) { answer = 5; V1 = 60; V2 = 140; D = 5 * 200; }
      var names = pickTwo(PERSON_DICT.names);
      // Point labels
      var points = [['A', 'B'], ['P', 'Q'], ['甲', '乙']];
      var pt = randItem(points);
      return {
        A: pt[0], B: pt[1],
        D: D, V1: V1, V2: V2,
        name_a: names[0], name_b: names[1],
        answer: answer
      };
    },
    formula: function(vars) { return vars.answer; }
  },

  // L4-NESTED: 入れ子割合（逆算）
  {
    id: 'L4-NESTED',
    level: 4,
    sub_category: '入れ子割合',
    time_limit: 60,
    situations: [
      {
        template: '所持金のうち、まず全体の{A}分の1で本を買い、次にその残りの{B}分の1で電車に乗ったところ、手元に{C}円残りました。最初の所持金はいくらでしたか？',
        unit: '円'
      },
      {
        template: 'あるクラスの人数のうち、{A}分の1が欠席し、残りの{B}分の1が早退したところ、残りは{C}人になりました。クラスの人数は何人ですか？',
        unit: '人'
      }
    ],
    generate: function(situation) {
      if (situation && situation.unit === '人') {
        var entry = randItem(NESTED_TABLE_PEOPLE);
        return {A: entry.A, B: entry.B, C: entry.C, answer: entry.answer};
      } else {
        var entry2 = randItem(NESTED_TABLE);
        return {A: entry2.A, B: entry2.B, C: entry2.C, answer: entry2.answer};
      }
    },
    formula: function(vars) { return vars.answer; }
  },

  // L4-CRANE: つるかめ算
  {
    id: 'L4-CRANE',
    level: 4,
    sub_category: 'つるかめ算',
    time_limit: 60,
    situations: [
      {
        template: '手元に50円玉と100円玉が合わせて{A}枚あり、金額の合計は{B}円です。100円玉は何枚ありますか？',
        unit: '枚'
      },
      {
        template: '50円切手と80円切手が合わせて{A}枚あり、合計金額は{B}円です。80円切手は何枚ありますか？',
        unit: '枚'
      }
    ],
    generate: function(situation) {
      if (situation && situation.template.indexOf('80') >= 0) {
        var X = randInt(2, 8);
        var Y = randInt(2, 6);
        var A = X + Y;
        var B = 50 * X + 80 * Y;
        return {A: A, B: B, _Y: Y};
      } else {
        var X2 = randInt(3, 8);
        var Y2 = randInt(2, 6);
        var A2 = X2 + Y2;
        var B2 = 50 * X2 + 100 * Y2;
        return {A: A2, B: B2, _Y: Y2};
      }
    },
    formula: function(vars) { return vars._Y; }
  },

  // L4-CONC: 濃度算
  {
    id: 'L4-CONC',
    level: 4,
    sub_category: '濃度算',
    time_limit: 60,
    allowDecimal: true,
    situations: [
      {
        template: '{A}パーセントの食塩水が{B}グラムあります。これに水を{C}グラム加えると、何パーセントの食塩水になりますか？',
        unit: 'パーセント'
      },
      {
        template: '{A}パーセントの砂糖水{B}グラムに水を{C}グラム加えました。濃度は何パーセントになりますか？',
        unit: 'パーセント'
      }
    ],
    generate: function(situation) {
      var entry = randItem(CONC_TABLE);
      return {A: entry.A, B: entry.B, C: entry.C, answer: entry.answer};
    },
    formula: function(vars) { return vars.answer; }
  }

];
