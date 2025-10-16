# HTMX Features Implementation

This document explains the HTMX features used in this Django application.

## 1. File Upload with HTMX

**Location:** `templates/jobs/index.html`

```html
<form
    hx-post="/jobs"
    hx-target="#job-table-container"
    hx-encoding="multipart/form-data"
    hx-indicator="#upload-indicator">
    {% csrf_token %}
    <input type="file" name="files" multiple required>
    <button type="submit">Upload Files</button>
</form>
```

**How it works:**
- `hx-post="/jobs"` - Sends POST request to /jobs endpoint
- `hx-target="#job-table-container"` - Updates the job table container with response
- `hx-encoding="multipart/form-data"` - Enables file upload
- `hx-indicator="#upload-indicator"` - Shows loading indicator during upload

## 2. Automatic Polling

**Location:** `templates/jobs/index.html`

```html
<div id="job-table-container" hx-get="/jobs/table" hx-trigger="every 2s">
    {% include "jobs/partials/job_table.html" %}
</div>
```

**How it works:**
- `hx-get="/jobs/table"` - Fetches updated table from server
- `hx-trigger="every 2s"` - Automatically polls every 2 seconds
- Container content is replaced with fresh data

## 3. Inline Action Buttons

**Location:** `templates/jobs/partials/job_row.html`

### Retry Button
```html
<button
    class="btn-retry"
    hx-post="/jobs/{{ job.id }}/retry"
    hx-target="#job-row-{{ job.id }}"
    hx-swap="outerHTML">
    Retry
</button>
```

### Cancel Button
```html
<button
    class="btn-cancel"
    hx-post="/jobs/{{ job.id }}/cancel"
    hx-target="#job-row-{{ job.id }}"
    hx-swap="outerHTML">
    Cancel
</button>
```

**How it works:**
- `hx-post="/jobs/{{ job.id }}/retry"` - Sends POST to retry endpoint
- `hx-target="#job-row-{{ job.id }}"` - Targets specific row
- `hx-swap="outerHTML"` - Replaces entire row with updated version

## 4. Partial Template Updates

**Server returns only the HTML that changed:**

### Full Table Partial
`templates/jobs/partials/job_table.html` - Used for polling updates

### Single Row Partial
`templates/jobs/partials/job_row.html` - Used for action button responses

**Benefits:**
- Minimal data transfer
- Fast updates
- No JSON parsing needed
- Server-side rendering maintained

## 5. Loading Indicators

```html
<span id="upload-indicator" class="htmx-indicator" style="display:none;">
    ⏳ Uploading...
</span>
```

**How it works:**
- HTMX automatically shows/hides elements with class `htmx-indicator`
- Connected via `hx-indicator="#upload-indicator"`
- Provides user feedback during async operations

## Key HTMX Attributes Used

| Attribute | Purpose | Example |
|-----------|---------|---------|
| `hx-get` | HTTP GET request | `hx-get="/jobs/table"` |
| `hx-post` | HTTP POST request | `hx-post="/jobs"` |
| `hx-target` | Where to place response | `hx-target="#job-table-container"` |
| `hx-swap` | How to swap content | `hx-swap="outerHTML"` |
| `hx-trigger` | When to trigger request | `hx-trigger="every 2s"` |
| `hx-encoding` | Request encoding | `hx-encoding="multipart/form-data"` |
| `hx-indicator` | Loading indicator | `hx-indicator="#upload-indicator"` |

## Benefits of This Approach

1. **No JavaScript required** - All interactivity through HTML attributes
2. **Server-side rendering** - Templates rendered on server
3. **Progressive enhancement** - Works with forms as fallback
4. **Minimal bandwidth** - Only changed HTML is sent
5. **Simple debugging** - Standard HTTP requests visible in DevTools
6. **Clean separation** - Logic stays in Django views

## Request/Response Flow

### File Upload Flow
```
1. User selects files
2. HTMX: POST /jobs (multipart/form-data)
3. Django: Creates Job records, starts processing
4. Django: Renders job_table.html with all jobs
5. HTMX: Replaces #job-table-container content
```

### Polling Flow
```
1. Every 2 seconds
2. HTMX: GET /jobs/table
3. Django: Queries all jobs, renders job_table.html
4. HTMX: Replaces #job-table-container content
```

### Action Button Flow
```
1. User clicks Retry/Cancel
2. HTMX: POST /jobs/{id}/retry or /jobs/{id}/cancel
3. Django: Updates job status, renders job_row.html
4. HTMX: Replaces specific job row (outerHTML)
```

## Performance Considerations

- **Polling interval**: 2 seconds balances responsiveness vs. server load
- **Partial updates**: Only row changes on actions, not full table
- **Database queries**: Simple queries, optimized with ordering
- **Background processing**: Simulated with threads (use Celery in production)
