# UniBoard — Digital Campus Notice Board

Vue 3 + Vite + Tailwind CSS frontend, Express/Node.js backend, and MongoDB/Mongoose database.

## Login and registration

- Opening `/` always opens **Student Login**, including when an older version remembered a login.
- `/login` is for students. `/admin/login` is the separate administrator portal.
- Public registration at `/register` creates **student accounts only**. After registration, the student must sign in; registration does not issue a login token.
- No administrator signup page or public administrator registration endpoint exists. Administrators are provisioned from the backend setup command.
- A student cannot sign in through Admin Login. An administrator must use Admin Login. The API checks the account role stored in MongoDB.
- Both login portals open `/feed` first, showing notices and attached images. Administrators use Create announcement or Admin Panel to manage notices. `/dashboard` remains available as Activity Overview.
- Protected routes require the API to verify the session. Changing a cached browser role does not grant administrator access.
- Sessions are stored in sessionStorage for the active tab, rather than permanently remembered in localStorage. Refreshing a protected page keeps a valid active session. Opening the site root or a login page starts a fresh sign-in flow.
- Logout clears the session and returns the user to the correct login portal. Expired sessions require sign-in again.

## Windows setup

Requirements: Node.js 22.13+ or 24+ and npm; a running local MongoDB or an accessible Atlas database. Use a current Chrome, Edge, Firefox or Safari browser.

Extract into a new folder and open it in VS Code. Stop the old frontend/backend first. Preserve your existing `backend/.env`, your old `backend/uploads` images and `backend/documents` PDFs (if present) when moving to this folder. Do not copy node_modules. Run npm ci in both folders to install this version's dependencies.

Backend terminal:

```powershell
cd backend
if (!(Test-Path .env)) { Copy-Item .env.example .env }
notepad .env
```

Set your own MONGODB_URI and JWT_SECRET. Keep the same database name as your existing project to retain accounts and notices. A URI with no database name selects MongoDB's default application database; check your existing collections before changing it. Database authentication credentials are separate from UniBoard student/admin login credentials.

Generate a secret if needed:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Paste the generated value into `JWT_SECRET` in `.env`, then:

```powershell
npm ci
npm run dev
```

Frontend terminal, from the project root:

```powershell
cd frontend
npm ci
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173). The default Vite proxy forwards `/api` and `/uploads` to http://127.0.0.1:5000. No frontend .env is required locally. Remove outdated VITE_API_URL/VITE_API_ORIGIN overrides when moving from an old setup.

## Administrator setup

Run this from `backend` after configuring MongoDB and installing dependencies:

```powershell
npm run setup-admin
```

Enter the administrator's name, email, password (at least 12 characters) and password confirmation. Password input is hidden. Choose your own credentials; the application has no default admin password.

Then open `/admin/login`, or select **Administrator** on the login screen, and sign in. Existing administrators can use their existing credentials without rerunning setup.

The setup command preserves existing administrator passwords. If the email already belongs to a student, it requires explicit confirmation before promotion. Use a distinct administrator email if you want separate student and administrator accounts.

For automated provisioning, `npm run create-admin` also accepts ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD environment variables. ADMIN_PROMOTE=true explicitly promotes an existing named student while preserving that account's password. Clear temporary ADMIN_* environment variables afterwards. Do not place administrator passwords in the repository or distribute them with the ZIP.

See ADMIN-SETUP.md for an example using secure PowerShell password input.

## Existing application features

- Admin notice creation, editing, deletion and read-receipt inspection.
- General, Academic, Exam Schedules, Sports and Events categories.
- Notices targeted to all students or an academic batch (2021–2026).
- Student dashboard, searchable/filterable notice feed and pagination.
- Image attachments (JPEG, PNG, WebP or GIF, at most 5 MB), previews, keep/replace/remove controls, full posters without cropping, and an accessible zoom viewer.
- An optional PDF document alongside the poster, at most 5 MB. Admins can preview, keep, replace or remove it. Students can view pages, navigate and zoom in the built-in PDF.js viewer, or download the original. PDF access requires a current login and the correct notice audience. See docs/PDF-ATTACHMENTS.md.
- Notice detail pages, keyword search, category/audience filters, newest/oldest and title sorting. Mobile filters collapse to leave room for notices.
- Saved notices, comments with ownership checks, unread counts and explicit mark-as-read actions.
- Scheduled events with date/time and location, dashboard counts and recent notices.
- Editable profile name and student batch; responsive layout and light/dark theme.
- Older notices without an explicit audience are treated as broadcasts. Notices explicitly addressed to a different batch remain restricted.

## API

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/register` | Public, creates students only; no login token |
| POST | `/api/auth/login` | Student credentials only |
| POST | `/api/auth/admin/login` | Administrator credentials only |
| GET / PUT | `/api/auth/me` | Authenticated; profile updates cannot set roles |
| POST | `/api/auth/forgot-password` | Public, development reset flow |
| POST | `/api/auth/reset-password/:token` | Valid reset token required |
| GET | `/api/notices`, `/api/notices/:id` | Authenticated, audience-scoped |
| GET | `/api/notices/:id/pdf` or `/api/notices/:id/pdf?download=1` | Authenticated, audience-scoped PDF viewing or download |
| POST / PUT / DELETE | `/api/notices` or `/api/notices/:id` | Administrator only |
| GET | `/api/notices/saved` | Authenticated, personal collection |
| POST / DELETE | `/api/notices/:id/save` | Authenticated, audience-scoped |
| GET | `/api/notices/events/upcoming` | Authenticated, audience-scoped |
| POST | `/api/notices/:id/read` | Authenticated, audience-scoped |
| GET | `/api/notices/unread-count` | Authenticated, audience-scoped |
| GET | `/api/notices/:id/reads` | Administrator only |
| GET / POST | `/api/notices/:noticeId/comments` | Authenticated, audience-scoped |
| DELETE | `/api/comments/:id` | Comment author or administrator |

## Verification and build

From backend, run `npm test`. The tests use temporary MongoDB instances, never your configured application database. The first test run needs internet access to download the MongoDB test binary.

From frontend, run `npm run build`. Once built, `npm start` from backend serves both the API and the frontend at http://localhost:5000. Use Vite dev for normal development; Vite preview is only a frontend preview.

See FIXES-AND-TESTS.md for tested flows and START-HERE.md for a short checklist.

## Rubric documentation

The supplied EC4307 rubric is mapped in docs/REQUIREMENTS.md. The docs folder includes the editable report, detailed and compact ERDs, diagrams.net source, UI screenshots using demonstration data, a database explanation and a demonstration recording guide. Fill in your name and actual GitHub URL in the report, verify your student index, and record your own camera-on video. GitHub submission and the presenter video remain your submission steps.

## Scope

Password reset is a development flow, with links displayed in the development UI/console; production email delivery is not implemented. Uploaded images and PDF documents use local disk storage and must be retained when moving the application. PDF checks validate the type, filename, size, header and end marker; they are not a full document parser or malware scan. Old Events notices require a scheduled date to appear in Upcoming Events. The application and evidence are mapped against the supplied EC4307 rubric; final marks depend on the lecturer's evaluation and your submission/demonstration.
