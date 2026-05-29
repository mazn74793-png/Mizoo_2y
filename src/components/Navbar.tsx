import React from 'react';
import { LayoutDashboard, Menu } from 'lucide-react';

interface NavbarProps {
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ isAdminOpen, setIsAdminOpen }) => {
  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-7xl">
      <div className="bg-white/80 backdrop-blur-md border border-neutral-100 px-8 py-4 flex items-center justify-between rounded-full shadow-sm">
        <div className="flex items-center gap-12">
          <a href="/" className="text-2xl font-serif tracking-tighter text-[#D4AF37] font-bold">
            TEX Vibe
          </a>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide uppercase text-neutral-500">
            <a href="#collections" className="hover:text-[#D4AF37] transition-colors">Collections</a>
            <a href="#wholesale" className="hover:text-[#D4AF37] transition-colors">B2B Wholesale</a>
            <a href="#about" className="hover:text-[#D4AF37] transition-colors">Heritage</a>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsAdminOpen(!isAdminOpen)}
            className="flex items-center gap-2 px-6 py-2 bg-neutral-900 text-white rounded-full text-xs font-semibold uppercase tracking-widest hover:bg-[#D4AF37] transition-all duration-300 group"
          >
            <LayoutDashboard size={14} className="group-hover:rotate-12 transition-transform" />
            Admin Dashboard
          </button>
          <button className="md:hidden p-2 text-neutral-800">
            <Menu size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
