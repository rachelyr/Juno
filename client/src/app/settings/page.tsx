'use client';

import Header from '@/components/Header';
import { useGetAuthUserQuery } from '@/state/api';
import React from 'react'

//needs changing upon login/logout setup

const Settings = () => {
    const userSettings = {
        teamName: "Development Team",
        roleName: "Developer"
    };

    const {data: currentUser} = useGetAuthUserQuery({});

    const labelStyles = "block text-sm font-medium dark:text-white";
    const textStyles = "mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:text-white"

  return (
    <div className='p-8'>
        <Header name='Settings'/>
        <div className='space-y-4'>
            <div className='pb-2'>
                <label className={labelStyles}>Username</label>
                <div className={textStyles}>{currentUser?.userDetails.username}</div>
            </div>
            <div className='pb-2'>
                <label className={labelStyles}>Email</label>
                <div className={textStyles}>{currentUser?.userDetails.email}</div>
            </div>
            <div className='pb-2'>
                <label className={labelStyles}>Team</label>
                <div className={textStyles}>{userSettings.teamName}</div>
            </div>
            <div>
                <label className={labelStyles}>Role</label>
                <div className={textStyles}>{userSettings.roleName}</div>
            </div>
        </div>
    </div>
  )
}

export default Settings