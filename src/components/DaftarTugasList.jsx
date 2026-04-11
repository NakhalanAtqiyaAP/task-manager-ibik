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
          id, deadline, is_completed,
          students ( nama ),
          tasks ( judul, mata_kuliah:courses(mata_kuliah(nama_matkul)) )
        `)
        .order('deadline', { ascending: true });

      if (!error) setAssignments(data || []);
      setLoading(false);
    }
    fetchAssignments();
  }, []);

  return (
    <div className="space-y-8 p-1">
      {/* SECTION MONITORING */}
      <section>
        <div className="bg-purple-600 text-white p-3 border-4 border-black font-black uppercase text-sm mb-[-4px] relative z-10 inline-block shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          // Monitoring_Status
        </div>
        <div className="border-4 border-black bg-white overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-yellow-400 border-b-4 border-black text-xs font-black uppercase italic">
                  <th className="p-3 border-r-4 border-black">Mahasiswa</th>
                  <th className="p-3 border-r-4 border-black">Tugas & Matkul</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {assignments.map((item) => (
                  <tr key={item.id} className="border-b-2 border-black hover:bg-gray-50 transition-colors">
                    <td className="p-3 border-r-4 border-black font-black uppercase leading-tight">
                      {item.students?.nama}
                    </td>
                    <td className="p-3 border-r-4 border-black">
                      <div className="font-bold uppercase text-xs">{item.tasks?.judul}</div>
                      <div className="text-[10px] italic text-gray-500">
                         {item.tasks?.mata_kuliah?.mata_kuliah?.nama_matkul}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <div className={`border-2 border-black px-2 py-1 font-black text-[10px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${item.is_completed ? 'bg-green-400' : 'bg-red-400 text-white'}`}>
                        {item.is_completed ? 'DONE' : 'WAIT'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SECTION MASTER */}
      <section>
        <div className="bg-black text-white p-3 border-4 border-black font-black uppercase text-sm mb-[-4px] relative z-10 inline-block shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          // Master_Tugas_Ref
        </div>
        <TugasList />
      </section>
    </div>
  );
}