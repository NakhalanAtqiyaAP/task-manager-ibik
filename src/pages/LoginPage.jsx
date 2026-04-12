// src/components/Login.jsx
import { supabase } from '../lib/supabase';

export default function Login() {
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Redirect kembali ke halaman utama setelah login sukses di Google
        redirectTo: window.location.origin
      }
    });

    if (error) {
      alert("Gagal memanggil Google Auth: " + error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-yellow-400 p-4 selection:bg-black selection:text-white"
         style={{ 
           backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
           backgroundSize: '40px 40px' 
         }}>
      
      <div className="bg-white border-8 border-black p-8 max-w-md w-full shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] text-center">
        <h1 className="text-4xl font-black uppercase mb-2">TI-25-KA</h1>
        <div className="bg-black text-white font-black uppercase tracking-widest p-2 mb-8 inline-block transform -rotate-2">
          Sistem_Akademik
        </div>
        
        <p className="font-bold text-gray-600 mb-8">
          Akses terbatas. Silakan login menggunakan Email Kampus yang telah terdaftar di database.
        </p>

        <button 
          onClick={handleGoogleLogin}
          className="w-full bg-white border-4 border-black p-4 font-black uppercase text-lg flex items-center justify-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none hover:bg-green-400 transition-all"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6" />
          Login via Google
        </button>

        <div className="mt-8 pt-4 border-t-4 border-black border-dashed text-xs font-black text-gray-400 uppercase">
          // Restriced_Area • Verified_Students_Only
        </div>
      </div>
    </div>
  );
}