"use client"
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Megaphone, 
  CheckSquare, 
  FolderOpen,
  MessageSquare,
  Calendar,
  Loader2
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import ProjectMemberDialog from '@/components/project-components/ProjectMemberDialog';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

interface Member {
  _id: string;
  username: string;
  email: string;
}

interface Task {
  task_name: string;
  task_description: string;
  deadline?: string;
  is_completed: boolean;
}

interface Project {
  _id: string;
  name: string;
  members: Member[];
  progress?: number;
  status?: string;
  lastUpdated?: string;
}

interface ProjectMetrics {
  total_tasks: number;
  completed_tasks: number;
  completion_rate: number;
  delayed_tasks: number;
  high_risk_tasks: number;
  recommendations: string[];
}

interface ProjectPageProps {
  params: {
    projectId: string;
  };
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getRandomPastelColor(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = hash % 360;
  return `hsl(${h}, 70%, 85%)`;
}

export default function ProjectPage() {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const user = useSelector((state: RootState) => state.user);
  const { toast } = useToast();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [riskAnalysis, setRiskAnalysis] = useState<ProjectMetrics | null>(null);
  const [riskLoading, setRiskLoading] = useState(false);
  const [error, setError] = useState<null>(null);

  const handleDocsNavigate=()=>{
    router.push(`/docsnfiles/${params.projectId}`); 
  }

  const handleMsgBoardNavigate = () => {
      router.push(`/message-board/${params.projectId}`); // Replace with actual projectId
  };

  const handleToDoNavigate= ()=>{
    router.push(`/todos/${params.projectId}`)
  }
  const handleEventNavigate= ()=>{
    router.push(`/calendar/${params.projectId}`)
  }
  const handleGrpChatNavigate= ()=>{
    router.push(`/group-chats/${params.projectId}`)
  }
  const params = useParams();
  console.log(params,"params"); 

  const handleMemberUpdate = async (selectedMembers: string[]) => {
    try {
      const response = await fetch(`http://localhost:5000/api/projects/${project?._id}/members`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ members: selectedMembers })
      });

