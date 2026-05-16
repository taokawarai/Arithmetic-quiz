/* ===== DOMContentLoaded ===== */
document.addEventListener('DOMContentLoaded', function() {

  // 音声合成非対応チェック
  if (!isSupported()) {
    document.getElementById('speech-error').hidden = false;
  }

  // 答え入力バリデーション（数字・小数点のみ）
  var answerInput = document.getElementById('answer-input');
  answerInput.addEventListener('input', function() {
    this.value = this.value.replace(/[^0-9.]/g, '');
  });

  // 読み上げ速度スライダー同期
  function updateSpeedSettings(value) {
    var v = parseFloat(value);
    SpeechSettings.rate = v;
    var sliders = document.querySelectorAll('.speech-rate-slider');
    for (var i = 0; i < sliders.length; i++) { sliders[i].value = value; }
    var labels = document.querySelectorAll('.speed-label-display');
    for (var j = 0; j < labels.length; j++) { labels[j].textContent = '×' + v.toFixed(1); }
  }

  var sliders = document.querySelectorAll('.speech-rate-slider');
  for (var i = 0; i < sliders.length; i++) {
    sliders[i].addEventListener('input', function() { updateSpeedSettings(this.value); });
  }

  // 読み上げモードトグル
  var modeBtns = document.querySelectorAll('.mode-btn');
  for (var m = 0; m < modeBtns.length; m++) {
    modeBtns[m].addEventListener('click', function() {
      var mode = this.getAttribute('data-mode');
      SpeechSettings.joined = (mode === 'joined');
      for (var k = 0; k < modeBtns.length; k++) {
        if (modeBtns[k].getAttribute('data-mode') === mode) {
          modeBtns[k].classList.add('active');
        } else {
          modeBtns[k].classList.remove('active');
        }
      }
    });
  }

  // レベル選択ボタン
  var levelBtns = document.querySelectorAll('.level-btn');
  for (var l = 0; l < levelBtns.length; l++) {
    levelBtns[l].addEventListener('click', function() {
      var level = parseInt(this.getAttribute('data-level'), 10);
      startLevel(level);
    });
  }

  // 問題を読むボタン
  document.getElementById('btn-next-question').addEventListener('click', function() {
    loadNextQuestion();
  });

  // 回答ボタン
  document.getElementById('btn-answer-submit').addEventListener('click', function() {
    if (!AppState.isAwaitingAnswer) return;
    handleAnswerSubmit(document.getElementById('answer-input').value);
  });

  // Enterキーで回答
  document.getElementById('answer-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && AppState.isAwaitingAnswer) {
      handleAnswerSubmit(this.value);
    }
  });

  // 結果を見るボタン
  document.getElementById('btn-show-result').addEventListener('click', function() {
    showResult();
  });

  // 問題画面TOPへ戻る
  document.getElementById('btn-back-top').addEventListener('click', function() {
    resetAppState();
    showScreen('screen-top');
  });

  // 結果画面：もう一度
  document.getElementById('btn-retry').addEventListener('click', function() {
    var level = AppState.level;
    resetAppState();
    startLevel(level);
  });

  // 結果画面：TOPへ戻る
  document.getElementById('btn-to-top').addEventListener('click', function() {
    resetAppState();
    showScreen('screen-top');
  });

});
