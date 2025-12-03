import { Request, Response } from 'express';
import { OrganizationService } from '../services/organization.service';
import {
  CreateOrganizationSchema,
  UpdateOrganizationSchema,
  OrganizationSearchSchema
} from '../middleware/validator';
import { asyncHandler } from '../middleware/errorHandler';

const organizationService = new OrganizationService();

export const getOrganizationById = asyncHandler(async (req: Request, res: Response) => {
  const organizationId = parseInt(req.params.id);
  const organization = await organizationService.getById(organizationId);

  if (!organization) {
    return res.status(404).json({
      success: false,
      error: 'Organization not found'
    });
  }

  return res.json({
    success: true,
    data: organization
  });
});

export const getAllOrganizations = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  const result = await organizationService.getAll(page, limit);

  res.json({
    success: true,
    ...result
  });
});

export const searchOrganizations = asyncHandler(async (req: Request, res: Response) => {
  const filters = OrganizationSearchSchema.parse(req.query);
  const result = await organizationService.search(filters);

  res.json({
    success: true,
    ...result
  });
});

export const createOrganization = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = CreateOrganizationSchema.parse(req.body);
  const organization = await organizationService.create(validatedData as any);

  res.status(201).json({
    success: true,
    data: organization
  });
});

export const updateOrganization = asyncHandler(async (req: Request, res: Response) => {
  const organizationId = parseInt(req.params.id);
  const validatedData = UpdateOrganizationSchema.parse(req.body);

  const organization = await organizationService.update(organizationId, validatedData as any);

  res.json({
    success: true,
    data: organization
  });
});

export const deleteOrganization = asyncHandler(async (req: Request, res: Response) => {
  const organizationId = parseInt(req.params.id);
  await organizationService.delete(organizationId);

  res.json({
    success: true,
    message: 'Organization deleted successfully'
  });
});
