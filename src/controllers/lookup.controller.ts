import { Request, Response } from 'express';
import { LookupService } from '../services/lookup.service';
import { asyncHandler } from '../middleware/errorHandler';

const lookupService = new LookupService();

/**
 * GET /api/lookups/countries - Get all countries
 *
 * Returns: Array of all countries with ISO codes
 */
export const getAllCountries = asyncHandler(async (_req: Request, res: Response) => {
  const countries = await lookupService.getAllCountries();

  res.json({
    success: true,
    data: countries
  });
});

/**
 * GET /api/lookups/regions - Get all regions
 *
 * Returns: Array of all regions (states/provinces) for all countries
 */
export const getAllRegions = asyncHandler(async (_req: Request, res: Response) => {
  const regions = await lookupService.getAllRegions();

  res.json({
    success: true,
    data: regions
  });
});

/**
 * GET /api/lookups/regions/:countryCode - Get regions by country
 *
 * URL Parameter: countryCode (2-letter ISO country code, e.g., 'US', 'CA')
 * Example: GET /api/lookups/regions/US
 *
 * Returns: Array of regions for the specified country
 */
export const getRegionsByCountry = asyncHandler(async (req: Request, res: Response) => {
  const countryCode = req.params.countryCode;

  const regions = await lookupService.getRegionsByCountry(countryCode);

  res.json({
    success: true,
    data: regions
  });
});
