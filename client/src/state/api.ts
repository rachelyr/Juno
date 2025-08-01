import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";

export interface Project{
    id: number;
    name: string;
    description?: string;
    start_date?: string;
    due_date?: string;
}

export enum Status{
    ToDo = "To Do",
    WorkInProgess = "Work In Progress",
    UnderReview = "Under Review",
    Completed = "Completed"
}

export enum Priority{
    Urgent = "Urgent",
    High = "High",
    Medium = "Medium",
    Low = "Low",
    Backlog = "Backlog"
}

export interface User{
    id?: number;
    username: string;
    email: string;
    profilepicture_id?: string;
    cognito_id: string;
    teamId?: number;
}

export interface Attachment{
    id: number;
    file_url: string;
    file_name: string;
    task_id?: number;
    uploadedby_id: number;
}

export interface Task{
    id: number;
    title: string;
    description: string;
    status: Status;
    priority: Priority;
    tags: string;
    start_date: string;
    due_date: string;
    points: number;
    assigned_userid: number;
    author_userid: number;
    project_id: number;

    author?: User;
    assigned?: User;
    comment?: Comment[];
    attachment?: Attachment[];
}

export interface SearchResult{
    tasks?: Task[];
    projects?: Project[];
    users?: User[];
}

export interface Team{
    teamId: number;
    teamName: string;
    productowner_userid?: number;
    projectmanager_userid?: number;
}

export interface Comment{
    id: number;
    text: string,
    task_id?: number,
    user_id: number,
    username: string;
}

export const api = createApi({
    baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL}),
    reducerPath: "api",
    tagTypes: ["Project", "Task", "Users","Teams","Attachments","Comments"],
    endpoints: (build) => ({
        getProjects: build.query<Project[], void>({
            query: () => "api/projects/",  //short hand notation
            providesTags: ["Project"],
        }),
        createProjects: build.mutation<Project[], Partial<Project>>({ //mutation is used to create
            query: (project) => ({  //this isnt short hand 
                url: "api/projects/",
                method: "POST",
                body: project
            }),
            invalidatesTags: ["Project"] //this update the Project value
        }),
        getTasks: build.query<Task[], {project_id: number}>({
            query: ({ project_id }) => `api/tasks?project_id=${project_id}`,  //short hand notation
            providesTags: (result) => result
                ? [
                    ...result.map(({ id }) => ({ type: "Task" as const, id })),
                    { type: "Task" as const, id: "LIST" }
                ]
                : [{ type: "Task" as const, id: "LIST" }],
        }),
        createTasks: build.mutation<Task[], Partial<Task>>({ //mutation is used to create
            query: (task) => ({
                url: "api/tasks/",
                method: "POST",
                body: task
            }),
            invalidatesTags: ["Task"]
        }),
        updateTaskStatus: build.mutation<Task[], {task_id: number, status: string}>({ //mutation is used to create
            query: ({task_id, status}) => ({
                url: `api/tasks/${task_id}/status/`,
                method: "PATCH",
                body: {status}
            }),
            invalidatesTags: (result, error, {task_id}) => [
                {type: "Task", id: task_id} //done cause we are updating specific task as per id not entire Task
            ]
        }),
        updateTask: build.mutation<Task[], {task_id: number; data: Partial<Task>; project_id: number}>({
            query: ({task_id, data, project_id}) => ({
                url: `api/tasks/${task_id}/?project_id=${project_id}`,
                method: "PATCH",
                body: data
            }),
            invalidatesTags: (result, error, {task_id}) => [
                {type: "Task", id: task_id},
                {type: "Task", id: "LIST"}
            ]
        }),
        getTaskByUser: build.query<Task[], number>({
            query: (id) => `api/tasks/user/${id}`,
            providesTags: (result, error, id) =>
                result
                ? result.map(({id}) => ({type: "Task", id}))
                : [{type: "Task", id: id}] //problem  tag name mismatch Tasks instead of Task written
        }),
        getUsers: build.query<User[], void>({
            query: () => "api/users/",
            providesTags: ["Users"]
        }),
        getTeams: build.query<Team[], void>({
            query: () => "api/teams/",
            providesTags: ["Teams"]
        }),
        createAttachment: build.mutation<Attachment[], {task_id: number; user_id: number; data: FormData}>({ //mutation is used to create
            query: ({task_id, user_id, data}) => ({
                url: `api/tasks/${task_id}/attachments?user_id=${user_id}`,
                method: "POST",
                body: data
            }),
            invalidatesTags: ["Attachments"]
        }),
        getAttachments: build.query<Attachment[], {task_id: number}>({
            query: ({task_id}) => `api/tasks/${task_id}/attachments/`,
            providesTags: ["Attachments"]
        }),
        createComment: build.mutation<Comment[], {task_id: number; user_id: number; data: FormData}>({ //mutation is used to create
            query: ({task_id, user_id, data}) => ({
                url: `api/tasks/${task_id}/comments/?user_id=${user_id}`,
                method: "POST",
                body: data
            }),
            invalidatesTags: (result, error, { task_id }) => [
                { type: "Comments", id: task_id }
            ],
        }),
        getComments: build.query<Comment[], {task_id: number}>({
            query: ({ task_id }) => `api/tasks/${task_id}/comments/`,
            providesTags: (result, error, { task_id }) => [
                { type: "Comments", id: task_id }
            ],
        }),
        deleteComment: build.mutation<void, {task_id:number; comm_id: number}>({
            query: ({task_id, comm_id}) => ({
                url: `api/tasks/${task_id}/comments/${comm_id}/`,
                method: "DELETE"
            }),
            invalidatesTags: (result, error, {task_id}) => [
                {type: "Comments", id: task_id}
            ]
        }),
        search: build.query<SearchResult, string>({
            query: (q) => `api/search/?q=${q}`,
        }),
    }),
});

export const {
    useGetProjectsQuery,
    useCreateProjectsMutation,
    useGetTasksQuery,
    useCreateTasksMutation,
    useUpdateTaskStatusMutation,
    useUpdateTaskMutation,
    useGetUsersQuery,
    useSearchQuery,
    useGetTeamsQuery,
    useCreateAttachmentMutation,
    useGetAttachmentsQuery,
    useGetTaskByUserQuery,
    useCreateCommentMutation,
    useGetCommentsQuery,
    useDeleteCommentMutation
} = api;