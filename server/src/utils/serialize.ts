export function serialize(doc: any): any {
  if (!doc) return doc;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  delete obj._id; delete obj.__v; delete obj.password_hash;
  if (obj.created_at instanceof Date) obj.created_at = obj.created_at.toISOString();
  if (obj.updated_at instanceof Date) obj.updated_at = obj.updated_at.toISOString();
  if (obj.paid_at instanceof Date) obj.paid_at = obj.paid_at.toISOString();
  if (obj.processed_at instanceof Date) obj.processed_at = obj.processed_at.toISOString();
  return obj;
}
