"use client";

import Header from '@/components/Header';
import { Clock, Filter, Grid3X3, List, PlusSquare, Search, Table, Trash, Copy, Check } from 'lucide-react';
import React, { useState } from 'react'
import ModalNewProject from './ModalNewProject';
import toast, { Toaster } from 'react-hot-toast';
import { useDeleteProjectMutation, useGetAuthUserQuery, useGetProjectsQuery } from '@/state/api';
import { useParams, useRouter } from 'next/navigation';

type Props = {
    activeTab: string,
    setActiveTab: (tabName: string) =>void
}

const ProjectHeader = ({activeTab, setActiveTab} : Props) => {
    const [isModalNewProjectOpen, setIsModelNewProjectOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [copied, setCopied] = useState(false);

    const [deleteProject] = useDeleteProjectMutation();
    const {data: currentUser} = useGetAuthUserQuery({});
    const {data: projects} = useGetProjectsQuery();

    const { id } = useParams();
    const projectId = id;
    const router = useRouter();
    
    const currentProject = projects?.find(project => project.id === Number(projectId));
    const isProjectOwner = currentUser && currentProject && currentUser.userDetails.id === currentProject?.owner_id;

    const handleDelete = () => {
        // Add a check to ensure projectId exists
        if (!projectId) {
            toast.error("No project selected to delete");
            return;
        }
        
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        try {
            await deleteProject({ projectId: Number(projectId) }).unwrap();
            toast.success("Project deleted successfully!");
            router.push('/home');
            setShowDeleteConfirm(false);
        } catch (error) {
            console.error("Delete project error:", error);
        }
    };

    const copyProjectId = async () => {
        if (projectId) {
            await navigator.clipboard.writeText(projectId.toString());
            setCopied(true);
            toast.success('Project ID copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        }
    };

  return (
    <div className='px-4 xl:px-6'>
        <Toaster/>
        <ModalNewProject
            isOpen={isModalNewProjectOpen}
            onClose={() => setIsModelNewProjectOpen(false)}
        />
        <div className='pb-6 pt-6 lg:pb-4 lg:pt-8'>
            <Header name="Product Juno Development"
            buttonComponent={
                <div className='flex gap-2'>
                    <button
                        className='flex items-center rounded-md bg-blue-primary px-3 py-2 text-white hover:bg-blue-600 hover:cursor-pointer'
                        onClick={() => setIsModelNewProjectOpen(true)}
                    >
                    <PlusSquare className='mr-2 h-5 w-5'/> New Board
                    </button>
                    { isProjectOwner && (
                        <button
                        onClick={handleDelete}
                        className='flex items-center rounded-md bg-red-500 px-3 py-2 text-white hover:bg-red-600 hover:cursor-pointer disabled:opacity-50'
                    >
                        <Trash size={16}/>
                    </button>
                    )}
                </div>
            }
            />
            
            {/* Project ID Display */}
            {projectId && (
                <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        Project ID:
                    </span>
                    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-md px-2 py-1">
                        <code className="text-sm font-mono text-gray-700 dark:text-gray-300">
                            #{projectId}
                        </code>
                        <button
                            onClick={copyProjectId}
                            className="ml-1 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                            title="Copy Project ID"
                        >
                            {copied ? (
                                <Check className="h-3 w-3 text-green-600" />
                            ) : (
                                <Copy className="h-3 w-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" />
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>

        {/* HORIZONTAL TABS */}
        <div className='flex flex-wrap-reverse gap-2 border-y border-gray-200 pb-[8px] pt-2 dark:border-stroke-dark md:items-center'>
            <div className='flex flex-1 items-center gap-2 md:gap-4'>
                <TabButton 
                    name="Board"
                    icon={<Grid3X3 className='h-5 w-5'/>}
                    setActiveTab={setActiveTab}
                    activeTab={activeTab}
                />
                <TabButton 
                    name="List"
                    icon={<List className='h-5 w-5'/>}
                    setActiveTab={setActiveTab}
                    activeTab={activeTab}
                />
                <TabButton 
                    name="Timeline"
                    icon={<Clock className='h-5 w-5'/>}
                    setActiveTab={setActiveTab}
                    activeTab={activeTab}
                />
                <TabButton 
                    name="Table"
                    icon={<Table className='h-5 w-5'/>}
                    setActiveTab={setActiveTab}
                    activeTab={activeTab}
                />
            </div>
            <div className='flex items-center gap-2'>
                <button className='text-gray-500 hover:text-gray-600 dark:text-neutral-500 dark:hover:text-gray-300'>
                    <Filter className='h-5 w-5'/>
                </button>
                <button className='text-gray-500 hover:text-gray-600 dark:text-neutral-500 dark:hover:text-gray-300'>
                    <Search className='h-5 w-5'/>
                </button>
                <div className='relative'>
                    <input type="text" placeholder='Search Task' className="rounded-md border py-1 pl-10 pr-4 focus:outline-none dark:border-dark-secondary dark:bg-dark-secondary dark:text-white"/>
                    <Grid3X3 className='absolute left-3 top-2 h-4 w-4 text-gray-400 dark:text-neutral-500'/>
                </div>
            </div>
        </div>

        {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-dark-secondary p-6 rounded-lg shadow-lg max-w-sm w-full mx-4">
                    <h3 className="text-lg font-semibold mb-2 dark:text-white">Confirm Deletion</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Are you sure you want to delete this project? This action cannot be undone.
                    </p>
                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={() => setShowDeleteConfirm(false)}
                            className="px-4 py-2 text-gray-600 dark:text-gray-300 cursor-pointer border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmDelete}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  )
};

type TabButtonProps = {
    name: string;
    icon: React.ReactNode;
    setActiveTab: (tabName : string) =>void;
    activeTab: string;
}

const TabButton = ({name, icon, setActiveTab, activeTab} : TabButtonProps) => {
    const isActive = activeTab === name;

    return(
        <button className={`relative flex items-center gap-2 px-1 py-2 text-gray-500 after:absolute after:-bottom-[9px] after:left-0 after:h-[1px] after:w-full hover:text-blue-600 dark:text-neutral-600 dark:hover:text-white sm:px-2 lg:px-4 hover:cursor-pointer
            ${isActive ? "text-blue-600 after:bg-blue-600 dark:text-white" : ""}`}
            onClick={() => setActiveTab(name)}>
                {icon}
                {name}
            </button>
    )
}

export default ProjectHeader;