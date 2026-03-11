import express from "express";
import { verifyuser } from "../middlewares/verifyuser.js";
import {
  registerUser,
  loginUser,
  logoutUser
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

router.get("/verify", verifyuser, (req, res) => res.json(req.user));

export default router;