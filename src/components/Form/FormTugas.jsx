import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function FormTugas({ onComplete }) {
  const [activeCourses, setActiveCourses] = useState([]);
  const [formData, setFormData] = useState({ 
    kode_tugas: '', 
    judul: '', 
    deskripsi: '', 
    course_id: '', 
    deadline: '' 
  });

  useEffect(() => {
    async function getActiveCourses() {
      const { data } = await supabase
        .from('courses')
        .select(`
          id,
          semester,
          mata_kuliah ( nama_matkul )
        `);
      
      if (data) setActiveCourses(data);
    }
    getActiveCourses();
  }, []);

  // FUNGSI AUTO-GENERATE KODE TUGAS
  const handleCourseChange = (e) => {
    const selectedCourseId = e.target.value;
    
    if (!selectedCourseId) {
      setFormData({ ...formData, course_id: '', kode_tugas: '' });
      return;
    }

    // CARI DATA MATKUL YANG DIPILIH
    const selectedCourse = activeCourses.find(c => c.id === selectedCourseId);
    
    // PERBAIKAN: Ambil dari mata_kuliah.nama_matkul sesuai query
    const namaMatkul = selectedCourse?.mata_kuliah?.nama_matkul || 'XX';
    
    // Ambil 2 huruf depan (Uppercase)
    const prefixMatkul = namaMatkul.substring(0, 2).toUpperCase();
    
    // Format Tanggal: DDMMYYYY
    const date = new Date();
    const ddmmyyyy = String(date.getDate()).padStart(2, '0') + 
                     String(date.getMonth() + 1).padStart(2, '0') + 
                     date.getFullYear();
                     
    const generatedKode = `TI-${ddmmyyyy}-${prefixMatkul}`;

    setFormData({ 
      ...formData, 
      course_id: selectedCourseId, 
      kode_tugas: generatedKode 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { data: newTask, error: taskError } = await supabase
      .from('tasks')
      .insert([{
        kode_tugas: formData.kode_tugas,
        judul: formData.judul,
        deskripsi: formData.deskripsi,
        course_id: formData.course_id
      }])
      .select().single();

    if (taskError) return alert("Error: " + taskError.message);

    const { data: students } = await supabase.from('students').select('id');
    if (students?.length > 0) {
      const dist = students.map(s => ({
        task_id: newTask.id,
        student_id: s.id,
        deadline: formData.deadline
      }));
      await supabase.from('student_tasks').insert(dist);
    }

    alert(`Tugas ${formData.kode_tugas} Berhasil Di-deploy!`);
    onComplete();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-black uppercase text-xs mb-1 text-gray-500">// PILIH_MATKUL_AKTIF</label>
          <select 
            required 
            className="w-full border-4 border-black p-3 font-bold focus:bg-purple-100 outline-none appearance-none"
            value={formData.course_id}
            onChange={handleCourseChange}
          >
            <option value="">-- PILIH MATKUL --</option>
            {activeCourses.map(c => (
              <option key={c.id} value={c.id}>
                {/* PERBAIKAN: Akses mata_kuliah.nama_matkul */}
                {c.mata_kuliah?.nama_matkul} (Smtr {c.semester})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-black uppercase text-xs mb-1 text-gray-500">// KODE_TUGAS (AUTO)</label>
          <input 
            required 
            readOnly
            placeholder="Terisi Otomatis..."
            value={formData.kode_tugas}
            className="w-full border-4 border-black p-3 font-black bg-gray-200 text-gray-600 outline-none cursor-not-allowed"
          />
        </div>
      </div>

      {/* Input lainnya tetap sama */}
      <div>
        <label className="block font-black uppercase text-xs mb-1 text-gray-500">// JUDUL_TUGAS</label>
        <input 
          required 
          className="w-full border-4 border-black p-3 font-bold focus:bg-purple-100 outline-none"
          onChange={(e) => setFormData({...formData, judul: e.target.value})}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
           <label className="block font-black uppercase text-xs mb-1 text-gray-500">// DESKRIPSI (Opsional)</label>
           <input 
             className="w-full border-4 border-black p-3 font-bold focus:bg-purple-100 outline-none"
             onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
           />
        </div>
        <div>
          <label className="block font-black uppercase text-xs mb-1 text-gray-500">// DEADLINE</label>
          <input 
            required 
            type="datetime-local" 
            className="w-full border-4 border-black p-3 font-bold focus:bg-purple-100 outline-none"
            onChange={(e) => setFormData({...formData, deadline: e.target.value})}
          />
        </div>
      </div>

      <button className="w-full bg-green-400 border-4 border-black p-4 font-black uppercase text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all mt-4">
        SYNC_NEW_TASK
      </button>
    </form>
  );
}