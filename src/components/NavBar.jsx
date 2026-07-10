import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const NavBar = ({ darkMode, toggleDarkMode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Database", path: "/database" },
    { label: "Documentation", path: "/docs" },
    { label: "Comparison", path: "/comparison" },
    { label: "About", path: "/about" },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };

  const activeClasses = "text-[#B83E18] font-semibold";
  const inactiveClasses =
    darkMode
      ? "text-gray-300 hover:text-[#B83E18]"
      : "text-gray-700 hover:text-[#B83E18]";

  return (
    <nav
      className={`sticky top-0 z-50 border-b ${
        darkMode
          ? "bg-[#0b0b0b] border-[#b19149]/20"
          : "bg-white border-gray-200"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
        <button
          onClick={() => navigate("/")}
          className="text-xl font-bold text-[#B83E18]"
        >
          RunPredict
        </button>

        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={
                location.pathname === item.path
                  ? activeClasses
                  : inactiveClasses
              }
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="hidden md:flex gap-3 items-center">
          <button
            onClick={toggleDarkMode}
            className="px-3 py-2 rounded-lg border"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>

          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg bg-[#B83E18] text-white hover:bg-[#8F2E0E]"
          >
            Logout
          </button>
        </div>

        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div
          className={`md:hidden px-6 pb-4 flex flex-col gap-3 ${
            darkMode ? "bg-[#0b0b0b]" : "bg-white"
          }`}
        >
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setMobileMenuOpen(false);
              }}
              className="text-left"
            >
              {item.label}
            </button>
          ))}

          <button onClick={toggleDarkMode}>
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>

          <button
            onClick={handleLogout}
            className="text-left text-red-500"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default NavBar;