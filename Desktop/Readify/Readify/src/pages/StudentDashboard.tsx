import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Award, TrendingUp, Play, FileText, ChevronRight, ClipboardList, Timer } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import API from '@/api/axios';
import { motion } from 'framer-motion';

interface Enrollment {
  _id: string;
  progress_percentage: number;
  last_accessed_at: string;
  course: {
    _id: string;
    title: string;
    thumbnail_url: string;
    instructor_name: string;
    duration_hours: number;
  };
}

interface ExamResult {
  _id: string;
  score: number;
  total_questions: number;
  percentage: number;
  createdAt: string;
  exam: {
    _id: string;
    title: string;
    course: { title: string };
  };
}

interface AvailableExam {
  _id: string;
  title: string;
  description: string;
  time_limit_minutes: number;
  questions: { question: string }[];
  courseTitle: string;
  courseId: string;
  isAttempted: boolean;
  resultId?: string;
}

export function StudentDashboard() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [availableExams, setAvailableExams] = useState<AvailableExam[]>([]);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    hoursLearned: 0,
    averageProgress: 0,
  });

  useEffect(() => {
    fetchEnrollments();
    fetchResults();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const { data } = await API.get('/courses/enrollments/my');
      setEnrollments(data);

      const totalCourses = data.length;
      const completedCourses = data.filter((e: Enrollment) => e.progress_percentage === 100).length;
      const totalProgress = data.reduce((sum: number, e: Enrollment) => sum + e.progress_percentage, 0);
      const averageProgress = totalCourses > 0 ? Math.round(totalProgress / totalCourses) : 0;
      const hoursLearned = data.reduce((sum: number, e: Enrollment) => {
        return sum + ((e.course?.duration_hours || 0) * e.progress_percentage) / 100;
      }, 0);

      setStats({ totalCourses, completedCourses, hoursLearned: Math.round(hoursLearned), averageProgress });

      // Fetch exams for all enrolled courses
      fetchAvailableExams(data);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async () => {
    try {
      const { data } = await API.get('/results/my');
      setResults(data);
    } catch {
      // No results yet
    }
  };

  const fetchAvailableExams = async (enrollmentData: Enrollment[]) => {
    const allExams: AvailableExam[] = [];
    for (const enrollment of enrollmentData) {
      try {
        const { data: exams } = await API.get(`/exams/course/${enrollment.course._id}`);
        for (const exam of exams) {
          allExams.push({
            ...exam,
            courseTitle: enrollment.course.title,
            courseId: enrollment.course._id,
            isAttempted: false,
          });
        }
      } catch {
        // No exams for this course
      }
    }

    // Check which exams have been attempted
    try {
      const { data: myResults } = await API.get('/results/my');
      for (const exam of allExams) {
        const result = myResults.find((r: any) => r.exam?._id === exam._id);
        if (result) {
          exam.isAttempted = true;
          exam.resultId = result._id;
        }
      }
    } catch {
      // ignore
    }

    setAvailableExams(allExams);
  };

  const statCards = [
    { icon: BookOpen, label: 'Enrolled Courses', value: stats.totalCourses, color: 'text-blue-600 bg-blue-100' },
    { icon: Award, label: 'Completed', value: stats.completedCourses, color: 'text-emerald-600 bg-emerald-100' },
    { icon: Clock, label: 'Hours Learned', value: stats.hoursLearned, color: 'text-orange-600 bg-orange-100' },
    { icon: TrendingUp, label: 'Avg Progress', value: `${stats.averageProgress}%`, color: 'text-violet-600 bg-violet-100' },
  ];

  const pendingExams = availableExams.filter(e => !e.isAttempted);
  const completedExams = availableExams.filter(e => e.isAttempted);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 font-serif">Welcome back, {user?.name}!</h1>
        <p className="text-slate-600 mt-2">Track your progress, take quizzes, and continue learning.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
            <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="courses" className="space-y-6">
        <TabsList className="bg-white border p-1 rounded-lg">
          <TabsTrigger value="courses" className="gap-2">
            <BookOpen className="w-4 h-4" /> My Courses
          </TabsTrigger>
          <TabsTrigger value="quizzes" className="gap-2">
            <ClipboardList className="w-4 h-4" /> Quizzes & Assignments
            {pendingExams.length > 0 && (
              <Badge className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 h-5">{pendingExams.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="results" className="gap-2">
            <Award className="w-4 h-4" /> My Results
          </TabsTrigger>
        </TabsList>

        {/* COURSES TAB */}
        <TabsContent value="courses">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Continue Learning</h2>
                <Link to="/courses" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Browse All Courses
                </Link>
              </div>

              <Card className="border-none shadow-sm">
                <CardContent className="p-0">
                  {enrollments.length === 0 ? (
                    <div className="text-center py-12 px-6">
                      <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="h-8 w-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">No courses yet</h3>
                      <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                        You haven't enrolled in any courses yet. Browse our catalog to get started.
                      </p>
                      <Link to="/courses">
                        <Button className="bg-blue-600 hover:bg-blue-700">Browse Courses</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {enrollments.map((enrollment) => (
                        <div key={enrollment._id} className="p-6 hover:bg-slate-50 transition-colors group">
                          <div className="flex gap-4">
                            <img
                              src={enrollment.course?.thumbnail_url}
                              alt={enrollment.course?.title}
                              className="w-32 h-20 object-cover rounded-lg shadow-sm"
                            />
                            <div className="flex-1 min-w-0 py-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                                    {enrollment.course?.title}
                                  </h4>
                                  <p className="text-sm text-slate-500">{enrollment.course?.instructor_name}</p>
                                </div>
                                <Link to={`/courses/${enrollment.course?._id}`}>
                                  <Button size="sm" variant="secondary" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Play className="h-4 w-4 mr-1" /> Resume
                                  </Button>
                                </Link>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${enrollment.progress_percentage}%` }} />
                                </div>
                                <span className="text-sm font-medium text-slate-600 w-12 text-right">
                                  {enrollment.progress_percentage}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* QUIZZES & ASSIGNMENTS TAB */}
        <TabsContent value="quizzes" className="space-y-6">
          {availableExams.length === 0 ? (
            <Card className="border-none shadow-sm">
              <CardContent className="p-12 text-center">
                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ClipboardList className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Quizzes Available</h3>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">
                  Enroll in courses to access quizzes and assignments. Your instructors will publish tests for you to take.
                </p>
                <Link to="/courses">
                  <Button className="bg-blue-600 hover:bg-blue-700">Browse Courses</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Pending Exams */}
              {pendingExams.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Timer className="w-5 h-5 text-orange-500" />
                    Pending ({pendingExams.length})
                  </h3>
                  <div className="space-y-3">
                    {pendingExams.map((exam, idx) => (
                      <motion.div key={exam._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                        <Card className="border-none shadow-sm hover:shadow-md transition-all border-l-4 border-l-orange-400">
                          <CardContent className="p-5">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline" className="text-xs capitalize bg-orange-50 text-orange-700 border-orange-200">
                                    {exam.title.toLowerCase().includes('assignment') ? 'Assignment' : 'Quiz'}
                                  </Badge>
                                  <span className="text-xs text-slate-400">{exam.courseTitle}</span>
                                </div>
                                <h4 className="font-semibold text-slate-900 mb-1">{exam.title}</h4>
                                <p className="text-sm text-slate-500 line-clamp-1">{exam.description}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {exam.time_limit_minutes} min</span>
                                  <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {exam.questions?.length || 0} questions</span>
                                </div>
                              </div>
                              <Link to={`/exams/${exam._id}/attempt`}>
                                <Button className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap">
                                  Start Now <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Completed Exams */}
              {completedExams.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-500" />
                    Completed ({completedExams.length})
                  </h3>
                  <div className="space-y-3">
                    {completedExams.map((exam, idx) => (
                      <motion.div key={exam._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                        <Card className="border-none shadow-sm border-l-4 border-l-emerald-400">
                          <CardContent className="p-5">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline" className="text-xs capitalize bg-emerald-50 text-emerald-700 border-emerald-200">
                                    {exam.title.toLowerCase().includes('assignment') ? 'Assignment' : 'Quiz'}
                                  </Badge>
                                  <span className="text-xs text-slate-400">{exam.courseTitle}</span>
                                </div>
                                <h4 className="font-semibold text-slate-900 mb-1">{exam.title}</h4>
                                <p className="text-sm text-slate-500 line-clamp-1">{exam.description}</p>
                              </div>
                              <Link to={`/exams/${exam._id}/results/${exam.resultId}`}>
                                <Button variant="outline" className="whitespace-nowrap text-emerald-700 border-emerald-200 hover:bg-emerald-50">
                                  View Results <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* RESULTS TAB */}
        <TabsContent value="results">
          {results.length > 0 ? (
            <div className="space-y-3">
              {results.map((result, idx) => (
                <motion.div key={result._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                  <Card className="border-none shadow-sm hover:shadow-md transition-all">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-slate-900">{result.exam?.title}</h4>
                          <p className="text-sm text-slate-500">{result.exam?.course?.title}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                            <span>{result.score}/{result.total_questions} correct</span>
                            <span>{new Date(result.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className={`text-2xl font-bold ${result.percentage >= 70 ? 'text-emerald-600' : result.percentage >= 50 ? 'text-orange-500' : 'text-red-500'}`}>
                            {result.percentage}%
                          </div>
                          <Badge className={`${result.percentage >= 70 ? 'bg-emerald-100 text-emerald-700' : result.percentage >= 50 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                            {result.percentage >= 70 ? 'Passed' : result.percentage >= 50 ? 'Fair' : 'Needs Work'}
                          </Badge>
                          <Link to={`/exams/${result.exam?._id}/results/${result._id}`}>
                            <Button variant="ghost" size="sm"><ChevronRight className="w-4 h-4" /></Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="border-none shadow-sm bg-gradient-to-br from-blue-600 to-blue-700 text-white">
              <CardContent className="p-8 text-center">
                <FileText className="h-10 w-10 mb-4 opacity-80 mx-auto" />
                <h3 className="text-xl font-bold mb-2">No Exams Taken Yet</h3>
                <p className="text-blue-100 text-sm mb-6 max-w-md mx-auto">
                  Enroll in a course and take a quiz or assignment to see your results here.
                </p>
                <Link to="/courses">
                  <Button variant="secondary" className="bg-white text-blue-700 hover:bg-blue-50 border-none">
                    Browse Courses
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
