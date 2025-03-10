
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  updateProfile, 
  User as FirebaseUser 
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Convert Firebase user to our User type
  const formatUser = (firebaseUser: FirebaseUser): User => {
    return {
      id: firebaseUser.uid,
      name: firebaseUser.displayName || 'User',
      email: firebaseUser.email || '',
      avatar: firebaseUser.photoURL || undefined,
    };
  };

  // Listen to authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const formattedUser = formatUser(firebaseUser);
        setUser(formattedUser);
        localStorage.setItem('user', JSON.stringify(formattedUser));
      } else {
        setUser(null);
        localStorage.removeItem('user');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Đăng nhập thành công');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'Email hoặc mật khẩu không đúng';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Người dùng không tồn tại';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Mật khẩu không đúng';
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('Attempting to register with:', { name, email, password: '***' });
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User created successfully:', userCredential.user.uid);
      
      // Update the user profile with the name
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: name
        });
        console.log('Profile updated with name:', name);
        
        // Sign out the user after registration is complete
        await signOut(auth);
        setUser(null);
        localStorage.removeItem('user');
      }
      
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/'); // Redirect to the login page
    } catch (error: any) {
      console.error('Registration error:', error);
      let errorMessage = 'Đăng ký thất bại. Vui lòng thử lại.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email đã được sử dụng';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email không hợp lệ';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Mật khẩu quá yếu';
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      localStorage.removeItem('user');
      toast.info('Đã đăng xuất');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Đăng xuất thất bại');
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      if (auth.currentUser && user) {
        // Only update displayName in Firebase if it's included in userData
        if (userData.name) {
          await updateProfile(auth.currentUser, {
            displayName: userData.name
          });
        }
        
        // If avatar URL is provided, update photoURL
        if (userData.avatar) {
          await updateProfile(auth.currentUser, {
            photoURL: userData.avatar
          });
        }
        
        // Update local user state
        const updatedUser = { ...user, ...userData };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        toast.success('Cập nhật thông tin thành công');
      }
    } catch (error) {
      console.error('Update user error:', error);
      toast.error('Cập nhật thông tin thất bại');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
