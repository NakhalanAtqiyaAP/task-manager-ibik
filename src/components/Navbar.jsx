import { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  UserSquare2, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  PlusSquare,
  X,
  Menu 
} from 'lucide-react'; // Import ikon yang dibutuhkan

export default function Navbar({ onMenuAction, currentUser, onToggleProfile }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSub, setActiveSub] = useState(null);

  // Tambahkan property 'icon' ke dalam array menu
  const allMenuItems = [
    { name: 'Dashboard', allowedRoles: ['admin', 'student'], icon: <LayoutDashboard size={18} strokeWidth={3} /> },
    { name: 'Member', allowedRoles: ['admin', 'student'], icon: <Users size={18} strokeWidth={3} /> },
    { name: 'Daftar Tugas', allowedRoles: ['admin', 'student'], icon: <ClipboardList size={18} strokeWidth={3} /> },
    { name: 'Mahasiswa', allowedRoles: ['admin'], icon: <UserSquare2 size={18} strokeWidth={3} /> },
    { name: 'Mata Kuliah', allowedRoles: ['admin'], icon: <BookOpen size={18} strokeWidth={3} /> }
  ];

  const userRole = currentUser?.role || 'student';
  const filteredItems = allMenuItems.filter(item => item.allowedRoles.includes(userRole));

  const handleAction = (category, mode) => {
    onMenuAction(category, mode);
  };

  const closeSidebar = () => {
    setMenuOpen(false);
    setActiveSub(null);
  };

  return (
    <>
      <nav className="border-b-4 border-black bg-black sticky top-0 z-40">
        <div className="mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          {/* LOGO */}
          <button
            onClick={() => {
              handleAction('Dashboard', 'view');
              closeSidebar();
            }}
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
              id="profile"
              onClick={onToggleProfile}
              className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all overflow-hidden bg-purple-200"
            >
              <img
                src={currentUser?.avatar_url || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${currentUser?.nama || 'User'}`}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </button>

            {/* HAMBURGER MENU */}
            <button 
              id="menu"
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black transition-all flex items-center justify-center"
            >
              {menuOpen ? <X size={24} strokeWidth={3} /> : <Menu size={24} strokeWidth={3} />}
            </button>
          </div>
        </div>
      </nav>

      {/* OVERLAY */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={closeSidebar}></div>
      )}

      {/* SIDEBAR */}
      <div className={`fixed top-0 right-0 h-full w-64 bg-white z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${menuOpen ? 'translate-x-0 border-l-8 border-black shadow-[-16px_0_0_0_rgba(0,0,0,1)]' : 'translate-x-full border-l-0'}`}>
        
        {/* Header Sidebar */}
        <div className="bg-purple-900 text-white p-4 border-b-4 border-black flex justify-between items-center">
          <h2 className="text-xl font-black uppercase italic">// Menu</h2>
          <button onClick={closeSidebar} className="w-8 h-8 bg-white text-black border-4 border-black font-black flex items-center justify-center hover:bg-red-400">
             <X size={18} strokeWidth={3} />
          </button>
        </div>

        {/* Menu Items Loop */}
        <div className="flex-1 overflow-y-auto">
          {filteredItems.map((item, idx) => (
            <div key={item.name} className={idx < filteredItems.length - 1 ? 'border-b-4 border-black' : ''}>
              <button
                onClick={() => {
                  if (item.name === 'Member' || item.name === 'Dashboard') {
                    handleAction(item.name, 'view');
                    closeSidebar();
                  } else {
                    setActiveSub(activeSub === item.name ? null : item.name);
                  }
                }}
                className={`w-full text-left px-5 py-4 font-black uppercase text-sm flex justify-between items-center transition-colors ${
                  activeSub === item.name ? 'bg-purple-600 text-white' : 'hover:bg-purple-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.name}</span>
                </div>
                {item.name !== 'Member' && item.name !== 'Dashboard' && (
                  <span className="text-xs">
                    {activeSub === item.name ? <ChevronUp size={16} strokeWidth={3} /> : <ChevronDown size={16} strokeWidth={3} />}
                  </span>
                )}
              </button>

              {/* Sub Items */}
              {activeSub === item.name && item.name !== 'Member' && item.name !== 'Dashboard' && (
                <div className="bg-gray-50 border-t-2 border-black">
                  <button
                    onClick={() => { handleAction(item.name, 'view'); closeSidebar(); }}
                    className="w-full text-left px-8 py-3 font-black uppercase text-xs flex items-center gap-2 border-b-2 border-gray-300 hover:bg-green-400"
                  >
                    <Search size={14} strokeWidth={3} />
                    Tampilkan Data
                  </button>
                  <button
                    onClick={() => { handleAction(item.name, 'create'); closeSidebar(); }}
                    className="w-full text-left px-8 py-3 font-black uppercase text-xs flex items-center gap-2 hover:bg-green-400"
                  >
                    <PlusSquare size={14} strokeWidth={3} />
                    Bikin Data
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}