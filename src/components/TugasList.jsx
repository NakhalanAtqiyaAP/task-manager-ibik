import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function TugasList() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTasks() {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          id,
          kode_tugas,
          judul,
          deskripsi,
          courses ( semester, mata_kuliah:matkul_id ( nama_matkul ) )
        `)
        .order('kode_tugas', { ascending: true });

      if (error) {
        console.error('Gagal memuat daftar tugas:', error.message);
        setTasks([]);
      } else {
        setTasks(data || []);
      }
      setLoading(false);
    }

    fetchTasks();
  }, []);

  return (
    <div className="overflow-x-auto border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
      <table className="w-full text-left border-collapse">
        <thead className="bg-black text-white">
          <tr>
            <th className="p-3 border-r-2 border-white uppercase font-black">Kode</th>
            <th className="p-3 border-r-2 border-white uppercase font-black">Judul Tugas</th>
            <th className="p-3 border-r-2 border-white uppercase font-black">Mata Kuliah</th>
            <th className="p-3 border-r-2 border-white uppercase font-black text-center">Semester</th>
          </tr>
        </thead>
        <tbody>
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <tr key={task.id} className="border-b-2 border-black hover:bg-green-100 transition-colors">
                <td className="p-3 font-mono font-black uppercase border-r-2 border-black">{task.kode_tugas}</td>
                <td className="p-3 font-bold">{task.judul}</td>
                <td className="p-3 italic text-gray-600">{task.courses?.mata_kuliah?.nama_matkul || '-'}</td>
                <td className="p-3 text-center font-black">{task.courses?.semester ?? '-'}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="p-8 text-center font-black text-gray-400 uppercase italic">
                {loading ? 'Loading daftar tugas...' : 'Tidak ada master tugas.'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
