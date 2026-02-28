import { Link, NavLink } from "react-router-dom";
import { APP_NAME, ROUTES } from "@/constants";

const NAV_LINKS = [
  { label: "Home",      to: ROUTES.HOME },
  { label: "Dashboard", to: ROUTES.DASHBOARD },
  { label: "About",     to: ROUTES.ABOUT },
];

const Navbar = () => {
  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link to={ROUTES.HOME} className="text-lg font-bold text-primary-600">
          {APP_NAME}
        </Link>

        {/* Links */}
        <div className="flex items-center gap-6">
          {NAV_LINKS.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? "text-primary-600" : "text-gray-600 hover:text-gray-900"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
