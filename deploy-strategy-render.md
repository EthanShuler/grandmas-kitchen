# Deployment Strategy - Render.com

## Overview
Deploying Grandma's Kitchen to Render.com - a developer-friendly platform with free tier options and simple Git-based deployments.

**Cost**: Free tier available (with limitations), then ~$7/month for always-on services

## Prerequisites
- Render.com account (free signup)
- GitHub repository connected to Render
- Your code pushed to GitHub

## Architecture
```
Render.com
├── Web Service (Backend API - Node.js)
├── Static Site (Frontend - React)
└── PostgreSQL Database
```

## Step 1: Create PostgreSQL Database

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New +** → **PostgreSQL**
3. Configure:
   - **Name**: `grandmas-kitchen-db`
   - **Database**: `grandmas_kitchen`
   - **User**: `kitchen_user`
   - **Region**: Choose closest to your users
   - **Plan**: Free (90 days) or Starter ($7/mo)
4. Click **Create Database**
5. Copy the **Internal Database URL** for later

## Step 2: Deploy Backend API

### Option A: Using render.yaml (Recommended)

Create `render.yaml` in your project root:
```yaml
services:
  - type: web
    name: grandmas-kitchen-api
    env: node
    region: oregon
    plan: free
    buildCommand: cd server && npm install
    startCommand: cd server && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: grandmas-kitchen-db
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
```

### Option B: Manual Setup

1. Click **New +** → **Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `grandmas-kitchen-api`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (spins down after 15 min inactivity) or Starter ($7/mo)

4. Add Environment Variables:
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = (paste Internal Database URL from Step 1)
   - `JWT_SECRET` = (generate a secure random string)
   - `PORT` = `10000` (Render's default)

5. Click **Create Web Service**

### Update server for production

Update `server/package.json`:
```json
{
  "scripts": {
    "start": "tsx src/index.ts",
    "dev": "tsx watch src/index.ts"
  }
}
```

## Step 3: Deploy Frontend

### Option A: Static Site (Recommended for React Router)

1. Click **New +** → **Static Site**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `grandmas-kitchen`
   - **Branch**: `main`
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build/client`

4. Add Environment Variables:
   - `VITE_API_URL` = `https://grandmas-kitchen-api.onrender.com/api`
     (Use your actual backend URL from Step 2)

5. Click **Create Static Site**

### Add Rewrite Rules for SPA

In Render dashboard → your static site → **Redirects/Rewrites**:
```
Source: /*
Destination: /index.html
Action: Rewrite
```

This ensures React Router handles all routes properly.

## Step 4: Initialize Database

After backend deploys, run the schema:

1. Go to your Web Service → **Shell**
2. Run:
```bash
# Connect to database and run schema
psql $DATABASE_URL -f src/db/schema.sql
```

Or add a one-time job to run migrations:
1. Click **New +** → **Background Worker** or **Cron Job**
2. Run: `psql $DATABASE_URL -f server/src/db/schema.sql`

## Step 5: Custom Domain (Optional)

### For Frontend:
1. Go to Static Site → **Settings** → **Custom Domains**
2. Add your domain (e.g., `recipes.yourfamily.com`)
3. Update DNS with provided CNAME

### For Backend:
1. Go to Web Service → **Settings** → **Custom Domains**
2. Add subdomain (e.g., `api.recipes.yourfamily.com`)
3. Update DNS

### Update Frontend Environment:
After adding custom domain, update `VITE_API_URL` to use your custom API domain.

## Complete render.yaml Example

Create this file in your project root for Blueprint deployment:

```yaml
databases:
  - name: grandmas-kitchen-db
    databaseName: grandmas_kitchen
    user: kitchen_user
    plan: free

services:
  # Backend API
  - type: web
    name: grandmas-kitchen-api
    env: node
    region: oregon
    plan: free
    rootDir: server
    buildCommand: npm install
    startCommand: npm start
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: grandmas-kitchen-db
          property: connectionString
      - key: JWT_SECRET
        generateValue: true

  # Frontend Static Site
  - type: web
    name: grandmas-kitchen
    env: static
    rootDir: client
    buildCommand: npm install && npm run build
    staticPublishPath: build/client
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
    envVars:
      - key: VITE_API_URL
        value: https://grandmas-kitchen-api.onrender.com/api
```

## Deploy with Blueprint

1. Push `render.yaml` to your repository
2. Go to Render Dashboard → **Blueprints**
3. Click **New Blueprint Instance**
4. Select your repository
5. Render will automatically create all services

## Add Health Check Endpoint

Add to `server/src/routes/index.ts`:
```typescript
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

## Free Tier Limitations

### Web Services (Free)
- Spins down after 15 minutes of inactivity
- Cold start takes ~30 seconds
- 750 hours/month across all free services

### PostgreSQL (Free)
- **90-day limit** - database deleted after 90 days
- 256 MB storage
- Single connection

### Recommendations
- Use Free tier for development/testing
- Upgrade to Starter ($7/mo) for production to avoid:
  - Cold starts
  - Database expiration

## Starter Plan Costs

| Service | Monthly Cost |
|---------|-------------|
| Web Service (API) | $7 |
| Static Site | Free |
| PostgreSQL Starter | $7 |
| **Total** | **~$14/month** |

## Environment Variables Reference

### Backend (Web Service)
| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | From database internal URL |
| `JWT_SECRET` | Auto-generated or custom |
| `PORT` | `10000` (Render default) |

### Frontend (Static Site)
| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://your-api.onrender.com/api` |

## Automatic Deployments

Render automatically deploys when you push to your connected branch:
- Push to `main` → Production deploy
- Push to feature branch → Preview deploy (if enabled)

## Monitoring & Logs

### View Logs
1. Go to your service
2. Click **Logs** tab
3. View real-time logs

### Metrics
- Available on paid plans
- CPU, Memory, Request counts

## Troubleshooting

### Backend not starting
```bash
# Check logs for errors
# Common issues:
# - Missing environment variables
# - Database connection failed
# - Port not configured correctly
```

### Frontend 404 on refresh
- Ensure rewrite rule is configured: `/* → /index.html`

### Database connection issues
- Use **Internal Database URL** (not External)
- Check if database is still active (free tier expires)

### Cold starts on free tier
- First request after 15 min idle takes ~30 seconds
- Consider upgrading to Starter plan

## Backup Strategy

### Database Backups
Render provides automatic daily backups on paid plans.

For free tier, manually backup:
```bash
# From your local machine
pg_dump $EXTERNAL_DATABASE_URL > backup.sql
```

## Migration from Free to Paid

1. Go to your service → **Settings**
2. Change **Instance Type** to Starter
3. Click **Save Changes**
4. Service will redeploy without downtime

## Comparison: Free vs Starter

| Feature | Free | Starter ($7/mo) |
|---------|------|-----------------|
| Always-on | ❌ | ✅ |
| Cold starts | 30s | None |
| Database | 90 days | Persistent |
| SSL | ✅ | ✅ |
| Custom domain | ✅ | ✅ |
| Auto-deploy | ✅ | ✅ |
