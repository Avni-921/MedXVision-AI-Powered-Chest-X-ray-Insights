import { Link } from 'react-router-dom';
import { Clock, BookOpen, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  instructor_name: string;
  category: string;
  level: string;
  duration_hours: number;
  price: number;
}

interface CourseCardProps {
  course: Course;
  index?: number;
}

export function CourseCard({ course, index = 0 }: CourseCardProps) {
  const levelColors = {
    beginner: 'bg-emerald-100 text-emerald-700',
    intermediate: 'bg-blue-100 text-blue-700',
    advanced: 'bg-orange-100 text-orange-700',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link to={`/courses/${course.id}`}>
        <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group">
          <div className="relative h-48 overflow-hidden">
            <img
              src={course.thumbnail_url}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute top-4 right-4">
              <Badge className={levelColors[course.level as keyof typeof levelColors]}>
                {course.level}
              </Badge>
            </div>
          </div>

          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <Badge variant="secondary">{course.category}</Badge>
              {course.price > 0 ? (
                <span className="text-lg font-bold text-blue-600">${course.price}</span>
              ) : (
                <span className="text-lg font-bold text-emerald-600">Free</span>
              )}
            </div>
            <h3 className="text-xl font-bold line-clamp-2 group-hover:text-blue-600 transition-colors">
              {course.title}
            </h3>
          </CardHeader>

          <CardContent>
            <p className="text-slate-600 line-clamp-2 mb-4">{course.description}</p>
            <p className="text-sm text-slate-500 mb-3">By {course.instructor_name}</p>

            <div className="flex items-center gap-4 text-sm text-slate-500">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{course.duration_hours}h</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                <span>Lessons</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                <span>{course.level}</span>
              </div>
            </div>
          </CardContent>

          <CardFooter>
            <div className="w-full">
              <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full w-0 bg-gradient-to-r from-blue-600 to-blue-700 group-hover:w-full transition-all duration-500" />
              </div>
            </div>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
}
