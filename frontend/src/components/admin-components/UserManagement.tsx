import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { UserX, UserCog } from "lucide-react";
import { toast } from '@/hooks/use-toast';

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
}

interface UserManagementProps {
  organizationName: string;
  userId: string;
}

const UserManagement: React.FC<UserManagementProps> = ({ organizationName, userId }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [accountId, setAccountId] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const validRoles = [
    { value: 'admin', label: 'Admin' },
    { value: 'member', label: 'Organization Member' },
    { value: 'external_collaborator', label: 'External Collaborator' },
    { value: 'client', label: 'Client' }
  ];

  // Fetch account ID and members
  const fetchAccountData = async () => {
    try {
      // Fetch account ID
      const accountResponse = await fetch(
        `http://localhost:5000/api/account/id/${organizationName}`
      );
      
      if (!accountResponse.ok) throw new Error('Failed to fetch account ID');
      const accountData = await accountResponse.json();
      setAccountId(accountData.accountId);

      // Fetch members
      const membersResponse = await fetch(
        `http://localhost:5000/api/account/members/${organizationName}`
      );
      
      if (!membersResponse.ok) throw new Error('Failed to fetch members');
      const membersData = await membersResponse.json();
      setUsers(membersData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch user data",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchAccountData();
  }, [organizationName]);

  const handleDeleteMember = async (user: User) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/account/${accountId}/members/${user._id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'organization-name': organizationName,
            'userId': userId
          }
        }
      );

      if (response.ok) {
        toast({
          title: "Success",
          description: "Member removed successfully"
        });
        fetchAccountData();
        setDeleteDialogOpen(false);
      } else {
        throw new Error('Failed to remove member');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive"
      });
    }
  };

  const handleRoleUpdate = async (targetUserId: string, newRole: string) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/account/${accountId}/members/${targetUserId}/role`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'organization-name': organizationName,
            'userId': userId
          },
          body: JSON.stringify({ role: newRole })
        }
      );

      if (response.ok) {
        toast({
          title: "Success",
          description: "Role updated successfully"
        });
        fetchAccountData();
      } else {
        throw new Error('Failed to update role');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update role",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      {users.length>0 ? users?.map((user) => (
        <div key={user._id} className="flex items-center justify-between p-4 border rounded-lg shadow-sm">
          <div className="flex-1">
            <h3 className="font-medium">{user.username}</h3>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Select
              defaultValue={user.role}
              onValueChange={(value) => handleRoleUpdate(user._id, value)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {validRoles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="destructive"
              size="icon"
              onClick={() => {
                setSelectedUser(user);
                setDeleteDialogOpen(true);
              }}
            >
              <UserX className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )): <p>No users found ,set Organization in profile</p>}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {selectedUser?.username}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedUser && handleDeleteMember(selectedUser)}
              className="bg-red-500 hover:bg-red-600"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserManagement;