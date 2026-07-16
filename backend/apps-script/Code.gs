/**
 * Macromolecule Evidence Lab results gateway.
 *
 * This Apps Script web app accepts one compact formative result at a time. It
 * deliberately exposes no read endpoint. Keep the destination spreadsheet
 * private and put its ID in Script Properties by running one of the setup
 * functions below before deploying the web app.
 */

var RESULTS_CONFIG = Object.freeze({
  spreadsheetProperty: 'RESULTS_SPREADSHEET_ID',
  resultsSheet: 'Results',
  summarySheet: 'Summary',
  schemaVersion: 1,
  gameName: 'Macromolecule Evidence Lab',
  gameVersion: 'evidence-lab-v1',
  contentVersion: 'unit2-slides-11-16-v1',
  lockTimeoutMs: 15000,
  maxPostBytes: 100000,
  protectionDescription: 'Macromolecule Evidence Lab - warn before editing'
});

var MACROMOLECULES = Object.freeze([
  'Carbohydrate',
  'Lipid',
  'Protein',
  'Nucleic Acid'
]);

var EVIDENCE_CONCEPTS = Object.freeze([
  'elements',
  'building-block',
  'function',
  'example'
]);

var RESULTS_HEADERS = Object.freeze([
  'Submission ID',
  'Payload Hash',
  'Received At',
  'Identity Key',
  'First Name',
  'Last Initial',
  'Schema Version',
  'Game',
  'Game Version',
  'Content Version',
  'Result Timestamp',
  'Started At',
  'Completed At',
  'Active Seconds',
  'Diagnostic Correct',
  'Diagnostic Total',
  'Diagnostic Percent',
  'Transfer Correct',
  'Transfer Total',
  'Transfer Percent',
  'Carbohydrate Correct',
  'Carbohydrate Total',
  'Lipid Correct',
  'Lipid Total',
  'Protein Correct',
  'Protein Total',
  'Nucleic Acid Correct',
  'Nucleic Acid Total',
  'Elements Correct',
  'Elements Total',
  'Building Block Correct',
  'Building Block Total',
  'Function Correct',
  'Function Total',
  'Example Correct',
  'Example Total',
  'Repairs Completed',
  'Unresolved Count',
  'Misconception Codes',
  'Weakest Macromolecule',
  'Weakest Concept'
]);

var SUMMARY_HEADERS = Object.freeze([
  'Identity Key',
  'First Name',
  'Last Initial',
  'Attempt Count',
  'Latest Completed At',
  'Latest Submission ID',
  'Best Diagnostic Correct',
  'Best Diagnostic Total',
  'Best Diagnostic Percent',
  'Latest Transfer Correct',
  'Latest Transfer Total',
  'Latest Transfer Percent',
  'Latest Weakest Macromolecule',
  'Latest Weakest Concept',
  'Latest Repairs Completed',
  'Latest Unresolved Count',
  'Source Submission IDs',
  'Possible Name Collision Review'
]);

/**
 * The only supported GET operation is a non-sensitive health check.
 */
function doGet(e) {
  var action = e && e.parameter ? e.parameter.action : '';
  if (action !== 'health') {
    return jsonOutput_({
      ok: false,
      message: 'Unsupported request.'
    });
  }

  var configured = Boolean(
    PropertiesService.getScriptProperties().getProperty(RESULTS_CONFIG.spreadsheetProperty)
  );

  return jsonOutput_({
    ok: true,
    service: 'Macromolecule Evidence Lab results gateway',
    schemaVersion: RESULTS_CONFIG.schemaVersion,
    configured: configured
  });
}

/**
 * Accepts text/plain JSON in this wire shape:
 * { action: "submitResult", schemaVersion: 1, submissionId, result }
 */
function doPost(e) {
  var submissionId = '';

  try {
    if (!e || !e.postData || typeof e.postData.contents !== 'string') {
      throw new GatewayError_('Request body is required.', false);
    }

    if (e.postData.contents.length > RESULTS_CONFIG.maxPostBytes) {
      throw new GatewayError_('Request body is too large.', false);
    }

    var payload;
    try {
      payload = JSON.parse(e.postData.contents);
    } catch (parseError) {
      throw new GatewayError_('Request body must be valid JSON.', false);
    }

    if (
      payload &&
      typeof payload.submissionId === 'string' &&
      /^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$/.test(payload.submissionId)
    ) {
      submissionId = payload.submissionId;
    }

    var validated = validateSubmission_(payload);
    submissionId = validated.submissionId;
    return jsonOutput_(storeSubmission_(validated));
  } catch (error) {
    var knownError = error && error.name === 'GatewayError';
    return jsonOutput_({
      ok: false,
      duplicate: Boolean(error && error.duplicate),
      submissionId: submissionId,
      retryable: knownError ? Boolean(error.retryable) : true,
      message: knownError ? error.message : 'The result could not be saved right now.'
    });
  }
}

