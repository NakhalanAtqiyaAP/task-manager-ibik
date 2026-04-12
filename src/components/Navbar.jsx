// src/components/Navbar.jsx
import { useState, useEffect, useRef } from 'react';

export default function Navbar({ onMenuAction, currentUser, onToggleProfile }) {
  const [activeSub, setActiveSub] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef(null);

  const menuItems = ['Daftar Tugas', 'Mahasiswa', 'Mata Kuliah'];

  const handleAction = (category, mode) => {
    onMenuAction(category, mode);
    setActiveSub(null);
    setMobileMenuOpen(false);
  };

  // Tutup dropdown kalau klik di luar navbar
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setActiveSub(null);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav
      ref={navRef}
      className="border-b-4 border-black bg-black sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">

        {/* LOGO */}
        <button
          onClick={() => handleAction('Dashboard', 'view')}
          className="flex items-center gap-2 shrink-0"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-purple-600 border-4 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-white font-black text-sm">TI</span>
          </div>
          <span className="text-xl text-white sm:text-2xl md:text-3xl font-black tracking-tighter uppercase">
            TI-25-KA
          </span>
        </button>

        <div className="flex items-center gap-2 sm:gap-4 relative">

          {/* DESKTOP MENU — md ke atas */}
          <div className="hidden md:flex items-center gap-3 lg:gap-6">
            {menuItems.map((item) => (
              <div key={item} className="relative">
                <button
                  onClick={() => setActiveSub(activeSub === item ? null : item)}
                  className={`px-3 lg:px-5 py-2 border-4 border-black font-black uppercase text-sm transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none ${
                    activeSub === item ? 'bg-purple-600 text-white' : 'bg-white'
                  }`}
                >
                  {item}
                </button>

                {activeSub === item && (
                  <div className="absolute top-full mt-2 left-0 w-48 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-50">
                    <button
                      onClick={() => handleAction(item, 'view')}
                      className="w-full text-left p-3 font-black uppercase text-sm border-b-4 border-black hover:bg-green-400 transition-colors"
                    >
                      🔍 Tampilkan Data
                    </button>
                    <button
                      onClick={() => handleAction(item, 'create')}
                      className="w-full text-left p-3 font-black uppercase text-sm hover:bg-green-400 transition-colors"
                    >
                      ➕ Bikin Data
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* HAMBURGER — di bawah md */}
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(!mobileMenuOpen);
              setActiveSub(null);
            }}
            className="md:hidden p-2 border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black text-lg leading-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>

          {/* AVATAR */}
          <button
            onClick={onToggleProfile}
            className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all overflow-hidden bg-purple-200"
            title="Buka Profil"
          >
            <img
              src={
                currentUser?.avatar_url ||
                `https://api.dicebear.com/7.x/pixel-art/svg?seed=${currentUser?.nama || 'User'}`
              }
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </button>
        </div>
      </div>

      {/* MOBILE DROPDOWN MENU — full width, di bawah navbar */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t-4 border-black bg-white">
          {menuItems.map((item, idx) => (
            <div key={item} className={idx < menuItems.length - 1 ? 'border-b-4 border-black' : ''}>
              {/* Sub-header item */}
              <button
                onClick={() => setActiveSub(activeSub === item ? null : item)}
                className={`w-full text-left px-5 py-3 font-black uppercase text-sm flex justify-between items-center transition-colors ${
                  activeSub === item ? 'bg-purple-600 text-white' : 'hover:bg-purple-50'
                }`}
              >
                <span>{item}</span>
                <span className="text-xs">{activeSub === item ? '▲' : '▼'}</span>
              </button>

              {activeSub === item && (
                <div className="border-t-4 border-black bg-gray-50">
                  <button
                    onClick={() => handleAction(item, 'view')}
                    className="w-full text-left px-8 py-3 font-black uppercase text-sm border-b-2 border-black hover:bg-green-400 transition-colors"
                  >
                    🔍 Tampilkan Data
                  </button>
                  <button
                    onClick={() => handleAction(item, 'create')}
                    className="w-full text-left px-8 py-3 font-black uppercase text-sm hover:bg-green-400 transition-colors"
                  >
                    ➕ Bikin Data
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </nav>
  );
}