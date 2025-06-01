import React from 'react';
import { Question } from '../../../types';
import { Check, X } from 'lucide-react';

interface TrueFalseQuestionProps {
  question: Question;
  onAnswer: (answer: boolean) => void;
  selectedAnswer?: boolean;
  showCorrect?: boolean;
}

export function TrueFalseQuestion({
  question,
  onAnswer,
  selectedAnswer,
  showCorrect
}: TrueFalseQuestionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-start">
        <div className="flex-1">
          <p className="text-lg text-gray-900">{question.text}</p>
          {question.latex && (
            <div className="mt-2 bg-gray-50 p-3 rounded-lg">
              <MathRenderer latex={question.latex} />
            </div>
          )}
        </div>
        {showCorrect && (
          <div className={`ml-4 p-2 rounded-full ${
            question.correctAnswer ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {question.correctAnswer ? (
              <Check className="h-5 w-5 text-green-600" />
            ) : (
              <X className="h-5 w-5 text-red-600" />
            )}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {[true, false].map((value) => (
          <button
            key={value.toString()}
            onClick={() => onAnswer(value)}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedAnswer === value
                ? value === question.correctAnswer && showCorrect
                  ? 'border-green-500 bg-green-50'
                  : value !== question.correctAnswer && showCorrect
                  ? 'border-red-500 bg-red-50'
                  : 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 hover:border-indigo-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center">
              <span className="text-lg font-medium">
                {value ? 'True' : 'False'}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}