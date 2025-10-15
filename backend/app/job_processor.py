import asyncio
import random
from sqlalchemy.orm import Session
from .models import Job, JobStatus
from .schemas import JobResponse
from .websocket import manager


async def process_job_async(job_id: str, db: Session):
    """
    Mock job processor that simulates work with progress updates
    """
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        return

    try:
        # Update to processing
        job.status = JobStatus.PROCESSING
        job.progress = 0
        db.commit()
        db.refresh(job)
        await manager.send_job_update(JobResponse.from_orm(job))

        # Simulate processing with progress updates
        for progress in range(0, 101, 20):
            # Check if job was cancelled
            db.refresh(job)
            if job.status == JobStatus.CANCELLED:
                await manager.send_job_update(JobResponse.from_orm(job))
                return

            job.progress = progress
            db.commit()
            db.refresh(job)
            await manager.send_job_update(JobResponse.from_orm(job))

            # Simulate work
            await asyncio.sleep(2)

        # Random success or failure for demonstration
        if random.random() > 0.2:  # 80% success rate
            job.status = JobStatus.COMPLETED
            job.progress = 100
        else:
            job.status = JobStatus.FAILED
            job.error_message = "Mock processing error occurred"

        db.commit()
        db.refresh(job)
        await manager.send_job_update(JobResponse.from_orm(job))

    except Exception as e:
        job.status = JobStatus.FAILED
        job.error_message = str(e)
        db.commit()
        db.refresh(job)
        await manager.send_job_update(JobResponse.from_orm(job))


def start_job_processing(job_id: str, db: Session):
    """Start processing a job in the background"""
    asyncio.create_task(process_job_async(job_id, db))
