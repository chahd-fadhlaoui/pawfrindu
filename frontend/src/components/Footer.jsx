import { Facebook, Instagram, ArrowRight } from 'lucide-react';
import React from 'react';
import logo from "../assets/LogoPawfrindu.png";

const PawIcon = ({ className, style }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    style={style}
    fill="currentColor"
  >
    <path d="M12,17.5c2.33,2.33,5.67,2.33,8,0s2.33-5.67,0-8s-5.67-2.33-8,0S9.67,15.17,12,17.5z M7.5,14.5 c-1.96,1.96-1.96,4.04,0,6s4.04,1.96,6,0s1.96-4.04,0-6S9.46,12.54,7.5,14.5z M18.5,3.5c-1.96-1.96-4.04-1.96-6,0s-1.96,4.04,0,6 s4.04,1.96,6,0S20.46,5.46,18.5,3.5z M3.5,9.5c-1.96,1.96-1.96,4.04,0,6s4.04,1.96,6,0s1.96-4.04,0-6S5.46,7.54,3.5,9.5z" />
  </svg>
);

const Footer = () => {
  const quickLinks = [
    { name: 'Home', href: '#' },
    { name: 'About Us', href: '#' },
    { name: 'Adopt', href: '#' },
    { name: 'Lost/Found', href: '#' },
    { name: 'Training', href: '#' },
    { name: 'Veterinary', href: '#' },
  ];

  const contactInfo = [
    { name: 'Tunisia', href: '#' },
    { name: '+216 XX XXX XXX', href: '#' },
    { name: 'info@pawfrindu.com', href: '#' },
  ];

  const socialMedia = [
    { icon: Facebook, href: "#facebook" },
    { icon: Instagram, href: "#instagram" },
  ];

  // Floating paw background (similar to hero section)
  const PawBackground = () => {
    return Array(8).fill(null).map((_, index) => (
      <PawIcon
        key={index}
        className={`
          absolute w-8 h-8 opacity-5
          animate-float
          text-pink-300
          ${index % 2 === 0 ? 'text-[#ffc929]' : 'text-pink-300'}
          ${index % 3 === 0 ? "top-1/4" : index % 3 === 1 ? "top-1/2" : "top-3/4"}
          ${index % 4 === 0 ? "left-1/4" : index % 4 === 1 ? "left-1/2" : "left-3/4"}
        `}
        style={{
          animationDelay: `${index * 0.5}s`,
          transform: `rotate(${index * 45}deg)`,
        }}
      />
    ));
  };

  return (
    <footer className="relative py-16 overflow-hidden bg-gradient-to-b from-white to-pink-50">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <PawBackground />
      </div>

      {/* Blob Decorations */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#ffc929] rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob-reverse" />

      <div className="relative grid gap-8 px-4 mx-auto max-w-7xl md:grid-cols-4">
        {/* Logo Section */}
        <div className="transition-all duration-300 transform hover:scale-105">
          <img
            className="h-12 mb-6 transition-transform duration-300 hover:rotate-6"
            src={logo}
            alt="PawFrindu Logo"
          />
          <p className="text-gray-600">
            Connecting pets with loving homes and providing comprehensive pet care services.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="mb-6 text-xl font-semibold text-gray-900">
            Quick Links
          </h4>
          <ul className="space-y-3">
            {quickLinks.map((link) => (
              <li
                key={link.name}
                className="transition-all duration-300 transform hover:translate-x-2"
              >
                <a
                  href={link.href}
                  className="group flex items-center text-gray-600 hover:text-[#ffc929]"
                >
                  {link.name}
                  <ArrowRight className="w-4 h-4 ml-2 transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="mb-6 text-xl font-semibold text-gray-900">
            Contact
          </h4>
          <ul className="space-y-3">
            {contactInfo.map((contact) => (
              <li
                key={contact.name}
                className="text-gray-600 transition-all duration-300 group hover:translate-x-2"
              >
                <a href={contact.href} className="hover:text-[#ffc929] transition-colors">
                  {contact.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Social Media */}
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center gap-4">
            {socialMedia.map(({ icon: Icon, href }) => (
              <a
                key={href}
                href={href}
                className="p-3 bg-gradient-to-br from-pink-100 to-[#ffc929]/20 rounded-full
                  transition-all duration-300 transform hover:scale-110 hover:rotate-6
                  hover:shadow-lg hover:shadow-[#ffc929]/20"
              >
                <Icon className="w-6 h-6 text-gray-700 hover:text-[#ffc929] transition-colors" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="relative pt-8 mt-12 text-center border-t border-gray-200">
        <p className="text-gray-600">
          © {new Date().getFullYear()} PawFrindu. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;