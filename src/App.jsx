  // src/App.jsx
  import { useState, useEffect } from 'react';
  import { Toaster } from 'react-hot-toast';

  import { supabase } from './lib/supabase';

  import Login from './pages/LoginPage';
  import MemberPage from './pages/MemberPage';
  import LeaderboardPage from './pages/LeaderboardPage';

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
  import Profile from './components/Profile';

  

  export default function App() {
    const [activeView, setActiveView] = useState('Dashboard');

    const [session, setSession] = useState(null);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    
    // State baru untuk User Saat Ini dan Toggle Profil
    const [currentUser, setCurrentUser] = useState(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const [modalConfig, setModalConfig] = useState({ 
      isOpen: false, category: '', mode: '' 
    });
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
// [BARU] EVENT LISTENER SCROLL UNTUK ANIMASI
  useEffect(() => {
    const handleScroll = () => {
      // Cari semua elemen yang mau dianimasikan
      const reveals = document.querySelectorAll('.scroll-reveal, .scroll-reveal-left');
      
      const windowHeight = window.innerHeight;
      const elementVisible = 100; // Seberapa jauh jarak dari bawah layar agar animasi mulai (dalam pixel)

      reveals.forEach((reveal) => {
        const elementTop = reveal.getBoundingClientRect().top;

        // Jika elemen sudah masuk ke dalam layar
        if (elementTop < windowHeight - elementVisible) {
          reveal.classList.add('is-visible');
        }
      });
    };

    // Jalankan satu kali saat pertama render (agar elemen yang sudah ada di layar paling atas langsung muncul)
    handleScroll();

    // Pasang listener ke layar
    window.addEventListener('scroll', handleScroll);

    // Cleanup saat komponen unmount atau update
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [activeView, loading]); // Pantau activeView dan loading
  useEffect(() => {
    const initAuth = async () => {
      try {
        // 1. Cek dulu apakah ada user manual di localStorage
        const manualUser = localStorage.getItem('manual_auth_user');
        
        if (manualUser) {
          const parsed = JSON.parse(manualUser);
          // Validasi sederhana: pastikan data tidak kosong
          if (parsed && parsed.email) {
            setCurrentUser(parsed);
            setSession({ user: { email: parsed.email }, app_metadata: { provider: 'manual' } });
            setIsAuthorized(true);
            setIsCheckingAuth(false);
            return; // Jika ada login manual, stop di sini.
          }
        }

        // 2. Jika tidak ada manual, baru cek session Supabase (untuk Google Login)
        const { data, error } = await supabase.auth.getSession();
        if (data?.session) {
          await handleSession(data.session);
        } else {
          setIsAuthorized(false);
          setIsCheckingAuth(false);
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        setIsCheckingAuth(false);
      }
    };

    initAuth();

    // Listener untuk perubahan auth (seperti login Google)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        handleSession(session);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

    useEffect(() => {
      let logoutTimer;
      const resetTimer = () => {
        if (logoutTimer) clearTimeout(logoutTimer);
        logoutTimer = setTimeout(() => {
          alert("Sesi berakhir karena tidak ada aktivitas selama 2 jam.");
          supabase.auth.signOut();
        }, 7200000);
      };

      if (isAuthorized) {
        window.addEventListener('mousemove', resetTimer);
        window.addEventListener('keydown', resetTimer);
        window.addEventListener('scroll', resetTimer);
        window.addEventListener('click', resetTimer);
        resetTimer();
      }
      return () => {
        window.removeEventListener('mousemove', resetTimer);
        window.removeEventListener('keydown', resetTimer);
        window.removeEventListener('scroll', resetTimer);
        window.removeEventListener('click', resetTimer);
        if (logoutTimer) clearTimeout(logoutTimer);
      };
    }, [isAuthorized]);

    const handleSession = async (currentSession) => {
      if (!currentSession) {
        setSession(null);
        setIsAuthorized(false);
        setCurrentUser(null);
        setIsCheckingAuth(false);
        return;
      }

      try {
        const userEmail = currentSession.user.email;
        const { data: student, error } = await supabase
          .from('students')
          .select('*')
          .eq('email', userEmail)
          .single();

        if (error) {
          console.error('Student lookup failed:', error);
          throw error;
        }

        if (student) {
          setSession(currentSession);
          setIsAuthorized(true);
          setCurrentUser(student);

          const lastLogin = localStorage.getItem('last_log_at');
          const now = new Date().getTime();
          if (!lastLogin || now - lastLogin > 60000) {
            await supabase.from('login_history').insert([
              { student_id: student.id, email: userEmail, login_method: currentSession.user.app_metadata?.provider || 'password' }
            ]);
            localStorage.setItem('last_log_at', now);
          }
        } else {
          await supabase.auth.signOut();
          alert("Email tidak terdaftar!");
          setSession(null);
          setIsAuthorized(false);
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('handleSession error:', error);
        setSession(null);
        setIsAuthorized(false);
        setCurrentUser(null);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    const handleMenuAction = (category, mode) => {
    if (category === 'Logout') {
      localStorage.removeItem('manual_auth_user');
      supabase.auth.signOut();
      setIsAuthorized(false);
      setCurrentUser(null);
    } else if (category === 'Dashboard' || category === 'Member' || category === 'Leaderboard') {
      // GANTI HALAMAN UTAMA
      setActiveView(category);
      setModalConfig({ ...modalConfig, isOpen: false });
    } else {
      // BUKA MODAL UNTUK CRUD (Tugas, Mahasiswa, MK)
      setModalConfig({ isOpen: true, category, mode });
    }
  };
    const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });

    // ... (fungsi fetchInitialData TETAP SAMA) ...
    // Di dalam App.jsx
async function fetchInitialData() {
  // Pastikan user sudah ada sebelum melakukan fetch
  if (!currentUser?.id) return; 

  setLoading(true);
  try {
    const { data: monitorData, error } = await supabase
      .from('student_tasks')
      .select(`
        id, 
        deadline, 
        is_completed, 
        students ( id, nama ), 
        tasks ( 
          id, 
          judul, 
          courses ( 
            semester, 
            mata_kuliah:matkul_id ( nama_matkul ) 
          ) 
        )
      `)
      // FILTER KUNCINYA DI SINI:
      .eq('student_id', currentUser.id) 
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
  if (isAuthorized && currentUser) {
    fetchInitialData(); 
  }
}, [isAuthorized, currentUser]);

    const activeTasksCount = tasks.filter(task => !task.is_completed).length;

    if (isCheckingAuth) {
      return <div className="min-h-screen flex items-center justify-center bg-purple-900">
        <div className="font-black text-green-400 uppercase text-2xl animate-pulse">Memvalidasi Akses...</div>
        </div>;
    }

    if (!isAuthorized) return <Login />;
  const AccessDenied = () => (
    <div className="flex flex-col items-center justify-center p-10 border-4 border-black bg-red-500 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] text-center my-10 max-w-2xl mx-auto">
      <div className="text-6xl mb-4">⛔</div>
      <h2 className="text-4xl font-black text-white uppercase mb-2">Akses Ditolak</h2>
      <p className="font-bold text-black border-2 border-black bg-white px-4 py-2 uppercase">
        Hanya Admin yang dapat mengakses area ini.
      </p>
    </div>
  );
  const renderContent = () => {
  const userRole = currentUser?.role || 'student';

  // PROTEKSI ROUTING DI SINI
  if ((currentCategory === 'Mahasiswa' || currentCategory === 'Mata Kuliah') && userRole !== 'admin') {
    return <AccessDenied />;
  }

  // Jika aman, render sesuai kategori
  switch (currentCategory) {
    case 'Dashboard':
      return <Dashboard />;
    case 'Daftar Tugas':
      return <TaskManager mode={currentMode} />;
    case 'Mahasiswa':
      return <StudentManager mode={currentMode} />; // Admin only
    case 'Mata Kuliah':
      return <CourseManager mode={currentMode} />; // Admin only
    default:
      return <Dashboard />;
  }
};
    return (
      <div className="min-h-screen selection:bg-green-400 selection:text-black font-sans bg-purple-900 relative overflow-visible bg-stripes bg-blueprint">
          {/* Kirim currentUser dan fungsi toggle profil ke Navbar */}
          <Toaster position="bottom-right" reverseOrder={false} />
        <Navbar onMenuAction={handleMenuAction} currentUser={currentUser} onToggleProfile={() => setIsProfileOpen(true)} />

        <main className="max-w-7xl mx-auto pt-8 px-4 sm:px-6 lg:px-8 transition-all duration-300 min-h-screen">
        {/* LOGIKA SWITCH PAGE */}
        {activeView === 'Dashboard' ? (
          <>
            <Hero taskCount={activeTasksCount} loading={loading} user={currentUser} />
            <TaskTable 
              studentId={currentUser?.id} 
              onRefresh={fetchInitialData}
            />
          </>
        ) : activeView === 'Member' ? (
          <MemberPage />
        ) : activeView === 'Leaderboard' ? (
          <LeaderboardPage />
        ): null}
      </main>

        <Footer user={currentUser}  />

        {/* MODAL BIASA UNTUK CRUD */}
        <Modal 
      isOpen={modalConfig.isOpen} 
      onClose={closeModal} 
      title={`${modalConfig.mode === 'view' ? 'DATA' : 'INPUT'} ${modalConfig.category.toUpperCase()}`}
    >
      {modalConfig.category === 'Mahasiswa' && (modalConfig.mode === 'create' ? <FormMahasiswa onComplete={closeModal} /> : <StudentList />)}
      
      {/* UPDATE BAGIAN INI: Kirimkan studentId */}
      {modalConfig.category === 'Daftar Tugas' && (
        modalConfig.mode === 'create' 
          ? <FormTugas onComplete={closeModal} /> 
          : <DaftarTugasList studentId={currentUser?.id} /> // Tambahkan prop ini!
      )}

      {modalConfig.category === 'Mata Kuliah' && (modalConfig.mode === 'create' ? <FormMataKuliah onComplete={closeModal} /> : <MataKuliahList />)}
    </Modal>

        {/* PROFILE SIDEBAR DRAWER */}
        {/* Overlay Gelap */}
        {isProfileOpen && (
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-90 transition-opacity"
            onClick={() => setIsProfileOpen(false)}
          ></div>
        )}

        {/* Laci Kanan */}
        <div 
  className={`fixed top-0 right-0 h-full w-full sm:w-100 bg-white z-100 transform transition-transform duration-300 ease-in-out flex flex-col 
    ${isProfileOpen 
      ? 'translate-x-0 border-l-8 border-black shadow-[-16px_0_0_0_rgba(0,0,0,1)]' 
      : 'translate-x-full border-l-0 border-transparent shadow-none'
    }`}
>
          <div className="flex justify-between items-center p-6 border-b-4 border-black bg-purple-900">
            <h2 className="text-2xl font-black uppercase italic text-white">// USER_PROFILE</h2>
            <button 
              onClick={() => setIsProfileOpen(false)}
              className="w-10 h-10 bg-white border-4 border-black font-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:bg-red-400"
            >
              X
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 bg-white">
          <Profile 
          userEmail={currentUser?.email} 
          onProfileUpdate={(updatedUser) => setCurrentUser({...currentUser, ...updatedUser})} 
          onLogout={() => { 
            localStorage.removeItem('manual_auth_user'); // Hapus storage
            supabase.auth.signOut(); // Sign out dari supabase
            setIsAuthorized(false); // <--- INI KUNCINYA: Paksa state jadi false
            setCurrentUser(null);
            setSession(null);
            setIsProfileOpen(false); // Tutup drawer
          }}
          />
          </div>
        </div>
      </div>
    )
  }