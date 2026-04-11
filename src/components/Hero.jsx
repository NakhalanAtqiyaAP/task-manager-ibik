export default function Hero({ taskCount = 0, loading = false }) {
  return (
    <section className="py-10 px-6 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
      {/* Main Info Block */}
      <div className="border-4 border-black bg-purple-600 p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
        <h1 className="text-5xl md:text-6xl font-black text-white uppercase mb-4 leading-none tracking-tight">
          Website<br />TI-25-KA
        </h1>
        {/* <p className="text-white text-lg font-bold bg-black inline-block px-3 py-1 mb-8 border-2 border-white">
          
        </p> */}
        <div className="flex gap-4">
          {/* <button className="bg-green-400 text-black border-4 border-black px-8 py-3 font-black text-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-white hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all uppercase">
            Tambah Tugas +
          </button> */}
        </div>
      </div>
      
      {/* Decorative / Status Block */}
      <div className="hidden md:block border-4 border-black bg-white p-4 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] relative">
        <div className="absolute -top-5 -right-5 bg-green-400 border-4 border-black px-4 py-1 font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black uppercase text-lg">
          Semester 2
        </div>
        <div className="h-64 bg-gray-50 border-4 border-black flex flex-col items-center justify-center p-6 text-center">
           <h3 className="font-black text-3xl uppercase mb-2 border-b-4 border-black pb-2">Ringkasan</h3>
           <p className="font-bold text-gray-500 text-xl mt-2">
             {loading ? 'Memuat...' : taskCount > 0 ? `${taskCount} tugas sedang aktif` : 'Tidak ada tugas aktif'}
           </p>
        </div>
      </div>
    </section>
  );
}