import { useGetTasksQuery, useUpdateTaskStatusMutation } from '@/state/api';
import React from 'react'
import {DndProvider, useDrag, useDrop} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";
import {Task as TaskType} from "@/state/api";
import { EllipsisVertical, MessageSquareMore, Plus } from 'lucide-react';
import { format } from "date-fns";
import Image from 'next/image';
import Loader from '@/components/Loader';
 
type BoardProps = {
  id: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
  onEditTask: (task: TaskType) => void;
};

const taskStatus = ["To Do","Work In Progress", "Under Review", "Completed"];

const BoardView = ({id, setIsModalNewTaskOpen, onEditTask}: BoardProps) => {

  const {data: tasks, isLoading, error} = useGetTasksQuery({project_id: Number(id)});

  const [updateTaskStatus] = useUpdateTaskStatusMutation();

  const moveTask = (task_id: number, toStatus: string) => {
    updateTaskStatus({task_id, status: toStatus})
  };

  //test log for now may be changed
  if (isLoading) return <Loader/>

  if(error) return <div>An Error occured while fetching Tasks</div>

  return (
    <DndProvider backend={HTML5Backend}>
      <div className='grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-4'>
        {taskStatus.map((status) => (
          <TaskColumn 
            key={status}
            status={status}
            tasks={tasks || []}
            moveTask={moveTask}
            setIsModalNewTaskOpen={setIsModalNewTaskOpen}
            onEditTask={onEditTask}
          />
        ))}
      </div>
    </DndProvider>
  );
};

type TaskColumnProps = {
  status: string;
  tasks: TaskType[]
  moveTask: ( task_id: number, toStatus: string) => void;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
  onEditTask: (task: TaskType) => void;
}

const TaskColumn = ({status, tasks, moveTask, setIsModalNewTaskOpen, onEditTask }: TaskColumnProps) => {
  const [{isOver}, drop] = useDrop(() => ({
    accept: "task",
    drop: (item: {id: number}) => moveTask(item.id, status),
    collect: (monitor: any) => ({
      isOver: !!monitor.isOver()
    })
  }), [status, moveTask]);

  const taskCount = tasks.filter((task) => task.status === status).length;

  const statusColor: any = {
    "To Do": "#2563EB",
    "Work In Progress": "#059669",
    "Under Review": "#D97706",
    "Completed": "#000000"
  }

  return (
    <div 
    ref={(instance) => {
      drop(instance);
    }}
    className={`sl:py-4 rounded-lg py-2 xl:px-2 ${isOver ? "bg-blue-100 dark:bg-neutral-950" : "" }`}>
      <div className='mb-3 flex w-full'>
        <div
          className="w-2 rounded-s-lg"
          style={{backgroundColor: statusColor[status]}}
        />
        <div className='flex w-full items-center justify-between rounded-e-lg bg-white px-5 py-4 dark:bg-dark-secondary'>
          <h3 className='flex items-center text-lg font-semibold dark:text-white'>
            {status}{" "}
            <span className='ml-2 inline-block rounded-full bg-gray-200 p-1 text-center text-sm leading-none dark:bg-dark-teritary'
              style={{ width: "1.5rem", height: "1.5rem" }}>
              {taskCount}
            </span>
          </h3>
          <div className='flex items-center gap-1'>
            <button className='flex h-6 w-5 items-center justify-center dark:text-neutral-500'>
              <EllipsisVertical size={26} />
            </button>
            <button className='flex h-6 w-6 items-center justify-center cursor-pointer rounded bg-gray-200 dark:bg-dark-teritary dark:text-white'
              onClick={() => setIsModalNewTaskOpen(true)}>
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>
      {tasks.filter((task) => task.status === status).map((task) => (
        <Task key={task.id} task={task}
        onEditTask={onEditTask}
        />
      ))}
    </div>
  )
};

type TaskProps = {
  task: TaskType;
  onEditTask: (task: TaskType) => void;
}

