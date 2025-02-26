"use client"
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { CircleUserRound } from "lucide-react";
import { toast } from '@/hooks/use-toast';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useQuery } from '@tanstack/react-query';
import { getCookie } from '@/app/utils/getCookies';

interface Member {
  _id: string;
  username: string;
  email: string;
}

interface Project {
  _id: string;
  name: string;
  members: Member[];
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
  // Generate a pastel color based on the text string
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Generate pastel RGB values
  const h = hash % 360;
  return `hsl(${h}, 70%, 85%)`;
}

export default function ProjectGrid() {
  const user = useSelector((state: RootState) => state.user);

  const fetchProjects = async (organizationName: string): Promise<Project[]> => {
    const token=getCookie('token')
    const response = await axios.get<Project[]>(
      `https://basecamp-c3ay.onrender.com/api/projects/${organizationName}`,
      {
        headers: { Authorization: `Bearer ${token}`}
      }
    );
    return response.data;
  };
  
  // In your component:
  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['projects', user.organizationName],
    queryFn: () => fetchProjects(user.organizationName),
    enabled: !!user.organizationName,
    onError: (error:any) => {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive",
      });
    }
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="flex -space-x-2">
                {[1, 2, 3].map((j) => (
                  <Skeleton key={j} className="h-8 w-8 rounded-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (projects && projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <CircleUserRound className="h-16 w-16 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Projects Found</h3>
        <p>Create a new project to get started</p>
      </div>
    );
  }else{
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {
      projects && projects.map((project) => (
        <Card 
          key={project._id}
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => window.location.href = `/project/${project._id}`}
        >
          <CardHeader>
            <CardTitle className="text-xl font-semibold truncate">
              {project.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {project.members.map((member, index) => (
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
}