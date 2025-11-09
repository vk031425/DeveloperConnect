import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead, // ✅ new controller
} from "../controllers/messageController.js";

const router = express.Router();

router.get("/conversations", protect, getConversations);
router.get("/conversations/:id", protect, getMessages);
router.post("/send", protect, sendMessage);
router.put("/mark-read/:id", protect, markAsRead); // ✅ new route

export default router;
