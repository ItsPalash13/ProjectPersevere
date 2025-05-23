import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'http://localhost:3000/api',
    credentials: 'include'
  }),
  tagTypes: ['UserProfile'],
  endpoints: (builder) => ({
    getUserInfo: builder.query({
      query: (userId) => {
        if (!userId) {
          throw new Error('User ID is required');
        }
        return {
          url: `/user/info/${userId}`,
          method: 'GET'
        };
      },
      providesTags: ['UserProfile']
    }),
    updateUserInfo: builder.mutation({
      query: ({ userId, data }) => {
        if (!userId) {
          throw new Error('User ID is required');
        }
        return {
          url: `/user/info/${userId}`,
          method: 'PATCH',
          body: data
        };
      },
      invalidatesTags: ['UserProfile']
    }),
    getUserSettings: builder.query({
      query: (userId) => {
        if (!userId) {
          throw new Error('User ID is required');
        }
        return {
          url: `/user/settings/${userId}`,
          method: 'GET'
        };
      },
      providesTags: ['UserProfile']
    }),
    updateUserSettings: builder.mutation({
      query: ({ userId, data }) => {
        if (!userId) {
          throw new Error('User ID is required');
        }
        return {
          url: `/user/settings/${userId}`,
          method: 'PATCH',
          body: data
        };
      },
      invalidatesTags: ['UserProfile']
    })
  })
});

export const {
  useGetUserInfoQuery,
  useUpdateUserInfoMutation,
  useGetUserSettingsQuery,
  useUpdateUserSettingsMutation
} = userApi;
