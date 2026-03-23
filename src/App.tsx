import React, { createContext, useContext, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Monitor, 
  Cpu, 
  MessageSquare, 
  Phone, 
  Mail, 
  MapPin, 
  CheckCircle, 
  Menu, 
  X, 
  ArrowRight, 
  Globe, 
  Zap, 
  Award,
  Users,
  Layout,
  Smartphone,
  ChevronRight,
  LogOut,
  User as UserIcon,
  ChevronDown,
  HelpCircle
} from 'lucide-react';
import { cn } from './lib/utils';
import { 
  auth, 
  db, 
  signInWithGoogle, 
  logout, 
  onAuthStateChanged, 
  type User, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  addDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  handleFirestoreError,
  OperationType
} from './firebase';

// --- Types ---
interface Course {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'Spoken English' | 'Computer' | 'AI';
}

interface Registration {
  id: string;
  name: string;
  phone: string;
  course: string;
  email: string;
  createdAt: any;
}

// --- Constants ---
const COURSES: Course[] = [
  // Spoken English
  { id: 'se-1', title: 'Basic English (Beginner)', description: 'Perfect for those starting their English journey.', icon: <MessageSquare className="w-6 h-6" />, category: 'Spoken English' },
  { id: 'se-2', title: 'Intermediate English', description: 'Enhance your vocabulary and sentence structure.', icon: <MessageSquare className="w-6 h-6" />, category: 'Spoken English' },
  { id: 'se-3', title: 'Advanced Spoken English', description: 'Master fluency and natural pronunciation.', icon: <MessageSquare className="w-6 h-6" />, category: 'Spoken English' },
  { id: 'se-4', title: 'Grammar Mastery Course', description: 'Deep dive into English grammar rules.', icon: <BookOpen className="w-6 h-6" />, category: 'Spoken English' },
  { id: 'se-5', title: 'Job Interview Prep', description: 'Crack your next interview with confidence.', icon: <Award className="w-6 h-6" />, category: 'Spoken English' },
  { id: 'se-6', title: 'Public Speaking', description: 'Overcome stage fear and speak like a pro.', icon: <Users className="w-6 h-6" />, category: 'Spoken English' },
  
  // Computer
  { id: 'c-1', title: 'Basic Computer (MS Office)', description: 'Learn Word, Excel, and PowerPoint.', icon: <Monitor className="w-6 h-6" />, category: 'Computer' },
  { id: 'c-2', title: 'Advanced Excel', description: 'Master data handling and complex formulas.', icon: <Layout className="w-6 h-6" />, category: 'Computer' },
  { id: 'c-3', title: 'Web Development', description: 'Build websites with HTML, CSS, and JS.', icon: <Globe className="w-6 h-6" />, category: 'Computer' },
  { id: 'c-4', title: 'Graphic Design Basics', description: 'Learn the fundamentals of visual design.', icon: <Smartphone className="w-6 h-6" />, category: 'Computer' },
  
  // AI
  { id: 'ai-1', title: 'AI Tools for Beginners', description: 'Introduction to the world of AI.', icon: <Cpu className="w-6 h-6" />, category: 'AI' },
  { id: 'ai-2', title: 'Prompt Engineering', description: 'Learn to talk to AI effectively.', icon: <Zap className="w-6 h-6" />, category: 'AI' },
  { id: 'ai-3', title: 'AI Content Creation', description: 'Create videos and blogs using AI.', icon: <Layout className="w-6 h-6" />, category: 'AI' },
];

const AI_TOOLS = [
  { name: 'ChatGPT', desc: 'Conversational AI' },
  { name: 'Google Gemini', desc: 'Multimodal AI' },
  { name: 'Canva', desc: 'AI-powered Design' },
  { name: 'Notion', desc: 'AI Workspace' },
  { name: 'Grammarly', desc: 'AI Writing Assistant' },
  { name: 'CapCut', desc: 'AI Video Editing' },
  { name: 'Midjourney', desc: 'AI Image Gen' },
  { name: 'Runway ML', desc: 'AI Video Gen' },
];

