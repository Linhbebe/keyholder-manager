
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
import { sendESP32Notification, storeLoginActivity } from '@/utils/esp32Utils';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
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

  const formatUser = (firebaseUser: FirebaseUser): User => {
    // For demonstration, users with specific emails can be assigned admin role
    // In a real system, this would come from a database
    const isAdmin = firebaseUser.email?.includes('admin') || false;
    
    return {
      id: firebaseUser.uid,
      name: firebaseUser.displayName || 'User',
      email: firebaseUser.email || '',
      avatar: firebaseUser.photoURL || undefined,
      role: isAdmin ? 'admin' : 'user'
    };
  };

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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userData = formatUser(userCredential.user);
      
      // Send notification to ESP32 with username and login time
      await sendESP32Notification({
        userId: userData.id,
        userName: userData.name,
        action: 'login',
        message: `${userData.name} đã đăng nhập`
      });
      
      // Store login activity for real-time history
      await storeLoginActivity(userData.id, userData.name, 'login');
      
      toast.success('Đăng nhập thành công', {
        description: `Chào mừng trở lại, ${userData.name}!`,
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'Email hoặc mật khẩu không đúng';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Người dùng không tồn tại';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Mật khẩu không đúng';
      }
      toast.error('Đăng nhập thất bại', {
        description: errorMessage,
      });
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
      
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: name
        });
        console.log('Profile updated with name:', name);
        
        // Notify ESP32 about new user registration
        await sendESP32Notification({
          userId: userCredential.user.uid,
          userName: name,
          action: 'register',
          message: `${name} đã đăng ký tài khoản mới`
        });
        
        await signOut(auth);
        setUser(null);
        localStorage.removeItem('user');
      }
      
      toast.success('Đăng ký thành công!', {
        description: 'Vui lòng đăng nhập với tài khoản mới của bạn.',
      });
      navigate('/');
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
      
      toast.error('Đăng ký thất bại', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (user) {
        // Log the logout activity before actually logging out
        await storeLoginActivity(user.id, user.name, 'logout');
        
        // Notify ESP32 about logout
        await sendESP32Notification({
          userId: user.id,
          userName: user.name,
          action: 'logout',
          message: `${user.name} đã đăng xuất`
        });
      }
      
      await signOut(auth);
      setUser(null);
      localStorage.removeItem('user');
      toast.info('Đã đăng xuất thành công');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Đăng xuất thất bại');
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      if (auth.currentUser && user) {
        if (userData.name) {
          await updateProfile(auth.currentUser, {
            displayName: userData.name
          });
        }
        
        if (userData.avatar) {
          await updateProfile(auth.currentUser, {
            photoURL: userData.avatar
          });
        }
        
        const updatedUser = { ...user, ...userData };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Log this activity
        await storeLoginActivity(user.id, updatedUser.name, 'update_profile');
        
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
        isAdmin: user?.role === 'admin',
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
