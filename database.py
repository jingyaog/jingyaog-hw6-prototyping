import sqlite3
from datetime import datetime
from typing import List, Optional, Tuple
from contextlib import contextmanager


DB_PATH = "jobs.db"


@contextmanager
def get_db():
    """Context manager for database connections."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()


def init_db():
    """Initialize the database with the jobs table."""
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS jobs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                job_id TEXT UNIQUE NOT NULL,
                filename TEXT NOT NULL,
                status TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                retry_count INTEGER DEFAULT 0
            )
        """)
        conn.commit()


def insert_job(job_id: str, filename: str, status: str = "pending") -> int:
    """Insert a new job into the database."""
    now = datetime.now().isoformat()
    with get_db() as conn:
        cursor = conn.execute(
            """
            INSERT INTO jobs (job_id, filename, status, created_at, updated_at, retry_count)
            VALUES (?, ?, ?, ?, ?, 0)
            """,
            (job_id, filename, status, now, now)
        )
        conn.commit()
        return cursor.lastrowid


def update_job_status(job_id: str, status: str):
    """Update the status of a job."""
    now = datetime.now().isoformat()
    with get_db() as conn:
        conn.execute(
            "UPDATE jobs SET status = ?, updated_at = ? WHERE job_id = ?",
            (status, now, job_id)
        )
        conn.commit()


def increment_retry_count(job_id: str):
    """Increment the retry count for a job."""
    now = datetime.now().isoformat()
    with get_db() as conn:
        conn.execute(
            "UPDATE jobs SET retry_count = retry_count + 1, updated_at = ? WHERE job_id = ?",
            (now, job_id)
        )
        conn.commit()


def get_all_jobs() -> List[sqlite3.Row]:
    """Get all jobs from the database."""
    with get_db() as conn:
        cursor = conn.execute(
            "SELECT * FROM jobs ORDER BY created_at DESC"
        )
        return cursor.fetchall()


def get_job(job_id: str) -> Optional[sqlite3.Row]:
    """Get a specific job by job_id."""
    with get_db() as conn:
        cursor = conn.execute(
            "SELECT * FROM jobs WHERE job_id = ?",
            (job_id,)
        )
        return cursor.fetchone()


def get_failed_jobs() -> List[sqlite3.Row]:
    """Get all jobs with failed status."""
    with get_db() as conn:
        cursor = conn.execute(
            "SELECT * FROM jobs WHERE status = 'failed' ORDER BY created_at DESC"
        )
        return cursor.fetchall()
