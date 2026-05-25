import { motion } from 'motion/react';
import { Testimonial } from '../types';

interface TestimonialsProps {
  testimonials: Testimonial[];
}

export default function Testimonials({ testimonials }: TestimonialsProps) {
  return (
    <section 
      className="relative theme-bg-page py-24 md:py-32 border-t theme-border overflow-hidden"
    >
      <div className="w-full max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="max-w-xl text-left mb-16 md:mb-24">
          <p className="text-xs font-mono uppercase tracking-[0.25em] theme-text-muted mb-4">
            REVIEWS & CO-SIGNS
          </p>
          <h2 className="text-3xl md:text-5xl font-sans tracking-tight font-medium theme-text-title">
            Endorsed by leaders scaling tomorrow’s interfaces.
          </h2>
        </div>

        {/* Testimonials grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
          {testimonials
            .sort((a, b) => a.order - b.order)
            .map((t, index) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: 'easeOut' }}
                className="group p-8 theme-card border rounded transition-all duration-350 flex flex-col justify-between min-h-[250px] relative interactive-card"
              >
                
                {/* Visual feedback mark */}
                <p className="text-xs md:text-sm theme-text-desc font-sans italic font-light leading-relaxed mb-8">
                  “ {t.text} ”
                </p>

                {/* Author Info Column */}
                <div className="flex items-center space-x-3.5 border-t theme-border pt-6">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-9 h-9 rounded-full object-cover border theme-border"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="text-xs font-sans font-medium theme-text-title">
                      {t.name}
                    </h4>
                    <p className="text-[10px] font-mono theme-text-muted uppercase tracking-wider mt-0.5">
                      {t.role} — <span className="theme-text-desc">{t.company}</span>
                    </p>
                  </div>
                </div>

                {/* Micro visual indicator dots */}
                <div className="absolute top-6 right-6 w-1.5 h-1.5 rounded-full theme-bg-sec group-hover:bg-emerald-400 transition-colors" />
              </motion.div>
            ))}
        </div>
      </div>
    </section>
  );
}
