import { registerUser, loginUser, updateUser } from '../services/auth.service.js';

export async function register(req, res) {
  try {
    const user = await registerUser(req.body);
    res.status(201).json({ message: 'User registered', user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function login(req, res) {
  try {
    const result = await loginUser(req.body);
    res.json(result);
  } catch (err) {
    const status = err.message === 'User not found' ? 404 : 401;
    res.status(status).json({ error: err.message });
  }
}

export async function update(req, res) {
  try {
    const user = await updateUser(req.params.id, req.body);
    res.json({ message: 'Usuario actualizado', user });
  } catch (err) {
    const status = err.message === 'Usuario no encontrado' ? 404 : 400;
    res.status(status).json({ error: err.message });
  }
}
