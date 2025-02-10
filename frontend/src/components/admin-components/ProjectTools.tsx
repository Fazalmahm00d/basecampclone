"use client"
// components/admin/ProjectTools.tsx
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from '@/hooks/use-toast';

interface Project {
  _id: string;
  name: string;
}

export default function ProjectTools({ organizationName, adminId}: { organizationName: string ,adminId:string}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/projects/${organizationName}`);
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch projects" });
    }
  };

  const handleRename = async (projectId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/projects/${projectId}/rename`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'organization-name': organizationName,
          'userId':adminId
        },
        body: JSON.stringify({ newName })
      });

      if (response.ok) {
        toast({ title: "Success", description: "Project renamed successfully" });
        setEditingId(null);
        setNewName('');
        fetchProjects();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to rename project" });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => (
        <Card key={project._id}>
          <CardHeader>
            <CardTitle>
              {editingId === project._id ? (
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="New name"
                />
              ) : (
                project.name
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {editingId === project._id ? (
              <div className="space-x-2">
                <Button onClick={() => handleRename(project._id)}>Save</Button>
                <Button variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
              </div>
            ) : (
              <Button onClick={() => {
                setEditingId(project._id);
                setNewName(project.name);
              }}>
                Rename
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
