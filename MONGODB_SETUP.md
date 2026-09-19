# MongoDB Setup

1. Install MongoDB locally, or create a free MongoDB Atlas cluster.
2. Open `backend/.env`.
3. Set `MONGODB_URI`.

Local example:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/uniboard
```

Atlas example:
```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@YOUR_CLUSTER.mongodb.net/uniboard?retryWrites=true&w=majority
```

Then run:
```bash
cd backend
npm install
npm run dev
```

In another terminal:
```bash
cd frontend
npm install
npm run dev
```
