import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_URL } from '../config';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [isAuth, setIsAuth]       = useState(() => !!localStorage.getItem('bravas_auth'));
  const [profile, setProfile]     = useState(() => localStorage.getItem('bravas_profile') || null);
  const [bars, setBars]           = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  const login = (ok) => {
    setIsAuth(ok);
    if (ok) localStorage.setItem('bravas_auth', '1');
    else localStorage.removeItem('bravas_auth');
  };

  const selectProfile = (p) => {
    setProfile(p);
    localStorage.setItem('bravas_profile', p);
  };

  const fetchBars = useCallback(async () => {
    if (!API_URL) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}?action=getBars`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      // Normalizar IDs a string — Sheets puede devolver números
      setBars(data.map(bar => ({ ...bar, id: String(bar.id) })));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carga inicial de bares una vez autenticado
  useEffect(() => {
    if (isAuth) fetchBars();
  }, [isAuth, fetchBars]);

  const apiPost = async (body) => {
    const res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data;
  };

  const addBar = async (barData) => {
    const result = await apiPost({ action: 'addBar', ...barData });
    await fetchBars();
    return result;
  };

  const updateBar = async (barData) => {
    const result = await apiPost({ action: 'updateBar', ...barData });
    await fetchBars();
    return result;
  };

  const uploadPhoto = async (base64, fileName) => {
    return await apiPost({ action: 'uploadPhoto', file: base64, fileName });
  };

  return (
    <AppContext.Provider value={{
      isAuth, login,
      profile, selectProfile,
      bars, loading, error,
      fetchBars, addBar, updateBar, uploadPhoto,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp debe usarse dentro de AppProvider');
  return ctx;
}
