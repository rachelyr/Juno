"use client";

import React, { use, useState } from 'react'
import ProjectHeader from "@/app/projects/ProjectHeader";
import BoardView from '../Board';
import List from '../ListView';
import Timeline from '../TimelineView';
import Table from '../TableView';
import ModalNewTask from '@/components/ModalNewTask';
import ModalEditTask from '@/components/ModalEditTask';
import { Task, useGetProjectByIdQuery } from '@/state/api';
import Loader from '@/components/Loader';

type Props = {
    params: Promise<{id: string}>;
}

const Project = ({params}: Props) => {
    const {id} = use(params);
    const projectId = Number(id);
    const { error, isLoading} = useGetProjectByIdQuery(projectId);
    const [activeTab, setActiveTab] = useState("Board"); //done for tracking Board, List or Timeline state
    const [isModalNewTaskOpen, setIsModelNewTaskOpen] = useState(false);
    const [isModalEditTaskOpen, setIsModalEditTaskOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);

    const handleEditTask = (task: Task) => {
        setSelectedTask(task);
        setIsModalEditTaskOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsModalEditTaskOpen(false);
        setSelectedTask(undefined);
    };

    if (isLoading) return <Loader/>;

    if (error) {
        if ("status" in error && error.status === 404) {
            return <div>❌ Project not found</div>;
        }
        if ("status" in error && error.status === 403) {
            return <div>🚫 You don&apos;t have access to this project</div>;
        }
        return <div>⚠️ Something went wrong</div>;
    }

    return (
        <div>
            {/* NEW TASK */}
            <ModalNewTask
                isOpen={isModalNewTaskOpen}
                onClose={() => setIsModelNewTaskOpen(false)}
                id={id}
            />

            <ModalEditTask
                projectid={id}
                isOpen={isModalEditTaskOpen}
                onClose={handleCloseEditModal}
                task={selectedTask!}
            />

            <ProjectHeader activeTab={activeTab} setActiveTab={setActiveTab}/>
            {activeTab === "Board" && 
            (
                <BoardView id={id} setIsModalNewTaskOpen={setIsModelNewTaskOpen} onEditTask={handleEditTask}/>
            )}
            {activeTab === "List" && 
            (
                <List id={id} setIsModalNewTaskOpen={setIsModelNewTaskOpen}/>
            )}
            {activeTab === "Timeline" && 
            (
                <Timeline id={id} setIsModalNewTaskOpen={setIsModelNewTaskOpen}/>
            )}
            {activeTab === "Table" && 
            (
                <Table id={id} setIsModalNewTaskOpen={setIsModelNewTaskOpen}/>
            )}
        </div>
    )
}

export default Project;