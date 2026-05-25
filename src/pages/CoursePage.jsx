import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MessageSquare, Image, Film, Send } from 'lucide-react';

export default function DicodingStyleCourse() {
  const [activeSemester, setActiveSemester] = useState(1);
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [contents, setContents] = useState([]);
  const [comments, setComments] = useState([]);
  
  // State Input Komentar
  const [userComment, setUserComment] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [mediaFile, setMediaFile] = useState(null);

  // Ambil semua Pertemuan berdasarkan semester yang aktif
  useEffect(() => {
    async function loadSessions() {
      const { data } = await supabase
        .from('course_sessions')
        .select(`id, judul_pertemuan, urutan, courses!inner(semester)`)
        .eq('courses.semester', activeSemester)
        .order('urutan', { ascending: true });
      
      setSessions(data || []);
      if (data && data.length > 0) setActiveSession(data[0]);
    }
    loadSessions();
  }, [activeSemester]);

  // Ambil konten materi & komentar jika sesi aktif berubah
  useEffect(() => {
    if (!activeSession) return;

    async function loadContentAndComments() {
      const { data: contentData } = await supabase.from('course_contents').select('*').eq('session_id', activeSession.id);
      const { data: commentData } = await supabase.from('course_comments').select('*').eq('session_id', activeSession.id).order('created_at', { ascending: true });
      
      setContents(contentData || []);
      setComments(commentData || []);
    }
    loadContentAndComments();
  }, [activeSession]);

  // Handler Kirim Komentar + Upload Media (Foto/Video)
  const handleSendComment = async (e) => {
    e.preventDefault();
    if (!userComment && !mediaFile) return;

    setUploadingFile(true);
    let uploadedUrl = null;
    let detectedType = null;

    if (mediaFile) {
      detectedType = mediaFile.type.startsWith('image/') ? 'image' : 'video';
      const fileExt = mediaFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('course-media')
        .upload(fileName, mediaFile);

      if (uploadError) {
        alert("Gagal unggah media: " + uploadError.message);
        setUploadingFile(false);
        return;
      }

      const { data } = supabase.storage.from('course-media').getPublicUrl(fileName);
      uploadedUrl = data.publicUrl;
    }

    const { error } = await supabase.from('course_comments').insert([{
      session_id: activeSession.id,
      nama_user: "Mahasiswa TI-25-KA", // Ganti dengan nama user yang login
      komentar_teks: userComment,
      media_url: uploadedUrl,
      media_type: detectedType
    }]);

    if (!error) {
      setUserComment('');
      setMediaFile(null);
      // Reload comments
      const { data } = await supabase.from('course_comments').select('*').eq('session_id', activeSession.id).order('created_at', { ascending: true });
      setComments(data || []);
    }
    setUploadingFile(false);
  };

  return (
    <div className="p-6 bg-[#f0f4f8] min-h-screen text-black font-sans">
      {/* 1. Tab Semester */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 border-b-4 border-black">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
          <button
            key={sem}
            onClick={() => setActiveSemester(sem)}
            className={`px-6 py-3 border-4 border-black font-black uppercase text-sm tracking-wider shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all whitespace-nowrap ${activeSemester === sem ? 'bg-[#a3e635]' : 'bg-white'}`}
          >
            Semester {sem}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 2. Sidebar Kiri (Daftar Pertemuan) */}
        <div className="bg-white border-4 border-black p-4 shadow-[6px_6px_0_0_rgba(0,0,0,1)] h-fit">
          <h3 className="font-black uppercase text-lg border-b-4 border-black pb-2 mb-3">Daftar Materi</h3>
          <div className="space-y-2">
            {sessions.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSession(s)}
                className={`w-full p-3 border-2 border-black text-left font-bold transition-all text-sm ${activeSession?.id === s.id ? 'bg-[#93c5fd] shadow-[2px_2px_0_0_rgba(0,0,0,1)]' : 'bg-gray-50'}`}
              >
                {s.judul_pertemuan}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Area Utama Pembelajaran */}
        <div className="lg:col-span-3 space-y-6">
          {activeSession && (
            <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
              <h2 className="text-2xl font-black uppercase border-b-4 border-black pb-3 mb-4 bg-purple-200 p-2 border-2 border-black">
                {activeSession.judul_pertemuan}
              </h2>

              {/* Tampilkan isi materi */}
              {contents.map((item) => (
                <div key={item.id} className="space-y-4 mb-6">
                  <h4 className="text-xl font-black">{item.judul_materi}</h4>
                  {item.tipe === 'video' ? (
                    <div className="border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] overflow-hidden aspect-video bg-black">
                      <iframe className="w-full h-full" src={item.video_url?.replace("watch?v=", "embed/")} title={item.judul_materi} allowFullScreen></iframe>
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 border-2 border-black font-medium leading-relaxed whitespace-pre-line">{item.teks_konten}</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 4. Sistem Komentar Interaktif Multi-media */}
          <div className="bg-[#fdba74] border-4 border-black p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
            <h3 className="text-xl font-black uppercase flex items-center gap-2 mb-4"><MessageSquare strokeWidth={3}/> Diskusi Kuliah</h3>
            
            {/* List Chat / Komentar */}
            <div className="space-y-4 max-h-[400px] overflow-y-auto mb-6 bg-white p-4 border-4 border-black">
              {comments.map((comment) => (
                <div key={comment.id} className="border-2 border-black p-3 bg-neutral-50 shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                  <div className="flex justify-between text-xs font-black uppercase mb-1 text-gray-700">
                    <span>👤 {comment.nama_user}</span>
                    <span>{new Date(comment.created_at).toLocaleTimeString()}</span>
                  </div>
                  <p className="font-bold text-gray-900">{comment.komentar_teks}</p>
                  
                  {/* Render file multimedia di dalam komentar jika ada */}
                  {comment.media_url && (
                    <div className="mt-2 max-w-xs border-2 border-black overflow-hidden bg-black">
                      {comment.media_type === 'image' ? (
                        <img src={comment.media_url} alt="attachment" className="w-full h-auto" />
                      ) : (
                        <video src={comment.media_url} controls className="w-full h-auto" />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Form Mengirim Komentar */}
            <form onSubmit={handleSendComment} className="space-y-3">
              <textarea placeholder="Tulis pertanyaan atau tanggapan tugas kelas di sini..." rows={3} className="w-full p-3 border-4 border-black font-bold focus:outline-none" value={userComment} onChange={(e) => setUserComment(e.target.value)} />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex gap-2">
                  <label className="cursor-pointer bg-white hover:bg-gray-100 p-2 border-2 border-black font-black text-xs flex items-center gap-1 shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                    <Image size={16} /> FOTO / VIDEO
                    <input type="file" accept="image/*,video/*" className="hidden" onChange={(e) => setMediaFile(e.target.files[0])} />
                  </label>
                  {mediaFile && <span className="bg-white px-2 py-1 border-2 border-black text-xs font-bold">📂 {mediaFile.name.substring(0, 15)}...</span>}
                </div>
                <button type="submit" disabled={uploadingFile} className="bg-black text-white px-6 py-2 font-black uppercase tracking-wider flex items-center gap-2 shadow-[2px_2px_0_0_rgba(244,114,182,1)] active:translate-y-0.5">
                  <Send size={18}/> {uploadingFile ? 'Mengirim...' : 'KIRIM'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}