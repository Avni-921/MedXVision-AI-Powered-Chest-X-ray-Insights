import { Link } from 'react-router-dom';
import { BookOpen, Brain, Layout, CheckCircle, Smartphone, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion, Variants } from 'framer-motion';

// Animation variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }

};

export function Landing() {
  return (
    <div className="flex flex-col min-h-screen">

      {/* HERO SECTION */}
      <section className="relative bg-primary pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Hero Text */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="text-center lg:text-left"
            >
              <motion.h1
                variants={fadeInUp}
                className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white leading-tight mb-6"
              >
                Readify <br />
                <span className="text-secondary">AI-Enabled Smart Classroom</span>
              </motion.h1>
              <motion.p
                variants={fadeInUp}
                className="text-lg md:text-xl text-gray-300 mb-8 font-light max-w-2xl mx-auto lg:mx-0"
              >
                A comprehensive learning platform for structured course delivery, assignments,
                and classroom management. Built for seamless student–teacher interaction.
              </motion.p>
              <motion.div
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <Link to="/register">
                  <Button variant="secondary" size="lg" className="text-primary font-bold w-full sm:w-auto">
                    Get Started Free
                  </Button>
                </Link>
                <Link to="/courses">
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary w-full sm:w-auto">
                    Explore Courses
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative hidden lg:block"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000&auto=format&fit=crop"
                  alt="Students learning"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-primary/20 mix-blend-multiply"></div>
              </div>
              {/* Floating Badge */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg flex items-center gap-3 max-w-xs"
              >
                <div className="bg-blue-100 p-2 rounded-full">
                  <Brain className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">AI Powered</p>
                  <p className="text-sm text-gray-500">Smart content summaries</p>
                </div>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">
              Modernize your <span className="text-yellow-500 underline decoration-yellow-300/50">learning experience</span>
            </h2>
            <p className="text-xl text-gray-600">
              Transforming education with AI assistance and structured management.
            </p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              { icon: Layout, title: "Structured Delivery", desc: "Organize modules, topics, and resources effectively." },
              { icon: CheckCircle, title: "Assignments", desc: "Create, submit, and grade assignments seamlessly." },
              { icon: Brain, title: "AI Integration", desc: "Generate summaries and explanations from learning materials." },
              { icon: Users, title: "Role-Based Access", desc: "Dedicated portals for Students and Instructors." },
              { icon: BookOpen, title: "Resource Hub", desc: "Manage videos, PDFs, and reading materials in one place." },
              { icon: Smartphone, title: "Responsive Design", desc: "Access your classroom from any device, anywhere." }
            ].map((feature, i) => (
              <motion.div key={i} variants={fadeInUp}>
                <Card className="h-full border-none shadow-sm bg-gray-50 hover:bg-white hover:shadow-xl transition-all duration-300 group">
                  <CardContent className="p-8">
                    <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                      <feature.icon className="w-7 h-7 text-primary group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-xl font-bold text-primary mb-3">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.desc}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 bg-secondary">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-6">
            Ready to transform your classroom?
          </h2>
          <p className="text-xl text-primary/80 mb-10 max-w-2xl mx-auto">
            Join the future of education with AI-enabled learning today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button className="bg-primary text-white hover:bg-primary/90 text-lg px-10 py-6 h-auto rounded-full shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all">
                Get Started Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
