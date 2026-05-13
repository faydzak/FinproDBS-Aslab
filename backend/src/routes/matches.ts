import { Router } from 'express';
import { getAllMatches, getMatchById } from '../controllers/matches.js';

const router = Router();

router.get('/', getAllMatches);
router.get('/:id', getMatchById);

export default router;
