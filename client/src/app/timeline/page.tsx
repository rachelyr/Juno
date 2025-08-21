"use client";

import { useAppSelector } from '@/app/redux';
import { useGetProjectsQuery } from '@/state/api';
import React, { useMemo, useState } from 'react'
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Header from '@/components/Header';
import ModalNewProject from '../projects/ModalNewProject';

const localizer = momentLocalizer(moment);

const Timeline = () => {
  const [isModalNewProjectOpen, setIsModalNewProjectOpen] = useState(false);
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const [view, setView] = useState(Views.MONTH);

  const {
    data: projects,
    isError,
    isLoading
  } = useGetProjectsQuery();

  
  const events = useMemo(() => {
    if (!projects) return [];
    
    return projects
      .filter((project) => project.start_date && project.due_date)
      .map((project) => ({
        id: project.id,
        title: project.name,
        start: new Date(project.start_date as string),
        end: new Date(project.due_date as string),
        resource: project, // Store full project data
        allDay: true // Projects span full days
      }));
  }, [projects]);

  const handleViewChange = (newView: any) => {
    setView(newView);
  };

  // Custom event component styling
  const eventStyleGetter = () => {
    const backgroundColor = isDarkMode ? '#374151' : '#3B82F6';
    const borderColor = isDarkMode ? '#1F2937' : '#1E40AF';
    
    return {
      style: {
        backgroundColor,
        borderColor,
        border: `2px solid ${borderColor}`,
        borderRadius: '6px',
        color: 'white',
        fontSize: '12px',
        fontWeight: '500',
        padding: '2px 6px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }
    };
  };

  const CustomToolbar = ({ label, onNavigate, onView, view: currentView }: any) => {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('PREV')}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded text-sm font-medium transition-colors"
          >
            ←
          </button>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white min-w-[200px] text-center">
            {label}
          </h2>
          <button
            onClick={() => onNavigate('NEXT')}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded text-sm font-medium transition-colors"
          >
            →
          </button>
          <button
            onClick={() => onNavigate('TODAY')}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
          >
            Today
          </button>
        </div>
        
        <div className="flex gap-2">
          {[
            { view: Views.MONTH, label: 'Month' },
            { view: Views.WEEK, label: 'Week' },
            { view: Views.DAY, label: 'Day' }
          ].map(({ view: viewType, label: viewLabel }) => (
            <button
              key={viewType}
              onClick={() => onView(viewType)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                currentView === viewType
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
              }`}
            >
              {viewLabel}
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className='px-4 xl:px-6'>
        <Header name='Project Timeline'/>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-lg">Loading your projects...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className='px-4 xl:px-6'>
        <Header name='Project Timeline'/>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="text-red-500 text-xl mb-2">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Error Loading Projects
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            We couldn&apos;t load your projects. Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  // Handle empty state for new users
  if (!projects || projects.length === 0) {
    return (
      <div className='px-4 pt-4 xl:px-6'>
        <ModalNewProject
          isOpen={isModalNewProjectOpen}
          onClose={() => setIsModalNewProjectOpen(false)}
        />
        <Header name='Project Timeline'/>
        
        <div className='overflow-hidden rounded-md bg-white shadow dark:bg-dark-secondary dark:text-white mt-4'>
          <div className="flex flex-col items-center justify-center h-96 text-center p-8">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
              Welcome to Project Timeline
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md">
              You don&apos;t have any projects yet. Create your first project to see it visualized in the timeline.
            </p>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer font-medium py-2 px-4 rounded-lg transition-colors"
              onClick={() => setIsModalNewProjectOpen(true)}  
            >
              Create Your First Project
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='px-4 pt-4 xl:px-6'>
      <Header name='Project Timeline'/>
      
      <div className='overflow-hidden rounded-lg bg-white shadow dark:bg-dark-secondary mt-4'>
        <div className="p-4">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            view={view}
            onView={handleViewChange}
            style={{ 
              height: 600,
              backgroundColor: isDarkMode ? '#1f2937' : 'white',
              color: isDarkMode ? 'white' : 'black'
            }}
            eventPropGetter={eventStyleGetter}
            components={{
              toolbar: CustomToolbar
            }}
            formats={{
              dayFormat: 'ddd DD',
              weekdayFormat: 'dddd',
              monthHeaderFormat: 'MMMM YYYY',
              dayHeaderFormat: 'dddd, MMMM DD',
              agendaDateFormat: 'ddd MMM DD',
              agendaTimeFormat: ''
            }}
            messages={{
              agenda: 'Project List',
              date: 'Date',
              time: 'Duration',
              event: 'Project',
              noEventsInRange: 'No projects scheduled for this period.',
              showMore: (total) => `+${total} more projects`
            }}
            popup
            popupOffset={{ x: 30, y: 20 }}
            className={`${isDarkMode ? 'dark-calendar' : ''}`}
          />
        </div>
      </div>
      
      <style jsx global>{`
        .rbc-calendar {
          background-color: ${isDarkMode ? '#1f2937' : 'white'} !important;
          color: ${isDarkMode ? 'white' : 'black'} !important;
        }
        
        .dark-calendar .rbc-header {
          background-color: #374151 !important;
          color: white !important;
          border-color: #4b5563 !important;
        }
        
        .dark-calendar .rbc-month-view,
        .dark-calendar .rbc-time-view {
          background-color: #1f2937 !important;
          border-color: #4b5563 !important;
        }
        
        .dark-calendar .rbc-date-cell,
        .dark-calendar .rbc-day-bg {
          border-color: #4b5563 !important;
        }
        
        .dark-calendar .rbc-today {
          background-color: rgba(34, 197, 94, 0.1) !important;
        }
        
        .dark-calendar .rbc-off-range-bg {
          background-color: #111827 !important;
        }
        
        .dark-calendar .rbc-agenda-view table {
          background-color: #1f2937 !important;
          color: white !important;
        }
        
        .dark-calendar .rbc-agenda-view .rbc-agenda-table {
          border-color: #4b5563 !important;
        }
        
        .dark-calendar .rbc-agenda-view .rbc-agenda-table tbody > tr > td {
          border-color: #4b5563 !important;
        }
        
        .rbc-btn-group > button {
          color: ${isDarkMode ? 'white' : 'black'} !important;
          background-color: ${isDarkMode ? '#374151' : '#f3f4f6'} !important;
          border-color: ${isDarkMode ? '#4b5563' : '#d1d5db'} !important;
        }
        
        .rbc-btn-group > button:hover {
          background-color: ${isDarkMode ? '#4b5563' : '#e5e7eb'} !important;
        }
        
        .rbc-btn-group > button.rbc-active {
          background-color: #3b82f6 !important;
          color: white !important;
        }
      `}</style>
    </div>
  );
};

export default Timeline;