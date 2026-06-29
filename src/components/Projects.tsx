import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Project } from '../types';
import { ArrowUpRight, Github, ExternalLink, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProjectsProps {
  projects: Project[];
}

export default function Projects({ projects }: ProjectsProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Smoothly scroll and center the content when state transitions occur
  const handleSelectProject = (p: Project) => {
    setSelectedProject(p);
    setTimeout(() => {
      const el = document.getElementById('work');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  };

  const handleBack = () => {
    setSelectedProject(null);
    setTimeout(() => {
      const el = document.getElementById('work');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  };

  const handleScroll = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      const totalScrollable = scrollWidth - clientWidth;
      
      setScrollProgress(totalScrollable > 0 ? (scrollLeft / totalScrollable) * 100 : 0);
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < totalScrollable - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const { scrollLeft, clientWidth } = sliderRef.current;
      const scrollAmount = clientWidth * 0.75;
      sliderRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const el = sliderRef.current;
    if (el) {
      el.addEventListener('scroll', handleScroll, { passive: true });
      // Run once immediately
      handleScroll();
      // Re-run on resize
      window.addEventListener('resize', handleScroll);
    }
    return () => {
      if (el) el.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [projects]);

  return (
    <section 
      id="work" 
      className="relative theme-bg-page py-24 md:py-32 border-t theme-border overflow-hidden"
    >
      <div className="w-full max-w-7xl mx-auto px-6 md:px-12">
        <AnimatePresence mode="wait">
          {!selectedProject ? (
            <motion.div
              key="projects-list-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              {/* Section Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-24 gap-6">
                <div className="max-w-xl text-left">
                  <p className="text-xs font-mono uppercase tracking-[0.25em] theme-text-muted mb-4">
                    PRODUCT SHOWCASE
                  </p>
                  <h2 className="text-3xl md:text-5xl font-sans tracking-tight font-medium theme-text-title">
                    Selected works built for heavy scale and luxury visual fidelity.
                  </h2>
                </div>
                
                {/* Circular Control Buttons */}
                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono theme-text-muted hidden sm:inline">
                    [SWIPE OR SCROLL TO NAVIGATE]
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => scroll('left')}
                      disabled={!canScrollLeft}
                      className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
                        canScrollLeft
                          ? 'border-neutral-850 text-neutral-900 bg-white hover:bg-neutral-950 hover:text-white cursor-pointer active:scale-95 shadow-sm'
                          : 'border-neutral-200 text-neutral-300 opacity-40 cursor-not-allowed'
                      }`}
                      aria-label="Scroll left"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => scroll('right')}
                      disabled={!canScrollRight}
                      className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
                        canScrollRight
                          ? 'border-neutral-850 text-neutral-900 bg-white hover:bg-neutral-950 hover:text-white cursor-pointer active:scale-95 shadow-sm'
                          : 'border-neutral-200 text-neutral-300 opacity-40 cursor-not-allowed'
                      }`}
                      aria-label="Scroll right"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Project horizontal scrollable strip (swiper) */}
              <div 
                ref={sliderRef}
                className="flex overflow-x-auto gap-6 sm:gap-8 pb-8 scrollbar-none snap-x snap-mandatory w-full scroll-smooth select-none cursor-grab active:cursor-grabbing"
              >
                {projects
                  .sort((a, b) => a.order - b.order)
                  .map((p, index) => {
                    return (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 30, scale: 0.96 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true, margin: '-40px' }}
                        transition={{ 
                          duration: 0.95, 
                          ease: [0.16, 1, 0.3, 1], 
                          delay: (index % 3) * 0.08 
                        }}
                        onClick={() => handleSelectProject(p)}
                        className="group cursor-pointer theme-card border rounded-xl overflow-hidden select-none transition-all duration-300 interactive-card flex flex-col justify-between w-[290px] xs:w-[325px] sm:w-[370px] md:w-[410px] flex-shrink-0 snap-center shadow-md pb-1"
                      >
                        <div className="w-full">
                          {/* Visual Preview Container */}
                          <div className="relative aspect-video w-full overflow-hidden theme-bg-sec flex items-center justify-center border-b theme-border">
                            <img
                              src={p.imageUrl}
                              alt={p.title}
                              loading="lazy"
                              className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-105"
                              referrerPolicy="no-referrer"
                            />
                            
                            {/* Premium Glass reflection overlay */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 opacity-60 group-hover:opacity-100 transition-opacity" />

                            {/* Glass overlay on Hover */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-white border border-white/20 bg-black/45 px-3 py-1.5 rounded-full flex items-center space-x-1.5 backdrop-blur-md">
                                <span>Explore Engine</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          </div>

                          {/* Information Area with beautifully tuned responsive padding */}
                          <div className="p-4.5 sm:p-6 text-left">
                            {/* Tech stack badges list */}
                            <div className="flex flex-wrap gap-1 sm:gap-2 mb-3">
                              {p.techStack.slice(0, 3).map((tech) => (
                                <span
                                  key={tech}
                                  className="text-[8px] sm:text-[9px] font-mono tracking-wider uppercase theme-text-desc theme-bg-sec border theme-border px-1.5 py-0.5 rounded"
                                >
                                  {tech}
                                </span>
                              ))}
                              {p.techStack.length > 3 && (
                                <span className="text-[8px] sm:text-[9px] font-mono theme-text-muted px-1 py-0.5">
                                  +{p.techStack.length - 3}
                                </span>
                              )}
                            </div>

                            {/* Title and brief */}
                            <h3 className="text-xs sm:text-base font-sans font-medium theme-text-title tracking-tight transition-colors mb-1.5 flex items-center justify-between">
                              <span className="truncate">{p.title}</span>
                            </h3>
                            
                            <p className="text-[10.5px] sm:text-xs theme-text-desc leading-relaxed font-sans line-clamp-2">
                              {p.description}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
              </div>

              {/* Horizontal Navigation Progress Line */}
              <div className="mt-8 flex items-center justify-between gap-6 max-w-md mx-auto">
                <span className="text-[10px] font-mono theme-text-muted">01</span>
                <div className="h-0.5 flex-1 theme-bg-sec rounded-full overflow-hidden relative">
                  <div 
                    className="absolute left-0 top-0 bottom-0 bg-neutral-900 dark:bg-neutral-100 rounded-full transition-all duration-150 ease-out"
                    style={{ width: `${scrollProgress}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono theme-text-muted">
                  {String(projects.length).padStart(2, '0')}
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="project-details-view"
              initial={{ opacity: 0, x: 45 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -45 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="w-full space-y-10"
            >
              {/* Sticky-feeling Header Utility / Back Navigation Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b theme-border gap-4">
                <button
                  onClick={handleBack}
                  className="inline-flex items-center space-x-2.5 px-5 py-3 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-100 border border-transparent shadow-md hover:shadow-lg transition-all active:scale-98 cursor-pointer group font-medium text-xs font-mono uppercase tracking-wider self-start"
                >
                  <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                  <span>الرجوع للمشاريع / Return to All Projects</span>
                </button>
                
                <div className="flex items-center space-x-2 bg-neutral-100 dark:theme-bg-sec px-3.5 py-1.5 rounded-lg border theme-border max-w-max">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-mono theme-text-desc uppercase tracking-wider">
                    system/showcase/{selectedProject.id}
                  </span>
                </div>
              </div>

              {/* Visual Showcase Render */}
              <div className="relative aspect-video theme-bg-sec border theme-border rounded-xl overflow-hidden shadow-2xl">
                <img
                  src={selectedProject.imageUrl}
                  alt={selectedProject.title}
                  loading="lazy"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 opacity-60 pointer-events-none" />
              </div>

              {/* Title & External Live Actions */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b theme-border">
                <div className="text-left">
                  <h3 className="text-2xl md:text-4xl font-sans tracking-tight font-medium theme-text-title mb-1.5">
                    {selectedProject.title}
                  </h3>
                  <p className="text-xs font-mono theme-text-muted uppercase tracking-widest">
                    Enterprise Visual Engineering Case
                  </p>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                  {selectedProject.githubUrl && (
                    <a
                      href={selectedProject.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 md:flex-none inline-flex items-center justify-center space-x-2 text-xs font-mono uppercase tracking-wider py-3.5 px-6 bg-white hover:bg-neutral-950 hover:text-white border border-neutral-300 hover:border-neutral-950 transition-all rounded-xl shadow-sm hover:shadow-md text-neutral-800 font-semibold"
                    >
                      <Github className="w-4 h-4" />
                      <span>Code Source</span>
                    </a>
                  )}
                  {selectedProject.liveUrl && (
                    <a
                      href={selectedProject.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 md:flex-none inline-flex items-center justify-center space-x-2 text-xs font-mono uppercase tracking-wider py-3.5 px-6 bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-all rounded-xl shadow-md hover:shadow-emerald-500/20"
                    >
                      <ExternalLink className="w-4 h-4 text-white" />
                      <span>Launch App</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Tech Stack and MD Description Layout Info Sheet */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-left">
                {/* Meta details column */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[9px] font-mono theme-text-muted uppercase tracking-[0.2em] mb-2.5">
                      ENGINES & STACK
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedProject.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="text-[10px] font-mono theme-bg-sec border theme-border theme-text-desc px-2.5 py-1.5 rounded-lg"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Main Case markdown narratives */}
                <div className="md:col-span-2 space-y-8">
                  <div>
                    <h4 className="text-[9px] font-mono theme-text-muted uppercase tracking-[0.2em] mb-2.5">
                      OVERVIEW & MANDATE
                    </h4>
                    <p className="text-sm font-sans theme-text-desc leading-relaxed font-light">
                      {selectedProject.description}
                    </p>
                  </div>

                  <div className="border-t theme-border pt-6">
                    <h4 className="text-[9px] font-mono theme-text-muted uppercase tracking-[0.2em] mb-4">
                      TECHNICAL ANALYSIS & PRODUCTION DEEP DIVE
                    </h4>
                    
                    {selectedProject.caseStudy ? (
                      <div className="text-xs sm:text-sm theme-text-desc font-sans leading-relaxed whitespace-pre-wrap space-y-4 font-light">
                        {selectedProject.caseStudy}
                      </div>
                    ) : (
                      <div className="text-xs font-mono theme-text-muted italic">
                        No supplementary design system documentation written yet. Customize it from the database anytime.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sticky bottom secondary Return Action (Perfect Mobile UX) */}
              <div className="pt-12 border-t theme-border flex justify-center">
                <button
                  onClick={handleBack}
                  className="inline-flex items-center justify-center space-x-2 px-6 py-4 rounded-xl bg-white hover:bg-neutral-950 hover:text-white border border-neutral-300 hover:border-neutral-950 transition-all text-xs font-mono uppercase tracking-widest text-neutral-800 font-semibold active:scale-95 cursor-pointer shadow-sm hover:shadow-md"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>الرجوع للمتصفح / Return to Projects List</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
