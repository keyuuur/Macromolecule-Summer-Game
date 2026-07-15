#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const commonsApiUrl = 'https://commons.wikimedia.org/w/api.php';
const defaultTermsPath = path.join(__dirname, 'asset-search-terms.json');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');

  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`Unable to parse JSON from ${filePath}: ${error.message}`);
  }
}

function readResumeInput(filePath) {
  if (!filePath) {
    return null;
  }

  const data = readJson(filePath);

  if (!data || typeof data !== 'object') {
    throw new Error(`Invalid resume payload in ${filePath}: expected a JSON object.`);
  }

  return {
    path: path.resolve(process.cwd(), filePath),
    results: data.results && typeof data.results === 'object' && !Array.isArray(data.results) ? data.results : {},
    errors: data.errors && typeof data.errors === 'object' && !Array.isArray(data.errors) ? data.errors : {},
    searchTerms: data.searchTerms && typeof data.searchTerms === 'object' && !Array.isArray(data.searchTerms) ? data.searchTerms : {}
  };
}

function getArgValue(args, name, fallback) {
  const prefix = `${name}=`;
  const match = args.find((arg) => arg === name || arg.startsWith(prefix));

  if (!match) {
    return fallback;
  }

  if (match === name) {
    const index = args.indexOf(match);
    return args[index + 1] || fallback;
  }

  return match.slice(prefix.length);
}

function hasArg(args, name) {
  return args.includes(name);
}

function hasCandidates(value) {
  return Array.isArray(value) && value.length > 0;
}

