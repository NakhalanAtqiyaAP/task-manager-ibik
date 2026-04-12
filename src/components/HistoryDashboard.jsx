import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function HistoryDashboard({ studentId }) {
  const [stats, setStats] = useState({ completed: 0, overdue: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchHistories() {
      if (!studentId) return;
      
      const { data, error } = await supabase
        .from('histories_task')
        .select('status')
        .eq('student_id', studentId);

      if (isMounted && !error && data) {
        const completed = data.filter(d => d.status === 'COMPLETED').length;
        const overdue = data.filter(d => d.status === 'OVERDUE').length;
        setStats({ completed, overdue, total: data.length });
      }
      if (isMounted) setLoading(false);
    }

    fetchHistories();

    return () => {
      isMounted = false;
    };
  }, [studentId]);

  if (loading) return <div className="animate-pulse bg-gray-200 h-24 border-4 border-black mb-6"></div>;

  const completedPct = stats.total === 0 ? 0 : Math.round((stats.completed / stats.total) * 100);
  const overduePct = stats.total === 0 ? 0 : Math.round((stats.overdue / stats.total) * 100);

  return (
    <div id="history" className="mb-8 border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-6">
      <h3 className="font-black text-lg uppercase border-b-4 border-black pb-2 mb-4">STATISTIK RIWAYAT TUGAS</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-6 text-center">
        <div className="bg-green-400 border-4 border-black p-4">
          <div className="text-4xl font-black">{stats.completed}</div>
          <div className="text-xs font-bold uppercase mt-1">Selesai (On-Time)</div>
        </div>
        <div className="bg-red-500 text-white border-4 border-black p-4">
          <div className="text-4xl font-black">{stats.overdue}</div>
          <div className="text-xs font-bold uppercase mt-1">Terlewat (Overdue)</div>
        </div>
      </div>

      {/* SIMPLE BAR CHART */}
      <div className="space-y-2">
        <div className="text-xs font-black uppercase text-gray-500">Rasio Penyelesaian ({stats.total} Total)</div>
        <div className="flex h-8 border-4 border-black w-full bg-gray-200 overflow-hidden relative">
          {stats.total === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-[10px] font-black italic">BELUM ADA DATA</div>
          ) : (
            <>
              <div 
                className="bg-green-400 h-full flex items-center justify-start px-2 font-black text-xs border-r-4 border-black transition-all duration-1000"
                style={{ width: `${completedPct}%` }}
              >
                {completedPct > 10 && `${completedPct}%`}
              </div>
              <div 
                className="bg-red-500 h-full flex items-center justify-end px-2 font-black text-xs text-white transition-all duration-1000"
                style={{ width: `${overduePct}%` }}
              >
                {overduePct > 10 && `${overduePct}%`}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}