import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import DateRangePicker from './DateRangePicker';

export default function DaftarTugasList({ studentId }) {
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [filters, setFilters] = useState({
    course: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'deadline', 
    sortOrder: 'asc' 
  });

  useEffect(() => {
    async function fetchAssignments() {
      if (!studentId) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('student_tasks')
        .select(`
          id, deadline, is_completed,
          students ( nama ),
          tasks ( judul, mata_kuliah:courses(mata_kuliah(nama_matkul)) )
        `)
        .eq('student_id', studentId);

      if (!error) {
        setAssignments(data || []);
        setFilteredAssignments(data || []);
      }
      setLoading(false);
    }

    async function fetchCourses() {
      const { data, error } = await supabase
        .from('courses')
        .select('id, mata_kuliah(nama_matkul)');
      if (!error) setCourses(data || []);
    }

    fetchAssignments();
    fetchCourses();
  }, [studentId]);

  useEffect(() => {
    let filtered = [...assignments];

    if (filters.course) {
      filtered = filtered.filter(item =>
        item.tasks?.mata_kuliah?.mata_kuliah?.nama_matkul === filters.course
      );
    }

    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter(item => new Date(item.deadline) >= fromDate);
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(item => new Date(item.deadline) <= toDate);
    }

    filtered.sort((a, b) => {
      let comparison = 0;
      if (filters.sortBy === 'deadline') {
        comparison = new Date(a.deadline) - new Date(b.deadline);
      } else if (filters.sortBy === 'course') {
        const courseA = a.tasks?.mata_kuliah?.mata_kuliah?.nama_matkul || '';
        const courseB = b.tasks?.mata_kuliah?.mata_kuliah?.nama_matkul || '';
        comparison = courseA.localeCompare(courseB);
      }
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredAssignments(filtered);
  }, [assignments, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleSort = (sortBy) => {
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  const clearFilters = () => {
    setFilters({ course: '', dateFrom: '', dateTo: '', sortBy: 'deadline', sortOrder: 'asc' });
  };

  const uniqueCourses = [...new Set(courses.map(c => c.mata_kuliah?.nama_matkul).filter(Boolean))];

  if (loading) return <div className="p-10 text-center font-black animate-pulse text-white">MEMUAT DATA TUGAS...</div>;

  return (
    <div className="space-y-8">
      <section>
        <div className="border-4 border-black bg-white overflow-visible shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
          {/* Header & Filter UI */}
          <div className="bg-black text-white p-5 font-black uppercase text-lg flex flex-col gap-5 relative z-20">
            <div className="flex justify-between items-center">
              <span>Riwayat Tugas Saya</span>
              <span className="text-xs bg-green-400 text-black px-2 py-1">Personal Access</span>
            </div>

            {/* BARIS FILTER */}
            <div className="flex flex-wrap gap-4 items-center">
              {/* 1. Filter Matkul */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold uppercase text-gray-300">Matkul:</label>
                <select
                  value={filters.course}
                  onChange={(e) => handleFilterChange('course', e.target.value)}
                  className="px-3 py-1.5 border-2 border-white bg-black text-white text-xs font-bold uppercase focus:bg-white focus:text-black transition-colors outline-none cursor-pointer"
                >
                  <option value="">SEMUA</option>
                  {uniqueCourses.map(course => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
              </div>

              {/* 2. Date Range Picker (Filter Tanggal) */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold uppercase text-gray-300">Periode:</label>
                <div className="bg-white text-black border-2 border-white">
                  <DateRangePicker
                    startDate={filters.dateFrom}
                    endDate={filters.dateTo}
                    onStartDateChange={(v) => handleFilterChange('dateFrom', v)}
                    onEndDateChange={(v) => handleFilterChange('dateTo', v)}
                    onClear={() => {
                      handleFilterChange('dateFrom', '');
                      handleFilterChange('dateTo', '');
                    }}
                  />
                </div>
              </div>

              {/* 3. Tombol Sortir */}
              {/* <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase text-gray-300">Sort:</span>
                <button
                  onClick={() => toggleSort('deadline')}
                  className={`px-3 py-1.5 border-2 border-white font-black text-xs uppercase hover:bg-white hover:text-black transition-colors ${
                    filters.sortBy === 'deadline' ? 'bg-white text-black' : ''
                  }`}
                >
                  TGL {filters.sortBy === 'deadline' ? (filters.sortOrder === 'asc' ? '↑' : '↓') : ''}
                </button>
                <button
                  onClick={() => toggleSort('course')}
                  className={`px-3 py-1.5 border-2 border-white font-black text-xs uppercase hover:bg-white hover:text-black transition-colors ${
                    filters.sortBy === 'course' ? 'bg-white text-black' : ''
                  }`}
                >
                  MK {filters.sortBy === 'course' ? (filters.sortOrder === 'asc' ? 'A-Z' : 'Z-A') : ''}
                </button>
              </div> */}

              {/* 4. Reset Button */}
              <button 
                onClick={clearFilters} 
                className="px-3 py-1.5 border-2 border-red-400 text-red-400 font-black text-xs uppercase hover:bg-red-400 hover:text-white transition-colors ml-auto"
              >
                CLEAR
              </button>
            </div>
          </div>

          {/* TABLE AREA */}
          <div className="overflow-x-auto relative z-10">
            <table className="min-w-full w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b-4 border-black bg-purple-600 text-white">
                  <th className="p-4 border-r-4 border-black font-black uppercase">Tugas</th>
                  <th className="p-4 border-r-4 border-black font-black uppercase">Deadline</th>
                  <th className="p-4 text-center font-black uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.length > 0 ? (
                  (showAll ? filteredAssignments : filteredAssignments.slice(0, 5)).map((item) => (
                    <tr key={item.id} className="border-b-4 border-black hover:bg-green-100 transition-colors bg-white">
                      <td className="p-4 border-r-4 border-black">
                        <div className="font-bold uppercase text-sm">{item.tasks?.judul}</div>
                        <div className="text-xs italic text-gray-600 mt-1">
                           {item.tasks?.mata_kuliah?.mata_kuliah?.nama_matkul}
                        </div>
                      </td>
                      <td className="p-4 border-r-4 border-black font-bold text-purple-600">
                        {new Date(item.deadline).toLocaleString('id-ID', { 
                          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
                        })}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-block border-2 border-black px-2 py-1 font-black text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${item.is_completed ? 'bg-green-400' : 'bg-red-400 text-white'}`}>
                          {item.is_completed ? 'DONE' : 'WAIT'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="p-10 text-center italic font-bold text-gray-400 uppercase bg-white">Tidak ada data tugas ditemukan</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredAssignments.length > 5 && (
            <div className="px-4 py-3 bg-gray-100 border-t-4 border-black flex justify-center">
              <button
                onClick={() => setShowAll(prev => !prev)}
                className="px-3 py-1.5 border-2 border-black bg-black text-white font-black text-xs uppercase hover:bg-white hover:text-black transition-colors"
              >
                {showAll ? 'SHOW LESS' : `SHOW ALL (${filteredAssignments.length})`}
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}