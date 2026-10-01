import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquareOff, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-center">
      <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
        <MessageSquareOff className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">
        404
      </h1>
      <p className="text-sm text-slate-400 mt-1 max-w-xs">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/chat"
        className="mt-6 inline-flex items-center space-x-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-brand-500/20 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Chat</span>
      </Link>
    </div>
  );
};

export default NotFoundPage;
