
import React, { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Home, Key, User, LogOut, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);

  const menuItems = [
    { icon: Home, label: 'Trang chủ', path: '/dashboard' },
    { icon: Key, label: 'Quản lý khóa', path: '/keys' },
    { icon: User, label: 'Tài khoản', path: '/profile' },
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 w-full border-b border-border/40 backdrop-blur-md bg-background/80 px-4">
        <div className="container mx-auto h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isMobile ? (
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="mr-2">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[250px] sm:w-[300px]">
                  <div className="flex flex-col h-full py-6">
                    <div className="flex items-center px-4">
                      <Key className="h-6 w-6 text-primary mr-2" />
                      <h2 className="text-lg font-semibold">SmartKey</h2>
                    </div>
                    <nav className="mt-8 flex-1">
                      <ul className="space-y-2 px-2">
                        {menuItems.map((item) => (
                          <li key={item.path}>
                            <button
                              onClick={() => handleNavigate(item.path)}
                              className={cn(
                                "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                                location.pathname === item.path
                                  ? "bg-primary text-primary-foreground"
                                  : "hover:bg-accent"
                              )}
                            >
                              <item.icon className="h-4 w-4" />
                              {item.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </nav>
                    <div className="mt-auto pt-4 px-2">
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            ) : (
              <div className="flex items-center gap-2">
                <Key className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-semibold">SmartKey</h1>
              </div>
            )}
          </div>

          {!isMobile && (
            <nav className="flex-1 flex justify-center">
              <ul className="flex items-center gap-1">
                {menuItems.map((item) => (
                  <li key={item.path}>
                    <button
                      onClick={() => navigate(item.path)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                        location.pathname === item.path
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <div className="flex items-center gap-2">
            {user && (
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 border border-border">
                  {user.avatar ? (
                    <AvatarImage src={user.avatar} alt={user.name} />
                  ) : (
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  )}
                </Avatar>
                {!isMobile && (
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container mx-auto p-4">
        <div className="animate-fade-in">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
