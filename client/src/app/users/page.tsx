"use client";

import { useGetUsersQuery } from '@/state/api';
import React from 'react'
import { useAppSelector } from '../redux';
import Header from '@/components/Header';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Image from 'next/image';
import { dataGridClassNames, dataGridSxStyles } from '@/lib/utils';

// const CustomeToolbar = () => (
  
// )

const columns: GridColDef[] = [
    {field: "id", headerName: "ID", width: 100},
    {field: "username", headerName: "Username", width: 200},
    {field: "profilePicture", headerName: "Profile Picture", width: 200, renderCell: (params) => (
        <div className='flex h-full w-full items-center justify-center'>
          <div className='h-9 w-9'>
            <Image
              src={`/${params.value}`}
              alt={params.row.username}
              width={100}
              height={50}
              className='h-full rounded-full object-cover'
            />
          </div>
        </div>
    )},
]

const Users = () => {
    const {data: users, isLoading, isError} = useGetUsersQuery();
    const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

    if(isLoading) return <div>Loading...</div>
    if(isError || !users) return <div>Error fetching users...</div>

  return (
    <div className='flex w-full flex-col p-8'>
        <Header name='Users'/>
        <div style={{height: 650, width: "100%"}}>
            <DataGrid
              rows={users || []}
              columns={columns}
              getRowId={(row) => row.id}
              pagination
              className={dataGridClassNames}
              sx={dataGridSxStyles(isDarkMode)}
              showToolbar //POST - write about using the slots attribute first and how it didnt work so i went into the documentation and fixed it
            />
        </div>
    </div>
  )
}

export default Users