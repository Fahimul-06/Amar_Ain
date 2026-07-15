import mongoose, { Schema } from 'mongoose';

const base = { id: { type: String, required: true, unique: true, index: true }, created_at: { type: Date, default: Date.now }, updated_at: { type: Date, default: Date.now } };
const flexible = (name: string) => mongoose.models[name] || mongoose.model(name, new Schema(base, { strict: false, collection: name, minimize: false }));

export const User = mongoose.models.users || mongoose.model('users', new Schema({
  ...base, email: { type: String, unique: true, sparse: true, lowercase: true, trim: true }, phone: { type: String, unique: true, sparse: true }, password_hash: String, role: { type: String, enum: ['client','lawyer','admin'], default: 'client' }, full_name: String, is_active: { type: Boolean, default: true }
}, { collection: 'users' }));

export const tables = new Map<string, mongoose.Model<any>>();
['profiles','lawyer_categories','lawyers','lawyer_services','lawyer_availability','bookings','payments','cases','case_documents','messages','reviews','legal_content','disputes','withdrawals','subscriptions','admin_logs'].forEach(n => tables.set(n, flexible(n)));
