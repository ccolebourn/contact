import { Router } from 'express';
import {
  getPersonById,
  getAllPersons,
  searchPersons,
  createPerson,
  updatePerson,
  deletePerson
} from '../controllers/person.controller';

const router = Router();

// GET /api/persons - Get all persons (with pagination)
router.get('/', getAllPersons);

// GET /api/persons/search - Search persons
router.get('/search', searchPersons);

// GET /api/persons/:id - Get person by ID
router.get('/:id', getPersonById);

// POST /api/persons - Create new person
router.post('/', createPerson);

// PUT /api/persons/:id - Update person
router.put('/:id', updatePerson);

// DELETE /api/persons/:id - Delete person
router.delete('/:id', deletePerson);

export default router;
