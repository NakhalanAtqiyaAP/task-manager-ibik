import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Image, Film, Type, Send, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CreatePost({ user, onPostCreated }) {
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [mediaType, setMediaType] = useState('text'); // image, video, text
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.type.startsWith('image/')) setMediaType('image');
    else if (selectedFile.type.startsWith('video/')) setMediaType('video');
    
    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content && !file) return toast.error("Postingan tidak boleh kosong!");

    setUploading(true);
    let mediaUrl = null;

    try {
      // 1. Upload File jika ada
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('gallery_media')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('gallery_media')
          .getPublicUrl(filePath);
        
        mediaUrl = urlData.publicUrl;
      }

      // 2. Simpan Data ke Tabel Posts
      const { error: postError } = await supabase.from('posts').insert([{
        student_id: user.id,
        content_text: content,
        media_url: mediaUrl,
        media_type: file ? mediaType : 'text'
      }]);

      if (postError) throw postError;

      toast.success("Berhasil posting ke Gallery!");
      setContent('');
      setFile(null);
      setMediaType('text');
      onPostCreated(); // Refresh list
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-12">
      <h3 className="text-xl font-black uppercase mb-4 italic">// BUAT_POSTINGAN_BARU</h3>
      <form onSubmit={handleSubmit}>
        <textarea 
          className="w-full border-4 border-black p-4 font-bold focus:outline-none focus:bg-yellow-50 min-h-[100px] transition-colors"
          placeholder="Apa yang terjadi di TI-25-KA hari ini?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2">
            <label className="cursor-pointer bg-green-400 border-2 border-black px-3 py-1.5 font-black text-xs uppercase flex items-center gap-2 hover:translate-x-0.5 hover:translate-y-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all">
              <Image size={16} /> FOTO
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
            <label className="cursor-pointer bg-blue-400 border-2 border-black px-3 py-1.5 font-black text-xs uppercase flex items-center gap-2 hover:translate-x-0.5 hover:translate-y-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all">
              <Film size={16} /> VIDEO
              <input type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
            </label>
          </div>

          <button 
            type="submit" 
            disabled={uploading}
            className="bg-purple-600 text-white border-4 border-black px-6 py-2 font-black uppercase flex items-center gap-2 hover:bg-purple-500 disabled:opacity-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all"
          >
            {uploading ? 'MEMO_POSTING...' : <><Send size={18} /> POSTING</>}
          </button>
        </div>

        {file && (
          <div className="mt-4 p-2 border-2 border-black bg-gray-100 flex items-center justify-between">
            <span className="text-xs font-bold truncate">📎 {file.name}</span>
            <button onClick={() => setFile(null)} className="text-red-600"><X size={16}/></button>
          </div>
        )}
      </form>
    </div>
  );
}