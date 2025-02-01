"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface Task {
    name: string;
    description: string;
    isCompleted: boolean;
}

interface Todo {
    _id: string;
    title: string;
    description: string;
    tasks: Task[];
    creator: { username: string };
    createdAt: string;
}

export default function TodoList() {
    const router = useRouter();
    const user = useSelector((state: RootState) => state.user);
    const [todos, setTodos] = useState<Todo[]>([]);
    const [newTodoTitle, setNewTodoTitle] = useState("");
    const [newTodoDescription, setNewTodoDescription] = useState("");
    const [open, setOpen] = useState(false);
    const params = useParams();

    useEffect(() => {
        axios.get(`http://localhost:5000/api/todos/${params.projectId}`)
            .then(response => setTodos(response.data))
            .catch(error => console.error("Error fetching todos:", error));
    }, [params.projectId]);

    const createTodo = async () => {
        if (!newTodoTitle.trim()) return;

        try {
            const userResponse = await axios.get(`http://localhost:5000/api/users/user-id?email=${user.email}`);
            const userId = userResponse.data.userId;

            const todoData = {
                title: newTodoTitle,
                description: newTodoDescription,
                creator: userId,
                project: params.projectId,
                tasks: []
            };

            const response = await axios.post("http://localhost:5000/api/todos", todoData);
            setTodos([response.data, ...todos]);
            setNewTodoTitle("");
            setNewTodoDescription("");
            setOpen(false);
        } catch (error) {
            console.error("Error creating todo:", error);
        }
    };

    const getCompletedTaskCount = (tasks: Task[]) => {
        return tasks.filter(task => task.isCompleted).length;
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
             <div className="mb-6">
                <Button
                    onClick={() => router.back()}
                    variant="outline"
                    className="mb-6"
                >
                    ← Back to Project Dashboard
                </Button>
            </div>
            <h1 className="text-2xl font-semibold text-center mb-6">📋 Todo List</h1>

            <div className="flex justify-center mb-4">
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md">
                            New Todo List
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create a New Todo List</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4 mt-4">
                            <Input
                                placeholder="Todo List Title"
                                value={newTodoTitle}
                                onChange={(e) => setNewTodoTitle(e.target.value)}
                            />
                            <Textarea
                                placeholder="Description (optional)"
                                value={newTodoDescription}
                                onChange={(e) => setNewTodoDescription(e.target.value)}
                                className="min-h-[100px]"
                            />
                            <Button onClick={createTodo} className="w-full">
                                Create Todo List
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <ul className="space-y-4">
                {todos.map(todo => (
                    <li
                        key={todo._id}
                        onClick={() => router.push(`/todos/${params.projectId}/${todo._id}`)}
                        className="p-4 border rounded-lg cursor-pointer hover:bg-gray-100 transition"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-semibold">{todo.title}</h3>
                                {todo.description && (
                                    <p className="text-gray-600 mt-1">{todo.description}</p>
                                )}
                                <p className="text-sm text-gray-500 mt-2">
                                    Created by {todo.creator.username}
                                </p>
                            </div>
                            <div className="text-sm text-gray-500">
                                {getCompletedTaskCount(todo.tasks)}/{todo.tasks.length} tasks completed
                            </div>
                        </div>
                        <div className="mt-3 h-2 bg-gray-200 rounded-full">
                            <div
                                className="h-full bg-green-500 rounded-full"
                                style={{
                                    width: `${todo.tasks.length ? (getCompletedTaskCount(todo.tasks) / todo.tasks.length) * 100 : 0}%`
                                }}
                            />
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}