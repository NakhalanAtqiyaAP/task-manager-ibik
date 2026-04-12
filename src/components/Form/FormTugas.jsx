import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function FormTugas({ onComplete }) {
  const [activeCourses, setActiveCourses] = useState([]);
  const [allStudents, setAllStudents] = useState([]); 
  const [selectedStudents, setSelectedStudents] = useState([]); 
  
  const [formData, setFormData] = useState({ 
    kode_tugas: '', 
    judul: '', 
    deskripsi: '', 
    course_id: '', 
    deadline: '',
    submission_link: '' // Tambahan state baru
  });

  // Fungsi Deteksi Tipe Input (URL, Email, atau Teks)
  const getSubmissionType = (value) => {
    if (!value) return '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const urlRegex = /^(http|https):\/\/[^ "]+$/;
    
    if (emailRegex.test(value)) return { label: 'EMAIL', color: 'bg-yellow-400' };
    if (urlRegex.test(value)) return { label: 'URL LINK', color: 'bg-blue-400' };
    return { label: 'TEKS PERINTAH', color: 'bg-gray-300' };
  };

  const detectedType = getSubmissionType(formData.submission_link);

  useEffect(() => {
    async function fetchData() {
      const { data: courses } = await supabase
        .from('courses')
        .select(`id, semester, mata_kuliah ( nama_matkul )`);
      if (courses) setActiveCourses(courses);

      const { data: students } = await supabase
        .from('students')
        .select('id, nama, nim')
        .order('nama', { ascending: true });
      if (students) setAllStudents(students);
    }
    fetchData();
  }, []);

  const toggleStudent = (id) => {
    setSelectedStudents(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const handleCourseChange = (e) => {
    const selectedCourseId = e.target.value;
    if (!selectedCourseId) {
      setFormData({ ...formData, course_id: '', kode_tugas: '' });
      return;
    }

    const selectedCourse = activeCourses.find(c => c.id === selectedCourseId);
    const namaMatkul = selectedCourse?.mata_kuliah?.nama_matkul || 'XX';
    
    const twoLettersMatkul = namaMatkul.substring(0, 2).toUpperCase();
    const date = new Date();
    const ddmmyy = String(date.getDate()).padStart(2, '0') + 
                   String(date.getMonth() + 1).padStart(2, '0') + 
                   String(date.getFullYear()).slice(-2);
    const random1Digit = Math.floor(Math.random() * 10);
    const random2Digit = String(Math.floor(Math.random() * 100)).padStart(2, '0');
    const generatedKode = `TI-${ddmmyy}-${random1Digit}-${random2Digit}-${twoLettersMatkul}`;

    setFormData({ ...formData, course_id: selectedCourseId, kode_tugas: generatedKode });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedStudents.length === 0) {
      return alert("Pilih minimal satu mahasiswa untuk menerima tugas ini!");
    }
    
    let deadline = formData.deadline;
    if (deadline) {
      const localDate = new Date(deadline);
      deadline = localDate.toISOString();
    }
    
    // 1. Simpan ke Master Tasks (Tanpa submission_link di sini)
    const { data: newTask, error: taskError } = await supabase
      .from('tasks')
      .insert([{
        kode_tugas: formData.kode_tugas,
        judul: formData.judul,
        deskripsi: formData.deskripsi,
        course_id: formData.course_id
      }])
      .select().single();

    if (taskError) return alert("Error Master Task: " + taskError.message);

    // 2. Distribusi ke student_tasks (Sertakan submission_link di sini)
    const dist = selectedStudents.map(studentId => ({
      task_id: newTask.id,
      student_id: studentId,
      deadline: deadline,
      submission_link: formData.submission_link // Dipindahkan ke sini
    }));

    const { error: distError } = await supabase.from('student_tasks').insert(dist);

    if (distError) {
      alert("Gagal mendistribusikan tugas: " + distError.message);
    } else {
      alert(`Tugas ${formData.kode_tugas} dideploy ke ${selectedStudents.length} mahasiswa!`);
      onComplete();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-black uppercase text-xs mb-1 text-gray-500">// PILIH_MATKUL</label>
          <select required className="w-full border-4 border-black p-3 font-bold focus:bg-purple-100 outline-none"
            value={formData.course_id} onChange={handleCourseChange}>
            <option value="">-- PILIH MATKUL --</option>
            {activeCourses.map(c => (
              <option key={c.id} value={c.id}>{c.mata_kuliah?.nama_matkul} (Smtr {c.semester})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-black uppercase text-xs mb-1 text-gray-500">// KODE_TUGAS</label>
          <input readOnly value={formData.kode_tugas} className="w-full border-4 border-black p-3 font-black bg-gray-200 focus:outline-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-1">
          <label className="block font-black uppercase text-xs mb-1 text-gray-500">// JUDUL_TUGAS</label>
          <input required className="w-full border-4 border-black p-3 font-bold focus:bg-purple-100 outline-none"
            onChange={(e) => setFormData({...formData, judul: e.target.value})} />
        </div>
        <div>
          <label className="block font-black uppercase text-xs mb-1 text-gray-500">// DEADLINE</label>
          <input required type="datetime-local" className="w-full border-4 border-black p-3 font-bold focus:bg-purple-100 outline-none"
            onChange={(e) => setFormData({...formData, deadline: e.target.value})} />
        </div>
      </div>

      {/* METODE PENGUMPULAN */}
      <div>
        <label className="block font-black uppercase text-xs mb-1 text-gray-500 flex justify-between items-center">
          <span>// METODE_PENGUMPULAN</span>
          {formData.submission_link && (
            <span className={`${detectedType.color} border-2 border-black px-2 py-0.5 text-[10px] text-black font-black uppercase`}>
              {detectedType.label}
            </span>
          )}
        </label>
        <input 
          required 
          placeholder="Cth: dosen@ibik.ac.id, https://github.com/..., atau 'Kumpulkan di kelas'"
          className="w-full border-4 border-black p-3 font-bold focus:bg-purple-100 outline-none"
          value={formData.submission_link}
          onChange={(e) => setFormData({...formData, submission_link: e.target.value})} 
        />
      </div>

      {/* DESKRIPSI TUGAS */}
      <div>
        <label className="block font-black uppercase text-xs mb-1 text-gray-500">// DESKRIPSI_TUGAS</label>
        <textarea 
          required 
          rows="3"
          className="w-full border-4 border-black p-3 font-bold focus:bg-purple-100 outline-none resize-none"
          onChange={(e) => setFormData({...formData, deskripsi: e.target.value})} 
        />
      </div>

      {/* CHECKLIST MAHASISWA */}
      <div>
        <label className="block font-black uppercase text-xs mb-1 text-gray-500">// TARGET_MAHASISWA ({selectedStudents.length})</label>
        <div className="border-4 border-black h-48 overflow-y-auto bg-gray-50 p-2 space-y-2">
          {allStudents.map(s => (
            <label key={s.id} className="flex items-center gap-3 p-2 border-2 border-black bg-white cursor-pointer hover:bg-green-100 transition-colors">
              <input 
                type="checkbox" 
                className="w-5 h-5 accent-black" 
                checked={selectedStudents.includes(s.id)}
                onChange={() => toggleStudent(s.id)}
              />
              <span className="font-bold text-sm uppercase">{s.nama} <span className="text-gray-400">({s.nim})</span></span>
            </label>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <button type="button" onClick={() => setSelectedStudents(allStudents.map(s => s.id))} className="text-[10px] font-black underline hover:text-purple-600">PILIH SEMUA</button>
          <button type="button" onClick={() => setSelectedStudents([])} className="text-[10px] font-black underline text-red-600 hover:text-red-800">RESET</button>
        </div>
      </div>

      <button className="w-full bg-green-400 border-4 border-black p-4 font-black uppercase text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:bg-yellow-400">
        DEPLOY TASK
      </button>
    </form>
  );
}