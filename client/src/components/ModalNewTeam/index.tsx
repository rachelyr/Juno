import Modal from '@/components/Modal';
import { useCreateTeamsMutation, useSearchUsersQuery } from '@/state/api';
import { debounce } from 'lodash';
import { X } from 'lucide-react';
import React, { useMemo, useState } from 'react'

type Props = {
    isOpen: boolean;
    onClose: () => void;
}

const ModalNewTeam = ({isOpen, onClose}: Props) => {
    const [createTeam, {isLoading}] = useCreateTeamsMutation();

    const [searchQuery, setSearchQuery] = useState("")
    const {data} = useSearchUsersQuery(searchQuery, {
        skip: searchQuery.length < 2
    });
    const userSuggestions = data?.users ?? [];
    const [teamName, setTeamName] = useState("");
    const [productOwner, setProductOwner] = useState<string>("");
    const [productOwnerInput, setProductOwnerInput] = useState<string>("");
    const [projectManager, setProjectManager] = useState<string>("");
    const [projectManagerInput, setProjectManagerInput] = useState<string>("");
    const [members, setMembers] = useState<string[]>([]);
    const [memberInput, setMemberInput] = useState<string>("");

    const [activeField, setActiveField] = useState<'productOwner' | 'projectManager' | 'member' | null>(null);

    const debounceSearch = useMemo(
        () => debounce((value: string) => {
            setSearchQuery(value);
        }, 300),
        []
    );

    // Product Owner handlers
    const handleProductOwnerInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setProductOwnerInput(value);
        setProductOwner(""); // Clear selection when typing
        setActiveField('productOwner');
        debounceSearch(value);
    };

    const handleSelectProductOwner = (user: any) => {
        setProductOwner(user.id.toString());
        setProductOwnerInput(user.username);
        setSearchQuery("");
        setActiveField(null);
    };

    // Project Manager handlers
    const handleProjectManagerInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setProjectManagerInput(value);
        setProjectManager(""); // Clear selection when typing
        setActiveField('projectManager');
        debounceSearch(value);
    };

    const handleSelectProjectManager = (user: any) => {
        setProjectManager(user.id.toString());
        setProjectManagerInput(user.username);
        setSearchQuery("");
        setActiveField(null);
    };

    // Member handlers
    const handleMemberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setMemberInput(value);
        setActiveField('member');
        debounceSearch(value);
    };

    const handleSelectUser = (username: string) => {
        if (!members.includes(username)) {
            setMembers([...members, username]);
        }
        setMemberInput("");
        setSearchQuery("");
        setActiveField(null);
    };

    const addMember = () => {
        if (memberInput.trim() && !members.includes(memberInput.trim())) {
            setMembers([...members, memberInput.trim()]);
            setMemberInput("");
        }
    };

    const removeMember = (memberToRemove: string) => {
        setMembers(members.filter(member => member !== memberToRemove));
    };

    const handleSubmit = async () => {
        if (!teamName || !productOwner) return;

        //the api to create project
        await createTeam({
            domain_name: teamName,
            productowner_userid: Number(productOwner),
            projectmanager_userid: projectManager ? Number(projectManager) : undefined,
            members: members 
        });

        setTeamName("");
        setProductOwner("");
        setProductOwnerInput("");
        setProjectManager("");
        setProjectManagerInput("");
        setMembers([]);
        setMemberInput("");
        setSearchQuery("");
        setActiveField(null);
        onClose();
    };

    const isFormValid = () => {
        return teamName && productOwner && projectManager;
    };

    const inputStyles = "w-full rounded border border-gray-300 p-2 shadow-sm dark:border-dark-teritary dark:bg-dark-teritary dark:text-white dark:focus:outline-none";

  return <Modal isOpen={isOpen} onClose={onClose} name='Create A New Team'>
    <form 
     className='mt-4 space-y-6'
     onSubmit={(e) => {
        e.preventDefault(); //so the page doesnt refresh
        handleSubmit();
     }} 
    >
        <input 
            type="text"
            className={inputStyles} 
            placeholder='Team Name' 
            value={teamName} 
            onChange={(e) => setTeamName(e.target.value)}
        />
        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-2'>
            <div className='space-y-2'>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>Team Project Owner</label>
                <div className='relative'>
                    <input
                        type="text"
                        className={inputStyles}
                        placeholder='Project Owner Username'
                        value={productOwnerInput}
                        onChange={handleProductOwnerInputChange}
                    />
                    {searchQuery && userSuggestions.length > 0 && activeField === 'productOwner' && (
                        <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-dark-teritary border rounded shadow max-h-40 overflow-auto">
                            {userSuggestions.map((user) => (
                                <li
                                key={user.id}
                                onClick={() => handleSelectProductOwner(user)}
                            className="px-4 py-2 cursor-pointer dark:text-white hover:bg-gray-100 dark:hover:bg-dark-secondary"
                            >
                                {user.username}
                            </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
            <div className='space-y-2'>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>Team Project Manager</label>
                <div className='relative'>
                    <input
                      type="text"
                      className={inputStyles}
                      placeholder='Project Manager Username'
                      value={projectManagerInput}
                      onChange={handleProjectManagerInputChange}
                    />
                    {searchQuery && userSuggestions.length > 0 && activeField === 'projectManager' && (
                        <ul className='absolute z-10 w-full mt-1 bg-white dark:bg-dark-teritary border rounded shadow max-h-40 overflow-auto'>
                            {userSuggestions.map((user) => (
                                <li 
                                  className='px-4 py-2 cursor-pointer dark:text-white hover:bg-gray-100 dark:hover:bg-dark-secondary'
                                  key={user.id}
                                  onClick={() => handleSelectProjectManager(user)}  
                                >
                                    {user.username}
                                </li>
                            ))}
                        </ul> 
                    )}
                </div>
            </div>
        </div>
        <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Team Members
              </label>
              <div className="flex gap-2">
                <div className='flex-1 relative'>
                    <input
                      type="text"
                      className={`${inputStyles} flex-1`}
                      placeholder="Enter username"
                      value={memberInput}
                      onChange={handleMemberInputChange}
                  />
                  {memberInput && userSuggestions.length > 0 && activeField === 'member' && (
                    <ul className='absolute z-10 w-full mt-1 bg-white dark:bg-dark-teritary border rounded shadow max-h-40 overflow-auto'>
                        {userSuggestions.map((user) => (
                            <li
                            key={user.id}
                            onClick={() => handleSelectUser(user.username)}
                            className='px-4 py-2 cursor-pointer dark:text-white hover:bg-gray-100 dark:hover:bg-dark-secondary'
                            >
                                {user.username}
                            </li>
                        ))}
                    </ul>
                  )}
                </div>
                  <button 
                      type="button"
                      onClick={addMember}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 transition-colors focus:ring-2 focus:ring-blue-500"
                      disabled={!memberInput.trim()}
                  >
                      Add
                  </button>
              </div>

              {members.length > 0 && (
                  <div className="space-y-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                          Added Members: ({members.length})
                      </p>
                      <div className="flex flex-wrap gap-2">
                          {members.map((member, index) => (
                              <span
                                  key={index}
                                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm border border-blue-200 dark:border-blue-700"
                              >
                                  <span className="font-medium">{member}</span>
                                  <button
                                      type="button"
                                      onClick={() => removeMember(member)}
                                      className="ml-1 hover:text-blue-800 dark:hover:text-red-400 transition-colors text-lg font-bold"
                                      title={`Remove ${member}`}
                                  >
                                      <X className='cursor-pointer'/>
                                  </button>
                              </span>
                          ))}
                      </div>
                  </div>
              )}
        </div>
        <button
            type='submit'
            className={`mt-4 flex w-full justify-center cursor-pointer rounded-md border border-transparent bg-blue-primary px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus-offset-2 ${
                !isFormValid() || isLoading ? "cursor-not-allowed opacity-50" : ""
            }`}
            disabled={!isFormValid() || isLoading}
        >
            {isLoading ? "Creating..." : "Create Team"}
        </button>
    </form>
  </Modal>
}

export default ModalNewTeam