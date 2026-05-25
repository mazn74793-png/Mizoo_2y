import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { OperationType, FirestoreErrorInfo } from './types';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Default Seed Data to populates empty database
export const DEFAULT_PROJECTS = [
  {
    id: 'aeon-os',
    title: 'Aeon Engine & OS',
    description: 'A hardware-accelerated sandboxed execution environment built with Rust, WebAssembly, and custom pixel-perfect low-level shader render layers.',
    techStack: ['Rust', 'WebAssembly', 'WebGL', 'TypeScript', 'Node.js'],
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1280&auto=format&fit=crop',
    liveUrl: '#',
    githubUrl: 'https://github.com/mazen/aeon-os',
    caseStudy: `## The AEON operating engine is a marvel of web integration. 
    
Designed as a modern containerized environment, AEON enables developers to run pre-compiled WASM binaries directly inside web viewports. 
By utilizing high-performance Rust adapters and strict memory boundary limits, AEON delivers desktop-level rendering speeds at absolute safety levels.

### Deep Architecture
- **Graphics Pipeline**: WebGL canvas running parallel canvas shaders at stable 120 FPS.
- **WASM Virtual Machine**: Compiles Rust and Go routines with real-time thread dispatchers.
- **Glass Interface Layout**: Sub-pixel anti-aliased windows reflecting Apple-standard blur.
- **Safety**: Fully isolated sandbox keeping client data locally persistent.`,
    order: 1,
    featured: true
  },
  {
    id: 'linearjs',
    title: 'Linear.js Core Orchestrator',
    description: 'An enterprise task orchestrator and kanban synchronization system with sub-50ms offline replication, real-time sync conflicts, and CRDT engines.',
    techStack: ['TypeScript', 'React', 'CRDTs', 'Node.js', 'PostgreSQL'],
    imageUrl: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=1280&auto=format&fit=crop',
    liveUrl: '#',
    githubUrl: 'https://github.com/mazen/linearjs',
    caseStudy: `## High Performance Replication & Coordination

Designed for hyper-collaborative high-velocity software squads, Linear.js provides standard offline database replication that synchronizes instantly upon re-establishing connection.

### Core Features
- **Y-JS Integrations**: Zero-latency collaborative text block editing.
- **Conflict Free Replicated Data Types**: Ensures all distributed device states align seamlessly without server intervention.
- **Pristine Performance**: Redux stores tuned to track only active screen-viewports, drastically cutting down CPU render cycles.`,
    order: 2,
    featured: true
  },
  {
    id: 'stripe-flux',
    title: 'Stripe Flux Ledger',
    description: 'A luxury multi-currency ledger routing engine and real-time ledger visualization dashboard for enterprise SaaS processing $50M+ ARR.',
    techStack: ['Next.js', 'Go', 'Tailwind', 'D3.js', 'Firestore'],
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1280&auto=format&fit=crop',
    liveUrl: '#',
    githubUrl: 'https://github.com/mazen/stripe-flux',
    caseStudy: `## Enterprise Accounting Visualized

Stripe Flux ledger was built for global SaaS businesses requiring advanced accounting visualisations. We replace complicated, boring bank statements with highly fluid, motion-designed linear graphs.

### Features
- **Ledger Invariant Engine**: Keeps multi-currency conversion records compliant without rounding decay.
- **D3 Cinematic Charting**: Real-time canvas charts rendering millions of bank logs smoothly.
- **Security-First Rules**: Complete zero-trust architecture validating every route request.`,
    order: 3,
    featured: true
  },
  {
    id: 'raycast-portal',
    title: 'Raycast Portal Ecosystem',
    description: 'An extensible developer tool launcher housing local LLMs, secure SSH keys management, and immediate system configurations in a single utility.',
    techStack: ['React', 'Node.js', 'Electron', 'SQLite', 'Tailwind'],
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1280&auto=format&fit=crop',
    liveUrl: '#',
    githubUrl: 'https://github.com/mazen/raycast-portal',
    caseStudy: `## Instant Developer Utilities

Raycast Portal is the ultimate command center for modern engineers. It bypasses clutter by offering instant custom quick-command definitions in a gorgeous key-controlled overlay window.

### Architecture Secrets
- **Electron Shell Polish**: Sub-5ms application response time with a native macOS styling system.
- **Local Neural Networks**: Built-in Llama integration running locally on CPU.
- **Keys Store**: AES-256 encrypted credential management.`,
    order: 4,
    featured: true
  },
  {
    id: 'lumina-saas',
    title: 'Lumina Premium Analytics',
    description: 'An AI-powered video summarization and semantic search platform catering to modern media agencies and streaming startups.',
    techStack: ['Node.js', 'Gemini AI', 'Pinecone', 'React', 'Tailwind'],
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1280&auto=format&fit=crop',
    liveUrl: '#',
    githubUrl: 'https://github.com/mazen/lumina',
    caseStudy: `## Semantic Video Understanding

Lumina transforms video processing from traditional transcript searches to deep visual understanding using modern multimodal models.

### Highlights
- **Video Embeddings Pipeline**: Extracts high-relevance timestamps for precise frame lookups.
- **Gemini AI Integration**: Uses server-side proxy prompts to summarize complex webinars in seconds.
- **Bento Grid Presentation**: Elegant dark components updating fluidly.`,
    order: 5,
    featured: true
  },
  {
    id: 'nebula-design',
    title: 'Nebula Adaptive Design System',
    description: 'A component design library built for Figma and compiled into React primitives with custom layouts, tokens, and hardware-accelerated themes.',
    techStack: ['Framer Motion', 'React', 'Tailwind', 'CSS Variable Engine'],
    imageUrl: 'https://images.unsplash.com/photo-1541462608141-275d72e24021?q=80&w=1280&auto=format&fit=crop',
    liveUrl: '#',
    githubUrl: 'https://github.com/mazen/nebula-design',
    caseStudy: `## Systematic Design Integrity

Nebula is the core foundational library of high-contrast elegant layouts, enabling teams to build polished, Apple-grade SaaS dashboards in minutes.

### Features
- **Design Tokens**: Automated compiler exporting style definitions to Tailwind config.
- **Motion Orchestrator**: Uniform cubic-bezier values ensuring matching feedback across all elements.
- **Accessibility**: Pure dark-and-light contrast ratings with readable Inter fonts.`,
    order: 6,
    featured: true
  }
];

