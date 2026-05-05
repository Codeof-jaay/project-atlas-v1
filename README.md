# DashHR MVP

Minimal  MVP built with React + Vite + TypeScript + Tailwind.

To run locally:

# For the front end:
- on a bew terminal

```bash
# install
npm install

# dev
npm run dev
```
- on a new terminal:

```bash
# DashHR MVP

Minimal MVP built with React + Vite and a FastAPI backend.

Quick start
-----------

Front-end

```bash
# Install dependencies
npm install

# Run dev server
npm run dev
```

Back-end

```bash
cd Backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Vercel Web Analytics (optional)
-------------------------------

This project includes a small client-side loader for Vercel Web Analytics. To enable analytics for your deployed site:

1. Enable Web Analytics for your project in the Vercel dashboard (Analytics → Enable).
2. Add an environment variable in your Vercel project settings: `VITE_VERCEL_ANALYTICS=true`.
3. Deploy the site to Vercel. After deployment, Vercel exposes the analytics script at `/_vercel/insights/script.js` and the client will load it automatically in production when the env var is set.

Notes:

- The loader only runs in production builds and when `VITE_VERCEL_ANALYTICS` is `true`.
- For frameworks like Next.js you can use the `@vercel/analytics` package which provides a React component; for this Vite-React app a small script is injected into `src/main.jsx`.
- See Vercel docs: https://vercel.com/docs/analytics/quickstart

Project notes
-------------

- Frontend: React + Vite, Tailwind CSS utilities in `styles.css`.
- Backend: FastAPI + SQLModel (see `Backend/`).
- Auth: JWT-based tokens stored in localStorage; helper utilities in `src/utils/auth.js`.
- Routes and pages are in `src/pages`.

If you want me to wire custom events for key actions (e.g., job postings, applications), I can add small helpers to emit events to Vercel Analytics after you enable it.
