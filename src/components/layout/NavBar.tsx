import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ClipboardCheck, BarChart, Book, HelpCircle, LogOut } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';

export function NavBar() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  
  // Don't show navbar during test
  if (location.pathname === '/test' || location.pathname === '/' || location.pathname.startsWith('/auth')) {
    return null;
  }
  
  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };
  
  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <ClipboardCheck className="h-8 w-8 text-indigo-900" />
            <span className="text-xl font-bold text-indigo-900">EduTest Pro</span>
          </Link>
          
          <nav className="flex items-center space-x-4">
            <Link
              to="/dashboard"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === '/dashboard' 
                  ? 'bg-indigo-100 text-indigo-900' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/app/results"
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                location.pathname === '/app/results' 
                  ? 'bg-indigo-100 text-indigo-900' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <BarChart className="h-4 w-4 mr-1" />
              Results
            </Link>
            <Link
              to="/app/manual"
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                location.pathname === '/app/manual' 
                  ? 'bg-indigo-100 text-indigo-900' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Book className="h-4 w-4 mr-1" />
              Manual
            </Link>
            <Link
              to="/app/faq"
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                location.pathname === '/app/faq' 
                  ? 'bg-indigo-100 text-indigo-900' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <HelpCircle className="h-4 w-4 mr-1" />
              FAQ
            </Link>
            
            {user && (
              <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-200">
                <span className="text-sm text-gray-600">
                  {user.user_metadata?.full_name || user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}