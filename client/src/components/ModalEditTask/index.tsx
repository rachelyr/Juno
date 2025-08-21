import React, { useEffect, useState } from 'react'
import ModalEdit from '@/components/ModalEdit';
import { Priority, Status, Task, useGetAuthUserQuery, useUpdateTaskMutation } from '@/state/api';
import { Calendar, Check, Edit3, Flag, User, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import ModalComment from '../ModalComment';


type Props = {
    projectid: string;
    isOpen: boolean;
    onClose: () => void;
    task: Task; //may need change
}

interface SelectOption {
  value: string;
  label: string;
}

interface TaskEditState {
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  due_date: string;
  assigned_userid: number;
}

interface EditableFieldProps {
  field: keyof TaskEditState;
  value: string;
  type?: 'text' | 'textarea' | 'date' | 'select' | 'number';
  options?: SelectOption[];
  onSave: (field: keyof TaskEditState, value: string) => void;
  isEditing: boolean;
  tempValue: string;
  onTempValueChange: (value: string) => void;
  onCancel: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>, field: keyof TaskEditState) => void;
  isLoading: boolean;
  onStartEditing: (field: keyof TaskEditState) => void;
}

const EditableField: React.FC<EditableFieldProps> = ({
    field,
    value,
    type = 'text',
    options = null,
    onSave,
    isEditing,
    tempValue,
    onTempValueChange,
    onCancel,
    onKeyDown,
    isLoading,
    onStartEditing
}) => {

    if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        {type === 'select' ? (
          <select
            value={tempValue}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onTempValueChange(e.target.value)}
            className="flex-1 px-3 py-2 border dark:text-white border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          >
            {options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : type === 'textarea' ? (
          <textarea
            value={tempValue}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onTempValueChange(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => onKeyDown(e, field)}
            className="flex-1 px-3 py-2 border dark:text-white border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
            autoFocus
          />
        ) : (
          <input
            type={type}
            value={tempValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onTempValueChange(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => onKeyDown(e, field)}
            className="flex-1 px-3 py-2 dark:text-white border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        )}
        <button
          type="button"
          onClick={() => onSave(field, tempValue)}
          className="p-1 text-green-600 hover:text-green-800 cursor-pointer hover:bg-green-50 rounded"
          disabled={isLoading}
        >
          <Check size={16} />
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
        >
          <X size={16} />
        </button>
      </div>
    );
  }
  return (
    <div
      onClick={() => onStartEditing(field)}
      className="group cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-teritary p-2 rounded-md transition-colors"
    >
      <div className="flex items-center justify-between">
        <span className={field === 'title' ? 'font-semibold dark:text-white text-lg' : 'dark:text-white'}>
          {value || 'Click to add...'}
        </span>
        <Edit3 size={14} className="opacity-0 group-hover:opacity-100 text-gray-400 transition-opacity" />
      </div>
    </div>
  );
};

const ModalEditTask = ({projectid, isOpen, onClose, task}: Props) => {
    //get the update API here
    const [updateTask, {isLoading}] = useUpdateTaskMutation();

    const [taskData, setTaskData] = useState<TaskEditState>({
        title: task?.title || '',
        description: task?.description || '',
        status: task?.status || '',
        priority: task?.priority || '',
        due_date: task?.due_date || '',
        assigned_userid: task?.assigned_userid || 0
    });

    const {data: currentUser} = useGetAuthUserQuery({});
    const currUserId = currentUser?.userDetails?.id ?? 0;

    const [editingField, setEditingField] = useState<keyof TaskEditState | null>(null);
    const [tempValue, setTempValue] = useState<string>('');

    // Update state when task prop changes
    useEffect(() => {
        if (task && editingField === null) {
            setTaskData({
                title: task.title || '',
                description: task.description || '',
                status: task.status || '',
                priority: task.priority || '',
                due_date: task.due_date || '',
                assigned_userid: task.assigned_userid || 0
            });
        }
    }, [task, editingField]);

    const handleFieldClick = (field: keyof TaskEditState): void => {
        setEditingField(field);
        setTempValue(taskData[field].toString());
    };

    const handleSave = async (field: keyof TaskEditState, value: string): Promise<void> => {
        let processedValue: string | number = value;
        
        // Convert to number for assigned_userid
        if (field === 'assigned_userid') {
            processedValue = parseInt(value) || 0;
        }
        
        const updatedData = {
            ...taskData,
            [field]: processedValue
        };
        
        setTaskData(updatedData);
        setEditingField(null);
        setTempValue('');

        // Auto-save to API
        if (task?.id) {
            try {
                await updateTask({
                    task_id: task.id,
                    data: {
                        title: updatedData.title,
                        description: updatedData.description,
                        status: updatedData.status,
                        priority: updatedData.priority,
                        due_date: updatedData.due_date,
                        assigned_userid: updatedData.assigned_userid
                    },
                    project_id: Number(projectid)
                });
            } catch (error) {
                console.error('Failed to update task:', error);
            }
        }
    };

    const formatDateForInput = (dateString: string) => {
        if (!dateString) return '';
        try {
            const parsed = parseISO(dateString);
            return format(parsed, 'dd-MM-yyyy');
        } catch {
            return dateString;
        }
    };

    const handleCancel = (): void => {
        setEditingField(null);
        setTempValue('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>, field: keyof TaskEditState): void => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSave(field, tempValue);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            handleCancel();
        }
    };

    const getPriorityColor = (priority: string): string => {
        switch (priority) {
            case 'Urgent': return 'bg-red-600 text-white border-red-600';
            case 'High': return 'bg-red-100 text-red-800 border-red-200';
            case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Low': return 'bg-green-100 text-green-800 border-green-200';
            case 'Backlog': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusColor = (status: string): string => {
        switch (status) {
            case 'To Do': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Work In Progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Under Review': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

  return (
    <ModalEdit isOpen={isOpen} onClose={onClose} name={task?.title}>
    <div className='flex gap-6 mt-4'>
        <div className='flex-1'>
            <form
            className='mt-2 space-y-6'
            onSubmit={(e) => {
            e.preventDefault();
            }}
        >
        <div className="space-y-4">
                    {/* Title */}
                    <div>
                        <label className="block text-lg font-medium text-gray-700 mb-1 dark:text-white">
                            Title
                        </label>
                        <EditableField 
                            field="title" 
                            value={taskData.title} 
                            onSave={handleSave}
                            isEditing={editingField === 'title'}
                            tempValue={tempValue}
                            onTempValueChange={setTempValue}
                            onCancel={handleCancel}
                            onKeyDown={handleKeyDown}
                            isLoading={isLoading}
                            onStartEditing={handleFieldClick}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-lg font-medium text-gray-700 dark:text-white mb-1">
                            Description
                        </label>
                        <EditableField 
                            field="description" 
                            value={taskData.description} 
                            type="textarea" 
                            onSave={handleSave}
                            isEditing={editingField === 'description'}
                            tempValue={tempValue}
                            onTempValueChange={setTempValue}
                            onCancel={handleCancel}
                            onKeyDown={handleKeyDown}
                            isLoading={isLoading}
                            onStartEditing={handleFieldClick}
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-lg font-medium text-gray-700 dark:text-white mb-2">
                            Status
                        </label>
                        {editingField === 'status' ? (
                            <EditableField
                                field="status"
                                value={taskData.status}
                                type="select"
                                options={[
                                    { value: 'To Do', label: 'To Do' },
                                    { value: 'Work In Progress', label: 'Work In Progress' },
                                    { value: 'Under Review', label: 'Under Review' },
                                    { value: 'Completed', label: 'Completed' }
                                ]}
                                onSave={handleSave}
                                isEditing={editingField === 'status'}
                                tempValue={tempValue}
                                onTempValueChange={setTempValue}
                                onCancel={handleCancel}
                                onKeyDown={handleKeyDown}
                                isLoading={isLoading}
                                onStartEditing={handleFieldClick}
                            />
                        ) : (
                            <div
                                onClick={() => handleFieldClick('status')}
                                className="group cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-teritary p-2 rounded-md transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(taskData.status)}`}>
                                        {taskData.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'No Status'}
                                    </span>
                                    <Edit3 size={14} className="opacity-0 group-hover:opacity-100 text-gray-400 transition-opacity" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Priority */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                            <Flag size={16} className="inline mr-1" />
                            Priority
                        </label>
                        {editingField === 'priority' ? (
                            <EditableField
                                field="priority"
                                value={taskData.priority}
                                type="select"
                                options={[
                                    { value: 'Urgent', label: 'Urgent' },
                                    { value: 'High', label: 'High' },
                                    { value: 'Medium', label: 'Medium' },
                                    { value: 'Low', label: 'Low' },
                                    { value: 'Backlog', label: 'Backlog' }
                                ]}
                                onSave={handleSave}
                                isEditing={editingField === 'priority'}
                                tempValue={tempValue}
                                onTempValueChange={setTempValue}
                                onCancel={handleCancel}
                                onKeyDown={handleKeyDown}
                                isLoading={isLoading}
                                onStartEditing={handleFieldClick}
                            />
                        ) : (
                            <div
                                onClick={() => handleFieldClick('priority')}
                                className="group cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-teritary p-2 rounded-md transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(taskData.priority)}`}>
                                        {taskData.priority.charAt(0).toUpperCase() + taskData.priority.slice(1) || 'No Priority'}
                                    </span>
                                    <Edit3 size={14} className="opacity-0 group-hover:opacity-100 text-gray-400 transition-opacity" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Due Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                            <Calendar size={16} className="inline mr-1" />
                            Due Date
                        </label>
                        <EditableField 
                            field="due_date" 
                            value={formatDateForInput(taskData.due_date)} 
                            type="date" 
                            onSave={handleSave}
                            isEditing={editingField === 'due_date'}
                            tempValue={tempValue}
                            onTempValueChange={setTempValue}
                            onCancel={handleCancel}
                            onKeyDown={handleKeyDown}
                            isLoading={isLoading}
                            onStartEditing={handleFieldClick}
                        />
                    </div>

                    {/* Assigned User */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                            <User size={16} className="inline mr-1" />
                            Assigned User ID
                        </label>
                        <EditableField 
                            field="assigned_userid" 
                            value={taskData.assigned_userid.toString()} 
                            type="number"
                            onSave={handleSave}
                            isEditing={editingField === 'assigned_userid'}
                            tempValue={tempValue}
                            onTempValueChange={setTempValue}
                            onCancel={handleCancel}
                            onKeyDown={handleKeyDown}
                            isLoading={isLoading}
                            onStartEditing={handleFieldClick}
                        />
                    </div>

                    {/* Loading indicator */}
                    {isLoading && (
                        <div className="text-sm text-blue-600 text-center">
                            Saving changes...
                        </div>
                    )}
                </div>
            </form>
        </div>
        <div className="w-80 border-l pl-6">
          <ModalComment
            taskId={task?.id || 0} 
            userId={currUserId} // will change that
          />
        </div>
    </div>
    </ModalEdit>
  )
}

export default ModalEditTask;