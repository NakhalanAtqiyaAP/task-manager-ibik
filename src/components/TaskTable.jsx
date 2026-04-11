export default function TaskTable() {
  const dummyTasks = [
    { id: 1, nama: 'Laporan Lab Elektronika', matkul: 'Dasar Elektronika', deadline: '2026-04-15', semester: 2 },
    { id: 2, nama: 'Optimasi Query MariaDB', matkul: 'Database Mgmt', deadline: '2026-04-18', semester: 2 },
  ];

  return (
    <div className="px-6 pb-24 mt-8">
      <div className="border-4 border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        
        {/* Table Header Wrapper */}
        <div className="bg-black text-white p-4 font-black text-2xl uppercase flex justify-between items-center">
          <span>Daftar Tugas Aktif</span>
          <span className="text-green-400 text-sm border-2 border-green-400 px-2 py-1 tracking-widest">Live_Sync</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-4 border-black bg-purple-600 text-white">
                <th className="p-4 border-r-4 border-black font-black uppercase text-lg">Nama Tugas</th>
                <th className="p-4 border-r-4 border-black font-black uppercase text-lg">Mata Kuliah</th>
                <th className="p-4 border-r-4 border-black font-black uppercase text-center text-lg">Sem</th>
                <th className="p-4 border-r-4 border-black font-black uppercase text-lg">Deadline</th>
                <th className="p-4 text-center uppercase font-black text-lg">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {dummyTasks.map((task) => (
                <tr key={task.id} className="border-b-4 border-black hover:bg-green-100 transition-colors bg-white text-black">
                  <td className="p-4 border-r-4 border-black font-black text-xl">{task.nama}</td>
                  <td className="p-4 border-r-4 border-black font-bold text-gray-700">{task.matkul}</td>
                  <td className="p-4 border-r-4 border-black text-center font-black text-2xl">{task.semester}</td>
                  <td className="p-4 border-r-4 border-black font-black text-purple-600 text-lg">{task.deadline}</td>
                  <td className="p-4 text-center bg-gray-50">
                    <button className="bg-green-400 text-black border-4 border-black px-4 py-2 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-white hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all text-sm">
                      Kirim WA
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}