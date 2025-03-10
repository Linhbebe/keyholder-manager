
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import ProfileHeader from '@/components/ProfileHeader';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui-custom/Card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Button from '@/components/ui-custom/Button';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { 
  User, Shield, Settings, Bell, Lock, Key, Smartphone, 
  Globe, Languages, Moon, LogOut, UserPlus 
} from 'lucide-react';

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      updateUser({ name, email });
      setLoading(false);
    }, 1000);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in pb-6">
        <ProfileHeader />

        <Tabs defaultValue="account" className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="account" className="flex-1 gap-2">
              <User className="h-4 w-4" />
              Tài khoản
            </TabsTrigger>
            <TabsTrigger value="security" className="flex-1 gap-2">
              <Shield className="h-4 w-4" />
              Bảo mật
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex-1 gap-2">
              <Settings className="h-4 w-4" />
              Tùy chọn
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-6">
            <Card variant="glass" className="animate-scale-in">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Thông tin cá nhân
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Họ và tên</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nhập họ và tên của bạn"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Nhập email của bạn"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Nhập số điện thoại của bạn"
                    />
                  </div>
                  <Button type="submit" loading={loading}>
                    Cập nhật thông tin
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card variant="glass" className="animate-scale-in" style={{ animationDelay: '100ms' }}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Key className="h-5 w-5 text-primary" />
                  Thiết bị đăng nhập
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-accent/50 rounded-md">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-8 w-8 text-primary p-1.5 rounded-full bg-primary/10" />
                      <div>
                        <p className="font-medium">iPhone 13 Pro</p>
                        <p className="text-xs text-muted-foreground">Đăng nhập lần cuối: Hôm nay, 08:45</p>
                      </div>
                    </div>
                    <Badge>Thiết bị hiện tại</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-md">
                    <div className="flex items-center gap-3">
                      <Globe className="h-8 w-8 text-muted-foreground p-1.5 rounded-full bg-muted" />
                      <div>
                        <p className="font-medium">Chrome - Windows</p>
                        <p className="text-xs text-muted-foreground">Đăng nhập lần cuối: 23/05/2023</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Đăng xuất</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card variant="glass" className="animate-scale-in">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  Bảo mật tài khoản
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Mật khẩu</Label>
                    <div className="flex items-center gap-2">
                      <Input type="password" value="••••••••" disabled className="flex-1" />
                      <Button variant="outline">Đổi mật khẩu</Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">Xác thực hai yếu tố</p>
                      <p className="text-sm text-muted-foreground">Bảo vệ tài khoản bằng xác thực hai yếu tố</p>
                    </div>
                    <Switch />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">Thông báo đăng nhập mới</p>
                      <p className="text-sm text-muted-foreground">Nhận thông báo khi có đăng nhập mới vào tài khoản</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card variant="glass" className="animate-scale-in" style={{ animationDelay: '100ms' }}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-primary" />
                  Tài khoản liên kết
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-[#4285F4] flex items-center justify-center text-white">G</div>
                      <div>
                        <p className="font-medium">Google</p>
                        <p className="text-xs text-muted-foreground">Chưa liên kết</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Liên kết</Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-[#1877F2] flex items-center justify-center text-white">f</div>
                      <div>
                        <p className="font-medium">Facebook</p>
                        <p className="text-xs text-muted-foreground">Chưa liên kết</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Liên kết</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card variant="glass" className="animate-scale-in">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Thông báo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Cảnh báo bảo mật</p>
                      <p className="text-sm text-muted-foreground">Nhận thông báo về các vấn đề bảo mật</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Hoạt động của khóa</p>
                      <p className="text-sm text-muted-foreground">Nhận thông báo khi khóa được mở hoặc đóng</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Cập nhật hệ thống</p>
                      <p className="text-sm text-muted-foreground">Nhận thông báo về cập nhật phần mềm mới</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card variant="glass" className="animate-scale-in" style={{ animationDelay: '100ms' }}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Cài đặt ứng dụng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Languages className="h-4 w-4" />
                      <p className="font-medium">Ngôn ngữ</p>
                    </div>
                    <select className="rounded-md border border-input bg-background px-3 py-1 text-sm">
                      <option value="vi">Tiếng Việt</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      <p className="font-medium">Giao diện tối</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center pt-0">
                <Button 
                  variant="destructive" 
                  icon={LogOut}
                  onClick={handleLogout}
                >
                  Đăng xuất
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Profile;
