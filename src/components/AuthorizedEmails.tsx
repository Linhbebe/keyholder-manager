
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui-custom/Card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { AlertCircle, Mail, Plus, Trash2, UserPlus } from 'lucide-react';
import { database } from '@/lib/firebase';
import { ref, onValue, set, remove } from 'firebase/database';
import { useAuth } from '@/context/AuthContext';

interface AuthorizedEmail {
  email: string;
  permissions: {
    manageUsers: boolean;
    manageAccess: boolean;
    viewLogs: boolean;
    manageDoors: boolean;
  };
  invitedAt: string;
  status: 'pending' | 'registered';
}

const PERMISSIONS = [
  { id: 'manageUsers', name: 'Quản lý người dùng', description: 'Thêm, sửa, xóa người dùng' },
  { id: 'manageAccess', name: 'Phân quyền truy cập', description: 'Cấp, thu hồi quyền truy cập' },
  { id: 'viewLogs', name: 'Xem lịch sử', description: 'Xem lịch sử hoạt động' },
  { id: 'manageDoors', name: 'Quản lý cửa', description: 'Mở, khóa các cửa trong hệ thống' }
];

const AuthorizedEmails: React.FC = () => {
  const { isOwner } = useAuth();
  const [authorizedEmails, setAuthorizedEmails] = useState<AuthorizedEmail[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch authorized emails from database
    const emailsRef = ref(database, 'authorized_emails');
    const unsubscribe = onValue(emailsRef, (snapshot) => {
      const emailsList: AuthorizedEmail[] = [];
      
      snapshot.forEach((emailSnapshot) => {
        const email = emailSnapshot.key;
        const data = emailSnapshot.val();
        
        if (email) {
          emailsList.push({
            email,
            permissions: data.permissions || {
              manageUsers: false,
              manageAccess: false,
              viewLogs: true,
              manageDoors: false
            },
            invitedAt: data.invitedAt || new Date().toISOString(),
            status: data.status || 'pending'
          });
        }
      });
      
      setAuthorizedEmails(emailsList);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);
  
  const handleAddEmail = async () => {
    if (!newEmail.trim()) {
      toast.error('Vui lòng nhập địa chỉ email');
      return;
    }
    
    if (!isValidEmail(newEmail)) {
      toast.error('Địa chỉ email không hợp lệ');
      return;
    }
    
    try {
      // Check if email already exists
      if (authorizedEmails.some(e => e.email === newEmail)) {
        toast.error('Email đã được thêm vào danh sách');
        return;
      }
      
      // Add email to database
      const emailRef = ref(database, `authorized_emails/${encodeEmailForFirebase(newEmail)}`);
      await set(emailRef, {
        permissions: {
          manageUsers: false,
          manageAccess: false,
          viewLogs: true,
          manageDoors: false
        },
        invitedAt: new Date().toISOString(),
        status: 'pending'
      });
      
      toast.success('Đã thêm email vào danh sách ủy quyền');
      setNewEmail('');
    } catch (error) {
      console.error('Error adding email:', error);
      toast.error('Không thể thêm email. Vui lòng thử lại.');
    }
  };
  
  const handleRemoveEmail = async (email: string) => {
    try {
      await remove(ref(database, `authorized_emails/${encodeEmailForFirebase(email)}`));
      toast.success('Đã xóa email khỏi danh sách ủy quyền');
    } catch (error) {
      console.error('Error removing email:', error);
      toast.error('Không thể xóa email. Vui lòng thử lại.');
    }
  };
  
  const handleTogglePermission = async (email: string, permissionId: string, currentValue: boolean) => {
    try {
      const emailRef = ref(database, `authorized_emails/${encodeEmailForFirebase(email)}/permissions/${permissionId}`);
      await set(emailRef, !currentValue);
      
      toast.success(`Đã ${!currentValue ? 'cấp' : 'thu hồi'} quyền ${
        PERMISSIONS.find(p => p.id === permissionId)?.name || permissionId
      }`);
    } catch (error) {
      console.error('Error toggling permission:', error);
      toast.error('Không thể thay đổi quyền. Vui lòng thử lại.');
    }
  };
  
  // Helper function to validate email format
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  
  // Helper function to encode email for Firebase path (replace dots and other invalid characters)
  const encodeEmailForFirebase = (email: string) => {
    return email.replace(/\./g, ',');
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          Danh sách email được ủy quyền
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input 
            placeholder="Thêm email mới..." 
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleAddEmail} disabled={!isOwner}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm
          </Button>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : authorizedEmails.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Mail className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">Chưa có email nào được ủy quyền</p>
            <p className="text-xs text-muted-foreground mt-1">
              Thêm email để cho phép người dùng đăng ký với các quyền đã định sẵn
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {authorizedEmails.map((emailData) => (
              <div key={emailData.email} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{emailData.email}</span>
                      <Badge variant={emailData.status === 'registered' ? 'default' : 'outline'}>
                        {emailData.status === 'registered' ? 'Đã đăng ký' : 'Chờ đăng ký'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Thêm vào: {new Date(emailData.invitedAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleRemoveEmail(emailData.email)}
                    disabled={!isOwner}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                
                <Separator className="my-3" />
                
                <div className="space-y-3">
                  <p className="text-sm font-medium">Quyền truy cập:</p>
                  
                  {PERMISSIONS.map((permission) => (
                    <div key={`${emailData.email}-${permission.id}`} className="flex items-center justify-between py-1">
                      <div>
                        <p className="text-sm">{permission.name}</p>
                        <p className="text-xs text-muted-foreground">{permission.description}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={emailData.permissions?.[permission.id as keyof typeof emailData.permissions] || false}
                          disabled={!isOwner} 
                          onCheckedChange={() => handleTogglePermission(
                            emailData.email, 
                            permission.id, 
                            emailData.permissions?.[permission.id as keyof typeof emailData.permissions] || false
                          )}
                        />
                        <span className="text-xs font-medium">
                          {emailData.permissions?.[permission.id as keyof typeof emailData.permissions] 
                            ? 'Có quyền' 
                            : 'Không có quyền'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AuthorizedEmails;
