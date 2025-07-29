import React from 'react'
import ReusablePage from '../reusablePage'
import { Priority } from '@/state/api'

const medium = () => {
  return (
    <ReusablePage priority={Priority.Medium}/>
  )
}

export default medium;