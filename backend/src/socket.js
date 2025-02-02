// backend/socket.js
const socketIO = require('socket.io');
const GroupChat = require('./models/GroupChat');
const User = require('./models/User');

require('dotenv').config();


function initializeGroupChat(server) {
  const io = socketIO(server, {
    
    cors: {
      origin: 'http://localhost:3000',
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Add connection logging
  io.on('connection', (socket) => {
    console.log('New client connected', socket.id);

    socket.on('disconnect', () => {
      console.log('Client disconnected', socket.id);
    });

    // Existing event handlers with added logging
    socket.on('join-project-chat', async (projectId) => {
      console.log(`Socket ${socket.id} joining project chat:`, projectId);
      socket.join(`project-${projectId}`);
    });

    // Handle new message
    socket.on('send-message', async ({ projectId, content, senderId }) => {
      try {
        console.log("send mssage socket active")
        const chat = await GroupChat.findOne({ project: projectId });
        const sender = await User.findById(senderId);
        console.log(sender,"user in the sendmsg socket")
        const newMessage = {
          sender: senderId,
          content,
          readBy: [senderId]
        };

        chat.messages.push(newMessage);
        chat.lastActivity = Date.now();
        await chat.save();

        io.to(`project-${projectId}`).emit('new-message', {
          ...newMessage,
          sender: {
            _id: sender._id,
            username: sender.username
          },
          createdAt: new Date()
        });
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });

    // Handle message read status
    socket.on('mark-as-read', async ({ projectId, messageIds, userId }) => {
      try {
        await GroupChat.updateMany(
          { project: projectId, 'messages._id': { $in: messageIds } },
          { $addToSet: { 'messages.$[].readBy': userId } }
        );
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    socket.on('test-connection', (data) => {
      console.log('Test connection received:', data);
      socket.emit('test-response', { message: 'Server received your test' });
    });
  });
  // backend/socket.js - Add this at the bottom of your socket connection handler


  return io;
}

module.exports = initializeGroupChat;