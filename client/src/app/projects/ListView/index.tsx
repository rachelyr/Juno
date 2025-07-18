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
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6'>
            {tasks?.map((task:Task) => (
                <TaskCard key={task.id} task={task}/>
            ))}
        </div>
    </div>
  )
}

export default List;