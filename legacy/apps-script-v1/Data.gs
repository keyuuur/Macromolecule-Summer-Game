function getGameData() {
  var spreadsheet = getBoundSpreadsheet_();
  var config = getConfigMap_(spreadsheet);
  var settings = getValidatedGameSettings_(config);
  var questions = getActiveQuestionBank_(spreadsheet);
  var validation = validateQuestionBank_(questions, settings.correctPerRound);
  var setupErrors = settings.errors.concat(validation.errors);

  if (setupErrors.length > 0) {
    throw new Error('Game setup needs attention before students play: ' + setupErrors.join(' | '));
  }

  return {
    success: true,
    config: {
      gameTitle: config.game_title || APP_TITLE,
      targetCorrect: settings.targetCorrect,
      correctPerRound: settings.correctPerRound,
      allowReviewChart: settings.allowReviewChart,
      allowReplay: settings.allowReplay,
      questionBankVersion: settings.questionBankVersion
    },
    rounds: getRoundInfo_(),
    questions: questions,
    reviewChart: getReviewChartData_(),
    warnings: settings.warnings.concat(validation.warnings)
  };
}

function saveBestScore(payload) {
  var spreadsheet = getBoundSpreadsheet_();
  var config = getConfigMap_(spreadsheet);
  var settings = getValidatedGameSettings_(config);
  var questions = getActiveQuestionBank_(spreadsheet);
  var validation = validateQuestionBank_(questions, settings.correctPerRound);
  var setupErrors = settings.errors.concat(validation.errors);

  if (setupErrors.length > 0) {
    throw new Error('Game setup needs attention before scores can save: ' + setupErrors.join(' | '));
  }

  var cleanedPayload = validateScorePayload_(payload, settings.targetCorrect, settings.correctPerRound, questions);
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
        gradePercent: calculateGrade_(previousBest, settings.targetCorrect)
      };
    }

    var bestCorrect = Math.max(0, Math.min(settings.targetCorrect, newBestCorrect));
    var gradePercent = calculateGrade_(bestCorrect, settings.targetCorrect);
    var completed = bestCorrect >= settings.targetCorrect;
    var completedAt = completed ? (rowInfo.rowValues.completed_at || cleanedPayload.completedAt || now) : '';
    var roundsCompleted = calculateRoundsCompleted_(cleanedPayload.roundCorrect, settings.correctPerRound);

    var summary = {
      attemptId: cleanedPayload.attemptId,
      totalCorrect: bestCorrect,
      currentRound: cleanedPayload.currentRound,
      roundsCompleted: roundsCompleted,
      acceptedAnsweredCorrectCount: cleanedPayload.answeredCorrectIds.length,
      ignoredAnsweredCorrectCount: cleanedPayload.ignoredAnsweredCorrectCount,
      clientReportedCorrect: cleanedPayload.clientReportedCorrect,
      missedCount: cleanedPayload.missedCount,
      reason: cleanedPayload.reason || '',
      clientUpdatedAt: cleanedPayload.updatedAt || ''
    };

    var row = [
      normalized.key,
      normalized.displayName,
      bestCorrect,
      settings.targetCorrect,
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
    throw new Error('Enter your first and last name.');
  }

  if (displayName.split(' ').length < 2) {
    throw new Error('Enter first and last name, or first name plus last initial.');
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

function getValidatedGameSettings_(config) {
  var errors = [];
  var warnings = [];
  var targetCorrect = parsePositiveIntegerConfig_(config.target_correct, 32, 'target_correct', errors);
  var correctPerRound = parsePositiveIntegerConfig_(config.correct_per_round, 8, 'correct_per_round', errors);
  var expectedTarget = correctPerRound * 4;

  if (targetCorrect !== expectedTarget) {
    errors.push('Config target_correct must equal correct_per_round x 4 rounds. Current values make ' + targetCorrect + ' instead of ' + expectedTarget + '.');
  }

  return {
    targetCorrect: targetCorrect,
    correctPerRound: correctPerRound,
    allowReviewChart: parseBoolean_(config.allow_review_chart, true),
    allowReplay: parseBoolean_(config.allow_replay, true),
    questionBankVersion: String(config.question_bank_version || '1'),
    errors: errors,
    warnings: warnings
  };
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

    if (question.interaction_type === 'single_choice' && question.correct.length !== 1) {
      errors.push(question.card_id + ' is single_choice, so correct_json must contain exactly one answer.');
    }

    findDuplicateValues_(question.options).forEach(function(option) {
      errors.push(question.card_id + ' has a duplicate option: ' + option);
    });

    findDuplicateValues_(question.correct).forEach(function(answer) {
      errors.push(question.card_id + ' has a duplicate correct answer: ' + answer);
    });

    question.options.forEach(function(option) {
      if (!String(option || '').trim()) {
        errors.push(question.card_id + ' has a blank option.');
      }
    });

    question.correct.forEach(function(answer) {
      if (!String(answer || '').trim()) {
        errors.push(question.card_id + ' has a blank correct answer.');
      }

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

function validateScorePayload_(payload, targetCorrect, correctPerRound, questions) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Score payload is missing.');
  }

  var normalized = normalizeStudentName_(payload.studentName);
  var acceptedScore = calculateAcceptedScoreFromPayload_(payload.answeredCorrectIds, questions, correctPerRound, targetCorrect);
  var rawCorrect = Number(payload.totalCorrect);
  var currentRound = Math.floor(Number(payload.currentRound) || 1);
  currentRound = Math.max(1, Math.min(4, currentRound));

  if (!isFinite(rawCorrect)) {
    rawCorrect = 0;
  }

  return {
    studentName: normalized.displayName,
    bestCorrect: acceptedScore.bestCorrect,
    currentRound: currentRound,
    roundCorrect: acceptedScore.roundCorrect,
    attemptId: String(payload.attemptId || ''),
    answeredCorrectIds: acceptedScore.acceptedIds,
    ignoredAnsweredCorrectCount: acceptedScore.ignoredCount,
    clientReportedCorrect: Math.max(0, Math.floor(rawCorrect)),
    missedCount: Math.max(0, Math.floor(Number(payload.missedCount) || 0)),
    completedAt: payload.completedAt || '',
    updatedAt: payload.updatedAt || '',
    reason: String(payload.reason || '')
  };
}

function calculateAcceptedScoreFromPayload_(answeredCorrectIds, questions, correctPerRound, targetCorrect) {
  var lookup = buildQuestionLookup_(questions);
  var ids = Array.isArray(answeredCorrectIds) ? answeredCorrectIds : [];
  var seen = {};
  var acceptedIds = [];
  var ignoredCount = 0;
  var roundCounts = {
    1: 0,
    2: 0,
    3: 0,
    4: 0
  };

  ids.forEach(function(value) {
    var cardId = String(value || '').trim();

    if (!cardId || seen[cardId] || !lookup[cardId]) {
      ignoredCount++;
      return;
    }

    seen[cardId] = true;
    acceptedIds.push(cardId);
    roundCounts[String(lookup[cardId].round_id)]++;
  });

  var roundCorrect = {
    1: Math.min(correctPerRound, roundCounts[1] || 0),
    2: Math.min(correctPerRound, roundCounts[2] || 0),
    3: Math.min(correctPerRound, roundCounts[3] || 0),
    4: Math.min(correctPerRound, roundCounts[4] || 0)
  };
  var bestCorrect = Math.min(targetCorrect, roundCorrect[1] + roundCorrect[2] + roundCorrect[3] + roundCorrect[4]);

  return {
    acceptedIds: acceptedIds,
    ignoredCount: ignoredCount,
    roundCorrect: roundCorrect,
    bestCorrect: bestCorrect
  };
}

function buildQuestionLookup_(questions) {
  var lookup = {};

  questions.forEach(function(question) {
    lookup[question.card_id] = question;
  });

  return lookup;
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

function parsePositiveIntegerConfig_(value, fallback, key, errors) {
  if (value === null || value === undefined || String(value).trim() === '') {
    return fallback;
  }

  var number = Number(value);

  if (!isFinite(number) || number <= 0 || Math.floor(number) !== number) {
    errors.push('Config ' + key + ' must be a whole number greater than 0.');
    return fallback;
  }

  return number;
}

function toPositiveNumber_(value, fallback) {
  var number = Number(value);

  if (!isFinite(number) || number <= 0) {
    return fallback;
  }

  return number;
}

function findDuplicateValues_(values) {
  var seen = {};
  var duplicates = {};

  values.forEach(function(value) {
    var text = String(value || '').trim();

    if (!text) {
      return;
    }

    if (seen[text]) {
      duplicates[text] = true;
    }

    seen[text] = true;
  });

  return Object.keys(duplicates);
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
