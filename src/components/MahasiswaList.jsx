import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

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
    <div className="border-4 border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
      <div className="bg-black text-white p-4 font-black uppercase text-lg">Daftar Mahasiswa</div>
      <div className="overflow-x-auto">
        <table className="min-w-full w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="border-b-4 border-black bg-purple-600 text-white">
              <th className="p-4 border-r-4 border-black font-black uppercase">NIM</th>
              <th className="p-4 border-r-4 border-black font-black uppercase">Nama</th>
              <th className="p-4 text-center font-black uppercase">WhatsApp</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-b-4 border-black hover:bg-green-100 transition-colors bg-white">
                <td className="p-4 border-r-4 border-black font-mono font-bold">{s.nim}</td>
                <td className="p-4 border-r-4 border-black font-black uppercase">{s.nama}</td>
                <td className="p-4 text-center font-bold text-purple-600">
                  <a href={`https://wa.me/${s.phone_num}`} target="_blank" rel="noreferrer" className="hover:underline font-black">
                    +{s.phone_num}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}