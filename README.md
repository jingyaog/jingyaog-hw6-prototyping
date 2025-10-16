# Voice Chat Assistant with Job Management

A React-based chat interface with speech input/output capabilities, connected to a Node.js Express backend for intent parsing and job management. Conversation history and job data are stored in MongoDB.

## Features

- **Voice Input**: Uses Web Speech API for speech recognition
- **Voice Output**: Text-to-speech synthesis for bot responses
- **Intent Parsing**: Recognizes three intents: upload, retry, and status
- **Job Management**: Mock endpoints for job operations
- **Conversation History**: Persistent storage in MongoDB
- **Accessibility**: ARIA labels, keyboard navigation, and focus management
- **Responsive Design**: Works on desktop and mobile

## Architecture

```
├── backend/
│   ├── models/
│   │   ├── Conversation.js  # MongoDB schema for chat history
│   │   └── Job.js           # MongoDB schema for job data
│   ├── routes/
│   │   ├── chat.js          # Chat endpoints with intent parsing
│   │   └── jobs.js          # Mock job endpoints (upload, retry, status)
│   ├── utils/
│   │   └── intentParser.js  # Intent recognition logic
│   ├── server.js            # Express server setup
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ChatInterface.js     # Main chat UI component
    │   │   └── ChatInterface.css
    │   ├── hooks/
    │   │   ├── useSpeechRecognition.js  # Web Speech API hook
    │   │   └── useSpeechSynthesis.js    # Text-to-speech hook
    │   ├── App.js
    │   └── index.js
    └── package.json
```

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- Modern browser with Web Speech API support (Chrome, Edge, Safari)

## Setup Instructions

### 1. Install MongoDB

If you don't have MongoDB installed:

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

**Or use MongoDB Atlas (cloud):**
Sign up at https://www.mongodb.com/cloud/atlas and get your connection string.

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env if needed (default values work for local MongoDB)
# MONGODB_URI=mongodb://localhost:27017/voice-chat-app
# PORT=5000

# Start the backend server
npm run dev
```

The backend will run on http://localhost:5000

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start the React app
npm start
```

The frontend will open at http://localhost:3000

## Usage

### Voice Commands

1. **Upload a file:**
   - Say: "upload a file" or "send file"
   - The system will create a mock upload job

2. **Check status:**
   - Say: "show status" or "check progress"
   - The system will list all jobs for your session

3. **Retry a job:**
   - Say: "retry" followed by a job ID
   - The system will create a retry job

### Text Input

You can also type messages directly in the input field. The intent parser will recognize the same patterns.

### Accessibility Features

- **Keyboard Navigation**: Tab through all interactive elements
- **Screen Reader Support**: ARIA labels on all controls
- **Focus Management**: Clear visual focus indicators
- **Voice Control**: Complete hands-free operation possible

## API Endpoints

### Chat Endpoints

- `POST /api/chat/message` - Send a message and get intent-based response
- `GET /api/chat/history/:sessionId` - Get conversation history

### Job Endpoints

- `POST /api/jobs/upload` - Create upload job
- `POST /api/jobs/retry/:jobId` - Retry a job
- `GET /api/jobs/status/:jobId` - Get single job status
- `GET /api/jobs/status?sessionId=xxx` - Get all jobs for session

### Health Check

- `GET /health` - Check server and MongoDB status

## Intent Parser

The system recognizes three intents:

1. **Upload**: Patterns like "upload", "send file", "submit file"
2. **Retry**: Patterns like "retry", "try again", "rerun"
3. **Status**: Patterns like "status", "check", "progress", "show job"

Unknown messages receive a help response.

## Browser Compatibility

**Speech Recognition:**
- Chrome/Edge: Full support
- Safari: Full support (with webkit prefix)
- Firefox: Not supported

**Speech Synthesis:**
- All modern browsers support text-to-speech

## Development

### Backend Development

```bash
cd backend
npm run dev  # Uses nodemon for auto-restart
```

### Frontend Development

```bash
cd frontend
npm start  # Hot reload enabled
```

### Testing the Flow

1. Start MongoDB
2. Start backend server
3. Start frontend app
4. Click the microphone button 🎤
5. Say "upload a file"
6. The bot will respond and read the response aloud
7. Say "show status" to see the job

## Troubleshooting

### MongoDB Connection Issues

```bash
# Check if MongoDB is running
mongosh  # or mongo

# Restart MongoDB
brew services restart mongodb-community  # macOS
sudo systemctl restart mongodb  # Linux
```

### Speech Recognition Not Working

- Use Chrome or Edge browser
- Allow microphone permissions
- Check browser console for errors

### CORS Issues

If you see CORS errors, make sure the backend is running on port 5000 and the frontend proxy is configured correctly in package.json.

## Future Enhancements

- File upload UI for actual file handling
- Job progress tracking with websockets
- User authentication
- Multiple language support
- Voice command customization
- Offline mode support

## Performance Notes

- Speech recognition is processed locally in the browser
- Intent parsing is lightweight and fast
- MongoDB queries are indexed for quick retrieval
- Auto-scroll and animations are optimized
- Response times < 100ms for most operations

## License

MIT
