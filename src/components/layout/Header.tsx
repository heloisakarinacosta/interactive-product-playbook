
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Package, Film, List } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
};

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  
  const navItems: NavItem[] = [
    { label: 'Produtos', href: '/products', icon: <Package size={18} /> },
    { label: 'Cenários', href: '/scenarios', icon: <Film size={18} /> },
    { label: 'Logs', href: '/admin/logs', icon: <List size={18} />, adminOnly: true },
  ];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when changing routes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const filteredNavItems = user?.isAdmin 
    ? navItems 
    : navItems.filter(item => !item.adminOnly);

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-40 px-4 py-2 transition-all duration-300",
        scrolled 
          ? "bg-white/80 backdrop-blur-md shadow-sm" 
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link 
            to="/" 
            className="text-lg font-medium flex items-center transition-colors hover:text-primary"
          >
            <span className="bg-primary text-white px-2 py-0.5 rounded mr-2 text-sm">PBP</span>
            Playbook de Produtos
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {filteredNavItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors",
                location.pathname === item.href 
                  ? "bg-primary/10 text-primary" 
                  : "hover:bg-primary/5 hover:text-primary"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
          
          {user ? (
            <div className="flex items-center ml-4 pl-4 border-l border-gray-200">
              <span className="text-sm text-muted-foreground mr-3">
                {user.isAdmin ? 'Admin' : user.email}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={logout}
                className="text-xs h-8"
              >
                Sair
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button size="sm" variant="outline" className="ml-4 h-8">
                Entrar
              </Button>
            </Link>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-md text-foreground hover:bg-muted transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-sm border-b border-border animate-slide-in shadow-md">
          <div className="p-4 space-y-1">
            {filteredNavItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "block px-3 py-2.5 rounded-md text-sm font-medium flex items-center gap-2",
                  location.pathname === item.href 
                    ? "bg-primary/10 text-primary" 
                    : "hover:bg-primary/5 hover:text-primary"
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
            
            {user ? (
              <div className="pt-4 mt-4 border-t border-border">
                <div className="px-3 py-1 text-sm text-muted-foreground">
                  {user.isAdmin ? 'Admin' : user.email}
                </div>
                <button
                  onClick={logout}
                  className="mt-2 w-full px-3 py-2.5 text-sm text-left text-red-500 hover:bg-red-50 rounded-md transition-colors flex items-center gap-2"
                >
                  <X size={18} /> Sair
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="block px-3 py-2.5 mt-4 text-sm font-medium bg-primary/5 text-primary hover:bg-primary/10 rounded-md transition-colors"
              >
                Entrar
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
