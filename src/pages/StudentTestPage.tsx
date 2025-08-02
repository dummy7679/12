import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, User, BookOpen, AlertCircle, Play } from 'lucide-react';
import { useTestStore } from '../store/testStore';
import { TestPage } from './TestPage';

export function StudentTestPage() {
  const { testCode } = useParams();
  const navigate = useNavigate();
  const { savedTests, startTest } = useTestStore();
  
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [testStarted, setTestStarted] = useState(false);
  const [error, setError] = useState('');
  
  // Find test by code (using test ID as code for now)
  const test = savedTests.find(t => t.id === testCode);
  
  useEffect(() => {
    if (!testCode) {
      navigate('/');
      return;
    }
    
    if (!test) {
      setError('Invalid test code. Please check the code and try again.');
    }
  }, [testCode, test, navigate]);
  
  const handleStartTest = () => {
    if (!studentName.trim()) {
      setError('Please enter your name');
      return;
    }
    
    if (!studentId.trim()) {
      setError('Please enter your student ID');
      return;
    }
    
    // Store student info
    localStorage.setItem('currentStudent', JSON.stringify({
      name: studentName,
      id: studentId,
      testCode
    }));
    
    startTest(test!.id);
    setTestStarted(true);
  };
  
  if (testStarted) {
    return <TestPage />;
  }
  
  if (!test) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Test Not Found</h1>
          <p className="text-gray-600 mb-6">
            {error || 'The test code you entered is invalid or the test is no longer available.'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="h-12 w-12" />
          </div>
          <h1 className="text-2xl font-bold text-center">{test.settings.title}</h1>
          {test.settings.description && (
            <p className="text-indigo-100 text-center mt-2">{test.settings.description}</p>
          )}
        </div>
        
        {/* Test Info */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center text-gray-600">
              <BookOpen className="h-5 w-5 mr-2 text-indigo-600" />
              <span>{test.questions.length} Questions</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Clock className="h-5 w-5 mr-2 text-indigo-600" />
              <span>{test.settings.duration} Minutes</span>
            </div>
          </div>
        </div>
        
        {/* Student Info Form */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Student Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter your full name"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student ID
              </label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your student ID"
              />
            </div>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
          
          <div className="mt-6">
            <button
              onClick={handleStartTest}
              className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
            >
              <Play className="h-5 w-5 mr-2" />
              Start Test
            </button>
          </div>
        </div>
        
        {/* Important Notes */}
        <div className="bg-amber-50 p-6">
          <h3 className="text-sm font-semibold text-amber-800 mb-2">Important Notes:</h3>
          <ul className="text-sm text-amber-700 space-y-1">
            <li>• Make sure you have a stable internet connection</li>
            <li>• Do not refresh the page during the test</li>
            <li>• The test will be submitted automatically when time runs out</li>
            <li>• You cannot pause or restart the test once started</li>
          </ul>
        </div>
      </div>
    </div>
  );
}