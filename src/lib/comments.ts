import { createHmac } from 'node:crypto';
import { MongoClient, ObjectId, type Collection, type Db } from 'mongodb';
import type { ReaderComment } from '@amigos-da-cruz/adc-design-system';

interface StoredComment {
  _id: ObjectId;
  articleId: string;
  articleSlug: string;
  articleTitle: string;
  parentId: ObjectId | null;
  name: string;
  message: string;
  createdAt: Date;
  authorRole: 'reader' | 'editor';
  status: 'published' | 'hidden';
}

let clientPromise: Promise<MongoClient> | undefined;

export function commentsConfigured(): boolean {
  return Boolean(import.meta.env.MONGODB_URI && import.meta.env.MONGODB_DB && import.meta.env.TURNSTILE_SECRET_KEY && import.meta.env.PUBLIC_TURNSTILE_SITE_KEY);
}

async function database(): Promise<Db> {
  const uri = import.meta.env.MONGODB_URI;
  const dbName = import.meta.env.MONGODB_DB;
  if (!uri || !dbName) throw new Error('MongoDB não configurado');
  clientPromise ??= new MongoClient(uri, { maxPoolSize: 5 }).connect().catch((error) => {
    clientPromise = undefined;
    throw error;
  });
  const client = await clientPromise;
  return client.db(dbName);
}

async function collection(): Promise<Collection<StoredComment>> {
  return (await database()).collection<StoredComment>('comments');
}

function present(comment: StoredComment): ReaderComment {
  return {
    id: comment._id.toHexString(),
    parentId: comment.parentId?.toHexString() ?? null,
    name: comment.status === 'hidden' ? '' : comment.name,
    message: comment.status === 'hidden' ? '' : comment.message,
    createdAt: comment.createdAt.toISOString(),
    authorRole: comment.authorRole,
    status: comment.status,
  };
}

export async function listArticleComments(articleId: string): Promise<ReaderComment[]> {
  const db = await collection();
  const rows = await db.find({ articleId }).sort({ createdAt: 1 }).limit(300).toArray();
  return rows.map(present);
}

export function visitorHash(address: string): string {
  const secret = import.meta.env.TURNSTILE_SECRET_KEY!;
  return createHmac('sha256', secret).update(address).digest('hex');
}

export async function tooManyComments(ipHash: string): Promise<boolean> {
  const db = await database();
  const rate = db.collection<{ _id: string; count: number; expiresAt: Date }>('comment_rate_limits');
  await rate.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  const bucket = Math.floor(Date.now() / (10 * 60_000));
  const id = ipHash + ':' + bucket;
  const result = await rate.findOneAndUpdate(
    { _id: id },
    { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date((bucket + 1) * 10 * 60_000) } },
    { upsert: true, returnDocument: 'after' },
  );
  return (result?.count ?? 0) > 5;
}
export async function createComment(input: {
  articleId: string;
  articleSlug: string;
  articleTitle: string;
  parentId: string | null;
  name: string;
  message: string;
}): Promise<ReaderComment> {
  const db = await collection();
  const parentObjectId = input.parentId && ObjectId.isValid(input.parentId) ? new ObjectId(input.parentId) : null;
  if (input.parentId && !parentObjectId) throw new Error('Resposta inválida');
  if (parentObjectId) {
    const parent = await db.findOne({ _id: parentObjectId, articleId: input.articleId, status: 'published' });
    if (!parent) throw new Error('Comentário original indisponível');
  }
  const row: StoredComment = {
    _id: new ObjectId(),
    articleId: input.articleId,
    articleSlug: input.articleSlug,
    articleTitle: input.articleTitle,
    parentId: parentObjectId,
    name: input.name,
    message: input.message,
    createdAt: new Date(),
    authorRole: 'reader',
    status: 'published',
  };
  await db.insertOne(row);
  return present(row);
}
