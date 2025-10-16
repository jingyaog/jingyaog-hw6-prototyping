#!/usr/bin/env python3
import time
from typing import Optional
import typer
from rich.console import Console
from rich.table import Table
from rich.progress import Progress, SpinnerColumn, TextColumn

import database
from api_client import api_client


app = typer.Typer(help="Job Management CLI")
console = Console()


def format_table(jobs):
    """Format jobs data as an ASCII table."""
    table = Table(show_header=True, header_style="bold magenta")
    table.add_column("Job ID", style="cyan")
    table.add_column("Filename", style="green")
    table.add_column("Status", style="yellow")
    table.add_column("Retry Count", justify="right")
    table.add_column("Created At")
    table.add_column("Updated At")

    for job in jobs:
        # Color code status
        status = job["status"]
        if status == "completed":
            status_display = f"[green]{status}[/green]"
        elif status == "failed":
            status_display = f"[red]{status}[/red]"
        elif status == "processing":
            status_display = f"[yellow]{status}[/yellow]"
        else:
            status_display = status

        table.add_row(
            job["job_id"],
            job["filename"],
            status_display,
            str(job["retry_count"]),
            job["created_at"],
            job["updated_at"]
        )

    return table


@app.command()
def upload(filename: str):
    """
    Upload a file and create a new job.

    Args:
        filename: Name of the file to upload
    """
    database.init_db()

    console.print(f"[bold blue]Uploading file:[/bold blue] {filename}")

    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        console=console
    ) as progress:
        task = progress.add_task("Creating job...", total=None)

        # Call simulated API
        response = api_client.create_job(filename)

        progress.update(task, completed=True)

    # Store in database
    database.insert_job(
        job_id=response["job_id"],
        filename=filename,
        status=response["status"]
    )

    console.print(f"[green]✓[/green] Job created successfully!")
    console.print(f"[cyan]Job ID:[/cyan] {response['job_id']}")
    console.print(f"[cyan]Status:[/cyan] {response['status']}")


@app.command()
def monitor(
    job_id: Optional[str] = typer.Argument(None, help="Specific job ID to monitor"),
    watch: bool = typer.Option(False, "--watch", "-w", help="Continuously watch job status")
):
    """
    Monitor job status. Shows all jobs if no job_id provided.

    Args:
        job_id: Optional specific job ID to monitor
        watch: If True, continuously poll and update status
    """
    database.init_db()

    if job_id:
        # Monitor specific job
        job = database.get_job(job_id)
        if not job:
            console.print(f"[red]Error:[/red] Job {job_id} not found in database")
            raise typer.Exit(1)

        if watch:
            console.print(f"[bold]Monitoring job {job_id}...[/bold] (Press Ctrl+C to stop)")
            try:
                while True:
                    # Get status from API
                    status_response = api_client.get_job_status(job_id)

                    # Update database
                    database.update_job_status(job_id, status_response["status"])

                    # Display status
                    console.clear()
                    console.print(f"[cyan]Job ID:[/cyan] {job_id}")
                    console.print(f"[cyan]Status:[/cyan] {status_response['status']}")
                    console.print(f"[cyan]Progress:[/cyan] {status_response.get('progress', 0)}%")

                    if status_response["status"] in ["completed", "failed"]:
                        console.print(f"\n[bold]Job {status_response['status']}![/bold]")
                        break

                    time.sleep(2)
            except KeyboardInterrupt:
                console.print("\n[yellow]Monitoring stopped[/yellow]")
        else:
            # Single status check
            status_response = api_client.get_job_status(job_id)
            database.update_job_status(job_id, status_response["status"])

            console.print(f"[cyan]Job ID:[/cyan] {job_id}")
            console.print(f"[cyan]Status:[/cyan] {status_response['status']}")
            console.print(f"[cyan]Progress:[/cyan] {status_response.get('progress', 0)}%")
    else:
        # Show all jobs in table
        jobs = database.get_all_jobs()

        if not jobs:
            console.print("[yellow]No jobs found in database[/yellow]")
            return

        # Update statuses from API
        for job in jobs:
            try:
                status_response = api_client.get_job_status(job["job_id"])
                database.update_job_status(job["job_id"], status_response["status"])
            except Exception as e:
                console.print(f"[yellow]Warning:[/yellow] Could not update status for {job['job_id']}")

        # Refresh jobs from database
        jobs = database.get_all_jobs()

        table = format_table(jobs)
        console.print(table)


@app.command()
def retry(
    job_id: Optional[str] = typer.Argument(None, help="Specific job ID to retry"),
    all: bool = typer.Option(False, "--all", help="Retry all failed jobs")
):
    """
    Retry failed jobs with exponential backoff.

    Args:
        job_id: Optional specific job ID to retry
        all: If True, retry all failed jobs
    """
    database.init_db()

    if all:
        # Retry all failed jobs
        failed_jobs = database.get_failed_jobs()

        if not failed_jobs:
            console.print("[yellow]No failed jobs to retry[/yellow]")
            return

        console.print(f"[bold]Retrying {len(failed_jobs)} failed job(s)...[/bold]")

        for job in failed_jobs:
            _retry_job_with_backoff(job["job_id"], job["retry_count"])

        console.print(f"[green]✓[/green] Retry initiated for {len(failed_jobs)} job(s)")

    elif job_id:
        # Retry specific job
        job = database.get_job(job_id)

        if not job:
            console.print(f"[red]Error:[/red] Job {job_id} not found in database")
            raise typer.Exit(1)

        if job["status"] != "failed":
            console.print(f"[yellow]Warning:[/yellow] Job {job_id} is not in failed state (current: {job['status']})")
            confirm = typer.confirm("Do you want to retry anyway?")
            if not confirm:
                raise typer.Exit(0)

        _retry_job_with_backoff(job_id, job["retry_count"])

        console.print(f"[green]✓[/green] Retry initiated for job {job_id}")

    else:
        console.print("[red]Error:[/red] Must specify either a job_id or --all flag")
        raise typer.Exit(1)


def _retry_job_with_backoff(job_id: str, retry_count: int):
    """
    Retry a job with exponential backoff.

    Args:
        job_id: The job ID to retry
        retry_count: Current retry count for calculating backoff
    """
    # Exponential backoff: 2^retry_count seconds (capped at 60 seconds)
    backoff_time = min(2 ** retry_count, 60)

    console.print(f"  [cyan]{job_id}[/cyan]: Waiting {backoff_time}s before retry (attempt #{retry_count + 1})...")

    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        console=console
    ) as progress:
        task = progress.add_task(f"Backing off...", total=None)
        time.sleep(backoff_time)
        progress.update(task, completed=True)

    # Call API to retry job
    api_client.retry_job(job_id)

    # Update database
    database.increment_retry_count(job_id)
    database.update_job_status(job_id, "pending")

    console.print(f"  [green]✓[/green] Job {job_id} resubmitted")


if __name__ == "__main__":
    app()
