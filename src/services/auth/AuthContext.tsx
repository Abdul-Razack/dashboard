import {
  FC,
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import { useIsHydrated } from '@/hooks/useIsHydrated';

type AuthContextValue = {
  isAuthenticated: boolean;
  updateToken(token?: string | null): void;
  logout: () => void;
};

export const AUTH_TOKEN_KEY = 'authToken';

const AuthContext = createContext<AuthContextValue | null>(null as TODO);

const updateToken = (newToken?: string | null) => {
  if (!newToken) {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  } else {
    localStorage.setItem(AUTH_TOKEN_KEY, newToken);
  }
};

const logout = () => {
  updateToken(null);
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('Missing parent <AuthProvider> component');
  }
  const { isAuthenticated, updateToken, logout } = context;
  const isHydrated = useIsHydrated();

  return {
    isLoading: !isHydrated,
    isAuthenticated,
    updateToken,
    logout,
  };
};

export const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
  const [token, setToken] = useState(
    localStorage.getItem(AUTH_TOKEN_KEY) || null
  );

  const handleUpdateToken = useCallback(
    (newToken: string) => {
      setToken(newToken);
      updateToken(newToken);
    },
    [setToken]
  );

  const handleLogout = useCallback(() => {
    setToken(null);
    logout();
  }, [setToken]);

  const value = useMemo(
    () => ({
      isAuthenticated: !!token,
      updateToken: handleUpdateToken,
      logout: handleLogout,
    }),
    [token, handleUpdateToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
