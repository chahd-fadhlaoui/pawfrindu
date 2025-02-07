import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import logo from "../assets/LogoPawfrindu.png";

function Header() {
  const [activeLink, setActiveLink] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Adopt A Pet', href: '#adopt', ariaLabel: 'Go to pet adoption section' },
    { name: 'Lost Your Pet?', href: '#lost', ariaLabel: 'Get help finding a lost pet' },
    { name: 'Train Your Pet', href: '#training', ariaLabel: 'Access pet training resources' },
    { name: 'Veterinary', href: '#veterinary', ariaLabel: 'Find veterinary services' }
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="relative flex justify-between items-center max-w-[1400px] mx-auto px-4 py-4 lg:px-6">
        {/* Logo with improved accessibility */}
        <a href="/" aria-label="Home">
          <img 
            src={logo} 
            className="h-[80px] w-auto transition-transform transform hover:scale-105" 
            alt="PawFrindu Logo" 
          />
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden lg:block">
          <ul className="flex p-0 m-0 list-none">
            {navLinks.map((link, index) => (
              <li 
                key={index} 
                className="relative ml-6 group"
                onMouseEnter={() => setActiveLink(index)}
                onMouseLeave={() => setActiveLink(null)}
              > 
                <a 
                  href={link.href} 
                  aria-label={link.ariaLabel}
                  className={`
                    text-gray-800 text-base font-medium 
                    transition-all duration-300 
                    relative 
                    ${activeLink === index 
                      ? 'text-[#ffc929] scale-110' 
                      : 'hover:text-[#ffc929]'}
                    after:content-[''] after:absolute after:bottom-[-4px] 
                    after:left-0 after:h-[2px] after:bg-[#ffc929] 
                    after:transition-all after:duration-300
                    ${activeLink === index 
                      ? 'after:w-full' 
                      : 'after:w-0 hover:after:w-full'}
                  `}
                >  
                  {link.name}
                </a>  
              </li>
            ))}
          </ul>  
        </nav>

        {/* Mobile Menu Toggle */}
        <div className="lg:hidden">
          <button 
            onClick={toggleMobileMenu}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            className="text-gray-800 focus:outline-none"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* CTA Button */}
        <div className="hidden lg:block">
          <button 
            className="
              px-6 py-3 
              text-gray-900 
              bg-[#ffc929] 
              rounded-full 
              hover:bg-pink-500 
              hover:text-white
              transition-all 
              duration-300 
              transform 
              hover:scale-110
              shadow-md
              hover:shadow-lg
            "
            aria-label="Start adopting a pet"
          >
            Get Started
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="absolute left-0 w-full bg-white shadow-lg lg:hidden top-full">
            <ul className="flex flex-col items-center py-4">
              {navLinks.map((link, index) => (
                <li key={index} className="my-2">
                  <a 
                    href={link.href} 
                    className="text-gray-800 text-lg hover:text-[#ffc929]"
                    onClick={toggleMobileMenu}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
              <li className="mt-4">
                <button 
                  className="
                    px-6 py-3 
                    text-gray-900 
                    bg-[#ffc929] 
                    rounded-full 
                    hover:bg-pink-500 
                    hover:text-white
                  "
                >
                  Get Started
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;