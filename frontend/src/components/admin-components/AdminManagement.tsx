"use client"
// components/admin/AdminManagement.tsx

import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from '@/hooks/use-toast';

interface User {
  _id: string;
  email: string;
  role: string;
}



export default function AdminManagement({ organizationName, adminId}: { organizationName: string ,adminId:string}) {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/account/members/${organizationName}`);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch users" });
    }
  };

  const toggleAdmin = async (userId: string, currentRole: string) => {
    try {
      const action = currentRole === 'admin' ? 'remove' : 'add';
      const response = await fetch('http://localhost:5000/api/admin/administrators', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'organization-name': organizationName,
          'userId':adminId
        },
        body: JSON.stringify({ userId, action })
      });

      if (response.ok) {
        toast({ title: "Success", description: `Administrator ${action}d successfully` });
        fetchUsers();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update administrator status" });
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Manage Administrators</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user._id}>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <Button
                  onClick={() => toggleAdmin(user._id, user.role)}
                  variant={user.role === 'admin' ? "destructive" : "default"}
                >
                  {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}