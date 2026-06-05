var CONFIG_SHEET_NAME = 'Config';
var QUESTION_BANK_SHEET_NAME = 'QuestionBank';
var BEST_SCORES_SHEET_NAME = 'BestScores';

var CONFIG_HEADERS = ['key', 'value', 'notes'];

var QUESTION_BANK_HEADERS = [
  'card_id',
  'active',
  'round_id',
  'round_name',
  'interaction_type',
  'skill_type',
  'target_macromolecule',
  'prompt',
  'options_json',
  'correct_json',
  'explanation',
  'difficulty',
  'tags'
];

var BEST_SCORES_HEADERS = [
  'student_key',
  'student_name',
  'best_correct',
  'target_correct',
  'grade_percent',
  'grade_points_100',
  'completed',
  'current_round',
  'rounds_completed',
  'last_synced_at',
  'completed_at',
  'latest_summary_json'
];

function setupPiratePantry() {
  var spreadsheet = getBoundSpreadsheet_();

  var configSheet = getOrCreateSheet_(spreadsheet, CONFIG_SHEET_NAME, CONFIG_HEADERS);
  var questionSheet = getOrCreateSheet_(spreadsheet, QUESTION_BANK_SHEET_NAME, QUESTION_BANK_HEADERS);
  var scoreSheet = getOrCreateSheet_(spreadsheet, BEST_SCORES_SHEET_NAME, BEST_SCORES_HEADERS);

  var configAdded = seedConfig_(configSheet);
  var questionsAdded = seedQuestionBank_(questionSheet);

  formatSetupSheet_(configSheet);
  formatSetupSheet_(questionSheet);
  formatSetupSheet_(scoreSheet);

  return {
    success: true,
    message: 'Pirate Pantry setup is complete.',
    spreadsheetName: spreadsheet.getName(),
    spreadsheetUrl: spreadsheet.getUrl(),
    configRowsAdded: configAdded,
    questionRowsAdded: questionsAdded
  };
}

function getBoundSpreadsheet_() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  if (!spreadsheet) {
    throw new Error('This project needs to be connected to a Google Sheet. Open the bound Apps Script project from the Sheet, then run setupPiratePantry again.');
  }

  return spreadsheet;
}

function getOrCreateSheet_(spreadsheet, sheetName, headers) {
  var sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }

  ensureHeaders_(sheet, headers);
  return sheet;
}

function ensureHeaders_(sheet, headers) {
  var lastColumn = sheet.getLastColumn();
  var existingHeaders = [];

  if (lastColumn > 0) {
    existingHeaders = sheet.getRange(1, 1, 1, lastColumn).getValues()[0].map(function(header) {
      return String(header || '').trim();
    });
  }

  var hasHeaders = existingHeaders.some(function(header) {
    return header !== '';
  });

  if (!hasHeaders) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
    return;
  }

  var missingHeaders = headers.filter(function(header) {
    return existingHeaders.indexOf(header) === -1;
  });

  if (missingHeaders.length > 0) {
    sheet.getRange(1, existingHeaders.length + 1, 1, missingHeaders.length).setValues([missingHeaders]);
  }

  sheet.setFrozenRows(1);
}

function seedConfig_(sheet) {
  var defaults = getConfigDefaults_();
  var existingKeys = {};
  var lastRow = sheet.getLastRow();

  if (lastRow > 1) {
    var values = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    values.forEach(function(row) {
      var key = String(row[0] || '').trim();
      if (key) {
        existingKeys[key] = true;
      }
    });
  }

  var rowsToAdd = defaults.filter(function(row) {
    return !existingKeys[row[0]];
  });

  if (rowsToAdd.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, rowsToAdd.length, CONFIG_HEADERS.length).setValues(rowsToAdd);
  }

  return rowsToAdd.length;
}

function seedQuestionBank_(sheet) {
  if (sheet.getLastRow() > 1) {
    return 0;
  }

  var rows = getSeedQuestionRows_();
  sheet.getRange(2, 1, rows.length, QUESTION_BANK_HEADERS.length).setValues(rows);
  return rows.length;
}

function formatSetupSheet_(sheet) {
  sheet.getRange(1, 1, 1, sheet.getLastColumn())
    .setFontWeight('bold')
    .setBackground('#ead8b7');

  sheet.autoResizeColumns(1, Math.max(1, sheet.getLastColumn()));
}
