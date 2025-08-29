import Modal from '@/components/Modal';
import { Priority, Status, useCreateTasksMutation, useSearchUsersQuery } from '@/state/api';
import { debounce } from 'lodash';
import React, { useMemo, useState } from 'react'

type Props = {
    isOpen: boolean;
    onClose: () => void;
    id?: string | null;
}

const ModalNewTask = ({isOpen, onClose, id = null}: Props) => {
    const [createTask, {isLoading}] = useCreateTasksMutation();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState<Status | "">("");
    const [priority, setPriority] = useState<Priority | "">("");
    const [tags, setTags] = useState("");
    const [startDate, setStartDate] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [points] = useState();
    const [authorUser, setAuthorUser] = useState("");
    const [authorUserInput, setAuthorUserInput] = useState("");
    const [assignedUser, setAssignedUser] = useState("");
    const [assignedUserInput, setAssignedUserInput] = useState("");
    const [projectId, setProjectId] = useState("");
    
    const [searchQuery, setSearchQuery] = useState("");
    const {data} = useSearchUsersQuery(searchQuery, {
        skip: searchQuery.length < 1
    });

    const userSuggestions = data?.users ?? [];

    const [activeField, setActiveField] = useState<'author' | 'assigned' | null>(null);

    const debounceSearch = useMemo(
        () => debounce((value: string) => {
            setSearchQuery(value);
        }, 200),
        []
    );

    //Task Author
    const handleTaskAuthorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setAuthorUserInput(value);
        setAuthorUser("");
        setActiveField('author');
        debounceSearch(value);
    }

    const handleSelectTaskAuthor = (user: any) => {
        setAuthorUser(user.id.toString());
        setAuthorUserInput(user.username)
        setSearchQuery("");
        setActiveField(null);
    }

    //Task Assigned
    const handleTaskAssignedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setAssignedUserInput(value);
        setAssignedUser("");
        setActiveField('assigned');
        debounceSearch(value);
    }

    const handleSelectTaskAssigned = (user: any) => {
        setAssignedUser(user.id.toString());
        setAssignedUserInput(user.username)
        setSearchQuery("");
        setActiveField(null);
    }

    const handleSubmit = async () => {
        if (!title || !authorUser || !(id !== null || projectId)) return;

        //the api to create project
        await createTask({
            title,
            description,
            status: status as Status,
            priority: priority as Priority,
            tags,
            start_date: startDate,
            due_date: dueDate,
            points,
            author_userid: Number(authorUser),
            assigned_userid: assignedUser ? Number(assignedUser) : undefined,
            project_id: id !== null ? Number(id) : Number(projectId),
        });

        setTitle("");
        setDescription("");
        setStatus("");
        setPriority("");
        setTags("");
        setStartDate("");
        setDueDate("");
        setAuthorUser("");
        setAssignedUser("");
        setAuthorUserInput("");
        setAssignedUserInput("");
        setProjectId("");
        setSearchQuery("");
        setActiveField(null);
        onClose();
    };

    const isFormValid = () => {
        return title && status && priority && !isNaN(Number(authorUser)) && !isNaN(Number(assignedUser)) && startDate && dueDate && (id !== null || projectId);
    };

    const selectStyles = "mb-4 block w-full rounded border border-gray-300 px-3 py-2 dark:border-dark-teritary dark:bg-dark-teritary dark:text-white dark:focus:outline-none";

    const inputStyles = "w-full rounded border border-gray-300 p-2 shadow-sm dark:border-dark-teritary dark:bg-dark-teritary dark:text-white dark:focus:outline-none";

  return <Modal isOpen={isOpen} onClose={onClose} name='Create New Task'>
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
            placeholder='Title' 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
            className={inputStyles} 
            placeholder='Description' 
            value={description} 
            onChange={(e) => setDescription(e.target.value)}
        />
        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-2'>
            <select 
              className={selectStyles}
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}  
            >
                <option value="">Select Status</option>
                <option value={Status.ToDo}>To Do</option>
                <option value={Status.WorkInProgress}>Work In Progress</option>
                <option value={Status.UnderReview}>Under Review</option>
                <option value={Status.Completed}>Completed</option>
            </select>
            <select 
              className={selectStyles}
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}  
            >
                <option value="">Select Priority</option>
                <option value={Priority.Low}>Low</option>
                <option value={Priority.Medium}>Medium</option>
                <option value={Priority.High}>High</option>
                <option value={Priority.Urgent}>Urgent</option>
                <option value={Priority.Backlog}>Backlog</option>
            </select>
        </div>
        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-2'>
            <input
                type="date"
                className={inputStyles}
                placeholder='Start Date'
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
            />
            <input
                type="date"
                className={inputStyles}
                placeholder='Due Date'
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
            />
        </div>
        <input 
            type="text"
            className={inputStyles} 
            placeholder='Tags (comma seperated)' 
            value={tags} 
            onChange={(e) => setTags(e.target.value)}
        />
        <div className='space-y-4 grid grid-cols-1 sm:grid-cols-2 gap-2'>
            <div className='relative'>
                <input
                    type="text"
                    className={inputStyles}
                    placeholder='Author Username'
                    value={authorUserInput}
                    onChange={handleTaskAuthorChange}
                />
                {searchQuery && userSuggestions.length > 0 && activeField === 'author' && (
                    <ul className='absolute left-0 right-0 z-20 mt-1 max-h-40 overflow-auto rounded-md border border-gray-300 bg-white shadow-lg dark:border-dark-teritary dark:bg-dark-teritary'>
                        {userSuggestions.map((user) => (
                            <li
                                className='px-4 py-2 cursor-pointer dark:text-white hover:bg-gray-100 dark:hover:bg-dark-secondary'
                                key={user.id}
                                onClick={() => handleSelectTaskAuthor(user)}
                            >
                                {user.username}
                            </li>
                        ))}
                    </ul>
                )}
            </div> 
            <div className='relative'>
                <input
                  type="text"
                  className={inputStyles}
                  placeholder='Assignee Username'
                  value={assignedUserInput}
                  onChange={handleTaskAssignedChange}
                />
                {searchQuery && userSuggestions.length > 0 && activeField === 'assigned' && (
                    <ul className='absolute left-0 right-0 z-20 mt-1 max-h-40 overflow-auto rounded-md border border-gray-300 bg-white shadow-lg dark:border-dark-teritary dark:bg-dark-teritary'>
                        {userSuggestions.map((user) => (
                            <li
                                className='px-4 py-2 cursor-pointer dark:text-white hover:bg-gray-100 dark:hover:bg-dark-secondary'
                                key={user.id}
                                onClick={() => handleSelectTaskAssigned(user)}
                            >
                                {user.username}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
        {id === null && (
            <input
                type="text"
                className={inputStyles}
                placeholder='ProjectId'
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
            />
        )}
        <button
            type='submit'
            className={`mt-4 cursor-pointer flex w-full justify-center rounded-md border border-transparent bg-blue-primary px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus-offset-2 ${
                !isFormValid() || isLoading ? "cursor-not-allowed opacity-50" : ""
            }`}
            disabled={!isFormValid() || isLoading}
        >
            {isLoading ? "Creating..." : "Create Task"}
        </button>
    </form>
  </Modal>
}

export default ModalNewTask;