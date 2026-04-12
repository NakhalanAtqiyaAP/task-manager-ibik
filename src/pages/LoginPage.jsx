import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [nim, setNim] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Fungsi mencatat histori ke database
  const logHistory = async (userEmail, method) => {
    const { data: student } = await supabase
      .from('students')
      .select('id')
      .eq('email', userEmail)
      .single();

    if (student) {
      await supabase.from('login_history').insert([
        { student_id: student.id, email: userEmail, login_method: method }
      ]);
    }
  };

 // src/pages/LoginPage.jsx

const handleManualLogin = async (e) => {
  e.preventDefault();
  setLoading(true);

  // 1. Cek ke tabel public.students
  const { data: student, error } = await supabase
    .from('students')
    .select('*')
    .eq('nim', nim.trim())
    .eq('password', password.trim())
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Login manual error:', error);
  }

  if (!student) {
    alert('Kombinasi NIM dan Password salah atau tidak terdaftar!');
    setLoading(false);
    return;
  }

  const { email: studentEmail, id: studentId, nama, nim: studentNim, kelas, avatar_url } = student;

  // --- BAGIAN INI DIHAPUS/DIKOMENTAR KARENA MENYEBABKAN ERROR 400 ---
  /*
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: studentEmail,
    password: password.trim(),
  });
  */
  // -----------------------------------------------------------------

  // 2. Catat Histori
  await supabase.from('login_history').insert([
    { student_id: studentId, email: studentEmail, login_method: 'manual' }
  ]);

  // 3. Simpan ke Local Storage untuk dibaca App.jsx
  localStorage.setItem('manual_auth_user', JSON.stringify({
    id: studentId,
    email: studentEmail,
    nama,
    nim: studentNim,
    kelas,
    avatar_url,
    login_method: 'manual',
    authenticated_at: new Date().toISOString(),
  }));

  alert(`Selamat datang, ${nama}!`);
  // Redirect ke Home
  window.location.href = window.location.origin;
};
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    if (error) alert(error.message);
    // Note: Histori Google login sebaiknya dicatat di App.jsx setelah redirect berhasil
  };

  return (
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
            {loading ? 'Authenticating...' : 'Enter System'}
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
  );
}