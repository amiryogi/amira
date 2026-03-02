import { Request, Response } from 'express';
import { CategoryService } from './category.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendResponse, sendPaginatedResponse } from '../../common/responseFormatter.js';

const categoryService = new CategoryService();

export class CategoryController {
  static list = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await categoryService.listCategories(req.query as Record<string, string>);
    sendPaginatedResponse(res, 'Categories retrieved', result.data, result.pagination);
  });

  static getAllActive = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const categories = await categoryService.getAllActive();
    sendResponse(res, 200, 'Active categories retrieved', categories);
  });

  static getBySlug = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const category = await categoryService.getBySlug(req.params.slug as string);
    sendResponse(res, 200, 'Category retrieved', category);
  });

  static create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const category = await categoryService.createCategory(req.body);
    sendResponse(res, 201, 'Category created', category);
  });

  static update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const category = await categoryService.updateCategory(req.params.id as string, req.body);
    sendResponse(res, 200, 'Category updated', category);
  });

  static delete = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    await categoryService.deleteCategory(req.params.id as string);
    sendResponse(res, 200, 'Category deleted');
  });
}