const FAQS = [
  {
    question: "What courses do you offer?",
    answer: "We offer a variety of courses including Spoken English (Basic to Advanced), Computer Basics (MS Office), Web Development, Graphic Design, and specialized AI Tool training."
  },
  {
    question: "How can I register for a course?",
    answer: "You can register online by signing in with your Google account on our website and filling out the registration form in the 'Register' section."
  },
  {
    question: "What are the course fees?",
    answer: "Course fees vary depending on the program. Please contact us via WhatsApp or visit our academy in Mahbubnagar for a detailed fee structure."
  },
  {
    question: "Do you provide certificates?",
    answer: "Yes, all our courses are government-recognized, and we provide certificates upon successful completion of the training."
  },
  {
    question: "Are online classes available?",
    answer: "Yes, we offer both online and offline (classroom) sessions to accommodate different learning preferences."
  },
  {
    question: "Where is the academy located?",
    answer: "We are located in Mahbubnagar, Telangana. You can find our exact location on the map in the 'Contact' section."
  }
];

// --- Components ---

const GlassCard = ({ children, className, delay = 0, ...props }: { children: React.ReactNode; className?: string; delay?: number; [key: string]: any }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className={cn(
      "bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl",
      className
    )}
    {...props}
  >
    {children}
  </motion.div>
);

const SectionHeading = ({ children, subtitle }: { children: React.ReactNode; subtitle?: string }) => (
  <div className="text-center mb-12">
    <motion.h2 
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight"
    >
      {children}
    </motion.h2>
    {subtitle && <p className="text-blue-200 text-lg">{subtitle}</p>}
    <div className="w-24 h-1 bg-blue-500 mx-auto mt-4 rounded-full" />
  </div>
);

