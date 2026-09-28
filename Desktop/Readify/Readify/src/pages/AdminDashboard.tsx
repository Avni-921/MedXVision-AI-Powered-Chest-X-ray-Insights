import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, GraduationCap, TrendingUp, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import API from '@/api/axios';
import { motion } from 'framer-motion';

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalEnrollments: 0,
    publishedCourses: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: courses } = await API.get('/courses');
      const publishedCourses = courses.filter((c: any) => c.is_published).length;

      setStats({
        totalCourses: courses.length,
        publishedCourses,
        totalStudents: 0, // Would need a users endpoint for this
        totalEnrollments: 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      icon: BookOpen,
      label: 'Total Courses',
      value: stats.totalCourses,
      subtitle: `${stats.publishedCourses} published`,
      color: 'from-blue-600 to-blue-700',
      link: '/admin/courses',
    },
    {
      icon: Users,
      label: 'Total Students',
      value: stats.totalStudents,
      subtitle: 'Active learners',
      color: 'from-emerald-600 to-emerald-700',
      link: '/admin/users',
    },
    {
      icon: GraduationCap,
      label: 'Enrollments',
      value: stats.totalEnrollments,
      subtitle: 'Course enrollments',
      color: 'from-orange-600 to-orange-700',
      link: '/admin/courses',
    },
    {
      icon: TrendingUp,
      label: 'Engagement',
      value: stats.totalEnrollments > 0 ? `${Math.round((stats.totalEnrollments / stats.totalStudents) * 10) / 10}` : '0',
      subtitle: 'Courses per student',
      color: 'from-violet-600 to-violet-700',
      link: '/admin',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-600 mt-2">Manage your learning platform</p>
          </div>
          <Link to="/admin/courses">
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Course
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={stat.link}>
                <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-lg`}>
                        <stat.icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</p>
                      <p className="text-sm text-slate-500">{stat.subtitle}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/admin/courses">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Course
                </Button>
              </Link>
              <Link to="/admin/courses">
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Manage Courses
                </Button>
              </Link>
              <Link to="/admin/users">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-slate-500">
                <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Activity tracking coming soon</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
