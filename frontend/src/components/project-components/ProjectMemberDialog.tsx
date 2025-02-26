import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from '@/hooks/use-toast';

interface User {
  _id: string;
  username: string;
  email: string;
  role?: string;
}

interface ProjectMemberDialogProps {
  organizationName: string;
  projectId: string;
  currentMembers: string[];
  onMemberUpdate: (selectedMembers: string[]) => Promise<void>;
}

export const ProjectMemberDialog: React.FC<ProjectMemberDialogProps> = ({
  organizationName,
  projectId,
  currentMembers,
  onMemberUpdate
}) => {
  const [open, setOpen] = useState(false);
  const [accountMembers, setAccountMembers] = useState<User[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>(currentMembers);

  useEffect(() => {
    const fetchAccountMembers = async () => {
      try {
        const response = await fetch(`https://basecamp-c3ay.onrender.com/api/account/members/${organizationName}`);
        const members = await response.json();
        setAccountMembers(members);
      } catch (error) {
        toast({
          title:"Failed to fetch account members",
          variant:"destructive"
        })
        console.error('Failed to fetch account members:', error);
      }
    };

    if (open) {
      fetchAccountMembers();
    }
  }, [open, organizationName]);

  const handleMemberToggle = (userId: string) => {
    setSelectedMembers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSave = async () => {
    if(selectedMembers.length===0 ){
      setOpen(false);
      toast({
        title:"Atleast one member must be selected",
        variant:"destructive"
      })
    }else{
    await onMemberUpdate(selectedMembers);
    setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-full">
          Set up people
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Project Members</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {accountMembers.map((member) => (
            <div key={member._id} className="flex items-center space-x-2">
              <Checkbox
                id={member._id}
                checked={selectedMembers.includes(member._id)}
                onCheckedChange={() => handleMemberToggle(member._id)}
              />
              <label 
                htmlFor={member._id} 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {member.username} ({member.email})
              </label>
            </div>
          ))}
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectMemberDialog;