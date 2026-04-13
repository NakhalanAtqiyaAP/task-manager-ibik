import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function HistoryDashboard({ studentId }) {
  const [stats, setStats] = useState({ completed: 0, overdue: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchRealtimeStats() {
      if (!studentId) return;
      
      try {
        setLoading(true);
        
        // 1. Ambil data dari Riwayat (Tugas yang sudah basi/lewat deadline)
        // Filter berdasarkan bulan ini agar sinkron dengan Leaderboard
        const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

        const { data: historyData } = await supabase
          .from('histories_task')
          .select('status')
          .eq('student_id', studentId)
          .gte('created_at', firstDayOfMonth);

        // 2. Ambil data dari Tugas Aktif yang SUDAH DICENTANG (Real-time)
        const { data: activeDoneData } = await supabase
          .from('student_tasks')
          .select('id')
          .eq('student_id', studentId)
          .eq('is_completed', true);

        if (isMounted) {
          const historyCompleted = historyData?.filter(d => d.status === 'COMPLETED').length || 0;
          const historyOverdue = historyData?.filter(d => d.status === 'OVERDUE').length || 0;
          const activeCompleted = activeDoneData?.length || 0;

          // Gabungkan hasil: (Selesai di history + Selesai di daftar aktif)
          const totalCompleted = historyCompleted + activeCompleted;
          
          setStats({ 
            completed: totalCompleted, 
            overdue: historyOverdue, 
            total: totalCompleted + historyOverdue 
          });
        }
      } catch (error) {
        console.error("Gagal mengambil statistik:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchRealtimeStats();

    // Listener sederhana: Jika ada perubahan di student_tasks, update stats
    const subscription = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'student_tasks', filter: `student_id=eq.${studentId}` }, 
        () => fetchRealtimeStats()
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(subscription);
    };
  }, [studentId]);

  if (loading) return <div className="animate-pulse bg-white h-32 border-4 border-black mb-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center font-black uppercase">Memuat Statistik...</div>;

  const completedPct = stats.total === 0 ? 0 : Math.round((stats.completed / stats.total) * 100);
  const overduePct = stats.total === 0 ? 0 : Math.round((stats.overdue / stats.total) * 100);

  return (
    <div id="history" className="animate-spawn scroll-reveal mb-8 border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-6">
      <div className="flex justify-between items-center border-b-4 border-black pb-2 mb-4">
        <h3 className="font-black text-lg uppercase">STATISTIK PERFORMA BULAN INI</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6 text-center">
        <div className="bg-green-400 border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-4xl font-black">{stats.completed}</div>
          <div className="text-xs font-bold uppercase mt-1">Total Selesai</div>
        </div>
        <div className="bg-red-500 text-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-4xl font-black">{stats.overdue}</div>
          <div className="text-xs font-bold uppercase mt-1">Total Terlewat</div>
        </div>
      </div>

      {/* BAR CHART */}
      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <div className="text-xs font-black uppercase text-gray-500">Rasio Keberhasilan ({stats.total} Tugas Terdeteksi)</div>
          <div className="text-xs font-black text-green-600 uppercase">{completedPct}% Success</div>
        </div>
        <div className="flex h-10 border-4 border-black w-full bg-gray-200 overflow-hidden relative">
          {stats.total === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-[10px] font-black italic">TIDAK ADA AKTIVITAS BULAN INI</div>
          ) : (
            <>
              <div 
                className="bg-green-400 h-full flex items-center justify-center font-black text-xs border-r-4 border-black transition-all duration-1000 ease-out"
                style={{ width: `${completedPct}%` }}
              >
                {completedPct > 5 && 'WIN'}
              </div>
              <div 
                className="bg-red-500 h-full flex items-center justify-center font-black text-xs text-white transition-all duration-1000 ease-out"
                style={{ width: `${overduePct}%` }}
              >
                {overduePct > 5 && 'FAIL'}
              </div>
            </>
          )}
        </div>
        <p className="text-[9px] font-bold text-gray-400 italic mt-2 uppercase">
          *Statistik mencakup tugas yang sudah selesai (aktif) dan riwayat bulan ini.
        </p>
      </div>
    </div>
  );
}