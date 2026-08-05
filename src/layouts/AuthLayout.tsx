// src/layouts/AuthLayout.tsx
import React from 'react';
import type { ReactNode } from 'react';

import { FaChurch, FaSpinner } from 'react-icons/fa';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  isLoading?: boolean;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children, 
  title, 
  subtitle, 
  isLoading = false 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-primary-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-church-gold p-3 rounded-2xl shadow-lg">
            <FaChurch className="text-4xl text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-serif font-bold text-gray-900 dark:text-white">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {subtitle}
          </p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-xl rounded-2xl sm:px-10 border border-gray-200 dark:border-gray-700">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <FaSpinner className="animate-spin text-4xl text-primary-600" />
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;