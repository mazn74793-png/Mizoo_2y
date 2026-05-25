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
                className={`w-10 h-10 rounded-full border theme-border flex items-center justify-center transition-all ${
                  canScrollLeft
                    ? 'theme-bg-sec theme-text-title hover:border-emerald-500/50 cursor-pointer active:scale-95'
                    : 'opacity-30 cursor-not-allowed'
                }`}
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5 text-neutral-800 dark:text-neutral-200" />
              </button>
              <button
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                className={`w-10 h-10 rounded-full border theme-border flex items-center justify-center transition-all ${
                  canScrollRight
                    ? 'theme-bg-sec theme-text-title hover:border-emerald-500/50 cursor-pointer active:scale-95'
                    : 'opacity-30 cursor-not-allowed'
                }`}
                aria-label="Scroll right"
              >
                <ChevronRight className="w-5 h-5 text-neutral-800 dark:text-neutral-200" />
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
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: '-20px' }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: (index % 3) * 0.05 }}
                  onClick={() => setSelectedProject(p)}
                  className="group cursor-pointer theme-card border rounded-xl overflow-hidden select-none transition-all duration-300 interactive-card flex flex-col justify-between w-[290px] xs:w-[325px] sm:w-[370px] md:w-[410px] flex-shrink-0 snap-center shadow-md pb-1"
                >
                  <div className="w-full">
                    {/* Visual Preview Container */}
                    <div className="relative aspect-video w-full overflow-hidden theme-bg-sec flex items-center justify-center border-b theme-border">
                      <img
                        src={p.imageUrl}
                        alt={p.title}
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
      </div>

      {/* Expandable Case Study Portal (Modal) */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto">
            
            {/* Modal outer tap target clickout */}
            <div 
              className="absolute inset-0 z-0 cursor-zoom-out" 
              onClick={() => setSelectedProject(null)} 
            />

            {/* Modal Box */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 w-full max-w-4xl theme-bg-page border theme-border rounded-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              
              {/* Header Utility Menu Bar */}
              <div className="sticky top-0 theme-bg-sec/90 border-b theme-border backdrop-blur-md px-6 py-4 flex items-center justify-between z-20">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full theme-bg-page flex items-center justify-center text-[8px] border theme-border" />
                  <span className="text-xs font-mono theme-text-muted truncate">
                    system/showcase/{selectedProject.id}/case-study
                  </span>
                </div>
                
                <button
                  onClick={() => setSelectedProject(null)}
                  className="w-8 h-8 rounded-full theme-bg-page border theme-border hover:border-neutral-500 flex items-center justify-center theme-text-desc hover:text-emerald-400 transition-all pointer-events-auto cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Container */}
              <div className="overflow-y-auto p-6 md:p-10 space-y-10 custom-scrollbar">
                
                {/* Visual Showcase Render */}
                <div className="relative aspect-video theme-bg-sec border theme-border rounded-lg overflow-hidden">
                  <img
                    src={selectedProject.imageUrl}
                    alt={selectedProject.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Bottom glass banner links */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 flex flex-wrap items-center justify-between gap-4">
                    <h2 className="text-lg md:text-2xl font-sans font-medium tracking-tight text-white mb-0">
                      {selectedProject.title}
                    </h2>
                    
                    <div className="flex items-center space-x-2">
                      {selectedProject.githubUrl && (
                        <a
                          href={selectedProject.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center space-x-1.5 text-[11px] font-mono uppercase bg-neutral-900/95 text-neutral-300 hover:text-white border border-neutral-850 px-3.5 py-1.5 rounded transition-all"
                        >
                          <Github className="w-3.5 h-3.5" />
                          <span>Source</span>
                        </a>
                      )}
                      {selectedProject.liveUrl && (
                        <a
                          href={selectedProject.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center space-x-1.5 text-[11px] font-mono uppercase bg-white text-black hover:bg-neutral-200 px-3.5 py-1.5 rounded transition-all font-semibold"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Demo</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Detail Information Sheet */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-left">
                  
                  {/* Left Column Parameters */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-[10px] font-mono theme-text-muted uppercase tracking-widest mb-1">
                        ENGINES & TOOLS
                      </h4>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {selectedProject.techStack.map((tech) => (
                          <span
                            key={tech}
                            className="text-[10px] font-mono theme-bg-sec border theme-border theme-text-desc px-2 py-1 rounded"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Middle/Right Column Case Markdown Narrative */}
                  <div className="md:col-span-2 space-y-6">
                    <div>
                      <h4 className="text-[10px] font-mono theme-text-muted uppercase tracking-widest mb-2">
                        OVERVIEW
                      </h4>
                      <p className="text-sm font-sans theme-text-desc leading-relaxed font-light">
                        {selectedProject.description}
                      </p>
                    </div>

                    <div className="border-t theme-border pt-6">
                      <h4 className="text-[10px] font-mono theme-text-muted uppercase tracking-widest mb-4">
                        TECHNICAL DEEP DIVE & ANALYSIS
                      </h4>
                      
                      {selectedProject.caseStudy ? (
                        <div className="text-xs theme-text-desc font-sans leading-relaxed whitespace-pre-wrap space-y-4">
                          {selectedProject.caseStudy}
                        </div>
                      ) : (
                        <div className="text-xs font-mono theme-text-muted italic">
                          No supplementary layout documentation written yet. Use control keys to register case studies.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
