import { AuthenticationError } from '@/errors';
import { AuthService, UserInfo } from '@/services/auth';
import { AuthServiceEvent } from '@/services/auth/AuthService.constants';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

interface AuthContextValue {
  user?: UserInfo;
  isAuthenticated: boolean;
  isAuthorized: boolean;
  isLoading: boolean;
  error: AuthenticationError | null;
  authService: AuthService;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authService] = useState<AuthService>(AuthService.getInstance());
  const [user, setUser] = useState<UserInfo>();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AuthenticationError | null>(null);

  useEffect(() => {
    let isInitializing = true;
    let authSuccessTimeout: NodeJS.Timeout | null = null;

    setIsLoading(true);

    // Helper to set authenticated user state
    const setAuthenticatedUser = async () => {
      const currentUser = await authService.getUser();
      const authorized = authService.isAuthorized();

      setUser(currentUser);
      setIsAuthenticated(!!currentUser);
      setIsAuthorized(authorized);
      isInitializing = false;
      setIsLoading(false);
    };

    // Helper to set unauthenticated state
    const setUnauthenticatedUser = () => {
      setUser(undefined);
      setIsAuthenticated(false);
      setIsAuthorized(false);
      isInitializing = false;
      setIsLoading(false);
    };

    const handleAuthSuccess = async () => {
      await setAuthenticatedUser();
    };

    const handleAuthLogout = () => {
      setUser(undefined);
      setIsAuthenticated(false);
      setIsAuthorized(false);
    };

    const handleAuthError = (e: Event) => {
      // Skip this handler during initialization - let init().catch() handle it
      if (isInitializing) return;

      // e.detail contains the error passed from Keycloak
      setError(AuthenticationError.parse((e as CustomEvent).detail));
      setIsLoading(false);
    };

    // Set up event listeners before initialization
    window.addEventListener(AuthServiceEvent.AUTH_SUCCESS, handleAuthSuccess);
    window.addEventListener(AuthServiceEvent.AUTH_LOGOUT, handleAuthLogout);
    window.addEventListener(AuthServiceEvent.AUTH_ERROR, handleAuthError);

    // Check if we're in an OAuth callback (has code/state params)
    const urlParams = new URLSearchParams(window.location.search);
    const isOAuthCallback =
      urlParams.has('code') ||
      urlParams.has('state') ||
      urlParams.has('session_state');

    // Initialize the authService
    (async () => {
      try {
        const isAuth = await authService.init();
        if (isAuth) {
          await setAuthenticatedUser();
        } else {
          // Wait for auth success event before marking as unauthenticated
          const timeoutDuration = isOAuthCallback ? 2000 : 500;
          authSuccessTimeout = setTimeout(() => {
            if (isInitializing) {
              setUnauthenticatedUser();
            }
          }, timeoutDuration);
        }
      } catch (err) {
        setError(AuthenticationError.parse(err));
        isInitializing = false;
        setIsLoading(false);
      }
    })();

    return () => {
      // Cleanup event listeners
      window.removeEventListener(
        AuthServiceEvent.AUTH_SUCCESS,
        handleAuthSuccess,
      );
      window.removeEventListener(
        AuthServiceEvent.AUTH_LOGOUT,
        handleAuthLogout,
      );
      window.removeEventListener(AuthServiceEvent.AUTH_ERROR, handleAuthError);

      // Cleanup timeout to prevent memory leak
      if (authSuccessTimeout) {
        clearTimeout(authSuccessTimeout);
      }
    };
  }, [authService]);

  const contextValue: AuthContextValue = {
    user,
    isAuthenticated,
    isAuthorized,
    isLoading,
    error,
    authService,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
