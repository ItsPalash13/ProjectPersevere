import { createAuthClient } from "better-auth/react";

// Debug Vite environment variables
console.log('Vite Environment Variables:', {
    VITE_BACKEND_URL: import.meta.env.VITE_BACKEND_URL,
    MODE: import.meta.env.MODE,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
    BASE_URL: import.meta.env.BASE_URL,
    SSR: import.meta.env.SSR
  });
export const authClient = createAuthClient({
    baseURL: import.meta.env.VITE_BACKEND_URL, // The base URL of your auth server
    credentials: 'include'
}); 