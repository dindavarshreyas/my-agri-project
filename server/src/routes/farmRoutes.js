import express from 'express';
import { createFarm, getFarms, getFarmById } from '../controllers/farmController.js';
import { requireAuth } from '../middlewares/auth.js';

const router = express.Router();

// All farm routes are protected by JWT Supabase Auth
router.use(requireAuth);

router.post('/', createFarm);
router.get('/', getFarms);
router.get('/:id', getFarmById);

export default router;
