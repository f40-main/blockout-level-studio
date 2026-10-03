const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
// Load the actual geometry and import code without starting the browser UI.
const source=fs.readFileSync(path.join(__dirname,'../dist/app.js'),'utf8').split("document.addEventListener('click',e=>{")[0];
const context={structuredClone,document:{querySelector:()=>({})},setTimeout,clearTimeout};
vm.createContext(context);
vm.runInContext(source+';globalThis.api={sampleProject,cleanProject,geometryBoxes,boxVertices,exportOBJ,moveObject,setProject:p=>project=p};',context);
const api=context.api;
test('JSON roundtrip preserves sample geometry and gameplay markers',()=>{
 const project=api.sampleProject(),loaded=api.cleanProject(JSON.parse(JSON.stringify(project)));
 assert.equal(loaded.objects.length,project.objects.length);
 assert.deepEqual(JSON.parse(JSON.stringify(loaded.objects.find(o=>o.type==='path').points)),JSON.parse(JSON.stringify(project.objects.find(o=>o.type==='path').points)));
 assert.equal(loaded.objects.find(o=>o.id==='r5').height,4);
 assert.equal(loaded.objects.find(o=>o.type==='zone').height,0);
});
test('Invalid project data is rejected before it can replace the current project',()=>{
 for(const mutate of [p=>p.objects[0].w=-1,p=>p.objects[0].x=Infinity,p=>p.objects[1].id=p.objects[0].id,p=>p.objects.find(o=>o.type==='path').points[0].x=NaN,p=>p.objects[0].height=-1]){
  const project=api.sampleProject();mutate(project);assert.throws(()=>api.cleanProject(project));
 }
});
test('Door opening is cut through the wall while preserving the lintel and room elevation',()=>{
 const room={type:'room',name:'Room',x:2,y:4,w:10,h:8,height:3,elevation:2,color:'#526264'};
 const door={type:'door',x:6,y:4,x2:8,y2:4,height:2.2};
 const boxes=api.geometryBoxes([room,door]);
 const north=boxes.filter(b=>b.name==='Room_north');
 assert.equal(north.length,3);
 assert.ok(north.some(b=>b.x===2&&b.w===4&&b.y===2&&b.h===3));
 assert.ok(north.some(b=>b.x===8&&b.w===4&&b.y===2&&b.h===3));
 assert.ok(north.some(b=>b.x===6&&b.w===2&&b.y===4.2&&Math.abs(b.h-.8)<.0001));
 assert.equal(boxes.find(b=>b.name==='Room_floor').y,1.85);
});
test('OBJ faces refer to valid vertices and use Y for height; moved routes retain their shape',()=>{
 const project=api.sampleProject();api.setProject(project);const text=api.exportOBJ();
 const vertices=text.split('\n').filter(l=>l.startsWith('v '));
 const faces=text.split('\n').filter(l=>l.startsWith('f '));
 assert.ok(vertices.length>100&&faces.length>50);
 for(const face of faces)for(const index of face.slice(2).split(' ').map(Number))assert.ok(index>=1&&index<=vertices.length);
 const box={x:2,z:4,w:10,d:8,y:2,h:3};const coords=JSON.parse(JSON.stringify(api.boxVertices(box)));
 assert.deepEqual(coords[6],[12,5,12]);
 const route={x:0,y:1,points:[{x:0,y:1},{x:3,y:4}]};api.moveObject(route,2,-1);
 assert.deepEqual(JSON.parse(JSON.stringify(route)),{x:2,y:0,points:[{x:2,y:0},{x:5,y:3}]});
});
