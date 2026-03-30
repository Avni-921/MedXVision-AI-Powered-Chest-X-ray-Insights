import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, BookOpen, Play, FileText, Award, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import API from '@/api/axios';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface Video {
  _id: string;
  title: string;
  description: string;
  url: string;
  duration_minutes: number;
  order_index: number;
}

interface Exam {
  _id: string;
  title: string;
  description: string;
  time_limit_minutes: number;
  questions: { question: string }[];
}

interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  instructor_name: string;
  category: string;
  level: string;
  duration_hours: number;
  price: number;
  is_published: boolean;
  videos?: Video[];
}

export function CourseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    fetchCourse();
    if (user) {
      checkEnrollment();
      fetchExams();
    }
  }, [id, user]);

  const fetchCourse = async () => {
    try {
      const { data } = await API.get(`/courses/${id}`);
      setCourse(data);
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const fetchExams = async () => {
    try {
      const { data } = await API.get(`/exams/course/${id}`);
      setExams(data);
    } catch {
      // Not logged in or no exams
    }
  };

  const checkEnrollment = async () => {
    try {
      const { data } = await API.get('/courses/enrollments/my');
      const enrolled = data.some((e: any) => e.course?._id === id);
      setIsEnrolled(enrolled);
    } catch {
      // Not logged in
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setEnrolling(true);
    try {
      await API.post(`/courses/${id}/enroll`);
      setIsEnrolled(true);
      toast.success('Successfully enrolled!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to enroll');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Course not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link to="/courses" className="inline-flex items-center text-slate-300 hover:text-white mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Courses
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Badge className="mb-4 bg-blue-600">{course.category}</Badge>
              <h1 className="text-4xl font-bold mb-4 font-serif">{course.title}</h1>
              <p className="text-slate-300 text-lg mb-6">{course.description}</p>
              <div className="flex items-center gap-6 text-sm text-slate-300">
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4" /> {course.instructor_name}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" /> {course.duration_hours}h
                </span>
                <Badge variant="outline" className="text-slate-300 border-slate-500 capitalize">
                  {course.level}
                </Badge>
              </div>
            </div>

            <div>
              <Card className="bg-white text-slate-900">
                <CardContent className="p-6">
                  <img src={course.thumbnail_url} alt={course.title} className="w-full h-40 object-cover rounded-lg mb-4" />
                  <div className="text-3xl font-bold mb-4">
                    {course.price === 0 ? 'Free' : `$${course.price}`}
                  </div>
                  {isEnrolled ? (
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700" disabled>
                      ✓ Enrolled
                    </Button>
                  ) : (
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={handleEnroll}
                      disabled={enrolling}
                    >
                      {enrolling ? 'Enrolling...' : 'Enroll Now'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="videos" className="space-y-6">
          <TabsList>
            <TabsTrigger value="videos">
              <Play className="w-4 h-4 mr-2" /> Videos ({course.videos?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="exams">
              <FileText className="w-4 h-4 mr-2" /> Exams ({exams.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="videos">
            {course.videos && course.videos.length > 0 ? (
              <div className="space-y-3">
                {course.videos.map((video, index) => (
                  <motion.div
                    key={video._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link to={isEnrolled || !user ? `/videos/${video._id}` : '#'}>
                      <Card className={`hover:shadow-md transition-all ${!isEnrolled && user ? 'opacity-60' : 'cursor-pointer'}`}>
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                            {video.order_index}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-slate-900">{video.title}</h4>
                            <p className="text-sm text-slate-500">{video.description}</p>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-400 flex-shrink-0">
                            <Clock className="w-4 h-4" /> {video.duration_minutes} min
                          </div>
                          <Play className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card><CardContent className="p-12 text-center text-slate-500">No videos yet.</CardContent></Card>
            )}
          </TabsContent>

          <TabsContent value="exams">
            {exams.length > 0 ? (
              <div className="space-y-3">
                {exams.map((exam) => (
                  <Card key={exam._id} className="hover:shadow-md transition-all">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-slate-900">{exam.title}</h4>
                        <p className="text-sm text-slate-500">{exam.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                          <span><Clock className="w-3 h-3 inline mr-1" />{exam.time_limit_minutes} min</span>
                          <span><FileText className="w-3 h-3 inline mr-1" />{exam.questions?.length || 0} questions</span>
                        </div>
                      </div>
                      {isEnrolled && (
                        <Link to={`/exams/${exam._id}/attempt`}>
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            <Award className="w-4 h-4 mr-2" /> Start Exam
                          </Button>
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card><CardContent className="p-12 text-center text-slate-500">No exams available yet.</CardContent></Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
