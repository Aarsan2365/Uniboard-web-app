> **Netlify update (31 October 2026):** See [DEPLOY-NETLIFY.md](../DEPLOY-NETLIFY.md). Netlify uses Express Functions, MongoDB GridFS attachments, and 2 MiB per file. Instructions below describing local uploads/5 MiB remain for local-server mode. Production email reset delivery still requires an email provider.

# PDF attachments

An announcement can contain one poster image, one PDF document, both, or neither. The title and announcement text are still required. The limit is 5 MB for each attachment.

## Publish a PDF

1. Sign in through Admin Login and open Create announcement or Admin Panel.
2. Enter the title, announcement text, category and target batch. Choose All Batches for everyone, or the intended academic year for that cohort.
3. Select a .pdf file using PDF attachment (optional). Its filename and size appear below the input. Preview PDF opens the local document before publishing.
4. Optionally select a poster using the separate image input. The two attachments are independent.
5. Select Post Announcement and wait for the success message.

The form rejects non-PDF filenames, unsupported types, empty files and files over 5 MB. The API independently checks the PDF MIME type, filename, size, header and end marker. These checks reject common mismatches and truncation; they do not fully parse or scan the document. Images retain their existing type and size rules.

## Student viewing and downloading

The feed, saved notices, events and notice detail cards show the PDF filename with View PDF and Download PDF controls. View PDF renders pages inside the app using PDF.js, with Previous, Next and zoom controls. This does not require the browser's PDF plugin. Open PDF in new tab and Download PDF remain available. Close or Escape returns to the notice.

The app fetches PDF bytes through the authenticated API. Only administrators and students permitted to read that notice may retrieve the file. A Batch 2024 student cannot download a Batch 2023 notice's PDF by guessing the notice URL. PDFs are not exposed through the public image folder.

## Edit or delete

- Edit without choosing a new PDF keeps the existing document.
- Select a new PDF to replace the old one after Save Changes succeeds.
- Remove PDF schedules removal; Keep PDF undoes that choice before saving.
- Image and PDF controls work independently. Removing a PDF keeps the poster unless you also remove the image.
- Deleting a notice removes both local attachments and the notice's related records.
- A rejected upload is cleaned up; an unsuccessful edit keeps the previously saved PDF.

## Moving an existing project

Use Node.js 22.13+ or 24+. Preserve backend/.env, backend/uploads and backend/documents if present. Keep the same MongoDB database and database name. Run npm ci in backend and frontend, then start both servers. No additional environment variable or manual database migration is needed for PDF support. The upload middleware dependency has been updated to Multer 2. Frontend dev/build commands prepare the matching PDF.js fonts, character maps and decoders locally; no CDN is required by the viewer.

MongoDB stores the attachment metadata, not the file bytes. If a PDF is missing, copy the original file back into backend/documents with its existing filename, or edit the notice and upload it again. A successful PDF replacement removes the old local file. The viewer displays a readable error when the file cannot be retrieved.

## API fields

POST /api/notices and PUT /api/notices/:id accept multipart form data. image and pdf are separate optional file fields, with at most one file each. removeImage=true and removePdf=true are independent edit flags. Notice JSON includes imageUrl, pdfUrl and pdfName. pdfUrl is an internal storage reference; use the API below rather than linking to that path.

| Endpoint | Result |
|---|---|
| GET /api/notices/:id/pdf | PDF bytes with inline disposition |
| GET /api/notices/:id/pdf?download=1 | PDF bytes with attachment disposition and the stored filename |

Both endpoints require the current bearer token and enforce the notice audience. The frontend retrieves a Blob before creating temporary preview/download links, so the bearer token is not placed in a URL.

Use docs/sample-notice-document.pdf to try the feature. It is clearly labelled demonstration content and is never inserted into your database automatically.
