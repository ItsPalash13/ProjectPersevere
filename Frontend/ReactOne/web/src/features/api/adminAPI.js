import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth } from './baseQuery';

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Subject', 'Chapter', 'Topic', 'Question'],
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
    // Topic endpoints
    getTopics: builder.query({
      query: (chapterId) => chapterId ? ({ url: `/api/admin/topics?chapterId=${chapterId}`, method: 'GET' }) : ({ url: '/api/admin/topics', method: 'GET' }),
      providesTags: ['Topic'],
    }),
    createTopic: builder.mutation({
      query: (body) => ({ url: '/api/admin/topics', method: 'POST', body }),
      invalidatesTags: ['Topic'],
    }),
    updateTopic: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/api/admin/topics/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Topic'],
    }),
    deleteTopic: builder.mutation({
      query: (id) => ({ url: `/api/admin/topics/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Topic'],
    }),
    // Unit endpoints
    createUnit: builder.mutation({
      query: (body) => ({ url: '/api/admin/units', method: 'POST', body }),
      invalidatesTags: ['Chapter'],
    }),
    updateUnit: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/api/admin/units/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Chapter'],
    }),
    deleteUnit: builder.mutation({
      query: (id) => ({ url: `/api/admin/units/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Chapter'],
    }),
    getUnits: builder.query({
      query: (chapterId) => ({ url: `/api/admin/units?chapterId=${chapterId}`, method: 'GET' }),
      providesTags: ['Chapter'],
    }),
    // Question endpoints
    getQuestions: builder.query({
      query: (chapterId) => ({ 
        url: '/api/admin/questions', 
        method: 'GET',
        params: chapterId ? { chapterId } : {}
      }),
      providesTags: ['Question'],
    }),
    getQuestionById: builder.query({
      query: (id) => ({ url: `/api/admin/questions/${id}`, method: 'GET' }),
      providesTags: ['Question'],
    }),
    createQuestion: builder.mutation({
      query: (body) => ({ url: '/api/admin/questions', method: 'POST', body }),
      invalidatesTags: ['Question'],
    }),
    multiAddQuestions: builder.mutation({
      query: (body) => ({ url: '/api/admin/questions/multi-add', method: 'POST', body }),
      invalidatesTags: ['Question'],
    }),
    updateQuestion: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/api/admin/questions/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Question'],
    }),
    deleteQuestion: builder.mutation({
      query: (id) => ({ url: `/api/admin/questions/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Question'],
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
  useGetTopicsQuery,
  useCreateTopicMutation,
  useUpdateTopicMutation,
  useDeleteTopicMutation,
  useCreateUnitMutation,
  useUpdateUnitMutation,
  useDeleteUnitMutation,
  useGetUnitsQuery,
  useGetQuestionsQuery,
  useGetQuestionByIdQuery,
  useCreateQuestionMutation,
  useMultiAddQuestionsMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
} = adminApi;
