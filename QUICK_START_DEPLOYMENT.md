# Quick Start: Deploy to Vercel + Render (5 Minutes)

Follow these steps in order. Each takes ~1 minute.

## 1️⃣ Get MongoDB Connection String (2 min)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free cluster (or use existing).
3. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/dbname`.
4. **Save this** — you'll paste it into Render in step 3.

## 2️⃣ Deploy Backend to Render (2 min)
1. Go to [render.com](https://render.com) → Sign in.
2. Click **New +** → **Web Service** → Connect GitHub repo.
3. Fill in:
   - **Root Directory**: `evoria-event-booking-app/backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add **Environment Variables** (copy/paste):
   ```
   MONGO_URI = <paste your MongoDB connection string>
   JWT_SECRET = mysupersecretkeychangethis
   JWT_EXPIRES_IN = 7d
   NODE_ENV = production
   CORS_ORIGIN = *
   ADMIN_REGISTER_KEY = myAdminKey123
   ```
5. Click **Create Web Service**.
6. Wait for **Live** status (green).
7. **Copy the URL** (looks like `https://evoria-api.onrender.com`).

## 3️⃣ Deploy Frontend to Vercel (1 min)
1. Go to [vercel.com](https://vercel.com) → Sign in.
2. Click **Add New...** → **Project** → Connect GitHub repo.
3. Add **Environment Variable**:
   - Name: `EXPO_PUBLIC_API_BASE_URL`
   - Value: `https://evoria-api.onrender.com/api` (use YOUR Render URL from step 2)
4. Click **Deploy**.
5. Wait for green status.
6. **Copy your Vercel URL** (looks like `https://evoria-app.vercel.app`).

## ✅ Done!
Your app is live at `https://evoria-app.vercel.app`.

---

## If Images Don't Load
1. Go back to Render dashboard.
2. Edit `CORS_ORIGIN` environment variable to: `https://evoria-app.vercel.app`
3. Save. Service will restart in ~30 sec.
4. Refresh your Vercel app.

---

## Troubleshooting
| Issue | Fix |
|-------|-----|
| Vercel says "Deployment not found" | Check `vercel.json` exists in repo root |
| API calls fail with CORS error | Update backend `CORS_ORIGIN` to your Vercel URL |
| Login doesn't work | Check Render logs for MongoDB connection errors |
| Images are 404 | Restart Render service, then re-upload an event image |

**Questions?** See the full `DEPLOYMENT.md` guide for detailed steps.
