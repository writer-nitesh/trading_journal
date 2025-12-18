import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useGlobalState = create(
  persist(
    (set) => ({
      user: null,
      userData: null,
      data: [],
      isDataLoading: false,
      credentials: [],
      requestTokens: null,
      selectedBroker: null,
      currency: "INR",
      setCurrency: (currency) => set({ currency }),
      setUserData: (userData) => set({ userData }),
      setData: (data) => set({ data }),
      setIsDataLoading: (isLoading) => set({ isDataLoading: isLoading }),
      setUser: (user) => set({ user }),
      setCredentials: (credentials) => set({ credentials }),
      setRequestTokens: (tokens) => set({ requestTokens: tokens }),
      setSelectedBroker: (broker) => set({ selectedBroker: broker }),
    }),
    {
      name: 'tradio-state',
      partialize: (state) => ({
        user: state.user,
        credentials: state.credentials,
        requestTokens: state.requestTokens,
        selectedBroker: state.selectedBroker,
        currency: state.currency,
        userData: state.userData,
      }),
    }
  )
);

export default useGlobalState;