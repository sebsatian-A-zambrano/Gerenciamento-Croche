Vercel deployment steps (client only)
=====================================

This project uses Vite for the frontend and an Express/tRPC server for the backend. If you want to deploy the client to Vercel and keep the backend on another host, follow the steps below.

1) Connect the repo to Vercel
 - Log in to Vercel and import the GitHub repository.
 - For the project, set the build command to:
   pnpm run vercel-build
 - Set the output directory to: dist

2) Environment variables
 - If your backend runs on a different host in production, set `VITE_API_BASE_URL` to that backend URL (e.g., https://api.example.com) in Vercel project settings.
 - If you host the backend elsewhere (Railway/Render) or will add serverless functions, ensure `VITE_API_BASE_URL` points to that host;
 - Optionally, set `NODE_ENV=production`.

3) Backend options
 - Optionally host backend on a Node host with persistent disk (recommended) e.g., Railway or Render.
   - Ensure `croche_items.json` remains persisted on the server.
 - Or implement serverless functions in /api to host REST endpoints on Vercel; commit frequency/persistence must be planned if writing to JSON.

4) Deploy
 - Push your branch to GitHub; Vercel will automatically trigger a build.
 - After deployment, open the site and test adding items.

Serverless note
 - If you want the backend and frontend fully on Vercel, you will need to convert the Express routes into serverless functions or Next.js API routes.
 - Keep in mind that `croche_items.json` on Vercel will not be persistent across invocations unless you implement a GitHub commit or an external DB.
