import { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import TaskTable from './components/TaskTable';
import Footer from './components/Footer';
import Modal from './components/ModalNavbar';
import FormMahasiswa from './components/Form/FormMahasiswa';
import FormTugas from './components/Form/FormTugas';
import StudentList from './components/MahasiswaList'; // Pastikan membuat file ini

export default function App() {
  // Menggunakan object agar bisa menampung kategori dan mode (view/create)
  const [modalConfig, setModalConfig] = useState({ 
    isOpen: false, 
    category: '', 
    mode: '' 
  });

  const openModal = (category, mode) => {
    setModalConfig({ isOpen: true, category, mode });
  };

  const closeModal = () => {
    setModalConfig({ ...modalConfig, isOpen: false });
  };

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
        <Hero />
        <TaskTable />
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