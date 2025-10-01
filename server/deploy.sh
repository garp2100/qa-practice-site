#!/bin/bash
set -euo pipefail

# === CONFIGURATION ===
export REGION=us-central1
export REPO=app-images
export SERVICE=qa-practice-api
export INSTANCE=qa-practice-sql
export GOOGLE_CLOUD_PROJECT=avid-bricolage-473715-s3
export DBUSER=app
export DBPASS=MySafePass123   # 🔒 Change if you rotate DB password
export DBNAME=appdb
export CONNECTION=$(gcloud sql instances describe $INSTANCE --format='value(connectionName)')
export JWT_SECRET=${JWT_SECRET:-$(openssl rand -hex 32)}

# === BUILD & PUSH IMAGE ===
echo "📦 Building and pushing Docker image..."
gcloud builds submit \
  --tag $REGION-docker.pkg.dev/$GOOGLE_CLOUD_PROJECT/$REPO/api:latest .

# === DEPLOY TO CLOUD RUN ===
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $SERVICE \
  --image $REGION-docker.pkg.dev/$GOOGLE_CLOUD_PROJECT/$REPO/api:latest \
  --region $REGION --platform managed --allow-unauthenticated \
  --add-cloudsql-instances $CONNECTION \
  --set-env-vars=JWT_SECRET=$JWT_SECRET \
  --set-env-vars=CORS_ORIGIN=https://qa-practice-client.web.app \
  --set-env-vars=DATABASE_URL="postgres://$DBUSER:$DBPASS@/$DBNAME?host=/cloudsql/$CONNECTION"

echo "✅ Deploy complete!"