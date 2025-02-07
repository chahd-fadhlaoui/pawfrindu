import React, { useState } from 'react';  
import fbicon from "../assets/Fb.png";   
import instaicon from "../assets/insta.png";  
import logo from "../assets/LogoPawfrindu.png";  

const Footer = () => {   
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add newsletter signup logic here
    console.log('Submitted email:', email);
    setEmail('');
  };

  return (  
    <footer className="relative py-16 bg-white">  
      <div className="grid gap-8 px-4 mx-auto max-w-7xl md:grid-cols-4">  
        <div>  
          <img className="h-12 mb-6" src={logo} alt="PawFrindu Logo" />   
          <p className="text-gray-600">
            Connecting pets with loving homes and providing comprehensive pet care services.
          </p>
        </div>  

        <div>  
          <h4 className="mb-4 text-xl font-semibold text-gray-900">Quick Links</h4>  
          <ul className="space-y-3">  
            {['Home', 'About Us', 'Adopt', 'Lost/Found', 'Training', 'Veterinary'].map((link) => (
              <li key={link}>
                <a href="#" className="text-gray-600 hover:text-[#ffc929] transition-colors">
                  {link}
                </a>
              </li>
            ))}
          </ul>  
        </div>  

        <div>  
          <h4 className="mb-4 text-xl font-semibold text-gray-900">Contact</h4>  
          <ul className="space-y-3">  
            <li className="text-gray-600">Tunisia</li>  
            <li>
              <a href="#" className="text-gray-600 hover:text-[#ffc929] transition-colors">
                View on Maps
              </a>
            </li>
            <li className="text-gray-600">+216 XX XXX XXX</li>
            <li className="text-gray-600">info@pawfrindu.com</li>
          </ul>  
        </div>  

        <div>  
          <h4 className="mb-4 text-xl font-semibold text-gray-900">Stay Connected</h4>  
          <form onSubmit={handleSubmit} className="mb-6">  
            <div className="flex pb-2 border-b border-gray-300">
              <input 
                type="email" 
                placeholder="Your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-gray-600 bg-transparent outline-none" 
                required
              />
              <button 
                type="submit" 
                className="bg-[#ffc929] text-gray-900 px-4 py-2 rounded-full hover:bg-pink-500 transition-colors"
              >
                Subscribe
              </button>
            </div>
          </form>
          
          <div className="flex items-center gap-4">  
            <a href="#" className="transition-opacity hover:opacity-75">
              <img className="w-8 h-8" src={fbicon} alt="Facebook" />   
            </a>
            <a href="#" className="transition-opacity hover:opacity-75">
              <img className="w-8 h-8" src={instaicon} alt="Instagram" />
            </a>
          </div>  
        </div>  
      </div>  

      <div className="pt-6 mt-12 text-center border-t border-gray-200">
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