import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Edit2, Plus, Trash2, Calendar, Filter, Clock, MapPin, UserCheck, RefreshCw } from 'lucide-react';

const getCurrentSemester = (startYear = 2025) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const yearDiff = currentYear - startYear;
  return currentMonth >= 8 ? (yearDiff * 2 + 1) : (yearDiff * 2);
};

const customDayOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

export default function JadwalKelas({ userRole }) {
  const defaultSemester = getCurrentSemester(2025);
  
  const [schedules, setSchedules] = useState([]);
  const [mataKuliahList, setMataKuliahList] = useState([]);
  const [formData, setFormData] = useState({
    hari: 'Senin', mata_kuliah: '', ruangan: '', dosen: '', 
    jam_mulai: '', jam_selesai: '', status: 'Offline', semester: defaultSemester
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [activeSemester, setActiveSemester] = useState(String(defaultSemester));

  const daysName = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const todayName = daysName[new Date().getDay()];

  useEffect(() => {
    fetchMataKuliahBySemester(formData.semester);
  }, [formData.semester]);

  useEffect(() => {
    fetchSchedules();
  }, [activeSemester]);

  async function fetchMataKuliahBySemester(targetSemester) {
    let query = supabase
      .from('courses')
      .select('semester, mata_kuliah:matkul_id (id, kode_matkul, nama_matkul)');

    if (targetSemester && targetSemester !== 'Semua') {
      query = query.eq('semester', Number(targetSemester));
    }

    const { data, error } = await query;
    if (error) console.error("Error fetching mata kuliah per semester:", error);
    
    const courses = (data || []).map(course => course.mata_kuliah).filter(Boolean);
    const uniqueCourses = Array.from(
      new Map(courses.map(course => [course.id, course])).values()
    ).sort((a, b) => a.nama_matkul.localeCompare(b.nama_matkul));
    
    setMataKuliahList(uniqueCourses);
  }

  async function fetchSchedules() {
    setLoading(true);
    let query = supabase.from('jadwal_kuliah').select('*').order('jam_mulai', { ascending: true });

    if (activeSemester !== 'Semua') {
      query = query.eq('semester', Number(activeSemester));
    }

    const { data, error } = await query;
    if (error) console.error("Error fetching jadwal:", error);
    
    // Urutkan jadwal berdasarkan jam mulai
    const sortedData = (data || []).sort((a, b) => a.jam_mulai.localeCompare(b.jam_mulai));

    setSchedules(sortedData);
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (isEditing) {
      const { error } = await supabase.from('jadwal_kuliah').update(formData).eq('id', formData.id);
      if (error) console.error("Error updating:", error);
    } else {
      const { error } = await supabase.from('jadwal_kuliah').insert([formData]);
      if (error) console.error("Error inserting:", error);
    }
    resetForm();
    fetchSchedules();
  }

  const resetForm = () => {
    setFormData({ 
      hari: 'Senin', mata_kuliah: '', ruangan: '', dosen: '', 
      jam_mulai: '', jam_selesai: '', status: 'Offline', semester: Number(activeSemester) || defaultSemester 
    });
    setIsEditing(false);
  };

  const handleEdit = (s) => {
    setFormData({
      ...s,
      jam_mulai: s.jam_mulai?.slice(0, 5) || '',
      jam_selesai: s.jam_selesai?.slice(0, 5) || ''
    });
    setIsEditing(true);
  };

  const openTimePicker = (event) => {
    event.currentTarget.showPicker?.();
  };

  const filteredSchedules = activeFilter === 'Semua' 
    ? schedules 
    : schedules.filter(s => s.hari.toLowerCase() === activeFilter.toLowerCase());

  // Pengelompokan Jadwal Berdasarkan Hari
  const groupedSchedules = filteredSchedules.reduce((acc, item) => {
    const hari = item.hari;
    if (!acc[hari]) acc[hari] = [];
    acc[hari].push(item);
    return acc;
  }, {});

  // Urutkan Hari Berdasarkan customDayOrder
  const sortedDaysInGroup = Object.keys(groupedSchedules).sort((a, b) => {
    const indexA = customDayOrder.findIndex(d => d.toLowerCase() === a.toLowerCase());
    const indexB = customDayOrder.findIndex(d => d.toLowerCase() === b.toLowerCase());
    return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
  });

  const inputStyles = "w-full bg-white border-2 border-black text-black px-3 py-2 text-xs sm:text-sm font-black uppercase focus:outline-none focus:bg-yellow-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]";
  const days = ['Semua', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Online':
        return 'bg-blue-400 text-black';
      case 'Offline':
        return 'bg-green-400 text-black';
      case 'Pindah Jam':
        return 'bg-yellow-400 text-black';
      case 'Dibatalkan':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-300 text-black';
    }
  };

  return (
    <div className="px-3 sm:px-6 pb-24 mt-6 sm:mt-8">
      <div id="jadwal" className="scroll-reveal border-3 sm:border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] relative z-10">
        
        {/* HEADER */}
        <div className="bg-black text-white p-4 md:p-6 font-black uppercase">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-gray-800 pb-4 mb-3 gap-3">
            <span className="text-xl md:text-2xl tracking-tight flex items-center gap-2.5">
              <Calendar size={28} strokeWidth={2.5} className="shrink-0 text-yellow-400" />
              Jadwal Perkuliahan {activeSemester !== 'Semua' && `— Semester ${activeSemester}`}
            </span>
            <button 
              onClick={fetchSchedules}
              disabled={loading}
              className="w-full sm:w-auto text-xs font-black border-2 border-green-400 px-4 py-2 text-green-400 hover:bg-green-400 hover:text-black transition-all shadow-[2px_2px_0px_0px_rgba(74,222,128,0.5)] active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-2"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              {loading ? 'REFRESHING...' : 'REFRESH'}
            </button>
          </div>
          <p className="text-[10px] sm:text-xs text-gray-400 tracking-wider font-mono">
            SISTEM INFORMASI TI-25-KA. {userRole === 'admin' ? '🔑 MODE ADMIN AKTIF: ANDA DAPAT KELOLA JADWAL.' : '📌 MODE MAHASISWA'}
          </p>
        </div>

        {/* FORM INPUT ADMIN */}
        {userRole === 'admin' && (
          <div className="bg-purple-100 border-b-4 border-black p-4 md:p-6">
            <div className="flex items-center justify-between mb-4 border-b-2 border-black pb-2">
              <h3 className="text-black text-sm sm:text-base font-black uppercase flex items-center gap-2">
                {isEditing ? <Edit2 size={18} strokeWidth={3} /> : <Plus size={18} strokeWidth={3} />}
                {isEditing ? 'EDIT JADWAL MATAKULIAH' : 'TAMBAH JADWAL BARU'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase mb-1">Hari:</label>
                  <select 
                    className={inputStyles}
                    value={formData.hari}
                    onChange={(e) => setFormData({...formData, hari: e.target.value})}
                    required
                  >
                    {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase mb-1">Semester:</label>
                  <select 
                    className={inputStyles}
                    value={formData.semester}
                    onChange={(e) => setFormData({...formData, semester: Number(e.target.value), mata_kuliah: ''})}
                    required
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                      <option key={sem} value={sem}>SEMESTER {sem}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-black uppercase mb-1">Mata Kuliah:</label>
                  <select
                    className={inputStyles}
                    value={formData.mata_kuliah}
                    onChange={(e) => setFormData({...formData, mata_kuliah: e.target.value})}
                    required
                  >
                    <option value="">-- PILIH MATKUL (SEM {formData.semester}) --</option>
                    {mataKuliahList.map(mk => (
                      <option key={mk.id} value={mk.nama_matkul}>
                        {mk.nama_matkul} ({mk.kode_matkul})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase mb-1">Ruangan / Platform:</label>
                  <input 
                    placeholder="Contoh: R.301 / Zoom" 
                    className={inputStyles}
                    value={formData.ruangan || ''}
                    onChange={(e) => setFormData({...formData, ruangan: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-black uppercase mb-1">Dosen Pengampu:</label>
                  <input 
                    placeholder="Nama Dosen" 
                    className={inputStyles}
                    value={formData.dosen || ''}
                    onChange={(e) => setFormData({...formData, dosen: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-black uppercase mb-1">Jam Mulai:</label>
                  <input 
                    type="time"
                    className={`${inputStyles} cursor-pointer`}
                    value={formData.jam_mulai}
                    onClick={openTimePicker}
                    onChange={(e) => setFormData({...formData, jam_mulai: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-black uppercase mb-1">Jam Selesai:</label>
                  <input 
                    type="time"
                    className={`${inputStyles} cursor-pointer`}
                    value={formData.jam_selesai}
                    onClick={openTimePicker}
                    onChange={(e) => setFormData({...formData, jam_selesai: e.target.value})}
                    required
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-4">
                  <label className="block text-[10px] font-black uppercase mb-1">Status Kehadiran:</label>
                  <select 
                    className={inputStyles}
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="Offline">🏫 OFFLINE</option>
                    <option value="Online">💻 ONLINE</option>
                    <option value="Pindah Jam">⏳ PINDAH JAM</option>
                    <option value="Dibatalkan">❌ DIBATALKAN</option>
                  </select>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 justify-end pt-2">
                <button 
                  type="submit" 
                  className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 border-2 border-black text-white px-6 py-2.5 font-black uppercase text-xs shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-0.5 active:translate-x-0.5 transition-all flex items-center justify-center gap-2"
                >
                  {isEditing ? <Edit2 size={16} strokeWidth={3} /> : <Plus size={16} strokeWidth={3} />} 
                  {isEditing ? 'UPDATE JADWAL' : 'SIMPAN JADWAL'}
                </button>
                {isEditing && (
                  <button 
                    type="button"
                    onClick={resetForm}
                    className="w-full sm:w-auto bg-gray-600 hover:bg-gray-700 border-2 border-black text-white px-6 py-2.5 font-black uppercase text-xs shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-0.5 active:translate-x-0.5 transition-all"
                  >
                    BATAL
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* FILTER & CONTROL PANEL */}
        <div className="bg-yellow-200 border-b-4 border-black p-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* HARI FILTER */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Filter size={16} strokeWidth={3} />
                <span className="text-xs font-black uppercase">Filter Hari:</span>
              </div>

              {/* TAMPILAN DROPDOWN OPTION SAAT DI MOBILE (UKURAN KECIL) */}
              <div className="block sm:hidden">
                <select
                  value={activeFilter}
                  onChange={(e) => setActiveFilter(e.target.value)}
                  className="w-full bg-white border-2 border-black p-2 font-black text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
                >
                  {days.map((day) => {
                    const isToday = day.toLowerCase() === todayName.toLowerCase();
                    return (
                      <option key={day} value={day}>
                        {day.toUpperCase()} {isToday ? '• (HARI INI)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* TAMPILAN BUTTON TABS SAAT DI SCREEN SEDANG/BESAR */}
              <div className="hidden sm:flex flex-wrap gap-1.5">
                {days.map((day) => {
                  const isToday = day.toLowerCase() === todayName.toLowerCase();
                  return (
                    <button
                      key={day}
                      onClick={() => setActiveFilter(day)}
                      className={`px-3 py-1.5 font-black uppercase text-xs border-2 border-black transition-all relative ${
                        activeFilter === day
                          ? 'bg-black text-white translate-y-0.5 translate-x-0.5 shadow-none'
                          : 'bg-white hover:bg-yellow-300 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                      }`}
                    >
                      {day} {isToday && <span className="text-[9px] text-green-400 font-bold ml-1">• HARI INI</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SEMESTER FILTER */}
            <div className="flex items-center gap-2 shrink-0 bg-white border-2 border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <label className="font-black text-xs uppercase shrink-0">Semester:</label>
              <select
                value={activeSemester}
                onChange={(e) => setActiveSemester(e.target.value)}
                className="font-black text-xs uppercase bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="Semua">SEMUA SEMESTER</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <option key={sem} value={sem}>
                    SEMESTER {sem} {sem === defaultSemester ? '(AKTIF)' : ''}
                  </option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* DAFTAR JADWAL KELAS (GATHERED PER DAY GROUP) */}
        <div className="divide-y-4 divide-black bg-gray-100">
          {sortedDaysInGroup.length > 0 ? (
            sortedDaysInGroup.map((hari) => {
              const isToday = hari.toLowerCase() === todayName.toLowerCase();
              const items = groupedSchedules[hari];

              return (
                <div key={hari} className="bg-white">
                  {/* BAR HEADER HARI */}
                  <div className={`px-4 sm:px-6 py-3 border-b-3 border-black flex items-center justify-between ${
                    isToday ? 'bg-yellow-400' : 'bg-black text-white'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className={`font-black text-sm sm:text-base uppercase ${isToday ? 'text-black' : 'text-white'}`}>
                        📌 {hari.toUpperCase()}
                      </span>
                      {isToday && (
                        <span className="bg-black text-yellow-400 text-[10px] font-black px-2 py-0.5 border border-black uppercase">
                          HARI INI
                        </span>
                      )}
                    </div>
                    <span className={`text-xs font-black uppercase ${isToday ? 'text-black' : 'text-gray-300'}`}>
                      {items.length} MATAKULIAH
                    </span>
                  </div>

                  {/* LIST MATAKULIAH DALAM HARI INI */}
                  <div className="divide-y-2 divide-gray-200">
                    {items.map((s) => (
                      <div 
                        key={s.id}
                        className={`p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:bg-blue-50 ${
                          s.status === 'Dibatalkan' ? 'bg-red-50/70' : ''
                        }`}
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="bg-purple-200 border border-black px-2 py-0.5 text-[10px] font-black uppercase shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                              SEM {s.semester || 1}
                            </span>
                            <span className={`px-2 py-0.5 border border-black font-black text-[10px] uppercase shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${getStatusBadge(s.status)}`}>
                              {s.status?.toUpperCase() || 'OFFLINE'}
                            </span>
                          </div>

                          <h4 className="font-black uppercase text-base sm:text-lg text-black leading-snug">
                            {s.mata_kuliah}
                          </h4>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-bold text-gray-700 pt-0.5">
                            <span className="flex items-center gap-1">
                              <UserCheck size={14} className="text-black shrink-0" />
                              {s.dosen ? s.dosen : '—'}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin size={14} className="text-black shrink-0" />
                              {s.ruangan ? s.ruangan : '—'}
                            </span>
                          </div>
                        </div>

                        {/* JAM & ACTION */}
                        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t border-dashed border-gray-300 md:border-none">
                          <div className="flex items-center gap-1.5 bg-yellow-300 border-2 border-black px-3 py-1.5 font-black text-xs sm:text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <Clock size={15} strokeWidth={2.5} />
                            <span>{s.jam_mulai} - {s.jam_selesai} WIB</span>
                          </div>

                          {userRole === 'admin' && (
                            <div className="flex gap-1.5">
                              <button 
                                onClick={() => handleEdit(s)} 
                                title="Edit Jadwal"
                                className="bg-blue-400 hover:bg-blue-500 p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                              >
                                <Edit2 size={15} className="text-black" strokeWidth={2.5} />
                              </button>
                              <button 
                                onClick={async () => {
                                  if (confirm(`Hapus jadwal ${s.mata_kuliah}?`)) {
                                    const { error } = await supabase.from('jadwal_kuliah').delete().eq('id', s.id);
                                    if (!error) fetchSchedules();
                                  }
                                }} 
                                title="Hapus Jadwal"
                                className="bg-red-500 hover:bg-red-600 p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                              >
                                <Trash2 size={15} className="text-white" strokeWidth={2.5} />
                              </button>
                            </div>
                          )}
                        </div>

                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center font-black text-gray-500 uppercase italic bg-white">
              {activeFilter === 'Semua' 
                ? 'BELUM ADA JADWAL UNTUK SEMESTER INI' 
                : `TIDAK ADA JADWAL PERKULIAHAN DI HARI ${activeFilter.toUpperCase()}`}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="bg-black text-white p-3 sm:p-4 border-t-4 border-black flex justify-between items-center text-xs font-black uppercase">
          <span>TOTAL: {filteredSchedules.length} JADWAL</span>
          <span className="text-gray-400 font-mono text-[10px]">TI-25-KA SQUAD</span>
        </div>

      </div>
    </div>
  );
}