"use client";

import { useGetTeamsQuery } from '@/state/api';
import React from 'react'
import { useAppSelector } from '../redux';
import Header from '@/components/Header';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { dataGridClassNames, dataGridSxStyles } from '@/lib/utils';

// const CustomeToolbar = () => (
  
// )

const columns: GridColDef[] = [
    {field: "id", headerName: "Team ID", width: 100},
    {field: "domain_name", headerName: "Team Name", width: 200},
    {field: "product_owner_username", headerName: "Product Owner", width: 200},
    {field: "project_manager_username", headerName: "Project Manager", width: 200}
]

const Teams = () => {
    const {data: teams, isLoading, isError} = useGetTeamsQuery();
    const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

    if(isLoading) return <div>Loading...</div>
    if(isError || !teams) return <div>Error fetching users...</div>

  return (
    <div className='flex w-full flex-col p-8'>
        <Header name='Teams'/>
        <div style={{height: 650, width: "100%"}}>
            <DataGrid
              rows={teams || []}
              columns={columns}
              pagination
              className={dataGridClassNames}
              sx={dataGridSxStyles(isDarkMode)}
              showToolbar
            />
        </div>
    </div>
  )
}

export default Teams;