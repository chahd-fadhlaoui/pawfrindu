import { Menu, X } from "lucide-react";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import dropdown from "../assets/dropdown.png";
import logo from "../assets/LogoPawfrindu.png";

function Header() {
  const navigate = useNavigate();
  const { user, logout } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState(null);

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
    {
      name: "Add a friend",
      to: "/addPet",
      ariaLabel: "Find veterinary services",
    },
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const defaultProfileImage =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9IiNFNUU3RUIiLz4KICA8Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iNDAiIGZpbGw9IiM5Q0EzQUYiLz4KICA8cGF0aCBkPSJNMTYwIDE4MEgzOUM0MSAxNDAgODAgMTIwIDEwMCAxMjBDMTIwIDEyMCAxNTggMTQwIDE2MCAxODBaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPg==";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const renderAuthSection = () => {
    if (user) {
      return (
        <div className="relative flex items-center gap-2 cursor-pointer group">
          <img
            className="object-cover w-10 h-10 rounded-full"
            src={user.image || defaultProfileImage}
            alt={user.fullName}
            onError={(e) => {
              console.log("Error loading image:", user.image);
              e.target.src = defaultProfileImage;
            }}
          />
          <span className="hidden font-medium text-gray-800 md:block">
            {user.fullName}
          </span>
          <img className="w-8" src={dropdown} alt="dropdown menu" />
          <div className="absolute top-0 right-0 z-20 hidden text-base font-medium text-gray-600 pt-14 group-hover:block">
            <div className="min-w-48 bg-[#f2d7db] rounded flex flex-col gap-4 p-4 shadow-lg">
              <p
                onClick={() => navigate("/profile")}
                className="cursor-pointer hover:text-black"
              >
                My profile
              </p>
              {user.role === "PetOwner" && (
                <p
                  onClick={() => navigate("/list")}
                  className="cursor-pointer hover:text-black"
                >
                  My pets for adoption
                </p>
              )}
              <p
                onClick={handleLogout}
                className="cursor-pointer hover:text-black"
              >
                Logout
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex gap-4">
        <button
          className="px-6 py-3 text-gray-900 bg-[#ffc929] rounded-full hover:bg-pink-500 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-md hover:shadow-lg"
          onClick={() => navigate("/login")}
        >
          Login
        </button>
        <button
          className="px-6 py-3 text-gray-900 bg-white border-2 border-[#ffc929] rounded-full hover:bg-[#ffc929] transition-all duration-300 transform hover:scale-110 shadow-md hover:shadow-lg"
          onClick={() => navigate("/register")}
        >
          Create account
        </button>
      </div>
    );
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
                  className={`text-gray-800 text-base font-medium transition-all duration-300 relative ${
                    activeLink === index
                      ? "text-[#ffc929] scale-110"
                      : "hover:text-[#ffc929]"
                  } after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:bg-[#ffc929] after:transition-all after:duration-300 ${
                    activeLink === index
                      ? "after:w-full"
                      : "after:w-0 hover:after:w-full"
                  }`}
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

        {/* Auth Section */}
        <div className="hidden lg:block">{renderAuthSection()}</div>

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
                {user ? (
                  <div className="flex flex-col items-center gap-2">
                    <img
                      className="object-cover w-10 h-10 rounded-full"
                      src={user.image || defaultProfileImage}
                      alt={user.fullName}
                      onError={(e) => (e.target.src = defaultProfileImage)}
                    />
                    <span className="font-medium text-gray-800">
                      {user.fullName}
                    </span>
                    <button
                      className="px-6 py-2 text-gray-900 bg-[#ffc929] rounded-full hover:bg-pink-500 hover:text-white"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <button
                      className="px-6 py-2 text-gray-900 bg-[#ffc929] rounded-full hover:bg-pink-500 hover:text-white"
                      onClick={() => navigate("/login")}
                    >
                      Login
                    </button>
                    <button
                      className="px-6 py-2 text-gray-900 bg-white border-2 border-[#ffc929] rounded-full hover:bg-[#ffc929]"
                      onClick={() => navigate("/register")}
                    >
                      Create account
                    </button>
                  </div>
                )}
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
