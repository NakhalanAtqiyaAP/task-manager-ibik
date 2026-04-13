import React, { useState } from 'react';
import Guide from './Guide'; // Pastikan path file Guide.jsx sudah benar

const Footer = () => {
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const currentYear = new Date().getFullYear();

  // Fungsi untuk handle WhatsApp
  const handleContactAdmin = () => {
    const phoneNumber = "62885715383055"; // Ganti dengan nomor WhatsApp admin (awalan 62)
    const message = encodeURIComponent("Halo Admin TI-25-KA, saya butuh bantuan terkait sistem.");
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  return (
    <footer className="mt-20 border-t-8 border-black bg-white">
      {/* Top Section */}
      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-start gap-10">
        
        {/* Brand Section */}
        <div className="max-w-md">
          <h4 className="font-black uppercase text-3xl mb-4 italic tracking-tighter text-black underline decoration-4 decoration-purple-400">
            // TI-25-KA
          </h4>
          <p className="font-bold text-sm text-black leading-relaxed border-l-4 border-black pl-4">
           Website TI-25-KA akan hadir karena kesolidan setiap membernya dan website ini terlahir dari permasalahan hingga pada akhirnya permasalahan itu menjadi website ini'(ngerti kan?)'.
          </p>
        </div>
        
        {/* Action Section */}
        <div className="flex flex-col gap-4 w-full md:w-auto">
          <h4 className="font-black uppercase text-lg underline decoration-4 decoration-green-400">Navigasi</h4>
          
          <div className="flex flex-wrap gap-3">
            {/* Tombol Panduan */}
            <button 
              onClick={() => setIsGuideOpen(true)}
              className="bg-purple-600 text-white border-4 border-black px-4 py-2 font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:bg-gray-100"
            >
              Panduan Penggunaan
            </button>

            {/* Tombol Hubungi Admin */}
            <button 
              onClick={handleContactAdmin}
              className="bg-green-400 text-white border-4 border-black px-4 py-2 font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:bg-purple-700"
            >
              Hubungi Admin
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Bar: System Stats */}
      <div className="bg-black text-white p-4 border-t-4 border-black">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-mono tracking-widest uppercase">
          
          <div className="flex flex-wrap justify-center gap-6">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Member : Online
            </span>
            <span className="text-yellow-400 hidden sm:inline">Semester 2</span>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex items-center gap-2">
              <span className="bg-purple-800 text-white px-2 py-0.5 font-black border border-white/20">DEV</span>
              <span className="font-black tracking-normal">Nakhalan Atqiya</span>
            </div>
            <span className="opacity-50 italic">© {currentYear} All rights reserved.</span>
          </div>
        </div>
      </div>

      {/* MODAL PANDUAN */}
      {isGuideOpen && (
        <Guide isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      )}
    </footer>
  );
};

export default Footer;