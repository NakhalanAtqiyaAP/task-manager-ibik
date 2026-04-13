import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Trophy, Medal, Award, Frown } from 'lucide-react'; // Gunakan Lucide

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      // Kita fetch dari VIEW yang baru saja dibuat di Supabase
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

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center font-black uppercase text-2xl animate-pulse">
        MENGKALKULASI_SKOR...
      </div>
    );
  }

  // Helper untuk menentukan warna & gaya berdasarkan ranking
  const getRankStyle = (index) => {
    switch (index) {
      case 0: // Juara 1 (Gold)
        return {
          bg: "bg-yellow-400",
          border: "border-8 border-black",
          text: "text-2xl sm:text-3xl",
          icon: <Trophy size={40} className="text-black" />,
          shadow: "shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]",
          title: "KING OF THE MONTH"
        };
      case 1: // Juara 2 (Silver/Gray)
        return {
          bg: "bg-gray-300",
          border: "border-4 border-black",
          text: "text-xl",
          icon: <Medal size={32} className="text-black" />,
          shadow: "shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
          title: "RUNNER UP"
        };
      case 2: // Juara 3 (Bronze/Orange)
        return {
          bg: "bg-orange-400",
          border: "border-4 border-black",
          text: "text-xl",
          icon: <Award size={32} className="text-black" />,
          shadow: "shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
          title: "BRONZE TIER"
        };
      default: // Peringkat 4 dst
        return {
          bg: "bg-white",
          border: "border-4 border-black",
          text: "text-lg",
          icon: <span className="font-black text-xl">#{index + 1}</span>,
          shadow: "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
          title: ""
        };
    }
  };

  return (
    <div className="p-4 sm:p-8 relative">
      {/* HEADER */}
      <div className="mb-12 border-b-8 border-black pb-4 inline-block">
        <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter text-white animate-brutal-header">
          MOUNTHLY LEADERBOARD
        </h1>
        <br />
        <p className="font-bold text-black mt-2 uppercase bg-green-400 border-2 border-black inline-block px-3 py-1 text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          RESET OTOMATIS SETIAP TANGGAL 1
        </p>
      </div>

      {/* LIST LEADERBOARD */}
      <div className="flex flex-col gap-6 max-w-4xl">
        {leaders.map((student, index) => {
          const style = getRankStyle(index);
          const isTopThree = index < 3;

          return (
            <div 
              key={student.student_id} 
              className={`flex items-center justify-between p-4 sm:p-6 ${style.bg} ${style.border} ${style.shadow} hover:-translate-y-1 hover:translate-x-1 hover:shadow-none transition-all duration-200`}
            >
              <div className="flex items-center gap-4 sm:gap-6">
                {/* RANK ICON */}
                <div className="w-12 h-12 flex items-center justify-center bg-white border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  {style.icon}
                </div>

                {/* AVATAR & NAME */}
                <div className="flex items-center gap-4">
                  {isTopThree && (
                    <div className="hidden sm:block w-16 h-16 border-4 border-black bg-purple-200 overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <img 
                        src={student.avatar_url || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${student.nama}`} 
                        alt="Avatar" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    {isTopThree && (
                      <div className="text-[10px] font-black uppercase tracking-widest mb-1">
                        {style.title}
                      </div>
                    )}
                    <h2 className={`${style.text} font-black uppercase leading-none`}>
                      {student.nama}
                    </h2>
                  </div>
                </div>
              </div>

              {/* STATS AREA */}
              <div className="flex gap-2 sm:gap-4 text-center">
                <div className="bg-green-400 border-4 border-black px-2 sm:px-4 py-2 flex flex-col items-center min-w-[60px] sm:min-w-[80px]">
                  <span className="text-2xl sm:text-3xl font-black">{student.completed_count}</span>
                  <span className="text-[8px] sm:text-[10px] font-black uppercase">On-Time</span>
                </div>
                {/* Tampilkan overdue hanya untuk styling/informasi tambahan */}
                <div className="bg-red-500 text-white border-4 border-black px-2 sm:px-4 py-2 flex flex-col items-center min-w-[60px] sm:min-w-[80px] hidden sm:flex">
                  <span className="text-2xl sm:text-3xl font-black">{student.overdue_count}</span>
                  <span className="text-[8px] sm:text-[10px] font-black uppercase">Overdue</span>
                </div>
              </div>
              
            </div>
          );
        })}

        {leaders.length === 0 && (
          <div className="bg-gray-100 border-4 border-black p-8 text-center font-black uppercase text-xl flex flex-col items-center gap-4">
            <Frown size={48} />
            BELUM ADA DATA BULAN INI. AYO KERJAKAN TUGASMU!
          </div>
        )}
      </div>

      {/* CERTIFICATE BUTTON (Hanya muncul jika ada data) */}
      {leaders.length > 0 && (
        <div className="mt-12 inline-block">
          <button onClick={() => alert(`Cetak Sertifikat untuk: ${leaders[0].nama}`)} className="bg-blue-500 text-white border-4 border-black px-8 py-4 font-black uppercase text-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:bg-blue-600 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-3">
            <Award size={24} /> Generate Certificate For #{leaders[0].nama}
          </button>
        </div>
      )}
    </div>
  );
}