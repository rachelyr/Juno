import { useAppSelector } from '@/app/redux';
import { useGetTasksQuery } from '@/state/api';
import React, { useMemo, useState } from 'react'
import {DisplayOption, Gantt, ViewMode} from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import Loader from '@/components/Loader';

type Props = {
  id: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
}

type TaskTypeItems = 'task' | 'milestone' | 'project';

const Timeline = ({id, setIsModalNewTaskOpen}: Props) => {
  const isDarkMode =  useAppSelector((state) => state.global.isDarkMode);

  const{
    data: tasks,
    error,
    isLoading
  } = useGetTasksQuery({project_id: Number(id)});

  const [displaysOptions, setDisplayOptions] = useState<DisplayOption>({
    viewMode: ViewMode.Month,
    locale: "en-US"
  })

  //each task's displayed row
  const ganttTasks = useMemo(() => { //only updates as needed
    return(
      tasks?.map((task) => ({
        start: new Date(task.start_date as string),
        end: new Date(task.due_date as string),
        name: task.title,
        id: `Task-${task.id}`,
        type: "task" as TaskTypeItems,
        progress: task.points ? (task.points / 10) * 100 : 0,
        isDisabled: false
      })) || []
    )
  }, [tasks]);

  const handleViewModeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setDisplayOptions((prev) => ({
      ...prev,  //used to safely update the state without completely loosing the previous state 
      viewMode: event.target.value as ViewMode,
    }));
  };

  if(isLoading) return <Loader/>
  if(error) return <div>Error in getting tasks...</div>

  return (
    <div className='px-4 xl:px-6'>
      <div className='flex flex-wrap items-center justify-between gap-2 py-4'>
        <h1 className='me-2 text-lg font-bold dark:text-white'>
          Project Tasks Timeline
        </h1>
        <div className='relative inline-block w-64'>
          <select className="focus:shadow-outline block w-full appearance-none rounded border border-gray-400 bg-white px-4 py-2 pr-8 leading-tight shadow hover:border-gray-500 focus:outline-none dark:border-dark-secondary dark:bg-dark-secondary dark:text-white"
            value={displaysOptions.viewMode}
            onChange={handleViewModeChange}
          >
            <option value={ViewMode.Day}>Day</option>
            <option value={ViewMode.Week}>Week</option>
            <option value={ViewMode.Month}>Month</option>
          </select>
        </div>
      </div>

      <div className='overflow-hidden rounded-md bg-white shadow dark:bg-dark-secondary dark:text-white'>
        <div className='timeline'>
          <Gantt
            tasks={ganttTasks}
            {...displaysOptions}
            columnWidth={displaysOptions.viewMode === ViewMode.Month ? 150 : 100}
            listCellWidth='120px'
            handleWidth={20}
            todayColor='transparent' //current day's column color
            barBackgroundColor={isDarkMode ? "#101214" : "#aeb8c2"}
            barBackgroundSelectedColor={isDarkMode ? "#000" : "#9ba1a6"}
          />
        </div>

        {/* ADD TASK BUTTON */}
        <div className='px-4 pb-5 pt-1'>
          <button
           className='flex items-center rounded cursor-pointer bg-blue-primary px-3 py-2 text-white hover:bg-blue-600'
           onClick={() => setIsModalNewTaskOpen(true)}>
            Add Task
           </button>
        </div>
      </div>
    </div>
  )
}

export default Timeline;