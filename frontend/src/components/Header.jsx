import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import logo from "../assets/LogoPawfrindu.png";
import { Link, useNavigate } from "react-router-dom";
import profile from "../assets/profile.png"
import dropdown from "../assets/dropdown.png"

function Header() {
  const navigate = useNavigate();
  const [showmenu, setShowMenu] = useState(false);
  const [token, setToken] = useState(true);
  const [activeLink, setActiveLink] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    {
      name: "Adopt A Pet",
      to: "/pets",
      ariaLabel: "Go to pet adoption section",
    },
    {
      name: "Lost Your Pet?",
      to: "#lost",
      ariaLabel: "Get help finding a lost pet",
    },
    {
      name: "Train Your Pet",
      to: "#training",
      ariaLabel: "Access pet training resources",
    },
    {
      name: "Veterinary",
      to: "#veterinary",
      ariaLabel: "Find veterinary services",
    },
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="relative flex justify-between items-center max-w-[1400px] mx-auto px-4 py-4 lg:px-6">
        {/* Logo */}
        <Link to="/" aria-label="Home">
          <img
            src={logo}
            className="h-[80px] w-auto transition-transform transform hover:scale-105"
            alt="PawFrindu Logo"
          />
        </Link>

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
                <Link
                  to={link.to}
                  aria-label={link.ariaLabel}
                  className={`   
                    text-gray-800 text-base font-medium   
                    transition-all duration-300   
                    relative   
                    ${
                      activeLink === index
                        ? "text-[#ffc929] scale-110"
                        : "hover:text-[#ffc929]"
                    }   
                    after:content-[''] after:absolute after:bottom-[-4px]   
                    after:left-0 after:h-[2px] after:bg-[#ffc929]   
                    after:transition-all after:duration-300   
                    ${
                      activeLink === index
                        ? "after:w-full"
                        : "after:w-0 hover:after:w-full"
                    }   
                  `}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile Menu Toggle */}
        <div className="lg:hidden">
          <button
            onClick={toggleMobileMenu}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            className="text-gray-800 focus:outline-none"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Create Account Button (Visible on both Mobile and Desktop) */}
        <div className="ml-4 hidden lg:block">
        {
              token  ?
              <div className="flex items-center gap-2 cursor-pointer group relative">
                <img className='w-10 ' src={profile} />
                <img className="w-8" src={dropdown}/>
                <div className="absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block">
                  <div className="min-w-48 bg-[#f2d7db] rounded flex flex-col gap-4 p-4 ">
                  <p onClick={()=>navigate("myprofile")} className="hover:text-black cursor-pointer" >My profile</p>
                  <p className="hover:text-black cursor-pointer" >My pets for adoption</p>
                  <p onClick={()=>setToken(false)} className="hover:text-black cursor-pointer">Logout</p></div>
                </div>

              </div>
              :    <button
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
              onClick={() => navigate("/login")} // Naviguer vers la page de création de compte
            >
             
              Create account
            </button>
            }
        
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="absolute left-0 w-full bg-white shadow-lg lg:hidden top-full">
            <ul className="flex flex-col items-center py-4">
              {navLinks.map((link, index) => (
                <li key={index} className="my-2">
                  <Link
                    to={link.to}
                    className="text-gray-800 text-lg hover:text-[#ffc929]"
                    onClick={toggleMobileMenu}
                  >
                    {link.name}
                  </Link>
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
                  onClick={() => navigate("/login")} // Cette ligne permet de rediriger vers la création de compte
                >
                  Create account
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
