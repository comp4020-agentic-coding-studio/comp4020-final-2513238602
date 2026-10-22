export class ApiError extends Error {
  status:number;
  constructor(status:number,message:string){super(message);this.status=status;}
}
async function request<T>(path:string,data?:unknown):Promise<T>{
  const control=new AbortController(),timeout=setTimeout(()=>control.abort(),12000);
  try {
    const res=await fetch(path,{method:data===undefined?'GET':'POST',headers:data===undefined?{}:{'Content-Type':'application/json'},body:data===undefined?undefined:JSON.stringify(data),signal:control.signal});
    const value=await res.json();if(!res.ok)throw new ApiError(res.status,value.error??'Please try again.');return value as T;
  } finally {clearTimeout(timeout)}
}
let pendingIdentity:Promise<unknown>|null=null;
export function api<T>(path:string,data?:unknown):Promise<T>{
  if(path!=='/api/me'||data!==undefined)return request<T>(path,data);
  if(!pendingIdentity)pendingIdentity=request<T>(path).finally(()=>{pendingIdentity=null});
  return pendingIdentity as Promise<T>;
}
