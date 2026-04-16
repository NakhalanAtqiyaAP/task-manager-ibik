import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Image, Film, Send, X, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CreatePost({ user, onPostCreated }) {
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]); // Sekarang pakai Array
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // Validasi tipe & tambahkan preview local
    const newFiles = selectedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith('image/') ? 'image' : 'video'
    }));

    setFiles([...files, ...newFiles]);
  };

  const removeFile = (index) => {
    const newFiles = [...files];
    URL.revokeObjectURL(newFiles[index].preview); // Bersihkan memori
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content && files.length === 0) return toast.error("Postingan kosong!");

    setUploading(true);
    let uploadedUrls = [];
    let uploadedTypes = [];

    try {
      // 1. Upload semua file secara paralel
      if (files.length > 0) {
        const uploadPromises = files.map(async (item) => {
          const fileExt = item.file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${user.id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('gallery_media')
            .upload(filePath, item.file);

          if (uploadError) throw uploadError;

          const { data: urlData } = supabase.storage
            .from('gallery_media')
            .getPublicUrl(filePath);
          
          return { url: urlData.publicUrl, type: item.type };
        });

        const results = await Promise.all(uploadPromises);
        uploadedUrls = results.map(r => r.url);
        uploadedTypes = results.map(r => r.type);
      }

      // 2. Simpan Data (Pastikan kolom di DB adalah Array/TEXT[])
      const { error: postError } = await supabase.from('posts').insert([{
        student_id: user.id,
        content_text: content,
        media_urls: uploadedUrls, // Array URL
        media_types: uploadedTypes // Array Tipe
      }]);

      if (postError) throw postError;

      toast.success("Berhasil posting ke Gallery!");
      setContent('');
      setFiles([]);
      onPostCreated(); 
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-12">
      <h3 className="text-xl font-black uppercase mb-4 italic">BUAT POSTINGAN</h3>
      <form onSubmit={handleSubmit}>
        <textarea 
          className="w-full border-4 border-black p-4 font-bold focus:outline-none focus:bg-yellow-50 min-h-[100px]"
          placeholder="Apa momen seru hari ini?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        {/* Preview Grid */}
        {files.length > 0 && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {files.map((item, index) => (
              <div key={index} className="relative aspect-square border-2 border-black group">
                {item.type === 'image' ? (
                  <img src={item.preview} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-black flex items-center justify-center">
                    <Film className="text-white" />
                  </div>
                )}
                <button 
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white border-2 border-black p-1 hover:scale-110 transition-transform">
                  <X size={14} strokeWidth={4} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2">
            <label className="cursor-pointer bg-purple-400 border-2 border-black px-4 py-2 font-black text-xs uppercase flex items-center gap-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all">
              <Image size={18} /> MEDIA
              <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
            </label>
          </div>

          <button 
            type="submit" 
            disabled={uploading}
            className="bg-green-400 text-black border-4 border-black px-8 py-2 font-black uppercase flex items-center gap-2 disabled:opacity-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 transition-all"
          >
            {uploading ? 'UPLOADING...' : <><Send size={18} /> POSTING</>}
          </button>
        </div>
      </form>
    </div>
  );
}