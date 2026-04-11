import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function FormMataKuliah({ onComplete }) {
  const [formData, setFormData] = useState({ 
    kode_matkul: '', 
    nama_matkul: '', 
    sks: 3,
    semester: 1 
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Simpan ke master mata_kuliah
    const { data: matkul, error: subError } = await supabase
      .from('mata_kuliah')
      .insert([{ 
        kode_matkul: formData.kode_matkul.toUpperCase(), 
        nama_matkul: formData.nama_matkul,
        sks: parseInt(formData.sks)
      }])
      .select()
      .single();

    if (subError) return alert("Gagal simpan matkul: " + subError.message);

    // 2. Daftarkan ke tabel courses
    // PERBAIKAN: Kita sertakan kode_matkul karena tabel courses memintanya (Not-Null)
    const { error: courseError } = await supabase
      .from('courses')
      .insert([{
        matkul_id: matkul.id, // Foreign Key UUID
        kode_matkul: matkul.kode_matkul, // Kolom yang menyebabkan error tadi
        semester: parseInt(formData.semester)
      }]);

    if (!courseError) {
      alert("Mata Kuliah & Semester Aktif Berhasil Disimpan!");
      onComplete();
    } else {
      // Jika masih error, periksa kembali nama kolom di tabel 'courses'
      alert("Gagal daftar semester di tabel courses: " + courseError.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-black uppercase text-xs mb-1 text-gray-500">// KODE_MATKUL</label>
          <input 
            required 
            placeholder="E.g. MK002" 
            className="w-full border-4 border-black p-3 font-bold focus:bg-green-100 outline-none uppercase"
            onChange={(e) => setFormData({...formData, kode_matkul: e.target.value})}
          />
        </div>
        <div>
          <label className="block font-black uppercase text-xs mb-1 text-gray-500">// JUMLAH_SKS</label>
          <input 
            required 
            type="number" 
            className="w-full border-4 border-black p-3 font-bold focus:bg-green-100 outline-none"
            value={formData.sks} 
            onChange={(e) => setFormData({...formData, sks: e.target.value})}
          />
        </div>
      </div>

      <div>
        <label className="block font-black uppercase text-xs mb-1 text-gray-500">// NAMA_MATA_KULIAH</label>
        <input 
          required 
          placeholder="E.g. Matematika Dasar"
          className="w-full border-4 border-black p-3 font-bold focus:bg-green-100 outline-none"
          onChange={(e) => setFormData({...formData, nama_matkul: e.target.value})}
        />
      </div>

      <div>
        <label className="block font-black uppercase text-xs mb-1 text-gray-500">// SEMESTER_AKTIF</label>
        <select 
          required 
          className="w-full border-4 border-black p-3 font-bold focus:bg-green-100 outline-none appearance-none"
          value={formData.semester}
          onChange={(e) => setFormData({...formData, semester: e.target.value})}
        >
          {[1,2,3,4,5,6,7,8].map(num => (
            <option key={num} value={num}>Semester {num}</option>
          ))}
        </select>
      </div>

      <button className="w-full bg-yellow-400 border-4 border-black p-4 font-black uppercase text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all mt-4">
        SIMPAN_DATA_MATKUL
      </button>
    </form>
  );
}