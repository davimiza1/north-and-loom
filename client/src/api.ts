export const apiBase=import.meta.env.VITE_API_URL||'/api';
export async function api(path:string,options:RequestInit={}){const response=await fetch(`${apiBase}${path}`,{...options,headers:{'Content-Type':'application/json',...(options.headers||{})}});if(response.status===204)return null;const data=await response.json();if(!response.ok)throw new Error(data.message||'Something went wrong');return data}
export const authHeaders=(token:string)=>({Authorization:`Bearer ${token}`});
