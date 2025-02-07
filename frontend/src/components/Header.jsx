import React from 'react';  
import logo from "../assets/LogoPawfrindu.png";  

function Header() {  
  return (  
    <header className="py-10 "> {/* padding-y: 80px, margin-top: 30px */}  
      <div className="flex justify-between items-center max-w-[1200px] mx-auto h-[80px]">  
        <div>  
          <img src={logo} className="h-[150px] mt-2" alt="Logo" />  
        </div>  
        <nav>  
          <ul className="flex list-none m-0 p-0">  
            <li className="ml-5"> {/* margin-left: 20px */}  
              <a className="text-[#333] text-lg no-underline hover:text-[#666]">  
                Adopt a friend  
              </a>  
            </li>  
            <li className="ml-5">  
              <a className="text-[#333] text-lg no-underline hover:text-[#666]">  
                Lost your friend?  
              </a>  
            </li>  
            <li className="ml-5">  
              <a className="text-[#333] text-lg no-underline hover:text-[#666]">  
                Training  
              </a>  
            </li>  
            <li className="ml-5">  
              <a className="text-[#333] text-lg no-underline hover:text-[#666]">  
                Veterinary  
              </a>  
            </li>  
          </ul>  
        </nav>  
      </div>  
    </header>  
  );  
}  

export default Header;