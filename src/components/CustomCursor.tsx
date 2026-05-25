import { useEffect, useState } from 'react';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [laggedPosition, setLaggedPosition] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    checkTouch();
    window.addEventListener('resize', checkTouch);

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
      
      // Look for clickable elements to scale cursor
      const target = e.target as HTMLElement;
      const isClickable = 
        target.tagName === 'BUTTON' || 
        target.tagName === 'A' || 
        target.closest('button') || 
        target.closest('a') || 
        target.closest('.interactive-card') ||
        target.getAttribute('role') === 'button';
      
      setIsHovered(!!isClickable);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('resize', checkTouch);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Soft elastic lag tracking
  useEffect(() => {
    if (isTouchDevice || !isVisible) return;
    
    let animationFrameId: number;
    
    const updateLaggedPosition = () => {
      setLaggedPosition(prev => {
        const dx = position.x - prev.x;
        const dy = position.y - prev.y;
        // Adjust the multiplier for custom elasticity lag
        return {
          x: prev.x + dx * 0.16,
          y: prev.y + dy * 0.16
        };
      });
      animationFrameId = requestAnimationFrame(updateLaggedPosition);
    };
    
    animationFrameId = requestAnimationFrame(updateLaggedPosition);
    return () => cancelAnimationFrame(animationFrameId);
  }, [position, isTouchDevice, isVisible]);

  if (isTouchDevice || !isVisible) return null;

  return (
    <>
      {/* Absolute core sharp pointer */}
      <div
        id="cursor-dot"
        className="fixed pointer-events-none z-50 mix-blend-difference w-1.5 h-1.5 bg-white rounded-full"
        style={{
          left: position.x,
          top: position.y,
          transform: 'translate(-50%, -50%)',
        }}
      />
      
      {/* Elastic elegant fluid ring tracker */}
      <div
        id="cursor-ring"
        className="fixed pointer-events-none z-50 w-8 h-8 rounded-full border border-neutral-900/40 dark:border-neutral-100/50 transition-transform duration-150 ease-out flex items-center justify-center bg-neutral-900/[0.03] dark:bg-white/[0.03]"
        style={{
          left: laggedPosition.x,
          top: laggedPosition.y,
          transform: `translate(-50%, -50%) scale(${isHovered ? 1.6 : 1.0})`,
        }}
      >
        {isHovered && (
          <div className="w-1.5 h-1.5 rounded-full bg-neutral-900 dark:bg-white animate-ping" />
        )}
      </div>
    </>
  );
}

