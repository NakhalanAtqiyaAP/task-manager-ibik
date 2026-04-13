import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion'; // Animasi
import toast from 'react-hot-toast'; // Notifikasi
import { Camera, Plus, X, Save, Edit3, LogOut, Hash, Quote, Lock } from 'lucide-react'; // Ikon

export default function Profile({ userEmail, onProfileUpdate, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [uploading, setUploading] = useState(false);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    async function getProfile() {
      if (!userEmail) return;
      const { data } = await supabase.from('students').select('*').eq('email', userEmail).single();
      if (data) {
        setProfile(data);
        const hobbyArray = data.hobby ? data.hobby.split(',').map(h => h.trim()) : [];
        setFormData({ ...data, hobby: hobbyArray });
      }
    }
    getProfile();
  }, [userEmail]);

  const addTag = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      const val = tagInput.trim().toUpperCase();
      if (val && !formData.hobby.includes(val)) {
        setFormData({ ...formData, hobby: [...formData.hobby, val] });
        setTagInput("");
      }
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      hobby: formData.hobby.filter(tag => tag !== tagToRemove)
    });
  };

  const handleFileUpload = async (event) => {
    try {
      setUploading(true);
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.nim}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

      setFormData({ ...formData, avatar_url: publicUrl });
      toast.success("PHOTO UPLOADED: KLIK SIMPAN UNTUK KONFIRMASI", {
        position: 'top-center',
        className: 'border-4 border-black rounded-none font-black bg-yellow-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
      });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async () => {
    const { error } = await supabase
      .from('students')
      .update({
        hobby: formData.hobby.join(', '), 
        password: formData.password,
        avatar_url: formData.avatar_url,
        quotes: formData.quotes
      })
      .eq('email', userEmail);

    if (!error) {
      toast.success("PROFILE UPDATED: DATA BERHASIL DISIMPAN", {
        position: 'top-center',
        className: 'border-4 border-black rounded-none font-black bg-green-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
      });
      setIsEditing(false);
      setProfile(formData);
      if (onProfileUpdate) onProfileUpdate(formData); 
      const localData = JSON.parse(localStorage.getItem('manual_auth_user'));
      localStorage.setItem('manual_auth_user', JSON.stringify({...localData, ...formData}));
    } else {
      toast.error(error.message);
    }
  };

  if (!profile) return (
    <div className="flex items-center justify-center h-full">
      <div className="font-black text-2xl animate-bounce italic uppercase underline decoration-purple-500 decoration-8">
        // FETCHING_PROFILE_DATA...
      </div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 flex flex-col h-full overflow-y-auto px-2"
    >
      {/* HEADER: AVATAR & BASIC INFO */}
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="relative">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: -2 }}
            className="w-32 h-32 border-8 border-black overflow-hidden bg-purple-200 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative"
          >
            <img 
              src={formData.avatar_url || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${profile.nama}`} 
              alt="Avatar" 
              className="w-full h-full object-cover"
            />
            {isEditing && (
              <label className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                <Camera className="text-white" size={32} />
                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
              </label>
            )}
          </motion.div>
          {uploading && (
            <div className="absolute -bottom-2 -right-2 bg-blue-500 border-2 border-black p-1">
              <div className="animate-spin text-white"><Plus size={16} /></div>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter bg-white px-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] inline-block leading-none py-2">
            {profile.nama}
          </h2>
          <div className="flex gap-2 justify-center">
            <span className="bg-black text-white px-3 py-1 font-black text-xs uppercase italic">NIM: {profile.nim}</span>
            <span className="bg-green-400 border-2 border-black px-3 py-1 font-black text-xs uppercase italic shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">KELAS: {profile.kelas}</span>
          </div>
        </div>
      </div>

      {/* BODY: HOBBY, QUOTES, PASSWORD */}
      <div className="border-t-8 border-black border-dashed pt-8 space-y-6 flex-1">
        
        {/* HOBBY SECTION */}
        <section>
          <label className="flex items-center gap-2 font-black text-[10px] uppercase mb-2 text-gray-500">
            <Hash size={12} /> // HOBBY_STACK
          </label>
          <div className="border-4 border-black p-3 bg-gray-50 flex flex-wrap gap-2 mb-3 shadow-inner min-h-[60px]">
            <AnimatePresence>
              {formData.hobby?.map((tag, index) => (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  key={tag} 
                  className="bg-yellow-300 border-2 border-black px-2 py-1 text-[10px] font-black uppercase flex items-center gap-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                >
                  {tag}
                  {isEditing && (
                    <button onClick={() => removeTag(tag)} className="hover:text-red-600 transition-colors">
                      <X size={12} strokeWidth={4} />
                    </button>
                  )}
                </motion.span>
              ))}
            </AnimatePresence>
            {formData.hobby?.length === 0 && <span className="text-[10px] text-gray-400 italic font-bold tracking-widest">DATA_EMPTY...</span>}
          </div>
          {isEditing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
              <input 
                placeholder="TYPE_HERE..."
                className="flex-1 border-4 border-black p-3 font-black focus:bg-yellow-50 outline-none text-xs uppercase"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={addTag}
              />
              <button onClick={addTag} className="bg-black text-white border-4 border-black px-6 hover:bg-white hover:text-black transition-all">
                <Plus size={20} strokeWidth={4} />
              </button>
            </motion.div>
          )}
        </section>

        {/* QUOTES SECTION */}
        <section>
          <label className="flex items-center gap-2 font-black text-[10px] uppercase mb-2 text-gray-500">
            <Quote size={12} /> // QUOTE_LIFE
          </label>
          <textarea 
            disabled={!isEditing}
            className="w-full border-4 border-black p-4 font-bold text-sm italic focus:bg-blue-50 disabled:bg-gray-100 resize-none h-24 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] outline-none"
            value={formData.quotes || ''}
            onChange={(e) => setFormData({...formData, quotes: e.target.value})}
          />
        </section>

        {/* PASSWORD SECTION */}
        <section>
          <label className="flex items-center gap-2 font-black text-[10px] uppercase mb-2 text-gray-500">
            <Lock size={12} /> // SYSTEM_AUTH
          </label>
          <input 
            type={isEditing ? "text" : "password"}
            disabled={!isEditing}
            className="w-full border-4 border-black p-4 font-black tracking-widest focus:bg-red-50 disabled:bg-gray-100 text-red-600 outline-none"
            value={formData.password || ''}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
        </section>

        {/* ACTION BUTTONS */}
        <div className="pt-4 space-y-3 pb-8">
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)} 
              className="w-full bg-green-400 border-4 border-black py-4 font-black uppercase text-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none hover:bg-green-400 transition-all flex items-center justify-center gap-3"
            >
              <Edit3 size={20} strokeWidth={3} /> Edit Profile
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <button onClick={handleUpdate} className="bg-green-400 border-4 border-black py-4 font-black uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2">
                <Save size={18} /> Simpan
              </button>
              <button onClick={() => setIsEditing(false)} className="bg-red-500 text-white border-4 border-black py-4 font-black uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all">
                Batal
              </button>
            </div>
          )}
          
          <button 
            onClick={onLogout}
            className="w-full bg-red-600 text-white py-4 font-black uppercase border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:bg-red-700 transition-all flex items-center justify-center gap-3 mt-4"
          >
            <LogOut size={20} strokeWidth={3} /> Secure Logout
          </button>
        </div>
      </div>
    </motion.div>
  );
}