import express from "express";
import {
  getMyProfile,
  getProfileByUsername,
  updateProfile,
  toggleFollow,
} from "../controllers/profileController.js";
import { verifyuser } from "../middlewares/verifyuser.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.get("/me", verifyuser, getMyProfile);
router.get("/:username", verifyuser, getProfileByUsername);
router.put("/", verifyuser, upload.single("avatar"), updateProfile);
router.post("/:username/follow", verifyuser, toggleFollow);

export default router;
