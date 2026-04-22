import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import JSZip from 'jszip'; // IMPORT JSZIP

export default function FormTugas({ onComplete }) {
  const [activeCourses, setActiveCourses] = useState([]);
  const [allStudents, setAllStudents] = useState([]); 
  const [selectedStudents, setSelectedStudents] = useState([]); 
  const [isDeploying, setIsDeploying] = useState(false);
  
  const [materiType, setMateriType] = useState('teks'); 
  // UBAH STATE INI JADI ARRAY UNTUK MULTIPLE FILES
  const [materiFiles, setMateriFiles] = useState([]); 
  // STATE BARU UNTUK MULTIPLE LINKS
  const [materiLinks, setMateriLinks] = useState(['']); 

  const [formData, setFormData] = useState({ 
    kode_tugas: '', 
    judul: '', 
    deskripsi: '', 
    course_id: '', 
    deadline: '',
    submission_link: '',
    materi: '' 
  });

  const getSubmissionType = (value) => {
    if (!value) return '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const urlRegex = /^(http|https):\/\/[^ "]+$/;
    if (emailRegex.test(value)) return { label: 'EMAIL', color: 'bg-yellow-400' };
    if (urlRegex.test(value)) return { label: 'URL LINK', color: 'bg-blue-400' };
    return { label: 'TEKS PERINTAH', color: 'bg-gray-300' };
  };

  const detectedType = getSubmissionType(formData.submission_link);

  useEffect(() => {
    async function fetchData() {
      const { data: courses } = await supabase
        .from('courses')
        .select(`id, semester, mata_kuliah ( nama_matkul )`);
      if (courses) setActiveCourses(courses);

      const { data: students } = await supabase
        .from('students')
        .select('id, nama, nim')
        .order('nama', { ascending: true });
      if (students) setAllStudents(students);
    }
    fetchData();
  }, []);

  const toggleStudent = (id) => {
    setSelectedStudents(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const handleCourseChange = (e) => {
    const selectedCourseId = e.target.value;
    if (!selectedCourseId) {
      setFormData({ ...formData, course_id: '', kode_tugas: '' });
      return;
    }

    const selectedCourse = activeCourses.find(c => c.id === selectedCourseId);
    const namaMatkul = selectedCourse?.mata_kuliah?.nama_matkul || 'XX';
    const twoLettersMatkul = namaMatkul.substring(0, 2).toUpperCase();
    const date = new Date();
    const ddmmyy = String(date.getDate()).padStart(2, '0') + 
                   String(date.getMonth() + 1).padStart(2, '0') + 
                   String(date.getFullYear()).slice(-2);
    const random1Digit = Math.floor(Math.random() * 10);
    const random2Digit = String(Math.floor(Math.random() * 100)).padStart(2, '0');
    const generatedKode = `TI-${ddmmyy}-${random1Digit}-${random2Digit}-${twoLettersMatkul}`;

    setFormData({ ...formData, course_id: selectedCourseId, kode_tugas: generatedKode });
  };

  // UBAH HANDLER FILE UNTUK MULTIPLE
  const handleFileChange = (e) => {
    if (e.target.files) {
      setMateriFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedStudents.length === 0) {
      return toast.error("PILIH MINIMAL 1 MAHASISWA!", {
        position:"top-center",
        className: 'border-4 border-black rounded-none font-black bg-yellow-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
      });
    }

    if (materiType === 'file' && materiFiles.length === 0) {
      return toast.error("FILE MATERI BELUM DIPILIH!", {
        position:"top-center",
        className: 'border-4 border-black rounded-none font-black bg-yellow-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
      });
    }

    if (materiType === 'link' && materiLinks.filter(link => link.trim() !== '').length === 0) {
      return toast.error("LINK MATERI BELUM DIISI!", {
        position:"top-center",
        className: 'border-4 border-black rounded-none font-black bg-yellow-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
      });
    }

    setIsDeploying(true);
    
    let deadline = formData.deadline;
    if (deadline) {
      const localDate = new Date(deadline);
      deadline = localDate.toISOString();
    }
    
    try {
      let finalMateriValue = formData.materi;

      // JIKA TIPE LINK, GABUNGKAN MULTIPLE LINKS
      if (materiType === 'link') {
        finalMateriValue = materiLinks.filter(link => link.trim() !== '').join('\n');
      }

      // PROSES UPLOAD FILE JIKA TIPE MATERI = FILE
      if (materiType === 'file' && materiFiles.length > 0) {
        toast.loading(materiFiles.length > 1 ? "Mengekstrak ke ZIP & Mengunggah..." : "Mengunggah file materi...", { id: "upload-toast" });
        
        let fileToUpload;
        let filePath;
        let contentType;

        // JIKA HANYA 1 FILE: UPLOAD BIASA
        if (materiFiles.length === 1) {
          fileToUpload = materiFiles[0];
          const fileExt = fileToUpload.name.split('.').pop();
          filePath = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          contentType = fileToUpload.type;
        } 
        // JIKA LEBIH DARI 1 FILE: JADIKAN ZIP
        else {
          const zip = new JSZip();
          materiFiles.forEach(file => {
            zip.file(file.name, file);
          });
          
          fileToUpload = await zip.generateAsync({ type: 'blob' });
          
          // GENERATE NAMA FILE ZIP SESUAI REQUEST
          const course = activeCourses.find(c => c.id === formData.course_id);
          const namaMatkul = course?.mata_kuliah?.nama_matkul.replace(/\s+/g, '_') || 'Matkul';
          const judulTugas = formData.judul.replace(/\s+/g, '_') || 'Tugas';
          
          const date = new Date();
          const tglTerbit = `${String(date.getDate()).padStart(2, '0')}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getFullYear()).slice(-2)}`;
          
          // Format: nama tugas_namamatkul_tanggalterbit.zip
          const zipName = `${judulTugas}_${namaMatkul}_${tglTerbit}.zip`;
          filePath = `${Date.now()}-${zipName}`; // Tambah timestamp agar tidak menimpa file bernama sama di storage
          contentType = 'application/zip';
        }

        // Upload ke bucket Supabase bernama 'materi_tugas'
        const { error: uploadError } = await supabase.storage
          .from('materi_tugas')
          .upload(filePath, fileToUpload, { contentType });

        if (uploadError) throw new Error(`Gagal upload file: ${uploadError.message}`);

        // Ambil URL public dari file/zip yang diupload
        const { data: { publicUrl } } = supabase.storage
          .from('materi_tugas')
          .getPublicUrl(filePath);

        finalMateriValue = publicUrl;
        toast.dismiss("upload-toast");
      }

      // 1. Simpan ke Master Tasks
      const { data: newTask, error: taskError } = await supabase
        .from('tasks')
        .insert([{
          kode_tugas: formData.kode_tugas,
          judul: formData.judul,
          deskripsi: formData.deskripsi,
          materi: finalMateriValue, 
          course_id: formData.course_id
        }])
        .select().single();

      if (taskError) throw new Error(`Master Task: ${taskError.message}`);

      // 2. Distribusi ke student_tasks
      const dist = selectedStudents.map(studentId => ({
        task_id: newTask.id,
        student_id: studentId,
        deadline: deadline,
        submission_link: formData.submission_link
      }));

      const { error: distError } = await supabase.from('student_tasks').insert(dist);
      if (distError) throw new Error(`Distribusi: ${distError.message}`);

      toast.success(`TASK DEPLOYED TO ${selectedStudents.length} STUDENTS!`, {
        position:"top-center",
        className: 'border-4 border-black rounded-none font-black bg-green-400 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]',
        duration: 4000
      });
      
      onComplete();
    } catch (err) {
      toast.dismiss("upload-toast");
      toast.error(err.message, {
        position:"top-center",
        className: 'border-4 border-black rounded-none font-black bg-red-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
      });
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* ... [BAGIAN ATAS TETAP SAMA] ... */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-black uppercase text-xs mb-1 text-gray-500">// PILIH MATKUL</label>
          <select required className="w-full border-4 border-black p-3 font-bold focus:bg-purple-100 outline-none"
            value={formData.course_id} onChange={handleCourseChange} disabled={isDeploying}>
            <option value="">-- PILIH MATKUL --</option>
            {activeCourses.map(c => (
              <option key={c.id} value={c.id}>{c.mata_kuliah?.nama_matkul} (Smtr {c.semester})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-black uppercase text-xs mb-1 text-gray-500">// KODE TUGAS</label>
          <input readOnly value={formData.kode_tugas} className="w-full border-4 border-black p-3 font-black bg-gray-200 focus:outline-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-1">
          <label className="block font-black uppercase text-xs mb-1 text-gray-500">// JUDUL TUGAS</label>
          <input required className="w-full border-4 border-black p-3 font-bold focus:bg-purple-100 outline-none"
            disabled={isDeploying}
            onChange={(e) => setFormData({...formData, judul: e.target.value})} />
        </div>
        <div>
          <label className="block font-black uppercase text-xs mb-1 text-gray-500">// DEADLINE</label>
          <input required type="datetime-local" className="w-full border-4 border-black p-3 font-bold focus:bg-purple-100 outline-none"
            disabled={isDeploying}
            onChange={(e) => setFormData({...formData, deadline: e.target.value})} />
        </div>
      </div>

      <div className="border-4 border-black p-3 bg-white">
        <label className="block font-black uppercase text-xs mb-3 text-gray-500">// MATERI PEMBELAJARAN</label>
        
        <div className="flex gap-2 mb-3">
          {['teks', 'link', 'file'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                setMateriType(type);
                setFormData({...formData, materi: ''});
                setMateriFiles([]);
                setMateriLinks(['']); // RESET LINKS KE DEFAULT
              }}
              className={`flex-1 py-1 px-2 border-2 border-black font-black text-[10px] sm:text-xs uppercase transition-all ${materiType === type ? 'bg-purple-600 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-white text-black hover:bg-gray-100'}`}
            >
              {type}
            </button>
          ))}
        </div>

        {materiType === 'teks' && (
          <textarea 
            rows="2"
            disabled={isDeploying}
            placeholder="Ketik instruksi atau materi di sini..."
            className="w-full border-4 border-black p-3 font-bold outline-none resize-none focus:bg-purple-100 transition-colors"
            value={formData.materi}
            onChange={(e) => setFormData({...formData, materi: e.target.value})} 
          />
        )}

        {materiType === 'link' && (
          <div className="space-y-2">
            {materiLinks.map((link, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input 
                  type="url"
                  disabled={isDeploying}
                  placeholder="https://gdrive.com/... atau youtube.com/..."
                  className="flex-1 border-4 border-black p-3 font-bold outline-none focus:bg-blue-100 transition-colors"
                  value={link}
                  onChange={(e) => {
                    const newLinks = [...materiLinks];
                    newLinks[index] = e.target.value;
                    setMateriLinks(newLinks);
                  }} 
                />
                {materiLinks.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      const newLinks = materiLinks.filter((_, i) => i !== index);
                      setMateriLinks(newLinks);
                    }}
                    className="border-2 border-black bg-red-400 text-black font-black px-2 py-1 text-xs uppercase hover:bg-red-300"
                    disabled={isDeploying}
                  >
                    HAPUS
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => setMateriLinks([...materiLinks, ''])}
              className="border-2 border-black bg-green-400 text-black font-black px-4 py-2 text-xs uppercase hover:bg-green-300"
              disabled={isDeploying}
            >
              + TAMBAH LINK
            </button>
          </div>
        )}

        {/* INPUT FILE DIBUAT MULTIPLE */}
        {materiType === 'file' && (
          <div>
            <input 
              type="file"
              multiple 
              disabled={isDeploying}
              className="w-full border-4 border-black  p-2 font-bold outline-none file:mr-4 file:py-2 file:px-4 file:border-2 file:border-black file:text-sm file:font-black file:uppercase file:bg-green-400 file:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]  file:text-black  hover:file:bg-green-300 cursor-pointer "
              onChange={handleFileChange} 
            />
            {materiFiles.length > 0 && (
              <div className="mt-2 text-[10px] font-black uppercase text-purple-600">
                {materiFiles.length} file dipilih {materiFiles.length > 1 && '(Akan otomatis di-bundling ke .ZIP)'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ... [BAGIAN BAWAH TETAP SAMA SEPERTI SEBELUMNYA] ... */}
      <div>
        <label className="block font-black uppercase text-xs mb-1 text-gray-500 flex justify-between items-center">
          <span>// METODE PENGUMPULAN</span>
          {formData.submission_link && (
            <span className={`${detectedType.color} border-2 border-black px-2 py-0.5 text-[10px] text-black font-black uppercase`}>
              {detectedType.label}
            </span>
          )}
        </label>
        <input 
          required 
          disabled={isDeploying}
          placeholder="Cth: dosen@ibik.ac.id, https://github.com/..."
          className="w-full border-4 border-black p-3 font-bold focus:bg-purple-100 outline-none"
          value={formData.submission_link}
          onChange={(e) => setFormData({...formData, submission_link: e.target.value})} 
        />
      </div>

      <div>
        <label className="block font-black uppercase text-xs mb-1 text-gray-500">// DESKRIPSI TUGAS</label>
        <textarea 
          required 
          rows="3"
          disabled={isDeploying}
          className="w-full border-4 border-black p-3 font-bold focus:bg-purple-100 outline-none resize-none"
          onChange={(e) => setFormData({...formData, deskripsi: e.target.value})} 
        />
      </div>

      <div>
        <label className="block font-black uppercase text-xs mb-1 text-gray-500">// TARGET MAHASISWA ({selectedStudents.length})</label>
        <div className="border-4 border-black h-48 overflow-y-auto bg-gray-50 p-2 space-y-2">
          {allStudents.map(s => (
            <label key={s.id} className="flex items-center gap-3 p-2 border-2 border-black bg-white cursor-pointer hover:bg-green-100 transition-colors">
              <input 
                type="checkbox" 
                className="w-5 h-5 accent-green-400" 
                disabled={isDeploying}
                checked={selectedStudents.includes(s.id)}
                onChange={() => toggleStudent(s.id)}
              />
              <span className="font-bold text-sm uppercase">{s.nama} <span className="text-gray-400">({s.nim})</span></span>
            </label>
          ))}
        </div>
        {!isDeploying && (
          <div className="flex gap-2 mt-2">
            <button type="button" onClick={() => setSelectedStudents(allStudents.map(s => s.id))} className="text-[10px] font-black underline hover:text-purple-600">PILIH SEMUA</button>
            <button type="button" onClick={() => setSelectedStudents([])} className="text-[10px] font-black underline text-red-600 hover:text-red-800">RESET</button>
          </div>
        )}
      </div>

      <button 
        disabled={isDeploying}
        className={`w-full ${isDeploying ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-400 active:bg-yellow-400'} border-4 border-black p-4 font-black uppercase text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all`}
      >
        {isDeploying ? 'EXECUTING...' : 'DEPLOY TASK'}
      </button>
    </form>
  );
}