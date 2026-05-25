import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase'; // Sesuaikan path client kamu
import { Plus, BookOpen, Video, FileText } from 'lucide-react';

export default function AdminCourseCRUD() {
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  
  // State Form
  const [judulPertemuan, setJudulPertemuan] = useState('');
  const [urutan, setUrutan] = useState(1);
  const [tipeKonten, setTipeKonten] = useState('video');
  const [judulMateri, setJudulMateri] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [teksKonten, setTeksKonten] = useState('');

  // Ambil data mata kuliah berdasarkan semester yang dipilih
  useEffect(() => {
    async function fetchCourses() {
      const { data, error } = await supabase
        .from('courses')
        .select(`id, matkul_id, mata_kuliah(nama_matkul)`)
        .eq('semester', selectedSemester);
      
      if (!error && data) {
        setCourses(data);
        if (data.length > 0) setSelectedCourseId(data[0].id);
      }
    }
    fetchCourses();
  }, [selectedSemester]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourseId) return alert("Pilih mata kuliah terlebih dahulu!");

    // 1. Insert ke course_sessions
    const { data: sessionData, error: sessionError } = await supabase
      .from('course_sessions')
      .insert([{ course_id: selectedCourseId, judul_pertemuan: judulPertemuan, urutan: parseInt(urutan) }])
      .select()
      .single();

    if (sessionError) return alert("Gagal membuat sesi: " + sessionError.message);

    // 2. Insert ke course_contents
    const { error: contentError } = await supabase
      .from('course_contents')
      .insert([{
        session_id: sessionData.id,
        tipe: tipeKonten,
        judul_materi: judulMateri,
        video_url: tipeKonten === 'video' ? videoUrl : null,
        teks_konten: tipeKonten === 'teks' ? teksKonten : null
      }]);

    if (contentError) {
      alert("Gagal mengunggah konten: " + contentError.message);
    } else {
      alert("🎉 Materi Berhasil Ditambahkan!");
      // Reset Form
      setJudulPertemuan('');
      setJudulMateri('');
      setVideoUrl('');
      setTeksKonten('');
    }
  };

  const inputStyle = "w-full p-3 border-4 border-black bg-white focus:outline-none shadow-[4px_4px_0_0_rgba(0,0,0,1)] font-bold text-black";

  return (
    <div className="p-6 bg-[#fef08a] border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] text-black max-w-3xl mx-auto my-10">
      <h2 className="text-3xl font-black uppercase mb-6 flex items-center gap-2 border-b-4 border-black pb-2">
        <BookOpen strokeWidth={3} /> UPLOAD MATERI KULIAH (ADMIN)
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pilih Semester */}
          <div>
            <label className="block font-black uppercase mb-1">Pilih Semester</label>
            <select className={inputStyle} value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>SEMESTER {s}</option>)}
            </select>
          </div>

          {/* Pilih Mata Kuliah */}
          <div>
            <label className="block font-black uppercase mb-1">Mata Kuliah</label>
            <select className={inputStyle} value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)}>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.mata_kuliah?.nama_matkul?.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="border-2 border-dashed border-black p-4 bg-white">
          <h3 className="font-black uppercase mb-4 text-md bg-purple-300 p-1 inline-block border-2 border-black">Struktur Pertemuan</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <input placeholder="Contoh: Pertemuan 1: Pengenalan DB" className={inputStyle} value={judulPertemuan} onChange={(e) => setJudulPertemuan(e.target.value)} required />
            </div>
            <div>
              <input type="number" placeholder="Urutan (cth: 1)" className={inputStyle} value={urutan} onChange={(e) => setUrutan(e.target.value)} required />
            </div>
          </div>
        </div>

        {/* Detail Konten */}
        <div className="space-y-4">
          <label className="block font-black uppercase mb-1">Tipe Konten Pembelajaran</label>
          <div className="flex gap-4">
            <button type="button" onClick={() => setTipeKonten('video')} className={`p-3 border-4 border-black font-black uppercase flex items-center gap-2 ${tipeKonten === 'video' ? 'bg-orange-400' : 'bg-white'}`}>
              <Video /> Video
            </button>
            <button type="button" onClick={() => setTipeKonten('teks')} className={`p-3 border-4 border-black font-black uppercase flex items-center gap-2 ${tipeKonten === 'teks' ? 'bg-orange-400' : 'bg-white'}`}>
              <FileText /> Artikel Teks
            </button>
          </div>

          <input placeholder="Judul Materi / Sub-Bab" className={inputStyle} value={judulMateri} onChange={(e) => setJudulMateri(e.target.value)} required />

          {tipeKonten === 'video' ? (
            <input placeholder="Masukkan URL Video (YouTube/Drive)" className={inputStyle} value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} required />
          ) : (
            <textarea placeholder="Tulis isi materi kuliah di sini (Mendukung Teks biasa / HTML)" rows={6} className={inputStyle} value={teksKonten} onChange={(e) => setTeksKonten(e.target.value)} required />
          )}
        </div>

        <button type="submit" className="w-full bg-black text-white p-4 font-black uppercase tracking-wider text-xl hover:bg-gray-800 shadow-[4px_4px_0_0_rgba(244,114,182,1)] active:translate-y-1 transition-all">
          Simpan & Publish Materi 🚀
        </button>
      </form>
    </div>
  );
}   