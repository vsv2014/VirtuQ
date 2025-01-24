import { useState } from 'react';
import { QuestionAnswer, Answer } from '../types';
import { motion } from 'framer-motion';

interface ProductQAProps {
  productId: string;
}

export function ProductQA({ productId }: ProductQAProps) {
  const [questions, setQuestions] = useState<QuestionAnswer[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!newQuestion.trim()) return;
    if (newQuestion.length < 10) {
      setError('Question must be at least 10 characters long');
      return;
    }

    try {
      setIsSubmitting(true);
      // In a real app, this would be an API call
      const newQuestionObj: QuestionAnswer = {
        id: Math.random().toString(36).substr(2, 9),
        questionText: newQuestion,
        askedBy: 'Anonymous User',
        askedDate: new Date().toISOString(),
        answers: [] as Answer[],
        productId,
        status: 'pending' as const
      };

      setQuestions(prev => [newQuestionObj, ...prev]);
      setNewQuestion('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit question');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpvote = (questionId: string, answerId: string) => {
    setQuestions(prevQuestions =>
      prevQuestions.map(q => {
        if (q.id === questionId) {
          return {
            ...q,
            answers: q.answers.map(a => 
              a.id === answerId 
                ? { ...a, upvotes: (a.upvotes || 0) + 1 }
                : a
            )
          };
        }
        return q;
      })
    );
  };

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-semibold mb-6">Questions & Answers</h3>
      
      {/* Question submission form */}
      <form onSubmit={handleSubmitQuestion} className="mb-8">
        <div className="flex flex-col space-y-2">
          <label htmlFor="question" className="font-medium">
            Ask a question about this product
          </label>
          <textarea
            id="question"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            className="border rounded-lg p-3 min-h-[100px] focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="What would you like to know about this product?"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting || !newQuestion.trim()}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 w-fit"
          >
            Submit Question
          </button>
        </div>
      </form>

      {/* Questions list */}
      <div className="space-y-6">
        {questions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No questions yet. Be the first to ask!
          </p>
        ) : (
          questions.map((question) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border rounded-lg p-4"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium">{question.questionText}</h4>
                <span className="text-sm text-gray-500">
                  {new Date(question.askedDate).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Asked by {question.askedBy}
              </p>

              {/* Answers */}
              <div className="ml-6 space-y-4">
                {question.answers.map((answer) => (
                  <div key={answer.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm">{answer.answerText}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-xs text-gray-500">
                            {answer.answeredBy}
                            {answer.isSeller && (
                              <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">
                                Seller
                              </span>
                            )}
                            {answer.isVerified && (
                              <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded">
                                Verified
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleUpvote(question.id, answer.id)}
                        className="flex items-center space-x-1 text-sm text-gray-500 hover:text-purple-600"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 15l7-7 7 7"
                          />
                        </svg>
                        <span>{answer.upvotes}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
