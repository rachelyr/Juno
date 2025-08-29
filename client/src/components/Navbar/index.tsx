// import React, { useState } from 'react';
// import { ChevronDown, LogOut, MenuIcon, Moon, Search, Settings, Sun, User} from 'lucide-react';
// import Link from 'next/link';
// import { useAppDispatch, useAppSelector } from '@/app/redux';
// import { setIsDarkMode, setIsSidebarCollapsed } from '@/state';
// import { useGetAuthUserQuery } from '@/state/api';
// import { signOut } from 'aws-amplify/auth';
// import Image from 'next/image';


// const Navbar = () => {
//   const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

//   const dispatch = useAppDispatch();

//   const isSidebarCollapsed = useAppSelector(
//       (state) => state.global.isSidebarCollapsed,  {/*gives us our global store for sidebar*/}
//     );
//     const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

//     const {data: currUser} = useGetAuthUserQuery({});

//     if(!currUser) return null;

//     const handleSignOut = async () => {
//       try{
//         await signOut();
//       } catch(error){
//         console.log("Error signing out", error);
//       }
//     };

//     const userDetails = currUser?.userDetails;

//   return (
//     <div className="flex items-center justify-between bg-white px-4 py-3 dark:bg-black">
//       {/*SEARCH BAR*/}
//       <div className="flex items-center gap-2 md:gap-8">
//         {!isSidebarCollapsed ? null : (
//           <button
//             onClick={() => dispatch(setIsSidebarCollapsed(!isSidebarCollapsed))}
//           >
//             <MenuIcon className="h-8 w-8 dark:text-white cursor-pointer" />
//           </button>
//         )}
//         <div className="relative flex h-min w-[200px]">
//           <Search className="absolute top-1/2 left-[4px] mr-2 h-5 w-5 -translate-y-1/2 transform cursor-pointer" />{" "}
//           {/*dark:text-white*/}
//           <input
//             className="w-full rounded border-none bg-gray-100 p-2 pl-8 placeholder-gray-500 focus:border-transparent focus:outline-none"
//             type="search"
//             placeholder="Search..."
//           />
//         </div>
//       </div>

//       {/*ICONS*/}
//       <div className="flex items-center">
//         <button
//           onClick={() => dispatch(setIsDarkMode(!isDarkMode))}
//           className={
//             isDarkMode
//               ? "rounded p-2 dark:hover:bg-gray-700"
//               : "rounded hover:bg-gray-100 p-2"
//           }
//         >
//           {!isDarkMode ? (
//             <Sun className='h-6 w-6 cursor-pointer dark:text-white'/>
//           ): (
//             <Moon className='h-6 w-6 cursor-pointer dark:text-white'/>
//           )}
//         </button>
//         <Link
//           href="/settings"
//           className={isDarkMode ? 'h-min w-min rounded p-2 dark:hover:bg-gray-700' : 'h-min w-min rounded p-2 hover:bg-gray-100'}
//         >
//           <Settings className="h-6 w-6 cursor-pointer dark:text-white" />
//         </Link>
//         <div className="mr-2 ml-2 hidden min-h-[2em] w-[0.1rem] bg-gray-200 md:inline-block"></div>
        
//         {/* Desktop Profile Section */}
//         <div className='hidden items-center justify-between md:flex'>
//           <div className='flex h-9 align-middle w-9 justify-center'>
//             {userDetails?.profilepicture_id ? (
//               <Image
//                 src="/profilepic.jpeg"
//                 alt={userDetails?.username || "User Profile Picture"}
//                 width={36}
//                 height={36}
//                 className='h-full rounded-full object-cover'
//               />
//             ) : (
//               <User className='h-6 w-6 cursor-pointer self-center rounded-full dark:text-white'/>
//             )}
//           </div>
//           <span className='mx-3 text-gray-800 dark:text-white'>
//             {userDetails?.username}
//           </span>
//           <button
//             onClick={handleSignOut}
//             className='cursor-pointer rounded bg-blue-primary hover:bg-blue-700 px-4 py-2 text-xs font-bold text-white'
//           >
//             Sign Out
//           </button>
//         </div>

//         {/* Mobile Profile Dropdown */}
//         <div className="relative md:hidden">
//           <button
//             onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
//             className="flex items-center gap-1 rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
//           >
//             <div className='flex h-8 w-8 justify-center items-center'>
//               {userDetails?.profilepicture_id ? (
//                 <Image
//                   src="/profilepic.jpeg"
//                   alt={userDetails?.username || "User Profile Picture"}
//                   width={32}
//                   height={32}
//                   className='h-full rounded-full object-cover'
//                 />
//               ) : (
//                 <User className='h-5 w-5 cursor-pointer rounded-full dark:text-white'/>
//               )}
//             </div>
//             <ChevronDown className={`h-4 w-4 dark:text-white transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
//           </button>

//           {/* Mobile Dropdown Menu */}
//           {isProfileDropdownOpen && (
//             <div className="absolute right-0 mt-2 w-48 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 z-50">
//               <div className="py-1">
//                 <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
//                   <div className="font-medium">{userDetails?.username}</div>
//                 </div>
//                 <Link
//                   href="/settings"
//                   className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
//                   onClick={() => setIsProfileDropdownOpen(false)}
//                 >
//                   <Settings className="h-4 w-4 mr-2" />
//                   Settings
//                 </Link>
//                 <button
//                   onClick={handleSignOut}
//                   className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
//                 >
//                   <LogOut className="h-4 w-4 mr-2" />
//                   Sign Out
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Click outside to close dropdown */}
//       {isProfileDropdownOpen && (
//         <div
//           className="fixed inset-0 z-40 md:hidden"
//           onClick={() => setIsProfileDropdownOpen(false)}
//         />
//       )}
//     </div>
//   );
// }

