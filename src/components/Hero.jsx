import { useState, useEffect } from 'react';
import GameGuide from './Guide';

const QUOTES = [
  "“Hidup adalah penderitaan, bertahan hidup adalah mencari makna dalam penderitaan.” — Friedrich Nietzsche",
  "“Siapa yang memiliki alasan untuk hidup, dapat menanggung hampir semua cara.” — Viktor Frankl",
  "“Cinta bukanlah emosi yang kuat, melainkan keputusan yang kuat.” — Erich Fromm",
  "“Tugas manusia bukan untuk mencari kebahagiaan, tetapi untuk menemukan makna.” — Viktor Frankl",
  "“Manusia adalah apa yang ia jadikan dirinya sendiri.” — Jean-Paul Sartre",
  "“Kesulitan adalah apa yang membangunkan karakter dalam diri kita.” — Alfred Adler",
  "“Kebebasan adalah apa yang Anda lakukan dengan apa yang telah dilakukan terhadap Anda.” — Jean-Paul Sartre",
  "“Hanya mereka yang berani mengambil risiko melangkah terlalu jauh yang tahu seberapa jauh mereka bisa melangkah.” — T.S. Eliot",
  "“Dunia akan mematahkan semua orang, dan sesudahnya, banyak yang kuat di tempat yang patah.” — Ernest Hemingway",
  "“Kreativitas membutuhkan keberanian untuk melepaskan kepastian.” — Erich Fromm",
  "“Di tengah musim dingin, aku akhirnya belajar bahwa di dalam diriku ada musim panas yang tak terkalahkan.” — Albert Camus",
  "“Neraka adalah orang lain.” — Jean-Paul Sartre",
  "“Seseorang tidak menjadi tercerahkan dengan membayangkan sosok cahaya, melainkan dengan membuat kegelapan menjadi sadar.” — Carl Jung",
  "“Setiap orang memikul bayangan.” — Carl Jung"
];

