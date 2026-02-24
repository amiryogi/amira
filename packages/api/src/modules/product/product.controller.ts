import { Request, Response } from 'express';
import { ProductService } from './product.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendResponse, sendPaginatedResponse } from '../../common/responseFormatter.js';

const productService = new ProductService();

export class ProductController {
  static list = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await productService.listProducts(req.query as Record<string, string>);
    sendPaginatedResponse(res, 'Products retrieved', result.data, result.pagination);
  });

  static adminList = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await productService.adminListProducts(req.query as Record<string, string>);
    sendPaginatedResponse(res, 'Products retrieved', result.data, result.pagination);
  });

  static getBySlug = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const product = await productService.getBySlug(req.params.slug);
    sendResponse(res, 200, 'Product retrieved', product);
  });

  static getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const product = await productService.getById(req.params.id);
    sendResponse(res, 200, 'Product retrieved', product);
  });

  static create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Parse JSON fields from multipart form data
    const body = { ...req.body };
    if (typeof body.price === 'string') body.price = Number(body.price);
    if (typeof body.discountPrice === 'string') body.discountPrice = Number(body.discountPrice);
    if (typeof body.stock === 'string') body.stock = Number(body.stock);
    if (typeof body.isFeatured === 'string') body.isFeatured = body.isFeatured === 'true';
    if (typeof body.variants === 'string') body.variants = JSON.parse(body.variants);

    const product = await productService.createProduct(body, req.files as Express.Multer.File[]);
    sendResponse(res, 201, 'Product created', product);
  });

  static update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const body = { ...req.body };
    if (typeof body.price === 'string') body.price = Number(body.price);
    if (typeof body.discountPrice === 'string') body.discountPrice = Number(body.discountPrice);
    if (typeof body.stock === 'string') body.stock = Number(body.stock);
    if (typeof body.isFeatured === 'string') body.isFeatured = body.isFeatured === 'true';
    if (typeof body.variants === 'string') body.variants = JSON.parse(body.variants);

    const product = await productService.updateProduct(
      req.params.id,
      body,
      req.files as Express.Multer.File[],
    );
    sendResponse(res, 200, 'Product updated', product);
  });

  static delete = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    await productService.deleteProduct(req.params.id);
    sendResponse(res, 200, 'Product deleted');
  });
}
