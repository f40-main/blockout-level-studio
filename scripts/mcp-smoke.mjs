// Local integration demo; never sends model API keys or production credentials.
const endpoint='http://127.0.0.1:5173/mcp';
async function rpc(method,params={}) {
 const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params})});
 const result=await response.json();
 if(!response.ok||result.error||result.result?.isError)throw new Error(JSON.stringify(result));
 return result.result;
}
await rpc('initialize',{protocolVersion:'2025-06-18',capabilities:{},clientInfo:{name:'blockout-local-demo',version:'1'}});
const discovery=await rpc('tools/list');
if(process.argv[2]) {
 const current=(await rpc('tools/call',{name:'get_level_project',arguments:{project_id:process.argv[2]}})).structuredContent;
 const updated=await rpc('tools/call',{name:'apply_level_edits',arguments:{project_id:current.id,expected_revision:current.revision,add:[{type:'cover',name:'MCP ile eklenen siper',x:22,y:12,w:3,h:1,height:1.2}]}});
 console.log(JSON.stringify(updated.structuredContent));
} else {
 const created=await rpc('tools/call',{name:'create_level_project',arguments:{name:'MCP Deneme — Depo Baskını',description:'Yerel MCP ve editör eşitleme denemesi',objects:[
  {type:'room',name:'Giriş',x:0,y:4,w:8,h:8,height:3},
  {type:'room',name:'Geçit',x:8,y:6,w:8,h:4,height:3},
  {type:'room',name:'Depo',x:16,y:0,w:20,h:18,height:5},
  {type:'door',name:'Giriş kapısı',x:8,y:7,x2:8,y2:9,height:2.5},
  {type:'door',name:'Depo kapısı',x:16,y:7,x2:16,y2:9,height:2.5},
  {type:'spawn',name:'Oyuncu',x:3,y:8},
  {type:'enemy',name:'Nöbetçi',x:27,y:7},
  {type:'objective',name:'Hedef',x:31,y:13},
  {type:'cover',name:'Yük paleti',x:22,y:5,w:3,h:2,height:1.2},
  {type:'path',name:'Ana rota',x:3,y:8,points:[{x:3,y:8},{x:18,y:8},{x:20,y:13},{x:31,y:13}]}
 ]}});
 console.log(JSON.stringify({tools:discovery.tools.map(t=>t.name),...created.structuredContent}));
}
