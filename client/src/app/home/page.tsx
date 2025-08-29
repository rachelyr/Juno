"use client";

import { Priority, Project, Task, useGetAuthUserQuery, useGetProjectsQuery, useGetTaskByUserQuery } from '@/state/api';
import React, { useState } from 'react'
import { useAppSelector } from '../redux';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Header from '@/components/Header';
import {Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import { dataGridClassNames, dataGridSxStyles } from '@/lib/utils';
import Loader from '@/components/Loader';
import ModalNewProject from '../projects/ModalNewProject';
import { BarChart3, Calendar, CheckCircle, Clock, PlusSquare, Target, Users, Zap } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

//sample for new users
const sampleTaskDistribution = [
    { name: 'High', count: 5 },
    { name: 'Medium', count: 8 },
    { name: 'Low', count: 3 },
];

const sampleProjectStatus = [
    { name: 'Active', count: 7 },
    { name: 'Completed', count: 3 },
];

const quickStartFeatures = [
    {
        icon: <PlusSquare className="h-8 w-8 text-blue-500" />,
        title: "Create Your First Project",
        description: "Start organizing your work with a new project board",
        action: "Create Project"
    },
    {
        icon: <CheckCircle className="h-8 w-8 text-green-500" />,
        title: "Add Tasks",
        description: "Break down your work into manageable tasks",
        action: "Learn More"
    },
    {
        icon: <Users className="h-8 w-8 text-purple-500" />,
        title: "Invite Team Members",
        description: "Collaborate with your team on projects",
        action: "Invite"
    },
    {
        icon: <Calendar className="h-8 w-8 text-orange-500" />,
        title: "Track Progress",
        description: "Monitor deadlines and project timelines",
        action: "Explore"
    }
];

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
    const [isModalNewProjectOpen, setIsModalNewProjectOpen] = useState(false);
    const router = useRouter();
    
    const {data: currentUser} = useGetAuthUserQuery({});

    const userId = currentUser?.userDetails?.id;
        const {data: tasks, isLoading: tasksLoading, isError: tasksError} = useGetTaskByUserQuery(userId || 0, {
            skip: userId === null
        });

    const {data: projects, isLoading: isProjectsLoading} = useGetProjectsQuery();
    const isNewUser = (!tasks || tasks.length === 0) && (!projects || projects.length === 0);

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
            const today = new Date();
            const dueDate = project.due_date ? new Date(project.due_date) : null;

            let status;
            if(!dueDate){
                status = "Active";
            } else if(dueDate < today){
                status = "Completed";
            } else{
                status = "Active";
            }

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

        const WelcomeSection = () => (
            <div className='mb-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-white'>
                <div className='flex items-center justify-between'>
                    <div>
                        <h2 className='text-3xl font-bold mb-2'>
                            Welcome to Your Project Dashboard
                        </h2>
                        <p className='text-lg opacity-90 mb-4'>
                            Ready to boost your Productivity? Let&apos;s get you started with your first Project.
                        </p>
                        <button
                          className='bg-white text-blue-600 cursor-pointer font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors'
                          onClick={() => setIsModalNewProjectOpen(true)}
                        >
                            <PlusSquare className='inline h-5 w-5 mr-2'/>
                            Create Your First Project
                          </button>
                    </div>
                    <div className='hidden md:block'>
                        <div className='relative'>
                            <div className='absolute inset-0 bg-white opacity-10 rounded-full animate-pulse'>
                                <Target className='h-24 w-24 opacity-80'/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );

        const QuickStartGuide = () => (
        <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
                <Zap className="h-6 w-6 mr-2 text-yellow-500" />
                Quick Start Guide
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickStartFeatures.map((feature, index) => (
                    <div key={index} className="bg-white dark:bg-dark-secondary p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                        <div className="mb-4">{feature.icon}</div>
                        <h4 className="font-semibold text-lg mb-2 dark:text-white">{feature.title}</h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{feature.description}</p>
                        <button 
                            className="text-blue-500 hover:text-blue-600 font-medium text-sm"
                            onClick={() => {
                                if (feature.action === "Create Project") {
                                    setIsModalNewProjectOpen(true);
                                } else if(feature.action === "Invite"){
                                    router.push('/teams');
                                } else if(feature.action === "Explore"){
                                    router.push('/timeline')
                                }
                            }}
                        >
                            {feature.action} →
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );

    // Sample charts for demonstration
    const SampleCharts = () => (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-8">
            <div className='rounded-lg bg-white p-4 shadow dark:bg-dark-secondary relative'>
                <div className="absolute top-2 right-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs">
                    Sample Data
                </div>
                <h3 className='mb-4 text-lg font-semibold dark:text-white flex items-center'>
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Task Priority Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={sampleTaskDistribution}>
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
            <div className='rounded-lg bg-white p-4 shadow dark:bg-dark-secondary relative'>
                <div className="absolute top-2 right-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs">
                    Sample Data
                </div>
                <h3 className='mb-4 text-lg font-semibold dark:text-white flex items-center'>
                    <Target className="h-5 w-5 mr-2" />
                    Project Status Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie dataKey="count" data={sampleProjectStatus} fill='#82CA9D' label>
                            {sampleProjectStatus.map((entry, index) => (
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
        </div>
    );

  return (
    <div className='h-full flex-1 bg-gray-100 dark:bg-dark-bg p-8'>
        <Toaster/>
        <ModalNewProject
            isOpen={isModalNewProjectOpen}
            onClose={() => setIsModalNewProjectOpen(false)}    
        />
        <Header name='Project Dashboard'
        buttonComponent={
                <button
                  className='flex items-center rounded-md bg-blue-primary p-2 sm:px-3 text-sm sm:py-2 sm:text-base text-white hover:bg-blue-600 hover:cursor-pointer'
                  onClick={() => setIsModalNewProjectOpen(true)}
                >
                    <PlusSquare className='mr-2 h-5 w-5'/> New Board
                </button>
        }/>
        
        {isNewUser ? (
            <>
                <WelcomeSection />
                <QuickStartGuide />
                <SampleCharts />
                <div className="rounded-lg bg-white p-8 shadow dark:bg-dark-secondary text-center">
                    <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Your Tasks Will Appear Here
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        Once you create projects and add tasks, you will see them organized in a table here.
                    </p>
                </div>
            </>
        ) : (
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div className='rounded-lg bg-white p-4 shadow dark:bg-dark-secondary'>
                    <h3 className='mb-4 text-lg font-semibold dark:text-white'>
                        Task Priority Distribution
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
                    {tasks && tasks.length > 0 ? (
                        <div style={{height:300, width: "100%"}}>
                        <DataGrid
                            rows={tasks || []}
                            columns={taskColumns}
                            loading={tasksLoading}
                            getRowClassName={() => 'data-grid-row'}
                            getCellClassName={() => 'data-grid-cell'}
                            className={dataGridClassNames}
                            sx={dataGridSxStyles(isDarkMode)}    
                        />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Clock className="h-16 w-16 text-gray-400 mb-4" />
                            <h4 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                No Tasks Yet
                            </h4>
                            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
                                {projects && projects.length > 0 
                                    ? "You have projects but no tasks assigned to you yet. Tasks will appear here once they're created and assigned to you."
                                    : "Once you create projects and add tasks, you'll see them organized in a table here."
                                }
                            </p>
                            {projects && projects.length > 0 && (
                                <div className="text-sm text-gray-400 dark:text-gray-500">
                                    💡 Tip: Go to your project boards to create and assign tasks.
                                </div>
                            )}
                        </div>
                    )}
                    
                </div>
            </div>
        )}
    </div>
  )
}

export default HomePage