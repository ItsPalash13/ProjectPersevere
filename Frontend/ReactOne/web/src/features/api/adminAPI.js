import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth } from './baseQuery';

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Subject', 'Chapter'],
  endpoints: (builder) => ({
    // Subject endpoints
    getSubjects: builder.query({
      query: () => ({ url: '/api/admin/subjects', method: 'GET' }),
      providesTags: ['Subject'],
    }),
    createSubject: builder.mutation({
      query: (body) => ({ url: '/api/admin/subjects', method: 'POST', body }),
      invalidatesTags: ['Subject'],
    }),
    updateSubject: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/api/admin/subjects/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Subject'],
    }),
    deleteSubject: builder.mutation({
      query: (id) => ({ url: `/api/admin/subjects/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Subject'],
    }),
    // Chapter endpoints
    getChapters: builder.query({
      query: () => ({ url: '/api/chapters', method: 'GET' }),
      providesTags: ['Chapter'],
    }),
    createChapter: builder.mutation({
      query: (body) => ({ url: '/api/admin/chapters', method: 'POST', body }),
      invalidatesTags: ['Chapter'],
    }),
    updateChapter: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/api/admin/chapters/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Chapter'],
    }),
    getChapterById: builder.query({
      query: (id) => ({ url: `/api/admin/chapters/${id}`, method: 'GET' }),
      providesTags: ['Chapter'],
    }),
  }),
});

export const {
  useGetSubjectsQuery,
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
  useGetChaptersQuery,
  useCreateChapterMutation,
  useUpdateChapterMutation,
  useGetChapterByIdQuery,
} = adminApi;
