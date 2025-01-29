"use client"
import { Button } from "@/components/ui/button";
import { logout, setUser } from "@/redux/slices/userSlices";
import { RootState } from "@/redux/store";
import axios from "axios";
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import ProfileModal from "../header-components/ProfileModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

 

    


export default function Header() {
  const user = useSelector((state: RootState) => state.user);  // Access Redux state
  const dispatch = useDispatch();
  const [isModalOpen, setModalOpen] = useState(false);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [fallback, setFallback] = useState<string>("");
  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    loading: true
  });
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
          <a href="#" className="hover:underline">Pings</a>
          <a href="#" className="hover:underline">Hey!</a>
          <a href="#" className="hover:underline">Activity</a>
          <a href="#" className="hover:underline">My Stuff</a>
          <a href="#" className="hover:underline">Find</a>
        </nav>
      </div>
      <div>
      <Button
        onClick={handleOpenModal}
        className="px-4 py-2  rounded"
      >
        Edit Profile
      </Button>
      <ProfileModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
        <div>
        <Avatar>
        {userImage ? (
        <AvatarImage src={userImage} alt={`${user?.name}'s profile`} />
      ) : (
        <AvatarFallback>{fallback}</AvatarFallback>
      )}
    </Avatar>
        </div>

      <div>
      {authState.isAuthenticated ? (
          <Button onClick={handleLogout}>Logout</Button>
        ) : (
          <Button onClick={() => window.location.href = '/login'}>Login</Button>
        )}
      </div>
    </header>
  );
}