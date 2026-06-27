import { NavLink } from "react-router-dom";
import { LayoutDashboard, ClipboardList, Tag, Folder, Users } from "lucide-react";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/orders", label: "Orders", icon: ClipboardList },
  { to: "/admin/products", label: "Products", icon: Tag },
  { to: "/admin/other", label: "Other", icon: Folder },
];

export default function Sidebar() {
  return (
    <aside
      className="w-64 min-h-screen p-5 flex flex-col gap-2"
      style={{ background: "#131a2e" }}
    >
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .nav-item-fade {
          animation: fadeUp 0.5s ease forwards;
          opacity: 0;
        }
        .nav-link {
          position: relative;
          transition: transform 0.2s ease, background-color 0.25s ease;
        }
        .nav-link:hover {
          transform: translateX(4px);
        }
        .nav-icon {
          transition: transform 0.25s ease;
        }
        .nav-link:hover .nav-icon {
          transform: scale(1.1) rotate(-4deg);
        }
        .nav-link.active-link {
          background: #ffffff;
          box-shadow: 0 8px 20px -6px rgba(0,0,0,0.35);
        }
        .nav-link.active-link .nav-icon {
          color: #4f46e5;
        }
        .nav-link.active-link .nav-label {
          color: #1f2937;
        }
        .badge-pop {
          animation: fadeUp 0.5s ease forwards;
        }
      `}</style>

      {navItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <div
            key={item.to}
            className="nav-item-fade"
            style={{ animationDelay: `${index * 0.08}s` }}
          >
            <NavLink
              to={item.to}
              end={item.to === "/admin"}
              className={({ isActive }) =>
                `nav-link flex items-center justify-between px-4 py-3 rounded-2xl ${
                  isActive ? "active-link" : "hover:bg-white/5"
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="nav-icon w-5 h-5 text-gray-300" strokeWidth={2} />
                <span className="nav-label text-[15px] font-medium text-gray-200">
                  {item.label}
                </span>
              </div>

              {item.badge && (
                <span className="badge-pop bg-gray-900 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </NavLink>
          </div>
        );
      })}
    </aside>
  );
}