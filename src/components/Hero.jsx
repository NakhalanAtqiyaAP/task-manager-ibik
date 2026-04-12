import { useState } from 'react';

export default function Hero({ taskCount = 0, loading = false, user = null }) {
  const [showGuide, setShowGuide] = useState(false);

  return (
    <>
      <section className="py-10 px-4 sm:px-6 md:px-0 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center">
        {/* Main Info Block */}
        <div className="border-4 border-black bg-purple-700 p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] shimmer-container animate-entrance delay-300 relative overflow-hidden">
          
          {/* Nama User - Gaya Neo-Brutalist Label */}
          <div className="mb-4">
            <span className="bg-green-400 text-black border-2 border-black px-3 py-1 font-black text-xs uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] inline-block">
              Welcome, {user?.nama || 'Guest'}
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-black text-white uppercase mb-2 leading-none tracking-tight">
            Website<br />TI-25-KA
          </h1>

          {/* Tambahan Slogan Kecil agar tidak kosong */}
          <p className="text-purple-200 font-mono text-xs uppercase tracking-widest mt-4">
            "TI-25-KA solid solid solid"
          </p>

          <div className="flex gap-4 mt-6 flex-wrap justify-center pt-5">
            {/* Button Panduan dengan Neo-Brutalism */}
            <button 
              onClick={() => setShowGuide(true)}
              className="border-4 border-black bg-white text-black px-6 py-3 font-black uppercase text-sm shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:shadow-none active:translate-x-2 active:translate-y-2"
            >
              Panduan Penggunaan
            </button>
          </div>
        </div>
        
        {/* Decorative / Status Block */}
        <div className="hidden md:block border-4 text-white border-black bg-white p-4 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] relative">
          <div className="absolute -top-5 -right-5 bg-green-400 border-4 border-black px-4 py-1 font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black uppercase text-lg z-10">
            Semester 2
          </div>
          <div className="h-64 bg-gray-800 border-4 border-white flex flex-col items-center justify-center p-6 text-center bg-scan-overlay relative z-0">
             <h3 className="font-black text-3xl uppercase mb-2 border-b-4 border-white pb-2 relative z-10">Ringkasan</h3>
             <p className="font-bold text-gray-500 text-xl mt-2 relative z-10">
               {loading ? 'Memuat...' : taskCount > 0 ? `${taskCount} tugas sedang aktif` : 'Tidak ada tugas aktif'}
             </p>
          </div>
        </div>
      </section>

      {/* MODAL PANDUAN PENGGUNAAN */}
      {showGuide && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 transition-opacity"
            onClick={() => setShowGuide(false)}
          ></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="border-4 border-black bg-white shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              {/* Header */}
              <div className="bg-black text-white p-6 border-b-4 border-black flex justify-between items-center sticky top-0">
                <h2 className="text-3xl font-black uppercase italic">// PANDUAN_PENGGUNAAN</h2>
                <button 
                  onClick={() => setShowGuide(false)}
                  className="w-10 h-10 bg-white text-black border-4 border-black font-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                >
                  X
                </button>
              </div>

              {/* Content */}
              <div className="p-8 space-y-6">
                {/* Section 1 */}
                <div>
                  <h3 className="text-2xl font-black uppercase mb-3 border-b-4 border-black pb-2">1. Dashboard</h3>
                  <p className="font-bold text-sm text-gray-700 leading-relaxed">
                    Dashboard menampilkan ringkasan tugas aktif Anda. Bagian "Ringkasan" menunjukkan jumlah tugas yang sedang menunggu pengerjaan. Data diperbarui secara real-time.
                  </p>
                </div>

                {/* Section 2 */}
                <div>
                  <h3 className="text-2xl font-black uppercase mb-3 border-b-4 border-black pb-2">2. Daftar Tugas</h3>
                  <p className="font-bold text-sm text-gray-700 leading-relaxed">
                    Lihat semua tugas yang aktif dengan detail deadline, mata kuliah, dan status selesai. Gunakan filter mata kuliah atau range tanggal untuk menyaring tugas sesuai kebutuhan.
                  </p>
                </div>

                {/* Section 3 */}
                <div>
                  <h3 className="text-2xl font-black uppercase mb-3 border-b-4 border-black pb-2">3. Centang Tugas</h3>
                  <p className="font-bold text-sm text-gray-700 leading-relaxed">
                    Klik kotak centang untuk menandai tugas sebagai selesai. Tugas yang sudah dicentang akan berpindah ke riwayat setelah deadline terlewat.
                  </p>
                </div>

                {/* Section 4 */}
                <div>
                  <h3 className="text-2xl font-black uppercase mb-3 border-b-4 border-black pb-2">4. Filter</h3>
                  <p className="font-bold text-sm text-gray-700 leading-relaxed">
                    Gunakan filter mata kuliah di section tugas dan filter tanggal di bagian atas halaman untuk memudahkan pencarian tugas yang Anda inginkan.
                  </p>
                </div>

                {/* Section 5 */}
                <div>
                  <h3 className="text-2xl font-black uppercase mb-3 border-b-4 border-black pb-2">5. Riwayat</h3>
                  <p className="font-bold text-sm text-gray-700 leading-relaxed">
                    Bagian Riwayat menampilkan tugas yang sudah selesai atau terlewat deadline. Statistik tugas dibagi menjadi dua kategori: On-Time (selesai tepat waktu) dan Overdue (terlewat deadline).
                  </p>
                </div>

                {/* Footer */}
                <div className="border-t-4 border-black pt-4 mt-6">
                  <p className="text-xs font-black uppercase text-gray-500">
                    Pertanyaan lebih lanjut? Hubungi admin atau cek dokumentasi lebih detail.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}