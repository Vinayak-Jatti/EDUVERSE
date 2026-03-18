import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout.jsx";
import AppLayout from "../layouts/AppLayout.jsx";
import LandingPage from "../pages/LandingPage.jsx";

// Feature Routes
import Login from "../features/auth/pages/Login.jsx";
import Register from "../features/auth/pages/Register.jsx";
import Feed from "../features/post/pages/Feed.jsx";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public / Landing Wrapper */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Internal App Wrapper (Protected later) */}
      <Route element={<AppLayout />}>
        <Route path="/feed" element={<Feed />} />
      </Route>

      {/* 404 Redirect */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;
