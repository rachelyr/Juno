import React from 'react'
import ReusablePage from '../reusablePage'
import { Priority } from '@/state/api'

type Props = {}

const urgent = (props: Props) => {
  return (
    <ReusablePage priority={Priority.Urgent}/>
  )
}

export default urgent