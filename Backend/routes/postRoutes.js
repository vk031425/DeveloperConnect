import express from "express";
import {
  createPost,
  getFeed,
  toggleLike,
  addComment,
  deletePost,
} from "../controllers/postController.js";
import { verifyuser } from "../middlewares/verifyuser.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.post("/", verifyuser, upload.single("image"), createPost); // create post
router.get("/feed", verifyuser, getFeed); // get all posts
router.put("/:id/like", verifyuser, toggleLike); // like/unlike
router.post("/:id/comment", verifyuser, addComment); // comment
router.delete("/:id", verifyuser, deletePost); // delete post

export default router;
