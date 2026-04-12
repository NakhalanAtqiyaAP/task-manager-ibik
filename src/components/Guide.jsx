import { useState, useEffect } from 'react';

export default function GameGuide({ onClose, userName }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  const guideSteps = [
    {
      title: "SYSTEM_STARTUP",
      character: "💻 SYSTEM",
      message: `Halo, ${userName || 'User'}! Selamat datang di core system TI-25-KA. Aku akan memandu instalasi pemahamanmu di sini...`,
      image: "⚡"
    },
    {
      title: "DASHBOARD_MODULE",
      character: "📊 ANALYST",
      message: "Di Dashboard, kamu bisa melihat ringkasan tugas aktif. Jika angka di sana merah, berarti sistem mendeteksi beban kerja tinggi!",
      image: "📁"
    },
    {
      title: "TASK_LIST_LOG",
      character: "📝 COMMANDER",
      message: "Gunakan 'Daftar Tugas' untuk melihat detail misi. Perhatikan deadline, jangan biarkan waktu habis atau misimu gagal!",
      image: "⚔️"
    },
    {
      title: "ACTION_CHECK",
      character: "✅ OPERATOR",
      message: "Sudah selesai mengerjakan? Klik centang! Tugas akan otomatis masuk ke arsip 'History' sebagai bukti pencapaianmu.",
      image: "🎯"
    },
    {
      title: "FILTER_SIGHT",
      character: "🔍 SCOUT",
      message: "Terlalu banyak data? Gunakan fitur 'Filter' untuk mempersempit pencarian berdasarkan mata kuliah tertentu.",
      image: "📡"
    },
    {
      title: "MISSION_COMPLETE",
      character: "💻 SYSTEM",
      message: "Panduan selesai. Sekarang sistem sepenuhnya ada di tanganmu. Lakukan yang terbaik, Mahasiswa!",
      image: "🚀"
    }
  ];

  // Efek Typewriter
  useEffect(() => {
    let i = 0;
    const fullText = guideSteps[currentStep].message;
    setDisplayText("");
    setIsTyping(true);

    const typingInterval = setInterval(() => {
      if (i < fullText.length) {
        setDisplayText((prev) => prev + fullText.charAt(i));
        i++;
      } else {
        setIsTyping(false);
        clearInterval(typingInterval);
      }
    }, 30);

    return () => clearInterval(typingInterval);
  }, [currentStep]);

  const nextStep = () => {
    if (currentStep < guideSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:p-10 bg-black/80 backdrop-blur-sm font-mono">
      {/* Container Dialog Gaya Game RPG */}
      <div className="w-full max-w-4xl animate-in slide-in-from-bottom-10 duration-500">
        
        {/* Box Atas: Judul Modul */}
        <div className="inline-block bg-purple-600 border-t-4 border-l-4 border-r-4 border-black px-4 py-1">
          <span className="text-white font-black text-xs sm:text-sm tracking-tighter uppercase italic">
            {guideSteps[currentStep].title}
          </span>
        </div>

        {/* Box Utama Dialog */}
        <div className="bg-white border-8 border-black p-6 shadow-[12px_12px_0px_0px_rgba(168,85,247,1)] relative">
          
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Portrait Character */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-black border-4 border-purple-500 flex items-center justify-center text-4xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] shrink-0">
              {guideSteps[currentStep].image}
            </div>

            {/* Isi Dialog */}
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

          {/* Controls */}
          <div className="mt-6 flex justify-end items-center gap-4">
            {!isTyping && (
               <span className="text-[10px] font-black animate-bounce text-gray-400 uppercase hidden sm:block">
                 Klik tombol di samping untuk lanjut_
               </span>
            )}
            
            <button 
              onClick={nextStep}
              className="bg-green-400 border-4 border-black px-6 py-2 font-black uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:bg-yellow-400"
            >
              {currentStep === guideSteps.length - 1 ? 'MENGERTI!' : 'LANJUT >>'}
            </button>
          </div>
        </div>

        {/* Tombol Skip */}
        <button 
          onClick={onClose}
          className="mt-4 text-white/50 hover:text-white font-black text-[10px] uppercase underline tracking-widest transition-colors"
        >
          [ Skip_Tutorial ]
        </button>
      </div>
    </div>
  );
}