/* ===== AppState ===== */
var AppState = {
  phase: 'idle',
  level: null,
  isSpeaking: false,
  isAwaitingAnswer: false,
  currentProblem: null,
  history: [],
  score: 0,
  total: 0,
};

var _timer = null;

/* ===== 画面制御 ===== */
function hideAllScreens() {
  var screens = document.querySelectorAll('.screen');
  for (var i = 0; i < screens.length; i++) {
    screens[i].classList.remove('active');
  }
}

function showScreen(id) {
  hideAllScreens();
  var el = document.getElementById(id);
  if (el) el.classList.add('active');
}

/* ===== クイズフロー ===== */
function startLevel(level) {
  AppState.level = level;
  AppState.phase = 'idle';
  AppState.history = [];
  AppState.score = 0;
  AppState.total = 0;
  AppState.currentProblem = null;

  document.getElementById('question-level-label').textContent = 'レベル ' + level;
  document.getElementById('history-display').innerHTML = '';
  document.getElementById('status-text').textContent = '「問題を読む」ボタンを押してください。';
  document.getElementById('countdown-display').hidden = true;
  document.getElementById('answer-form').hidden = true;
  document.getElementById('btn-next-question').disabled = false;
  document.getElementById('question-text').textContent = '';
  document.getElementById('question-sub-category').textContent = '';
  document.getElementById('score-display').textContent = '0 / 0';

  showScreen('screen-question');
}

function loadNextQuestion() {
  if (AppState.isSpeaking) return;

  var problem = generate_problem(AppState.level);
  if (problem.error) {
    document.getElementById('status-text').textContent = 'エラー: ' + problem.message;
    return;
  }

  AppState.currentProblem = problem;
  AppState.phase = 'speaking';
  AppState.isSpeaking = true;
  AppState.isAwaitingAnswer = false;

  var answerInput = document.getElementById('answer-input');
  answerInput.value = '';
  answerInput.disabled = true;
  document.getElementById('btn-answer-submit').disabled = true;
  document.getElementById('answer-form').hidden = true;
  document.getElementById('countdown-display').hidden = true;
  document.getElementById('btn-next-question').disabled = true;

  document.getElementById('question-sub-category').textContent = problem.sub_category;
  document.getElementById('status-text').textContent = '読み上げ中…';
  document.getElementById('question-text').textContent = '';

  speakText(problem.questionForSpeech, function() {
    AppState.isSpeaking = false;
    startAnswerPhase();
  });
}

function startAnswerPhase() {
  AppState.phase = 'answering';
  AppState.isAwaitingAnswer = true;

  var timeLimit = AppState.currentProblem.time_limit;

  document.getElementById('status-text').textContent = '回答してください（' + timeLimit + '秒）';
  document.getElementById('countdown-display').hidden = false;
  document.getElementById('answer-form').hidden = false;

  var answerInput = document.getElementById('answer-input');
  answerInput.disabled = false;
  answerInput.value = '';
  answerInput.focus();
  document.getElementById('btn-answer-submit').disabled = false;

  var countdownValue = document.getElementById('countdown-value');
  countdownValue.textContent = timeLimit;
  countdownValue.classList.remove('warning');

  if (_timer) { _timer.stop(); }

  _timer = new CountdownTimer(timeLimit, function(rem) {
    countdownValue.textContent = rem;
    if (rem <= 10) {
      countdownValue.classList.add('warning');
    } else {
      countdownValue.classList.remove('warning');
    }
  }, function() {
    handleAnswerSubmit('');
  });
  _timer.start();
}

function handleAnswerSubmit(inputStr) {
  if (!AppState.isAwaitingAnswer) return;
  AppState.isAwaitingAnswer = false;
  AppState.phase = 'idle';

  if (_timer) { _timer.stop(); _timer = null; }

  document.getElementById('answer-form').hidden = true;
  document.getElementById('countdown-display').hidden = true;
  document.getElementById('btn-next-question').disabled = false;

  var problem = AppState.currentProblem;
  var cleaned = inputStr.replace(/[^0-9.\-]/g, '');
  var userAnswer = parseFloat(cleaned);
  var isTimeout = (inputStr === '');
  var isCorrect = (!isTimeout && !isNaN(userAnswer) && userAnswer === problem.answer);

  AppState.total += 1;
  if (isCorrect) AppState.score += 1;

  appendHistoryEntry({
    isCorrect: isCorrect,
    isTimeout: isTimeout,
    question: problem.question,
    answer: problem.answer,
    unit: problem.unit,
    userInput: inputStr,
    level: problem.level,
    sub_category: problem.sub_category,
  });

  var statusEl = document.getElementById('status-text');
  if (isTimeout) {
    statusEl.textContent = '時間切れ。正解は ' + problem.answer + ' ' + problem.unit + ' でした。';
  } else if (isCorrect) {
    statusEl.textContent = '✓ 正解！ ' + problem.answer + ' ' + problem.unit;
  } else {
    statusEl.textContent = '✗ 不正解。正解は ' + problem.answer + ' ' + problem.unit + ' でした。';
  }

  document.getElementById('score-display').textContent = AppState.score + ' / ' + AppState.total;
  document.getElementById('question-text').textContent = problem.question;
}

/* ===== 履歴追加 ===== */
function appendHistoryEntry(entry) {
  AppState.history.unshift(entry);

  var container = document.getElementById('history-display');
  var div = document.createElement('div');
  div.className = 'history-entry ' + (entry.isCorrect ? 'correct' : 'wrong');

  var displayInput = entry.isTimeout ? '（時間切れ）' : (entry.userInput || '（未入力）');

  div.innerHTML =
    '<span class="mark">' + (entry.isCorrect ? '○' : '×') + '</span>' +
    '<span class="detail">' +
      '<div class="question-line">' + entry.sub_category + ': ' + entry.question + '</div>' +
      '<div class="answer-line">正解：' + entry.answer + ' ' + entry.unit + '　入力：' + displayInput + '</div>' +
    '</span>';

  container.insertBefore(div, container.firstChild);
}

/* ===== 結果表示 ===== */
function showResult() {
  document.getElementById('result-score').textContent = AppState.score + ' / ' + AppState.total;
  document.getElementById('result-level').textContent = 'レベル ' + AppState.level;
  var pct = AppState.total > 0 ? Math.round(AppState.score / AppState.total * 100) : 0;
  document.getElementById('result-pct').textContent = pct + '%';
  showScreen('screen-result');
}

/* ===== AppState リセット ===== */
function resetAppState() {
  if (_timer) { _timer.stop(); _timer = null; }
  if (window.speechSynthesis) { window.speechSynthesis.cancel(); }
  AppState.phase = 'idle';
  AppState.level = null;
  AppState.isSpeaking = false;
  AppState.isAwaitingAnswer = false;
  AppState.currentProblem = null;
  AppState.history = [];
  AppState.score = 0;
  AppState.total = 0;
}
