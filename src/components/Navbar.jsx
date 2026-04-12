import { useState } from 'react';

export default function Navbar({ onMenuAction, currentUser, onToggleProfile }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSub, setActiveSub] = useState(null);



  const allMenuItems = [
    { name: 'Daftar Tugas', allowedRoles: ['admin', 'student'] },
    { name: 'Mahasiswa', allowedRoles: ['admin'] },
    { name: 'Mata Kuliah', allowedRoles: ['admin'] }
  ];

  const userRole = currentUser?.role || 'student';
  const menuItems = allMenuItems
    .filter(item => item.allowedRoles.includes(userRole))
    .map(item => item.name);
  const handleAction = (category, mode) => {
    onMenuAction(category, mode);
    // Kita biarkan sidebar dan menu accordion tetap terbuka saat action dipencet
    // sesuai dengan permintaan (hanya close kalau pencet luar/tombol X)
  };

  const closeSidebar = () => {
    setMenuOpen(false);
    setActiveSub(null); // Mereset dropdown tab ketika sidebar benar-benar ditutup
  };

  return (
    <>
      <nav className="border-b-4 border-black bg-black sticky top-0 z-40">
        <div className="mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">

          {/* LOGO */}
          <button
            onClick={() => handleAction('Dashboard', 'view')}
            className="flex items-center gap-2 shrink-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-purple-800 border-4 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-white font-black text-sm">TI</span>
            </div>
            <span className="text-xl text-white sm:text-2xl md:text-3xl font-black tracking-tighter uppercase">
              TI-25-KA
            </span>
          </button>

          <div className="flex items-center gap-2 sm:gap-4">
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

            {/* HAMBURGER MENU — buka sidebar */}
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black text-lg leading-none hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
              aria-label="Toggle menu"
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </nav>

      {/* OVERLAY GELAP - Berfungsi sebagai "Outside Click Catcher" */}
      {/* Z-index dinaikkan jadi 40 agar menutupi navbar saat sedang terbuka */}
      {menuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={closeSidebar}
        ></div>
      )}

      {/* SIDEBAR MENU KANAN - Z-index 50 agar berada di atas overlay */}
      <div 
  className={`fixed top-0 right-0 h-full w-64 bg-white z-50 transform transition-transform duration-300 ease-in-out flex flex-col 
    ${menuOpen 
      ? 'translate-x-0 border-l-8 border-black shadow-[-16px_0_0_0_rgba(0,0,0,1)]' 
      : 'translate-x-full border-l-0 border-transparent shadow-none'
    }`}
>
        {/* Header Sidebar */}
        <div className="bg-purple-900 text-white p-4 border-b-4 border-black flex justify-between items-center">
          <h2 className="text-xl font-black uppercase italic">// Menu</h2>
          <button 
            onClick={closeSidebar}
            className="w-8 h-8 bg-white text-black border-4 border-black font-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
          >
            ✕
          </button>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto">
          {menuItems.map((item, idx) => (
            <div key={item} className={idx < menuItems.length - 1 ? 'border-b-4 border-black' : ''}>
              {/* Main Item */}
              <button
                onClick={() => setActiveSub(activeSub === item ? null : item)}
                className={`w-full text-left px-5 py-3 font-black uppercase text-sm flex justify-between items-center transition-colors border-b-2 border-black ${
                  activeSub === item ? 'bg-purple-600 text-white' : 'hover:bg-purple-100'
                }`}
              >
                <span>{item}</span>
                <span className="text-xs">{activeSub === item ? '▲' : '▼'}</span>
              </button>

              {/* Sub Items */}
              {activeSub === item && (
                <div className="bg-gray-50 border-t-2 border-black">
                  <button
                    onClick={() => handleAction(item, 'view')}
                    className="w-full text-left px-8 py-3 font-black uppercase text-sm border-b-2 border-gray-300 hover:bg-green-400 transition-colors"
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

        {/* LOGOUT BUTTON */}
        {/* <div className="border-t-4 border-black p-4">
          <button
            onClick={() => handleAction('Logout', 'logout')}
            className="w-full bg-red-500 text-white border-4 border-black font-black uppercase text-sm py-3 px-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
          >
            Logout
          </button>
        </div> */}
      </div>
    </>
  );
}