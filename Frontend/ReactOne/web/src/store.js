import { configureStore } from '@reduxjs/toolkit';
import { userApi } from './features/api/userAPI';
import { levelApi } from './features/api/levelAPI';
import { chapterApi } from './features/api/chapterAPI';
import { performanceApi } from './features/api/performanceAPI';
import authReducer from './features/auth/authSlice';
import levelSessionReducer from './features/auth/levelSessionSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    levelSession: levelSessionReducer,
    // RTK Query reducers
    [userApi.reducerPath]: userApi.reducer,
    [levelApi.reducerPath]: levelApi.reducer,
    [chapterApi.reducerPath]: chapterApi.reducer,
    [performanceApi.reducerPath]: performanceApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      userApi.middleware,
      levelApi.middleware,
      chapterApi.middleware,
      performanceApi.middleware
    ),
});
