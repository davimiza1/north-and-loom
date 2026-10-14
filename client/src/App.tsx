import {useEffect,useMemo,useState} from 'react';
import {Heart,Menu,Minus,Plus,Search,ShoppingBag,User,X,ArrowRight,Check} from 'lucide-react';
import {products} from './data';
import type {CartItem,Product} from './types';
import './styles.css';

const money=(value:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(value);
type Customer={id:string;name:string;email:string;role:string;wishlist:string[]};
const apiBase=import.meta.env.VITE_API_URL||'/api';
const api=async(path:string,options:RequestInit={})=>{const response=await fetch(`${apiBase}${path}`,{...options,headers:{'Content-Type':'application/json',...(options.headers||{})}});const data=await response.json();if(!response.ok)throw new Error(data.message||'Something went wrong');return data};

export default function App(){
  const [query,setQuery]=useState('');
  const [category,setCategory]=useState('All');
  const [cart,setCart]=useState<CartItem[]>([]);
  const [wish,setWish]=useState<string[]>([]);
  const [selected,setSelected]=useState<Product|null>(null);
  const [cartOpen,setCartOpen]=useState(false);
  const [checkout,setCheckout]=useState(false);
  const [menu,setMenu]=useState(false);
  const [ordered,setOrdered]=useState(false);
  const [authOpen,setAuthOpen]=useState(false);
  const [authMode,setAuthMode]=useState<'login'|'register'>('login');
  const [authError,setAuthError]=useState('');
  const [user,setUser]=useState<Customer|null>(null);
  const [token,setToken]=useState(()=>localStorage.getItem('north-token')||'');
  const [orderId,setOrderId]=useState('');
  useEffect(()=>{if(!token)return;api('/auth/me',{headers:{Authorization:`Bearer ${token}`}}).then(({user})=>{setUser(user);setWish(user.wishlist)}).catch(()=>{localStorage.removeItem('north-token');setToken('')})},[token]);
  const categories=['All',...new Set(products.map(p=>p.category))];
  const visible=useMemo(()=>products.filter(p=>(category==='All'||p.category===category)&&`${p.name} ${p.category}`.toLowerCase().includes(query.toLowerCase())),[category,query]);
  const count=cart.reduce((n,i)=>n+i.quantity,0);
  const subtotal=cart.reduce((n,i)=>n+i.product.price*i.quantity,0);
  const add=(product:Product)=>{setCart(current=>current.some(i=>i.product.id===product.id)?current.map(i=>i.product.id===product.id?{...i,quantity:i.quantity+1}:i):[...current,{product,quantity:1}]);setCartOpen(true)};
  const adjust=(id:string,delta:number)=>setCart(current=>current.map(i=>i.product.id===id?{...i,quantity:i.quantity+delta}:i).filter(i=>i.quantity>0));
  const placeOrder=async(e:React.FormEvent<HTMLFormElement>)=>{e.preventDefault();if(!user){setCheckout(false);setAuthOpen(true);setAuthError('Sign in or create an account before placing your order.');return}const form=new FormData(e.currentTarget);try{const result=await api('/orders',{method:'POST',headers:{Authorization:`Bearer ${token}`},body:JSON.stringify({email:form.get('email'),customer:{firstName:form.get('firstName'),lastName:form.get('lastName'),address:form.get('address'),city:form.get('city'),postalCode:form.get('postalCode')},items:cart.map(i=>({productId:i.product.id,name:i.product.name,price:i.product.price,quantity:i.quantity})),total:subtotal})});setOrderId(result.id);setOrdered(true);setCart([])}catch(error){setAuthError(error instanceof Error?error.message:'Order failed')}};
  const submitAuth=async(e:React.FormEvent<HTMLFormElement>)=>{e.preventDefault();setAuthError('');const form=new FormData(e.currentTarget);try{const result=await api(`/auth/${authMode}`,{method:'POST',body:JSON.stringify({name:form.get('name'),email:form.get('email'),password:form.get('password')})});localStorage.setItem('north-token',result.token);setToken(result.token);setUser(result.user);setWish(result.user.wishlist);setAuthOpen(false)}catch(error){setAuthError(error instanceof Error?error.message:'Authentication failed')}};
  const toggleWish=async(id:string)=>{if(!user){setAuthOpen(true);setAuthError('Sign in to save pieces to your wishlist.');return}try{const result=await api(`/auth/wishlist/${id}`,{method:'PUT',headers:{Authorization:`Bearer ${token}`}});setWish(result.wishlist);setUser({...user,wishlist:result.wishlist})}catch(error){setAuthError(error instanceof Error?error.message:'Could not update wishlist')}};
  const signOut=()=>{localStorage.removeItem('north-token');setToken('');setUser(null);setWish([])};
  const scrollTo=(id:string)=>{document.getElementById(id)?.scrollIntoView({behavior:'smooth'});setMenu(false)};

  return <>
    <div className="announcement">Complimentary delivery on orders over $150 <span>Explore the collection →</span></div>
    <header>
      <button className="icon mobile" onClick={()=>setMenu(!menu)} aria-label="Open menu"><Menu/></button>
      <button className="brand" onClick={()=>scrollTo('top')}>NORTH <i>&</i> LOOM</button>
      <nav className={menu?'open':''}>
        <button onClick={()=>scrollTo('shop')}>Shop</button><button onClick={()=>scrollTo('collections')}>Collections</button><button onClick={()=>scrollTo('journal')}>Journal</button>
      </nav>
      <div className="header-actions">
        <label className="search"><Search size={18}/><input aria-label="Search products" placeholder="Search" value={query} onChange={e=>{setQuery(e.target.value);scrollTo('shop')}}/></label>
        <button className="account desktop" aria-label="Account" onClick={()=>setAuthOpen(true)}><User/>{user&&<span>{user.name.split(' ')[0]}</span>}</button>
        <button className="icon bag" aria-label="Open cart" onClick={()=>setCartOpen(true)}><ShoppingBag/><b>{count}</b></button>
      </div>
    </header>

    <main id="top">
      <section className="hero">
        <div className="hero-copy"><p className="eyebrow">The Autumn Edit · 2026</p><h1>Objects for<br/><em>considered living.</em></h1><p>Enduring pieces shaped by natural materials, quiet craft, and the rituals of everyday life.</p><button className="primary" onClick={()=>scrollTo('shop')}>Shop the collection <ArrowRight size={17}/></button></div>
        <div className="hero-image"><span>New season</span><img src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=90" alt="Warm, considered living room"/></div>
      </section>

      <section className="promise"><p><b>Made to last</b><span>Natural materials, honest construction</span></p><p><b>Small-batch craft</b><span>Made slowly by independent studios</span></p><p><b>Thoughtful delivery</b><span>Plastic-free packaging, always</span></p></section>

      <section className="shop" id="shop">
        <div className="section-head"><div><p className="eyebrow">Collected with care</p><h2>New arrivals</h2></div><p>Useful, beautiful things chosen for the way they age—not for the season they enter.</p></div>
        <div className="filters" id="collections">{categories.map(c=><button key={c} className={category===c?'active':''} onClick={()=>setCategory(c)}>{c}</button>)}</div>
        {visible.length?<div className="grid">{visible.map((p,index)=><article className="product" key={p.id}>
          <div className="product-image" onClick={()=>setSelected(p)}><img src={p.image} alt={p.name}/>{index<2&&<span className="tag">New</span>}<button className={`heart ${wish.includes(p.id)?'liked':''}`} onClick={e=>{e.stopPropagation();toggleWish(p.id)}} aria-label="Toggle wishlist"><Heart fill="currentColor"/></button><button className="quick" onClick={e=>{e.stopPropagation();add(p)}}>Quick add <Plus size={16}/></button></div>
          <button className="product-info" onClick={()=>setSelected(p)}><span>{p.category}</span><h3>{p.name}</h3><div><b>{money(p.price)}</b><small>★ {p.rating} ({p.reviews})</small></div></button>
        </article>)}</div>:<div className="empty">No pieces match “{query}”. Try another search.</div>}
      </section>

      <section className="editorial" id="journal"><div><p className="eyebrow">Notes from the studio</p><h2>The beauty of<br/>living with less</h2><p>Designer Mira Ellison shares her approach to choosing objects that create calm, carry memory, and become better with time.</p><button className="text-button">Read the story <ArrowRight size={16}/></button></div><img src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85" alt="Calm neutral interior"/></section>
    </main>
    <footer><div className="brand">NORTH <i>&</i> LOOM</div><p>Objects with purpose. Made for everyday rituals.</p><div><button onClick={()=>scrollTo('shop')}>Shop</button><button onClick={()=>scrollTo('journal')}>Journal</button><button onClick={()=>alert('hello@northandloom.test')}>Contact</button></div><small>© 2026 North & Loom</small></footer>

    {selected&&<div className="overlay" onMouseDown={()=>setSelected(null)}><section className="modal product-modal" onMouseDown={e=>e.stopPropagation()}><button className="close" onClick={()=>setSelected(null)}><X/></button><img src={selected.image} alt={selected.name}/><div><p className="eyebrow">{selected.category}</p><h2>{selected.name}</h2><p className="rating">★ {selected.rating} · {selected.reviews} reviews</p><h3>{money(selected.price)}</h3><p>{selected.description}</p><p className="label">Finish</p><div className="swatches">{selected.colors.map(c=><span key={c} style={{background:c}}/>)}</div><button className="primary wide" onClick={()=>{add(selected);setSelected(null)}}>Add to bag <ShoppingBag size={17}/></button><small>Free delivery over $150 · 30-day returns</small></div></section></div>}

    {cartOpen&&<><div className="scrim" onClick={()=>setCartOpen(false)}/><aside className="drawer"><div className="drawer-head"><h2>Your bag <span>{count}</span></h2><button className="icon" onClick={()=>setCartOpen(false)}><X/></button></div>{cart.length?<><div className="cart-items">{cart.map(i=><div className="cart-item" key={i.product.id}><img src={i.product.image} alt=""/><div><span>{i.product.category}</span><h3>{i.product.name}</h3><b>{money(i.product.price)}</b><div className="quantity"><button onClick={()=>adjust(i.product.id,-1)}><Minus/></button><span>{i.quantity}</span><button onClick={()=>adjust(i.product.id,1)}><Plus/></button></div></div></div>)}</div><div className="cart-total"><p><span>Subtotal</span><b>{money(subtotal)}</b></p><small>Taxes and delivery calculated at checkout.</small><button className="primary wide" onClick={()=>{setCartOpen(false);setCheckout(true)}}>Continue to checkout <ArrowRight size={17}/></button></div></>:<div className="empty-cart"><ShoppingBag/><h3>Your bag is empty</h3><p>Discover pieces made to stay with you.</p><button className="primary" onClick={()=>{setCartOpen(false);scrollTo('shop')}}>Browse the collection</button></div>}</aside></>}

    {checkout&&<div className="overlay"><section className="modal checkout"><button className="close" onClick={()=>{setCheckout(false);setOrdered(false)}}><X/></button>{ordered?<div className="success"><span><Check/></span><p className="eyebrow">Order confirmed</p><h2>Thank you.</h2><p>Your test order <b>#{orderId.slice(-8).toUpperCase()}</b> is saved. No payment was charged.</p><button className="primary" onClick={()=>{setCheckout(false);setOrdered(false)}}>Continue shopping</button></div>:<><p className="eyebrow">Secure test checkout</p><h2>Delivery details</h2><form onSubmit={placeOrder}><label>Email<input name="email" required type="email" defaultValue={user?.email||''} placeholder="you@example.com"/></label><div className="two"><label>First name<input name="firstName" required/></label><label>Last name<input name="lastName" required/></label></div><label>Address<input name="address" required placeholder="Street and number"/></label><div className="two"><label>City<input name="city" required/></label><label>Postal code<input name="postalCode" required/></label></div><div className="order-line"><span>Total</span><b>{money(subtotal)}</b></div><button className="primary wide">Place test order</button><small>{user?'This portfolio checkout is in test mode. No card is required.':'You will be asked to sign in before placing the order.'}</small></form></>}</section></div>}
    {authOpen&&<div className="overlay" onMouseDown={()=>setAuthOpen(false)}><section className="modal auth-modal" onMouseDown={e=>e.stopPropagation()}><button className="close" onClick={()=>setAuthOpen(false)}><X/></button>{user?<div className="account-panel"><p className="eyebrow">Your account</p><h2>Hello, {user.name.split(' ')[0]}.</h2><p>{user.email}</p><div className="account-stat"><span>Saved pieces</span><b>{wish.length}</b></div><p className="muted">Your wishlist and new orders are securely saved to your account.</p><button className="secondary wide" onClick={signOut}>Sign out</button></div>:<><p className="eyebrow">North & Loom members</p><h2>{authMode==='login'?'Welcome back.':'Create an account.'}</h2><form onSubmit={submitAuth}>{authMode==='register'&&<label>Name<input name="name" required placeholder="Your name"/></label>}<label>Email<input name="email" required type="email" placeholder="you@example.com"/></label><label>Password<input name="password" required type="password" minLength={8} placeholder="At least 8 characters"/></label>{authError&&<p className="form-error">{authError}</p>}<button className="primary wide">{authMode==='login'?'Sign in':'Create account'}</button></form><button className="auth-switch" onClick={()=>{setAuthMode(authMode==='login'?'register':'login');setAuthError('')}}>{authMode==='login'?'New here? Create an account':'Already a member? Sign in'}</button></>}</section></div>}
  </>
}
