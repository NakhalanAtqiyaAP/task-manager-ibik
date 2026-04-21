import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useStudentTasks(currentUser, isAuthorized) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStudentTasks = async () => {
    if (!currentUser?.id) return;

    setLoading(true);
    try {
      const { data: monitorData, error } = await supabase
        .from('student_tasks')
        .select(`
          id,
          deadline,
          is_completed,
          students ( id, nama ),
          tasks (
            id,
            judul,
            courses (
              semester,
              mata_kuliah:matkul_id ( nama_matkul )
            )
          )
        `)
        .eq('student_id', currentUser.id)
        .order('deadline', { ascending: true });

      if (error) throw error;
      setTasks(monitorData || []);
    } catch (error) {
      console.error('Error fetching student tasks:', error?.message || error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized && currentUser) {
      fetchStudentTasks();
    }
  }, [isAuthorized, currentUser]);

  return { tasks, loading, fetchStudentTasks };
}
