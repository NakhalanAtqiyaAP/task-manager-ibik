import { useState } from 'react';
import GameGuide from './Guide';

export default function Hero({ taskCount = 0, loading = false, user = null }) {
  const [showGuide, setShowGuide] = useState(false);
  

  return (
    <>
      <section className="py-10 px-4 sm:px-6 md:px-0 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center">
        {/* Main Info Block */}
        <div className="border-4 border-black bg-purple-700 p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] shimmer-container animate-entrance delay-300 relative overflow-hidden">
          
          {/* Nama User - Gaya Neo-Brutalist Label */}
          <div className="mb-4">
            <span className="bg-green-400 text-black border-2 border-black px-3 py-1 font-black text-xs uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] inline-block">
              Welcome, {user?.nama || 'Guest'}
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-black text-white uppercase mb-2 leading-none tracking-tight">
            Website<br />TI-25-KA
          </h1>

          {/* Tambahan Slogan Kecil agar tidak kosong */}
          <p className="text-purple-200 font-mono text-xs uppercase tracking-widest mt-4">
            "TI-25-KA solid solid solid"
          </p>

          <div className="flex gap-4 mt-6 flex-wrap justify-center pt-5">
            {/* Button Panduan dengan Neo-Brutalism */}
            <button 
              onClick={() => setShowGuide(true)}
              className="border-4 border-black bg-white text-black px-6 py-3 font-black uppercase text-sm shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:shadow-none active:translate-x-2 active:translate-y-2"
            >
              Panduan Penggunaan
            </button>
          </div>
        </div>
        
        {/* Decorative / Status Block */}
        <div id="monitor" className="hidden md:block border-4 text-white border-black bg-white p-4 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] relative">
          <div className="absolute -top-5 -right-5 bg-green-400 border-4 border-black px-4 py-1 font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black uppercase text-lg z-10">
            Semester 2
          </div>
          <div className="h-64 bg-gray-800 border-4 border-white flex flex-col items-center justify-center p-6 text-center bg-scan-overlay relative z-0">
             <h3 className="font-black text-3xl uppercase mb-2 border-b-4 border-white pb-2 relative z-10">Ringkasan</h3>
             <p className="font-bold text-gray-500 text-xl mt-2 relative z-10">
               {loading ? 'Memuat...' : taskCount > 0 ? `${taskCount} tugas sedang aktif` : 'Tidak ada tugas aktif'}
             </p>
          </div>
        </div>
      </section>

      {/* MODAL PANDUAN PENGGUNAAN */}
      {showGuide && (
        <GameGuide 
          userName={user?.nama} 
          onClose={() => setShowGuide(false)} 
        />
      )}
    </>
  );
}