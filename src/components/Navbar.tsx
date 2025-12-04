import misLogo from "@/assets/mis-logo.png";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, Phone, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const navigation = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Admissions", href: "/admissions" },
  { name: "Academics", href: "/academics" },
  { name: "Faculty", href: "/faculty" },
  { name: "Gallery", href: "/gallery" },
  { name: "Events", href: "/events" },
  { name: "Contact", href: "/contact" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(!!localStorage.getItem('adminToken'));

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'adminToken') {
        setIsAdminLoggedIn(!!localStorage.getItem('adminToken'));
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAdminLoggedIn(false);
    navigate('/admin/login');
  };

  const isActive = (href: string) => location.pathname === href;
  const showAdmin = import.meta.env.DEV || import.meta.env.VITE_SHOW_ADMIN === 'true';

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      )}
    >
      <nav className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 overflow-hidden",
              isScrolled ? "bg-white" : "bg-white/95"
            )}>
              <img 
                src={misLogo} 
                alt="Master International School Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className={cn(
                "font-display text-lg font-bold transition-colors leading-tight",
                isScrolled ? "text-navy" : "text-white"
              )}>
                Master International
              </span>
              <span className={cn(
                "text-xs font-medium transition-colors",
                isScrolled ? "text-muted-foreground" : "text-white/80"
              )}>
                Padamapur • CBSE Affiliated
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
                  isActive(item.href)
                    ? isScrolled
                      ? "bg-navy/10 text-navy"
                      : "bg-white/20 text-white"
                    : isScrolled
                    ? "text-foreground/70 hover:text-navy hover:bg-navy/5"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                )}
              >
                {item.name}
              </Link>
            ))}
            {(showAdmin || isAdminLoggedIn) && (
              <>
                <Link
                  to="/admin/applications"
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
                    isActive('/admin/applications')
                      ? isScrolled
                        ? "bg-navy/10 text-navy"
                        : "bg-white/20 text-white"
                      : isScrolled
                      ? "text-foreground/70 hover:text-navy hover:bg-navy/5"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  )}
                >
                  Admin
                </Link>
                {isAdminLoggedIn && (
                  <button
                    onClick={handleLogout}
                    className={cn(
                      "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
                      isScrolled
                        ? "text-foreground/70 hover:text-red-600 hover:bg-red-50"
                        : "text-white/80 hover:text-red-200 hover:bg-white/10"
                    )}
                  >
                    Logout
                  </button>
                )}
              </>
            )}
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Button
              variant={isScrolled ? "outline" : "hero-outline"}
              size="sm"
              asChild
            >
              <Link to="/contact">
                <Phone className="w-4 h-4" />
                Contact
              </Link>
            </Button>
            <Button
              variant={isScrolled ? "gold" : "hero"}
              size="sm"
              asChild
            >
              <Link to="/admissions">Apply Now</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "lg:hidden p-2 rounded-md transition-colors",
              isScrolled
                ? "text-navy hover:bg-navy/10"
                : "text-white hover:bg-white/10"
            )}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={cn(
            "lg:hidden overflow-hidden transition-all duration-300",
            isOpen ? "max-h-[500px] pb-4" : "max-h-0"
          )}
        >
          <div className="bg-white rounded-xl shadow-xl p-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "block px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-navy text-white"
                    : "text-foreground hover:bg-muted"
                )}
              >
                {item.name}
              </Link>
            ))}
            {(showAdmin || isAdminLoggedIn) && (
              <Link
                to="/admin/applications"
                onClick={() => setIsOpen(false)}
                className={cn(
                  "block px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  isActive('/admin/applications')
                    ? "bg-navy text-white"
                    : "text-foreground hover:bg-muted"
                )}
              >
                Admin
              </Link>
            )}
            <div className="pt-4 flex flex-col gap-2">
              <Button variant="gold" asChild className="w-full">
                <Link to="/admissions">Apply Now</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link to="/contact">
                  <Phone className="w-4 h-4" />
                  Contact Us
                </Link>
              </Button>
              {isAdminLoggedIn && (
                <Button variant="destructive" onClick={() => { handleLogout(); setIsOpen(false); }} className="w-full">
                  Logout
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
