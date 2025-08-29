import { Team, useCreateTeamProjectMutation, useGetTeamProjectQuery, useGetUserOwnedProjectsQuery, useRemoveTeamProjectMutation } from '@/state/api'
import { ChevronDown, PlusSquareIcon, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react'

interface TeamProjectProps {
    team: Team;
    onProjectAssigned?: (teamId: number, projectId: number) => void;
}

const TeamProject: React.FC<TeamProjectProps> = ({
    team,
    onProjectAssigned
}) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    const {data: projects, isLoading} = useGetUserOwnedProjectsQuery();
    const {data: teamProjects} = useGetTeamProjectQuery();
    const [createTeamProject] = useCreateTeamProjectMutation();
    const [removeTeamProject] = useRemoveTeamProjectMutation();

    const teamProjectRelation = teamProjects?.find(tp => tp.team_id === team.id);
    const assignedProject = teamProjectRelation
        ? projects?.find(p => p.id === teamProjectRelation.project_id)
        : undefined;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if(dropdownRef.current && !dropdownRef.current.contains(event.target as Node)){
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleToggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleProjectSelect = async (projectId: number) => {
        try {
            await createTeamProject({ team_id: team.id, project_id: projectId }).unwrap();
            setIsDropdownOpen(false);
            onProjectAssigned?.(team.id, projectId);
        } catch (error) {
            console.error('Failed to add project to team:', error);
        }
    };

    const handleRemoveProject = async () => {
        if (assignedProject) {
            try {
                await removeTeamProject({ 
                    teamId: team.id,
                    projectId: assignedProject.id
                });
            } catch (error) {
                console.error('Failed to remove project from team:', error);
            }
        }
    };


    const availableProjects = projects?.filter(
        project => assignedProject?.id !== project.id
    ) || [];

    return(
        <div className='relative' ref={dropdownRef}>
            <div
                className={`flex w-[70%] px-2 py-2 rounded-md mt-2 mb-2 cursor-pointer transition-colors ${
                    assignedProject
                        ? 'bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-600 hover:bg-green-200 dark:hover:bg-green-800/40'
                        : 'bg-gray-100 dark:bg-dark-teritary hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                onClick={handleToggleDropdown}
            >
                <div>
                    {assignedProject ? (
                        <>
                            <div className='w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold text-xs'>
                                {assignedProject.name.charAt(0).toUpperCase()}
                            </div>
                        </>
                    ) : (
                        <PlusSquareIcon className='dark:text-white text-gray-600' size={16}/>
                    )}
                </div>
                <div className='flex flex-col px-2 flex-1'>
                    {assignedProject ? (
                        <>
                            <p className='text-sm font-medium text-green-700 dark:text-green-300'>
                                {assignedProject.name}
                            </p>
                        </>
                    ) : (
                        <p className='text-sm text-gray-600 dark:text-white'>Add Project</p>
                    )}
                </div>
                <div>
                    {assignedProject ? (
                        <X 
                            className='align-middle text-dark-bg dark:text-white cursor-pointer'
                            size={16}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveProject();
                            }}/>
                    ) : (
                        <ChevronDown
                        className={`transition-transform ${
                            assignedProject
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-gray-600 dark:text-white'
                        }`}
                        size={16}
                    />
                    )}
                    
                </div>
            </div>
            {!assignedProject && isDropdownOpen && (
                <div className='absolute top-full left-0 right-0 z-50 bg-white dark:bg-dark-secondary border border-gray-200 dark:border-gray-700 rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto'>
                    {isLoading ? (
                        <div className='p-3 text-center text-gray-500 dark:text-gray-400 text-sm'>
                            Loading projects...
                        </div>
                    ) : !projects || projects.length === 0 ? (
                        <div className='p-3 text-center text-gray-500 dark:text-gray-400 text-sm'>
                            No projects created by you
                        </div>
                    ) : (
                        <>
                            {availableProjects.map((project) => (
                                <div
                                  key={project.id}
                                  className='p-3 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0'
                                  onClick={() => handleProjectSelect(project.id)}
                                >
                                    <div className='text-sm font-medium text-gray-900 dark:text-white'>
                                        {project.name}
                                    </div>
                                </div>
                            ))}
                            {availableProjects.length === 0 && (
                                <div className='p-3 text-center text-gray-500 dark:text-gray-400 text-sm'>
                                    {assignedProject ? 'Project already Assigned' : 'No projects to available'}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default TeamProject