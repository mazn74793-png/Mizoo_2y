import React, { useState } from 'react';
import { Fabric } from '../types';
import { X, Upload, Plus, CheckCircle2 } from 'lucide-react';

interface AdminDashboardProps {
  onAddFabric: (fabric: Fabric) => void;
  onClose: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onAddFabric, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    material: '',
    pricePerMeter: '',
    pricePerRoll: '',
    type: 'Silk',
    stock: ''
  });

  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState('');

  // Cloudinary Widget Simulation Logic
  const handleCloudinaryUpload = () => {
    setUploading(true);
    
    // Simulate Cloudinary Widget behavior
    // Explicit placeholders for user integration:
    const cloudName = 'YOUR_CLOUD_NAME';
    const uploadPreset = 'YOUR_UPLOAD_PRESET';

    console.log(`Initialising Cloudinary Widget for ${cloudName} with preset ${uploadPreset}`);

    setTimeout(() => {
      // Mock successful upload response
      const mockUrl = 'https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=800&auto=format&fit=crop';
      setUploadedUrl(mockUrl);
      setUploading(false);
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newFabric: Fabric = {
      id: Date.now().toString(),
      name: formData.name,
      material: formData.material,
      pricePerMeter: Number(formData.pricePerMeter),
      pricePerRoll: Number(formData.pricePerRoll),
      type: formData.type,
      stock: Number(formData.stock),
      imageUrl: uploadedUrl || 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=1072&auto=format&fit=crop'
    };
    onAddFabric(newFabric);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div
        className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-xl glass-dashboard h-full p-10 overflow-y-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-serif text-neutral-900">Inventory Control</h2>
            <p className="text-sm text-neutral-500 mt-1 uppercase tracking-widest font-medium">B2B Management Console</p>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <X size={24} className="text-neutral-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Upload Zone */}
          <div
            onClick={handleCloudinaryUpload}
            className={`relative h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${uploadedUrl ? 'border-emerald-200 bg-emerald-50/30' : 'border-neutral-200 hover:border-[#D4AF37] hover:bg-[#FAFAFA]'}`}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-6 h-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">Connecting to Cloudinary...</p>
              </div>
            ) : uploadedUrl ? (
              <div className="flex flex-col items-center gap-2">
                <CheckCircle2 size={32} className="text-emerald-500" />
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Image Processed Successfully</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 bg-white shadow-sm border border-neutral-100 rounded-full">
                  <Upload size={24} className="text-[#D4AF37]" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-neutral-800 uppercase tracking-widest">Cloudinary Upload Zone</p>
                  <p className="text-[10px] text-neutral-400 mt-1">PNG, JPG or WEBP (Max 10MB)</p>
                </div>
              </div>
            )}
            {uploadedUrl && (
              <img src={uploadedUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover rounded-xl opacity-10 pointer-events-none" />
            )}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400">Fabric Name</label>
              <input
                required
                className="w-full bg-white border border-neutral-100 px-4 py-3 rounded-sm focus:border-[#D4AF37] transition-colors outline-none font-medium"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Imperial Silk Satin"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400">Material Composition</label>
              <input
                required
                className="w-full bg-white border border-neutral-100 px-4 py-3 rounded-sm focus:border-[#D4AF37] transition-colors outline-none font-medium"
                value={formData.material}
                onChange={e => setFormData({...formData, material: e.target.value})}
                placeholder="e.g. 100% Mulberry Silk"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400">Price / Meter ($)</label>
              <input
                required
                type="number"
                className="w-full bg-white border border-neutral-100 px-4 py-3 rounded-sm focus:border-[#D4AF37] transition-colors outline-none font-medium"
                value={formData.pricePerMeter}
                onChange={e => setFormData({...formData, pricePerMeter: e.target.value})}
                placeholder="45"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400">Price / Roll ($)</label>
              <input
                required
                type="number"
                className="w-full bg-white border border-neutral-100 px-4 py-3 rounded-sm focus:border-[#D4AF37] transition-colors outline-none font-medium"
                value={formData.pricePerRoll}
                onChange={e => setFormData({...formData, pricePerRoll: e.target.value})}
                placeholder="1200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400">Category</label>
              <select
                className="w-full bg-white border border-neutral-100 px-4 py-3 rounded-sm focus:border-[#D4AF37] transition-colors outline-none font-medium appearance-none"
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
              >
                <option>Silk</option>
                <option>Cashmere</option>
                <option>Velvet</option>
                <option>Linen</option>
                <option>Wool</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400">Stock Level (m)</label>
              <input
                required
                type="number"
                className="w-full bg-white border border-neutral-100 px-4 py-3 rounded-sm focus:border-[#D4AF37] transition-colors outline-none font-medium"
                value={formData.stock}
                onChange={e => setFormData({...formData, stock: e.target.value})}
                placeholder="500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-5 bg-neutral-900 text-white rounded-sm font-bold uppercase tracking-[0.2em] text-xs hover:bg-[#D4AF37] transition-all shadow-xl shadow-neutral-900/10 flex items-center justify-center gap-3"
          >
            <Plus size={16} />
            Publish to Catalog
          </button>
        </form>

        <div className="mt-12 p-6 bg-amber-50 rounded-lg border border-amber-100">
          <p className="text-[10px] text-amber-700 font-bold uppercase tracking-widest mb-2">Integration Note</p>
          <p className="text-xs text-amber-600 leading-relaxed">
            The Cloudinary Widget is currently in simulation mode. Update the `cloudName` and `uploadPreset` in the source code to enable live production uploads.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
