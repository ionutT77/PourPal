# Deployment Guide for PourPal

This project is set up to be deployed freely using:
- **Frontend**: Vercel (or Netlify)
- **Backend**: Render (Web Service)
- **Database**: Neon.tech (PostgreSQL)
- **Redis**: Upstash (for Channels/WebSockets)

## 1. Prerequisites
- Accounts on [GitHub](https://github.com), [Vercel](https://vercel.com), [Render](https://render.com), [Neon](https://neon.tech), and [Upstash](https://upstash.com).
- Push your project to a GitHub repository.

## 2. Backend Deployment (Render)

### Configuration Changes Used
I have already updated `backend/requirements.txt` and `backend/pourpal/settings.py` to support production:
- Added `daphne`, `dj-database-url`, `psycopg2-binary`, `whitenoise`.
- Configured settings to read `DATABASE_URL`, `REDIS_URL`, `SECRET_KEY`, etc. directly from environment variables.

### Steps
1.  **Create Database (Neon)**:
    - Create a project on Neon.tech.
    - Copy the **Connection String** (Postgres URL).
2.  **Create Redis (Upstash)**:
    - Create a Redis database on Upstash.
    - Copy the **Redis URL** (redis://...).
3.  **Create Web Service (Render)**:
    - Connect your GitHub repo.
    - **Root Directory**: `PourPal/backend`
    - **Build Command**: `pip install -r requirements.txt`
    - **Start Command**: `daphne -b 0.0.0.0 -p 8000 pourpal.asgi:application`
    - **Instance Type**: Free
    - **Environment Variables**:
        - `PYTHON_VERSION`: `3.9.0` (or your local version)
        - `SECRET_KEY`: (Generate a random strong string)
        - `DEBUG`: `False`
        - `DATABASE_URL`: (Paste string from Neon)
        - `REDIS_URL`: (Paste string from Upstash)
        - `ALLOWED_HOSTS`: (Your Render URL, e.g., `pourpal.onrender.com`)
        - `FRONTEND_URL`: (Your Vercel URL, add this after deploying frontend)

## 3. Frontend Deployment (Vercel)

### Configuration Changes Used
I updated `frontend/src/services/api.js` to use `process.env.REACT_APP_API_URL`.
I updated `frontend/src/services/api.js` and all other components to use `API_BASE_URL` (derived from `process.env.REACT_APP_API_URL`). The frontend is now fully ready for deployment.

### Steps
1.  **Import Project (Vercel)**:
    - Connect GitHub repo.
    - Select `PourPal/frontend` as the root directory.
    - Framework: Create React App.
2.  **Environment Variables**:
    - `REACT_APP_API_URL`: `https://your-app-name.onrender.com` (Your Render Backend URL).
      *Note: Do not include trailing slash if not needed, but `api.js` logic expects the host.
3.  **Deploy**.

## 4. Finalizing
- Once Frontend is deployed, copy its URL (e.g., `https://pourpal.vercel.app`).
- Go back to **Render Dashboard** -> Environment Variables.
- Add/Update `FRONTEND_URL` with this value.
- Add `https://pourpal.vercel.app` to `ALLOWED_HOSTS` in Render (comma-separated if multiple).
