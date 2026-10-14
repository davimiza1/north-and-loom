import 'dotenv/config';
import mongoose from 'mongoose';
import {app} from './app.js';
const port=Number(process.env.PORT)||5100;
async function start(){if(process.env.MONGODB_URI){await mongoose.connect(process.env.MONGODB_URI);console.log('MongoDB connected')}else console.warn('MONGODB_URI missing; database routes will be unavailable');app.listen(port,()=>console.log(`North & Loom API running on ${port}`))}
start().catch(error=>{console.error(error);process.exit(1)});
