import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlices';

// Configure the Redux store
export const store = configureStore({
  reducer: {
    user: userReducer,
  },
});

// Define the RootState type based on the store
export type RootState = ReturnType<typeof store.getState>;

// Optionally, you can also define the AppDispatch type
export type AppDispatch = typeof store.dispatch;
