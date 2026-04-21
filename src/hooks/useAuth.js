import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [session, setSession] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [showOAuthBooting, setShowOAuthBooting] = useState(false);
  const [oauthBootUserName, setOAuthBootUserName] = useState('');

  useEffect(() => {
    const handleSession = async (currentSession, shouldBoot = false) => {
      if (!currentSession) {
        setSession(null);
        setIsAuthorized(false);
        setCurrentUser(null);
        setIsCheckingAuth(false);
        return;
      }

      const oauthBootRequest = shouldBoot || !!localStorage.getItem('oauth_booting');
      if (oauthBootRequest) {
        localStorage.removeItem('oauth_booting');
      }

      try {
        const userEmail = currentSession.user.email;
        const { data: student, error } = await supabase
          .from('students')
          .select('*')
          .eq('email', userEmail)
          .single();

        if (error) {
          console.error('Student lookup failed:', error);
          throw error;
        }

        if (student) {
          setSession(currentSession);
          setIsAuthorized(true);
          setCurrentUser(student);

          if (oauthBootRequest) {
            setOAuthBootUserName(student.nama || userEmail || 'Pengguna');
            setShowOAuthBooting(true);

            setTimeout(() => {
              setShowOAuthBooting(false);
              setIsCheckingAuth(false);
            }, 5000);
          }

          const lastLogin = localStorage.getItem('last_log_at');
          const now = new Date().getTime();
          if (!lastLogin || now - lastLogin > 60000) {
            await supabase.from('login_history').insert([
              { student_id: student.id, email: userEmail, login_method: currentSession.user.app_metadata?.provider || 'password' }
            ]);
            localStorage.setItem('last_log_at', now);
          }
        } else {
          await supabase.auth.signOut();
          alert('Email tidak terdaftar!');
          setSession(null);
          setIsAuthorized(false);
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('handleSession error:', error);
        setSession(null);
        setIsAuthorized(false);
        setCurrentUser(null);
      } finally {
        if (!oauthBootRequest) {
          setIsCheckingAuth(false);
        }
      }
    };

    const initAuth = async () => {
      try {
        const manualUser = localStorage.getItem('manual_auth_user');

        if (manualUser) {
          const parsed = JSON.parse(manualUser);
          if (parsed && parsed.email) {
            setCurrentUser(parsed);
            setSession({ user: { email: parsed.email }, app_metadata: { provider: 'manual' } });
            setIsAuthorized(true);
            setIsCheckingAuth(false);
            return;
          }
        }

        const oauthBootRequest = !!localStorage.getItem('oauth_booting');
        if (oauthBootRequest) {
          localStorage.removeItem('oauth_booting');
        }

        const { data } = await supabase.auth.getSession();
        if (data?.session) {
          await handleSession(data.session, oauthBootRequest);
        } else {
          setIsAuthorized(false);
          setIsCheckingAuth(false);
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        setIsCheckingAuth(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        handleSession(session, !!localStorage.getItem('oauth_booting'));
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  useEffect(() => {
    let logoutTimer;
    const resetTimer = () => {
      if (logoutTimer) clearTimeout(logoutTimer);

      logoutTimer = setTimeout(() => {
        alert('Sesi berakhir karena tidak ada aktivitas selama 2 jam.');
        supabase.auth.signOut();
      }, 7200000);
    };

    if (isAuthorized) {
      window.addEventListener('mousemove', resetTimer);
      window.addEventListener('keydown', resetTimer);
      window.addEventListener('scroll', resetTimer);
      window.addEventListener('click', resetTimer);
      resetTimer();
    }

    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('scroll', resetTimer);
      window.removeEventListener('click', resetTimer);
      if (logoutTimer) clearTimeout(logoutTimer);
    };
  }, [isAuthorized]);

  const logout = async () => {
    localStorage.removeItem('manual_auth_user');
    await supabase.auth.signOut();
    setIsAuthorized(false);
    setCurrentUser(null);
    setSession(null);
    setShowOAuthBooting(false);
  };

  return {
    isAuthorized,
    isCheckingAuth,
    currentUser,
    showOAuthBooting,
    oauthBootUserName,
    logout,
    setCurrentUser,
  };
}
