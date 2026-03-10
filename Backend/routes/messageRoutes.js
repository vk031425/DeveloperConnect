import express from "express";
import { verifyuser } from "../middlewares/verifyuser.js";
import {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead, // ✅ new controller
} from "../controllers/messageController.js";

const router = express.Router();

router.get("/conversations", verifyuser, getConversations);
router.get("/conversations/:id", verifyuser, getMessages);
router.post("/send", verifyuser, sendMessage);
router.put("/mark-read/:id", verifyuser, markAsRead); // ✅ new route

export default router;
