  import { useState, useEffect } from 'react';
  import { Toaster } from 'react-hot-toast';

  import Login from './pages/LoginPage';
  import MemberPage from './pages/MemberPage';
  import LeaderboardPage from './pages/LeaderboardPage';
  import GalleryPage from './pages/GalleryPage';

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
import OAuthBootOverlay from './components/OAuthBootOverlay';
import { useAuth } from './hooks/useAuth';
import { useStudentTasks } from './hooks/useStudentTasks';


  

  export default function App() {
    const [activeView, setActiveView] = useState('Dashboard');

    const { isAuthorized, isCheckingAuth, currentUser, showOAuthBooting, oauthBootUserName, logout } = useAuth();
    const { tasks, loading, fetchStudentTasks } = useStudentTasks(currentUser, isAuthorized);

    // State baru untuk Toggle Profil
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const [modalConfig, setModalConfig] = useState({ 
      isOpen: false, category: '', mode: '' 
    });
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

    const handleMenuAction = (category, mode) => {
    if (category === 'Logout') {
      logout();
    } else if (category === 'Dashboard' || category === 'Member' || category === 'Leaderboard' || category === 'Gallery') {
      setActiveView(category);
      setModalConfig({ ...modalConfig, isOpen: false });
    } else {
      // BUKA MODAL UNTUK CRUD (Tugas, Mahasiswa, MK)
      setModalConfig({ isOpen: true, category, mode });
    }
  };
    const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });

    const activeTasksCount = tasks.filter(task => !task.is_completed).length;

    if (isCheckingAuth) {
      return <div className="min-h-screen flex items-center justify-center bg-purple-900">
        <div className="font-black text-green-400 uppercase text-2xl animate-pulse">Memvalidasi Akses...</div>
        </div>;
    }

    if (showOAuthBooting) {
      return (
        <div className="fixed inset-0 z-50 bg-purple-900 flex flex-col items-center justify-center text-white font-mono p-4 overflow-hidden">
          <div className="space-y-8 text-center">
            <h2 className="text-xl md:text-2xl uppercase tracking-[0.2em] opacity-0 animate-text-seq" style={{ animationDelay: '0.5s' }}>
              Welcome <span className="text-green-400 font-black">{oauthBootUserName}</span>...
            </h2>
            <p className="text-lg uppercase tracking-widest opacity-0 animate-text-seq" style={{ animationDelay: '1.8s' }}>
              To Website...
            </p>
            <h1 className="text-5xl md:text-7xl font-black italic underline decoration-green-400 opacity-0 animate-text-seq" style={{ animationDelay: '2.8s' }}>
              TI-25-KA
            </h1>
          </div>

          <div className="absolute bottom-20 w-full max-w-xs px-4" style={{ maxWidth: '250px' }}>
            <div className="h-1 bg-gray-900 w-full overflow-hidden border border-white/10">
              <div className="h-full bg-green-500 animate-progress"></div>
            </div>
            <div className="flex justify-between mt-2">
              <p className="text-[10px] text-gray-500 animate-pulse uppercase">Loading_to_website...</p>
              <p className="text-[10px] text-green-500 font-bold uppercase">Ready</p>
            </div>
          </div>
          <div className="absolute inset-0 bg-black opacity-0 animate-final-fade z-50 pointer-events-none" style={{ animationDelay: '4s' }}></div>
        </div>
      );
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
      <>
      <Toaster 
      position="top-center" 
      reverseOrder={false} 
      toastOptions={{
        // Opsional: Bisa set styling default neo-brutalist di sini juga
        style: {
          border: '4px solid black',
          borderRadius: '0px',
          fontWeight: '900',
        },
      }}
    />
      {isCheckingAuth ? (
      <div className="min-h-screen flex items-center justify-center bg-purple-900">
        <div className="font-black text-green-400 uppercase text-2xl animate-pulse">
          Memvalidasi Akses...
        </div>
      </div>
    ) : !isAuthorized ? (
      <Login />
    ) : (
      <div className="min-h-screen selection:bg-green-400 selection:text-black font-sans bg-purple-900 relative overflow-visible bg-stripes bg-blueprint">
        <Navbar 
          onMenuAction={handleMenuAction} 
          currentUser={currentUser} 
          onToggleProfile={() => setIsProfileOpen(true)} 
        />

        <main className="max-w-7xl mx-auto pt-8 px-4 sm:px-6 lg:px-8 transition-all duration-300 min-h-screen">
          {activeView === 'Dashboard' ? (
            <>
              <Hero taskCount={activeTasksCount} loading={loading} user={currentUser} />
              <TaskTable studentId={currentUser?.id} onRefresh={fetchStudentTasks} />
            </>
          ) : activeView === 'Member' ? (
            <MemberPage />
          ) : activeView === 'Leaderboard' ? (
            <LeaderboardPage studentId={currentUser?.id}/>
          ) : activeView === 'Gallery' ? (
            <GalleryPage user={currentUser}/>
          ) : null}
        </main>

        <Footer user={currentUser} />

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
            logout();
            setIsProfileOpen(false); // Tutup drawer
          }}
          />
          </div>
        </div>
      </div>
      )}
      </>
    )
  }