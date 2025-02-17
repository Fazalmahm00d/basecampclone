"use client"
// components/admin/GroupManagement.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import MultiSelect from '../reused-components/MultiSelect';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface Group {
  _id: string;
  name: string;
  members: string[];
}
interface User {
    _id: string;
    email: string;
    role: string;
  }
export default function GroupManagement({ organizationName, adminId}: { organizationName: string ,adminId:string}) {
  // const [groups, setGroups] = useState<Group[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  // const [availableMembers, setAvailableMembers] = useState<{ value: string; label: string; }[]>([]);
  const queryClient=useQueryClient()

  const fetchGroups = async (organizationName:string) => {
    const response = await fetch(`http://localhost:5000/api/projects/${organizationName}`);
    if (!response.ok) {
      throw new Error('Failed to fetch groups');
    }
    return response.json();
  };
  
  const fetchMembers = async (organizationName:string) => {
    const response = await fetch(`http://localhost:5000/api/account/members/${organizationName}`);
    if (!response.ok) {
      throw new Error('Failed to fetch members');
    }
    return response.json();
  };

  const { data: groups, error: groupsError } = useQuery<Group[]>({
    queryKey: ['groups', organizationName],
    queryFn: () => fetchGroups(organizationName),
    enabled: !!organizationName, // Prevents fetching if organizationName is missing
  });

  const { data: availableMembers, error: membersError } = useQuery<User[]>({
    queryKey: ['members', organizationName],
    queryFn: () => fetchMembers(organizationName),
    enabled: !!organizationName,
    select: (data) =>
      data.map((user) => ({
        value: user._id,
        label: user.email,
      })),
  });

  if (groupsError) {
    toast.error('Error', { description: 'Failed to fetch groups' });
  }
  if (membersError) {
    toast.error('Error', { description: 'Failed to fetch members' });
  }
  const createGroup = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'organization-name': organizationName,
          'userId':adminId
        },
        body: JSON.stringify({
          name: newGroupName,
          members: selectedMembers
        })
      });

      if (response.ok) {
        toast.success( "Success", {description: "Group created successfully" });
        setNewGroupName('');
        setSelectedMembers([]);
        // fetchGroups();
        queryClient.invalidateQueries(['groups'])
      }
    } catch (error) {
      toast.error( "Error", {description: "Failed to create group" });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Project</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Group Name"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
          />
          {availableMembers? <MultiSelect
            options={availableMembers}
            value={selectedMembers}
            onChange={setSelectedMembers}
            placeholder="Select members"
          />:""}
          <Button onClick={createGroup}>Create Project</Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups ? groups?.map((group) => (
          <Card key={group._id}>
            <CardHeader>
              <CardTitle>{group.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Members: {group.members.length}</p>
            </CardContent>
          </Card>
        )) :<p>No project found</p>}
      </div>
    </div>
  );
}