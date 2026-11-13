import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import admin from 'firebase-admin';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const app = express();
const production = process.env.NODE_ENV === 'production';

function getMultilineCredential() {
  const raw = fs.existsSync(path.join(root, '.env')) ? fs.readFileSync(path.join(root, '.env'), 'utf8') : '';
  const match = raw.match(/(?:^|\n)\s*serviceAccountKey\s*=\s*/i);
  if (!match) return null;
  const start = match.index + match[0].length;
  const rest = raw.slice(start).trimStart();
  if (!rest.startsWith('{')) return null;
  let depth = 0, inString = false, escaped = false;
  for (let i = 0; i < rest.length; i++) {
    const c = rest[i];
    if (inString) { if (escaped) escaped = false; else if (c === '\\') escaped = true; else if (c === '"') inString = false; continue; }
    if (c === '"') inString = true;
    else if (c === '{') depth++;
    else if (c === '}' && --depth === 0) return JSON.parse(rest.slice(0, i + 1));
  }
  return null;
}

function initFirebase() {
  if (admin.apps.length) return admin.firestore();
  const account = process.env.FIREBASE_SERVICE_ACCOUNT_JSON ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON) : getMultilineCredential();
  if (account?.client_email && account.private_key) admin.initializeApp({ credential: admin.credential.cert(account), projectId: process.env.FIREBASE_PROJECT_ID || account.project_id });
  else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) admin.initializeApp({ credential: admin.credential.applicationDefault(), projectId: process.env.FIREBASE_PROJECT_ID });
  else throw new Error('Firebase credentials missing. Set serviceAccountKey in .env or GOOGLE_APPLICATION_CREDENTIALS.');
  return admin.firestore();
}

let db;
try { db = initFirebase(); }
catch (error) { console.error(error.message); process.exit(1); }
let databaseReady = false;
if (!process.env.ADMIN_EMAIL) { console.error('Set ADMIN_EMAIL in .env to enable protected store administration.'); process.exit(1); }
if (!process.env.SESSION_SECRET) { console.error('Set SESSION_SECRET in .env (use a random secret of at least 32 characters).'); process.exit(1); }
if ((process.env.SESSION_SECRET || '').length < 32) { console.error('SESSION_SECRET must contain at least 32 characters.'); process.exit(1); }
const adminEmail = process.env.ADMIN_EMAIL.trim().toLowerCase();
const collection = name => db.collection(name);
const loginTimingHash = await bcrypt.hash(randomBytes(24).toString('hex'), 12);
const productSeed = [
  { id:'p1', name:'Apex 5″ Freestyle Frame', category:'Frames', price:89500, oldPrice:110000, tag:'PILOT PICK', symbol:'⬡', rating:'4.9', reviews:18, stock:12, color:'#f0f3eb', image:'https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=700&q=80' },
  { id:'p2', name:'2207.5 1950KV Brushless Motor', category:'Motors', price:63200, tag:'BEST SELLER', symbol:'◉', rating:'4.8', reviews:12, stock:24, color:'#f1f3f5', image:'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=700&q=80' },
  { id:'p3', name:'F405 Stack · 55A 4-in-1 ESC', category:'Electronics', price:184500, tag:'NEW', symbol:'▦', rating:'5.0', reviews:7, stock:8, color:'#f1f1ee', image:'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=700&q=80' },
  { id:'p4', name:'Walksnail Avatar HD VTX Kit', category:'Video', price:438000, oldPrice:479000, tag:'FLY DIFFERENT', symbol:'◎', rating:'4.9', reviews:23, stock:6, color:'#f2f1ef', image:'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=700&q=80' },
  { id:'p5', name:'6S 1300mAh LiPo · 120C', category:'Batteries', price:119000, tag:'PAD READY', symbol:'▰', rating:'4.7', reviews:9, stock:0, color:'#f5efe8', image:'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=700&q=80' },
  { id:'p6', name:'M10 GPS Module · Compass', category:'Electronics', price:76500, tag:'SMART PICK', symbol:'⌁', rating:'4.8', reviews:11, stock:15, color:'#eff2ea', image:'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=700&q=80' }
];

cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET, secure: true });
app.disable('x-powered-by');
app.set('trust proxy', process.env.TRUST_PROXY === '1' ? 1 : false);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' }, contentSecurityPolicy: { directives: { ...helmet.contentSecurityPolicy.getDefaultDirectives(), "img-src": ["'self'", 'data:', 'https://res.cloudinary.com', 'https://images.unsplash.com'], "script-src": ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'], "style-src": ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'], "font-src": ["'self'", 'https://fonts.gstatic.com', 'data:'] } } }));
app.use(express.json({ limit: '200kb' }));
app.use((req, res, next) => {
  const origin = req.get('origin');
  const allowed = process.env.APP_ORIGIN;
  if (origin && allowed && origin !== allowed) return res.status(403).json({ error: 'Origin not allowed.' });
  if (['POST','PUT','PATCH','DELETE'].includes(req.method) && origin && !allowed && production) return res.status(403).json({ error: 'Set APP_ORIGIN before production launch.' });
  next();
});
app.use(express.static(path.join(root, 'dist'), { index: false, maxAge: production ? '1h' : 0 }));

const authLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 12, standardHeaders: 'draft-7', legacyHeaders: false, message: { error: 'Too many attempts. Try again in 15 minutes.' } });
const checkoutLimit = rateLimit({ windowMs: 60 * 60 * 1000, limit: 20, standardHeaders: 'draft-7', legacyHeaders: false });
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 3 * 1024 * 1024, files: 1 }, fileFilter: (_req, file, cb) => cb(null, ['image/jpeg','image/png','image/webp'].includes(file.mimetype)) });
const hash = value => createHash('sha256').update(value).digest('hex');
const safeEqual = (a, b) => { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && timingSafeEqual(x,y); };
function setSession(res, user) { const token = jwt.sign({ sub: user.id, email: user.email }, process.env.SESSION_SECRET, { algorithm:'HS256', expiresIn: '7d', issuer: 'julesfpv' }); res.cookie('jfpv_session', token, { httpOnly: true, secure: production, sameSite: 'lax', maxAge: 7*24*60*60*1000, path: '/' }); }
function auth(req,res,next) { try { const t=req.cookies?.jfpv_session || req.get('authorization')?.replace(/^Bearer\s+/i,''); if(!t) return res.status(401).json({error:'Sign in to continue.'}); req.user=jwt.verify(t,process.env.SESSION_SECRET,{issuer:'julesfpv',algorithms:['HS256']}); req.isAdmin=req.user.email.toLowerCase()===adminEmail; next(); } catch { res.clearCookie('jfpv_session',{path:'/'}); return res.status(401).json({error:'Your session has expired. Sign in again.'}); } }
function adminOnly(req,res,next) { if(!req.isAdmin) return res.status(403).json({error:'Admin access required.'}); next(); }
function getCookie(req,name){const raw=req.headers.cookie||'';const m=raw.match(new RegExp('(?:^|;\\s*)'+name+'=([^;]+)'));return m?decodeURIComponent(m[1]):null}
app.use((req,_res,next)=>{req.cookies={jfpv_session:getCookie(req,'jfpv_session')};next()});
function userView(user,isAdmin=false){return{id:user.id,email:user.email,name:user.name||'',admin:isAdmin}}
function emailValid(email){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)&&email.length<=254}
function safeProduct(data){const allowed=['Frames','Motors','Electronics','Video','Batteries'];const name=String(data.name||'').trim();const price=Number(data.price);const stock=Number(data.stock);if(name.length<2||name.length>120||!allowed.includes(data.category)||!Number.isSafeInteger(price)||price<1||price>100000000||!Number.isSafeInteger(stock)||stock<0||stock>100000)return null;return{name,category:data.category,price,stock,tag:String(data.tag||'NEW').slice(0,32),image:String(data.image||'').slice(0,800),color:String(data.color||'#f1f3f1').slice(0,20),symbol:String(data.symbol||'✳').slice(0,8),rating:'5.0',reviews:0,updatedAt:new Date().toISOString()}}
async function ensureSeed(){const snap=await collection('products').limit(1).get();if(snap.empty){const batch=db.batch();productSeed.forEach(p=>batch.set(collection('products').doc(p.id),p));await batch.commit()}databaseReady=true}
async function uploadProof(file){if(!process.env.CLOUDINARY_CLOUD_NAME||!process.env.CLOUDINARY_API_KEY||!process.env.CLOUDINARY_API_SECRET)throw new Error('Image storage is not configured.');const detected=file.buffer.subarray(0,12).toString('hex');const valid=detected.startsWith('ffd8ff')||detected.startsWith('89504e470d0a1a0a')||detected.startsWith('52494646')&&file.buffer.subarray(8,12).toString()==='WEBP';if(!valid)throw new Error('Payment proof must be a valid JPEG, PNG, or WebP image.');return new Promise((resolve,reject)=>{const stream=cloudinary.uploader.upload_stream({folder:'julesfpv/payment-proofs',resource_type:'image',type:'authenticated',format:'webp',transformation:[{width:1400,height:1400,crop:'limit',quality:'auto'}]},(err,result)=>err?reject(err):resolve(result));stream.end(file.buffer)})}

