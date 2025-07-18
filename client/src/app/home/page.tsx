"use client";

import { Priority, Project, Task, useGetProjectsQuery, useGetTasksQuery } from '@/state/api';
import React from 'react'
import { useAppSelector } from '../redux';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Header from '@/components/Header';
import {Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import { dataGridClassNames, dataGridSxStyles } from '@/lib/utils';
import Loader from '@/components/Loader';


//Task columns - MUI -- NEEDS CHANGE need to tasks/data of logged in user
const taskColumns: GridColDef[] = [
        {field: "title", headerName: "Title", width: 200},
        {field: "status", headerName: "Status", width: 150},
        {field: "priority", headerName: "Priority", width: 150},
        {field: "due_date", headerName: "Due Date", width: 150,
            renderCell: (params) => {
            if (!params.value) return '';
            
            const date = new Date(params.value);
            const today = new Date();
            const fiveDaysFromNow = new Date();
            fiveDaysFromNow.setDate(today.getDate() + 5);
            
            const isUpcoming = date >= today && date <= fiveDaysFromNow;
            const isPast = date < today;
            
            const formattedDate = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            return (
                <span 
                    className={`
                        px-2 py-1 rounded-md text-sm font-medium
                        ${isUpcoming ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : ''}
                        ${isPast ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : ''}
                    `}
                >
                    {formattedDate}
                </span>
            );
        }
        },
    ];

    const Colors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const HomePage = () => {
    const {data: tasks, isLoading: tasksLoading, isError: tasksError} = useGetTasksQuery({project_id: parseInt('2')});

    const {data: projects, isLoading: isProjectsLoading} = useGetProjectsQuery();

    const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

    if(tasksLoading || isProjectsLoading) return <Loader/>
    if(tasksError || !tasks || !projects) return <div>Error fetching data...</div>

    const PriorityCount = tasks.reduce(
        //record is an object whose type is defined here
        (acc: Record<string, number>, task: Task) => {
            const {priority} = task;
            acc[priority as Priority] = (acc[priority as Priority] || 0) + 1;
            return acc;
        },
        {},
    );

    const taskDistribution = Object.keys(PriorityCount).map((key) => ({
        name: key,
        count: PriorityCount[key],
    }));

    //Count how many projects are "Completed" or "Active" based on whether they have a due_date.
    const StatusCount = projects.reduce(
        (acc: Record<string, number>, project: Project) => {
            const status = project.due_date ? "Completed" : "Active";
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        },
        {},
    );

    //Transform the StatusCount object into an array of objects that’s easier to use in e.g. charts, tables, UI lists
    const ProjectStatus = Object.keys(StatusCount).map((key) => ({
        name: key,
        count: StatusCount[key]
    }));

    const chartColors = isDarkMode
        ? {
            bar: "#8884D8",
            barGrid: "#303030",
            pieFill: "#4A90E2",
            text: "#FFFFFF"
        } : {
            bar: "#8884D8",
            barGrid: "#E0E0E0",
            pieFill: "#82CA9D",
            text: "#000000"
        }

  return (
    <div className='container h-full w-[100%] bg-gray-100 dark:bg-dark-bg p-8'>
        <Header name='Project Management Dashboard'/>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div className='rounded-lg bg-white p-4 shadow dark:bg-dark-secondary'>
                    <h3 className='mb-4 text-lg font-semibold dark:text-white'>
                        Task Prioririty Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={taskDistribution}>
                            <CartesianGrid 
                                strokeDasharray='3 3'
                                stroke={chartColors.barGrid}    
                            />
                            <XAxis dataKey={"name"} stroke={chartColors.text}/>
                            <YAxis stroke={chartColors.text}/>
                            <Tooltip contentStyle={{
                                width: "min-content",
                                height: "min-content"
                            }}/>
                            <Legend/>
                            <Bar dataKey="count" fill={chartColors.bar}/>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className='rounded-lg bg-white p-4 shadow dark:bg-dark-secondary'>
                    <h3 className='mb-4 text-lg font-semibold dark:text-white'>
                        Project Status Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie dataKey="count" data={ProjectStatus} fill='#82CA9D' label>
                                {ProjectStatus.map((entry, index) => (
                                    <Cell 
                                        key={`cell-${index}`}
                                        fill={Colors[index %  Colors.length]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend/>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className='rounded-lg bg-white p-4 shadow dark:bg-dark-secondary md:col-span-2'>
                    <h3 className='mb-4 text-lg font-semibold dark:text-white'>
                        Your Tasks
                    </h3>
                    <div style={{height:300, width: "100%"}}>
                        <DataGrid
                            rows={tasks}
                            columns={taskColumns}
                            //checkboxSelection
                            loading={tasksLoading}
                            getRowClassName={() => 'data-grid-row'}
                            getCellClassName={() => 'data-grid-cell'}
                            className={dataGridClassNames}
                            sx={dataGridSxStyles(isDarkMode)}    
                        />
                    </div>
                </div>
        </div>
    </div>
  )
}

export default HomePage