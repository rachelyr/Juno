import React, { useEffect, useMemo, useState } from 'react'
import ModalEdit from '@/components/ModalEdit';
import { Priority, Status, Task, useDeleteTaskMutation, useGetAuthUserQuery, useSearchUsersQuery, useUpdateTaskMutation } from '@/state/api';
import { Calendar, Check, Edit3, Flag, Trash2, User, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import ModalComment from '../ModalComment';
import { debounce } from 'lodash';

type Props = {
    projectid: string;
    isOpen: boolean;
    onClose: () => void;
    task: Task;
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
  type?: 'text' | 'textarea' | 'date' | 'select' | 'user-search';
  options?: SelectOption[];
  onSave: (field: keyof TaskEditState, value: string) => void;
  isEditing: boolean;
  tempValue: string;
  onTempValueChange: (value: string) => void;
  onCancel: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>, field: keyof TaskEditState) => void;
  isLoading: boolean;
  onStartEditing: (field: keyof TaskEditState) => void;
  userSuggestions?: any[];
  onUserSelect?: (user: any) => void;
  userSearchQuery?: string;
}

const EditableField: React.FC<EditableFieldProps> = ({
    field,
    value,
    type = 'text',
    options = [],
    onSave,
    isEditing,
    tempValue,
    onTempValueChange,
    onCancel,
    onKeyDown,
    isLoading,
    onStartEditing,
    userSuggestions = [],
    onUserSelect,
    userSearchQuery = ""
}) => {

    if (isEditing) {
    return (
      <div className="relative">
        <div className="flex items-center gap-2">
        {type === 'select' ? (
          <select
            value={tempValue}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onTempValueChange(e.target.value)}
            className="flex-1 px-3 py-2 border dark:bg-dark-secondary dark:text-white border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="flex-1 px-3 py-2 border dark:text-white dark:bg-dark-secondary border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
            autoFocus
          />
        ) : type === 'user-search' ? (
          <input
            type="text"
            value={tempValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onTempValueChange(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => onKeyDown(e, field)}
            className="flex-1 px-3 py-2 dark:text-white dark:bg-dark-secondary border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search for user..."
            autoFocus
          />
        ) : (
          <input
            type={type}
            value={tempValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onTempValueChange(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => onKeyDown(e, field)}
            className="flex-1 px-3 py-2 dark:text-white dark:bg-dark-secondary border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      
      {/* User suggestions dropdown */}
      {type === 'user-search' && userSearchQuery && userSuggestions.length > 0 && (
        <div className="absolute left-0 right-0 z-20 mt-1 max-h-40 overflow-auto rounded-md border border-gray-300 bg-white shadow-lg dark:border-dark-teritary dark:bg-dark-teritary">
          {userSuggestions.map((user) => (
            <div
              key={user.id}
              className="px-4 py-2 cursor-pointer dark:text-white hover:bg-gray-100 dark:hover:bg-dark-secondary"
              onClick={() => onUserSelect?.(user)}
            >
              {user.username}
            </div>
          ))}
        </div>
      )}
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
    const [updateTask, {isLoading}] = useUpdateTaskMutation();
    const [deleteTask, {isLoading: isDeleting}] = useDeleteTaskMutation();

    const [userSearchQuery, setUserSearchQuery] = useState("");
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [assignedUserDisplay, setAssignedUserDisplay] = useState<string>('');

    const {data} = useSearchUsersQuery(userSearchQuery, {
        skip: userSearchQuery.length < 1
    });

    const userSuggestions = data?.users ?? [];

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
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

    const debounceSearch = useMemo(() => 
        debounce((value: string) => {
            setUserSearchQuery(value);
        }, 300),
        []
    );

    // Update state when task prop changes
    useEffect(() => {
        if (task) {
            setTaskData({
                title: task.title || '',
                description: task.description || '',
                status: task.status || '',
                priority: task.priority || '',
                due_date: task.due_date || '',
                assigned_userid: task.assigned_userid || 0
            });

            // Set the initial assigned user display
            if (task.assigned?.username) {
                setAssignedUserDisplay(task.assigned.username);
            } else if (task.assigned_userid > 0) {
                setAssignedUserDisplay(`User ID: ${task.assigned_userid}`);
            } else {
                setAssignedUserDisplay('');
            }
        }
    }, [task]);



    const handleFieldClick = (field: keyof TaskEditState): void => {
        setEditingField(field);

        if (field === 'assigned_userid') {
            setTempValue('');
            setUserSearchQuery('');
        } else {
            const currVal = taskData[field];
            setTempValue(currVal?.toString() || '');
        }
    };

    const handleUserSelect = (user: any) => {
        setTempValue(user.username);
        setSelectedUserId(user.id);
        setUserSearchQuery('');
        // Don't exit editing mode - let user confirm with save button
    };

    const handleUserSearchChange = (value: string) => {
        setTempValue(value);
        debounceSearch(value);
    };

    const handleSave = async (field: keyof TaskEditState, value: string): Promise<void> => {
        let processedValue: string | number = value;
        let newDisplayValue = '';
        
        if (field === 'assigned_userid') {
            if (selectedUserId !== null) {
                processedValue = selectedUserId;
                newDisplayValue = value; // value should be the username
            } else if (!isNaN(Number(value))) {
                processedValue = parseInt(value) || 0;
                newDisplayValue = processedValue > 0 ? `User ID: ${processedValue}` : '';
            } else {
                const foundUser = userSuggestions.find(user => user.username === value);
                processedValue = foundUser?.id || 0;
                newDisplayValue = value;
            }
        }
        
        const updatedData = {
            ...taskData,
            [field]: processedValue
        };
        
        // Update states immediately for UI responsiveness
        setTaskData(updatedData);
        if (field === 'assigned_userid') {
            setAssignedUserDisplay(newDisplayValue);
        }
        
        setEditingField(null);
        setTempValue('');
        setUserSearchQuery('');
        setSelectedUserId(null);

        // Auto-save to API
        if (task?.id) {
            try {
                const updatePayload = {
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
                };
                
                await updateTask(updatePayload).unwrap();
            } catch (error) {
                console.error('Failed to update task:', error);
                // Revert on error
                setTaskData(taskData);
                if (field === 'assigned_userid') {
                    if (task.assigned?.username) {
                        setAssignedUserDisplay(task.assigned.username);
                    } else if (task.assigned_userid > 0) {
                        setAssignedUserDisplay(`User ID: ${task.assigned_userid}`);
                    } else {
                        setAssignedUserDisplay('');
                    }
                }
                setSelectedUserId(null);
            }
        }
    };

    const handleDeleteTask = async (): Promise<void> => {
        if (task?.id) {
            try {
                await deleteTask({taskId: task.id}).unwrap();
                onClose();
            } catch (error) {
                console.log("error deleting task: ", error);
            }
        }
        setShowDeleteConfirm(false);
    };

    const formatDateForInput = (dateString: string) => {
        if (!dateString) return '';
        try {
            const parsed = parseISO(dateString);
            return format(parsed, 'yyyy-MM-dd'); // Changed to yyyy-MM-dd for HTML date input
        } catch {
            return dateString;
        }
    };

    const handleCancel = (): void => {
        setEditingField(null);
        setTempValue('');
        setUserSearchQuery('');
        setSelectedUserId(null); // Reset selected user ID on cancel
    };

    const handleKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
        field: keyof TaskEditState
    ): void => {
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
            case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'Medium': return 'bg-blue-100 text-blue-800 border-blue-200';
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
                            Assigned User
                        </label>
                        <EditableField
                            field="assigned_userid"
                            value={assignedUserDisplay}
                            type="user-search"
                            onSave={handleSave}
                            isEditing={editingField === 'assigned_userid'}
                            tempValue={tempValue}
                            onTempValueChange={handleUserSearchChange}
                            onCancel={handleCancel}
                            onKeyDown={handleKeyDown}
                            isLoading={isLoading}
                            onStartEditing={handleFieldClick}
                            userSuggestions={userSuggestions}
                            onUserSelect={handleUserSelect}
                            userSearchQuery={userSearchQuery}
                        />
                    </div>

                          {showDeleteConfirm && (
                              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                                  <p className="text-red-800 dark:text-red-300 text-sm mb-3">
                                      Delete &apos;{task?.title}&apos; ?
                                  </p>
                                  <div className="flex gap-2">
                                      <button
                                          onClick={handleDeleteTask}
                                          disabled={isDeleting}
                                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                                      >
                                          {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                                      </button>
                                      <button
                                          onClick={() => setShowDeleteConfirm(false)}
                                          className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                                      >
                                          Cancel
                                      </button>
                                  </div>
                              </div>
                          )}

                          {!showDeleteConfirm && (
                            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                                <button
                                  onClick={() => setShowDeleteConfirm(true)}
                                  className="flex items-center gap-2 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                >
                                  <Trash2 size={16} />
                                  Delete Task
                              </button>
                          </div>
                        )}

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
            userId={currUserId}
          />
        </div>
    </div>
    </ModalEdit>
  )
}

export default ModalEditTask;