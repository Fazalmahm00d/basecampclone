require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
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
require('./config/passport-local');
const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not defined');
}
 // Import your local strategy
 if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set in environment variables!');
  process.exit(1);
}

console.log('Server starting with JWT_SECRET:', process.env.JWT_SECRET?.substring(0, 3) + '...');
// Initialize Passport
app.use(passport.initialize())

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Your frontend URL
  credentials: true // Allow credentials (cookies)
}));

app.use(bodyParser.json());

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});
app.use(express.json());
app.use(cookieParser());

// MongoDB Connection
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
  });
  inviteRouter.use((req, res, next) => {
    console.log('Invite Route:', {
      method: req.method,
      path: req.path,
      query: req.query,
      body: req.body,
      headers: req.headers
    });
    next();
  });
// Routes
app.use('/api', inviteRouter);
app.use('/api/auth', authRoutes);
app.use('/api/users',userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/account", accountRouter);
app.use("/api/projects",projectRouter);
app.use("/api/todos",todoRouter);
app.use("/api/event",eventRouter)

// Basic route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
