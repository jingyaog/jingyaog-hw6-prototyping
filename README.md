# Job Queue Manager

A full-stack job queue application with real-time updates, built with React (Vite + TypeScript + Material UI) and FastAPI with PostgreSQL.

## Features

- **Drag-and-drop file upload** - Upload multiple files to create jobs
- **Real-time updates** - Live job status updates via WebSocket
- **Job management** - Retry failed/cancelled jobs, cancel pending/processing jobs
- **Progress tracking** - Visual progress indicators for processing jobs
- **Material UI design** - Modern, responsive interface
- **Vercel-ready** - Easy deployment to Vercel for both frontend and backend

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Material UI (MUI)
- react-dropzone
- Axios
- WebSocket

### Backend
- FastAPI
- SQLAlchemy
- PostgreSQL
- WebSockets
- Pydantic

## Project Structure

```
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── FileUpload.tsx
│   │   │   └── JobQueue.tsx
│   │   ├── services/        # API and WebSocket clients
│   │   │   ├── api.ts
│   │   │   └── websocket.ts
│   │   ├── types/           # TypeScript types
│   │   │   └── job.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── vercel.json
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── main.py         # FastAPI application
│   │   ├── database.py     # Database connection
│   │   ├── models.py       # SQLAlchemy models
│   │   ├── schemas.py      # Pydantic schemas
│   │   ├── websocket.py    # WebSocket manager
│   │   └── job_processor.py # Job processing logic
│   ├── requirements.txt
│   └── vercel.json
└── docker-compose.yml      # PostgreSQL for local dev
```

## Local Development

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- Docker (for PostgreSQL)

### Setup

1. **Start PostgreSQL**
   ```bash
   docker-compose up -d
   ```

2. **Backend Setup**
   ```bash
   cd backend

   # Create virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate

   # Install dependencies
   pip install -r requirements.txt

   # Copy environment file
   cp .env.example .env

   # Run the backend
   uvicorn app.main:app --reload --port 8000
   ```

3. **Frontend Setup**
   ```bash
   cd frontend

   # Install dependencies
   npm install

   # Copy environment file
   cp .env.example .env

   # Run the development server
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## API Endpoints

### REST API

- `POST /api/jobs` - Create a new job with file uploads
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/{job_id}` - Get a specific job
- `POST /api/jobs/{job_id}/retry` - Retry a failed/cancelled job
- `POST /api/jobs/{job_id}/cancel` - Cancel a pending/processing job

### WebSocket

- `WS /ws` - WebSocket endpoint for real-time job updates

## Deployment to Vercel

### Frontend Deployment

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy Frontend**
   ```bash
   cd frontend
   vercel
   ```

3. **Set Environment Variables** (in Vercel dashboard)
   - `VITE_API_URL` - Your backend API URL
   - `VITE_WS_URL` - Your backend WebSocket URL

### Backend Deployment

1. **Set up PostgreSQL Database**
   - Option 1: Use Vercel Postgres
   - Option 2: Use external PostgreSQL (e.g., Supabase, Railway, Neon)

2. **Deploy Backend**
   ```bash
   cd backend
   vercel
   ```

3. **Set Environment Variables** (in Vercel dashboard)
   - `DATABASE_URL` - PostgreSQL connection string

### Important Notes for Vercel Deployment

#### WebSocket Limitations
Vercel's serverless functions have a 10-second execution limit and don't support long-lived WebSocket connections. For production use, consider:

1. **Alternative deployment for WebSockets:**
   - Deploy backend to a platform with WebSocket support (Railway, Render, Fly.io)
   - Use Vercel for frontend only

2. **Alternative to WebSockets:**
   - Implement polling instead of WebSocket
   - Use Server-Sent Events (SSE) if supported

3. **Hybrid approach:**
   - Deploy REST API to Vercel
   - Deploy WebSocket server separately
   - Update frontend to connect to different endpoints

### Recommended Production Setup

For a production-ready deployment with full WebSocket support:

1. **Frontend**: Vercel
2. **Backend**: Railway, Render, or Fly.io
3. **Database**: Vercel Postgres, Supabase, or Neon

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000/ws
```

### Backend (.env)
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/jobqueue
USE_SQLITE=false
```

## Job Status Flow

```
PENDING → PROCESSING → COMPLETED
                    ↓
                  FAILED ←→ RETRY
                    ↓
                CANCELLED ←→ RETRY
```

## Mock Job Processing

The backend includes a mock job processor that:
- Simulates work with progress updates (0% → 100%)
- Updates progress every 2 seconds in 20% increments
- Has an 80% success rate, 20% failure rate
- Supports cancellation during processing
- Broadcasts updates via WebSocket

## Development Tips

1. **Database Reset**: Delete the PostgreSQL volume
   ```bash
   docker-compose down -v
   docker-compose up -d
   ```

2. **Use SQLite for Testing**: Set `USE_SQLITE=true` in backend/.env

3. **Hot Reload**: Both frontend and backend support hot reload during development

4. **API Documentation**: FastAPI auto-generates docs at `/docs` and `/redoc`

## License

MIT
