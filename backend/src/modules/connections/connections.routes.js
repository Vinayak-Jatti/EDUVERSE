import express from "express";
import { 
  getMyConnections, 
  getPendingConnections, 
  requestConnection, 
  acceptConnection, 
  removeConnection 
} from "./connections.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect); // All connection routes require intelligence clearance (Auth)

router.get("/", getMyConnections);
router.get("/pending", getPendingConnections);
router.post("/request/:userId", requestConnection);
router.post("/accept/:requestId", acceptConnection);
router.delete("/:userId", removeConnection);

export default router;
