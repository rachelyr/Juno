import React from 'react';
import { MenuIcon, Moon, Search, Settings, Sun} from 'lucide-react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/app/redux';
import { setIsDarkMode, setIsSidebarCollapsed } from '@/state';


const Navbar = () => {

  const dispatch = useAppDispatch();

  const isSidebarCollapsed = useAppSelector(
      (state) => state.global.isSidebarCollapsed,  {/*gives us our global store for sidebar*/}
    );
    const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  return (
    <div className="flex items-center justify-between bg-white px-4 py-3 dark:bg-black">
      {/*SEARCH BAR*/}
      <div className="flex items-center gap-8">
        {!isSidebarCollapsed ? null : (
          <button
            onClick={() => dispatch(setIsSidebarCollapsed(!isSidebarCollapsed))}
          >
            <MenuIcon className="h-8 w-8 dark:text-white cursor-pointer" />
          </button>
        )}
        <div className="relative flex h-min w-[200px]">
          <Search className="absolute top-1/2 left-[4px] mr-2 h-5 w-5 -translate-y-1/2 transform cursor-pointer" />{" "}
          {/*dark:text-white*/}
          <input
            className="w-full rounded border-none bg-gray-100 p-2 pl-8 placeholder-gray-500 focus:border-transparent focus:outline-none"
            type="search"
            placeholder="Search..."
          />
        </div>
      </div>

      {/*ICONS*/}
      <div className="flex items-center">
        <button
          onClick={() => dispatch(setIsDarkMode(!isDarkMode))}
          className={
            isDarkMode
              ? "rounded p-2 dark:hover:bg-gray-700"
              : "rounded hover:bg-gray-100 p-2"
          }
        >
          {!isDarkMode ? (
            <Sun className='h-6 w-6 cursor-pointer dark:text-white'/>
          ): (
            <Moon className='h-6 w-6 cursor-pointer dark:text-white'/>
          )}
        </button>
        <Link
          href="/settings"
          className={isDarkMode ? 'h-min w-min rounded p-2 dark:hover:bg-gray-700' : 'h-min w-min rounded p-2 hover:bg-gray-100'}
        >
          <Settings className="h-6 w-6 cursor-pointer dark:text-white" />
        </Link>
        <div className="mr-5 ml-2 hidden min-h-[2em] w-[0.1rem] bg-gray-200 md:inline-block"></div>
      </div>
    </div>
  );
}

export default Navbar

