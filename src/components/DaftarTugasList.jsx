import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import DateRangePicker from './DateRangePicker';

export default function DaftarTugasList() {
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [filters, setFilters] = useState({
    course: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'deadline', // 'deadline' or 'course'
    sortOrder: 'asc' // 'asc' or 'desc'
  });

  useEffect(() => {
    async function fetchAssignments() {
      setLoading(true);
      const { data, error } = await supabase
        .from('student_tasks')
        .select(`
          id, deadline, is_completed,
          students ( nama ),
          tasks ( judul, mata_kuliah:courses(mata_kuliah(nama_matkul)) )
        `);

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

      if (!error) {
        setCourses(data || []);
      }
    }

    fetchAssignments();
    fetchCourses();
  }, []);

  useEffect(() => {
    let filtered = [...assignments];

    // Filter by course
    if (filters.course) {
      filtered = filtered.filter(item =>
        item.tasks?.mata_kuliah?.mata_kuliah?.nama_matkul === filters.course
      );
    }

    // Filter by date range
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter(item =>
        new Date(item.deadline) >= fromDate
      );
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter(item =>
        new Date(item.deadline) <= toDate
      );
    }

    // Sort
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
    setFilters({
      course: '',
      dateFrom: '',
      dateTo: '',
      sortBy: 'deadline',
      sortOrder: 'asc'
    });
  };

  const uniqueCourses = [...new Set(courses.map(c => c.mata_kuliah?.nama_matkul).filter(Boolean))];

  return (
    <div className="space-y-8">
      {/* SECTION MONITORING */}
      <section>
        <div className="border-4 border-black bg-white overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
          <div className="bg-black text-white p-5 font-black uppercase text-lg flex flex-col gap-5">
            <span>Daftar Tugas Mahasiswa</span>

            {/* FILTERS */}
            <div className="flex flex-wrap gap-4 items-center">
              {/* Course Filter */}
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

              {/* Date Range Picker */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold uppercase text-gray-300">Periode:</label>
                <div className="bg-white text-black border-2 border-white">
                  <DateRangePicker
                    startDate={filters.dateFrom}
                    endDate={filters.dateTo}
                    onStartDateChange={(value) => handleFilterChange('dateFrom', value)}
                    onEndDateChange={(value) => handleFilterChange('dateTo', value)}
                    onClear={() => {
                      handleFilterChange('dateFrom', '');
                      handleFilterChange('dateTo', '');
                    }}
                  />
                </div>
              </div>

              {/* Sort Buttons */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase">Sort:</span>
                <button
                  onClick={() => toggleSort('deadline')}
                  className={`px-3 py-1.5 border-2 border-white font-black text-xs uppercase hover:bg-white hover:text-black transition-colors ${
                    filters.sortBy === 'deadline' ? 'bg-white text-black' : ''
                  }`}
                >
                  TANGGAL {filters.sortBy === 'deadline' ? (filters.sortOrder === 'asc' ? '(LAMA)' : '(BARU)') : ''}
                </button>
                <button
                  onClick={() => toggleSort('course')}
                  className={`px-3 py-1.5 border-2 border-white font-black text-xs uppercase hover:bg-white hover:text-black transition-colors ${
                    filters.sortBy === 'course' ? 'bg-white text-black' : ''
                  }`}
                >
                  MATKUL {filters.sortBy === 'course' ? (filters.sortOrder === 'asc' ? '(A-Z)' : '(Z-A)') : ''}
                </button>
              </div>

              {/* Clear Filters */}
              <button
                onClick={clearFilters}
                className="px-3 py-1.5 border-2 border-red-400 text-red-400 font-black text-xs uppercase hover:bg-red-400 hover:text-white transition-colors"
              >
                CLEAR
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b-4 border-black bg-purple-600 text-white">
                  <th className="p-4 border-r-4 border-black font-black uppercase">Mahasiswa</th>
                  <th className="p-4 border-r-4 border-black font-black uppercase">Tugas</th>
                  <th className="p-4 border-r-4 border-black font-black uppercase">Deadline</th>
                  <th className="p-4 text-center font-black uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {(showAll ? filteredAssignments : filteredAssignments.slice(0, 5)).map((item) => (
                  <tr key={item.id} className="border-b-4 border-black hover:bg-green-100 transition-colors bg-white">
                    <td className="p-4 border-r-4 border-black font-black uppercase">
                      {item.students?.nama}
                    </td>
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
                ))}
              </tbody>
            </table>
          </div>

          {filteredAssignments.length > 5 && (
            <div className="px-4 py-3 bg-gray-100 border-t-4 border-black flex justify-end">
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