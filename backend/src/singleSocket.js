// server/singleSocket.js
const socketIO = require('socket.io');
const DirectMessage = require('./models/DirectMessage');
const User = require('./models/User'); // Import User model

function initializeDirectChat(server) {
  const io = socketIO(server, {
    cors: {
      origin: 'http://localhost:3000',
      methods: ["GET", "POST"],
      credentials: true
    },
    path: '/direct-chat'
  });

  const connectedUsers = new Map(); // Store user socket mappings

  io.on('connection', (socket) => {
    console.log('Direct chat socket connected:', socket.id);

    // Store user connection
    socket.on('register-user', (userId) => {
      connectedUsers.set(userId, socket.id);
      socket.userId = userId;
      console.log(`User ${userId} registered with socket ${socket.id}`);
    });

    // Handle direct messages
    socket.on('send-direct-message', async ({ senderId, recipientId, content, accountId }) => {
        try {
          const message = new DirectMessage({
            sender: senderId,
            recipient: recipientId,
            content,
            accountId
          });
          await message.save();
      
          // Fetch sender details
          const senderDetails = await User.findById(senderId).select('username profilePicture');
      
          const messageData = {
            ...message.toObject(),
            senderDetails
          };
      
          // Emit message to recipient if online
          const recipientSocketId = connectedUsers.get(recipientId);
          if (recipientSocketId) {
            io.to(recipientSocketId).emit('new-direct-message', messageData);
          }
      
          // Emit only once to sender
          io.to(socket.id).emit('message-sent-confirmation', messageData);
      
        } catch (error) {
          console.error('Error sending direct message:', error);
          socket.emit('message-error', { error: error.message });
        }
      });
      
      
    // Notify sender when messages are read
    socket.on('mark-messages-read', async ({ senderId }) => {
      try {
        await DirectMessage.updateMany(
          { sender: senderId, recipient: socket.userId, readAt: null },
          { readAt: new Date() }
        );

        // Notify sender that messages were read
        const senderSocketId = connectedUsers.get(senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit('messages-read', { by: socket.userId, at: new Date() });
        }
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    socket.on('disconnect', () => {
      if (socket.userId) {
        connectedUsers.delete(socket.userId);
      }
      console.log('Direct chat socket disconnected:', socket.id);
    });
  });

  io.connectedUsers = connectedUsers;
  return io;
}

module.exports = initializeDirectChat;
