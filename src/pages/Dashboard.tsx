
import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui-custom/Card';
import KeyCard, { KeyCardProps } from '@/components/KeyCard';
import { useAuth } from '@/context/AuthContext';
import { Home, Key, RefreshCw, PlusCircle, Unlock, Lock, Activity, Clock, Shield, Users, Database, AlertCircle } from 'lucide-react';
import Button from '@/components/ui-custom/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { database } from '@/lib/firebase';
import { ref, onValue, query, orderByChild, limitToLast } from 'firebase/database';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface ActivityItem {
  id: string;
  action: string;
  userName: string;
  formattedTime: string;
  deviceInfo: string;
  timestamp: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Fetch recent activities
  useEffect(() => {
    if (!user?.id) return;
    
    setLoading(true);
    const recentActivitiesRef = query(
      ref(database, `recent_activities/${user.id}`),
      orderByChild('timestamp'),
      limitToLast(5)
    );
    
    const unsubscribe = onValue(recentActivitiesRef, (snapshot) => {
      const activities: ActivityItem[] = [];
      snapshot.forEach((childSnapshot) => {
        const activity = childSnapshot.val();
        activities.push({
          id: childSnapshot.key || '',
          action: activity.action,
          userName: activity.userName,
          formattedTime: activity.formattedTime,
          deviceInfo: activity.deviceInfo,
          timestamp: activity.timestamp
        });
      });
      
      // Sort by timestamp in descending order (newest first)
      activities.sort((a, b) => b.timestamp - a.timestamp);
      setRecentActivities(activities);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [user?.id]);

  // Mock data for keys
  const keys: KeyCardProps[] = [
    {
      id: '1',
      name: 'Khóa cửa chính',
      location: 'Nhà riêng',
      type: 'home',
      isActive: true,
      lastUsed: 'Hôm nay, 08:45',
    },
    {
      id: '2',
      name: 'Khóa cửa sau',
      location: 'Nhà riêng',
      type: 'home',
      isActive: true,
      lastUsed: 'Hôm qua, 19:30',
    },
    {
      id: '3',
      name: 'Khóa văn phòng',
      location: 'Tòa nhà Bitexco, Lầu 12',
      type: 'office',
      isActive: false,
      lastUsed: '12/05/2023, 17:15',
    },
    {
      id: '4',
      name: 'Phòng họp A',
      location: 'Trung tâm thành phố',
      type: 'office',
      isActive: true,
      lastUsed: 'Hôm nay, 10:15',
    },
  ];

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span className="bg-primary/10 p-1.5 rounded-full">
                <Shield className="h-5 w-5 text-primary" />
              </span>
              Xin chào, {user?.name.split(' ')[0]}!
            </h1>
            <p className="text-muted-foreground text-sm flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {currentTime.toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
              })}
              <span className="h-1 w-1 rounded-full bg-muted-foreground inline-block"></span>
              {currentTime.toLocaleDateString('vi-VN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <Button variant="outline" size="sm" icon={RefreshCw}>
            Làm mới
          </Button>
        </div>

        {/* System status cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card variant="glass" className="animate-scale-in overflow-hidden" style={{ animationDelay: '50ms' }}>
            <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
                  Trực tuyến
                </Badge>
                <span className="bg-green-500/10 p-1.5 rounded-full">
                  <Shield className="h-4 w-4 text-green-500" />
                </span>
              </div>
              <h3 className="font-medium">Hệ thống</h3>
              <p className="text-xs text-muted-foreground mt-1">Đang hoạt động bình thường</p>
            </CardContent>
          </Card>
          
          <Card variant="glass" className="animate-scale-in overflow-hidden" style={{ animationDelay: '100ms' }}>
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200">
                  Đã kết nối
                </Badge>
                <span className="bg-blue-500/10 p-1.5 rounded-full">
                  <Database className="h-4 w-4 text-blue-500" />
                </span>
              </div>
              <h3 className="font-medium">Máy chủ</h3>
              <p className="text-xs text-muted-foreground mt-1">Độ trễ: 25ms</p>
            </CardContent>
          </Card>
          
          <Card variant="glass" className="animate-scale-in overflow-hidden" style={{ animationDelay: '150ms' }}>
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-200">
                  {keys.filter(k => k.isActive).length} hoạt động
                </Badge>
                <span className="bg-amber-500/10 p-1.5 rounded-full">
                  <Key className="h-4 w-4 text-amber-500" />
                </span>
              </div>
              <h3 className="font-medium">Khóa</h3>
              <p className="text-xs text-muted-foreground mt-1">Tổng số: {keys.length}</p>
            </CardContent>
          </Card>
          
          <Card variant="glass" className="animate-scale-in overflow-hidden" style={{ animationDelay: '200ms' }}>
            <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-200">
                  Quản trị viên
                </Badge>
                <span className="bg-purple-500/10 p-1.5 rounded-full">
                  <Users className="h-4 w-4 text-purple-500" />
                </span>
              </div>
              <h3 className="font-medium">Quyền hạn</h3>
              <p className="text-xs text-muted-foreground mt-1">Cấp quyền: Đầy đủ</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card variant="glass" className="md:col-span-2 animate-scale-in backdrop-blur-md" hover>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                Khóa của bạn
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">Tất cả</TabsTrigger>
                  <TabsTrigger value="active">Đang hoạt động</TabsTrigger>
                  <TabsTrigger value="inactive">Vô hiệu</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="mt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {keys.map((key, index) => (
                      <KeyCard
                        key={key.id}
                        {...key}
                        className={`animate-fade-in`}
                        style={{ animationDelay: `${index * 100}ms` }}
                      />
                    ))}
                    <Card 
                      variant="outline" 
                      className="flex flex-col items-center justify-center h-full min-h-[160px] animate-fade-in border-dashed cursor-pointer hover:bg-accent/50"
                      style={{ animationDelay: `${keys.length * 100}ms` }}
                    >
                      <PlusCircle className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground font-medium">Thêm khóa mới</p>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="active" className="mt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {keys.filter(key => key.isActive).map((key) => (
                      <KeyCard key={key.id} {...key} />
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="inactive" className="mt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {keys.filter(key => !key.isActive).map((key) => (
                      <KeyCard key={key.id} {...key} />
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card variant="glass" className="animate-scale-in backdrop-blur-md" style={{ animationDelay: '100ms' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Hoạt động gần đây
                <Badge variant="outline" className="ml-auto text-xs bg-primary/5">{recentActivities.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array(3).fill(0).map((_, i) => (
                    <div key={i} className="flex items-start gap-3 animate-pulse py-2 border-b border-border/50 last:border-0">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentActivities.length > 0 ? (
                <ul className="space-y-3">
                  {recentActivities.map((activity) => (
                    <li key={activity.id} className="flex items-start gap-3 animate-fade-in py-2 border-b border-border/50 last:border-0">
                      <div className="rounded-full p-1.5 bg-blue-500/10">
                        {activity.action === 'login' ? (
                          <Unlock className="h-4 w-4 text-blue-500" />
                        ) : (
                          <Lock className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.action === 'login' ? 'Đăng nhập' : activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.userName}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> 
                          {activity.formattedTime}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <AlertCircle className="h-10 w-10 text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">Chưa có hoạt động nào</p>
                </div>
              )}
              <Button variant="ghost" className="w-full mt-4 text-primary" size="sm">
                Xem tất cả
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card variant="glass" className="animate-scale-in backdrop-blur-md" style={{ animationDelay: '200ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5 text-primary" />
              Quản lý phòng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card variant="outline" className="hover:bg-accent/50 cursor-pointer animate-fade-in">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Home className="h-10 w-10 text-primary p-2 rounded-full bg-primary/10" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">Phòng làm việc</h3>
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200 text-xs">
                          Mở
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">2 khóa hoạt động</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card variant="outline" className="hover:bg-accent/50 cursor-pointer animate-fade-in" style={{ animationDelay: '50ms' }}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Home className="h-10 w-10 text-primary p-2 rounded-full bg-primary/10" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">Phòng họp</h3>
                        <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-200 text-xs">
                          Đóng
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">1 khóa hoạt động</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card variant="outline" className="hover:bg-accent/50 cursor-pointer animate-fade-in" style={{ animationDelay: '100ms' }}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Home className="h-10 w-10 text-primary p-2 rounded-full bg-primary/10" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">Kho lưu trữ</h3>
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-200 text-xs">
                          Hạn chế
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">1 khóa hoạt động</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card variant="outline" className="hover:bg-accent/50 cursor-pointer border-dashed animate-fade-in" style={{ animationDelay: '150ms' }}>
                <CardContent className="p-4 flex flex-col items-center justify-center h-full min-h-[80px]">
                  <PlusCircle className="h-6 w-6 text-muted-foreground mb-1" />
                  <p className="text-sm text-muted-foreground">Thêm phòng mới</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
