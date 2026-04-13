import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Edit3, Trash2, X, Save, User } from 'lucide-react';

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    fetchStudents();
  }, []);

  async function fetchStudents() {
    const { data } = await supabase.from('students').select('*').order('nama', { ascending: true });
    if (data) setStudents(data);
  }

  // FUNGSI DELETE
  const handleDelete = async (id, nama) => {
    const confirmDelete = window.confirm(`Hapus mahasiswa ${nama}?`);
    if (!confirmDelete) return;

    const { error } = await supabase.from('students').delete().eq('id', id);
    if (!error) {
      toast.success("DATA_DELETED: MAHASISWA DIHAPUS", {
        position: 'top-center',
        className: 'border-4 border-black rounded-none font-black bg-red-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase text-xs'
      });
      fetchStudents();
    } else {
      toast.error(error.message);
    }
  };

  // FUNGSI OPEN MODAL EDIT
  const openEditModal = (student) => {
    setSelectedStudent(student);
    setEditFormData({ ...student });
    setIsEditModalOpen(true);
  };

  // FUNGSI SAVE EDIT
  const handleUpdate = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from('students')
      .update({
        nama: editFormData.nama,
        nim: editFormData.nim,
        phone_num: editFormData.phone_num,
        kelas: editFormData.kelas
      })
      .eq('id', selectedStudent.id);

    if (!error) {
      toast.success("DATA_UPDATED: BERHASIL DISIMPAN", {
        position: 'top-center',
        className: 'border-4 border-black rounded-none font-black bg-green-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase text-xs'
      });
      setIsEditModalOpen(false);
      fetchStudents();
    } else {
      toast.error(error.message);
    }
  };

  return (
    <div className="border-4 border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
      <div className="bg-black text-white p-4 font-black uppercase text-lg flex justify-between items-center">
        <span>// DAFTAR_MAHASISWA</span>
        <span className="text-xs bg-purple-600 px-2 py-1 border-2 border-white">{students.length} TOTAL</span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="border-b-4 border-black bg-purple-600 text-white">
              <th className="p-4 border-r-4 border-black font-black uppercase">Mahasiswa</th>
              <th className="p-4 border-r-4 border-black font-black uppercase hidden md:table-cell">Kontak</th>
              <th className="p-4 text-center font-black uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-b-4 border-black hover:bg-yellow-50 transition-colors bg-white">
                <td className="p-4 border-r-4 border-black">
                  <div className="flex flex-col">
                    <span className="font-black uppercase text-sm">{s.nama}</span>
                    <span className="font-mono text-[10px] text-gray-500">{s.nim} • {s.kelas}</span>
                  </div>
                </td>
                <td className="p-4 border-r-4 border-black hidden md:table-cell font-bold text-purple-600">
                  <a href={`https://wa.me/${s.phone_num}`} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-2">
                    <Hash size={14} className="text-black" /> {s.phone_num}
                  </a>
                </td>
                <td className="p-4">
                  <div className="flex justify-center gap-2">
                    <button 
                      onClick={() => openEditModal(s)}
                      className="bg-green-400 border-2 border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
                    >
                      <Edit3 size={16} strokeWidth={3} />
                    </button>
                    <button 
                      onClick={() => handleDelete(s.id, s.nama)}
                      className="bg-red-500 border-2 border-black p-2 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
                    >
                      <Trash2 size={16} strokeWidth={3} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL EDIT MAHASISWA */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, y: 20, rotate: 1 }} 
              animate={{ scale: 1, y: 0, rotate: 0 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-white border-8 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
            >
              <div className="bg-green-400 p-4 border-b-8 border-black flex justify-between items-center">
                <h2 className="font-black uppercase italic tracking-tighter flex items-center gap-2">
                  <User size={20} strokeWidth={3} /> // EDIT_STUDENT_DATA
                </h2>
                <button onClick={() => setIsEditModalOpen(false)} className="bg-white border-4 border-black p-1 hover:bg-red-500 hover:text-white transition-colors">
                  <X size={20} strokeWidth={4} />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="p-6 space-y-4">
                <div>
                  <label className="block font-black text-[10px] uppercase mb-1 text-gray-500 italic">// NAMA_LENGKAP</label>
                  <input 
                    required
                    className="w-full border-4 border-black p-3 font-bold focus:bg-green-100 outline-none uppercase"
                    value={editFormData.nama || ''}
                    onChange={(e) => setEditFormData({...editFormData, nama: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-black text-[10px] uppercase mb-1 text-gray-500 italic">// NIM</label>
                    <input 
                      required
                      className="w-full border-4 border-black p-3 font-bold focus:bg-green-100 outline-none"
                      value={editFormData.nim || ''}
                      onChange={(e) => setEditFormData({...editFormData, nim: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block font-black text-[10px] uppercase mb-1 text-gray-500 italic">// KELAS</label>
                    <input 
                      required
                      className="w-full border-4 border-black p-3 font-bold focus:bg-green-100 outline-none uppercase"
                      value={editFormData.kelas || ''}
                      onChange={(e) => setEditFormData({...editFormData, kelas: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-black text-[10px] uppercase mb-1 text-gray-500 italic">// WHATSAPP</label>
                  <input 
                    required
                    className="w-full border-4 border-black p-3 font-bold focus:bg-green-100 outline-none"
                    value={editFormData.phone_num || ''}
                    onChange={(e) => setEditFormData({...editFormData, phone_num: e.target.value})}
                  />
                </div>

                <button className="w-full bg-black text-white py-4 font-black uppercase text-lg shadow-[6px_6px_0px_0px_rgba(74,222,128,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-3">
                  <Save size={20} /> SIMPAN_PERUBAHAN
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Tambahan ikon kecil agar lebih manis
const Hash = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter" className={className}>
    <line x1="4" y1="9" x2="20" y2="9"></line>
    <line x1="4" y1="15" x2="20" y2="15"></line>
    <line x1="10" y1="3" x2="8" y2="21"></line>
    <line x1="16" y1="3" x2="14" y2="21"></line>
  </svg>
);