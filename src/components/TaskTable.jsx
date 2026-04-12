import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import DateRangePicker from './DateRangePicker';

export default function TaskTable({ studentId, onRefresh }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    course: '',
    dateFrom: '',
    dateTo: '',
  });

  // 1. Fetch tugas yang aktif (belum masuk history) untuk mahasiswa tertentu
  const fetchStudentTasks = async () => {
    setLoading(true);
    // Mengambil data dari student_tasks yang is_completed = false
    const { data, error } = await supabase
      .from('student_tasks')
      .select(`
        id, deadline, is_completed,
        tasks ( 
          id, judul, 
          courses ( mata_kuliah (nama_matkul), semester )
        )
      `)
      .eq('student_id', studentId) // Filter spesifik mahasiswa
      .eq('is_completed', false);

    if (!error) {
      setTasks(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (studentId) fetchStudentTasks();
  }, [studentId]);

  // 2. Handler untuk menyelesaikan tugas (Checklist)
  const handleCompleteTask = async (assignment) => {
    const now = new Date();
    const deadline = new Date(assignment.deadline);
    
    // Tentukan status berdasarkan waktu
    const status = now > deadline ? 'OVERDUE' : 'COMPLETED';

    try {
      // A. Masukkan ke table histories_task
      const { error: historyError } = await supabase
        .from('histories_task')
        .insert([{
          student_id: studentId,
          task_id: assignment.tasks.id,
          status: status,
          completed_at: now.toISOString()
        }]);

      if (historyError) throw historyError;

      // B. Update status di student_tasks agar hilang dari list aktif
      await supabase
        .from('student_tasks')
        .update({ is_completed: true })
        .eq('id', assignment.id);

      // Refresh data
      fetchStudentTasks();
      if (onRefresh) onRefresh();
      
      alert(`Tugas berhasil ditandai sebagai ${status}!`);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const fmtDate = (iso) =>
    new Date(iso).toLocaleString('id-ID', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
    });

  return (
    <div className="px-4 sm:px-6 pb-24 mt-8">
      <div className="border-4 border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        
        {/* HEADER */}
        <div className="bg-black text-white p-5 font-black uppercase">
          <div className="flex justify-between items-center border-b-2 border-gray-700 pb-4 mb-4">
            <span className="text-xl tracking-tight">Tugas Aktif Saya</span>
            <button 
              onClick={fetchStudentTasks}
              className="text-xs border-2 border-green-400 px-3 py-1 text-green-400 hover:bg-green-400 hover:text-black transition-colors"
            >
              REFRESH
            </button>
          </div>
          
          {/* Sederhana: Info Deadline Terdekat */}
          <div className="text-[10px] text-gray-400 tracking-widest">
            TUGAS AKAN OTOMATIS MASUK RIWAYAT SETELAH DICHECKLIST
          </div>
        </div>

        {/* LIST TUGAS */}
        <div className="divide-y-4 divide-black">
          {tasks.length > 0 ? (
            tasks.map((item) => {
              const isOverdue = new Date() > new Date(item.deadline);
              
              return (
                <div key={item.id} className="group flex items-center bg-white hover:bg-gray-50 transition-colors">
                  {/* CHECKBOX SECTION */}
                  <div className="p-4 border-r-4 border-black">
                    <button
                      onClick={() => handleCompleteTask(item)}
                      className="w-10 h-10 border-4 border-black bg-white hover:bg-green-400 flex items-center justify-center transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
                      title="Tandai Selesai"
                    >
                      <span className="font-black text-xl">✓</span>
                    </button>
                  </div>

                  {/* INFO SECTION */}
                  <div className="p-4 flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-black uppercase text-sm sm:text-base">{item.tasks?.judul}</h4>
                      <p className="text-xs italic text-gray-600">
                        {item.tasks?.courses?.mata_kuliah?.nama_matkul} (Sem {item.tasks?.courses?.semester})
                      </p>
                    </div>

                    <div className="text-right flex flex-col items-end">
                      <span className="text-[10px] font-black uppercase text-gray-400">Deadline</span>
                      <span className={`font-black text-sm ${isOverdue ? 'text-red-500' : 'text-purple-600'}`}>
                        {fmtDate(item.deadline)}
                      </span>
                      {isOverdue && (
                        <span className="bg-red-500 text-white text-[8px] px-1 mt-1 font-black uppercase italic">
                          Melewati Deadline
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center font-black text-gray-400 uppercase italic">
              {loading ? 'Menyinkronkan data...' : 'Tidak ada tugas aktif. Kamu bebas!'}
            </div>
          )}
        </div>

        {/* FOOTER / SUMMARY */}
        <div className="bg-gray-100 p-3 border-t-4 border-black flex justify-between items-center">
          <span className="text-xs font-black uppercase">Total: {tasks.length} Tugas</span>
          <div className="flex gap-2">
             <div className="w-3 h-3 bg-purple-600 border border-black"></div>
             <span className="text-[10px] font-bold uppercase italic">On Time</span>
             <div className="w-3 h-3 bg-red-500 border border-black ml-2"></div>
             <span className="text-[10px] font-bold uppercase italic">Late</span>
          </div>
        </div>
      </div>
    </div>
  );
}