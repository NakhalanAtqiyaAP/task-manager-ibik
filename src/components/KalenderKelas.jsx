import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  BookOpen, 
  CheckCircle2, 
  X, 
  MapPin, 
  UserCheck, 
  RefreshCw,
  AlertCircle,
  AlertTriangle
} from 'lucide-react';

const daysOfWeek = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export default function KalenderKelas({ studentId }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null); // Modal detail hari

  useEffect(() => {
    fetchCalendarData();
  }, [studentId, currentDate.getMonth(), currentDate.getFullYear()]);

  const fetchCalendarData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Jadwal Kuliah Mingguan
      const { data: scheduleData, error: schedErr } = await supabase
        .from('jadwal_kuliah')
        .select('*')
        .order('jam_mulai', { ascending: true });

      if (schedErr) console.error('Error fetching schedules:', schedErr);
      else setSchedules(scheduleData || []);

      // 2. Fetch Tugas Mahasiswa (Aktif & Terlewat)
      if (studentId) {
        const nowIso = new Date().toISOString();

        // A. Fetch tugas aktif dari student_tasks
        const { data: activeTaskData, error: taskErr } = await supabase
          .from('student_tasks')
          .select(`
            id, deadline, is_completed, 
            tasks (
              id, judul, deskripsi, materi,
              courses ( mata_kuliah ( nama_matkul ) )
            )
          `)
          .eq('student_id', studentId);

        if (taskErr) console.error('Error fetching active tasks:', taskErr);

        // B. Fetch tugas yang sudah masuk riwayat dari histories_task
        const { data: historyTaskData, error: histErr } = await supabase
          .from('histories_task')
          .select(`
            id, status, completed_at,
            tasks (
              id, judul, deskripsi, materi,
              courses ( mata_kuliah ( nama_matkul ) )
            )
          `)
          .eq('student_id', studentId);

        if (histErr) console.error('Error fetching history tasks:', histErr);

        // Format & Normalisasi Tugas Aktif
        const formattedActiveTasks = (activeTaskData || []).map((t) => {
          const isOverdue = !t.is_completed && new Date(t.deadline) < new Date();
          return {
            id: `active-${t.id}`,
            deadline: t.deadline,
            is_completed: t.is_completed,
            is_overdue: isOverdue,
            status: t.is_completed ? 'COMPLETED' : isOverdue ? 'OVERDUE' : 'PENDING',
            judul: t.tasks?.judul || 'Tugas',
            deskripsi: t.tasks?.deskripsi || '',
            materi: t.tasks?.materi || '',
            nama_matkul: t.tasks?.courses?.mata_kuliah?.nama_matkul || 'Umum'
          };
        });

        // Format & Normalisasi Tugas Riwayat (Termasuk yang Overdue dari riwayat)
        const formattedHistoryTasks = (historyTaskData || []).map((h) => {
          const isOverdue = h.status === 'OVERDUE';
          return {
            id: `hist-${h.id}`,
            deadline: h.completed_at || nowIso,
            is_completed: h.status === 'COMPLETED',
            is_overdue: isOverdue,
            status: h.status,
            judul: h.tasks?.judul || 'Tugas',
            deskripsi: h.tasks?.deskripsi || '',
            materi: h.tasks?.materi || '',
            nama_matkul: h.tasks?.courses?.mata_kuliah?.nama_matkul || 'Umum'
          };
        });

        // Gabungkan seluruh tugas
        setTasks([...formattedActiveTasks, ...formattedHistoryTasks]);
      }
    } catch (err) {
      console.error('Failed to load calendar data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper tanggal
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Memunculkan data jadwal & tugas untuk tanggal tertentu
  const getItemsForDate = (dayNumber) => {
    const targetDate = new Date(year, month, dayNumber);
    const dayName = daysOfWeek[targetDate.getDay()];

    // Match Jadwal Kuliah berdasarkan Hari (Senin-Minggu)
    const daySchedules = schedules.filter(
      (s) => s.hari?.toLowerCase() === dayName.toLowerCase()
    );

    // Match Tugas berdasarkan Tanggal Deadline (YYYY-MM-DD)
    const dayTasks = tasks.filter((t) => {
      if (!t.deadline) return false;
      const taskDate = new Date(t.deadline);
      return (
        taskDate.getDate() === dayNumber &&
        taskDate.getMonth() === month &&
        taskDate.getFullYear() === year
      );
    });

    return { daySchedules, dayTasks, targetDate, dayName };
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Online': return 'bg-blue-400 text-black';
      case 'Offline': return 'bg-green-400 text-black';
      case 'Pindah Jam': return 'bg-yellow-400 text-black';
      case 'Dibatalkan': return 'bg-red-500 text-white';
      default: return 'bg-gray-300 text-black';
    }
  };

  return (
    <div className="px-3 sm:px-6 pb-24 mt-8">
      <div id="kalender" className="scroll-reveal border-3 sm:border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] relative z-10">
        
        {/* HEADER KALENDER */}
        <div className="bg-black text-white p-4 md:p-6 font-black uppercase">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-gray-800 pb-4 mb-4 gap-4">
            <span className="text-xl md:text-2xl tracking-tight flex items-center gap-2.5">
              <CalendarIcon size={28} strokeWidth={2.5} className="shrink-0 text-green-400" />
              KALENDER AKADEMIK & TUGAS
            </span>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={fetchCalendarData}
                disabled={loading}
                className="text-xs font-black border-2 border-green-400 px-3 py-2 text-green-400 hover:bg-green-400 hover:text-black transition-all shadow-[2px_2px_0px_0px_rgba(74,222,128,0.5)] active:translate-x-0.5 active:translate-y-0.5 flex items-center gap-1.5"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                {loading ? 'SYNC...' : 'REFRESH'}
              </button>

              <button
                onClick={goToToday}
                className="text-xs font-black bg-green-400 text-black border-2 border-black px-3 py-2 hover:bg-green-300 transition-all shadow-[2px_2px_0px_0px_rgba(255,255,255,0.8)] active:translate-x-0.5 active:translate-y-0.5"
              >
                HARI INI
              </button>
            </div>
          </div>

          {/* NAVIGASI BULAN */}
          <div className="flex items-center justify-between bg-gray-900 border-2 border-gray-700 p-2 sm:p-3">
            <button
              onClick={prevMonth}
              className="bg-green-400 text-black border-2 border-black p-1.5 hover:bg-green-300 transition-all shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] active:translate-x-0.5 active:translate-y-0.5"
            >
              <ChevronLeft size={20} strokeWidth={3} />
            </button>

            <span className="text-base sm:text-lg font-black tracking-widest text-green-400">
              {monthNames[month]} {year}
            </span>

            <button
              onClick={nextMonth}
              className="bg-green-400 text-black border-2 border-black p-1.5 hover:bg-green-300 transition-all shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] active:translate-x-0.5 active:translate-y-0.5"
            >
              <ChevronRight size={20} strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* KETERANGAN LEGENDA (LEGEND) */}
        <div className="bg-green-200 border-b-4 border-black p-3 text-xs font-black uppercase flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-3 items-center">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-blue-400 border border-black inline-block"></span>
              Jadwal Kelas
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-purple-400 border border-black inline-block"></span>
              Tugas Aktif
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-green-400 border border-black inline-block"></span>
              Tugas Selesai
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-red-500 border border-black inline-block"></span>
              Tugas Terlewat
            </span>
          </div>
          <span className="text-[10px] text-gray-700 font-mono">KLIK TANGGAL UNTUK RINCIAN</span>
        </div>

        {/* HEADER HARI GRID */}
        <div className="grid grid-cols-7 bg-black text-white text-center font-black text-[10px] sm:text-xs uppercase border-b-4 border-black">
          {daysOfWeek.map((d, i) => (
            <div key={d} className={`p-2 border-r border-gray-800 ${i === 0 ? 'text-red-400' : ''}`}>
              {d.slice(0, 3)}
            </div>
          ))}
        </div>

        {/* GRID KALENDER */}
        <div className="grid grid-cols-7 bg-gray-200 gap-px border-b-4 border-black">
          {/* Muka kosong bulan sebelumnya */}
          {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
            <div key={`empty-${idx}`} className="bg-gray-100 min-h-[80px] sm:min-h-[110px] p-1 opacity-40"></div>
          ))}

          {/* Tanggal bulan aktif */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const { daySchedules, dayTasks, targetDate } = getItemsForDate(dayNum);
            
            const isToday = 
              new Date().getDate() === dayNum &&
              new Date().getMonth() === month &&
              new Date().getFullYear() === year;

            const totalItems = daySchedules.length + dayTasks.length;

            return (
              <div
                key={`day-${dayNum}`}
                onClick={() => setSelectedDay({ dayNum, daySchedules, dayTasks, targetDate })}
                className={`bg-white min-h-[80px] sm:min-h-[110px] p-1 sm:p-2 cursor-pointer transition-all hover:bg-green-50 flex flex-col justify-between border border-gray-300 relative group ${
                  isToday ? 'bg-green-100 ring-2 ring-black ring-inset' : ''
                }`}
              >
                {/* NOMOR TANGGAL */}
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-xs sm:text-sm font-black px-1.5 py-0.5 ${
                    isToday 
                      ? 'bg-black text-green-400 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]' 
                      : 'text-black'
                  }`}>
                    {dayNum}
                  </span>
                  {isToday && (
                    <span className="hidden sm:inline-block text-[8px] font-black bg-green-400 text-black border border-black px-1 uppercase">
                      HARI INI
                    </span>
                  )}
                </div>

                {/* INDIKATOR KONTEN */}
                <div className="space-y-1 flex-1 overflow-hidden">
                  {/* Badge Jadwal */}
                  {daySchedules.slice(0, 2).map((s) => (
                    <div
                      key={`sched-${s.id}`}
                      className="bg-blue-300 border border-black px-1 py-0.5 text-[8px] sm:text-[10px] font-black uppercase truncate shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between"
                    >
                      <span className="truncate">{s.mata_kuliah}</span>
                      <span className="hidden sm:inline text-[7px] bg-white px-0.5 border border-black shrink-0 ml-1">
                        {s.jam_mulai?.slice(0, 5)}
                      </span>
                    </div>
                  ))}

                  {/* Badge Tugas (Selesai, Aktif, & Terlewat) */}
                  {dayTasks.slice(0, 2).map((t) => {
                    let taskBadgeClass = 'bg-purple-300 text-black';
                    let taskIcon = '📋';

                    if (t.is_completed) {
                      taskBadgeClass = 'bg-green-300 line-through text-gray-700';
                      taskIcon = '✅';
                    } else if (t.is_overdue) {
                      taskBadgeClass = 'bg-red-500 text-white font-black';
                      taskIcon = '🚨';
                    }

                    return (
                      <div
                        key={`task-${t.id}`}
                        className={`border border-black px-1 py-0.5 text-[8px] sm:text-[10px] uppercase truncate shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between ${taskBadgeClass}`}
                      >
                        <span className="truncate">{taskIcon} {t.judul}</span>
                      </div>
                    );
                  })}

                  {/* Sisa Item Jika Lebih dari 4 */}
                  {totalItems > 4 && (
                    <div className="text-[8px] sm:text-[9px] font-black text-gray-600 uppercase text-center bg-gray-200 border border-black py-0.5">
                      +{totalItems - 4} LAINNYA
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* FOOTER */}
        <div className="bg-black text-white p-3 border-t-4 border-black flex justify-between items-center text-xs font-black uppercase">
          <span>BULAN: {monthNames[month]} {year}</span>
        </div>

      </div>

      {/* MODAL POPUP RINCIAN TANGGAL */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-3 backdrop-blur-sm">
          <div className="bg-white border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] w-full max-w-lg max-h-[90vh] overflow-y-auto">
            
            {/* MODAL HEADER */}
            <div className="bg-black text-white p-4 flex justify-between items-center border-b-4 border-black sticky top-0 z-10">
              <div>
                <span className="text-xs text-green-400 font-mono uppercase block">AGENDA TANGGAL</span>
                <h3 className="text-base sm:text-lg font-black uppercase">
                  {selectedDay.dayNum} {monthNames[month]} {year} ({daysOfWeek[selectedDay.targetDate.getDay()]})
                </h3>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="bg-red-500 text-white p-1.5 border-2 border-white hover:bg-red-600 transition-all active:translate-x-0.5 active:translate-y-0.5"
              >
                <X size={20} strokeWidth={3} />
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="p-4 sm:p-6 space-y-6">
              
              {/* SECTION JADWAL KULIAH */}
              <div>
                <div className="flex items-center gap-2 border-b-2 border-black pb-2 mb-3 bg-blue-100 p-2">
                  <BookOpen size={18} strokeWidth={3} className="text-black" />
                  <h4 className="font-black text-sm uppercase">
                    Jadwal Perkuliahan ({selectedDay.daySchedules.length})
                  </h4>
                </div>

                {selectedDay.daySchedules.length > 0 ? (
                  <div className="space-y-2">
                    {selectedDay.daySchedules.map((s) => (
                      <div
                        key={s.id}
                        className="border-2 border-black p-3 bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-1.5"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <h5 className="font-black text-sm uppercase">{s.mata_kuliah}</h5>
                          <span className={`px-2 py-0.5 text-[9px] font-black border border-black uppercase ${getStatusBadgeClass(s.status)}`}>
                            {s.status || 'OFFLINE'}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold text-gray-700">
                          <span className="flex items-center gap-1">
                            <Clock size={13} /> {s.jam_mulai?.slice(0, 5)} - {s.jam_selesai?.slice(0, 5)} WIB
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin size={13} /> {s.ruangan || '—'}
                          </span>
                          <span className="flex items-center gap-1">
                            <UserCheck size={13} /> {s.dosen || '—'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs font-black text-gray-500 uppercase italic bg-gray-50 p-3 border border-dashed border-gray-400 text-center">
                    Tidak ada jadwal kuliah rutin di hari ini.
                  </p>
                )}
              </div>

              {/* SECTION TUGAS */}
              <div>
                <div className="flex items-center gap-2 border-b-2 border-black pb-2 mb-3 bg-purple-100 p-2">
                  <AlertCircle size={18} strokeWidth={3} className="text-black" />
                  <h4 className="font-black text-sm uppercase">
                    Deadline Tugas ({selectedDay.dayTasks.length})
                  </h4>
                </div>

                {selectedDay.dayTasks.length > 0 ? (
                  <div className="space-y-2">
                    {selectedDay.dayTasks.map((t) => {
                      let cardBg = 'bg-white';
                      if (t.is_completed) cardBg = 'bg-green-50';
                      else if (t.is_overdue) cardBg = 'bg-red-50 border-red-500';

                      return (
                        <div
                          key={t.id}
                          className={`border-2 border-black p-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-1.5 ${cardBg}`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <h5 className={`font-black text-sm uppercase ${t.is_completed ? 'line-through text-gray-500' : ''}`}>
                                {t.judul}
                              </h5>
                              <p className="text-[10px] font-bold text-gray-600 italic">
                                {t.nama_matkul}
                              </p>
                            </div>

                            {t.is_completed ? (
                              <span className="bg-green-400 text-black border border-black px-2 py-0.5 text-[9px] font-black uppercase flex items-center gap-1">
                                <CheckCircle2 size={12} /> Selesai
                              </span>
                            ) : t.is_overdue ? (
                              <span className="bg-red-500 text-white border border-black px-2 py-0.5 text-[9px] font-black uppercase flex items-center gap-1 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                                <AlertTriangle size={12} /> Terlewat
                              </span>
                            ) : (
                              <span className="bg-purple-400 text-black border border-black px-2 py-0.5 text-[9px] font-black uppercase">
                                Pending
                              </span>
                            )}
                          </div>

                          {t.deskripsi && (
                            <p className="text-xs text-gray-700 bg-gray-100 p-2 border-l-3 border-purple-500 font-mono">
                              {t.deskripsi}
                            </p>
                          )}
                          
                          <div className="text-right text-[10px] font-mono font-bold text-gray-600">
                            Jam Deadline: {new Date(t.deadline).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs font-black text-gray-500 uppercase italic bg-gray-50 p-3 border border-dashed border-gray-400 text-center">
                    Bebas tugas! Tidak ada deadline pada tanggal ini.
                  </p>
                )}
              </div>

            </div>

            {/* MODAL FOOTER */}
            <div className="bg-gray-100 p-3 border-t-4 border-black text-right">
              <button
                onClick={() => setSelectedDay(null)}
                className="bg-black text-white border-2 border-black px-5 py-2 font-black uppercase text-xs hover:bg-gray-800 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5"
              >
                TUTUP
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}