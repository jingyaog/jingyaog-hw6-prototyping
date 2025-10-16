import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import useSpeechSynthesis from '../hooks/useSpeechSynthesis';
import './ChatInterface.css';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const {
    isListening,
    transcript,
    error: speechError,
    isSupported: isSpeechRecognitionSupported,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition();

  const {
    speak,
    isSpeaking,
    isSupported: isSpeechSynthesisSupported,
    cancel: cancelSpeech
  } = useSpeechSynthesis();

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversation history
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await axios.get(`/api/chat/history/${sessionId}`);
        if (response.data.success && response.data.messages.length > 0) {
          setMessages(response.data.messages);
        }
      } catch (error) {
        console.error('Error loading history:', error);
      }
    };
    loadHistory();
  }, [sessionId]);

  // Handle transcript updates
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  const sendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    const userMessage = {
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    resetTranscript();

    try {
      const response = await axios.post('/api/chat/message', {
        sessionId,
        message: messageText
      });

      if (response.data.success) {
        const botMessage = {
          role: 'bot',
          content: response.data.response,
          timestamp: new Date().toISOString(),
          intent: response.data.intent
        };

        setMessages(prev => [...prev, botMessage]);

        // Speak the response
        if (isSpeechSynthesisSupported) {
          speak(response.data.response);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        role: 'bot',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <h1>Voice Chat Assistant</h1>
        <div className="session-info" aria-live="polite">
          Session: {sessionId}
        </div>
      </header>

      <main className="chat-messages" role="log" aria-live="polite" aria-atomic="false">
        {messages.length === 0 && (
          <div className="welcome-message">
            <p>Welcome! I can help you with:</p>
            <ul>
              <li>Uploading files</li>
              <li>Retrying jobs</li>
              <li>Checking job status</li>
            </ul>
            <p>Try saying "upload a file" or "show status"</p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.role}`}
            role="article"
            aria-label={`${msg.role} message`}
          >
            <div className="message-header">
              <span className="message-role">{msg.role === 'user' ? 'You' : 'Assistant'}</span>
              {msg.intent && <span className="message-intent">({msg.intent})</span>}
            </div>
            <div className="message-content">{msg.content}</div>
            <div className="message-time">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message bot loading" aria-live="polite">
            <div className="message-content">Thinking...</div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      <footer className="chat-input-container">
        {speechError && (
          <div className="error-message" role="alert">
            Speech error: {speechError}
          </div>
        )}

        {!isSpeechRecognitionSupported && (
          <div className="warning-message" role="alert">
            Speech recognition is not supported in your browser
          </div>
        )}

        <form onSubmit={handleSubmit} className="chat-input-form">
          <button
            type="button"
            className={`voice-button ${isListening ? 'listening' : ''}`}
            onClick={handleVoiceInput}
            disabled={!isSpeechRecognitionSupported}
            aria-label={isListening ? 'Stop listening' : 'Start voice input'}
            title={isListening ? 'Stop listening' : 'Start voice input'}
          >
            {isListening ? '🔴' : '🎤'}
          </button>

          <input
            type="text"
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isListening ? 'Listening...' : 'Type a message or use voice input'}
            disabled={isLoading}
            aria-label="Chat message input"
          />

          <button
            type="submit"
            className="send-button"
            disabled={isLoading || !input.trim()}
            aria-label="Send message"
          >
            Send
          </button>

          {isSpeaking && (
            <button
              type="button"
              className="stop-speech-button"
              onClick={cancelSpeech}
              aria-label="Stop speech"
              title="Stop speaking"
            >
              🔇
            </button>
          )}
        </form>
      </footer>
    </div>
  );
};

export default ChatInterface;
