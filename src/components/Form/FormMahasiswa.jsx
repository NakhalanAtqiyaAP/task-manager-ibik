import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast'; // Import toast

export default function FormMahasiswa({ onComplete }) {
  const [formData, setFormData] = useState({ nama: '', nim: '', phone_num: '', email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await supabase.from('students').insert([formData]);
    
    if (error) {
      toast.error(`ERROR: ${error.message}`, {
        position: "top-center",
        className: 'border-4 border-black rounded-none font-black bg-red-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase text-xs',
      });
    } else {
      toast.success("MAHASISWA: BERHASIL DITAMBAHKAN!", {
        position: "top-center",
        className: 'border-4 border-black rounded-none font-black bg-green-400 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] uppercase text-sm',
        duration: 3000,
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
          className="w-full border-4 border-black p-3 font-bold focus:bg-green-100 outline-none disabled:bg-gray-100"
          onChange={(e) => setFormData({...formData, nama: e.target.value})}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-black uppercase mb-1 text-sm text-gray-500">// NIM</label>
          <input 
            required
            disabled={isSubmitting}
            className="w-full border-4 border-black p-3 font-bold focus:bg-green-100 outline-none disabled:bg-gray-100"
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
            disabled={isSubmitting}
            placeholder="628..."
            className="w-full border-4 border-black p-3 font-bold focus:bg-green-100 outline-none disabled:bg-gray-100"
            value={formData.phone_num}
            onChange={(e) => setFormData({...formData, phone_num: e.target.value})}
          />
        </div>
      </div>
      <div>
        <label className="block font-black uppercase mb-1 text-sm text-gray-500">// EMAIL_ADDRESS</label>
        <input 
          type="email"
          className="w-full border-4 border-black p-3 font-bold bg-gray-200 outline-none cursor-not-allowed text-gray-500"
          value={formData.email}
          readOnly
        />
      </div>
      <div>
        <label className="block font-black uppercase mb-1 text-sm text-gray-500">// PASSWORD (DEFAULT=NIM)</label>
        <input 
          type="text"
          className="w-full border-4 border-black p-3 font-bold bg-gray-200 outline-none cursor-not-allowed text-gray-500"
          value={formData.password}
          readOnly
        />
      </div>
      <button 
        disabled={isSubmitting}
        className={`w-full ${isSubmitting ? 'bg-gray-400' : 'bg-green-400'} border-4 border-black p-4 font-black uppercase text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all`}
      >
        {isSubmitting ? 'SAVING...' : 'SIMPAN DATA'}
      </button>
    </form>
  );
}