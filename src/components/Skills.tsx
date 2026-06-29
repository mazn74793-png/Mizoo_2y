import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Skill } from '../types';
import * as Icons from 'lucide-react';

interface SkillsProps {
  skills: Skill[];
}

export default function Skills({ skills }: SkillsProps) {
  const [activeCategory, setActiveCategory] = useState<'all' | 'frontend' | 'backend' | 'tools'>('all');

  // Unified dynamic icon mapper avoiding module errors
  const renderSkillIcon = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName] || Icons.Cpu;
    return <IconComponent className="w-5 h-5 theme-text-desc transition-colors" />;
  };

  const filteredSkills = skills.filter((s) => {
    if (activeCategory === 'all') return true;
    return s.category === activeCategory;
  });

  const categories = [
    { id: 'all', label: 'All Tech' },
    { id: 'frontend', label: 'Frontend & UI' },
    { id: 'backend', label: 'Backend & Data' },
    { id: 'tools', label: 'Tools & DevOps' },
  ] as const;

  return (
    <section 
      id="skills" 
      className="relative theme-bg-page py-24 md:py-32 border-t theme-border overflow-hidden"
    >
      <div className="w-full max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-8">
          <div className="max-w-xl text-left">
            <p className="text-xs font-mono uppercase tracking-[0.25em] theme-text-muted mb-4">
              TECHNICAL DIRECTIVES
            </p>
            <h2 className="text-3xl md:text-5xl font-sans tracking-tight font-medium theme-text-title">
              An engineering ecosystem designed for performance.
            </h2>
          </div>

          {/* Sub-pixel category slide selectors */}
          <div className="flex flex-wrap items-center theme-bg-sec border theme-border p-1 rounded-lg self-start">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`text-[11px] font-mono uppercase tracking-wider px-4 py-2 rounded-md transition-all relative cursor-pointer ${
                  activeCategory === cat.id 
                    ? 'text-white dark:text-black font-semibold' 
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <span className="relative z-10">{cat.label}</span>
                {activeCategory === cat.id && (
                  <motion.span
                    layoutId="skillsCategoryTab"
                    className="absolute inset-0 bg-neutral-900 dark:bg-white rounded-md z-0"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Professional Horizontal Infinite Marquee Ticker */}
        <div className="relative w-screen left-[50%] right-[30%] -ml-[50vw] -mr-[50vw] overflow-hidden my-16 py-10 border-y theme-border bg-[linear-gradient(to_right,var(--bg-secondary)_1px,transparent_1px)] bg-[size:24px] marquee-container select-none">
          <div className="flex overflow-hidden relative w-full">
            <div className="animate-marquee flex gap-8 uppercase font-mono py-2">
              {(filteredSkills.length > 0 ? [...filteredSkills, ...filteredSkills, ...filteredSkills, ...filteredSkills, ...filteredSkills, ...filteredSkills, ...filteredSkills, ...filteredSkills] : []).map((s, idx) => (
                <div
                  key={`${s.id}-marquee-${idx}`}
                  className="flex items-center space-x-3.5 bg-white/70 dark:bg-neutral-900/60 theme-card border theme-border px-6 py-3 rounded-full hover:border-neutral-950/25 dark:hover:border-neutral-300/40 transition-all font-mono shadow-[0_2px_8px_rgba(0,0,0,0.02)] sm:hover:-translate-y-0.5"
                >
                  <div className="w-5 h-5 rounded flex items-center justify-center text-neutral-600 dark:text-neutral-400">
                    {renderSkillIcon(s.icon)}
                  </div>
                  <span className="font-semibold text-[11px] tracking-widest theme-text-title">{s.name}</span>
                  <div className="flex items-center space-x-1.5 pl-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 dark:bg-neutral-200 animate-pulse" />
                    <span className="text-[8px] font-mono theme-text-muted tracking-wider transition-colors">{s.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
