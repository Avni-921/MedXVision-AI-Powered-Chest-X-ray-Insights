-- ============================================================
-- Readify Smart Classroom — Full Schema Migration
-- Tables, Indexes, RLS Policies, Storage Buckets
-- ============================================================

-- ============================================
-- Table: courses
-- ============================================
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  thumbnail_url text,
  category text,
  difficulty text CHECK (difficulty IN ('beginner','intermediate','advanced')),
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_courses_instructor ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_published ON courses(published);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);

-- ============================================
-- Table: modules (chapters inside a course)
-- ============================================
CREATE TABLE IF NOT EXISTS modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_modules_course ON modules(course_id);

-- ============================================
-- Table: lessons (content inside a module)
-- ============================================
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid REFERENCES modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  content_type text CHECK (content_type IN ('video','text')),
  content text,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lessons_module ON lessons(module_id);

-- ============================================
-- Table: enrollments
-- ============================================
CREATE TABLE IF NOT EXISTS enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at timestamptz DEFAULT now(),
  UNIQUE(student_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);

-- ============================================
-- Table: lesson_progress
-- ============================================
CREATE TABLE IF NOT EXISTS lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  UNIQUE(student_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_progress_student ON lesson_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_progress_lesson ON lesson_progress(lesson_id);

-- ============================================
-- Table: assignments
-- ============================================
CREATE TABLE IF NOT EXISTS assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  instructor_id uuid REFERENCES profiles(id),
  title text NOT NULL,
  description text,
  due_date timestamptz,
  total_marks integer DEFAULT 100,
  file_url text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assignments_course ON assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_assignments_instructor ON assignments(instructor_id);

-- ============================================
-- Table: assignment_submissions
-- ============================================
CREATE TABLE IF NOT EXISTS assignment_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid REFERENCES assignments(id) ON DELETE CASCADE,
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content text,
  file_url text,
  submitted_at timestamptz DEFAULT now(),
  marks_obtained integer,
  feedback text,
  graded_at timestamptz,
  UNIQUE(assignment_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON assignment_submissions(student_id);

-- ============================================
-- Table: quizzes
-- ============================================
CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  instructor_id uuid REFERENCES profiles(id),
  title text NOT NULL,
  instructions text,
  time_limit_minutes integer DEFAULT 30,
  total_marks integer DEFAULT 0,
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quizzes_course ON quizzes(course_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_instructor ON quizzes(instructor_id);

-- ============================================
-- Table: quiz_questions
-- ============================================
CREATE TABLE IF NOT EXISTS quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_type text CHECK (question_type IN ('mcq','short_answer')),
  marks integer DEFAULT 1,
  order_index integer NOT NULL DEFAULT 0,
  options jsonb,
  correct_option integer
);

CREATE INDEX IF NOT EXISTS idx_questions_quiz ON quiz_questions(quiz_id);

-- ============================================
-- Table: quiz_attempts
-- ============================================
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE,
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  started_at timestamptz DEFAULT now(),
  submitted_at timestamptz,
  score integer,
  time_taken_seconds integer,
  UNIQUE(quiz_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_attempts_quiz ON quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_attempts_student ON quiz_attempts(student_id);

-- ============================================
-- Table: quiz_answers
-- ============================================
CREATE TABLE IF NOT EXISTS quiz_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  question_id uuid REFERENCES quiz_questions(id) ON DELETE CASCADE,
  selected_option integer,
  text_answer text,
  marks_awarded integer
);

CREATE INDEX IF NOT EXISTS idx_answers_attempt ON quiz_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_answers_question ON quiz_answers(question_id);

-- ============================================
-- Enable RLS on all tables
-- ============================================
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES: courses
-- ============================================
CREATE POLICY "Teachers manage own courses" ON courses
  FOR ALL USING (auth.uid() = instructor_id);

CREATE POLICY "Students view published courses" ON courses
  FOR SELECT USING (published = true);

-- ============================================
-- RLS POLICIES: modules
-- ============================================
CREATE POLICY "Instructor manages modules" ON modules
  FOR ALL USING (
    EXISTS (SELECT 1 FROM courses WHERE courses.id = modules.course_id
    AND courses.instructor_id = auth.uid())
  );

CREATE POLICY "Anyone views modules" ON modules
  FOR SELECT USING (true);

-- ============================================
-- RLS POLICIES: lessons
-- ============================================
CREATE POLICY "Instructor manages lessons" ON lessons
  FOR ALL USING (
    EXISTS (SELECT 1 FROM modules
    JOIN courses ON courses.id = modules.course_id
    WHERE modules.id = lessons.module_id
    AND courses.instructor_id = auth.uid())
  );

CREATE POLICY "Anyone views lessons" ON lessons
  FOR SELECT USING (true);

-- ============================================
-- RLS POLICIES: enrollments
-- ============================================
CREATE POLICY "Students manage own enrollment" ON enrollments
  FOR ALL USING (auth.uid() = student_id);

CREATE POLICY "Teachers view enrollments for their courses" ON enrollments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM courses WHERE courses.id = enrollments.course_id
    AND courses.instructor_id = auth.uid())
  );

