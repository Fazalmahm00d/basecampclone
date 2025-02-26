"use client"


import { Button } from '@/components/ui/button';
import { RootState } from '@/redux/store';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
// components/ChatInterface.tsx
import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Socket, io } from 'socket.io-client';

interface Message {
  _id: string;
  content: string;
  sender: {
    _id: string;
    username: string;
    profilePicture?: string;
  };
  createdAt: string;
  readBy: string[];
}

interface Participant {
  _id: string;
  username: string;
  profilePicture?: string;
}



const ChatInterface= () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const messagesContainerRef = useRef<null | HTMLDivElement>(null);
  const user = useSelector((state: RootState) => state.user);
  const params=useParams();
  const projectId=params.projectId;
  const [currentUser, setCurrentUser] = useState<{ _id: string; username: string } | null>(null);
  const router=useRouter()
  
useEffect(() => {
    const fetchUserId = async () => {
      try {
        if (!user?.email) return; // Ensure email exists before making a request

        const response = await axios.get<{ userId: string }>(
          `https://basecamp-c3ay.onrender.com/api/users/user-id?email=${user.email}`
        );

        console.log(response.data, "user response for ID");

        // Set state with fetched data
        setCurrentUser({ _id: response.data.userId, username: user.name });

      } catch (error) {
        console.error("Error fetching user ID:", error);
      }
    };

    if (user) {
      fetchUserId();
    }
  }, [user]); 

  // Add this to your ChatInterface component for testing

  // Initialize socket connection
  useEffect(() => {
    if (!currentUser?._id) return;

    const socketUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://basecamp-c3ay.onrender.com';
    const newSocket = io(socketUrl, {
       // Match the path from backend
      transports: ['polling', 'websocket'],
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      auth: {
        userId: currentUser._id
      }
    });

    newSocket.on('connect', () => {
      console.log('Connected to group chat:', newSocket.id);
      newSocket.emit('join-project-chat', projectId);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Group chat connection error:', error);
    });

    newSocket.on('new-message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [projectId, currentUser?._id]);

  // Fetch initial messages and participants
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        await Promise.all([
          fetchMessages(1),
          fetchParticipants()
        ]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [projectId]);

  // Fetch messages
  const fetchMessages = async (pageNum: number) => {
    try {
      const response = await fetch(`https://basecamp-c3ay.onrender.com/api/groupchat/projects/${projectId}/chat/messages?page=${pageNum}&limit=50`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      
      const data = await response.json();
      
      if (pageNum === 1) {
        setMessages(data.messages);
      } else {
        setMessages(prev => [...data.messages, ...prev]);
      }
      
      setHasMore(data.hasMore);
      setPage(pageNum);
    } catch (err) {
      throw new Error('Error fetching messages',err);
    }
  };

  // Fetch participants
  const fetchParticipants = async () => {
    try {
      const response = await fetch(`https://basecamp-c3ay.onrender.com/api/groupchat/projects/${projectId}/chat/participants`);
      if (!response.ok) throw new Error('Failed to fetch participants');
      
      const data = await response.json();
      setParticipants(data);
    } catch (err) {
      throw new Error('Error fetching participants',err);
    }
  };

  // Mark message as read
  // const markMessageAsRead = async (messageId: string) => {
  //   try {
  //     await fetch(`https://basecamp-c3ay.onrender.com/api/groupchat/projects/${projectId}/chat/messages/read`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ messageIds: [messageId] }),
  //     });
  //   } catch (err) {
  //     console.error('Error marking message as read:', err);
  //   }
  // };

  // Send message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !currentUser?._id) return;

    try {
      // Emit through socket instead of REST API
      socket.emit('send-message', {
        projectId,
        content: newMessage,
        senderId: currentUser._id
      });

      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  };

  // Load more messages
  const loadMoreMessages = async () => {
    if (!hasMore || isLoading) return;
    try {
      await fetchMessages(page + 1);
    } catch (err) {
      setError(`Failed to load more messages: ${err.message || err}`);
    }
  };

  // Handle scroll to load more messages
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    if (element.scrollTop === 0 && hasMore && !isLoading) {
      loadMoreMessages();
    }
  };

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  return (
    <div className="relative max-w-4xl mx-auto p-4">
      <div className="mb-6">
                <Button
                    onClick={() => router.back()}
                    variant="outline"
                    className="mb-6"
                >
                    ← Back to Project Dashboard
                </Button>
            </div>
      {/* Participants List */}
      <div className="sticky top-0 bg-gray-100 w-full p-4 border-b">
        <h3 className="font-semibold mb-2">Participants</h3>
        <div className="flex flex-wrap gap-2">
          {participants.map((participant) => (
            <div 
              key={participant._id} 
              className="flex items-center gap-2 bg-white rounded-full px-3 py-1"
            >
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">
                {participant.username.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm">{participant.username}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        onScroll={handleScroll}
      >
        {isLoading && <div className="text-center">Loading...</div>}
        
        {hasMore && (
          <button 
            onClick={loadMoreMessages}
            className="w-full text-blue-500 hover:text-blue-600"
          >
            Load more messages
          </button>
        )}

        {messages.map((message) => (
          <div
            key={message._id}
            className={`flex items-start gap-2 ${
              message.sender._id === currentUser?._id ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
              {message.sender.username.charAt(0).toUpperCase()}
            </div>
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.sender._id === currentUser?._id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100'
              }`}
            >
              <p className="text-sm font-semibold mb-1">{message.sender.username}</p>
              <p>{message.content}</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs opacity-70">
                  {new Date(message.createdAt).toLocaleTimeString()}
                </p>
                <span className="text-xs opacity-70">
                  {message.readBy.length} read
                </span>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={sendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 rounded-lg border p-2"
            placeholder="Type your message..."
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;