"use client"
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getCookie } from '../../utils/getCookies';
import { 
  Megaphone, 
  CheckSquare, 
  FolderOpen,
  MessageSquare,
  Calendar,
  Loader2,
  MoreVertical
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import ProjectMemberDialog from '@/components/project-components/ProjectMemberDialog';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import AiButton from '@/components/animata/button/ai-button';
import MemberSelect from '@/components/todo-components/MemberSelect';

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
  const params = useParams();
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
  
 

  const handleMemberUpdate = async (selectedMembers: string[]) => {
    try {
      const response = await fetch(`https://basecamp-c3ay.onrender.com/api/projects/${project?._id}/members`, {
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
  
  useEffect(() => {
    const token = getCookie('token');
    const fetchProject = async () => {
      try {
        const response = await axios.get<Project>(
          `https://basecamp-c3ay.onrender.com/api/projects/org/${params.projectId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
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
            const response = await fetch(`https://basecamp-c3ay.onrender.com/api/projects/status/${params.projectId}/tasks`);
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
  }, [params.projectId,toast,project]);

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
    <div className="container mx-auto p-4 max-w-7xl bg-stone-200">
  {/* Project Header */}
  <div className="mb-8">
    <div className="flex justify-between items-center mb-4">
      <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
      <Button variant="ghost" size="icon">
        <span className="sr-only">More options</span>
        <MoreVertical className="h-5 w-5 text-gray-600" />
      </Button>
    </div>

    {/* Risk Analysis Section */}
    {/* <Card className=" shadow-md">
      <CardHeader>
        <h2 className="text-2xl font-bold text-gray-900">Risk Analysis</h2>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <AiButton text="Analyze Risk" clickhandler={analyzeRisk} loading={loading} />
        </div>

        {error && <div className="text-red-500 mb-4">Error: {error}</div>}

        {riskAnalysis && (
          <div className="space-y-4">
            <div className="p-4 bg-neutral-100 rounded-lg">
              <h3 className="font-semibold mb-2">Delayed Tasks</h3>
              <div className="text-2xl font-bold text-emerald-500">{riskAnalysis?.delayed_tasks}</div>
            </div>
            <div className="p-4 bg-neutral-100 rounded-lg">
              <h3 className="font-semibold mb-2">High Risk Tasks</h3>
              <div className="text-2xl font-bold text-emerald-500">{riskAnalysis?.high_risk_tasks}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card> */}

    {/* Team Members */}
    <div className="flex items-center gap-2 my-8">
      <ProjectMemberDialog 
        organizationName={user.organizationName} 
        projectId={project._id} 
        currentMembers={project.members.map(m => m._id)} 
        onMemberUpdate={handleMemberUpdate} 
      />
      <div className="flex flex-wrap gap-1">
        {project?.members?.map((member) => (
          <div key={member?._id} className="relative group" title={member?.username}>

            {member?.username &&
            <Avatar className="h-8 w-8 border-2 border-white">
              <AvatarFallback 
                style={{ backgroundColor: getRandomPastelColor(member?.username) }} 
                className="text-gray-700"
              >
                {getInitials(member?.username)}
              </AvatarFallback>
            </Avatar>
            }
          </div>
        ))}
      </div>
    </div>
  </div>

  {/* Main Grid Layout */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
    {/* Message Board */}
    <Card onClick={handleMsgBoardNavigate} className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-xl text-gray-900">Message Board</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center text-center gap-4">
          <div className="bg-amber-400 rounded-full p-4">
            <Megaphone className="h-8 w-8 text-white" />
          </div>
          <p className="text-gray-600">Post announcements and keep discussions organized.</p>
          <Button variant="outline" className="w-full">Write a message</Button>
        </div>
      </CardContent>
    </Card>

    {/* To-dos */}
    <Card onClick={handleToDoNavigate} className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-xl text-gray-900">To-dos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center text-center gap-4">
          <div className="bg-emerald-500 rounded-full p-4">
            <CheckSquare className="h-8 w-8 text-white" />
          </div>
          <p className="text-gray-600">Organize work across teams and assign tasks.</p>
          <Button variant="outline" className="w-full">Make a to-do list</Button>
        </div>
      </CardContent>
    </Card>

    {/* Docs & Files */}
    <Card onClick={handleDocsNavigate} className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-xl text-gray-900">Docs & Files</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center text-center gap-4">
          <div className="bg-stone-300 rounded-full p-4">
            <FolderOpen className="h-8 w-8 text-white" />
          </div>
          <p className="text-gray-600">Share and organize files with your team.</p>
          <Button variant="outline" className="w-full">Add docs & files</Button>
        </div>
      </CardContent>
    </Card>
  </div>

  {/* Bottom Grid Layout */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Chat */}
    <Card onClick={handleGrpChatNavigate} className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-xl text-gray-900">Chat</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center text-center gap-4">
          <div className="bg-cyan-500 rounded-full p-4">
            <MessageSquare className="h-8 w-8 text-white" />
          </div>
          <p className="text-gray-600">Chat casually with your team.</p>
          <Button variant="outline" className="w-full">Start chatting</Button>
        </div>
      </CardContent>
    </Card>

    {/* Schedule */}
    <Card onClick={handleEventNavigate} className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-xl text-gray-900">Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center text-center gap-4">
          <div className="bg-pink-500 rounded-full p-4">
            <Calendar className="h-8 w-8 text-white" />
          </div>
          <p className="text-gray-600">Set up meetings and manage schedules.</p>
          <Button variant="outline" className="w-full">Schedule an event</Button>
        </div>
      </CardContent>
    </Card>
  </div>
</div>

  );
}