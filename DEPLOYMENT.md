# Deployment Guide

## Quick Start: Deploy to Vercel

### Prerequisites
- Vercel account (free tier works)
- GitHub account (recommended for auto-deployments)
- PostgreSQL database (Vercel Postgres, Supabase, or Railway)

## Option 1: Deploy with Vercel Dashboard (Recommended)

### Step 1: Prepare Your Repository
1. Push your code to GitHub
2. Make sure both `frontend/` and `backend/` directories are in the repository

### Step 2: Deploy Frontend
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variables:
   - `VITE_API_URL`: `https://your-backend.vercel.app/api`
   - `VITE_WS_URL`: Leave empty (see WebSocket notes below)
6. Click "Deploy"

### Step 3: Set Up Database
Choose one of these options:

#### Option A: Vercel Postgres (Recommended for Vercel)
1. In your Vercel project, go to "Storage"
2. Create a new Postgres database
3. Copy the `POSTGRES_URL` connection string

#### Option B: Supabase (Free PostgreSQL)
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from Settings → Database
4. Format: `postgresql://postgres:[password]@[host]:5432/postgres`

#### Option C: Railway (Easy PostgreSQL)
1. Create account at [railway.app](https://railway.app)
2. Create new project → Add PostgreSQL
3. Copy the connection string from the PostgreSQL service

### Step 4: Deploy Backend
1. In Vercel Dashboard, click "Add New" → "Project"
2. Import the same GitHub repository
3. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Output Directory**: `.`
4. Add Environment Variables:
   - `DATABASE_URL`: Your PostgreSQL connection string from Step 3
5. Click "Deploy"

### Step 5: Update Frontend Environment Variable
1. Go to your frontend project in Vercel
2. Settings → Environment Variables
3. Update `VITE_API_URL` to your backend URL (e.g., `https://your-backend.vercel.app/api`)
4. Redeploy frontend

## Option 2: Deploy with Vercel CLI

### Install Vercel CLI
```bash
npm install -g vercel
```

### Deploy Frontend
```bash
cd frontend
vercel --prod
# Follow prompts
```

### Deploy Backend
```bash
cd backend
vercel --prod
# Follow prompts
```

## Important: WebSocket Limitations on Vercel

**Vercel does NOT support persistent WebSocket connections** due to serverless architecture (10-second timeout).

### Solutions:

#### Solution 1: Deploy Backend to WebSocket-Friendly Platform (Recommended)

Deploy backend to a platform that supports WebSockets:

**Railway** (Recommended)
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
cd backend
railway init
railway up

# Add DATABASE_URL in Railway dashboard
```

**Render**
1. Go to [render.com](https://render.com)
2. Create new "Web Service"
3. Connect GitHub repository
4. Root Directory: `backend`
5. Build Command: `pip install -r requirements.txt`
6. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
7. Add Environment Variable: `DATABASE_URL`

**Fly.io**
```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Deploy
cd backend
fly launch
fly deploy
```

Then update frontend `VITE_WS_URL` to point to your new backend.

#### Solution 2: Use Polling Instead of WebSockets

Modify the frontend to poll for updates instead:

1. Remove WebSocket connection in `frontend/src/services/websocket.ts`
2. Add polling in `JobQueue.tsx`:

```typescript
useEffect(() => {
  const interval = setInterval(async () => {
    const data = await jobsApi.getJobs();
    setJobs(data);
  }, 2000); // Poll every 2 seconds

  return () => clearInterval(interval);
}, []);
```

#### Solution 3: Hybrid Deployment

- Frontend: Vercel
- Backend REST API: Vercel
- WebSocket Server: Railway/Render/Fly.io

This requires splitting your backend or running two instances.

## Environment Variables Summary

### Frontend
| Variable | Example | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `https://api.example.com/api` | Backend API URL |
| `VITE_WS_URL` | `wss://api.example.com/ws` | WebSocket URL (optional) |

### Backend
| Variable | Example | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db` | PostgreSQL connection |
| `USE_SQLITE` | `false` | Use SQLite for testing |

## Post-Deployment Checklist

- [ ] Frontend deployed and accessible
- [ ] Backend deployed and accessible
- [ ] Database connected and initialized
- [ ] Environment variables configured
- [ ] CORS settings updated for production domain
- [ ] WebSocket connection working (or polling implemented)
- [ ] Test file upload
- [ ] Test job creation
- [ ] Test retry/cancel actions
- [ ] Monitor logs for errors

## Troubleshooting

### "Failed to fetch" error
- Check CORS settings in `backend/app/main.py`
- Verify `VITE_API_URL` is correct
- Check if backend is accessible

### WebSocket connection failed
- Vercel doesn't support WebSockets - use alternative deployment
- Or implement polling as shown above

### Database connection error
- Verify `DATABASE_URL` format
- For Vercel Postgres, use `POSTGRES_URL` variable
- Check database is accessible from Vercel

### Jobs not processing
- Check backend logs in Vercel dashboard
- Ensure database tables are created
- Verify asyncio tasks are working (may need different approach on serverless)

## Cost Considerations

All these options have free tiers:

- **Vercel**: Free for hobby projects
- **Supabase**: 500MB database free
- **Railway**: $5 free credit monthly
- **Render**: Free tier available
- **Fly.io**: Free tier with limits

## Recommended Production Stack

For best performance and features:

1. **Frontend**: Vercel (free)
2. **Backend**: Railway ($5/month for hobby)
3. **Database**: Railway PostgreSQL (included)

This gives you:
- Fast CDN for frontend
- Full WebSocket support
- Managed PostgreSQL
- Simple deployment
- Auto-scaling
