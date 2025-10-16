# Quick Start Guide

Get the Django HTMX Job Upload System running in 3 minutes!

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

## Installation & Setup

### Step 1: Install Django

```bash
pip install -r requirements.txt
```

### Step 2: Set up the Database

```bash
python manage.py makemigrations
python manage.py migrate
```

Expected output:
```
Migrations for 'jobs':
  jobs/migrations/0001_initial.py
    - Create model Job
Running migrations:
  Applying contenttypes.0001_initial... OK
  Applying jobs.0001_initial... OK
  ...
```

### Step 3: Create an Admin User (Optional)

```bash
python manage.py createsuperuser
```

Follow the prompts to create your admin account.

### Step 4: Run the Server

```bash
python manage.py runserver
```

Expected output:
```
Starting development server at http://127.0.0.1:8000/
Quit the server with CONTROL-C.
```

### Step 5: Open Your Browser

Navigate to: **http://127.0.0.1:8000/**

## Using the Application

### Upload Files

1. Click "Choose Files" and select one or more files
2. Click "Upload Files"
3. Watch as jobs are created and processed in real-time

### Monitor Job Status

The job table automatically updates every 2 seconds showing:
- Filename
- Current status (Pending → Processing → Completed/Failed)
- Creation timestamp
- Retry count
- Available actions

### Use Action Buttons

- **Retry**: Available on Failed or Cancelled jobs
  - Resets the job to Pending status
  - Increments retry counter
  - Restarts processing

- **Cancel**: Available on Pending or Processing jobs
  - Immediately stops the job
  - Sets status to Cancelled

### Job Status Colors

- 🟡 **Pending** - Yellow badge, job is queued
- 🔵 **Processing** - Blue badge, job is running
- 🟢 **Completed** - Green badge, job succeeded
- 🔴 **Failed** - Red badge, job encountered an error
- ⚫ **Cancelled** - Gray badge, job was cancelled by user

## Testing the Application

Run the test suite:

```bash
python manage.py test jobs
```

Expected output:
```
Creating test database...
........
----------------------------------------------------------------------
Ran 8 tests in 0.XXXs

OK
```

## Accessing Django Admin

1. Navigate to: **http://127.0.0.1:8000/admin/**
2. Log in with your superuser credentials
3. View and manage Job records directly

## Troubleshooting

### Port Already in Use

If port 8000 is busy, use a different port:
```bash
python manage.py runserver 8080
```

### Database Issues

Reset the database:
```bash
rm db.sqlite3
python manage.py migrate
```

### Import Errors

Ensure Django is installed:
```bash
pip install Django
```

## Next Steps

- Check `README.md` for detailed documentation
- See `HTMX_FEATURES.md` for HTMX implementation details
- Modify `jobs/views.py` to customize processing logic
- Update `templates/` to change the UI

## File Structure Quick Reference

```
├── manage.py              # Django management script
├── config/                # Project settings
│   ├── settings.py       # Main configuration
│   └── urls.py           # URL routing
├── jobs/                  # Main application
│   ├── models.py         # Job model
│   ├── views.py          # Request handlers
│   ├── urls.py           # App URLs
│   └── tests.py          # Unit tests
└── templates/             # HTML templates
    ├── base.html         # Base layout with HTMX
    └── jobs/
        ├── index.html    # Main page
        └── partials/     # HTMX partial templates
```

## Common Commands

| Command | Purpose |
|---------|---------|
| `python manage.py runserver` | Start development server |
| `python manage.py makemigrations` | Create database migrations |
| `python manage.py migrate` | Apply database migrations |
| `python manage.py test` | Run tests |
| `python manage.py createsuperuser` | Create admin user |
| `python manage.py shell` | Open Django shell |

## Demo Behavior

The current implementation simulates job processing:
- Jobs take 2-5 seconds to process (random)
- 80% success rate, 20% failure rate
- Processing happens in background threads

**For production use**, replace the threading simulation in `jobs/views.py` with a proper task queue like Celery.
