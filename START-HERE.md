# Run UniBoard on Windows

## 1. Prepare this version

Stop old UniBoard terminals with Ctrl+C. Extract this ZIP into a new folder and open that folder in VS Code.

Copy your working backend/.env from the old project into this project's backend folder. Keep your existing MongoDB connection and database name. Copy your old backend/uploads images into the new backend/uploads folder if needed. Also preserve backend/documents if you have already uploaded PDFs in a version that supports them. If no .env exists, copy .env.example and configure MONGODB_URI and a unique JWT_SECRET first.

Do not copy node_modules or frontend/dist from the old version.

## 2. Backend terminal

From the extracted project folder:

```powershell
cd backend
npm ci
npm run dev
```

Wait for MongoDB connected and API listening on port 5000. If the prompt already ends in `\backend>`, run npm commands directly; do not run `cd backend` again.

## 3. Create an administrator if needed

In another terminal in backend:

```powershell
npm run setup-admin
```

Enter a name, email and password when prompted. See ADMIN-SETUP.md. If you already have an admin account in the same database, use its existing email and password.

## 4. Frontend terminal

From the project root:

```powershell
cd frontend
npm ci
npm run dev
```

Open the URL Vite prints. For the default local setup, no frontend .env is needed; remove any outdated API URL overrides.

## 5. Login behavior

- Open the website base address (for example http://localhost:5173) → Student Login.
- Student: select **Create student account**, enter details and confirm the password. After account creation, sign in on Student Login to enter the notice feed.
- Administrator: select **Administrator** on the login screen → Admin Login. Sign in with the account provisioned in step 3 → Notice Feed. Select Create announcement or Admin Panel to manage notices.
- Administrators cannot register through the website. Students cannot enter through Admin Login.
- Refreshing an active dashboard retains a verified session. Opening the website base address or a login page starts a new login flow. Old remembered login details from earlier versions are removed automatically.
- Logout returns to the matching login page. Protected URLs and browser Back cannot grant access without a valid session.

## 6. Check announcements

1. Log in as admin and publish a General notice targeted to All Batches. Wait for the success message.
2. Use another tab to log in as a student. Student and administrator sessions are scoped to their tabs.
3. Check the Notice Feed immediately after login. Use Refresh notices if the feed was already open.
4. Verify save/unsave, comments and mark as read. Admin can inspect Read Receipts.
5. For cohort-only notices, check that the student's academic batch matches the target batch. Students can correct their batch in Settings.
6. To attach a PDF, use PDF attachment (optional) in the admin form. Choose a .pdf up to 5 MB; optionally add a poster image too. Use docs/sample-notice-document.pdf for a demonstration. Students see View PDF and Download PDF on the notice. See docs/PDF-ATTACHMENTS.md for editing and troubleshooting.

See README.md for the full setup and FIXES-AND-TESTS.md for verification.

## 7. Rubric documents

See docs/REQUIREMENTS.md for the requirement mapping and remaining submission tasks. The docs folder contains a report to review, ERD diagrams and sample UI screenshots. GitHub submission and a camera-on demonstration video must be completed by you.
