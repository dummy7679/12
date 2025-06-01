import React, { useState } from 'react';
import { Question } from '../../../types';
import { MathRenderer } from '../../MathRenderer';
import { Check, AlertCircle } from 'lucide-react';

interface FillInBlankQuestionProps {
  question: Question;
  onAnswer: (answers: string[]) => void;
  answers?: string[];
  showCorrect?: boolean;
}

export function FillInBlankQuestion({
  question,
  onAnswer,
  answers = [],
  showCorrect
}: FillInBlankQuestionProps) {
  const [currentAnswers, setCurrentAnswers] = useState<string[]>(answers);

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...currentAnswers];
    newAnswers[index] = value;
    setCurrentAnswers(newAnswers);
    onAnswer(newAnswers);
  };

  const isCorrect = (index: number) => {
    if (!question.blanks?.[index]) return false;
    const answer = currentAnswers[index]?.toLowerCase().trim();
    const correctAnswer = question.blanks[index].answer.toLowerCase();
    const alternatives = question.blanks[index].alternatives?.map(alt => alt.toLowerCase()) || [];
    return answer === correctAnswer || alternatives.includes(answer);
  };

  const parts = question.text.split(/(\[___\])/g);

  return (
    <div className="space-y-4">
      <div className="text-lg text-gray-900">
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            {part === '[___]' ? (
              <div className="inline-block relative">
                <input
                  type="text"
                  value={currentAnswers[Math.floor(index/2)] || ''}
                  onChange={(e) => handleAnswerChange(Math.floor(index/2), e.target.value)}
                  className={`mx-2 px-3 py-1 border rounded-md w-32 transition-colors ${
                    showCorrect
                      ? isCorrect(Math.floor(index/2))
                        ? 'border-green-500 bg-green-50'
                        : 'border-red-500 bg-red-50'
                      : 'border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                  }`}
                  placeholder="Answer"
                />
                {showCorrect && (
                  <div className="absolute -right-6 top-1/2 transform -translate-y-1/2">
                    {isCorrect(Math.floor(index/2)) ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                )}
              </div>
            ) : (
              <span>{part}</span>
            )}
          </React.Fragment>
        ))}
      </div>

      {question.latex && (
        <div className="mt-2 bg-gray-50 p-3 rounded-lg">
          <MathRenderer latex={question.latex} />
        </div>
      )}

      {showCorrect && (
        <div className="mt-6 space-y-4">
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-2">Correct Answers:</h4>
            <div className="space-y-2">
              {question.blanks?.map((blank, index) => (
                <div key={blank.id} className="flex items-center">
                  <span className="w-8 font-medium text-gray-600">#{index + 1}:</span>
                  <span className="text-green-700 font-medium">{blank.answer}</span>
                  {blank.alternatives && blank.alternatives.length > 0 && (
                    <span className="text-gray-500 ml-2">
                      (Also accepted: {blank.alternatives.join(', ')})
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}