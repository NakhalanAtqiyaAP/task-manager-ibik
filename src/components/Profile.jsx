import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Cropper from 'react-easy-crop'; // IMPORT LIBRARY CROP
import { jsPDF } from 'jspdf';

import { 
  Camera, Plus, X, Save, Edit3, LogOut, Hash, Quote, Lock, Eye, EyeOff,
  Link as LinkIcon, Globe, Check, Download, Trophy
} from 'lucide-react';


// ==========================================
// UTILITY FUNCTION UNTUK MEMOTONG GAMBAR (CANVAS)
// ==========================================
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    // Convert canvas ke File Blob (JPEG format)
    canvas.toBlob((file) => {
      resolve(file);
    }, 'image/jpeg');
  });
}
// ==========================================

export default function Profile({ userEmail, onProfileUpdate, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [uploading, setUploading] = useState(false);
  const [tagInput, setTagInput] = useState("");
  
  const [socialPlatform, setSocialPlatform] = useState("Instagram");
  const [socialUrl, setSocialUrl] = useState("");

  // === STATE UNTUK CROP GAMBAR ===
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    async function getProfile() {
      if (!userEmail) return;
      const { data } = await supabase.from('students').select('*').eq('email', userEmail).single();
      if (data) {
        setProfile(data);
        const hobbyArray = data.hobby ? data.hobby.split(',').map(h => h.trim()) : [];
        const mediaSosialArray = data.media_sosial || [];
        setFormData({ ...data, hobby: hobbyArray, media_sosial: mediaSosialArray });
      }
    }
    getProfile();
  }, [userEmail]);

  // HOBBY LOGIC
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
    setFormData({ ...formData, hobby: formData.hobby.filter(tag => tag !== tagToRemove) });
  };

  // SOCIAL MEDIA LOGIC
  const getSocialIcon = (platform, size = 16) => {
    const p = platform.toLowerCase();
    const style = { width: size, height: size, fill: 'currentColor' };
    switch(p) {
      case 'instagram': return <svg viewBox="0 0 24 24" style={style}><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>;
      case 'github': return <svg viewBox="0 0 24 24" style={style}><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.041-1.416-4.041-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>;
      case 'linkedin': return <svg viewBox="0 0 24 24" style={style}><path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/></svg>;
      case 'twitter': return <svg viewBox="0 0 24 24" style={style}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
      default: return <Globe size={size} />;
    }
  };

  const addSocial = (e) => {
    e.preventDefault();
    if (socialUrl.trim()) {
      let finalUrl = socialUrl.trim();
      if (!finalUrl.startsWith('http')) finalUrl = `https://${finalUrl}`;
      setFormData({ ...formData, media_sosial: [...(formData.media_sosial || []), { platform: socialPlatform, url: finalUrl }] });
      setSocialUrl(""); 
    }
  };

  const removeSocial = (indexToRemove) => {
    setFormData({ ...formData, media_sosial: formData.media_sosial.filter((_, index) => index !== indexToRemove) });
  };

  // === IMAGE CROP & UPLOAD LOGIC ===
  const onFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result);
        setIsCropModalOpen(true); // Buka Modal Crop
      });
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropConfirm = async () => {
    try {
      setUploading(true);
      setIsCropModalOpen(false); // Tutup Modal
      
      // Ambil hasil crop dari Canvas
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      
      // Siapkan nama file
      const fileName = `${profile.nim}-${Math.random()}.jpg`;
      
      // Upload ke Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, croppedBlob, { contentType: 'image/jpeg' }); // Pastikan format diset ke JPEG

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);

      setFormData({ ...formData, avatar_url: publicUrl });
      toast.success("PHOTO CROPPED & UPLOADED! KLIK SIMPAN.", {
        position: 'top-center',
        className: 'border-4 border-black rounded-none font-black bg-yellow-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
      });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUploading(false);
      setImageSrc(null); // Bersihkan state gambar
    }
  };

  // UPDATE DB LOGIC
  const handleUpdate = async () => {
    const { error } = await supabase
      .from('students')
      .update({
        hobby: formData.hobby.join(', '), 
        password: formData.password,
        avatar_url: formData.avatar_url,
        quotes: formData.quotes,
        media_sosial: formData.media_sosial 
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

  const downloadCertificate = (certData) => {
  const doc = new jsPDF({ 
    orientation: 'landscape', 
    unit: 'mm', 
    format: 'a4' 
  });

  const purple800 = [91, 33, 182];
  const green400 = [74, 222, 128];

  // 1. BACKGROUND
  doc.setFillColor(purple800[0], purple800[1], purple800[2]);
  doc.rect(0, 0, 297, 210, 'F');

  // 2. BORDER
  doc.setDrawColor(green400[0], green400[1], green400[2]);
  doc.setLineWidth(5);
  doc.rect(5, 5, 287, 200, 'S');

  // 3. AKSEN SUDUT (Ini yang tadi hilang)
  doc.setFillColor(green400[0], green400[1], green400[2]);
  doc.rect(0, 0, 50, 20, 'F');
  doc.rect(247, 190, 50, 20, 'F');

  // 4. HEADER
  doc.setTextColor(green400[0], green400[1], green400[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(45);
  doc.text("SERTIFIKAT PENGHARGAAN", 20, 40);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text(`${certData.title} TI-25-KA`, 20, 55);

  // 5. PENERIMA
  doc.setFontSize(18);
  doc.setFont("helvetica", "normal");
  doc.text("Diberikan dengan penuh hormat kepada:", 148, 95, { align: "center" });

  // --- LOGIKA RESPONSIVE NAMA ---
  let fontSize = 60;
  const cleanName = profile.nama.toUpperCase();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(fontSize);
  while (doc.getTextWidth(cleanName) > 250 && fontSize > 20) {
    fontSize -= 2;
    doc.setFontSize(fontSize);
  }
  doc.setTextColor(green400[0], green400[1], green400[2]);
  doc.text(cleanName, 148, 120, { align: "center" });

  // 6. KETERANGAN PRESTASI
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "italic");
  doc.text(`Telah mendominasi bulan ${certData.month} dengan menyelesaikan`, 148, 140, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.text(`${certData.score} TUGAS TEPAT WAKTU (ON-TIME)`, 148, 148, { align: "center" });

  // 7. TANGGAL TERBIT (Bagian ini juga tadi terlewat)
  doc.setLineWidth(1);
  doc.setDrawColor(255, 255, 255);
  doc.line(100, 165, 197, 165);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(green400[0], green400[1], green400[2]);
  doc.text("TANGGAL TERBIT:", 148, 175, { align: "center" });
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  // Kita gunakan certData.date jika ada di database, kalau tidak ada pakai tanggal hari ini
  const tgl = certData.date || new Date().toLocaleDateString('id-ID', { 
    day: 'numeric', month: 'long', year: 'numeric' 
  });
  doc.text(tgl.toUpperCase(), 148, 183, { align: "center" });

  // 8. FOOTER
  doc.setFontSize(10);
  doc.text("TI-25-KA", 20, 200);

  doc.save(`Sertifikat_${certData.month.replace(/\s+/g, '_')}_${profile.nama}.pdf`);
};

  return (
    <>
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
                  {/* UBAH EVENT ONCHANGE DI SINI */}
                  <input type="file" accept="image/*" className="hidden" onChange={onFileChange} disabled={uploading} />
                </label>
              )}
            </motion.div>
            {uploading && (
              <div className="absolute -bottom-2 -right-2 bg-blue-500 border-2 border-black p-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
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

        {/* BODY */}
        <div className="border-t-8 border-black border-dashed pt-8 space-y-6 flex-1">
          
          {/* HOBBY SECTION */}
          <section>
            <label className="flex items-center gap-2 font-black text-[10px] uppercase mb-2 text-gray-500">
              <Hash size={12} /> HOBBY_STACK
            </label>
            <div className="border-4 border-black p-3 bg-gray-50 flex flex-wrap gap-2 mb-3 shadow-inner min-h-[60px]">
              <AnimatePresence>
                {formData.hobby?.map((tag, index) => (
                  <motion.span 
                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} key={tag} 
                    className="bg-yellow-300 border-2 border-black px-2 py-1 text-[10px] font-black uppercase flex items-center gap-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                  >
                    {tag}
                    {isEditing && (
                      <button onClick={() => removeTag(tag)} className="hover:text-red-600 transition-colors"><X size={12} strokeWidth={4} /></button>
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
                  value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={addTag}
                />
                <button onClick={addTag} className="bg-black text-white border-4 border-black px-6 hover:bg-white hover:text-black transition-all">
                  <Plus size={20} strokeWidth={4} />
                </button>
              </motion.div>
            )}
          </section>
          <section>
  <label className="flex items-center gap-2 font-black text-[10px] uppercase mb-2 text-gray-500">
    <Trophy size={12} /> ACHIEVEMENT_LOCKED
  </label>
  <div className="border-4 border-black p-4 bg-gray-50 flex flex-wrap gap-4 shadow-inner min-h-[100px]">
    {profile.sertifikat && profile.sertifikat.length > 0 ? (
      profile.sertifikat.map((cert, index) => (
        <motion.div 
          key={index}
          whileHover={{ scale: 1.05, rotate: 2 }}
          className="group relative bg-yellow-400 border-4 border-black p-3 flex flex-col items-center justify-center min-w-[110px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        >
          <Trophy size={28} className="mb-2 text-black" strokeWidth={2.5} />
          <span className="text-[9px] font-black uppercase text-center leading-tight mb-1">{cert.title}</span>
          <span className="text-[8px] font-bold bg-white border-2 border-black px-2 py-0.5 uppercase">{cert.month}</span>
          
          {/* Tombol Download Overlay */}
          <button 
            onClick={() => downloadCertificate(cert)}
            className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity duration-200"
          >
            <Download size={20} className="text-green-400 mb-1" strokeWidth={3} />
            <span className="text-[8px] text-white font-black uppercase">Download</span>
          </button>
        </motion.div>
      ))
    ) : (
      <div className="flex flex-col items-center justify-center w-full py-4 opacity-30 grayscale">
        <Trophy size={32} className="mb-2" />
        <span className="text-[10px] font-black uppercase italic tracking-widest">NO_ACHIEVEMENTS_YET</span>
      </div>
    )}
  </div>
</section>

          {/* SOCIAL MEDIA SECTION */}
          <section>
            <label className="flex items-center gap-2 font-black text-[10px] uppercase mb-2 text-gray-500">
              <LinkIcon size={12} /> SOCIAL_NETWORK
            </label>
            <div className="border-4 border-black p-3 bg-gray-50 flex flex-wrap gap-3 shadow-inner min-h-[60px]">
              {formData.media_sosial?.map((social, index) => (
                <div key={index} className="bg-blue-300 border-2 border-black px-3 py-1.5 flex items-center gap-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all">
                  {getSocialIcon(social.platform)}
                  {!isEditing ? (
                    <a href={social.url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase hover:underline">{social.platform}</a>
                  ) : (
                    <>
                      <span className="text-[10px] font-black uppercase">{social.platform}</span>
                      <button onClick={() => removeSocial(index)} className="text-red-600 hover:text-red-800 transition-colors ml-1 border-l-2 border-black pl-2">
                        <X size={12} strokeWidth={4} />
                      </button>
                    </>
                  )}
                </div>
              ))}
              {formData.media_sosial?.length === 0 && <span className="text-[10px] text-gray-400 italic font-bold tracking-widest mt-1">NO_LINKS...</span>}
            </div>
            {isEditing && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex flex-col sm:flex-row gap-2 mt-3 p-3 border-4 border-black bg-white">
                <select 
                  value={socialPlatform} onChange={(e) => setSocialPlatform(e.target.value)}
                  className="border-4 border-black p-2 font-black text-xs uppercase bg-yellow-100 outline-none cursor-pointer sm:w-1/3 focus:bg-yellow-300"
                >
                  <option value="Instagram">Instagram</option>
                  <option value="Github">GitHub</option>
                  <option value="Linkedin">LinkedIn</option>
                  <option value="Twitter">Twitter/X</option>
                  <option value="Website">Personal Web</option>
                </select>
                <div className="flex gap-2 flex-1">
                  <input 
                    type="url" placeholder="https://..." value={socialUrl} onChange={(e) => setSocialUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addSocial(e)}
                    className="flex-1 border-4 border-black p-2 font-bold text-xs outline-none focus:bg-blue-100"
                  />
                  <button onClick={addSocial} className="bg-black text-white border-4 border-black px-4 hover:bg-green-400 hover:text-black transition-colors font-black uppercase text-xs">
                    <Plus size={16} strokeWidth={3} />
                  </button>
                </div>
              </motion.div>
            )}
          </section>

          {/* QUOTES SECTION */}
          <section>
            <label className="flex items-center gap-2 font-black text-[10px] uppercase mb-2 text-gray-500">
              <Quote size={12} /> QUOTE LIFE
            </label>
            <textarea 
              disabled={!isEditing} value={formData.quotes || ''} onChange={(e) => setFormData({...formData, quotes: e.target.value})}
              className="w-full border-4 border-black p-4 font-bold text-sm italic focus:bg-blue-50 disabled:bg-gray-100 resize-none h-24 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] outline-none"
            />
          </section>

          {/* PASSWORD SECTION */}
          <section>
          <label className="flex items-center gap-2 font-black text-[10px] uppercase mb-2 text-gray-500">
            <Lock size={12} /> PASSWORD
          </label>
          <div className="relative group">
            <input 
              // Logika tipe input: jika showPassword true, tampilkan teks. 
              type={showPassword ? "text" : "password"} 
              disabled={!isEditing} 
              value={formData.password || ''} 
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full border-4 border-black p-4 font-black tracking-widest focus:bg-red-50 disabled:bg-gray-100 text-red-600 outline-none transition-colors"
            />
            
            {/* Tombol Show/Hide Password */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-black hover:text-white transition-all border-2 border-transparent active:border-black"
            >
              {showPassword ? (
                <EyeOff size={20} strokeWidth={3} />
              ) : (
                <Eye size={20} strokeWidth={3} />
              )}
            </button>
          </div>
        </section>

          {/* ACTION BUTTONS */}
          <div className="pt-4 space-y-3 pb-8">
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="w-full bg-green-400 border-4 border-black py-4 font-black uppercase text-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none hover:bg-green-400 transition-all flex items-center justify-center gap-3">
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
            
            <button onClick={onLogout} className="w-full bg-red-600 text-white py-4 font-black uppercase border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:bg-red-700 transition-all flex items-center justify-center gap-3 mt-4">
              <LogOut size={20} strokeWidth={3} /> Logout
            </button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isCropModalOpen && imageSrc && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          >
            <div className="bg-white border-8 border-black shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] w-full max-w-md flex flex-col">
              
              <div className="bg-yellow-400 border-b-4 border-black p-4 font-black uppercase flex justify-between items-center">
                <span>Crop Avatar</span>
                <button onClick={() => {setIsCropModalOpen(false); setImageSrc(null);}} className="hover:text-red-600 transition-colors">
                  <X size={24} strokeWidth={4} />
                </button>
              </div>

              <div className="relative w-full h-80 bg-gray-200">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1} // Mengunci rasio potong menjadi persegi (1:1)
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              </div>

              <div className="p-4 bg-gray-50 border-t-4 border-black space-y-4">
                <div>
                  <label className="font-black text-xs uppercase text-gray-500 mb-1 block">Zoom</label>
                  <input 
                    type="range" value={zoom} min={1} max={3} step={0.1} aria-labelledby="Zoom" onChange={(e) => setZoom(e.target.value)}
                    className="w-full accent-black"
                  />
                </div>
                <div className="flex gap-4">
                  <button onClick={() => {setIsCropModalOpen(false); setImageSrc(null);}} className="flex-1 bg-gray-300 border-4 border-black py-3 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all">
                    Batal
                  </button>
                  <button onClick={handleCropConfirm} className="flex-1 bg-green-400 border-4 border-black py-3 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2">
                    <Check size={20} strokeWidth={4} /> Upload
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}