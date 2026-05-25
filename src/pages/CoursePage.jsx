import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

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
  
  const [newContent, setNewContent] = useState({
    tipe: 'teks',
    judul_materi: '',
    video_url: '',
    teks_konten: '',
    file_url: ''
  });

  const neoCard = "border-4 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]";
  const neoBtnPurple = "border-4 border-black bg-[#a855f7] px-4 py-2 font-bold text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-[#c084fc]";
  const neoBtnGreen = "border-4 border-black bg-[#22c55e] px-4 py-2 font-bold text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-[#4ade80]";
  const neoInput = "border-4 border-black p-2 font-mono shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:bg-[#f3e8ff] w-full";

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

  const handleSaveContent = async () => {
    if (!selectedCrudSession || !newContent.judul_materi) {
      alert('Sesi pertemuan dan judul materi wajib diisi!');
      return;
    }
    
    const { error } = await supabase.from('course_contents').insert([{
      session_id: selectedCrudSession,
      ...newContent
    }]);

    if (!error) {
      alert('Materi berhasil ditambahkan!');
      setShowAdminModal(false);
      setNewContent({ tipe: 'teks', judul_materi: '', video_url: '', teks_konten: '', file_url: '' });
      if (selectedSession && selectedSession.id === selectedCrudSession) {
        handleSelectSession(selectedSession);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-black p-6 selection:bg-[#22c55e]">
      
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center border-4 border-black bg-[#22c55e] p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">KELAS</h1>
          {/* <p className="font-mono mt-1 text-sm font-bold">LMS NEO-BRUTALISM EDITION</p> */}
        </div>
        {currentUser?.role === 'admin' && (
          <button onClick={() => setShowAdminModal(true)} className={`${neoBtnPurple} mt-4 md:mt-0 text-sm`}>
            PANEL INPUT MATERI
          </button>
        )}
      </header>

      <div className="flex gap-4 mb-8 overflow-x-auto pb-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
          <button
            key={sem}
            onClick={() => { setActiveSemester(sem); setSelectedCourse(null); setSelectedSession(null); }}
            className={`border-4 border-black px-6 py-3 font-black text-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all whitespace-nowrap ${
              activeSemester === sem ? 'bg-[#a855f7] text-white -translate-y-1' : 'bg-white text-black hover:bg-gray-100'
            }`}
          >
            SEMESTER {sem}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-4 space-y-6">
          <div className={neoCard}>
            <h2 className="text-xl font-black bg-black text-white p-2 mb-4 inline-block">MATA KULIAH</h2>
            <div className="space-y-3">
              {courses.length === 0 ? <p className="font-mono text-gray-500">Tidak ada data.</p> : 
                courses.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => handleSelectCourse(c)}
                    className={`p-3 border-4 border-black cursor-pointer font-bold transition-colors ${
                      selectedCourse?.id === c.id ? 'bg-[#22c55e] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-y-1' : 'bg-white hover:bg-gray-100'
                    }`}
                  >
                    <div className="text-lg">{c.mata_kuliah?.nama_matkul}</div>
                    <div className="text-xs font-mono text-gray-700 mt-1 bg-white inline-block px-1 border border-black">{c.kode_matkul}</div>
                  </div>
                ))
              }
            </div>
          </div>

          {selectedCourse && (
            <div className={`${neoCard} border-[#a855f7]`}>
              <h2 className="text-xl font-black bg-[#a855f7] text-white p-2 mb-4 inline-block">DAFTAR PERTEMUAN</h2>
              <div className="space-y-3">
                {sessions.length === 0 ? <p className="font-mono text-gray-500">Belum ada sesi.</p> :
                  sessions.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => handleSelectSession(s)}
                      className={`p-3 border-4 border-black cursor-pointer font-bold ${
                        selectedSession?.id === s.id ? 'bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-y-1' : 'bg-white text-black hover:bg-gray-100'
                      }`}
                    >
                      Sesi {s.urutan}: {s.judul_pertemuan}
                    </div>
                  ))
                }
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-8 space-y-8">
          {selectedSession ? (
            <>
              <div className={neoCard}>
                <div className="border-b-4 border-black pb-4 mb-6">
                  <span className="bg-black text-white px-2 py-1 font-mono text-xs font-bold uppercase tracking-wider">MATERI VIEW</span>
                  <h2 className="text-4xl font-black mt-3 uppercase">{selectedSession.judul_pertemuan}</h2>
                  <p className="text-gray-800 mt-2 font-mono text-lg">{selectedSession.deskripsi}</p>
                </div>

                <div className="space-y-8">
                  {contents.length === 0 ? <p className="font-mono text-center py-10 border-4 border-dashed border-black bg-gray-50 text-xl font-bold">Materi kosong.</p> : 
                    contents.map((content) => (
                      <div key={content.id} className="border-4 border-black p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <h3 className="text-2xl font-black bg-[#22c55e] inline-block px-3 py-1 border-4 border-black mb-6 uppercase">{content.judul_materi}</h3>
                        
                        {content.tipe === 'video' && content.video_url && (
                          <div className="border-4 border-black aspect-video bg-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4">
                            <iframe 
                              className="w-full h-full" 
                              src={content.video_url.replace("watch?v=", "embed/")} 
                              title={content.judul_materi}
                              allowFullScreen
                            ></iframe>
                          </div>
                        )}

                        {content.tipe === 'teks' && content.teks_konten && (
                          <div className="prose max-w-none font-serif text-lg bg-[#f3e8ff] p-6 border-4 border-black mb-4 whitespace-pre-wrap leading-relaxed">
                            {content.teks_konten}
                          </div>
                        )}

                        {content.tipe === 'file' && content.file_url && (
                          <div className="mt-4">
                            <a 
                              href={content.file_url} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="inline-flex items-center gap-2 border-4 border-black bg-yellow-400 font-black px-6 py-3 hover:bg-yellow-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-lg"
                            >
                              DOWNLOAD MODUL (PDF/ZIP) 📥
                            </a>
                          </div>
                        )}
                      </div>
                    ))
                  }
                </div>
              </div>

              <div className={neoCard}>
                <h3 className="text-3xl font-black mb-6 bg-black text-white p-3 inline-block">DISKUSI KELAS</h3>
                
                <form onSubmit={handleSendComment} className="border-4 border-black p-6 bg-purple-100 mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex flex-col mb-4">
                    <label className="font-black mb-2 text-lg uppercase">Pesan Diskusi:</label>
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Tulis opini atau pertanyaan di sini..."
                      rows={3}
                      className={neoInput}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-4 border-4 border-black mb-4">
                    <div className="flex flex-col">
                      <label className="font-black text-sm uppercase mb-2">Tipe Lampiran:</label>
                      <select 
                        value={commentMediaType} 
                        onChange={(e) => setCommentMediaType(e.target.value)}
                        className="border-4 border-black p-2 font-mono text-sm bg-white"
                      >
                        <option value="image">Foto (URL)</option>
                        <option value="video">Video (URL)</option>
                      </select>
                    </div>
                    <div className="md:col-span-2 flex flex-col">
                      <label className="font-black text-sm uppercase mb-2">URL Media (Opsional):</label>
                      <input 
                        type="text" 
                        value={commentMediaUrl}
                        onChange={(e) => setCommentMediaUrl(e.target.value)}
                        placeholder="https://link-media.com/file.jpg"
                        className="border-4 border-black p-2 font-mono text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-6">
                    <span className="text-sm font-mono font-bold bg-black text-white px-2 py-1">👤 {userName}</span>
                    <button type="submit" className={`${neoBtnGreen} text-lg`}>KIRIM DISKUSI</button>
                  </div>
                </form>

                <div className="space-y-6 max-h-[600px] overflow-y-auto pr-4">
                  {comments.length === 0 ? <p className="font-mono text-center py-6 border-4 border-black bg-white font-bold">Belum ada diskusi. Mulai percakapan!</p> : 
                    comments.map((comm) => (
                      <div key={comm.id} className="border-4 border-black p-5 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex justify-between items-center mb-4 border-b-4 border-black pb-2">
                          <span className="font-black text-lg text-[#a855f7]">{comm.nama_user}</span>
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
            <div className="border-4 border-black bg-white p-16 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-8xl mb-6"></div>
              <h3 className="text-4xl font-black uppercase">Pilih Sesi Pembelajaran</h3>
              <p className="font-mono text-gray-700 mt-4 text-lg font-bold">Akses navigasi di sebelah kiri untuk memuat silabus materi secara berurutan.</p>
            </div>
          )}
        </div>
      </div>

      {showAdminModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50">
          <div className="bg-white border-4 border-black p-8 w-full max-w-3xl shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b-4 border-black pb-4 mb-6">
              <h3 className="text-3xl font-black text-[#a855f7] uppercase">Input Materi Baru</h3>
              <button onClick={() => setShowAdminModal(false)} className="bg-red-500 text-white font-black border-4 border-black px-4 py-2 hover:bg-red-600 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                TUTUP [X]
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label className="font-black text-sm mb-2 uppercase">Filter Semester:</label>
                  <select value={crudSemester} onChange={(e) => setCrudSemester(Number(e.target.value))} className={neoInput}>
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="font-black text-sm mb-2 uppercase">Pilih Mata Kuliah:</label>
                  <select value={selectedCrudCourse} onChange={(e) => handleCrudCourseChange(e.target.value)} className={neoInput}>
                    <option value="">-- Pilih Matkul --</option>
                    {crudCourses.map(c => <option key={c.id} value={c.id}>{c.mata_kuliah?.nama_matkul} ({c.kode_matkul})</option>)}
                  </select>
                </div>
              </div>

              <div className="flex flex-col">
                <label className="font-black text-sm mb-2 uppercase">Pilih Sesi Pertemuan:</label>
                <select value={selectedCrudSession} onChange={(e) => setSelectedCrudSession(e.target.value)} className={neoInput}>
                  <option value="">-- Pilih Sesi --</option>
                  {crudSessions.map(s => <option key={s.id} value={s.id}>{s.judul_pertemuan}</option>)}
                </select>
              </div>

              <div className="border-t-4 border-black pt-6 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="flex flex-col">
                    <label className="font-black text-sm mb-2 uppercase">Judul Materi:</label>
                    <input 
                      type="text" 
                      value={newContent.judul_materi}
                      onChange={(e) => setNewContent({...newContent, judul_materi: e.target.value})}
                      placeholder="Contoh: Pengenalan OOP" 
                      className={neoInput} 
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="font-black text-sm mb-2 uppercase">Tipe Materi:</label>
                    <select 
                      value={newContent.tipe} 
                      onChange={(e) => setNewContent({...newContent, tipe: e.target.value})}
                      className={neoInput}
                    >
                      <option value="teks">Artikel Panjang (Teks)</option>
                      <option value="video">Video Pembelajaran</option>
                      <option value="file">File Modul (PDF)</option>
                    </select>
                  </div>
                </div>

                {newContent.tipe === 'video' && (
                  <div className="flex flex-col mb-6">
                    <label className="font-black text-sm mb-2 uppercase">URL Video (YouTube):</label>
                    <input 
                      type="text" 
                      value={newContent.video_url}
                      onChange={(e) => setNewContent({...newContent, video_url: e.target.value})}
                      placeholder="https://www.youtube.com/watch?v=..." 
                      className={neoInput} 
                    />
                  </div>
                )}

                {newContent.tipe === 'teks' && (
                  <div className="flex flex-col mb-6">
                    <label className="font-black text-sm mb-2 uppercase">Isi Materi Teks:</label>
                    <textarea 
                      value={newContent.teks_konten}
                      onChange={(e) => setNewContent({...newContent, teks_konten: e.target.value})}
                      rows={6} 
                      placeholder="Ketik materi lengkap di sini..." 
                      className={neoInput} 
                    />
                  </div>
                )}

                {newContent.tipe === 'file' && (
                  <div className="flex flex-col mb-6">
                    <label className="font-black text-sm mb-2 uppercase">URL File Supabase Storage:</label>
                    <input 
                      type="text" 
                      value={newContent.file_url}
                      onChange={(e) => setNewContent({...newContent, file_url: e.target.value})}
                      placeholder="https://xxx.supabase.co/storage/v1/object/public/..." 
                      className={neoInput} 
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-6 border-t-4 border-black">
                <button type="button" onClick={handleSaveContent} className={`${neoBtnGreen} text-xl w-full md:w-auto px-10 py-4`}>
                  SIMPAN MATERI 
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}