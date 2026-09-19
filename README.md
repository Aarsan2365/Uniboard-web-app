# UniBoard — Digital Campus Notice Board

EE4207 Web Application Development project. A full-stack SPA where Admins post categorized announcements and Students browse/filter/search them, with comments, image attachments, and read receipts.

**Stack:** Vue 3 + Tailwind CSS (frontend) · Node.js + Express (backend) · **MongoDB + Mongoose** (database)

## Setup

### 1. MongoDB
Use either local MongoDB or MongoDB Atlas.

For local MongoDB, the default connection is:
```text
mongodb://127.0.0.1:27017/uniboard
```

For MongoDB Atlas, copy your Atlas connection string into `backend/.env` as `MONGODB_URI`.

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env
# edit .env if needed
npm run dev
```
Backend: `http://localhost:5000`

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend: `http://localhost:5173`

Register an account and choose Admin to test notice management or Student to test the student feed.

## MongoDB collections
- `users` — accounts, roles, and student batch
- `notices` — announcements and optional image paths
- `comments` — comments referencing a notice and user
- `noticereads` — one document per user/notice read receipt

Mongoose `ObjectId` references replace the previous SQL foreign keys. A unique compound index on `(noticeId, userId)` prevents duplicate read receipts.

## API
The existing frontend-compatible REST API is preserved:

| Method | Route | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/notices` | Logged in |
| GET | `/api/notices/:id` | Logged in |
| POST | `/api/notices` | Admin |
| PUT | `/api/notices/:id` | Admin |
| DELETE | `/api/notices/:id` | Admin |
| POST | `/api/notices/:id/read` | Logged in |
| GET | `/api/notices/:id/reads` | Admin |
| GET | `/api/notices/unread-count` | Logged in |
| GET | `/api/notices/:noticeId/comments` | Logged in |
| POST | `/api/notices/:noticeId/comments` | Logged in |
| DELETE | `/api/comments/:id` | Author or Admin |

## Notes
- Passwords are hashed with bcrypt.
- Authentication uses JWT.
- Images are stored locally in `backend/uploads/` and their relative paths are stored in MongoDB.
- Deleting a notice also deletes its related comments and read-receipt documents.
- `sql.sql` has been removed because MongoDB does not require SQL database creation scripts.
