import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
<<<<<<< HEAD
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  confirmed: { type: Boolean, default: false }
=======
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
>>>>>>> 371a0164161d43049b5681c35ea1fd04705f0998
});

export default mongoose.model('User', userSchema);