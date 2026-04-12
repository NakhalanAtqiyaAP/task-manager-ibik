export default function TaskTable({ tasks, loading, onRefresh }) {

  const fmtDate = (iso) =>
    new Date(iso).toLocaleString('id-ID', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
    });

  return (
    <div className="px-4 sm:px-6 pb-24 mt-8">
      <div className="border-4 border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden">

        {/* HEADER */}
        <div className="bg-black text-white p-4 font-black uppercase flex flex-wrap justify-between items-center gap-2">
          <span className="text-base sm:text-2xl tracking-tight">Monitor Tugas Mahasiswa</span>
          <div className="flex items-center gap-3">
            {loading && (
              <span className="text-xs animate-pulse text-green-400 tracking-widest">
                SYNCING...
              </span>
            )}
            <button
              onClick={onRefresh}
              className="text-green-400 text-xs border-2 border-green-400 px-2 py-1 tracking-widest hover:bg-green-400 hover:text-black transition-colors"
            >
              RE_SYNC
            </button>
          </div>
        </div>

        {/* DESKTOP TABLE — md ke atas */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-4 border-black bg-purple-600 text-white">
                {['Mahasiswa', 'Tugas', 'Mata Kuliah', 'Deadline', 'Status'].map((h, i) => (
                  <th
                    key={h}
                    className={`p-4 font-black uppercase text-sm lg:text-base ${i < 4 ? 'border-r-4 border-black' : 'text-center'}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tasks.length > 0 ? (
                tasks.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b-4 border-black hover:bg-green-100 transition-colors bg-white"
                  >
                    <td className="p-4 border-r-4 border-black font-black text-sm uppercase">
                      {item.students?.nama}
                    </td>
                    <td className="p-4 border-r-4 border-black font-semibold text-sm">
                      {item.tasks?.judul}
                    </td>
                    <td className="p-4 border-r-4 border-black italic text-gray-600 text-sm">
                      {item.tasks?.courses?.mata_kuliah?.nama_matkul}{' '}
                      <span className="not-italic text-xs text-gray-500">
                        (Sem {item.tasks?.courses?.semester})
                      </span>
                    </td>
                    <td className="p-4 border-r-4 border-black font-black text-purple-600 whitespace-nowrap text-sm">
                      {fmtDate(item.deadline)}
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`inline-block border-2 border-black px-2 py-1 font-black text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                          item.is_completed ? 'bg-green-400' : 'bg-red-400 text-white'
                        }`}
                      >
                        {item.is_completed ? 'COMPLETED' : 'PENDING'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-10 text-center font-black text-gray-400 uppercase italic">
                    {loading ? 'Fetching System Data...' : 'Data tugas mahasiswa kosong.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARD LIST — di bawah md */}
        <div className="md:hidden divide-y-4 divide-black">
          {tasks.length > 0 ? (
            tasks.map((item) => (
              <div key={item.id} className="bg-white">
                {/* Card Header */}
                <div className="bg-purple-600 text-white p-3 flex justify-between items-start gap-2">
                  <div>
                    <p className="font-black uppercase text-sm">
                      {item.students?.nama}
                    </p>
                    <p className="text-xs opacity-80 mt-0.5">{item.tasks?.judul}</p>
                  </div>
                  <span
                    className={`shrink-0 border-2 border-black px-2 py-0.5 font-black text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                      item.is_completed ? 'bg-green-400 text-black' : 'bg-red-400 text-white'
                    }`}
                  >
                    {item.is_completed ? 'DONE' : 'PENDING'}
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-3 flex flex-col gap-2 text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="font-black uppercase text-xs text-gray-500">Mata Kuliah</span>
                    <span className="italic text-gray-700 text-right">
                      {item.tasks?.courses?.mata_kuliah?.nama_matkul}{' '}
                      <span className="not-italic text-xs text-gray-500">
                        (Sem {item.tasks?.courses?.semester})
                      </span>
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="font-black uppercase text-xs text-gray-500">Deadline</span>
                    <span className="font-black text-purple-600">
                      {fmtDate(item.deadline)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-10 text-center font-black text-gray-400 uppercase italic">
              {loading ? 'Fetching System Data...' : 'Data tugas mahasiswa kosong.'}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}