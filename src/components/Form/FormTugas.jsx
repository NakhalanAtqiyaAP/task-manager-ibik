import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function FormTugas({ onComplete }) {
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({ judul_tugas: '', course_id: '', deadline: '' });

  useEffect(() => {
    async function getCourses() {
      const { data } = await supabase.from('courses').select('id, nama_matkul');
      if (data) setCourses(data);
    }
    getCourses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('tasks').insert([formData]);
    if (!error) {
      alert("Tugas baru berhasil ditambahkan!");
      onComplete();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex gap-2 mb-4 border-b-4 border-black pb-4">
        <button type="button" className="bg-purple-600 text-white px-4 py-1 font-black shadow-neo">BUAT BARU</button>
        <button type="button" className="bg-white border-2 border-black px-4 py-1 font-black hover:bg-gray-100 transition-all">LIHAT DATA</button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block font-black uppercase text-xs mb-1">// JUDUL_TUGAS</label>
          <input 
            required
            className="w-full border-4 border-black p-3 font-bold focus:bg-purple-50 outline-none"
            onChange={(e) => setFormData({...formData, judul_tugas: e.target.value})}
          />
        </div>

        <div>
          <label className="block font-black uppercase text-xs mb-1">// MATA_KULIAH</label>
          <select 
            required
            className="w-full border-4 border-black p-3 font-bold focus:bg-purple-50 outline-none appearance-none"
            onChange={(e) => setFormData({...formData, course_id: e.target.value})}
          >
            <option value="">-- PILIH MATKUL --</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.nama_matkul}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-black uppercase text-xs mb-1">// DEADLINE</label>
          <input 
            required
            type="datetime-local"
            className="w-full border-4 border-black p-3 font-bold focus:bg-purple-50 outline-none"
            onChange={(e) => setFormData({...formData, deadline: e.target.value})}
          />
        </div>
      </div>

      <button className="w-full bg-green-400 border-4 border-black p-4 font-black uppercase text-xl shadow-neo hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
        DEPLOY_TASK_DATA
      </button>
    </form>
  );
}