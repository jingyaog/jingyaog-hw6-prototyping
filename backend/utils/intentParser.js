// Intent parser for chat messages
const parseIntent = (message) => {
  const lowerMessage = message.toLowerCase().trim();

  // Upload intent patterns
  const uploadPatterns = [
    /upload/i,
    /send.*file/i,
    /submit.*file/i,
    /attach.*file/i
  ];

  // Retry intent patterns
  const retryPatterns = [
    /retry/i,
    /try.*again/i,
    /rerun/i,
    /restart.*job/i
  ];

  // Status intent patterns
  const statusPatterns = [
    /status/i,
    /check/i,
    /how.*doing/i,
    /progress/i,
    /what.*happening/i,
    /list.*job/i,
    /show.*job/i
  ];

  // Check for upload intent
  if (uploadPatterns.some(pattern => pattern.test(lowerMessage))) {
    return {
      intent: 'upload',
      confidence: 0.9,
      originalMessage: message
    };
  }

  // Check for retry intent
  if (retryPatterns.some(pattern => pattern.test(lowerMessage))) {
    return {
      intent: 'retry',
      confidence: 0.9,
      originalMessage: message
    };
  }

  // Check for status intent
  if (statusPatterns.some(pattern => pattern.test(lowerMessage))) {
    return {
      intent: 'status',
      confidence: 0.9,
      originalMessage: message
    };
  }

  // Default: unknown intent
  return {
    intent: 'unknown',
    confidence: 0.5,
    originalMessage: message
  };
};

module.exports = { parseIntent };