-- ============================================
-- RLS POLICIES: lesson_progress
-- ============================================
CREATE POLICY "Students manage own progress" ON lesson_progress
  FOR ALL USING (auth.uid() = student_id);

-- ============================================
-- RLS POLICIES: assignments
-- ============================================
CREATE POLICY "Teachers manage own assignments" ON assignments
  FOR ALL USING (auth.uid() = instructor_id);

CREATE POLICY "Students view assignments for enrolled courses" ON assignments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM enrollments WHERE enrollments.course_id = assignments.course_id
    AND enrollments.student_id = auth.uid())
  );

-- ============================================
-- RLS POLICIES: assignment_submissions
-- ============================================
CREATE POLICY "Students manage own submissions" ON assignment_submissions
  FOR ALL USING (auth.uid() = student_id);

CREATE POLICY "Teachers view and grade submissions" ON assignment_submissions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM assignments WHERE assignments.id = assignment_submissions.assignment_id
    AND assignments.instructor_id = auth.uid())
  );

CREATE POLICY "Teachers update grades" ON assignment_submissions
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM assignments WHERE assignments.id = assignment_submissions.assignment_id
    AND assignments.instructor_id = auth.uid())
  );

-- ============================================
-- RLS POLICIES: quizzes
-- ============================================
CREATE POLICY "Teachers manage own quizzes" ON quizzes
  FOR ALL USING (auth.uid() = instructor_id);

CREATE POLICY "Students view published quizzes" ON quizzes
  FOR SELECT USING (
    published = true AND EXISTS (
      SELECT 1 FROM enrollments WHERE enrollments.course_id = quizzes.course_id
      AND enrollments.student_id = auth.uid()
    )
  );

-- ============================================
-- RLS POLICIES: quiz_questions
-- ============================================
CREATE POLICY "Teachers manage questions" ON quiz_questions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM quizzes WHERE quizzes.id = quiz_questions.quiz_id
    AND quizzes.instructor_id = auth.uid())
  );

CREATE POLICY "Students view questions" ON quiz_questions
  FOR SELECT USING (true);

-- ============================================
-- RLS POLICIES: quiz_attempts
-- ============================================
CREATE POLICY "Students manage own attempts" ON quiz_attempts
  FOR ALL USING (auth.uid() = student_id);

CREATE POLICY "Teachers view attempts" ON quiz_attempts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM quizzes WHERE quizzes.id = quiz_attempts.quiz_id
    AND quizzes.instructor_id = auth.uid())
  );

-- ============================================
-- RLS POLICIES: quiz_answers
-- ============================================
CREATE POLICY "Students manage own answers" ON quiz_answers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM quiz_attempts WHERE quiz_attempts.id = quiz_answers.attempt_id
    AND quiz_attempts.student_id = auth.uid())
  );

CREATE POLICY "Teachers view and grade answers" ON quiz_answers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM quiz_attempts
    JOIN quizzes ON quizzes.id = quiz_attempts.quiz_id
    WHERE quiz_attempts.id = quiz_answers.attempt_id
    AND quizzes.instructor_id = auth.uid())
  );

-- ============================================
-- Storage Buckets
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-thumbnails', 'course-thumbnails', true),
       ('assignment-files', 'assignment-files', false)
ON CONFLICT DO NOTHING;

-- Storage policies for course-thumbnails (public read, authenticated upload)
CREATE POLICY "Public read thumbnails" ON storage.objects
  FOR SELECT USING (bucket_id = 'course-thumbnails');

CREATE POLICY "Authenticated upload thumbnails" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'course-thumbnails' AND auth.uid() IS NOT NULL);

CREATE POLICY "Owner delete thumbnails" ON storage.objects
  FOR DELETE USING (bucket_id = 'course-thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for assignment-files (authenticated access)
CREATE POLICY "Authenticated read assignment files" ON storage.objects
  FOR SELECT USING (bucket_id = 'assignment-files' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated upload assignment files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'assignment-files' AND auth.uid() IS NOT NULL);

-- ============================================
-- Updated_at trigger for courses
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
