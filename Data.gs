function getGameData() {
  var spreadsheet = getBoundSpreadsheet_();
  var config = getConfigMap_(spreadsheet);
  var targetCorrect = toPositiveNumber_(config.target_correct, 32);
  var correctPerRound = toPositiveNumber_(config.correct_per_round, 8);
  var questions = getActiveQuestionBank_(spreadsheet);
  var validation = validateQuestionBank_(questions, correctPerRound);

  if (validation.errors.length > 0) {
    throw new Error('QuestionBank needs attention before students play: ' + validation.errors.join(' | '));
  }

  return {
    success: true,
    config: {
      gameTitle: config.game_title || APP_TITLE,
      targetCorrect: targetCorrect,
      correctPerRound: correctPerRound,
      allowReviewChart: parseBoolean_(config.allow_review_chart, true),
      allowReplay: parseBoolean_(config.allow_replay, true),
      questionBankVersion: String(config.question_bank_version || '1')
    },
    rounds: getRoundInfo_(),
    questions: questions,
    reviewChart: getReviewChartData_(),
    warnings: validation.warnings
  };
}

function saveBestScore(payload) {
  var spreadsheet = getBoundSpreadsheet_();
  var config = getConfigMap_(spreadsheet);
  var targetCorrect = toPositiveNumber_(config.target_correct, 32);
  var correctPerRound = toPositiveNumber_(config.correct_per_round, 8);
  var cleanedPayload = validateScorePayload_(payload, targetCorrect);
  var normalized = normalizeStudentName_(cleanedPayload.studentName);
  var lock = LockService.getScriptLock();

  lock.waitLock(30000);

  try {
    var sheet = getOrCreateSheet_(spreadsheet, BEST_SCORES_SHEET_NAME, BEST_SCORES_HEADERS);
    var rowInfo = findBestScoreRow_(sheet, normalized.key);
    var now = new Date();
    var newBestCorrect = cleanedPayload.bestCorrect;
    var previousBest = rowInfo.rowNumber ? toPositiveNumber_(rowInfo.rowValues.best_correct, 0) : 0;
    var shouldWrite = !rowInfo.rowNumber || newBestCorrect > previousBest;

    if (!shouldWrite) {
      return {
        success: true,
        saved: false,
        message: 'Existing best score is the same or higher.',
        previousBestCorrect: previousBest,
        bestCorrect: previousBest,
        gradePercent: calculateGrade_(previousBest, targetCorrect)
      };
    }

    var bestCorrect = Math.max(0, Math.min(targetCorrect, newBestCorrect));
    var gradePercent = calculateGrade_(bestCorrect, targetCorrect);
    var completed = bestCorrect >= targetCorrect;
    var completedAt = completed ? (rowInfo.rowValues.completed_at || cleanedPayload.completedAt || now) : '';
    var roundsCompleted = cleanedPayload.roundsCompleted;

    if (roundsCompleted === null) {
      roundsCompleted = calculateRoundsCompleted_(cleanedPayload.roundCorrect, correctPerRound);
    }

    var summary = {
      attemptId: cleanedPayload.attemptId,
      totalCorrect: bestCorrect,
      currentRound: cleanedPayload.currentRound,
      roundsCompleted: roundsCompleted,
      answeredCorrectCount: cleanedPayload.answeredCorrectCount,
      missedCount: cleanedPayload.missedCount,
      reason: cleanedPayload.reason || '',
      clientUpdatedAt: cleanedPayload.updatedAt || ''
    };

    var row = [
      normalized.key,
      normalized.displayName,
      bestCorrect,
      targetCorrect,
      gradePercent,
      gradePercent,
      completed,
      cleanedPayload.currentRound,
      roundsCompleted,
      now,
      completedAt,
      JSON.stringify(summary)
    ];

    if (rowInfo.rowNumber) {
      sheet.getRange(rowInfo.rowNumber, 1, 1, BEST_SCORES_HEADERS.length).setValues([row]);
    } else {
      sheet.appendRow(row);
    }

    return {
      success: true,
      saved: true,
      previousBestCorrect: previousBest,
      bestCorrect: bestCorrect,
      gradePercent: gradePercent,
      completed: completed
    };
  } finally {
    lock.releaseLock();
  }
}

