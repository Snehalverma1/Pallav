import React from 'react';
import { useStore } from '../context/Store';
import { MapPin, Bed, Bath, ArrowRight } from 'lucide-react';

export const UserGallery: React.FC = () => {
  const { properties, navigate } = useStore();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-slate-900 text-white py-16 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=2073&q=80')] bg-cover bg-center" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Find Your Dream Home</h1>
          <p className="text-slate-300 text-lg mb-8">
            Explore our curated selection of premium properties, enhanced with intelligent AI assistance.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto p-6 md:p-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property) => (
            <div key={property.id} className="group cursor-pointer" onClick={() => navigate({ name: 'USER_PROPERTY', propertyId: property.id })}>
              <div className="relative overflow-hidden rounded-2xl mb-4 shadow-sm group-hover:shadow-xl transition-all duration-300">
                <img 
                  src={property.imageUrl} 
                  alt={property.title} 
                  className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <span className="text-white font-medium flex items-center gap-2">View Details <ArrowRight size={16} /></span>
                </div>
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-slate-900 px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                  ${(property.price / 1000).toLocaleString()}k
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{property.title}</h3>
              <p className="text-slate-500 text-sm flex items-center gap-1 mb-3">
                <MapPin size={14} /> {property.address}
              </p>
              
              <div className="flex items-center gap-4 text-slate-600 text-sm">
                <span className="flex items-center gap-1"><Bed size={16} /> {property.bedrooms} Beds</span>
                <span className="flex items-center gap-1"><Bath size={16} /> {property.bathrooms} Baths</span>
                <span className="bg-slate-100 px-2 py-0.5 rounded text-xs">{property.sqft} sqft</span>
              </div>
            </div>
          ))}
        </div>

        {properties.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            <p>No listings available at the moment. Please check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
};
