import { Router } from 'express';
import {
  addMatch,
  deletePlayer,
  editMatchResult,
  getAdminSummary,
} from '../controllers/admin.js';

const router = Router();

router.get   ('/summary',     getAdminSummary);
router.post  ('/matches',     addMatch);
router.put   ('/matches/:id', editMatchResult);
router.delete('/players/:id', deletePlayer);

export default router;