
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui-custom/Card';
import { Badge } from '@/components/ui/badge';
import { Key, DoorOpen, CheckCircle, XCircle, Home, Building, Clock, Shield, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

export interface KeyCardProps {
  id: string;
  name: string;
  location: string;
  type: 'home' | 'office' | 'other';
  isActive: boolean;
  lastUsed?: string;
  className?: string;
  style?: React.CSSProperties;
}

const KeyCard: React.FC<KeyCardProps> = ({
  id,
  name,
  location,
  type,
  isActive,
  lastUsed,
  className,
  style
}) => {
  const getTypeIcon = () => {
    switch (type) {
      case 'home':
        return <Home className="h-4 w-4" />;
      case 'office':
        return <Building className="h-4 w-4" />;
      default:
        return <Key className="h-4 w-4" />;
    }
  };

  return (
    <Link to={`/key/${id}`}>
      <Card 
        variant="glass" 
        className={cn(
          "overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer border border-border/50 backdrop-blur-md relative",
          className
        )}
        style={style}
      >
        <div className={cn(
          "absolute top-0 left-0 w-1 h-full", 
          isActive ? "bg-green-500" : "bg-red-500"
        )} />
        
        <div className="absolute top-3 right-3">
          {isActive ? (
            <Badge variant="default" className="bg-green-500/10 text-green-600 hover:bg-green-500/20 gap-1">
              <Shield className="h-3 w-3" />
              <span className="text-xs">Hoạt động</span>
            </Badge>
          ) : (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              <span className="text-xs">Vô hiệu</span>
            </Badge>
          )}
        </div>
        
        <CardHeader className="pb-2 pt-6">
          <div className="flex gap-2 items-center mb-1">
            <Badge variant="outline" className="gap-1 px-2 py-0.5 h-5">
              {getTypeIcon()}
              <span className="text-xs capitalize">{type === 'home' ? 'Nhà' : type === 'office' ? 'Văn phòng' : 'Khác'}</span>
            </Badge>
          </div>
          <CardTitle className="text-lg mt-2 flex items-center gap-2">
            <span className="bg-primary/10 p-1 rounded text-primary">
              <Key className="h-4 w-4" />
            </span>
            {name}
          </CardTitle>
          <CardDescription className="flex items-center gap-1.5 mt-1">
            <DoorOpen className="h-3.5 w-3.5" />
            {location}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {lastUsed ? (
              <p>Sử dụng gần đây: {lastUsed}</p>
            ) : (
              <p>Chưa sử dụng</p>
            )}
          </div>
          
          <div className="mt-3 pt-3 border-t border-border/30 flex justify-between items-center">
            <span className="text-xs text-muted-foreground">ID: {id.substring(0, 8)}</span>
            <div className={cn(
              "h-2 w-2 rounded-full",
              isActive ? "bg-green-500 animate-pulse" : "bg-red-500"
            )}></div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default KeyCard;
