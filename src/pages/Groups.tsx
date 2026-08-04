// src/pages/Groups.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaSearch, FaPlus, FaUsers, FaUserGraduate,
  FaEye, FaEdit, FaTrash, FaGlobe
} from 'react-icons/fa';
import { useAuth } from '../auth/context/AuthContext';

interface Group {
  id: string;
  name: string;
  type: 'evangelist' | 'student';
  description: string;
  memberCount: number;
  evangelistName?: string;
  createdAt: string;
  status: 'active' | 'inactive';
}

const Groups: React.FC = () => {
  const { user, userRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  const groups: Group[] = [
    { 
      id: '1', 
      name: 'Gospel Team Africa', 
      type: 'evangelist', 
      description: 'Evangelists spreading the Gospel across Africa',
      memberCount: 15,
      evangelistName: 'Pastor John Doe',
      createdAt: '2026-01-10',
      status: 'active'
    },
    { 
      id: '2', 
      name: 'Youth Discipleship', 
      type: 'student', 
      description: 'Young believers growing in faith together',
      memberCount: 45,
      evangelistName: 'Pastor Mary Smith',
      createdAt: '2026-01-12',
      status: 'active'
    },
    { 
      id: '3', 
      name: 'Women of Faith', 
      type: 'student', 
      description: 'Empowering women through God\'s word',
      memberCount: 38,
      evangelistName: 'Pastor Grace Mwangi',
      createdAt: '2026-01-15',
      status: 'active'
    },
    { 
      id: '4', 
      name: 'Online Evangelists', 
      type: 'evangelist', 
      description: 'Digital evangelism reaching the world',
      memberCount: 22,
      evangelistName: 'Pastor David Kim',
      createdAt: '2026-01-18',
      status: 'active'
    },
  ];

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || group.type === filter;
    return matchesSearch && matchesFilter;
  });

  const canCreateGroup = userRole === 'admin' || userRole === 'evangelist';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">Groups</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Connect and grow with your evangelism groups
          </p>
        </div>
        {canCreateGroup && (
          <Link to="/groups/create" className="btn-primary flex items-center space-x-2">
            <FaPlus />
            <span>Create Group</span>
          </Link>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search groups..."
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <select
            className="input-field"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Groups</option>
            <option value="evangelist">Evangelist Groups</option>
            <option value="student">Student Groups</option>
          </select>
        </div>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.map((group) => (
          <div key={group.id} className="card hover:shadow-card-hover transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-full ${
                  group.type === 'evangelist' 
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                    : 'bg-green-100 dark:bg-green-900/30 text-green-600'
                }`}>
                  {group.type === 'evangelist' ? <FaUsers className="text-xl" /> : <FaUserGraduate className="text-xl" />}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{group.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    group.type === 'evangelist' 
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  }`}>
                    {group.type === 'evangelist' ? 'Evangelist' : 'Student'} Group
                  </span>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                group.status === 'active' 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700/30 dark:text-gray-400'
              }`}>
                {group.status}
              </span>
            </div>

            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {group.description}
            </p>

            <div className="mt-4 flex items-center justify-between text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">{group.memberCount} members</span>
                {group.evangelistName && (
                  <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Led by: {group.evangelistName}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Created: {new Date(group.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <Link
                to={`/groups/${group.id}`}
                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium flex items-center space-x-1"
              >
                <FaEye className="text-xs" />
                <span>View Details</span>
              </Link>
              <div className="flex space-x-2">
                {userRole === 'admin' && (
                  <>
                    <button className="p-1 text-gray-500 hover:text-blue-600 transition-colors">
                      <FaEdit />
                    </button>
                    <button className="p-1 text-gray-500 hover:text-red-600 transition-colors">
                      <FaTrash />
                    </button>
                  </>
                )}
                <button className="p-1 text-gray-500 hover:text-primary-600 transition-colors">
                  <FaGlobe />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredGroups.length === 0 && (
        <div className="text-center py-12">
          <div className="flex justify-center mb-4">
            <FaUsers className="text-6xl text-gray-300 dark:text-gray-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Groups Found</h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm ? 'Try adjusting your search' : 'Start by creating a new group'}
          </p>
          {canCreateGroup && (
            <Link to="/groups/create" className="btn-primary inline-flex items-center space-x-2 mt-4">
              <FaPlus />
              <span>Create Your First Group</span>
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default Groups;