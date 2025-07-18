import React from 'react'
import ReusablePage from '../reusablePage'
import { Priority } from '@/state/api'

type Props = {}

const medium = (props: Props) => {
  return (
    <ReusablePage priority={Priority.Medium}/>
  )
}

export default medium;