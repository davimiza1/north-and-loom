import {describe,expect,it} from 'vitest';
import request from 'supertest';
import {app} from './app.js';
describe('API',()=>{it('reports healthy',async()=>{const response=await request(app).get('/api/health');expect(response.status).toBe(200);expect(response.body.status).toBe('ok')});it('protects customer orders',async()=>{const response=await request(app).post('/api/orders').send({});expect(response.status).toBe(401)});it('validates registration',async()=>{const response=await request(app).post('/api/auth/register').send({name:'A',email:'a@example.com',password:'short'});expect(response.status).toBe(400)})});
