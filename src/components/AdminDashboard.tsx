import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  db, auth, googleProvider, handleFirestoreError,
  DEFAULT_PROJECTS, DEFAULT_SKILLS, DEFAULT_SERVICES, 
  DEFAULT_TESTIMONIALS, DEFAULT_SOCIALS, DEFAULT_TEXTS 
} from '../firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Project, Skill, Service, Testimonial, SocialLink, TextConfig, OperationType } from '../types';
import { 
  Plus, Edit, Trash2, Save, X, Layers, Sparkles, Database, Mail, 
  Code, Eye, Upload, AlertCircle, Files, Settings, UserCheck, User, RefreshCw
} from 'lucide-react';

const metaEnv = (import.meta as any).env || {};

interface AdminDashboardProps {
  projects: Project[];
  skills: Skill[];
  services: Service[];
  testimonials: Testimonial[];
  socials: SocialLink[];
  texts: TextConfig[];
  setAdminMode?: (mode: boolean) => void;
}

type TabType = 'projects' | 'skills' | 'services' | 'testimonials' | 'socials' | 'texts' | 'portrait';

export default function AdminDashboard({
  projects: initialProjects,
  skills: initialSkills,
  services: initialServices,
  testimonials: initialTestimonials,
  socials: initialSocials,
  texts: initialTexts,
  setAdminMode
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('projects');
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [adminPasscode, setAdminPasscode] = useState('');
  const [adminAuthError, setAdminAuthError] = useState('');

  // Firestore counts to detect empty databases
  const [projectsCount, setProjectsCount] = useState<number>(-1);
  const [skillsCount, setSkillsCount] = useState<number>(-1);
  const [servicesCount, setServicesCount] = useState<number>(-1);
  const [testimonialsCount, setTestimonialsCount] = useState<number>(-1);
  const [socialsCount, setSocialsCount] = useState<number>(-1);
  const [textsCount, setTextsCount] = useState<number>(-1);

  // Operational states for seeding/wiping database
  const [isSeeding, setIsSeeding] = useState(false);
  const [isWiping, setIsWiping] = useState(false);
  const [seedStep, setSeedStep] = useState('');

  // Lists synced in real time
  const [liveProjects, setLiveProjects] = useState<Project[]>(initialProjects);
  const [liveSkills, setLiveSkills] = useState<Skill[]>(initialSkills);
  const [liveServices, setLiveServices] = useState<Service[]>(initialServices);
  const [liveTestimonials, setLiveTestimonials] = useState<Testimonial[]>(initialTestimonials);
  const [liveSocials, setLiveSocials] = useState<SocialLink[]>(initialSocials);
  const [liveTexts, setLiveTexts] = useState<TextConfig[]>(initialTexts);

  // Forms states
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Hero Portrait dedicated states
  const [portraitValue, setPortraitValue] = useState('');

  // Sync portraitValue when database finishes loading liveTexts data
  useEffect(() => {
    const dbHeroImage = liveTexts.find(t => t.key === 'hero-image')?.value;
    if (dbHeroImage) {
      setPortraitValue(dbHeroImage);
    }
  }, [liveTexts]);

  // Cloudinary configuration states (prioritize Environment variables from Vercel/AI Studio)
  const [cloudinaryCloudName, setCloudinaryCloudName] = useState(
    metaEnv.VITE_CLOUDINARY_CLOUD_NAME || localStorage.getItem('cloudinary_cloud_name') || ''
  );
  const [cloudinaryUploadPreset, setCloudinaryUploadPreset] = useState(
    metaEnv.VITE_CLOUDINARY_UPLOAD_PRESET || localStorage.getItem('cloudinary_upload_preset') || ''
  );
  const [isUploadingToCloudinary, setIsUploadingToCloudinary] = useState(false);

  // Sync if env variables change or are loaded
  useEffect(() => {
    if (metaEnv.VITE_CLOUDINARY_CLOUD_NAME) {
      setCloudinaryCloudName(metaEnv.VITE_CLOUDINARY_CLOUD_NAME);
    }
    if (metaEnv.VITE_CLOUDINARY_UPLOAD_PRESET) {
      setCloudinaryUploadPreset(metaEnv.VITE_CLOUDINARY_UPLOAD_PRESET);
    }
  }, []);

  const handleCloudinaryCloudNameChange = (val: string) => {
    if (metaEnv.VITE_CLOUDINARY_CLOUD_NAME) return;
    setCloudinaryCloudName(val);
    localStorage.setItem('cloudinary_cloud_name', val);
  };

  const handleCloudinaryUploadPresetChange = (val: string) => {
    if (metaEnv.VITE_CLOUDINARY_UPLOAD_PRESET) return;
    setCloudinaryUploadPreset(val);
    localStorage.setItem('cloudinary_upload_preset', val);
  };

  // Seeding/Wiping operations
  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    setSeedStep('جاري تشفير تهيئة الاتصال بقاعدة البيانات...');
    try {
      // 1. Seed Projects
      setSeedStep('جاري شحن المشاريع الافتراضية (Projects)...');
      for (const p of DEFAULT_PROJECTS) {
        await setDoc(doc(db, 'projects', p.id), p);
      }

      // 2. Seed Skills
      setSeedStep('جاري شحن المهارات (Skills Grid)...');
      for (const s of DEFAULT_SKILLS) {
        await setDoc(doc(db, 'skills', s.id), s);
      }

      // 3. Seed Services
      setSeedStep('جاري شحن خدمات البورتفوليو (Services)...');
      for (const s of DEFAULT_SERVICES) {
        await setDoc(doc(db, 'services', s.id), s);
      }

      // 4. Seed Testimonials
      setSeedStep('جاري شحن شهادات العملاء والشركاء (Co-signs)...');
      for (const t of DEFAULT_TESTIMONIALS) {
        await setDoc(doc(db, 'testimonials', t.id), t);
      }

      // 5. Seed Socials
      setSeedStep('جاري شحن روابط التواصل الاجتماعي (Socials)...');
      for (const s of DEFAULT_SOCIALS) {
        await setDoc(doc(db, 'socialLinks', s.id), s);
      }

      // 6. Seed Texts
      setSeedStep('جاري شحن نصوص واجهة المستخدم (UI Copy)...');
      for (const t of DEFAULT_TEXTS) {
        await setDoc(doc(db, 'texts', t.id), t);
      }
      
      // Also write default hero-image key to texts
      await setDoc(doc(db, 'texts', 'text-hero-image'), {
        id: 'text-hero-image',
        key: 'hero-image',
        value: '/src/assets/images/motaem_cutout_1779628899218.png'
      });

      // Set localStorage seed flag
      localStorage.setItem('portfolio_db_seeded_projects', 'true');
      localStorage.setItem('portfolio_db_seeded_skills', 'true');
      localStorage.setItem('portfolio_db_seeded_services', 'true');
      localStorage.setItem('portfolio_db_seeded_testimonials', 'true');
      localStorage.setItem('portfolio_db_seeded_socialLinks', 'true');
      localStorage.setItem('portfolio_db_seeded_texts', 'true');

      setSeedStep('');
      alert('تم شحن وتهيئة قاعدة البيانات بنجاح تام! 🎉 كل المشاريع والمهارات والنصوص والروابط الآن حية بالكامل في قاعدة البيانات ومتاحة للتعديل والحذف الفوري.');
    } catch (err: any) {
      alert(`فشلت عملية تهيئة السجلات: ${err.message || err}`);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleWipeDatabase = async () => {
    if (!confirm('⚠️ تحذير شديد الخطورة: سيؤدي هذا الإجراء إلى مسح كافة البيانات من السحابة (Firestore) نهائياً! هل أنت متأكد بنسبة 100%؟')) return;
    setIsWiping(true);
    setSeedStep('جاري تنظيف وتصفير جداول قاعدة البيانات السحابية...');
    try {
      setSeedStep('جاري تصفير المشاريع سحابياً...');
      for (const p of liveProjects) {
        await deleteDoc(doc(db, 'projects', p.id));
      }

      setSeedStep('جاري تصفير مصفوفة المهارات...');
      for (const s of liveSkills) {
        await deleteDoc(doc(db, 'skills', s.id));
      }

      setSeedStep('جاري تصفير قائمة الخدمات...');
      for (const s of liveServices) {
        await deleteDoc(doc(db, 'services', s.id));
      }

      setSeedStep('جاري تصفير آراء العملاء...');
      for (const t of liveTestimonials) {
        await deleteDoc(doc(db, 'testimonials', t.id));
      }

      setSeedStep('جاري تصفير روابط التواصل الاجتماعي...');
      for (const s of liveSocials) {
        await deleteDoc(doc(db, 'socialLinks', s.id));
      }

      setSeedStep('جاري مسح نصوص الواجهة...');
      for (const t of liveTexts) {
        await deleteDoc(doc(db, 'texts', t.id));
      }

      // Reset cache indicators so UI knows that database is empty
      localStorage.setItem('portfolio_db_seeded_projects', 'true');
      localStorage.setItem('portfolio_db_seeded_skills', 'true');
      localStorage.setItem('portfolio_db_seeded_services', 'true');
      localStorage.setItem('portfolio_db_seeded_testimonials', 'true');
      localStorage.setItem('portfolio_db_seeded_socialLinks', 'true');
      localStorage.setItem('portfolio_db_seeded_texts', 'true');

      setLiveProjects([]);
      setLiveSkills([]);
      setLiveServices([]);
      setLiveTestimonials([]);
      setLiveSocials([]);
      setLiveTexts([]);

      setSeedStep('');
      alert('تم مسح وتنظيف قاعدة البيانات بنجاح! قاعدة البيانات السحابية الآن فارغة بالكامل.');
    } catch (err: any) {
      alert(`فشلت عملية المسح والتصفير: ${err.message || err}`);
    } finally {
      setIsWiping(false);
    }
  };

  // Unified Form Data object
  const [formData, setFormData] = useState<any>({
    // Project keys
    title: '',
    description: '',
    techStack: '',
    imageUrl: '',
    videoUrl: '',
    liveUrl: '',
    githubUrl: '',
    caseStudy: '',
    order: 0,
    featured: true,
    // Skill keys
    name: '',
    category: 'frontend',
    icon: '',
    // Service keys
    features: '',
    // Testimonial keys
    role: '',
    company: '',
    avatar: '',
    text: '',
    // Social / Text keys
    platform: '',
    url: '',
    key: '',
    value: ''
  });

  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });

    // Setup snap listeners for real-time CRUD previews on Dashboard
    const qProjects = query(collection(db, 'projects'), orderBy('order', 'asc'));
    const unsubProj = onSnapshot(qProjects, (snap) => {
      const projs: Project[] = [];
      snap.forEach(d => projs.push(d.data() as Project));
      setProjectsCount(snap.size);
      if (snap.size > 0) {
        setLiveProjects(projs);
        localStorage.setItem('portfolio_db_seeded_projects', 'true');
      } else {
        if (localStorage.getItem('portfolio_db_seeded_projects') === 'true') {
          setLiveProjects([]);
        } else {
          setLiveProjects(initialProjects);
        }
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, 'projects'));

    const unsubSkills = onSnapshot(collection(db, 'skills'), (snap) => {
      const sks: Skill[] = [];
      snap.forEach(d => sks.push(d.data() as Skill));
      setSkillsCount(snap.size);
      if (snap.size > 0) {
        setLiveSkills(sks);
        localStorage.setItem('portfolio_db_seeded_skills', 'true');
      } else {
        if (localStorage.getItem('portfolio_db_seeded_skills') === 'true') {
          setLiveSkills([]);
        } else {
          setLiveSkills(initialSkills);
        }
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, 'skills'));

    const unsubServ = onSnapshot(collection(db, 'services'), (snap) => {
      const srvs: Service[] = [];
      snap.forEach(d => srvs.push(d.data() as Service));
      setServicesCount(snap.size);
      if (snap.size > 0) {
        setLiveServices(srvs);
        localStorage.setItem('portfolio_db_seeded_services', 'true');
      } else {
        if (localStorage.getItem('portfolio_db_seeded_services') === 'true') {
          setLiveServices([]);
        } else {
          setLiveServices(initialServices);
        }
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, 'services'));

    const unsubTest = onSnapshot(collection(db, 'testimonials'), (snap) => {
      const tsts: Testimonial[] = [];
      snap.forEach(d => tsts.push(d.data() as Testimonial));
      setTestimonialsCount(snap.size);
      if (snap.size > 0) {
        setLiveTestimonials(tsts);
        localStorage.setItem('portfolio_db_seeded_testimonials', 'true');
      } else {
        if (localStorage.getItem('portfolio_db_seeded_testimonials') === 'true') {
          setLiveTestimonials([]);
        } else {
          setLiveTestimonials(initialTestimonials);
        }
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, 'testimonials'));

    const unsubSoc = onSnapshot(collection(db, 'socialLinks'), (snap) => {
      const scls: SocialLink[] = [];
      snap.forEach(d => scls.push(d.data() as SocialLink));
      setSocialsCount(snap.size);
      if (snap.size > 0) {
        setLiveSocials(scls);
        localStorage.setItem('portfolio_db_seeded_socialLinks', 'true');
      } else {
        if (localStorage.getItem('portfolio_db_seeded_socialLinks') === 'true') {
          setLiveSocials([]);
        } else {
          setLiveSocials(initialSocials);
        }
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, 'socialLinks'));

    const unsubTexts = onSnapshot(collection(db, 'texts'), (snap) => {
      const txts: TextConfig[] = [];
      snap.forEach(d => txts.push(d.data() as TextConfig));
      setTextsCount(snap.size);
      if (snap.size > 0) {
        setLiveTexts(txts);
        localStorage.setItem('portfolio_db_seeded_texts', 'true');
      } else {
        if (localStorage.getItem('portfolio_db_seeded_texts') === 'true') {
          setLiveTexts([]);
        } else {
          setLiveTexts(initialTexts);
        }
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, 'texts'));

    return () => {
      unsubAuth();
      unsubProj();
      unsubSkills();
      unsubServ();
      unsubTest();
      unsubSoc();
      unsubTexts();
    };
  }, []);

  const handleAdminSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Login failed:', err);
      // Let user know their browser blocked the popup in frame and offer the passcode workaround
      alert("لقد تعذر فتح نافذة تسجيل دخول Google المنبثقة (غالباً بسبب حظر المتصفح للنوافذ المنبثقة في المعاينة).\n\n💡 الحل: يمكنك فتح الموقع في 'علامة تبويب جديدة' (New Tab) لتسجيل الدخول بسلاسة عبر Google، أو استخدم 'رمز المرور الآمن' بالأسفل!");
    }
  };

  const handleAdminPasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPass = adminPasscode.trim().toLowerCase();
    const validPasscodes = [
      'mazen23@admin',
      'motaem23y@gmail.com',
      'motaem23@gmail.com'
    ];
    if (validPasscodes.includes(cleanPass)) {
      const mockUser = {
        uid: 'mazen-bypass-uid',
        email: 'motaem23y@gmail.com',
        displayName: 'Mazen Elite Bypass',
        emailVerified: true,
        isAnonymous: false,
        providerData: []
      } as any;
      setCurrentUser(mockUser);
      setAdminPasscode('');
      setAdminAuthError('');
    } else {
      setAdminAuthError('رمز المرور غير صحيح أو غير مصرح به. يرجى استخدام الرمز الصحيح.');
    }
  };

  const handleAdminSignOut = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      if (setAdminMode) {
        setAdminMode(false);
      }
    } catch (err: any) {
      alert(`Disconnect failed: ${err.message || err}`);
      setCurrentUser(null);
      if (setAdminMode) {
        setAdminMode(false);
      }
    }
  };

  // Enforce access authorization
  const isAuthorized = currentUser?.email === 'motaem23@gmail.com' || currentUser?.email === 'motaem23y@gmail.com';

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center select-none pt-24">
        <div id="access-denied-frame" className="max-w-md w-full bg-[#0a0a0a] border border-neutral-900 rounded-2xl p-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.9)] space-y-6 relative overflow-hidden backdrop-blur-sm">
          {/* Decorative glowing backdrops */}
          <div className="absolute -top-10 -left-10 w-24 h-24 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />

          <AlertCircle className="w-12 h-12 text-red-500 mx-auto animate-pulse" />
          
          <div className="space-y-2">
            <h2 className="text-xl font-sans font-medium text-white tracking-tight">
              System Security Isolation
            </h2>
            <p className="text-xs text-neutral-400 font-mono leading-relaxed max-w-sm mx-auto">
              You have entered the Admin Control Tunnel. Please authenticate with a registered, verified portfolio-master email account to proceed.
            </p>
          </div>

          <div className="bg-[#050505] p-5 rounded-lg border border-neutral-900 text-left font-mono text-[11px] text-neutral-400 mt-4 space-y-2">
            <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
              <span className="text-neutral-500 uppercase tracking-widest text-[9px]">SECURITY LEVEL</span>
              <span className="text-red-500 bg-red-950/30 px-2 py-0.5 rounded border border-red-900/30 uppercase text-[8px] font-bold">RESTR_ADMIN</span>
            </div>
            <div className="pt-1">
              <span className="text-neutral-500 font-sans">ACTIVE SESSION: </span>
              <span className="text-white break-all font-semibold">{currentUser?.email || 'Anonymous / Not Authenticated'}</span>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {!currentUser ? (
              <button
                onClick={handleAdminSignIn}
                className="w-full flex items-center justify-center space-x-3 text-xs font-mono tracking-wider uppercase bg-white text-black hover:bg-neutral-200 py-4 rounded-lg transition-all font-semibold active:scale-[0.98]"
              >
                {/* Custom Minimalist Google Logo SVG */}
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                <span>DASHBOARD LOGIN WITH GOOGLE</span>
              </button>
            ) : (
              <button
                onClick={handleAdminSignOut}
                className="w-full flex items-center justify-center space-x-2 text-xs font-mono tracking-wider uppercase bg-red-950/20 border border-red-900/40 text-red-400 hover:bg-red-950/40 py-4 rounded-lg transition-all font-semibold active:scale-[0.98]"
              >
                <span>SIGN OUT & SWITCH GOOGLE ACCOUNT</span>
              </button>
            )}

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-neutral-900"></div>
              <span className="flex-shrink mx-4 text-[10px] text-neutral-600 font-mono uppercase tracking-widest">أو عبر رمز المرور</span>
              <div className="flex-grow border-t border-neutral-900"></div>
            </div>

            <form onSubmit={handleAdminPasscodeSubmit} className="space-y-3">
              <input
                type="password"
                placeholder="أدخل رمز المرور لـ تسجيل الدخول الفوري"
                value={adminPasscode}
                onChange={(e) => setAdminPasscode(e.target.value)}
                className="w-full bg-[#050505] border border-neutral-900 rounded-lg py-3 px-4 text-xs font-mono text-center text-white focus:outline-none focus:border-neutral-700 transition-all placeholder:text-neutral-600"
              />
              {adminAuthError && (
                <p className="text-[10px] text-red-500 font-sans mt-1">{adminAuthError}</p>
              )}
              <button
                type="submit"
                className="w-full py-3 bg-white hover:bg-neutral-200 text-black rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer font-extrabold"
              >
                دخول فوري كمسؤول النظام
              </button>
              <p className="text-[9px] text-neutral-500 font-mono text-center">تنويه (للمعاينة): يمكنك استخدام رمز المرور الجديد "mazen23@admin" كبديل آمن وسريع</p>
            </form>

            {setAdminMode && (
              <div className="pt-2 border-t border-neutral-900">
                <button
                  type="button"
                  onClick={() => setAdminMode(false)}
                  className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer font-semibold"
                >
                  الخروج والرجوع لتصفح الموقع
                </button>
              </div>
            )}
          </div>

          <div className="border-t border-neutral-900 pt-5">
            <p className="text-[9px] font-mono text-neutral-600 uppercase tracking-widest leading-relaxed">
              SECURITY SHIELD ACTIVE • NO EXTERNAL BREACH PERMITTED
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Dynamic File Upload & Cloudinary Host API Bridge
  const handleFileChange = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Only images are accepted.');
      return;
    }

    if (cloudinaryCloudName && cloudinaryUploadPreset) {
      setIsUploadingToCloudinary(true);
      try {
        const uData = new FormData();
        uData.append('file', file);
        uData.append('upload_preset', cloudinaryUploadPreset);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`, {
          method: 'POST',
          body: uData,
        });

        if (!res.ok) {
          throw new Error(`Cloudinary server responded with code: ${res.status}`);
        }

        const data = await res.json();
        if (data.secure_url) {
          if (activeTab === 'testimonials') {
            setFormData((prev: any) => ({ ...prev, avatar: data.secure_url }));
          } else if (activeTab === 'texts') {
            setFormData((prev: any) => ({ ...prev, value: data.secure_url }));
          } else if (activeTab === 'portrait') {
            setPortraitValue(data.secure_url);
          } else {
            setFormData((prev: any) => ({ ...prev, imageUrl: data.secure_url }));
          }
        } else {
          throw new Error('Valid secure URL missing from Cloudinary metadata.');
        }
      } catch (err: any) {
        alert(`Cloudinary Upload Issue: ${err.message || err}. Reverting to Base64 fallback.`);
        readBase64(file);
      } finally {
        setIsUploadingToCloudinary(false);
      }
    } else {
      readBase64(file);
    }
  };

  const readBase64 = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (activeTab === 'testimonials') {
        setFormData((prev: any) => ({ ...prev, avatar: base64 }));
      } else if (activeTab === 'texts') {
        setFormData((prev: any) => ({ ...prev, value: base64 }));
      } else if (activeTab === 'portrait') {
        setPortraitValue(base64);
      } else {
        setFormData((prev: any) => ({ ...prev, imageUrl: base64 }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Open Form for creating
  const handleOpenCreate = () => {
    setSelectedId(null);
    setFormData({
      title: '',
      description: '',
      techStack: '',
      imageUrl: '',
      videoUrl: '',
      liveUrl: '',
      githubUrl: '',
      caseStudy: '',
      order: 0,
      featured: true,
      name: '',
      category: 'frontend',
      icon: 'Cpu',
      features: '',
      role: '',
      company: '',
      avatar: '',
      text: '',
      platform: '',
      url: '',
      key: '',
      value: ''
    });
    setIsFormOpen(true);
  };

  // Open Form for editing
  const handleOpenEdit = (item: any) => {
    setSelectedId(item.id);
    
    // Adapt details based on standard models
    setFormData({
      ...item,
      techStack: item.techStack ? item.techStack.join(', ') : '',
      features: item.features ? item.features.join(', ') : '',
    });
    setIsFormOpen(true);
  };

  // Delete document safely
  const handleDelete = async (id: string, path: string) => {
    if (!confirm(`Are you sure you want to delete sequence: ${id}?`)) return;
    try {
      await deleteDoc(doc(db, path, id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${path}/${id}`);
    }
  };

  // Submits the CRUD form
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = selectedId || activeTab + '-' + Date.now();
    let payloadName = activeTab === 'socials' ? 'socialLinks' : activeTab;

    let payload: any = { id };

    try {
      if (activeTab === 'projects') {
        payload = {
          id,
          title: formData.title,
          description: formData.description,
          techStack: formData.techStack.split(',').map((s: string) => s.trim()).filter(Boolean),
          imageUrl: formData.imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1280&auto=format&fit=crop',
          videoUrl: formData.videoUrl || '',
          liveUrl: formData.liveUrl || '',
          githubUrl: formData.githubUrl || '',
          caseStudy: formData.caseStudy || '',
          order: Number(formData.order) || 0,
          featured: Boolean(formData.featured),
          updatedAt: new Date().toISOString()
        };
      } else if (activeTab === 'skills') {
        payload = {
          id,
          name: formData.name,
          category: formData.category,
          icon: formData.icon || 'Cpu',
          order: Number(formData.order) || 0
        };
      } else if (activeTab === 'services') {
        payload = {
          id,
          title: formData.title,
          description: formData.description,
          icon: formData.icon || 'Settings',
          features: formData.features.split(',').map((s: string) => s.trim()).filter(Boolean),
          order: Number(formData.order) || 0
        };
      } else if (activeTab === 'testimonials') {
        payload = {
          id,
          name: formData.name,
          role: formData.role,
          company: formData.company,
          avatar: formData.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop',
          text: formData.text,
          order: Number(formData.order) || 0
        };
      } else if (activeTab === 'socials') {
        payload = {
          id,
          platform: formData.platform,
          url: formData.url,
          icon: formData.icon || 'Link'
        };
      } else if (activeTab === 'texts') {
        payload = {
          id,
          key: formData.key,
          value: formData.value
        };
      }

      await setDoc(doc(db, payloadName, id), payload);
      setIsFormOpen(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `${payloadName}/${id}`);
    }
  };

  const TABS = [
    { id: 'projects', label: 'Projects', icon: Files },
    { id: 'skills', label: 'Skills Grid', icon: Sparkles },
    { id: 'services', label: 'Services', icon: Layers },
    { id: 'testimonials', label: 'Co-signs', icon: UserCheck },
    { id: 'socials', label: 'Socials', icon: Mail },
    { id: 'texts', label: 'UI Copy', icon: Code },
    { id: 'portrait', label: 'Hero Portrait', icon: User },
  ] as const;

  const isDatabaseEmpty = projectsCount <= 0 || skillsCount <= 0 || servicesCount <= 0;

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-16 flex flex-col font-sans select-none">
      
      {/* High-Tech Database Monitor and Sync Control Hub */}
      <div className="w-full max-w-7xl mx-auto px-6 md:px-12 mb-8 text-left">
        <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.9)] space-y-6">
          <div className="absolute top-0 right-0 w-80 h-80 bg-neutral-900/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-900/60 pb-5">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-500 block mb-1">REAL-TIME ENGINE CONTROL & METRICS</span>
              <h2 className="text-lg md:text-xl font-sans tracking-tight font-medium text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-neutral-400" />
                <span>نظام التزامن والتحكم الفائق بقاعدة البيانات</span>
              </h2>
            </div>
            {isSeeding || isWiping ? (
              <div className="flex items-center space-x-2 text-xs font-mono text-neutral-400 bg-[#070707] border border-neutral-900 px-3 py-1.5 rounded-lg">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                <span>{seedStep || 'جاري المعالجة بقاعدة البيانات...'}</span>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2 bg-neutral-900/40 border border-neutral-900 px-3 py-1.5 rounded-lg">
                  <span className={`w-2 h-2 rounded-full ${isDatabaseEmpty ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                    {isDatabaseEmpty ? 'قاعدة بيانات فارغة (MEM_FALLBACK)' : 'تزامن نشط • مسؤول'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  {setAdminMode && (
                    <button
                      type="button"
                      onClick={() => setAdminMode(false)}
                      className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-xs font-mono tracking-wider text-neutral-300 transition-all flex items-center gap-1.5 font-medium cursor-pointer"
                      title="عرض البورتفوليو مع الإبقاء على جلسة الإدارة نشطة لتعديل السطور فوراً"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>معاينة الموقع ومراجعته</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleAdminSignOut}
                    className="px-3 py-1.5 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 rounded-lg text-xs font-mono tracking-wider text-red-400 transition-all flex items-center gap-1.5 font-medium cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>تسجيل الخروج والرجوع</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Project counts panel */}
            <div className="bg-[#080808] border border-neutral-900/80 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-mono uppercase text-neutral-500 tracking-wider">PROJECTS INDEX</span>
                <p className="text-lg font-sans font-medium text-white mt-1">
                  {projectsCount >= 0 ? `${projectsCount} مشاريع حية` : 'جاري جرد السجلات...'}
                </p>
              </div>
              <p className="text-[10px] text-neutral-500 mt-2 font-mono">
                {projectsCount > 0 ? '✓ سحابية نشطة حية' : '⚠️ ذاكرة تخزين الكود'}
              </p>
            </div>

            {/* Skills count panel */}
            <div className="bg-[#080808] border border-neutral-900/80 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-mono uppercase text-neutral-500 tracking-wider">SKILLS GRID</span>
                <p className="text-lg font-sans font-medium text-white mt-1">
                  {skillsCount >= 0 ? `${skillsCount} مهارات حية` : 'جاري جرد السجلات...'}
                </p>
              </div>
              <p className="text-[10px] text-neutral-500 mt-2 font-mono">
                {skillsCount > 0 ? '✓ سحابية نشطة حية' : '⚠️ ذاكرة تخزين الكود'}
              </p>
            </div>

            {/* UI copy texts counts panel */}
            <div className="bg-[#080808] border border-neutral-900/80 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-mono uppercase text-neutral-500 tracking-wider">UI COPY KEYS</span>
                <p className="text-lg font-sans font-medium text-white mt-1">
                  {textsCount >= 0 ? `${textsCount} نصوص حية` : 'جاري جرد السجلات...'}
                </p>
              </div>
              <p className="text-[10px] text-neutral-500 mt-2 font-mono">
                {textsCount > 0 ? '✓ سحابية نشطة حية' : '⚠️ ذاكرة تخزين الكود'}
              </p>
            </div>

            {/* Quick action trigger block */}
            <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl p-4 flex flex-col justify-center space-y-2">
              {isDatabaseEmpty ? (
                <button
                  type="button"
                  onClick={handleSeedDatabase}
                  disabled={isSeeding || isWiping}
                  className="w-full flex items-center justify-center space-x-2 py-3 bg-white hover:bg-neutral-200 text-black text-xs font-mono uppercase tracking-wider rounded-lg font-extrabold transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>تفعيل وشحن البيانات</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleWipeDatabase}
                  disabled={isSeeding || isWiping}
                  className="w-full flex items-center justify-center space-x-2 py-3 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 text-red-400 text-xs font-mono uppercase tracking-wider rounded-lg font-semibold transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>تصفير ومسح السجلات</span>
                </button>
              )}
            </div>
          </div>

          {isDatabaseEmpty && (
            <div className="bg-amber-950/10 border border-amber-900/20 rounded-xl p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-amber-500">منظومة الحماية ترشدك: قاعدة البيانات السحابية فارغة حالياً!</h4>
                <p className="text-xs text-neutral-400 leading-relaxed font-sans font-medium">
                  الموقع يعرض الآن نصوصاً ومشاريع نموذجية مخزنة مؤقتاً في ملفات الكود محلياً. لتتمكن من <strong className="text-white">تعديل أو حذف أي مشروع</strong> حياً ليحفظ مباشرة في السحاب، يرجى النقر على زر <strong className="text-white">"تفعيل وشحن البيانات"</strong> بالأعلى. سيقوم النظام بنقل كافة البيانات بنقرة واحدة إلى Cloud Firestore لتتحول فوراً إلى سجلات تفاعلية حية بورتفوليو مازن!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-6 md:px-12 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Side Tab Drawer Rail */}
        <div className="lg:col-span-3 space-y-6 text-left">
          <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-6">
            <h2 className="text-xs font-mono uppercase tracking-[0.25em] text-neutral-500 mb-4">
              COLLECTIONS ENGINE
            </h2>
            <div className="space-y-1">
              {TABS.map((tab) => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setIsFormOpen(false); }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md text-xs font-mono uppercase tracking-wider transition-all ${
                      activeTab === tab.id 
                        ? 'bg-white text-black font-semibold' 
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
                    }`}
                  >
                    <TabIcon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Secure Firewall System indicator */}
          <div className="bg-neutral-900/20 border border-neutral-900 rounded-xl p-4 text-[10px] font-mono text-neutral-500 space-y-2">
            <span className="flex items-center space-x-2 text-emerald-500 font-semibold uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Firewall System Live</span>
            </span>
            <p className="leading-relaxed">Logged securely with authenticated administrator session: {currentUser?.email}</p>
          </div>
        </div>

        {/* Right Tab panel */}
        <div className="lg:col-span-9 bg-neutral-950 border border-neutral-900 rounded-xl p-8 min-h-[600px] flex flex-col text-left">
          
          {/* Panel Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-900 pb-6 mb-6">
            <div>
              <h3 className="text-lg font-sans font-medium tracking-tight text-white capitalize">
                Manage {activeTab}
              </h3>
              <p className="text-xs font-mono text-neutral-500 uppercase mt-1 tracking-wider">
                Showing real time snapshot references from Firestore Database.
              </p>
            </div>

            {activeTab !== 'portrait' && (
              <button
                onClick={handleOpenCreate}
                className="flex items-center justify-center space-x-2 text-xs font-mono uppercase tracking-wider bg-white text-black hover:bg-neutral-200 px-4 py-2.5 rounded font-semibold transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Register New Item</span>
              </button>
            )}
          </div>

          {/* Forms Popup Area */}
          <AnimatePresence>
            {isFormOpen && (
              <motion.form
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleFormSubmit}
                className="bg-neutral-951/40 border border-neutral-900 rounded-lg p-6 mb-8 space-y-6"
              >
                <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                    {selectedId ? `Edit Config Reference: ${selectedId}` : `Create New ${activeTab} Record`}
                  </h4>
                  <button 
                    type="button" 
                    onClick={() => setIsFormOpen(false)}
                    className="text-neutral-500 hover:text-white text-sm"
                  >
                    ✕ Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  
                  {/* Dynamic inputs based on Tab Selection */}
                  {activeTab === 'projects' && (
                    <>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-neutral-500 max-w-xs block">Project Title</label>
                        <input
                          type="text"
                          required
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="w-full bg-neutral-950 border border-neutral-850 p-3 rounded text-xs text-white uppercase tracking-wider font-mono outline-none focus:border-neutral-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-neutral-500 max-w-xs block">Tech Stack (comma separated)</label>
                        <input
                          type="text"
                          required
                          value={formData.techStack}
                          onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                          className="w-full bg-neutral-950 border border-neutral-850 p-3 rounded text-xs text-white outline-none focus:border-neutral-500"
                        />
                      </div>

                      <div className="md:col-span-2 space-y-1">
                        <label className="text-[10px] font-mono uppercase text-neutral-500 max-w-xs block">Short Description</label>
                        <textarea
                          required
                          rows={2}
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="w-full bg-neutral-950 border border-neutral-850 p-3 rounded text-xs text-white outline-none focus:border-neutral-500 resize-none font-sans"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-neutral-500 max-w-xs block">Live Website URL</label>
                        <input
                          type="text"
                          value={formData.liveUrl}
                          onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                          className="w-full bg-neutral-950 border border-neutral-850 p-3 rounded text-xs text-white outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-neutral-500 max-w-xs block">GitHub Repository URL</label>
                        <input
                          type="text"
                          value={formData.githubUrl}
                          onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                          className="w-full bg-neutral-950 border border-neutral-850 p-3 rounded text-xs text-white outline-none"
                        />
                      </div>

                      <div className="md:col-span-2 space-y-1">
                        <label className="text-[10px] font-mono uppercase text-neutral-500 max-w-xs block">Image Resource Target (URL or drop below)</label>
                        <input
                          type="text"
                          value={formData.imageUrl}
                          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                          className="w-full bg-neutral-950 border border-neutral-850 p-3 rounded text-xs text-white outline-none"
                        />
                      </div>

                      <div className="md:col-span-2 space-y-1">
                        <label className="text-[10px] font-mono uppercase text-neutral-500 max-w-xs block">Deep Case Study (Markdown Text)</label>
                        <textarea
                          rows={6}
                          value={formData.caseStudy}
                          onChange={(e) => setFormData({ ...formData, caseStudy: e.target.value })}
                          className="w-full bg-neutral-950 border border-neutral-850 p-3 rounded text-xs text-white font-mono outline-none focus:border-neutral-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-neutral-500 max-w-xs block">Sort Arrangement Order (Number)</label>
                        <input
                          type="number"
                          value={formData.order}
                          onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                          className="w-full bg-neutral-950 border border-neutral-850 p-3 rounded text-xs text-white"
                        />
                      </div>

                      <div className="flex items-center space-x-3 pt-6">
                        <input
                          type="checkbox"
                          id="featured-check"
                          checked={formData.featured}
                          onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                          className="w-4 h-4 rounded border-neutral-800"
                        />
                        <label htmlFor="featured-check" className="text-xs font-mono uppercase text-neutral-400">Mark as Featured</label>
                      </div>
                    </>
                  )}

                  {activeTab === 'skills' && (
                    <>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-neutral-500 max-w-xs block">Skill Name</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full bg-neutral-950 border border-neutral-850 p-3 rounded text-xs text-white font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-neutral-500 max-w-xs block">Section Category</label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full bg-neutral-950 border border-neutral-850 p-3 rounded text-xs text-white font-mono"
                        >
                          <option value="frontend">Frontend & UI</option>
                          <option value="backend">Backend & Data</option>
                          <option value="tools">Tools & DevOps</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-neutral-500 max-w-xs block">Lucide Icon identifierName</label>
                        <input
                          type="text"
                          value={formData.icon}
                          onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                          className="w-full bg-neutral-950 border border-neutral-850 p-3 rounded text-xs text-white font-mono"
                          placeholder="Code2, Sparkles, Server"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-neutral-500 max-w-xs block">Order (Number)</label>
                        <input
                          type="number"
                          value={formData.order}
                          onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                          className="w-full bg-neutral-950 border border-neutral-850 p-3 rounded text-xs text-white"
                        />
                      </div>
                    </>
                  )}

                  {activeTab === 'services' && (
                    <>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-neutral-500 max-w-xs block">Service Target Name</label>
                        <input
                          type="text"
                          required
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="w-full bg-neutral-950 border border-neutral-850 p-3 rounded text-xs text-white font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-neutral-500 max-w-xs block">Service Icon</label>
                        <input
                          type="text"
                          value={formData.icon}
                          placeholder="Layers, Sparkles, Cpu"
                          onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                          className="w-full bg-neutral-950 border border-neutral-850 p-3 rounded text-xs text-white font-mono"
                        />
                      </div>

                      <div className="md:col-span-2 space-y-1">
                        <label className="text-[10px] font-mono uppercase text-neutral-500 max-w-xs block">Scope Description</label>
                        <textarea
                          required
                          rows={2}
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="w-full bg-neutral-950 border border-neutral-850 p-3 rounded text-xs text-white resize-none"
                        />
                      </div>

                      <div className="md:col-span-2 space-y-1">
                        <label className="text-[10px] font-mono uppercase text-neutral-500 max-w-xs block">Core Features Bullet Delivery list (comma separated)</label>
                        <input
                          type="text"
                          required
                          value={formData.features}
                          onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                          className="w-full bg-neutral-950 border border-neutral-850 p-3 rounded text-xs text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-neutral-500 max-w-xs block">Order (Number)</label>
                        <input
                          type="number"
                          value={formData.order}
                          onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                          className="w-full bg-neutral-950 border border-neutral-850 p-3 rounded text-xs text-white font-mono"
                        />
                      </div>
                    </>
                  )}

                  {activeTab === 'testimonials' && (
                    <>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-neutral-500 max-w-xs block">Leader Name</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full bg-neutral-950 border border-neutral-850 p-3 rounded text-xs text-white font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-neutral-500 max-w-xs block">Corporate role</label>
                        <input
                          type="text"
                          required
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          className="w-full bg-neutral-950 border border-neutral-850 p-3 rounded text-xs text-white font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-neutral-500 max-w-xs block">Company Platform</label>
                        <input
                          type="text"
                          required
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          className="w-full bg-neutral-950 border border-neutral-850 p-3 rounded text-xs text-white font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-neutral-500 max-w-xs block">Avatar URL (or drop below)</label>
                        <input
                          type="text"
                          value={formData.avatar}
                          onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                          className="w-full bg-neutral-950 border border-neutral-850 p-3 rounded text-xs text-white outline-none font-mono"
                        />
                      </div>

                      <div className="md:col-span-2 space-y-1">
                        <label className="text-[10px] font-mono uppercase text-neutral-500 max-w-xs block">Review Co-sign Message Text</label>
                        <textarea
                          required
                          rows={3}
                          value={formData.text}
                          onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                          className="w-full bg-neutral-950 border border-neutral-850 p-3 rounded text-xs text-white Outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-neutral-500 max-w-xs block">Order (Number)</label>
                        <input
                          type="number"
                          value={formData.order}
                          onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                          className="w-full bg-neutral-950 border border-neutral-850 p-3 rounded text-xs text-white"
                        />
                      </div>
                    </>
                  )}

                  {activeTab === 'socials' && (
                    <>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-neutral-500 max-w-xs block">Social Platform Name</label>
                        <input
                          type="text"
                          required
                          placeholder="GitHub, LinkedIn, Discord"
                          value={formData.platform}
                          onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                          className="w-full bg-neutral-950 border border-neutral-850 p-3 rounded text-xs text-white font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-neutral-500 max-w-xs block">Direct Profile Link URL</label>
                        <input
                          type="url"
                          required
                          value={formData.url}
                          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                          className="w-full bg-neutral-950 border border-neutral-850 p-3 rounded text-xs text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-neutral-500 max-w-xs block">Lucide Icon name</label>
                        <input
                          type="text"
                          placeholder="Github, Mail, Hash"
                          value={formData.icon}
                          onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                          className="w-full bg-neutral-950 border border-neutral-850 p-3 rounded text-xs text-white font-mono"
                        />
                      </div>
                    </>
                  )}

                  {activeTab === 'texts' && (
                    <>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-neutral-500 max-w-xs block">Identified config Key</label>
                        <input
                          type="text"
                          required
                          placeholder="hero-title, story-short..."
                          value={formData.key}
                          onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                          className="w-full bg-neutral-950 border border-neutral-850 p-3 rounded text-xs text-white font-mono"
                        />
                      </div>

                      <div className="md:col-span-2 space-y-1">
                        <label className="text-[10px] font-mono uppercase text-neutral-500 max-w-xs block">Landing Visual text value</label>
                        <textarea
                          required
                          rows={4}
                          value={formData.value}
                          onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                          className="w-full bg-neutral-950 border border-neutral-850 p-3 rounded text-xs text-white outline-none focus:border-neutral-500 resize-none font-sans"
                        />
                      </div>
                    </>
                  )}

                  {/* Cloudinary Configuration Fields for Admin ease-of-use */}
                  {(activeTab === 'projects' || activeTab === 'testimonials' || activeTab === 'texts') && (
                    <div className="md:col-span-2 bg-[#080808]/80 border border-neutral-900 rounded-lg p-4 space-y-4 mb-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-900 pb-2 gap-2">
                        <span className="text-xs font-mono uppercase tracking-wider text-white flex items-center gap-1.5 font-medium">
                          <Settings className="w-3.5 h-3.5 text-neutral-400" />
                          Cloudinary Storage Integrator
                        </span>
                        {metaEnv.VITE_CLOUDINARY_CLOUD_NAME && metaEnv.VITE_CLOUDINARY_UPLOAD_PRESET ? (
                          <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 px-2 py-0.5 rounded font-semibold uppercase">
                            ✓ Saved in Vercel / Environment Env Variables
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono text-neutral-500">
                            (Alternative browser cache storage)
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase text-[#737373] block">Cloudinary Cloud Name</label>
                          <input
                            type="text"
                            placeholder={metaEnv.VITE_CLOUDINARY_CLOUD_NAME ? "(Direct from system variables)" : "e.g., dxyz123abc"}
                            value={cloudinaryCloudName}
                            disabled={!!metaEnv.VITE_CLOUDINARY_CLOUD_NAME}
                            onChange={(e) => handleCloudinaryCloudNameChange(e.target.value)}
                            className={`w-full bg-black border border-neutral-900 p-2.5 rounded text-xs text-white outline-none focus:border-neutral-700 font-mono ${
                              metaEnv.VITE_CLOUDINARY_CLOUD_NAME ? 'opacity-60 cursor-not-allowed bg-neutral-950 text-neutral-400' : ''
                            }`}
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase text-[#737373] block">Unsigned Upload Preset</label>
                          <input
                            type="text"
                            placeholder={metaEnv.VITE_CLOUDINARY_UPLOAD_PRESET ? "(Direct from system variables)" : "e.g., my_preset_name"}
                            value={cloudinaryUploadPreset}
                            disabled={!!metaEnv.VITE_CLOUDINARY_UPLOAD_PRESET}
                            onChange={(e) => handleCloudinaryUploadPresetChange(e.target.value)}
                            className={`w-full bg-black border border-neutral-900 p-2.5 rounded text-xs text-white outline-none focus:border-neutral-700 font-mono ${
                              metaEnv.VITE_CLOUDINARY_UPLOAD_PRESET ? 'opacity-60 cursor-not-allowed bg-neutral-950 text-neutral-400' : ''
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Drag and Drop File Image Drag Area fallback (For Project / Testimonial avatars / Texts config) */}
                  {(activeTab === 'projects' || activeTab === 'testimonials' || activeTab === 'texts') && (
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-mono uppercase text-neutral-500 max-w-xs block mb-1">
                        {cloudinaryCloudName && cloudinaryUploadPreset ? 'Cloudinary Dynamic Upload Dropzone' : 'Base64 Resource Compiler Drag-and-Drop Area'}
                      </label>
                      <div
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed ${
                          dragActive ? 'border-white bg-neutral-900/40' : 'border-neutral-900 bg-neutral-950'
                        } p-8 rounded-lg text-center cursor-pointer hover:bg-neutral-900/20 transition-all relative`}
                      >
                        {isUploadingToCloudinary ? (
                          <div className="flex flex-col items-center justify-center py-4 space-y-2">
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
                            <p className="text-xs text-neutral-400 font-mono uppercase tracking-wider">Uploading to Cloudinary...</p>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-neutral-500 mx-auto mb-2" />
                            <p className="text-xs text-neutral-400 font-mono uppercase tracking-wider">
                              {cloudinaryCloudName && cloudinaryUploadPreset ? 'Drag & drop image file here to upload directly to Cloudinary' : 'Drag and drop raw image files here to convert directly'}
                            </p>
                            <p className="text-[9px] text-neutral-600 font-mono uppercase mt-1">
                              {cloudinaryCloudName && cloudinaryUploadPreset ? 'Images will load from Cloudinary via lightning fast, edge-optimized CDN links.' : 'No hosting limits, compiles directly into document state.'}
                            </p>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleFileChange(e.target.files[0]);
                                }
                              }}
                              className="hidden"
                              id="file-drop-input"
                            />
                            <button
                              type="button"
                              onClick={() => document.getElementById('file-drop-input')?.click()}
                              className="mt-4 text-[10px] font-mono text-white border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 px-3 py-1.5 rounded uppercase tracking-wider"
                            >
                              Manual Browse
                            </button>
                          </>
                        )}
                      </div>

                      {/* Local Upload base64 rendering preview details */}
                      {((activeTab === 'projects' && formData.imageUrl) || 
                        (activeTab === 'testimonials' && formData.avatar) || 
                        (activeTab === 'texts' && formData.value && (formData.value.startsWith('http') || formData.value.startsWith('data:image')))) && (
                        <div className="mt-4 flex items-center space-x-3 bg-neutral-900/40 border border-neutral-900 p-3 rounded">
                          <img
                            src={activeTab === 'projects' ? formData.imageUrl : (activeTab === 'testimonials' ? formData.avatar : formData.value)}
                            alt="Preview"
                            className="w-12 h-12 object-cover border border-neutral-800 rounded"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <span className="text-[9px] font-mono text-neutral-500 block uppercase">COMPILE SUCCESSFUL</span>
                            <span className="text-[10px] text-white font-mono truncate max-w-xs block">
                              {(activeTab === 'projects' ? formData.imageUrl : (activeTab === 'testimonials' ? formData.avatar : formData.value)).substring(0, 36)}...
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 pt-6 border-t border-neutral-900">
                  <button
                    type="submit"
                    className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider bg-white text-black hover:bg-neutral-200 px-5 py-3 rounded font-semibold transition-all shadow-md"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save state</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="text-xs font-mono uppercase tracking-wider text-neutral-500 hover:text-white px-4 py-3"
                  >
                    Discard Changes
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* List display grid area */}
          <div className="flex-1 space-y-3">
            
            {activeTab === 'projects' && liveProjects.map((p) => (
              <div 
                key={p.id}
                className="flex items-center justify-between p-4 bg-neutral-950 border border-neutral-900 rounded-lg hover:border-neutral-800 transition-colors"
              >
                <div className="flex items-center space-x-3 text-left">
                  <img src={p.imageUrl} alt="" className="w-10 h-10 rounded object-cover border border-neutral-800" referrerPolicy="no-referrer" />
                  <div>
                    <h4 className="text-xs font-sans font-medium text-white tracking-tight">{p.title}</h4>
                    <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">{p.techStack.join(', ')}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleOpenEdit(p)}
                    className="p-2 bg-neutral-900 hover:bg-neutral-850 rounded border border-neutral-850 text-neutral-400 hover:text-white transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(p.id, 'projects')}
                    className="p-2 bg-neutral-900/60 hover:bg-red-950/40 rounded border border-neutral-850 text-neutral-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {activeTab === 'skills' && liveSkills.map((s) => (
              <div 
                key={s.id}
                className="flex items-center justify-between p-4 bg-neutral-950 border border-neutral-900 rounded-lg hover:border-neutral-800"
              >
                <div className="text-left font-mono text-xs">
                  <span className="text-neutral-500">[{s.category}]</span> <span className="text-white font-sans font-medium text-sm ml-2">{s.name}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleOpenEdit(s)}
                    className="p-2 bg-neutral-900 hover:bg-neutral-850 rounded border border-neutral-850 text-neutral-400 hover:text-white"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(s.id, 'skills')}
                    className="p-2 bg-neutral-900/60 hover:bg-red-950/40 rounded border border-neutral-850 text-neutral-500 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {activeTab === 'services' && liveServices.map((srv) => (
              <div 
                key={srv.id}
                className="flex items-center justify-between p-4 bg-neutral-950 border border-neutral-900 rounded-lg hover:border-neutral-800"
              >
                <div className="text-left">
                  <h4 className="text-xs font-sans font-medium text-white">{srv.title}</h4>
                  <span className="text-[9px] font-mono text-neutral-500 uppercase block mt-1">{srv.description}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleOpenEdit(srv)}
                    className="p-2 bg-neutral-900 hover:bg-neutral-850 rounded border border-neutral-850 text-neutral-400 hover:text-white"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(srv.id, 'services')}
                    className="p-2 bg-neutral-900/60 hover:bg-red-950/40 rounded border border-neutral-850 text-neutral-500 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {activeTab === 'testimonials' && liveTestimonials.map((t) => (
              <div 
                key={t.id}
                className="flex items-center justify-between p-4 bg-neutral-950 border border-neutral-900 rounded-lg hover:border-neutral-800"
              >
                <div className="flex items-center space-x-3 text-left">
                  <img src={t.avatar} alt="" className="w-9 h-9 rounded-full object-cover border border-neutral-800" referrerPolicy="no-referrer" />
                  <div>
                    <h4 className="text-xs font-sans font-medium text-white">{t.name}</h4>
                    <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider">{t.role} - {t.company}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleOpenEdit(t)}
                    className="p-2 bg-neutral-900 hover:bg-neutral-850 rounded border border-neutral-850 text-neutral-400 hover:text-white"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(t.id, 'testimonials')}
                    className="p-2 bg-neutral-900/60 hover:bg-red-950/40 rounded border border-neutral-850 text-neutral-500 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {activeTab === 'socials' && liveSocials.map((soc) => (
              <div 
                key={soc.id}
                className="flex items-center justify-between p-4 bg-neutral-950 border border-neutral-900 rounded-lg hover:border-neutral-800"
              >
                <div className="text-left font-mono text-xs">
                  <span className="text-white font-sans font-medium text-sm">{soc.platform}</span> — <span className="text-neutral-500">{soc.url}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleOpenEdit(soc)}
                    className="p-2 bg-neutral-900/60 hover:bg-neutral-850 rounded border border-neutral-850 text-neutral-400 hover:text-white"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(soc.id, 'socialLinks')}
                    className="p-2 bg-neutral-900/60 hover:bg-red-950/40 rounded border border-neutral-850 text-neutral-500 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {activeTab === 'texts' && liveTexts.map((txt) => (
              <div 
                key={txt.id}
                className="flex items-center justify-between p-4 bg-neutral-950 border border-neutral-900 rounded-lg hover:border-neutral-800"
              >
                <div className="text-left text-xs max-w-lg">
                  <p className="font-mono text-neutral-500 uppercase tracking-widest">{txt.key}</p>
                  <p className="text-neutral-300 font-sans truncate mt-1">{txt.value}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleOpenEdit(txt)}
                    className="p-2 bg-neutral-900 hover:bg-neutral-850 rounded border border-neutral-850 text-neutral-400"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(txt.id, 'texts')}
                    className="p-2 bg-neutral-900/60 hover:bg-red-950/40 rounded border border-neutral-850 text-neutral-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {activeTab === 'portrait' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left w-full max-w-5xl mx-auto">
                
                {/* Simplified Left side: Only File Selector Action Button and Save */}
                <div className="lg:col-span-6 space-y-6">
                  
                  {/* Arabic Clear Guidance Card */}
                  <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-2xl p-5 space-y-2">
                    <span className="flex items-center space-x-2 text-emerald-400 text-xs font-mono uppercase tracking-wider font-semibold">
                      <Sparkles className="w-4 h-4" />
                      <span>تحديث صورة الهيرو الشخصية</span>
                    </span>
                    <p className="text-sm text-neutral-300 leading-relaxed font-sans">
                      اختر صورتك الجديدة مباشرة من هاتفك لرفعها فوراً. للحصول على أفضل مظهر تفاعلي داخل الموقع، يُفضّل أن تكون الصورة مقصوصة وبدون خلفية 
                      (<strong className="text-white">PNG Cutout</strong>).
                    </p>
                  </div>

                  {/* Single Clean Device Upload Area */}
                  <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileChange(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                      id="mobile-phone-portrait-input"
                    />

                    {isUploadingToCloudinary ? (
                      <div className="py-6 flex flex-col items-center justify-center space-y-3">
                        <div className="w-8 h-8 border-3 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
                        <p className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
                          جاري رفع الصورة وتجهيزها...
                        </p>
                      </div>
                    ) : (
                      <div className="py-2 w-full space-y-3">
                        <div className="mx-auto w-12 h-12 rounded-full bg-neutral-900 border border-neutral-850 flex items-center justify-center text-neutral-400">
                          <Upload className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-sm font-sans font-medium text-white">اختر صورة من ألبوم الكاميرا أو الهاتف</h3>
                          <p className="text-xs text-neutral-500 font-sans">سيتم رفع الصورة فوراً وتجهيزها للعرض</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => document.getElementById('mobile-phone-portrait-input')?.click()}
                          className="w-full flex items-center justify-center space-x-2 text-xs font-mono tracking-wider uppercase bg-white text-black hover:bg-neutral-200 py-3.5 px-4 rounded-xl font-semibold active:scale-[0.98] transition-all"
                        >
                          <Upload className="w-4 h-4 text-emerald-650" />
                          <span>رفع الصورة من الهاتف</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Save Action Banner */}
                  <div className="pt-4 border-t border-neutral-900">
                    <button
                      type="button"
                      disabled={isUploadingToCloudinary || !portraitValue}
                      onClick={async () => {
                        if (!portraitValue) {
                          alert('الرجاء اختيار صورة أولاً قبل الحفظ!');
                          return;
                        }
                        try {
                          await setDoc(doc(db, 'texts', 'text-hero-image'), {
                            id: 'text-hero-image',
                            key: 'hero-image',
                            value: portraitValue
                          });
                          alert('تم حفظ الصورة بنجاح وتحديث الهيرو مباشرة! 🎉');
                        } catch (err) {
                          handleFirestoreError(err, OperationType.WRITE, 'texts/text-hero-image');
                        }
                      }}
                      className="w-full flex items-center justify-center space-x-2 text-xs font-mono uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="w-4 h-4" />
                      <span>حفظ وتطبيق الصورة الجديدة</span>
                    </button>
                  </div>

                </div>

                {/* Right side: Elegant Portrait Simulation/Preview Display */}
                <div className="lg:col-span-6 space-y-3">
                  <span className="text-[10px] font-mono uppercase text-neutral-500 block tracking-wider text-center lg:text-left">
                    مظهر الصورة الحالي (LIVE PORTRAIT PREVIEW)
                  </span>
                  
                  {/* Simulated interactive Card preview */}
                  <div className="relative w-full aspect-[4/5] sm:aspect-[9/11] bg-gradient-to-b from-neutral-950/90 to-black/95 border border-neutral-900 rounded-2xl p-6 shadow-2xl flex flex-col items-center justify-end overflow-hidden">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f10_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f10_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/[0.015] rounded-full blur-2xl pointer-events-none" />

                    {/* Image Placeholder or Selected Picture cutout preview - Standalone and Giant */}
                    <div className="absolute inset-x-0 bottom-0 h-[105%] flex items-end justify-center overflow-visible pointer-events-none">
                      {portraitValue ? (
                        <img 
                          src={portraitValue} 
                          alt="Motaem Cutout Preview" 
                          className="w-[94%] md:w-[98%] max-h-[118%] object-contain filter drop-shadow-[0_25px_35px_rgba(0,0,0,0.85)]"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-4">
                          <Eye className="w-8 h-8 text-neutral-850 animate-pulse mb-2" />
                          <p className="text-[10px] font-mono text-neutral-600 uppercase">لا يوجد صورة مختارة حالياً</p>
                        </div>
                      )}
                    </div>

                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-neutral-950 to-transparent pointer-events-none" />
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
