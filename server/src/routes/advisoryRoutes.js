import express from 'express';
import { generateAdvisory, getAdvisories, getAdvisoryById } from '../controllers/advisoryController.js';
import { requireAuth } from '../middlewares/auth.js';

const router = express.Router();

// All advisory routes are protected by JWT Supabase Auth
router.use(requireAuth);

router.post('/generate', generateAdvisory);
router.get('/', getAdvisories);
router.get('/:id', getAdvisoryById);

export default router;
