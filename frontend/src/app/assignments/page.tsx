"use client"

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import axios from 'axios';
import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';

interface Task {
  _id: string;
  name: string;
  description?: string;
  isCompleted: boolean;
  deadline?: string;
  assignedTo: { _id: string; username: string };
  todo: { title: string; project: { name: string } };
}

const MyAssignments: React.FC = () => {
const user = useSelector((state: RootState) => state.user); // Assuming you have an authentication hook
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchAssignedTasks = async () => {
      try {
        if(user.email){
        const userresponse= await axios.get(`https://basecamp-c3ay.onrender.com/api/users/user-id?email=${user.email}`)
        const userId=userresponse.data.userId
        const response = await axios.get(`https://basecamp-c3ay.onrender.com/api/todos/tasks/${userId}`);
        setTasks(response.data);
        }
      } catch (error) {
        console.error("Error fetching tasks", error);
      }
    };

    fetchAssignedTasks();
  }, [user]);

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <h1 className="text-2xl font-semibold mb-4">My Assignments</h1>
      {tasks.length === 0 ? (
        <p className="text-gray-500">No tasks assigned to you.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <Card key={task._id} className="shadow-md">
              <CardHeader>
                <CardTitle>{task.name}</CardTitle>
                <Badge variant={task.isCompleted ? "default" : "destructive"}>
                  {task.isCompleted ? "Completed" : "Pending"}
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{task.description || "No description"}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Part of: <strong>{task.todo.title}</strong> in project <strong>{task.todo.project.name}</strong>
                </p>
                {task.deadline && (
                  <p className="text-sm text-red-500 mt-2">Deadline: {new Date(task.deadline).toLocaleDateString()}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAssignments;
