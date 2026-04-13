import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Edit3, Trash2, X, Save, BookOpen, Layers } from 'lucide-react';

export default function MataKuliahList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    setLoading(true);
    const { data } = await supabase
      .from('courses')
      .select(`id, semester, matkul_id, mata_kuliah:matkul_id ( kode_matkul, nama_matkul, sks )`)
      .order('semester', { ascending: true });
    if (data) setCourses(data);
    setLoading(false);
  }

  // FUNGSI DELETE
  const handleDelete = async (course) => {
    const confirmDelete = window.confirm(`Hapus ${course.mata_kuliah?.nama_matkul} dari daftar?`);
    if (!confirmDelete) return;

    // Hapus dari tabel courses (relasi semester)
    const { error } = await supabase.from('courses').delete().eq('id', course.id);
    
    if (!error) {
      toast.success("REMOVED: MATA KULIAH DIHAPUS", {
        position: 'top-center',
        className: 'border-4 border-black rounded-none font-black bg-red-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase text-xs'
      });
      fetchCourses();
    } else {
      toast.error(error.message);
    }
  };

  // FUNGSI OPEN MODAL EDIT
  const openEditModal = (course) => {
    setSelectedCourse(course);
    setEditFormData({
      nama_matkul: course.mata_kuliah?.nama_matkul,
      kode_matkul: course.mata_kuliah?.kode_matkul,
      sks: course.mata_kuliah?.sks,
      semester: course.semester
    });
    setIsEditModalOpen(true);
  };

  // FUNGSI SAVE EDIT
  const handleUpdate = async (e) => {
    e.preventDefault();
    
    // 1. Update di tabel Master (mata_kuliah)
    const { error: masterError } = await supabase
      .from('mata_kuliah')
      .update({
        nama_matkul: editFormData.nama_matkul,
        kode_matkul: editFormData.kode_matkul.toUpperCase(),
        sks: parseInt(editFormData.sks)
      })
      .eq('id', selectedCourse.matkul_id);

    if (masterError) return toast.error(masterError.message);

    // 2. Update di tabel Relasi (courses)
    const { error: relError } = await supabase
      .from('courses')
      .update({ semester: parseInt(editFormData.semester) })
      .eq('id', selectedCourse.id);

    if (!relError) {
      toast.success("UPDATED: PERUBAHAN DISIMPAN", {
        position: 'top-center',
        className: 'border-4 border-black rounded-none font-black bg-green-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase text-xs'
      });
      setIsEditModalOpen(false);
      fetchCourses();
    } else {
      toast.error(relError.message);
    }
  };

  return (
    <div className="border-4 border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
      <div className="bg-black text-white p-4 font-black uppercase text-lg flex justify-between items-center">
        <span>// KURIKULUM_DATA</span>
        {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin"></div>}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="border-b-4 border-black bg-purple-600 text-white">
              <th className="p-4 border-r-4 border-black font-black uppercase w-24">Kode</th>
              <th className="p-4 border-r-4 border-black font-black uppercase">Mata Kuliah</th>
              <th className="p-4 border-r-4 border-black font-black uppercase text-center">SKS</th>
              <th className="p-4 border-r-4 border-black text-center font-black uppercase">Semester</th>
              <th className="p-4 text-center font-black uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id} className="border-b-4 border-black hover:bg-green-50 transition-colors bg-white">
                <td className="p-4 border-r-4 border-black font-mono font-bold uppercase">{course.mata_kuliah?.kode_matkul}</td>
                <td className="p-4 border-r-4 border-black font-black uppercase">{course.mata_kuliah?.nama_matkul}</td>
                <td className="p-4 border-r-4 border-black text-center">
                  <span className="bg-black text-white px-2 py-0.5 text-[10px] font-black">{course.mata_kuliah?.sks}</span>
                </td>
                <td className="p-4 border-r-4 border-black text-center text-purple-600 font-black">S{course.semester}</td>
                <td className="p-4">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => openEditModal(course)} className="bg-green-400 border-2 border-black p-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none">
                      <Edit3 size={14} strokeWidth={3} />
                    </button>
                    <button onClick={() => handleDelete(course)} className="bg-red-500 border-2 border-black p-1.5 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none">
                      <Trash2 size={14} strokeWidth={3} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL EDIT MATA KULIAH */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, rotate: -1 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-md bg-white border-8 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
              <div className="bg-green-400 p-4 border-b-8 border-black flex justify-between items-center">
                <h2 className="font-black uppercase italic tracking-tighter flex items-center gap-2">
                  <BookOpen size={20} strokeWidth={3} /> // EDIT_COURSE
                </h2>
                <button onClick={() => setIsEditModalOpen(false)} className="bg-white border-4 border-black p-1 hover:bg-red-500 hover:text-white transition-colors">
                  <X size={20} strokeWidth={4} />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="p-6 space-y-4">
                <div>
                  <label className="block font-black text-[10px] uppercase mb-1 text-gray-500">// NAMA_MATKUL</label>
                  <input required className="w-full border-4 border-black p-3 font-bold focus:bg-green-50 outline-none uppercase" value={editFormData.nama_matkul || ''} onChange={(e) => setEditFormData({...editFormData, nama_matkul: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-black text-[10px] uppercase mb-1 text-gray-500">// KODE</label>
                    <input required className="w-full border-4 border-black p-3 font-bold focus:bg-green-50 outline-none uppercase" value={editFormData.kode_matkul || ''} onChange={(e) => setEditFormData({...editFormData, kode_matkul: e.target.value})} />
                  </div>
                  <div>
                    <label className="block font-black text-[10px] uppercase mb-1 text-gray-500">// SKS</label>
                    <input required type="number" className="w-full border-4 border-black p-3 font-bold focus:bg-green-50 outline-none" value={editFormData.sks || ''} onChange={(e) => setEditFormData({...editFormData, sks: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block font-black text-[10px] uppercase mb-1 text-gray-500 flex items-center gap-1"><Layers size={10}/> // SEMESTER_AKTIF</label>
                  <select className="w-full border-4 border-black p-3 font-black focus:bg-green-50 outline-none appearance-none" value={editFormData.semester || 1} onChange={(e) => setEditFormData({...editFormData, semester: e.target.value})}>
                    {[1,2,3,4,5,6,7,8].map(num => <option key={num} value={num}>SEMESTER {num}</option>)}
                  </select>
                </div>

                <button className="w-full bg-black text-white py-4 font-black uppercase text-lg shadow-[6px_6px_0px_0px_rgba(250,204,21,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-3 mt-2">
                  <Save size={20} /> UPDATE_DATA
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}