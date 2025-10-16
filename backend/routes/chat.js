const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const { parseIntent } = require('../utils/intentParser');
const axios = require('axios');

// Process chat message
router.post('/message', async (req, res) => {
  try {
    const { sessionId, message } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({
        success: false,
        message: 'sessionId and message are required'
      });
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({ sessionId });
    if (!conversation) {
      conversation = new Conversation({
        sessionId,
        messages: []
      });
    }

    // Add user message
    conversation.messages.push({
      role: 'user',
      content: message
    });

    // Parse intent
    const { intent, confidence } = parseIntent(message);

    let botResponse = '';
    let jobData = null;

    // Handle different intents
    switch (intent) {
      case 'upload':
        try {
          const uploadResponse = await axios.post('http://localhost:5000/api/jobs/upload', {
            sessionId,
            fileName: 'document.pdf',
            fileSize: '1.2 MB'
          });
          jobData = uploadResponse.data;
          botResponse = `${uploadResponse.data.message}. Job ID: ${uploadResponse.data.jobId}`;
        } catch (error) {
          botResponse = 'Sorry, I encountered an error starting the upload.';
        }
        break;

      case 'retry':
        // Extract job ID if present, otherwise use last job
        const jobIdMatch = message.match(/[a-f0-9-]{36}/i);
        if (jobIdMatch) {
          try {
            const retryResponse = await axios.post(`http://localhost:5000/api/jobs/retry/${jobIdMatch[0]}`, {
              sessionId
            });
            jobData = retryResponse.data;
            botResponse = `${retryResponse.data.message}. New Job ID: ${retryResponse.data.jobId}`;
          } catch (error) {
            botResponse = 'Sorry, I could not retry that job. Please provide a valid job ID.';
          }
        } else {
          botResponse = 'To retry a job, please provide the job ID or say "retry" followed by the job ID.';
        }
        break;

      case 'status':
        try {
          const statusResponse = await axios.get(`http://localhost:5000/api/jobs/status?sessionId=${sessionId}`);
          jobData = statusResponse.data;
          botResponse = statusResponse.data.message;
        } catch (error) {
          botResponse = 'Sorry, I could not retrieve job status.';
        }
        break;

      default:
        botResponse = 'I can help you with uploading files, retrying jobs, or checking job status. What would you like to do?';
    }

    // Add bot response
    conversation.messages.push({
      role: 'bot',
      content: botResponse
    });

    await conversation.save();

    res.json({
      success: true,
      intent,
      confidence,
      response: botResponse,
      jobData,
      conversation: {
        sessionId: conversation.sessionId,
        messageCount: conversation.messages.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to process message',
      error: error.message
    });
  }
});

// Get conversation history
router.get('/history/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const conversation = await Conversation.findOne({ sessionId });

    if (!conversation) {
      return res.json({
        success: true,
        messages: [],
        sessionId
      });
    }

    res.json({
      success: true,
      messages: conversation.messages,
      sessionId: conversation.sessionId,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get conversation history',
      error: error.message
    });
  }
});

module.exports = router;
