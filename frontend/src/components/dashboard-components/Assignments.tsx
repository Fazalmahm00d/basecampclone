"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "../ui/badge";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useEffect, useState } from "react";
import axios from "axios";
import { AlertCircle, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";


interface Task {
  _id: string;
  name: string;
  description?: string;
  isCompleted: boolean;
  deadline?: string;
  assignedTo: { _id: string; username: string };
  todo: { title: string; project: { name: string } };
}


export default function Assignments() {

  const user = useSelector((state: RootState) => state.user); // Assuming you have an authentication hook
  const [tasks, setTasks] = useState<Task[]>([]);
  useEffect(() => {
    if (!user) return;

    const fetchAssignedTasks = async () => {
      try {
        if(user.email){
        const userresponse= await axios.get(`http://localhost:5000/api/users/user-id?email=${user.email}`)
        const userId=userresponse.data.userId
        const response = await axios.get(`http://localhost:5000/api/todos/tasks/${userId}`);
        setTasks(response.data);
        }
      } catch (error) {
        toast({title:"Error fetching tasks"})
        console.error("Error fetching tasks", error);
      }
    };

    fetchAssignedTasks();
  }, [user]);
  const incompleteTasks = tasks?.filter(task => !task.isCompleted);

  return (
    <div className="p-4">
      <h2 className="font-bold mb-4">Your Assignments</h2>
         
          {tasks.length === 0 ? (
        <p className="text-gray-500">You don’t have any assignments right now. To-dos and cards assigned to you will show up here.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {incompleteTasks.map((task) => (
        <Card key={task._id} className="shadow-sm">
          <CardHeader className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CardTitle className="text-sm font-medium">{task.name}</CardTitle>
                {task.deadline && (
                  <div className="flex items-center text-xs text-red-500">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(task.deadline).toLocaleDateString()}
                  </div>
                )}
              </div>
              {new Date(task.deadline) < new Date() && !task.isCompleted && (
                <Badge variant="destructive" className="flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Overdue
                </Badge>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {task.todo.title} • {task.todo.project.name}
            </div>
          </CardHeader>
        </Card>
      ))}
      {incompleteTasks.length === 0 && (
        <div className="text-center text-gray-500 py-4">
          No incomplete tasks
        </div>
      )}
    </div>
     )}
     </div>
    )
}

