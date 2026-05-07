import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase'; // Sesuaikan path
import { Edit2, Plus, Trash2, Calendar } from 'lucide-react';

export default function JadwalKelas({ userRole }) {
  const [schedules, setSchedules] = useState([]);
  const [formData, setFormData] = useState({
    hari: 'Senin', mata_kuliah: '', ruangan: '', dosen: '', 
    jam_mulai: '', jam_selesai: '', status: 'Normal'
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchSchedules();
  }, []);

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

  const handleEdit = (item) => {
    setFormData(item);
    setIsEditing(true);
  };

  // Class utilitas untuk form input bergaya Brutalism
  const inputBrutalism = "w-full p-3 border-4 border-black bg-white focus:outline-none focus:bg-yellow-100 shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all font-bold text-black";

  return (
    <div className="p-8 bg-[#f0f4f8] min-h-screen text-black font-sans">
      
      {/* Header Card */}
      <div className="bg-[#bbf7d0] border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-6 mb-8 flex justify-between items-center">
        <h2 className="text-3xl font-black uppercase tracking-wider flex items-center gap-3">
          <Calendar className="text-black w-8 h-8" strokeWidth={3} /> 
          Kelola Jadwal
        </h2>
      </div>

      {/* Form Card */}
      {userRole === 'admin' && (
        <form onSubmit={handleSubmit} className="bg-[#fef08a] border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-6 mb-10">
          <h3 className="text-xl font-bold mb-4 uppercase border-b-4 border-black inline-block pb-1">Input Data</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <select 
              className={inputBrutalism}
              value={formData.hari}
              onChange={(e) => setFormData({...formData, hari: e.target.value})}
              required
            >
              {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map(h => <option key={h} value={h}>{h}</option>)}
            </select>
            
            <input 
              placeholder="MATA KULIAH" 
              className={inputBrutalism}
              value={formData.mata_kuliah}
              onChange={(e) => setFormData({...formData, mata_kuliah: e.target.value})}
              required
            />
            
            <input 
              placeholder="RUANGAN" 
              className={inputBrutalism}
              value={formData.ruangan}
              onChange={(e) => setFormData({...formData, ruangan: e.target.value})}
            />
            
            <input 
              placeholder="DOSEN PENGAMPU" 
              className={inputBrutalism}
              value={formData.dosen}
              onChange={(e) => setFormData({...formData, dosen: e.target.value})}
            />
            
            <input 
              type="time"
              className={inputBrutalism}
              value={formData.jam_mulai}
              onChange={(e) => setFormData({...formData, jam_mulai: e.target.value})}
              required
            />
            
            <input 
              type="time"
              className={inputBrutalism}
              value={formData.jam_selesai}
              onChange={(e) => setFormData({...formData, jam_selesai: e.target.value})}
              required
            />
            
            <select 
              className={`${inputBrutalism} md:col-span-1`}
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
            >
              <option value="Normal">NORMAL</option>
              <option value="Pindah Jam">PINDAH JAM</option>
              <option value="Dibatalkan">DIBATALKAN</option>
            </select>

            <button 
              type="submit" 
              className="md:col-span-2 bg-[#f472b6] hover:bg-[#ec4899] border-4 border-black p-3 font-black text-lg uppercase tracking-wider flex items-center justify-center gap-2 shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 active:translate-x-1 transition-all"
            >
              {isEditing ? <Edit2 size={24} strokeWidth={3} /> : <Plus size={24} strokeWidth={3} />} 
              {isEditing ? 'Update Jadwal' : 'Tambah Jadwal'}
            </button>
          </div>
        </form>
      )}

      {/* Table Card */}
      <div className="border-4 border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative z-10">
        {/* HEADER */}
        <div className="bg-black text-white p-5 font-black uppercase">
          <span className="text-xl tracking-tight">Jadwal Perkuliahan</span>
        </div>

        {/* LIST JADWAL */}
        <div className="divide-y-4 divide-black">
          {schedules.length > 0 ? (
            schedules.map((s) => (
              <div 
                key={s.id}
                className={`group flex items-center transition-all duration-300 ease-out
                  ${s.status === 'Dibatalkan' 
                    ? 'bg-red-50/50 hover:bg-red-50 hover:shadow-[inset_8px_0px_0px_0px_rgba(239,68,68,1)]' 
                    : 'bg-white hover:bg-blue-50 hover:shadow-[inset_8px_0px_0px_0px_rgba(93,51,166,1)]'
                  }`}
              >
                {/* HARI BADGE */}
                <div className="p-4 border-r-4 border-black shrink-0 relative z-10 min-w-20">
                  <div className="bg-[#bbf7d0] border-3 border-black p-2 text-center font-black text-sm">
                    {s.hari.substring(0, 3).toUpperCase()}
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-4 flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-transform duration-300 group-hover:translate-x-1">
                  <div>
                    <h4 className="font-black uppercase text-base sm:text-lg text-black">
                      {s.mata_kuliah}
                    </h4>
                    <p className="text-sm font-bold text-gray-700">
                      {s.dosen ? `Dosen: ${s.dosen}` : ''}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {s.ruangan ? `Ruangan: ${s.ruangan}` : '-'}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* WAKTU */}
                    <div className="text-center shrink-0">
                      <span className="text-[10px] font-black uppercase text-gray-400">Waktu</span>
                      <div className="bg-[#fef08a] border-2 border-black p-2 font-black text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        {s.jam_mulai} - {s.jam_selesai}
                      </div>
                    </div>

                    {/* STATUS */}
                    <div className="shrink-0">
                      <span className={`px-3 py-1 border-2 border-black font-black text-xs shadow-[2px_2px_0_0_rgba(0,0,0,1)] block
                        ${s.status === 'Normal' ? 'bg-[#bbf7d0]' : s.status === 'Pindah Jam' ? 'bg-yellow-300' : 'bg-[#fca5a5]'}`}>
                        {s.status.toUpperCase()}
                      </span>
                    </div>

                    {/* AKSI - HANYA UNTUK ADMIN */}
                    {userRole === 'admin' && (
                      <div className="flex gap-2 shrink-0">
                        <button 
                          onClick={() => handleEdit(s)} 
                          className="bg-[#60a5fa] hover:bg-[#3b82f6] p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 active:translate-x-1 transition-all"
                          title="Edit"
                        >
                          <Edit2 size={18} className="text-white" strokeWidth={3} />
                        </button>
                        <button 
                          onClick={async () => {
                            const { error } = await supabase.from('jadwal_kuliah').delete().eq('id', s.id);
                            if (!error) fetchSchedules();
                          }} 
                          className="bg-[#f87171] hover:bg-[#ef4444] p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 active:translate-x-1 transition-all"
                          title="Hapus"
                        >
                          <Trash2 size={18} className="text-white" strokeWidth={3} />
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

        {/* FOOTER */}
        <div className="bg-gray-100 p-3 border-t-4 border-black flex justify-between items-center gap-4">
          <span className="text-xs font-black uppercase">Total: {schedules.length} Jadwal</span>
        </div>
      </div>

    </div>
  );
}