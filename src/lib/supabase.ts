const API_URL = (import.meta.env.VITE_API_URL as string) || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

type AuthUser = { id: string; email?: string | null; phone?: string | null; role?: string };
type Session = { user: AuthUser; access_token: string };
type AuthListener = (event: string, session: Session | null) => void;

const listeners = new Set<AuthListener>();
function currentSession(): Session | null {
  try { return JSON.parse(localStorage.getItem('amar_ain_session') || 'null'); } catch { return null; }
}
function saveSession(session: Session | null) {
  if (session) localStorage.setItem('amar_ain_session', JSON.stringify(session));
  else localStorage.removeItem('amar_ain_session');
  listeners.forEach(fn => fn(session ? 'SIGNED_IN' : 'SIGNED_OUT', session));
}
async function request(path: string, init: RequestInit = {}) {
  const session = currentSession();
  const headers = new Headers(init.headers || {});
  headers.set('Content-Type', 'application/json');
  if (session?.access_token) headers.set('Authorization', `Bearer ${session.access_token}`);
  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || 'Request failed');
  return body;
}

class QueryBuilder {
  private filters: Record<string,string> = {};
  private orderBy?: string;
  private max?: number;
  private operation: 'select'|'insert'|'update'|'delete' = 'select';
  private payload: any;
  private singleMode = false;
  constructor(private table: string) {}
  select(_columns='*') { return this; }
  insert(payload:any) { this.operation='insert'; this.payload=payload; return this; }
  update(payload:any) { this.operation='update'; this.payload=payload; return this; }
  delete() { this.operation='delete'; return this; }
  eq(field:string,value:any) { this.filters[field]=String(value); return this; }
  in(field:string,values:any[]) { this.filters[field]=`in:${values.join(',')}`; return this; }
  or(value:string) { this.filters.or=value; return this; }
  order(field:string,opts?:{ascending?:boolean}) { this.orderBy=`${field}:${opts?.ascending===false?'desc':'asc'}`; return this; }
  limit(n:number) { this.max=n; return this; }
  maybeSingle() { this.singleMode=true; return this.execute(); }
  single() { this.singleMode=true; return this.execute(); }
  then(resolve:any,reject:any) { return this.execute().then(resolve,reject); }
  private async execute() {
    try {
      const q = new URLSearchParams(this.filters);
      if (this.orderBy) q.set('order',this.orderBy);
      if (this.max) q.set('limit',String(this.max));
      let body:any;
      if (this.operation==='select') body=await request(`/data/${this.table}?${q}`);
      if (this.operation==='insert') body=await request(`/data/${this.table}`,{method:'POST',body:JSON.stringify(this.payload)});
      if (this.operation==='update') body=await request(`/data/${this.table}?${q}`,{method:'PATCH',body:JSON.stringify(this.payload)});
      if (this.operation==='delete') body=await request(`/data/${this.table}?${q}`,{method:'DELETE'});
      const rows=body?.data ?? [];
      return { data: this.singleMode ? (rows[0] ?? null) : rows, error: null };
    } catch (e:any) { return { data: this.singleMode ? null : [], error: { message:e.message } }; }
  }
}

export const supabase: any = {
  from(table:string) { return new QueryBuilder(table); },
  auth: {
    async getSession() { return { data: { session: currentSession() } }; },
    onAuthStateChange(callback:AuthListener) { listeners.add(callback); return { data:{ subscription:{ unsubscribe:()=>listeners.delete(callback) } } }; },
    async signUp({email,password,options}:{email:string;password:string;options?:{data?:any}}) {
      try { const body=await request('/auth/register',{method:'POST',body:JSON.stringify({email,password,full_name:options?.data?.full_name,phone:options?.data?.phone,role:options?.data?.role})}); const session={user:body.user,access_token:body.token}; saveSession(session); return {data:{user:body.user,session},error:null}; } catch(e:any){return {data:{user:null,session:null},error:{message:e.message}};}
    },
    async signInWithPassword({email,password}:{email:string;password:string}) { try { const body=await request('/auth/login',{method:'POST',body:JSON.stringify({email,password})}); const session={user:body.user,access_token:body.token}; saveSession(session); return {data:{session,user:body.user},error:null}; } catch(e:any){return {data:{session:null,user:null},error:{message:e.message}};} },
    async signInWithOtp({phone}:{phone:string}) { try { await request('/auth/phone/request',{method:'POST',body:JSON.stringify({phone})}); return {data:{},error:null}; } catch(e:any){return {data:{},error:{message:e.message}};} },
    async verifyOtp({phone,token}:{phone:string;token:string;type:string}) { try { const body=await request('/auth/phone/verify',{method:'POST',body:JSON.stringify({phone,token})}); const session={user:body.user,access_token:body.token}; saveSession(session); return {data:{session,user:body.user},error:null}; } catch(e:any){return {data:{session:null,user:null},error:{message:e.message}};} },
    async signOut() { saveSession(null); return {error:null}; }
  }
};

