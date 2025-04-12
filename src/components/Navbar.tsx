
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from 'lucide-react';
import NavLinks from './navbar/NavLinks';
import NavLogo from './navbar/NavLogo';
import NavUserMenu from './navbar/NavUserMenu';
import { ThemeToggle } from './ThemeToggle';

const Navbar = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <NavLogo />

        <div className="hidden md:flex">
          <NavLinks />
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isAuthenticated ? <NavUserMenu /> : (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
              <Button
                size="sm"
                onClick={() => navigate('/signup')}
              >
                Sign Up
              </Button>
            </div>
          )}
          <MobileNav />
        </div>
      </div>
    </header>
  );
};

const MobileNav = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-64">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>
            Navigate through the app
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <Link to="/" className="px-4 py-2 rounded-md hover:bg-secondary">
            Home
          </Link>
          <Link to="/destinations" className="px-4 py-2 rounded-md hover:bg-secondary">
            Destinations
          </Link>
          <Link to="/about" className="px-4 py-2 rounded-md hover:bg-secondary">
            About
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/bookings" className="px-4 py-2 rounded-md hover:bg-secondary">
                My Bookings
              </Link>
              <Link to="/trip-planner" className="px-4 py-2 rounded-md hover:bg-secondary">
                Trip Planner
              </Link>
              <Link to="/profile" className="px-4 py-2 rounded-md hover:bg-secondary">
                Profile
              </Link>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button size="sm" onClick={() => navigate('/signup')}>
                Sign Up
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Navbar;
