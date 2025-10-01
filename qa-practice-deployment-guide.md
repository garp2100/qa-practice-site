# QA Practice Site — Full Deployment Guide (GCP + Firebase)

This guide walks through setup and deployment of the QA practice site (Node/Express + PostgreSQL + React) to **Google Cloud Platform (Cloud Run + Cloud SQL)** with **Firebase Hosting** for the frontend.

---

## 0. Prerequisites

- Node.js 20+ installed locally
- `gcloud` CLI installed and initialized
- `firebase-tools` CLI installed
- A Google Cloud account with billing enabled

---

## 1. Google Cloud Project Setup

1. **Create a project** in [GCP Console](https://console.cloud.google.com/).
   - Example project ID: `avid-bricolage-473715-s3`.

2. **Enable billing** for the project.

3. **Enable required APIs**:
   ```bash
   gcloud services enable      run.googleapis.com      sqladmin.googleapis.com      artifactregistry.googleapis.com      firebase.googleapis.com
   ```

4. **Set active project**:
   ```bash
   gcloud config set project avid-bricolage-473715-s3
   ```

---

## 2. Cloud SQL (Postgres)

1. Create a Postgres instance:
   ```bash
   gcloud sql instances create qa-practice-sql      --database-version=POSTGRES_16      --tier=db-f1-micro      --region=us-central1
   ```

2. Create DB + user:
   ```bash
   gcloud sql databases create appdb --instance=qa-practice-sql
   gcloud sql users create app --instance=qa-practice-sql --password=MySafePass123
   ```

   > 🔒 Use a simple alphanumeric password to avoid escaping issues.

3. Connect and run schema:
   ```bash
   gcloud sql connect qa-practice-sql --user=app
   \i server/src/schema.sql
   \q
   ```

---

## 3. Artifact Registry

1. Create a repo for container images:
   ```bash
   gcloud artifacts repositories create app-images      --repository-format=docker      --location=us-central1
   ```

---

## 4. Backend (API) Deployment

📂 **Run all commands from `/server` directory**.

1. Export env vars:
   ```bash
   export REGION=us-central1
   export REPO=app-images
   export SERVICE=qa-practice-api
   export INSTANCE=qa-practice-sql
   export GOOGLE_CLOUD_PROJECT=avid-bricolage-473715-s3
   export DBUSER=app
   export DBPASS=MySafePass123
   export DBNAME=appdb
   export CONNECTION=$(gcloud sql instances describe $INSTANCE --format='value(connectionName)')
   export JWT_SECRET=$(openssl rand -hex 32)
   ```

2. Build and push Docker image:
   ```bash
   gcloud builds submit      --tag $REGION-docker.pkg.dev/$GOOGLE_CLOUD_PROJECT/$REPO/api:latest .
   ```

3. Deploy to Cloud Run:
   ```bash
   gcloud run deploy $SERVICE      --image $REGION-docker.pkg.dev/$GOOGLE_CLOUD_PROJECT/$REPO/api:latest      --region $REGION --platform managed --allow-unauthenticated      --add-cloudsql-instances $CONNECTION      --set-env-vars=JWT_SECRET=$JWT_SECRET      --set-env-vars=CORS_ORIGIN=https://qa-practice-client.web.app      --set-env-vars=DATABASE_URL="postgres://$DBUSER:$DBPASS@/$DBNAME?host=/cloudsql/$CONNECTION"
   ```

4. Verify healthcheck:
   ```bash
   curl https://<YOUR_CLOUD_RUN_URL>/api/health
   ```

---

## 5. Frontend (React) Deployment

📂 **Run all commands from `/client` directory**.

1. Find your Cloud Run URL:
   ```bash
   gcloud run services describe qa-practice-api      --region $REGION      --format 'value(status.url)'
   ```

2. Create `.env` in `/client`:
   ```env
   VITE_API_BASE=https://<YOUR_CLOUD_RUN_URL>
   ```

3. Build frontend:
   ```bash
   npm run build
   ```

4. Initialize Firebase (choose Hosting, use existing project `qa-practice-client`):
   ```bash
   firebase init hosting
   # set "public" to "dist"
   # configure as SPA → yes
   ```

   Update `firebase.json`:
   ```json
   {
     "hosting": {
       "public": "dist",
       "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
       "rewrites": [
         { "source": "**", "destination": "/index.html" }
       ]
     }
   }
   ```

5. Deploy:
   ```bash
   firebase deploy --only hosting
   ```

---

## 6. Common Gotchas

- **Firebase “Setup Complete” page** → means you deployed with `public/` instead of `dist/`.
- **DB password errors** → keep it alphanumeric or URL-encode special characters.
- **Cloud Run container not ready** → ensure your server always calls `app.listen` even if DB fails.
- **CORS blocked** → double-check `CORS_ORIGIN` matches your Firebase Hosting URL exactly.

---

## 7. CI/CD (Optional)

Later, set up GitHub Actions or Cloud Build triggers to automatically build & deploy:
- **Client** → Firebase Hosting
- **Server** → Cloud Run via Artifact Registry
