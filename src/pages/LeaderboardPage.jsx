import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Trophy, Medal, Award, Frown, Download, Star, Rocket, Flame } from 'lucide-react';
import { jsPDF } from 'jspdf';

// Tambahkan prop studentId untuk mengenali siapa yang sedang membuka page ini
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

  // 2. BORDER (Sedikit dikecilkan agar teks tidak mepet border)
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
  let fontSize = 60; // Ukuran awal
  const maxWidth = 250; // Lebar maksimal teks sebelum menabrak border
  const cleanName = name.toUpperCase();
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(fontSize);

  // Cek apakah lebar nama melebihi batas, jika iya, turunkan font size secara looping
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
        return { bg: "bg-yellow-400", border: "border-8 border-black", text: "text-2xl sm:text-3xl", icon: <Trophy size={40} />, shadow: "shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]", title: "KING OF THE MONTH", avatarSize: "w-16 h-16" };
      case 1:
        return { bg: "bg-gray-300", border: "border-4 border-black", text: "text-xl", icon: <Medal size={32} />, shadow: "shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]", title: "RUNNER UP", avatarSize: "w-14 h-14" };
      case 2:
        return { bg: "bg-orange-400", border: "border-4 border-black", text: "text-xl", icon: <Award size={32} />, shadow: "shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]", title: "BRONZE TIER", avatarSize: "w-14 h-14" };
      default:
        return { bg: "bg-white", border: "border-4 border-black", text: "text-lg", icon: <span className="font-black">#{index + 1}</span>, shadow: "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]", title: "CONTENDER", avatarSize: "w-12 h-12" };
    }
  };

  // LOGIKA TANGGAL & PEMENANG
  const today = new Date();
  const isAwardDay = today.getDate() === 28; 
  const isWinner = leaders.length > 0 && 
                 studentId && 
                 leaders[0].student_id.toString() === studentId.toString();

  return (
    <div className="p-4 sm:p-8 relative">
      {/* HEADER */}
      <div className="mb-12 border-b-8 border-black pb-4 inline-block">
        <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter text-white animate-brutal-header">
          MONTHLY LEADERBOARD
        </h1>
        <br />
        <div className="flex gap-2 mt-2">
          <p className="font-bold text-black uppercase bg-green-400 border-2 border-black inline-block px-3 py-1 text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            KLAIM SERTIFIKAT SETIAP TANGGAL 28
          </p>
        </div>
      </div>

      {/* COMPONENT KHUSUS HARI PENGHARGAAN (TANGGAL 20) */}
      {isAwardDay && leaders.length > 0 && (
        <div className="mb-12 animate-bounce-slow">
          {isWinner ? (
            // Jika User yang login adalah Juara 1
            <div className="bg-yellow-400 border-8 border-black p-8 shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] text-center">
              <Star className="mx-auto mb-4 animate-spin-slow" size={64} />
              <h2 className="text-4xl font-black uppercase mb-2 text-black">GGWP! KAMU RAJANYA!</h2>
              <p className="font-bold uppercase text-black mb-6 border-b-2 border-black pb-4">
                Kamu telah mendominasi TI-25-KA bulan ini. Mahkotamu sudah siap.
              </p>
              <button 
                onClick={() => generateCertificate(leaders[0].nama, leaders[0].completed_count)}
                className="bg-black text-white px-10 py-5 font-black text-2xl uppercase hover:bg-white hover:text-black transition-all border-4 border-black flex items-center gap-4 mx-auto"
              >
                <Download size={32} /> AMBIL SERTIFIKAT
              </button>
            </div>
          ) : (
            // Jika User yang login BUKAN Juara 1 (Kasih Motivasi)
            <div className="bg-black border-8 border-white p-8 shadow-[15px_15px_0px_0px_rgba(255,255,255,0.2)] text-center text-white">
              <Flame className="mx-auto mb-4 text-orange-500" size={64} />
              <h2 className="text-3xl font-black uppercase mb-2 italic">HAMPIR SAJA, PEJUANG!</h2>
              <p className="font-medium uppercase tracking-widest text-gray-400 max-w-2xl mx-auto">
                "Disiplin adalah jembatan antara cita-cita dan pencapaian." 
                Bulan ini mungkin milik <span className="text-yellow-400 font-black">{leaders[0].nama}</span>, 
                tapi bulan depan? Itu adalah milikmu jika kamu konsisten mulai hari ini.
              </p>
              <div className="mt-6 text-[10px] font-black uppercase text-green-400 border-2 border-green-400 inline-block px-4 py-2">
                ASAH SKILL-MU. KEJAR DEADLINE-MU.
              </div>
            </div>
          )}
        </div>
      )}

      {/* LEADERBOARD LIST */}
      <div className="flex flex-col gap-6 max-w-4xl">
        {leaders.map((student, index) => {
          const style = getRankStyle(index);
          return (
            <div 
              key={student.student_id} 
              className={`flex items-center justify-between p-4 sm:p-6 ${style.bg} ${style.border} ${style.shadow} transition-all duration-200`}
            >
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="w-12 h-12 flex items-center justify-center bg-white border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex-shrink-0">
                  {style.icon}
                </div>
                <div className="flex items-center gap-4">
                  <div className={`${style.avatarSize} border-4 border-black bg-purple-200 overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex-shrink-0`}>
                    <img 
                      src={student.avatar_url || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${student.nama}`} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">{style.title}</div>
                    <h2 className={`${style.text} font-black uppercase leading-none`}>{student.nama}</h2>
                  </div>
                </div>
              </div>
              <div className="bg-green-400 border-4 border-black px-4 py-2 text-center min-w-[80px]">
                <span className="text-2xl sm:text-3xl font-black">{student.completed_count}</span>
                <span className="text-[8px] font-black uppercase block">DONE</span>
              </div>
            </div>
          );
        })}

        {leaders.length === 0 && (
          <div className="bg-gray-100 border-4 border-black p-8 text-center font-black uppercase text-xl flex flex-col items-center gap-4">
            <Frown size={48} /> DATA KOSONG.
          </div>
        )}
      </div>

      {/* FOOTER INFORMASI */}
      {!isAwardDay && (
        <div className="mt-12 bg-white border-4 border-black p-4 inline-block font-black uppercase text-xs italic shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          * Hari Penghargaan selanjutnya: Tanggal 28 {new Date(today.getFullYear(), today.getMonth() + (today.getDate() > 20 ? 1 : 0), 20).toLocaleDateString('id-ID', { month: 'long' })}
        </div>
      )}
    </div>
  );
}