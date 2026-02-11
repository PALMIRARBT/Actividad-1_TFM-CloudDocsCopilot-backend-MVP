import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import HttpError from '../models/error.model';
import * as commentService from '../services/comment.service';

export async function listByDocument(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { documentId } = req.params;
    if (!documentId) return next(new HttpError(400, 'documentId is required'));

    const comments = await commentService.listComments({
      documentId,
      userId: req.user!.id
    });

    res.json({ success: true, count: comments.length, comments });
  } catch (err) {
    next(err);
  }
}

export async function create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { documentId } = req.params;
    const { content } = req.body;

    if (!documentId) return next(new HttpError(400, 'documentId is required'));
    if (!content) return next(new HttpError(400, 'content is required'));

    const comment = await commentService.createComment({
      documentId,
      userId: req.user!.id,
      content
    });

    res.status(201).json({ success: true, comment });
  } catch (err) {
    next(err);
  }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!commentId) return next(new HttpError(400, 'commentId is required'));
    if (!content) return next(new HttpError(400, 'content is required'));

    const comment = await commentService.updateComment({
      commentId,
      userId: req.user!.id,
      content
    });

    res.json({ success: true, comment });
  } catch (err) {
    next(err);
  }
}

export default { listByDocument, create, update };
