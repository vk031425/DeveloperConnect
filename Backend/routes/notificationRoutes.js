import express from "express";
import { getNotifications, markAsRead } from "../controllers/notificationController.js";
import { verifyuser } from "../middlewares/verifyuser.js";

const router = express.Router();

router.get("/", verifyuser, getNotifications);
router.put("/read", verifyuser, markAsRead);

export default router;
