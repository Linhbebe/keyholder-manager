
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui-custom/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import Button from '@/components/ui-custom/Button';
import {
  Key,
  Home,
  Wifi,
  Battery,
  Bell,
  UserPlus,
  AlertTriangle,
  Settings,
  ArrowLeft,
  Unlock,
  Lock,
  Activity,
  CheckCircle,
  XCircle,
  Trash2,
  Calendar,
  Clock,
} from 'lucide-react';

const KeyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(true);
  const [name, setName] = useState('Khóa cửa chính');
  const [notifications, setNotifications] = useState(true);
  const [autoLock, setAutoLock] = useState(true);
  const [autoLockTimer, setAutoLockTimer] = useState(30);
  const [isEditing, setIsEditing] = useState(false);

  // Mock data
  const keyInfo = {
    id: id || '1',
    name: 'Khóa cửa chính',
    location: 'Nhà riêng',
    type: 'home',
    model: 'SmartKey Pro S2',
    serialNumber: 'SK2023051245',
    battery: 82,
    wifiStrength: 'Tốt',
    lastSync: 'Hôm nay, 10:15',
    firmwareVersion: '2.1.5',
  };

  // Mock access logs
  const accessLogs = [
    { id: 1, action: 'Mở khóa', user: 'Bạn', method: 'Ứng dụng', time: 'Hôm nay, 08:45', status: 'success' },
    { id: 2, action: 'Mở khóa', user: 'Nguyễn Văn A', method: 'Mã PIN', time: 'Hôm nay, 07:30', status: 'success' },
    { id: 3, action: 'Cố gắng mở khóa', user: 'Không xác định', method: 'Mã PIN sai', time: 'Hôm qua, 22:15', status: 'fail' },
    { id: 4, action: 'Khóa tự động', user: 'Hệ thống', method: 'Tự động', time: 'Hôm qua, 21:45', status: 'info' },
    { id: 5, action: 'Mở khóa', user: 'Trần Thị B', method: 'Thẻ NFC', time: 'Hôm qua, 18:30', status: 'success' },
  ];

  // Mock users with access
  const usersWithAccess = [
    { id: 1, name: 'Bạn (Chủ sở hữu)', email: 'you@example.com', accessLevel: 'Đầy đủ' },
    { id: 2, name: 'Nguyễn Văn A', email: 'nguyenvana@example.com', accessLevel: 'Giới hạn' },
    { id: 3, name: 'Trần Thị B', email: 'tranthib@example.com', accessLevel: 'Giới hạn' },
  ];

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleToggleActive = () => {
    setIsActive(!isActive);
    toast.success(isActive ? 'Đã vô hiệu hóa khóa' : 'Đã kích hoạt khóa');
  };

  const handleSaveChanges = () => {
    setIsEditing(false);
    toast.success('Đã lưu thay đổi');
  };

  const handleUnlock = () => {
    toast.success('Đã mở khóa thành công');
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in pb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleGoBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            Chi tiết khóa
          </h1>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <Card variant="glass" className="animate-scale-in">
              <CardHeader className="relative pb-2">
                <div className="absolute right-6 top-6 flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <Battery className={`h-4 w-4 ${keyInfo.battery > 20 ? 'text-green-500' : 'text-red-500'}`} />
                    <span className="text-xs">{keyInfo.battery}%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Wifi className="h-4 w-4 text-green-500" />
                    <span className="text-xs">{keyInfo.wifiStrength}</span>
                  </div>
                </div>

                <div className="flex items-start justify-between">
                  <div>
                    {isEditing ? (
                      <Input
                        className="text-lg font-bold h-9 mb-1"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    ) : (
                      <CardTitle className="text-xl">{name}</CardTitle>
                    )}
                    <div className="flex items-center gap-1 text-muted-foreground text-sm">
                      <Home className="h-3 w-3" />
                      <span>{keyInfo.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                          Hủy
                        </Button>
                        <Button size="sm" onClick={handleSaveChanges}>
                          Lưu
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={isActive}
                            onCheckedChange={handleToggleActive}
                            id="key-active"
                          />
                          {isActive ? (
                            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Hoạt động
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-200">
                              <XCircle className="h-3 w-3 mr-1" />
                              Vô hiệu
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={Settings}
                          onClick={() => setIsEditing(true)}
                        >
                          Chỉnh sửa
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <Tabs defaultValue="control">
                  <TabsList className="w-full mb-4">
                    <TabsTrigger value="control" className="flex-1">Điều khiển</TabsTrigger>
                    <TabsTrigger value="settings" className="flex-1">Cài đặt</TabsTrigger>
                    <TabsTrigger value="info" className="flex-1">Thông tin</TabsTrigger>
                  </TabsList>

                  <TabsContent value="control" className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Button
                        className="h-24 text-lg animate-scale-in"
                        icon={Unlock}
                        onClick={handleUnlock}
                      >
                        Mở khóa
                      </Button>
                      <Button
                        variant="outline"
                        className="h-24 text-lg animate-scale-in"
                        style={{ animationDelay: '50ms' }}
                        icon={Lock}
                      >
                        Khóa
                      </Button>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <h3 className="font-medium">Khóa tự động sau</h3>
                      <div className="flex items-center justify-between">
                        <div className="w-3/4 px-1">
                          <Input
                            type="range"
                            min={5}
                            max={120}
                            step={5}
                            value={autoLockTimer}
                            onChange={(e) => setAutoLockTimer(parseInt(e.target.value))}
                            disabled={!autoLock}
                            className="cursor-pointer"
                          />
                        </div>
                        <div className="w-1/4 flex justify-end">
                          <Badge variant="outline" className={!autoLock ? "opacity-50" : ""}>
                            {autoLockTimer} giây
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="auto-lock"
                          checked={autoLock}
                          onCheckedChange={setAutoLock}
                        />
                        <Label htmlFor="auto-lock">Tự động khóa</Label>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="settings" className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4" />
                          <Label htmlFor="notifications">Thông báo</Label>
                        </div>
                        <Switch
                          id="notifications"
                          checked={notifications}
                          onCheckedChange={setNotifications}
                        />
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <Label>Lịch trình</Label>
                        </div>
                        <Card variant="outline" className="cursor-pointer hover:bg-accent/50">
                          <CardContent className="p-3">
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="font-medium">Tự động khóa vào buổi tối</h4>
                                <p className="text-xs text-muted-foreground">Mỗi ngày, 22:00</p>
                              </div>
                              <Switch checked={true} />
                            </div>
                          </CardContent>
                        </Card>
                        <Card variant="outline" className="cursor-pointer hover:bg-accent/50">
                          <CardContent className="p-3">
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="font-medium">Mở khóa vào buổi sáng</h4>
                                <p className="text-xs text-muted-foreground">Thứ 2-6, 7:00</p>
                              </div>
                              <Switch checked={false} />
                            </div>
                          </CardContent>
                        </Card>
                        <Button variant="outline" className="w-full" size="sm" icon={Clock}>
                          Thêm lịch trình
                        </Button>
                      </div>

                      <Separator />

                      <Button variant="destructive" size="sm" icon={Trash2}>
                        Xóa khóa
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="info" className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Mẫu</h3>
                        <p>{keyInfo.model}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Số sê-ri</h3>
                        <p>{keyInfo.serialNumber}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Phiên bản firmware</h3>
                        <p>{keyInfo.firmwareVersion}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Đồng bộ lần cuối</h3>
                        <p>{keyInfo.lastSync}</p>
                      </div>
                    </div>

                    <Separator />

                    <Button variant="outline" size="sm" className="w-full" icon={Settings}>
                      Cài đặt nâng cao
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card variant="glass" className="animate-scale-in" style={{ animationDelay: '100ms' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Lịch sử hoạt động
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {accessLogs.map((log) => (
                    <li key={log.id} className="flex items-start gap-3 p-2 border-b border-border/40 last:border-0">
                      <div className={`rounded-full p-1.5 ${
                        log.status === 'success' ? 'bg-green-500/10' : 
                        log.status === 'fail' ? 'bg-red-500/10' : 'bg-blue-500/10'
                      }`}>
                        {log.status === 'success' ? (
                          <Unlock className={`h-4 w-4 text-green-500`} />
                        ) : log.status === 'fail' ? (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        ) : (
                          <Lock className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                          <p className="text-sm font-medium">{log.action}</p>
                          <p className="text-xs text-muted-foreground">{log.time}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">Người dùng: {log.user}</p>
                        <p className="text-xs text-muted-foreground">Phương thức: {log.method}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <Button variant="ghost" className="w-full mt-3" size="sm">
                  Xem thêm
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card variant="glass" className="animate-scale-in" style={{ animationDelay: '150ms' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <UserPlus className="h-5 w-5 text-primary" />
                  Quyền truy cập
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {usersWithAccess.map((user) => (
                    <li key={user.id} className="flex items-center justify-between gap-3 p-2 border-b border-border/40 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="whitespace-nowrap">
                        {user.accessLevel}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="outline" size="sm" icon={UserPlus}>
                  Thêm người dùng
                </Button>
              </CardFooter>
            </Card>

            <Card variant="glass" className="animate-scale-in" style={{ animationDelay: '200ms' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                  Cảnh báo gần đây
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <p className="text-sm font-medium">Không có cảnh báo nào</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Khóa của bạn đang hoạt động bình thường
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="outline" size="sm">
                  Cài đặt cảnh báo
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default KeyDetail;
