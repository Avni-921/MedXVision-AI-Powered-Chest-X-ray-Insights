import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import API from '@/api/axios';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface Question {
  _id: string;
  question: string;
  options: string[];
}

interface Exam {
  _id: string;
  title: string;
  description: string;
  time_limit_minutes: number;
  questions: Question[];
  course: string;
}

export function ExamAttempt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [started, setStarted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasSubmittedRef = useRef(false);

  useEffect(() => {
    fetchExam();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [id]);

  const fetchExam = async () => {
    try {
      const { data } = await API.get(`/exams/${id}`);
      setExam(data);
      setTimeLeft(data.time_limit_minutes * 60);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load exam');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (hasSubmittedRef.current || !exam) return;
    hasSubmittedRef.current = true;
    setSubmitting(true);

    if (timerRef.current) clearInterval(timerRef.current);

    const submittedAnswers = exam.questions.map((_, idx) => ({
      questionIndex: idx,
      selectedAnswer: answers[idx] ?? -1,
    }));

    try {
      const { data } = await API.post(`/exams/${id}/submit`, { answers: submittedAnswers });
      toast.success('Exam submitted successfully!');
      navigate(`/exams/${id}/results/${data._id}`);
    } catch (error: any) {
      if (error.response?.data?.result) {
        toast.info('You already submitted this exam.');
        navigate(`/exams/${id}/results/${error.response.data.result._id}`);
      } else {
        toast.error(error.response?.data?.message || 'Failed to submit exam');
        hasSubmittedRef.current = false;
      }
    } finally {
      setSubmitting(false);
    }
  }, [exam, answers, id, navigate]);

  const startExam = () => {
    setStarted(true);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          // Auto-submit
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const selectAnswer = (questionIdx: number, optionIdx: number) => {
    setAnswers((prev) => ({ ...prev, [questionIdx]: optionIdx }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!exam) return null;

  // Pre-exam screen
  if (!started) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="max-w-lg w-full">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">{exam.title}</h1>
              <p className="text-slate-500 mb-6">{exam.description}</p>
              <div className="flex justify-center gap-6 mb-8 text-sm text-slate-600">
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {exam.time_limit_minutes} minutes</span>
                <span>{exam.questions.length} questions</span>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 text-left">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-700">
                    <p className="font-medium mb-1">Important</p>
                    <ul className="list-disc ml-4 space-y-1">
                      <li>You cannot pause the timer once started</li>
                      <li>Exam auto-submits when time runs out</li>
                      <li>You can only attempt this exam once</li>
                    </ul>
                  </div>
                </div>
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-lg h-12" onClick={startExam}>
                Start Exam
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const question = exam.questions[currentQuestion];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Timer Bar */}
      <div className={`sticky top-0 z-50 ${timeLeft <= 60 ? 'bg-red-600' : 'bg-slate-900'} text-white transition-colors`}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h2 className="font-bold truncate">{exam.title}</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm">{answeredCount}/{exam.questions.length} answered</span>
            <Badge className={`text-lg font-mono px-3 py-1 ${timeLeft <= 60 ? 'bg-red-700' : 'bg-slate-700'}`}>
              <Clock className="w-4 h-4 mr-1" /> {formatTime(timeLeft)}
            </Badge>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-slate-700">
          <div
            className="h-full bg-blue-500 transition-all"
            style={{ width: `${(answeredCount / exam.questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Question Navigator */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-bold text-sm text-slate-600 mb-3">Questions</h3>
                <div className="grid grid-cols-5 lg:grid-cols-3 gap-2">
                  {exam.questions.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentQuestion(idx)}
                      className={`w-full aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                        idx === currentQuestion
                          ? 'bg-blue-600 text-white'
                          : answers[idx] !== undefined
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Question */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <motion.div key={currentQuestion} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <Badge variant="outline">Question {currentQuestion + 1} of {exam.questions.length}</Badge>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mb-6">{question.question}</h2>

                  <div className="space-y-3">
                    {question.options.map((option, oIdx) => (
                      <button
                        key={oIdx}
                        onClick={() => selectAnswer(currentQuestion, oIdx)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          answers[currentQuestion] === oIdx
                            ? 'border-blue-500 bg-blue-50 text-blue-900'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                            answers[currentQuestion] === oIdx
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-200 text-slate-500'
                          }`}>
                            {String.fromCharCode(65 + oIdx)}
                          </div>
                          <span className="font-medium">{option}</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between mt-8 pt-6 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                      disabled={currentQuestion === 0}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                    </Button>

                    {currentQuestion < exam.questions.length - 1 ? (
                      <Button onClick={() => setCurrentQuestion(currentQuestion + 1)} className="bg-blue-600 hover:bg-blue-700">
                        Next <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        {submitting ? 'Submitting...' : 'Submit Exam'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
