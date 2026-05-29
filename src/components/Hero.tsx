import React from 'react';
import { ArrowRight } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden px-6 lg:px-12">
      <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <div className="z-10">
          <span className="text-[#D4AF37] font-medium tracking-[0.3em] uppercase text-xs mb-6 block">
            EST. 1984 — Premium Textile House
          </span>
          <h1 className="text-6xl md:text-8xl font-serif leading-[1.1] text-neutral-900 mb-8">
            The Art of <br />
            <span className="italic">Pure Texture.</span>
          </h1>
          <p className="text-lg text-neutral-500 max-w-md leading-relaxed mb-10">
            Sourcing the world's most exquisite fibers to create textiles that define luxury.
            Experience a collection where heritage meets avant-garde design.
          </p>
          <div className="flex flex-wrap gap-6">
            <button className="px-10 py-5 bg-[#D4AF37] text-white rounded-sm font-medium tracking-wide hover:bg-[#B8962D] transition-all flex items-center gap-3 shadow-lg shadow-[#D4AF37]/20">
              Explore Collections
              <ArrowRight size={18} />
            </button>
            <button className="px-10 py-5 border border-neutral-200 text-neutral-800 rounded-sm font-medium tracking-wide hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all">
              Request Samples
            </button>
          </div>
        </div>

        {/* Right Image Container */}
        <div className="relative flex justify-center items-center">
          <div className="absolute inset-0 bg-[#D4AF37]/5 rounded-full blur-3xl" />
          <div
            className="relative w-full max-w-xl aspect-[4/5] animate-float"
            style={{
              filter: 'drop-shadow(0 25px 35px rgba(212,175,55,0.15))'
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=1072&auto=format&fit=crop"
              alt="Luxury Silk Fabric"
              className="w-full h-full object-cover rounded-2xl grayscale-[20%] contrast-[110%]"
            />
            {/* Overlay badge */}
            <div className="absolute -bottom-8 -left-8 bg-white p-8 border border-neutral-100 shadow-xl rounded-sm">
              <p className="text-[#D4AF37] font-serif text-3xl font-bold">100%</p>
              <p className="text-xs uppercase tracking-widest text-neutral-400 font-semibold">Mulberry Silk</p>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative vertical lines */}
      <div className="absolute top-0 right-[15%] w-px h-full bg-neutral-100 -z-10" />
      <div className="absolute top-0 right-[45%] w-px h-full bg-neutral-100 -z-10" />
    </section>
  );
};

export default Hero;
