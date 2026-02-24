import { Request, Response } from 'express';
import { UserService } from './user.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendResponse, sendPaginatedResponse } from '../../common/responseFormatter.js';

const userService = new UserService();

export class UserController {
  static getProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = await userService.getProfile(req.user!._id as string);
    sendResponse(res, 200, 'Profile retrieved', user);
  });

  static updateProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = await userService.updateProfile(req.user!._id as string, req.body);
    sendResponse(res, 200, 'Profile updated', user);
  });

  static listUsers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { users, pagination } = await userService.listUsers(req.query as Record<string, string>);
    sendPaginatedResponse(res, 'Users retrieved', users, pagination);
  });

  static updateRole = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = await userService.updateRole(
      req.params.id,
      req.body.role,
      req.user!._id as string,
    );
    sendResponse(res, 200, 'Role updated', user);
  });

  static deleteUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    await userService.softDeleteUser(req.params.id, req.user!._id as string);
    sendResponse(res, 200, 'User deleted');
  });
}
