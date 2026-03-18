import express from "express";
import loadExpress from "./loaders/express.loader.js";
import loadRoutes from "./loaders/routes.loader.js";
import notFound from "./middlewares/notFound.middleware.js";
import errorHandler from "./middlewares/error.middleware.js";

const app = express();

// Load express middleware
loadExpress(app);

// Load routes
loadRoutes(app);

// Error Handling (must be last)
app.use(notFound);
app.use(errorHandler);

export default app;
