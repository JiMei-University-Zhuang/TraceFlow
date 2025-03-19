import { User } from '@/types';
import React from 'react';

interface UserContextType {
  user: User;
  token: string;
  setUser: (user: { username: string; password: string }) => void;
  setToken: (token: string) => void;
  setTokenToLocalStorage: (token: string) => void;
  getToken: () => string | null;
}
export const UserContext = React.createContext<UserContextType>({
  user: { username: '', password: '' },
  token: '',
  setUser: (user: { username: string; password: string }) => {
    user;
  },
  setToken: (token: string) => {
    token;
  },
  setTokenToLocalStorage: (token: string) => {
    token;
  },
  getToken: () => null,
});

export default function UserProvider({ children }: { children: React.ReactNode }) {
  const localStorageKey = '__user_provider_token__';
  const getToken = () => window.localStorage.getItem(localStorageKey);
  const setTokenToLocalStorage = (token: string) => window.localStorage.setItem(localStorageKey, token);
  const [user, setUser] = React.useState({ username: '', password: '' });
  const [token, setToken] = React.useState(getToken() || '');
  return <UserContext.Provider value={{ user, setUser, token, setToken, getToken, setTokenToLocalStorage }}>{children}</UserContext.Provider>;
}

export const useUser = () => {
  return React.useContext(UserContext);
};
