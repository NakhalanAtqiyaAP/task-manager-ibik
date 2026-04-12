import { useState, useEffect } from 'react';

export default function GameGuide({ onClose, userName }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [spotlightStyle, setSpotlightStyle] = useState({ opacity: 0 });

  const guideSteps = [
    {
      title: "SYSTEM_STARTUP",
      character: "💻 SYSTEM",
      message: `Halo, ${userName || 'User'}! Selamat datang di core system TI-25-KA. Aku akan memandu instalasi pemahamanmu di sini...`,
      image: "⚡",
      target: null // Center screen
    },
    {
      title: "STATUS_MONITOR",
      character: "📊 ANALYST",
      message: "Di sini adalah ringkasan tugasmu. Jika angka di sini bukan nol, berarti ada pekerjaan yang menunggu!",
      image: "📁",
      target: ".bg-gray-800" // Menunjuk kotak Ringkasan di Hero
    },
    {
      title: "NAVIGATION_MENU",
      character: "☰ OPERATOR",
      message: "Gunakan tombol menu ini untuk navigasi ke Mahasiswa, Mata Kuliah, atau tambah data tugas baru.",
      image: "🛠️",
      target: "button[aria-label='Toggle menu']" // Menunjuk tombol hamburger
    },
    {
      title: "USER_PROFILE",
      character: "👤 IDENTITY",
      message: "Klik avatar ini untuk mengubah profil, mengganti foto, atau mengganti password sistemmu.",
      image: "🔑",
      target: "button[title='Buka Profil']" // Menunjuk avatar
    },
    {
      title: "MISSION_COMPLETE",
      character: "🚀 SYSTEM",
      message: "Sekarang kamu sudah siap. Jelajahi sistem dan selesaikan semua tugas tepat waktu!",
      image: "🏁",
      target: null
    }
  ];

  // Fix bug kata terpotong & Typewriter
  useEffect(() => {
    let i = 0;
    const fullText = guideSteps[currentStep].message;
    setDisplayText(""); // Reset text
    setIsTyping(true);

    // Gunakan delay kecil sebelum mulai ngetik agar state reset selesai
    const startTimeout = setTimeout(() => {
      const typingInterval = setInterval(() => {
        if (i < fullText.length) {
          // Menggunakan functional update untuk memastikan karakter tidak terlewat
          setDisplayText(fullText.substring(0, i + 1));
          i++;
        } else {
          setIsTyping(false);
          clearInterval(typingInterval);
        }
      }, 30);
      return () => clearInterval(typingInterval);
    }, 100);

    // Update Spotlight Position
    updateSpotlight();

    return () => clearTimeout(startTimeout);
  }, [currentStep]);

  const updateSpotlight = () => {
    const targetSelector = guideSteps[currentStep].target;
    if (!targetSelector) {
      setSpotlightStyle({ opacity: 0 });
      return;
    }

    const el = document.querySelector(targetSelector);
    if (el) {
      const rect = el.getBoundingClientRect();
      const padding = 10;
      setSpotlightStyle({
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
        opacity: 1,
        boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.75)", // Hitam di luar lubang
      });
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Update posisi spotlight jika layar di-resize
  useEffect(() => {
    window.addEventListener('resize', updateSpotlight);
    return () => window.removeEventListener('resize', updateSpotlight);
  }, [currentStep]);

  const nextStep = () => {
    if (currentStep < guideSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] font-mono overflow-hidden">
      {/* SPOTLIGHT LAYER */}
      <div 
        className="fixed z-[101] border-2 border-green-400 rounded-lg transition-all duration-500 pointer-events-none"
        style={spotlightStyle}
      >
        {spotlightStyle.opacity === 1 && (
          <div className="absolute -top-10 left-0 bg-green-400 text-black px-2 py-1 text-[10px] font-black uppercase animate-bounce">
            LIHAT_KE_SINI!
          </div>
        )}
      </div>

      {/* BACKGROUND DIM (Hanya jika spotlight tidak aktif) */}
      {!guideSteps[currentStep].target && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-[100]"></div>
      )}

      {/* DIALOG CONTAINER */}
      <div className="absolute inset-0 flex items-end justify-center p-4 sm:p-10 z-[102] pointer-events-none">
        <div className="w-full max-w-4xl animate-in slide-in-from-bottom-10 duration-500 pointer-events-auto">
          
          <div className="inline-block bg-purple-600 border-t-4 border-l-4 border-r-4 border-black px-4 py-1">
            <span className="text-white font-black text-xs sm:text-sm tracking-tighter uppercase italic">
              {guideSteps[currentStep].title}
            </span>
          </div>

          <div className="bg-white border-8 border-black p-6 shadow-[12px_12px_0px_0px_rgba(168,85,247,1)] relative">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-black border-4 border-purple-500 flex items-center justify-center text-4xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] shrink-0">
                {guideSteps[currentStep].image}
              </div>

              <div className="flex-1">
                <h4 className="font-black text-purple-600 mb-2 uppercase tracking-tighter">
                  {">"} {guideSteps[currentStep].character}
                </h4>
                <p className="text-black font-bold text-lg leading-relaxed min-h-[80px]">
                  {displayText}
                  {isTyping && <span className="inline-block w-2 h-5 bg-black ml-1 animate-pulse"></span>}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end items-center gap-4">
              <button 
                onClick={nextStep}
                className="bg-green-400 border-4 border-black px-6 py-2 font-black uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:bg-yellow-400"
              >
                {currentStep === guideSteps.length - 1 ? 'Selesai!' : 'Lanjut >>'}
              </button>
            </div>
          </div>

          <button onClick={onClose} className="mt-4 text-white/50 hover:text-white font-black text-[10px] uppercase underline tracking-widest block mx-auto">
            [ Skip_Tutorial ]
          </button>
        </div>
      </div>
    </div>
  );
}