import { useState } from 'react';

export default function Navbar({ onMenuAction }) {
  const [activeSub, setActiveSub] = useState(null);
  const menuItems = ['Daftar Tugas', 'Mahasiswa'];

  const handleAction = (category, mode) => {
    onMenuAction(category, mode); // Mengirim category (e.g., Mahasiswa) dan mode (view/create)
    setActiveSub(null); // Tutup sub-menu setelah memilih
  };

  return (
    <nav className="border-b-4 border-black bg-white sticky top-0 z-50 p-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onMenuAction('Dashboard', 'view')}>
          <div className="w-10 h-10 bg-purple-600 border-4 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-white font-black">TI</span>
          </div>
          <span className="text-2xl md:text-3xl font-black tracking-tighter uppercase">Tugas TI-25-KA</span>
        </div>

        <div className="hidden md:flex gap-6 relative">
          {menuItems.map((item) => (
            <div key={item} className="relative group">
              <button 
                onClick={() => setActiveSub(activeSub === item ? null : item)}
                className={`px-5 py-2 border-4 border-black font-black uppercase transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none ${activeSub === item ? 'bg-purple-600 text-white' : 'bg-white'}`}
              >
                {item}
              </button>

              {/* Sub-Menu Pilihan */}
              {activeSub === item && (
                <div className="absolute top-full mt-2 left-0 w-48 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-[60]">
                  <button 
                    onClick={() => handleAction(item, 'view')}
                    className="w-full text-left p-3 font-black uppercase border-b-4 border-black hover:bg-green-400 transition-colors"
                  >
                    🔍 Tampilkan Data
                  </button>
                  <button 
                    onClick={() => handleAction(item, 'create')}
                    className="w-full text-left p-3 font-black uppercase hover:bg-green-400 transition-colors"
                  >
                    ➕ Bikin Data
                  </button>
                </div>
              )}
            </div>
          ))}
          <button className="px-5 py-2 bg-black text-white border-4 border-black font-black uppercase hover:bg-white hover:text-black transition-all">
            Log Sistem
          </button>
        </div>
      </div>
    </nav>
  );
}