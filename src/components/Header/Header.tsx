import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Search, Bell, ChevronDown, LogOut } from "lucide-react";

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const userName = "Randhir kumar";
  const notificationCount = 5;

  const handleLogout = () => {
    localStorage.removeItem("token");
    setDropdownOpen(false);
    navigate("/");
  };

  return (
    <header className="w-full bg-[#131a2e] px-6 py-3 flex items-center justify-between border-b border-white/5">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <ShoppingCart className="text-orange-400" size={26} />
        <span className="text-white font-bold text-xl">fastcart</span>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-md mx-8">
        <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 border border-white/10 focus-within:border-orange-400/50 transition-colors">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none text-sm text-white placeholder:text-gray-500 w-full"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-5">
        {/* Notification */}
        <div className="relative cursor-pointer">
          <Bell className="text-gray-300 hover:text-white transition-colors" size={20} />
          {notificationCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-blue-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {notificationCount}
            </span>
          )}
        </div>

        {/* User dropdown */}
        <UserMenu
          userName={userName}
          open={dropdownOpen}
          setOpen={setDropdownOpen}
          onLogout={handleLogout}
        />
      </div>

      <style>{`
        @keyframes dropdownFade {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </header>
  );
};

const UserMenu = ({
  userName,
  open,
  setOpen,
  onLogout,
}: {
  userName: string;
  open: boolean;
  setOpen: (v: boolean) => void;
  onLogout: () => void;
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, setOpen]);

  const initial = userName.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 cursor-pointer group"
      >
        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-semibold">
          {initial}
        </div>
        <span className="text-sm text-white font-medium hidden sm:block">
          {userName}
        </span>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 mt-3 w-44 bg-[#1a2238] border border-white/10 rounded-xl shadow-xl py-2 z-50"
          style={{ animation: "dropdownFade 0.15s ease-out" }}
        >
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-white/5 transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default Header;