function parseKeyFilter(value) {
  if (!value) {
    return null;
  }

  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function ensureParentDirectory(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function cleanMetadataValue(value) {
  return String(value || '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getMetadata(extmetadata, key) {
  const item = extmetadata && extmetadata[key];
  return item && item.value ? cleanMetadataValue(item.value) : '';
}

function toAssetTitle(assetKey) {
  return String(assetKey || '')
    .replace(/^option/, 'Option ')
    .replace(/^landing/, 'Landing ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatSearchTerms(value) {
  return normalizeTermList(value).join(' | ');
}

function getImportantTokens(term) {
  const ignored = {
    photograph: true,
    photo: true,
    picture: true,
    image: true,
    isolated: true,
    white: true,
    background: true,
    real: true,
    food: true
  };

  return String(term || '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 3 && !ignored[token]);
}

function normalizeTermList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || '').trim()).filter(Boolean);
  }

  return String(value || '').trim() ? [String(value).trim()] : [];
}

function getCandidateText(candidate) {
  return `${candidate.title || ''} ${candidate.description || ''}`.toLowerCase();
}

function getRelevanceScore(candidate, tokens) {
  const text = getCandidateText(candidate);
  return tokens.reduce((score, token) => {
    const exact = new RegExp(`\\b${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return score + (exact.test(text) ? 2 : (text.includes(token) ? 1 : 0));
  }, 0);
}

function isUsefulImage(candidate, tokens) {
  const mime = String(candidate.mime || '').toLowerCase();
  const url = String(candidate.url || '').toLowerCase();
  const text = getCandidateText(candidate);

  if (!/^image\/(jpeg|png|webp)$/.test(mime)) {
    return false;
  }

  if (url.includes('.svg') || url.includes('.gif')) {
    return false;
  }

  return !/\b(people|person|man|woman|child|portrait|selfie|crowd|dalajlama|tasting)\b/.test(text)
    && getRelevanceScore(candidate, tokens) > 0;
}

async function fetchJsonWithRetry(url, retries) {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const response = await fetch(url, {
      redirect: 'follow',
      headers: {
        Accept: 'application/json',
        'User-Agent': 'PiratePantryMacromoleculeMatchAssetReview/1.0 (classroom asset candidate review)'
      }
    });

    if (response.ok) {
      return response.json();
    }

    if ((response.status === 429 || response.status >= 500) && attempt < retries) {
      await sleep(1200 * (attempt + 1));
      continue;
    }

    throw new Error(`Wikimedia Commons request failed: ${response.status} ${response.statusText}`);
  }

  throw new Error('Wikimedia Commons request failed after retries.');
}

function dedupeCandidates(candidates) {
  const seen = {};

  return candidates.filter((candidate) => {
    const key = candidate.url || candidate.thumbnailUrl || candidate.title;

    if (!key || seen[key]) {
      return false;
    }

    seen[key] = true;
    return true;
  });
}

async function searchCommonsTerm(term, limit, retries) {
  const url = new URL(commonsApiUrl);
  url.searchParams.set('action', 'query');
  url.searchParams.set('format', 'json');
  url.searchParams.set('origin', '*');
  url.searchParams.set('generator', 'search');
  url.searchParams.set('gsrnamespace', '6');
  url.searchParams.set('gsrsearch', term);
  url.searchParams.set('gsrlimit', String(Math.max(limit * 3, limit)));
  url.searchParams.set('prop', 'imageinfo');
  url.searchParams.set('iiprop', 'url|mime|size|extmetadata');
  url.searchParams.set('iiurlwidth', '512');

  const data = await fetchJsonWithRetry(url, retries);
  const pages = data.query && data.query.pages ? Object.values(data.query.pages) : [];

  return pages
    .map((page) => {
      const info = page.imageinfo && page.imageinfo[0] ? page.imageinfo[0] : {};
      const metadata = info.extmetadata || {};

      return {
        title: page.title || '',
        url: info.url || '',
        thumbnailUrl: info.thumburl || info.url || '',
        mime: info.mime || '',
        width: info.width || null,
        height: info.height || null,
        license: getMetadata(metadata, 'LicenseShortName'),
        artist: getMetadata(metadata, 'Artist'),
        credit: getMetadata(metadata, 'Credit'),
        usageTerms: getMetadata(metadata, 'UsageTerms'),
        description: getMetadata(metadata, 'ImageDescription')
      };
    })
    .filter((candidate) => isUsefulImage(candidate, getImportantTokens(term)))
    .slice(0, limit);
}

async function searchCommons(terms, limit, retries, delayMs) {
  const termList = normalizeTermList(terms);
  const importantTokens = termList.reduce((tokens, term) => tokens.concat(getImportantTokens(term)), []);
  const candidates = [];

  for (let index = 0; index < termList.length; index += 1) {
    if (index > 0 && delayMs > 0) {
      await sleep(delayMs);
    }

    candidates.push.apply(candidates, await searchCommonsTerm(termList[index], limit, retries));
  }

  return dedupeCandidates(candidates)
    .sort((left, right) => getRelevanceScore(right, importantTokens) - getRelevanceScore(left, importantTokens))
    .slice(0, limit);
}

function printUsage() {
  console.log([
    'Usage:',
    '  node scripts/find-public-asset-candidates.js [--keys assetKey1,assetKey2] [--per-key 3] [--terms path] [--out output.json] [--html gallery.html] [--delay-ms 500] [--retries 2] [--resume-from resume.json] [--skip-filled] [--continue-on-error]',
    '',
    'Searches Wikimedia Commons for real-image candidates using scripts/asset-search-terms.json.',
    'Each asset key may map to one search string or an array of search strings.',
    'The output is review-first JSON; do not paste URLs into the app until images and licenses are approved.',
    'Use --resume-from path to seed a previously saved output JSON.',
    'Add --skip-filled to avoid re-querying keys that already have at least one candidate in the resume file.',
    'Use --quiet when writing files and suppressing JSON console output.'
  ].join('\n'));
}

function buildGalleryHtml(data) {
  const generatedAt = new Date().toISOString();
  const sections = Object.keys(data.results).map((assetKey) => {
    const candidates = data.results[assetKey] || [];
    const error = data.errors && data.errors[assetKey] ? data.errors[assetKey] : '';
    const cards = error ? [
      '<article class="empty-card error-card">',
      `  <p><strong>Search error:</strong> ${escapeHtml(error)}</p>`,
      '</article>'
    ].join('\n') : candidates.length ? candidates.map((candidate, index) => [
      '<article class="candidate-card">',
      `  <div class="candidate-rank">Candidate ${index + 1}</div>`,
      `  <img src="${escapeHtml(candidate.thumbnailUrl || candidate.url)}" alt="${escapeHtml(candidate.title)}" loading="lazy">`,
      '  <div class="candidate-body">',
      `    <h3>${escapeHtml(candidate.title || 'Untitled image')}</h3>`,
      `    <p class="license">${escapeHtml(candidate.license || candidate.usageTerms || 'License not reported')}</p>`,
      `    <p><strong>Artist/Credit:</strong> ${escapeHtml(candidate.artist || candidate.credit || 'Not reported')}</p>`,
      candidate.description ? `    <p>${escapeHtml(candidate.description)}</p>` : '',
      '    <div class="links">',
      `      <a href="${escapeHtml(candidate.url)}">Original</a>`,
      `      <a href="${escapeHtml(candidate.thumbnailUrl || candidate.url)}">Thumbnail</a>`,
      '    </div>',
      '  </div>',
      '</article>'
    ].filter(Boolean).join('\n')).join('\n') : [
      '<article class="empty-card">',
      '  <p>No candidates survived the safety/relevance filters for this asset key.</p>',
      '</article>'
    ].join('\n');

    return [
      '<section class="asset-section">',
      '  <header>',
      `    <h2>${escapeHtml(toAssetTitle(assetKey))}</h2>`,
      `    <code>${escapeHtml(assetKey)}</code>`,
      `    <p>${escapeHtml(formatSearchTerms(data.searchTerms && data.searchTerms[assetKey]))}</p>`,
      '  </header>',
      `  <div class="candidate-grid">${cards}</div>`,
      '</section>'
    ].join('\n');
  }).join('\n');

  return [
    '<!DOCTYPE html>',
    '<html lang="en">',
    '<head>',
    '  <meta charset="UTF-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1">',
    '  <title>Pirate Pantry Public Asset Candidates</title>',
    '  <style>',
    '    :root { color-scheme: light; --navy: #082338; --gold: #d9a83f; --paper: #fff8e8; --ink: #102235; --muted: #5e6b75; }',
    '    * { box-sizing: border-box; }',
    '    body { margin: 0; font-family: Georgia, "Times New Roman", serif; background: #082338; color: var(--ink); }',
    '    main { width: min(1180px, calc(100% - 32px)); margin: 0 auto; padding: 28px 0 48px; }',
    '    .hero { border: 2px solid var(--gold); background: var(--paper); padding: 24px; box-shadow: 0 12px 0 rgba(0, 0, 0, .18); }',
    '    h1 { margin: 0 0 8px; font-size: clamp(28px, 4vw, 48px); }',
    '    .hero p { max-width: 760px; margin: 8px 0; font-family: Arial, sans-serif; line-height: 1.5; }',
    '    .warning { border-left: 6px solid #b13b34; background: #fff1ed; padding: 12px 14px; font-weight: 700; }',
    '    .asset-section { margin-top: 22px; border: 2px solid var(--gold); background: var(--paper); }',
    '    .asset-section header { background: var(--navy); color: #fff8e8; padding: 16px 18px; border-bottom: 2px solid var(--gold); }',
    '    .asset-section h2 { margin: 0 0 8px; font-size: 26px; }',
    '    .asset-section code { display: inline-block; margin-bottom: 8px; padding: 4px 8px; border: 1px solid rgba(255,255,255,.35); border-radius: 999px; font-family: Consolas, monospace; }',
    '    .asset-section header p { margin: 0; color: #f5d27d; font-family: Arial, sans-serif; }',
    '    .candidate-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; padding: 16px; }',
    '    .candidate-card, .empty-card { border: 1px solid #d9c590; background: #fffdf7; box-shadow: 0 6px 0 rgba(0,0,0,.16); }',
    '    .candidate-rank { padding: 8px 10px; background: #f2d27d; font: 700 12px Arial, sans-serif; text-transform: uppercase; letter-spacing: .08em; }',
    '    img { width: 100%; aspect-ratio: 4 / 3; object-fit: contain; background: #f7efe0; border-bottom: 1px solid #e2cf9b; }',
    '    .candidate-body { padding: 12px; font-family: Arial, sans-serif; line-height: 1.45; }',
    '    .candidate-body h3 { margin: 0 0 8px; font-family: Georgia, "Times New Roman", serif; font-size: 18px; }',
    '    .candidate-body p { margin: 8px 0; color: var(--muted); }',
    '    .license { color: #166438; font-weight: 800; }',
    '    .links { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }',
    '    a { color: #06395d; font-weight: 800; }',
    '    .empty-card { padding: 16px; font-family: Arial, sans-serif; color: var(--muted); }',
    '    .error-card { border-color: #b13b34; background: #fff1ed; color: #7f241e; }',
    '  </style>',
    '</head>',
    '<body>',
    '  <main>',
    '    <section class="hero">',
    '      <h1>Pirate Pantry Public Asset Candidates</h1>',
    `      <p>Generated ${escapeHtml(generatedAt)} from ${escapeHtml(data.source)}. These are review candidates only.</p>`,
    '      <p class="warning">Do not paste a candidate into the app until the image is visually approved and the license/credit needs are acceptable for classroom use.</p>',
    '    </section>',
    sections,
    '  </main>',
    '</body>',
    '</html>'
  ].join('\n');
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    printUsage();
    return;
  }

  const termsPath = path.resolve(process.cwd(), getArgValue(args, '--terms', defaultTermsPath));
  const terms = readJson(termsPath);
  const selectedKeys = parseKeyFilter(getArgValue(args, '--keys', ''));
  const perKey = Math.max(1, Math.min(10, Number(getArgValue(args, '--per-key', '3')) || 3));
  const delayMs = Math.max(0, Number(getArgValue(args, '--delay-ms', '500')) || 0);
  const retries = Math.max(0, Math.min(5, Number(getArgValue(args, '--retries', '2')) || 0));
  const resumeFromArg = getArgValue(args, '--resume-from', '');
  const skipFilled = hasArg(args, '--skip-filled');
  const outputPath = getArgValue(args, '--out', '');
  const htmlPath = getArgValue(args, '--html', '');
  const quiet = hasArg(args, '--quiet');
  const continueOnError = hasArg(args, '--continue-on-error');
  const resume = resumeFromArg ? readResumeInput(resumeFromArg) : null;
  const keys = selectedKeys || Object.keys(terms);
  const resumeResults = resume ? resume.results : {};
  const resumeErrors = resume ? resume.errors : {};
  const resumeSearchTerms = resume ? resume.searchTerms : {};
  const results = {};
  const errors = {};
  const missingTerms = [];
  const skippedKeys = [];
  let searchedCount = 0;

  for (const key of keys) {
    if (skipFilled && hasCandidates(resumeResults[key])) {
      skippedKeys.push(key);
      results[key] = resumeResults[key];
      if (resumeErrors[key]) {
        errors[key] = resumeErrors[key];
      }
      continue;
    }

    if (!Object.prototype.hasOwnProperty.call(terms, key)) {
      missingTerms.push(key);
      if (Object.prototype.hasOwnProperty.call(resumeResults, key)) {
        results[key] = resumeResults[key];
      }

      if (Object.prototype.hasOwnProperty.call(resumeErrors, key)) {
        errors[key] = resumeErrors[key];
      }

      continue;
    }

    if (searchedCount > 0 && delayMs > 0) {
      await sleep(delayMs);
    }

    try {
      results[key] = await searchCommons(terms[key], perKey, retries, delayMs);
      searchedCount += 1;
    } catch (error) {
      if (!continueOnError) {
        throw error;
      }

      results[key] = [];
      errors[key] = error && error.message ? error.message : String(error);
    }
  }

  const output = {
    source: 'Wikimedia Commons API',
    sourceUrl: commonsApiUrl,
    resumeFrom: resume ? resume.path : '',
    skipFilled,
    termsPath,
    searchTerms: keys.reduce((accumulator, key) => {
      if (Object.prototype.hasOwnProperty.call(terms, key)) {
        accumulator[key] = terms[key];
      } else if (Object.prototype.hasOwnProperty.call(resumeSearchTerms, key)) {
        accumulator[key] = resumeSearchTerms[key];
      }
      return accumulator;
    }, {}),
    perKey,
    delayMs,
    retries,
    missingTerms,
    skippedKeys,
    errors,
    results,
    firstCandidateLinksDoNotUseWithoutReview: Object.keys(results).reduce((accumulator, key) => {
      accumulator[key] = results[key][0] ? results[key][0].thumbnailUrl : '';
      return accumulator;
    }, {})
  };

  if (outputPath) {
    const resolvedOutputPath = path.resolve(process.cwd(), outputPath);
    ensureParentDirectory(resolvedOutputPath);
    fs.writeFileSync(resolvedOutputPath, JSON.stringify(output, null, 2), 'utf8');
  }

  if (htmlPath) {
    const resolvedHtmlPath = path.resolve(process.cwd(), htmlPath);
    ensureParentDirectory(resolvedHtmlPath);
    fs.writeFileSync(resolvedHtmlPath, buildGalleryHtml(output), 'utf8');
  }

  if (!quiet) {
    console.log(JSON.stringify(output, null, 2));
  }
}

main().catch((error) => {
  console.error(error && error.stack ? error.stack : error);
  process.exitCode = 1;
});
