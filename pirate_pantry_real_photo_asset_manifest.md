# Pirate Pantry Real Photo Asset Manifest

Purpose: collect real PNG/WebP/JPG assets for the C2 Guild Dashboard RPG UI. The app now supports these image keys in `ClientScript.html`; when a key has a public URL or Google Drive sharing link, the UI uses that image instead of the CSS fallback art.

## Drive Folder Setup

- Suggested folder name: `Pirate Pantry Assets`
- Sharing: `Anyone with the link can view`
- Preferred formats: PNG or WebP for transparent cutouts; JPG is fine for food photos
- Recommended size: 512x512 px or larger, square crop when possible
- Style: bright, classroom-safe, high-contrast, simple isolated object photos or polished realistic icons
- Avoid: dark stock photos, busy backgrounds, tiny labels baked into images, watermarks, copyrighted brand logos

## How Links Will Be Used

The app accepts either normal public image URLs or Google Drive file links. Drive links like:

```text
https://drive.google.com/file/d/FILE_ID/view?usp=sharing
```

are converted in the browser to:

```text
https://drive.google.com/thumbnail?id=FILE_ID&sz=w512
```

## Local Link Preparation Helper

Use `scripts/asset-links.template.json` as the starting file. Fill in Drive links or public image URLs, then run:

```text
node scripts/prepare-asset-config.js scripts/asset-links.json
```

To also verify that links respond like images before using them with students, run:

```text
node scripts/prepare-asset-config.js scripts/asset-links.json --check
```

The helper prints:

- missing asset keys
- warnings for Drive folder links or unsupported Drive page links
- Config sheet rows with the correct `asset_*` keys
- normalized image URLs for browser testing
- optional image-response checks when `--check` is used
- a paste-ready `IMAGE_ASSETS` snippet for `ClientScript.html` if you want client-side links instead of Sheet config rows

Do not commit a personal `asset-links.json` if it contains private/non-public links. The template is safe to commit because it is blank.

## Optional Public Image Candidate Helper

If a Drive asset folder is not ready yet, `scripts/find-public-asset-candidates.js` can search Wikimedia Commons for real-image candidates:

```text
node scripts/find-public-asset-candidates.js --keys optionBread,optionDNA --per-key 3
```

For long runs, run in resume mode so you can continue across multiple calls without re-querying finished keys:

```text
node scripts/find-public-asset-candidates.js --per-key 3 --resume-from output/asset-candidates/public-asset-candidates.json --skip-filled
```

If a key already has one or more candidates in the resume file, it is skipped. Pair this with smaller `--keys` slices or a higher `--delay-ms` + `--retries` as needed:

```text
node scripts/find-public-asset-candidates.js --keys optionBread,optionDNA --resume-from output/asset-candidates/public-asset-candidates.json --skip-filled --continue-on-error --out output/asset-candidates/public-asset-candidates-partial.json --html output/asset-candidates/public-asset-candidates-partial.html --quiet
```

To create a browsable review gallery:

```text
node scripts/find-public-asset-candidates.js --per-key 2 --delay-ms 1200 --retries 3 --continue-on-error --out output/asset-candidates/public-asset-candidates.json --html output/asset-candidates/public-asset-candidates.html --quiet
```

The search terms live in `scripts/asset-search-terms.json`. This helper is intentionally review-first: it prints candidate URLs, thumbnail URLs, license labels, artist/credit fields, and descriptions, but it does not approve or write them into the app. It also filters out SVG/GIF files, obvious people/context photos, and weak matches that do not mention a meaningful asset keyword. Before using any candidate:

- reject images with people, watermarks, text labels, brand logos, cluttered backgrounds, or confusing biology content
- prefer public domain or simple attribution-compatible images
- paste only approved image URLs into `scripts/asset-links.json`
- run `node scripts/prepare-asset-config.js scripts/asset-links.json --check`

## Current Question-Bank Coverage

Every answer option currently seeded in `SeedData.gs` maps to one of the asset keys below. Some classroom clue labels intentionally reuse a broader visual asset so the upload list stays manageable:

- `Fats`, `Long-term energy`, `Long-term energy storage`, `Insulation`, and `Protection` reuse the butter/lipid visual.
- `Makes enzymes`, `Makes antibodies`, `Enzymes`, `Antibodies`, `Build muscle`, and `Builds muscle` reuse the amino-acid/protein-building visual.
- `DNA and RNA`, `Genetic information`, and `Instructions for proteins` reuse the DNA visual.
- `Immediate energy` reuses the pasta/quick-energy visual.