/**
 * Run from a Sheet-bound script to save that active private Sheet's ID in
 * Script Properties and create the required tabs.
 */
function setupMacromoleculeResultsGateway() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) {
    throw new Error(
      'No active spreadsheet was found. Use configureResultsSpreadsheet(spreadsheetId) instead.'
    );
  }
  return configureResultsSpreadsheet(spreadsheet.getId());
}

/**
 * Run from a standalone or bound script when the destination Sheet ID should
 * be supplied explicitly. This changes Script Properties but does not deploy.
 */
function configureResultsSpreadsheet(spreadsheetId) {
  var normalizedId = requireSafeToken_(spreadsheetId, 'Spreadsheet ID', 20, 200);
  var spreadsheet;

  try {
    spreadsheet = SpreadsheetApp.openById(normalizedId);
  } catch (error) {
    throw new Error('The spreadsheet could not be opened with the current Apps Script account.');
  }

  ensureGatewaySheets_(spreadsheet);
  PropertiesService.getScriptProperties().setProperty(
    RESULTS_CONFIG.spreadsheetProperty,
    normalizedId
  );

  return {
    ok: true,
    spreadsheetName: spreadsheet.getName(),
    spreadsheetId: normalizedId,
    sheets: [RESULTS_CONFIG.resultsSheet, RESULTS_CONFIG.summarySheet]
  };
}

function storeSubmission_(submission) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(RESULTS_CONFIG.lockTimeoutMs)) {
    throw new GatewayError_('The results service is busy. Please try again.', true);
  }

  try {
    var spreadsheet = getConfiguredSpreadsheet_();
    var sheets = ensureGatewaySheets_(spreadsheet);
    var payloadHash = sha256_(canonicalize_(submission));
    var duplicate = findDuplicate_(sheets.results, submission.submissionId, payloadHash);

    if (duplicate === 'same') {
      // A prior append may have succeeded before its Summary update failed.
      // Rebuilding here makes an idempotent retry repair that partial state.
      rebuildIdentitySummary_(sheets.results, sheets.summary, submission.identity.key);
      SpreadsheetApp.flush();
      return {
        ok: true,
        duplicate: true,
        submissionId: submission.submissionId,
        retryable: false
      };
    }

    if (duplicate === 'conflict') {
      var conflict = new GatewayError_(
        'That submission ID already exists with different result data.',
        false
      );
      conflict.duplicate = true;
      throw conflict;
    }

    var receivedAt = new Date().toISOString();
    appendResult_(sheets.results, submission, payloadHash, receivedAt);
    rebuildIdentitySummary_(sheets.results, sheets.summary, submission.identity.key);
    SpreadsheetApp.flush();

    return {
      ok: true,
      duplicate: false,
      submissionId: submission.submissionId,
      retryable: false
    };
  } finally {
    lock.releaseLock();
  }
}

function validateSubmission_(payload) {
  requirePlainObject_(payload, 'Submission');

  if (payload.action !== 'submitResult') {
    throw new GatewayError_('Unsupported action.', false);
  }
  if (payload.schemaVersion !== RESULTS_CONFIG.schemaVersion) {
    throw new GatewayError_('Unsupported submission schema version.', false);
  }

  var submissionId = requirePattern_(
    payload.submissionId,
    'Submission ID',
    /^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$/
  );
  var result = validateResult_(payload.result);

  return {
    action: 'submitResult',
    schemaVersion: RESULTS_CONFIG.schemaVersion,
    submissionId: submissionId,
    identity: result.identity,
    result: result.value
  };
}

