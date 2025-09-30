import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export async function registerUser({ name, email, password }) {
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed });
  return user;
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ email });
  if (!user) throw new Error('User not found');
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error('Invalid password');
  const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
  return { token, user };
}

export async function updateUser(id, { name, email, password }) {
  const update = { name, email };
  if (password) {
    update.password = await bcrypt.hash(password, 10);
  }
  const user = await User.findByIdAndUpdate(id, update, { new: true });
  if (!user) throw new Error('Usuario no encontrado');
  return user;
}
