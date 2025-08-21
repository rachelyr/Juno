import Header from '@/components/Header';
import Loader from '@/components/Loader';
import TaskCard from '@/components/TaskCard';
import { Task, useGetTasksQuery } from '@/state/api';
import React from 'react'

type ListProps = {
    id: string;
    setIsModalNewTaskOpen: (isOpen: boolean) => void;
}

const List = ({id, setIsModalNewTaskOpen} : ListProps) => {

    const {
        data: tasks,
        error,
        isLoading
    } = useGetTasksQuery({project_id: Number(id)});

    if (isLoading) return <Loader/>
    if(error) return <div>An Error occured while fetching Tasks</div>

    if (!tasks || tasks.length === 0) {
        return (
            <div className='px-4 pb-8 xl:px-6'>
                <div className='pt-5'>
                    <Header name='Project Task List'
                    buttonComponent={
                        <button
                          className='flex items-center cursor-pointer bg-blue-primary px-3 py-2 text-white hover:bg-blue-600 rounded-sm'
                          onClick={() => setIsModalNewTaskOpen(true)}
                        >Add Task</button>
                    }
                    isSmallText/>
                </div>
                
                <div className='flex flex-col items-center justify-center mt-12 text-center'>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-8 mb-6">
                        <div className="text-6xl">📋</div>
                    </div>
                    
                    <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                        No Tasks Yet
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md leading-relaxed">
                        Get started by creating your first task. Break down your project into manageable tasks to track progress effectively.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <button
                            className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white font-medium py-3 px-6 rounded-lg transition-colors shadow-sm flex items-center gap-2"
                            onClick={() => setIsModalNewTaskOpen(true)}
                        >
                            <span className="text-lg">+</span>
                            Create Your First Task
                        </button>
                    </div>
                    
                    <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 max-w-2xl">
                        <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-3">
                            💡 Pro Tips for Task Management
                        </h4>
                        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-2 text-left">
                            <li className="flex items-start gap-2">
                                <span className="text-blue-500 mt-0.5">•</span>
                                Break large features into smaller, actionable tasks
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-500 mt-0.5">•</span>
                                Set clear priorities and due dates for better planning
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-500 mt-0.5">•</span>
                                Assign tasks to team members for better collaboration
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        )
    }

  return (
    <div className='px-4 pb-8 xl:px-6'>
        <div className='pt-5'>
            <Header name='Project Task List'
            buttonComponent={
                <button
                  className='flex items-center cursor-pointer bg-blue-primary px-3 py-2 text-white hover:bg-blue-600 rounded-sm'
                  onClick={() => setIsModalNewTaskOpen(true)}
                >Add Task</button>
            }
            isSmallText/>
        </div>
        {/* <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6'>
            {tasks?.map((task:Task) => (
                <TaskCard key={task.id} task={task}/>
            ))}
        </div> */}
        <div className="flex items-center justify-between mb-6 bg-white dark:bg-dark-secondary rounded-lg px-4 py-3 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-medium text-gray-900 dark:text-white">{tasks?.length}</span> 
                        {tasks?.length === 1 ? ' task' : ' tasks'}
                    </div>
                    <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 text-sm">
                            <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                            <span className="text-gray-600 dark:text-gray-300">
                                {tasks?.filter(task => task.status === 'Completed').length} completed
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></div>
                            <span className="text-gray-600 dark:text-gray-300">
                                {tasks?.filter(task => task.status === 'Work In Progress').length} in progress
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                            <span className="text-gray-600 dark:text-gray-300">
                                {tasks?.filter(task => task.status === 'Under Review').length} under review
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Task grid with improved spacing */}
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'>
                {tasks?.map((task:Task) => (
                    <div key={task.id} className="transform transition-transform hover:scale-[1.02]">
                        <TaskCard task={task}/>
                    </div>
                ))}
            </div>
    </div>
  )
}

export default List;