import { Project } from '@/state/api'
import { format } from 'date-fns'
import React from 'react'

type Props = {
    project: Project
}

const ProjectCard = ({project}: Props) => {
  return (
    <div className='rounded mb-3 p-4 shadow dark:text-white bg-white dark:bg-dark-secondary'>
        <h2><strong>{project.name}</strong></h2>
        <p><strong>Description: </strong>{project.description}</p>
        <p><strong>Start Date: </strong>{project.start_date ? format(new Date(project.start_date), "P"): "Not set" }</p>
        <p><strong>End Date: </strong>{project.due_date ? format(new Date(project.due_date), "P"): "Not set"}</p>
    </div>
  )
}

export default ProjectCard