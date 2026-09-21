/**
 * Menghitung semester aktif berdasarkan tahun masuk angkatan
 * @param {number} startYear - Tahun masuk mahasiswa (misal: 2025 untuk kelas TI-25-KA)
 * @returns {number} Current semester (1, 2, 3, dst)
 */
export const DEFAULT_START_YEAR = 2025;

/**
 * Mengambil tahun masuk dari data mahasiswa atau nama kelas.
 * @param {object} student - Data mahasiswa dari tabel students
 * @param {number} fallbackYear - Tahun masuk jika data mahasiswa belum memilikinya
 * @returns {number}
 */
export const getStudentStartYear = (student, fallbackYear = DEFAULT_START_YEAR) => {
  const explicitYear = Number(
    student?.start_year || student?.tahun_masuk || student?.angkatan
  );

  if (explicitYear >= 2000 && explicitYear <= 2100) return explicitYear;

  const className = student?.kelas || student?.class_name || '';
  const classYear = String(className).match(/(?:TI[- ]?)?(\d{2})(?:[- ]|$)/i);
  if (classYear) return 2000 + Number(classYear[1]);

  return fallbackYear;
};

/**
 * Menghitung semester aktif berdasarkan tahun masuk angkatan.
 * Tahun ajaran baru dimulai pada bulan Agustus.
 * @param {number} startYear - Tahun masuk mahasiswa
 * @param {Date} date - Tanggal acuan, terutama berguna untuk pengujian
 * @returns {number} Semester aktif
 */
export const getCurrentSemester = (startYear = DEFAULT_START_YEAR, date = new Date()) => {
  const normalizedStartYear = Number(startYear) || DEFAULT_START_YEAR;
  const yearDiff = date.getFullYear() - normalizedStartYear;
  const isOddSemester = date.getMonth() + 1 >= 8;

  return Math.max(1, yearDiff * 2 + (isOddSemester ? 1 : 0));
};

export const getStudentCurrentSemester = (student, date = new Date()) =>
  getCurrentSemester(getStudentStartYear(student), date);

export const getSemesterLabel = (student, date = new Date()) =>
  `Semester ${getStudentCurrentSemester(student, date)}`;