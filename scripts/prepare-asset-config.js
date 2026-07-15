#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const assetConfigKeys = {
  landingChest: 'asset_landing_chest',
  landingBottleGreen: 'asset_landing_bottle_green',
  landingBottleBlue: 'asset_landing_bottle_blue',
  landingCompass: 'asset_landing_compass',
  optionCarbohydrates: 'asset_option_carbohydrates',
  optionLipids: 'asset_option_lipids',
  optionProteins: 'asset_option_proteins',
  optionNucleicAcids: 'asset_option_nucleic_acids',
  optionBread: 'asset_option_bread',
  optionPasta: 'asset_option_pasta',
  optionSugars: 'asset_option_sugars',
  optionButter: 'asset_option_butter',
  optionOil: 'asset_option_oil',
  optionMeat: 'asset_option_meat',
  optionNuts: 'asset_option_nuts',
  optionSimpleSugars: 'asset_option_simple_sugars',
  optionFattyAcids: 'asset_option_fatty_acids',
  optionAminoAcids: 'asset_option_amino_acids',
  optionNucleotides: 'asset_option_nucleotides',
  optionDNA: 'asset_option_dna',
  optionRNA: 'asset_option_rna',
  optionCarbon: 'asset_option_carbon',
  optionHydrogen: 'asset_option_hydrogen',
  optionOxygen: 'asset_option_oxygen',
  optionNitrogen: 'asset_option_nitrogen',
  optionPhosphorus: 'asset_option_phosphorus'
};

function normalizeAssetUrl(url) {
  const value = String(url || '').trim();
  let match;

  if (!value) {
    return '';
  }

  match = value.match(/\/file\/d\/([^/]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/thumbnail?id=${encodeURIComponent(match[1])}&sz=w512`;
  }

  match = value.match(/[?&]id=([^&]+)/);
  if (/drive\.google\.com/i.test(value) && match && match[1]) {
    return `https://drive.google.com/thumbnail?id=${encodeURIComponent(match[1])}&sz=w512`;
  }

  return value;
}

function isDriveFolderLink(url) {
  return /drive\.google\.com\/(?:drive\/)?folders\//i.test(String(url || ''));
}

function isUnsupportedDrivePageLink(url) {
  const value = String(url || '');
  return /drive\.google\.com/i.test(value)
    && !/\/file\/d\/[^/]+/i.test(value)
    && !/[?&]id=([^&]+)/i.test(value)
    && !/\/thumbnail\?/i.test(value);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, ''));
}

function printUsage() {
  console.log([
    'Usage:',
    '  node scripts/prepare-asset-config.js [asset-links.json] [--check]',
    '',
    'Input should use the asset keys from scripts/asset-links.template.json.',
    'The script prints Config sheet rows and a ClientScript IMAGE_ASSETS snippet.',
    'Use --check to verify that provided URLs respond like images.'
  ].join('\n'));
}

async function checkAssetUrl(url) {
  if (!url) {
    return { ok: false, reason: 'missing' };
  }

  if (isDriveFolderLink(url)) {
    return {
      ok: false,
      reason: 'Google Drive folder links cannot render as a single image. Paste the individual file link for this asset.',
      checkedUrl: url
    };
  }

  if (isUnsupportedDrivePageLink(url)) {
    return {
      ok: false,
      reason: 'This Google Drive link does not look like an individual file link or thumbnail URL.',
      checkedUrl: url
    };
  }

  if (/^data:image\//i.test(url)) {
    return { ok: true, status: 200, contentType: 'data:image', checkedUrl: url.slice(0, 32) + '...' };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    let response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal
    });

    if (response.status === 405 || response.status === 403 || response.status === 404) {
      response = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal
      });
    }

    const contentType = response.headers.get('content-type') || '';

    return {
      ok: response.ok && /^image\//i.test(contentType),
      status: response.status,
      contentType,
      checkedUrl: url
    };
  } catch (error) {
    return {
      ok: false,
      reason: error && error.message ? error.message : String(error),
      checkedUrl: url
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const shouldCheck = args.indexOf('--check') !== -1;
  const inputArg = args.filter((arg) => arg !== '--check').find((arg) => !arg.startsWith('-')) || path.join('scripts', 'asset-links.template.json');

  if (inputArg === '--help' || inputArg === '-h') {
    printUsage();
    return;
  }

  const inputPath = path.resolve(process.cwd(), inputArg);
  const assets = readJson(inputPath);
  const rows = [];
  const missing = [];
  const unknown = Object.keys(assets).filter((key) => !assetConfigKeys[key]);
  const inputWarnings = [];

  Object.keys(assetConfigKeys).forEach((assetKey) => {
    const rawUrl = String(assets[assetKey] || '').trim();
    const normalizedUrl = normalizeAssetUrl(rawUrl);

    if (!rawUrl) {
      missing.push(assetKey);
      return;
    }

    if (isDriveFolderLink(rawUrl)) {
      inputWarnings.push({
        assetKey,
        warning: 'Drive folder link supplied. Use the individual image file link instead.'
      });
    } else if (isUnsupportedDrivePageLink(rawUrl)) {
      inputWarnings.push({
        assetKey,
        warning: 'Drive link does not look like a file link, open?id link, or thumbnail URL.'
      });
    }

    rows.push({
      assetKey,
      configKey: assetConfigKeys[assetKey],
      originalUrl: rawUrl,
      normalizedUrl
    });
  });

  const imageAssetSnippet = Object.keys(assetConfigKeys)
    .map((assetKey) => `      ${assetKey}: '${String(assets[assetKey] || '').trim().replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`)
    .join(',\n');

  console.log(JSON.stringify({
    input: inputPath,
    providedCount: rows.length,
    missingCount: missing.length,
    missing,
    unknown,
    inputWarnings,
    configRows: rows.map((row) => [row.configKey, row.originalUrl, `Image URL for ${row.assetKey}`]),
    normalizedAssets: rows.reduce((accumulator, row) => {
      accumulator[row.assetKey] = row.normalizedUrl;
      return accumulator;
    }, {}),
    checkedAssets: shouldCheck ? await rows.reduce(async (previous, row) => {
      const accumulator = await previous;
      accumulator[row.assetKey] = await checkAssetUrl(row.normalizedUrl);
      return accumulator;
    }, Promise.resolve({})) : undefined,
    clientScriptImageAssetsSnippet: `    var IMAGE_ASSETS = {\n${imageAssetSnippet}\n    };`
  }, null, 2));
}

main().catch((error) => {
  console.error(error && error.stack ? error.stack : error);
  process.exitCode = 1;
});
