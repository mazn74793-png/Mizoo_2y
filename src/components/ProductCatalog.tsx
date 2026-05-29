import React from 'react';
import { Fabric } from '../types';
import ProductCard from './ProductCard';

interface ProductCatalogProps {
  fabrics: Fabric[];
}

const ProductCatalog: React.FC<ProductCatalogProps> = ({ fabrics }) => {
  return (
    <section id="collections" className="py-32 px-6 lg:px-12 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl">
            <span className="text-[#D4AF37] font-medium tracking-[0.3em] uppercase text-xs mb-4 block">
              Curated Selection
            </span>
            <h2 className="text-4xl md:text-5xl font-serif text-neutral-900 mb-6">
              Seasonal B2B Collections
            </h2>
            <div className="w-20 h-1 bg-[#D4AF37]/20" />
          </div>

          <div className="flex gap-8 text-xs font-bold uppercase tracking-widest text-neutral-400">
            <button className="text-neutral-900 border-b-2 border-[#D4AF37] pb-2">All Fabrics</button>
            <button className="hover:text-neutral-900 transition-colors pb-2">Silk</button>
            <button className="hover:text-neutral-900 transition-colors pb-2">Cashmere</button>
            <button className="hover:text-neutral-900 transition-colors pb-2">Velvet</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {fabrics.map((fabric) => (
            <ProductCard key={fabric.id} fabric={fabric} />
          ))}
        </div>

        {fabrics.length === 0 && (
          <div className="py-20 text-center border-2 border-dashed border-neutral-100 rounded-lg">
            <p className="text-neutral-400 font-serif italic text-lg">The collection is currently being updated...</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductCatalog;
