// server.js

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid'); // For generating unique filenames

// Secret key for JWT (use environment variable in production)
const SECRET_KEY = 'your_secret_key';

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*', // Allow all origins for testing purposes
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors());
app.use(express.static('public'));
app.use(express.json());

// Data file paths
const USER_DATA_FILE = path.join(__dirname, 'users.json');
const MESSAGES_FILE = path.join(__dirname, 'messages.json');

// Ensure necessary directories exist
const AVATAR_DIR = path.join(__dirname, 'public', 'avatars');
const UPLOAD_DIR = path.join(__dirname, 'public', 'uploads');
fs.mkdirSync(AVATAR_DIR, { recursive: true });
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Initialize data files if they don't exist
if (!fs.existsSync(USER_DATA_FILE)) {
  fs.writeFileSync(USER_DATA_FILE, JSON.stringify({}));
}

if (!fs.existsSync(MESSAGES_FILE)) {
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify([]));
}

// Helper functions
function readUserData() {
  try {
    const data = fs.readFileSync(USER_DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading users.json:', err);
    return {};
  }
}

function writeUserData(data) {
  fs.writeFileSync(USER_DATA_FILE, JSON.stringify(data, null, 2));
}

function readMessages() {
  try {
    const data = fs.readFileSync(MESSAGES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading messages.json:', err);
    return [];
  }
}

function writeMessages(data) {
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(data, null, 2));
}

// Multer setup for avatar uploads
const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, AVATAR_DIR);
  },
  filename: function (req, file, cb) {
    const username = req.user.username;
    cb(null, `${username}.jpg`);
  },
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    // Only accept image files
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  },
});

// Multer setup for file uploads
const fileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueName = uuidv4() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const fileUpload = multer({
  storage: fileStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    // Allowed file types (images and documents)
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('File type not allowed'), false);
    }
    cb(null, true);
  },
});

// User registration
app.post('/register', async (req, res) => {
  console.log('Register endpoint called');
  const { username, password } = req.body;
  const data = readUserData();

  if (data[username]) {
    console.log(`User registration failed: ${username} already exists`);
    return res.status(400).json({ error: 'User already exists' });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Initialize user data
  data[username] = {
    password: hashedPassword,
    avatar: `default.jpg`,
  };

  writeUserData(data);

  console.log(`User registered: ${username}`);
  res.json({ success: true });
});

// User login
app.post('/login', async (req, res) => {
  console.log('Login endpoint called');
  const { username, password } = req.body;
  const data = readUserData();

  const user = data[username];

  if (!user) {
    console.log(`Login failed: ${username} does not exist`);
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    console.log(`Login failed: Incorrect password for ${username}`);
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Create JWT token
  const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });

  console.log(`User logged in: ${username}`);
  res.json({ success: true, token });
});

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('Access token required');
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      console.log('Invalid access token');
      return res.status(403).json({ error: 'Invalid access token' });
    }
    req.user = user;
    next();
  });
}

// Get user data
app.get('/get_user_data', authenticateToken, (req, res) => {
  console.log(`Get data for user: ${req.user.username}`);
  const data = readUserData();
  const user = data[req.user.username];

  if (!user) {
    console.log(`User not found: ${req.user.username}`);
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    avatar: user.avatar,
  });
});

// Get recent messages
app.get('/get_recent_messages', authenticateToken, (req, res) => {
  const messages = readMessages();
  const lastMessages = messages.slice(-50); // Get the last 50 messages
  res.json(lastMessages);
});

// Avatar upload handling
app.post('/upload_avatar', authenticateToken, avatarUpload.single('avatar'), (req, res) => {
  console.log(`Avatar upload for user: ${req.user.username}`);
  const username = req.user.username;
  const data = readUserData();

  if (!data[username]) {
    console.log(`User not found: ${username}`);
    return res.status(404).json({ error: 'User not found' });
  }

  data[username].avatar = `${username}.jpg`;
  writeUserData(data);

  const avatarUrl = `/avatars/${username}.jpg`;

  // Emit to all users
  io.emit('update_avatar', { username, avatarUrl });

  res.json({ success: true, avatar_url: avatarUrl });
});

// File upload endpoint
app.post('/upload_file', authenticateToken, fileUpload.single('file'), (req, res) => {
  console.log(`File upload from user: ${req.user.username}`);
  const username = req.user.username;

  const fileData = {
    originalName: req.file.originalname,
    filename: req.file.filename,
    fileUrl: `/uploads/${req.file.filename}`,
    uploader: username,
    timestamp: new Date().toISOString(),
  };

  // Save the file message
  const messages = readMessages();
  messages.push({
    ...fileData,
    type: 'file',
  });
  writeMessages(messages);

  // Broadcast the file message
  io.emit('new_file', fileData);

  res.json({ success: true, file: fileData });
});

// Handle errors from multer and other middleware
app.use(function (err, req, res, next) {
  console.error('Error:', err.message);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

// Socket.IO authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    console.log('Socket authentication error: Token missing');
    return next(new Error('Authentication error'));
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      console.log('Socket authentication error: Invalid token');
      return next(new Error('Authentication error'));
    }
    socket.user = user;
    next();
  });
});

// Connected users
let connectedUsers = {};

// Socket.IO event handling
io.on('connection', (socket) => {
  const username = socket.user.username;
  console.log(`User connected: ${username}`);

  // Add user to connected users
  connectedUsers[username] = {
    socketId: socket.id,
    avatar: `/avatars/${username}.jpg`,
  };

  // Broadcast updated user list
  io.emit('user_list', connectedUsers);

  // Handle send_message event
  socket.on('send_message', (data) => {
    const { message } = data;
    const timestamp = new Date().toISOString();

    const messageData = {
      username,
      message,
      timestamp,
    };

    // Save the message
    const messages = readMessages();
    messages.push(messageData);
    writeMessages(messages);

    // Broadcast the message to all connected users
    io.emit('new_message', messageData);

    console.log(`Message from ${username}: ${message}`);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${username}`);

    // Remove user from connected users
    delete connectedUsers[username];

    // Broadcast updated user list
    io.emit('user_list', connectedUsers);
  });
});

// Start the server
const PORT = process.env.PORT || 9090;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});
