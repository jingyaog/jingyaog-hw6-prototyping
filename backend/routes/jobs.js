const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const { v4: uuidv4 } = require('uuid');

// Mock job endpoints

// Create a new job (upload)
router.post('/upload', async (req, res) => {
  try {
    const { sessionId, fileName, fileSize } = req.body;

    const job = new Job({
      jobId: uuidv4(),
      sessionId,
      type: 'upload',
      status: 'processing',
      data: {
        fileName: fileName || 'document.pdf',
        fileSize: fileSize || '1.2 MB'
      }
    });

    await job.save();

    // Simulate processing delay
    setTimeout(async () => {
      job.status = 'completed';
      await job.save();
    }, 3000);

    res.json({
      success: true,
      message: `Upload started for ${job.data.fileName}`,
      jobId: job.jobId,
      job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create upload job',
      error: error.message
    });
  }
});

// Retry a job
router.post('/retry/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const { sessionId } = req.body;

    const originalJob = await Job.findOne({ jobId });

    if (!originalJob) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const retryJob = new Job({
      jobId: uuidv4(),
      sessionId,
      type: 'retry',
      status: 'processing',
      data: {
        originalJobId: jobId,
        ...originalJob.data
      }
    });

    await retryJob.save();

    // Simulate processing
    setTimeout(async () => {
      retryJob.status = 'completed';
      await retryJob.save();
    }, 2000);

    res.json({
      success: true,
      message: `Retrying job ${jobId}`,
      jobId: retryJob.jobId,
      job: retryJob
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retry job',
      error: error.message
    });
  }
});

// Get job status
router.get('/status/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findOne({ jobId });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.json({
      success: true,
      job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get job status',
      error: error.message
    });
  }
});

// Get all jobs for a session
router.get('/status', async (req, res) => {
  try {
    const { sessionId } = req.query;

    const query = sessionId ? { sessionId } : {};
    const jobs = await Job.find(query).sort({ createdAt: -1 }).limit(10);

    const summary = jobs.map(job => ({
      jobId: job.jobId,
      type: job.type,
      status: job.status,
      data: job.data,
      createdAt: job.createdAt
    }));

    const message = jobs.length === 0
      ? 'No jobs found'
      : `Found ${jobs.length} job(s). ${jobs.filter(j => j.status === 'completed').length} completed, ${jobs.filter(j => j.status === 'processing').length} in progress, ${jobs.filter(j => j.status === 'failed').length} failed.`;

    res.json({
      success: true,
      message,
      jobs: summary,
      count: jobs.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get jobs status',
      error: error.message
    });
  }
});

module.exports = router;
