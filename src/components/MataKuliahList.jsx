import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function MataKuliahList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourses() {
      setLoading(true);
      const { data } = await supabase
        .from('courses')
        .select(`id, semester, mata_kuliah:matkul_id ( kode_matkul, nama_matkul, sks )`)
        .order('semester', { ascending: true });
      if (data) setCourses(data);
      setLoading(false);
    }
    fetchCourses();
  }, []);

  return (
    <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-green-400 border-b-4 border-black font-black uppercase text-xs italic">
            <th className="p-3 border-r-4 border-black w-24">Kode</th>
            <th className="p-3 border-r-4 border-black">Mata Kuliah</th>
            <th className="p-3 border-r-4 border-black text-center">SKS</th>
            <th className="p-3 text-center">Sem</th>
          </tr>
        </thead>
        <tbody className="text-sm font-bold">
          {courses.map((course) => (
            <tr key={course.id} className="border-b-2 border-black hover:bg-yellow-50 transition-colors">
              <td className="p-3 border-r-4 border-black font-mono bg-gray-50 uppercase">{course.mata_kuliah?.kode_matkul}</td>
              <td className="p-3 border-r-4 border-black uppercase">{course.mata_kuliah?.nama_matkul}</td>
              <td className="p-3 border-r-4 border-black text-center">
                <span className="bg-black text-white px-2 py-0.5 text-[10px] rounded-sm">{course.mata_kuliah?.sks}</span>
              </td>
              <td className="p-3 text-center text-purple-600 font-black italic">S{course.semester}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}