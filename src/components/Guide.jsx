import { useState, useEffect, useRef } from 'react';

export default function GameGuide({ onClose, userName }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [spotlightStyle, setSpotlightStyle] = useState({ opacity: 0 });

  const typingIntervalRef = useRef(null);
  const startTimeoutRef = useRef(null);

  // Data langkah panduan dengan karakter pixel (contoh URL pixel art)
  const guideSteps = [
    {
      title: "SYSTEM_STARTUP",
      character: "Udin",
      message: `Halo, ${userName || 'User'}! Selamat datang di website TI-25-KA. Aku akan memandu instalasi pemahamanmu di sini...`,
      // Ganti dengan URL gambar pixel art kamu
      image: "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Jade",
      target: null
    },
    {
      title: "STATUS MONITOR",
      character: "Udin",
      message: "Di sini adalah ringkasan tugasmu. Jika angka di sini bukan nol, berarti ada pekerjaan yang menunggu!",
      image: "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Jade",
      target: ".bg-gray-800"
    },
    {
      title: "NAVIGATION MENU",
      character: "Udin",
      message: "Gunakan tombol menu ini untuk navigasi ke Mahasiswa, Mata Kuliah, atau tambah data tugas baru.",
      image: "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Jade",
      target: "button[aria-label='Toggle menu']"
    },
    {
      title: "USER PROFILE",
      character: "Udin",
      message: "Klik avatar ini untuk mengubah profil, mengganti foto, atau mengganti password.",
      image: "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Jade",
      target: "button[title='Buka Profil']"
    },
    {
      title: "HISTORY DASHBOARD",
      character: "Udin",
      message: "Disini kamu akan lihat data-data tugas yang berhasil kamu kerjakan atau kamu lewatkan.",
      image: "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Jade",
      target: "#history"
    },
    {
      title: "TASK TABLE",
      character: "Udin",
      message: "Disini akan tampil tugas beserta deadlinenya.",
      image: "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Jade",
      target: "#task"
    },
    {
      title: "TASK TABLE",
      character: "Udin",
      message: "Klik tombong ceklis ini jika kamu sudah mengerjakan tugasnya.",
      image: "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Jade",
      target: "#task-done"
    },
    {
      title: "MISSION_COMPLETE",
      character: "Udin",
      message: "Sekarang kamu sudah siap. Jelajahi sistem dan selesaikan semua tugas tepat waktu!",
      image: "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Jade",
      target: null
    },
    {
      title: "MISSION_COMPLETE",
      character: "Udin",
      message: "HAVE UN!",
      image: "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Jade",
      target: null
    }
  ];

  useEffect(() => {
    let i = 0;
    const fullText = guideSteps[currentStep].message;
    setDisplayText(""); 
    setIsTyping(true);

    clearTimeout(startTimeoutRef.current);
    clearInterval(typingIntervalRef.current);

    startTimeoutRef.current = setTimeout(() => {
      typingIntervalRef.current = setInterval(() => {
        if (i < fullText.length) {
          setDisplayText(fullText.substring(0, i + 1));
          i++;
        } else {
          setIsTyping(false);
          clearInterval(typingIntervalRef.current);
        }
      }, 30);
    }, 100);

    updateSpotlight();

    return () => {
      clearTimeout(startTimeoutRef.current);
      clearInterval(typingIntervalRef.current);
    };
  }, [currentStep]);

  // (Fungsi updateSpotlight dan useEffect resize tetap sama...)
 // Di dalam GameGuide.jsx

const updateSpotlight = () => {
  const targetSelector = guideSteps[currentStep].target;
  if (!targetSelector) {
    setSpotlightStyle({ opacity: 0 });
    return;
  }

  const el = document.querySelector(targetSelector);
  if (el) {
    // 1. Scroll dulu ke target
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // 2. Beri jeda sangat singkat agar posisi sudah stabil setelah scroll dimulai
    setTimeout(() => {
      const rect = el.getBoundingClientRect();
      const padding = 10;
      setSpotlightStyle({
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
        opacity: 1,
        boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.75)", 
      });
    }, 300); // 300ms biasanya cukup untuk nunggu animasi scroll
  }
};

// Pastikan spotlight update saat window di-scroll atau di-resize
useEffect(() => {
  window.addEventListener('resize', updateSpotlight);
  window.addEventListener('scroll', updateSpotlight); // Tambahkan listener scroll!
  
  return () => {
    window.removeEventListener('resize', updateSpotlight);
    window.removeEventListener('scroll', updateSpotlight);
  };
}, [currentStep]);

  const nextStep = () => {
    if (isTyping) {
      clearTimeout(startTimeoutRef.current);
      clearInterval(typingIntervalRef.current);
      setDisplayText(guideSteps[currentStep].message);
      setIsTyping(false);
    } else {
      if (currentStep < guideSteps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        onClose();
      }
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
          <div className="absolute -top-10 left-0 bg-green-400 text-black px-2 py-1 text-[10px] font-black uppercase animate-bounce shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            LIHAT_KE_SINI!
          </div>
        )}
      </div>

      {!guideSteps[currentStep].target && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-[100]"></div>
      )}

      <div className="absolute inset-0 flex items-end justify-center p-4 sm:p-10 z-[102] pointer-events-none">
        <div className="w-full max-w-4xl animate-in slide-in-from-bottom-10 duration-500 pointer-events-auto">
          
          <div className="inline-block bg-purple-600 border-t-4 border-l-4 border-r-4 border-black px-4 py-1">
            <span className="text-white font-black text-xs sm:text-sm tracking-tighter uppercase italic">
              {guideSteps[currentStep].title}
            </span>
          </div>

          <div className="bg-white border-8 border-black p-6 shadow-[12px_12px_0px_0px_rgba(168,85,247,1)] relative">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* IMAGE KARAKTER PIXEL DENGAN LOGIKA SHAKE */}
              <div className={`w-20 h-20 sm:w-24 sm:h-24 bg-black border-4 border-purple-500 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] shrink-0 overflow-hidden ${isTyping ? 'animate-character-shake' : ''}`}>
                <img 
                  src={guideSteps[currentStep].image} 
                  alt="character" 
                  className="w-full h-full object-cover pixelated" // Tambahkan pixelated untuk menjaga ketajaman pixel art
                  style={{ imageRendering: 'pixelated' }}
                />
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
                {isTyping ? 'LEWATI ANIMASI' : (currentStep === guideSteps.length - 1 ? 'SELESAI!' : 'LANJUT >>')}
              </button>
            </div>
          </div>

          <button onClick={onClose} className="mt-4 text-white/50 hover:text-white font-black text-[10px] uppercase underline tracking-widest block mx-auto transition-colors">
            [ Skip_Tutorial ]
          </button>
        </div>
      </div>
    </div>
  );
}