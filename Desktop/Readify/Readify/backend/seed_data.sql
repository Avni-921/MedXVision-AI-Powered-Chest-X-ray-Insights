-- ============================================================
-- Readify LMS — Seed Data
-- Sample courses and lessons for initial demo content
-- Run this after migrations are applied
-- ============================================================

-- ============================================
-- Sample Courses
-- Note: created_by is NULL since these are seeded without a user.
-- After creating an admin user, you can UPDATE created_by.
-- ============================================

INSERT INTO public.courses (title, description, thumbnail_url, instructor_name, category, level, duration_hours, price, is_published)
VALUES
  (
    'Introduction to Web Development',
    'Learn the fundamentals of HTML, CSS, and JavaScript. Build your first website from scratch and understand how the web works.',
    'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=800',
    'Dr. Sarah Chen',
    'Development',
    'beginner',
    12,
    0,
    true
  ),
  (
    'Advanced React & TypeScript',
    'Master modern React patterns including hooks, context, suspense, and server components. Build production-grade applications with TypeScript.',
    'https://images.pexels.com/photos/11035471/pexels-photo-11035471.jpeg?auto=compress&cs=tinysrgb&w=800',
    'Prof. James Wilson',
    'Development',
    'advanced',
    24,
    49.99,
    true
  ),
  (
    'UI/UX Design Fundamentals',
    'Understand design thinking, user research, wireframing, and prototyping. Create beautiful and functional user interfaces.',
    'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=800',
    'Maria Gonzalez',
    'Design',
    'beginner',
    8,
    29.99,
    true
  ),
  (
    'Data Science with Python',
    'From data cleaning to machine learning. Learn pandas, numpy, scikit-learn, and build predictive models with real-world datasets.',
    'https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg?auto=compress&cs=tinysrgb&w=800',
    'Dr. Alex Kumar',
    'Data Science',
    'intermediate',
    36,
    79.99,
    true
  ),
  (
    'Digital Marketing Masterclass',
    'Learn SEO, social media marketing, content strategy, and analytics. Build and execute marketing campaigns that drive results.',
    'https://images.pexels.com/photos/905163/pexels-photo-905163.jpeg?auto=compress&cs=tinysrgb&w=800',
    'Emily Rodriguez',
    'Marketing',
    'intermediate',
    16,
    39.99,
    true
  ),
  (
    'Cloud Computing with AWS',
    'Master AWS services including EC2, S3, Lambda, and RDS. Prepare for the AWS Solutions Architect certification.',
    'https://images.pexels.com/photos/1148820/pexels-photo-1148820.jpeg?auto=compress&cs=tinysrgb&w=800',
    'Prof. David Park',
    'Development',
    'advanced',
    30,
    89.99,
    false
  );


-- ============================================
-- Sample Lessons for "Introduction to Web Development"
-- ============================================

INSERT INTO public.lessons (course_id, title, description, content_type, content_text, duration_minutes, order_index, is_free)
SELECT
  c.id,
  lesson.title,
  lesson.description,
  lesson.content_type,
  lesson.content_text,
  lesson.duration_minutes,
  lesson.order_index,
  lesson.is_free
FROM public.courses c
CROSS JOIN (VALUES
  ('What is the Web?', 'Understanding how browsers, servers, and the internet work together.', 'text',
   'The World Wide Web is a system of interlinked hypertext documents accessed via the Internet. When you type a URL into your browser, it sends an HTTP request to a web server, which responds with HTML, CSS, and JavaScript files that your browser renders into a visible webpage.

Key concepts:
- HTTP/HTTPS protocols
- Client-server architecture
- DNS resolution
- Browser rendering pipeline

The web was invented by Tim Berners-Lee in 1989 at CERN. It has since evolved from simple static pages to complex interactive applications.',
   15, 1, true),

  ('HTML Basics', 'Learn the building blocks of every webpage — HTML elements, attributes, and document structure.', 'text',
   'HTML (HyperText Markup Language) is the standard markup language for creating web pages. Every webpage you visit is built with HTML at its core.

Basic Structure:
<!DOCTYPE html>
<html>
  <head>
    <title>My First Page</title>
  </head>
  <body>
    <h1>Hello World!</h1>
    <p>This is my first webpage.</p>
  </body>
</html>

Key HTML Elements:
- Headings: <h1> through <h6>
- Paragraphs: <p>
- Links: <a href="url">text</a>
- Images: <img src="url" alt="description">
- Lists: <ul>, <ol>, <li>
- Divisions: <div>
- Spans: <span>',
   25, 2, true),

  ('CSS Styling', 'Make your pages beautiful with CSS — selectors, properties, flexbox, and grid layouts.', 'text',
   'CSS (Cascading Style Sheets) controls the visual presentation of HTML elements. With CSS, you can change colors, fonts, spacing, layout, and add animations.

CSS Syntax:
selector {
  property: value;
}

Example:
h1 {
  color: #1B141E;
  font-size: 2.5rem;
  font-family: "Lora", serif;
}

Layout with Flexbox:
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

CSS Grid:
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}',
   30, 3, false),

  ('JavaScript Fundamentals', 'Add interactivity to your pages with JavaScript — variables, functions, DOM manipulation.', 'text',
   'JavaScript is the programming language of the web. It runs in the browser and allows you to create dynamic, interactive web pages.

Variables:
let name = "Readify";
const version = 1.0;

Functions:
function greet(user) {
  return `Welcome to ${user}!`;
}

DOM Manipulation:
const button = document.querySelector("#myButton");
button.addEventListener("click", () => {
  alert("Button clicked!");
});

Modern JavaScript (ES6+):
- Arrow functions: (x) => x * 2
- Template literals: `Hello ${name}`
- Destructuring: const { title, price } = course;
- Async/await for handling promises',
   35, 4, false),

  ('Building Your First Website', 'Put it all together — build a complete responsive website from scratch.', 'text',
   'In this final lesson, we will combine everything you have learned to build a complete, responsive personal portfolio website.

Project Structure:
- index.html (Home page)
- about.html (About section)
- style.css (All styles)
- script.js (Interactivity)

Features we will build:
1. Responsive navigation bar
2. Hero section with call-to-action
3. Project showcase grid
4. Contact form
5. Footer with social links

Best Practices:
- Use semantic HTML (<header>, <main>, <footer>)
- Mobile-first CSS approach
- Progressive enhancement
- Accessible markup (ARIA labels, alt text)',
   45, 5, false)
) AS lesson(title, description, content_type, content_text, duration_minutes, order_index, is_free)
WHERE c.title = 'Introduction to Web Development';


