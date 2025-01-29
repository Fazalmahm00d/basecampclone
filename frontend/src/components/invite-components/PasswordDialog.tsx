import React, { useState } from "react";
import axios from "axios";

interface PasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  inviteToken: string;
}

const PasswordDialog: React.FC<PasswordDialogProps> = ({
  isOpen,
  onClose,
  inviteToken,
}) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate password
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);

    try {
      // Send the password and token to the accept-invite API
      const response = await axios.post(
        "http://localhost:5000/api/accept-invite",
        { token: inviteToken, password }
      );

      console.log("Invitation accepted:", response.data);

      // Close the dialog and redirect the user
      onClose();
      window.location.href = "/dashboard"; // Redirect to dashboard or home page
    } catch (error) {
      console.error("Error accepting invitation:", error);
      setError("There was an error accepting the invitation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Set Your Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
              required
              minLength={6}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded bg-gray-300 hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border rounded bg-blue-500 text-white hover:bg-blue-600"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordDialog;