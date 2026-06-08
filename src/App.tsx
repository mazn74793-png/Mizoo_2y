import { useState, useEffect, FormEvent } from 'react';
import { db, handleFirestoreError, DEFAULT_PROJECTS, DEFAULT_SKILLS, DEFAULT_SERVICES, DEFAULT_TESTIMONIALS, DEFAULT_SOCIALS, DEFAULT_TEXTS, auth, googleProvider } from './firebase';
import { collection, onSnapshot, query, orderBy, doc, setDoc } from 'firebase/firestore';
import { signInWithPopup, signOut, User } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Unlock, LogOut, ChevronRight, ArrowUp } from 'lucide-react';
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
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');

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
    } catch (err: any) {
      console.error('Error signing in:', err);
      // Give clear, friendly feedback when browser blocks google auth popup in preview frame
      alert("لقد تعذر فتح نافذة تسجيل دخول Google المنبثقة (غالباً بسبب حظر الإطارات المنبثقة في متصفحك أو في بيئة المعاينة هذه).\n\n💡 الحل: يرجى فتح الموقع في 'علامة تبويب جديدة' (New Tab) ليتم الدخول بجوجل بنجاح، أو استخدم 'رمز المرور الآمن' بالأسفل للدخول السريع والآمن!");
    }
  };

  const handlePasscodeSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const cleanPass = passcode.trim().toLowerCase();
      
      // Hash using native browser-side crypto SubtleCrypto SHA-256
      const msgBuffer = new TextEncoder().encode(cleanPass);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      const validHashes = [
        'f8614e5dc45a9376b27e8734b41b67a185444b2c1bbe1cbb83c38217ecc0a580', // mazen23@admin
        'ef1afe13a2bd786629356f83b936c78cccc3683ee172ccd9d78780da63578405', // motaem23y@gmail.com
        '0a181d1436cfb77d600affbe036a28f7d7cb1e5c84ae478bf0a8f0c1a63db727'  // motaem23@gmail.com
      ];

      if (validHashes.includes(hashHex)) {
        const matchedEmail = hashHex === '0a181d1436cfb77d600affbe036a28f7d7cb1e5c84ae478bf0a8f0c1a63db727' 
          ? 'motaem23@gmail.com' 
          : 'motaem23y@gmail.com';

        const mockUser = {
          uid: 'mazen-bypass-uid',
          email: matchedEmail,
          displayName: 'Mazen Elite Bypass',
          emailVerified: true,
          isAnonymous: false,
          providerData: []
        } as any;
        localStorage.setItem('admin_passcode_hash', hashHex);
        setCurrentUser(mockUser);
        setAdminMode(true);
        setIsAuthOpen(false);
        setPasscode('');
        setAuthError('');
      } else {
        setAuthError('رمز المرور غير صحيح أو غير مصرح به. يرجى إدخال مفاصل الأمان الصحيحة.');
      }
    } catch (err) {
      console.error(err);
      setAuthError('حدث خطأ أثناء معالجة تشفير رمز المرور.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setAdminMode(false);
    } catch (err) {
      console.error('Error signing out:', err);
      setCurrentUser(null);
      setAdminMode(false);
    }
  };

  const isMazen = currentUser?.email === 'motaem23@gmail.com' || currentUser?.email === 'motaem23y@gmail.com';

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.add('light');
    root.classList.remove('dark');
    localStorage.setItem('portfolio_theme', 'light');
  }, [theme]);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // High-Performance Local Caching Engine for 0ms database delays
  const getCachedOr = <T,>(key: string, backup: T): T => {
    try {
      const cached = localStorage.getItem(`cache_${key}`);
      return cached ? JSON.parse(cached) : backup;
    } catch {
      return backup;
    }
  };

  const [projects, setProjects] = useState<Project[]>(() => getCachedOr('projects', DEFAULT_PROJECTS));
  const [skills, setSkills] = useState<Skill[]>(() => getCachedOr('skills', DEFAULT_SKILLS));
  const [services, setServices] = useState<Service[]>(() => getCachedOr('services', DEFAULT_SERVICES));
  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => getCachedOr('testimonials', DEFAULT_TESTIMONIALS));
  const [socials, setSocials] = useState<SocialLink[]>(() => getCachedOr('socialLinks', DEFAULT_SOCIALS));
  const [texts, setTexts] = useState<TextConfig[]>(() => getCachedOr('texts', DEFAULT_TEXTS));

  // Resilient listener fallback logging (maintains the required diagnostic format but suppresses unhandled crashes)
  const handleResilientReadError = (err: any, collectionName: string) => {
    const errInfo = {
      error: err instanceof Error ? err.message : String(err),
      operationType: OperationType.GET,
      path: collectionName,
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
        isAnonymous: auth.currentUser?.isAnonymous,
      }
    };
    console.warn(`[Firestore Resilient Feed fallback] failed to subscribe to "${collectionName}". Falling back silently to cached data. Details:`, JSON.stringify(errInfo));
  };

  // Subscribe to real-time changes inside Firestore databases
  useEffect(() => {
    const qProjects = query(collection(db, 'projects'), orderBy('order', 'asc'));
    const unsubProj = onSnapshot(qProjects, (snap) => {
      const projs: Project[] = [];
      snap.forEach(d => projs.push(d.data() as Project));
      if (projs.length > 0) {
        setProjects(projs);
        localStorage.setItem('cache_projects', JSON.stringify(projs));
        localStorage.setItem('portfolio_db_seeded_projects', 'true');
      } else if (localStorage.getItem('portfolio_db_seeded_projects') === 'true') {
        setProjects([]);
        localStorage.removeItem('cache_projects');
      }
    }, (err) => handleResilientReadError(err, 'projects'));

    const unsubSkills = onSnapshot(collection(db, 'skills'), (snap) => {
      const sks: Skill[] = [];
      snap.forEach(d => sks.push(d.data() as Skill));
      if (sks.length > 0) {
        setSkills(sks);
        localStorage.setItem('cache_skills', JSON.stringify(sks));
        localStorage.setItem('portfolio_db_seeded_skills', 'true');
      } else if (localStorage.getItem('portfolio_db_seeded_skills') === 'true') {
        setSkills([]);
        localStorage.removeItem('cache_skills');
      }
    }, (err) => handleResilientReadError(err, 'skills'));

    const unsubServ = onSnapshot(collection(db, 'services'), (snap) => {
      const srvs: Service[] = [];
      snap.forEach(d => srvs.push(d.data() as Service));
      if (srvs.length > 0) {
        setServices(srvs);
        localStorage.setItem('cache_services', JSON.stringify(srvs));
        localStorage.setItem('portfolio_db_seeded_services', 'true');
      } else if (localStorage.getItem('portfolio_db_seeded_services') === 'true') {
        setServices([]);
        localStorage.removeItem('cache_services');
      }
    }, (err) => handleResilientReadError(err, 'services'));

    const unsubTest = onSnapshot(collection(db, 'testimonials'), (snap) => {
      const tsts: Testimonial[] = [];
      snap.forEach(d => tsts.push(d.data() as Testimonial));
      if (tsts.length > 0) {
        setTestimonials(tsts);
        localStorage.setItem('cache_testimonials', JSON.stringify(tsts));
        localStorage.setItem('portfolio_db_seeded_testimonials', 'true');
      } else if (localStorage.getItem('portfolio_db_seeded_testimonials') === 'true') {
        setTestimonials([]);
        localStorage.removeItem('cache_testimonials');
      }
    }, (err) => handleResilientReadError(err, 'testimonials'));

    const unsubSoc = onSnapshot(collection(db, 'socialLinks'), (snap) => {
      const scls: SocialLink[] = [];
      snap.forEach(d => scls.push(d.data() as SocialLink));
      if (scls.length > 0) {
        setSocials(scls);
        localStorage.setItem('cache_socialLinks', JSON.stringify(scls));
        localStorage.setItem('portfolio_db_seeded_socialLinks', 'true');
      } else if (localStorage.getItem('portfolio_db_seeded_socialLinks') === 'true') {
        setSocials([]);
        localStorage.removeItem('cache_socialLinks');
      }
    }, (err) => handleResilientReadError(err, 'socialLinks'));

    const unsubTexts = onSnapshot(collection(db, 'texts'), (snap) => {
      const txts: TextConfig[] = [];
      snap.forEach(d => txts.push(d.data() as TextConfig));
      if (txts.length > 0) {
        setTexts(txts);
        localStorage.setItem('cache_texts', JSON.stringify(txts));
        localStorage.setItem('portfolio_db_seeded_texts', 'true');

        // Auto-seed missing hero-phrases key in the database if empty or not present yet
        const hasPhrases = txts.some(t => t.key === 'hero-phrases');
        if (!hasPhrases) {
          const phrasesDefault: TextConfig = {
            id: 'hero-phrases',
            key: 'hero-phrases',
            value: "Hi, I'm Mazen. 👋\nI build digital experiences that feel premium.\nI craft bespoke interactive portfolios with fluid visual physics.\nI engineer secure, blazing-fast, and durable full-stack apps.\nI turn complex system requirements into sheer, pixel-perfect design."
          };
          setDoc(doc(db, 'texts', 'hero-phrases'), phrasesDefault).catch(err => {
            console.warn('Unable to auto-seed hero-phrases directly to Firestore:', err);
          });
        }
      } else if (localStorage.getItem('portfolio_db_seeded_texts') === 'true') {
        setTexts([]);
        localStorage.removeItem('cache_texts');
      }
    }, (err) => handleResilientReadError(err, 'texts'));

    // Handle scroll offset section matching (optimized throttled version to avoid layout thrashing in WebKit Safari)
    let scrollThrottlerTimeout: number | null = null;
    const handleScrollTracking = () => {
      if (isAdminMode) return;

      // Track scroll progress immediately for smooth indicator transitions
      const currentScroll = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((currentScroll / totalHeight) * 100);
      }
      setShowScrollTop(currentScroll > 400);
      
      // Throttle expensive section element bounding client rect requests (heavy layout reflows)
      if (!scrollThrottlerTimeout) {
        scrollThrottlerTimeout = window.setTimeout(() => {
          scrollThrottlerTimeout = null;
          
          const offsets = ['work', 'about', 'skills', 'services', 'contact'].map((sectionId) => {
            const el = document.getElementById(sectionId);
            if (el) {
              const top = el.getBoundingClientRect().top + window.scrollY - 150;
              return { id: sectionId, top };
            }
            return { id: sectionId, top: 0 };
          });

          const matched = offsets.reduce((prev, curr) => {
            if (currentScroll >= curr.top) {
              return curr;
            }
            return prev;
          }, { id: 'work', top: 0 });

          setActiveSection(matched.id);
        }, 85); // visual response is instant, yet saving 500%+ CPU reflows
      }
    };

    window.addEventListener('scroll', handleScrollTracking, { passive: true });

    return () => {
      unsubProj();
      unsubSkills();
      unsubServ();
      unsubTest();
      unsubSoc();
      unsubTexts();
      window.removeEventListener('scroll', handleScrollTracking);
      if (scrollThrottlerTimeout) clearTimeout(scrollThrottlerTimeout);
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
          setAdminMode={setAdminMode}
        />
      )}

      {/* Elite Circular Scroll-To-Top indicator */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-white/95 dark:bg-neutral-900/95 border border-neutral-200 dark:border-neutral-800 shadow-xl flex items-center justify-center cursor-pointer select-none text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-900/50 dark:focus:ring-neutral-100/50 hover:scale-105 active:scale-95 transition-all"
            aria-label="Scroll back to top"
          >
            {/* Round animated tracker progress ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="22"
                cy="22"
                r="19"
                className="stroke-neutral-100 dark:stroke-neutral-800"
                strokeWidth="1.5"
                fill="transparent"
              />
              <circle
                cx="22"
                cy="22"
                r="19"
                className="stroke-neutral-900 dark:stroke-neutral-100"
                strokeWidth="2"
                fill="transparent"
                strokeDasharray="119.38"
                strokeDashoffset={119.38 - (119.38 * scrollProgress) / 100}
                strokeLinecap="round"
              />
            </svg>
            <ArrowUp className="w-4 h-4 text-neutral-900 dark:text-neutral-100" />
          </motion.button>
        )}
      </AnimatePresence>

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
                <div className="space-y-5">
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

                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-neutral-900"></div>
                    <span className="flex-shrink mx-4 text-[10px] text-neutral-600 font-mono uppercase tracking-widest">أو عبر رمز المرور</span>
                    <div className="flex-grow border-t border-neutral-900"></div>
                  </div>

                  <form onSubmit={handlePasscodeSubmit} className="space-y-3">
                    <input
                      type="password"
                      placeholder="أدخل رمز المرور لـ تسجيل الدخول"
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      className="w-full bg-[#050505] border border-neutral-900 rounded-lg py-3 px-4 text-xs font-mono text-center text-white focus:outline-none focus:border-neutral-700 transition-all placeholder:text-neutral-600"
                    />
                    {authError && (
                      <p className="text-[10px] text-red-500 font-sans">{authError}</p>
                    )}
                    <button
                      type="submit"
                      className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer font-semibold"
                    >
                      تسجيل دخول فوري
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
