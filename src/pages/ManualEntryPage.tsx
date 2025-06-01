import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Image as ImageIcon, AlertCircle, Save, FunctionSquare as Function, Search, X, Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { useTestStore } from '../store/testStore';
import { Question, QuestionOption } from '../types';
import { MathRenderer } from '../components/MathRenderer';
import { LatexHelper } from '../components/LatexHelper';
import { v4 as uuidv4 } from 'uuid';

export function ManualEntryPage() {
  const navigate = useNavigate();
  const { addQuestion } = useTestStore();
  const [bulkText, setBulkText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<Question[]>([]);
  const [showLatexHelper, setShowLatexHelper] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'editor': true,
    'images': false,
    'preview': false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setImages(prev => ({
          ...prev,
          [file.name]: base64
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (fileName: string) => {
    setImages(prev => {
      const newImages = { ...prev };
      delete newImages[fileName];
      return newImages;
    });
  };

  const parseQuestions = (text: string): Question[] => {
    const questions: Question[] = [];
    const questionBlocks = text.split(/(?=Q\d+\.)/);

    for (const block of questionBlocks) {
      if (!block.trim()) continue;

      const lines = block.split('\n').map(line => line.trim());
      const questionMatch = lines[0].match(/Q\d+\.\s+(.*)/);
      if (!questionMatch) continue;

      let questionText = questionMatch[1];
      let questionLatex = null;
      const imageMatch = questionText.match(/\[image:\s*([^\]]+)\]/);
      const latexMatch = questionText.match(/\[latex:\s*([^\]]+)\]/);
      let imagePath = null;

      if (imageMatch) {
        const imageKey = imageMatch[1].trim();
        if (images[imageKey]) {
          imagePath = images[imageKey];
          questionText = questionText.replace(imageMatch[0], '').trim();
        }
      }

      if (latexMatch) {
        questionLatex = latexMatch[1].trim();
        questionText = questionText.replace(latexMatch[0], '').trim();
      }

      const options: QuestionOption[] = [];
      let correctOptionIndex = -1;

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const optionMatch = line.match(/([A-D])\.\s+(.*)/);
        const answerMatch = line.match(/Answer:\s+([A-D])/);

        if (optionMatch) {
          const optionText = optionMatch[2];
          const optionLatexMatch = optionText.match(/\[latex:\s*([^\]]+)\]/);
          
          options.push({
            id: uuidv4(),
            text: optionLatexMatch ? optionText.replace(optionLatexMatch[0], '').trim() : optionText,
            latex: optionLatexMatch ? optionLatexMatch[1].trim() : undefined
          });
        } else if (answerMatch) {
          correctOptionIndex = answerMatch[1].charCodeAt(0) - 'A'.charCodeAt(0);
        }
      }

      if (options.length === 4 && correctOptionIndex >= 0) {
        questions.push({
          id: uuidv4(),
          text: questionText,
          latex: questionLatex || undefined,
          options,
          correctOptionIndex,
          imagePath
        });
      }
    }

    return questions;
  };

  const handlePreview = () => {
    try {
      const parsedQuestions = parseQuestions(bulkText);
      setPreview(parsedQuestions);
      setError(null);
      toggleSection('preview');
    } catch (error) {
      setError('Failed to parse questions. Please check the format.');
    }
  };

  const handleSubmit = () => {
    try {
      const questions = preview.length > 0 ? preview : parseQuestions(bulkText);
      
      if (questions.length === 0) {
        setError('No valid questions found. Please check the format.');
        return;
      }

      questions.forEach(question => {
        addQuestion(question);
      });

      navigate('/preview');
    } catch (error) {
      setError('Failed to parse questions. Please check the format.');
    }
  };

  const insertLatexTemplate = (latex: string) => {
    if (!textareaRef.current || cursorPosition === null) return;

    const text = bulkText;
    const newText = text.slice(0, cursorPosition) + `[latex: ${latex}]` + text.slice(cursorPosition);
    setBulkText(newText);

    setTimeout(() => {
      if (textareaRef.current) {
        const newPosition = cursorPosition + latex.length + 8;
        textareaRef.current.selectionStart = newPosition;
        textareaRef.current.selectionEnd = newPosition;
        textareaRef.current.focus();
      }
    }, 0);
  };

  const handleTextareaSelect = () => {
    if (textareaRef.current) {
      setCursorPosition(textareaRef.current.selectionStart);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Questions</h1>
            <p className="mt-2 text-gray-600">
              Enter questions with support for LaTeX equations and images
            </p>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={handlePreview}
              className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg flex items-center hover:bg-indigo-100 transition-all"
            >
              <Function className="h-5 w-5 mr-2" />
              Preview
            </button>
            
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center hover:bg-indigo-700 transition-all"
            >
              <Save className="h-5 w-5 mr-2" />
              Save Questions
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {/* Editor Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <button
                onClick={() => toggleSection('editor')}
                className="w-full px-6 py-4 flex items-center justify-between text-left border-b border-gray-200"
              >
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-indigo-600 mr-2" />
                  <span className="font-medium text-gray-900">Question Editor</span>
                </div>
                {expandedSections.editor ? (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                )}
              </button>
              
              {expandedSections.editor && (
                <div className="p-6">
                  <div className="mb-4">
                    <button
                      onClick={() => setShowLatexHelper(!showLatexHelper)}
                      className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
                    >
                      {showLatexHelper ? 'Hide LaTeX Helper' : 'Show LaTeX Helper'}
                      {showLatexHelper ? (
                        <ChevronDown className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronRight className="h-4 w-4 ml-1" />
                      )}
                    </button>

                    {showLatexHelper && (
                      <div className="mt-4">
                        <LatexHelper onInsert={insertLatexTemplate} />
                      </div>
                    )}
                  </div>

                  <textarea
                    ref={textareaRef}
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    onSelect={handleTextareaSelect}
                    className="w-full h-[400px] px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm resize-none"
                    placeholder={`Q1. Calculate the area: [latex: A = \\pi r^2]
[image: circle.png]
A. [latex: 12\\pi]
B. [latex: 16\\pi]
C. [latex: 20\\pi]
D. [latex: 25\\pi]
Answer: B`}
                  />

                  {error && (
                    <div className="mt-4 flex items-center bg-red-50 text-red-700 p-4 rounded-lg">
                      <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                      <p>{error}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Image Upload Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <button
                onClick={() => toggleSection('images')}
                className="w-full px-6 py-4 flex items-center justify-between text-left border-b border-gray-200"
              >
                <div className="flex items-center">
                  <ImageIcon className="h-5 w-5 text-indigo-600 mr-2" />
                  <span className="font-medium text-gray-900">Images</span>
                  {Object.keys(images).length > 0 && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-indigo-100 text-indigo-600 rounded-full">
                      {Object.keys(images).length}
                    </span>
                  )}
                </div>
                {expandedSections.images ? (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                )}
              </button>
              
              {expandedSections.images && (
                <div className="p-6">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-indigo-500 transition-colors"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <div className="flex flex-col items-center">
                      <Plus className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm font-medium text-gray-900">Upload Images</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Click or drag and drop
                      </p>
                    </div>
                  </div>

                  {Object.keys(images).length > 0 && (
                    <div className="mt-6 grid grid-cols-2 gap-4">
                      {Object.entries(images).map(([name, src]) => (
                        <div key={name} className="relative group">
                          <img
                            src={src}
                            alt={name}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeImage(name);
                              }}
                              className="p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <p className="mt-1 text-sm text-gray-600 truncate">{name}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Preview Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <button
              onClick={() => toggleSection('preview')}
              className="w-full px-6 py-4 flex items-center justify-between text-left border-b border-gray-200"
            >
              <div className="flex items-center">
                <Search className="h-5 w-5 text-indigo-600 mr-2" />
                <span className="font-medium text-gray-900">Preview</span>
                {preview.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-indigo-100 text-indigo-600 rounded-full">
                    {preview.length} questions
                  </span>
                )}
              </div>
              {expandedSections.preview ? (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-400" />
              )}
            </button>
            
            {expandedSections.preview && (
              <div className="p-6">
                {preview.length === 0 ? (
                  <div className="text-center py-12">
                    <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      Click the Preview button to see your questions here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {preview.map((question, index) => (
                      <div
                        key={question.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-medium text-gray-900">
                            Question {index + 1}
                          </h3>
                        </div>

                        <div className="space-y-3">
                          <p className="text-gray-800">{question.text}</p>
                          
                          {question.latex && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <MathRenderer latex={question.latex} />
                            </div>
                          )}

                          {question.imagePath && (
                            <img
                              src={question.imagePath}
                              alt={`Question ${index + 1}`}
                              className="max-h-48 rounded-lg border border-gray-200"
                            />
                          )}

                          <div className="space-y-2 mt-4">
                            {question.options.map((option, optIndex) => (
                              <div
                                key={option.id}
                                className={`p-3 rounded-lg flex items-center ${
                                  optIndex === question.correctOptionIndex
                                    ? 'bg-green-50 border border-green-200'
                                    : 'bg-gray-50 border border-gray-200'
                                }`}
                              >
                                <span className="w-6 font-medium text-gray-700">
                                  {String.fromCharCode(65 + optIndex)}.
                                </span>
                                <span className="flex-1">{option.text}</span>
                                {option.latex && (
                                  <div className="ml-2">
                                    <MathRenderer latex={option.latex} />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Format Guide</h2>
          <div className="prose prose-indigo max-w-none">
            <pre className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm overflow-x-auto">
{`Q1. Your question text here [latex: \\frac{x}{2} = 5]
[image: filename.png]  (optional)
A. First option [latex: x = 10]
B. Second option
C. Third option [latex: x = 8]
D. Fourth option
Answer: A`}
            </pre>
            <ul className="mt-4 space-y-2">
              <li className="flex items-center text-gray-700">
                <span className="w-2 h-2 bg-indigo-400 rounded-full mr-2"></span>
                Start each question with "Q\" followed by a number
              </li>
              <li className="flex items-center text-gray-700">
                <span className="w-2 h-2 bg-indigo-400 rounded-full mr-2"></span>
                Use [latex: ...] for mathematical equations
              </li>
              <li className="flex items-center text-gray-700">
                <span className="w-2 h-2 bg-indigo-400 rounded-full mr-2"></span>
                Include exactly 4 options labeled A through D
              </li>
              <li className="flex items-center text-gray-700">
                <span className="w-2 h-2 bg-indigo-400 rounded-full mr-2"></span>
                Specify the correct answer with "Answer: X"
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}