import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui-custom/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui-custom/Button';
import { 
  Shield, Users, Key, Clock, History, Bell, 
  UserPlus, UserCheck, UserX, DoorOpen, Lock,
  ShieldAlert, Search, LogOut, Home, Mail
} from 'lucide-react';
import { database } from '@/lib/firebase';
import { ref, onValue, get, set, remove, query, orderByChild, limitToLast } from 'firebase/database';
import { grantRoomAccess, revokeRoomAccess } from '@/utils/esp32Utils';
import { Link } from 'react-router-dom';
import AuthorizedEmails from '@/components/AuthorizedEmails';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  lastLogin?: string;
  accessGranted?: boolean;
  permissions?: {
    manageUsers: boolean;
    manageAccess: boolean;
    viewLogs: boolean;
    manageDoors: boolean;
  };
}

interface AccessLogEntry {
  id: string;
  userName: string;
  userId: string;
  action: string;
  formattedTime: string;
  deviceInfo: string;
}

const ROOMS = [
  { id: 'room1', name: 'Phòng họp chính' },
  { id: 'room2', name: 'Phòng làm việc' },
  { id: 'room3', name: 'Phòng giám đốc' },
  { id: 'room4', name: 'Phòng kỹ thuật' }
];

const PERMISSIONS = [
  { id: 'manageUsers', name: 'Quản lý người dùng', description: 'Thêm, sửa, xóa người dùng' },
  { id: 'manageAccess', name: 'Phân quyền truy cập', description: 'Cấp, thu hồi quyền truy cập' },
  { id: 'viewLogs', name: 'Xem lịch sử', description: 'Xem lịch sử hoạt động' },
  { id: 'manageDoors', name: 'Quản lý cửa', description: 'Mở, khóa các cửa trong hệ thống' }
];

