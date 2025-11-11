import { Router } from "express";
import {
  bulkCreateNurse,
  getNurseByUserId,
  getAllNurses,
  updateNurse,
} from "../controllers/NurseController.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = Router();

router.post("/bulk", bulkCreateNurse);
router.get("/user/:userId", verifyToken, getNurseByUserId);
router.get("/", verifyToken, getAllNurses);
router.put("/:id", verifyToken, updateNurse);

export default router;