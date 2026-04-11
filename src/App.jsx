import { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import TaskTable from './components/TaskTable';
import Footer from './components/Footer';
import Modal from './components/ModalNavbar';
import FormMahasiswa from './components/Form/FormMahasiswa';
import FormTugas from './components/Form/FormTugas';

export default function App() {
  const [activeModal, setActiveModal] = useState(null);

  return (
    <div className="min-h-screen selection:bg-green-400 selection:text-black font-sans bg-white relative">
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 z-[-1] opacity-[0.03]" 
           style={{ 
             backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
             backgroundSize: '40px 40px' 
           }}>
      </div>

      {/* Kirim fungsi ke Navbar agar tidak error */}
      <Navbar onMenuClick={(menu) => setActiveModal(menu)} />

      <main className="max-w-7xl mx-auto pt-8">
        <Hero />
        <TaskTable />
      </main>

      <Footer />

      {/* Logic Modal Mahasiswa */}
      <Modal 
        isOpen={activeModal === 'Mahasiswa'} 
        onClose={() => setActiveModal(null)}
        title="Manajemen Mahasiswa"
      >
        <FormMahasiswa onComplete={() => setActiveModal(null)} />
      </Modal>

      {/* Logic Modal Tugas */}
      <Modal 
        isOpen={activeModal === 'Daftar Tugas'} 
        onClose={() => setActiveModal(null)}
        title="Panel Tugas Kuliah"
      >
        <FormTugas onComplete={() => setActiveModal(null)} />
      </Modal>
    </div>
  )
}