"use client";

import { useDeleteTeamMutation, useGetAuthUserQuery, useGetTeamsQuery } from '@/state/api';
import React, { useState } from 'react'
import { useAppSelector } from '../redux';
import Header from '@/components/Header';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { dataGridClassNames, dataGridSxStyles } from '@/lib/utils';
import Loader from '@/components/Loader';
import { Clock, PlusSquare, Trash, User, Users } from 'lucide-react';
import ModalNewTeam from '@/components/ModalNewTeam';
import ModalNewMembers from '@/components/ModalNewMembers';
import TeamProject from '@/components/TeamProject';
import toast, { Toaster } from 'react-hot-toast';


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
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const {data: teams, isLoading, isError} = useGetTeamsQuery();
    const [deleteTeam] = useDeleteTeamMutation();
    const {data: currentUser} = useGetAuthUserQuery({});

    const canManageTeam = (team: any) => {
      if (!currentUser) return false;
      const userId = currentUser.userDetails.id;
      return (
        userId === team.productowner_userid
      );
    };

    const canManageUsers = (team: any) => {
      if(!currentUser) return false;
      const userId = currentUser.userDetails.id;
      return(
        userId === team.productowner_userid || userId === team.projectmanager_userid
      );
    };

    const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

    const handleProjectAssigned = () => {
        //could show a toast notification here
    };

    const handleDelete = () => {
      // if(!selectedTeamId){
      //   toast.error("No Team selected to delete");
      // }
      setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
      try{
        await deleteTeam({teamId: Number(selectedTeamId)}).unwrap();
        toast.success("Team deleted successfully");
        setShowDeleteConfirm(false);
      } catch(error){
        console.log("Error deleting Team: ", error);
      }
    }

    const handleRestrictedAction = (team: any) => {
      if(!canManageTeam(team)){
        toast.error("Members cannot edit teams");
      }
    };

    const WelcomeSection = () => (
            <div className='mb-8 w-full rounded-lg bg-gradient-to-r from-blue-700 to-purple-600 p-8 text-white'>
                <div className='flex items-center justify-between'>
                    <div>
                        <h2 className='text-3xl font-bold mb-2'>
                            Welcome to Your Teams Page
                        </h2>
                        <p className='text-lg opacity-90 mb-4'>
                            Ready to connect to Teams to work on Projects? Let&apos;s create your first Team.
                        </p>
                        <button
                          className='bg-white text-blue-600 cursor-pointer font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors'
                          onClick={() => setIsModelNewTeamOpen(true)}
                        >
                            <PlusSquare className='inline h-5 w-5 mr-2'/>
                            Create Your First Team
                          </button>
                    </div>
                </div>
            </div>
        );

    if(isLoading) return <Loader/>
    if(isError || !teams) return <div>Error fetching users...</div>
    
  return (
    <div className='flex w-full flex-col px-6'>
      <Toaster/>
      <ModalNewTeam 
        isOpen={isModalNewTeamOpen}
        onClose={() => setIsModelNewTeamOpen(false)}
      />
      <ModalNewMembers
        isOpen={isModalAddMemOpen}
        onClose={() => setIsModalAddMemOpen(false)}
        team_id={Number(selectedTeamId)}
      />
      <div className='pb-6 pt-4 lg:pb-4 lg:pt-8 flex justify-between'>
        <Header name='Teams' buttonComponent={
          <button
          onClick={() => setIsModelNewTeamOpen(true)}
          className='flex items-center rounded-md px-3 py-2 whitespace-nowrap bg-blue-primary text-white hover:bg-blue-600 hover:cursor-pointer'
        >
          <PlusSquare className='mr-2 h-5 w-5'/>
          Create Team
        </button>
        }/>
      </div>
      {!teams || teams.length === 0 ? (
          <div className='flex w-full'>
            <WelcomeSection/>
          </div>
      ) : (
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
              <div className='flex items-center gap-2'>

                <button
                  onClick={canManageUsers(team) ? () => {
                    setIsModalAddMemOpen(true);
                    setSelectedTeamId(team.id)
                  } : () => handleRestrictedAction(team)}
                  className='flex items-center rounded-md text-xs px-2 py-2 whitespace-nowrap bg-blue-primary text-white hover:bg-blue-600 hover:cursor-pointer'
                >
                  <User className='mr-2 h-4 w-4' />
                  Add
                </button>
                <button
                  onClick={canManageTeam(team) ? () => {
                    setSelectedTeamId(team.id)
                    handleDelete()}: () => handleRestrictedAction(team)
                  }
                  className='flex items-center rounded-md bg-red-500 px-3 py-2 text-white hover:bg-red-600 hover:cursor-pointer'
                >
                  <Trash size={16} />
                </button>
              </div>
            </div>
            
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              {team.domain_name}
            </h3>
            
            {canManageTeam(team) ? (
              <TeamProject
                team={team}
                onProjectAssigned={handleProjectAssigned}
              />
            ) : (
              <></>
            )}
            
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
      )}

      {!teams || teams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Clock className="h-16 w-16 text-gray-400 mb-4" />
          <h4 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No Teams Yet
          </h4>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
            Once a Team is created or you have been added as a part of a Team, Team data will show here in a Table.
          </p>
          {teams && teams.length > 0 && (
            <div className="text-sm text-gray-400 dark:text-gray-500">
              💡 Tip: Go to your project boards to create and assign tasks.
            </div>
          )}
        </div>
      ) : (
        <>
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
        {showDeleteConfirm && (
          <div className='fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50'>
            <div className='bg-white dark:bg-dark-secondary p-6 rounded-lg shadow-lg max-w-sm w-full mx-4'>
              <h3 className='text-lg font-semibold mb-2 dark:text-white'>Confirm Delete</h3>
              <p className='text-gray-600 dark:text-gray-300 mb-4'>
                Are you sure you want to delete this team? All Team data will be removed.
              </p>
              <div className='flex gap-2 justify-end'>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 cursor-pointer border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
        )}
        </>
      )}
    </div>
  )
}

export default Teams;