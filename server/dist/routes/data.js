import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { tables } from '../models/index.js';
import { optionalAuth, auth } from '../middleware/auth.js';
import { serialize } from '../utils/serialize.js';
const r = Router();
const publicRead = new Set(['lawyer_categories', 'lawyers', 'lawyer_services', 'lawyer_availability', 'reviews', 'legal_content', 'profiles']);
const adminOnly = new Set(['admin_logs']);
function model(name) { return tables.get(name); }
function parseFilter(q) { const f = {}; for (const [k, v] of Object.entries(q)) {
    if (['order', 'limit', 'single', 'select', 'or'].includes(k))
        continue;
    if (String(v).startsWith('in:'))
        f[k] = { $in: String(v).slice(3).split(',') };
    else
        f[k] = v;
} if (q.or) {
    const parts = String(q.or).split(',').map((x) => { const [field, , value] = x.split('.'); return { [field]: value }; });
    f.$or = parts;
} return f; }
async function populate(table, rows) {
    const profiles = model('profiles'), cats = model('lawyer_categories'), lawyers = model('lawyers'), bookings = model('bookings');
    for (const row of rows) {
        if (table === 'lawyers') {
            row.profiles = serialize(await profiles.findOne({ id: row.user_id }));
            row.lawyer_categories = serialize(await cats.findOne({ id: row.category_id }));
        }
        if (['bookings', 'cases', 'payments', 'withdrawals', 'reviews'].includes(table) && row.lawyer_id) {
            row.lawyers = serialize(await lawyers.findOne({ id: row.lawyer_id }));
            if (row.lawyers) {
                row.lawyers.profiles = serialize(await profiles.findOne({ id: row.lawyers.user_id }));
                row.lawyers.lawyer_categories = serialize(await cats.findOne({ id: row.lawyers.category_id }));
            }
        }
        if (['bookings', 'cases'].includes(table) && row.client_id)
            row.profiles = serialize(await profiles.findOne({ id: row.client_id }));
        if (table === 'reviews' && row.client_id)
            row.profiles = serialize(await profiles.findOne({ id: row.client_id }));
        if (table === 'disputes' && row.booking_id)
            row.bookings = serialize(await bookings.findOne({ id: row.booking_id }));
    }
    return rows;
}
r.get('/:table', optionalAuth, async (req, res) => { const M = model(String(req.params.table)); if (!M)
    return res.status(404).json({ message: 'Unknown resource' }); if (!publicRead.has(String(req.params.table)) && !req.user)
    return res.status(401).json({ message: 'Authentication required' }); let q = M.find(parseFilter(req.query)); if (req.query.order) {
    const [field, dir] = String(req.query.order).split(':');
    q = q.sort({ [field]: dir === 'asc' ? 1 : -1 });
} if (req.query.limit)
    q = q.limit(Number(req.query.limit)); let docs = await q.lean(); let rows = docs.map(serialize); rows = await populate(String(req.params.table), rows); res.json({ data: rows }); });
r.post('/:table', auth, async (req, res) => { const M = model(String(req.params.table)); if (!M)
    return res.status(404).json({ message: 'Unknown resource' }); if (adminOnly.has(String(req.params.table)) && req.user.role !== 'admin')
    return res.status(403).json({ message: 'Forbidden' }); const items = Array.isArray(req.body) ? req.body : [req.body]; const now = new Date(); const created = await M.insertMany(items.map((x) => ({ ...x, id: x.id || uuid(), created_at: x.created_at || now, updated_at: now }))); res.status(201).json({ data: created.map(serialize) }); });
r.patch('/:table', auth, async (req, res) => { const M = model(String(req.params.table)); if (!M)
    return res.status(404).json({ message: 'Unknown resource' }); const filter = parseFilter(req.query); await M.updateMany(filter, { $set: { ...req.body, updated_at: new Date() } }); let rows = (await M.find(filter).lean()).map(serialize); rows = await populate(String(req.params.table), rows); res.json({ data: rows }); });
r.delete('/:table', auth, async (req, res) => { const M = model(String(req.params.table)); if (!M)
    return res.status(404).json({ message: 'Unknown resource' }); const filter = parseFilter(req.query); await M.deleteMany(filter); res.json({ data: [] }); });
export default r;
