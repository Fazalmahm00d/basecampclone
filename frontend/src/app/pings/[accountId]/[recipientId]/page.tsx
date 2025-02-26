"use client";
import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import axios from 'axios';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Member {
  _id: string;
  username: string;
  email: string;
  profilePicture?: string;
}

interface Message {
  _id: string;
  content: string;
  sender: {
    username:string;
    _id:string;
  }
  sentiment: string;
  recipient: string;
  createdAt: string;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}



const SingleChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const params = useParams();
  const recipientId = params.recipientId as string;
  const accountId = params.accountId as string;
  const user = useSelector((state: RootState) => state.user);
  const [currentUser, setCurrentUser] = useState<{ _id: string; username: string } | null>(null);
  	const [recipient, setRecipient] = useState<Member | null>(null);
  const getSentimentEmoji = (sentiment: string): string => {
    const emojiMap: Record<string, string> = {
      joy: "😊",
      anger: "😠",
      sadness: "😢",
      surprise: "😲",
      neutral: "😐",
    };
    return emojiMap[sentiment] || ""; // Default emoji
  };
  // Fetch user ID
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        if (!user?.email) return;

        const response = await axios.get(`https://basecamp-c3ay.onrender.com/api/users/user-id?email=${encodeURIComponent(user.email)}`);
        if (response.data?.userId) {
          setCurrentUser({ _id: response.data.userId, username: user.name });
          localStorage.setItem('userId', response.data.userId);
        }
      } catch (error) {
        console.error("Error fetching user ID:", error);
      }
    };

    fetchUserId();
  }, [user?.email]);


  
  // Socket connection and message handling
  useEffect(() => {
    if (!currentUser?._id) return;
  
    socketRef.current = io('https://basecamp-c3ay.onrender.com', {
      path: '/direct-chat',
      transports: ['websocket'],
    });
  
    const socket = socketRef.current;
  
    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('register-user', currentUser._id);
    });
  
    socket.on('disconnect', () => {
      setIsConnected(false);
    });
  
    // Listen for received messages
    socket.on('new-direct-message', (newMessage: Message) => {
      console.log('Received new message:', newMessage);
      setMessages(prevMessages => [...prevMessages, newMessage]);
      console.log(messages,"new msg set")
    });
  
    // Confirm message sent to sender (avoid duplicates)
    socket.on('message-sent-confirmation', (sentMessage: Message) => {
      console.log('Message sent confirmation:', sentMessage);
      setMessages(prevMessages => [...prevMessages, sentMessage]);
      console.log(messages,"new msg set")
    });
  
    return () => {
      socket.off('new-direct-message');
      socket.off('message-sent-confirmation');
    };
  }, [currentUser?._id]);
  
  // Fetch messages and recipient details
  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentUser?._id || !recipientId || !accountId) return;

      try {
        const messagesRes = await fetch(`https://basecamp-c3ay.onrender.com/api/direct-messages/messages/${currentUser._id}/${recipientId}?accountId=${accountId}`);
        const messagesData = await messagesRes.json();
        setMessages(messagesData);
        const recipientRes=await fetch(`https://basecamp-c3ay.onrender.com/api/account/${accountId}/members/${recipientId}`)
        const recipientData=await recipientRes.json();

        setRecipient(recipientData.user)
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    

    fetchMessages();
  }, [currentUser?._id, recipientId, accountId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser?._id) return;
  
    try {
      const messageData = {
        recipientId,
        content: newMessage,
        accountId,
        senderId: currentUser._id
      };
  
      // Emit message to backend (No need to update state manually)
      socketRef.current?.emit('send-direct-message', messageData);
  
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  
  

  return (
    <div className="container mx-auto p-4 shadow-xl  max-w-7xl ">
      <div className="border-b p-6  flex items-center justify-between">
      {recipient && (
          <>
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              {recipient.profilePicture ? (
                <img
                  src={recipient.profilePicture}
                  alt={recipient.username}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <Avatar className="h-8 w-8 border-2 border-white">
                  <AvatarFallback
                    className="text-white bg-black"
                  >
                    {getInitials(recipient.username)}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
            <div className="ml-3">
              <p className="font-medium">{recipient.username}</p>
            </div>
          </>
        )}
        <div className="text-sm text-gray-500">{isConnected ? 'Connected' : 'Connecting...'}</div>
      </div>

      <div className="flex-1 overflow-y-auto p-4  h-[400px] space-y-4">
        {messages.map((message) => (
          <div key={message._id} className={`flex ${message.sender._id === currentUser?._id ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] p-3 rounded-lg ${message.sender._id === currentUser?._id ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
              <p>{message.content}</p>
              <span className="text-xs">{new Date(message.createdAt).toLocaleTimeString()}</span>
              <span>{getSentimentEmoji(message?.sentiment)}</span>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} className="border-t p-4 flex">
        <Input type="text" placeholder='Send a message...' value={newMessage} onChange={(e) => {setNewMessage(e.target.value)
         
        }} className="flex-1 p-2 border rounded-lg" />
        <Button  type="submit" className="ml-2 p-2 bg-blue-500 text-white rounded-lg">Send</Button>
      </form>
    </div>
  );
};

export default SingleChatInterface;