function normalizeStudentName_(name) {
  var displayName = String(name || '').trim().replace(/\s+/g, ' ');

  if (!displayName) {
    throw new Error('Enter a name Mr. Patel will recognize.');
  }

  return {
    displayName: displayName,
    key: displayName.toLowerCase()
  };
}

function calculateGrade_(bestCorrect, targetCorrect) {
  var safeTarget = toPositiveNumber_(targetCorrect, 32);
  var safeCorrect = Math.max(0, Math.min(safeTarget, Number(bestCorrect) || 0));
  return Math.min(100, Math.round((safeCorrect / safeTarget) * 10000) / 100);
}

function getConfigMap_(spreadsheet) {
  var sheet = getOrCreateSheet_(spreadsheet, CONFIG_SHEET_NAME, CONFIG_HEADERS);
  var rows = getSheetObjects_(sheet);
  var config = {};

  rows.forEach(function(row) {
    if (row.key) {
      config[String(row.key).trim()] = row.value;
    }
  });

  return config;
}

function getActiveQuestionBank_(spreadsheet) {
  var sheet = getOrCreateSheet_(spreadsheet, QUESTION_BANK_SHEET_NAME, QUESTION_BANK_HEADERS);
  var rows = getSheetObjects_(sheet);
  var questions = [];

  rows.forEach(function(row) {
    if (!parseBoolean_(row.active, false)) {
      return;
    }

    var options = parseJsonArray_(row.options_json, row.card_id, 'options_json');
    var correct = parseJsonArray_(row.correct_json, row.card_id, 'correct_json');

    questions.push({
      card_id: String(row.card_id || '').trim(),
      round_id: Number(row.round_id),
      round_name: String(row.round_name || '').trim(),
      interaction_type: String(row.interaction_type || '').trim(),
      skill_type: String(row.skill_type || '').trim(),
      target_macromolecule: String(row.target_macromolecule || '').trim(),
      prompt: String(row.prompt || '').trim(),
      options: options,
      correct: correct,
      explanation: String(row.explanation || '').trim(),
      difficulty: String(row.difficulty || '').trim(),
      tags: String(row.tags || '').trim()
    });
  });

  return questions;
}

function validateQuestionBank_(questions, correctPerRound) {
  var errors = [];
  var warnings = [];
  var countsByRound = {};
  var nucleicRounds = {};
  var seenIds = {};

  questions.forEach(function(question) {
    if (!question.card_id) {
      errors.push('A card is missing card_id.');
    }

    if (seenIds[question.card_id]) {
      errors.push('Duplicate card_id: ' + question.card_id);
    }
    seenIds[question.card_id] = true;

    if ([1, 2, 3, 4].indexOf(question.round_id) === -1) {
      errors.push(question.card_id + ' has an invalid round_id.');
    }

    if (['single_choice', 'multi_select'].indexOf(question.interaction_type) === -1) {
      errors.push(question.card_id + ' has an invalid interaction_type.');
    }

    if (question.options.length < 2) {
      errors.push(question.card_id + ' needs at least two options.');
    }

    if (question.correct.length < 1) {
      errors.push(question.card_id + ' needs at least one correct answer.');
    }

    question.correct.forEach(function(answer) {
      if (question.options.indexOf(answer) === -1) {
        errors.push(question.card_id + ' has a correct answer that is not in options_json: ' + answer);
      }
    });

    countsByRound[question.round_id] = (countsByRound[question.round_id] || 0) + 1;

    if (question.target_macromolecule === 'Nucleic Acids' || question.prompt.indexOf('Nucleic') !== -1 || question.prompt.indexOf('DNA') !== -1 || question.prompt.indexOf('RNA') !== -1) {
      nucleicRounds[question.round_id] = true;
    }
  });

  [1, 2, 3, 4].forEach(function(roundId) {
    if ((countsByRound[roundId] || 0) < correctPerRound) {
      errors.push('Round ' + roundId + ' needs at least ' + correctPerRound + ' active cards.');
    }

    if (!nucleicRounds[roundId]) {
      warnings.push('Round ' + roundId + ' does not include an obvious nucleic acids card.');
    }
  });

  return {
    errors: errors,
    warnings: warnings
  };
}

