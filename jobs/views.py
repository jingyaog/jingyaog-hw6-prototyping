from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from .models import Job
import time
import random


def index(request):
    """Main page with file upload form and job table"""
    jobs = Job.objects.all()
    return render(request, 'jobs/index.html', {'jobs': jobs})


@require_http_methods(["POST"])
def create_jobs(request):
    """Handle multiple file uploads and create job records"""
    files = request.FILES.getlist('files')

    if not files:
        return HttpResponse('<div class="error">No files uploaded</div>', status=400)

    created_jobs = []
    for uploaded_file in files:
        job = Job.objects.create(
            filename=uploaded_file.name,
            file=uploaded_file,
            status='pending'
        )
        created_jobs.append(job)
        # Simulate async processing by starting some jobs
        process_job(job)

    # Return the updated job table
    jobs = Job.objects.all()
    return render(request, 'jobs/partials/job_table.html', {'jobs': jobs})


def job_table(request):
    """Return updated job table for polling"""
    jobs = Job.objects.all()
    return render(request, 'jobs/partials/job_table.html', {'jobs': jobs})


def job_row(request, job_id):
    """Return a single job row for targeted updates"""
    job = get_object_or_404(Job, id=job_id)
    return render(request, 'jobs/partials/job_row.html', {'job': job})


@require_http_methods(["POST"])
def retry_job(request, job_id):
    """Retry a failed or cancelled job"""
    job = get_object_or_404(Job, id=job_id)

    if job.can_retry():
        job.status = 'pending'
        job.retry_count += 1
        job.error_message = None
        job.save()
        process_job(job)

    return render(request, 'jobs/partials/job_row.html', {'job': job})


@require_http_methods(["POST"])
def cancel_job(request, job_id):
    """Cancel a pending or processing job"""
    job = get_object_or_404(Job, id=job_id)

    if job.can_cancel():
        job.status = 'cancelled'
        job.save()

    return render(request, 'jobs/partials/job_row.html', {'job': job})


def process_job(job):
    """
    Simulate job processing.
    In a real application, this would be handled by a task queue like Celery.
    For this demo, we'll just update the status randomly.
    """
    import threading

    def simulate_processing():
        time.sleep(1)
        job.refresh_from_db()

        if job.status == 'cancelled':
            return

        job.status = 'processing'
        job.save()

        # Simulate processing time
        time.sleep(random.uniform(2, 5))
        job.refresh_from_db()

        if job.status == 'cancelled':
            return

        # Randomly succeed or fail (80% success rate)
        if random.random() < 0.8:
            job.status = 'completed'
        else:
            job.status = 'failed'
            job.error_message = 'Simulated processing error'

        job.save()

    thread = threading.Thread(target=simulate_processing)
    thread.daemon = True
    thread.start()
