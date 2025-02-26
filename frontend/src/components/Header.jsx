import { Menu, X, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import logo from "../assets/LogoPawfrindu.png";

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, logout } = useApp();
  const [forceRender, setForceRender] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const DEFAULT_PROFILE_IMAGE =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9IiNFNUU3RUIiLz4KICA8Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iNDAiIGZpbGw9IiM5Q0EzQUYiLz4KICA8cGF0aCBkPSJNMTYwIDE4MEgzOUM0MSAxNDAgODAgMTIwIDEwMCAxMjBDMTIwIDEyMCAxNTggMTQwIDE2MCAxODBaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPg==";
  const navLinks = [
    {
      name: "Adopt A Pet",
      to: "/pets",
      ariaLabel: "Go to pet adoption section",
    },
    {
      name: "Lost Your Pet?",
      to: "/lost",
      ariaLabel: "Get help finding a lost pet",
    },
    {
      name: "Train Your Pet",
      to: "/training",
      ariaLabel: "Access pet training resources",
    },
    {
      name: "Veterinary",
      to: "/veterinary",
      ariaLabel: "Find veterinary services",
    },
    {
      name: "Add a friend",
      to: "/addPet",
      ariaLabel: "Add a new pet",
      protected: true,
    },
  ];

  useEffect(() => {
    if (user && !loading) {
      setForceRender((prev) => prev + 1);
    }
    console.log("Header - User:", user);
    console.log("Header - Loading:", loading);
  }, [user, loading]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate("/");
  };

  const authSection = useMemo(() => {
    if (loading) {
      return (
        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
      );
    }
    if (!user) {
      return (
        <div className="flex gap-4">
          <button
            className="px-6 py-2.5 text-white font-semibold bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-xl shadow-md hover:from-[#ffa726] hover:to-[#ffc929] transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        </div>
      );
    }

    const imageSrc = user.image?.startsWith("data:")
      ? user.image
      : `${user.image}?t=${Date.now()}`;

    return (
      <div className="relative flex items-center gap-2" ref={dropdownRef}>
        <button
          className="flex items-center gap-3 px-3 py-2 rounded-full transition-all duration-300 hover:bg-[#ffc929]/10 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          aria-expanded={dropdownOpen}
          aria-label="User menu"
        >
          <div className="relative w-10 h-10 overflow-hidden rounded-full border-2 border-[#ffc929]/20">
            <img
              className="object-cover w-full h-full"
              src={imageSrc || DEFAULT_PROFILE_IMAGE}
              alt={user.fullName || "User"}
              key={user?.id || user?.email || "default"}
              onError={(e) => {
                e.target.src = DEFAULT_PROFILE_IMAGE;
              }}
            />
          </div>
          <span className="hidden font-medium text-gray-800 md:block">
            {user.fullName}
          </span>
          <ChevronDown
            className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${
              dropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 z-20 w-48 mt-2 overflow-hidden bg-white rounded-xl shadow-lg border border-[#ffc929]/20 top-full">
            <div className="py-1">
              <button
                onClick={() => {
                  navigate("/profile");
                  setDropdownOpen(false);
                }}
                className="flex w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-[#ffc929]/5 hover:text-gray-900 transition-all duration-300"
              >
                My Profile
              </button>
              {user.role === "PetOwner" && (
                <button
                  onClick={() => {
                    navigate("/list");
                    setDropdownOpen(false);
                  }}
                  className="flex w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-[#ffc929]/5 hover:text-gray-900 transition-all duration-300"
                >
                  My Pets for Adoption
                </button>
              )}
              <button
                onClick={handleLogout}
                className="flex w-full px-4 py-2 text-sm text-left text-red-600 transition-all duration-300 hover:bg-red-50 hover:text-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }, [user, loading, dropdownOpen, navigate, forceRender]);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#ffc929]/20 shadow-sm">
      <div className="relative flex items-center justify-between max-w-[1400px] mx-auto px-4 py-3 lg:px-6">
        <Link
          to="/"
          aria-label="Home"
          className="flex-shrink-0 transition-transform duration-300 hover:scale-105"
        >
          <img src={logo} className="h-[50px] w-auto" alt="PawFrindu Logo" />
        </Link>

        <nav className="hidden lg:block">
          <ul className="flex items-center space-x-8">
            {navLinks.map(
              (link) =>
                (!link.protected || user) && (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      aria-label={link.ariaLabel}
                      className={`text-gray-800 text-sm font-medium transition-all duration-300 hover:text-[#ffc929] relative py-2
                      after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#ffc929] 
                      after:transition-all after:duration-300 hover:after:w-full
                      ${
                        location.pathname === link.to
                          ? "text-[#ffc929] after:w-full"
                          : ""
                      }`}
                    >
                      {link.name}
                    </Link>
                  </li>
                )
            )}
          </ul>
        </nav>

        <div className="hidden lg:block">{authSection}</div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-gray-600 transition-all duration-300 rounded-full hover:bg-[#ffc929]/10 hover:text-[#ffc929] lg:hidden focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30"
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {mobileMenuOpen && (
          <div className="absolute left-0 right-0 z-20 bg-white shadow-lg border-t border-[#ffc929]/20 top-full">
            <nav className="px-4 py-3">
              <ul className="space-y-1">
                {navLinks.map(
                  (link) =>
                    (!link.protected || user) && (
                      <li key={link.to}>
                        <Link
                          to={link.to}
                          className={`block py-2 px-3 rounded-xl text-gray-800 hover:bg-[#ffc929]/10 hover:text-[#ffc929] transition-all duration-300
                          ${
                            location.pathname === link.to
                              ? "bg-[#ffc929]/10 text-[#ffc929]"
                              : ""
                          }`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {link.name}
                        </Link>
                      </li>
                    )
                )}
                <li className="pt-4 mt-4 border-t border-[#ffc929]/20">
                  <div className="flex flex-col space-y-2">{authSection}</div>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;