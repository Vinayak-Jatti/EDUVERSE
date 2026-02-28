import { Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/layout";
import { HomePage, DashboardPage, AboutPage, NotFoundPage } from "@/pages";
import { ROUTES } from "@/constants";

// All app routes defined in one place.
// To add a new page:
//   1. Create src/pages/YourPage.jsx
//   2. Export from src/pages/index.js
//   3. Add a <Route> here

const AppRoutes = () => {
  return (
    <Routes>
      {/* Routes wrapped in MainLayout get Navbar + Footer */}
      <Route element={<MainLayout />}>
        <Route path={ROUTES.HOME}      element={<HomePage />} />
        <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
        <Route path={ROUTES.ABOUT}     element={<AboutPage />} />
      </Route>

      {/* 404 — no layout */}
      <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
