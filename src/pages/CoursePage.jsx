import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  BookOpen, ChevronRight, ChevronDown, Video, FileText, 
  Download, Send, Settings, X, Save, MessageSquare, 
  MonitorPlay, Image as ImageIcon, Link as LinkIcon,
  Upload, 
} from 'lucide-react';

export default function CoursePage({ currentUser }) {
  const [activeSemester, setActiveSemester] = useState(2);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  
  const [contents, setContents] = useState([]);
  const [comments, setComments] = useState([]);

  const [commentText, setCommentText] = useState('');
  const [commentMediaUrl, setCommentMediaUrl] = useState('');
  const [commentMediaType, setCommentMediaType] = useState('image');
  const [userName, setUserName] = useState(currentUser?.nama || 'Mahasiswa');

  const [showAdminModal, setShowAdminModal] = useState(false);
  const [crudSemester, setCrudSemester] = useState(2);
  const [crudCourses, setCrudCourses] = useState([]);
  const [selectedCrudCourse, setSelectedCrudCourse] = useState('');
  const [crudSessions, setCrudSessions] = useState([]);
  const [selectedCrudSession, setSelectedCrudSession] = useState('');
  // NEW: text input for session name
  const [sessionNameInput, setSessionNameInput] = useState('');
  
  // NEW: tab state for video and file inputs
  const [videoInputMode, setVideoInputMode] = useState('link'); // 'link' | 'upload'
  const [fileInputMode, setFileInputMode] = useState('upload'); // 'upload' only (files don't have links)
  
  const [isUploading, setIsUploading] = useState(false);
  const [newContent, setNewContent] = useState({
    judul_materi: '',
    teks_konten: '',
    link_url: '', 
  });
  const [videoFile, setVideoFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);

  const neoCard = "border-4 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all";
  const neoBtnPurple = "border-4 border-black bg-[#a855f7] px-4 py-2 font-bold text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-[#c084fc] hover:-translate-y-1 transition-transform flex items-center justify-center gap-2";
  const neoBtnGreen = "border-4 border-black bg-[#22c55e] px-4 py-2 font-bold text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-[#4ade80] hover:-translate-y-1 transition-transform flex items-center justify-center gap-2";
  const neoInput = "border-4 border-black p-3 font-mono shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:bg-[#f3e8ff] w-full bg-white";

  useEffect(() => {
    async function fetchCourses() {
      const { data, error } = await supabase
        .from('courses')
        .select(`id, kode_matkul, semester, mata_kuliah(nama_matkul)`)
        .eq('semester', activeSemester);
      if (!error && data) setCourses(data);
    }
    fetchCourses();
  }, [activeSemester]);

  const handleSelectCourse = async (course) => {
    if (selectedCourse?.id === course.id) {
      setSelectedCourse(null);
      setSessions([]);
      return;
    }
    setSelectedCourse(course);
    setSelectedSession(null);
    setContents([]);
    const { data, error } = await supabase
      .from('course_sessions')
      .select('*')
      .eq('course_id', course.id)
      .order('urutan', { ascending: true });
    if (!error && data) setSessions(data);
  };

  const handleSelectSession = async (session) => {
    setSelectedSession(session);
    
    const { data: contentData } = await supabase
      .from('course_contents')
      .select('*')
      .eq('session_id', session.id);
    if (contentData) setContents(contentData);

    const { data: commentData } = await supabase
      .from('course_comments')
      .select('*')
      .eq('session_id', session.id)
      .order('created_at', { ascending: false });
    if (commentData) setComments(commentData);
  };

  const handleSendComment = async (e) => {
    e.preventDefault();
    if (!commentText && !commentMediaUrl) return;

    const payload = {
      session_id: selectedSession.id,
      nama_user: userName,
      komentar_teks: commentText || null,
      media_url: commentMediaUrl || null,
      media_type: commentMediaUrl ? commentMediaType : null
    };

    const { error } = await supabase.from('course_comments').insert([payload]);
    if (!error) {
      setCommentText('');
      setCommentMediaUrl('');
      handleSelectSession(selectedSession);
    }
  };

  useEffect(() => {
    if (showAdminModal) {
      async function fetchCrudData() {
        const { data: cData } = await supabase
          .from('courses')
          .select('id, kode_matkul, mata_kuliah(nama_matkul)')
          .eq('semester', crudSemester);
        if (cData) setCrudCourses(cData);
      }
      fetchCrudData();
    }
  }, [showAdminModal, crudSemester]);

  const handleCrudCourseChange = async (courseId) => {
    setSelectedCrudCourse(courseId);
    const { data: sData } = await supabase
      .from('course_sessions')
      .select('id, judul_pertemuan')
      .eq('course_id', courseId)
      .order('urutan', { ascending: true });
    if (sData) setCrudSessions(sData);
  };

  const uploadToStorage = async (file, path) => {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { error: uploadError } = await supabase.storage.from('course_materials').upload(filePath, file);
    if (uploadError) throw new Error(uploadError.message);

    const { data } = supabase.storage.from('course_materials').getPublicUrl(filePath);
    return data.publicUrl;
  };

  // Resolve session id from text input or existing session list
  const resolveSessionId = async () => {
    if (!selectedCrudCourse) throw new Error('Pilih mata kuliah terlebih dahulu!');
    const trimmed = sessionNameInput.trim();
    if (!trimmed) throw new Error('Nama sesi pertemuan wajib diisi!');

    // Check if a session with that name already exists
    const match = crudSessions.find(
      (s) => s.judul_pertemuan.toLowerCase() === trimmed.toLowerCase()
    );
    if (match) return match.id;

    // Create new session
    const { data, error } = await supabase
      .from('course_sessions')
      .insert([{
        course_id: selectedCrudCourse,
        judul_pertemuan: trimmed,
        urutan: crudSessions.length + 1,
      }])
      .select('id')
      .single();

    if (error) throw new Error('Gagal membuat sesi baru: ' + error.message);
    // Refresh session list
    handleCrudCourseChange(selectedCrudCourse);
    return data.id;
  };

  const handleSaveContent = async () => {
    if (!newContent.judul_materi) {
      alert('Judul materi wajib diisi!');
      return;
    }
    
    setIsUploading(true);
    try {
      const sessionId = await resolveSessionId();

      let finalVideoUrl = videoInputMode === 'link' ? newContent.link_url : null;
      let finalFileUrl = null;

      if (videoInputMode === 'upload' && videoFile) finalVideoUrl = await uploadToStorage(videoFile, 'videos');
      if (pdfFile) finalFileUrl = await uploadToStorage(pdfFile, 'documents');

      const { error } = await supabase.from('course_contents').insert([{
        session_id: sessionId,
        tipe: 'kombinasi',
        judul_materi: newContent.judul_materi,
        video_url: finalVideoUrl,
        teks_konten: newContent.teks_konten,
        file_url: finalFileUrl
      }]);

      if (error) throw error;

      alert('Materi berhasil ditambahkan!');
      setShowAdminModal(false);
      setNewContent({ judul_materi: '', teks_konten: '', link_url: '' });
      setVideoFile(null);
      setPdfFile(null);
      setSessionNameInput('');
      setVideoInputMode('link');
      if (selectedSession && selectedSession.id === sessionId) {
        handleSelectSession(selectedSession);
      }
    } catch (err) {
      alert('Gagal menyimpan: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // ── TAB BUTTON helper ──────────────────────────────────────────
  const TabBtn = ({ active, onClick, icon, label, color }) => (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 font-black text-sm uppercase border-4 border-black transition-all
        ${active
          ? `${color} shadow-none translate-x-[2px] translate-y-[2px]`
          : 'bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5'
        }`}
    >
      {icon} {label}
    </button>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#fafafa] font-sans text-black selection:bg-[#22c55e]">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-80 border-b-4 md:border-b-0 md:border-r-4 border-black bg-white flex flex-col shrink-0">
        <div className="p-6 border-b-4 border-black bg-[#22c55e]">
          <h1 className="text-3xl font-black tracking-tighter flex items-center gap-2">
            <BookOpen className="w-8 h-8" strokeWidth={3} /> KELAS
          </h1>
        </div>

        <div className="p-4 border-b-4 border-black bg-purple-100 flex flex-col">
          <label className="font-black text-sm uppercase mb-2">Pilih Semester</label>
          <select 
            value={activeSemester} 
            onChange={(e) => { setActiveSemester(Number(e.target.value)); setSelectedCourse(null); setSelectedSession(null); }}
            className="border-4 border-black p-2 font-black text-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
              <option key={sem} value={sem}>SEMESTER {sem}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <h2 className="font-black text-sm uppercase text-gray-500 tracking-widest">Daftar Mata Kuliah</h2>
          {courses.length === 0 ? <p className="font-mono text-sm">Tidak ada matkul.</p> : 
            courses.map((c) => (
              <div key={c.id} className="space-y-2">
                <button
                  onClick={() => handleSelectCourse(c)}
                  className={`w-full text-left p-3 border-4 border-black font-black flex justify-between items-center transition-all ${
                    selectedCourse?.id === c.id ? 'bg-[#a855f7] text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-white hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  }`}
                >
                  <span className="truncate pr-2">{c.mata_kuliah?.nama_matkul}</span>
                  {selectedCourse?.id === c.id ? <ChevronDown size={20} strokeWidth={3} /> : <ChevronRight size={20} strokeWidth={3} />}
                </button>
                
                {selectedCourse?.id === c.id && (
                  <div className="pl-4 space-y-2 border-l-4 border-black ml-4 py-2">
                    {sessions.length === 0 ? <p className="font-mono text-xs text-gray-500">Belum ada sesi.</p> :
                      sessions.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => handleSelectSession(s)}
                          className={`w-full text-left p-2 border-4 border-black font-bold text-sm transition-all flex items-center gap-2 ${
                            selectedSession?.id === s.id ? 'bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-x-1' : 'bg-white hover:bg-gray-100'
                          }`}
                        >
                          <MonitorPlay size={16} strokeWidth={3} /> Sesi {s.urutan}: {s.judul_pertemuan}
                        </button>
                      ))
                    }
                  </div>
                )}
              </div>
            ))
          }
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="p-6 border-b-4 border-black bg-white flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-xl font-black uppercase truncate">
            {selectedCourse ? selectedCourse.mata_kuliah?.nama_matkul : 'Pilih Mata Kuliah'}
          </h2>
          {currentUser?.role === 'admin' && (
            <button onClick={() => setShowAdminModal(true)} className={`${neoBtnPurple} text-sm py-1.5`}>
              <Settings size={18} /> PANEL INPUT
            </button>
          )}
        </header>

        <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto w-full">
          {selectedSession ? (
            <>
              <div className={neoCard}>
                <div className="border-b-4 border-black pb-4 mb-6">
                  <h2 className="text-4xl font-black mt-3 uppercase tracking-tight">{selectedSession.judul_pertemuan}</h2>
                  <p className="text-gray-800 mt-2 font-mono text-lg">{selectedSession.deskripsi}</p>
                </div>

                <div className="space-y-8">
                  {contents.length === 0 ? (
                    <div className="border-4 border-dashed border-black bg-gray-50 p-12 text-center flex flex-col items-center justify-center">
                      <FileText size={48} strokeWidth={1.5} className="mb-4 text-gray-400" />
                      <p className="font-mono text-xl font-bold">Materi belum tersedia.</p>
                    </div>
                  ) : 
                    contents.map((content) => (
                      <div key={content.id} className="border-4 border-black p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-6">
                        <h3 className="text-2xl font-black bg-[#22c55e] self-start px-4 py-2 border-4 border-black uppercase flex items-center gap-2">
                          <BookOpen size={24} /> {content.judul_materi}
                        </h3>
                        
                       {content.video_url && (
  <div className="border-4 border-black aspect-video bg-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full">
    {(() => {
      const url = content.video_url;
      
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        let embedUrl = url;
        if (url.includes('watch?v=')) embedUrl = url.replace("watch?v=", "embed/");
        else if (url.includes('youtu.be/')) embedUrl = url.replace("youtu.be/", "youtube.com/embed/");
        return <iframe className="w-full h-full border-none" src={embedUrl} title={content.judul_materi} allowFullScreen></iframe>;
      }
      
      if (url.includes('drive.google.com')) {
        const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
        const embedUrl = match ? `https://drive.google.com/file/d/${match[1]}/preview` : url.replace('/view', '/preview');
        return <iframe className="w-full h-full border-none" src={embedUrl} title={content.judul_materi} allow="autoplay" allowFullScreen></iframe>;
      }
      
      return <video src={url} controls className="w-full h-full object-contain" />;
    })()}
  </div>
)}

                        {content.teks_konten && (
                          <div className="prose max-w-none font-serif text-lg bg-[#f3e8ff] p-6 border-4 border-black whitespace-pre-wrap leading-relaxed shadow-inner">
                            {content.teks_konten}
                          </div>
                        )}

                        {content.file_url && (
                          <div className="pt-2">
                            <a 
                              href={content.file_url} 
                              target="_blank" 
                              rel="noreferrer" 
                              className={`${neoBtnPurple} bg-yellow-400 hover:bg-yellow-300 text-black w-max py-3 px-6 text-lg uppercase`}
                            >
                              <Download size={24} strokeWidth={3} /> UNDUH LAMPIRAN
                            </a>
                          </div>
                        )}
                      </div>
                    ))
                  }
                </div>
              </div>

              <div className={neoCard}>
                <h3 className="text-3xl font-black mb-6 bg-black text-white p-3 inline-flex items-center gap-2">
                  <MessageSquare size={28} /> DISKUSI KELAS
                </h3>
                
                <form onSubmit={handleSendComment} className="border-4 border-black p-6 bg-purple-100 mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex flex-col mb-4">
                    <label className="font-black mb-2 text-lg uppercase">Pesan Diskusi</label>
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Tulis opini atau pertanyaan..."
                      rows={3}
                      className={neoInput}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-4 border-4 border-black mb-4">
                    <div className="flex flex-col">
                      <label className="font-black text-sm uppercase mb-2">Tipe Lampiran</label>
                      <select 
                        value={commentMediaType} 
                        onChange={(e) => setCommentMediaType(e.target.value)}
                        className="border-4 border-black p-2 font-mono text-sm bg-white focus:outline-none"
                      >
                        <option value="image">Foto (URL)</option>
                        <option value="video">Video (URL)</option>
                      </select>
                    </div>
                    <div className="md:col-span-2 flex flex-col">
                      <label className="font-black text-sm uppercase mb-2">URL Lampiran (Opsional)</label>
                      <input 
                        type="text" 
                        value={commentMediaUrl}
                        onChange={(e) => setCommentMediaUrl(e.target.value)}
                        placeholder="https://..."
                        className="border-4 border-black p-2 font-mono text-sm focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-6">
                    <span className="text-sm font-mono font-bold bg-black text-white px-3 py-1.5 uppercase">
                      User: {userName}
                    </span>
                    <button type="submit" className={`${neoBtnGreen} text-lg`}>
                      <Send size={20} strokeWidth={3} /> KIRIM
                    </button>
                  </div>
                </form>

                <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                  {comments.length === 0 ? <p className="font-mono text-center py-6 border-4 border-black bg-white font-bold">Belum ada diskusi.</p> : 
                    comments.map((comm) => (
                      <div key={comm.id} className="border-4 border-black p-5 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex justify-between items-center mb-4 border-b-4 border-black pb-2">
                          <span className="font-black text-lg text-[#a855f7] uppercase">{comm.nama_user}</span>
                          <span className="text-xs font-mono font-bold bg-gray-200 px-2 py-1 border-2 border-black">{new Date(comm.created_at).toLocaleString('id-ID')}</span>
                        </div>
                        {comm.komentar_teks && <p className="text-lg font-medium whitespace-pre-wrap mb-4 font-serif">{comm.komentar_teks}</p>}
                        
                        {comm.media_url && comm.media_type === 'image' && (
                          <div className="border-4 border-black overflow-hidden bg-gray-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <img src={comm.media_url} alt="Lampiran" className="w-full object-cover" />
                          </div>
                        )}

                        {comm.media_url && comm.media_type === 'video' && (
                          <div className="border-4 border-black aspect-video bg-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <video src={comm.media_url} controls className="w-full h-full" />
                          </div>
                        )}
                      </div>
                    ))
                  }
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12">
              <BookOpen size={80} strokeWidth={1} className="mb-6 text-gray-300" />
              <h3 className="text-4xl font-black uppercase mb-4 text-gray-800">Pilih Sesi Pembelajaran</h3>
              <p className="font-mono text-gray-500 text-lg max-w-md">Gunakan panel navigasi di sebelah kiri untuk memilih mata kuliah dan sesi pertemuan yang ingin diakses.</p>
            </div>
          )}
        </div>
      </main>

      {/* ADMIN PANEL MODAL */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 md:p-6 z-50">
          <div className="bg-white border-4 border-black p-6 md:p-8 w-full max-w-3xl shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b-4 border-black pb-4 mb-6">
              <h3 className="text-2xl md:text-3xl font-black text-[#a855f7] uppercase flex items-center gap-2">
                <Settings size={32} /> PANEL MATERI
              </h3>
              <button onClick={() => setShowAdminModal(false)} className="bg-red-500 text-white font-black border-4 border-black p-2 hover:bg-red-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1">
                <X size={24} strokeWidth={3} />
              </button>
            </div>

            <div className="space-y-6">

              {/* ── STEP 1: Filter matkul ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 border-4 border-black">
                <div className="flex flex-col">
                  <label className="font-black text-sm mb-2 uppercase">Filter Semester</label>
                  <select value={crudSemester} onChange={(e) => setCrudSemester(Number(e.target.value))} className={neoInput}>
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="font-black text-sm mb-2 uppercase">Pilih Mata Kuliah</label>
                  <select value={selectedCrudCourse} onChange={(e) => handleCrudCourseChange(e.target.value)} className={neoInput}>
                    <option value="">-- Pilih Matkul --</option>
                    {crudCourses.map(c => <option key={c.id} value={c.id}>{c.mata_kuliah?.nama_matkul}</option>)}
                  </select>
                </div>
              </div>

              {/* ── STEP 2: Sesi (text input) ── */}
              <div className="flex flex-col bg-purple-100 p-4 border-4 border-black">
                <label className="font-black text-sm mb-1 uppercase">Nama Sesi Pertemuan</label>
                <p className="text-xs font-mono text-gray-600 mb-2">
                  Ketik nama sesi. Jika sudah ada → materi ditambahkan ke sesi tersebut. Jika belum ada → sesi baru otomatis dibuat.
                </p>
                <input
                  type="text"
                  value={sessionNameInput}
                  onChange={(e) => setSessionNameInput(e.target.value)}
                  placeholder="Contoh: Pengantar Pemrograman / Pertemuan 3..."
                  className={neoInput}
                  list="session-suggestions"
                />
                {/* Datalist for autocomplete from existing sessions */}
                <datalist id="session-suggestions">
                  {crudSessions.map(s => (
                    <option key={s.id} value={s.judul_pertemuan} />
                  ))}
                </datalist>
                {crudSessions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="text-xs font-black uppercase text-gray-500">Sesi ada:</span>
                    {crudSessions.map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSessionNameInput(s.judul_pertemuan)}
                        className="text-xs font-mono border-2 border-black px-2 py-0.5 bg-white hover:bg-[#a855f7] hover:text-white transition-colors"
                      >
                        {s.judul_pertemuan}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* ── STEP 3: Konten ── */}
              <div className="border-4 border-black p-4 md:p-6 space-y-6">

                {/* Judul */}
                <div className="flex flex-col">
                  <label className="font-black text-sm mb-2 uppercase bg-black text-white w-max px-2 py-1">1. Judul Materi</label>
                  <input 
                    type="text" 
                    value={newContent.judul_materi}
                    onChange={(e) => setNewContent({...newContent, judul_materi: e.target.value})}
                    placeholder="Contoh: Pengantar Algoritma..." 
                    className={neoInput} 
                  />
                </div>

                {/* Teks */}
                <div className="flex flex-col">
                  <label className="font-black text-sm mb-2 uppercase bg-black text-white w-max px-2 py-1 flex items-center gap-2"><FileText size={16}/> 2. Konten Teks</label>
                  <textarea 
                    value={newContent.teks_konten}
                    onChange={(e) => setNewContent({...newContent, teks_konten: e.target.value})}
                    rows={4} 
                    placeholder="Teks penjelasan materi (opsional)..." 
                    className={neoInput} 
                  />
                </div>

                {/* ── VIDEO INPUT with tabs ── */}
                <div className="border-4 border-black overflow-hidden">
                  {/* Header */}
                  <div className="bg-black text-white px-4 py-2 font-black text-sm uppercase flex items-center gap-2">
                    <Video size={16} /> 3. Video Materi
                  </div>
                  {/* Tab switcher */}
                  <div className="flex border-b-4 border-black">
                    <TabBtn
                      active={videoInputMode === 'link'}
                      onClick={() => { setVideoInputMode('link'); setVideoFile(null); }}
                      icon={<LinkIcon size={15} strokeWidth={3} />}
                      label="Tempel Link"
                      color="bg-blue-200"
                    />
                    <div className="w-1 border-x-4 border-black" />
                    <TabBtn
                      active={videoInputMode === 'upload'}
                      onClick={() => { setVideoInputMode('upload'); setNewContent({...newContent, link_url: ''}); }}
                      icon={<Upload size={15} strokeWidth={3} />}
                      label="Upload File"
                      color="bg-orange-200"
                    />
                  </div>
                  {/* Panel */}
                  {videoInputMode === 'link' ? (
                    <div className="p-4 bg-blue-50 flex flex-col gap-2">
                      <p className="text-xs font-mono text-gray-600 font-bold">Tempel URL YouTube atau link video langsung.</p>
                      <div className="flex items-center gap-2">
                        {/* <Youtube size={20} className="text-red-500 shrink-0" strokeWidth={2.5} /> */}
                        <input 
                          type="text" 
                          value={newContent.link_url}
                          onChange={(e) => setNewContent({...newContent, link_url: e.target.value})}
                          placeholder="https://youtube.com/watch?v=... atau https://..." 
                          className={`${neoInput} !shadow-none`}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-orange-50 flex flex-col gap-2">
                      <p className="text-xs font-mono text-gray-600 font-bold">Upload file video dari perangkat (MP4, MKV, dll).</p>
                      <label className="border-4 border-dashed border-black bg-white hover:bg-orange-100 transition-colors cursor-pointer flex flex-col items-center justify-center py-6 gap-2">
                        <Upload size={28} strokeWidth={2} className="text-orange-500" />
                        <span className="font-black text-sm uppercase">
                          {videoFile ? videoFile.name : 'Klik untuk pilih file video'}
                        </span>
                        {videoFile && (
                          <span className="text-xs font-mono text-gray-500">{(videoFile.size / 1024 / 1024).toFixed(2)} MB</span>
                        )}
                        <input type="file" accept="video/*" className="hidden" onChange={(e) => setVideoFile(e.target.files[0])} />
                      </label>
                      {videoFile && (
                        <button type="button" onClick={() => setVideoFile(null)} className="text-xs font-black text-red-600 underline self-start">✕ Hapus file</button>
                      )}
                    </div>
                  )}
                </div>

                {/* ── FILE / MODUL INPUT ── */}
                <div className="border-4 border-black overflow-hidden">
                  {/* Header */}
                  <div className="bg-black text-white px-4 py-2 font-black text-sm uppercase flex items-center gap-2">
                    <FileText size={16} /> 4. File / Modul (PDF, DOCX, ZIP)
                  </div>
                  <div className="p-4 bg-yellow-50 flex flex-col gap-2">
                    <p className="text-xs font-mono text-gray-600 font-bold">Upload file modul atau lampiran dari perangkat.</p>
                    <label className="border-4 border-dashed border-black bg-white hover:bg-yellow-100 transition-colors cursor-pointer flex flex-col items-center justify-center py-6 gap-2">
                      <Upload size={28} strokeWidth={2} className="text-yellow-600" />
                      <span className="font-black text-sm uppercase">
                        {pdfFile ? pdfFile.name : 'Klik untuk pilih file modul'}
                      </span>
                      {pdfFile && (
                        <span className="text-xs font-mono text-gray-500">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</span>
                      )}
                      <input type="file" accept=".pdf,.doc,.docx,.zip,.rar" className="hidden" onChange={(e) => setPdfFile(e.target.files[0])} />
                    </label>
                    {pdfFile && (
                      <button type="button" onClick={() => setPdfFile(null)} className="text-xs font-black text-red-600 underline self-start">✕ Hapus file</button>
                    )}
                  </div>
                </div>

              </div>

              <div className="flex justify-end pt-4">
                <button 
                  type="button" 
                  onClick={handleSaveContent} 
                  disabled={isUploading}
                  className={`${neoBtnGreen} text-xl w-full md:w-auto px-10 py-4 ${isUploading ? 'opacity-50 cursor-wait' : ''}`}
                >
                  <Save size={24} strokeWidth={3} />
                  {isUploading ? 'MENGUNGGAH MATERI...' : 'SIMPAN MATERI'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}