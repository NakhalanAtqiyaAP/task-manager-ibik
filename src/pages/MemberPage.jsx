import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase'; // Sesuaikan path jika berbeda

export default function MemberPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMembers() {
      // Mengambil data seluruh mahasiswa dari tabel students
      const { data, error } = await supabase
        .from('students')
        .select('id, nama, nim, avatar_url, hobby, telepon')
        .order('nama', { ascending: true });

      if (!error && data) {
        setMembers(data);
      }
      setLoading(false);
    }

    fetchMembers();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center font-black uppercase text-2xl animate-pulse">
        MEMUAT_DATABASE_SQUAD...
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 relative">
      {/* HEADER SECTION */}
      <div className="mb-16 border-b-8 border-black pb-4 inline-block">
        <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter text-purple-600 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          // SQUAD_DIRECTORY
        </h1>
        <p className="font-bold text-gray-600 mt-2 uppercase bg-yellow-400 border-2 border-black inline-block px-2 py-1 text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          Total Data: {members.length} Anggota Terdaftar
        </p>
      </div>

      {/* CUSTOM STYLE UNTUK ENTRANCE ANIMATION */}
      <style>{`
        @keyframes slideUpFade {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-squad-entrance {
          animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0; /* Berawal dari tak terlihat */
        }
      `}</style>

      {/* GRID KARTU ANGGOTA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-16 mt-10">
        {members.map((member, index) => {
          // Parse string hobby menjadi array (mengacu pada update profil sebelumnya)
          const hobbies = member.hobby ? member.hobby.split(',').map(h => h.trim()) : [];

          return (
            <div 
              key={member.id}
              className="group relative bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-2 hover:translate-y-2 hover:shadow-none transition-all duration-300 p-6 flex flex-col items-center animate-squad-entrance"
              style={{ animationDelay: `${index * 100}ms` }} // Staggered animation
            >
              {/* ROUNDED AVATAR BERADA DI ATAS CARD (OVERLAPPING) */}
              <div className="absolute -top-12 w-24 h-24 rounded-full border-4 border-black bg-purple-200 overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:scale-110 group-hover:rotate-[10deg] transition-transform duration-300 z-10">
                <img 
                  src={member.avatar_url || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${member.nama}`} 
                  alt={`Avatar ${member.nama}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* INFO UTAMA */}
              <div className="mt-10 text-center w-full">
                <h2 className="text-xl font-black uppercase leading-tight line-clamp-1 group-hover:text-purple-600 transition-colors">
                  {member.nama}
                </h2>
                <div className="inline-block mt-2 bg-black text-white px-3 py-1 font-black text-xs uppercase shadow-[2px_2px_0px_0px_rgba(168,85,247,1)]">
                  NIM: {member.nim}
                </div>
              </div>

              {/* KONTAK TELEPON */}
              <div className="w-full mt-4 border-t-2 border-black border-dashed pt-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl">📞</span>
                  <span className="font-bold text-sm bg-gray-100 border-2 border-black px-2 py-1 w-full truncate">
                    {member.telepon || 'BELUM_ADA_NOMOR'}
                  </span>
                </div>
              </div>

              {/* TAGS HOBI */}
              <div className="w-full mt-4 flex flex-wrap gap-1 justify-center min-h-[40px] content-start">
                {hobbies.length > 0 ? (
                  hobbies.slice(0, 3).map((hobby, i) => ( // Batasi maksimal 3 tag agar tidak merusak layout
                    <span 
                      key={i} 
                      className="bg-green-400 border-2 border-black text-[9px] font-black uppercase px-2 py-0.5 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                    >
                      {hobby}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] text-gray-400 italic">No Data</span>
                )}
                
                {/* Indikator jika hobi lebih dari 3 */}
                {hobbies.length > 3 && (
                  <span className="bg-gray-200 border-2 border-black text-[9px] font-black uppercase px-1 py-0.5 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                    +{hobbies.length - 3}
                  </span>
                )}
              </div>

              {/* ACTION BUTTON (OPSIONAL) */}
              <button className="mt-6 w-full bg-yellow-400 border-4 border-black py-2 font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:bg-purple-600 group-hover:text-white transition-colors active:translate-x-1 active:translate-y-1 active:shadow-none">
                LIHAT DETAIL
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}