"use client";

import { useAppSelector } from '@/app/redux';
import { useGetProjectsQuery } from '@/state/api';
import React, { useMemo, useState } from 'react'
import {DisplayOption, Gantt, ViewMode} from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import Header from '@/components/Header';


type TaskTypeItems = 'task' | 'milestone' | 'project';

const Timeline = () => {
  const isDarkMode =  useAppSelector((state) => state.global.isDarkMode);

  const{
    data: projects,
    isError,
    isLoading
  } = useGetProjectsQuery();

  const [displaysOptions, setDisplayOptions] = useState<DisplayOption>({
    viewMode: ViewMode.Month,
    locale: "en-US"
  })

  //each prject's displayed row
  const ganttTasks = useMemo(() => { //only updates as needed
    return(
      projects?.map((project) => ({
        start: new Date(project.start_date as string),
        end: new Date(project.due_date as string),
        name: project.name,
        id: `Project-${project.id}`,
        type: "project" as TaskTypeItems,
        progress: 50, //needs changing
        isDisabled: false
      })) || []
    )
  }, [projects]);

  const handleViewModeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setDisplayOptions((prev) => ({
      ...prev,  //used to safely update the state without completely loosing the previous state 
      viewMode: event.target.value as ViewMode,
    }));
  };

  if(isLoading) return <div>Tasks loading...</div>
  if(isError || !projects) return <div>Error in getting projects...</div>

  return (
    <div className='px-4 xl:px-6'>
      <header className='mb-4 flex items-center justify-between'>
        <Header name='Project Timeline'/>
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
      </header>

      <div className='overflow-hidden rounded-md bg-white shadow dark:bg-dark-secondary dark:text-white'>
        <div className='timeline'>
          <Gantt
            tasks={ganttTasks}
            {...displaysOptions}
            columnWidth={displaysOptions.viewMode === ViewMode.Month ? 150 : 100}
            listCellWidth='100px'
            handleWidth={20}
            todayColor='transparent' //current day's column color
            projectBackgroundColor={isDarkMode ? "#101214" : "#1f2937"}
            projectProgressColor={isDarkMode ? "#1f2937" : "aeb8c2"}
            projectProgressSelectedColor={isDarkMode ? "#000" : "#9ba1a6"}
          />
        </div>
      </div>
    </div>
  )
}

export default Timeline;