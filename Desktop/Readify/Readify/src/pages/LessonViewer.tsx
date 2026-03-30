import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import API from '@/api/axios';
import { toast } from 'sonner';

interface Lesson {
  id: string;
  _id?: string;
  title: string;
  description: string;
  content_type: string;
  content_url: string;
  content_text: string;
  duration_minutes: number;
  order_index: number;
}

export function LessonViewer() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (courseId && lessonId) {
      fetchLesson();
      fetchAllLessons();
    }
  }, [courseId, lessonId]);

  const fetchLesson = async () => {
    try {
      const { data } = await API.get(`/videos/${lessonId}`);
      setLesson({ ...data, id: data._id, content_type: 'video', content_url: data.url, content_text: '' });
    } catch (error) {
      console.error('Error fetching lesson:', error);
      toast.error('Failed to load lesson');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllLessons = async () => {
    try {
      const { data } = await API.get(`/videos/course/${courseId}`);
      setAllLessons(data.map((v: any) => ({ ...v, id: v._id })));
    } catch (error) {
      console.error('Error fetching lessons:', error);
    }
  };

  const markAsComplete = async () => {
    if (!lessonId || completedLessons.includes(lessonId)) return;

    try {
      await API.put(`/courses/${courseId}/progress`, { videoId: lessonId });
      const updatedCompleted = [...completedLessons, lessonId];
      setCompletedLessons(updatedCompleted);
      toast.success('Lesson marked as complete!');
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
    }
  };

  const navigateToLesson = (targetLessonId: string) => {
    navigate(`/courses/${courseId}/lessons/${targetLessonId}`);
  };

  const currentIndex = allLessons.findIndex(l => l.id === lessonId);
  const previousLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
  const progressPercentage = Math.round((completedLessons.length / allLessons.length) * 100);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Lesson not found</h2>
          <Button onClick={() => navigate(`/courses/${courseId}`)}>Back to Course</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate(`/courses/${courseId}`)}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Course
            </Button>
            <div className="text-sm text-slate-600">
              Lesson {currentIndex + 1} of {allLessons.length}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Progress value={progressPercentage} className="flex-1" />
            <span className="text-sm font-medium text-slate-900">{progressPercentage}%</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                {lesson.content_type === 'video' && lesson.content_url && (
                  <div className="aspect-video bg-slate-900 rounded-t-lg overflow-hidden">
                    <video
                      controls
                      className="w-full h-full"
                      src={lesson.content_url}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}

                {lesson.content_type === 'pdf' && lesson.content_url && (
                  <div className="aspect-video bg-slate-100 rounded-t-lg overflow-hidden flex items-center justify-center">
                    <iframe
                      src={lesson.content_url}
                      className="w-full h-full"
                      title={lesson.title}
                    />
                  </div>
                )}

                <div className="p-6">
                  <h1 className="text-3xl font-bold text-slate-900 mb-4">{lesson.title}</h1>
                  <p className="text-slate-600 mb-6">{lesson.description}</p>

                  {lesson.content_text && (
                    <div className="prose max-w-none">
                      <div className="bg-slate-50 p-6 rounded-lg">
                        <pre className="whitespace-pre-wrap text-slate-700">{lesson.content_text}</pre>
                      </div>
                    </div>
                  )}

                  <div className="mt-8 flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={() => previousLesson && navigateToLesson(previousLesson.id)}
                      disabled={!previousLesson}
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous Lesson
                    </Button>

                    {!completedLessons.includes(lessonId!) && (
                      <Button
                        onClick={markAsComplete}
                        className="bg-gradient-to-r from-emerald-600 to-emerald-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Complete
                      </Button>
                    )}

                    <Button
                      onClick={() => nextLesson && navigateToLesson(nextLesson.id)}
                      disabled={!nextLesson}
                      className="bg-gradient-to-r from-blue-600 to-blue-700"
                    >
                      Next Lesson
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Course Content</h3>
                <div className="space-y-2">
                  {allLessons.map((l, index) => (
                    <button
                      key={l.id}
                      onClick={() => navigateToLesson(l.id)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        l.id === lessonId
                          ? 'bg-blue-100 border-2 border-blue-600'
                          : 'hover:bg-slate-50 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                          completedLessons.includes(l.id)
                            ? 'bg-emerald-600'
                            : 'bg-slate-200'
                        }`}>
                          {completedLessons.includes(l.id) ? (
                            <CheckCircle className="h-4 w-4 text-white" />
                          ) : (
                            <span className="text-xs text-slate-600">{index + 1}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-sm font-medium mb-1 ${
                            l.id === lessonId ? 'text-blue-900' : 'text-slate-900'
                          }`}>
                            {l.title}
                          </h4>
                          <p className="text-xs text-slate-500">{l.duration_minutes} min</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
