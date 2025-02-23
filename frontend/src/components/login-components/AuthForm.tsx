import React, { useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { toast } from 'sonner';

type AuthFormData = {
  email: string;
  password: string;
  username?: string;
  organizationName?: string; // Optional for login
};

const AuthForm: React.FC = () => {
  const [isSignup, setIsSignup] = useState(false); // Toggle between signup and login
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    username: '',
    organizationName: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = isSignup
        ? 'http://localhost:5000/api/auth/local/signup'
        : 'http://localhost:5000/api/auth/local/login';

      const response = await axios.post(url, formData, {
        withCredentials: true, // Include cookies
      });

      if (response.data.success) {
        // Redirect or update global auth state
        const token = response.data.token; // Assuming backend sends token in response
        if (token) {
          localStorage.setItem('token', token); // Store token in localStorage
        } else {
          throw new Error('No token received from server');
        }
        // console.log('Auth successful:', response.data);
        toast.success("Authentication success")
        window.location.href = '/dashboard'; // Redirect to dashboard
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data.error || 'An error occurred');
        toast(
          "Signup error",{
            description: "Invalid credentials",
          }
           )
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-10 p-6 shadow-md">
      <CardHeader className="text-center">
        <h1 className="text-2xl font-semibold">
          {isSignup ? 'Sign Up' : 'Login'}
        </h1>
      </CardHeader>
      {error && <p className="text-red-500 text-center">{error}</p>}
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div>
              <Label htmlFor="username" className="block text-sm font-medium">
                Username
              </Label>
              <Input
                type="text"
                name="username"
                id="username"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
            </div>
          )}
          <div>
            <Label htmlFor="email" className="block text-sm font-medium">
              Email
            </Label>
            <Input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="password" className="block text-sm font-medium">
              Password
            </Label>
            <Input
              type="password"
              name="password"
              id="password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>
          {isSignup && (
          <div>
          <Label htmlFor="organizationName" className="block text-sm font-medium">
              Organization Name
            </Label>
          <Input
        type="text"
        name="organizationName"
        placeholder="Organization Name"
        value={formData.organizationName}
        onChange={handleInputChange}
        required
      />
          </div>)}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Loading...' : isSignup ? 'Sign Up' : 'Login'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-center">
        <Button
          variant="link"
          onClick={() => setIsSignup((prev) => !prev)}
          className="text-sm"
        >
          {isSignup
            ? 'Already have an account? Login'
            : 'Need an account? Sign Up'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AuthForm;