import type { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { User } from '../modules/user/user.model.js';
import { logger } from '../utils/logger.js';

interface JwtPayload {
  userId: string;
  role: string;
  tokenVersion: number;
}

export async function socketAuthMiddleware(
  socket: Socket,
  next: (err?: Error) => void,
): Promise<void> {
  try {
    const token = socket.handshake.auth.token as string | undefined;
    if (!token) {
      return next(new Error('Authentication required'));
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, config.accessSecret) as JwtPayload;
    } catch {
      return next(new Error('Invalid or expired token'));
    }

    if (!decoded.userId) {
      return next(new Error('Invalid token payload'));
    }

    // Lean query — only select fields needed for socket handlers
    const user = await User.findById(decoded.userId)
      .select('_id role isDeleted name tokenVersion')
      .lean();

    if (!user) {
      return next(new Error('User not found'));
    }

    if (user.isDeleted) {
      return next(new Error('Account has been deactivated'));
    }

    // Check tokenVersion for forced logout
    if (decoded.tokenVersion !== user.tokenVersion) {
      return next(new Error('Token has been invalidated'));
    }

    // Attach to socket.data for use in handlers
    socket.data.userId = user._id.toString();
    socket.data.userRole = user.role;
    socket.data.userName = user.name;

    next();
  } catch (error) {
    logger.error({ err: error }, 'Socket auth error');
    next(new Error('Authentication failed'));
  }
}
