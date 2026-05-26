import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { TextConfig } from '../types';

interface HeroProps {
  texts: TextConfig[];
  scrollToSection: (id: string) => void;
  theme?: 'light' | 'dark';
}

export default function Hero({ texts, scrollToSection, theme = 'dark' }: HeroProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Dynamic Config Values
  const titleText = texts.find(t => t.key === 'hero-title')?.value || 'I build digital experiences that feel premium.';
  const heroImage = texts.find(t => t.key === 'hero-image')?.value || '/src/assets/images/motaem_cutout_1779628899218.png';
  const customPhrasesVal = texts.find(t => t.key === 'hero-phrases')?.value;

  // Live Typewriter / Dynamic Storytelling Engine
  // Memoize phrases so its reference is 100% stable during non-typewriter state updates
  const phrases = useMemo(() => {
    if (customPhrasesVal && customPhrasesVal.trim() !== '') {
      return customPhrasesVal.split('\n').map(s => s.trim()).filter(Boolean);
    }
    return [
      "Hi, I'm Mazen. 👋",
      titleText,
      'I craft bespoke interactive portfolios with fluid visual physics.',
      'I engineer secure, blazing-fast, and durable full-stack apps.',
      'I turn complex system requirements into sheer, pixel-perfect design.'
    ];
  }, [customPhrasesVal, titleText]);
  
  const [currentText, setCurrentText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    // Safety check for empty lists to prevent NaN or index errors
    const list = phrases.length > 0 ? phrases : [titleText];
    const safeIndex = phraseIndex % list.length;
    const fullText = list[safeIndex] || titleText;
    
    if (isDeleting) {
      if (currentText === '') {
        setIsDeleting(false);
        setPhraseIndex((prev) => (list.length > 0 ? (prev + 1) % list.length : 0));
      } else {
        timer = setTimeout(() => {
          setCurrentText((prev) => prev.slice(0, -1));
        }, 15); // Faster backspace rhythm for responsive elite feedback
      }
    } else {
      if (currentText === fullText) {
        const isGreeting = fullText.startsWith("Hi, I'm") || fullText.startsWith("Hi,") || fullText.length < 20;
        const pauseDuration = isGreeting ? 2000 : 3200; // Pause less on the intro greeting for snap flow
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, pauseDuration);
      } else {
        const typingDelay = Math.random() * 25 + 30; // 30ms - 55ms crisp consistent flow
        timer = setTimeout(() => {
          setCurrentText((prev) => fullText.slice(0, prev.length + 1));
        }, typingDelay);
      }
    }

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, phraseIndex, phrases, titleText]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const particles: Array<{
      x: number;
      y: number;
      size: number;
      vx: number;
      vy: number;
      opacity: number;
      color: string;
    }> = [];

    // Create a beautifully sparse set of luxury monochrome particles
    const initParticles = () => {
      particles.length = 0;
      const count = Math.min(Math.floor(width / 24), 80);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 1.5 + 0.5,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          opacity: Math.random() * 0.4 + 0.1,
          color: theme === 'dark'
            ? (Math.random() > 0.5 ? '#ffffff' : '#737373')
            : (Math.random() > 0.5 ? '#111111' : '#a3a3a3'),
        });
      }
    };

    let mouse = { x: -1000, y: -1000 };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.target === canvas) {
          width = canvas.width = entry.contentRect.width;
          height = canvas.height = entry.contentRect.height;
          initParticles();
        }
      }
    });
    
    resizeObserver.observe(canvas.parentElement || canvas);
    initParticles();

    // Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Draw subtle ambient grid lines
      ctx.strokeStyle = theme === 'dark' ? 'rgba(23, 23, 23, 0.25)' : 'rgba(220, 220, 210, 0.45)';
      ctx.lineWidth = 1;

      const gridSize = 80;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw mouse ambient spotlight glow
      if (mouse.x > -1000) {
        const gradient = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          10,
          mouse.x,
          mouse.y,
          320
        );
        gradient.addColorStop(0, theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(16, 185, 129, 0.04)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      }

      // Render/update Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        p.x += p.vx;
        p.y += p.vy;

        // Bounce margins
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Smooth gravity pull towards mouse coordinates
        if (mouse.x > -1000) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 180) {
            const force = (180 - dist) / 180;
            p.x += (dx / dist) * force * 0.4;
            p.y += (dy / dist) * force * 0.4;
          }
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw premium connection networks
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist < 110) {
            const alpha = ((110 - dist) / 110) * 0.15;
            ctx.strokeStyle = theme === 'dark' 
              ? `rgba(255, 255, 255, ${alpha * 0.65})` 
              : `rgba(16, 185, 129, ${alpha * 0.75})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      
      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      if (canvas) {
        canvas.removeEventListener('mouseleave', handleMouseLeave);
      }
      resizeObserver.disconnect();
    };
  }, [theme]);

  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleMouseMoveTilt = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    // Map to a maximum of 15 degrees tilt for luxurious, responsive depth perception
    setTilt({
      x: (y / (rect.height / 2)) * -12,
      y: (x / (rect.width / 2)) * 12,
    });
  };

  const handleMouseLeaveTilt = () => {
    setTilt({ x: 0, y: 0 });
  };

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((p) => p + 1), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <section 
      id="hero-section"
      className="relative min-h-screen theme-bg-page flex flex-col justify-center overflow-hidden pt-28 md:pt-24 pb-16"
    >
      {/* Interactive Depth Canvas Background */}
      <div className="absolute inset-0 z-0">
        <canvas ref={canvasRef} className="w-full h-full block" />
        {/* Soft edge gradients like Linear or Apple */}
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-[var(--bg-primary)] to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[var(--bg-primary)] to-transparent pointer-events-none" />
      </div>

      {/* Hero content - Centered Layout for peak premium aesthetics */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 md:px-12 flex flex-col items-center justify-center text-center">
        
        {/* Tag line with cinematic layout */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          whileHover={{ scale: 1.03, y: -2 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
          className="flex items-center space-x-2.5 px-4 py-2 theme-bg-sec border theme-border rounded-full mb-8 backdrop-blur-md shadow-sm cursor-default select-none transition-all hover:shadow-[0_4px_12px_rgba(16,185,129,0.06)]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-mono uppercase tracking-[0.22em] theme-text-desc font-medium">
            Available for Custom Enterprise Projects
          </span>
        </motion.div>

        {/* Massive displaying headline with elegant live-typewriter story. We use min-height and overflow-visible to completely prevent clipping and layout jumps */}
        <div className="w-full text-center max-w-4xl min-h-[140px] xs:min-h-[120px] sm:min-h-[180px] md:min-h-[220px] lg:min-h-[265px] flex flex-col justify-center overflow-visible px-2 sm:px-4">
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl tracking-tight leading-[1.12] font-bold text-center italic select-none py-1"
          >
            <span className={theme === 'dark' ? 'text-white' : 'text-neutral-950'}>
              {currentText}
            </span>
            <span className="inline-block relative ml-2">
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
                className="inline-block w-1.5 md:w-2 h-7 sm:h-11 md:h-14 lg:h-16 xl:h-20 bg-emerald-500 rounded-sm shadow-[0_0_15px_rgba(16,185,129,0.7)]"
              />
            </span>
          </motion.h1>
        </div>

        {/* Buttons and actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
        >
          <motion.button
            whileHover={{ y: -4, scale: 1.02, boxShadow: '0 20px 40px rgba(0,0,0,0.12)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => scrollToSection('work')}
            className="group relative interactive-card flex items-center justify-center space-x-2 text-xs font-mono uppercase tracking-wider py-4.5 px-10 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-lg w-full sm:w-auto shadow-xl cursor-pointer font-medium border border-transparent dark:border-neutral-150/10"
          >
            <span>View Work</span>
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </motion.button>
          
          <motion.button
            whileHover={{ y: -3, scale: 1.02, bg: 'rgba(120, 120, 120, 0.05)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => scrollToSection('contact')}
            className="text-xs font-mono uppercase tracking-wider py-4.5 px-10 border theme-border theme-text-muted hover:theme-text-title transition-colors rounded-lg w-full sm:w-auto backdrop-blur-sm cursor-pointer"
          >
            Contact Me
          </motion.button>
        </motion.div>

        {/* Center column (Sublime Giant Standalone Transparent 3D Parallax Portrait) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
          className="flex flex-col justify-center items-center w-full relative group/deck mt-16 max-w-xl md:max-w-3xl lg:max-w-4xl overflow-visible"
        >
          {/* Majestic ambient aura spotlight directly behind the transparent body */}
          <div className="absolute w-[200%] h-[200%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.08)_0%,rgba(120,120,120,0.02)_45%,transparent_80%)] rounded-full blur-[120px] pointer-events-none group-hover/deck:scale-105 transition-transform duration-1000" />
          
          <div
            ref={containerRef}
            onMouseMove={handleMouseMoveTilt}
            onMouseLeave={handleMouseLeaveTilt}
            style={{
              transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
              transition: tilt.x === 0 ? 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
              transformStyle: 'preserve-3d'
            }}
            className="relative w-full flex flex-col items-center justify-end overflow-visible select-none cursor-pointer"
          >
            {/* Glowing background halo precisely offset underneath the cutout for a professional back-light look */}
            <div className="absolute top-[5%] w-[420px] h-[420px] md:w-[600px] md:h-[600px] bg-gradient-to-tr from-emerald-500/[0.05] via-neutral-500/[0.04] to-transparent rounded-full blur-[100px] pointer-events-none" />

            {/* Giant Cutout Portrait standing tall and bold in the page */}
            <div 
              style={{ transform: 'translateZ(30px)' }}
              className="relative w-full flex items-end justify-center overflow-visible pointer-events-none min-h-[460px] sm:min-h-[620px] md:min-h-[740px] lg:min-h-[860px]"
            >
              <motion.img 
                src={heroImage} 
                alt="Motaem" 
                animate={{
                  y: [0, -12, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-[200%] xs:w-[180%] sm:w-[155%] md:w-[165%] lg:w-[175%] scale-[1.2] sm:scale-[1.15] md:scale-[1.3] lg:scale-[1.35] origin-bottom max-h-[96vh] object-contain select-none filter contrast-[1.03] brightness-[1.04] drop-shadow-[0_25px_65px_rgba(0,0,0,0.85)] drop-shadow-[0_5px_15px_rgba(52,211,153,0.18)]"
              />

              {/* Magical Ambient bottom blend gradient mask - guarantees transparent profile blends 100% smoothly with section scrolling */}
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/30 to-transparent pointer-events-none z-10" />
            </div>

            {/* Floating identity label matching the seamless glass look */}
            <motion.div 
              style={{ transform: 'translateZ(60px)' }}
              className="w-[90%] sm:w-[80%] md:w-[65%] theme-card border backdrop-blur-md rounded-2xl p-4.5 flex items-center justify-between z-20 transition-colors shadow-2xl -mt-6 relative"
            >
              <div className="flex items-center space-x-3.5">
                <div className="relative">
                  <span className="block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <div className="text-left font-sans">
                  <span className="text-xs sm:text-sm font-sans font-medium theme-text-title block">Motaem (Mazen)</span>
                  <span className="text-[9px] sm:text-[10px] font-mono theme-text-desc uppercase tracking-widest block mt-0.5">Creator & Full-Stack Engineer</span>
                </div>
              </div>
              <span className="text-[10px] font-mono theme-text-desc px-3.5 py-1 theme-bg-page border theme-border rounded-lg">
                v2.1
              </span>
            </motion.div>
          </div>
        </motion.div>

      </div>

      {/* Absolute bottom scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
        <motion.span 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 1.0 }}
          className="text-[10px] font-mono theme-text-muted uppercase tracking-[0.25em] mb-2"
        >
          Scroll Down
        </motion.span>
        <div className="w-[1.5px] h-10 theme-bg-sec rounded overflow-hidden">
          <motion.div
            initial={{ top: '-100%' }}
            animate={{ top: '100%' }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
            className="relative h-4 w-full bg-neutral-900 dark:bg-white"
          />
        </div>
      </div>
    </section>
  );
}
