import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function TaskTable() {
  // Pastikan inisialisasi selalu array kosong [] agar tidak crash saat .length
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [masterTasks, setMasterTasks] = useState([]);
  const [existingAssignments, setExistingAssignments] = useState([]); 
  
  const [formData, setFormData] = useState({
    student_id: '',
    task_id: '',
    deadline: ''
  });

  async function fetchInitialData() {
    setLoading(true);
    try {
      const { data: monitorData, error } = await supabase
        .from('student_tasks')
        .select(`
          id, deadline, is_completed,
          students ( id, nama ),
          tasks (
            id, judul,
            courses ( 
              semester,
              mata_kuliah:matkul_id ( nama_matkul ) 
            )
          )
        `)
        .order('deadline', { ascending: true });

      if (error) throw error;

      const { data: stdData } = await supabase.from('students').select('id, nama, nim');
      const { data: tskData } = await supabase.from('tasks').select('id, judul');

      // Gunakan || [] sebagai pengaman ekstra
      setTasks(monitorData || []);
      setStudents(stdData || []);
      setMasterTasks(tskData || []);
      
      // Mapping untuk validasi duplikasi (studentId-taskId)
      // Gunakan Optional Chaining (?.) di setiap level
      const mapping = monitorData?.map(item => 
        item.students?.id && item.tasks?.id ? `${item.students.id}-${item.tasks.id}` : null
      ).filter(Boolean) || [];
      
      setExistingAssignments(mapping);

    } catch (error) {
      console.error('Database Error:', error.message);
      setTasks([]); // Set ke array kosong jika error agar UI tidak crash
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (existingAssignments.includes(`${formData.student_id}-${formData.task_id}`)) {
      alert("Mahasiswa ini sudah terdaftar dalam tugas tersebut!");
      return;
    }

    const { error } = await supabase.from('student_tasks').insert([formData]);

    if (!error) {
      alert("Data berhasil dideploy!");
      setIsModalOpen(false);
      setFormData({ student_id: '', task_id: '', deadline: '' });
      fetchInitialData();
    } else {
      alert(error.message);
    }
  };

  return (
    <div className="px-6 pb-24 mt-8">
      {/* Tombol Assign */}
      <div className="flex justify-end mb-4">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-purple-600 text-white border-4 border-black px-6 py-2 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2"
        >
          <span>+</span> Assign Tugas Baru
        </button>
      </div>

      <div className="border-4 border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        <div className="bg-black text-white p-4 font-black text-2xl uppercase flex justify-between items-center">
          <span>Monitor Tugas Mahasiswa</span>
          <div className="flex items-center gap-4">
             {loading && <span className="text-xs animate-pulse text-green-400">SYNCING...</span>}
             <button onClick={fetchInitialData} className="text-green-400 text-sm border-2 border-green-400 px-2 py-1 tracking-widest hover:bg-green-400 hover:text-black transition-colors">
               RE_SYNC
             </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-4 border-black bg-purple-600 text-white">
                <th className="p-4 border-r-4 border-black font-black uppercase">Mahasiswa</th>
                <th className="p-4 border-r-4 border-black font-black uppercase">Tugas</th>
                <th className="p-4 border-r-4 border-black font-black uppercase">Mata Kuliah</th>
                <th className="p-4 border-r-4 border-black font-black uppercase text-center">Deadline</th>
                <th className="p-4 text-center uppercase font-black">Status</th>
              </tr>
            </thead>
            <tbody>
              {/* Penanganan Safety: Cek tasks? && tasks.length */}
              {(tasks && tasks.length > 0) ? (
                tasks.map((item) => (
                  <tr key={item.id} className="border-b-4 border-black hover:bg-green-100 transition-colors bg-white text-black text-sm">
                    <td className="p-4 border-r-4 border-black font-black uppercase">{item.students?.nama || 'N/A'}</td>
                    <td className="p-4 border-r-4 border-black font-bold uppercase">{item.tasks?.judul || 'N/A'}</td>
                    <td className="p-4 border-r-4 border-black italic text-gray-600">
                      {item.tasks?.courses?.mata_kuliah?.nama_matkul} (Sem {item.tasks?.courses?.semester})
                    </td>
                    <td className="p-4 border-r-4 border-black font-black text-purple-600 text-center">
                      {item.deadline ? new Date(item.deadline).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'}
                    </td>
                    <td className="p-4 text-center">
                      <div className={`border-2 border-black px-2 py-1 font-black text-[10px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${item.is_completed ? 'bg-green-400' : 'bg-red-400 text-white'}`}>
                        {item.is_completed ? 'DONE' : 'WAITING'}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-10 text-center font-black text-gray-400 uppercase italic">
                    {loading ? 'Fetching System Data...' : 'Tidak ada tugas yang aktif.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL ASSIGNMENT (Tetap sama dengan logika filter kamu) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-6">
            <h2 className="text-2xl font-black uppercase mb-6 border-b-4 border-black pb-2 italic text-purple-600">Assign_New_Task</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-black uppercase text-xs mb-1 text-gray-500">// PILIH_TUGAS</label>
                <select required className="w-full border-4 border-black p-3 font-bold focus:bg-purple-100 outline-none"
                  value={formData.task_id} onChange={(e) => setFormData({...formData, task_id: e.target.value})}>
                  <option value="">-- PILIH MASTER TUGAS --</option>
                  {masterTasks.map(task => (
                    <option key={task.id} value={task.id}>{task.judul}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-black uppercase text-xs mb-1 text-gray-500">// MAHASISWA</label>
                <select required disabled={!formData.task_id} className="w-full border-4 border-black p-3 font-bold focus:bg-green-100 outline-none disabled:bg-gray-100"
                  value={formData.student_id} onChange={(e) => setFormData({...formData, student_id: e.target.value})}>
                  <option value="">-- PILIH MAHASISWA --</option>
                  {students.map(student => {
                    const isAssigned = existingAssignments.includes(`${student.id}-${formData.task_id}`);
                    if (isAssigned) return null;
                    return <option key={student.id} value={student.id}>{student.nama} ({student.nim})</option>;
                  })}
                </select>
              </div>
              <div>
                <label className="block font-black uppercase text-xs mb-1 text-gray-500">// SET_DEADLINE</label>
                <input required type="datetime-local" className="w-full border-4 border-black p-3 font-bold"
                  onChange={(e) => setFormData({...formData, deadline: e.target.value})} />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="submit" className="flex-1 bg-green-400 border-4 border-black p-3 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                  DEPLOY
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-white border-4 border-black p-3 font-black uppercase">
                  CLOSE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}