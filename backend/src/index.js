const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const http = require('http');
const authRoutes = require('./routes/auth');
const passport = require('passport');
const userRoutes = require('./routes/user');
const inviteRouter = require('./routes/invite');
const bodyParser = require('body-parser');
const authMiddleware = require('./middleware/authMiddleWare');
const messageRoutes = require('./routes/message');
const accountRouter = require('./routes/account');
const projectRouter = require('./routes/project');
const todoRouter = require('./routes/todos');
const eventRouter = require('./routes/event');
const grpchatRouter = require('./routes/groupchats');
const initializeGroupChat = require('./socket');
const initializeDirectChat = require('./singleSocket');
const directMessageRouter = require('./routes/directchat');
const { HfInference } = require('@huggingface/inference');
<<<<<<< HEAD
=======
const fileRouter = require('./routes/files');
const adminRouter = require('./routes/admin');
>>>>>>> cab77f0c (removec ml)

// Remove this line since we're not using it anymore
// const initializeSocket = require('./socket');
require('./config/passport-local');



const app = express();
const server = http.createServer(app);
// Remove this line
// const io = initializeSocket(server);
const groupChatIo = initializeGroupChat(server);
const directChatIo = initializeDirectChat(server);



const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not defined');
}

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set in environment variables!');
  process.exit(1);
}

console.log('Server starting with JWT_SECRET:', process.env.JWT_SECRET?.substring(0, 3) + '...');

app.use(passport.initialize());

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());

// Remove this line since we're not using the general io anymore
// app.set('io', io);

// MongoDB Connection
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
  });

// Routes
app.use('/api', inviteRouter);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/account", accountRouter);
app.use("/api/projects", projectRouter);
app.use("/api/todos", todoRouter);
app.use("/api/event", eventRouter);
<<<<<<< HEAD
=======
app.use("/api/files",fileRouter)
app.use('/uploads', express.static('uploads'));
app.use('/api/admin', adminRouter);
>>>>>>> cab77f0c (removec ml)

app.use("/api/groupchat", (req, res, next) => {
  req.io = groupChatIo;
  next();
}, grpchatRouter);
app.use("/api/direct-messages", (req, res, next) => {
  console.log("Socket IO state:", {
    hasIO: !!req.io,
    ioConnectedUsers: req.io?.connectedUsers ? Array.from(req.io.connectedUsers.entries()) : 'No users map'
  });
  req.io = directChatIo;
  next();
}, directMessageRouter);
// Basic route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});