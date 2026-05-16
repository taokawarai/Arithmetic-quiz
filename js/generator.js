/**
 * 問題生成エンジン
 */

var MAX_RETRIES = 100;

/**
 * 問題を生成する
 * @param {number|null} level - レベル (1-4)、null でランダム
 * @returns {object} ProblemOutput | ErrorObject
 */
function generate_problem(level) {
  var targetLevel = level || randInt(1, 4);

  var patterns = ALL_PATTERNS.filter(function(p) { return p.level === targetLevel; });
  if (patterns.length === 0) {
    return { error: 'INVALID_LEVEL', message: 'レベル ' + targetLevel + ' のパターンが見つかりません' };
  }

  var pattern = randItem(patterns);
  var situation = randItem(pattern.situations);

  var vars = null;
  var answer = null;

  for (var attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      vars = pattern.generate(situation);
      answer = pattern.formula(vars);
      if (typeof answer === 'number' && isFinite(answer) && !isNaN(answer)) {
        var isInt = (Math.floor(answer) === answer);
        if (isInt) { break; }
        if (pattern.allowDecimal && Math.round(answer * 10) === answer * 10) { break; }
      }
    } catch (e) {
      // リトライ
    }
    vars = null;
    answer = null;
  }

  if (vars === null || answer === null) {
    return { error: 'MAX_RETRIES_EXCEEDED', message: 'パターン ' + pattern.id + ' で有効な問題を生成できませんでした' };
  }

  var question = fillTemplate(situation.template, vars);
  var questionForSpeech = normalizeNumbersForSpeech(question);

  return {
    id: pattern.id,
    level: pattern.level,
    sub_category: pattern.sub_category,
    time_limit: pattern.time_limit,
    question: question,
    questionForSpeech: questionForSpeech,
    answer: answer,
    unit: situation.unit,
    vars: vars,
  };
}

/**
 * テンプレート文字列に変数を埋め込む
 * {KEY} → vars[KEY]
 */
function fillTemplate(template, vars) {
  return template.replace(/\{(\w+)\}/g, function(_, key) {
    return vars[key] !== undefined ? vars[key] : '{' + key + '}';
  });
}
