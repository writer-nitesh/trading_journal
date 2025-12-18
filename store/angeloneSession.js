import { create } from 'zustand';

const useAngeloneSession = create((set) => ({
  isLoggedIn: false,
  client_code: '',
  status: 'idle', // 'idle' | 'loading' | 'success' | 'error'
  error: null,
  login: (client_code) => set({ isLoggedIn: true, client_code, status: 'success', error: null }),
  logout: () => set({ isLoggedIn: false, client_code: '', status: 'idle', error: null }),
  setError: (error) => set({ error, status: 'error' }),
  setStatus: (status) => set({ status }),
}));

export default useAngeloneSession;
