import { motion } from 'motion/react';
import { Mail, Github, Linkedin, MessageSquareIcon, Hash, ArrowUpRight, Check } from 'lucide-react';
import { useState } from 'react';
import { SocialLink } from '../types';

interface ContactProps {
  socials: SocialLink[];
  isAdminMode: boolean;
  setAdminMode: (mode: boolean) => void;
  currentUser: any;
  isMazen: boolean;
  setIsAuthOpen: (open: boolean) => void;
}

export default function Contact({ socials, isAdminMode, setAdminMode, currentUser, isMazen, setIsAuthOpen }: ContactProps) {
  const [copied, setCopied] = useState(false);

  // Fallback social references if Snapshot is preparing
  const mockSocials = socials.length > 0 ? socials : [
    { id: '1', platform: 'Email', url: 'mailto:motaem23@gmail.com', icon: 'Mail' },
    { id: '2', platform: 'GitHub', url: 'https://github.com/mazen-elite', icon: 'Github' },
    { id: '3', platform: 'LinkedIn', url: 'https://linkedin.com/in/mazen-elite', icon: 'Linkedin' },
    { id: '4', platform: 'WhatsApp', url: 'https://wa.me/201012345678', icon: 'MessageSquareIcon' },
    { id: '5', platform: 'Discord', url: 'https://discord.gg/mazen-elite', icon: 'Hash' },
  ];

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('motaem23@gmail.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPlatformIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'email': return Mail;
      case 'github': return Github;
      case 'linkedin': return Linkedin;
      case 'whatsapp': return MessageSquareIcon;
      default: return Hash;
    }
  };

  return (
    <section 
      id="contact" 
      className="relative theme-bg-page py-24 md:py-32 border-t theme-border overflow-hidden"
    >
      <div className="w-full max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Left Column Information */}
          <div className="lg:col-span-6 text-left space-y-8">
            <div>
              <p className="text-xs font-mono uppercase tracking-[0.25em] theme-text-muted mb-4">
                INITIATE COMMUNICATION
              </p>
              <h2 className="text-3xl md:text-5xl font-sans tracking-tight font-medium theme-text-title">
                Let’s create something that sets a new industry standard.
              </h2>
            </div>
            
            <p className="text-xs md:text-sm theme-text-desc leading-relaxed font-sans font-light max-w-md">
              Whether you want to build a high-performance web ledger, a custom containerized WASM system, or a luxury SaaS platform that drives conversion—I have the precision tools to execute.
            </p>

            {/* Quick copy buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <a
                href="mailto:motaem23@gmail.com"
                className="text-xs font-mono uppercase tracking-wider bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-4.5 rounded font-bold transition-all inline-block text-center w-full sm:w-auto shadow-md"
              >
                Let’s Collaborate
              </a>
              
              <button
                onClick={handleCopyEmail}
                className="flex items-center justify-center space-x-2 text-xs font-mono uppercase tracking-wider text-neutral-800 hover:text-emerald-500 hover:border-emerald-500 hover:bg-emerald-50/10 border border-neutral-350 px-6 py-4.5 rounded transition-all w-full sm:w-auto cursor-pointer font-semibold"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Mail className="w-4 h-4" />}
                <span className={copied ? "text-emerald-600 font-semibold" : ""}>{copied ? 'Copied Secure' : 'Copy Email'}</span>
              </button>
            </div>
          </div>

          {/* Right Column Grid Buttons */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left w-full">
            {mockSocials.map((soc) => {
              const IconComp = getPlatformIcon(soc.platform);
              return (
                <a
                  key={soc.id}
                  href={soc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-6 theme-card border rounded flex items-center justify-between transition-all duration-300 interactive-card"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-9 h-9 theme-bg-sec border theme-border rounded flex items-center justify-center theme-text-desc group-hover:text-neutral-900 dark:group-hover:text-neutral-100 transition-colors">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-sans font-medium theme-text-title">
                        {soc.platform}
                      </h4>
                      <span className="text-[10px] font-mono theme-text-muted block mt-0.5 uppercase tracking-widest">
                        Verify platform
                      </span>
                    </div>
                  </div>
                  
                  <ArrowUpRight className="w-4 h-4 theme-text-muted group-hover:text-neutral-900 dark:group-hover:text-neutral-100 transition-all transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              );
            })}
          </div>
        </div>

        {/* Absolute Footer line credit - Literal, human labels per anti-ai-slop guidelines */}
        <div className="border-t theme-border mt-24 md:mt-32 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 select-none">
          <p 
            onDoubleClick={() => {
              if (currentUser && isMazen) {
                setAdminMode(!isAdminMode);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                setIsAuthOpen(true);
              }
            }}
            className="text-[10px] font-mono theme-text-muted uppercase tracking-widest cursor-default select-none active:text-neutral-900 dark:active:text-neutral-100 transition-colors"
          >
            © {new Date().getFullYear()} MAZEN. ALL DESIGN PRINCIPLES INSPIRED BY APPLE & STRIPE.
          </p>
          <div className="flex items-center space-x-6 text-[10px] font-mono theme-text-muted uppercase tracking-widest select-none">
            <span className="hover:text-neutral-900 dark:hover:text-neutral-100 cursor-pointer transition-colors">Security Spec</span>
            <span className="hover:text-neutral-900 dark:hover:text-neutral-100 cursor-pointer transition-colors">Clean Systems</span>
          </div>
        </div>
      </div>
    </section>
  );
}
