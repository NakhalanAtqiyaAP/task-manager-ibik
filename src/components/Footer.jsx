export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="mt-20 border-t-8 border-black bg-white">
      {/* Top Section: Quick Info */}
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h4 className="font-black uppercase text-xl mb-4 italic underline decoration-4 decoration-purple-600">
            Task_Manager v1.0
          </h4>
          <p className="font-bold text-sm text-gray-600 leading-relaxed">
            Sistem manajemen tugas terintegrasi untuk efisiensi akademik dan pemantauan deadline secara real-time.
          </p>
        </div>
        
        <div>
          <h4 className="font-black uppercase text-lg mb-4">Akses_Cepat</h4>
          <ul className="space-y-2 font-bold text-sm uppercase">
            <li><a href="#" className="hover:text-purple-600 transition-colors">→ Panduan Penggunaan</a></li>
            <li><a href="#" className="hover:text-purple-600 transition-colors">→ Kebijakan Data</a></li>
            <li><a href="#" className="hover:text-purple-600 transition-colors">→ Hubungi Admin</a></li>
          </ul>
        </div>

        <div className="border-4 border-black p-4 bg-green-400 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <h4 className="font-black uppercase text-sm mb-2">Akademik_Info</h4>
          <p className="text-xs font-bold leading-tight uppercase">
            Lokasi: Bogor, Indonesia <br />
            Institusi: Technical Education Unit <br />
            Tahun: {currentYear}
          </p>
        </div>
      </div>

      {/* Bottom Bar: System Status (Sticky Style) */}
      <div className="bg-black text-white p-3 border-t-4 border-black">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-mono tracking-widest uppercase">
          <div className="flex gap-6">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Status: System_Online
            </span>
            <span>Uptime: 99.9%</span>
            <span className="hidden md:inline text-purple-400">Database: Connected_MariaDB</span>
          </div>
          
          <div className="flex gap-4 items-center">
            <span className="bg-white text-black px-2 py-0.5 font-black">Nakhalan Atqiya</span>
            <span className="opacity-50 italic">© {currentYear} All Rights Reserved</span>
          </div>
        </div>
      </div>
    </footer>
  );
}