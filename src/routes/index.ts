import { Router } from 'express';
import personRoutes from './person.routes';
import organizationRoutes from './organization.routes';

const router = Router();

// Mount route modules
router.use('/persons', personRoutes);
router.use('/organizations', organizationRoutes);

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Contact Service API is running',
    timestamp: new Date().toISOString()
  });
});

export default router;
