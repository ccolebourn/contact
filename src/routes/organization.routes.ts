import { Router } from 'express';
import {
  getOrganizationById,
  getAllOrganizations,
  searchOrganizations,
  createOrganization,
  updateOrganization,
  deleteOrganization
} from '../controllers/organization.controller';

const router = Router();

// GET /api/organizations - Get all organizations (with pagination)
router.get('/', getAllOrganizations);

// GET /api/organizations/search - Search organizations
router.get('/search', searchOrganizations);

// GET /api/organizations/:id - Get organization by ID
router.get('/:id', getOrganizationById);

// POST /api/organizations - Create new organization
router.post('/', createOrganization);

// PUT /api/organizations/:id - Update organization
router.put('/:id', updateOrganization);

// DELETE /api/organizations/:id - Delete organization
router.delete('/:id', deleteOrganization);

export default router;
