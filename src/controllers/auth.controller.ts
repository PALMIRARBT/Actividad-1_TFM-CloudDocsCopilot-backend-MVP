import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { registerUser, loginUser } from '../services/auth.service';
import HttpError from '../models/error.model';
import User from '../models/user.model';
import Profile from '../models/profile.model';
import jwt from 'jsonwebtoken';

/**
 * Controlador de registro de usuario
 * Valida datos requeridos, fortaleza de contraseña y registra nuevo usuario
 */
export async function register(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, email, password} = req.body;
    
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

/**
 * Controlador de inicio de sesión
 * Autentica usuario y envía token JWT en cookie HttpOnly
 */
export async function login(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;
    
    if ( !email || !password) {
      return next(new HttpError(400, 'Missing required fields'));
    }
    const result = await loginUser(req.body);
    
    // Configuración de la cookie
    const cookieOptions = {
      httpOnly: true, // La cookie no es accesible desde JavaScript del cliente
      secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' as const : 'lax' as const, // Protección CSRF
      maxAge: 24 * 60 * 60 * 1000, // 24 horas en milisegundos
      path: '/' // Cookie disponible en toda la aplicación
    };
    
    // Enviar token en cookie HttpOnly
    res.cookie('token', result.token, cookieOptions);
    
    // Devolver solo los datos del usuario, no el token
    res.json({ message: 'Login successful', user: result.user });
  } catch (err: any) {
    if (err.message === 'User not found') return next(new HttpError(404, 'Invalid credentials'));
    if (err.message === 'Invalid password') return next(new HttpError(401, 'Invalid credentials'));
    if (err.message === 'User account is not active') return next(new HttpError(403, 'Account is not active'));
    next(err);
  }
}

/**
 * Controlador de cierre de sesión
 * Limpia la cookie del token JWT
 */
export async function logout(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    // Limpiar la cookie del token
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' as const : 'lax' as const,
      path: '/'
    });
    res.json({ message: 'Logout successful' });
  } catch (err: any) {
    next(err);
  }
}


/**
 * Controlador para confirmar cuenta de usuario mediante token JWT
 * Activa el usuario si el token es válido
 */
export async function confirmAccount(req: any, res: Response, next: NextFunction) {
  try {
    const { token } = req.params;
    if (!token) {
      return next(new HttpError(400, 'Token is required'));
    }
    let payload: any;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    } catch (err) {
      return next(new HttpError(400, 'Invalid or expired token'));
    }
    const user = await User.findById(payload.userId);
    if (!user) {
      return next(new HttpError(404, 'User not found'));
    }
    if (user.active) {
      // Si el perfil no existe, crearlo
      const existingProfile = await Profile.findOne({ user: user._id });
      if (!existingProfile) {
        await Profile.create({ user: user._id, name: user.name });
      }
      res.json({ success: true, message: 'Account already confirmed' });
      return;
    }
    user.active = true;
    await user.save();
    // Crear perfil si no existe
    const existingProfile = await Profile.findOne({ user: user._id });
    if (!existingProfile) {
      await Profile.create({ user: user._id, name: user.name });
    }
    res.json({ success: true, message: 'Account confirmed successfully' });
  } catch (err) {
    next(err);
  }
}

export default { register, login, logout };