// export default Navbar

import React, { useState } from 'react';
import { MenuIcon, Moon, Search, Settings, Sun, User, ChevronDown, LogOut} from 'lucide-react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/app/redux';
import { setIsDarkMode, setIsSidebarCollapsed } from '@/state';
import { useGetAuthUserQuery } from '@/state/api';
import { signOut } from 'aws-amplify/auth';
import Image from 'next/image';

const Navbar = () => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  
  const dispatch = useAppDispatch();

  const isSidebarCollapsed = useAppSelector(
      (state) => state.global.isSidebarCollapsed,  {/*gives us our global store for sidebar*/}
    );
    const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

    const {data: currUser} = useGetAuthUserQuery({});

    if(!currUser) return null;

    const handleSignOut = async () => {
      try{
        await signOut();
        setIsProfileDropdownOpen(false);
      } catch(error){
        console.log("Error signing out", error);
      }
    };

    const userDetails = currUser?.userDetails;

  return (
    <div className="flex items-center justify-between bg-white px-4 py-3 dark:bg-black w-full min-w-0">
      {/*SEARCH BAR*/}
      <div className="flex items-center gap-2 md:gap-8 flex-shrink-0">
        {!isSidebarCollapsed ? null : (
          <button
            onClick={() => dispatch(setIsSidebarCollapsed(!isSidebarCollapsed))}
          >
            <MenuIcon className="h-8 w-8 dark:text-white cursor-pointer" />
          </button>
        )}
        <div className="relative flex h-min w-[150px] sm:w-[200px] flex-shrink-0">
          <Search className="absolute top-1/2 left-[4px] mr-2 h-5 w-5 -translate-y-1/2 transform cursor-pointer" />
          <input
            className="w-full rounded border-none bg-gray-100 p-2 pl-8 placeholder-gray-500 focus:border-transparent focus:outline-none text-sm"
            type="search"
            placeholder="Search..."
          />
        </div>
      </div>

      <div className="flex items-center gap-1 md:gap-2">
        <button
          onClick={() => dispatch(setIsDarkMode(!isDarkMode))}
          className={
            isDarkMode
              ? "rounded p-2 dark:hover:bg-gray-700"
              : "rounded hover:bg-gray-100 p-2"
          }
        >
          {!isDarkMode ? (
            <Sun className='h-5 w-5 md:h-6 md:w-6 cursor-pointer dark:text-white'/>
          ): (
            <Moon className='h-5 w-5 md:h-6 md:w-6 cursor-pointer dark:text-white'/>
          )}
        </button>
        
        <Link
          href="/settings"
          className={isDarkMode ? 'hidden md:block h-min w-min rounded p-2 dark:hover:bg-gray-700' : 'hidden md:block h-min w-min rounded p-2 hover:bg-gray-100'}
        >
          <Settings className="h-5 w-5 md:h-6 md:w-6 cursor-pointer dark:text-white" />
        </Link>

        <div className="mr-2 ml-2 hidden min-h-[2em] w-[0.1rem] bg-gray-200 md:inline-block"></div>
        
        {/* Desktop Profile Section */}
        <div className='hidden items-center justify-between md:flex'>
          <div className='flex h-9 align-middle w-9 justify-center'>
            {userDetails?.profilepicture_id ? (
              <Image
                src={userDetails?.profilepicture_id}
                alt={userDetails?.username || "User Profile Picture"}
                width={36}
                height={36}
                className='h-full rounded-full object-cover'
              />
            ) : (
              <User className='h-6 w-6 cursor-pointer self-center rounded-full dark:text-white'/>
            )}
          </div>
          <span className='mx-3 text-gray-800 dark:text-white'>
            {userDetails?.username}
          </span>
          <button
            onClick={handleSignOut}
            className='cursor-pointer rounded bg-blue-primary hover:bg-blue-700 px-4 py-2 text-xs font-bold text-white'
          >
            Sign Out
          </button>
        </div>

        {/* Mobile Profile Dropdown */}
        <div className="relative md:hidden">
          <button
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="flex items-center gap-1 rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <div className='flex h-8 w-8 justify-center items-center'>
              {userDetails?.profilepicture_id ? (
                <Image
                  src="/profilepic.jpeg"
                  alt={userDetails?.username || "User Profile Picture"}
                  width={32}
                  height={32}
                  className='h-full rounded-full object-cover'
                />
              ) : (
                <User className='h-5 w-5 cursor-pointer rounded-full dark:text-white'/>
              )}
            </div>
            <ChevronDown className={`h-4 w-4 dark:text-white transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Mobile Dropdown Menu */}
          {isProfileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 z-50">
              <div className="py-1">
                <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                  <div className="font-medium">{userDetails?.username}</div>
                </div>
                <Link
                  href="/settings"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setIsProfileDropdownOpen(false)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {isProfileDropdownOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setIsProfileDropdownOpen(false)}
        />
      )}
    </div>
  );
}

export default Navbar