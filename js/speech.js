/**
 * Web Speech API ラッパー（算数問題文読み上げ用）
 */

/** 読み上げ速度・モード設定 */
var SpeechSettings = { rate: 1.0, joined: false };

function isSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * 数字と単位の間にスペースを挿入してTTSの発音を改善する
 */
function normalizeNumbersForSpeech(text) {
  var result = text;
  result = result.replace(/(\d+)%/g, '$1 パーセント');
  result = result.replace(/(\d+)(個|枚|本|冊|円|歳|分|秒|時間|メートル|キロ|グラム|ダース|割|倍|人|台|着|点|度|袋|箱|皿|瓶|冊)/g, '$1 $2');
  return result;
}

/**
 * 問題文を日本語で読み上げる
 * joined=false (区切る): 句読点で分割して各セグメントを間隔付きで読む
 * joined=true  (つなげる): 全文を1つの Utterance で読む
 * @param {string} text - 読み上げるテキスト
 * @param {function} onComplete - 完了コールバック
 */
function speakText(text, onComplete) {
  if (!isSupported()) {
    if (typeof onComplete === 'function') onComplete();
    return;
  }

  window.speechSynthesis.cancel();

  var rate = SpeechSettings.rate;
  var joined = SpeechSettings.joined;
  var normalizedText = normalizeNumbersForSpeech(text);

  function afterWarmup() {
    if (joined) {
      var u = new SpeechSynthesisUtterance(normalizedText);
      u.lang = 'ja-JP';
      u.rate = rate;
      u.onend = function() { if (typeof onComplete === 'function') onComplete(); };
      window.speechSynthesis.speak(u);
    } else {
      // 句読点の後で分割（互換性の高い方法）
      var rawSegments = normalizedText.split(/([、。？！])/);
      var merged = [];
      for (var i = 0; i < rawSegments.length; i++) {
        if (/^[、。？！]$/.test(rawSegments[i])) {
          if (merged.length > 0) merged[merged.length - 1] += rawSegments[i];
        } else if (rawSegments[i] !== '') {
          merged.push(rawSegments[i]);
        }
      }
      if (merged.length === 0) merged = [normalizedText];

      var interval = Math.max(80, Math.round(500 / rate));
      var idx = 0;
      (function speakOne() {
        if (idx >= merged.length) {
          if (typeof onComplete === 'function') onComplete();
          return;
        }
        var seg = merged[idx].trim();
        if (!seg) { idx++; speakOne(); return; }
        var u = new SpeechSynthesisUtterance(seg);
        u.lang = 'ja-JP';
        u.rate = rate;
        u.onend = function() {
          idx++;
          if (idx < merged.length) { setTimeout(speakOne, interval); }
          else { if (typeof onComplete === 'function') onComplete(); }
        };
        window.speechSynthesis.speak(u);
      })();
    }
  }

  // 無音ウォームアップ: cancel()直後の最初発話クリッピング防止
  var warmup = new SpeechSynthesisUtterance('\u00A0');
  warmup.lang = 'ja-JP';
  warmup.volume = 0;
  warmup.rate = rate;
  warmup.onend = afterWarmup;
  window.speechSynthesis.speak(warmup);
}
