
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui-custom/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui-custom/Card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Mail, Eye, EyeOff, User } from 'lucide-react';

const AuthForm: React.FC = () => {
  const { login, register, isLoading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validateForm = () => {
    const newErrors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};
    
    // Validate email
    if (!email) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    // Validate password
    if (!password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    // Additional validations for registration
    if (isRegistering) {
      if (!name) {
        newErrors.name = 'Tên là bắt buộc';
      }
      
      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Mật khẩu không khớp';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (isRegistering) {
      console.log('Submitting registration form with:', { name, email, password: '***' });
      try {
        await register(name, email, password);
        // After successful registration, clear the form and show success message
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setIsRegistering(false);
        setRegistrationSuccess(true);
      } catch (error) {
        console.error("Registration error:", error);
      }
    } else {
      console.log('Submitting login form with:', { email, password: '***' });
      login(email, password);
    }
  };

  const toggleAuthMode = () => {
    setIsRegistering(!isRegistering);
    setErrors({});
    setRegistrationSuccess(false);
  };

  return (
    <Card variant="glass" className="w-full max-w-md mx-auto animate-fade-in" style={{ backdropFilter: 'blur(10px)' }}>
      <CardHeader>
        <CardTitle className="text-2xl text-center">
          {isRegistering ? 'Đăng ký' : 'Đăng nhập'}
        </CardTitle>
        <CardDescription className="text-center">
          {isRegistering
            ? 'Tạo tài khoản để quản lý khóa điện tử của bạn'
            : registrationSuccess 
              ? 'Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.'
              : 'Đăng nhập để quản lý khóa điện tử của bạn'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div className="space-y-2">
              <Label htmlFor="name">Họ tên</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Nhập họ tên của bạn"
                  className="pl-10"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              {errors.name && (
                <p className="text-sm font-medium text-destructive mt-1">{errors.name}</p>
              )}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Nhập email của bạn"
                className="pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {errors.email && (
              <p className="text-sm font-medium text-destructive mt-1">{errors.email}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Nhập mật khẩu của bạn"
                className="pl-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm font-medium text-destructive mt-1">{errors.password}</p>
            )}
          </div>
          
          {isRegistering && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập lại mật khẩu của bạn"
                  className="pl-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-sm font-medium text-destructive mt-1">{errors.confirmPassword}</p>
              )}
            </div>
          )}
          
          {!isRegistering && (
            <div className="text-right">
              <a href="#" className="text-sm text-primary hover:underline">
                Quên mật khẩu?
              </a>
            </div>
          )}
          
          <Button className="w-full" loading={isLoading}>
            {isRegistering ? 'Đăng ký' : 'Đăng nhập'}
          </Button>
        </form>
        
        <div className="text-center mt-4">
          <button
            type="button"
            className="text-sm text-primary hover:underline"
            onClick={toggleAuthMode}
          >
            {isRegistering
              ? 'Đã có tài khoản? Đăng nhập'
              : 'Chưa có tài khoản? Đăng ký ngay'}
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthForm;
