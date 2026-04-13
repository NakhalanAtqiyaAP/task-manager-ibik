import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Globe } from 'lucide-react'; // Kita sisakan Globe dari Lucide sebagai cadangan

export default function MemberPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // HELPER SVG MENTAH (ANTI-ERROR)
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
    async function fetchMembers() {
      const { data, error } = await supabase
        .from('students')
        .select('id, nama, nim, avatar_url, hobby, phone_num, quotes, media_sosial')
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
        <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter text-white animate-brutal-header">
          TI-25-KA MEMBERS
        </h1>
        <br />
        <p className="font-bold text-gray-600 mt-2 uppercase bg-green-400 border-2 border-black inline-block px-2 py-1 text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          Total Data: {members.length} Anggota 
        </p>
      </div>

      {/* GRID KARTU ANGGOTA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-16 mt-10">
        {members.map((member, index) => {
          const hobbies = member.hobby ? member.hobby.split(',').map(h => h.trim()) : [];
          const socials = member.media_sosial || [];
          const displayQuote = (member.quotes && member.quotes.trim() !== "") 
            ? member.quotes 
            : "Belum ada quotes";

          return (
            <div 
              key={member.id}
              className="group relative bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-2 hover:translate-y-2 hover:shadow-none transition-all duration-300 p-6 flex flex-col items-center animate-squad-entrance"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* ROUNDED AVATAR */}
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

              {/* QUOTE SECTION */}
              <div className="w-full mt-4 relative">
                <div className="bg-blue-100 border-2 border-black p-3 italic text-[11px] font-bold text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative">
                  <span className="absolute -top-3 -left-1 bg-black text-white text-[10px] px-1 not-italic">"</span>
                  <p className="line-clamp-3">
                    {displayQuote}
                  </p>
                  <span className="absolute -bottom-3 -right-1 bg-black text-white text-[10px] px-1 not-italic">"</span>
                </div>
              </div>

              {/* KONTAK TELEPON */}
              <div className="w-full mt-4 border-t-2 border-black border-dashed pt-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl">📞</span>
                  <span className="font-bold text-sm bg-gray-100 border-2 border-black px-2 py-1 w-full truncate">
                    {member.phone_num || 'BELUM_ADA_NOMOR'}
                  </span>
                </div>
              </div>

              {/* MEDIA SOSIAL ICONS (PENGGUNAAN HELPER BARU) */}
              <div className="w-full mt-4 flex justify-center gap-2">
                {socials.length > 0 ? (
                  socials.map((social, idx) => (
                    <a 
                      key={idx}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={social.platform}
                      className="bg-white border-2 border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-green-400 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all text-black flex items-center justify-center"
                    >
                      {getSocialIcon(social.platform, 18)}
                    </a>
                  ))
                ) : (
                  <span className="text-[10px] text-gray-400 italic">Belum ada sosmed</span>
                )}
              </div>

              {/* TAGS HOBI */}
              <div className="w-full mt-4 flex flex-wrap gap-1 justify-center content-start border-t-2 border-black border-dashed pt-4">
                {hobbies.length > 0 ? (
                  hobbies.slice(0, 3).map((hobby, i) => (
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
                
                {hobbies.length > 3 && (
                  <span className="bg-gray-200 border-2 border-black text-[9px] font-black uppercase px-1 py-0.5 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
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