
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui-custom/Card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { EditIcon, Settings } from 'lucide-react';
import Button from '@/components/ui-custom/Button';

const ProfileHeader: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <Card variant="glass" className="relative mb-6 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-primary/80 to-primary/30" />
      
      <div className="relative pt-14 px-6 pb-6 flex flex-col sm:flex-row items-center gap-4">
        <Avatar className="h-20 w-20 border-4 border-background ring-2 ring-primary/20">
          {user.avatar ? (
            <AvatarImage src={user.avatar} alt={user.name} />
          ) : (
            <AvatarFallback className="text-xl">{user.name.charAt(0)}</AvatarFallback>
          )}
        </Avatar>
        
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <Badge variant="outline" className="self-center sm:self-auto">Thành viên</Badge>
          </div>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" icon={EditIcon}>
            Chỉnh sửa
          </Button>
          <Button variant="ghost" size="sm" icon={Settings}>
            Cài đặt
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ProfileHeader;
