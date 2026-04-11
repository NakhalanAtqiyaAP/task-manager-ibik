export default function Navbar() {
  const menu = ['Dashboard', 'Daftar Tugas', 'Mahasiswa', 'Log Sistem'];
  
  return (
    <nav className="flex items-center justify-between p-6 border-b-4 border-black bg-white sticky top-0 z-50">
      <div className="flex items-center gap-3">
        {/* Logo/Icon Block */}
        <span className="text-3xl font-black tracking-tighter uppercase">Tugas TI-25-KA</span>
      </div>
      
      <div className="hidden md:flex gap-4">
        {menu.map((item) => (
          <button 
            key={item} 
            className="px-5 py-2 bg-white border-4 border-black font-black uppercase hover:bg-purple-600 hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
          >
            {item}
          </button>
        ))}
      </div>
    </nav>
  );
}