import Modal from '@/components/Modal';
import { useCreateTeamsMutation, useSearchUsersQuery } from '@/state/api';
import { debounce } from 'lodash';
import { X } from 'lucide-react';
import React, { useState } from 'react'

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
    const [projectManager, setProjectManager] = useState<string>("");
    const [members, setMembers] = useState<string[]>([]);
    const [memberInput, setMemberInput] = useState<string>("");

    const debounceSearch = debounce((value: string) => {
        setSearchQuery(value);
    }, 300);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setMemberInput(value);
        debounceSearch(value);
    };

    const handleSelectUser = (username: string) => {
        if (!members.includes(username)) {
            setMembers([...members, username]);
        }
        setMemberInput("");
        setSearchQuery("");
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
        onClose();
    };

    const isFormValid = () => {
        return teamName && productOwner;
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
                <input
                    type="number"
                    className={inputStyles}
                    placeholder='Project Owner ID'
                    value={productOwner}
                    onChange={(e) => setProductOwner(e.target.value)}
                />
            </div>
            <div className='space-y-2'>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>Team Project Manager</label>
                <input
                    type="number"
                    className={inputStyles}
                    placeholder='Project Manager ID'
                    value={projectManager}
                    onChange={(e) => setProjectManager(e.target.value)}
                />
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
                      onChange={handleInputChange}
                    //   onKeyPress={handleMemberKeyPress}
                  />
                  {memberInput && userSuggestions.length > 0 && (
                    <ul className='absolute z-10 w-full mt-1 bg-white dark:bg-dark-teritary border rounded shadow max-h-40 overflow-auto'>
                        {userSuggestions.map((user) => (
                            <li
                            key={user.id}
                            onClick={() => handleSelectUser(user.username)}
                            className='px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-secondary'
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