function validateScorePayload_(payload, targetCorrect) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Score payload is missing.');
  }

  var normalized = normalizeStudentName_(payload.studentName);
  var rawCorrect = Number(payload.totalCorrect);

  if (!isFinite(rawCorrect)) {
    rawCorrect = Number(payload.bestCorrect);
  }

  if (!isFinite(rawCorrect)) {
    rawCorrect = 0;
  }

  var bestCorrect = Math.floor(Math.max(0, Math.min(targetCorrect, rawCorrect)));
  var currentRound = Math.floor(Number(payload.currentRound) || 1);
  currentRound = Math.max(1, Math.min(4, currentRound));

  return {
    studentName: normalized.displayName,
    bestCorrect: bestCorrect,
    currentRound: currentRound,
    roundsCompleted: payload.roundsCompleted === null || payload.roundsCompleted === undefined ? null : Math.max(0, Math.min(4, Math.floor(Number(payload.roundsCompleted) || 0))),
    roundCorrect: payload.roundCorrect || {},
    attemptId: String(payload.attemptId || ''),
    answeredCorrectCount: Math.max(0, Math.floor(Number(payload.answeredCorrectCount) || 0)),
    missedCount: Math.max(0, Math.floor(Number(payload.missedCount) || 0)),
    completedAt: payload.completedAt || '',
    updatedAt: payload.updatedAt || '',
    reason: String(payload.reason || '')
  };
}

function findBestScoreRow_(sheet, studentKey) {
  var lastRow = sheet.getLastRow();

  if (lastRow <= 1) {
    return {
      rowNumber: null,
      rowValues: {}
    };
  }

  var data = sheet.getRange(2, 1, lastRow - 1, BEST_SCORES_HEADERS.length).getValues();

  for (var i = 0; i < data.length; i++) {
    var key = String(data[i][0] || '').trim();

    if (key === studentKey) {
      return {
        rowNumber: i + 2,
        rowValues: rowArrayToObject_(BEST_SCORES_HEADERS, data[i])
      };
    }
  }

  return {
    rowNumber: null,
    rowValues: {}
  };
}

function getSheetObjects_(sheet) {
  var lastRow = sheet.getLastRow();
  var lastColumn = sheet.getLastColumn();

  if (lastRow <= 1 || lastColumn === 0) {
    return [];
  }

  var headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0].map(function(header) {
    return String(header || '').trim();
  });
  var data = sheet.getRange(2, 1, lastRow - 1, lastColumn).getValues();

  return data.map(function(row) {
    return rowArrayToObject_(headers, row);
  });
}

function rowArrayToObject_(headers, row) {
  var object = {};

  headers.forEach(function(header, index) {
    if (header) {
      object[header] = row[index];
    }
  });

  return object;
}

function parseJsonArray_(value, cardId, columnName) {
  try {
    var parsed = JSON.parse(String(value || '[]'));

    if (!Array.isArray(parsed)) {
      throw new Error('not an array');
    }

    return parsed.map(function(item) {
      return String(item);
    });
  } catch (error) {
    throw new Error(cardId + ' has invalid ' + columnName + '. It must be a JSON array like ["Proteins"].');
  }
}

function parseBoolean_(value, defaultValue) {
  if (value === true || value === false) {
    return value;
  }

  var text = String(value || '').trim().toLowerCase();

  if (text === 'true' || text === 'yes' || text === '1') {
    return true;
  }

  if (text === 'false' || text === 'no' || text === '0') {
    return false;
  }

  return defaultValue;
}

function toPositiveNumber_(value, fallback) {
  var number = Number(value);

  if (!isFinite(number) || number <= 0) {
    return fallback;
  }

  return number;
}

function calculateRoundsCompleted_(roundCorrect, correctPerRound) {
  var completed = 0;

  [1, 2, 3, 4].forEach(function(roundId) {
    if (Number(roundCorrect[String(roundId)] || roundCorrect[roundId] || 0) >= correctPerRound) {
      completed++;
    }
  });

  return completed;
}
