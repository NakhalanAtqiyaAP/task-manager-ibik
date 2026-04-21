import { useEffect, useState, useRef } from 'react'; 
import confetti from 'canvas-confetti';
import { CheckCircle2 } from 'lucide-react';

import { supabase } from '../lib/supabase';
import HistoryDashboard from './HistoryDashboard';
import DateRangePicker from './DateRangePicker';

export default function TaskTable({ studentId, onRefresh }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  
  const syncLock = useRef(false);

  // State untuk filter
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [dateRange, setDateRange] = useState({ start: null, end: null });

  const displayedTasks = showAll ? tasks : tasks.slice(0, 3);

  const syncExpiredTasks = async () => {
    if (!studentId || syncLock.current) return; 
    syncLock.current = true;
    const now = new Date().toISOString();

    try {
      const { data: expiredTasks } = await supabase
        .from('student_tasks')
        .select('id, task_id, is_completed')
        .eq('student_id', studentId)
        .lt('deadline', now);

      if (expiredTasks && expiredTasks.length > 0) {
        const historyPayload = expiredTasks.map(t => ({
          student_id: studentId,
          task_id: t.task_id,
          status: t.is_completed ? 'COMPLETED' : 'OVERDUE',
          completed_at: now
        }));

        const { error: insertError } = await supabase
          .from('histories_task')
          .insert(historyPayload);
        
        if (!insertError) {
          const idsToDelete = expiredTasks.map(t => t.id);
          await supabase.from('student_tasks').delete().in('id', idsToDelete);
        }
      }
    } catch (error) {
      console.error("Gagal menyinkronkan tugas basi:", error);
    } finally {
      syncLock.current = false;
    }
  };

  const fetchStudentTasks = async () => {
    if (!studentId) return;
    setLoading(true);
    
    await syncExpiredTasks();

    let query = supabase
      .from('student_tasks')
      .select(`
        id, deadline, is_completed, task_id, submission_link, 
        tasks ( 
          id, judul, materi, 
          courses ( mata_kuliah (nama_matkul), semester )
        )
      `)
      .eq('student_id', studentId);

    if (selectedCourse) {
      query = query.eq('tasks.course_id', selectedCourse);
    }

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

      if (!currentStatus) {
        triggerConfetti();
      }
      
      await fetchStudentTasks();
      if (onRefresh) onRefresh();
    } catch (error) {
      alert("Gagal mengupdate tugas!");
      console.error(error);
    }
  };

  // Temukan fungsi ini di TaskTable.jsx dan ubah menjadi:
