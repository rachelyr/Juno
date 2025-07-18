import React from 'react'

type Props = {}

const Loader = (props: Props) => {
  return (
    <div className='flex justify-center items-center min-h-screen bg-white dark:bg-dark-bg'>
        <img src="/Spinner.svg" alt="Loading..." className='w-25 h-25'/>
    </div>
  )
}

export default Loader;