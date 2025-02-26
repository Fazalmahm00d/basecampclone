"use client"

import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

// Types for our component
interface UserInfo {
  email: string;
  role: string;
  accountId: string;
}

interface PasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  inviteToken: string | null;
  onSubmit: (password: string) => Promise<void>;
}

const InvitationPage = () => {
  const searchParams = useSearchParams();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState<boolean>(false);

  // Get the invite token from the URL
  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      setInviteToken(tokenParam);
    } else {
      setError("No invitation token found.");
      setIsLoading(false);
    }
  }, [searchParams]);

  // Verify the invite token
  useEffect(() => {
    const verifyInvite = async () => {
      if (inviteToken) {
        try {
          const response = await axios.get<UserInfo>(
            `https://basecamp-c3ay.onrender.com/api/verify-invite?token=${inviteToken}`
          );
          
          if (response.data) {
            setUserInfo(response.data);
            console.log(response.data,"user info after verify invite")
            setIsPasswordDialogOpen(true);
          }
        } catch (error:any) {
          if (axios.isAxiosError(error)) {
            console.log("error",error)
            setError(error.response?.data?.error || "Invalid or expired invitation link.");
          } else {
            setError(`Failed to load more messages: ${error.message || error}`);

          }
        } finally {
          setIsLoading(false);
        }
      }
    };

    verifyInvite();
  }, [inviteToken]);

  const handlePasswordSubmit = async (password: string) => {
    try {
      const response = await axios.post(
        'https://basecamp-c3ay.onrender.com/api/accept-invite',
        {
          token: inviteToken,
          password
        }
      );
      // Handle successful registration
      console.log('Registration successful:', response.data);
      // Redirect to login or dashboard
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.error || "Failed to complete registration.");
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="invite-page">
      {userInfo && (
        <>
          <h1>Welcome, {userInfo.email}!</h1>
          <p>You have been invited to join as a {userInfo.role}.</p>
          <p>Please set your password to complete the registration.</p>
        </>
      )}

      <PasswordDialog
        isOpen={isPasswordDialogOpen}
        onClose={() => setIsPasswordDialogOpen(false)}
        inviteToken={inviteToken}
        onSubmit={handlePasswordSubmit}
      />
    </div>
  );
};

// Password Dialog Component
const PasswordDialog = ({ isOpen, onClose, onSubmit }: PasswordDialogProps) => {
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    try {
      await onSubmit(password);
      onClose();
    } catch (err:any) {
      setError(`Failed to set password: ${err.message || err}`);

    }
  };

  return (
    <dialog open={isOpen} className="p-4 rounded shadow-lg">
      <form onSubmit={handleSubmit}>
        <h2>Set Your Password</h2>
        
        {error && <p className="text-red-500">{error}</p>}
        
        <div className="mb-4">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
            minLength={8}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
            minLength={8}
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Set Password
          </button>
        </div>
      </form>
    </dialog>
  );
};

export default InvitationPage;