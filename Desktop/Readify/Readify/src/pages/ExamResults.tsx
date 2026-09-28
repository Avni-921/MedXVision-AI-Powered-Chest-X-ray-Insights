import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Award, CheckCircle2, XCircle, ArrowLeft, Clock, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import API from '@/api/axios';
import { motion } from 'framer-motion';

interface ExamResult {
  _id: string;
  score: number;
  total_questions: number;
  percentage: number;
  answers: { questionIndex: number; selectedAnswer: number; isCorrect: boolean }[];
  createdAt: string;
  exam: {
    _id: string;
    title: string;
    questions: { question: string; options: string[]; correctAnswer: number }[];
    course: { _id: string; title: string };
  };
}

export function ExamResults() {
  const { resultId } = useParams();
  const [result, setResult] = useState<ExamResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResult();
  }, [resultId]);

  const fetchResult = async () => {
    try {
      const { data } = await API.get(`/results/${resultId}`);
      setResult(data);
    } catch (error) {
      console.error('Error fetching result:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Result not found</p>
      </div>
    );
  }

  const isPassing = result.percentage >= 70;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <Link to="/dashboard" className="inline-flex items-center text-slate-500 hover:text-slate-900 mb-6 text-sm">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Link>

        {/* Score Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className={`mb-8 border-2 ${isPassing ? 'border-emerald-200' : 'border-orange-200'}`}>
            <CardContent className="p-8 text-center">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${isPassing ? 'bg-emerald-100' : 'bg-orange-100'}`}>
                {isPassing ? (
                  <Award className="w-10 h-10 text-emerald-600" />
                ) : (
                  <Target className="w-10 h-10 text-orange-500" />
                )}
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">{result.exam?.title}</h1>
              <p className="text-slate-500 mb-6">{result.exam?.course?.title}</p>

              <div className={`text-6xl font-bold mb-2 ${isPassing ? 'text-emerald-600' : 'text-orange-500'}`}>
                {result.percentage}%
              </div>
              <p className="text-slate-500 mb-4">
                {result.score} out of {result.total_questions} correct
              </p>

              <Badge className={`text-sm px-4 py-1 ${isPassing ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                {isPassing ? '✓ Passed' : '✗ Needs Improvement'}
              </Badge>

              <p className="text-xs text-slate-400 mt-4">
                Completed on {new Date(result.createdAt).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Answer Review */}
        <h2 className="text-xl font-bold text-slate-900 mb-4">Answer Review</h2>
        <div className="space-y-4">
          {result.exam?.questions?.map((question, idx) => {
            const answer = result.answers.find(a => a.questionIndex === idx);
            const isCorrect = answer?.isCorrect;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className={`border-l-4 ${isCorrect ? 'border-l-emerald-500' : 'border-l-red-400'}`}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3 mb-4">
                      {isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="text-xs text-slate-400 font-medium">Question {idx + 1}</span>
                        <h3 className="font-medium text-slate-900">{question.question}</h3>
                      </div>
                    </div>

                    <div className="space-y-2 ml-8">
                      {question.options.map((option, oIdx) => {
                        const isSelected = answer?.selectedAnswer === oIdx;
                        const isCorrectOption = question.correctAnswer === oIdx;

                        let className = 'p-3 rounded-lg border text-sm ';
                        if (isCorrectOption) {
                          className += 'bg-emerald-50 border-emerald-300 text-emerald-800';
                        } else if (isSelected && !isCorrect) {
                          className += 'bg-red-50 border-red-300 text-red-800';
                        } else {
                          className += 'bg-white border-slate-200 text-slate-600';
                        }

                        return (
                          <div key={oIdx} className={className}>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs w-5">{String.fromCharCode(65 + oIdx)}</span>
                              <span>{option}</span>
                              {isCorrectOption && <CheckCircle2 className="w-4 h-4 text-emerald-600 ml-auto" />}
                              {isSelected && !isCorrectOption && <XCircle className="w-4 h-4 text-red-500 ml-auto" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-4 mt-8">
          <Link to="/dashboard" className="flex-1">
            <Button variant="outline" className="w-full">Back to Dashboard</Button>
          </Link>
          {result.exam?.course?._id && (
            <Link to={`/courses/${result.exam.course._id}`} className="flex-1">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">View Course</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
