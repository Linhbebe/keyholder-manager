
import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui-custom/Card';
import KeyCard, { KeyCardProps } from '@/components/KeyCard';
import { useAuth } from '@/context/AuthContext';
import { Home, Key, RefreshCw, PlusCircle, Unlock, Lock, Activity } from 'lucide-react';
import Button from '@/components/ui-custom/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Dashboard = () => {
  const { user } = useAuth();

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
  ];

  // Recent activities (mock data)
  const activities = [
    { id: 1, action: 'Mở khóa', device: 'Khóa cửa chính', time: 'Hôm nay, 08:45', status: 'success' },
    { id: 2, action: 'Mở khóa', device: 'Khóa cửa sau', time: 'Hôm qua, 19:30', status: 'success' },
    { id: 3, action: 'Cố gắng mở khóa', device: 'Khóa văn phòng', time: '13/05/2023, 10:22', status: 'fail' },
  ];

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            Xin chào, {user?.name.split(' ')[0]}!
          </h1>
          <Button variant="outline" size="sm" icon={RefreshCw}>
            Làm mới
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card variant="glass" className="md:col-span-2 animate-scale-in" hover>
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

          <Card variant="glass" className="animate-scale-in" style={{ animationDelay: '100ms' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Hoạt động gần đây
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {activities.map((activity) => (
                  <li key={activity.id} className="flex items-start gap-3 animate-fade-in py-2 border-b border-border/50 last:border-0">
                    <div className={`rounded-full p-1.5 ${activity.status === 'success' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                      {activity.status === 'success' ? (
                        <Unlock className="h-4 w-4 text-green-500" />
                      ) : (
                        <Lock className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.device}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <Button variant="ghost" className="w-full mt-2 text-primary" size="sm">
                Xem tất cả
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card variant="glass" className="animate-scale-in" style={{ animationDelay: '200ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5 text-primary" />
              Vị trí quản lý
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card variant="outline" className="hover:bg-accent/50 cursor-pointer animate-fade-in">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Home className="h-10 w-10 text-primary p-2 rounded-full bg-primary/10" />
                    <div>
                      <h3 className="font-medium">Nhà riêng</h3>
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
                      <h3 className="font-medium">Văn phòng</h3>
                      <p className="text-sm text-muted-foreground">0 khóa hoạt động</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card variant="outline" className="hover:bg-accent/50 cursor-pointer border-dashed animate-fade-in" style={{ animationDelay: '100ms' }}>
                <CardContent className="p-4 flex flex-col items-center justify-center h-full min-h-[80px]">
                  <PlusCircle className="h-6 w-6 text-muted-foreground mb-1" />
                  <p className="text-sm text-muted-foreground">Thêm vị trí mới</p>
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
