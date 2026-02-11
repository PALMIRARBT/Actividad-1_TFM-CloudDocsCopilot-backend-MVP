import mongoose, { Schema, Document as MongooseDocument, Model, Types } from 'mongoose';

export interface IComment extends MongooseDocument {
  document: Types.ObjectId;
  organization?: Types.ObjectId | null;
  createdBy: Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    document: {
      type: Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
      index: true
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: false,
      default: null,
      index: true
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    content: {
      type: String,
      required: [true, 'El contenido del comentario es obligatorio'],
      trim: true,
      maxlength: [5000, 'Comentario no puede exceder 5000 caracteres']
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret) => {
        delete ret._id;
        return ret;
      }
    },
    toObject: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret) => {
        delete ret._id;
        return ret;
      }
    }
  }
);

commentSchema.index({ document: 1, createdAt: -1 });
commentSchema.index({ organization: 1, createdAt: -1 });

const CommentModel: Model<IComment> = mongoose.model<IComment>('Comment', commentSchema);
export default CommentModel;
