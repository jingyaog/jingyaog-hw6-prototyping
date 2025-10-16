import random
import time
from typing import Dict


class SimulatedAPIClient:
    """Simulated API client for job management."""

    def __init__(self):
        self.jobs: Dict[str, Dict] = {}

    def create_job(self, filename: str) -> Dict:
        """
        Simulate creating a job via POST /jobs.
        Returns a job_id and initial status.
        """
        job_id = f"job_{int(time.time())}_{random.randint(1000, 9999)}"

        # Simulate some jobs failing randomly
        initial_status = random.choice(["pending", "pending", "pending", "processing"])

        self.jobs[job_id] = {
            "job_id": job_id,
            "filename": filename,
            "status": initial_status,
            "progress": 0
        }

        # Simulate network delay
        time.sleep(0.1)

        return {
            "job_id": job_id,
            "status": initial_status,
            "filename": filename
        }

    def get_job_status(self, job_id: str) -> Dict:
        """
        Simulate getting job status via GET /jobs/{job_id}.
        Simulates job progression through states.
        """
        if job_id not in self.jobs:
            # If job doesn't exist in memory, simulate it exists
            # This handles cases where we restart the CLI
            status = random.choice(["pending", "processing", "completed", "failed"])
            return {
                "job_id": job_id,
                "status": status,
                "progress": 100 if status == "completed" else random.randint(0, 100)
            }

        job = self.jobs[job_id]

        # Simulate job progression
        if job["status"] == "pending":
            # 30% chance to move to processing
            if random.random() < 0.3:
                job["status"] = "processing"
                job["progress"] = 10

        elif job["status"] == "processing":
            # Increment progress
            job["progress"] = min(100, job["progress"] + random.randint(10, 30))

            if job["progress"] >= 100:
                # 80% chance of success, 20% chance of failure
                if random.random() < 0.8:
                    job["status"] = "completed"
                else:
                    job["status"] = "failed"

        # Simulate network delay
        time.sleep(0.1)

        return {
            "job_id": job["job_id"],
            "status": job["status"],
            "progress": job["progress"]
        }

    def retry_job(self, job_id: str) -> Dict:
        """
        Simulate retrying a failed job via POST /jobs/{job_id}/retry.
        """
        if job_id in self.jobs:
            self.jobs[job_id]["status"] = "pending"
            self.jobs[job_id]["progress"] = 0

        # Simulate network delay
        time.sleep(0.1)

        return {
            "job_id": job_id,
            "status": "pending",
            "message": "Job retry initiated"
        }


# Global API client instance
api_client = SimulatedAPIClient()
