# Notice feed and PDF attachment update — 30 October 2026

## PDF support

- A notice may contain one image, one PDF, both or neither. Title and body remain required. Each attachment has a 5 MB limit.
- The admin form has a separate PDF input, filename/size display and local preview. Keep, replace and remove controls work independently for images and PDFs. Keep PDF undoes a removal before saving.
- Shared notice cards show View PDF and Download PDF on the feed, details, saved notices, events and admin management. PDF.js renders document pages in the app with page navigation and zoom, without depending on a browser PDF plugin. A new-tab link and download remain available.
- The frontend fetches PDF bytes through GET /api/notices/:id/pdf using its current bearer token. The server checks authentication and the notice audience. Tokens are not placed in URLs. PDF files are stored in backend/documents outside public image uploads.
- PDF validation checks MIME type, .pdf filename, size, header and end marker. These checks reject common type mismatches and truncation; they are not a full PDF parser or malware scan.
- Successful replacement, removal and deletion clean up the local PDF. Rejected uploads are removed, while failed edits preserve the existing attachment. Missing files produce readable errors and allow a retry.
- Multer is updated to 2.5.0. Compatible backend dependency fixes were applied; npm audit reported zero backend vulnerabilities at verification time.
- Existing notices require no manual database migration. See docs/PDF-ATTACHMENTS.md. The package includes a labelled sample PDF for trying the feature; it is not inserted into the database automatically.

Use Node.js 22.13+ or 24+. Run npm ci in both backend and frontend after extracting. The dev/build commands prepare matching PDF.js assets locally. Preserve backend/.env, backend/uploads and backend/documents when moving the application.

## Resulting behavior

- Opening the website still shows Student Login, with a separate Admin Login and student-only public registration.
- Both roles now land on Notice Feed immediately after sign-in. Administrators reach the publishing form using Create announcement or Admin Panel. The statistics page is optional under Activity Overview.
- Notices display their attached posters without cropping. A keyboard-accessible full-image dialog supports zoom, dragging, Escape, focus handling and returning to the feed. Missing images leave the notice text readable.
- /notices/:id is a dedicated notice detail route with complete text, image and discussion, protected by the same audience rules as the feed.
- Search and category/audience filters work alongside newest, oldest, title A to Z and title Z to A sorting. The backend validates sort/filter values. Request sequencing prevents a slower old search from overwriting a newer search result.
- Mobile category/audience/sort controls collapse behind Filters, leaving the notice and its image visible earlier on the screen.
- Admin image upload supports a preview and client type/size validation. Updates can keep, replace or remove the current image. Successful replacements/removals/deletions clean up the old local attachment; rejected uploads are removed.
- Notice body length is limited to 10,000 characters on both the form and the model/API.
- Earlier authentication, batch visibility, bookmarking, read receipt, profile, comment and admin provisioning fixes remain included.

## Validation

`backend: npm test` — **9 tests passed, 0 failed**.

The tests use disposable MongoDB instances. They cover authentication/roles, admin setup, complete notice CRUD and audience restrictions, events, images, comments, bookmarks and read receipts. The new feed test checks all four sort options, combined search/category/audience filters, pagination, a dedicated notice read, reconnecting to the same database, image replacement/removal, rejected-upload cleanup, 10,000-character body validation, the 5 MB upload limit and dependent-record deletion.

The PDF test verifies downloaded bytes, inline/download headers, byte ranges, direct-path denial, wrong-batch denial, invalid/empty/truncated/oversized files, duplicate upload fields, rejected-file cleanup, failed-edit preservation, keep/replace/remove/delete, missing files, PDF-only notices and legacy records.

`frontend: npm run build` — **passed**.

Automated Chromium checks against the running application and a temporary database passed 13 scenarios, including:

1. Student registration followed by explicit login, without an automatic registration token.
2. Admin sign-in landing on Notice Feed first, with no admin signup link.
3. Creating text and poster notices and rejecting invalid image types in the form.
4. Student sign-in showing the image feed, complete posters and audience isolation.
5. Searching, category filtering, sorting and resetting empty results.
6. Detail pages, poster zoom/Escape, saved notices, discussion and mark as read.
7. Feed and image viewer layout at 390px phone width.
8. Read receipts, pre-filled editing, preserving an image and cancelling/confirming deletion.
9. Student denial from Admin Panel, login at the website root and no browser JavaScript runtime errors.
10. PDF validation, local admin preview, student download and missing-file retry.
11. PDF controls and rendered pages at 390px phone width.
12. Actual PDF page pixels, multiple pages, zoom and Escape close.
13. PDF keep/replace/remove/delete, image preservation and PDF-only notices.

UI screenshots were captured with sample local accounts and demonstration notices, never the user's actual database. The final desktop and mobile layouts were visually inspected. The report, database diagrams, setup instructions and demo guide have been updated for PDF support. The editable report was rendered and checked at **8 pages**, within the rubric's 10-page limit.

## Rubric evidence and remaining submission work

See docs/REQUIREMENTS.md. The package includes an editable report, detailed/summary ERDs, an editable diagrams.net file, sample UI screenshots and a recording guide. Fill in your name and real repository URL, confirm the student index and review the report before submitting. Your GitHub URL submission and your own camera-on video are still required; they were not created or submitted by this workspace.

## Scope limits

Your existing MongoDB database and Atlas credentials were not used in these tests. Preserve your working backend/.env and both attachment folders when moving to the extracted folder. Password reset email delivery remains a development flow. Attachments use local storage. Notice/related-record deletion is not a multi-document database transaction. The prototype has not been load-tested for a large university deployment. Final marks are determined by the lecturer.
