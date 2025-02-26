import React from 'react';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { setUser } from '@/redux/slices/userSlices';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';


const OrganizationSetupModal = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const [open, setOpen] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthAndOrg = async () => {
      try {
        // Check authentication status
        const response = await fetch('https://basecamp-c3ay.onrender.com/api/auth/me', {
          credentials: 'include'
        });
        const data = await response.json();
        console.log(response)
        setIsAuthenticated(data.authenticated);
        
        // Only open modal if user is authenticated and has no organization
        if (data.authenticated && data.user && !data.user.organizationName) {
          setOpen(true);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuthAndOrg();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!orgName.trim()) {
      setError("Organization name is required");
      return;
    }

    try {
      const response = await axios.put(
        `https://basecamp-c3ay.onrender.com/api/users/profile?email=${user.email}`,
        {
          organizationName: orgName
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      // Update Redux store with new user data
      dispatch(setUser({ ...user, organizationName: orgName }));
      setOpen(false);
    } catch (error) {
      if (error.response?.status === 404 && error.response?.data?.error === "Org name already exists") {
        setError("This organization name is already taken. Please choose another.");
        toast.error("Org name already exists")
      } else {
        setError(error.response?.data?.error || "Failed to update organization name");
      }
    }
  };

  // Don't render anything if user is not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <Dialog 
      open={open} 
      onOpenChange={setOpen}
      // Prevent closing by clicking outside or pressing escape
      onPointerDownOutside={(e) => e.preventDefault()}
      onEscapeKeyDown={(e) => e.preventDefault()}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Set Your Organization Name</DialogTitle>
          <DialogDescription>
            Please set your organization name to continue. This is required for account setup.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Enter organization name"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full"
              />
            {error && <p>{error}</p>}
          <div className="flex justify-end">
            <Button type="submit" className="bg-blue-500 text-white hover:bg-blue-600">
              Save Organization
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OrganizationSetupModal;