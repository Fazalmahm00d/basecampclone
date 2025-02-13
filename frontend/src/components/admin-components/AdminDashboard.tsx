// components/admin/AdminDashboard.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminManagement from './AdminManagement';
import GroupManagement from './GroupManagement';
import ProjectTools from './ProjectTools';
import UserMerge from './UserMerge';
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import axios from "axios";
import UserManagement from "./UserManagement";

interface AdminDashboardProps {
  organizationName: string;
}

export default function AdminDashboard({ organizationName }: AdminDashboardProps) {
  const user = useSelector((state: RootState) => state.user);
  const [userId,setUserId]=useState(null)
  const fetchUserId = async () => {
    try {
      if (!user?.email) return;
      
      const response = await axios.get<{ userId: string }>(`http://localhost:5000/api/users/user-id?email=${user.email}`);
      setUserId(response.data.userId);
    } catch (error) {
      console.error("Error fetching user ID:", error);
    }
  };
  useEffect(()=>{
    if(user.email){
      fetchUserId()
    }
  },[user.email])
  return (
    <div className="p-4 max-w-7xl container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <Tabs defaultValue="admins">
        <TabsList className="flex flex-wrap mb-10 h-fit">
          <TabsTrigger value="admins">Administrators</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="projects">Project Tools</TabsTrigger>
          <TabsTrigger value="merge">Merge Users</TabsTrigger>
          <TabsTrigger value="users">Manage Users</TabsTrigger>
        </TabsList>
        
        <TabsContent value="admins">
          <AdminManagement organizationName={organizationName} adminId={userId}/>
        </TabsContent>
        
        <TabsContent value="groups">
          <GroupManagement organizationName={organizationName} adminId={userId} />
        </TabsContent>
        
        <TabsContent value="projects">
          <ProjectTools organizationName={organizationName} adminId={userId}/>
        </TabsContent>
        
        <TabsContent value="merge">
          <UserMerge organizationName={organizationName} adminId={userId} />
        </TabsContent>

        <TabsContent value="users">
          <UserManagement organizationName={organizationName} userId={userId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
