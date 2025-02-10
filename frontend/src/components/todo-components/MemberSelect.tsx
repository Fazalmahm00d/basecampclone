import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Member {
  _id: string;
  username?: string;
  email: string;
}

interface MemberSelectProps {
  members: Member[];
  onSelect: (value: string) => void;
  selectedMember: string;
}

const MemberSelect: React.FC<MemberSelectProps> = ({ 
  members, 
  onSelect, 
  selectedMember 
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="assignee">Assign To</Label>
      <Select 
        value={selectedMember} 
        onValueChange={onSelect}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a team member" />
        </SelectTrigger>
        <SelectContent>
          {members?.map((member) => (
            <SelectItem 
              key={member._id} 
              value={member._id}
              className="cursor-pointer"
            >
              {member.username || member.email}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default MemberSelect;