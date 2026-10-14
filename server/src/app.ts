import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const productSchema=new mongoose.Schema({slug:{type:String,required:true,unique:true},name:{type:String,required:true},category:String,price:{type:Number,required:true,min:0},rating:Number,reviews:Number,image:String,colors:[String],description:String},{timestamps:true});
const userSchema=new mongoose.Schema({name:{type:String,required:true,trim:true},email:{type:String,required:true,unique:true,lowercase:true,trim:true},passwordHash:{type:String,required:true,select:false},wishlist:{type:[String],default:[]},role:{type:String,enum:['customer','admin'],default:'customer'}},{timestamps:true});
const orderSchema=new mongoose.Schema({user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},email:{type:String,required:true},customer:{firstName:String,lastName:String,address:String,city:String,postalCode:String},items:[{productId:String,name:String,price:Number,quantity:Number}],total:{type:Number,required:true},status:{type:String,enum:['confirmed','packed','shipped','delivered'],default:'confirmed'}},{timestamps:true});
export const Product=mongoose.models.Product||mongoose.model('Product',productSchema);
export const User=mongoose.models.User||mongoose.model('User',userSchema);
export const Order=mongoose.models.Order||mongoose.model('Order',orderSchema);

type AuthRequest=express.Request&{userId?:string};
const secret=()=>process.env.JWT_SECRET||'development-only-secret-change-me';
const publicUser=(user:any)=>({id:user.id,name:user.name,email:user.email,role:user.role,wishlist:user.wishlist});
const auth=(req:AuthRequest,res:express.Response,next:express.NextFunction)=>{const token=req.headers.authorization?.replace(/^Bearer\s+/,'');if(!token)return res.status(401).json({message:'Please sign in'});try{req.userId=(jwt.verify(token,secret())as{userId:string}).userId;next()}catch{return res.status(401).json({message:'Your session has expired'})}};

export const app=express();
app.use(cors({origin:process.env.CLIENT_URL?.split(',')||true}));
app.use(express.json({limit:'100kb'}));
app.get('/api/health',(_req,res)=>res.json({status:'ok',service:'north-and-loom-api',database:mongoose.connection.readyState===1?'connected':'disconnected'}));
app.post('/api/auth/register',async(req,res,next)=>{try{const {name,email,password}=req.body;if(!name||!email||typeof password!=='string'||password.length<8)return res.status(400).json({message:'Name, email and an 8-character password are required'});if(await User.exists({email:String(email).toLowerCase()}))return res.status(409).json({message:'An account already exists for this email'});const user=await User.create({name,email,passwordHash:await bcrypt.hash(password,12)});const token=jwt.sign({userId:user.id},secret(),{expiresIn:'7d'});res.status(201).json({token,user:publicUser(user)})}catch(error){next(error)}});
app.post('/api/auth/login',async(req,res,next)=>{try{const user=await User.findOne({email:String(req.body.email||'').toLowerCase()}).select('+passwordHash');if(!user||!await bcrypt.compare(String(req.body.password||''),user.passwordHash))return res.status(401).json({message:'Incorrect email or password'});const token=jwt.sign({userId:user.id},secret(),{expiresIn:'7d'});res.json({token,user:publicUser(user)})}catch(error){next(error)}});
app.get('/api/auth/me',auth,async(req:AuthRequest,res,next)=>{try{const user=await User.findById(req.userId);if(!user)return res.status(404).json({message:'Account not found'});res.json({user:publicUser(user)})}catch(error){next(error)}});
app.put('/api/auth/wishlist/:productId',auth,async(req:AuthRequest,res,next)=>{try{const user=await User.findById(req.userId);if(!user)return res.status(404).json({message:'Account not found'});const id=req.params.productId;user.wishlist=user.wishlist.includes(id)?user.wishlist.filter((x:string)=>x!==id):[...user.wishlist,id];await user.save();res.json({wishlist:user.wishlist})}catch(error){next(error)}});
app.get('/api/products',async(_req,res,next)=>{try{res.json(await Product.find().sort({createdAt:-1}))}catch(error){next(error)}});
app.get('/api/orders/mine',auth,async(req:AuthRequest,res,next)=>{try{res.json(await Order.find({user:req.userId}).sort({createdAt:-1}))}catch(error){next(error)}});
app.post('/api/orders',auth,async(req:AuthRequest,res,next)=>{try{const {email,customer,items,total}=req.body;if(!email||!Array.isArray(items)||!items.length||typeof total!=='number'||total<0)return res.status(400).json({message:'Email, items and a valid total are required'});const order=await Order.create({user:req.userId,email,customer,items,total});res.status(201).json({id:order.id,status:order.status})}catch(error){next(error)}});
app.use((_req,res)=>res.status(404).json({message:'Route not found'}));
app.use((error:unknown,_req:express.Request,res:express.Response,_next:express.NextFunction)=>{console.error(error);res.status(500).json({message:'Unexpected server error'})});
