import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AccountState{
    name:string;
    accountId:string;
  }

const initialState: AccountState = {
    name: '',
    accountId: '',
};

const accountSlice=createSlice({
    name: 'account',
    initialState,
    reducers: {
      // Action to set user information with payload type
      setAccount(state, action: PayloadAction<{ name: string; accountId: string; }>) {
        state.name = action.payload.name;
        state.accountId = action.payload.accountId;
        
      },
      // Action to log out the user
      logout(state) {
        state.name = '';
        state.accountId = '';
      },
    },
  });

  export const { setAccount, logout } = accountSlice.actions;
  export const accountReducer=accountSlice.reducer;