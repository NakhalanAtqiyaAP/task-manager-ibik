import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Edit2, Plus, Trash2, Calendar as CalendarIcon, Filter, Clock, MapPin, UserCheck, RefreshCw, BookOpen, AlertTriangle } from 'lucide-react';

const getCurrentSemester = (startYear = 2025) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const yearDiff = currentYear - startYear;
  return currentMonth >= 8 ? (yearDiff * 2 + 1) : (yearDiff * 2);
};

const customDayOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const daysName = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export default function JadwalKelas({ userRole }) {
  const defaultSemester = getCurrentSemester(2025);
  
  const [schedules, setSchedules] = useState([]);
  const [mataKuliahList, setMataKuliahList] = useState([]);
  
  // Tipe Jadwal View (Tab Aktif)
  const [viewMode, setViewMode] = useState('Reguler'); // 'Reguler', 'UTS', 'UAS'

  const [formData, setFormData] = useState({
    hari: 'Senin', mata_kuliah: '', ruangan: '', dosen: '', 
    jam_mulai: '', jam_selesai: '', status: 'Offline', semester: defaultSemester,
    tipe_jadwal: 'Reguler', tanggal_ujian: '', sistem_ujian: 'Closed Book'
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [activeSemester, setActiveSemester] = useState(String(defaultSemester));

  const todayName = daysName[new Date().getDay()];

  useEffect(() => {
    fetchMataKuliahBySemester(formData.semester);
  }, [formData.semester]);

  useEffect(() => {
    fetchSchedules();
  }, [activeSemester, viewMode]);

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
    let query = supabase.from('jadwal_kuliah')
      .select('*')
      .eq('tipe_jadwal', viewMode)
      .order('jam_mulai', { ascending: true });

    if (activeSemester !== 'Semua') {
      query = query.eq('semester', Number(activeSemester));
    }

    const { data, error } = await query;
    if (error) console.error("Error fetching jadwal:", error);
    
    const sortedData = (data || []).sort((a, b) => a.jam_mulai.localeCompare(b.jam_mulai));
    setSchedules(sortedData);
    setLoading(false);
  }

  // Set Hari otomatis berdasarkan Tanggal (Menggunakan Native JS Parsing)
  const handleDateChange = (dateString) => {
    if (dateString) {
      // Memisahkan YYYY-MM-DD agar waktu tidak bergeser gara-gara zona waktu (UTC)
      const [year, month, day] = dateString.split('-');
      const dateObj = new Date(year, month - 1, day);
      const dayName = daysName[dateObj.getDay()];
      setFormData({ ...formData, tanggal_ujian: dateString, hari: dayName });
    } else {
      setFormData({ ...formData, tanggal_ujian: '' });
    }
  };

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

  // Fitur Reset Semua Jadwal Ujian
  async function handleResetUjian() {
    if (confirm(`⚠️ PERINGATAN: Anda yakin ingin MENGHAPUS SEMUA jadwal ${viewMode} di Semester ${activeSemester}? Aksi ini tidak dapat dibatalkan!`)) {
      setLoading(true);
      const { error } = await supabase
        .from('jadwal_kuliah')
        .delete()
        .eq('tipe_jadwal', viewMode)
        .eq('semester', Number(activeSemester));

      if (error) {
        console.error("Error resetting jadwal:", error);
        alert(`Gagal mereset jadwal ${viewMode}.`);
      } else {
        alert(`Semua jadwal ${viewMode} semester ${activeSemester} berhasil direset.`);
        fetchSchedules();
      }
      setLoading(false);
    }
  }

  const resetForm = () => {
    setFormData({ 
      hari: 'Senin', mata_kuliah: '', ruangan: '', dosen: '', 
      jam_mulai: '', jam_selesai: '', status: 'Offline', semester: Number(activeSemester) || defaultSemester,
      tipe_jadwal: viewMode, tanggal_ujian: '', sistem_ujian: 'Closed Book'
    });
    setIsEditing(false);
  };

  const handleEdit = (s) => {
    setFormData({
      ...s,
      jam_mulai: s.jam_mulai?.slice(0, 5) || '',
      jam_selesai: s.jam_selesai?.slice(0, 5) || '',
      tipe_jadwal: s.tipe_jadwal || 'Reguler',
      sistem_ujian: s.sistem_ujian || 'Closed Book'
    });
    setIsEditing(true);
  };

  const openTimePicker = (event) => {
    event.currentTarget.showPicker?.();
  };

  // Switch tab otomatis mengubah state form agar sesuai
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    setFormData(prev => ({ ...prev, tipe_jadwal: mode }));
  };

  const filteredSchedules = activeFilter === 'Semua' 
    ? schedules 
    : schedules.filter(s => s.hari.toLowerCase() === activeFilter.toLowerCase());

  // Pengelompokan Jadwal Berdasarkan Hari atau Tanggal
  const groupedSchedules = filteredSchedules.reduce((acc, item) => {
    // Jika ujian, kelompokkan berdasarkan tanggal, jika reguler berdasarkan hari
    const key = viewMode === 'Reguler' ? item.hari : (item.tanggal_ujian || item.hari);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const sortedGroupKeys = Object.keys(groupedSchedules).sort((a, b) => {
    if (viewMode === 'Reguler') {
      const indexA = customDayOrder.findIndex(d => d.toLowerCase() === a.toLowerCase());
      const indexB = customDayOrder.findIndex(d => d.toLowerCase() === b.toLowerCase());
      return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
    } else {
      // Urutkan berdasarkan tanggal aktual
      return new Date(a) - new Date(b);
    }
  });

  const inputStyles = "w-full bg-white border-2 border-black text-black px-3 py-2 text-xs sm:text-sm font-black uppercase focus:outline-none focus:bg-green-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]";
  const days = ['Semua', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Online': return 'bg-blue-400 text-black';
      case 'Offline': return 'bg-green-400 text-black';
      case 'Pindah Jam': return 'bg-yellow-400 text-black';
      case 'Dibatalkan': return 'bg-red-500 text-white';
      default: return 'bg-gray-300 text-black';
    }
  };

  const getSistemUjianBadge = (sistem) => {
    switch (sistem) {
      case 'Open Book': return 'bg-blue-200 border-blue-600 text-blue-800';
      case 'Cheat Sheet': return 'bg-yellow-200 border-yellow-600 text-yellow-800';
      case 'Closed Book': return 'bg-red-200 border-red-600 text-red-800';
      default: return 'bg-gray-200 border-black text-black';
    }
  };

  const formatDateIndo = (dateStr) => {
    if (!dateStr || dateStr === 'Senin' || dateStr === 'Selasa' || dateStr === 'Rabu' || dateStr === 'Kamis' || dateStr === 'Jumat' || dateStr === 'Sabtu' || dateStr === 'Minggu') return dateStr.toUpperCase();
    const d = new Date(dateStr);
    return `${daysName[d.getDay()].toUpperCase()}, ${d.getDate()} ${d.toLocaleString('id-ID', { month: 'short' }).toUpperCase()} ${d.getFullYear()}`;
  };

  return (
    <div className="px-3 sm:px-6 pb-24 mt-6 sm:mt-8">
      
      {/* TABS TIPE JADWAL */}
      <div className="flex flex-wrap gap-2 mb-4 justify-center sm:justify-start">
        {['Reguler', 'UTS', 'UAS'].map((mode) => (
          <button
            key={mode}
            onClick={() => handleViewModeChange(mode)}
            className={`px-6 py-2.5 font-black uppercase text-sm sm:text-base border-4 border-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
              ${viewMode === mode ? 'bg-black text-white translate-x-1 translate-y-1 shadow-none' : 'bg-white hover:bg-yellow-300'}`}
          >
            JADWAL {mode}
          </button>
        ))}
      </div>

      <div id="jadwal" className="scroll-reveal border-3 sm:border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] relative z-10">
        
        {/* HEADER */}
        <div className={`${viewMode === 'Reguler' ? 'bg-black' : (viewMode === 'UTS' ? 'bg-blue-900' : 'bg-red-900')} text-white p-4 md:p-6 font-black uppercase transition-colors duration-300`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-white/20 pb-4 mb-3 gap-3">
            <span className="text-xl md:text-2xl tracking-tight flex items-center gap-2.5">
              <CalendarIcon size={28} strokeWidth={2.5} className="shrink-0 text-yellow-400" />
              Jadwal {viewMode} {activeSemester !== 'Semua' && `— Semester ${activeSemester}`}
            </span>
            <button 
              onClick={fetchSchedules}
              disabled={loading}
              className="w-full sm:w-auto text-xs font-black border-2 border-white px-4 py-2 hover:bg-white hover:text-black transition-all shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-2"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              {loading ? 'REFRESHING...' : 'REFRESH'}
            </button>
          </div>
        </div>

        {/* FORM INPUT ADMIN */}
        {userRole === 'admin' && (
          <div className="bg-gray-100 border-b-4 border-black p-4 md:p-6">
            <div className="flex items-center justify-between mb-4 border-b-2 border-black pb-2">
              <h3 className="text-black text-sm sm:text-base font-black uppercase flex items-center gap-2">
                {isEditing ? <Edit2 size={18} strokeWidth={3} /> : <Plus size={18} strokeWidth={3} />}
                {isEditing ? `EDIT JADWAL ${viewMode}` : `TAMBAH JADWAL ${viewMode}`}
              </h3>
              
              {/* TOMBOL RESET SEMUA UJIAN */}
              {viewMode !== 'Reguler' && schedules.length > 0 && (
                <button 
                  onClick={handleResetUjian}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 text-xs font-black uppercase flex items-center gap-1.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                >
                  <AlertTriangle size={14} /> RESET {viewMode}
                </button>
              )}
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                
                {/* JIKA MODE UJIAN, TAMPILKAN INPUT DATE HTML5 BAWAAN. JIKA REGULER, TAMPILKAN DROPDOWN HARI */}
                {viewMode !== 'Reguler' ? (
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-black uppercase mb-1">Tanggal Ujian:</label>
                    <input 
                      type="date"
                      className={`${inputStyles} cursor-pointer`}
                      value={formData.tanggal_ujian}
                      onChange={(e) => handleDateChange(e.target.value)}
                      required
                    />
                  </div>
                ) : (
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
                )}

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

                <div className={viewMode === 'Reguler' ? "sm:col-span-2" : ""}>
                  <label className="block text-[10px] font-black uppercase mb-1">Mata Kuliah:</label>
                  <select
                    className={inputStyles}
                    value={formData.mata_kuliah}
                    onChange={(e) => setFormData({...formData, mata_kuliah: e.target.value})}
                    required
                  >
                    <option value="">-- PILIH MATKUL --</option>
                    {mataKuliahList.map(mk => (
                      <option key={mk.id} value={mk.nama_matkul}>
                        {mk.nama_matkul} ({mk.kode_matkul})
                      </option>
                    ))}
                  </select>
                </div>

                {viewMode !== 'Reguler' && (
                  <div>
                    <label className="block text-[10px] font-black uppercase mb-1">Sistem Ujian:</label>
                    <select 
                      className={inputStyles}
                      value={formData.sistem_ujian}
                      onChange={(e) => setFormData({...formData, sistem_ujian: e.target.value})}
                    >
                      <option value="Closed Book">CLOSED BOOK (Tutup Buku)</option>
                      <option value="Open Book">OPEN BOOK (Buka Buku)</option>
                      <option value="Cheat Sheet">CHEAT SHEET (Kertas Catatan)</option>
                    </select>
                  </div>
                )}

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
                  <label className="block text-[10px] font-black uppercase mb-1">Dosen Pengawas/Pengampu:</label>
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
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 justify-end pt-2">
                <button 
                  type="submit" 
                  className="w-full sm:w-auto bg-green-500 hover:bg-green-600 border-2 border-black text-black px-6 py-2.5 font-black uppercase text-xs shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-0.5 active:translate-x-0.5 transition-all flex items-center justify-center gap-2"
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

        {/* DAFTAR JADWAL */}
        <div className="divide-y-4 divide-black bg-gray-100">
          {sortedGroupKeys.length > 0 ? (
            sortedGroupKeys.map((keyString) => {
              const items = groupedSchedules[keyString];
              const displayDate = formatDateIndo(keyString);
              // Cek apakah hari ini (Bisa nama hari atau format YYYY-MM-DD yang sama dengan hari ini)
              const todayDateString = new Date().toISOString().split('T')[0];
              const isToday = keyString.toLowerCase() === todayName.toLowerCase() || keyString === todayDateString;

              return (
                <div key={keyString} className="bg-white">
                  {/* BAR HEADER HARI / TANGGAL */}
                  <div className={`px-4 sm:px-6 py-3 border-b-3 border-black flex items-center justify-between ${
                    isToday ? 'bg-green-400' : 'bg-black text-white'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className={`font-black text-sm sm:text-base uppercase ${isToday ? 'text-black' : 'text-white'}`}>
                        {displayDate}
                      </span>
                      {isToday && (
                        <span className="bg-black text-green-400 text-[10px] font-black px-2 py-0.5 border border-black uppercase">
                          HARI INI
                        </span>
                      )}
                    </div>
                    <span className={`text-xs font-black uppercase ${isToday ? 'text-black' : 'text-gray-300'}`}>
                      {items.length} {viewMode === 'Reguler' ? 'MATAKULIAH' : 'UJIAN'}
                    </span>
                  </div>

                  {/* LIST ITEM JADWAL */}
                  <div className="divide-y-2 divide-gray-200">
                    {items.map((s) => (
                      <div 
                        key={s.id}
                        className={`p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:bg-yellow-50`}
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="bg-purple-200 border border-black px-2 py-0.5 text-[10px] font-black uppercase shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                              SEM {s.semester || 1}
                            </span>
                            <span className={`px-2 py-0.5 border border-black font-black text-[10px] uppercase shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${getStatusBadge(s.status)}`}>
                              {s.status?.toUpperCase() || 'OFFLINE'}
                            </span>
                            {/* BAGE KHUSUS UJIAN */}
                            {viewMode !== 'Reguler' && s.sistem_ujian && (
                               <span className={`flex items-center gap-1 border-2 px-2 py-0.5 text-[10px] font-black uppercase shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${getSistemUjianBadge(s.sistem_ujian)}`}>
                                 <BookOpen size={12}/> {s.sistem_ujian}
                               </span>
                            )}
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
              TIDAK ADA JADWAL {viewMode.toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}