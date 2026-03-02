import { Request, Response } from 'express';
import { AddressService } from './address.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendResponse } from '../../common/responseFormatter.js';

const addressService = new AddressService();

export class AddressController {
  static getAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const addresses = await addressService.getUserAddresses(String(req.user!._id));
    sendResponse(res, 200, 'Addresses retrieved', addresses);
  });

  static create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const address = await addressService.createAddress(String(req.user!._id), req.body);
    sendResponse(res, 201, 'Address created', address);
  });

  static update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const address = await addressService.updateAddress(req.params.id as string, String(req.user!._id), req.body);
    sendResponse(res, 200, 'Address updated', address);
  });

  static delete = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    await addressService.deleteAddress(req.params.id as string, String(req.user!._id));
    sendResponse(res, 200, 'Address deleted');
  });

  static setDefault = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const address = await addressService.setDefault(req.params.id as string, String(req.user!._id));
    sendResponse(res, 200, 'Default address set', address);
  });
}
