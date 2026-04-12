import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import DateRangePicker from './DateRangePicker';

export default function TaskTable({ tasks, loading, onRefresh }) {
  const [filteredTasks, setFilteredTasks] = useState([]);
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
    setFilteredTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    async function fetchCourses() {
      const { data, error } = await supabase
        .from('courses')
        .select('id, mata_kuliah(nama_matkul)');

      if (!error) {
        setCourses(data || []);
      }
    }
    fetchCourses();
  }, []);

  useEffect(() => {
    let filtered = [...tasks];

    // Filter by course
    if (filters.course) {
      filtered = filtered.filter(item =>
        item.tasks?.courses?.mata_kuliah?.nama_matkul === filters.course
      );
    }

    // Filter by date range (Dari - Sampai)
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
        const courseA = a.tasks?.courses?.mata_kuliah?.nama_matkul || '';
        const courseB = b.tasks?.courses?.mata_kuliah?.nama_matkul || '';
        comparison = courseA.localeCompare(courseB);
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredTasks(filtered);
  }, [tasks, filters]);

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

  const fmtDate = (iso) =>
    new Date(iso).toLocaleString('id-ID', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
    });

  return (
    <div className="px-4 sm:px-6 pb-24 mt-8">
      <div className="border-4 border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden">

        {/* HEADER */}
        <div className="bg-black text-white p-5 font-black uppercase flex flex-col gap-5">
          <div className="flex flex-wrap justify-between items-center gap-2 border-b-2 border-gray-700 pb-4">
            <span className="text-xl sm:text-2xl tracking-tight">Monitor Tugas Mahasiswa</span>
            <div className="flex items-center gap-3">
              {loading && (
                <span className="text-xs animate-pulse text-green-400 tracking-widest">
                  SYNCING...
                </span>
              )}
              <button
                onClick={onRefresh}
                className="text-green-400 text-xs border-2 border-green-400 px-3 py-1.5 tracking-widest hover:bg-green-400 hover:text-black transition-colors"
              >
                RE_SYNC
              </button>
            </div>
          </div>

          {/* FILTERS & CONTROLS */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            
            {/* Filter Section */}
            <div className="flex flex-wrap items-center gap-4">
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

              {/* Date Range Picker (Kalender Dari-Sampai) */}
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
            </div>

            {/* Sort & Actions Section */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto pt-4 lg:pt-0 border-t-2 border-gray-700 lg:border-none">
              <span className="text-xs font-bold uppercase text-gray-300">Sort:</span>
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
              
              <button
                onClick={clearFilters}
                className="px-3 py-1.5 border-2 border-red-400 text-red-400 font-black text-xs uppercase hover:bg-red-400 hover:text-white transition-colors ml-auto lg:ml-2"
              >
                RESET
              </button>
            </div>
          </div>
        </div>

        {/* DESKTOP TABLE — md ke atas */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-4 border-black bg-purple-600 text-white">
                {['Mahasiswa', 'Tugas', 'Mata Kuliah', 'Deadline', 'Status'].map((h, i) => (
                  <th
                    key={h}
                    className={`p-4 font-black uppercase text-sm lg:text-base ${i < 4 ? 'border-r-4 border-black' : 'text-center'}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length > 0 ? (
                (showAll ? filteredTasks : filteredTasks.slice(0, 5)).map((item) => (
                  <tr
                    key={item.id}
                    className="border-b-4 border-black hover:bg-green-100 transition-colors bg-white"
                  >
                    <td className="p-4 border-r-4 border-black font-black text-sm uppercase">
                      {item.students?.nama}
                    </td>
                    <td className="p-4 border-r-4 border-black font-semibold text-sm">
                      {item.tasks?.judul}
                    </td>
                    <td className="p-4 border-r-4 border-black italic text-gray-600 text-sm">
                      {item.tasks?.courses?.mata_kuliah?.nama_matkul}{' '}
                      <span className="not-italic text-xs text-gray-500">
                        (Sem {item.tasks?.courses?.semester})
                      </span>
                    </td>
                    <td className="p-4 border-r-4 border-black font-black text-purple-600 whitespace-nowrap text-sm">
                      {fmtDate(item.deadline)}
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`inline-block border-2 border-black px-2 py-1 font-black text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                          item.is_completed ? 'bg-green-400' : 'bg-red-400 text-white'
                        }`}
                      >
                        {item.is_completed ? 'COMPLETED' : 'PENDING'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-10 text-center font-black text-gray-400 uppercase italic">
                    {loading ? 'Fetching System Data...' : 'Tidak ada tugas yang sesuai filter.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredTasks.length > 5 && (
          <div className="px-4 py-3 bg-gray-100 border-t-4 border-black flex justify-end">
            <button
              onClick={() => setShowAll(prev => !prev)}
              className="px-3 py-1.5 border-2 border-black bg-black text-white font-black text-xs uppercase hover:bg-white hover:text-black transition-colors"
            >
              {showAll ? 'SHOW LESS' : `SHOW ALL (${filteredTasks.length})`}
            </button>
          </div>
        )}

        {/* MOBILE CARD LIST — di bawah md */}
        <div className="md:hidden divide-y-4 divide-black">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((item) => (
              <div key={item.id} className="bg-white">
                {/* Card Header */}
                <div className="bg-purple-600 text-white p-3 flex justify-between items-start gap-2">
                  <div>
                    <p className="font-black uppercase text-sm">
                      {item.students?.nama}
                    </p>
                    <p className="text-xs opacity-80 mt-0.5">{item.tasks?.judul}</p>
                  </div>
                  <span
                    className={`shrink-0 border-2 border-black px-2 py-0.5 font-black text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                      item.is_completed ? 'bg-green-400 text-black' : 'bg-red-400 text-white'
                    }`}
                  >
                    {item.is_completed ? 'DONE' : 'PENDING'}
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-3 flex flex-col gap-2 text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="font-black uppercase text-xs text-gray-500">Mata Kuliah</span>
                    <span className="italic text-gray-700 text-right">
                      {item.tasks?.courses?.mata_kuliah?.nama_matkul}{' '}
                      <span className="not-italic text-xs text-gray-500">
                        (Sem {item.tasks?.courses?.semester})
                      </span>
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="font-black uppercase text-xs text-gray-500">Deadline</span>
                    <span className="font-black text-purple-600">
                      {fmtDate(item.deadline)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-10 text-center font-black text-gray-400 uppercase italic">
              {loading ? 'Fetching System Data...' : 'Tidak ada tugas yang sesuai filter.'}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}