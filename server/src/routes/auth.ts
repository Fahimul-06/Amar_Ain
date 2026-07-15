import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import { User, tables } from '../models/index.js';
import { env } from '../config/env.js';
import { auth } from '../middleware/auth.js';
import { serialize } from '../utils/serialize.js';
const r = Router();
const tokenFor = (u:any) => jwt.sign({ id:u.id, role:u.role, email:u.email, phone:u.phone }, env.jwtSecret, { expiresIn:'7d' });

r.post('/register', async (req,res) => {
  const { email, password, full_name, phone, role='client' } = req.body;
  if (!email || !password || !full_name) return res.status(400).json({ message:'Email, password and full name are required' });
  if (await User.findOne({ email: email.toLowerCase() })) return res.status(409).json({ message:'Email already registered' });
  const id=uuid(); const now=new Date();
  const user=await User.create({ id,email,password_hash:await bcrypt.hash(password,12),full_name,phone:phone||undefined,role,created_at:now,updated_at:now });
  await tables.get('profiles')!.create({ id,full_name,phone:phone||null,phone_verified:false,avatar_url:null,role,location:null,bio:null,is_active:true,created_at:now,updated_at:now });
  res.status(201).json({ user:serialize(user), token:tokenFor(user) });
});
r.post('/login', async(req,res)=>{
  const {email,password}=req.body; const user=await User.findOne({email:String(email||'').toLowerCase()});
  if(!user || !(await bcrypt.compare(password||'',user.password_hash))) return res.status(401).json({message:'Invalid email or password'});
  if(!user.is_active) return res.status(403).json({message:'Account is disabled'});
  res.json({user:serialize(user),token:tokenFor(user)});
});
r.post('/phone/request', async(req,res)=>{ const {phone}=req.body; if(!phone) return res.status(400).json({message:'Phone required'}); res.json({message:'Development OTP generated', otp: process.env.NODE_ENV==='production'?undefined:'123456'}); });
r.post('/phone/verify', async(req,res)=>{
 const {phone,token}=req.body; if(token!=='123456') return res.status(400).json({message:'Invalid OTP'});
 let user=await User.findOne({phone}); if(!user){const id=uuid(),now=new Date(); user=await User.create({id,phone,role:'client',full_name:'',created_at:now,updated_at:now}); await tables.get('profiles')!.create({id,full_name:'',phone,phone_verified:true,role:'client',is_active:true,created_at:now,updated_at:now});}
 res.json({user:serialize(user),token:tokenFor(user)});
});
r.get('/me',auth,async(req,res)=>{const user=await User.findOne({id:req.user!.id}); if(!user)return res.status(404).json({message:'User not found'});res.json({user:serialize(user)});});
export default r;
