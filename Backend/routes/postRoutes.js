import express from "express";
import {
  createPost,
  getFeed,
  toggleLike,
  addComment,
  deletePost,
} from "../controllers/postController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createPost); // create post
router.get("/feed", protect, getFeed); // get all posts
router.put("/:id/like", protect, toggleLike); // like/unlike
router.post("/:id/comment", protect, addComment); // comment
router.delete("/:id", protect, deletePost); // delete post

export default router;
