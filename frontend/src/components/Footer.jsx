import { Facebook, Instagram } from 'lucide-react';
import React from 'react';
import logo from "../assets/LogoPawfrindu.png";

const Footer = () => {   
  const quickLinks = ['Home', 'About Us', 'Adopt', 'Lost/Found', 'Training', 'Veterinary'];

  return (  
    <footer className="relative py-16 overflow-hidden bg-white">  
      <div className="grid gap-8 px-4 mx-auto max-w-7xl md:grid-cols-4">  
        <div className="transform transition-transform hover:scale-[1.02]">  
          <img 
            className="h-12 mb-6 transition-transform hover:rotate-6" 
            src={logo} 
            alt="PawFrindu Logo" 
          />   
          <p className="text-gray-600 group-hover:text-[#ffc929] transition-colors">
            Connecting pets with loving homes and providing comprehensive pet care services.
          </p>
        </div>  

        <div>  
          <h4 className="mb-4 text-xl font-semibold text-gray-900 animate-bounce-in-left">
            Quick Links
          </h4>  
          <ul className="space-y-3">  
            {quickLinks.map((link, index) => (
              <li 
                key={link} 
                className="transition-all duration-300 transform hover:translate-x-2"
              >
                <a 
                  href="#" 
                  className="
                    text-gray-600 
                    hover:text-[#ffc929] 
                    transition-colors 
                    group flex items-center
                  "
                >
                  {link}
                  <span className="ml-2 transition-opacity opacity-0 group-hover:opacity-100">
                    →
                  </span>
                </a>
              </li>
            ))}
          </ul>  
        </div>  

        <div>  
          <h4 className="mb-4 text-xl font-semibold text-gray-900 animate-bounce-in-left">
            Contact
          </h4>  
          <ul className="space-y-3">  
            {['Tunisia', '+216 XX XXX XXX', 'info@pawfrindu.com'].map((contact, index) => (
              <li 
                key={contact} 
                className="
                  text-gray-600 
                  transform transition-all 
                  duration-300 
                  hover:translate-x-2 
                  hover:text-[#ffc929]
                "
              >
                {contact}
              </li>
            ))}
          </ul>  
        </div>  

        <div className="flex flex-col items-center justify-center">  
          <div className="flex items-center gap-4">  
            {[
              { icon: Facebook, href: "#facebook" },
              { icon: Instagram, href: "#instagram" }
            ].map(({ icon: Icon, href }) => (
              <a 
                key={href}
                href={href} 
                className="
                  p-2 
                  bg-[#ffc929]/10 
                  rounded-full 
                  transition-all 
                  duration-300 
                  transform 
                  hover:scale-125 
                  hover:bg-[#ffc929]/20
                "
              >
                <Icon 
                  className="text-gray-700 hover:text-[#ffc929] transition-colors" 
                  size={24} 
                />
              </a>
            ))}
          </div>  
        </div>  
      </div>  

      <div className="pt-6 mt-12 text-center border-t border-gray-200 animate-fade-in">
        <p className="text-gray-600">
          © {new Date().getFullYear()} PawFrindu. All rights reserved.
        </p>
      </div>

      {/* Decorative background elements */}
      <div className="absolute -top-10 -left-10 w-48 h-48 bg-[#ffc929] 
        rounded-full opacity-20 -z-10 animate-blob"></div>
      <div className="absolute w-48 h-48 bg-pink-100 rounded-full -bottom-10 -right-10 opacity-30 -z-10 animate-blob-reverse"></div>
    </footer>  
  );  
};  

export default Footer;