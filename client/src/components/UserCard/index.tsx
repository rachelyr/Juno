import { User } from '@/state/api';
import React from 'react';
import Image from "next/image"; 

type Props = {
    user: User
}

const UserCard = ({user}: Props) => {
  return (
    <div className='flex items-center rounded mb-3 p-4 shadow dark:text-white dark:bg-dark-secondary bg-white'>
        {user.profilepicture_id && (
            <Image
            src={'/'}
            alt='profile picture'
            height={32}
            width={32}
            className='rounded-full'
            />
        )}
        <div>
            <h2><strong>Username: </strong>{user.username}</h2>
            <p><strong>Email: </strong>{user.email}</p>
        </div>
    </div>
  )
}

export default UserCard