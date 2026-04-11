import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function FormTugas({ onComplete }) {
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({ 
    kode_tugas: '', 
    judul: '', 
    deskripsi: '', 
    course_id: '', 
    deadline: '' 
  });

  useEffect(() => {
    async function getCourses() {
      const { data } = await supabase.from('courses').select('id, nama_matkul');
      if (data) setCourses(data);
    }
    getCourses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Insert ke tabel Master Tasks
    const { data: newTask, error: taskError } = await supabase
      .from('tasks')
      .insert([{
        kode_tugas: formData.kode_tugas,
        judul: formData.judul,
        deskripsi: formData.deskripsi,
        course_id: formData.course_id
      }])
      .select()
      .single();

    if (taskError) return alert("Error buat Master Task: " + taskError.message);

    // 2. Ambil ID semua Mahasiswa
    const { data: students } = await supabase.from('students').select('id');
    
    // 3. Distribusikan ke student_tasks jika ada mahasiswa
    if (students && students.length > 0) {
      const distributions = students.map(student => ({
        task_id: newTask.id,
        student_id: student.id,
        deadline: formData.deadline
      }));

      const { error: distError } = await supabase.from('student_tasks').insert(distributions);
      if (distError) return alert("Tugas terbuat, tapi gagal didistribusikan.");
    }

    alert("Tugas berhasil DIBUAT dan DIDISTRIBUSIKAN ke semua mahasiswa!");
    onComplete();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-black uppercase text-xs mb-1">// KODE_TUGAS</label>
          <input required placeholder="Contoh: LAB-01" className="w-full border-4 border-black p-3 font-bold focus:bg-purple-50 outline-none uppercase"
            onChange={(e) => setFormData({...formData, kode_tugas: e.target.value})}
          />
        </div>
        <div>
          <label className="block font-black uppercase text-xs mb-1">// MATA_KULIAH</label>
          <select required className="w-full border-4 border-black p-3 font-bold focus:bg-purple-50 outline-none appearance-none"
            onChange={(e) => setFormData({...formData, course_id: e.target.value})}
          >
            <option value="">-- PILIH --</option>
            {courses.map(c => (<option key={c.id} value={c.id}>{c.nama_matkul}</option>))}
          </select>
        </div>
      </div>

      <div>
        <label className="block font-black uppercase text-xs mb-1">// JUDUL_TUGAS</label>
        <input required className="w-full border-4 border-black p-3 font-bold focus:bg-purple-50 outline-none"
          onChange={(e) => setFormData({...formData, judul: e.target.value})}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
           <label className="block font-black uppercase text-xs mb-1">// DESKRIPSI (Opsional)</label>
           <input className="w-full border-4 border-black p-3 font-bold focus:bg-purple-50 outline-none"
             onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
           />
        </div>
        <div>
          <label className="block font-black uppercase text-xs mb-1">// DEADLINE</label>
          <input required type="datetime-local" className="w-full border-4 border-black p-3 font-bold focus:bg-purple-50 outline-none"
            onChange={(e) => setFormData({...formData, deadline: e.target.value})}
          />
        </div>
      </div>

      <button className="w-full bg-green-400 border-4 border-black p-4 font-black uppercase text-xl shadow-neo hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all mt-4">
        DEPLOY_TASK_DATA
      </button>
    </form>
  );
}