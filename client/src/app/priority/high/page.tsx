import React from 'react'
import ReusablePage from '../reusablePage'
import { Priority } from '@/state/api'

type Props = {}

const high = (props: Props) => {
  return (
    <ReusablePage priority={Priority.High}/>
  )
}

export default high;