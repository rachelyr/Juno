"use client";

import { useAppSelector } from '@/app/redux';
import Header from '@/components/Header';
import Loader from '@/components/Loader';
import ModalNewTask from '@/components/ModalNewTask';
import TaskCard from '@/components/TaskCard';
import { dataGridClassNames, dataGridSxStyles } from '@/lib/utils';
import { Priority, Task, useGetTaskByUserQuery } from '@/state/api';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { format, parseISO } from 'date-fns';
import React, { useState, useMemo } from 'react';
import { useGetAuthUserQuery } from '../../../state/api';

type Props = {
    priority: Priority
}

// Move columns outside component to prevent recreation
const columns: GridColDef[] = [
    { field: "title", headerName: "Title", width: 100 },
    { field: "description", headerName: "Description", width: 200 },
    {
        field: "status",
        headerName: "Status",
        width: 130,
        renderCell: (params) => (
            <span className='inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800'>
                {params.value}
            </span>
        )
    },
    { field: "priority", headerName: "Priority", width: 75 },
    { field: "tags", headerName: "Tags", width: 130 },
    {
        field: "start_date",
        headerName: "Start Date",
        width: 130,
        renderCell: (params) => format(parseISO(params.value as string), 'dd-MM-yyyy')
    },
    {
        field: "due_date",
        headerName: "Due Date",
        width: 130,
        renderCell: (params) => format(parseISO(params.value as string), 'dd-MM-yyyy')
    },
    {
        field: "author",
        headerName: "Author",
        width: 150,
        renderCell: (params) => params.value?.username || "Unknown"
    },
    {
        field: "assigned",
        headerName: "Assignee",
        width: 150,
        renderCell: (params) => params.value?.username || "Unassigned"
    },
];


const PRIORITY_CONFIG: Record<Priority, {
    icon: string;
    color: string;
    bgColor: string;
    borderColor: string;
    description: string;
}> = {
    Urgent: { 
        icon: '🚨', 
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800',
        description: "Critical tasks that need immediate attention"
    },
    High: { 
        icon: '⚡', 
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        borderColor: 'border-orange-200 dark:border-orange-800',
        description: "Important tasks that should be completed soon"
    },
    Medium: { 
        icon: '📋', 
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        borderColor: 'border-blue-200 dark:border-blue-800',
        description: "Regular tasks with moderate importance"
    },
    Low: { 
        icon: '📝', 
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        borderColor: 'border-green-200 dark:border-green-800',
        description: "Tasks that can be completed when time allows"
    },
    Backlog: { 
        icon: '📦', 
        color: 'text-gray-600 dark:text-gray-400',
        bgColor: 'bg-gray-50 dark:bg-gray-900/20',
        borderColor: 'border-gray-200 dark:border-gray-800',
        description: "Tasks in the backlog waiting to be prioritized"
    }
};

const PriorityBanner = ({ priority, count }: { priority: Priority; count: number }) => {
    const config = PRIORITY_CONFIG[priority];
    
    return (
        <div className={`mb-6 rounded-lg border ${config.borderColor} ${config.bgColor} p-4`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{config.icon}</span>
                    <div>
                        <h3 className={`font-semibold ${config.color}`}>
                            {priority} Priority Tasks
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {count} {count === 1 ? 'task' : 'tasks'} found
                        </p>
                    </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${config.color} ${config.bgColor} border ${config.borderColor}`}>
                    {priority}
                </div>
            </div>
        </div>
    );
};

const EmptyState = ({ priority }: { priority: Priority; onAddTask: () => void }) => {
    const config = PRIORITY_CONFIG[priority];
    
    return (
        <>
            <PriorityBanner priority={priority} count={0} />
            <div className='flex flex-col items-center justify-center mt-16 text-center'>
                <div className={`rounded-full p-8 mb-6 ${config.bgColor}`}>
                    <div className="text-6xl">{config.icon}</div>
                </div>
                
                <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                    No {priority} Priority Tasks
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md leading-relaxed">
                    You don&apos;t have any {priority.toLowerCase()} priority tasks at the moment. 
                    Create a new task to get started.
                </p>
            </div>
        </>
    );
};

const ViewToggle = ({ view, onViewChange }: { view: string; onViewChange: (view: string) => void }) => (
    <div className='mb-6 flex justify-start'>
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-1 flex">
            {['list', 'table'].map((viewType) => (
                <button 
                    key={viewType}
                    className={`px-4 py-2 rounded-md cursor-pointer transition-colors ${
                        view === viewType 
                            ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white" 
                            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                    onClick={() => onViewChange(viewType)}
                >
                    {viewType.charAt(0).toUpperCase() + viewType.slice(1)}
                </button>
            ))}
        </div>
    </div>
);

const ReusablePage = ({ priority }: Props) => {
    const [view, setView] = useState("list");
    const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false);

    const { data: currentUser } = useGetAuthUserQuery({});
    const userId = currentUser?.userDetails?.id;
    const { data: tasks, isLoading, isError } = useGetTaskByUserQuery(userId || 0, {
        skip: !userId
    });

    const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

    // Memoize filtered tasks
    const filteredTasks = useMemo(() => 
        tasks?.filter((task: Task) => task.priority === priority) || [], 
        [tasks, priority]
    );

    const addTaskButton = (
        <button 
            className='mr-3 rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2.5 font-medium text-white transition-colors shadow-sm cursor-pointer'
            onClick={() => setIsModalNewTaskOpen(true)}
        >
            <span className="mr-2 text-lg">+</span>
            Add Task
        </button>
    );

    if (isError) {
        return (
            <div className='m-5 p-4'>
                <Header name={`${priority} Priority Tasks`} />
                <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="text-red-500 text-xl mb-2">⚠️</div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                        Error Loading Tasks
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                        We couldn&apos;t load your tasks. Please try refreshing the page.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className='m-5 p-4'>
            <ModalNewTask
                isOpen={isModalNewTaskOpen}
                onClose={() => setIsModalNewTaskOpen(false)}
            />
            
            <Header name={`${priority} Priority Tasks`} buttonComponent={addTaskButton} />

            {isLoading ? (
                <Loader />
            ) : filteredTasks.length === 0 ? (
                <EmptyState priority={priority} onAddTask={() => setIsModalNewTaskOpen(true)} />
            ) : (
                <>
                    <PriorityBanner priority={priority} count={filteredTasks.length} />
                    <ViewToggle view={view} onViewChange={setView} />
                    
                    {view === "list" ? (
                        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'>
                            {filteredTasks.map((task: Task) => (
                                <TaskCard key={task.id} task={task} />
                            ))} 
                        </div>
                    ) : (
                        <div className='w-full'>
                            <DataGrid
                                rows={filteredTasks}
                                columns={columns}
                                checkboxSelection
                                getRowId={(row) => row.id}
                                className={dataGridClassNames}
                                sx={dataGridSxStyles(isDarkMode)}  
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ReusablePage;