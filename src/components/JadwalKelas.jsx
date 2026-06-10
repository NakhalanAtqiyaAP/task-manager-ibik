import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Edit2, Plus, Trash2, Calendar, Filter } from 'lucide-react';

export default function JadwalKelas({ userRole }) {
  const [schedules, setSchedules] = useState([]);
  const [mataKuliahList, setMataKuliahList] = useState([]);
  const [formData, setFormData] = useState({
    hari: 'Senin', mata_kuliah: '', ruangan: '', dosen: '', 
    jam_mulai: '', jam_selesai: '', status: 'Normal'
  });
  const [isEditing, setIsEditing] = useState(false);
  
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [activeSemester, setActiveSemester] = useState('Semua');

  useEffect(() => {
    fetchSchedules();
    fetchMataKuliah();
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [activeSemester]);

  async function fetchMataKuliah() {
    const { data, error } = await supabase
      .from('mata_kuliah')
      .select('id, kode_matkul, nama_matkul')
      .order('nama_matkul', { ascending: true });
    if (error) console.error("Error fetching mata kuliah:", error);
    setMataKuliahList(data || []);
  }

  async function fetchSchedules() {
    const { data: jadwalData, error: jadwalError } = await supabase.from('jadwal_kuliah').select('*').order('hari');
    if (jadwalError) console.error("Error fetching data:", jadwalError);
    let allSchedules = jadwalData || [];

    if (activeSemester !== 'Semua') {
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('id, semester, mata_kuliah:matkul_id (nama_matkul)')
        .eq('semester', Number(activeSemester));
      if (courseError) console.error('Error fetching courses for semester filter:', courseError);
      const names = new Set((courseData || []).map(c => (c.mata_kuliah?.nama_matkul || '').trim()));
      allSchedules = allSchedules.filter(s => names.has((s.mata_kuliah || '').trim()));
    }

    setSchedules(allSchedules);
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
    setFormData({ hari: 'Senin', mata_kuliah: '', ruangan: '', dosen: '', jam_mulai: '', jam_selesai: '', status: 'Normal' });
    setIsEditing(false);
    fetchSchedules();
  }

  const handleCancel = () => {
    setFormData({ hari: 'Senin', mata_kuliah: '', ruangan: '', dosen: '', jam_mulai: '', jam_selesai: '', status: 'Normal' });
    setIsEditing(false);
  };

  const handleEdit = (s) => {
    setFormData(s);
    setIsEditing(true);
  };
  const filteredSchedules = activeFilter === 'Semua' 
    ? schedules 
    : schedules.filter(s => s.hari === activeFilter);

  const inputStyles = "w-full bg-white border-2 border-gray-600 text-black px-3 py-2 text-sm font-bold uppercase focus:outline-none focus:border-black focus:ring-0";
  const days = ['Semua', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  return (
    <div className="px-4 sm:px-6 pb-24 mt-8">
      <div id="jadwal" className="scroll-reveal border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative z-10">
        <div className="bg-black text-white p-4 md:p-5 font-black uppercase">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-gray-700 pb-4 mb-4 gap-3 sm:gap-0">
            <span className="text-lg md:text-xl tracking-tight flex items-center gap-2">
              <Calendar size={24} strokeWidth={3} className="shrink-0" />
              Jadwal Perkuliahan
            </span>
            <button 
              onClick={fetchSchedules}
              className="w-full sm:w-auto text-xs border-2 border-green-400 px-4 py-2 sm:py-1 text-green-400 hover:bg-green-400 hover:text-black transition-colors text-center"
            >
              REFRESH
            </button>
          </div>
          <div className="text-[10px] text-gray-400 tracking-widest leading-relaxed">
            JADWAL PERKULIAHAN UNTUK SEMESTER INI. {userRole === 'admin' && 'ANDA DAPAT MENAMBAH, MENGUBAH, ATAU MENGHAPUS JADWAL.'}
          </div>
        </div>

        {/* FORM INPUT - HANYA UNTUK ADMIN */}
        {userRole === 'admin' && (
          <div className="bg-black border-b-4 border-black p-4 md:p-5">
            <h3 className="text-white text-sm font-black uppercase mb-4 border-b-2 border-gray-700 pb-2">
              {isEditing ? '✏️ EDIT JADWAL' : '➕ TAMBAH JADWAL BARU'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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

                <select
                  className={inputStyles}
                  value={formData.mata_kuliah}
                  onChange={(e) => setFormData({...formData, mata_kuliah: e.target.value})}
                  required
                >
                  <option value="">-- PILIH MATA KULIAH --</option>
                  {mataKuliahList.map(mk => (
                    <option key={mk.id} value={mk.nama_matkul}>
                      {mk.nama_matkul} ({mk.kode_matkul})
                    </option>
                  ))}
                </select>
                
                <input 
                  placeholder="Ruangan" 
                  className={inputStyles}
                  value={formData.ruangan}
                  onChange={(e) => setFormData({...formData, ruangan: e.target.value})}
                />
                
                <input 
                  placeholder="Dosen Pengampu" 
                  className={inputStyles}
                  value={formData.dosen}
                  onChange={(e) => setFormData({...formData, dosen: e.target.value})}
                />
                
                <input 
                  type="time"
                  className={inputStyles}
                  value={formData.jam_mulai}
                  onChange={(e) => setFormData({...formData, jam_mulai: e.target.value})}
                  required
                />
                
                <input 
                  type="time"
                  className={inputStyles}
                  value={formData.jam_selesai}
                  onChange={(e) => setFormData({...formData, jam_selesai: e.target.value})}
                  required
                />
                
                <select 
                  className={inputStyles}
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="Normal">NORMAL</option>
                  <option value="Pindah Jam">PINDAH Jam</option>
                  <option value="Dibatalkan">DIBATALKAN</option>
                </select>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 justify-end mt-4">
                <button 
                  type="submit" 
                  className="w-full sm:w-auto justify-center bg-purple-600 hover:bg-purple-700 border-2 border-black text-white px-6 py-3 sm:py-2 font-black uppercase text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-0.5 active:translate-x-0.5 transition-all flex items-center gap-2"
                >
                  {isEditing ? <Edit2 size={16} strokeWidth={3} /> : <Plus size={16} strokeWidth={3} />} 
                  {isEditing ? 'UPDATE' : 'TAMBAH'}
                </button>
                {isEditing && (
                  <button 
                    type="button"
                    onClick={handleCancel}
                    className="w-full sm:w-auto justify-center bg-gray-600 hover:bg-gray-700 border-2 border-black text-white px-6 py-3 sm:py-2 font-black uppercase text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-0.5 active:translate-x-0.5 transition-all"
                  >
                    BATAL
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
        <div className="bg-gray-100 border-b-4 border-black p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Filter size={16} strokeWidth={3} />
                <span className="text-sm font-black uppercase">Filter Hari:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {days.map((day) => (
                  <button
                    key={day}
                    onClick={() => setActiveFilter(day)}
                    className={`px-4 py-2 font-black uppercase text-xs sm:text-sm border-2 border-black transition-all ${
                      activeFilter === day
                        ? 'bg-yellow-400 translate-y-0.5 translate-x-0.5 shadow-none'
                        : 'bg-white hover:bg-gray-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="font-black text-xs uppercase">Semester</label>
              <select
                value={activeSemester}
                onChange={(e) => setActiveSemester(e.target.value)}
                className="border-2 border-black p-2 font-black text-sm bg-white"
              >
                <option value="Semua">SEMUA</option>
                {[1,2,3,4,5,6,7,8].map((sem) => (
                  <option key={sem} value={sem}>SEMESTER {sem}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="divide-y-4 divide-black">
          {filteredSchedules.length > 0 ? (
            filteredSchedules.map((s) => (
              <div 
                key={s.id}
                className={`group flex flex-col md:flex-row items-stretch transition-all duration-300 ease-out ${s.status === 'Dibatalkan' ? 'bg-red-50/50 hover:bg-red-50 hover:shadow-[inset_8px_0px_0px_0px_rgba(239,68,68,1)]' : 'bg-white hover:bg-blue-50 hover:shadow-[inset_8px_0px_0px_0px_rgba(147,51,234,1)]'}`}
              >
                <div className="p-3 md:p-4 border-b-4 md:border-b-0 md:border-r-4 border-black shrink-0 flex items-center justify-center bg-gray-50 md:bg-transparent">
                  <div className="bg-blue-400 border-2 border-black px-4 py-1 md:p-2 text-center font-black text-sm text-white w-auto md:w-16">
                    {s.hari.substring(0, 3).toUpperCase()}
                  </div>
                </div>

                {/* Konten Utama Jadwal */}
                <div className="p-4 flex-1 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-transform duration-300 group-hover:translate-x-1">
                  
                  {/* Info Mata Kuliah */}
                  <div className="flex-1">
                    <h4 className="font-black uppercase text-base sm:text-lg text-black leading-tight mb-1">{s.mata_kuliah}</h4>
                    <p className="text-sm font-bold text-gray-700">{s.dosen ? `Dosen: ${s.dosen}` : '—'}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{s.ruangan ? `Ruangan: ${s.ruangan}` : '—'}</p>
                  </div>
                  
                  {/* Waktu, Status, dan Tombol Aksi */}
                  <div className="flex flex-wrap lg:flex-nowrap items-end lg:items-center gap-3 shrink-0">
                    
                    {/* Waktu */}
                    <div className="text-left lg:text-center">
                      <span className="text-[10px] font-black uppercase text-gray-400 block mb-1">Waktu</span>
                      <div className="bg-yellow-300 border-2 border-black px-3 py-1.5 font-black text-xs sm:text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] whitespace-nowrap">
                        {s.jam_mulai} - {s.jam_selesai}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="text-left lg:text-center lg:mt-0">
                      <span className="text-[10px] font-black uppercase text-gray-400 block mb-1 lg:hidden">Status</span>
                      <span className={`px-3 py-1.5 border-2 border-black font-black text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] block whitespace-nowrap ${s.status === 'Normal' ? 'bg-green-400' : s.status === 'Pindah Jam' ? 'bg-yellow-400' : 'bg-red-400'}`}>
                        {s.status.toUpperCase()}
                      </span>
                    </div>

                    {/* Tombol Admin */}
                    {userRole === 'admin' && (
                      <div className="flex gap-2 w-full sm:w-auto justify-end mt-2 lg:mt-0 border-t-2 border-dashed border-gray-300 lg:border-none pt-3 lg:pt-0">
                        <button 
                          onClick={() => handleEdit(s)} 
                          className="bg-blue-500 hover:bg-blue-600 p-2.5 lg:p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-0.5 active:translate-x-0.5 transition-all flex-1 sm:flex-none flex justify-center"
                        >
                          <Edit2 size={16} className="text-white" strokeWidth={3} />
                        </button>
                        <button 
                          onClick={async () => {
                            if (confirm('Hapus jadwal ini?')) {
                              const { error } = await supabase.from('jadwal_kuliah').delete().eq('id', s.id);
                              if (!error) fetchSchedules();
                            }
                          }} 
                          className="bg-red-500 hover:bg-red-600 p-2.5 lg:p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-0.5 active:translate-x-0.5 transition-all flex-1 sm:flex-none flex justify-center"
                        >
                          <Trash2 size={16} className="text-white" strokeWidth={3} />
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center font-black text-gray-400 uppercase italic">
              {activeFilter === 'Semua' ? 'TIDAK ADA JADWAL' : `TIDAK ADA JADWAL UNTUK HARI ${activeFilter.toUpperCase()}`}
            </div>
          )}
        </div>

        {/* FOOTER*/}
        <div className="bg-gray-100 p-4 border-t-4 border-black flex justify-between items-center gap-4">
          <span className="text-xs font-black uppercase">Total: {filteredSchedules.length} Jadwal</span>
        </div>
      </div>
    </div>
  );
}