const AdminDashboard: React.FC = () => {
  const { user, logout, updateUserPermissions } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [accessLogs, setAccessLogs] = useState<AccessLogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const usersRef = ref(database, 'users');
    const unsubscribeUsers = onValue(usersRef, (snapshot) => {
      const usersList: UserData[] = [];
      
      snapshot.forEach((userSnapshot) => {
        const userData = userSnapshot.val();
        usersList.push({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role || 'user',
          permissions: userData.permissions || {
            manageUsers: false,
            manageAccess: false,
            viewLogs: true,
            manageDoors: false
          },
          accessGranted: true
        });
      });
      
      setUsers(usersList);
      setLoading(false);
    });
    
    const recentActivitiesRef = query(
      ref(database, 'recent_activities'),
      orderByChild('timestamp'),
      limitToLast(50)
    );
    
    const unsubscribeActivities = onValue(recentActivitiesRef, (snapshot) => {
      const activities: AccessLogEntry[] = [];
      
      snapshot.forEach((userSnapshot) => {
        const userId = userSnapshot.key;
        
        userSnapshot.forEach((activitySnapshot) => {
          const activity = activitySnapshot.val();
          activities.push({
            id: activitySnapshot.key as string,
            userId: userId as string,
            userName: activity.userName,
            action: activity.action,
            formattedTime: activity.formattedTime,
            deviceInfo: activity.deviceInfo || 'Unknown device'
          });
        });
      });
      
      activities.sort((a, b) => {
        const dateA = new Date(a.formattedTime.split(', ')[0].split('/').reverse().join('-') + 'T' + a.formattedTime.split(', ')[1]);
        const dateB = new Date(b.formattedTime.split(', ')[0].split('/').reverse().join('-') + 'T' + b.formattedTime.split(', ')[1]);
        return dateB.getTime() - dateA.getTime();
      });
      
      setAccessLogs(activities);
    });
    
    return () => {
      unsubscribeUsers();
      unsubscribeActivities();
    };
  }, []);
  
  const handleToggleAccess = async (userId: string, userName: string, roomId: string, roomName: string, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        await revokeRoomAccess(userId, userName, roomId, roomName);
        toast.success(`Đã thu hồi quyền truy cập của ${userName} vào ${roomName}`);
      } else {
        await grantRoomAccess(userId, userName, roomId, roomName);
        toast.success(`Đã cấp quyền truy cập cho ${userName} vào ${roomName}`);
      }
      
      setUsers(users.map(u => {
        if (u.id === userId) {
          return { ...u, accessGranted: !currentStatus };
        }
        return u;
      }));
    } catch (error) {
      console.error('Error toggling access:', error);
      toast.error('Không thể thay đổi quyền truy cập. Vui lòng thử lại.');
    }
  };
  
  const handleTogglePermission = async (userId: string, permissionId: string, currentValue: boolean) => {
    const targetUser = users.find(u => u.id === userId);
    if (targetUser?.role === 'owner') {
      toast.error('Không thể thay đổi quyền của chủ sở hữu');
      return;
    }
    
    try {
      const userPermissions = { ...(targetUser?.permissions || {}) };
      
      userPermissions[permissionId as keyof typeof userPermissions] = !currentValue;
      
      await updateUserPermissions(userId, userPermissions);
      
      setUsers(users.map(u => {
        if (u.id === userId) {
          return { 
            ...u, 
            permissions: {
              ...u.permissions,
              [permissionId]: !currentValue
            }
          };
        }
        return u;
      }));
      
      toast.success(`Đã ${!currentValue ? 'cấp' : 'thu hồi'} quyền ${
        PERMISSIONS.find(p => p.id === permissionId)?.name || permissionId
      }`);
      
    } catch (error) {
      console.error('Error toggling permission:', error);
      toast.error('Không thể thay đổi quyền. Vui lòng thử lại.');
    }
  };
  
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user || (user.role !== 'admin' && user.role !== 'owner')) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center">Bạn không có quyền truy cập</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <p className="text-center text-muted-foreground">
                Bạn cần có quyền quản trị để truy cập trang này.
              </p>
              <Button asChild>
                <Link to="/dashboard">Quay lại trang chủ</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="pt-6 pb-16 space-y-6">
        <Card variant="glass" className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold">Bảng điều khiển dành cho {user.role === 'owner' ? 'chủ sở hữu' : 'quản trị viên'}</CardTitle>
                  <p className="text-muted-foreground">Quản lý người dùng và phân quyền truy cập</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/dashboard">
                    <Home className="mr-2 h-4 w-4" />
                    Trang chủ
                  </Link>
                </Button>
                <Button variant="destructive" size="sm" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Đăng xuất
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <div className="relative px-6 py-3 flex justify-between items-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-background/5 z-0"></div>
            
            <div className="relative z-10 flex items-center gap-4">
              <div className="bg-primary text-white p-2 rounded-full">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-sm">Trạng thái hệ thống: <span className="text-green-500">Hoạt động</span></p>
                <p className="text-xs text-muted-foreground">Tất cả các hệ thống đang hoạt động bình thường</p>
              </div>
            </div>
            
            <div className="relative z-10 flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm font-medium">Người dùng đang hoạt động</p>
                <p className="text-2xl font-bold text-primary">{users.length}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Tổng số phòng</p>
                <p className="text-2xl font-bold text-primary">{ROOMS.length}</p>
              </div>
            </div>
          </div>
        </Card>
        
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="users" className="flex items-center gap-2"
              disabled={!user.permissions?.manageUsers && user.role !== 'owner'}>
              <Users className="h-4 w-4" />
              Quản lý người dùng
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-2" 
              disabled={!user.permissions?.manageAccess && user.role !== 'owner'}>
              <Key className="h-4 w-4" />
              Phân quyền người dùng
            </TabsTrigger>
            <TabsTrigger value="authorized" className="flex items-center gap-2"
              disabled={user.role !== 'owner'}>
              <Mail className="h-4 w-4" />
              Email ủy quyền
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2"
              disabled={!user.permissions?.viewLogs && user.role !== 'owner'}>
              <History className="h-4 w-4" />
              Lịch sử hoạt động
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Danh sách người dùng
              </h2>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Tìm kiếm người dùng..." 
                    className="pl-9 w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon">
                  <UserPlus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <Card className="overflow-hidden border">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-3 font-medium">Tên</th>
                    <th className="text-left p-3 font-medium">Email</th>
                    <th className="text-left p-3 font-medium">Vai trò</th>
                    <th className="text-left p-3 font-medium">Trạng thái</th>
                    <th className="text-right p-3 font-medium">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((userData) => (
                    <tr key={userData.id} className="border-t">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-border">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {userData.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{userData.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground">{userData.email}</td>
                      <td className="p-3">
                        {userData.role === 'owner' ? (
                          <Badge className="bg-primary hover:bg-primary">Chủ sở hữu</Badge>
                        ) : userData.role === 'admin' ? (
                          <Badge variant="outline" className="border-amber-500 text-amber-500 hover:bg-amber-50">Quản trị viên</Badge>
                        ) : (
                          <Badge variant="outline">Người dùng</Badge>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${userData.lastLogin ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span className="text-sm text-muted-foreground">
                            {userData.lastLogin ? `Hoạt động ${userData.lastLogin}` : 'Không hoạt động'}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" disabled={userData.role === 'owner' && user.role !== 'owner'}>
                            <UserCheck className="h-4 w-4 mr-1" />
                            Chỉnh sửa
                          </Button>
                          <Button variant="ghost" size="sm" disabled={userData.role === 'owner'}>
                            <UserX className="h-4 w-4 mr-1" />
                            Vô hiệu
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </TabsContent>
          
          <TabsContent value="permissions" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                Phân quyền người dùng
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Tìm kiếm người dùng..." 
                  className="pl-9 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {filteredUsers.map((userData) => (
                <Card key={userData.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {userData.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {userData.name}
                        <Badge className={userData.role === 'owner' 
                          ? 'bg-primary ml-2' 
                          : userData.role === 'admin' 
                          ? 'bg-amber-500 ml-2' 
                          : 'bg-muted ml-2'}>
                          {userData.role === 'owner' 
                            ? 'Chủ sở hữu' 
                            : userData.role === 'admin' 
                            ? 'Quản trị viên' 
                            : 'Người dùng'}
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">{userData.email}</p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {PERMISSIONS.map((permission) => (
                        <div key={`${userData.id}-${permission.id}`} className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium">{permission.name}</p>
                            <p className="text-xs text-muted-foreground">{permission.description}</p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Switch 
                              checked={userData.permissions?.[permission.id as keyof typeof userData.permissions] || false}
                              disabled={userData.role === 'owner' || user.role !== 'owner'} 
                              onCheckedChange={() => handleTogglePermission(
                                userData.id, 
                                permission.id, 
                                userData.permissions?.[permission.id as keyof typeof userData.permissions] || false
                              )}
                            />
                            <span className="text-sm font-medium">
                              {userData.permissions?.[permission.id as keyof typeof userData.permissions] 
                                ? 'Có quyền' 
                                : 'Không có quyền'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="authorized" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Email ủy quyền
              </h2>
              <p className="text-sm text-muted-foreground">
                Thêm email để ủy quyền cho người dùng mới đăng ký
              </p>
            </div>
            
            <AuthorizedEmails />
          </TabsContent>
          
          <TabsContent value="logs" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                Lịch sử hoạt động
              </h2>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Tìm kiếm hoạt động..." className="pl-9 w-64" />
                </div>
                <Button variant="outline" size="sm">
                  <Clock className="h-4 w-4 mr-1" />
                  Thời gian thực
                </Button>
              </div>
            </div>
            
            <Card className="overflow-hidden">
              <div className="space-y-1 p-2">
                {accessLogs.map((log) => (
                  <div 
                    key={log.id} 
                    className="flex items-center justify-between p-3 rounded-md hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        {log.action === 'login' ? (
                          <LogOut className="h-4 w-4 text-green-500" />
                        ) : log.action === 'logout' ? (
                          <LogOut className="h-4 w-4 text-amber-500" />
                        ) : log.action === 'register' ? (
                          <UserPlus className="h-4 w-4 text-primary" />
                        ) : log.action.includes('quyền') ? (
                          <Key className="h-4 w-4 text-blue-500" />
                        ) : (
                          <Bell className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          <span className="text-primary">{log.userName}</span>
                          {' '}
                          {log.action === 'login' ? 'đã đăng nhập' : 
                           log.action === 'logout' ? 'đã đăng xuất' : 
                           log.action === 'register' ? 'đã đăng ký tài khoản' : 
                           log.action}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />{' '}
                          {log.formattedTime}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-right">
                      <p className="text-muted-foreground max-w-48 truncate">{log.deviceInfo}</p>
                    </div>
                  </div>
                ))}

                {accessLogs.length === 0 && !loading && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <History className="h-12 w-12 text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">Chưa có hoạt động nào được ghi nhận</p>
                  </div>
                )}

                {loading && (
                  <div className="flex justify-center py-6">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
