import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

import { Logo } from '@/components/Logo';
import { cn } from '@/lib/utils';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollTop = () => {
    window.scrollTo(0, 0);
    setIsOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/');
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="flex justify-center sticky top-0 z-50 w-full pt-4 pointer-events-none">
      <nav className={cn(
        "bg-white/80 backdrop-blur-md border-gray-100 transition-all duration-300 pointer-events-auto",
        isScrolled
          ? "w-[95%] max-w-7xl rounded-full border shadow-lg top-4"
          : "w-full border-b top-0 rounded-none transform-none"
      )}>
        <div className={cn("mx-auto px-4 sm:px-6 lg:px-8", isScrolled ? "" : "max-w-7xl")}>
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link to="/" className="flex items-center group" onClick={handleScrollTop}>
                <Logo size="lg" className="group-hover:opacity-90 transition-opacity" />
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              <Link to={user ? "/courses" : "/login"} onClick={() => window.scrollTo(0, 0)} className="text-gray-600 hover:text-primary font-medium transition-colors">
                Courses
              </Link>

              {/* Additional Nav Links could go here */}

              <div className="h-6 w-px bg-gray-200 mx-2"></div>

              {user ? (
                <>
                  <Link to={user?.role === 'teacher' ? '/dashboard/instructor' : user?.role === 'admin' ? '/admin' : '/dashboard'} onClick={() => window.scrollTo(0, 0)}>
                    <Button variant="ghost" className="font-medium text-gray-600">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <Link to="/profile" onClick={() => window.scrollTo(0, 0)}>
                    <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-primary font-bold hover:bg-secondary/40 transition-colors">
                      <User className="h-5 w-5" />
                    </div>
                  </Link>
                  <Button variant="outline" size="sm" onClick={handleSignOut} className="ml-2">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => window.scrollTo(0, 0)}>
                    <Button variant="ghost" className="font-medium text-gray-700 hover:text-primary">Sign In</Button>
                  </Link>
                  <Link to="/register" onClick={() => window.scrollTo(0, 0)}>
                    <Button variant="cta" size="default">
                      Get Started Free
                    </Button>
                  </Link>
                </>
              )}
            </div>

            <div className="md:hidden flex items-center">
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <X className="text-primary" /> : <Menu className="text-primary" />}
              </Button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, borderRadius: 0 }}
              animate={{ opacity: 1, height: 'auto', borderRadius: isScrolled ? '0 0 24px 24px' : 0 }}
              exit={{ opacity: 0, height: 0 }}
              className={cn("md:hidden border-t border-gray-100 bg-white overflow-hidden", isScrolled && "rounded-b-[24px]")}
            >
              <div className="px-4 pt-4 pb-6 space-y-3">
                <Link to={user ? "/courses" : "/login"} onClick={handleScrollTop}>
                  <Button variant="ghost" className="w-full justify-start text-lg">
                    Courses
                  </Button>
                </Link>

                {user ? (
                  <>
                    <Link to={user?.role === 'teacher' ? '/dashboard/instructor' : user?.role === 'admin' ? '/admin' : '/dashboard'} onClick={handleScrollTop}>
                      <Button variant="ghost" className="w-full justify-start text-lg">
                        <LayoutDashboard className="h-5 w-5 mr-3" />
                        Dashboard
                      </Button>
                    </Link>
                    <Link to="/profile" onClick={handleScrollTop}>
                      <Button variant="ghost" className="w-full justify-start text-lg">
                        <User className="h-5 w-5 mr-3" />
                        Profile
                      </Button>
                    </Link>
                    <Button variant="outline" className="w-full justify-start mt-4" onClick={() => { handleSignOut(); setIsOpen(false); }}>
                      <LogOut className="h-5 w-5 mr-3" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="border-t border-gray-100 my-2 pt-2"></div>
                    <Link to="/login" onClick={handleScrollTop}>
                      <Button variant="ghost" className="w-full justify-start text-lg">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/register" onClick={handleScrollTop}>
                      <Button variant="cta" className="w-full mt-2">
                        Get Started Free
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </div>
  );
}
