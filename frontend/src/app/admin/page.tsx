"use client"
import AdminDashboard from '@/components/admin-components/AdminDashboard';
// pages/admin/index.tsx
import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';

export default function AdminPage() {
    const user = useSelector((state: RootState) => state.user);
  const organizationName = user.organizationName; // Get from your context/state
  
  return <AdminDashboard organizationName={organizationName} />;
}