import React, { useState } from 'react';
import { GALLERY_IMAGES } from '../constants/data';

interface GallerySectionProps {
  onOpenEnquiry?: (program?: string) => void;
}

export const GallerySection: React.FC<GallerySectionProps> = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section id="gallery" className="relative py-16 px-4 max-w-7xl mx-auto text-center pointer-events-auto scroll-mt-24">
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl">
        <h2 className="text-3xl font-bold text-white mb-3 font-display">Campus & Classroom Gallery</h2>
        <p className="text-gray-400 max-w-2xl mx-auto mb-6 text-sm sm:text-base">
          Take a visual tour of our modern classrooms, library facilities, and collaborative study environments at Sarvadnya Tuition Classes, Nagpur.
        </p>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-[#D5B06C] hover:bg-[#c49f5b] text-slate-950 font-bold px-8 py-3 rounded-full transition-all duration-300 shadow-lg cursor-pointer"
        >
          {isOpen ? "Hide Gallery" : "Open Gallery"}
        </button>

        {isOpen && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10 transition-all duration-500">
            {GALLERY_IMAGES.map((img, idx) => (
              <div key={idx} className="group overflow-hidden rounded-xl bg-slate-800 border border-slate-700 hover:border-[#D5B06C]/40 transition-colors">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={img.url} 
                    alt={img.title} 
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                </div>
                <div className="p-4 text-left">
                  <h4 className="text-white font-semibold text-sm">{img.title}</h4>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
