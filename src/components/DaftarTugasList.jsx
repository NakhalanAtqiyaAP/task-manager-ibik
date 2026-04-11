import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import TugasList from './TugasList';

export default function DaftarTugasList() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAssignments() {
      setLoading(true);
      const { data, error } = await supabase
        .from('student_tasks')
        .select(`
          id,
          deadline,
          is_completed,
          students ( id, nama, nim ),
          tasks ( id, judul, kode_tugas, courses ( semester, mata_kuliah:matkul_id ( nama_matkul ) ) )
        `)
        .order('deadline', { ascending: true });

      if (error) {
        console.error('Gagal memuat daftar tugas:', error.message);
        setAssignments([]);
      } else {
        setAssignments(data || []);
      }
      setLoading(false);
    }

    fetchAssignments();
  }, []);

  return (
    <div className="space-y-6">
      <section className="border-4 border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        <div className="bg-black text-white p-4 font-black uppercase text-2xl flex items-center justify-between">
          <span>Daftar Tugas</span>
          {loading && <span className="text-xs animate-pulse text-green-400">SYNCING...</span>}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-4 border-black bg-purple-600 text-white">
                <th className="p-4 border-r-4 border-black font-black uppercase">Mahasiswa</th>
                <th className="p-4 border-r-4 border-black font-black uppercase">Tugas</th>
                <th className="p-4 border-r-4 border-black font-black uppercase">Mata Kuliah</th>
                <th className="p-4 border-r-4 border-black font-black uppercase text-center">Deadline</th>
                <th className="p-4 text-center uppercase font-black">Status</th>
              </tr>
            </thead>
            <tbody>
              {assignments.length > 0 ? (
                assignments.map((item) => (
                  <tr key={item.id} className="border-b-4 border-black bg-white hover:bg-green-100 transition-colors text-black">
                    <td className="p-4 border-r-4 border-black font-black uppercase">{item.students?.nama}</td>
                    <td className="p-4 border-r-4 border-black font-bold">{item.tasks?.judul}</td>
                    <td className="p-4 border-r-4 border-black italic text-gray-600">
                      {item.tasks?.courses?.mata_kuliah?.nama_matkul} (Sem {item.tasks?.courses?.semester})
                    </td>
                    <td className="p-4 border-r-4 border-black font-black text-purple-600 text-center">
                      {item.deadline ? new Date(item.deadline).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-block border-2 border-black px-2 py-1 font-black text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${item.is_completed ? 'bg-green-400' : 'bg-red-400 text-white'}`}>
                        {item.is_completed ? 'COMPLETED' : 'PENDING'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-10 text-center font-black text-gray-400 uppercase italic">
                    {loading ? 'Fetching Daftar Tugas...' : 'Belum ada data tugas.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border-4 border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-4">
        <div className="mb-4 text-2xl font-black uppercase">Master Tugas</div>
        <TugasList />
      </section>
    </div>
  );
}
