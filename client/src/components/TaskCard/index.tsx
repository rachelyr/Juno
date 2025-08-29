import { Task } from '@/state/api'
import Image from 'next/image'
import React from 'react'
import {format} from "date-fns";
import { Task as TaskType } from '@/state/api';

type Props = {
    task : Task
}

const TaskCard = ({task}: Props) => {

   const PriorityTag = ({priority}: {priority: TaskType['priority']}) => (
      <div
        className={`rounded-full px-2 py-1 text-xs font-semibold ${
          priority === "Urgent" ? "bg-red-200 text-red-600": priority === "High" ?
          "bg-orange-200 text-orange-700" : priority === "Medium" ?
          "bg-blue-200 text-blue-700" : priority === 'Low' ? 
          "bg-green-200 text-green-700" :
          "bg-gray-200 text-gray-700" 
        }`}>
          {priority}
        </div>
    );

  return (
    <div className='mb-3 rounded bg-white p-4 shadow dark:bg-dark-secondary dark:text-white'>
          {task.attachment && task.attachment.length > 0 && (
              <div>
                  <strong>Attachments:</strong>
                  <div className='flex flex-wrap'>
                      {task.attachment && task.attachment.length > 0 && (
                          <Image
                              alt={task.attachment[0].file_name}
                              src={`/${task.attachment[0].file_url}`}
                              width={400}
                              height={200}
                              className='rounded-full'
                            />
                      )}
                  </div>
              </div>
          )}
          <p>
            <strong>Title: </strong>{task.title}
          </p>
          <p>
            <strong>Description: </strong>
            {task.description || "No Description provided"}
          </p>
          <p>
            <strong>Status: </strong>{task.status}
          </p>
          {/*Task - ADD COLOR TO PRIORITY*/}
        <div className='flex'>
            <strong>Priority:  </strong>
            {task.priority && <PriorityTag priority={task.priority} />}
        </div>
          <p>
            <strong>Tags: </strong>{task.tags}
          </p>
          <p>
            <strong>Start Date: </strong>
            {task.start_date ? format(new Date(task.start_date), "P"): "Not set"}
          </p>
          <p>
            <strong>Due Date: </strong>
            {task.due_date ? format(new Date(task.due_date), "P"): "Not set"}
          </p>
          <p>
            <strong>Author: </strong>
            {task.author ? task.author.username : "Unknown"}
          </p>
          <p>
            <strong>Assignee: </strong>
            {task.assigned ? task.assigned.username : "Unassigned"}
          </p>
    </div>
  )
}

export default TaskCard;