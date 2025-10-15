from fastapi import FastAPI, UploadFile, File, WebSocket, WebSocketDisconnect, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import uuid
from datetime import datetime

from .database import get_db, init_db
from .models import Job, JobStatus
from .schemas import JobResponse, CreateJobResponse
from .websocket import manager
from .job_processor import start_job_processing

app = FastAPI(title="Job Queue API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    init_db()


@app.get("/")
async def root():
    return {"message": "Job Queue API", "status": "running"}


@app.post("/api/jobs", response_model=CreateJobResponse)
async def create_job(
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db)
):
    """
    Create a new job with uploaded files
    """
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")

    # Generate job ID
    job_id = str(uuid.uuid4())

    # Extract file names
    file_names = [file.filename for file in files]

    # Create job in database
    job = Job(
        id=job_id,
        status=JobStatus.PENDING,
        files=file_names,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    db.add(job)
    db.commit()
    db.refresh(job)

    # Start processing in background
    start_job_processing(job_id, db)

    # Send initial update via WebSocket
    await manager.send_job_update(JobResponse.from_orm(job))

    return CreateJobResponse(
        job_id=job.id,
        status=job.status.value,
        files=job.files
    )


@app.get("/api/jobs", response_model=List[JobResponse])
async def get_jobs(db: Session = Depends(get_db)):
    """
    Get all jobs, ordered by creation date (newest first)
    """
    jobs = db.query(Job).order_by(Job.created_at.desc()).all()
    return [JobResponse.from_orm(job) for job in jobs]


@app.get("/api/jobs/{job_id}", response_model=JobResponse)
async def get_job(job_id: str, db: Session = Depends(get_db)):
    """
    Get a specific job by ID
    """
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return JobResponse.from_orm(job)


@app.post("/api/jobs/{job_id}/retry", response_model=JobResponse)
async def retry_job(job_id: str, db: Session = Depends(get_db)):
    """
    Retry a failed or cancelled job
    """
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if job.status not in [JobStatus.FAILED, JobStatus.CANCELLED]:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot retry job with status: {job.status}"
        )

    # Reset job status
    job.status = JobStatus.PENDING
    job.error_message = None
    job.progress = 0
    job.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(job)

    # Start processing again
    start_job_processing(job_id, db)

    # Send update via WebSocket
    await manager.send_job_update(JobResponse.from_orm(job))

    return JobResponse.from_orm(job)


@app.post("/api/jobs/{job_id}/cancel", response_model=JobResponse)
async def cancel_job(job_id: str, db: Session = Depends(get_db)):
    """
    Cancel a pending or processing job
    """
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if job.status not in [JobStatus.PENDING, JobStatus.PROCESSING]:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot cancel job with status: {job.status}"
        )

    # Update job status
    job.status = JobStatus.CANCELLED
    job.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(job)

    # Send update via WebSocket
    await manager.send_job_update(JobResponse.from_orm(job))

    return JobResponse.from_orm(job)


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time job updates
    """
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
