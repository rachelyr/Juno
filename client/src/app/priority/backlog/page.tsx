import React from 'react'
import ReusablePage from '../reusablePage'
import { Priority } from '@/state/api'


const backlog = () => {
  return (
    <ReusablePage priority={Priority.Backlog}/>
  )
}

export default backlog;