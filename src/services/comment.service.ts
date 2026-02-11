import mongoose from 'mongoose';
import HttpError from '../models/error.model';
import CommentModel, { IComment } from '../models/comment.model';
import DocumentModel from '../models/document.model';
import { hasActiveMembership } from './membership.service';

function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

async function assertCanReadDocument(userId: string, docId: string) {
  if (!isValidObjectId(docId)) throw new HttpError(400, 'Invalid document ID');

  const doc = await DocumentModel.findById(docId);
  if (!doc) throw new HttpError(404, 'Document not found');

  let hasAccess = false;

  if (doc.organization) {
    hasAccess = await hasActiveMembership(userId, doc.organization.toString());
  } else {
    hasAccess =
      doc.uploadedBy.toString() === userId.toString() ||
      doc.sharedWith?.some((id: any) => id.toString() === userId.toString());
  }

  if (!hasAccess) throw new HttpError(403, 'Access denied to this document');
  return doc;
}

export interface CreateCommentDto {
  documentId: string;
  userId: string;
  content: string;
}

export interface UpdateCommentDto {
  commentId: string;
  userId: string;
  content: string;
}

export interface ListCommentsDto {
  documentId: string;
  userId: string;
}

export async function createComment({
  documentId,
  userId,
  content
}: CreateCommentDto): Promise<IComment> {
  if (!content || !content.trim()) throw new HttpError(400, 'content is required');

  const doc = await assertCanReadDocument(userId, documentId);

  const created = await CommentModel.create({
    document: new mongoose.Types.ObjectId(documentId),
    organization: doc.organization ?? null,
    createdBy: new mongoose.Types.ObjectId(userId),
    content: content.trim()
  });

  return created;
}

export async function updateComment({
  commentId,
  userId,
  content
}: UpdateCommentDto): Promise<IComment> {
  if (!isValidObjectId(commentId)) throw new HttpError(400, 'Invalid comment ID');
  if (!content || !content.trim()) throw new HttpError(400, 'content is required');

  const comment = await CommentModel.findById(commentId);
  if (!comment) throw new HttpError(404, 'Comment not found');

  // Must still have read access to the doc to edit your comment
  await assertCanReadDocument(userId, comment.document.toString());

  // Only author can edit (as requested)
  if (comment.createdBy.toString() !== userId.toString()) {
    throw new HttpError(403, 'You can only edit your own comments');
  }

  comment.content = content.trim();
  await comment.save();

  return comment;
}

export async function listComments({ documentId, userId }: ListCommentsDto): Promise<IComment[]> {
  await assertCanReadDocument(userId, documentId);

  return CommentModel.find({ document: new mongoose.Types.ObjectId(documentId) })
    .sort({ createdAt: -1 })
    .populate('createdBy', 'name email avatar');
}

export default {
  createComment,
  updateComment,
  listComments
};
