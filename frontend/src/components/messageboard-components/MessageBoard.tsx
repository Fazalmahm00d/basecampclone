// components/MessageBoard.tsx
import { useEffect, useState } from 'react';
import RichTextEditor from './RichTextEditor';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { RootState } from '@/redux/store';
import axios from 'axios';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@radix-ui/react-dialog';
import { Button } from 'react-day-picker';
import { DialogHeader } from '../ui/dialog';
import { useParams } from 'next/navigation';
import { Message } from 'postcss';

export default function MessageBoard() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [open, setOpen] = useState(false);
  const params = useParams();

  useEffect(() => {
      axios.get(`https://basecamp-c3ay.onrender.com/api/messages/${params.projectId}`)
          .then(response => setMessages(response.data))
          .catch(error => console.error("Error fetching messages:", error));
  }, [params.projectId]);

  const createMessage = async () => {
      const userresponse = await axios.get(`https://basecamp-c3ay.onrender.com/api/users/user-id?email=${user.email}`)
      const userId = userresponse.data.userId
      const messageData = { 
          content: newMessage, 
          sender: userId, 
          project: params.projectId,
          subject: subject,
          category: category
      };
      
      const response = await axios.post("https://basecamp-c3ay.onrender.com/api/messages", messageData);
      setMessages([response.data, ...messages]);
      setNewMessage("");
      setSubject("");
      setCategory("");
      setOpen(false);
  };

  return (
      <div className="p-6 max-w-4xl mx-auto">
          <h1 className="text-2xl font-semibold text-center mb-6">📌 Message Board</h1>

          <div className="flex justify-center mb-4">
              <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                      <Button className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md">
                          New Message
                      </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[800px]">
                      <DialogHeader>
                          <DialogTitle>Create a New Message</DialogTitle>
                      </DialogHeader>

                      <RichTextEditor 
                          hidden={false}
                          value={newMessage}
                          subject={subject}
                          category={category}
                          onChange={setNewMessage}
                          onSubjectChange={setSubject}
                          onCategoryChange={setCategory}
                      />
                      
                      <Button onClick={createMessage} className="mt-4 w-full">
                          Post Message
                      </Button>
                  </DialogContent>
              </Dialog>
          </div>

          <ul className="space-y-4">
              {messages.map(msg => (
                  <li key={msg._id} 
                      onClick={() => router.push(`/message-board/${params.projectId}/${msg._id}`)}
                      className="p-4 border rounded-lg cursor-pointer hover:bg-gray-100 transition">
                      {msg.category && (
                          <span className="inline-block px-2 py-1 text-xs font-semibold bg-gray-100 rounded mr-2">
                              {msg.category}
                          </span>
                      )}
                      
                      <strong className="text-blue-600">{msg.sender.username}</strong>
                      
                      {msg.subject && (
                          <h3 className="text-lg font-medium mt-1">{msg.subject}</h3>
                      )}
                      
                      <div dangerouslySetInnerHTML={{ __html: msg.content }} className="mt-2" />
                      
                      {msg.replies.length > 0 && (
                          <p className="text-sm text-gray-500 mt-2">{msg.replies.length} Replies</p>
                      )}
                  </li>
              ))}
          </ul>
      </div>
  );
}