// components/MessageThread.tsx
import { useEffect, useState } from 'react';

export default function MessageThread({ projectId }: { projectId: string }) {
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const fetchMessages = async () => {
      const response = await fetch(`/api/messages?projectId=${projectId}`);
      const data = await response.json();
      setMessages(data);
    };
    
    fetchMessages();
  }, [projectId]);

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div key={message._id} className="bg-white p-4 rounded-lg shadow">
          <div dangerouslySetInnerHTML={{ __html: message.content }} />
          <div className="mt-2 ml-8 border-l-2 border-gray-200 pl-4">
            {message.replies?.map((reply: any) => (
              <div key={reply._id} className="py-2">
                <div dangerouslySetInnerHTML={{ __html: reply.content }} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}