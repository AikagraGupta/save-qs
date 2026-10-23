# SAVE — Accessible QS

A functional browser-based app for evidence submission, door-by-door payment assessment, claim reconciliation, voice-assisted review and export. Deploy it directly from GitHub to Vercel; see [DEPLOYMENT.md](DEPLOYMENT.md) for setup and data migration.

## Run

Use Node.js 24.x, matching Vercel and GitHub Actions.

```sh
npm ci
npm run dev
npm test
npm run build
```

The sample project has 60 uniquely registered doors, 55 claimed, 50 approved and 40 previously certified. Both sample BQ rates are HK$2,000. The opening figures are HK$110,000 claimed, HK$100,000 assessed, HK$80,000 previously certified and HK$20,000 proposed gross movement. Approving D-017 moves the current-period gross value to HK$22,000 and leaves HK$8,000 between claim and assessment.

## Try the full flow

1. Use **Demo walkthrough** or select D-017.
2. Open **Add evidence**. Select the door, upload a JPG/PNG/WebP, record the capture date, observed stage, contributor and note. The new evidence is linked to the record without changing its assessment.
3. Use **Review assessment**. Select the proposed status, enter a reason, check the acknowledgement and confirm.
4. Open **Assessment report**. Export the CSV calculation and PDF assessment pack. The PDF includes uploaded photographs for up to 20 item records and explicitly states its scope.
5. Open **Review history** to see evidence submissions and decisions.
6. Download a JSON project backup to move records and uploaded images to another browser. **Import** validates and restores that backup.

## ElevenLabs

A SAVE agent is configured as the default. Its public ID can be overridden with `VITE_ELEVENLABS_AGENT_ID` at build time or in Project settings. No API keys are in this project.

- **Start voice review** starts a microphone session with ElevenLabs. Browser microphone permission and network connectivity are needed.
- **Connect agent chat** uses the same agent and tools without microphone access. It is useful for verifying tool calling.
- The session ends after five minutes to bound accidental usage. The account's usual ElevenLabs costs and quotas apply.
- The agent receives a structured project summary and the results of requested tools. Uploaded image bytes are not sent by the voice tools. Keep sensitive data out of a demo unless you intend to share its summarized records with ElevenLabs.
- The production hostname must be allowed in ElevenLabs. Preview URLs and custom domains need their own allowlist entries. See [DEPLOYMENT.md](DEPLOYMENT.md).

Client tools are `get_claim_difference`, `show_item_evidence`, `propose_assessment_change`, and `prepare_assessment_report`. They retrieve data, navigate, or prepare a dialog. There is no agent tool that confirms an assessment or issues a payment. The QS must click the visible confirmation.

The app can also work without a connected agent. Local rule-based commands support `Why the difference?`, `Show door 17`, `Approve door 17` and `Prepare report`. These are labelled as local commands, not generative AI. The normal forms and buttons remain available.

## Data import

Use the downloadable CSV template. Required columns:

`door_id,bq_id,description,unit,rate,room,floor,zone,claimed,previously_certified`

One row per unique physical door. `unit` must be `nr`. `claimed` and `previously_certified` are `true`/`false` or `1`/`0`. BQ descriptions and rates must be consistent within a BQ ID. Previously certified units start approved; all other imported units start pending. BQ quantities in this import describe the registered scope, not a separately parsed full contract BQ. The import replaces the browser workspace after an explicit acknowledgement.

## Prototype boundaries

- Project data is saved in IndexedDB in this browser. There is no shared project database, authentication, user roles or tamper-proof audit trail. Vercel does not inherit the previous host’s ChatGPT sign-in. Hosting access controls do not establish the identity of a QS reviewer within a browser.
- Photographs are uploaded and reviewed. Automatic recognition, identity resolution, location mapping and measurement are **not** implemented. The door-to-BQ link is the imported/register mapping. The floor layout is a labelled schematic.
- Sample pictures are original synthetic SVG illustrations and are labelled as such. They are not site observations.
- All assessed units use a binary approved/full-unit basis. Partial stages can be recorded, but no invented stage percentages are applied.
- Valuation is cumulative approved gross value less the previous certified gross value for the same selected scope. Retention, variations, materials on site, deductions and other contract adjustments are excluded. Negative corrections are not silently clamped to zero.
- Variation records can be added and tracked but are excluded from the assessment. Reports are drafts, not certificates or payment instructions.
- Files are stored locally and may be lost if browser storage is cleared. Export a backup before resetting or switching devices.

## Verification

Core tests cover opening reconciliation, approval deltas, duplicate evidence, prior-period correction, missing evidence, quoted CSV imports, duplicate IDs, rate consistency, unsafe links and units, formula-safe CSV output, and decimal-rate arithmetic. Browser checks and live-agent checks are recorded in the task handoff.


## Apple design update

This interface applies [Emil Kowalski’s apple-design skill](https://github.com/emilkowalski/skills/tree/main/skills/apple-design), a design reference rather than an Apple-authored component library. The reusable implementation is in `src/apple-design.css` and `src/apple-motion.js`. It uses system typography (SF on Apple devices), opaque content panels, translucent navigation, size-specific tracking, immediate press feedback, and Motion 14 spring dialog transitions. Reduced motion, transparency, and higher contrast preferences have dedicated fallbacks. SAVE branding and the QS review logic are retained. No Apple assets or proprietary fonts are bundled.


## Functional audit (16 October 2026, Hong Kong)

The browser audit used an isolated workspace with a three-door CSV register at HK$1,234.56 per unit. Project metadata was preserved; the initial current-period gross was zero. A live ElevenLabs agent retrieved those imported values, opened a custom-ID approval proposal, and left the confirmation checkbox unchecked. Human confirmation changed current-period gross to HK$1,234.56. A subsequent tool call retrieved the new figures. Photo upload to an already approved unit retained its value while adding it to the report review queue. A variation of HK$499.99 saved, survived reload, and stayed outside the valuation. PDF, CSV and JSON exports were downloaded and inspected. The PDF retained Chinese project names and notes; non-Latin lines are rendered with browser fonts as images, so those lines are not searchable PDF text. A malformed JSON backup was rejected; a valid restore recovered metadata, two photos, approval, history and the variation after a CSV replacement.

Regression tests also cover database round trips, aborted writes and uncloneable writes preserving existing data. No microphone conversation was recorded during this audit; live text mode exercised the ElevenLabs agent and client tools. Browser-local data, manual photo assessment, prepared CSV BQ links, schematic plans and draft gross valuations remain the prototype boundaries.
