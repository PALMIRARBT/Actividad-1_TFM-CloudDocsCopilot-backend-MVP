import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { registerUser } from '../services/auth.service';
import HttpError from '../models/error.model';

/**
 * Controlador dedicado para el registro de usuario
 */
export async function registerUserController(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return next(new HttpError(400, 'Missing required fields (name, email, password)'));
    }
    const user = await registerUser(req.body);
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (err: any) {
    if (err.message && err.message.includes('duplicate key')) {
      return next(new HttpError(409, 'Email already registered'));
    }
    if (err.message && err.message.includes('Invalid email format')) {
      return next(new HttpError(400, 'Invalid email format'));
    }
    if (err.message && err.message.includes('Name must contain only alphanumeric characters and spaces')) {
      return next(new HttpError(400, 'Invalid name format'));
    }
    if (err.message && err.message.includes('Password validation failed')) {
      return next(new HttpError(400, err.message));
    }
    next(err);
  }
}

export default { registerUserController };
