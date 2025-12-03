import { Router } from 'express';
import {
  getAllCountries,
  getAllRegions,
  getRegionsByCountry
} from '../controllers/lookup.controller';

const router = Router();

// GET /api/lookups/countries - Get all countries
router.get('/countries', getAllCountries);

// GET /api/lookups/regions - Get all regions
router.get('/regions', getAllRegions);

// GET /api/lookups/regions/:countryCode - Get regions by country
router.get('/regions/:countryCode', getRegionsByCountry);

export default router;
