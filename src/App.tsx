import { useState, useEffect } from 'react';
import { db, handleFirestoreError, DEFAULT_PROJECTS, DEFAULT_SKILLS, DEFAULT_SERVICES, DEFAULT_TESTIMONIALS, DEFAULT_SOCIALS, DEFAULT_TEXTS } from './firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
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

  // Lock system to elegant Alabaster Light Mode as requested
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

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
          <Contact socials={socials} />
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
    </div>
  );
}
