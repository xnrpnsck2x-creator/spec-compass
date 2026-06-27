# Cloud Run Deploy Notes

Spec Compass is designed to run as one Fastify service that serves both API routes and the built Vite frontend.

## Enabled APIs

The event setup uses Google Cloud project `paslap`.

Confirmed enabled APIs:

- `run.googleapis.com`
- `cloudbuild.googleapis.com`
- `artifactregistry.googleapis.com`
- `aiplatform.googleapis.com`
- `generativelanguage.googleapis.com`

## Local production check

```sh
npm run build
PORT=8080 npm run start
curl http://localhost:8080/api/health
```

Expected evidence:

- Fastify listens on `0.0.0.0`.
- The API reads the injected `PORT`.
- `/api/health` returns `status: "ok"`.
- `geminiConfigured` is `true` when either Google Cloud/Enterprise ADC config or `GEMINI_API_KEY` is available.

## Deploy from source

```sh
gcloud run deploy spec-compass \
  --source . \
  --region asia-northeast1 \
  --allow-unauthenticated
```

The repository includes a `Dockerfile`, so Cloud Build can build the container from source.

The runtime image also includes a read-only source snapshot at `/workspace-source`.
Cloud Run sets `SPEC_COMPASS_SCAN_PATH=/workspace-source` so the hosted demo scans the actual project source instead of only built runtime artifacts.

Cloud Run source deploys do not include the `.git` directory in the runtime source snapshot. To keep Project Scan from mislabeling a deployed, committed project as `Git Version Control: Missing`, set these runtime environment variables during deploy:

- `SPEC_COMPASS_GIT_BRANCH`: current branch, for example `main`.
- `SPEC_COMPASS_GIT_COMMIT`: current commit SHA or short SHA.
- `SPEC_COMPASS_GIT_REPOSITORY`: public repository URL.

## Current Deployment

- Project: `paslap`
- Region: `asia-northeast1`
- Service: `spec-compass`
- Service URL: `https://spec-compass-g3pfpanwsq-an.a.run.app`
- Public URL from deploy output: `https://spec-compass-954554519801.asia-northeast1.run.app`

Use `/api/health` for the current live revision and deterministic deployment evidence.

Verified checks:

- `GET /api/health` returned `status: "ok"`, `geminiConfigured: true`, and `deployment.verified: true`.
- Default `POST /api/scan` returned 57 files, 13890 lines, stack evidence, and Cloud Run runtime evidence.
- GitHub URL `POST /api/scan` accepted `https://github.com/octocat/Hello-World` and returned source `octocat/Hello-World#master`.
- Scan report deployment evidence includes service `spec-compass`, current revision, region `asia-northeast1`, URL `https://spec-compass-g3pfpanwsq-an.a.run.app`, and source path `/workspace-source`.
- `POST /api/generate-explanation` returned HTTP 200 with Gemini-backed explanation, diagram, and 10 vocabulary rows.
- `POST /api/translate-copy` returned HTTP 200 with `status: "reviewed"` and `reviewedBy: "gemini"`.
- Browser verification confirmed GitHub source mode, GitHub URL scan flow, visible source `octocat/Hello-World#master`, and no console errors.
- Browser verification confirmed the ordinary-user `老板 + 人体` analogy flow: generated SVG image, localized Chinese explanation, vocabulary layer, Launch Packet revision evidence, and no console/page errors.
- Production dependency audit returned 0 vulnerabilities after upgrading Fastify and `@fastify/static`.

## Gemini configuration

For the event demo, do not hard-code keys in the repo.

Preferred Cloud Run path:

- Enable `aiplatform.googleapis.com` on the Google Cloud project.
- Let Cloud Run use its service account for Google Cloud auth.
- Set `GOOGLE_GENAI_USE_ENTERPRISE=true`.
- Set `GOOGLE_CLOUD_PROJECT=<project-id>`.
- Set `GOOGLE_CLOUD_LOCATION=global` or the chosen supported region.

Fallback path:

- Set `GEMINI_API_KEY` as a Cloud Run environment variable or Secret Manager-backed variable.

After deployment, rerun:

```sh
curl https://SERVICE_URL/api/health
```

Only call the service deployed when a live Cloud Run URL has been captured and `/api/health` succeeds.
