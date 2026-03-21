import connectionsService from "./connections.service.js";
import asyncHandler from "../../utils/asyncHandler.js";

/**
 * @desc Get all connections (Mutual)
 * @route GET /api/v1/connections
 */
export const getMyConnections = asyncHandler(async (req, res) => {
  const connections = await connectionsService.getMyNetwork(req.user.id);
  res.status(200).json({ status: "success", data: connections });
});

/**
 * @desc Get pending connections (Incoming/Outgoing)
 * @route GET /api/v1/connections/pending
 */
export const getPendingConnections = asyncHandler(async (req, res) => {
  const pending = await connectionsService.getPendingTray(req.user.id);
  res.status(200).json({ status: "success", data: pending });
});

/**
 * @desc Connect with a peer
 * @route POST /api/v1/connections/request/:userId
 */
export const requestConnection = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const requestId = await connectionsService.requestConnection(req.user.id, userId);
  res.status(201).json({ status: "success", message: "Handshake Initiated", data: { requestId } });
});

/**
 * @desc Accept connection request
 * @route POST /api/v1/connections/accept/:requestId
 */
export const acceptConnection = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  await connectionsService.acceptConnection(req.user.id, requestId);
  res.status(200).json({ status: "success", message: "Mutual Bond Verified" });
});

/**
 * @desc Disconnect or Reject
 * @route DELETE /api/v1/connections/:userId
 */
export const removeConnection = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  await connectionsService.disconnect(req.user.id, userId);
  res.status(200).json({ status: "success", message: "Connection Neutralized" });
});