app.get('/api/health',(_req,res)=>res.status(databaseReady?200:503).json({ok:true,databaseReady}));
app.get('/api/config',(_req,res)=>res.json({paymentInstructions:process.env.PAYMENT_INSTRUCTIONS||'After submitting your order, contact us to receive the Mobile Money payment details.'}));
app.post('/api/auth/register',authLimit,async(req,res,next)=>{try{const name=String(req.body.name||'').trim(),email=String(req.body.email||'').trim().toLowerCase(),password=String(req.body.password||'');if(name.length<2||name.length>80||!emailValid(email)||password.length<10||password.length>128)return res.status(400).json({error:'Enter a valid name and email. Password must be at least 10 characters.'});const id=hash(email),ref=collection('users').doc(id);if((await ref.get()).exists)return res.status(409).json({error:'An account already exists for this email.'});const user={id,email,name,passwordHash:await bcrypt.hash(password,12),createdAt:new Date().toISOString()};await ref.create(user);setSession(res,user);res.status(201).json({user:userView(user,email===adminEmail)});}catch(e){next(e)}});
app.post('/api/auth/login',authLimit,async(req,res,next)=>{try{const email=String(req.body.email||'').trim().toLowerCase(),password=String(req.body.password||'');if(!emailValid(email)||!password||password.length>128)return res.status(400).json({error:'Enter a valid email and password.'});const snap=await collection('users').doc(hash(email)).get();const user=snap.exists?snap.data():null;const verified=await bcrypt.compare(password,user?.passwordHash||loginTimingHash);if(!user||!verified)return res.status(401).json({error:'Email or password is incorrect.'});setSession(res,user);res.json({user:userView(user,email===adminEmail)});}catch(e){next(e)}});
app.post('/api/auth/logout',(req,res)=>{res.clearCookie('jfpv_session',{httpOnly:true,secure:production,sameSite:'lax',path:'/'});res.json({ok:true})});
app.get('/api/auth/me',auth,(req,res)=>res.json({user:{id:req.user.sub,email:req.user.email,admin:req.isAdmin}}));
app.get('/api/products',async(_req,res,next)=>{try{await ensureSeed();const snap=await collection('products').get();res.json({products:snap.docs.map(d=>d.data())})}catch(e){next(e)}});
app.post('/api/orders',auth,checkoutLimit,upload.single('proof'),async(req,res,next)=>{try{const {name,email,phone,address,fulfillment,items:itemsJson}=req.body;let requested;try{requested=JSON.parse(itemsJson||'[]')}catch{return res.status(400).json({error:'Invalid cart.'})}if(!req.file)return res.status(400).json({error:'Add a screenshot of your payment.'});if(!String(name||'').trim()||!emailValid(String(email||''))||!String(phone||'').trim()||!['delivery','pickup'].includes(fulfillment)||(fulfillment==='delivery'&&!String(address||'').trim()))return res.status(400).json({error:'Complete your contact details and choose delivery or pickup.'});if(!Array.isArray(requested)||requested.length<1||requested.length>30)return res.status(400).json({error:'Your cart is empty or too large.'});const ids=[...new Set(requested.map(x=>String(x.id||'')))];if(ids.length!==requested.length)return res.status(400).json({error:'Invalid cart items.'});const snap=await db.getAll(...ids.map(id=>collection('products').doc(id)));const byId=new Map(snap.filter(d=>d.exists).map(d=>[d.id,d.data()]));let total=0;const items=[];for(const row of requested){const p=byId.get(row.id),qty=Number(row.qty);if(!p||!Number.isSafeInteger(qty)||qty<1||qty>100||p.stock<qty)return res.status(409).json({error:`${p?.name||'A product'} is unavailable in the requested quantity.`});total+=p.price*qty;items.push({id:row.id,name:p.name,price:p.price,qty})}if(!Number.isSafeInteger(total))return res.status(400).json({error:'Invalid order total.'});const proof=await uploadProof(req.file);const id='JFP-'+randomBytes(4).toString('hex').toUpperCase();const order={id,name:String(name).trim().slice(0,100),email:String(email).trim().toLowerCase(),phone:String(phone).trim().slice(0,40),address:fulfillment==='delivery'?String(address).trim().slice(0,500):'',fulfillment,proofPublicId:proof.public_id,proofFormat:proof.format,total,items,status:'Pending verification',createdAt:new Date().toISOString(),userId:req.user.sub};await collection('orders').doc(id).create(order);res.status(201).json({order:{id:order.id,status:order.status,total:order.total}})}catch(e){next(e)}});
app.get('/api/my/orders',auth,async(req,res,next)=>{try{const snap=await collection('orders').where('userId','==',req.user.sub).limit(50).get();const orders=snap.docs.map(d=>d.data()).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt))).map(o=>({id:o.id,status:o.status,total:o.total,items:o.items,createdAt:o.createdAt,fulfillment:o.fulfillment,address:o.address}));res.json({orders})}catch(e){next(e)}});
app.get('/api/admin/orders',auth,adminOnly,async(_req,res,next)=>{try{const snap=await collection('orders').orderBy('createdAt','desc').limit(300).get();res.json({orders:snap.docs.map(d=>d.data())})}catch(e){next(e)}});
app.get('/api/admin/orders/:id/proof',auth,adminOnly,async(req,res,next)=>{try{const snap=await collection('orders').doc(req.params.id).get();if(!snap.exists||!snap.data().proofPublicId)return res.status(404).json({error:'Payment proof not found.'});const o=snap.data();const url=cloudinary.utils.private_download_url(o.proofPublicId,o.proofFormat,{resource_type:'image',type:'authenticated',expires_at:Math.floor(Date.now()/1000)+86400});const image=await fetch(url,{signal:AbortSignal.timeout(15000)});if(!image.ok)throw Object.assign(new Error(`Cloudinary proof fetch failed (${image.status}).`),{status:502});const bytes=Buffer.from(await image.arrayBuffer());res.set('Content-Type',image.headers.get('content-type')||'application/octet-stream');res.set('Cache-Control','private, no-store');res.send(bytes)}catch(e){next(e)}});
app.patch('/api/admin/orders/:id',auth,adminOnly,async(req,res,next)=>{try{const status=req.body.status;if(!['Verified','Rejected'].includes(status))return res.status(400).json({error:'Choose Verified or Rejected.'});const ref=collection('orders').doc(req.params.id);await db.runTransaction(async tx=>{const orderSnap=await tx.get(ref);if(!orderSnap.exists)throw Object.assign(new Error('Order not found.'),{status:404});const order=orderSnap.data();if(order.status!=='Pending verification')throw Object.assign(new Error('This order has already been reviewed.'),{status:409});if(status==='Verified'){const refs=order.items.map(i=>collection('products').doc(i.id));const docs=[];for(const r of refs)docs.push(await tx.get(r));for(let i=0;i<docs.length;i++){const p=docs[i];if(!p.exists||p.data().stock<order.items[i].qty)throw Object.assign(new Error('Insufficient stock to approve this order.'),{status:409});tx.update(refs[i],{stock:p.data().stock-order.items[i].qty})}}tx.update(ref,{status,reviewedAt:new Date().toISOString()})});res.json({ok:true,status})}catch(e){next(e)}});
app.post('/api/admin/products',auth,adminOnly,upload.single('image'),async(req,res,next)=>{try{const product=safeProduct(req.body);if(!product)return res.status(400).json({error:'Check product name, category, price and stock.'});if(!req.file)return res.status(400).json({error:'Choose a product image to upload.'});const img=await uploadProductImage(req.file);product.image=img.secure_url;product.imagePublicId=img.public_id;const id='p-'+randomBytes(6).toString('hex');product.id=id;product.createdAt=new Date().toISOString();await collection('products').doc(id).create(product);res.status(201).json({product})}catch(e){next(e)}});
app.patch('/api/admin/products/:id',auth,adminOnly,async(req,res,next)=>{try{const product=safeProduct(req.body);if(!product)return res.status(400).json({error:'Check product name, category, price and stock.'});const ref=collection('products').doc(req.params.id);if(!(await ref.get()).exists)return res.status(404).json({error:'Product not found.'});await ref.update(product);res.json({product:{...product,id:req.params.id}})}catch(e){next(e)}});
async function uploadProductImage(file){if(!process.env.CLOUDINARY_CLOUD_NAME)throw new Error('Image storage is not configured.');const valid=['image/jpeg','image/png','image/webp'].includes(file.mimetype);if(!valid)throw new Error('Use a JPEG, PNG, or WebP product image.');return new Promise((resolve,reject)=>{const stream=cloudinary.uploader.upload_stream({folder:'julesfpv/products',resource_type:'image',format:'webp',transformation:[{width:1200,height:1200,crop:'limit',quality:'auto'}]},(err,result)=>err?reject(err):resolve(result));stream.end(file.buffer)})}
app.delete('/api/admin/products/:id',auth,adminOnly,async(req,res,next)=>{try{const ref=collection('products').doc(req.params.id),snap=await ref.get();if(!snap.exists)return res.status(404).json({error:'Product not found.'});await ref.delete();const pid=snap.data().imagePublicId;if(pid)cloudinary.uploader.destroy(pid,{resource_type:'image'}).catch(()=>{});res.json({ok:true})}catch(e){next(e)}});
app.get('*',(req,res,next)=>{if(req.path.startsWith('/api/'))return res.status(404).json({error:'Not found.'});res.sendFile(path.join(root,'dist','index.html'),e=>e&&next(e))});
app.use((err,req,res,_next)=>{console.error(err.message);if(res.headersSent)return;const status=err.status||((err instanceof multer.MulterError)?400:500);res.status(status).json({error:status>=500?'The server could not complete that request. Please try again.':err.message})});

const port=Number(process.env.PORT)||3000;
if (!process.env.VERCEL) app.listen(port,'0.0.0.0',()=>console.log(`JulesFPV server listening on ${port}`));
ensureSeed().catch(err=>console.error('Firestore is not ready; database-backed routes will report the error until it is enabled:',err.message));

export default app;