const AccordionItem = ({ question, answer }: { question: string; answer: string; [key: string]: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-white/10 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left hover:text-blue-400 transition-colors"
      >
        <span className="text-lg font-medium">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-gray-400 leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'Spoken English' | 'Computer' | 'AI'>('Spoken English');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    course: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Sync user to Firestore
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            role: 'client'
          });
        }
        setUser(currentUser);
      } else {
        setUser(null);
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setRegistrations([]);
      return;
    }

    const q = query(
      collection(db, 'registrations'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const regs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Registration));
      setRegistrations(regs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'registrations');
    });

    return () => unsubscribe();
  }, [user]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please sign in to register!");
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'registrations'), {
        uid: user.uid,
        name: formData.name,
        phone: formData.phone,
        course: formData.course,
        email: user.email,
        createdAt: serverTimestamp(),
      });
      setSubmitSuccess(true);
      setFormData({ name: '', phone: '', course: '' });
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'registrations');
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0b1e] text-white font-sans selection:bg-blue-500 selection:text-white">
      {/* Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/20 blur-[120px] rounded-full" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0b1e]/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollTo('home')}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <BookOpen className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">AJS Spoken English</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {['Home', 'Courses', 'AI Tools', 'FAQ', 'Register', 'Contact'].map((item) => (
              <button 
                key={item} 
                onClick={() => scrollTo(item.toLowerCase().replace(' ', '-'))}
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                {item}
              </button>
            ))}
            {isAuthReady && (
              user ? (
                <div className="flex items-center gap-4 pl-4 border-l border-white/10">
                  <img src={user.photoURL || ''} alt="User" className="w-8 h-8 rounded-full border border-white/20" />
                  <button onClick={logout} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <LogOut className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={signInWithGoogle}
                  className="bg-white text-black px-6 py-2 rounded-full text-sm font-bold hover:bg-blue-50 transition-all"
                >
                  Sign In
                </button>
              )
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[#0a0b1e] border-b border-white/10 overflow-hidden"
            >
              <div className="flex flex-col p-4 gap-4">
                {['Home', 'Courses', 'AI Tools', 'FAQ', 'Register', 'Contact'].map((item) => (
                  <button 
                    key={item} 
                    onClick={() => scrollTo(item.toLowerCase().replace(' ', '-'))}
                    className="text-left py-2 text-gray-300"
                  >
                    {item}
                  </button>
                ))}
                {!user && (
                  <button onClick={signInWithGoogle} className="w-full bg-white text-black py-3 rounded-xl font-bold">
                    Sign In with Google
                  </button>
                )}
                {user && (
                  <button onClick={logout} className="w-full bg-red-500/20 text-red-400 py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative pt-40 pb-20 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              <span>Best Spoken English Academy in Mahbubnagar, Telangana</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
              Master English in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Mahbubnagar</span> with AJS
            </h1>
            <p className="text-xl text-gray-400 mb-10 max-w-lg">
              Unlock your potential at AJS Spoken English & Computer Academy. The #1 training center in Telangana, India for English, AI, and Tech skills.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => scrollTo('register')}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-2xl font-bold text-lg shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2"
              >
                Enroll Now <ArrowRight className="w-5 h-5" />
              </button>
              <a 
                href="https://wa.me/919676730617" 
                target="_blank" 
                rel="noreferrer"
                className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold text-lg transition-all flex items-center gap-2"
              >
                WhatsApp Us <ChevronRight className="w-5 h-5" />
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative"
          >
            <div className="relative z-10 w-full aspect-square flex items-center justify-center">
              {/* 3D-like floating elements */}
              <motion.div 
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl rotate-12 shadow-2xl flex items-center justify-center"
              >
                <BookOpen className="w-16 h-16 text-white" />
              </motion.div>
              <motion.div 
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-10 left-0 w-24 h-24 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl -rotate-12 shadow-2xl flex items-center justify-center"
              >
                <Cpu className="w-12 h-12 text-blue-400" />
              </motion.div>
              <div className="w-64 h-64 bg-blue-600/30 blur-[100px] rounded-full absolute" />
              <div className="relative z-20 p-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-[40px] shadow-2xl">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/10 rounded-2xl">
                    <div className="text-3xl font-bold text-blue-400">100%</div>
                    <div className="text-xs text-gray-400 uppercase tracking-widest">Success Rate</div>
                  </div>
                  <div className="p-4 bg-white/10 rounded-2xl">
                    <div className="text-3xl font-bold text-purple-400">500+</div>
                    <div className="text-xs text-gray-400 uppercase tracking-widest">Students</div>
                  </div>
                  <div className="p-4 bg-white/10 rounded-2xl col-span-2 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold">Certified Courses</div>
                      <div className="text-xs text-gray-400">Govt. Recognized</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="py-24 px-4 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <SectionHeading subtitle="Choose from our wide range of professional courses">Our Courses</SectionHeading>
          
          <div className="flex justify-center gap-4 mb-12">
            {['Spoken English', 'Computer', 'AI'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={cn(
                  "px-6 py-2 rounded-full text-sm font-bold transition-all",
                  activeTab === tab 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                    : "bg-white/5 text-gray-400 hover:bg-white/10"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <AnimatePresence>
              {COURSES.filter(c => c.category === activeTab).map((course, idx) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                >
                  <GlassCard className="h-full hover:border-blue-500/50 transition-colors group cursor-pointer">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                      {course.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-3">{course.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed mb-6">
                      {course.description}
                    </p>
                    <button 
                      onClick={() => {
                        setFormData({ ...formData, course: course.title });
                        scrollTo('register');
                      }}
                      className="text-blue-400 font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all"
                    >
                      Learn More <ChevronRight className="w-4 h-4" />
                    </button>
                  </GlassCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* AI Tools Section */}
      <section id="ai-tools" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <SectionHeading subtitle="Master the future with these cutting-edge tools">AI Tools We Teach</SectionHeading>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {AI_TOOLS.map((tool, idx) => (
              <GlassCard key={tool.name} delay={idx * 0.05} className="text-center hover:bg-white/15 transition-colors">
                <div className="text-lg font-bold text-white mb-1">{tool.name}</div>
                <div className="text-xs text-blue-400 uppercase tracking-widest">{tool.desc}</div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-4 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto">
          <SectionHeading subtitle="Find answers to common questions about AJS Academy">Frequently Asked Questions</SectionHeading>
          <GlassCard className="p-0 overflow-hidden">
            <div className="divide-y divide-white/10 px-8">
              {FAQS.map((faq, idx) => (
                <AccordionItem key={idx} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </GlassCard>
          <div className="mt-12 text-center">
            <p className="text-gray-400 mb-4">Still have questions?</p>
            <button 
              onClick={() => scrollTo('contact')}
              className="inline-flex items-center gap-2 text-blue-400 font-bold hover:gap-3 transition-all"
            >
              Contact our support team <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Registration Section */}
      <section id="register" className="py-24 px-4 relative">
        <div className="max-w-3xl mx-auto">
          <SectionHeading subtitle="Fill the form below to book your seat">Online Registration</SectionHeading>
          
          {!user ? (
            <GlassCard className="text-center py-12">
              <UserIcon className="w-16 h-16 text-blue-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold mb-4">Sign In Required</h3>
              <p className="text-gray-400 mb-8">Please sign in with your Google account to register for a course.</p>
              <button 
                onClick={signInWithGoogle}
                className="bg-white text-black px-10 py-4 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-all flex items-center gap-3 mx-auto"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="Google" />
                Sign In with Google
              </button>
            </GlassCard>
          ) : (
            <GlassCard>
              {submitSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                  </div>
                  <h3 className="text-3xl font-bold mb-4">Registration Successful!</h3>
                  <p className="text-gray-400">We have received your application. Our team will contact you shortly.</p>
                  <button 
                    onClick={() => setSubmitSuccess(false)}
                    className="mt-8 text-blue-400 font-bold"
                  >
                    Register for another course
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleRegister} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-400">Full Name</label>
                      <input 
                        required
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="Enter your name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-400">Phone Number</label>
                      <input 
                        required
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Select Course</label>
                    <select 
                      required
                      value={formData.course}
                      onChange={(e) => setFormData({...formData, course: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                    >
                      <option value="" disabled className="bg-[#0a0b1e]">Choose a course</option>
                      {COURSES.map(c => (
                        <option key={c.id} value={c.title} className="bg-[#0a0b1e]">{c.title}</option>
                      ))}
                    </select>
                  </div>
                  <button 
                    disabled={isSubmitting}
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-blue-500/20"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Registration"}
                  </button>
                </form>
              )}
            </GlassCard>
          )}

          {/* User's Registrations */}
          {user && registrations.length > 0 && (
            <div className="mt-12">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-400" /> Your Registrations
              </h3>
              <div className="space-y-4">
                {registrations.map((reg) => (
                  <GlassCard key={reg.id} className="p-4 flex items-center justify-between bg-white/5">
                    <div>
                      <div className="font-bold">{reg.course}</div>
                      <div className="text-xs text-gray-400">Registered on: {reg.createdAt?.toDate().toLocaleDateString()}</div>
                    </div>
                    <div className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full">
                      Active
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 px-4 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <SectionHeading subtitle="Get in touch with us for any queries">Contact Us</SectionHeading>
          <div className="grid md:grid-cols-3 gap-8">
            <GlassCard className="text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Phone className="w-6 h-6 text-blue-400" />
              </div>
              <h4 className="font-bold mb-2">Call Us</h4>
              <p className="text-gray-400">8328098813</p>
              <p className="text-gray-400">9676730617 (WhatsApp)</p>
            </GlassCard>
            <GlassCard className="text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-6 h-6 text-purple-400" />
              </div>
              <h4 className="font-bold mb-2">Email Us</h4>
              <p className="text-gray-400">mohdzakirmustafa1@gmail.com</p>
            </GlassCard>
            <GlassCard className="text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-6 h-6 text-blue-400" />
              </div>
              <h4 className="font-bold mb-2">Location</h4>
              <p className="text-gray-400">Mahbubnagar, Telangana</p>
              <p className="text-gray-400">Online + Offline Classes</p>
            </GlassCard>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-6">
            <a href="https://meet.google.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-6 py-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Join Google Meet
            </a>
            <a href="https://zoom.us" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-6 py-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              Join Zoom Class
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BookOpen className="text-white w-4 h-4" />
            </div>
            <span className="text-lg font-bold">AJS Spoken English Mahbubnagar</span>
          </div>
          <div className="text-gray-500 text-sm">
            © 2026 AJS Spoken English & Computer Academy. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a 
        href="https://wa.me/919676730617" 
        target="_blank" 
        rel="noreferrer"
        className="fixed bottom-8 right-8 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/40 hover:scale-110 transition-transform z-50 group"
      >
        <Smartphone className="w-8 h-8 text-white" />
        <span className="absolute right-20 bg-white text-black px-4 py-2 rounded-xl text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Chat on WhatsApp
        </span>
      </a>
    </div>
  );
}
