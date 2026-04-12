// src/components/Profile.jsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Profile({ userEmail, onProfileUpdate, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    async function getProfile() {
      if (!userEmail) return;
      const { data } = await supabase
        .from('students')
        .select('*')
        .eq('email', userEmail)
        .single();
      setProfile(data);
      setFormData(data);
    }
    getProfile();
  }, [userEmail]);

  const handleUpdate = async () => {
    const { error } = await supabase
      .from('students')
      .update({
        hobby: formData.hobby,
        password: formData.password,
        avatar_url: formData.avatar_url
      })
      .eq('email', userEmail);

    if (!error) {
      alert("Profil Berhasil Diperbarui!");
      setIsEditing(false);
      setProfile(formData);
      
      // Beri tahu App.jsx agar Avatar di Navbar langsung berubah (realtime)
      if (onProfileUpdate) onProfileUpdate(formData); 
    } else {
      alert("Gagal update: " + error.message);
    }
  };

  if (!profile) return <div className="p-8 font-black animate-pulse text-center">FETCHING_DATA...</div>;

  return (
    <div className="space-y-8 flex flex-col h-full">
      {/* HEADER: AVATAR & INFO */}
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="w-32 h-32 border-4 border-black overflow-hidden bg-purple-200 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <img 
            src={profile.avatar_url || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${profile.nama}`} 
            alt="Avatar" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div>
          <h2 className="text-2xl font-black uppercase italic underline break-words">{profile.nama}</h2>
          <div className="flex flex-col gap-2 mt-3 items-center">
            <span className="bg-black text-white px-3 py-1 font-black text-sm uppercase tracking-widest">
              NIM: {profile.nim}
            </span>
            <span className="bg-yellow-400 border-2 border-black px-3 py-1 font-black text-xs uppercase">
              CLASS: {profile.kelas || 'TI-25-KA'}
            </span>
          </div>
        </div>
      </div>

      <div className="border-t-4 border-black border-dashed pt-6 flex-1">
        {/* FORM EDIT */}
        <div className="space-y-4">
          <div>
            <label className="block font-black text-xs uppercase mb-1 text-gray-500">// HOBI_KAMU</label>
            <input 
              disabled={!isEditing}
              className="w-full border-4 border-black p-3 font-bold focus:bg-green-100 disabled:bg-gray-100"
              value={formData.hobby || ''}
              onChange={(e) => setFormData({...formData, hobby: e.target.value})}
            />
          </div>
          <div>
            <label className="block font-black text-xs uppercase mb-1 text-gray-500">// PASSWORD_SISTEM</label>
            <input 
              type={isEditing ? "text" : "password"}
              disabled={!isEditing}
              className="w-full border-4 border-black p-3 font-bold focus:bg-red-100 disabled:bg-gray-100 text-red-600"
              value={formData.password || ''}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          <div>
            <label className="block font-black text-xs uppercase mb-1 text-gray-500">// AVATAR_URL</label>
            <textarea 
              rows="2"
              disabled={!isEditing}
              className="w-full border-4 border-black p-3 font-bold focus:bg-blue-100 disabled:bg-gray-100 text-xs"
              placeholder="Kosongkan untuk default"
              value={formData.avatar_url || ''}
              onChange={(e) => setFormData({...formData, avatar_url: e.target.value})}
            />
          </div>

          <div className="pt-2 flex flex-col gap-3">
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="w-full bg-white border-4 border-black px-6 py-3 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none hover:bg-green-400 transition-all"
              >
                Edit Profil
              </button>
            ) : (
              <>
                <button 
                  onClick={handleUpdate}
                  className="w-full bg-green-400 border-4 border-black px-6 py-3 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
                >
                  Simpan Perubahan
                </button>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="w-full bg-red-400 text-white border-4 border-black px-6 py-3 font-black uppercase hover:bg-red-500"
                >
                  Batal
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* TOMBOL LOGOUT DIPINDAH KE BAWAH PROFIL */}
      <div className="pt-6 border-t-4 border-black mt-auto">
         <button 
            onClick={onLogout}
            className="w-full bg-black text-white px-6 py-4 font-black uppercase hover:bg-white hover:text-black hover:border-black border-4 border-black transition-all shadow-[4px_4px_0px_0px_rgba(100,100,100,1)] hover:shadow-none hover:translate-y-1 hover:translate-x-1"
          >
            LOGOUT SYSTEM
         </button>
      </div>
    </div>
  );
}