const enc = new TextEncoder();
function b64url(bytes){let s="";for(const b of bytes)s+=String.fromCharCode(b);return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");}
function fromB64url(s){s=s.replace(/-/g,"+").replace(/_/g,"/");while(s.length%4)s+="=";return Uint8Array.from(atob(s),c=>c.charCodeAt(0));}
async function key(secret){return crypto.subtle.importKey("raw",enc.encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign","verify"]);}
export async function makeToken(role,secret){const payload=b64url(enc.encode(JSON.stringify({role,exp:Date.now()+7*24*60*60*1000})));const sig=await crypto.subtle.sign("HMAC",await key(secret),enc.encode(payload));return payload+"."+b64url(new Uint8Array(sig));}
export async function readToken(token,secret){try{const [p,s]=token.split(".");if(!p||!s)return null;const ok=await crypto.subtle.verify("HMAC",await key(secret),fromB64url(s),enc.encode(p));if(!ok)return null;const data=JSON.parse(new TextDecoder().decode(fromB64url(p)));if(!data.exp||data.exp<Date.now()||!["viewer","editor"].includes(data.role))return null;return data;}catch{return null;}}
export function cookie(token){return `wiki_session=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800`;}
export function clearCookie(){return "wiki_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0";}
export function getCookie(request){const raw=request.headers.get("Cookie")||"";const item=raw.split(";").map(x=>x.trim()).find(x=>x.startsWith("wiki_session="));return item?item.slice("wiki_session=".length):"";}
export function json(data,status=200,headers={}){return new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store",...headers}});}