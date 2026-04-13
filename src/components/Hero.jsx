import { useState } from 'react';
import GameGuide from './Guide';

export default function Hero({ taskCount = 0, loading = false, user = null }) {
  const [showGuide, setShowGuide] = useState(false);

  return (
    <>
      <section className="py-6 sm:py-10 px-4 sm:px-6 md:px-0 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 items-center">
        
        {/* Main Info Block */}
        <div className="border-4 border-black bg-purple-700 p-6 sm:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] shimmer-container animate-spawn relative overflow-hidden flex flex-col items-center md:items-start text-center md:text-left">
          
          {/* Nama User - Gaya Neo-Brutalist Label */}
          <div className="mb-4">
            <span className="bg-green-400 text-black border-2 border-black px-3 py-1 font-black text-[10px] sm:text-xs uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] inline-block">
              Welcome, {user?.nama || 'Guest'}
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white uppercase mb-2 leading-none tracking-tight">
            Website<br className="hidden sm:block" /> TI-25-KA
          </h1>

          {/* Slogan Kecil */}
          <p className="text-purple-200 font-mono text-[10px] sm:text-xs uppercase tracking-widest mt-4">
            "TI-25-KA solid solid solid"
          </p>

          <div className="flex w-full md:w-auto gap-4 mt-6 pt-5">
            {/* Button Panduan dengan Neo-Brutalism */}
            <button 
              onClick={() => setShowGuide(true)}
              className="w-full md:w-auto border-4 border-black bg-white text-black px-6 py-3 font-black uppercase text-xs sm:text-sm shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:shadow-none active:translate-x-2 active:translate-y-2"
            >
              Panduan Penggunaan
            </button>
          </div>
        </div>
        
        {/* Decorative / Status Block */}
        {/* Menghapus 'hidden' agar info semester tetap muncul sebagai kartu status di mobile */}
        <div id="monitor" className="animate-glitch-load border-4 text-white border-black bg-white p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] relative">
          
          {/* Badge Semester */}
          <div className="absolute -top-4 -right-2 sm:-top-5 sm:-right-5 bg-green-400 border-2 sm:border-4 border-black px-3 py-1 font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-black uppercase text-sm sm:text-lg z-10">
            Semester 2
          </div>

          <div className="h-48 sm:h-64 bg-gray-800 border-2 sm:border-4 border-white flex flex-col items-center justify-center p-4 sm:p-6 text-center bg-scan-overlay relative z-0">
             <h3 className="font-black text-2xl sm:text-3xl uppercase mb-2 border-b-2 sm:border-b-4 border-white pb-2 relative z-10">
               Ringkasan
             </h3>
             <p className="font-bold text-gray-400 text-lg sm:text-xl mt-2 relative z-10 leading-tight">
               {loading ? (
                 <span className="animate-pulse">Memuat...</span>
               ) : taskCount > 0 ? (
                 <span className="text-green-400">{taskCount} tugas sedang aktif</span>
               ) : (
                 'Tidak ada tugas aktif'
               )}
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