function validateResult_(rawResult) {
  requirePlainObject_(rawResult, 'Result');

  if (rawResult.game !== RESULTS_CONFIG.gameName) {
    throw new GatewayError_('Unexpected game name.', false);
  }

  var gameVersion = requirePattern_(
    rawResult.gameVersion,
    'Game version',
    /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/
  );
  var contentVersion = requirePattern_(
    rawResult.contentVersion,
    'Content version',
    /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/
  );
  if (gameVersion !== RESULTS_CONFIG.gameVersion) {
    throw new GatewayError_('Unsupported game version.', false);
  }
  if (contentVersion !== RESULTS_CONFIG.contentVersion) {
    throw new GatewayError_('Unsupported content version.', false);
  }
  var timestamp = requireIsoDate_(rawResult.timestamp, 'Result timestamp');
  var startedAt = requireIsoDate_(rawResult.startedAt, 'Started at');
  var completedAt = requireIsoDate_(rawResult.completedAt, 'Completed at');

  if (Date.parse(completedAt) < Date.parse(startedAt)) {
    throw new GatewayError_('Completed time cannot be before started time.', false);
  }
  if (Date.parse(completedAt) > Date.now() + 24 * 60 * 60 * 1000) {
    throw new GatewayError_('Completed time is too far in the future.', false);
  }

  var identity = normalizeStudentIdentity_(rawResult.studentName);
  // A persisted iPad attempt can be resumed later, so accept up to seven days.
  // The client remains responsible for excluding background time when it can.
  var activeSeconds = requireInteger_(rawResult.activeSeconds, 'Active seconds', 0, 604800);
  var elapsedSeconds = Math.floor((Date.parse(completedAt) - Date.parse(startedAt)) / 1000);
  if (activeSeconds > elapsedSeconds + 5) {
    throw new GatewayError_('Active seconds cannot exceed elapsed attempt time.', false);
  }
  var diagnostic = validateMetric_(rawResult.diagnostic, 'Diagnostic', 16);
  var transfer = validateMetric_(rawResult.transfer, 'Transfer', 8);
  var byMacromolecule = validateMetricRecord_(
    rawResult.byMacromolecule,
    MACROMOLECULES,
    'Macromolecule',
    4
  );
  var byConcept = validateMetricRecord_(
    rawResult.byConcept,
    EVIDENCE_CONCEPTS,
    'Evidence concept',
    2
  );

  requireCorrectSum_(byMacromolecule, MACROMOLECULES, diagnostic.correct, 'macromolecule');
  var evidenceCorrect = EVIDENCE_CONCEPTS.reduce(function (total, concept) {
    return total + byConcept[concept].correct;
  }, 0);
  var classificationCorrect = diagnostic.correct - evidenceCorrect;
  if (classificationCorrect < 0 || classificationCorrect > 8) {
    throw new GatewayError_(
      'Evidence-concept counts are inconsistent with the diagnostic total.',
      false
    );
  }

  var repairsCompleted = requireInteger_(
    rawResult.repairsCompleted,
    'Repairs completed',
    0,
    8
  );
  var unresolvedCount = requireInteger_(rawResult.unresolvedCount, 'Unresolved count', 0, 8);
  var misconceptionCodes = validateMisconceptionCodes_(rawResult.misconceptionCodes);

  if (repairsCompleted + unresolvedCount !== misconceptionCodes.length) {
    throw new GatewayError_(
      'Repair counts must account for each distinct misconception code.',
      false
    );
  }

  var value = {
    timestamp: timestamp,
    game: RESULTS_CONFIG.gameName,
    gameVersion: gameVersion,
    contentVersion: contentVersion,
    studentName: identity.displayName,
    startedAt: startedAt,
    completedAt: completedAt,
    activeSeconds: activeSeconds,
    diagnostic: diagnostic,
    transfer: transfer,
    byMacromolecule: byMacromolecule,
    byConcept: byConcept,
    repairsCompleted: repairsCompleted,
    unresolvedCount: unresolvedCount,
    misconceptionCodes: misconceptionCodes
  };

  return { identity: identity, value: value };
}

