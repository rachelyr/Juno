"use client";

import { useGetTeamsQuery } from '@/state/api';
import React, { useState } from 'react'
import { useAppSelector } from '../redux';
import Header from '@/components/Header';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { dataGridClassNames, dataGridSxStyles } from '@/lib/utils';
import Loader from '@/components/Loader';
import { PlusSquare, User, Users } from 'lucide-react';
import ModalNewTeam from '@/components/ModalNewTeam';
import ModalNewMembers from '@/components/ModalNewMembers';
import TeamProject from '@/components/TeamProject';


const columns: GridColDef[] = [
    {field: "id", headerName: "Team ID", width: 100},
    {field: "domain_name", headerName: "Team Name", width: 200},
    {field: "product_owner_username", headerName: "Product Owner", width: 200},
    {field: "project_manager_username", headerName: "Project Manager", width: 200}
]

const Teams = () => {
    const [isModalNewTeamOpen, setIsModelNewTeamOpen] = useState(false);
    const [isModalAddMemOpen, setIsModalAddMemOpen] = useState(false);
    const [selectedTeamId, setSelectedTeamId] = useState<number>(0);

    const {data: teams, isLoading, isError} = useGetTeamsQuery();
    const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

    const handleProjectAssigned = (teamId: number, projectId: number) => {
        // Optional: Handle any additional logic after project assignment
        console.log(`Project ${projectId} assigned to team ${teamId}`);
        // You could show a toast notification here
    };

    if(isLoading) return <Loader/>
    if(isError || !teams) return <div>Error fetching users...</div>

    
  return (
    <div className='flex w-full flex-col p-8'>
      <ModalNewTeam 
        isOpen={isModalNewTeamOpen}
        onClose={() => setIsModelNewTeamOpen(false)}
      />
      <ModalNewMembers
        isOpen={isModalAddMemOpen}
        onClose={() => setIsModalAddMemOpen(false)}
        team_id={Number(selectedTeamId)}
      />
      <div className='pb-6 pt-6 lg:pb-4 lg:pt-8 flex justify-between'>
        <Header name='Teams'/>
        <button
          onClick={() => setIsModelNewTeamOpen(true)}
          className='flex items-center rounded-md px-3 py-2 whitespace-nowrap bg-blue-primary text-white hover:bg-blue-600 hover:cursor-pointer'
        >
          <PlusSquare className='mr-2 h-5 w-5'/>
          Create Team
        </button>
      </div>
      {/*Team Card Div*/}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 mb-6">
        {teams.slice(0, 8).map((team) => {
        return (
          <div 
            key={team.id} 
            className="bg-white dark:bg-dark-secondary rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-pink-600 dark:text-pink-400" />
              </div>
              <button
                onClick={() => {
                  setIsModalAddMemOpen(true);
                  setSelectedTeamId(team.id)} 
                }
                className='flex items-center rounded-md text-xs px-2 py-2 whitespace-nowrap bg-blue-primary text-white hover:bg-blue-600 hover:cursor-pointer'
              >
              <User className='mr-2 h-4 w-4'/>
                Add
              </button>
            </div>
            
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              {team.domain_name}
            </h3>

            {/* Add Project to Team */}
             <TeamProject
              team={team} 
              onProjectAssigned={handleProjectAssigned}
            />
            
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {team.members?.length} Members
            </p>
            
            {team.projectmanager_userid && (
              <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                PM: {team.project_manager_username}
              </div>
            )}
            {!team.projectmanager_userid && (
              <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                No PM assigned
              </div>
            )}
          </div>
        )})}
      </div>
      <Header name='Teams Table'/>
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