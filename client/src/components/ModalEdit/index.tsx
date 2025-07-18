import React from 'react';
import ReactDOM from "react-dom";
import Header from '../Header';
import { X } from 'lucide-react';

type Props = {
    children: React.ReactNode;
    isOpen: boolean;
    onClose: () => void;
    name: string;
}


const ModalEdit = ({children, isOpen, onClose, name}: Props) => {
    if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className='fixed inset-0 z-50 flex h-full w-full items-center justify-center overflow-y-auto bg-black/50 p-2'> 
        <div className='w-full max-w-4xl h-[80vh] flex flex-col rounded-lg bg-white shadow-lg dark:bg-dark-secondary'>
          {/* Header - Fixed at top */}
          <div className='flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700'>
            <Header
              name={name}
              buttonComponent={
                <button 
                  className='flex h-7 w-7 items-center justify-center cursor-pointer rounded-full bg-blue-primary text-white hover:bg-blue-600'
                  onClick={onClose}
                >
                  <X size={18}/>
                </button>
              }
              isSmallText
            />
          </div>
          
          {/* Content - Scrollable */}
          <div className='flex-1 overflow-y-scroll p-4 pt-0'>
            {children}
          </div>
        </div>
    </div>,
    document.body
  )
}

export default ModalEdit