export default function Hero({ taskCount = 0, loading = false, user = null, typewriterMode = true}) {
  const [showGuide, setShowGuide] = useState(false);
  const [currentQuote, setCurrentQuote] = useState("");
  const [displayText, setDisplayText] = useState("");
  const [isBlocked, setIsBlocked] = useState(false); // State baru untuk efek blok
  
  const fullTitle = "Website TI-25-KA";

  // Efek Mengetik dengan urutan: Ngetik -> Diam -> Block -> Hapus
  useEffect(() => {
    if (!typewriterMode) {
      setDisplayText(fullTitle);
      setIsBlocked(false);
      return;
    }

    let isMounted = true;
    let timeoutId;

    // Fungsi helper untuk jeda waktu (sleep)
    const sleep = (ms) => new Promise(resolve => { timeoutId = setTimeout(resolve, ms); });

    const runSequence = async () => {
      while (isMounted) {
        // 1. Reset State
        setDisplayText("");
        setIsBlocked(false);
        await sleep(500); // Jeda sebelum mulai ngetik
        if (!isMounted) break;

        // 2. Proses Ngetik Huruf per Huruf
        for (let i = 1; i <= fullTitle.length; i++) {
          setDisplayText(fullTitle.slice(0, i));
          // Sedikit variasi kecepatan ngetik agar lebih natural
          const typingSpeed = Math.random() * 50 + 100; 
          await sleep(typingSpeed);
          if (!isMounted) break;
        }
        if (!isMounted) break;

        // 3. Diam Sejenak setelah selesai ngetik (2 detik)
        await sleep(2000);
        if (!isMounted) break;

        // 4. Block Teks (Highlight)
        setIsBlocked(true);
        await sleep(400); // Block ditahan selama 0.4 detik
        if (!isMounted) break;

        // 5. Hapus Teks
        setDisplayText("");
        setIsBlocked(false);
        await sleep(300); // Jeda sebentar sebelum loop mengulang
      }
    };

    runSequence();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [typewriterMode]);

  const renderTitle = () => {
    // Kelas CSS saat teks di-block (latar hijau, teks hitam)
    const blockStyle = isBlocked ? "bg-green-400 text-black px-1" : "";

    if (displayText.startsWith("Website")) {
      const parts = displayText.split(/(Website)/); 
      return (
        <span className={blockStyle}>
          {parts[1]}
          {parts[2] && <br className="hidden sm:block" />} 
          {parts[2] ? parts[2].trim() : ""}
        </span>
      );
    }
    return <span className={blockStyle}>{displayText}</span>;
  };

  useEffect(() => {
    const updateQuote = () => {
      const currentHour = new Date().getHours();
      const quoteIndex = currentHour % QUOTES.length;
      setCurrentQuote(QUOTES[quoteIndex]);
    };

    updateQuote();
    const interval = setInterval(updateQuote, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <section className="py-6 sm:py-10 px-4 sm:px-6 md:px-0 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 items-center">
        
        {/* Main Info Block */}
        <div className="border-4 border-black bg-purple-700 p-6 sm:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] relative flex flex-col items-center md:items-start text-center md:text-left min-h-[320px] justify-center">
          
          <div className="mb-4">
            <span className="bg-green-400 text-black border-2 border-black px-3 py-1 font-black text-[10px] sm:xs uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] inline-block">
              Welcome, {user?.nama || 'Guest'}
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white uppercase mb-2 leading-none tracking-tight min-h-[2.5em] sm:min-h-0">
            {renderTitle()}
            {/* Sembunyikan kursor saat teks sedang di-block */}
            {typewriterMode && !isBlocked && (
              <span className="inline-block w-2 h-8 sm:h-12 bg-green-400 ml-2 animate-cursor-blink align-middle"></span>
            )}
          </h1>
         
          {/* Quote Section */}
          <div className="mt-6 border-l-4 border-white pl-4 py-2">
            <p className="text-purple-200 font-mono text-[11px] sm:text-sm italic leading-relaxed animate-blur-reveal">
              {currentQuote}
            </p>
          </div>

          <div className="flex w-full md:w-auto gap-4 mt-8">
            <button 
              onClick={() => setShowGuide(true)}
              className="w-full md:w-auto border-4 border-black bg-white text-black px-6 py-3 font-black uppercase text-xs sm:text-sm shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:translate-x-2 active:translate-y-2 active:shadow-none"
            >
              Panduan Penggunaan
            </button>
          </div>
        </div>
        
        {/* Status Block */}
        <div id="monitor" className="border-4 text-white border-black bg-white p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] relative">
          <div className="absolute -top-4 -right-2 sm:-top-5 sm:-right-5 bg-green-400 border-2 sm:border-4 border-black px-3 py-1 font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-black uppercase text-sm sm:text-lg z-10">
            Semester 2
          </div>

          <div className="h-48 sm:h-64 bg-gray-800 border-2 sm:border-4 border-white flex flex-col items-center justify-center p-4 sm:p-6 text-center bg-scan-overlay relative z-0">
             <h3 className="font-black text-2xl sm:text-3xl uppercase mb-2 border-b-2 sm:border-b-4 border-white pb-2 relative z-10">
               Ringkasan
             </h3>
             <p className="font-bold text-gray-400 text-lg sm:text-xl mt-2 relative z-10 leading-tight">
               {loading ? (
                 <span className="animate-pulse italic">Memuat data...</span>
               ) : taskCount > 0 ? (
                 <span className="text-green-400">{taskCount} tugas sedang aktif</span>
               ) : (
                 'Tidak ada tugas aktif'
               )}
             </p>
          </div>
        </div>
      </section>

      {showGuide && (
        <GameGuide 
          userName={user?.nama} 
          onClose={() => setShowGuide(false)} 
        />
      )}
    </>
  );
}