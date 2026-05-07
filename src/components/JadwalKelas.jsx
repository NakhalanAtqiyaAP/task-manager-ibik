import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient'; // Sesuaikan dengan path client kamu
import { Edit2, Plus, Trash2, Calendar } from 'lucide-react';

export default function ScheduleManager() {
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
    const { data } = await supabase.from('jadwal_kuliah').select('*').order('hari');
    setSchedules(data || []);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (isEditing) {
      await supabase.from('jadwal_kuliah').update(formData).eq('id', formData.id);
    } else {
      await supabase.from('jadwal_kuliah').insert([formData]);
    }
    setFormData({ hari: 'Senin', mata_kuliah: '', ruangan: '', dosen: '', jam_mulai: '', jam_selesai: '', status: 'Normal' });
    setIsEditing(false);
    fetchSchedules();
  }

  const handleEdit = (item) => {
    setFormData(item);
    setIsEditing(true);
  };

  return (
    <div className="p-6 bg-gray-900 text-white rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="text-purple-500" /> Kelola Jadwal Kuliah
        </h2>
      </div>

      {/* Form Input/Edit */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-gray-800 p-4 rounded-lg">
        <select 
          className="bg-gray-700 p-2 rounded border border-gray-600"
          value={formData.hari}
          onChange={(e) => setFormData({...formData, hari: e.target.value})}
        >
          {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map(h => <option key={h} value={h}>{h}</option>)}
        </select>
        <input 
          placeholder="Mata Kuliah" 
          className="bg-gray-700 p-2 rounded border border-gray-600"
          value={formData.mata_kuliah}
          onChange={(e) => setFormData({...formData, mata_kuliah: e.target.value})}
          required
        />
        <input 
          placeholder="Ruangan" 
          className="bg-gray-700 p-2 rounded border border-gray-600"
          value={formData.ruangan}
          onChange={(e) => setFormData({...formData, ruangan: e.target.value})}
        />
        <select 
          className="bg-gray-700 p-2 rounded border border-gray-600"
          value={formData.status}
          onChange={(e) => setFormData({...formData, status: e.target.value})}
        >
          <option value="Normal">Normal</option>
          <option value="Pindah Jam">Pindah Jam</option>
          <option value="Dibatalkan">Dibatalkan</option>
        </select>
        <button type="submit" className="bg-purple-600 hover:bg-purple-700 p-2 rounded font-bold flex items-center justify-center gap-2">
          {isEditing ? <Edit2 size={18} /> : <Plus size={18} />} {isEditing ? 'Update' : 'Tambah'}
        </button>
      </form>

      {/* Tabel Data */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="p-2">Hari</th>
              <th className="p-2">Mata Kuliah</th>
              <th className="p-2">Jam</th>
              <th className="p-2">Status</th>
              <th className="p-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((s) => (
              <tr key={s.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition">
                <td className="p-2 font-semibold">{s.hari}</td>
                <td className="p-2">{s.mata_kuliah}</td>
                <td className="p-2 text-sm text-gray-400">{s.jam_mulai} - {s.jam_selesai}</td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded text-xs ${s.status === 'Normal' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                    {s.status}
                  </span>
                </td>
                <td className="p-2">
                  <button onClick={() => handleEdit(s)} className="text-blue-400 mr-3"><Edit2 size={16}/></button>
                  <button onClick={async () => {
                    await supabase.from('jadwal_kuliah').delete().eq('id', s.id);
                    fetchSchedules();
                  }} className="text-red-400"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}