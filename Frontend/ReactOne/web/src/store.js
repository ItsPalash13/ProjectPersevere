import { configureStore } from '@reduxjs/toolkit';
import { userApi } from './features/api/userAPI';
import { levelApi } from './features/api/levelAPI';
import { inventoryApi } from './features/api/inventoryAPI';
import authReducer from './features/auth/authSlice';
import levelSessionReducer from './features/auth/levelSessionSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    levelSession: levelSessionReducer,
    // RTK Query reducers
    [userApi.reducerPath]: userApi.reducer,
    [levelApi.reducerPath]: levelApi.reducer,
    [inventoryApi.reducerPath]: inventoryApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      userApi.middleware,
      levelApi.middleware,
      inventoryApi.middleware
    ),
});
