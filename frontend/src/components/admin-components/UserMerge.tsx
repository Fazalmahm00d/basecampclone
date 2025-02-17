"use client"

interface User {
    _id: string;
    email: string;
    role: string;
  }
// components/admin/UserMerge.tsx

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from '@/hooks/use-toast';
import { useUsers } from '@/hooks';
import { useQueryClient } from '@tanstack/react-query';

export default function UserMerge({ organizationName, adminId}: { organizationName: string ,adminId:string}) {
  const [primaryUserId, setPrimaryUserId] = useState('');
  const [secondaryUserId, setSecondaryUserId] = useState('');
  const queryClient=useQueryClient();
  // const [users, setUsers] = useState<User[]>([]);

  // useEffect(() => {
  //   fetchUsers();
  // }, []);

  // const fetchUsers = async () => {
  //   try {
  //     const response = await fetch(`http://localhost:5000/api/account/members/${organizationName}`);
  //     const data = await response.json();
  //     setUsers(data);
  //   } catch (error) {
  //     toast({ title: "Error", description: "Failed to fetch users" });
  //   }
  // };
  const { data: users, isLoading } = useUsers(organizationName);

  const handleMerge = async () => {
    if (!primaryUserId || !secondaryUserId) {
      toast({ title: "Error", description: "Please select both users" });
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/admin/merge-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'organization-name': organizationName,
          'userId':adminId
        },
        body: JSON.stringify({
          primaryUserId,
          secondaryUserId
        })
      });

      if (response.ok) {
        toast({ title: "Success", description: "Users merged successfully" });
        setPrimaryUserId('');
        setSecondaryUserId('');
        // fetchUsers();
        queryClient.invalidateQueries(['users'])
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to merge users" });
    }
  };

  return (
    <div> { users.length>0 ? <Card>
      <CardHeader>
        <CardTitle>Merge Users</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            Merging users will combine their projects and make the secondary account inactive.
            This action cannot be undone.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Primary User</label>
            <Select value={primaryUserId} onValueChange={setPrimaryUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Select primary user" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user:User) => (
                  <SelectItem key={user._id} value={user._id}>
                    {user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Secondary User</label>
            <Select value={secondaryUserId} onValueChange={setSecondaryUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Select secondary user" />
              </SelectTrigger>
              <SelectContent>
                {users
                  .filter((user:User) => user._id !== primaryUserId)
                  .map((user:User) => (
                    <SelectItem key={user._id} value={user._id}>
                      {user.email}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleMerge}
            disabled={!primaryUserId || !secondaryUserId}
            className="w-full"
          >
            Merge Users
          </Button>
        </div>
      </CardContent>
    </Card>
  :<p>No users found .set organization in the profile</p>  
  }
  </div>
  );
}