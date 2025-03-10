
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui-custom/Card';
import { Badge } from '@/components/ui/badge';
import { Key, DoorOpen, CheckCircle, XCircle, Home, Building } from 'lucide-react';
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
          "overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer",
          className
        )}
      >
        <div className={cn(
          "absolute top-0 left-0 w-1 h-full", 
          isActive ? "bg-green-500" : "bg-red-500"
        )} />
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <Badge variant="outline" className="gap-1 px-2 py-0 h-5">
              {getTypeIcon()}
              <span className="text-xs capitalize">{type}</span>
            </Badge>
            {isActive ? (
              <Badge variant="default" className="bg-green-500/10 text-green-600 hover:bg-green-500/20 gap-1">
                <CheckCircle className="h-3 w-3" />
                <span className="text-xs">Hoạt động</span>
              </Badge>
            ) : (
              <Badge variant="destructive" className="gap-1">
                <XCircle className="h-3 w-3" />
                <span className="text-xs">Vô hiệu</span>
              </Badge>
            )}
          </div>
          <CardTitle className="text-lg mt-2">{name}</CardTitle>
          <CardDescription className="flex items-center gap-1">
            <DoorOpen className="h-3 w-3" />
            {location}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            {lastUsed ? (
              <p>Sử dụng gần đây: {lastUsed}</p>
            ) : (
              <p>Chưa sử dụng</p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default KeyCard;
