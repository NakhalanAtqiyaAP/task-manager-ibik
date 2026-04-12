import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [nim, setNim] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isBooting, setIsBooting] = useState(false);
  const [studentName, setStudentName] = useState('');

  const handleManualLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data: student, error } = await supabase
      .from('students')
      .select('*')
      .eq('nim', nim.trim())
      .eq('password', password.trim())
      .single();

    if (!student) {
      alert('Kombinasi NIM dan Password salah!');
      setLoading(false);
      return;
    }

    localStorage.setItem('manual_auth_user', JSON.stringify({
      ...student,
      authenticated_at: new Date().toISOString(),
    }));

    setStudentName(student.nama);
    setIsBooting(true); // Ini yang memicu tampilan cutscene

    setTimeout(() => {
      window.location.href = window.location.origin;
    }, 5000);
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    if (error) alert(error.message);
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-purple-900 p-4 font-sans relative bg-blueprint">
        <div className="bg-white border-8 border-black p-8 max-w-md w-full shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
          <h1 className="text-4xl font-black uppercase mb-6 italic underline">// AUTH_GATE</h1>
          
          <form onSubmit={handleManualLogin} className="space-y-4">
            <div>
              <label className="block font-black text-xs uppercase mb-1">NIM</label>
              <input 
                type="text" required 
                className="w-full border-4 border-black p-3 font-bold outline-none focus:bg-purple-100"
                value={nim} onChange={(e) => setNim(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-black text-xs uppercase mb-1">Password</label>
              <input 
                type="password" required 
                className="w-full border-4 border-black p-3 font-bold outline-none focus:bg-purple-100"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button 
              disabled={loading}
              className="w-full bg-black text-white p-4 font-black uppercase hover:bg-gray-800 transition-colors shadow-[4px_4px_0px_0px_rgba(100,100,100,1)]"
            >
              {loading ? 'Authenticating...' : 'Login'}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t-4 border-black"></span></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 font-black italic">OR_OAUTH</span></div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            className="w-full border-4 border-black p-3 font-black uppercase flex items-center justify-center gap-2 hover:bg-green-400 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="G" />
            Login with Google
          </button>
        </div>
      </div>

      {/* CUTSCENE OVERLAY - Dipindahkan ke dalam return fragment */}
      {/* CUTSCENE OVERLAY */}
{isBooting && (
  <div className="fixed inset-0 z-[100] bg-purple-900 flex flex-col items-center justify-center text-white font-mono p-4 overflow-hidden">
    
    <div className="space-y-8 text-center">
      {/* Teks 1: Welcome (Muncul detik 0.5) */}
      <h2 
        className="text-xl md:text-2xl uppercase tracking-[0.2em] opacity-0 animate-text-seq"
        style={{ animationDelay: '0.5s' }}
      >
        Welcome <span className="text-green-400 font-black">{studentName}</span>...
      </h2>

      {/* Teks 2: To (Muncul detik 1.5) */}
      <p 
        className="text-lg uppercase tracking-widest opacity-0 animate-text-seq"
        style={{ animationDelay: '1.8s' }}
      >
        To Website...
      </p>

      {/* Teks 3: Logo (Muncul detik 2.8) */}
      <h1 
        className="text-5xl md:text-7xl font-black italic underline decoration-green-400 opacity-0 animate-text-seq"
        style={{ animationDelay: '2.8s' }}
      >
        TI-25-KA
      </h1>
    </div>

    {/* Indikator Loading */}
    <div className="absolute bottom-20 w-full max-w-[250px] px-4">
      <div className="h-1 bg-gray-900 w-full overflow-hidden border border-white/10">
        <div className="h-full bg-green-500 animate-progress"></div>
      </div>
      <div className="flex justify-between mt-2">
        <p className="text-[10px] text-gray-500 animate-pulse uppercase">
          Loading_to_website...
        </p>
        <p className="text-[10px] text-green-500 font-bold uppercase">Ready</p>
      </div>
    </div>

    {/* OVERLAY HITAM UNTUK FADE OUT (Muncul detik 4) */}
    {/* Ini yang akan menutup semua teks sebelum pindah halaman */}
    <div 
      className="absolute inset-0 bg-black opacity-0 animate-final-fade z-[110] pointer-events-none"
      style={{ animationDelay: '4s' }}
    ></div>
  </div>
)}
    </>
  );
}