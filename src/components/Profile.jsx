import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Profile({ userEmail, onProfileUpdate, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function getProfile() {
      if (!userEmail) return;
      const { data } = await supabase.from('students').select('*').eq('email', userEmail).single();
      setProfile(data);
      setFormData(data);
    }
    getProfile();
  }, [userEmail]);

  // FUNGSI UPLOAD FILE
  const handleFileUpload = async (event) => {
    try {
      setUploading(true);
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.nim}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. Upload ke Storage Supabase
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Ambil URL Publik
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 3. Update preview di form
      setFormData({ ...formData, avatar_url: publicUrl });
      alert("Foto berhasil diunggah! Jangan lupa klik 'Simpan Perubahan'");
    } catch (error) {
      alert('Error uploading avatar: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

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
      if (onProfileUpdate) onProfileUpdate(formData); 
      
      // Update juga localStorage agar data tetap sinkron saat refresh
      const localData = JSON.parse(localStorage.getItem('manual_auth_user'));
      localStorage.setItem('manual_auth_user', JSON.stringify({...localData, ...formData}));
    }
  };

  if (!profile) return <div className="p-8 font-black animate-pulse text-center">FETCHING_DATA...</div>;

  return (
    <div className="space-y-8 flex flex-col h-full">
      <div className="flex flex-col items-center text-center space-y-4">
        {/* AVATAR BOX DENGAN INPUT FILE */}
        <div className="relative group">
          <div className="w-32 h-32 border-4 border-black overflow-hidden bg-purple-200 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <img 
              src={formData.avatar_url || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${profile.nama}`} 
              alt="Avatar" 
              className="w-full h-full object-cover"
            />
          </div>
          
          {isEditing && (
            <label className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white font-black text-[10px] uppercase underline">Ganti Foto</span>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileUpload} 
                disabled={uploading}
              />
            </label>
          )}
        </div>
        {uploading && <p className="text-[10px] font-black animate-bounce text-blue-600 uppercase">Uploading...</p>}
        
        <div>
          <h2 className="text-2xl font-black uppercase italic underline break-words">{profile.nama}</h2>
          <div className="flex flex-col gap-2 mt-3 items-center">
            <span className="bg-black text-white px-3 py-1 font-black text-sm uppercase">NIM: {profile.nim}</span>
            <span className="bg-yellow-400 border-2 border-black px-3 py-1 font-black text-xs uppercase">CLASS: {profile.kelas}</span>
          </div>
        </div>
      </div>

      <div className="border-t-4 border-black border-dashed pt-6 flex-1">
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

          <div className="pt-2 flex flex-col gap-3">
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="w-full bg-white border-4 border-black px-6 py-3 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none hover:bg-green-400 transition-all">
                Edit Profil
              </button>
            ) : (
              <>
                <button onClick={handleUpdate} className="w-full bg-green-400 border-4 border-black px-6 py-3 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1">
                  Simpan Perubahan
                </button>
                <button onClick={() => setIsEditing(false)} className="w-full bg-red-400 text-white border-4 border-black px-6 py-3 font-black uppercase">
                  Batal
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="pt-6 border-t-4 border-black mt-auto">
         <button 
            onClick={onLogout}
            className="w-full bg-black text-white px-6 py-4 font-black uppercase border-4 border-black shadow-[4px_4px_0px_0px_rgba(100,100,100,1)] hover:bg-red-500 transition-all"
          >
            LOGOUT SYSTEM
         </button>
      </div>
    </div>
  );
}