export type Profile = {
  id: string;
  full_name: string;
  phone: string | null;
  phone_verified: boolean;
  avatar_url: string | null;
  role: 'client' | 'lawyer' | 'admin';
  location: string | null;
  bio: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type LawyerCategory = {
  id: string;
  name: string;
  name_bn: string | null;
  description: string | null;
  icon: string | null;
};

export type Lawyer = {
  id: string;
  user_id: string;
  category_id: string | null;
  bar_id: string | null;
  bar_council_verified: boolean;
  experience_years: number;
  consultation_fee: number;
  currency: string;
  languages: string[];
  office_address: string | null;
  rating: number;
  rating_count: number;
  total_earnings: number;
  available_balance: number;
  status: 'pending' | 'verified' | 'suspended' | 'rejected';
  verification_doc_url: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields (present when fetched with select)
  profiles?: Profile | null;
  lawyer_categories?: LawyerCategory | null;
};

export type LawyerService = {
  id: string;
  lawyer_id: string;
  type: 'text' | 'phone' | 'audio' | 'video' | 'in_person' | 'document_drafting';
  title: string;
  description: string | null;
  fee: number;
  duration_minutes: number;
  is_active: boolean;
};

export type Booking = {
  id: string;
  client_id: string;
  lawyer_id: string;
  service_id: string | null;
  type: 'text' | 'phone' | 'audio' | 'video' | 'in_person' | 'document_drafting';
  scheduled_at: string;
  duration_minutes: number;
  fee: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'disputed' | 'no_show';
  topic: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Payment = {
  id: string;
  booking_id: string;
  client_id: string;
  lawyer_id: string;
  amount: number;
  platform_commission: number;
  lawyer_payout: number;
  method: 'sslcommerz' | 'bkash' | 'nagad' | 'card';
  transaction_id: string | null;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  paid_at: string | null;
  created_at: string;
};

export type LegalCase = {
  id: string;
  booking_id: string | null;
  client_id: string;
  lawyer_id: string;
  title: string;
  case_number: string | null;
  description: string | null;
  status: 'open' | 'in_progress' | 'closed' | 'on_hold';
  created_at: string;
  updated_at: string;
};

export type CaseDocument = {
  id: string;
  case_id: string;
  uploaded_by: string;
  file_name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  description: string | null;
  created_at: string;
};

export type Message = {
  id: string;
  booking_id: string | null;
  sender_id: string;
  receiver_id: string;
  body: string;
  attachment_url: string | null;
  read_at: string | null;
  created_at: string;
};

export type Review = {
  id: string;
  booking_id: string;
  client_id: string;
  lawyer_id: string;
  rating: number;
  comment: string | null;
  is_published: boolean;
  created_at: string;
};

export type LegalContent = {
  id: string;
  title: string;
  title_bn: string | null;
  body: string;
  category: string | null;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  author_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Dispute = {
  id: string;
  booking_id: string;
  raised_by: string;
  reason: string;
  description: string | null;
  status: 'open' | 'under_review' | 'resolved' | 'rejected';
  resolution: string | null;
  resolved_by: string | null;
  created_at: string;
  updated_at: string;
};

export type Withdrawal = {
  id: string;
  lawyer_id: string;
  amount: number;
  method: 'bkash' | 'nagad' | 'bank' | 'sslcommerz';
  account: string | null;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  processed_by: string | null;
  created_at: string;
  processed_at: string | null;
};

export type Subscription = {
  id: string;
  user_id: string;
  plan: 'free' | 'pro' | 'premium';
  status: 'active' | 'cancelled' | 'expired';
  started_at: string;
  ends_at: string | null;
  created_at: string;
};
