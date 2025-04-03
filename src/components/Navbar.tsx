
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import NavLogo from './navbar/NavLogo';
import NavLinks from './navbar/NavLinks';
import NavUserMenu from './navbar/NavUserMenu';
import MobileNav from './navbar/MobileNav';

const Navbar: React.FC = () => {
  const { currentUser } = useAuth();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <NavLogo />

          {/* Menu toggle button for mobile */}
          {isMobile ? (
            <MobileNav 
              isOpen={isOpen} 
              onToggle={toggleMenu} 
              isPremium={currentUser?.isPremium}
            />
          ) : (
            <>
              {/* Desktop Navigation */}
              <div className="flex items-center space-x-6">
                <NavLinks isPremium={currentUser?.isPremium} />
              </div>
              <NavUserMenu />
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
