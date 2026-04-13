import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast'; // 1. Import toast

export default function FormDaftarTugas({ onComplete }) {
  const [formData, setFormData] = useState({ nama: '', nim: '', no_wa: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await supabase.from('students').insert([formData]);
    
    if (error) {
      // Toast untuk Error
      toast.error(`GAGAL: ${error.message}`, {
        className: 'border-4 border-black rounded-none font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-red-400 text-white',
      });
    } else {
      // 2. Toast untuk Sukses dengan style Neo-Brutalist
      toast.success('DATA_MAHASISWA: BERHASIL DISIMPAN!', {
        duration: 3000,
        className: 'border-4 border-black rounded-none font-black uppercase shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-green-400 text-black',
        iconTheme: {
          primary: '#000',
          secondary: '#4ade80',
        },
      });
      onComplete();
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-black uppercase mb-1 text-sm text-gray-500">// NAMA_LENGKAP</label>
        <input 
          required
          disabled={isSubmitting}
          className="w-full border-4 border-black p-3 font-bold focus:bg-green-100 outline-none disabled:bg-gray-200"
          onChange={(e) => setFormData({...formData, nama: e.target.value})}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-black uppercase mb-1 text-sm text-gray-500">// NIM</label>
          <input 
            required
            disabled={isSubmitting}
            className="w-full border-4 border-black p-3 font-bold focus:bg-green-100 outline-none disabled:bg-gray-200"
            onChange={(e) => setFormData({...formData, nim: e.target.value})}
          />
        </div>
        <div>
          <label className="block font-black uppercase mb-1 text-sm text-gray-500">// NO_WHATSAPP</label>
          <input 
            required
            disabled={isSubmitting}
            placeholder="628..."
            className="w-full border-4 border-black p-3 font-bold focus:bg-green-100 outline-none disabled:bg-gray-200"
            onChange={(e) => setFormData({...formData, no_wa: e.target.value})}
          />
        </div>
      </div>
      <button 
        disabled={isSubmitting}
        className={`w-full ${isSubmitting ? 'bg-gray-400' : 'bg-green-400'} border-4 border-black p-4 font-black uppercase text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all`}
      >
        {isSubmitting ? 'MEMPROSES...' : 'SIMPAN DATA'}
      </button>
    </form>
  );
}