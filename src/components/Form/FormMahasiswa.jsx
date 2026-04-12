import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function FormMahasiswa({ onComplete }) {
  // Update state sesuai skema baru (phone_num, email, dan password)
  const [formData, setFormData] = useState({ nama: '', nim: '', phone_num: '', email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Insert data, role akan otomatis 'student' karena default di database
    const { error } = await supabase.from('students').insert([formData]);
    if (!error) {
      alert("Mahasiswa Berhasil Ditambahkan!");
      onComplete();
    } else {
      alert("Error: " + error.message);
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-black uppercase mb-1 text-sm text-gray-500">// NIM</label>
          <input 
            required
            className="w-full border-4 border-black p-3 font-bold focus:bg-green-100 outline-none"
            value={formData.nim}
            onChange={(e) => {
              const nim = e.target.value;
              setFormData({ 
                ...formData, 
                nim, 
                email: nim ? `${nim}@student.ibik.ac.id` : '',
                password: nim || ''
              });
            }}
          />
        </div>
        <div>
          <label className="block font-black uppercase mb-1 text-sm text-gray-500">// NO_WHATSAPP</label>
          <input 
            required
            placeholder="628..."
            className="w-full border-4 border-black p-3 font-bold focus:bg-green-100 outline-none"
            value={formData.phone_num}
            onChange={(e) => setFormData({...formData, phone_num: e.target.value})}
          />
        </div>
      </div>
      <div>
        <label className="block font-black uppercase mb-1 text-sm text-gray-500">// EMAIL_ADDRESS</label>
        <input 
          type="email"
          className="w-full border-4 border-black p-3 font-bold bg-gray-100 outline-none"
          value={formData.email}
          readOnly
        />
      </div>
      <div>
        <label className="block font-black uppercase mb-1 text-sm text-gray-500">// PASSWORD</label>
        <input 
          type="text"
          className="w-full border-4 border-black p-3 font-bold bg-gray-100 outline-none"
          value={formData.password}
          readOnly
        />
      </div>
      <button className="w-full bg-green-400 border-4 border-black p-4 font-black uppercase text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
        SIMPAN DATA
      </button>
    </form>
  );
}