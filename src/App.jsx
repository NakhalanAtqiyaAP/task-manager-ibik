import { useState, useEffect, useRef } from 'react';
import { Toaster } from 'react-hot-toast';

import Login from './pages/LoginPage';
import MemberPage from './pages/MemberPage';
import LeaderboardPage from './pages/LeaderboardPage';
import GalleryPage from './pages/GalleryPage';
import CoursePage from './pages/CoursePage';

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
import JadwalKelas from './components/JadwalKelas';
import FarewellPresentation from './components/FarewellPresentation'; 

import farewellAudio from './assets/laguPerpisahan.mp3';

import { useAuth } from './hooks/useAuth';
import { useStudentTasks } from './hooks/useStudentTasks';

export default function App() {
  const [activeView, setActiveView] = useState('Dashboard');

  const { isAuthorized, isCheckingAuth, currentUser, showOAuthBooting, oauthBootUserName, logout } = useAuth();
  const { tasks, loading, fetchStudentTasks } = useStudentTasks(currentUser, isAuthorized);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [farewellDismissed, setFarewellDismissed] = useState(false);
  const [profileUser, setProfileUser] = useState(currentUser);

  // State & Ref Audio Global
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [hasAudioInstance, setHasAudioInstance] = useState(false); // Mengontrol kondisi render tombol tanpa membaca ref di JSX
  const bgAudioRef = useRef(null);
  const isInitializingRef = useRef(false);
  const audioPlayPromiseRef = useRef(null);

  const [modalConfig, setModalConfig] = useState({ 
    isOpen: false, category: '', mode: '' 
  });

  const showFarewell = isAuthorized && currentUser?.status === 'tidak_aktif' && !farewellDismissed;

  const handleStartFarewellAudio = () => {
    if (isInitializingRef.current) return;

    if (!bgAudioRef.current) {
      isInitializingRef.current = true;
      const audio = new Audio(farewellAudio);
      audio.loop = true;
      audio.volume = 0.4;
      bgAudioRef.current = audio;
      setHasAudioInstance(true); // Memicu render tombol secara aman via React State
    }

    if (bgAudioRef.current.paused && !audioPlayPromiseRef.current) {
      const playPromise = bgAudioRef.current.play();
      audioPlayPromiseRef.current = playPromise;

      playPromise
        .then(() => {
          setIsPlayingMusic(true);
        })
        .catch((err) => {
          console.log("Autoplay ditahan browser, menunggu interaksi pengguna:", err);
        })
        .finally(() => {
          if (audioPlayPromiseRef.current === playPromise) {
            audioPlayPromiseRef.current = null;
          }
          isInitializingRef.current = false;
        });
    } else {
      isInitializingRef.current = false;
    }
  };

  const toggleMusic = () => {
    if (bgAudioRef.current) {
      if (isPlayingMusic) {
        bgAudioRef.current.pause();
        setIsPlayingMusic(false);
      } else if (!audioPlayPromiseRef.current) {
        handleStartFarewellAudio();
      }
    }
  };

  const stopAndResetAudio = () => {
    if (bgAudioRef.current) {
      bgAudioRef.current.pause();
      bgAudioRef.current.currentTime = 0;
      bgAudioRef.current = null;
      audioPlayPromiseRef.current = null;
      isInitializingRef.current = false;
      setHasAudioInstance(false); // Sembunyikan tombol secara aman
      setIsPlayingMusic(false);
    }
  };

  useEffect(() => {
    return () => {
      if (bgAudioRef.current) {
        bgAudioRef.current.pause();
        bgAudioRef.current.currentTime = 0;
        bgAudioRef.current = null;
      }
      audioPlayPromiseRef.current = null;
      isInitializingRef.current = false;
    };
  }, []);

  useEffect(() => {
    setProfileUser(currentUser);
  }, [currentUser]);

  useEffect(() => {
    const handleScroll = () => {
      const reveals = document.querySelectorAll('.scroll-reveal, .scroll-reveal-left');
      const windowHeight = window.innerHeight;
      const elementVisible = 100; 

      reveals.forEach((reveal) => {
        const elementTop = reveal.getBoundingClientRect().top;
        if (elementTop < windowHeight - elementVisible) {
          reveal.classList.add('is-visible');
        }
      });
    };
    handleScroll();

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [activeView, loading]); 

  const handleMenuAction = (category, mode) => {
    if (category === 'Logout') {
      stopAndResetAudio();
      logout();
    } else if (category === 'Dashboard' || category === 'Member' || category === 'Leaderboard' || category === 'Gallery' || category === 'Kursus') {
      setActiveView(category);
      setModalConfig({ ...modalConfig, isOpen: false });
    } else {
      setModalConfig({ isOpen: true, category, mode });
    }
  };

  const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });

  const activeTasksCount = tasks.filter(task => !task.is_completed).length;

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-purple-900">
        <div className="font-black text-green-400 uppercase text-2xl animate-pulse">Memvalidasi Akses...</div>
      </div>
    );
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
            <div className="h-full bg-[#22c55e] animate-progress"></div>
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

  return (
    <>
      <Toaster 
        position="top-center" 
        reverseOrder={false} 
        toastOptions={{
          style: {
            border: '4px solid black',
            borderRadius: '0px',
            fontWeight: '900',
          },
        }}
      />

      {/* OVERLAY DEDIKASI MAHASISWA TIDAK AKTIF */}
      {showFarewell && (
        <FarewellPresentation 
          userName={currentUser?.nama} 
          onClose={() => setFarewellDismissed(true)} 
          onStartAudio={handleStartFarewellAudio}
        />
      )}

      {/* TOMBOL KONTROL MUSIK UNTUK MAHASISWA TIDAK AKTIF */}
      {hasAudioInstance && (
        <button 
          onClick={toggleMusic}
          className="fixed bottom-6 right-6 z-[90] bg-black text-green-400 border-4 border-black px-4 py-2 font-mono font-black text-xs uppercase shadow-[4px_4px_0px_0px_rgba(34,197,94,1)] hover:bg-green-400 hover:text-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:translate-x-2 active:translate-y-2"
        >
          {isPlayingMusic ? '🎵 MUTE MUSIC' : '🔇 PLAY MUSIC'}
        </button>
      )}

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
              <JadwalKelas userRole={currentUser?.role} />
            </>
          ) : activeView === 'Member' ? (
            <MemberPage />
          ) : activeView === 'Leaderboard' ? (
            <LeaderboardPage studentId={currentUser?.id}/>
          ) : activeView === 'Gallery' ? (
            <GalleryPage user={currentUser}/>
          ) : activeView === 'Kursus' ? (
            <CoursePage currentUser={currentUser} />
          ) : null}
        </main>

        <Footer user={currentUser} />

        <Modal 
          isOpen={modalConfig.isOpen} 
          onClose={closeModal} 
          title={`${modalConfig.mode === 'view' ? 'DATA' : 'INPUT'} ${modalConfig.category.toUpperCase()}`}
        >
          {modalConfig.category === 'Mahasiswa' && (modalConfig.mode === 'create' ? <FormMahasiswa onComplete={closeModal} /> : <StudentList />)}
          
          {modalConfig.category === 'Daftar Tugas' && (
            modalConfig.mode === 'create' 
              ? <FormTugas onComplete={closeModal} student={currentUser} />
              : <DaftarTugasList studentId={currentUser?.id} student={currentUser} />
          )}

          {modalConfig.category === 'Mata Kuliah' && (modalConfig.mode === 'create' ? <FormMataKuliah onComplete={closeModal} /> : <MataKuliahList />)}
        </Modal>

        {/* PROFILE SIDEBAR DRAWER */}
        {isProfileOpen && (
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-90 transition-opacity"
            onClick={() => setIsProfileOpen(false)}
          ></div>
        )}
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
              userEmail={profileUser?.email} 
              onProfileUpdate={(updatedUser) => setProfileUser((user) => ({ ...user, ...updatedUser }))} 
              onLogout={() => { 
                stopAndResetAudio();
                logout();
                setIsProfileOpen(false); 
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}