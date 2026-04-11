import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function MataKuliahList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourses() {
      setLoading(true);
      const { data, error } = await supabase
        .from('courses')
        .select(`
          id,
          semester,
          mata_kuliah:matkul_id ( id, kode_matkul, nama_matkul, sks )
        `)
        .order('semester', { ascending: true });

      if (error) {
        console.error('Gagal memuat mata kuliah:', error.message);
        setCourses([]);
      } else {
        setCourses(data || []);
      }
      setLoading(false);
    }

    fetchCourses();
  }, []);

  return (
    <div className="overflow-x-auto border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
      <table className="w-full text-left border-collapse">
        <thead className="bg-black text-white">
          <tr>
            <th className="p-3 border-r-2 border-white uppercase font-black">Kode Matkul</th>
            <th className="p-3 border-r-2 border-white uppercase font-black">Nama Mata Kuliah</th>
            <th className="p-3 border-r-2 border-white uppercase font-black text-center">SKS</th>
            <th className="p-3 border-r-2 border-white uppercase font-black text-center">Semester</th>
          </tr>
        </thead>
        <tbody>
          {courses.length > 0 ? (
            courses.map((course) => (
              <tr key={course.id} className="border-b-2 border-black hover:bg-green-100 transition-colors">
                <td className="p-3 font-mono font-black uppercase border-r-2 border-black">{course.mata_kuliah?.kode_matkul || '-'}</td>
                <td className="p-3 font-bold">{course.mata_kuliah?.nama_matkul || '-'}</td>
                <td className="p-3 text-center font-black">{course.mata_kuliah?.sks ?? '-'}</td>
                <td className="p-3 text-center font-black">{course.semester ?? '-'}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="p-8 text-center font-black text-gray-400 uppercase italic">
                {loading ? 'Loading mata kuliah...' : 'Tidak ada data mata kuliah.'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
