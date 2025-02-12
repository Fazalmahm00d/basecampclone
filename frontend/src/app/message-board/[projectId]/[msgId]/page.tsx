"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { format } from "date-fns";
import RichTextEditor from "@/components/messageboard-components/RichTextEditor";
import AiButton from "@/components/animata/button/ai-button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface Reply {
  content: string;
  sender: { username: string };
  createdAt: string;
}

interface Message {
  _id: string;
  content: string;
  subject?: string;
  category?: string;
  sender: { username: string };
  replies: Reply[];
  reactions: { emoji: string; users: string[] }[];
  createdAt: string;
}

export default function MessageDetail({ params }: { params: { projectId: string; msgId: string } }) {
    const [message, setMessage] = useState<Message | null>(null);
    const [summary, setSummary] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState("");
    const [isReplying, setIsReplying] = useState(false);
    const router = useRouter();
    const user = useSelector((state: RootState) => state.user);

    useEffect(() => {
        fetchMessage();
    }, [params.msgId]);
    const handleSummary = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSummary(null);
    
        try {
          const response = await axios.post('/api/summarize', {
            messages: message?.content,
          });
    
          // Get the summary from the response
          setSummary(response.data.summary);
        } catch (err) {
          setError('Failed to summarize the message.');
        } finally {
          setLoading(false);
        }
      };

    const fetchMessage = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/messages/message/${params.msgId}`);
            setMessage(response.data);
        } catch (error) {
            console.error("Error fetching message:", error);
        }
    };

    const addReply = async () => {
        if (!replyContent.trim()) return;

        try {
            const userResponse = await axios.get(`http://localhost:5000/api/users/user-id?email=${user.email}`);
            const userId = userResponse.data.userId;

            // Add reply to the existing message
            const response = await axios.post(`http://localhost:5000/api/messages/${params.msgId}/reply`, {
                content: replyContent,
                sender: userId
            });

            // Refresh the message to get the updated replies
            await fetchMessage();
            
            setReplyContent("");
            setIsReplying(false);
        } catch (error) {
            console.error("Error adding reply:", error);
        }
    };

    if (!message) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 bg-stone-200">
            <div className="mb-6">
                <Button
                    onClick={() => router.back()}
                    variant="outline"
                    className="mb-6"
                >
                    ← Back to Messages
                </Button>
            </div>

            {/* Main Message */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="flex items-center gap-4 mb-4">
                    <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center">
                        <span className="text-blue-600 text-xl font-semibold">
                            {message.sender.username[0].toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold">{message.sender.username}</h1>
                        <p className="text-sm text-gray-500">
                            {format(new Date(message.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                    </div>
                </div>

                {message.category && (
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-3">
                        {message.category}
                    </span>
                )}

                {message.subject && (
                    <h2 className="text-2xl font-bold mb-4">{message.subject}</h2>
                )}

                <div 
                    dangerouslySetInnerHTML={{ __html: message.content }} 
                    className="prose max-w-none mb-6"
                />

                <div className="border-t pt-4">
                    <Button
                        onClick={() => setIsReplying(!isReplying)}
                        variant="outline"
                    >
                        {isReplying ? 'Cancel Reply' : 'Reply'}
                    </Button>
                </div>
            </div>
            {/* <Button onClick={handleSummary}>{loading ? 'Summarizing...' : 'Summarize Message'}</Button> */}
           <AiButton text="Generate summary" clickhandler={handleSummary} loading={loading}/>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {summary && (
                <Card>
                    <CardHeader>Summary:</CardHeader>
                    <CardContent>{summary}</CardContent>
                </Card>
            )}
            {/* Reply Form */}
            {isReplying && (
                <div className="mb-8 bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Write a Reply</h3>
                    <RichTextEditor
                        value={replyContent}
                        onChange={setReplyContent}
                        onSubjectChange={() => {}}
                        onCategoryChange={() => {}}
                        subject=""
                        category=""
                    />
                    <div className="flex gap-2 mt-4">
                        <Button onClick={addReply}>
                            Post Reply
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={() => {
                                setIsReplying(false);
                                setReplyContent("");
                            }}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            )}

            {/* Replies Section */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">
                    {message.replies.length} {message.replies.length === 1 ? 'Reply' : 'Replies'}
                </h2>
                
                {message.replies.map((reply, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-sm p-6 border">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center">
                                <span className="text-gray-600 font-semibold">
                                    {reply.sender.username[0].toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <p className="font-medium">{reply.sender.username}</p>
                                <p className="text-sm text-gray-500">
                                    {format(new Date(reply.createdAt), "MMM d, yyyy 'at' h:mm a")}
                                </p>
                            </div>
                        </div>
                        <div 
                            dangerouslySetInnerHTML={{ __html: reply.content }}
                            className="prose max-w-none ml-11"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}