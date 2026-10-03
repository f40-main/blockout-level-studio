export const OBJECT_TYPES=['room','wall','door','cover','zone','path','spawn','enemy','objective','pickup','note'];
export const DEFAULT_LAYERS=[{id:'geometry',name:'Geometri',visible:true,locked:false},{id:'gameplay',name:'Oyun öğeleri',visible:true,locked:false},{id:'notes',name:'Rotalar ve notlar',visible:true,locked:false}];
export const DEFAULT_COLORS={room:'#526264',wall:'#bac4c4',door:'#c8b785',cover:'#7d8588',zone:'#c3a75b',path:'#b8ef77',spawn:'#b8ef77',enemy:'#e58d82',objective:'#e6bc72',pickup:'#83afd4',note:'#bbc1cd'};
export function layerOf(type){return ['zone','spawn','enemy','objective','pickup'].includes(type)?'gameplay':['path','note'].includes(type)?'notes':'geometry';}
export function validation(message,status=400){return Object.assign(new Error(message),{status});}
export function safeText(value,max,name){if(typeof value!=='string'||!value.trim()||value.length>max)throw validation(name+' must be a non-empty string of at most '+max+' characters.');return value.trim();}
export function normalObject(input,forcedId){
 if(!input||typeof input!=='object'||Array.isArray(input)||!OBJECT_TYPES.includes(input.type))throw validation('Unsupported object type.');
 const number=(key,fallback,positive=false)=>{const value=input[key]??fallback;if(typeof value!=='number'||!Number.isFinite(value)||Math.abs(value)>9999||(positive&&value<=0))throw validation('Invalid '+key+'. Coordinates use meters and must be finite.');return value;};
 const o={id:forcedId||input.id||crypto.randomUUID(),type:input.type,name:safeText(input.name||input.type,80,'Object name'),x:number('x'),y:number('y'),height:number('height',input.type==='zone'?0:['room','wall'].includes(input.type)?3:input.type==='door'?2.2:1.2),elevation:number('elevation',0),layer:layerOf(input.type),color:DEFAULT_COLORS[input.type],tag:typeof input.tag==='string'?input.tag.slice(0,100):''};
 if(typeof o.id!=='string'||!/^[\w-]{1,100}$/.test(o.id))throw validation('Invalid object id.');
 if(o.height<0||o.height>1000||(['room','cover','wall','door'].includes(o.type)&&o.height<=0))throw validation('Geometry height must be positive and at most 1000 meters.');
 if(typeof input.color==='string'&&/^#[0-9a-f]{6}$/i.test(input.color))o.color=input.color;
 if(['room','cover','zone'].includes(o.type)){o.w=number('w',undefined,true);o.h=number('h',undefined,true);}
 if(['wall','door'].includes(o.type)){o.x2=number('x2');o.y2=number('y2');if(Math.hypot(o.x2-o.x,o.y2-o.y)<.01)throw validation('A wall or door needs two distinct endpoints.');}
 if(o.type==='path'){if(!Array.isArray(input.points)||input.points.length<2||input.points.length>2000||input.points.some(p=>!p||typeof p.x!=='number'||typeof p.y!=='number'||!Number.isFinite(p.x)||!Number.isFinite(p.y)||Math.abs(p.x)>9999||Math.abs(p.y)>9999))throw validation('A path needs 2–2000 valid x/y points.');o.points=input.points.map(p=>({x:p.x,y:p.y}));}
 return o;
}
export function normalProject(input){
 if(!input||input.version!==1||!Array.isArray(input.objects)||input.objects.length>3000)throw validation('Provide a version 1 Blockout project with at most 3000 objects.');
 const name=safeText(input.name,80,'Project name');const objects=input.objects.map(o=>normalObject(o));if(new Set(objects.map(o=>o.id)).size!==objects.length)throw validation('Object ids must be unique.');
 const layers=structuredClone(DEFAULT_LAYERS);for(const layer of layers){const saved=input.layers?.find?.(l=>l.id===layer.id);if(saved){layer.visible=saved.visible!==false;layer.locked=saved.locked===true;}}
 const project={version:1,name,description:typeof input.description==='string'?input.description.slice(0,160):'AI ile oluşturulan level',grid:[.5,1,2].includes(input.grid)?input.grid:1,layers,objects};
 if(JSON.stringify(project).length>2_000_000)throw validation('Project exceeds 2 MB.');return project;
}
export function applyEdits(project,input){
 const next=structuredClone(project),add=input.add||[],update=input.update||[],remove=input.remove||[];
 if(!Array.isArray(add)||!Array.isArray(update)||!Array.isArray(remove)||add.length+update.length+remove.length<1||add.length+update.length+remove.length>300)throw validation('Provide 1–300 edits in a batch.');
 const changedIds=new Set();const editable=o=>{if(next.layers.find(l=>l.id===o.layer)?.locked)throw validation('Layer is locked: '+o.layer,409);};
 for(const patch of update){if(!patch||typeof patch.id!=='string'||changedIds.has(patch.id))throw validation('Each object can be edited only once per batch.');const i=next.objects.findIndex(o=>o.id===patch.id);if(i<0)throw validation('Object not found: '+patch.id,404);editable(next.objects[i]);changedIds.add(patch.id);const original=next.objects[i];if(patch.type!==undefined&&patch.type!==original.type)throw validation('Object type cannot change.');const candidate={...original,...patch};if(original.points&&patch.points===undefined&&(patch.x!==undefined||patch.y!==undefined)){const dx=candidate.x-original.x,dy=candidate.y-original.y;candidate.points=original.points.map(p=>({x:p.x+dx,y:p.y+dy}));}if(original.x2!==undefined){if(patch.x!==undefined&&patch.x2===undefined)candidate.x2+=candidate.x-original.x;if(patch.y!==undefined&&patch.y2===undefined)candidate.y2+=candidate.y-original.y;}next.objects[i]=normalObject(candidate,patch.id);}
 for(const id of remove){if(typeof id!=='string'||changedIds.has(id))throw validation('Each object can be edited only once per batch.');const i=next.objects.findIndex(o=>o.id===id);if(i<0)throw validation('Object not found: '+id,404);editable(next.objects[i]);changedIds.add(id);next.objects.splice(i,1);}
 for(const item of add){const o=normalObject(item);editable(o);if(next.objects.some(existing=>existing.id===o.id))throw validation('Object id already exists: '+o.id);next.objects.push(o);}
 if(input.name!==undefined)next.name=safeText(input.name,80,'Project name');return normalProject(next);
}
export function projectSummary(project){return {object_count:project.objects.length,room_count:project.objects.filter(o=>o.type==='room').length,total_room_area_m2:+project.objects.filter(o=>o.type==='room').reduce((sum,o)=>sum+o.w*o.h,0).toFixed(2),spawn_count:project.objects.filter(o=>o.type==='spawn').length,objective_count:project.objects.filter(o=>o.type==='objective').length};}