const Task = ({task, onEditTask}: TaskProps) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "task",
    item: {id: task.id},
    collect: (monitor: any) => ({
      isDragging: !!monitor.isDragging()
    })
  }), [task.id]);

  const taskTagsSplit = task.tags ? task.tags.split(",") : [];

  const formattedStartDate = task.start_date ? format(new Date(task.start_date), "P") : "";
  const formattedDueDate = task.due_date ? format(new Date(task.due_date), "P") : "";

  const numberOfComments = (task.comment && task.comment.length) || 0;

  const PriorityTag = ({priority}: {priority: TaskType['priority']}) => (
    <div
      className={`rounded-full px-2 py-1 text-xs font-semibold ${
        priority === "Urgent" ? "bg-red-200 text-red-700": priority === "High" ?
        "bg-yellow-200 text-yellow-700" : priority === "Medium" ?
        "bg-green-200 text-green-700" : priority === 'Low' ? 
        "bg-blue-200 text-blue-700" :
        "bg-gray-200 text-gray-700" 
      }`}>
        {priority}
      </div>
  );

  return (
    <div ref={(instance) => {
      drag(instance)
    }}
    className={`mb-4 rounded-md bg-white shadow dark:bg-dark-secondary ${
      isDragging ? "opacity-50" : "opacity-100"
    }`}>
      {task.attachment && task.attachment.length > 0 && (
        <Image
          src={`/${task.attachment[0].file_url}`}
          alt={task.attachment[0].file_name}
          width={400}
          height={200}
          className='h-auto w-full rounded-t-md'
        />
      )}
      <div className='p-4 md:p-6'>
        <div className='flex items-start justify-between'>
          <div className='flex flex-1 flex-wrap items-center gap-2'>
            {task.priority && <PriorityTag priority={task.priority}/>}
            <div className='flex gap-2'>
              {taskTagsSplit.map((tag) => (
                <div key={tag} className='rounded-full bg-blue-100 px-2 py-1 text-xs'>
                  {' '}
                  {tag}
                </div>
              ))}
            </div>
          </div>
          <button //this is where i need to click to open the actual modal to edit tasks
            onClick={() => onEditTask(task)}
            className='flex h-6 w-4 flex-shrink-0 items-center justify-center cursor-pointer dark:text-neutral-500'
          >
            <EllipsisVertical size={26}/>
          </button>
        </div>
        <div className='my-3 flex justify-between'>
          <h4 className='text-md font-bold dark:text-white'>{task.title}</h4>
          {typeof task.points === "number" && (
            <div className='text-sm front-semibold dark:text-white'>
              {task.points} pts
            </div>
          )}
        </div>
        <div className='text-xs text-gray-500 dark:text-neutral-500'>
          {formattedStartDate && <span>{formattedStartDate}</span>}
          {" - "}
          {formattedDueDate && <span>{formattedDueDate}</span>}
        </div>
        <p className='text-sm text-gray-600 dark:text-neutral-500'>
          {task.description}
        </p>
        <div className='mt-4 border-t border-gray-200 dark:border-stroke-dark'/>

        {/* Users */}
        <div className='mt-3 flex items-center justify-between'>
          <div className='flex -space-x-[6px] overflow-hidden'>
            {task.assigned && (
              <Image 
                key={task.assigned.id}
                src={`/${task.assigned.profilepicture_id}`}
                alt={task.assigned.username}
                width={30}
                height={30}
                className='h-8 w-8 rounded-full border-2 border-white object-cover dark:border-dark-secondary'/>
            )}
            {task.author && (
              <Image 
                key={task.author.id}
                src={`/${task.author.profilepicture_id}`}
                alt={task.author.username}
                width={30}
                height={30}
                className='h-8 w-8 rounded-full border-2 border-white object-cover dark:border-dark-secondary'/>
            )}
          </div>
          <div className='flex items-center text-gray-500 dark:text-neutral-500 cursor-pointer'>
            <MessageSquareMore size={20}/>
            <span className='ml-1 text-sm dark:text-neutral-400'>
              {numberOfComments} {/* we will add the functionality to open the comments as a little box next to the icon upon click*/}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
};

export default BoardView;