import React from 'react';
import { Fabric } from '../types';
import { Package, Ruler, Tag } from 'lucide-react';

interface ProductCardProps {
  fabric: Fabric;
}

const ProductCard: React.FC<ProductCardProps> = ({ fabric }) => {
  return (
    <div className="group bg-white border border-neutral-100 p-4 rounded-sm transition-all duration-500 hover:border-[#D4AF37] hover:shadow-[0_20px_40px_rgba(212,175,55,0.08)] hover:-translate-y-1">
      <div className="relative aspect-square overflow-hidden mb-6 bg-[#FAFAFA]">
        <img
          src={fabric.imageUrl}
          alt={fabric.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          style={{
            filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.05))'
          }}
        />
        <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-sm border border-neutral-100 text-[10px] uppercase tracking-widest font-bold text-neutral-800">
          {fabric.type}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-serif text-neutral-900 group-hover:text-[#D4AF37] transition-colors">
            {fabric.name}
          </h3>
          <p className="text-xs text-neutral-400 uppercase tracking-widest font-medium mt-1">
            {fabric.material}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 py-4 border-y border-neutral-50">
          <div className="flex items-center gap-2">
            <Ruler size={14} className="text-[#D4AF37]" />
            <div>
              <p className="text-[10px] text-neutral-400 uppercase font-bold">Per Meter</p>
              <p className="text-sm font-semibold">${fabric.pricePerMeter}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Package size={14} className="text-[#D4AF37]" />
            <div>
              <p className="text-[10px] text-neutral-400 uppercase font-bold">Per Roll</p>
              <p className="text-sm font-semibold">${fabric.pricePerRoll}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${fabric.stock > 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
            <span className="text-[10px] uppercase tracking-widest font-bold text-neutral-500">
              {fabric.stock > 0 ? `${fabric.stock}m Available` : 'Out of Stock'}
            </span>
          </div>
          <button className="text-[10px] uppercase tracking-tighter font-bold border-b border-neutral-200 pb-0.5 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all">
            Order Sample
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
