import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function StudentList() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    async function getStudents() {
      const { data } = await supabase.from('students').select('*').order('nama', { ascending: true });
      if (data) setStudents(data);
    }
    getStudents();
  }, []);

  return (
    <div className="overflow-x-auto border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <table className="w-full text-left">
        <thead className="bg-black text-green-400">
          <tr>
            <th className="p-3 uppercase font-black border-r-2 border-green-400">NIM</th>
            <th className="p-3 uppercase font-black border-r-2 border-green-400">Nama</th>
            <th className="p-3 uppercase font-black text-center">WhatsApp</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {students.map((s) => (
            <tr key={s.id} className="border-b-2 border-black hover:bg-purple-100">
              <td className="p-3 font-mono font-bold border-r-2 border-black">{s.nim}</td>
              <td className="p-3 font-black uppercase border-r-2 border-black">{s.nama}</td>
              <td className="p-3 text-center font-bold text-purple-600">
                {/* Update property no_wa menjadi phone_num */}
                <a href={`https://wa.me/${s.phone_num}`} target="_blank" rel="noreferrer" className="hover:underline">
                  +{s.phone_num}
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}