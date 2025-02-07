import React, { useState } from 'react';  
import logo from "../assets/LogoPawfrindu.png";  

function Header() {  
  const [activeLink, setActiveLink] = useState(null);

  const navLinks = [
    { name: 'Adopt A Pet', href: '#adopt' },
    { name: 'Lost Your Pet?', href: '#lost' },
    { name: 'Train Your Pet', href: '#training' },
    { name: 'Veterinary', href: '#veterinary' }
  ];

  return (  
    <header className="relative py-6 bg-white shadow-sm"> 
      <div className="flex justify-between items-center max-w-[1400px] mx-auto px-6">  
        <div className="transition-transform transform hover:scale-105">  
          <img src={logo} className="h-[100px]" alt="PawFrindu Logo" />  
        </div>
        <nav>  
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
        <div>
          <button className="
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
          ">
            Get Started
          </button>
        </div>
      </div>  
    </header>  
  );  
}  

export default Header;