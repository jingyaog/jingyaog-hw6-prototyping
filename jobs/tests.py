from django.test import TestCase, Client
from django.core.files.uploadedfile import SimpleUploadedFile
from .models import Job


class JobModelTests(TestCase):
    def test_job_creation(self):
        """Test creating a job"""
        job = Job.objects.create(
            filename="test.txt",
            status="pending"
        )
        self.assertEqual(job.filename, "test.txt")
        self.assertEqual(job.status, "pending")
        self.assertEqual(job.retry_count, 0)

    def test_can_retry(self):
        """Test can_retry method"""
        failed_job = Job.objects.create(filename="test.txt", status="failed")
        cancelled_job = Job.objects.create(filename="test2.txt", status="cancelled")
        completed_job = Job.objects.create(filename="test3.txt", status="completed")

        self.assertTrue(failed_job.can_retry())
        self.assertTrue(cancelled_job.can_retry())
        self.assertFalse(completed_job.can_retry())

    def test_can_cancel(self):
        """Test can_cancel method"""
        pending_job = Job.objects.create(filename="test.txt", status="pending")
        processing_job = Job.objects.create(filename="test2.txt", status="processing")
        completed_job = Job.objects.create(filename="test3.txt", status="completed")

        self.assertTrue(pending_job.can_cancel())
        self.assertTrue(processing_job.can_cancel())
        self.assertFalse(completed_job.can_cancel())


class JobViewTests(TestCase):
    def setUp(self):
        self.client = Client()

    def test_index_view(self):
        """Test the index view loads"""
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "File Upload Job Manager")

    def test_job_table_view(self):
        """Test job table view"""
        Job.objects.create(filename="test.txt", status="pending")
        response = self.client.get('/jobs/table')
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "test.txt")

    def test_cancel_job(self):
        """Test cancelling a job"""
        job = Job.objects.create(filename="test.txt", status="pending")
        response = self.client.post(f'/jobs/{job.id}/cancel')
        self.assertEqual(response.status_code, 200)
        job.refresh_from_db()
        self.assertEqual(job.status, "cancelled")

    def test_retry_job(self):
        """Test retrying a failed job"""
        job = Job.objects.create(filename="test.txt", status="failed")
        response = self.client.post(f'/jobs/{job.id}/retry')
        self.assertEqual(response.status_code, 200)
        job.refresh_from_db()
        self.assertEqual(job.status, "pending")
        self.assertEqual(job.retry_count, 1)
