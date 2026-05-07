import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Edit2, Plus, Trash2, Calendar } from 'lucide-react';

export default function JadwalKelas({ userRole }) {
  const [schedules, setSchedules] = useState([]);
  const [mataKuliahList, setMataKuliahList] = useState([]); // ← BARU
  const [formData, setFormData] = useState({
    hari: 'Senin', mata_kuliah: '', ruangan: '', dosen: '', 
    jam_mulai: '', jam_selesai: '', status: 'Normal'
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchSchedules();
    fetchMataKuliah(); // ← BARU
  }, []);

  // ← BARU: Fetch semua mata kuliah dari tabel mata_kuliah
  async function fetchMataKuliah() {
    const { data, error } = await supabase
      .from('mata_kuliah')
      .select('id, kode_matkul, nama_matkul')
      .order('nama_matkul', { ascending: true });
    if (error) console.error("Error fetching mata kuliah:", error);
    setMataKuliahList(data || []);
  }

  async function fetchSchedules() {
    const { data, error } = await supabase.from('jadwal_kuliah').select('*').order('hari');
    if (error) console.error("Error fetching data:", error);
    setSchedules(data || []);
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

  const inputStyles = "w-full bg-white border-2 border-gray-600 text-black px-3 py-2 text-sm font-bold uppercase";

  return (
    <div className="px-4 sm:px-6 pb-24 mt-8">
      <div id="jadwal" className="scroll-reveal border-4 border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative z-10">
        {/* HEADER */}
        <div className="bg-black text-white p-5 font-black uppercase">
          <div className="flex justify-between items-center border-b-2 border-gray-700 pb-4 mb-4">
            <span className="text-xl tracking-tight flex items-center gap-2">
              <Calendar size={24} strokeWidth={3} />
              Jadwal Perkuliahan
            </span>
            <button 
              onClick={fetchSchedules}
              className="text-xs border-2 border-green-400 px-3 py-1 text-green-400 hover:bg-green-400 hover:text-black transition-colors"
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
          <div className="bg-black border-b-4 border-black p-5">
            <h3 className="text-white text-sm font-black uppercase mb-4 border-b-2 border-gray-700 pb-2">
              {isEditing ? '✏️ EDIT JADWAL' : '➕ TAMBAH JADWAL BARU'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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

                {/* ← DIUBAH: Dari <input> menjadi <select> mata kuliah */}
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
                  <option value="Pindah Jam">PINDAH JAM</option>
                  <option value="Dibatalkan">DIBATALKAN</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end">
                <button 
                  type="submit" 
                  className="bg-purple-600 hover:bg-purple-700 border-2 border-black text-white px-4 py-2 font-black uppercase text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-0.5 active:translate-x-0.5 transition-all flex items-center gap-1"
                >
                  {isEditing ? <Edit2 size={16} strokeWidth={3} /> : <Plus size={16} strokeWidth={3} />} 
                  {isEditing ? 'UPDATE' : 'TAMBAH'}
                </button>
                {isEditing && (
                  <button 
                    type="button"
                    onClick={handleCancel}
                    className="bg-gray-600 hover:bg-gray-700 border-2 border-black text-white px-4 py-2 font-black uppercase text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-0.5 active:translate-x-0.5 transition-all"
                  >
                    BATAL
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* LIST JADWAL — tidak berubah */}
        <div className="divide-y-4 divide-black">
          {schedules.length > 0 ? (
            schedules.map((s) => (
              <div 
                key={s.id}
                className={`group flex items-center transition-all duration-300 ease-out ${s.status === 'Dibatalkan' ? 'bg-red-50/50 hover:bg-red-50 hover:shadow-[inset_8px_0px_0px_0px_rgba(239,68,68,1)]' : 'bg-white hover:bg-blue-50 hover:shadow-[inset_8px_0px_0px_0px_rgba(147,51,234,1)]'}`}
              >
                <div className="p-4 border-r-4 border-black shrink-0 relative z-10 min-w-20">
                  <div className="bg-blue-400 border-3 border-black p-2 text-center font-black text-sm text-white">
                    {s.hari.substring(0, 3).toUpperCase()}
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-transform duration-300 group-hover:translate-x-1">
                  <div className="flex-1">
                    <h4 className="font-black uppercase text-base sm:text-lg text-black">{s.mata_kuliah}</h4>
                    <p className="text-sm font-bold text-gray-700">{s.dosen ? `Dosen: ${s.dosen}` : '—'}</p>
                    <p className="text-xs text-gray-600 mt-1">{s.ruangan ? `Ruangan: ${s.ruangan}` : '—'}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-center">
                      <span className="text-[10px] font-black uppercase text-gray-400 block">Waktu</span>
                      <div className="bg-yellow-300 border-2 border-black p-2 font-black text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mt-1">
                        {s.jam_mulai} - {s.jam_selesai}
                      </div>
                    </div>
                    <div className="text-center">
                      <span className={`px-3 py-1 border-2 border-black font-black text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] block ${s.status === 'Normal' ? 'bg-green-400' : s.status === 'Pindah Jam' ? 'bg-yellow-400' : 'bg-red-400'}`}>
                        {s.status.toUpperCase()}
                      </span>
                    </div>
                    {userRole === 'admin' && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(s)} 
                          className="bg-blue-500 hover:bg-blue-600 p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-0.5 active:translate-x-0.5 transition-all"
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
                          className="bg-red-500 hover:bg-red-600 p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-0.5 active:translate-x-0.5 transition-all"
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
              BELUM ADA JADWAL KELAS
            </div>
          )}
        </div>

        <div className="bg-gray-100 p-3 border-t-4 border-black flex justify-between items-center gap-4">
          <span className="text-xs font-black uppercase">Total: {schedules.length} Jadwal</span>
        </div>
      </div>
    </div>
  );
}