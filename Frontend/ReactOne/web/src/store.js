import { configureStore } from '@reduxjs/toolkit';
import { userApi } from './features/api/userAPI';
import authReducer from './features/auth/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // RTK Query reducers
    [userApi.reducerPath]: userApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      userApi.middleware
    ),
});
