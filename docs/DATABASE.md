# Database structure

MongoDB contains five collections. Mongoose validates their structure and uses ObjectId references between documents. These references are logical application relationships rather than SQL foreign-key constraints.

| Model | Key fields | Rules |
|---|---|---|
| User | _id ObjectId; name/email/password/role/batch String; reset fields; timestamps | Unique email. Password is a bcrypt hash. Role is admin or student. |
| Notice | _id ObjectId; createdBy ref User; title/body/category/targetBatch/imageUrl/pdfUrl/pdfName/eventLocation String; eventDate Date; timestamps | Required title/body/category/audience/author. Title max 150, body max 10,000, PDF filename max 160, venue max 160. |
| Comment | _id ObjectId; noticeId ref Notice; userId ref User; body String; timestamps | Required parent/author/body; body max 500. Indexed parent and date. |
| SavedNotice | _id ObjectId; noticeId ref Notice; userId ref User; timestamps | Unique compound index on (userId, noticeId). |
| NoticeRead | _id ObjectId; noticeId ref Notice; userId ref User; readAt Date | Unique compound index on (noticeId, userId). |

One user may publish many notices; the API permits only administrators to publish. Each user and each notice can have many comments, saved records and read records. The paired indexes make save/read actions idempotent.

Deleting a notice removes its dependent comments, saves and reads. The delete sequence is not transactional across collections. Image files are stored locally in backend/uploads; imageUrl stores their /uploads/... path. PDF files are stored in backend/documents, outside public static uploads; pdfUrl stores an internal /documents/... path and pdfName stores a safe display/download filename. GET /api/notices/:id/pdf checks authentication and audience before sending the PDF. The raw /documents path is not public. Replacing, removing or deleting an attachment cleans up the old local file. Rejected image/PDF uploads are cleaned up after the failed response.

Each notice may have one image and one PDF, independently optional. Existing notices need no manual database migration: absent PDF fields serialize as pdfUrl null and pdfName an empty string. Keep both attachment folders when moving the application; MongoDB stores metadata rather than the file bytes.

Student visibility is enforced on feed, detail, comment, read and save endpoints. All is a broadcast audience; a numeric year is a cohort. Legacy records with no targetBatch are treated as broadcasts. Users may edit their name and student batch in Settings; they cannot edit their role through the profile API.

ERD files: UniBoard-ERD.svg and .png are detailed diagrams, UniBoard-ERD.drawio is editable in diagrams.net, UniBoard-ERD.mmd is Mermaid source, and UniBoard-ERD-summary.png is the compact report diagram.
