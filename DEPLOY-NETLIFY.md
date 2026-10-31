# UniBoard — Netlify deployment

This archive updates the uploaded GitHub commit `9d616cb151327c43cff1f323a97b1e0c468bac6b`.
It contains both the frontend and the backend. It has been tested locally, not deployed to your Netlify/Atlas accounts by this assistant.

## 1. Copy the corrected code into your existing Git checkout

Back up your project first. Extract this archive to `D:\WEB\UniBoard-Netlify`.
The directory containing `backend`, `frontend`, `netlify` and `netlify.toml` is the project root.
Your earlier Git checkout was `D:\WEB\UniBoard-GitHub`. Keep its `.git` directory and local `.env`.

In PowerShell:

```powershell
cd D:\WEB\UniBoard-GitHub
git status
git pull --ff-only
```

If pull fails or reports conflicts, stop and resolve them before copying. If Git shows local edits, back them up first.
Then copy the contents of the corrected project root into the Git checkout, merging folders and replacing matching code files.
Copy all source/config files, including the new `netlify` folder and `.node-version`; do not copy or delete `.git`, `.env`, `node_modules`, old uploads or documents.
Do not place the ZIP itself or its outer directory inside the repository.

Optional guarded copy command (adjust only the source path if your extraction location differs):

```powershell
$fixedSource = 'D:\WEB\UniBoard-Netlify\Uniboard-web-app-main'
$repoTarget = 'D:\WEB\UniBoard-GitHub'
if (!(Test-Path "$fixedSource\netlify\functions\api.js")) { throw 'Wrong extraction path: api.js is missing.' }
if (!(Test-Path "$repoTarget\.git")) { throw 'Target is not the Git checkout.' }
robocopy $fixedSource $repoTarget /E /XD .git node_modules dist uploads documents logs pdfjs /XF ".env*" "*.log"
if ($LASTEXITCODE -ge 8) { throw 'Copy failed. Check the robocopy output.' }
Copy-Item "$fixedSource\backend\.env.example" "$repoTarget\backend\.env.example" -Force
cd $repoTarget
git status
git add .
git diff --cached --name-only
```

Before committing, confirm no `.env`, passwords, `node_modules`, generated PDF.js assets or uploaded personal files are staged. Then:

```powershell
git commit -m "Deploy UniBoard API and persistent attachments on Netlify"
git push origin main
```

GitHub edits can trigger a deployment immediately. It may return 503 until the environment below is configured; redeploy after setting it.

## 2. Netlify project settings

Use your existing project `loquacious-nasturtium-846b67`, connected to this GitHub repository, branch `main`.
Keep Base directory and Package directory empty. The root `netlify.toml` supplies:

- Build: `npm --prefix backend ci --omit=dev && npm --prefix frontend ci --include=dev && npm --prefix frontend run build`
- Publish: `frontend/dist`
- Functions: `netlify/functions`
- Node: 24
- API `/api/*`, public image `/uploads/*` and blocked private document `/documents/*` routes before the Vue fallback.

Do not keep an overriding UI build command or base directory pointing only to `frontend`. Follow the config file if the UI displays it as the source of these settings.
Do not use `npm start` as a Netlify start command; the Functions platform invokes `api.js`.
Do not set `VITE_API_URL` or `VITE_API_ORIGIN` to localhost. Remove obsolete values; same-origin `/api` is the default.

## 3. Set private environment variables in Netlify

Project overview -> Environment variables -> Add variable.
Select the Functions scope when scopes are offered (or All scopes). Apply to Production; also set appropriate values for Deploy Previews if you test them.
Do not put runtime secrets in `netlify.toml`: its environment section only configures builds.

| Key | Value |
| --- | --- |
| MONGODB_URI | Your working Atlas URI, with the **same database name** as your current working local URI |
| JWT_SECRET | New unique random secret of at least 32 characters |
| JWT_EXPIRES_IN | `1d` |
| NODE_ENV | `production` |
| UPLOAD_STORAGE | `mongodb` |
| FRONTEND_URL | `https://loquacious-nasturtium-846b67.netlify.app` |

Generate a secret on your computer:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Never paste secrets in chat or commit `.env`. Reset any previously exposed database password and update both local and Netlify values.
Use a URI copied from Atlas Connect -> Drivers; replace placeholder credentials without angle brackets, URL-encode special password characters, and preserve the real database name. An omitted database name may mean your old data lives in `test`; inspect the working setup instead of blindly changing it to `uniboard`.

## 4. Atlas access

Keep your Atlas free cluster and existing accounts/data. Use a database user with read/write access to the application database, including index creation.
Netlify's default shared Functions deployment does not supply a dedicated fixed outbound IP. If you do not have a fixed-egress solution, Atlas Network Access can allow `0.0.0.0/0` (access from anywhere). This opens the network gate to the internet, so use a strong unique database password, TLS (the Atlas URI enables it), and a database-scoped user with read/write access only to the application database.
This does not make the database unauthenticated. Do not delete your existing network entries needed for local migration.
Wait for the Atlas network entry to become active before retrying a failed deployment/API.

## 5. Redeploy and verify backend

Netlify -> Deploys -> Trigger deploy -> Deploy project. Verify the build includes a function named `api` under Cloud compute -> Functions (or its Functions view).
After Published, open:

