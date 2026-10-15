import 'dotenv/config';
import mongoose from 'mongoose';
import {Product} from './app.js';
const items=[
{slug:'stone-mug',name:'Stone Mug',category:'Ceramics',price:28,inventory:24,rating:4.9,reviews:42,image:'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=900&q=85',colors:['#ded6c8','#b9b4aa','#72766d'],description:'A tactile, hand-finished stoneware mug for unhurried mornings.'},
{slug:'linen-throw',name:'Linen Throw',category:'Textiles',price:98,inventory:7,rating:4.8,reviews:27,image:'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=900&q=85',colors:['#b46143','#ded9cf','#747866'],description:'Soft washed linen with a relaxed weave and hand-knotted fringe.'},
{slug:'field-lamp',name:'Field Table Lamp',category:'Lighting',price:168,inventory:4,rating:4.9,reviews:64,image:'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85',colors:['#252522','#e1ddd3'],description:'A compact sculptural lamp casting a warm pool of focused light.'},
{slug:'bowl-set',name:'Ceramic Bowl Set',category:'Ceramics',price:78,inventory:15,rating:4.7,reviews:38,image:'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=900&q=85',colors:['#d7ccba','#b7b2a4','#69706c'],description:'Three nesting bowls shaped and glazed by hand.'},
{slug:'watering-can',name:'Brass Watering Can',category:'Garden',price:110,inventory:8,rating:4.8,reviews:19,image:'https://images.unsplash.com/photo-1617576683096-00fc8eecb3af?auto=format&fit=crop&w=900&q=85',colors:['#ad7b28','#696247'],description:'A balanced brushed-brass vessel for indoor plants.'},
{slug:'oak-tray',name:'Oak Serving Tray',category:'Wood',price:64,inventory:19,rating:4.6,reviews:31,image:'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=900&q=85',colors:['#9b7048','#5f432f'],description:'Solid oak, softened edges, and a natural oil finish.'}
];
if(!process.env.MONGODB_URI)throw new Error('MONGODB_URI is required');
await mongoose.connect(process.env.MONGODB_URI);
for(const item of items)await Product.updateOne({slug:item.slug},{$setOnInsert:{...item,status:'active'}},{upsert:true});
console.log(`Catalog ready: ${await Product.countDocuments()} products`);
await mongoose.disconnect();
