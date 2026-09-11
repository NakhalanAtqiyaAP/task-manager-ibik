import { useState, useEffect, useRef } from 'react';

export default function FarewellPresentation({ userName, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [showFinalScreen, setShowFinalScreen] = useState(false);

  const typingIntervalRef = useRef(null);
  const startTimeoutRef = useRef(null);

  const dialogSteps = [
  {
    title: "NEWS_UPDATE",
    character: "Udin",
    message: `Wait... ${userName || 'Teman'}! Beneran kabar yang lagi rame dibilang anak-anak? Kamu mau pindah dari kelas kita?`,
    image: "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Jade"
  },
  {
    title: "TI-25-KA CLASSROOM",
    character: "Anak-Anak TI-25-KA",
    message: `Kaget banget denger kabar ini, ${userName}... Padahal baru kemarin kita pusing bareng ngejar deadline materi dan presentasi di kelas.`,
    image: "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Felix"
  },
  {
    title: "MEMORIES",
    character: "Udin",
    message: "Semua momen pas tawa di kelas, kerja kelompok, sampai pusingnya matkul bareng... ga bakal ada yang sia-sia. Semuanya berbekas.",
    image: "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Jade"
  },
  {
    title: "NEW_JOURNEY",
    character: "Anak-Anak TI-25-KA",
    message: "Ke mana pun langkah dan kampus tujuan kamu selanjutnya, tetap semangat ya! Kamu pasti bisa berkembang jauh lebih hebat di sana.",
    image: "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Felix"
  },
  {
    title: "LAST_CHAPTER",
    character: "Udin",
    message: "Ingat ya, TI-25-KA selalu jadi rumah tempat kamu pernah berproses bareng. Sukses terus di luar sana, teman...",
    image: "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Jade"
  }
];

  useEffect(() => {
    if (showFinalScreen) return;

    let i = 0;
    const fullText = dialogSteps[currentStep].message;
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
      }, 35);
    }, 100);

    return () => {
      clearTimeout(startTimeoutRef.current);
      clearInterval(typingIntervalRef.current);
    };
  }, [currentStep, showFinalScreen]);

  const nextStep = () => {
    if (isTyping) {
      clearTimeout(startTimeoutRef.current);
      clearInterval(typingIntervalRef.current);
      setDisplayText(dialogSteps[currentStep].message);
      setIsTyping(false);
    } else {
      if (currentStep < dialogSteps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        // Pindah ke layar penutup "Selamat Tinggal"
        setShowFinalScreen(true);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[200] font-mono overflow-hidden bg-black flex items-center justify-center p-4">
      
      {showFinalScreen ? (
        <div className="text-center animate-in fade-in duration-1000 max-w-xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
          <p className="text-gray-400 font-serif italic text-2xl sm:text-3xl mb-4 tracking-widest animate-pulse">
            Selamat Tinggal
          </p>
          <h1 className="text-4xl sm:text-6xl font-black text-white uppercase tracking-tighter border-b-4 border-purple-500 pb-4 mb-6">
            {userName || 'Sahabat'}
          </h1>
          <p className="text-purple-300 text-xs sm:text-sm font-mono italic mb-10 max-w-md leading-relaxed">
            "Setiap perpisahan adalah awal dari pencarian makna baru. Terima kasih telah menjadi bagian dari sejarah TI-25-KA."
          </p>
          
          <button 
            onClick={onClose}
            className="border-4 border-white bg-purple-700 text-white font-black px-8 py-3 text-sm uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] hover:bg-purple-600 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:translate-x-2 active:translate-y-2"
          >
            Lanjutkan Ke Website
          </button>
        </div>
      ) : (
        <div className="absolute inset-0 flex items-end justify-center p-4 sm:p-10 z-[102]">
          <div className="w-full max-w-4xl animate-in slide-in-from-bottom-10 duration-500">
            
            <div className="inline-block bg-purple-700 border-t-4 border-l-4 border-r-4 border-black px-4 py-1">
              <span className="text-white font-black text-xs sm:text-sm tracking-tighter uppercase italic">
                {dialogSteps[currentStep].title}
              </span>
            </div>

            <div className="bg-white border-8 border-black p-6 shadow-[12px_12px_0px_0px_rgba(168,85,247,1)] relative">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                
                <div className={`w-20 h-20 sm:w-24 sm:h-24 bg-black border-4 border-purple-600 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] shrink-0 overflow-hidden ${isTyping ? 'animate-bounce' : ''}`}>
                  <img 
                    src={dialogSteps[currentStep].image} 
                    alt="character" 
                    className="w-full h-full object-cover" 
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>

                <div className="flex-1">
                  <h4 className="font-black text-purple-700 mb-2 uppercase tracking-tighter text-lg">
                    {">"} {dialogSteps[currentStep].character}
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
                  {isTyping ? 'LEWATI' : (currentStep === dialogSteps.length - 1 ? 'SELESAI >>' : 'LANJUT >>')}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}