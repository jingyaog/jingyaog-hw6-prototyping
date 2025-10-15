# Quick Start Guide

Get up and running with the Job Queue Manager in 5 minutes!

## Prerequisites

Make sure you have these installed:
- [Node.js 18+](https://nodejs.org/)
- [Python 3.11+](https://www.python.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

## Local Development Setup

### Automated Setup (macOS/Linux)

```bash
# Make the script executable and run it
chmod +x start-dev.sh
./start-dev.sh
```

Then follow the instructions to start backend and frontend.

### Manual Setup

#### 1. Start PostgreSQL

```bash
docker-compose up -d
```

Verify it's running:
```bash
docker ps
```

#### 2. Setup Backend

Open a new terminal:

```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn app.main:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
```

#### 3. Setup Frontend

Open another terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

You should see:
```
  VITE v5.0.12  ready in XXX ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

#### 4. Open the App

Navigate to: **http://localhost:3000**

## Test the Application

### Test 1: Upload Files

1. Click or drag files into the upload area
2. Click "Upload Files"
3. Watch the job appear in the queue below

### Test 2: Watch Real-time Updates

1. Upload multiple files to create several jobs
2. Watch them progress automatically:
   - Status changes from "PENDING" → "PROCESSING" → "COMPLETED"
   - Progress bar shows 0% → 100%
   - Updates happen in real-time via WebSocket

### Test 3: Retry a Failed Job

1. Wait for a job to fail (20% chance of failure)
2. Click the Retry button (circular arrow icon)
3. Watch it process again

### Test 4: Cancel a Job

1. Upload files to create a new job
2. Quickly click the Cancel button (X icon) while it's processing
3. Status changes to "CANCELLED"

## API Documentation

FastAPI provides interactive API docs:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

Try the endpoints directly from the browser!

## Troubleshooting

### Port Already in Use

If port 3000 or 8000 is taken:

**Frontend:**
```bash
# Edit vite.config.ts and change port
npm run dev -- --port 3001
```

**Backend:**
```bash
uvicorn app.main:app --reload --port 8001
```

### Database Connection Error

```bash
# Stop and restart PostgreSQL
docker-compose down
docker-compose up -d

# Wait a few seconds, then restart backend
```

### Module Not Found Errors

**Backend:**
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

**Frontend:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### WebSocket Not Connecting

1. Check backend is running on port 8000
2. Check browser console for errors
3. Verify proxy settings in `frontend/vite.config.ts`

## Next Steps

### Customize the App

- **Change processing time**: Edit `backend/app/job_processor.py` (look for `asyncio.sleep(2)`)
- **Adjust success rate**: Edit `backend/app/job_processor.py` (look for `random.random() > 0.2`)
- **Modify UI theme**: Edit `frontend/src/App.tsx` (MUI theme configuration)

### Add Features

Ideas for extension:
- File validation (size, type)
- Job priority queue
- Job scheduling
- Email notifications
- User authentication
- File storage (S3, etc.)
- Job history/analytics

### Deploy to Production

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## Project Structure

```
.
├── frontend/              # React app
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── services/     # API & WebSocket
│   │   └── types/        # TypeScript types
│   └── package.json
├── backend/              # FastAPI server
│   ├── app/
│   │   ├── main.py      # API endpoints
│   │   ├── models.py    # Database models
│   │   └── websocket.py # WebSocket manager
│   └── requirements.txt
└── docker-compose.yml    # PostgreSQL
```

## Useful Commands

```bash
# View PostgreSQL logs
docker-compose logs -f

# Reset database
docker-compose down -v
docker-compose up -d

# Backend tests (from backend/ directory)
pytest  # (if you add tests)

# Frontend build
cd frontend && npm run build

# View all jobs (API)
curl http://localhost:8000/api/jobs

# Check backend health
curl http://localhost:8000/
```

## Getting Help

- **Backend Issues**: Check `backend/app/main.py` logs
- **Frontend Issues**: Check browser console (F12)
- **Database Issues**: Run `docker-compose logs postgres`
- **API Questions**: Visit http://localhost:8000/docs

## Stop the Application

```bash
# Stop backend: CTRL+C in backend terminal
# Stop frontend: CTRL+C in frontend terminal

# Stop PostgreSQL
docker-compose down

# Stop and remove all data
docker-compose down -v
```

---

Happy coding! 🚀
