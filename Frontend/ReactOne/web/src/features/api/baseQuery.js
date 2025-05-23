import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { authClient } from '../../lib/auth-client';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:3000',
  credentials: 'include', // Ensures cookies are sent with requests
  prepareHeaders: async (headers) => {
    // try {
    //   const session = await authClient.getSession();
    //   const token = session?.data?.session?.token;
    //   if (token) {
    //     headers.set('Authorization', `Bearer ${token}`);
    //   }
    // } catch (error) {
    //   console.error('Error getting session:', error);
    // }

    // return headers;
  },
});

export const baseQueryWithAuth = async (args, api, extraOptions) => {
  console.log([args, api, extraOptions]);
  return rawBaseQuery(args, api, extraOptions);
};
