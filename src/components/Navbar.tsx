import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sun, Moon } from 'lucide-react';

interface NavbarProps {
  isAdminMode: boolean;
  setAdminMode: (mode: boolean) => void;
  activeSection: string;
  scrollToSection: (id: string) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export default function Navbar({ isAdminMode, setAdminMode, activeSection, scrollToSection, theme, setTheme }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

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

          {/* Subtle Right End Anchor representing premium standard */}
          <div className="flex items-center space-x-4">
            <span className="text-[9px] font-mono text-neutral-400 dark:text-neutral-600 uppercase tracking-widest hidden sm:inline-block">
              Premium Digital Spec v2.1
            </span>
            
            {/* Highly tactile light/dark theme switch */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                theme === 'dark'
                  ? 'border-neutral-800 bg-neutral-900 text-yellow-400 hover:bg-neutral-850 hover:text-yellow-300'
                  : 'border-neutral-250 bg-white text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 shadow-sm'
              }`}
              aria-label="Toggle visual theme"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>
          </div>
        </div>
      </motion.header>
    </>
  );
}
