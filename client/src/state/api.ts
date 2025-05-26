import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query";

export interface Project{
    id: number;
    name: string;
    description?: string;
    start_date?: string;
    due_date?: string;
}

export const api = createApi({
    baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL}),
    reducerPath: "api",
    tagTypes: [],
    endpoints: (build) => ({}), //currently empty
});

export const {} = api;