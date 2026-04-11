import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function TaskTable() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchInitialData() {
  setLoading(true);
  try {
    const { data: monitorData, error } = await supabase
      .from('student_tasks')
      .select(`
        id, deadline, is_completed,
        students ( id, nama ),
        tasks (
          id, judul,
          courses ( 
            semester,
            mata_kuliah:matkul_id ( nama_matkul ) 
          )
        )
      `)
      .order('deadline', { ascending: true });

    if (error) throw error;

    setTasks(monitorData || []);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    setLoading(false);
  }
}

  useEffect(() => {
    fetchInitialData();
  }, []);

  return (
    <div className="px-6 pb-24 mt-8">
      <div className="border-4 border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        <div className="bg-black text-white p-4 font-black text-2xl uppercase flex justify-between items-center">
          <span>Monitor Tugas Mahasiswa</span>
          <div className="flex items-center gap-4">
             {loading && <span className="text-xs animate-pulse text-green-400">SYNCING_DATABASE...</span>}
             <button onClick={fetchInitialData} className="text-green-400 text-sm border-2 border-green-400 px-2 py-1 tracking-widest hover:bg-green-400 hover:text-black transition-colors">
               RE_SYNC
             </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-4 border-black bg-purple-600 text-white">
                <th className="p-4 border-r-4 border-black font-black uppercase text-lg">Mahasiswa</th>
                <th className="p-4 border-r-4 border-black font-black uppercase text-lg">Tugas</th>
                <th className="p-4 border-r-4 border-black font-black uppercase text-lg">Mata Kuliah</th>
                <th className="p-4 border-r-4 border-black font-black uppercase text-center text-lg">Deadline</th>
                <th className="p-4 text-center uppercase font-black text-lg">Status</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length > 0 ? (
                tasks.map((item) => (
                  <tr key={item.id} className="border-b-4 border-black hover:bg-green-100 transition-colors bg-white text-black">
                    <td className="p-4 border-r-4 border-black font-black text-lg uppercase">{item.students?.nama}</td>
                    <td className="p-4 border-r-4 border-black font-bold">{item.tasks?.judul}</td>
                    <td className="p-4 border-r-4 border-black italic text-gray-600">
                      {item.tasks?.courses?.mata_kuliah?.nama_matkul} (Sem {item.tasks?.courses?.semester})
                    </td>
                    <td className="p-4 border-r-4 border-black font-black text-purple-600">
                      {new Date(item.deadline).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-4 text-center">
                      <div className={`border-2 border-black px-2 py-1 font-black text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${item.is_completed ? 'bg-green-400' : 'bg-red-400 text-white'}`}>
                        {item.is_completed ? 'COMPLETED' : 'PENDING'}
                      </div>
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
      </div>

      {/* Modal Tambah Assignment */}
    </div>
  );
}