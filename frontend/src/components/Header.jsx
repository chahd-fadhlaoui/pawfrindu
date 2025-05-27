import { Menu, X, ChevronDown, User, LogOut } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import logo from "../assets/images/LogoPawfrindu.png";

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, logout } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [petManagementOpen, setPetManagementOpen] = useState(false);
  const dropdownRef = useRef(null);
  const petManagementRef = useRef(null);

  const DEFAULT_PROFILE_IMAGE =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9IiNFNUU3RUIiLz4KICA8Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iNDAiIGZpbGw9IiM5Q0EzQUYiLz4KICA8cGF0aCBkPSJNMTYwIDE4MEgzOUM0MSAxNDAgODAgMTIwIDEwMCAxMjBDMTIwIDEyMCAxNTggMTQwIDE2MCAxODBaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPg==";

  const navLinks = [
    { name: "Adopt a Pet", to: "/pets", ariaLabel: "Go to pet adoption section" },
    { name: "Lost & Found", to: "/lost-and-found", ariaLabel: "Get help finding a lost pet" },
    { name: "Pet Training", to: "/trainers", ariaLabel: "Access pet training resources" },
    { name: "Veterinary Care", to: "/vets", ariaLabel: "Find veterinary services" },
    {
      name: "Pet Management",
      ariaLabel: "Manage my pets and adoption requests",
      protected: true,
      dropdownItems: [
        { name: "Create Pet", to: "/addPet" },
        { name: "My Pet Posts", to: "/list/posts" },
        { name: "My Adoption Requests", to: "/list/requests" },
        { name: "My Vet Appointments", to: "/Vetappointments" }, 
      ],
    },
  ];

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (petManagementRef.current && !petManagementRef.current.contains(event.target)) {
        setPetManagementOpen(false);
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
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="hidden space-y-2 md:block">
            <div className="w-24 h-3 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-16 h-2 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      );
    }
    
    if (!user) {
      return (
        <div className="flex gap-3">
          <button
            className="px-5 py-2 text-white font-medium bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:translate-y-px active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/50"
            onClick={() => navigate("/login")}
            aria-label="Login"
          >
            Login
          </button>
        </div>
      );
    }

    const imageSrc = user.image?.startsWith("data:") ? user.image : `${user.image}?t=${Date.now()}`;

    return (
      <div className="relative flex items-center gap-2" ref={dropdownRef}>
        <button
          className="flex items-center gap-3 p-2 rounded-full transition-all duration-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/50 group"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          aria-expanded={dropdownOpen}
          aria-label="User menu"
        >
          <div className="relative w-10 h-10 overflow-hidden rounded-full border-2 border-[#ffc929]/40 shadow-md group-hover:border-[#ffc929]/70 transition-all duration-300">
            <img
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
              src={imageSrc || DEFAULT_PROFILE_IMAGE}
              alt={user.fullName || "User"}
              onError={(e) => (e.target.src = DEFAULT_PROFILE_IMAGE)}
            />
            <div className="absolute inset-0 transition-opacity duration-300 rounded-full opacity-0 bg-gradient-to-t from-black/10 to-transparent group-hover:opacity-100"></div>
          </div>
          <div className="hidden text-left md:block">
            <p className="text-sm font-medium text-gray-800 group-hover:text-[#ffc929] transition-colors duration-300 line-clamp-1">
              {user.fullName}
            </p>
            <p className="text-xs text-gray-500 transition-colors duration-300 line-clamp-1">
              {user.email || "Pet Lover"}
            </p>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-gray-600 transition-transform duration-300 group-hover:text-[#ffc929] ${
              dropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 z-50 w-64 mt-2 overflow-hidden bg-white border border-gray-200 shadow-xl rounded-xl top-full">
            <div className="px-4 pt-4 pb-2 border-b border-gray-100 md:hidden">
              <p className="text-sm font-medium text-gray-800">{user.fullName}</p>
              <p className="text-xs text-gray-500 truncate">{user.email || "Pet Lover"}</p>
            </div>
            <div className="py-1">
              <button
                onClick={() => {
                  navigate("/profile");
                  setDropdownOpen(false);
                }}
                className="flex items-center w-full px-4 py-3 text-sm text-left text-gray-700 transition-all duration-300 hover:bg-gray-50"
                aria-label="Go to my profile"
              >
                <User size={18} className="mr-3 text-gray-500" />
                <span>My Profile</span>
              </button>
              <div className="my-1 border-t border-gray-100"></div>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 text-sm text-left text-red-600 transition-all duration-300 hover:bg-red-50"
                aria-label="Logout"
              >
                <LogOut size={18} className="mr-3 text-red-500" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }, [user, loading, dropdownOpen, navigate]);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="relative flex items-center justify-between max-w-[1400px] mx-auto px-4 py-3 lg:px-8">
        {/* Logo */}
        <Link
          to="/"
          aria-label="Home"
          className="relative z-10 flex-shrink-0 transition-transform duration-300 hover:scale-105"
        >
          <img src={logo} className="w-auto h-12" alt="PawFrindu Logo" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:block">
          <ul className="flex items-center space-x-6">
            {navLinks.map((link) =>
              (!link.protected || user) ? (
                <li key={link.name} className="relative" ref={link.name === "Pet Management" ? petManagementRef : null}>
                  {link.dropdownItems ? (
                    <>
                      <button
                        className={`flex items-center gap-1.5 text-gray-700 text-sm font-medium transition-all duration-300 hover:text-[#ffc929] relative py-2.5 px-1
                          after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:w-0 after:h-0.5 after:bg-[#ffc929] after:mx-auto
                          after:transition-all after:duration-300 hover:after:w-full
                          ${location.pathname.startsWith("/list") || location.pathname === "/addPet" ? "text-[#ffc929] after:w-full" : ""}`}
                        onClick={() => setPetManagementOpen(!petManagementOpen)}
                        aria-expanded={petManagementOpen}
                        aria-label={link.ariaLabel}
                      >
                        <span>{link.name}</span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-300 ${petManagementOpen ? "rotate-180" : ""}`}
                        />
                      </button>
                      {petManagementOpen && (
                        <div className="absolute left-0 z-30 w-64 py-1 mt-1 overflow-hidden bg-white border border-gray-200 shadow-lg rounded-xl">
                          {link.dropdownItems.map((item) => (
                            <Link
                              key={item.to}
                              to={item.to}
                              className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#ffc929] transition-all duration-300"
                              onClick={() => setPetManagementOpen(false)}
                            >
                              {item.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      to={link.to}
                      aria-label={link.ariaLabel}
                      className={`text-gray-700 text-sm font-medium transition-all duration-300 hover:text-[#ffc929] relative py-2.5 px-1
                        after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:w-0 after:h-0.5 after:bg-[#ffc929] after:mx-auto
                        after:transition-all after:duration-300 hover:after:w-full
                        ${location.pathname === link.to ? "text-[#ffc929] after:w-full" : ""}`}
                    >
                      {link.name}
                    </Link>
                  )}
                </li>
              ) : null
            )}
          </ul>
        </nav>

        {/* Auth Section */}
        <div className="items-center hidden lg:flex">{authSection}</div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-gray-600 transition-all duration-300 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/50 lg:hidden"
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle mobile menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute left-0 right-0 z-40 bg-white shadow-xl border-t border-gray-200 top-full max-h-[calc(100vh-4rem)] overflow-y-auto">
            <nav className="px-4 py-5 space-y-4">
              <ul className="space-y-1">
                {navLinks.map((link) =>
                  (!link.protected || user) ? (
                    <li key={link.name}>
                      {link.dropdownItems ? (
                        <div>
                          <button
                            className={`flex items-center justify-between w-full text-left py-3 px-4 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-300 ${
                              location.pathname.startsWith("/list") || location.pathname === "/addPet"
                                ? "bg-[#ffc929]/10 text-[#ffc929]"
                                : ""
                            }`}
                            onClick={() => setPetManagementOpen(!petManagementOpen)}
                            aria-expanded={petManagementOpen}
                            aria-label={link.ariaLabel}
                          >
                            <span>{link.name}</span>
                            <ChevronDown
                              className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${petManagementOpen ? "rotate-180" : ""}`}
                            />
                          </button>
                          {petManagementOpen && (
                            <ul className="px-2 py-2 mt-1 space-y-1 rounded-lg bg-gray-50">
                              {link.dropdownItems.map((item) => (
                                <li key={item.to}>
                                  <Link
                                    to={item.to}
                                    className="block py-2.5 px-6 rounded-lg text-gray-700 hover:bg-white hover:text-[#ffc929] transition-all duration-300"
                                    onClick={() => setMobileMenuOpen(false)}
                                  >
                                    {item.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ) : (
                        <Link
                          to={link.to}
                          className={`block py-3 px-4 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-300 ${
                            location.pathname === link.to ? "bg-[#ffc929]/10 text-[#ffc929]" : ""
                          }`}
                          onClick={() => setMobileMenuOpen(false)}
                          aria-label={link.ariaLabel}
                        >
                          {link.name}
                        </Link>
                      )}
                    </li>
                  ) : null
                )}
              </ul>
              <div className="pt-3 mt-2 border-t border-gray-200">
                <div className="px-2 space-y-3">{authSection}</div>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;