## Priority Asset List

| Asset key | Config key | Suggested file name | Used for |
| --- | --- | --- | --- |
| `landingChest` | `asset_landing_chest` | `landing_chest.png` | Landing screen pirate prop |
| `landingBottleGreen` | `asset_landing_bottle_green` | `landing_bottle_green.png` | Landing screen biology/potion prop |
| `landingBottleBlue` | `asset_landing_bottle_blue` | `landing_bottle_blue.png` | Landing screen biology/potion prop |
| `landingCompass` | `asset_landing_compass` | `landing_compass.png` | Landing screen compass prop |
| `optionCarbohydrates` | `asset_option_carbohydrates` | `macro_carbohydrates.png` | Carbohydrates answer tile |
| `optionLipids` | `asset_option_lipids` | `macro_lipids.png` | Lipids answer tile |
| `optionProteins` | `asset_option_proteins` | `macro_proteins.png` | Proteins answer tile |
| `optionNucleicAcids` | `asset_option_nucleic_acids` | `macro_nucleic_acids.png` | Nucleic acids answer tile |
| `optionBread` | `asset_option_bread` | `food_bread.png` | Bread and bread/pasta examples |
| `optionPasta` | `asset_option_pasta` | `food_pasta.png` | Pasta and quick-energy examples |
| `optionSugars` | `asset_option_sugars` | `food_sugar_cubes.png` | Sugars answer tile |
| `optionButter` | `asset_option_butter` | `food_butter.png` | Butter, fats, lipids, energy-storage examples |
| `optionOil` | `asset_option_oil` | `food_oil.png` | Oil/fats answer tile |
| `optionMeat` | `asset_option_meat` | `food_meat.png` | Meat/protein example |
| `optionNuts` | `asset_option_nuts` | `food_nuts.png` | Nuts/protein example |
| `optionSimpleSugars` | `asset_option_simple_sugars` | `building_block_simple_sugars.png` | Simple sugars building block |
| `optionFattyAcids` | `asset_option_fatty_acids` | `building_block_fatty_acids.png` | Fatty acids building block |
| `optionAminoAcids` | `asset_option_amino_acids` | `building_block_amino_acids.png` | Amino acids, enzymes, antibodies, muscle |
| `optionNucleotides` | `asset_option_nucleotides` | `building_block_nucleotides.png` | Nucleotides building block |
| `optionDNA` | `asset_option_dna` | `dna.png` | DNA, DNA/RNA, genetic information |
| `optionRNA` | `asset_option_rna` | `rna.png` | RNA answer tile |
| `optionCarbon` | `asset_option_carbon` | `element_carbon.png` | Carbon element tile |
| `optionHydrogen` | `asset_option_hydrogen` | `element_hydrogen.png` | Hydrogen element tile |
| `optionOxygen` | `asset_option_oxygen` | `element_oxygen.png` | Oxygen element tile |
| `optionNitrogen` | `asset_option_nitrogen` | `element_nitrogen.png` | Nitrogen element tile |
| `optionPhosphorus` | `asset_option_phosphorus` | `element_phosphorus.png` | Phosphorus element tile |

## Nice-To-Have Assets

- `pirate_pantry_crest.png`: larger crest/logo for the landing title and header, if we decide to replace the CSS PP badge.
- `quest_complete_banner.png`: final screen celebration banner.
- `review_book.png`: toolkit/review chart icon.
- `save_chest.png`: save/recover icon.

## Implementation Note For The Next Pass

Once the Drive links exist, paste them into the Config sheet using the config keys above, paste them into the `IMAGE_ASSETS` map in `ClientScript.html`, or expose the same key/value map from Apps Script as `appData.assets` or `appData.config.assets`. No game mechanics, scoring, storage keys, or `google.script.run` calls need to change for the image swap.

The safest live path is:

1. Upload image files into the shared Drive folder.
2. Copy each individual file link into a local `scripts/asset-links.json`. Do not paste the folder link into an asset slot.
3. Run `node scripts/prepare-asset-config.js scripts/asset-links.json --check`.
4. Fix any missing/private/non-image links reported by the helper.
5. Paste the generated Config sheet rows into the connected Google Sheet.
6. Push/deploy code only after the local browser screenshots look right.
