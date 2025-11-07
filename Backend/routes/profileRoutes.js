import express from "express";
import {
  getMyProfile,
  getProfileByUsername,
  updateProfile,
  toggleFollow,
} from "../controllers/profileController.js";
import { protect } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.get("/me", protect, getMyProfile);
router.get("/:username", protect, getProfileByUsername);
router.put("/", protect, upload.single("avatar"), updateProfile);
router.post("/:username/follow", protect, toggleFollow);

export default router;
