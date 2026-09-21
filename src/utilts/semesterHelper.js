/**
 * Menghitung semester aktif berdasarkan tahun masuk angkatan
 * @param {number} startYear - Tahun masuk mahasiswa (misal: 2025 untuk kelas TI-25-KA)
 * @returns {number} Current semester (1, 2, 3, dst)
 */
export const getCurrentSemester = (startYear = 2025) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // getMonth() dimulai dari 0 (Januari = 0)

  // Selisih tahun
  const yearDiff = currentYear - startYear;

  // Jika bulan Agustus (8) ke atas, masuk ke semester ganjil tahun ajaran baru
  if (currentMonth >= 8) {
    return yearDiff * 2 + 1;
  } 
  // Jika bulan Januari - Juli, masuk ke semester genap tahun ajaran sebelumnya
  else {
    return yearDiff * 2;
  }
};