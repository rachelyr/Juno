import React from 'react'
import ReusablePage from '../reusablePage'
import { Priority } from '@/state/api'

type Props = {}

const backlog = (props: Props) => {
  return (
    <ReusablePage priority={Priority.Backlog}/>
  )
}

export default backlog;