const renderMateriAction = (materi) => {
  if (!materi) return null;

  const urlRegex = /^(http|https):\/\/[^ "]+$/;
  const isLink = urlRegex.test(materi);

  // Deteksi apakah link berasal dari bucket supabase kamu
  const isSupabaseFile = isLink && materi.includes('materi_tugas'); 

  return (
    <div className="relative group/materi inline-block mr-2">
      {isLink ? (
        <a 
          href={materi} 
          target="_blank" 
          rel="noopener noreferrer"
          download={isSupabaseFile} // Memicu download paksa jika itu file
          className="inline-flex items-center gap-1 mt-2 bg-green-400 border-2 border-black px-2 py-1 text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
        >
           {isSupabaseFile ? 'UNDUH MATERI' : 'BUKA MATERI (LINK)'}
        </a>
      ) : (
        <div className="inline-flex items-center gap-1 mt-2 bg-green-400 border-2 border-black px-2 py-1 text-[10px] font-black uppercase cursor-help shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          Catatan Materi
        </div>
      )}

      {/* Pop up catatan materi */}
      <div className="absolute bottom-full left-0 mb-2 hidden group-hover/materi:block z-50">
        <div className="bg-black text-white text-[9px] p-2 border-2 border-purple-400 w-48 break-words shadow-[4px_4px_0px_0px_rgba(147,51,234,1)]">
          <span className="text-purple-300 font-black block mb-1">DETAIL MATERI:</span>
          {isSupabaseFile ? 'Materi siap diunduh.' : materi}
        </div>
      </div>
    </div>
  );
};

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#4ade80', '#9333ea', '#ffffff', '#000000'] 
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#4ade80', '#9333ea', '#ffffff', '#000000']
      });
    }, 250);
  };

  const fmtDate = (iso) =>
    new Date(iso).toLocaleString('id-ID', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
    });

  return (
    <div className="px-4 sm:px-6 pb-24 mt-8">
      <HistoryDashboard studentId={studentId} />  
      <div id="task" className=" scroll-reveal border-4 border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative z-10" >
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
              const link = item.submission_link;

              const renderSubmissionAction = () => {
                if (!link) return null;

                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                const urlRegex = /^(http|https):\/\/[^ "]+$/;

                if (emailRegex.test(link)) {
                  return (
                    <a 
                      href={`mailto:${link}`} 
                      className="inline-flex items-center gap-1 mt-2 bg-yellow-400 border-2 border-black px-2 py-1 text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
                    >
                      Kirim di Sini (Email)
                    </a>
                  );
                }

                if (urlRegex.test(link)) {
                  return (
                    <a 
                      href={link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 bg-blue-400 text-white border-2 border-black px-2 py-1 text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
                    >
                      Kirim di Sini (Link)
                    </a>
                  );
                }

                return (
                  <div className="mt-2 flex items-start gap-1">
                    <span className="bg-gray-200 border-2 border-black px-2 py-0.5 text-[9px] font-black uppercase">Note:</span>
                    <span className="text-[10px] font-bold text-gray-700 italic">{link}</span>
                  </div>
                );
              };

              return (
                // PERUBAHAN 1: Efek Hover Container dengan shadow inset (garis ungu di kiri)
                <div 
                  key={item.id} 
                  className={`group flex items-center transition-all duration-300 ease-out
                    ${isDone 
                      ? 'bg-green-50/50 hover:bg-green-50 hover:shadow-[inset_8px_0px_0px_0px_rgba(39,245,84,10)]' 
                      : 'bg-white hover:bg-purple-50 hover:shadow-[inset_8px_0px_0px_0px_rgba(147,51,234,1)]'
                    }`}
                >
                  <div className="p-4 border-r-4 border-black flex-shrink-0 relative z-10">
                    {/* PERUBAHAN 2: Efek Hover Tombol (Melompat & Berubah Kuning) */}
                    <button
                      onClick={() => handleToggleTask(item.id, isDone)}
                      className={`w-10 h-10 border-4 border-black flex items-center justify-center transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 
                        ${isDone 
                          ? 'bg-green-400 group-hover:bg-green-500 group-hover:-translate-y-1 group-hover:-translate-x-1 group-hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]' 
                          : 'bg-white group-hover:bg-yellow-400 group-hover:-translate-y-1 group-hover:-translate-x-1 group-hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
                        }`}
                    >
                      {/* Ikon ikut sedikit membesar saat baris di-hover */}
                      <CheckCircle2 className={`w-6 h-6 text-black stroke-[3px] transition-transform duration-300 ${!isDone && 'group-hover:scale-110'}`} />
                    </button>
                  </div>

                  {/* PERUBAHAN 3: Teks Utama Bergeser Sedikit ke Kanan Saat Hover */}
                  <div className={`p-4 flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-transform duration-300 ${!isDone && 'group-hover:translate-x-1'}`}>
                    <div>
                      <h4 className={`font-black uppercase text-sm sm:text-base ${isDone ? 'line-through text-gray-500' : ''}`}>
                        {item.tasks?.judul}
                      </h4>
                      <p className="text-xs italic text-gray-600">
                        {item.tasks?.courses?.mata_kuliah?.nama_matkul} (Sem {item.tasks?.courses?.semester})
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-2">
                        {!isDone && renderMateriAction(item.tasks?.materi)}
                        {!isDone && renderSubmissionAction()}
                      </div>
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