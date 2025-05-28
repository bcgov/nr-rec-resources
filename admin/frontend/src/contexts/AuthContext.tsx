import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { AuthService, UserInfo } from "@/services/auth";
import { AuthenticationError } from "@/errors";
import { AuthServiceEvent } from "@/services/auth/AuthService.constants";

interface AuthContextValue {
  user?: UserInfo;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthenticationError | null;
  authService: AuthService;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authService] = useState<AuthService>(AuthService.getInstance());
  const [user, setUser] = useState<UserInfo>();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AuthenticationError | null>(null);

  const initAndSetupAuth = async () => {
    try {
      setIsLoading(true);
      // Removed direct assignment of event handlers.
      await authService.init();
    } catch (err) {
      setError(AuthenticationError.parse(err));
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initAndSetupAuth();

    const handleAuthSuccess = async () => {
      const currentUser = await authService.getUser();
      setUser(currentUser);
      setIsAuthenticated(!!currentUser);
      setIsLoading(false);
    };

    const handleAuthLogout = () => {
      setUser(undefined);
      setIsAuthenticated(false);
    };

    const handleAuthError = (e: Event) => {
      // e.detail contains the error passed from Keycloak
      setError(AuthenticationError.parse((e as CustomEvent).detail));
      setIsLoading(false);
    };

    window.addEventListener(AuthServiceEvent.AUTH_SUCCESS, handleAuthSuccess);
    window.addEventListener(AuthServiceEvent.AUTH_LOGOUT, handleAuthLogout);
    window.addEventListener(AuthServiceEvent.AUTH_ERROR, handleAuthError);

    return () => {
      window.removeEventListener(
        AuthServiceEvent.AUTH_SUCCESS,
        handleAuthSuccess,
      );
      window.removeEventListener(
        AuthServiceEvent.AUTH_LOGOUT,
        handleAuthLogout,
      );
      window.removeEventListener(AuthServiceEvent.AUTH_ERROR, handleAuthError);
    };
  }, []);

  const contextValue: AuthContextValue = {
    user,
    isAuthenticated,
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
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
