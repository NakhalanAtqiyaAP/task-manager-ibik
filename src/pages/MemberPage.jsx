import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Globe, Crown, Trophy } from 'lucide-react'; // Hapus import Download

export default function MemberPage() {
  const [members, setMembers] = useState([]);
  const [topStudentId, setTopStudentId] = useState(null);
  const [loading, setLoading] = useState(true);

  const getSocialIcon = (platform, size = 18) => {
    const p = platform?.toLowerCase();
    const svgStyle = { width: size, height: size, fill: 'none', stroke: 'currentColor', strokeWidth: '2.5', strokeLinecap: 'round', strokeLinejoin: 'round' };
    const fillStyle = { width: size, height: size, fill: 'currentColor' };

    switch(p) {
      case 'instagram':
        return (
          <svg viewBox="0 0 24 24" style={svgStyle}>
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
          </svg>
        );
      case 'github':
        return (
          <svg viewBox="0 0 24 24" style={fillStyle}>
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.041-1.416-4.041-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        );
      case 'linkedin':
        return (
          <svg viewBox="0 0 24 24" style={fillStyle}>
            <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/>
          </svg>
        );
      case 'twitter':
      case 'x':
        return (
          <svg viewBox="0 0 24 24" style={fillStyle}>
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        );
      default:
        return <Globe size={size} strokeWidth={2.5} />;
    }
  };

  useEffect(() => {
    async function fetchData() {
      // 1. CARI SIAPA JUARA 1 SAAT INI DARI LEADERBOARD
      // Sesuaikan 'monthly_leaderboard', 'score', dan 'student_id' dengan nama tabel/kolom aslimu
      const { data: leaderData } = await supabase
        .from('monthly_leaderboard') 
        .select('student_id')
        .order('completed_count', { ascending: false }) // Urutkan berdasarkan skor terbanyak
        .limit(1)
        .single();

      if (leaderData) {
        setTopStudentId(leaderData.student_id);
      }

      // 2. TARIK DATA MEMBERS
      const { data: studentsData, error } = await supabase
        .from('students')
        // Pastikan kolom untuk relasi (misal id atau student_id) ikut di-select
        .select('id, nama, nim, avatar_url, hobby, phone_num, quotes, media_sosial, sertifikat') 
        .order('nama', { ascending: true });

      if (!error && studentsData) {
        setMembers(studentsData);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="text-green-400 flex h-64 items-center justify-center font-black uppercase text-lg sm:text-2xl animate-pulse text-center p-4">
        MEMUAT DATABASE SQUAD...
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 md:p-8 relative overflow-hidden">
      {/* HEADER SECTION */}
      <div className="mb-12 sm:mb-16 border-b-4 sm:border-b-8 border-black pb-4 inline-block w-full sm:w-auto">
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter text-white animate-brutal-header break-words">
          TI-25-KA MEMBERS
        </h1>
        <div className="mt-2">
          <p className="font-bold text-gray-900 uppercase bg-green-400 border-2 border-black inline-block px-3 py-1 text-xs sm:text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            Total Data: {members.length} Anggota 
          </p>
        </div>
      </div>

      {/* GRID KARTU ANGGOTA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-16 sm:gap-y-20 mt-12 sm:mt-16">
        {members.map((member, index) => {
          const hobbies = member.hobby ? member.hobby.split(',').map(h => h.trim()) : [];
          const socials = member.media_sosial || [];
          const displayQuote = (member.quotes && member.quotes.trim() !== "") 
            ? member.quotes 
            : "Belum ada quotes";

          // Cek apakah sertifikat berupa array, objek tunggal, atau kosong
          let certs = [];
          if (member.sertifikat) {
             certs = Array.isArray(member.sertifikat) ? member.sertifikat : [member.sertifikat];
          }

          // LOGIKA MAHKOTA: Berdasarkan coding (kecocokan ID dengan top 1 leaderboard)
          // Jika di tabel members kamu pakai 'id' sebagai penanda unik, gunakan member.id
          // Jika pakai 'student_id', ganti jadi member.student_id  
          const isCurrentKing = topStudentId && member.id === topStudentId;

          return (
            <div 
              key={member.id}
              className={`group relative bg-white border-2 sm:border-4 ${isCurrentKing ? 'border-yellow-400' : 'border-black'} shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 sm:hover:translate-x-2 sm:hover:translate-y-2 hover:shadow-none transition-all duration-300 p-4 sm:p-6 flex flex-col items-center animate-squad-entrance`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* ICON MAHKOTA (Jika Peringkat 1 Saat Ini) */}
              {isCurrentKing && (
                <div className="absolute -top-6 -right-4 sm:-top-8 sm:-right-6 bg-yellow-400 border-2 sm:border-4 border-black w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-20 animate-bounce-slow" title="Reigning King of the Month">
                  <Crown size={24} className="text-black fill-yellow-400" strokeWidth={2.5} />
                </div>
              )}

              {/* ROUNDED AVATAR */}
              <div className={`absolute -top-10 sm:-top-12 w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 sm:border-4 ${isCurrentKing ? 'border-yellow-400' : 'border-black'} bg-purple-200 overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:scale-110 transition-transform duration-300 z-10 flex-shrink-0`}>
                <img 
                  src={member.avatar_url || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${member.nama}`} 
                  alt={`Avatar ${member.nama}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* INFO UTAMA */}
              <div className="mt-8 sm:mt-10 text-center w-full min-w-0">
                <h2 className={`text-lg sm:text-xl font-black uppercase leading-tight truncate transition-colors ${isCurrentKing ? 'text-yellow-600 group-hover:text-yellow-500' : 'group-hover:text-purple-600'}`} title={member.nama}>
                  {member.nama}
                </h2>
                <div className="inline-block mt-2 bg-black text-white px-2 py-1 sm:px-3 sm:py-1 font-black text-[10px] sm:text-xs uppercase shadow-[2px_2px_0px_0px_rgba(168,85,247,1)]">
                  NIM: {member.nim}
                </div>
              </div>

              {/* LENCANA PENGHARGAAN (Sekarang hanya <div> visual, bukan <button>) */}
              {certs.length > 0 && (
                <div className="w-full mt-4 flex flex-col gap-2">
                  <div className="flex flex-wrap justify-center gap-2">
                    {certs.map((cert, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 bg-yellow-400 border-2 border-black px-2 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-[9px] sm:text-[10px] font-black uppercase text-black cursor-default select-none"
                        title="Penghargaan King of the Month"
                      >
                        <Trophy size={14} className="text-black" />
                        <span>{cert.month || "Bulan Ini"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* QUOTE SECTION */}
              <div className="w-full mt-4 relative">
                <div className="bg-blue-100 border-2 border-black p-2 sm:p-3 italic text-[10px] sm:text-[11px] font-bold text-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative">
                  <span className="absolute -top-2 -left-1 sm:-top-3 sm:-left-1 bg-black text-white text-[8px] sm:text-[10px] px-1 not-italic leading-none py-0.5">"</span>
                  <p className="line-clamp-3">
                    {displayQuote}
                  </p>
                  <span className="absolute -bottom-2 -right-1 sm:-bottom-3 sm:-right-1 bg-black text-white text-[8px] sm:text-[10px] px-1 not-italic leading-none py-0.5">"</span>
                </div>
              </div>

              {/* KONTAK TELEPON */}
              <div className="w-full mt-4 border-t-2 border-black border-dashed pt-4 text-center">
                <div className="flex items-center justify-center gap-2 max-w-full">
                  <span className="text-lg sm:text-xl flex-shrink-0">📞</span>
                  <span className="font-bold text-xs sm:text-sm bg-gray-100 border-2 border-black px-2 py-1 w-full truncate min-w-0" title={member.phone_num || 'BELUM_ADA_NOMOR'}>
                    {member.phone_num || 'BELUM_ADA_NOMOR'}
                  </span>
                </div>
              </div>

              {/* MEDIA SOSIAL ICONS */}
              <div className="w-full mt-4 flex flex-wrap justify-center gap-2">
                {socials.length > 0 ? (
                  socials.map((social, idx) => (
                    <a 
                      key={idx}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={social.platform}
                      className="bg-white border-2 border-black p-1.5 sm:p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-green-400 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all text-black flex items-center justify-center"
                    >
                      {getSocialIcon(social.platform, 16)}
                    </a>
                  ))
                ) : (
                  <span className="text-[10px] text-gray-400 italic">Belum ada sosmed</span>
                )}
              </div>

              {/* TAGS HOBI */}
              <div className="w-full mt-auto pt-4 flex flex-wrap gap-1 justify-center content-start border-t-2 border-black border-dashed">
                {hobbies.length > 0 ? (
                  hobbies.slice(0, 3).map((hobby, i) => (
                    <span 
                      key={i} 
                      className="bg-green-400 border-2 border-black text-[8px] sm:text-[9px] font-black uppercase px-2 py-0.5 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                    >
                      {hobby}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] text-gray-400 italic">No Data</span>
                )}
                
                {hobbies.length > 3 && (
                  <span className="bg-gray-200 border-2 border-black text-[8px] sm:text-[9px] font-black uppercase px-1 py-0.5 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] cursor-help" title={hobbies.slice(3).join(', ')}>
                    +{hobbies.length - 3}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}