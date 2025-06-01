import React from 'react';
import { Section } from '../../types';
import { Clock, AlertCircle } from 'lucide-react';

interface SectionDividerProps {
  section: Section;
  currentTime: number;
  onContinue: () => void;
}

export function SectionDivider({ section, currentTime, onContinue }: SectionDividerProps) {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-lg w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.title}</h2>
        
        {section.description && (
          <p className="text-gray-600 mb-6">{section.description}</p>
        )}
        
        <div className="bg-indigo-50 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-indigo-600 mr-2" />
            <span className="font-medium text-indigo-900">
              Time Limit: {section.timeLimit} minutes
            </span>
          </div>
          <div className="mt-2 text-sm text-indigo-700">
            {section.questions.length} questions in this section
          </div>
        </div>
        
        {section.shuffleQuestions && (
          <div className="flex items-start mb-6">
            <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
            <p className="text-sm text-amber-700">
              Questions in this section will be presented in random order.
            </p>
          </div>
        )}
        
        <button
          onClick={onContinue}
          className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          Begin Section
        </button>
      </div>
    </div>
  );
}