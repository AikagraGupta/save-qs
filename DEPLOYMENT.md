# Deploying SAVE

- Production: https://save-accessible-qs.vercel.app
- Private GitHub repository: https://github.com/AikagraGupta/save-qs
- Vercel project: `aikagras-projects/save-accessible-qs`

The repository root is the Vercel project root. No monorepo root-directory setting is needed.

## Vercel settings

- Framework: Vite
- Node.js: 24.x
- Install: `npm ci`
- Build: `npm run build`
- Output: `dist`
- Production branch: `main`

These build settings are tracked in `vercel.json` and `package.json`. GitHub Actions runs the test suite and production build on pushes and pull requests. The Vercel Git integration deploys production from `main` and creates previews for other branches. GitHub checks and Vercel builds are independent unless a deployment gate is explicitly configured in Vercel.

To deploy manually from a fresh clone:

```sh
npm ci
npm test
npm run build
npx vercel link
npx vercel --prod
```

## ElevenLabs

The default Agent ID is a public identifier. A different agent can be selected in Project settings or through the build-time environment variable `VITE_ELEVENLABS_AGENT_ID`. Values prefixed with `VITE_` are shipped to the browser: never put an API key in one.

Add the exact production hostname to the agent's ElevenLabs Security allowlist. A new custom domain or preview deployment may require an additional allowed hostname. Domain restrictions are enforced by ElevenLabs; deploying the frontend alone does not update the agent configuration. Microphone access needs HTTPS and browser permission. Agent chat tests the same client tools without using the microphone.

There is no ElevenLabs API key in this repository or the Vercel browser bundle. Agent administration takes place in ElevenLabs, outside the app.

## Moving existing records

Browser storage is separated by origin. On the previous website, open Project settings and download a JSON project backup. On the Vercel website, use Import register / restore backup to restore it. This preserves uploaded images, assessments, history, variations and project details. The original website is not changed by deploying this version.

## Operating scope

This is a usable single-browser review app. It has no server database, shared project synchronization, reviewer authentication, automatic photo interpretation or automatic extraction from raw BQ PDFs. It accepts a prepared register and stores data in IndexedDB. The Vercel website does not inherit the previous host's ChatGPT sign-in. Use Vercel deployment protection when private page access is required.

PDFs and CSVs are draft gross assessments for countable units, not payment certificates. Variations are tracked separately and excluded from the calculation. JSON backups preserve all uploaded evidence; the PDF annex is limited to the first 20 photographed item records and two uploaded images per record.

## Deployment verification — 23 October 2026

All 18 tests and the production build passed locally and in GitHub Actions. The production hostname returned HTTP 200 with the configured security headers. A live ElevenLabs text session connected from the Vercel hostname and called `get_claim_difference`, returning the actual HK$100,000 assessed value and five pending records. The production hostname was added to the agent allowlist while preserving the earlier hostname and local development entries. Microphone audio was not captured during this verification.
