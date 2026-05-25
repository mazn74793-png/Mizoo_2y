import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut, User } from 'firebase/auth';
import { Lock, Unlock, LogOut, ChevronRight, Settings, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  isAdminMode: boolean;
  setAdminMode: (mode: boolean) => void;
  activeSection: string;
  scrollToSection: (id: string) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export default function Navbar({ isAdminMode, setAdminMode, activeSection, scrollToSection, theme, setTheme }: NavbarProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });

    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      unsubscribe();
      window.removeEventListener('scroll', handleScroll);
    };
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

  return (
    <>
      <motion.header
        id="navbar-header"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled 
            ? theme === 'dark'
              ? 'bg-black/60 border-b border-neutral-900/50 backdrop-blur-md py-4' 
              : 'bg-white/70 border-b border-neutral-200/50 backdrop-blur-md py-4'
            : 'bg-transparent py-6'
        }`}
      >
        <div className="w-full max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          
          {/* Logo Brand Title */}
          <div 
            onClick={() => { setAdminMode(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="flex items-center space-x-2 cursor-pointer group"
          >
            <span className={`text-sm font-sans tracking-[0.25em] font-light uppercase transition-colors ${theme === 'dark' ? 'text-white' : 'text-neutral-900'}`}>
              MAZEN
            </span>
            <span className={`w-1.5 h-1.5 rounded-full transition-colors ${theme === 'dark' ? 'bg-white' : 'bg-neutral-900'}`} />
            <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
              ELITE
            </span>
          </div>

          {/* Luxury Section Navigation Links */}
          {!isAdminMode ? (
            <nav className="hidden md:flex items-center space-x-8">
              {['work', 'about', 'skills', 'services', 'contact'].map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className={`text-xs font-mono tracking-wider uppercase transition-colors relative py-1 cursor-pointer ${
                    activeSection === section 
                      ? theme === 'dark' ? 'text-white' : 'text-neutral-900 font-semibold' 
                      : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  {section}
                  {activeSection === section && (
                    <motion.span
                      layoutId="activeIndicator"
                      className={`absolute bottom-0 left-0 right-0 h-[1.5px] ${theme === 'dark' ? 'bg-white' : 'bg-neutral-900'}`}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </nav>
          ) : (
            <div className="hidden md:flex items-center space-x-3 text-xs font-mono text-neutral-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>LOGGED IN AS ADMIN CONTROL PANEL</span>
            </div>
          )}

          {/* Actions Column (Console / Admin Tunnel / Theme Toggle) */}
          <div className="flex items-center space-x-4">
            {currentUser && isMazen && (
              <button
                onClick={() => setAdminMode(!isAdminMode)}
                className={`flex items-center space-x-1.5 text-xs font-mono tracking-wider uppercase px-3 py-1.5 rounded border transition-all ${
                  isAdminMode 
                    ? 'bg-white text-black border-white hover:bg-neutral-200' 
                    : 'bg-neutral-900/50 text-white border-neutral-800 hover:bg-neutral-800'
                }`}
              >
                {isAdminMode ? <Settings className="w-3 h-3 animate-spin-slow" /> : <Lock className="w-3 h-3" />}
                <span>{isAdminMode ? 'Exit Admin' : 'Admin'}</span>
              </button>
            )}

            <button
              onClick={() => {
                if (currentUser) {
                  setIsAuthOpen(!isAuthOpen);
                } else {
                  setIsAuthOpen(true);
                }
              }}
              className="flex items-center space-x-1.5 text-xs font-mono tracking-wider uppercase text-neutral-400 hover:text-white transition-colors"
            >
              {currentUser ? (
                <div className="flex items-center space-x-2">
                  <img 
                    src={currentUser.photoURL || ''} 
                    alt="User" 
                    className="w-5 h-5 rounded-full border border-neutral-800"
                    referrerPolicy="no-referrer"
                  />
                  <span className="hidden sm:inline-block max-w-[80px] truncate text-[11px]">
                    {isMazen ? 'Mazen' : currentUser.displayName?.split(' ')[0]}
                  </span>
                </div>
              ) : (
                <span className="border border-neutral-800 hover:border-neutral-700 bg-neutral-950 px-3 py-1.5 rounded transition-all text-neutral-300">
                  Console
                </span>
              )}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Auth Modal Tunnel */}
      <AnimatePresence>
        {isAuthOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="bg-neutral-950 border border-neutral-900 rounded-xl p-8 max-w-sm w-full text-center relative shadow-2xl"
            >
              <button 
                onClick={() => setIsAuthOpen(false)}
                className="absolute top-4 right-4 text-neutral-500 hover:text-white text-sm font-mono"
              >
                ✕
              </button>

              <div id="auth-header-lock" className="w-12 h-12 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-4">
                {currentUser && isMazen ? (
                  <Unlock className="w-5 h-5 text-neutral-300" />
                ) : (
                  <Lock className="w-5 h-5 text-neutral-400" />
                )}
              </div>

              <h3 className="text-lg font-sans tracking-tight font-medium text-white mb-2">
                System Console Access
              </h3>
              <p className="text-xs text-neutral-500 font-mono mb-6 leading-relaxed">
                Unlock editing privileges and real-time portfolio management tools.
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
                      className="w-full flex items-center justify-center space-x-2 text-xs font-mono tracking-wider uppercase bg-white text-black hover:bg-neutral-200 py-3 rounded-lg transition-all font-semibold"
                    >
                      <span>Enter Control Room</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center space-x-2 text-xs font-mono tracking-wider uppercase bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white py-3 rounded-lg transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Disconnect Console</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleSignIn}
                  className="w-full flex items-center justify-center space-x-3 text-xs font-mono tracking-wider uppercase bg-white text-black hover:bg-neutral-200 py-4 rounded-lg transition-all font-semibold"
                >
                  {/* Custom Minimalist Google Logo SVG */}
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
    </>
  );
}
