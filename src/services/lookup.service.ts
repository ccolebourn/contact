import pool from '../config/database';
import { Country, Region } from '../types';

export class LookupService {
  // Get all countries
  async getAllCountries(): Promise<Country[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT iso_code_2, country_name FROM Country ORDER BY country_name'
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  // Get all regions
  async getAllRegions(): Promise<Region[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT country_iso_code, region_code, name, type FROM Region ORDER BY country_iso_code, name'
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  // Get regions by country
  async getRegionsByCountry(countryCode: string): Promise<Region[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT country_iso_code, region_code, name, type FROM Region WHERE country_iso_code = $1 ORDER BY name',
        [countryCode.toUpperCase()]
      );
      return result.rows;
    } finally {
      client.release();
    }
  }
}
