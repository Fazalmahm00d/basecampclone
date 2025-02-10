"use client";
import { Button } from "@/components/ui/button";
import { RootState } from "@/redux/store";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "../ui/dialog";
import axios from "axios";
import ProjectForm from "../project-components/ProjectForm";

export default function ActionButtons() {
  const user = useSelector((state: RootState) => state.user);
  const [isUserOrg, setUserOrg] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [orgName,setOrgName]=useState("")
  const [role, setRole] = useState("member");
  const [loading, setLoading] = useState(false);
  
  const [error, setError] = useState("");

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token"); // Retrieve the token
      if (!token) {
        throw new Error("Authentication token is missing");
      }

      const response = await axios.post(
        'http://localhost:5000/api/invite',
        { adminemail:user.email,email, role, organizationName:orgName},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(response, "response from invite");
      alert("Invitation sent successfully!");
    } catch (err) {
      console.error(err);
      setError("Failed to send the invitation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setUserOrg(user.organizationName);
  }, [user]);

  return (
    <div>
      <div className="flex justify-end w-full p-5">
        <Button variant="outline" onClick={() => window.location.href = '/admin'}>Adminland</Button>
      </div>
      <h1 className="text-center font-bold text-2xl">{isUserOrg}</h1>
      <div className="flex items-center space-x-4 p-4 w-full justify-center">
        
        <div> <Dialog><DialogTrigger asChild>
          <Button>Make a new project</Button>
            </DialogTrigger>
            <DialogContent><ProjectForm /><DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose></DialogContent></Dialog></div>
        <div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Invite people</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Who are you inviting?</DialogTitle>
              <DialogDescription>
                First you’ll invite them to the account. Then you can add them to projects.
              </DialogDescription>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    className="w-full mt-1 border rounded-md p-2"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    className="w-full mt-1 border rounded-md p-2"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Organization Name</label>
                  <input
                    type="text"
                    className="w-full mt-1 border rounded-md p-2"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    className="w-full mt-1 border rounded-md p-2"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="member">Member</option>
                    <option value="outside_collaborator">Outside Collaborator</option>
                    <option value="client">Client</option>
                  </select>
                </div>

                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className={`px-4 py-2 rounded-md text-white ${
                      loading ? "bg-gray-500" : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {loading ? "Sending..." : "Send Invite"}
                  </Button>
                </div>
              </form>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
