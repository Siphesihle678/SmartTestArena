import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

interface Question {
  id: number;
  question_text: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
}

interface Exam {
  id: number;
  title: string;
  description: string;
  time_limit?: number;
}

interface PracticeResults {
  exam_id: number;
  score: number;
  total_questions: number;
  correct_answers: number;
  answers: Record<string, string>;
  time_taken: number;
}

interface EnhancedPracticeProps {
  exam: Exam;
  questions: Question[];
  onComplete: (results: PracticeResults) => void;
}

const EnhancedPractice: React.FC<EnhancedPracticeProps> = ({
  exam,
  questions,
  onComplete
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(exam.time_limit || 0);
  const [autoSave, setAutoSave] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<PracticeResults | null>(null);
  const navigate = useNavigate();

  // Timer functionality
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave) return;

    const saveInterval = setInterval(() => {
      localStorage.setItem('practice-progress', JSON.stringify({
        examId: exam.id,
        answers,
        currentQuestion,
        timeLeft
      }));
    }, 30000); // Save every 30 seconds

    return () => clearInterval(saveInterval);
  }, [answers, currentQuestion, timeLeft, exam.id, autoSave]);

  // Load saved progress on component mount
  useEffect(() => {
    const savedProgress = localStorage.getItem('practice-progress');
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress);
        if (progress.examId === exam.id) {
          setAnswers(progress.answers || {});
          setCurrentQuestion(progress.currentQuestion || 0);
          setTimeLeft(progress.timeLeft || exam.time_limit || 0);
        }
      } catch (error) {
        console.error('Error loading saved progress:', error);
      }
    }
  }, [exam.id, exam.time_limit]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    
    try {
      // Calculate results
      let correctAnswers = 0;
      const totalQuestions = questions.length;
      
      questions.forEach(question => {
        const userAnswer = answers[question.id];
        if (userAnswer === question.correct_answer) {
          correctAnswers++;
        }
      });
      
      const score = Math.round((correctAnswers / totalQuestions) * 100);
      const timeTaken = (exam.time_limit || 0) - timeLeft;
      
      const practiceResults: PracticeResults = {
        exam_id: exam.id,
        score,
        total_questions: totalQuestions,
        correct_answers: correctAnswers,
        answers,
        time_taken: timeTaken
      };
      
      // Submit results to backend
      await api.post('/attempts/', practiceResults);
      
      // Update analytics
      await api.post('/analytics/update', {
        user_id: 1, // Replace with actual user ID
        subject_id: 1, // Replace with actual subject ID
        score,
        topic: exam.title
      });
      
      setResults(practiceResults);
      setShowResults(true);
      onComplete(practiceResults);
      
      // Clear saved progress
      localStorage.removeItem('practice-progress');
      
    } catch (error) {
      console.error('Error submitting results:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [answers, questions, exam.id, exam.time_limit, timeLeft, onComplete]);

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleQuestionNav = (index: number) => {
    setCurrentQuestion(index);
  };

  if (showResults && results) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-center mb-8">Practice Results</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">{results.score}%</div>
                <div className="text-gray-600">Final Score</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600">{results.correct_answers}/{results.total_questions}</div>
                <div className="text-gray-600">Correct Answers</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600">{formatTime(results.time_taken)}</div>
                <div className="text-gray-600">Time Taken</div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold mb-4">Question Review</h3>
              {questions.map((question, index) => {
                const userAnswer = answers[question.id];
                const isCorrect = userAnswer === question.correct_answer;
                
                return (
                  <div key={question.id} className={`p-4 rounded-lg border ${
                    isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Question {index + 1}</span>
                      <span className={`px-2 py-1 rounded text-sm ${
                        isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>
                    <p className="mb-3">{question.question_text}</p>
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className={`p-2 rounded ${
                          option === question.correct_answer ? 'bg-green-100 border-green-300' :
                          option === userAnswer && !isCorrect ? 'bg-red-100 border-red-300' :
                          'bg-gray-100'
                        }`}>
                          {option}
                          {option === question.correct_answer && (
                            <span className="ml-2 text-green-600 font-medium">✓ Correct</span>
                          )}
                          {option === userAnswer && !isCorrect && (
                            <span className="ml-2 text-red-600 font-medium">✗ Your Answer</span>
                          )}
                        </div>
                      ))}
                    </div>
                    {question.explanation && (
                      <div className="mt-3 p-3 bg-blue-50 rounded">
                        <p className="text-sm text-blue-800">
                          <strong>Explanation:</strong> {question.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex justify-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Practice Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{exam.title}</h1>
              <p className="text-gray-600">{exam.description}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-red-600">{formatTime(timeLeft)}</div>
              <div className="text-sm text-gray-600">Time Remaining</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-lg p-6">
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{currentQuestion + 1} of {questions.length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question */}
              {questions[currentQuestion] && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">
                    Question {currentQuestion + 1} of {questions.length}
                  </h2>
                  <p className="text-lg mb-6">{questions[currentQuestion].question_text}</p>

                  {/* Options */}
                  <div className="space-y-3">
                    {questions[currentQuestion].options.map((option, index) => (
                      <label
                        key={index}
                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                          answers[questions[currentQuestion].id] === option
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${questions[currentQuestion].id}`}
                          value={option}
                          checked={answers[questions[currentQuestion].id] === option}
                          onChange={(e) => handleAnswerChange(questions[currentQuestion].id, e.target.value)}
                          className="mr-3"
                        />
                        <span className="text-gray-900">{option}</span>
                      </label>
                    ))}
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between mt-8">
                    <button
                      onClick={handlePrevious}
                      disabled={currentQuestion === 0}
                      className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    {currentQuestion === questions.length - 1 ? (
                      <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Exam'}
                      </button>
                    ) : (
                      <button
                        onClick={handleNext}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Next
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Question Navigation</h3>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuestionNav(index)}
                    className={`p-2 rounded text-sm font-medium transition-colors ${
                      currentQuestion === index
                        ? 'bg-blue-600 text-white'
                        : answers[questions[index]?.id]
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <div className="mt-6">
                <h4 className="font-medium mb-2">Legend</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-600 rounded mr-2"></div>
                    <span>Current</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-100 rounded mr-2"></div>
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-gray-100 rounded mr-2"></div>
                    <span>Unanswered</span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={autoSave}
                    onChange={(e) => setAutoSave(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">Auto-save progress</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedPractice; 