      if (response.ok) {
        const updatedProject = await response.json();
        setProject(updatedProject.project);
      }
    } catch (error) {
      console.error('Failed to update project members:', error);
    }
  };
  const analyzeRisk = async (e: React.FormEvent): Promise<ProjectMetrics | null> => {
    e.preventDefault();
    setRiskLoading(true);
  
    console.log(tasks, "tasks when called analysis");
  
    try {
      // Adjusted the payload to not use `JSON.stringify()` when sending the `tasks` array directly
      const response = await axios.post('/api/analyze', { tasks });
      console.log(response,"response from anaylzing")
      // Assuming response.data contains the analyzed result
      setRiskAnalysis(response.data[0]);
      return response.data;
    } catch (err) {
      console.error(err);
      return null; // You might want to handle this better depending on the use case
    } finally {
      setRiskLoading(false);
    }
  };
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.get<Project>(
          `http://localhost:5000/api/projects/org/${params.projectId}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }
        );
        setProject(response.data);
      } catch (error) {
        console.error('Error fetching project:', error);
        toast({
          title: "Error",
          description: "Failed to load project details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
      const fetchTasks = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/projects/status/${params.projectId}/tasks`);
            if (!response.ok) throw new Error('Failed to fetch tasks');
            const data = await response.json();
            setTasks(data);
        } catch (err) {
            console.log(err)
        }
    };

    if (params.projectId) {
      fetchProject();
      fetchTasks();
    }
  }, [params.projectId, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-xl font-semibold">Project not found</h2>
        <p className="text-gray-600">The project you're looking for doesn't exist or you don't have access.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Project Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <Button variant="ghost" size="icon">
            <span className="sr-only">More options</span>
            <svg
              width="15"
              height="3"
              viewBox="0 0 15 3"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-gray-600"
            >
              <path
                d="M1.5 3C2.32843 3 3 2.32843 3 1.5C3 0.671573 2.32843 0 1.5 0C0.671573 0 0 0.671573 0 1.5C0 2.32843 0.671573 3 1.5 3Z"
                fill="currentColor"
              />
              <path
                d="M7.5 3C8.32843 3 9 2.32843 9 1.5C9 0.671573 8.32843 0 7.5 0C6.67157 0 6 0.671573 6 1.5C6 2.32843 6.67157 3 7.5 3Z"
                fill="currentColor"
              />
              <path
                d="M13.5 3C14.3284 3 15 2.32843 15 1.5C15 0.671573 14.3284 0 13.5 0C12.6716 0 12 0.671573 12 1.5C12 2.32843 12.6716 3 13.5 3Z"
                fill="currentColor"
              />
            </svg>
          </Button>
        </div>

        {/* Progress Section */}
        {/* <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="rotate-90">
              <span className="block w-4 h-4 bg-green-500 rounded-sm" />
            </div>
            <span className="font-medium">{project.status || 'On track'}</span>
          </div>
          <Progress value={project.progress || 30} className="h-2" />
          <p className="text-sm text-gray-500 mt-2">
            {project.lastUpdated || 'Updated recently'}
          </p>
        </div> */}
        <Card>
                <CardHeader>
                    <h2 className="text-2xl font-bold">Risk Analysis</h2>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <Button 
                            onClick={(e)=>analyzeRisk(e)} 
                            disabled={loading}
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                        >
                            {riskLoading ? 'Analyzing...' : 'Analyze Risk'}
                        </Button>
                    </div>

                    {error && (
                        <div className="text-red-500 mb-4">
                            Error: {error}
                        </div>
                    )}

                    {riskAnalysis && (
                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <h3 className="font-semibold mb-2">Delayed Tasks</h3>
                                <div className="text-2xl font-bold text-blue-600">
                                    {riskAnalysis?.delayed_tasks}
                                </div>
    
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <h3 className="font-semibold mb-2">High Risk Tasks</h3>
                                <div className="text-2xl font-bold text-blue-600">
                                    {riskAnalysis?.high_risk_tasks}
                                </div>
    
                            </div>

                           

                            {riskAnalysis?.recommendations && (
                                <div>
                                    <h3 className="font-semibold mb-2">Recommendations</h3>
                                    <ul className="list-disc pl-5">
                                        {riskAnalysis?.recommendations.map((suggestion, index) => (
                                            <li key={index}>{suggestion}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

        {/* Team Members */}
        <div className="flex items-center gap-2 mb-8">
              <ProjectMemberDialog
            organizationName={user.organizationName}
            projectId={project._id}
            currentMembers={project.members.map(m => m._id)}
            onMemberUpdate={handleMemberUpdate}
          />
          <div className="flex flex-wrap gap-1">
            {project.members.map((member) => (
              <div
                key={member._id}
                className="relative group"
                title={member.username}
              >
                <Avatar className="h-8 w-8 border-2 border-white">
                  <AvatarFallback
                    style={{ backgroundColor: getRandomPastelColor(member.username) }}
                    className="text-gray-700"
                  >
                    {getInitials(member.username)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {member.username}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* Message Board Card */}
        <Card onClick={handleMsgBoardNavigate} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl">Message Board</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="bg-blue-500 rounded-full p-4">
                <Megaphone className="h-8 w-8 text-white" />
              </div>
              <p className="text-gray-600">
                Post announcements, pitch ideas, and keep discussions on-topic.
              </p>
              <Button variant="outline" className="w-full">
                Write a message
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* To-dos Card */}
        <Card onClick={handleToDoNavigate} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl">To-dos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="bg-green-500 rounded-full p-4">
                <CheckSquare className="h-8 w-8 text-white" />
              </div>
              <p className="text-gray-600">
                Organize work across teams. Assign tasks, set due dates, and discuss.
              </p>
              <Button variant="outline" className="w-full">
                Make a to-do list
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Docs & Files Card */}
        <Card onClick={handleDocsNavigate} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl">Docs & Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="bg-yellow-500 rounded-full p-4">
                <FolderOpen className="h-8 w-8 text-white" />
              </div>
              <p className="text-gray-600">
                Share and organize docs, spreadsheets, images, and other files.
              </p>
              <Button variant="outline" className="w-full">
                Add docs & files
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chat Card */}
        <Card onClick={handleGrpChatNavigate} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl">Chat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="bg-cyan-500 rounded-full p-4">
                <MessageSquare className="h-8 w-8 text-white" />
              </div>
              <p className="text-gray-600">
                Chat casually with your team.
              </p>
              <Button variant="outline" className="w-full">
                Start chatting
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Card */}
        <Card onClick={handleEventNavigate} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl">Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="bg-pink-500 rounded-full p-4">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <p className="text-gray-600">
                Set up meetings and manage schedules.
              </p>
              <Button variant="outline" className="w-full">
               Schedule an event
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}