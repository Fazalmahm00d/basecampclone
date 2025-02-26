"use client"
import { Button } from "@/components/ui/button";
import { logout, setUser } from "@/redux/slices/userSlices";
import { RootState } from "@/redux/store";
import axios from "axios";
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import ProfileModal from "../header-components/ProfileModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion } from "framer-motion";
import { Menu } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { setAccount } from "@/redux/slices/accountSlices";
import Link from "next/link";

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
  onMemberSelect 
}) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const user = useSelector((state: RootState) => state.user);
  let filteredMembers: Member[] = [];

  useEffect(() => {
    if (!isOpen || !user) return;

    // Fetch account members
    fetch(`https://basecamp-c3ay.onrender.com/api/account/members/${user.organizationName}`)
      .then((res: Response) => res.json())
      .then((data: Member[]) => setMembers(data))
      .catch((err: Error) => console.error('Error fetching members:', err));
  }, [isOpen, user]);

  if(members.length>0){
 filteredMembers = members?.filter((member: Member) =>
    member.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
}

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  const handleMemberClick = (member: Member): void => {
    onMemberSelect(member);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md ">
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
            {
             filteredMembers.length>0 ? filteredMembers?.map((member: Member) => (
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
            )):<p>No members found</p>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const getAccountId = async (organizationName: string): Promise<string> => {
  try {
    const response = await fetch(`https://basecamp-c3ay.onrender.com/api/account/id/${organizationName}`);
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
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
      await axios.post('https://basecamp-c3ay.onrender.com/api/auth/logout', {}, {
        withCredentials: true // Required for cookies
      });
      
      console.log("logged out")
      dispatch(logout())
      window.location.href = '/';
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
        console.log("could not find account id",error);
      }
    };
  
    fetchAccountId();
  }, [user]);
  
  useEffect(() => {

    console.log("use effect called")
    const checkAuth = async () => {
      try {
        const response = await fetch('https://basecamp-c3ay.onrender.com/api/auth/me', {
          credentials: 'include' ,// Required for cookies
          headers: {
            'Content-Type': 'application/json'
            // You might need to add other headers if required by the API
          }
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
        console.log(error)
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
    <header className=" border-b bg-white/90 sticky top-0 h-full w-full backdrop-blur-[8px]  z-40">
      <div className="container mx-auto  max-w-7xl flex justify-between items-center  p-4">
      <div className="flex  items-center">
      <button 
        className="md:hidden p-2"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <Menu
         className="w-6 h-6" />
      </button>
      <Button variant={'link'} className="text-lg font-bold cursor-pointer" onClick={()=>(window.location.href = '/')}>BaseCamp</Button>
      
      </div>
      <nav className="hidden md:flex space-x-4 text-sm">
        <Link href="/" className="hover:underline">Home</Link>
        <Link href="#" className="hover:underline">Lineup</Link>
        <Link onClick={() => setShowNewChat(true)} href="#" className="hover:underline">Pings</Link>
        <Link href="#" className="hover:underline">Hey!</Link>
        <Link href = '/assignments' className="hover:underline cursor-pointer">
          My Assignments
        </Link>
      </nav>
      <NewChatDialog
        isOpen={showNewChat}
        onClose={() => setShowNewChat(false)}
        accountId={accountId!}
        onMemberSelect={handleMemberSelect}
      />

    


{menuOpen && (
  <motion.div 
    initial={{ opacity: 0, y: -30 }} 
    animate={{ opacity: 1, y: 10 ,x:20 }} 
    exit={{ opacity: 0, y: -10 }} 
    transition={{ duration: 0.2, ease: "easeInOut" }}
    className="absolute top-14 left-0 z-50 w-fit bg-white shadow-md md:hidden rounded-lg"
  >
    <nav className="flex flex-col space-y-2 p-4">
      <Link href="/" className="hover:underline">Home</Link>
      <Link href="#" className="hover:underline">Lineup</Link>
      <Link onClick={() => setShowNewChat(true)} href="#"  className="hover:underline">Pings</Link>
      <Link href="#" className="hover:underline">Hey!</Link>
      <Link href = '/assignments' className="hover:underline">
        My Assignments
      </Link>
    </nav>
  </motion.div>
)}
      {authState.isAuthenticated ? 
                <div>
                    <Button 
                      className="w-full justify-start" 
                      onClick={() => (window.location.href = `/dashboard`)}
                    >
                      Dashboard
                    </Button>
                    </div>
              : <div>
              <Button 
                className="w-full justify-start" 
                onClick={() => (window.location.href = `/login`)}
              >
                Login
              </Button>
              </div>
      }


      <div className="relative">
        <button 
          className="flex items-center space-x-2" 
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <Avatar>
          {userImage ? (
            <AvatarImage 
            src={userImage} 
            alt={`${user?.name}'s profile`}
            referrerPolicy="no-referrer" // Important for Google images
            onError={() => {
              setUserImage(null);
              setFallback(getInitials(user?.name || ""));
            }}
          />
          ) : (
            <AvatarFallback>{fallback}</AvatarFallback>
          )}
        </Avatar>
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg border z-50">
            <ul className="flex flex-col p-2 gap-2 text-sm">
              <li>
                <Button 
                  className="w-full justify-start" 
                  onClick={() => setModalOpen(true)}
                >
                  Edit Profile
                </Button>
              </li>
              {authState.isAuthenticated && (
                <>
                  <li>
                    <Button 
                      className="w-full justify-start bg-red-500 text-white hover:bg-red-600" 
                      onClick={handleLogout}
                    >
                      Logout
                    </Button>
                  </li>
                </>
              )}
              {!authState.isAuthenticated && (
                <li>
                  <Button 
                    className="w-full justify-start" 
                    onClick={() => (window.location.href = '/login')}
                  >
                    Login
                  </Button>
                </li>
              )}
            </ul>
            <ProfileModal isOpen={isModalOpen} onClose={handleCloseModal} />
          </div>
        )}
      </div>
      </div>
    </header>
  );
};
