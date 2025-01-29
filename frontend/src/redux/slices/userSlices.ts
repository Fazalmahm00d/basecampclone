import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { act } from 'react';

// Define the type for the state
interface UserState {
  name: string;
  email: string;
  profilePicture: string;
  organizationName:string;
}

// Define the initial state with proper typing
const initialState: UserState = {
  name: '',
  email: '',
  profilePicture: "",
  organizationName: "",
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Action to set user information with payload type
    setUser(state, action: PayloadAction<{ name: string; email: string; organizationName:string; profilePicture: string; }>) {
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.organizationName=action.payload.organizationName;
      state.profilePicture=action.payload.profilePicture;
    },
    // Action to log out the user
    logout(state) {
      state.name = '';
      state.email = '';
      state.organizationName='';
      state.profilePicture='';
    },
  },
});

// Export the actions and reducer
export const { setUser, logout } = userSlice.actions;
export default userSlice.reducer;
