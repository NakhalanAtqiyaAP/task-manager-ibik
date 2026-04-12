// src/App.jsx
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

import Login from './pages/LoginPage';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import TaskTable from './components/TaskTable';
import Footer from './components/Footer';
import Modal from './components/ModalNavbar';
import FormMahasiswa from './components/Form/FormMahasiswa';
import FormTugas from './components/Form/FormTugas';
import StudentList from './components/MahasiswaList';
import FormMataKuliah from './components/Form/FormMataKuliah';
import DaftarTugasList from './components/DaftarTugasList';
import MataKuliahList from './components/MataKuliahList';

export default function App() {
  const [session, setSession] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const [modalConfig, setModalConfig] = useState({ 
    isOpen: false, category: '', mode: '' 
  });
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Cek sesi saat aplikasi pertama kali dimuat
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    // 2. Dengarkan perubahan status login (saat user login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fungsi Gatekeeper untuk memvalidasi email
  const handleSession = async (currentSession) => {
    if (!currentSession) {
      setSession(null);
      setIsAuthorized(false);
      setIsCheckingAuth(false);
      return;
    }

    const userEmail = currentSession.user.email;

    // Cek apakah email ada di tabel students
    const { data, error } = await supabase
      .from('students')
      .select('email, nama')
      .eq('email', userEmail)
      .single();

    if (data) {
      // Email valid & terdaftar
      setSession(currentSession);
      setIsAuthorized(true);
    } else {
      // Email tidak terdaftar -> Paksa Logout
      await supabase.auth.signOut();
      alert(`AKSES DITOLAK!\n\nEmail ${userEmail} tidak terdaftar sebagai mahasiswa aktif. Gunakan email kampus.`);
      setSession(null);
      setIsAuthorized(false);
    }
    
    setIsCheckingAuth(false);
  };

  const openModal = (category, mode) => setModalConfig({ isOpen: true, category, mode });
  const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });

  async function fetchInitialData() {
    setLoading(true);
    try {
      const { data: monitorData, error } = await supabase
        .from('student_tasks')
        .select(`
          id, deadline, is_completed,
          students ( id, nama ),
          tasks (
            id, judul,
            courses ( 
              semester,
              mata_kuliah:matkul_id ( nama_matkul ) 
            )
          )
        `)
        .order('deadline', { ascending: true });

      if (error) throw error;

      setTasks(monitorData || []);

    } catch (error) {
      console.error('Error:', error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isAuthorized) {
      fetchInitialData();
    }
  }, [isAuthorized]);

  const activeTasksCount = tasks.filter(task => !task.is_completed).length;

  // Tampilkan layar loading saat sistem masih memvalidasi auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="font-black uppercase text-2xl animate-pulse">Memvalidasi Akses...</div>
      </div>
    );
  }

  // Jika tidak punya akses (belum login / email salah), tampilkan halaman Login
  if (!isAuthorized) {
    return <Login />;
  }

  // ==========================================
  // JIKA LOLOS VALIDASI, TAMPILKAN APLIKASI UTAMA
  // ==========================================
  return (
    <div className="min-h-screen selection:bg-green-400 selection:text-black font-sans bg-white relative">
      <div className="fixed inset-0 z-[-1] opacity-[0.03]" 
           style={{ backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`, backgroundSize: '40px 40px' }}>
      </div>

      <Navbar onMenuAction={openModal} session={session} />

      <main className="max-w-7xl mx-auto pt-8">
        <Hero taskCount={activeTasksCount} loading={loading} />
        <TaskTable tasks={tasks} loading={loading} onRefresh={fetchInitialData} />
      </main>

      <Footer />

      <Modal isOpen={modalConfig.isOpen} onClose={closeModal} title={`${modalConfig.mode === 'view' ? 'DATA' : 'INPUT'} ${modalConfig.category.toUpperCase()}`}>
        {modalConfig.category === 'Mahasiswa' && (modalConfig.mode === 'create' ? <FormMahasiswa onComplete={closeModal} /> : <StudentList />)}
        {modalConfig.category === 'Daftar Tugas' && (modalConfig.mode === 'create' ? <FormTugas onComplete={closeModal} /> : <DaftarTugasList />)}
        {modalConfig.category === 'Mata Kuliah' && (modalConfig.mode === 'create' ? <FormMataKuliah onComplete={closeModal} /> : <MataKuliahList />)}
      </Modal>
    </div>
  )
}