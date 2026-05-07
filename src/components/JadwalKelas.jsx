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
      <div className="bg-white border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#93c5fd] border-b-4 border-black">
              <tr>
                <th className="p-4 border-r-4 border-black font-black uppercase text-lg">Hari</th>
                <th className="p-4 border-r-4 border-black font-black uppercase text-lg">Mata Kuliah</th>
                <th className="p-4 border-r-4 border-black font-black uppercase text-lg">Ruang & Dosen</th>
                <th className="p-4 border-r-4 border-black font-black uppercase text-lg">Waktu</th>
                <th className="p-4 border-r-4 border-black font-black uppercase text-lg">Status</th>
                {userRole === 'admin' && <th className="p-4 font-black uppercase text-lg text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {schedules.map((s, index) => (
                <tr key={s.id} className={`border-b-4 border-black font-bold ${index % 2 === 0 ? 'bg-white' : 'bg-[#f8fafc]'}`}>
                  <td className="p-4 border-r-4 border-black">{s.hari}</td>
                  <td className="p-4 border-r-4 border-black text-xl">{s.mata_kuliah}</td>
                  <td className="p-4 border-r-4 border-black">
                    <div>{s.ruangan}</div>
                    <div className="text-sm font-medium text-gray-600 mt-1">{s.dosen}</div>
                  </td>
                  <td className="p-4 border-r-4 border-black bg-[#fef08a] text-center">
                    {s.jam_mulai} - {s.jam_selesai}
                  </td>
                  <td className="p-4 border-r-4 border-black text-center">
                    <span className={`px-3 py-1 border-2 border-black font-black text-xs shadow-[2px_2px_0_0_rgba(0,0,0,1)] ${s.status === 'Normal' ? 'bg-[#bbf7d0]' : 'bg-[#fca5a5]'}`}>
                      {s.status.toUpperCase()}
                    </span>
                  </td>
                  {userRole === 'admin' && (
                    <td className="p-4 flex justify-center gap-3">
                      <button 
                        onClick={() => handleEdit(s)} 
                        className="bg-[#60a5fa] hover:bg-[#3b82f6] p-2 border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 active:translate-x-1"
                        title="Edit"
                      >
                        <Edit2 size={20} className="text-white" strokeWidth={3} />
                      </button>
                      <button 
                        onClick={async () => {
                          const { error } = await supabase.from('jadwal_kuliah').delete().eq('id', s.id);
                          if (!error) fetchSchedules();
                        }} 
                        className="bg-[#f87171] hover:bg-[#ef4444] p-2 border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 active:translate-x-1"
                        title="Hapus"
                      >
                        <Trash2 size={20} className="text-white" strokeWidth={3} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {schedules.length === 0 && (
                <tr>
                  <td colSpan={userRole === 'admin' ? "6" : "5"} className="p-8 text-center text-xl font-bold bg-[#f1f5f9]">
                    BELUM ADA JADWAL KELAS 
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}