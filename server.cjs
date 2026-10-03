const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const {database}=require('./server/local-db.cjs');
const root=__dirname,runtime=path.join(root,'.sites-runtime');
fs.mkdirSync(runtime,{recursive:true});
const db=database(path.join(runtime,'blockout.sqlite'),path.join(root,'drizzle'));
import(pathToFileURL(path.join(root,'dist/server/index.js')).href).then(({default:worker})=>{
 const server=http.createServer(async(req,res)=>{
  try{const host=req.headers.host;if(host!=='127.0.0.1:5173'&&host!=='localhost:5173'){res.writeHead(403);return res.end('Invalid host');}const headers=new Headers();for(const [key,value] of Object.entries(req.headers)){if(!key.startsWith('oai-')&&typeof value==='string')headers.set(key,value);}headers.set('oai-authenticated-user-id','local-owner');let body=null;if(!['GET','HEAD'].includes(req.method)){const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>2_500_000){res.writeHead(413);return res.end('Request is too large');}chunks.push(chunk);}body=Buffer.concat(chunks);}const response=await worker.fetch(new Request('http://'+host+req.url,{method:req.method,headers,...(body?{body}: {})}),{DB:db});res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));}catch{res.writeHead(500,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Local server could not handle this request.'}));}
 });
 server.listen(5173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:5173 · MCP: http://127.0.0.1:5173/mcp'));
}).catch(error=>{console.error('Run npm run build before starting Blockout:',error.message);process.exitCode=1;});
