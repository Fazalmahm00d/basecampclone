"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios"
import {
  signInWithPopup,
  Auth,
  GoogleAuthProvider,
  UserCredential,
} from "firebase/auth";
import { auth, provider } from "@/lib/firebaseconfig";
import AuthForm from "./AuthForm";
import { toast } from "sonner";


export default function LoginSignupForm() {
  const handleLoginClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    handleGoogleAuth(event, auth, provider);
  };

  async function handleGoogleAuth(
    event: React.MouseEvent<HTMLButtonElement>,
    auth: Auth,
    provider: GoogleAuthProvider
  ): Promise<void> {
    event.preventDefault();

    try {
      // Sign in with a popup and get the result
      const result: UserCredential = await signInWithPopup(auth, provider);

      // Extract user details
      const user = result.user;

      if (user) {
        console.log(user, "users info");
        // console.log(user.photoURL, "user photo url");
          // Access token from `user` object
          const token = await user.getIdToken();
      
          // Send token to backend
          const response = await axios.post('http://localhost:5000/api/auth/google', 
            { idToken: token },
            {
              withCredentials: true // This is crucial for cookies
            }
          );
          // console.log('JWT Token:', response.data.token);
          // console.log('Auth successful');
          toast.success("Authentication success")
          window.location.href = '/dashboard'
        } else {
        console.error("User information is not available.");
      }
      } catch (error) {
        console.log(error)
        toast.error("Login error")
      }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md shadow-md">
        {/* Header Section */}
        <CardHeader className="flex flex-col items-center">
          <div className="w-12 h-12 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-8 h-8 text-gray-600"
            >
              <path d="M16 2a6 6 0 0 1 5.2 9H8.8a6 6 0 0 1 5.2-9z" />
              <path d="M6 6h.01M4 14h.01M4 10h.01M4 18h.01" />
            </svg>
          </div>
          <CardTitle className="text-xl font-semibold text-gray-800">
            Log in to Basecamp
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Button
            onClick={handleLoginClick}
            variant="default"
            className="w-full mb-4"
          >
            <span className="flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                className="w-5 h-5 mr-2"
              >
                <path
                  fill="#4285F4"
                  d="M24 9.5c3.2 0 5.8 1.3 7.7 3.2L38 7.5c-3.2-3.1-7.5-5-14-5-8 0-14.7 5.3-17 12.8l8 6.2C17 15.5 20 9.5 24 9.5z"
                />
                <path
                  fill="#34A853"
                  d="M7 16c-.5 1.4-.8 3-.8 5s.3 3.6.8 5l8-6.2c-.2-.7-.3-1.5-.3-2.3 0-.8.1-1.6.3-2.3L7 16z"
                />
                <path
                  fill="#FBBC05"
                  d="M24 38c-3.6 0-6.7-1.3-8.9-3.5l-8 6.2c3.8 4.1 9.4 6.3 16.9 6.3 7.4 0 13.6-3.5 17-8.7l-8-6.2c-2 3.3-5.3 5.7-9 5.7z"
                />
                <path
                  fill="#EA4335"
                  d="M41 17.5H24v10h10.5c-1.3 3-4.3 5-7.5 5-4 0-7.3-3-8.2-7h-10v3.5l8 6.2c1.8 4.4 6 7.3 10.2 7.3 5.4 0 10-4 10-10v-3.5c0-.8-.2-1.5-.4-2.2z"
                />
              </svg>
              Sign in with Google
            </span>
          </Button>

          {/* Divider */}
          <div className="flex items-center justify-center mb-4">
            <hr className="w-full border-t border-gray-300" />
            <span className="px-4 text-sm text-gray-500">
              Or, use my email address
            </span>
            <hr className="w-full border-t border-gray-300" />
          </div>

          <AuthForm/>
        </CardContent>
      </Card>
      <a href="#" className="font-medium mt-2 text-blue-500 hover:underline">
        Forgot your password?
      </a>
    </div>
  );
}
