import { motion } from 'motion/react';
import { Service } from '../types';
import * as Icons from 'lucide-react';

interface ServicesProps {
  services: Service[];
}

export default function Services({ services }: ServicesProps) {
  
  const renderServiceIcon = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName] || Icons.Code;
    return <IconComponent className="w-5 h-5 theme-text-desc group-hover:text-emerald-400 transition-colors" />;
  };

  return (
    <section 
      id="services" 
      className="relative theme-bg-page py-24 md:py-32 border-t theme-border overflow-hidden"
    >
      <div className="w-full max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="max-w-xl text-left mb-16 md:mb-24">
          <p className="text-xs font-mono uppercase tracking-[0.25em] theme-text-muted mb-4">
            CORE SERVICES
          </p>
          <h2 className="text-3xl md:text-5xl font-sans tracking-tight font-medium theme-text-title">
            Unraveling complex logic into high-end intuitive software.
          </h2>
        </div>

        {/* Services grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services
            .sort((a, b) => a.order - b.order)
            .map((s, index) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-55px' }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: 'easeOut' }}
                className="group p-8 theme-card border rounded transition-all duration-350 flex flex-col justify-between min-h-[280px] text-left relative overflow-hidden interactive-card"
              >
                <div>
                  
                  {/* Icon and title header */}
                  <div className="flex items-center space-x-4 mb-6 text-left">
                    <div className="w-10 h-10 rounded-lg theme-bg-sec border theme-border flex items-center justify-center group-hover:border-emerald-500/30 transition-all">
                      {renderServiceIcon(s.icon)}
                    </div>
                    <h3 className="text-lg font-sans font-medium theme-text-title tracking-tight">
                      {s.title}
                    </h3>
                  </div>

                  <p className="text-xs theme-text-desc leading-relaxed font-sans mb-6">
                    {s.description}
                  </p>
                </div>

                {/* Bulleted specifications column */}
                <ul className="space-y-2 border-t theme-border pt-6">
                  {s.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center space-x-2 text-[11px] font-mono theme-text-muted text-left">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-450 dark:bg-neutral-600 group-hover:bg-emerald-400 transition-colors" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                {/* Micro edge line */}
                <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-neutral-800 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
        </div>
      </div>
    </section>
  );
}
