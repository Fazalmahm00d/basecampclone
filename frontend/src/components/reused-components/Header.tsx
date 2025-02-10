"use client"
import { Button } from "@/components/ui/button";
import { logout, setUser } from "@/redux/slices/userSlices";
import { RootState } from "@/redux/store";
import axios from "axios";
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import ProfileModal from "../header-components/ProfileModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { Bell, MessageSquare, X, Send, Check, CheckCheck } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { setAccount } from "@/redux/slices/accountSlices";

// Types
interface Member {
  _id: string;
  username: string;
  email: string;
  profilePicture?: string;
}


interface NewChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  accountId: string;
  onMemberSelect: (member: Member) => void;
}

// Member Selection Dialog
const NewChatDialog: React.FC<NewChatDialogProps> = ({ 
  isOpen, 
  onClose, 
  accountId, 
  onMemberSelect 
}) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const user = useSelector((state: RootState) => state.user);
  useEffect(() => {
    if (!isOpen || !user) return;

    // Fetch account members
    fetch(`http://localhost:5000/api/account/members/${user.organizationName}`)
      .then((res: Response) => res.json())
      .then((data: Member[]) => setMembers(data))
      .catch((err: Error) => console.error('Error fetching members:', err));
  }, [isOpen, user]);

  const filteredMembers = members.filter((member: Member) =>
    member.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  const handleMemberClick = (member: Member): void => {
    onMemberSelect(member);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start a private chat with....</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <input
            type="text"
            placeholder="Search members..."
            className="w-full p-2 border rounded-lg mb-4"
            value={searchTerm}
            onChange={handleInputChange}
          />
          <div className="max-h-96 overflow-y-auto">
            {filteredMembers.map((member: Member) => (
              <div
                key={member._id}
                onClick={() => handleMemberClick(member)}
                className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
              >
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  {member.profilePicture ? (
                    <img
                      src={member.profilePicture}
                      alt={member.username}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <span className="text-lg font-semibold">
                      {member.username[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="ml-3">
                  <p className="font-medium">{member.username}</p>
                  <p className="text-sm text-gray-500">{member.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const getAccountId = async (organizationName: string): Promise<string> => {
  try {
    const response = await fetch(`http://localhost:5000/api/account/id/${organizationName}`);
    if (!response.ok) {
      throw new Error('Failed to fetch account ID');
    }
    const data = await response.json();
    return data.accountId;
  } catch (error) {
    console.error('Error getting account ID:', error);
    throw error;
  }
};


export default function Header() {
  const user = useSelector((state: RootState) => state.user);  // Access Redux state
  const dispatch = useDispatch();
  const [accountId, setAccountId] = useState<string | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [showNewChat, setShowNewChat] = useState(false);
  const [fallback, setFallback] = useState<string>("");
  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    loading: true
  });
  const handleMemberSelect = (member: Member): void => {
    setShowNewChat(false);
    // Navigate to chat page
    window.location.href = `/pings/${accountId}/${member._id}`;
  };
  const handleLogout = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    
    try {
      await axios.post('http://localhost:5000/api/auth/logout', {}, {
        withCredentials: true // Required for cookies
      });
      
      console.log("logged out")
      dispatch(logout())
      // window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
      // Handle error (show message to user)
    }
  };
  const getInitials = (username: string): string => {
    if (!username) return "NA"; // Default to "NA" if no username
    const nameParts = username.trim().split(" ");
    const initials = nameParts
      .map((part) => part[0]?.toUpperCase()) // Get the first letter of each word
      .join(""); // Combine them
    return initials.slice(0, 2); // Limit to 2 characters
  };
  useEffect(() => {
    const fetchAccountId = async () => {
      try {
        // Check if user and organizationName exist
        if (!user?.organizationName) {
          console.log("No organization name available");
          return;
        }
        
        const id = await getAccountId(user.organizationName);
        setAccountId(id);
        dispatch(setAccount({ name: user.organizationName, accountId: id }))
      } catch (error) {
        console.log("could not find account id");
      }
    };
  
    fetchAccountId();
  }, [user]);
  
  useEffect(() => {

    console.log("use effect called")
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
          credentials: 'include' // Required for cookies
        });
        
        const data = await response.json();
        console.log(data,"data received");
        dispatch(setUser({ name: data.user.username, email: data.user.email ,organizationName : data.user.organizationName,  profilePicture: data.user.profilePicture  }));
        setAuthState({
          isAuthenticated: data.authenticated,
          user: data.user,
          loading: false
        });
      } catch (error) {
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false
        });
      }
    };

    checkAuth();
    console.log(authState,"state of authentication")
  }, []);

  useEffect(() => {
    if (user) {
      if (user.profilePicture) {
        setUserImage(user.profilePicture);
      } else {
        setUserImage(null); // No image
        setFallback(getInitials(user.name)); // Use initials for fallback
      }
    }
  }, [user]);
 
  return (
    <header className="flex justify-between items-center w-full p-4 border-b">
        <h1 className="text-lg font-bold">BaseCamp</h1>
      <div className="flex items-center justify-around w-full space-x-4">
        <nav className="flex space-x-4 text-sm ">
          <a href="#" className="hover:underline">Home</a>
          <a href="#" className="hover:underline">Lineup</a>
          <a onClick={() => setShowNewChat(true)} href="#" className="hover:underline">Pings</a>
          <a href="#" className="hover:underline">Hey!</a>
          {/* <a href="#" className="hover:underline">Activity</a> */}
          <a onClick={() => window.location.href = '/assignments'} className="hover:underline">My Assignments</a>
          {/* <a href="#" className="hover:underline">Find</a> */}
        </nav>
      </div>
      <NewChatDialog
        isOpen={showNewChat}
        onClose={() => setShowNewChat(false)}
        accountId={accountId!}
        onMemberSelect={handleMemberSelect}
      />

      
        <div className="flex gap-6">
          <Button
            onClick={handleOpenModal}
            className="px-4 py-2  rounded"
          >
            Edit Profile
          </Button>
          <ProfileModal isOpen={isModalOpen} onClose={handleCloseModal} />
        
        <Avatar>
        {userImage ? (
        <AvatarImage src={userImage} alt={`${user?.name}'s profile`} />
      ) : (
        <AvatarFallback>{fallback}</AvatarFallback>
      )}
    </Avatar>
        
      {authState.isAuthenticated ? (
        <div className="flex gap-5">
          <Button onClick={()=>{
            window.location.href = `/dashboard`;
          }}>Dashboard</Button>

          <Button onClick={handleLogout}>Logout</Button></div>
        ) : (
          <Button onClick={() => window.location.href = '/login'}>Login</Button>
        )}
      </div>
    </header>
  );
}