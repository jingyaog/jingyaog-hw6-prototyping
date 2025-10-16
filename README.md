# Django HTMX Job Upload System

A Django application that demonstrates file upload job management with real-time status updates using HTMX.

## Features

- Multiple file upload support
- Real-time job status tracking with HTMX polling (updates every 2 seconds)
- Job status indicators: Pending, Processing, Completed, Failed, Cancelled
- Retry failed/cancelled jobs
- Cancel pending/processing jobs
- SQLite database for job persistence
- Clean, responsive UI with no page refreshes

## Project Structure

```
.
├── config/                 # Django project settings
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── jobs/                   # Main application
│   ├── models.py          # Job model with status tracking
│   ├── views.py           # Views for upload, status, retry, cancel
│   ├── urls.py            # URL routing
│   └── admin.py           # Django admin configuration
├── templates/
│   ├── base.html          # Base template with HTMX and styles
│   └── jobs/
│       ├── index.html     # Main page with upload form
│       └── partials/
│           ├── job_table.html  # Full job table
│           └── job_row.html    # Individual job row
├── manage.py
└── requirements.txt

```

## Setup Instructions

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Run Database Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 3. Create Superuser (Optional)

To access the Django admin panel:

```bash
python manage.py createsuperuser
```

### 4. Run the Development Server

```bash
python manage.py runserver
```

### 5. Access the Application

- Main application: http://127.0.0.1:8000/
- Admin panel: http://127.0.0.1:8000/admin/

## How It Works

### File Upload (POST /jobs)

1. Select multiple files using the file input
2. Click "Upload Files"
3. HTMX sends a POST request to `/jobs` with the files
4. Server creates Job records with status "pending"
5. Background processing begins (simulated with threading)
6. Updated job table is returned and displayed

### Status Polling

- HTMX polls `/jobs/table` every 2 seconds
- Server returns the updated job table
- UI automatically updates with latest statuses

### Job Actions

**Retry Button** (visible on failed/cancelled jobs):
- POST to `/jobs/<job_id>/retry`
- Sets status to "pending" and increments retry count
- Restarts processing

**Cancel Button** (visible on pending/processing jobs):
- POST to `/jobs/<job_id>/cancel`
- Sets status to "cancelled"
- Stops further processing

### Job Status Flow

```
pending → processing → completed
                    ↘ failed

(any status) → cancelled (via cancel button)
failed/cancelled → pending (via retry button)
```

## API Endpoints

- `GET /` - Main page with upload form and job table
- `POST /jobs` - Upload files and create jobs
- `GET /jobs/table` - Get updated job table (polling endpoint)
- `GET /jobs/<uuid>` - Get single job row
- `POST /jobs/<uuid>/retry` - Retry a job
- `POST /jobs/<uuid>/cancel` - Cancel a job

## Database Schema

**Job Model:**
- `id` (UUID) - Primary key
- `filename` (CharField) - Original filename
- `file` (FileField) - Uploaded file
- `status` (CharField) - Job status (pending/processing/completed/failed/cancelled)
- `created_at` (DateTimeField) - Creation timestamp
- `updated_at` (DateTimeField) - Last update timestamp
- `error_message` (TextField) - Error details for failed jobs
- `retry_count` (IntegerField) - Number of retry attempts

## Technologies Used

- Django 4.2
- HTMX 1.9.10
- SQLite
- Python threading (for simulated background processing)

## Notes

- The current implementation uses Python threading to simulate asynchronous job processing
- In a production environment, use Celery or Django-Q for proper background task management
- Files are stored in the `media/uploads/` directory
- Job processing is simulated with random success/failure (80% success rate)
- Processing time is randomly set between 2-5 seconds per job
