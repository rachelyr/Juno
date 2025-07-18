import React, { useState } from 'react'
import Header from '../Header'
import { Comment, useCreateCommentMutation, useDeleteCommentMutation, useGetCommentsQuery } from '@/state/api';
import { Delete, DeleteIcon, Trash } from 'lucide-react';

type Props = {
    taskId: number;
    userId: number;
}

const ModalComment = ({taskId, userId}: Props) => {
    const {data: comments=[], isLoading} = useGetCommentsQuery({task_id:taskId});
    const [createComment] = useCreateCommentMutation();
    const [deleteComment] = useDeleteCommentMutation();

    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async(e: React.FormEvent) => {
      e.preventDefault();
      if (!newComment.trim()) return;

      setIsSubmitting(true);

      try{
        const formData = new FormData();
        formData.append('text', newComment.trim());

        await createComment({
          task_id: taskId,
          user_id: userId,
          data: formData
        }).unwrap();

        setNewComment('');
      } catch(error){
        console.error('Error posting comment: ',error);
      } finally {
        setIsSubmitting(false);
      }
    };

    //not working
    const handleDelete = async (commentId: number) => {
    try {
      await deleteComment({
        task_id: taskId,
        comm_id: commentId
      }).unwrap();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };
    
  return (
    <div className='space-y-4'>
        <Header name='Comments'/>
        <form onSubmit={handleSubmit} className='space-y-2'>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder='Add a comment...'
          rows={2}
          className='w-full p-2 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500'
          disabled={isSubmitting}
        />
        <button
          type='submit'
          disabled={!newComment.trim() || isSubmitting}
          className='px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700 disabled:opacity-50 text-sm'
        >
          {isSubmitting ? 'Posting...' : 'Post'}
        </button>
      </form>
      
      <div className='space-y-3 max-h-48 overflow-y-auto'>
        {isLoading ? (
          <div className='text-center text-gray-500 py-4'>Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className='text-center text-gray-500 py-4'>No comments</div>
        ) : (
          comments.map((comment: Comment) => (
            <div key={comment.id} className='bg-gray-50 p-3 rounded'>
              <div className='flex justify-between items-start mb-1'>
                <span className='font-medium text-sm'>{comment.username}</span>
                <div className='flex items-center space-x-2'>
                  {comment.user_id === userId && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className='text-red-600 hover:text-red-800 text-xs cursor-pointer'
                    >
                      <Trash width={18}/>
                    </button>
                  )}
                </div>
              </div>
              <p className='text-sm text-gray-700'>{comment.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default ModalComment