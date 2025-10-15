from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from .models import JobStatus


class JobResponse(BaseModel):
    id: str
    status: JobStatus
    files: List[str]
    created_at: datetime
    updated_at: datetime
    error_message: Optional[str] = None
    progress: Optional[int] = None

    class Config:
        from_attributes = True


class CreateJobResponse(BaseModel):
    job_id: str
    status: str
    files: List[str]
