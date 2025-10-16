#!/usr/bin/env python3
"""
Quick setup verification script for the Django HTMX Job Upload System
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.core.management import call_command
from jobs.models import Job

def check_database():
    """Check if database tables exist"""
    print("✅ Checking database...")
    try:
        count = Job.objects.count()
        print(f"   ✓ jobs_job table exists (currently {count} jobs)")
        return True
    except Exception as e:
        print(f"   ✗ Database error: {e}")
        return False

def check_migrations():
    """Check if migrations are applied"""
    print("\n✅ Checking migrations...")
    try:
        from django.db.migrations.executor import MigrationExecutor
        from django.db import connection

        executor = MigrationExecutor(connection)
        plan = executor.migration_plan(executor.loader.graph.leaf_nodes())

        if not plan:
            print("   ✓ All migrations applied")
            return True
        else:
            print(f"   ✗ {len(plan)} migrations pending")
            return False
    except Exception as e:
        print(f"   ✗ Migration check error: {e}")
        return False

def check_directories():
    """Check if required directories exist"""
    print("\n✅ Checking directories...")
    dirs = ['static', 'media', 'media/uploads', 'templates', 'jobs/migrations']
    all_exist = True

    for directory in dirs:
        if os.path.exists(directory):
            print(f"   ✓ {directory}/")
        else:
            print(f"   ✗ {directory}/ missing")
            all_exist = False

    return all_exist

def check_templates():
    """Check if templates exist"""
    print("\n✅ Checking templates...")
    templates = [
        'templates/base.html',
        'templates/jobs/index.html',
        'templates/jobs/partials/job_table.html',
        'templates/jobs/partials/job_row.html'
    ]
    all_exist = True

    for template in templates:
        if os.path.exists(template):
            print(f"   ✓ {template}")
        else:
            print(f"   ✗ {template} missing")
            all_exist = False

    return all_exist

def check_system():
    """Run Django system check"""
    print("\n✅ Running Django system check...")
    try:
        call_command('check', '--deploy', stdout=sys.stdout, stderr=sys.stderr)
        return True
    except Exception as e:
        print(f"   ✗ System check failed: {e}")
        return False

def main():
    print("=" * 60)
    print("Django HTMX Job Upload System - Setup Verification")
    print("=" * 60)

    checks = [
        check_directories(),
        check_templates(),
        check_migrations(),
        check_database(),
    ]

    print("\n" + "=" * 60)

    if all(checks):
        print("✅ ALL CHECKS PASSED!")
        print("\nYou're ready to run the server:")
        print("    python3 manage.py runserver")
        print("\nThen visit: http://127.0.0.1:8000/")
        return 0
    else:
        print("❌ SOME CHECKS FAILED")
        print("\nPlease fix the issues above and run this script again.")
        return 1

if __name__ == '__main__':
    sys.exit(main())
