import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout.jsx";
import AppLayout from "../layouts/AppLayout.jsx";
import LandingPage from "../pages/LandingPage.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import PlaceholderPage from "../pages/PlaceholderPage.jsx";

// Feature Routes
import Login from "../features/auth/pages/Login.jsx";
import Register from "../features/auth/pages/Register.jsx";
import OTPVerification from "../features/auth/pages/OTPVerification.jsx";
import ForgotPassword from "../features/auth/pages/ForgotPassword.jsx";
import ResetPassword from "../features/auth/pages/ResetPassword.jsx";
import Feed from "../features/post/pages/Feed.jsx";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public / Landing Wrapper */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<OTPVerification />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Internal Protected App Wrapper */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/feed" element={<Feed />} />
          
          {/* Wired Placeholder Pages for Sidebar */}
          <Route path="/resources" element={<PlaceholderPage title="Resources" />} />
          <Route path="/groups" element={<PlaceholderPage title="Study Groups" />} />
          <Route path="/achievements" element={<PlaceholderPage title="Achievements" />} />
          <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
        </Route>
      </Route>

      {/* 404 Redirect */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;