export const DEFAULT_SKILLS = [
  { id: 'react', name: 'React 19 & Next.js', category: 'frontend', icon: 'Code2', order: 1 },
  { id: 'typescript', name: 'TypeScript', category: 'frontend', icon: 'FileCode', order: 2 },
  { id: 'rust', name: 'Rust & WASM', category: 'backend', icon: 'Cpu', order: 3 },
  { id: 'node', name: 'Node.js & Go', category: 'backend', icon: 'Server', order: 4 },
  { id: 'databases', name: 'PostgreSQL & Firestore', category: 'backend', icon: 'Database', order: 5 },
  { id: 'tailwind', name: 'Tailwind CSS', category: 'frontend', icon: 'Layers', order: 6 },
  { id: 'framer', name: 'Framer Motion & GSAP', category: 'frontend', icon: 'Sparkles', order: 7 },
  { id: 'gemini', name: 'Gemini AI API', category: 'backend', icon: 'BrainCircuit', order: 8 }
];

export const DEFAULT_SERVICES = [
  {
    id: 's1',
    title: 'Full-Stack Engineering',
    description: 'Development of robust web platforms with high-performance backends and interactive web interfaces.',
    icon: 'Layers',
    features: ['Rust & WASM compilations', 'Offline database conflict resolutions', 'Type-safe React pipelines'],
    order: 1
  },
  {
    id: 's2',
    title: 'Premium SaaS Design & Dev',
    description: 'High-end functional web applications mirroring modern industry leaders like Apple, Linear and Stripe.',
    icon: 'Sparkles',
    features: ['Apple-standard negative spacing', 'Liquid-smooth visual inertia scrolling', 'Interactive telemetry grids'],
    order: 2
  },
  {
    id: 's3',
    title: 'AI & Intelligence Integrations',
    description: 'Empowering enterprise backends with semantic vector search, LLM summaries, and natural language routes.',
    icon: 'BrainCircuit',
    features: ['Gemini Multimodal reasoning', 'Fast vector embedding store syncs', 'Autonomous server task loops'],
    order: 3
  },
  {
    id: 's4',
    title: 'Sub-Pixel Performance tuning',
    description: 'Targeted code optimization ensuring flawless 60fps animations and rapid 100ms first-contentful paint.',
    icon: 'Cpu',
    features: ['Detailed GPU memory leak profile analysis', 'Tree-shaking bundle distribution limits', 'Optimized resource lazy load pipelines'],
    order: 4
  }
];

export const DEFAULT_TESTIMONIALS = [
  {
    id: 't1',
    name: 'Sarah Jenkins',
    role: 'VP of Product',
    company: 'Linear Corp',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop',
    text: 'Mazen does not just write code; he crafts technical art. He helped reconstruct our core sync pipeline, delivering sub-50ms replications. His attention to detail matches high premium design houses. Fully recommended.',
    order: 1
  },
  {
    id: 't2',
    name: 'Kenji Sato',
    role: 'Director of Technology',
    company: 'Vercel, Japan',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop',
    text: 'Working with Mazen felt like collaborating with a specialized elite studio. He has an intuitive sense of Vercel-like sleek micro-interactions and rigorous system layout. The resulting app loads instantly, runs smoothly at 120 FPS.',
    order: 2
  },
  {
    id: 't3',
    name: 'Marcus Vance',
    role: 'Founder',
    company: 'Aeon Labs',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop',
    text: 'Many developers can code, but few possess the artistic direction and severe perfectionism that Mazen exhibits. He is operating at a global prime grade.',
    order: 3
  }
];

export const DEFAULT_SOCIALS = [
  { id: 'soc1', platform: 'Email', url: 'mailto:motaem23@gmail.com', icon: 'Mail' },
  { id: 'soc2', platform: 'GitHub', url: 'https://github.com/mazen-elite', icon: 'Github' },
  { id: 'soc3', platform: 'LinkedIn', url: 'https://linkedin.com/in/mazen-elite', icon: 'Linkedin' },
  { id: 'soc4', platform: 'WhatsApp', url: 'https://wa.me/201012345678', icon: 'MessageSquareInside' },
  { id: 'soc5', platform: 'Discord', url: 'https://discord.gg/mazen-elite', icon: 'Hash' }
];

export const DEFAULT_TEXTS = [
  { id: 'hero-title', key: 'hero-title', value: 'I build digital experiences that feel premium.' },
  { id: 'story-short', key: 'story-short', value: 'I merge high-precision system mechanics with elite aesthetic sensitivity. Drawing inspiration from modern giants like Apple, Stripe and Linear, I believe complex applications must load with zero friction and represent premium durability.' }
];
