import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  getConversations,
  getMessages,
  sendMessage,
} from "../controllers/messageController.js";

const router = express.Router();

router.get("/conversations", protect, getConversations);
router.get("/conversations/:id", protect, getMessages);
router.post("/send", protect, sendMessage);

export default router;
