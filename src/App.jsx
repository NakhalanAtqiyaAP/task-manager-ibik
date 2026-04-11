import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import TaskTable from './components/TaskTable';
import Footer from './components/Footer';
import Modal from './components/ModalNavbar';
import FormMahasiswa from './components/Form/FormMahasiswa';
import FormTugas from './components/Form/FormTugas';
import StudentList from './components/MahasiswaList'; // Pastikan membuat file ini
import { supabase } from './lib/supabase';

export default function App() {
  const [modalConfig, setModalConfig] = useState({ 
    isOpen: false, 
    category: '', 
    mode: '' 
  });
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const openModal = (category, mode) => {
    setModalConfig({ isOpen: true, category, mode });
  };

  const closeModal = () => {
    setModalConfig({ ...modalConfig, isOpen: false });
  };

  async function fetchTasks() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          id,
          judul_tugas,
          deadline,
          courses (
            nama_matkul,
            semester
          )
        `)
        .order('deadline', { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error.message);
      alert('Gagal mengambil data tugas!');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="min-h-screen selection:bg-green-400 selection:text-black font-sans bg-white relative">
      <div className="fixed inset-0 z-[-1] opacity-[0.03]" 
           style={{ 
             backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
             backgroundSize: '40px 40px' 
           }}>
      </div>

      {/* Navbar sekarang mengirimkan category dan mode */}
      <Navbar onMenuAction={openModal} />

      <main className="max-w-7xl mx-auto pt-8">
        <Hero taskCount={tasks.length} loading={loading} />
        <TaskTable tasks={tasks} loading={loading} onRefresh={fetchTasks} />
      </main>

      <Footer />

      {/* Modal Dinamis */}
      <Modal 
        isOpen={modalConfig.isOpen} 
        onClose={closeModal}
        title={`${modalConfig.mode === 'view' ? 'DATA' : 'INPUT'} ${modalConfig.category.toUpperCase()}`}
      >
        {/* LOGIKA KONTEN MAHASISWA */}
        {modalConfig.category === 'Mahasiswa' && (
          modalConfig.mode === 'create' 
            ? <FormMahasiswa onComplete={closeModal} /> 
            : <StudentList />
        )}

        {/* LOGIKA KONTEN TUGAS */}
        {modalConfig.category === 'Daftar Tugas' && (
          modalConfig.mode === 'create' 
            ? <FormTugas onComplete={closeModal} /> 
            : <div className="p-8 text-center font-black border-4 border-dashed border-black">
                TABEL TUGAS FULL-SCREEN SEDANG DIOPTIMASI...
              </div>
        )}
      </Modal>
    </div>
  )
}