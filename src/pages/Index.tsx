
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import AuthForm from '@/components/AuthForm';
import { Key } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-accent/30 p-4">
      <div className={`w-full ${isMobile ? 'max-w-[90%]' : 'max-w-md'}`}>
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Key className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">SmartKey</h1>
          <p className="text-muted-foreground mt-2">
            Quản lý khóa điện tử thông minh
          </p>
        </div>

        <AuthForm />
      </div>

      <div className="absolute bottom-4 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} SmartKey. Tất cả quyền được bảo lưu.
      </div>
    </div>
  );
};

export default Index;
