"use client"
// components/admin/AdminManagement.tsx

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { useUsers } from '@/hooks';
import { useQueryClient } from '@tanstack/react-query';

interface User {
  _id: string;
  email: string;
  role: string;
}



export default function AdminManagement({ organizationName, adminId}: { organizationName: string ,adminId:string}) {
  // const [users, setUsers] = useState<User[]>([]);
  const queryClient=useQueryClient()
  // useEffect(() => {
  //   fetchUsers();
  // }, []);

  // const fetchUsers = async () => {
  //   try {
  //     const response = await fetch(`https://basecamp-c3ay.onrender.com/api/account/members/${organizationName}`);
  //     const data = await response.json();
  //     setUsers(data);
  //   } catch (error) {
  //     toast( "Error", {description: "Failed to fetch users" });
  //   }
  // };
  const { data: users, isLoading } = useUsers(organizationName);

  const toggleAdmin = async (userId: string, currentRole: string) => {
    try {
      const action = currentRole === 'admin' ? 'remove' : 'add';
      const response = await fetch('https://basecamp-c3ay.onrender.com/api/admin/administrators', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'organization-name': organizationName,
          'userId':adminId
        },
        body: JSON.stringify({ userId, action })
      });

      if (response.ok) {
        toast.success(  "Success",{ description: `Administrator ${action}d successfully` });
        queryClient.invalidateQueries(['users'])
      }
    } catch (error) {
      toast.success("Error", {description: `Failed to update administrator status ${error}` });
    }
  };
  if(isLoading){
    return <div>Loading....</div>
  }

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
          {users ? users.map((user:User) => (
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
          )) :<p>No user found.set Organization in the profile</p>}
        </TableBody>
      </Table>
    </div>
  );
}