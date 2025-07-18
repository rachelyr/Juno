"use client";

import React, { useEffect } from 'react'
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import StoreProvider, { useAppSelector } from './redux';

const DashboardLayout= ({children}: {children: React.ReactNode}) => {
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed,  {/*gives us our global store for sidebar*/}
  );
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  //adding dark mode class to root element if true
  useEffect(() => {
    if(isDarkMode){
      document.documentElement.classList.add("dark");
    } else{
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode])

  return (
    <div className='flex min-h-screen w-full bg-gray-50 text-gray-900'>
      {/*Sidebar*/}
      <Sidebar/>
      <main className={`flex w-full flex-col bg-gray-50 dark:bg-dark-bg transition-all duration-300 ease-in-out ${ 
        isSidebarCollapsed ? "" : "md:pl-64"
      }`}>
        {/*NAVBAR*/}
        <Navbar/>
        {children}
      </main>

    </div>
  )
}

const DashboardWrap = ({children}: {children: React.ReactNode}) => {
  return (
    <StoreProvider> {/*so our entire application has access to redux - did this seperately to access global state in dashboard*/}
      <DashboardLayout>{children}</DashboardLayout>
    </StoreProvider>
  )
}

export default DashboardWrap;
