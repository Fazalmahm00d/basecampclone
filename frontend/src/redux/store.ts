import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlices';
import { accountReducer } from './slices/accountSlices';

// Configure the Redux store
export const store = configureStore({
  reducer: {
    user: userReducer,
    account:accountReducer
  },
});

// Define the RootState type based on the store
export type RootState = ReturnType<typeof store.getState>;

// Optionally, you can also define the AppDispatch type
export type AppDispatch = typeof store.dispatch;
