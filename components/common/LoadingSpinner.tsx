import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  submessage?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  message,
  submessage 
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-16 w-16',
    lg: 'h-24 w-24'
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`animate-spin rounded-full border-t-4 border-b-4 border-blue-600 ${sizeClasses[size]} mb-6`}></div>
      {message && <h2 className="text-2xl font-bold text-slate-700">{message}</h2>}
      {submessage && <p className="text-slate-500 mt-2">{submessage}</p>}
    </div>
  );
};