-- ============================================
-- Sample Lessons for "Advanced React & TypeScript"
-- ============================================

INSERT INTO public.lessons (course_id, title, description, content_type, content_text, duration_minutes, order_index, is_free)
SELECT
  c.id,
  lesson.title,
  lesson.description,
  lesson.content_type,
  lesson.content_text,
  lesson.duration_minutes,
  lesson.order_index,
  lesson.is_free
FROM public.courses c
CROSS JOIN (VALUES
  ('TypeScript Essentials', 'Types, interfaces, generics, and why TypeScript makes React better.', 'text',
   'TypeScript adds static type checking to JavaScript. In React applications, it catches bugs at compile time and provides excellent IDE support.

Basic Types:
let title: string = "React Course";
let price: number = 49.99;
let isPublished: boolean = true;

Interfaces:
interface Course {
  id: string;
  title: string;
  price: number;
  level: "beginner" | "intermediate" | "advanced";
}

Generics:
function useState<T>(initial: T): [T, (value: T) => void] { ... }',
   30, 1, true),

  ('React Hooks Deep Dive', 'useState, useEffect, useCallback, useMemo, useRef — when and why to use each.', 'text',
   'React Hooks are functions that let you use state and lifecycle features in function components.

useState - Managing component state
useEffect - Side effects (data fetching, subscriptions)
useCallback - Memoizing functions
useMemo - Memoizing computed values
useRef - Persisting values across renders without re-rendering
useContext - Consuming context values',
   40, 2, false),

  ('State Management Patterns', 'Context API, Zustand, and when you actually need a state library.', 'text',
   'Not every app needs Redux. Learn to choose the right state management approach for your use case.

Context API - Best for: theme, auth, locale (low-frequency updates)
Zustand - Best for: medium complexity, good DX
Redux Toolkit - Best for: large teams, complex state logic
React Query / TanStack Query - Best for: server state management',
   35, 3, false),

  ('Building Custom Hooks', 'Extract reusable logic into custom hooks for cleaner, more maintainable code.', 'text',
   'Custom hooks let you extract component logic into reusable functions. Any function starting with "use" that calls other hooks is a custom hook.

Example: useAuth hook
Example: useFetch hook
Example: useLocalStorage hook
Example: useDebounce hook',
   30, 4, false)
) AS lesson(title, description, content_type, content_text, duration_minutes, order_index, is_free)
WHERE c.title = 'Advanced React & TypeScript';


-- ============================================
-- Sample Lessons for "UI/UX Design Fundamentals"
-- ============================================

INSERT INTO public.lessons (course_id, title, description, content_type, content_text, duration_minutes, order_index, is_free)
SELECT
  c.id,
  lesson.title,
  lesson.description,
  lesson.content_type,
  lesson.content_text,
  lesson.duration_minutes,
  lesson.order_index,
  lesson.is_free
FROM public.courses c
CROSS JOIN (VALUES
  ('Introduction to Design Thinking', 'The five stages of design thinking and how to apply them.', 'text',
   'Design Thinking is a human-centered approach to innovation. The five stages are:
1. Empathize - Understand users and their needs
2. Define - Frame the problem statement
3. Ideate - Generate creative solutions
4. Prototype - Build quick representations
5. Test - Validate with real users',
   20, 1, true),

  ('Color Theory & Typography', 'How to choose color palettes and typefaces that communicate your brand.', 'text',
   'Color and typography are the two most powerful visual tools in design.

Color Theory Basics:
- Primary, Secondary, Tertiary colors
- Complementary vs Analogous palettes
- Color psychology in UI design

Typography Fundamentals:
- Serif vs Sans-serif
- Font pairing strategies
- Hierarchy through size and weight',
   25, 2, false),

  ('Wireframing & Prototyping', 'From low-fidelity sketches to interactive prototypes using Figma.', 'text',
   'Wireframes are the blueprint of your design. They help you plan layout and functionality before investing in visual design.

Wireframing Process:
1. Start with paper sketches
2. Create low-fidelity digital wireframes
3. Add interactions and flows
4. Build high-fidelity prototypes
5. User testing and iteration',
   30, 3, false)
) AS lesson(title, description, content_type, content_text, duration_minutes, order_index, is_free)
WHERE c.title = 'UI/UX Design Fundamentals';
