import Image from 'next/image';
import React from 'react'


const Loader = () => {
  return (
    <div className='flex justify-center items-center min-h-screen bg-white dark:bg-dark-bg'>
        <Image src="/Spinner.svg" alt="Loading..." width={80} height={80}/>
    </div>
  )
}

export default Loader;