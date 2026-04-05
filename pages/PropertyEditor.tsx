import React, { useState, useEffect } from 'react';
import { useStore } from '../context/Store';
import { Property, ViewState } from '../types';
import { Save, ArrowLeft, Sparkles, AlertCircle, Video } from 'lucide-react';

interface Props {
  propertyId: string | null;
}

export const PropertyEditor: React.FC<Props> = ({ propertyId }) => {
  const { properties, addProperty, updateProperty, navigate } = useStore();
  
  const initialForm: Omit<Property, 'id'> = {
    title: '',
    price: 0,
    address: '',
    description: '',
    bedrooms: 0,
    bathrooms: 0,
    sqft: 0,
    imageUrl: 'https://picsum.photos/800/600',
    videoUrl: '',
    aiSystemInstruction: 'You are a professional real estate agent. Answer questions accurately based on the property details.',
    aiTemperature: 0.7,
    listingType: 'sale'
  };

  const [formData, setFormData] = useState<Property | Omit<Property, 'id'>>(initialForm);

  useEffect(() => {
    if (propertyId) {
      const existing = properties.find(p => p.id === propertyId);
      if (existing) setFormData(existing);
    } else {
      setFormData(initialForm);
    }
  }, [propertyId, properties]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ('id' in formData) {
      updateProperty(formData as Property);
    } else {
      addProperty(formData as Omit<Property, 'id'>);
    }
    navigate({ name: 'ADMIN_DASHBOARD' });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 pb-20">
      <button 
        onClick={() => navigate({ name: 'ADMIN_DASHBOARD' })}
        className="flex items-center text-slate-500 hover:text-slate-800 mb-6 transition-colors"
      >
        <ArrowLeft size={18} className="mr-1" /> Back to Dashboard
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/50 p-6">
          <h1 className="text-2xl font-bold text-slate-900">
            {propertyId ? 'Edit Property' : 'New Property Listing'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">Configure property details and AI behavior.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          
          {/* Section 1: Basic Info */}
          <section>
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">1</span>
              Basic Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input required name="title" value={formData.title} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Price (₹)</label>
                <input required type="number" name="price" value={formData.price} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Listing Type</label>
                <select required name="listingType" value={(formData as Property).listingType} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="sale">For Sale</option>
                  <option value="rent">For Rent</option>
                  <option value="hostel">Hostel</option>
                  <option value="pg">PG</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                <input required name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div className="grid grid-cols-3 gap-4 md:col-span-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Beds</label>
                  <input required type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Baths</label>
                  <input required type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Sqft</label>
                  <input required type="number" name="sqft" value={formData.sqft} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none" />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea required name="description" rows={4} value={formData.description} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* Section 2: Media */}
          <section>
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">2</span>
              Media
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cover Image URL</label>
                <input name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none" />
                <p className="text-xs text-slate-400 mt-1">For demo purposes, we are using direct URLs.</p>
              </div>

              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Property Video URL</label>
                 <input name="videoUrl" value={formData.videoUrl || ''} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none" placeholder="https://example.com/video.mp4" />
                 {formData.videoUrl && (
                   <div className="mt-3 bg-green-50 text-green-700 px-3 py-2 rounded-md text-sm flex items-center gap-2">
                     <Video size={16} /> Video source set.
                   </div>
                )}
              </div>
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* Section 3: AI Configuration */}
          <section className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100">
            <h3 className="text-lg font-semibold text-indigo-900 mb-2 flex items-center gap-2">
              <Sparkles className="text-indigo-600" size={20} />
              AI Command Center
            </h3>
            <p className="text-sm text-indigo-700 mb-6">
              Control how the AI represents this property to buyers.
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-indigo-900 mb-1">
                  Agent Persona & System Instructions
                </label>
                <div className="relative">
                  <textarea 
                    name="aiSystemInstruction" 
                    rows={4} 
                    value={formData.aiSystemInstruction} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm text-sm" 
                    placeholder="e.g. Act as a historical expert. Emphasize the Victorian architecture..."
                  />
                  <div className="absolute bottom-3 right-3">
                     <Sparkles size={16} className="text-indigo-300" />
                  </div>
                </div>
                <p className="text-xs text-indigo-600 mt-2 flex items-start gap-1">
                  <AlertCircle size={12} className="mt-0.5" />
                  This prompt \"commands\" the AI. If you say \"Don't mention the small kitchen\", the AI will follow that rule when chatting with users.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-indigo-900 mb-1 flex justify-between">
                  <span>Creativity Level (Temperature)</span>
                  <span className="text-indigo-600 font-mono">{formData.aiTemperature}</span>
                </label>
                <input 
                  type="range" 
                  name="aiTemperature" 
                  min="0" 
                  max="1" 
                  step="0.1" 
                  value={formData.aiTemperature} 
                  onChange={handleChange} 
                  className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                />
                <div className="flex justify-between text-xs text-indigo-400 mt-1">
                  <span>Precise</span>
                  <span>Creative</span>
                </div>
              </div>
            </div>
          </section>

          <div className="flex justify-end pt-6">
            <button 
              type="submit" 
              className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center gap-2"
            >
              <Save size={20} />
              Save Property
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};