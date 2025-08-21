import { useAppSelector } from '@/app/redux';
import Header from '@/components/Header';
import { useGetTasksQuery } from '@/state/api';
import React from 'react'
import {DataGrid, GridColDef} from "@mui/x-data-grid";
import { dataGridClassNames, dataGridSxStyles } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import Loader from '@/components/Loader';
import { Clock } from 'lucide-react';

type Props = {
    id: string
    setIsModalNewTaskOpen: (isOpen: boolean) => void;
};

//mapping task data into seperate columns
const columns: GridColDef[] = [
    {
        field: "title",
        headerName: "Title",
        width: 100
    },
    {
        field: "description",
        headerName: "Description",
        width: 200
    },
    {
        field: "status",
        headerName: "Status",
        width: 130,
        renderCell: (params) => (
            <span className='inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800'>
                {params.value}
            </span>
        )
    },
    {
        field: "priority",
        headerName: "Priority",
        width: 75
    },
    {
        field: "tags",
        headerName: "Tags",
        width: 130
    },
    {
        field: "start_date",
        headerName: "Start Date",
        width: 130,
        renderCell: (params) => {
            return format(parseISO(params.value as string), 'dd-MM-yyyy');
        }
    },
    {
        field: "due_date",
        headerName: "Due Date",
        width: 130,
        renderCell: (params) => {
            return format(parseISO(params.value as string), 'dd-MM-yyyy')
        }
    },
    {
        field: "author",
        headerName: "Author",
        width: 150,
        renderCell: (params) => params.value?.username || "Unknown"
    },
    {
        field: "assigned",
        headerName: "Assignee",
        width: 150,
        renderCell: (params) => params.value?.username || "Unassigned"
    },
]

const Table = ({id, setIsModalNewTaskOpen}: Props) => {
    const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

    const {
        data: tasks,
        error,
        isLoading
    } = useGetTasksQuery({ project_id: Number(id) });

    if(isLoading) return <Loader/>
    if(error || !tasks) return <div>Error in getting tasks...</div>

  return (
    <div className='h-[540px] w-full px-4 pb-8 xl:px-6'>
        <div className='pt-5'>
            <Header 
                name='Task Table'
                buttonComponent={
                    <button
                      className='flex items-center bg-blue-primary px-3 py-2 cursor-pointer text-white hover:bg-blue-600 rounded-sm'
                      onClick={() => setIsModalNewTaskOpen(true)}
                    >
                        Add Task
                    </button>
            }
            isSmallText/>
        </div>
        {tasks && tasks.length > 0 ? (
            <div className='h-[400px] md:h-[500px] w-full'>
            <DataGrid
                rows={tasks || []}
                columns={columns}
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
                      Start by creating Tasks to see them organised in the Table.
                  </p>
              </div>
          )}
      </div>
  )
}

export default Table;