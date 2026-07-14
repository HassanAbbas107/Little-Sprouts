import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/router';
import { auth as firebaseAuth, isFirebaseConfigured } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged 
} from 'firebase/auth';

const AuthContext = createContext({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  error: null,
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (isFirebaseConfigured) {
      const unsubscribe = onAuthStateChanged(firebaseAuth, (firebaseUser) => {
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            isMock: false,
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Simulator local storage logic
      const mockSession = localStorage.getItem('kd_session');
      if (mockSession) {
        setUser(JSON.parse(mockSession));
      } else {
        setUser(null);
      }
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      if (isFirebaseConfigured) {
        const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
        setUser({
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          isMock: false,
        });
      } else {
        // Mock authentication validation
        if (email === 'admin@kindergarten.com' && password === 'password123') {
          const mockUser = {
            uid: 'mock-admin-uid-12345',
            email: 'admin@kindergarten.com',
            isMock: true,
          };
          localStorage.setItem('kd_session', JSON.stringify(mockUser));
          setUser(mockUser);
        } else {
          throw new Error('Invalid email or password. (Simulator default: admin@kindergarten.com / password123)');
        }
      }
      router.replace('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to authenticate');
      setLoading(false);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (isFirebaseConfigured) {
        await firebaseSignOut(firebaseAuth);
      } else {
        localStorage.removeItem('kd_session');
      }
      setUser(null);
      router.replace('/login');
    } catch (err) {
      console.error('Error signing out:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
