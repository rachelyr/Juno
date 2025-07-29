import React from 'react'
import ReusablePage from '../reusablePage'
import { Priority } from '@/state/api'


const urgent = () => {
  return (
    <ReusablePage priority={Priority.Urgent}/>
  )
}

export default urgent