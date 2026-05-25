import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const WELCOMES = [
  { text: 'Hello', lang: 'English' },
  { text: 'أهلاً بالغالي', lang: 'Arabic' },
  { text: 'ようこそ', lang: 'Japanese' },
  { text: 'Bienvenue', lang: 'French' },
  { text: 'Mazen Elite', lang: 'Corporate' }
];

interface IntroScreenProps {
  onComplete: () => void;
  heroImage: string;
}

export default function IntroScreen({ onComplete, heroImage }: IntroScreenProps) {
  const [index, setIndex] = useState(0);
  const [stage, setStage] = useState<'intro' | 'fade-out'>('intro');

  useEffect(() => {
    // Silent preloading of the hero image in the background
    const img = new Image();
    img.src = heroImage;
  }, [heroImage]);

  useEffect(() => {
    // Elegant, slow cinematic transitions of welcome greetings
    const interval = setInterval(() => {
      setIndex((prev) => {
        if (prev === WELCOMES.length - 1) {
          clearInterval(interval);
          setTimeout(() => {
            setStage('fade-out');
            setTimeout(onComplete, 700); // Wait for final crisp fade-out
          }, 700);
          return prev;
        }
        return prev + 1;
      });
    }, 850);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {stage === 'intro' && (
        <motion.div
          id="intro-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center select-none overflow-hidden"
        >
          {/* Glowing Backlight in the background */}
          <div className="absolute inset-x-0 top-[40%] flex items-center justify-center opacity-40 pointer-events-none">
            <div className="w-[380px] h-[380px] rounded-full bg-emerald-500/10 blur-[80px]" />
          </div>

          <div className="relative flex flex-col items-center justify-center w-full max-w-lg px-6 text-center space-y-6">
            
            {/* Custom Welcome Messages */}
            <div className="relative h-20 w-full flex items-center justify-center overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 15, filter: 'blur(3px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -15, filter: 'blur(3px)' }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute text-3xl md:text-4xl font-sans tracking-tight font-medium text-white/95"
                >
                  {WELCOMES[index].text}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          
          {/* Subtle luxurious graphite timeline line */}
          <div className="absolute bottom-20 w-48 h-[1px] bg-neutral-950 overflow-hidden">
            <motion.div
              initial={{ left: '-100%' }}
              animate={{ left: '100%' }}
              transition={{ duration: 4.8, ease: 'easeInOut' }}
              className="absolute h-full w-24 bg-gradient-to-r from-transparent via-neutral-500 to-transparent"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
