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
import React, { useState } from 'react'

type Props = {
    priority: Priority
}

const columns: GridColDef[] = [
    {
            field: "title",
            headerName: "Title",
            width: 100
        },
        {
            field: "description",
            headerName: "Description",
            width: 200
        },
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
        {
            field: "priority",
            headerName: "Priority",
            width: 75
        },
        {
            field: "tags",
            headerName: "Tags",
            width: 130
        },
        {
            field: "start_date",
            headerName: "Start Date",
            width: 130,
            renderCell: (params) => {
                return format(parseISO(params.value as string), 'dd-MM-yyyy');
            }
        },
        {
            field: "due_date",
            headerName: "Due Date",
            width: 130,
            renderCell: (params) => {
                return format(parseISO(params.value as string), 'dd-MM-yyyy')
            }
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

const ReusablePage = ({priority}: Props) => {
    const [view, setView] = useState("list");
    const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false);

    //will change after using cognito
    const userId = 2;
    const {data: task, isLoading, isError: isTasksError} = useGetTaskByUserQuery(userId || 0, {
        skip: userId === null
    });

    const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

    const filteredTasks = task?.filter((task: Task) => task.priority === priority);

    if(isTasksError || !task) return <div>Error fetching tasks...</div>

  return (
    <div className='m-5 p-4'>
        <ModalNewTask
            isOpen={isModalNewTaskOpen}
            onClose={() => setIsModalNewTaskOpen(false)}
        />
        <Header name='Priority Page' buttonComponent={
            <button className='mr-3 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 cursor-pointer'
            onClick={() => setIsModalNewTaskOpen(true)}>
                Add Task
            </button>
        }/>
        <div className='mb-4 flex justify-start'>
            <button 
                className={`px-4 py-2 cursor-pointer ${
                    view === "list" ? "bg-gray-300" : "bg-white"
                } rounded-l`}
                onClick={() => setView("list")}
            >
                List
            </button>
            <button 
                className={`px-4 py-2 cursor-pointer ${
                    view === "table" ? "bg-gray-300" : "bg-white"
                } rounded-l`}
                onClick={() => setView("table")}
            >
                Table
            </button>
        </div>
        {isLoading ? (<Loader/>) : view === "list" ? (
            <div className='grid grid-cols-1 gap-4'>
                {filteredTasks?.map((task: Task) => (
                    <TaskCard key={task.id} task={task}/>
                ))} 
            </div>
                ) : (
                    view === "table" && filteredTasks && (
                        <div className='w-full'>
                            <DataGrid
                                rows = {filteredTasks}
                                columns={columns}
                                checkboxSelection
                                getRowId={(row) => row.id}
                                className={dataGridClassNames}
                                sx={dataGridSxStyles(isDarkMode)}  
                            />
                        </div>
                    )
                )}
    </div>
  )
}

export default ReusablePage