- `https://loquacious-nasturtium-846b67.netlify.app/api/health`
- `https://loquacious-nasturtium-846b67.netlify.app/login`
- `https://loquacious-nasturtium-846b67.netlify.app/admin/login`

Health must return HTTP 200 JSON:

```json
{"status":"UniBoard API is running.","database":"connected"}
```

503 means environment/Atlas configuration needs fixing. An HTML page from `/api/health` means the old SPA-only routing is still deployed. Redeploy the corrected commit and ensure all API rewrites appear before `/*`.

## 6. Existing administrators and attachments

Existing admin/student accounts remain when the same Atlas database is used. Public registration still creates students only.
If no administrator exists, run provisioning **locally**, using `backend/.env` with that same Atlas URI:

```powershell
cd D:\WEB\UniBoard-GitHub\backend
npm ci
npm run setup-admin
```

Enter the admin name/email/password when prompted. This is not a command to run during Netlify builds; no public admin signup route is created.

Old images/PDFs are NOT inside a GitHub source ZIP. To preserve them:

1. Copy your old `backend/uploads` and `backend/documents` files into the Git checkout's corresponding local directories, keeping exact filenames. Do not commit them.
2. Keep `MONGODB_URI` in your local `backend/.env` pointing to the same Atlas database.
3. From that local backend directory run:

```powershell
npm ci
npm run migrate-uploads
```

The migration copies files referenced by notices into `noticeFiles.files` / `noticeFiles.chunks` in Atlas. It keeps notice paths and original local files; rerunning skips already-stored files.
Check the printed counts: `missingLocalFile` requires recovery or admin re-upload; `tooLargeForNetlify` requires compressing/re-uploading files up to 2 MB. It does not delete notices or create new accounts.
New Netlify uploads go to GridFS automatically. No Cloudinary account or additional file-storage provider is required. Files count toward your Atlas storage quota.

## 7. Test the complete workflow

- Register a student and sign in through Student Login.
- Use Admin Login with your existing administrator.
- Post a notice for All Batches with an image and PDF, each up to **2 MiB (2,097,152 bytes)**.
- Check the student feed, image, PDF canvas preview/download, comments, bookmarks and read receipts.
- Post for a different batch and confirm it is hidden from unrelated students.
- Edit/replace/remove attachments and delete a notice.
- Close local servers and open the Netlify link on your phone. No tunnel is used.
- When ready for other visitors, use Netlify's **Make public** control. Authentication still protects app data, but image URLs remain public as in your original app.

## Upload and operation limits

On Netlify each file is limited to 2 MiB, at most one image plus one PDF. Together they fit below Netlify's effective ~4.5 MB binary request limit with room for notice text and multipart overhead. Both frontend validation and backend limits enforce this. Local server mode keeps the original 5 MiB limit.
Responses are buffered by serverless-http. Very large legacy files may be rejected with 413; compress/re-upload rather than assuming old 5 MiB attachments always fit. Direct uploads to object storage would be needed to restore larger uploads without this request cap.

Files use temporary disk only while validating, then GridFS for persistence. PDFs still require authentication and audience checks; direct `/documents` URLs stay blocked. Rejected uploads are cleaned up before the function returns. Database connections and pools are reused per warm function. Shared rate-limit counters live in MongoDB and expire through a TTL index.

Production password-reset email delivery is **not configured in your original project**, and this deployment change does not add an email provider. Do not promise emailed reset links until delivery is implemented. Never switch production to development to reveal reset tokens.
Netlify/Atlas free-plan quotas and service availability still apply; this is not a guarantee of unlimited hosting or uptime.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Login page 404 | Publish `frontend/dist`, Node 24 build, Vue fallback |
| Login fails with HTML/API routing message | Correct API rewrites deployed before SPA fallback |
| Function 503 JWT message | Set a unique JWT_SECRET >=32 characters for Functions scope and redeploy |
| Function 503 database message | Same URI/database, correct Atlas database password, encoded special characters, Network Access, active cluster |
| Existing accounts disappear | Wrong database name or cluster in MONGODB_URI |
| Function missing | New `netlify/functions/api.js` committed; build installed backend dependencies |
| Upload 413 | Each attachment <=2 MiB; don't override Netlify build's VITE_ATTACHMENT_MAX_MB=2 |
| Old image/PDF missing | Run migration with the original local files, or edit notice and re-upload |
| Wrong student cannot see notice | Set target batch to All or the student's actual batch |
| 429 | Wait for the rate-limit window; counters are shared across function instances |
| Private site | Use Make public when ready to share |

## Verification and sources

Local verification: full backend test suite; real Lambda-event handler integration with disposable MongoDB; image/PDF binary responses and byte ranges; near-limit combined image/PDF requests; database reconnect; rejection cleanup; role and audience checks; durable rate counters; frontend build with the 2 MiB UI limit; bundled function smoke test.
The account's actual Atlas connection, Netlify deployment, user credentials and public accessibility must still be tested after configuration.

- https://docs.netlify.com/build/frameworks/framework-setup-guides/express/
- https://docs.netlify.com/build/functions/configuration/
- https://docs.netlify.com/build/functions/environment-variables/
- https://docs.netlify.com/build/configure-builds/file-based-configuration/
