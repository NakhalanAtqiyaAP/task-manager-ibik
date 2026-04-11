import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function FormDaftarTugas({ onComplete }) {
  const [formData, setFormData] = useState({ nama: '', nim: '', no_wa: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('students').insert([formData]);
    if (!error) {
      alert("Mahasiswa Berhasil Ditambahkan!");
      onComplete();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-black uppercase mb-1 text-sm text-gray-500">// NAMA_LENGKAP</label>
        <input 
          required
          className="w-full border-4 border-black p-3 font-bold focus:bg-green-100 outline-none"
          onChange={(e) => setFormData({...formData, nama: e.target.value})}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-black uppercase mb-1 text-sm text-gray-500">// NIM</label>
          <input 
            required
            className="w-full border-4 border-black p-3 font-bold focus:bg-green-100 outline-none"
            onChange={(e) => setFormData({...formData, nim: e.target.value})}
          />
        </div>
        <div>
          <label className="block font-black uppercase mb-1 text-sm text-gray-500">// NO_WHATSAPP</label>
          <input 
            required
            placeholder="628..."
            className="w-full border-4 border-black p-3 font-bold focus:bg-green-100 outline-none"
            onChange={(e) => setFormData({...formData, no_wa: e.target.value})}
          />
        </div>
      </div>
      <button className="w-full bg-green-400 border-4 border-black p-4 font-black uppercase text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
        SIMPAN_DATA_MAHASISWA
      </button>
    </form>
  );
}