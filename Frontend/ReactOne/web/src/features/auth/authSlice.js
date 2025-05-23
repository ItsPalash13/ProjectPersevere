// src/features/auth/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  session: null,
  user: null,
  isAuthenticated: false
};

// Helper function to serialize dates in session
const serializeSession = (session) => {
  if (!session) return null;
  return {
    ...session,
    expiresAt: session.expiresAt?.toISOString(),
    createdAt: session.createdAt?.toISOString(),
    updatedAt: session.updatedAt?.toISOString()
  };
};

// Helper function to serialize dates in user
const serializeUser = (user) => {
  if (!user) return null;
  return {
    ...user,
    createdAt: user.createdAt?.toISOString(),
    updatedAt: user.updatedAt?.toISOString()
  };
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession: (state, action) => {
      console.log('Setting session in Redux:', action.payload); // Debug log
      state.session = action.payload.session;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      console.log('New auth state:', state); // Debug log
    },
    logout: (state) => {
      state.session = null;
      state.user = null;
      state.isAuthenticated = false;
    }
  }
});

export const { setSession, logout } = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectCurrentUser = (state) => {
  console.log('Auth state in selector:', state?.auth); // Debug log
  return state?.auth?.user || null;
};
export const selectIsAuthenticated = (state) => state?.auth?.isAuthenticated || false;
export const selectSession = (state) => state?.auth?.session || null;
