import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, icon, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {icon}
          </div>
        )}
        <input
          className={`w-full bg-spotify-light border border-transparent focus:border-spotify-green focus:ring-1 focus:ring-spotify-green rounded-md py-3 text-white placeholder-gray-500 transition-colors ${icon ? 'pl-10' : 'pl-4'} pr-4 ${className}`}
          {...props}
        />
      </div>
    </div>
  );
};