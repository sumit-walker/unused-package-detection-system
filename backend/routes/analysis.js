import express from 'express';
import { analyzeProject, autoRemovePackages } from '../controllers/analysisController.js';

const router = express.Router();

router.post('/scan', analyzeProject);
router.post('/auto-remove', autoRemovePackages);

router.get('/status/:jobId', async (req, res) => {
  res.json({ status: 'pending', jobId: req.params.jobId });
});

export default router;