import { motion } from 'motion/react';
import { Calendar, Briefcase } from 'lucide-react';

const TIMELINE_EVENTS = [
  {
    period: '2024 - PRESENT',
    role: 'Senior Full-Stack Orchestrator',
    company: 'Aeon Labs Studio',
    details: 'Overseeing the architecture of multi-tenant high-performance developer tools, compiler plugins, and high-contrast browser virtual sandboxes. Restructured local caching mechanisms to shave 30% off cold start times.',
  },
  {
    period: '2022 - 2024',
    role: 'Product Architect & Engineer',
    company: 'Vercel Collaborative Group',
    details: 'Led developer relations modules and core components synchronization routines. Implemented WebGL-based charting visualisers that refresh efficiently at continuous 120 FPS frequencies with near-zero frame drops.',
  },
  {
    period: '2021 - 2022',
    role: 'Ledger Cryptographic Systems Developer',
    company: 'Stripe Global Financials',
    details: 'Tuned microsecond balance ledger databases handling millions of events daily. Enforced strict attribute compliance rules across firewalls to guarantee absolute ledger consistency.',
  },
  {
    period: '2019 - 2021',
    role: 'Core Systems Developer',
    company: 'Raycast Launch Engine',
    details: 'Engineered high-performance background script routines and macOS API interfaces in C++ and Typescript. Spearheaded offline-first local SQL synchronization layers.',
  }
];

export default function Timeline() {
  return (
    <section 
      className="relative theme-bg-page py-24 md:py-32 border-t theme-border overflow-hidden"
    >
      <div className="w-full max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="max-w-xl text-left mb-20 md:mb-28">
          <p className="text-xs font-mono uppercase tracking-[0.25em] theme-text-muted mb-4">
            PROFESSIONAL ROADS
          </p>
          <h2 className="text-3xl md:text-5xl font-sans tracking-tight font-medium theme-text-title">
            A refined career history dedicated to system excellence.
          </h2>
        </div>

        {/* Chronological Lane */}
        <div className="relative border-l theme-border pl-6 md:pl-12 ml-4 space-y-16 text-left max-w-3xl">
          
          {TIMELINE_EVENTS.map((event, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: 'easeOut' }}
              className="relative"
            >
              {/* Chronological intersection node */}
              <div className="absolute -left-[31px] md:-left-[55px] top-1.5 w-2.5 h-2.5 rounded-full bg-neutral-950 dark:bg-white border theme-border z-10" />
              
              <div className="flex flex-col md:flex-row md:items-start md:space-x-8 gap-2">
                
                {/* Years Range label */}
                <div className="font-mono text-xs theme-text-muted tracking-wider cleanliness whitespace-nowrap pt-1 md:w-32 flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{event.period}</span>
                </div>

                {/* Information container */}
                <div className="flex-1 space-y-2">
                  <h3 className="text-base font-sans font-medium theme-text-title tracking-tight">
                    {event.role}
                  </h3>
                  <p className="text-xs font-mono theme-text-muted uppercase tracking-widest flex items-center space-x-1.5">
                    <Briefcase className="w-3 h-3" />
                    <span>{event.company}</span>
                  </p>
                  <p className="text-xs md:text-sm theme-text-desc leading-relaxed font-sans font-light mt-3 max-w-xl">
                    {event.details}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
