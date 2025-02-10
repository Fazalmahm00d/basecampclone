"use client";

import React from "react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import MemberSelect from "@/components/todo-components/MemberSelect";
import { Badge } from "@/components/ui/badge";

interface Task {
    name: string;
    description: string;
    isCompleted: boolean;
    deadline: Date;
    assignedTo: {
        username:string;
    }
}

interface Todo {
    _id: string;
    title: string;
    description: string;
    tasks: Task[];
    creator: { username: string };
    createdAt: string;
}

interface Member {
    _id: string;
    username?: string;
    email: string;
}

// interface PageProps {
//     params: {
//         projectId: string;
//         todoId: string;
//     }
// }

export default function TodoDetail() {
    const params=useParams();
    const {projectId,todoId}=params
    const [todo, setTodo] = useState<Todo | null>(null);
    const [newTaskName, setNewTaskName] = useState("");
    const [newTaskDescription, setNewTaskDescription] = useState("");
    const [date, setDate] = useState<Date>();
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const user = useSelector((state: RootState) => state.user);
    const [selectedMember, setSelectedMember] = useState<string>("");
    const [members, setMembers] = useState<Member[]>([]);

    const fetchMembers = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/projects/org/${projectId}`);
            const project = await response.json();
            setMembers(project.members);
        } catch (error) {
            console.error('Error fetching project members:', error);
        }
    };

    useEffect(() => {
        if (projectId) {
            fetchMembers();
        }
    }, [projectId]);

    const handleMemberSelect = (memberId: string) => {
        setSelectedMember(memberId);
    };

    useEffect(() => {
        fetchTodo();
    }, [todoId]);

    const fetchTodo = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/todos/todo/${todoId}`);
            setTodo(response.data);
        } catch (error) {
            console.error("Error fetching todo:", error);
        }
    };

    const addTask = async () => {
        if (!newTaskName.trim()) return;

        try {
            const response = await axios.post(`http://localhost:5000/api/todos/${todoId}/task`, {
                name: newTaskName,
                description: newTaskDescription,
                isCompleted: false,
                deadline: date,
                assignedTo: selectedMember
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
            const response = await axios.patch(`http://localhost:5000/api/todos/${todoId}/task/${index}`, {
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
                                className="min-h-[100px] max-h-[400px] overflow-y-auto"
                            />
                            <MemberSelect 
                                members={members}
                                selectedMember={selectedMember}
                                onSelect={handleMemberSelect}
                            />

                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-[280px] justify-start text-left font-normal",
                                            !date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
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
                            <div className="flex justify-between items-center">
                                <h3 className={`font-medium ${task.isCompleted ? 'line-through text-gray-500' : ''}`}>
                                    {task.name}
                                </h3>
                                
                                {task.deadline && (
                                    <p className={`mt-1 text-sm ${task.isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {format(new Date(task.deadline), 'PPP')}
                                    </p>
                                )}
                            </div>
                            {task.description && (
                                <p className={`mt-1 text-sm ${task.isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {task.description}
                                </p>
                            )}
                            <div className="flex gap-2 items-center ">
                                Assigned To:
                            {task.assignedTo && (
                                    <Badge>{task.assignedTo.username}</Badge>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}