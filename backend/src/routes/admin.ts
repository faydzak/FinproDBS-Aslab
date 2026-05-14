import { Router } from "express";
import {
  addMatch,
  deletePlayer,
  editMatchResult,
  getAdminSummary,
} from "../controllers/admin.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/summary", requireAuth, getAdminSummary);

router.post("/matches", requireAuth, addMatch);

router.put("/matches/:id", requireAuth, editMatchResult);

router.delete("/players/:id", requireAuth, deletePlayer);

export default router;
