import React from 'react'
import ReusablePage from '../reusablePage'
import { Priority } from '@/state/api'

type Props = {}

const low = (props: Props) => {
  return (
    <ReusablePage priority={Priority.Low}/>
  )
}

export default low;