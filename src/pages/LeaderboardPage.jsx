import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Trophy, Medal, Award, Frown, Download, Star, Rocket, Flame } from 'lucide-react';
import { jsPDF } from 'jspdf';

export default function LeaderboardPage({ studentId }) {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      const { data, error } = await supabase
        .from('monthly_leaderboard')
        .select('*');

      if (!error && data) {
        setLeaders(data);
      }
      setLoading(false);
    }

    fetchLeaderboard();
  }, []);

  const generateCertificate = (name, score) => {
    const doc = new jsPDF({ 
      orientation: 'landscape', 
      unit: 'mm', 
      format: 'a4' 
    });

    const purple800 = [91, 33, 182];
    const green400 = [74, 222, 128];

    // 1. BACKGROUND
    doc.setFillColor(purple800[0], purple800[1], purple800[2]);
    doc.rect(0, 0, 297, 210, 'F');

    // 2. BORDER
    doc.setDrawColor(green400[0], green400[1], green400[2]);
    doc.setLineWidth(5);
    doc.rect(5, 5, 287, 200, 'S');

    // 3. AKSEN SUDUT
    doc.setFillColor(green400[0], green400[1], green400[2]);
    doc.rect(0, 0, 50, 20, 'F');
    doc.rect(247, 190, 50, 20, 'F');

    // 4. HEADER
    doc.setTextColor(green400[0], green400[1], green400[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(45);
    doc.text("SERTIFIKAT PENGHARGAAN", 20, 40);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("KING OF THE MONTH // TI-25-KA", 20, 55);

    // 5. PENERIMA
    doc.setFontSize(18);
    doc.setFont("helvetica", "normal");
    doc.text("Diberikan dengan penuh hormat kepada:", 148, 95, { align: "center" });

    // --- LOGIKA RESPONSIVE NAMA ---
    let fontSize = 60;
    const maxWidth = 250;
    const cleanName = name.toUpperCase();
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(fontSize);

    while (doc.getTextWidth(cleanName) > maxWidth && fontSize > 20) {
      fontSize -= 2;
      doc.setFontSize(fontSize);
    }

    doc.setTextColor(green400[0], green400[1], green400[2]);
    doc.text(cleanName, 148, 120, { align: "center" });
    // ------------------------------

    // 6. KETERANGAN PRESTASI
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "italic");
    doc.text(`Telah mendominasi bulan ini dengan menyelesaikan`, 148, 140, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.text(`${score} TUGAS TEPAT WAKTU (ON-TIME)`, 148, 148, { align: "center" });

    // 7. TANGGAL TERBIT
    doc.setLineWidth(1);
    doc.setDrawColor(255, 255, 255);
    doc.line(100, 165, 197, 165);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(green400[0], green400[1], green400[2]);
    doc.text("TANGGAL TERBIT:", 148, 175, { align: "center" });
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    const tgl = new Date().toLocaleDateString('id-ID', { 
      day: 'numeric', month: 'long', year: 'numeric' 
    });
    doc.text(tgl.toUpperCase(), 148, 183, { align: "center" });

    // 8. FOOTER
    doc.setFontSize(10);
    doc.text("TI-25-KA", 20, 200);

    doc.save(`Sertifikat_TI25KA_${name.replace(/\s+/g, '_')}.pdf`);
  };

  const getRankStyle = (index) => {
    switch (index) {
      case 0:
        return { bg: "bg-yellow-400", border: "border-4 sm:border-8 border-black", text: "text-xl sm:text-2xl md:text-3xl", icon: <Trophy className="w-6 h-6 sm:w-10 sm:h-10" />, shadow: "shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]", title: "KING OF THE MONTH", avatarSize: "w-12 h-12 sm:w-16 sm:h-16" };
      case 1:
        return { bg: "bg-gray-300", border: "border-4 border-black", text: "text-lg sm:text-xl", icon: <Medal className="w-5 h-5 sm:w-8 sm:h-8" />, shadow: "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]", title: "RUNNER UP", avatarSize: "w-10 h-10 sm:w-14 sm:h-14" };
      case 2:
        return { bg: "bg-orange-400", border: "border-4 border-black", text: "text-lg sm:text-xl", icon: <Award className="w-5 h-5 sm:w-8 sm:h-8" />, shadow: "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]", title: "BRONZE TIER", avatarSize: "w-10 h-10 sm:w-14 sm:h-14" };
      default:
        return { bg: "bg-white", border: "border-2 sm:border-4 border-black", text: "text-base sm:text-lg", icon: <span className="font-black text-sm sm:text-base">#{index + 1}</span>, shadow: "shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]", title: "CONTENDER", avatarSize: "w-8 h-8 sm:w-12 sm:h-12" };
    }
  };

  const today = new Date();
  const isAwardDay = today.getDate() === 28; 
  const isWinner = leaders.length > 0 && 
                 studentId && 
                 leaders[0].student_id.toString() === studentId.toString();

  return (
    <div className="p-3 sm:p-6 md:p-8 relative overflow-hidden">
      {/* HEADER */}
      <div className="mb-8 md:mb-12 border-b-4 sm:border-b-8 border-black pb-4 inline-block w-full sm:w-auto">
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter text-white animate-brutal-header break-words">
          MONTHLY LEADERBOARD
        </h1>
        <div className="flex flex-wrap gap-2 mt-2">
          <p className="font-bold text-black uppercase bg-green-400 border-2 border-black inline-block px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            KLAIM SERTIFIKAT SETIAP TANGGAL 28
          </p>
        </div>
      </div>

      {/* COMPONENT KHUSUS HARI PENGHARGAAN */}
      {isAwardDay && leaders.length > 0 && (
        <div className="mb-8 md:mb-12 animate-bounce-slow max-w-4xl">
          {isWinner ? (
            <div className="bg-yellow-400 border-4 sm:border-8 border-black p-4 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] text-center">
              <Star className="mx-auto mb-2 sm:mb-4 animate-spin-slow w-12 h-12 sm:w-16 sm:h-16" />
              <h2 className="text-2xl sm:text-4xl font-black uppercase mb-2 text-black leading-tight">GGWP! KAMU RAJANYA!</h2>
              <p className="text-sm sm:text-base font-bold uppercase text-black mb-4 sm:mb-6 border-b-2 border-black pb-4">
                Kamu telah mendominasi TI-25-KA bulan ini. Mahkotamu sudah siap.
              </p>
              <button 
                onClick={() => generateCertificate(leaders[0].nama, leaders[0].completed_count)}
                className="bg-black text-white px-4 py-3 sm:px-10 sm:py-5 font-black text-lg sm:text-2xl uppercase hover:bg-white hover:text-black transition-all border-4 border-black flex items-center justify-center gap-2 sm:gap-4 mx-auto w-full sm:w-auto"
              >
                <Download className="w-6 h-6 sm:w-8 sm:h-8" /> 
                <span className="text-center">AMBIL SERTIFIKAT</span>
              </button>
            </div>
          ) : (
            <div className="bg-black border-4 sm:border-8 border-white p-4 sm:p-8 shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)] sm:shadow-[15px_15px_0px_0px_rgba(255,255,255,0.2)] text-center text-white">
              <Flame className="mx-auto mb-2 sm:mb-4 text-orange-500 w-12 h-12 sm:w-16 sm:h-16" />
              <h2 className="text-xl sm:text-3xl font-black uppercase mb-2 italic">HAMPIR SAJA, PEJUANG!</h2>
              <p className="text-xs sm:text-sm md:text-base font-medium uppercase tracking-widest text-gray-400 max-w-2xl mx-auto leading-relaxed">
                "Disiplin adalah jembatan antara cita-cita dan pencapaian." <br className="hidden sm:block"/>
                Bulan ini mungkin milik <span className="text-yellow-400 font-black">{leaders[0].nama}</span>, 
                tapi bulan depan? Itu adalah milikmu jika kamu konsisten mulai hari ini.
              </p>
              <div className="mt-4 sm:mt-6 text-[8px] sm:text-[10px] font-black uppercase text-green-400 border-2 border-green-400 inline-block px-3 py-1 sm:px-4 sm:py-2">
                ASAH SKILL-MU. KEJAR DEADLINE-MU.
              </div>
            </div>
          )}
        </div>
      )}

      {/* LEADERBOARD LIST */}
      <div className="flex flex-col gap-4 sm:gap-6 max-w-4xl">
        {leaders.map((student, index) => {
          const style = getRankStyle(index);
          return (
            <div 
              key={student.student_id} 
              className={`flex items-center justify-between p-3 sm:p-6 ${style.bg} ${style.border} ${style.shadow} transition-all duration-200 gap-2 sm:gap-4`}
            >
              {/* Kiri: Icon + Avatar + Nama */}
              <div className="flex items-center gap-2 sm:gap-6 flex-1 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white border-2 sm:border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex-shrink-0">
                  {style.icon}
                </div>
                
                <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                  <div className={`${style.avatarSize} border-2 sm:border-4 border-black bg-purple-200 overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex-shrink-0`}>
                    <img 
                      src={student.avatar_url || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${student.nama}`} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Nama dibungkus dengan min-w-0 dan truncate agar tidak merusak layout saat di mobile */}
                  <div className="flex-1 min-w-0">
                    <div className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest mb-0.5 sm:mb-1 opacity-70 truncate">{style.title}</div>
                    <h2 className={`${style.text} font-black uppercase leading-none truncate`} title={student.nama}>
                      {student.nama}
                    </h2>
                  </div>
                </div>
              </div>

              {/* Kanan: Score */}
              <div className="bg-green-400 border-2 sm:border-4 border-black px-2 py-1 sm:px-4 sm:py-2 text-center min-w-[50px] sm:min-w-[80px] flex-shrink-0">
                <span className="text-xl sm:text-3xl font-black">{student.completed_count}</span>
                <span className="text-[6px] sm:text-[8px] font-black uppercase block mt-0.5">DONE</span>
              </div>
            </div>
          );
        })}

        {/* LOADING STATE (Optional namun baik untuk UX) */}
        {loading && (
          <div className="bg-gray-100 border-4 border-black p-6 sm:p-8 text-center font-black uppercase text-base sm:text-xl animate-pulse">
            MEMUAT DATA...
          </div>
        )}

        {!loading && leaders.length === 0 && (
          <div className="bg-gray-100 border-4 border-black p-6 sm:p-8 text-center font-black uppercase text-base sm:text-xl flex flex-col items-center gap-2 sm:gap-4">
            <Frown className="w-8 h-8 sm:w-12 sm:h-12" /> DATA KOSONG.
          </div>
        )}
      </div>

      {/* FOOTER INFORMASI */}
      {!isAwardDay && (
        <div className="mt-8 sm:mt-12 bg-white border-2 sm:border-4 border-black p-2 sm:p-4 inline-block font-black uppercase text-[10px] sm:text-xs italic shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-full break-words">
          * Hari Penghargaan selanjutnya: Tanggal 28 {new Date(today.getFullYear(), today.getMonth() + (today.getDate() > 28 ? 1 : 0), 28).toLocaleDateString('id-ID', { month: 'long' })}
        </div>
      )}
    </div>
  );
}