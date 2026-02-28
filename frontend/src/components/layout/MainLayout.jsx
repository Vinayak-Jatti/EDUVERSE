import { Outlet } from "react-router-dom";
import Navbar from "./Navbar.jsx";

// MainLayout wraps all pages that need the nav + footer
const MainLayout = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-gray-100 py-4 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} {import.meta.env.VITE_APP_NAME}. All rights reserved.
      </footer>
    </div>
  );
};

export default MainLayout;
