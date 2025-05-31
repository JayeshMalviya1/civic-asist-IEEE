import { Megaphone, Settings, Info, Menu, BarChart3, Users } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from './ThemeToggle';

export const Header = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/app" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2.5 rounded-xl">
              <Megaphone className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Civic Assist
              </h1>
              <p className="text-xs text-muted-foreground">Voice for everyone</p>
            </div>
          </Link>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu size={20} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="flex items-center gap-2">
                    <BarChart3 size={16} />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/community" className="flex items-center gap-2">
                    <Users size={16} />
                    Community
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center gap-2">
                    <Settings size={16} />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/about" className="flex items-center gap-2">
                    <Info size={16} />
                    About
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <nav className="hidden md:flex items-center gap-2">
            <Link to="/dashboard">
              <Button 
                variant={isActive('/dashboard') ? "default" : "ghost"} 
                size="sm" 
                className={`flex items-center gap-2 ${
                  isActive('/dashboard') 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                    : ''
                }`}
              >
                <BarChart3 size={16} />
                Dashboard
              </Button>
            </Link>
            <Link to="/community">
              <Button 
                variant={isActive('/community') ? "default" : "ghost"} 
                size="sm" 
                className={`flex items-center gap-2 ${
                  isActive('/community') 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                    : ''
                }`}
              >
                <Users size={16} />
                Community
              </Button>
            </Link>
            <Link to="/settings">
              <Button 
                variant={isActive('/settings') ? "default" : "ghost"} 
                size="sm" 
                className={`flex items-center gap-2 ${
                  isActive('/settings') 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                    : ''
                }`}
              >
                <Settings size={16} />
                Settings
              </Button>
            </Link>
            <Link to="/about">
              <Button 
                variant={isActive('/about') ? "default" : "ghost"} 
                size="sm" 
                className={`flex items-center gap-2 ${
                  isActive('/about') 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                    : ''
                }`}
              >
                <Info size={16} />
                About
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};
