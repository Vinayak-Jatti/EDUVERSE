import authRoutes from "../modules/auth/auth.routes.js";
import profileRoutes from "../modules/profile/profile.routes.js";
import feedRoutes from "../modules/feed/post.routes.js";

export default (app) => {
  // Base health check
  app.get("/", (req, res) => {
    res.json({ success: true, message: "🚀 EDUVERSE API is running" });
  });

  // Module routes
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/profile", profileRoutes);
  app.use("/api/v1/feed", feedRoutes);
};
