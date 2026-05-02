# Deployment Guide: Vercel + Render

This guide walks you through deploying the Evoria app with Vercel (frontend) and Render (backend).

---

## Step 1: Deploy Backend to Render

### 1a. Prepare the Backend
1. Push your code to GitHub (main branch).
2. Ensure `.env` is NOT in git (check `.gitignore`).
3. Create a `.env` file locally with the values from `.env.example`, or just note what env vars you'll set in Render.

### 1b. Create a Render Web Service
1. Go to [render.com](https://render.com) and sign in.
2. Click **New +** → **Web Service**.
3. Connect your GitHub repo.
4. Fill in the service details:
   - **Name**: `evoria-api` (or your choice)
   - **Root Directory**: `evoria-event-booking-app/backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free tier is OK for dev/demo.

### 1c. Set Environment Variables
In the Render dashboard, go to **Environment** and add:
   - `MONGO_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A random string (e.g., use `openssl rand -base64 32`)
   - `JWT_EXPIRES_IN`: `7d`
   - `NODE_ENV`: `production`
   - `CORS_ORIGIN`: Leave as `*` for now (you'll restrict it once frontend is deployed)
   - `ADMIN_REGISTER_KEY`: A strong random string
   - `PORT`: Leave blank (Render auto-assigns)

### 1d. Deploy
Click **Create Web Service**. Render will build and deploy. Wait for a green "Live" status.

### 1e. Get Your API URL
Once live, copy the service URL from the Render dashboard. It will look like:
```
https://evoria-api.onrender.com
```
Your API base URL is:
```
https://evoria-api.onrender.com/api
```

**Save this URL — you'll use it in the next steps.**

---

## Step 2: Deploy Frontend to Vercel

### 2a. Prepare the Frontend
1. In your repo, set up environment variables for Vercel.
2. Copy `.env.example` to `.env.local` for local testing:
   ```bash
   cp evoria-event-booking-app/frontend/.env.example evoria-event-booking-app/frontend/.env.local
   ```
3. Update `.env.local` with your Render backend URL:
   ```
   EXPO_PUBLIC_API_BASE_URL=https://evoria-api.onrender.com/api
   ```

### 2b. Create a Vercel Project
1. Go to [vercel.com](https://vercel.com) and sign in.
2. Click **Add New...** → **Project**.
3. Import your GitHub repo.
4. Vercel should detect that you have a `vercel.json` at the root. Confirm the settings:
   - **Framework Preset**: Leave as "Other"
   - **Root Directory**: Leave blank (Vercel will use `vercel.json` instructions)
   - **Build Command**: Should auto-detect from `vercel.json`
   - **Output Directory**: Should auto-detect from `vercel.json`

### 2c. Set Environment Variables
In the Vercel project settings, go to **Settings** → **Environment Variables** and add:
   - **Name**: `EXPO_PUBLIC_API_BASE_URL`
   - **Value**: `https://evoria-api.onrender.com/api` (use your actual Render URL)
   - **Environments**: Check all (Production, Preview, Development)

### 2d. Deploy
Click **Deploy**. Vercel will build and deploy. Wait for a green status.

### 2e. Get Your Frontend URL
Once deployed, Vercel will show your URL (e.g., `https://evoria-app.vercel.app`).

---

## Step 3: Test the Deployed App

1. Open your Vercel frontend URL in a browser.
2. Try logging in or creating an account.
3. Open the browser DevTools → **Console** to check for any API errors.
4. If you see CORS errors, update the backend `CORS_ORIGIN` in Render:
   - Set it to: `https://evoria-app.vercel.app` (replace with your actual Vercel URL)

---

## Step 4: Fix Backend CORS (if needed)

If the frontend can't reach the backend, the CORS origin may be mismatched.

### Backend CORS Configuration
In Render dashboard for your service:
1. Go to **Settings** → **Environment** → **Environment Variables**.
2. Edit or add `CORS_ORIGIN`:
   - For development: `*`
   - For production: Set it to your Vercel frontend URL (e.g., `https://evoria-app.vercel.app`)
   - You can also allow multiple origins: `https://evoria-app.vercel.app,https://www.evoria-app.vercel.app`
3. Save. Render will auto-restart the service.

---

## Step 5: Verify Images Load on Deployed Frontend

1. Log in to the deployed app.
2. Go to **Home** and scroll to events.
3. Open the browser **Network** tab and check if images load from `https://evoria-api.onrender.com/uploads/...`.
4. If images are 404, check that:
   - Uploaded files actually exist on the backend.
   - The backend is serving the `/uploads` static route (it should be).

---

## Troubleshooting

### "Deployment not found" on Vercel
- Make sure `vercel.json` is in the repo root and has correct build/output paths.
- Ensure the frontend folder is at `evoria-event-booking-app/frontend`.

### CORS errors in browser console
- Check that the backend `CORS_ORIGIN` includes your Vercel domain.
- Restart the Render service after changing env vars.

### API requests fail with 500
- Check Render backend logs for errors.
- Make sure `MONGO_URI` is set and the MongoDB cluster is running.

### Images don't load
- Verify that images are saved in the backend `/uploads` folder.
- Check that the backend is running and serving static files.
- Ensure image URLs in API responses match the actual backend domain.

---

## Next Steps (Optional)

- **Custom Domain**: Both Vercel and Render support custom domains.
- **CI/CD**: Set up auto-deploy on push to `main` branch.
- **Monitoring**: Check Render and Vercel dashboards for performance/errors.
- **Database Backups**: Enable automated backups on MongoDB Atlas.

---

## Summary

| Component | Host | URL |
|-----------|------|-----|
| Frontend | Vercel | `https://evoria-app.vercel.app` |
| Backend API | Render | `https://evoria-api.onrender.com/api` |
| Database | MongoDB Atlas | (connection string in env vars) |

After deployment, users can access the app at your Vercel URL, and all API calls will route through Render to the backend.
