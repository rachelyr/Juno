'use client';

import Header from '@/components/Header';
import Loader from '@/components/Loader';
import ProjectCard from '@/components/ProjectCard';
import TaskCard from '@/components/TaskCard';
import UserCard from '@/components/UserCard';
import { useSearchQuery } from '@/state/api';
import {debounce} from 'lodash';
import React, { useEffect, useState } from 'react'

const search = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const {data: searchResult, isLoading, isError} = useSearchQuery(searchTerm, {
        skip: searchTerm.length < 3
    });

    //debouncing- performs the search every 500 miliseconds
    const handleSearch = debounce(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setSearchTerm(event.target.value);
        },
        500,
    );

    useEffect(() => {
        return handleSearch.cancel;
    }, [handleSearch.cancel]);

    const HeaderClass = "pb-3 font-semibold dark:text-white";

  return (
    <div className='p-8'>
        <Header name='Search'/>
        <div>
            <input 
                type="text"
                placeholder='Search...'
                className='w-1/2 rounded border p-3 shadow dark:text-white'
                onChange={handleSearch}
            />
        </div>
        <div className='p-5'>
            {isLoading && <Loader/>}
            {isError && <p>Error occured while fetching results</p>}
            {!searchResult && (
                <img src="Search-rafiki.svg" alt="" className='h-[30%] w-[30%] justify-center items-center'/>
            )}
            {!isLoading && !isError && searchResult && (
                <div>
                    {searchResult.tasks && searchResult.tasks?.length > 0 && (
                        <h2 className={HeaderClass}>Tasks</h2>
                    )}
                    {searchResult.tasks?.map((task) => (
                        <TaskCard key={task.id} task={task}/>
                    ))}

                    {searchResult.projects && searchResult.projects?.length > 0 && (
                        <h2 className={HeaderClass}>Projects</h2>
                    )}
                    {searchResult.projects?.map((project) => (
                        <ProjectCard key={project.id} project={project}/>
                    ))}

                    {searchResult.users && searchResult.users?.length > 0 && (
                        <h2 className={HeaderClass}>Users</h2>
                    )}
                    {searchResult.users?.map((user) => ( 
                        <UserCard key={user.id} user={user}/>
                    ))}
                </div>
            )}
        </div>
    </div>
  )
}

export default search;