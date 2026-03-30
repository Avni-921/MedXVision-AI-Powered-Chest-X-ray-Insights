import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, GraduationCap, Library, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Logo } from '@/components/Logo';

type Role = 'student' | 'teacher' | null;

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
      toast.success(`Welcome back, ${selectedRole === 'teacher' ? 'Professor' : 'Student'}!`);
      navigate(selectedRole === 'teacher' ? '/dashboard' : '/courses');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-[#F9F9F7] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>

      <div className="w-full max-w-5xl z-10">
        <div className="text-center mb-12">
          <Link to="/" className="inline-flex justify-center mb-6">
            <Logo size="lg" />
          </Link>
          <h1 className="text-3xl font-serif font-bold text-primary">
            {selectedRole ? 'Log in to your account' : 'Choose your portal'}
          </h1>
          <p className="text-gray-500 mt-2">
            {selectedRole
              ? `Sign in as a ${selectedRole}`
              : 'Select your role to continue to your dashboard'}
          </p>
        </div>

        <AnimatePresence mode='wait'>
          {!selectedRole ? (
            <motion.div
              key="selection"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={containerVariants}
              className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto"
            >
              {/* Student Card */}
              <motion.button
                whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedRole('student')}
                className="bg-white p-8 rounded-2xl shadow-md border-2 border-transparent hover:border-primary/10 transition-all text-left group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <GraduationCap className="w-32 h-32 text-primary" />
                </div>
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                    <GraduationCap className="w-7 h-7 text-primary group-hover:text-white" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-primary mb-2">Student Portal</h3>
                  <p className="text-gray-500 mb-6">Access your courses, assignments, and learning materials.</p>
                  <span className="inline-flex items-center text-primary font-bold text-sm group-hover:translate-x-1 transition-transform">
                    Continue as Student <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                  </span>
                </div>
              </motion.button>

              {/* Teacher Card */}
              <motion.button
                whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedRole('teacher')}
                className="bg-white p-8 rounded-2xl shadow-md border-2 border-transparent hover:border-secondary transition-all text-left group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Library className="w-32 h-32 text-secondary" />
                </div>
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-secondary group-hover:text-primary transition-colors">
                    <Library className="w-7 h-7 text-secondary-foreground group-hover:text-primary" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-primary mb-2">Instructor Portal</h3>
                  <p className="text-gray-500 mb-6">Manage courses, grade assignments, and track progress.</p>
                  <span className="inline-flex items-center text-secondary-foreground font-bold text-sm group-hover:translate-x-1 transition-transform">
                    Continue as Teacher <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                  </span>
                </div>
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="max-w-md mx-auto"
            >
              <Button
                variant="ghost"
                onClick={() => setSelectedRole(null)}
                className="mb-6 hover:bg-transparent hover:text-primary pl-0"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to role selection
              </Button>

              <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm">
                <CardContent className="pt-8 px-8 pb-8">
                  <div className="flex items-center gap-3 mb-8 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    {selectedRole === 'student' ? (
                      <div className="p-2 bg-primary/10 rounded-full"><GraduationCap className="w-5 h-5 text-primary" /></div>
                    ) : (
                      <div className="p-2 bg-secondary/20 rounded-full"><Library className="w-5 h-5 text-secondary-foreground" /></div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-500">Signing in as</p>
                      <p className="text-base font-bold text-primary capitalize">{selectedRole}</p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto" />
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="name@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 h-11 bg-white"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 h-11 bg-white"
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className={`w-full h-11 text-base font-bold rounded-full shadow-lg transition-all ${selectedRole === 'teacher'
                        ? 'bg-secondary text-primary hover:bg-secondary/90'
                        : 'bg-primary text-white hover:bg-primary/90'
                        }`}
                    >
                      {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </form>

                  <div className="mt-8 text-center text-sm">
                    <span className="text-gray-500">Don't have an account?</span>{' '}
                    <Link to="/register" className="text-primary font-bold hover:underline">
                      Sign up for free
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
