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
    <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
      <table className="w-full text-left border-collapse text-xs">
        <thead className="bg-gray-100 border-b-4 border-black font-black uppercase">
          <tr>
            <th className="p-2 border-r-2 border-black w-20">ID_KODE</th>
            <th className="p-2 border-r-2 border-black">Judul_Tugas</th>
            <th className="p-2">Matkul</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} className="border-b-2 border-black italic">
              <td className="p-2 border-r-2 border-black font-black uppercase text-purple-600">{task.kode_tugas}</td>
              <td className="p-2 border-r-2 border-black font-bold uppercase">{task.judul}</td>
              <td className="p-2 text-gray-500 uppercase">{task.courses?.mata_kuliah?.nama_matkul}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}