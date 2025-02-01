"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { format } from "date-fns";

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

export default function TodoDetail({ params }: { params: { projectId: string; todoId: string } }) {
    const [todo, setTodo] = useState<Todo | null>(null);
    const [newTaskName, setNewTaskName] = useState("");
    const [newTaskDescription, setNewTaskDescription] = useState("");
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const user = useSelector((state: RootState) => state.user);

    useEffect(() => {
        fetchTodo();
    }, [params.todoId]);

    const fetchTodo = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/todos/todo/${params.todoId}`);
            setTodo(response.data);
        } catch (error) {
            console.error("Error fetching todo:", error);
        }
    };

    const addTask = async () => {
        if (!newTaskName.trim()) return;

        try {
            const response = await axios.post(`http://localhost:5000/api/todos/${params.todoId}/task`, {
                name: newTaskName,
                description: newTaskDescription,
                isCompleted: false
            });

            setTodo(response.data);
            setNewTaskName("");
            setNewTaskDescription("");
            setOpen(false);
        } catch (error) {
            console.error("Error adding task:", error);
        }
    };

    const toggleTaskStatus = async (index: number) => {
        if (!todo) return;

        try {
            const response = await axios.patch(`http://localhost:5000/api/todos/${params.todoId}/task/${index}`, {
                isCompleted: !todo.tasks[index].isCompleted
            });

            setTodo(response.data);
        } catch (error) {
            console.error("Error updating task:", error);
        }
    };

    if (!todo) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    const completedTasks = todo.tasks.filter(task => task.isCompleted).length;
    const totalTasks = todo.tasks.length;
    const progress = totalTasks ? (completedTasks / totalTasks) * 100 : 0;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-6">
                <Button
                    onClick={() => router.back()}
                    variant="outline"
                    className="mb-6"
                >
                    ← Back to Todo Lists
                </Button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h1 className="text-2xl font-bold mb-2">{todo.title}</h1>
                {todo.description && (
                    <p className="text-gray-600 mb-4">{todo.description}</p>
                )}
                
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <span>Created by {todo.creator.username}</span>
                    <span>•</span>
                    <span>{format(new Date(todo.createdAt), "MMM d, yyyy")}</span>
                </div>

                <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Progress</span>
                        <span>{completedTasks}/{totalTasks} tasks completed</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                        <div
                            className="h-full bg-green-500 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>Add New Task</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Task</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4 mt-4">
                            <Input
                                placeholder="Task Name"
                                value={newTaskName}
                                onChange={(e) => setNewTaskName(e.target.value)}
                            />
                            <Textarea
                                placeholder="Task Description (optional)"
                                value={newTaskDescription}
                                onChange={(e) => setNewTaskDescription(e.target.value)}
                                className="min-h-[100px]"
                            />
                            <Button onClick={addTask} className="w-full">
                                Add Task
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="space-y-4">
                {todo.tasks.map((task, index) => (
                    <div
                        key={index}
                        className="flex items-start gap-4 p-4 bg-white rounded-lg border"
                    >
                        <Checkbox
                            checked={task.isCompleted}
                            onCheckedChange={() => toggleTaskStatus(index)}
                            className="mt-1"
                        />
                        <div className="flex-1">
                            <h3 className={`font-medium ${task.isCompleted ? 'line-through text-gray-500' : ''}`}>
                                {task.name}
                            </h3>
                            {task.description && (
                                <p className={`mt-1 text-sm ${task.isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {task.description}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}