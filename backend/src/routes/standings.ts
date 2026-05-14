import { Router } from 'express';
import { getStandings } from '../controllers/standings.js';

const router = Router();

router.get('/', getStandings);

export default router;