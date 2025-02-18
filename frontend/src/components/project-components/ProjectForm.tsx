import { useEffect, useState, FormEvent } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { toast } from "@/hooks/use-toast";
import { DialogClose } from "@/components/ui/dialog";

interface Member {
  _id: string;
  username: string;
  email: string;
  role: string;
}

interface ProjectFormProps {
  onClose: () => void;
}

export default function ProjectForm({ onClose }: ProjectFormProps) {
  const user = useSelector((state: RootState) => state.user);
  const [name, setName] = useState<string>("");
  const [selectedMembers, setSelectedMembers] = useState<Member[]>([]);
  const [availableMembers, setAvailableMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Fetch members from the organization
  useEffect(() => {
    async function fetchMembers() {
      try {
        const response = await axios.get<Member[]>(
          `http://localhost:5000/api/account/members/${user.organizationName}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        setAvailableMembers(response.data);
      } catch (error) {
        console.error("Error fetching members:", error);
        toast({
          title: "Error fetching members",
          description: "Failed to load organization members. Please try again.",
          variant: "destructive",
        });
      }
    }
    fetchMembers();
  }, [user.organizationName]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(
        "http://localhost:5000/api/projects",
        {
          name,
          members: selectedMembers.map(member => member._id),
          organizationName: user.organizationName
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        }
      );
      
      toast({
        title: "Success",
        description: "Project created successfully!",
        variant: "default",
      });
      
      // Reset form
      setName("");
      setSelectedMembers([]);
      setSearchTerm("");
      
      // Close the dialog
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addMember = (member: Member) => {
    if (!selectedMembers.find(m => m._id === member._id)) {
      setSelectedMembers([...selectedMembers, member]);
      setSearchTerm("");
    }
  };

  const removeMember = (memberId: string) => {
    setSelectedMembers(selectedMembers.filter(m => m._id !== memberId));
  };

  // Filter members based on search term
  const filteredMembers = availableMembers.filter(member =>
    !selectedMembers.find(m => m._id === member._id) &&
    (member.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-2xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Name
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-md"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Enter project name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Members
          </label>

          <div className="flex flex-wrap gap-2 mb-3">
            {selectedMembers.map(member => (
              <Badge
                key={member._id}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {member.username}
                <button
                  type="button"
                  onClick={() => removeMember(member._id)}
                  className="ml-1 hover:text-red-500"
                >
                  <X size={14} />
                </button>
              </Badge>
            ))}
          </div>

          <input
            type="text"
            className="w-full px-3 py-2 border rounded-md mb-2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search members..."
          />

          {searchTerm && (
            <div className="border rounded-md mt-1 max-h-48 overflow-y-auto">
              {filteredMembers.map(member => (
                <button
                  key={member._id}
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center justify-between"
                  onClick={() => addMember(member)}
                >
                  <span>{member.username}</span>
                  <span className="text-sm text-gray-500">{member.email}</span>
                </button>
              ))}
              {filteredMembers.length === 0 && (
                <div className="px-3 py-2 text-gray-500">No members found</div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1"
          >
            {loading ? "Creating..." : "Create Project"}
          </Button>
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </DialogClose>
        </div>
      </form>
    </div>
  );
}