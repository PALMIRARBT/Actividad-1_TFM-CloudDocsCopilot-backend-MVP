import { Response, NextFunction } from 'express';
import { confirmUserAccount } from '../services/auth.service';
import HttpError from '../models/error.model';

/**
 * Controlador dedicado para la verificación de perfil de usuario
 */
export async function verifyProfileController(req: any, res: Response, next: NextFunction): Promise<void> {
  try {
    const { token } = req.params;
    if (!token) {
      return next(new HttpError(400, 'Token is required'));
    }
    let result;
    try {
      result = await confirmUserAccount(token);
    } catch (err: any) {
      return next(new HttpError(400, err.message || 'Invalid or expired token'));
    }
    if (result.userAlreadyActive) {
      res.json({ success: true, message: 'Account already confirmed' });
      return;
    }
    res.json({ success: true, message: 'Account confirmed successfully' });
  } catch (err) {
    next(err);
  }
}

export default { verifyProfileController };
