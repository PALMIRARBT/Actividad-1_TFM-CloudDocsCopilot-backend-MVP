import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IProfile extends Document {
  user: Types.ObjectId;
  name: string;
  createdAt: Date;
}

const profileSchema = new Schema<IProfile>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IProfile>('Profile', profileSchema);
