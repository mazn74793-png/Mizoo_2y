import { useState, useEffect } from 'react';
import { db, handleFirestoreError, DEFAULT_PROJECTS, DEFAULT_SKILLS, DEFAULT_SERVICES, DEFAULT_TESTIMONIALS, DEFAULT_SOCIALS, DEFAULT_TEXTS, auth, googleProvider } from './firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { signInWithPopup, signOut, User } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Unlock, LogOut, ChevronRight } from 'lucide-react';
import { Project, Skill, Service, Testimonial, SocialLink, TextConfig, OperationType } from './types';

// Component imports
import CustomCursor from './components/CustomCursor';
import IntroScreen from './components/IntroScreen';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import Skills from './components/Skills';
import Services from './components/Services';
import Timeline from './components/Timeline';
import Testimonials from './components/Testimonials';
import Contact from './components/Contact';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  const [introPassed, setIntroPassed] = useState(false);
  const [isAdminMode, setAdminMode] = useState(false);
  const [activeSection, setActiveSection] = useState('work');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Lock system to elegant Alabaster Light Mode as requested
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setIsAuthOpen(false);
    } catch (err) {
      console.error('Error signing in:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setAdminMode(false);
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  const isMazen = currentUser?.email === 'motaem23@gmail.com' || currentUser?.email === 'motaem23y@gmail.com';

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.add('light');
    root.classList.remove('dark');
    localStorage.setItem('portfolio_theme', 'light');
  }, [theme]);

  // Unified Database Cache states (Defaulting to hardcoded presets per Pillar guidelines if snap is booting)
  const [projects, setProjects] = useState<Project[]>(DEFAULT_PROJECTS);
  const [skills, setSkills] = useState<Skill[]>(DEFAULT_SKILLS);
  const [services, setServices] = useState<Service[]>(DEFAULT_SERVICES);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(DEFAULT_TESTIMONIALS);
  const [socials, setSocials] = useState<SocialLink[]>(DEFAULT_SOCIALS);
  const [texts, setTexts] = useState<TextConfig[]>(DEFAULT_TEXTS);

  // Subscribe to real-time changes inside Firestore databases
  useEffect(() => {
    const qProjects = query(collection(db, 'projects'), orderBy('order', 'asc'));
    const unsubProj = onSnapshot(qProjects, (snap) => {
      const projs: Project[] = [];
      snap.forEach(d => projs.push(d.data() as Project));
      if (projs.length > 0) {
        setProjects(projs);
        localStorage.setItem('portfolio_db_seeded_projects', 'true');
      } else if (localStorage.getItem('portfolio_db_seeded_projects') === 'true') {
        setProjects([]);
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, 'projects'));

    const unsubSkills = onSnapshot(collection(db, 'skills'), (snap) => {
      const sks: Skill[] = [];
      snap.forEach(d => sks.push(d.data() as Skill));
      if (sks.length > 0) {
        setSkills(sks);
        localStorage.setItem('portfolio_db_seeded_skills', 'true');
      } else if (localStorage.getItem('portfolio_db_seeded_skills') === 'true') {
        setSkills([]);
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, 'skills'));

    const unsubServ = onSnapshot(collection(db, 'services'), (snap) => {
      const srvs: Service[] = [];
      snap.forEach(d => srvs.push(d.data() as Service));
      if (srvs.length > 0) {
        setServices(srvs);
        localStorage.setItem('portfolio_db_seeded_services', 'true');
      } else if (localStorage.getItem('portfolio_db_seeded_services') === 'true') {
        setServices([]);
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, 'services'));

    const unsubTest = onSnapshot(collection(db, 'testimonials'), (snap) => {
      const tsts: Testimonial[] = [];
      snap.forEach(d => tsts.push(d.data() as Testimonial));
      if (tsts.length > 0) {
        setTestimonials(tsts);
        localStorage.setItem('portfolio_db_seeded_testimonials', 'true');
      } else if (localStorage.getItem('portfolio_db_seeded_testimonials') === 'true') {
        setTestimonials([]);
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, 'testimonials'));

    const unsubSoc = onSnapshot(collection(db, 'socialLinks'), (snap) => {
      const scls: SocialLink[] = [];
      snap.forEach(d => scls.push(d.data() as SocialLink));
      if (scls.length > 0) {
        setSocials(scls);
        localStorage.setItem('portfolio_db_seeded_socialLinks', 'true');
      } else if (localStorage.getItem('portfolio_db_seeded_socialLinks') === 'true') {
        setSocials([]);
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, 'socialLinks'));

    const unsubTexts = onSnapshot(collection(db, 'texts'), (snap) => {
      const txts: TextConfig[] = [];
      snap.forEach(d => txts.push(d.data() as TextConfig));
      if (txts.length > 0) {
        setTexts(txts);
        localStorage.setItem('portfolio_db_seeded_texts', 'true');
      } else if (localStorage.getItem('portfolio_db_seeded_texts') === 'true') {
        setTexts([]);
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, 'texts'));

    // Handle scroll offset section matching
    const handleScrollTracking = () => {
      if (isAdminMode) return;
      
      const offsets = ['work', 'about', 'skills', 'services', 'contact'].map((sectionId) => {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY - 150;
          return { id: sectionId, top };
        }
        return { id: sectionId, top: 0 };
      });

      const currentScroll = window.scrollY;
      const matched = offsets.reduce((prev, curr) => {
        if (currentScroll >= curr.top) {
          return curr;
        }
        return prev;
      }, { id: 'work', top: 0 });

      setActiveSection(matched.id);
    };

    window.addEventListener('scroll', handleScrollTracking);

    return () => {
      unsubProj();
      unsubSkills();
      unsubServ();
      unsubTest();
      unsubSoc();
      unsubTexts();
      window.removeEventListener('scroll', handleScrollTracking);
    };
  }, [isAdminMode]);

  // Handle smooth scroll clicks
  const scrollToSection = (id: string) => {
    setAdminMode(false);
    const element = document.getElementById(id);
    if (element) {
      const topOffset = element.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({
        top: topOffset,
        behavior: 'smooth',
      });
    }
  };

  if (!introPassed) {
    const heroImage = texts.find(t => t.key === 'hero-image')?.value || '/src/assets/images/motaem_cutout_1779628899218.png';
    return <IntroScreen onComplete={() => setIntroPassed(true)} heroImage={heroImage} />;
  }

  return (
    <div className={`min-h-screen font-sans transition-colors duration-150 ${theme === 'dark' ? 'bg-[#050505] text-white selection:bg-white selection:text-black' : 'bg-[#fbfbfa] text-neutral-900 selection:bg-neutral-900 selection:text-white'}`}>
      {/* Precision Micro-interactions Cursor */}
      <CustomCursor />

      {/* Luxury Sticky Navbar */}
      <Navbar 
        isAdminMode={isAdminMode} 
        setAdminMode={setAdminMode}
        activeSection={activeSection}
        scrollToSection={scrollToSection}
        theme={theme}
        setTheme={setTheme}
      />

      {/* Main Container Views Toggle */}
      {!isAdminMode ? (
        <main className="relative flex flex-col">
          {/* Main sections block */}
          <Hero texts={texts} scrollToSection={scrollToSection} theme={theme} />
          <Projects projects={projects} />
          <About texts={texts} />
          <Skills skills={skills} />
          <Services services={services} />
          <Timeline />
          <Testimonials testimonials={testimonials} />
          <Contact 
            socials={socials} 
            isAdminMode={isAdminMode}
            setAdminMode={setAdminMode}
            currentUser={currentUser}
            isMazen={isMazen}
            setIsAuthOpen={setIsAuthOpen}
          />
        </main>
      ) : (
        <AdminDashboard 
          projects={projects}
          skills={skills}
          services={services}
          testimonials={testimonials}
          socials={socials}
          texts={texts}
        />
      )}

      {/* Auth Modal Tunnel */}
      <AnimatePresence>
        {isAuthOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="bg-neutral-950 border border-neutral-900 rounded-xl p-8 max-w-sm w-full text-center relative shadow-2xl"
            >
              <button 
                onClick={() => setIsAuthOpen(false)}
                className="absolute top-4 right-4 text-neutral-500 hover:text-white text-sm font-mono cursor-pointer bg-transparent border-none"
              >
                ✕
              </button>

              <div id="auth-header-lock" className="w-12 h-12 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-neutral-800">
                {currentUser && isMazen ? (
                  <Unlock className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Lock className="w-5 h-5 text-neutral-400" />
                )}
              </div>

              <h3 className="text-lg font-sans tracking-tight font-medium text-white mb-2">
                System Console Access
              </h3>
              <p className="text-xs text-neutral-500 font-mono mb-6 leading-relaxed">
                Unlock editing privileges and real-time database management tools.
              </p>

              {currentUser ? (
                <div className="space-y-4">
                  <div className="bg-neutral-900/50 p-4 rounded-lg border border-neutral-900 text-left font-mono text-[11px] text-neutral-400">
                    <p className="mb-1 text-white truncate"><span className="text-neutral-500 font-sans">User:</span> {currentUser.displayName}</p>
                    <p className="truncate"><span className="text-neutral-500 font-sans">Email:</span> {currentUser.email}</p>
                    <p className="mt-2 flex items-center space-x-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${isMazen ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      <span>{isMazen ? 'Access Authorized' : 'Access Denied: Unregistered Account'}</span>
                    </p>
                  </div>

                  {isMazen && (
                    <button
                      onClick={() => {
                        setAdminMode(true);
                        setIsAuthOpen(false);
                      }}
                      className="w-full flex items-center justify-center space-x-2 text-xs font-mono tracking-wider uppercase bg-white text-black hover:bg-neutral-200 py-3 rounded-lg transition-all font-semibold cursor-pointer border-none"
                    >
                      <span>Enter Control Room</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center space-x-2 text-xs font-mono tracking-wider uppercase bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white py-3 rounded-lg transition-all cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Disconnect Console</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleSignIn}
                  className="w-full flex items-center justify-center space-x-3 text-xs font-mono tracking-wider uppercase bg-white text-black hover:bg-neutral-200 py-4 rounded-lg transition-all font-semibold cursor-pointer border-none"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                  </svg>
                  <span>Authenticate with Google</span>
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
