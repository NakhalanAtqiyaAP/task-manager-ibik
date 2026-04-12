import { useEffect, useState, useRef } from 'react'; // Tambahkan useRef
import { supabase } from '../lib/supabase';
import HistoryDashboard from './HistoryDashboard';
import DateRangePicker from './DateRangePicker';

export default function TaskTable({ studentId, onRefresh }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  
  // GANTI useState(false) menjadi useRef(false) untuk locking yang instan
  const syncLock = useRef(false);

  // State untuk filter
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [dateRange, setDateRange] = useState({ start: null, end: null });

  const displayedTasks = showAll ? tasks : tasks.slice(0, 3);

  // Fungsi untuk memindahkan tugas yang lewat deadline ke riwayat
  const syncExpiredTasks = async () => {
    // Gunakan syncLock.current untuk mengecek apakah proses sedang berjalan
    if (!studentId || syncLock.current) return; 
    
    syncLock.current = true; // Kunci pintunya!
    const now = new Date().toISOString();

    try {
      // Cari tugas aktif yang deadline-nya sudah lewat
      const { data: expiredTasks } = await supabase
        .from('student_tasks')
        .select('id, task_id, is_completed')
        .eq('student_id', studentId)
        .lt('deadline', now);

      if (expiredTasks && expiredTasks.length > 0) {
        // Filter untuk hanya tugas yang belum di-move ke history
        const { data: existingHistory } = await supabase
          .from('histories_task')
          .select('task_id')
          .eq('student_id', studentId);

        const existingTaskIds = new Set(existingHistory?.map(h => h.task_id) || []);
        
        // Hanya move tugas yang belum ada di history
        const tasksToMove = expiredTasks.filter(t => !existingTaskIds.has(t.task_id));

        if (tasksToMove.length > 0) {
          const historyPayload = tasksToMove.map(t => ({
            student_id: studentId,
            task_id: t.task_id,
            status: t.is_completed ? 'COMPLETED' : 'OVERDUE',
            completed_at: now
          }));

          // Insert ke history
          const { error: insertError } = await supabase.from('histories_task').insert(historyPayload);
          
          if (!insertError) {
            // Hapus dari daftar aktif HANYA jika insert berhasil
            const idsToDelete = tasksToMove.map(t => t.id);
            await supabase.from('student_tasks').delete().in('id', idsToDelete);
          }
        }
      }
    } catch (error) {
      console.error("Error syncing expired tasks:", error);
    } finally {
      syncLock.current = false; // Buka kembali pintunya setelah selesai/error
    }
  };

  // Fetch tugas yang masih aktif
  const fetchStudentTasks = async () => {
    if (!studentId) return;
    setLoading(true);
    
    // Tunggu proses sinkronisasi selesai sebelum mengambil data
    await syncExpiredTasks();

    let query = supabase
      .from('student_tasks')
      .select(`
        id, deadline, is_completed, task_id,
        tasks ( 
          id, judul, 
          courses ( mata_kuliah (nama_matkul), semester )
        )
      `)
      .eq('student_id', studentId);

    // Filter berdasarkan mata kuliah
    if (selectedCourse) {
      query = query.eq('tasks.course_id', selectedCourse);
    }

    // Filter berdasarkan date range
    if (dateRange.start) {
      query = query.gte('deadline', dateRange.start.toISOString());
    }
    if (dateRange.end) {
      query = query.lte('deadline', dateRange.end.toISOString());
    }

    const { data, error } = await query.order('deadline', { ascending: true });

    if (!error) {
      setTasks(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (isMounted) {
        // Fetch courses untuk filter
        const { data: coursesData } = await supabase
          .from('courses')
          .select('id, mata_kuliah (nama_matkul)');
        if (coursesData) setCourses(coursesData);

        await fetchStudentTasks();
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [studentId]);

  // Effect untuk menerapkan filter otomatis
  useEffect(() => {
    if (studentId) {
      fetchStudentTasks();
    }
  }, [selectedCourse, dateRange]);

  const handleToggleTask = async (taskId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('student_tasks')
        .update({ is_completed: !currentStatus })
        .eq('id', taskId);

      if (error) throw error;
      
      // Refresh UI (sekarang aman dari double request)
      await fetchStudentTasks();
      if (onRefresh) onRefresh();
    } catch (error) {
      alert("Gagal mengupdate tugas!");
      console.error(error);
    }
  };

  const fmtDate = (iso) =>
    new Date(iso).toLocaleString('id-ID', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
    });

  return (
    <div className="px-4 sm:px-6 pb-24 mt-8">
      <HistoryDashboard studentId={studentId} />  
    <div id="task" className="border-4 border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative z-10" >
        {/* HEADER */}
        <div className="bg-black text-white p-5 font-black uppercase">
          <div className="flex justify-between items-center border-b-2 border-gray-700 pb-4 mb-4">
            <span className="text-xl tracking-tight">Daftar Tugas</span>
            <button 
              onClick={fetchStudentTasks}
              className="text-xs border-2 border-green-400 px-3 py-1 text-green-400 hover:bg-green-400 hover:text-black transition-colors"
            >
              REFRESH
            </button>
          </div>

          {/* FILTER SECTION */}
          <div className="mb-4 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="block text-[10px] text-gray-400 mb-1">Filter Mata Kuliah</label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full bg-white border-2 border-gray-600 text-black px-3 py-2 text-sm font-bold uppercase"
                >
                  <option value="">Semua Mata Kuliah</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.mata_kuliah?.nama_matkul}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-[10px] text-gray-400 mb-1">Filter Tanggal Deadline</label>
                <DateRangePicker
                  startDate={dateRange.start}
                  endDate={dateRange.end}
                  onStartDateChange={(date) => setDateRange(prev => ({ ...prev, start: date }))}
                  onEndDateChange={(date) => setDateRange(prev => ({ ...prev, end: date }))}
                  onClear={() => setDateRange({ start: null, end: null })}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedCourse('');
                  setDateRange({ start: null, end: null });
                }}
                className="text-xs border-2 border-red-400 px-3 py-1 text-red-400 hover:bg-red-400 hover:text-white transition-colors"
              >
                RESET FILTER
              </button>
            </div>
          </div>

          <div className="text-[10px] text-gray-400 tracking-widest leading-relaxed">
            TUGAS YANG DICHECKLIST AKAN TETAP MUNCUL DI SINI SAMPAI DEADLINE TERLEWATI. LALU SISTEM AKAN OTOMATIS MEMINDAHKANNYA KE RIWAYAT.
          </div>
        </div>

        {/* LIST TUGAS */}
        <div className="divide-y-4 divide-black">
          {tasks.length > 0 ? (
            displayedTasks.map((item) => {
              const isDone = item.is_completed;
              return (
                <div key={item.id} className={`group flex items-center transition-colors ${isDone ? 'bg-green-50' : 'bg-white hover:bg-gray-50'}`}>
                  <div className="p-4 border-r-4 border-black flex-shrink-0">
                    <button
                      onClick={() => handleToggleTask(item.id, isDone)}
                      className={`w-10 h-10 border-4 border-black flex items-center justify-center transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 ${isDone ? 'bg-green-400' : 'bg-white hover:bg-gray-200'}`}
                    >
                      {isDone && <span id="task-done" className="font-black text-xl text-black">✓</span>}
                    </button>
                  </div>
                  <div className="p-4 flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className={`font-black uppercase text-sm sm:text-base ${isDone ? 'line-through text-gray-500' : ''}`}>
                        {item.tasks?.judul}
                      </h4>
                      <p className="text-xs italic text-gray-600">
                        {item.tasks?.courses?.mata_kuliah?.nama_matkul} (Sem {item.tasks?.courses?.semester})
                      </p>
                    </div>
                    <div className="text-right flex flex-col items-end flex-shrink-0">
                      <span className="text-[10px] font-black uppercase text-gray-400">Deadline</span>
                      <span className={`font-black text-sm ${isDone ? 'text-gray-400' : 'text-purple-600'}`}>
                        {fmtDate(item.deadline)}
                      </span>
                      {isDone && (
                        <span className="bg-green-400 border border-black text-black text-[10px] px-2 py-0.5 mt-1 font-black uppercase italic shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                          Selesai Dieksekusi
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center font-black text-gray-400 uppercase italic">
              {loading ? 'Menyinkronkan data...' : 'Tidak ada tugas aktif!'}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="bg-gray-100 p-3 border-t-4 border-black flex justify-between items-center gap-4">
          <span className="text-xs font-black uppercase">Total: {tasks.length} Tugas Menunggu</span>
          {tasks.length > 3 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="ml-auto text-xs border-2 border-purple-600 px-3 py-1.5 text-purple-600 font-black uppercase hover:bg-purple-600 hover:text-white transition-colors shadow-[2px_2px_0px_0px_rgba(147,51,234,1)]"
            >
              {showAll ? '▼ TAMPILKAN LEBIH SEDIKIT' : '▲ TAMPILKAN SEMUA'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}