function normalizeStudentIdentity_(studentName) {
  if (typeof studentName !== 'string') {
    throw new GatewayError_('Student name must contain a first name and last initial.', false);
  }

  var normalized = studentName
    .normalize('NFC')
    .replace(/\u2019/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
  var parts = normalized.split(' ');
  if (parts.length < 2) {
    throw new GatewayError_('Enter a first name and one last initial.', false);
  }

  var rawInitial = parts.pop().replace(/\./g, '');
  var firstName = parts.join(' ');
  var namePartPattern = /^[A-Za-z\u00C0-\u024F][A-Za-z\u00C0-\u024F'-]{0,39}$/;

  if (rawInitial.length !== 1 || !/^[A-Za-z\u00C0-\u024F]$/.test(rawInitial)) {
    throw new GatewayError_('The last name must be represented by one initial.', false);
  }

  var firstNameParts = firstName.split(' ');
  if (
    firstName.length > 60 ||
    firstNameParts.some(function (part) { return !namePartPattern.test(part); })
  ) {
    throw new GatewayError_('The first name contains unsupported characters.', false);
  }

  var lastInitial = rawInitial.toLocaleUpperCase();
  if (lastInitial.length !== 1) {
    throw new GatewayError_('The last name must be represented by one initial.', false);
  }
  var displayName = firstName + ' ' + lastInitial;
  return {
    firstName: firstName,
    lastInitial: lastInitial,
    displayName: displayName,
    key: firstName.toLocaleLowerCase() + '|' + lastInitial.toLocaleLowerCase()
  };
}

function validateMetric_(rawMetric, label, requiredTotal) {
  requirePlainObject_(rawMetric, label);
  var total = requireInteger_(rawMetric.total, label + ' total', requiredTotal, requiredTotal);
  var correct = requireInteger_(rawMetric.correct, label + ' correct', 0, total);
  return { correct: correct, total: total };
}

function validateMetricRecord_(rawRecord, keys, label, requiredTotalPerKey) {
  requirePlainObject_(rawRecord, label + ' counts');
  var normalized = {};

  keys.forEach(function (key) {
    normalized[key] = validateMetric_(
      rawRecord[key],
      label + ' ' + key,
      requiredTotalPerKey
    );
  });

  return normalized;
}

function requireCorrectSum_(record, keys, expected, label) {
  var sum = keys.reduce(function (total, key) {
    return total + record[key].correct;
  }, 0);
  if (sum !== expected) {
    throw new GatewayError_(
      'The ' + label + ' correct counts do not match the diagnostic total.',
      false
    );
  }
}

function validateMisconceptionCodes_(rawCodes) {
  if (!Array.isArray(rawCodes) || rawCodes.length > 8) {
    throw new GatewayError_('Misconception codes must be a list of at most eight items.', false);
  }

  var seen = {};
  return rawCodes.map(function (rawCode) {
    var code = requirePattern_(
      rawCode,
      'Misconception code',
      /^[A-Za-z0-9][A-Za-z0-9._:-]{0,63}$/
    );
    if (seen[code]) {
      throw new GatewayError_('Misconception codes must be distinct.', false);
    }
    seen[code] = true;
    return code;
  });
}

function appendResult_(sheet, submission, payloadHash, receivedAt) {
  var result = submission.result;
  var weakestMacromolecule = weakestLabels_(result.byMacromolecule, MACROMOLECULES);
  var weakestConcept = weakestLabels_(result.byConcept, EVIDENCE_CONCEPTS);

  var row = [
    submission.submissionId,
    payloadHash,
    receivedAt,
    submission.identity.key,
    submission.identity.firstName,
    submission.identity.lastInitial,
    submission.schemaVersion,
    result.game,
    result.gameVersion,
    result.contentVersion,
    result.timestamp,
    result.startedAt,
    result.completedAt,
    result.activeSeconds,
    result.diagnostic.correct,
    result.diagnostic.total,
    percentage_(result.diagnostic),
    result.transfer.correct,
    result.transfer.total,
    percentage_(result.transfer),
    result.byMacromolecule.Carbohydrate.correct,
    result.byMacromolecule.Carbohydrate.total,
    result.byMacromolecule.Lipid.correct,
    result.byMacromolecule.Lipid.total,
    result.byMacromolecule.Protein.correct,
    result.byMacromolecule.Protein.total,
    result.byMacromolecule['Nucleic Acid'].correct,
    result.byMacromolecule['Nucleic Acid'].total,
    result.byConcept.elements.correct,
    result.byConcept.elements.total,
    result.byConcept['building-block'].correct,
    result.byConcept['building-block'].total,
    result.byConcept.function.correct,
    result.byConcept.function.total,
    result.byConcept.example.correct,
    result.byConcept.example.total,
    result.repairsCompleted,
    result.unresolvedCount,
    result.misconceptionCodes.join(' | '),
    weakestMacromolecule,
    weakestConcept
  ];

  sheet.getRange(sheet.getLastRow() + 1, 1, 1, row.length).setValues([row]);
}

function findDuplicate_(sheet, submissionId, payloadHash) {
  if (sheet.getLastRow() < 2) {
    return 'none';
  }

  var idColumn = headerIndex_(RESULTS_HEADERS, 'Submission ID') + 1;
  var hashColumn = headerIndex_(RESULTS_HEADERS, 'Payload Hash') + 1;
  var matches = sheet
    .getRange(2, idColumn, sheet.getLastRow() - 1, 1)
    .createTextFinder(submissionId)
    .matchEntireCell(true)
    .findAll();

  if (!matches.length) {
    return 'none';
  }

  if (matches.length > 1) {
    throw new GatewayError_('Duplicate submission IDs already exist in Results.', false);
  }

  var existingHash = String(sheet.getRange(matches[0].getRow(), hashColumn).getValue());
  return existingHash === payloadHash ? 'same' : 'conflict';
}

function rebuildIdentitySummary_(resultsSheet, summarySheet, identityKey) {
  var resultValues = resultsSheet.getDataRange().getValues();
  var resultHeader = resultValues[0];
  var resultIndex = makeHeaderMap_(resultHeader);
  var attempts = resultValues.slice(1).filter(function (row) {
    return String(row[resultIndex['Identity Key']]) === identityKey;
  });

  if (!attempts.length) {
    throw new GatewayError_('The saved result could not be summarized.', true);
  }

  attempts.sort(function (left, right) {
    return Date.parse(String(left[resultIndex['Completed At']])) -
      Date.parse(String(right[resultIndex['Completed At']]));
  });

  var latest = attempts[attempts.length - 1];
  var best = attempts.reduce(function (currentBest, row) {
    var candidatePercent = Number(row[resultIndex['Diagnostic Percent']]);
    var bestPercent = Number(currentBest[resultIndex['Diagnostic Percent']]);
    if (candidatePercent > bestPercent) {
      return row;
    }
    if (
      candidatePercent === bestPercent &&
      Date.parse(String(row[resultIndex['Completed At']])) >
        Date.parse(String(currentBest[resultIndex['Completed At']]))
    ) {
      return row;
    }
    return currentBest;
  }, attempts[0]);

  var sourceIds = attempts.map(function (row) {
    return String(row[resultIndex['Submission ID']]);
  });

  var summaryRow = [
    identityKey,
    latest[resultIndex['First Name']],
    latest[resultIndex['Last Initial']],
    attempts.length,
    latest[resultIndex['Completed At']],
    latest[resultIndex['Submission ID']],
    best[resultIndex['Diagnostic Correct']],
    best[resultIndex['Diagnostic Total']],
    best[resultIndex['Diagnostic Percent']],
    latest[resultIndex['Transfer Correct']],
    latest[resultIndex['Transfer Total']],
    latest[resultIndex['Transfer Percent']],
    latest[resultIndex['Weakest Macromolecule']],
    latest[resultIndex['Weakest Concept']],
    latest[resultIndex['Repairs Completed']],
    latest[resultIndex['Unresolved Count']],
    sourceIds.join(' | '),
    attempts.length > 1 ? 'REVIEW' : ''
  ];

  var summaryValues = summarySheet.getDataRange().getValues();
  var identityColumn = headerIndex_(SUMMARY_HEADERS, 'Identity Key');
  var matchingRows = [];

  for (var rowIndex = 1; rowIndex < summaryValues.length; rowIndex += 1) {
    if (String(summaryValues[rowIndex][identityColumn]) === identityKey) {
      matchingRows.push(rowIndex + 1);
    }
  }

  if (matchingRows.length > 1) {
    throw new GatewayError_('Duplicate identity rows already exist in Summary.', false);
  }

  var targetRow = matchingRows.length ? matchingRows[0] : summarySheet.getLastRow() + 1;
  summarySheet.getRange(targetRow, 1, 1, summaryRow.length).setValues([summaryRow]);
}

function weakestLabels_(record, keys) {
  var lowest = 1;
  keys.forEach(function (key) {
    lowest = Math.min(lowest, record[key].correct / record[key].total);
  });

  if (lowest === 1) {
    return '';
  }

  return keys.filter(function (key) {
    return record[key].correct / record[key].total === lowest;
  }).join(' | ');
}

function percentage_(metric) {
  return Math.round((metric.correct / metric.total) * 1000) / 10;
}

function getConfiguredSpreadsheet_() {
  var spreadsheetId = PropertiesService
    .getScriptProperties()
    .getProperty(RESULTS_CONFIG.spreadsheetProperty);

  if (!spreadsheetId) {
    throw new GatewayError_('The results service has not been configured.', true);
  }

  try {
    return SpreadsheetApp.openById(spreadsheetId);
  } catch (error) {
    throw new GatewayError_('The configured results Sheet is unavailable.', true);
  }
}

function ensureGatewaySheets_(spreadsheet) {
  var results = ensureSheet_(spreadsheet, RESULTS_CONFIG.resultsSheet, RESULTS_HEADERS);
  var summary = ensureSheet_(spreadsheet, RESULTS_CONFIG.summarySheet, SUMMARY_HEADERS);
  return { results: results, summary: summary };
}

function ensureSheet_(spreadsheet, sheetName, headers) {
  var sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }

  if (sheet.getMaxColumns() < headers.length) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), headers.length - sheet.getMaxColumns());
  }

  var lastRow = sheet.getLastRow();
  if (lastRow === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    styleHeader_(sheet, headers.length);
  } else {
    var existingHeaders = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
    var mismatch = headers.some(function (header, index) {
      return existingHeaders[index] !== header;
    });
    if (mismatch) {
      throw new GatewayError_(
        sheetName + ' has unexpected columns. No data was changed.',
        false
      );
    }
  }

  sheet.setFrozenRows(1);
  ensureWarningProtection_(sheet);
  return sheet;
}

