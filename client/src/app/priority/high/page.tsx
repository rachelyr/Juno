import React from 'react'
import ReusablePage from '../reusablePage'
import { Priority } from '@/state/api'


const high = () => {
  return (
    <ReusablePage priority={Priority.High}/>
  )
}

export default high;