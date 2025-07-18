import Modal from '@/components/Modal';
import { useCreateProjectsMutation } from '@/state/api';
import React, { useState } from 'react'

type Props = {
    isOpen: boolean;
    onClose: () => void;
}

const ModalNewProject = ({isOpen, onClose}: Props) => {
    const [createProject, {isLoading}] = useCreateProjectsMutation();
    const [projectName, setProjectName] = useState("");
    const [description, setDescription] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const handleSubmit = async () => {
        if (!projectName || !startDate || !endDate) return;

        //the api to create project
        await createProject({
            name: projectName,
            description,
            start_date: startDate,
            due_date: endDate
        });
        onClose();
    };

    const isFormValid = () => {
        return projectName && description && startDate && endDate;
    };

    const inputStyles = "w-full rounded border border-gray-300 p-2 shadow-sm dark:border-dark-teritary dark:bg-dark-teritary dark:text-white dark:focus:outline-none";

  return <Modal isOpen={isOpen} onClose={onClose} name='Create New Project'>
    <form 
     className='mt-4 space-y-6'
     onSubmit={(e) => {
        e.preventDefault(); //so the page doesnt refresh
        handleSubmit();
     }} 
    >
        <input 
            type="text"
            className={inputStyles} 
            placeholder='Project Name' 
            value={projectName} 
            onChange={(e) => setProjectName(e.target.value)}
        />
        <textarea
            className={inputStyles} 
            placeholder='Description' 
            value={description} 
            onChange={(e) => setDescription(e.target.value)}
        />
        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-2'>
            <div className='space-y-2'>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>Start Date</label>
                <input
                    type="date"
                    className={inputStyles}
                    placeholder='Start Date'
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />
            </div>
            <div className='space-y-2'>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>End Date</label>
                <input
                    type="date"
                    className={inputStyles}
                    placeholder='End Date'
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                />
            </div>
        </div>
        <button
            type='submit'
            className={`mt-4 flex w-full justify-center cursor-pointer rounded-md border border-transparent bg-blue-primary px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus-offset-2 ${
                !isFormValid() || isLoading ? "cursor-not-allowed opacity-50" : ""
            }`}
            disabled={!isFormValid() || isLoading}
        >
            {isLoading ? "Creating..." : "Create Project"}
        </button>
    </form>
  </Modal>
}

export default ModalNewProject