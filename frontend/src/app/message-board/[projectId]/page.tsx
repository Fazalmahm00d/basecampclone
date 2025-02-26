"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import RichTextEditor from "@/components/messageboard-components/RichTextEditor";
import { toast } from "sonner";


interface Message {
    _id: string;
    content: string;
    sender: { username: string };
    replies: Message[];
    createdAt: string;
}

export default function MessageBoard() {
    const router = useRouter();
    const user = useSelector((state: RootState) => state.user);
    console.log(user,"user")
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [open, setOpen] = useState(false);  // Controls modal state
    const params = useParams();
    useEffect(() => {
        axios.get(`https://basecamp-c3ay.onrender.com/api/messages/${params.projectId}`)
            .then(response => setMessages(response.data))
            .catch(error => console.error("Error fetching messages:", error));
    }, [params.projectId]);

    const createMessage = async () => {
        // if (!newMessage.trim()) return;
        const userresponse= await axios.get(`https://basecamp-c3ay.onrender.com/api/users/user-id?email=${user.email}`)
        const userId=userresponse.data.userId
        const messageData = { content: newMessage, sender: userId, project: params.projectId };
        const response = await axios.post("https://basecamp-c3ay.onrender.com/api/messages", messageData);

        setMessages([response.data, ...messages]); // Add new message at the top
        setNewMessage("");
        setOpen(false);  // Close modal after submission
        toast.info("new message created")
    };

    return (
        <div className="p-4 max-w-4xl mx-auto bg-stone-200 h-screen">
            <div className="mb-6">
                <Button
                    onClick={() => router.back()}
                    variant="outline"
                    className="mb-6"
                >
                    ← Back to Project Dashboard
                </Button>
            </div>
            <h1 className="text-2xl font-semibold text-center mb-6">📌 Message Board</h1>
            
            {/* New Message Button */}
            <div className="flex justify-center mb-4">
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md">New Message</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create a New Message</DialogTitle>
                        </DialogHeader>

                       
                        <RichTextEditor value={newMessage} onChange={setNewMessage}/>
                        
                        <Button onClick={createMessage} className="mt-4 w-full">Post Message</Button>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Messages List */}
            <ul className="space-y-4">
                {messages.map(msg => (
                    <li key={msg._id} 
                        onClick={() => router.push(`/message-board/${params.projectId}/${msg._id}`)}
                        className="p-4 border  rounded-lg cursor-pointer hover:bg-gray-100 transition">
                        
                        <strong className="text-blue-600">{msg.sender.username}</strong>:  
                        <div dangerouslySetInnerHTML={{ __html: msg.content }} className="mt-2 line-clamp-3 " />
                        
                        {msg.replies.length > 0 && (
                            <p className="text-sm text-gray-500">{msg.replies.length} Replies</p>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}
