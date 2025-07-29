import React from 'react'
import ReusablePage from '../reusablePage'
import { Priority } from '@/state/api'


const low = () => {
  return (
    <ReusablePage priority={Priority.Low}/>
  )
}

export default low;