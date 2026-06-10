import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast'; 

export default function FormMataKuliah({ onComplete }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ 
    kode_matkul: '', 
    nama_matkul: '', 
    sks: 3,
    semester: 1 
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: matkul, error: subError } = await supabase
        .from('mata_kuliah')
        .insert([{ 
          kode_matkul: formData.kode_matkul.toUpperCase(), 
          nama_matkul: formData.nama_matkul,
          sks: parseInt(formData.sks)
        }])
        .select()
        .single();

      if (subError) throw new Error(`Master: ${subError.message}`);
      const { error: courseError } = await supabase
        .from('courses')
        .insert([{
          matkul_id: matkul.id,
          kode_matkul: matkul.kode_matkul,
          semester: parseInt(formData.semester)
        }]);

      if (courseError) throw new Error(`Semester: ${courseError.message}`);

      toast.success("MATA_KULIAH: REGISTERED SUCCESSFULLY!", {
        position: "top-center", 
        className: 'border-4 border-black rounded-none font-black bg-yellow-400 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] uppercase text-sm',
        duration: 3000,
      });

      onComplete();
    } catch (err) {
      toast.error(`ERROR: ${err.message}`, {
        position: "top-center",
        className: 'border-4 border-black rounded-none font-black bg-red-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase text-xs',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-black uppercase text-xs mb-1 text-gray-500">KODE MATKUL</label>
          <input 
            required 
            disabled={isSubmitting}
            placeholder="E.g. MK002" 
            className="w-full border-4 border-black p-3 font-bold focus:bg-green-100 outline-none uppercase disabled:bg-gray-200"
            onChange={(e) => setFormData({...formData, kode_matkul: e.target.value})}
          />
        </div>
        <div>
          <label className="block font-black uppercase text-xs mb-1 text-gray-500">JUMLAH SKS</label>
          <input 
            required 
            type="number" 
            disabled={isSubmitting}
            className="w-full border-4 border-black p-3 font-bold focus:bg-green-100 outline-none disabled:bg-gray-200"
            value={formData.sks} 
            onChange={(e) => setFormData({...formData, sks: e.target.value})}
          />
        </div>
      </div>

      <div>
        <label className="block font-black uppercase text-xs mb-1 text-gray-500">NAMA MATAKULIAH</label>
        <input 
          required 
          disabled={isSubmitting}
          placeholder="E.g. Matematika Dasar"
          className="w-full border-4 border-black p-3 font-bold focus:bg-green-100 outline-none disabled:bg-gray-200"
          onChange={(e) => setFormData({...formData, nama_matkul: e.target.value})}
        />
      </div>

      <div>
        <label className="block font-black uppercase text-xs mb-1 text-gray-500">SEMESTE AKTIF</label>
        <select 
          required 
          disabled={isSubmitting}
          className="w-full border-4 border-black p-3 font-bold focus:bg-green-100 outline-none appearance-none disabled:bg-gray-200"
          value={formData.semester}
          onChange={(e) => setFormData({...formData, semester: e.target.value})}
        >
          {[1,2,3,4,5,6,7,8].map(num => (
            <option key={num} value={num}>Semester {num}</option>
          ))}
        </select>
      </div>

      <button 
        disabled={isSubmitting}
        className={`w-full ${isSubmitting ? 'bg-gray-400' : 'bg-yellow-400'} border-4 border-black p-4 font-black uppercase text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all mt-4`}
      >
        {isSubmitting ? 'SAVING...' : 'SIMPAN DATA'}
      </button>
    </form>
  );
}