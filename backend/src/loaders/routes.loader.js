import authRoutes from "../modules/auth/auth.routes.js";
import profileRoutes from "../modules/profile/profile.routes.js";
import feedRoutes from "../modules/feed/feed.routes.js";
import insightRoutes from "../modules/insight/insight.routes.js";
import squadRoutes from "../modules/squad/squad.routes.js";
import newsRoutes from "../modules/news/news.routes.js";
import masteryRoutes from "../modules/mastery/mastery.routes.js";
import connectionsRoutes from "../modules/connections/connections.routes.js";
import chatRoutes from "../modules/chats/chats.routes.js";

export default (app) => {
  // Base health check
  app.get("/", (req, res) => {
    res.json({ success: true, message: "🚀 EDUVERSE API is running" });
  });

  // Module routes
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/profile", profileRoutes);
  app.use("/api/v1/feed", feedRoutes);
  app.use("/api/v1/insights", insightRoutes);
  app.use("/api/v1/squads", squadRoutes);
  app.use("/api/v1/news", newsRoutes);
  app.use("/api/v1/mastery-streams", masteryRoutes);
  app.use("/api/v1/connections", connectionsRoutes);
  app.use("/api/v1/chats", chatRoutes);
};
