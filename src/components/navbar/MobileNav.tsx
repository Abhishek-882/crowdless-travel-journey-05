
import React from 'react';
import { X, Menu } from 'lucide-react';
import NavLinks from './NavLinks';
import NavUserMenu from './NavUserMenu';

interface MobileNavProps {
  isOpen: boolean;
  onToggle: () => void;
  isPremium?: boolean;
}

const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onToggle, isPremium = false }) => {
  return (
    <>
      <button
        onClick={onToggle}
        className="text-gray-800 focus:outline-none"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      
      {isOpen && (
        <div className="pt-2 pb-4 absolute top-full left-0 right-0 bg-white shadow-md z-20">
          <div className="flex flex-col space-y-3 px-4">
            <NavLinks 
              isPremium={isPremium} 
              isMobileView={true} 
              onItemClick={onToggle}
            />
            <NavUserMenu 
              isMobileView={true} 
              onItemClick={onToggle}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default MobileNav;
