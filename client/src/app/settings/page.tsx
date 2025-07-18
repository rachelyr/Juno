import Header from '@/components/Header';
import React from 'react'

type Props = {}

//needs changing upon login/logout setup

const settings = (props: Props) => {
    const userSettings = {
        username: "rach",
        email: "rach@gmail.com",
        teamName: "Dvelopment Team",
        roleName: "Developer"
    };

    const labelStyles = "block text-sm font-medium dark:text-white";
    const textStyles = "mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:text-white"

  return (
    <div className='p-8'>
        <Header name='Settings'/>
        <div className='space-y-4'>
            <div className='pb-2'>
                <label className={labelStyles}>Username</label>
                <div className={textStyles}>{userSettings.username}</div>
            </div>
            <div className='pb-2'>
                <label className={labelStyles}>Email</label>
                <div className={textStyles}>{userSettings.email}</div>
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

export default settings