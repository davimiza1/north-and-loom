export type Product={id:string;_id?:string;slug?:string;name:string;category:string;price:number;inventory?:number;status?:'active'|'draft';rating:number;reviews:number;image:string;colors:string[];description:string};
export type CartItem={product:Product;quantity:number};
