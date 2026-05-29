import { useState } from 'react';
import { Fabric } from './types';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductCatalog from './components/ProductCatalog';
import AdminDashboard from './components/AdminDashboard';

const INITIAL_FABRICS: Fabric[] = [
  {
    id: '1',
    name: 'Imperial Mulberry Silk',
    material: '100% Organic Silk',
    pricePerMeter: 58,
    pricePerRoll: 1450,
    stock: 120,
    imageUrl: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=1072&auto=format&fit=crop',
    type: 'Silk'
  },
  {
    id: '2',
    name: 'Himalayan Cashmere',
    material: 'Ultra-fine Cashmere',
    pricePerMeter: 85,
    pricePerRoll: 2100,
    stock: 45,
    imageUrl: 'https://images.unsplash.com/photo-1584184924103-e310d9dc82fc?q=80&w=800&auto=format&fit=crop',
    type: 'Cashmere'
  },
  {
    id: '3',
    name: 'Venetian Cotton Velvet',
    material: 'Premium Cotton Blend',
    pricePerMeter: 42,
    pricePerRoll: 980,
    stock: 200,
    imageUrl: 'https://images.unsplash.com/photo-1606202051029-6933996720d2?q=80&w=800&auto=format&fit=crop',
    type: 'Velvet'
  },
  {
    id: '4',
    name: 'Belgian Heirloom Linen',
    material: 'Pure Belgian Flax',
    pricePerMeter: 36,
    pricePerRoll: 850,
    stock: 350,
    imageUrl: 'https://images.unsplash.com/photo-1614676471928-2ed0ad1061a4?q=80&w=800&auto=format&fit=crop',
    type: 'Linen'
  }
];

export default function App() {
  const [fabrics, setFabrics] = useState<Fabric[]>(INITIAL_FABRICS);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  const handleAddFabric = (newFabric: Fabric) => {
    setFabrics([newFabric, ...fabrics]);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-neutral-800 selection:bg-[#D4AF37]/20 selection:text-[#D4AF37]">
      <Navbar isAdminOpen={isAdminOpen} setIsAdminOpen={setIsAdminOpen} />

      <main>
        <Hero />
        <ProductCatalog fabrics={fabrics} />

        {/* Footer */}
        <footer className="py-20 px-6 border-t border-neutral-100 bg-white">
          <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
            <div className="col-span-2">
              <h3 className="text-2xl font-serif text-[#D4AF37] font-bold mb-6">TEX Vibe</h3>
              <p className="text-neutral-400 max-w-sm leading-relaxed text-sm">
                The global benchmark for luxury textiles. We provide the world's leading fashion houses
                with materials of unparalleled quality and heritage.
              </p>
            </div>
            <div>
              <h4 className="text-[10px] uppercase tracking-widest font-bold text-neutral-900 mb-6">Business</h4>
              <ul className="space-y-4 text-sm text-neutral-500 font-medium">
                <li><a href="#" className="hover:text-[#D4AF37] transition-colors">Wholesale Portal</a></li>
                <li><a href="#" className="hover:text-[#D4AF37] transition-colors">Sample Requests</a></li>
                <li><a href="#" className="hover:text-[#D4AF37] transition-colors">Shipping Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] uppercase tracking-widest font-bold text-neutral-900 mb-6">Connect</h4>
              <ul className="space-y-4 text-sm text-neutral-500 font-medium">
                <li><a href="#" className="hover:text-[#D4AF37] transition-colors">Instagram</a></li>
                <li><a href="#" className="hover:text-[#D4AF37] transition-colors">LinkedIn</a></li>
                <li><a href="#" className="hover:text-[#D4AF37] transition-colors">Paris Showroom</a></li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-neutral-50 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] text-neutral-300 uppercase tracking-widest font-bold">
              © 2024 TEX VIBE TEXTILES. ALL RIGHTS RESERVED.
            </p>
            <p className="text-[10px] text-neutral-300 uppercase tracking-widest font-bold">
              Privacy / Terms / Cookie Policy
            </p>
          </div>
        </footer>
      </main>

      {isAdminOpen && (
        <AdminDashboard 
          onAddFabric={handleAddFabric}
          onClose={() => setIsAdminOpen(false)}
        />
      )}
    </div>
  );
}
