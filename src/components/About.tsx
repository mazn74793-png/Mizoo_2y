import { motion } from 'motion/react';
import { Sparkles, Cpu, Layers, Activity } from 'lucide-react';
import { TextConfig } from '../types';

interface AboutProps {
  texts: TextConfig[];
}

export default function About({ texts }: AboutProps) {
  const storyText = texts.find(t => t.key === 'story-short')?.value || 'I merge high-precision system mechanics with elite aesthetic sensitivity. Drawing inspiration from modern giants like Apple, Stripe and Linear, I believe complex applications must load with zero friction and represent premium durability.';

  const PILLARS = [
    {
      icon: Layers,
      title: 'Pristine Layout Mechanics',
      desc: 'Obsessive grid ratios, tailored lettering pairs, and carefully calibrated margins that feel lightweight yet structure-strong.'
    },
    {
      icon: Cpu,
      title: 'Deterministic Flow',
      desc: 'Writing highly performant React code that completely avoids infinite re-renders, resulting in stable, responsive rendering speeds.'
    },
    {
      icon: Activity,
      title: 'Cinematic Micro-Interactions',
      desc: 'Subtle hover states, fluid container morph transformations, and premium inertia scrolling that respect natural material friction.'
    },
    {
      icon: Sparkles,
      title: 'Zero-Trust Resilient Archs',
      desc: 'Safeguarding databases with rigorous attribute-based access rules and building sub-50ms real-time synchronization pipelines.'
    }
  ];

  return (
    <section 
      id="about" 
      className="relative theme-bg-page py-24 md:py-32 border-t theme-border overflow-hidden"
    >
      <div className="w-full max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="max-w-2xl text-left mb-16 md:mb-24">
          <p className="text-xs font-mono uppercase tracking-[0.25em] theme-text-muted mb-4">
            MANIFESTO & DIRECTION
          </p>
          <h2 className="text-3xl md:text-5xl font-sans tracking-tight font-medium theme-text-title">
            Architecture built with extreme aesthetic conviction.
          </h2>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 mb-20 items-start">
          <div className="lg:col-span-5 theme-text-muted font-mono text-xs uppercase tracking-wider space-y-4">
            <p>MAZEN ELITE — FULL STACK DEVELOPER</p>
            <p>BASED IN CAIRO. CONTRACTING GLOBALLY.</p>
            <p>SPECIALIZING IN PREMIUM SOFTWARE SYSTEMS</p>
          </div>
          
          <div className="lg:col-span-7">
            <p className="theme-text-desc font-sans text-lg md:text-xl font-light leading-relaxed tracking-wide">
              {storyText}
            </p>
          </div>
        </div>

        {/* Pillars / Detail Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PILLARS.map((p, index) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: 'easeOut' }}
                className="interactive-card theme-card border p-6 rounded transition-all group flex flex-col justify-between min-h-[220px]"
              >
                <div>
                  <div className="w-8 h-8 rounded theme-bg-sec flex items-center justify-center border theme-border theme-text-desc group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-all mb-6">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-sans font-medium tracking-tight theme-text-title mb-2">
                    {p.title}
                  </h3>
                </div>
                <p className="text-xs theme-text-muted leading-relaxed font-sans">
                  {p.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
