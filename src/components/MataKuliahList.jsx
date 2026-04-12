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
    <div className="border-4 border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
      <div className="bg-black text-white p-4 font-black uppercase text-lg">Daftar Mata Kuliah</div>
      <div className="overflow-x-auto">
        <table className="min-w-full w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="border-b-4 border-black bg-purple-600 text-white">
              <th className="p-4 border-r-4 border-black font-black uppercase w-24">Kode</th>
              <th className="p-4 border-r-4 border-black font-black uppercase">Mata Kuliah</th>
              <th className="p-4 border-r-4 border-black font-black uppercase text-center">SKS</th>
              <th className="p-4 text-center font-black uppercase">Semester</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id} className="border-b-4 border-black hover:bg-green-100 transition-colors bg-white">
                <td className="p-4 border-r-4 border-black font-mono font-bold uppercase">{course.mata_kuliah?.kode_matkul}</td>
                <td className="p-4 border-r-4 border-black font-black uppercase">{course.mata_kuliah?.nama_matkul}</td>
                <td className="p-4 border-r-4 border-black text-center">
                  <span className="bg-black text-white px-3 py-1 text-xs font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">{course.mata_kuliah?.sks}</span>
                </td>
                <td className="p-4 text-center text-purple-600 font-black">S{course.semester}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}