function styleHeader_(sheet, columnCount) {
  sheet.getRange(1, 1, 1, columnCount)
    .setFontWeight('bold')
    .setBackground('#17324d')
    .setFontColor('#ffffff')
    .setWrap(true);
}

function ensureWarningProtection_(sheet) {
  var protections = sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET);
  var protection = null;

  protections.some(function (candidate) {
    if (candidate.getDescription() === RESULTS_CONFIG.protectionDescription) {
      protection = candidate;
      return true;
    }
    return false;
  });

  if (!protection) {
    protection = sheet.protect().setDescription(RESULTS_CONFIG.protectionDescription);
  }
  protection.setWarningOnly(true);
}

function requirePlainObject_(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new GatewayError_(label + ' must be an object.', false);
  }
}

function requireInteger_(value, label, minimum, maximum) {
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new GatewayError_(
      label + ' must be an integer from ' + minimum + ' to ' + maximum + '.',
      false
    );
  }
  return value;
}

function requirePattern_(value, label, pattern) {
  if (typeof value !== 'string' || !pattern.test(value)) {
    throw new GatewayError_(label + ' has an invalid format.', false);
  }
  return value;
}

function requireSafeToken_(value, label, minimumLength, maximumLength) {
  if (
    typeof value !== 'string' ||
    value.length < minimumLength ||
    value.length > maximumLength ||
    !/^[A-Za-z0-9_-]+$/.test(value)
  ) {
    throw new Error(label + ' has an invalid format.');
  }
  return value;
}

function requireIsoDate_(value, label) {
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(value) ||
    !Number.isFinite(Date.parse(value))
  ) {
    throw new GatewayError_(label + ' must be a UTC ISO timestamp.', false);
  }
  return new Date(Date.parse(value)).toISOString();
}

function headerIndex_(headers, label) {
  var index = headers.indexOf(label);
  if (index < 0) {
    throw new GatewayError_('Required Sheet column is missing: ' + label, false);
  }
  return index;
}

function makeHeaderMap_(headers) {
  var map = {};
  headers.forEach(function (header, index) {
    map[String(header)] = index;
  });
  return map;
}

function canonicalize_(value) {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return '[' + value.map(canonicalize_).join(',') + ']';
  }
  return '{' + Object.keys(value).sort().map(function (key) {
    return JSON.stringify(key) + ':' + canonicalize_(value[key]);
  }).join(',') + '}';
}

function sha256_(text) {
  var digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    text,
    Utilities.Charset.UTF_8
  );
  return Utilities.base64EncodeWebSafe(digest);
}

function jsonOutput_(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}

function GatewayError_(message, retryable) {
  this.name = 'GatewayError';
  this.message = message;
  this.retryable = Boolean(retryable);
  this.duplicate = false;
}
