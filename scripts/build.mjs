import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const assets={};
for(const [name,type] of [['index.html','text/html; charset=utf-8'],['style.css','text/css; charset=utf-8'],['app.js','application/javascript; charset=utf-8'],['cloud.js','application/javascript; charset=utf-8']]) assets['/'+name]={body:await fs.readFile(path.join(root,'dist',name),'utf8'),type};
const model=(await fs.readFile(path.join(root,'server/level-model.mjs'),'utf8')).replace(/^export /gm,'');
const worker=(await fs.readFile(path.join(root,'server/worker.mjs'),'utf8')).replace(/^import .*?;\s*$/m,'');
await fs.mkdir(path.join(root,'dist/server'),{recursive:true});
await fs.mkdir(path.join(root,'dist/.openai'),{recursive:true});
await fs.writeFile(path.join(root,'dist/server/index.js'),'const STATIC_ASSETS='+JSON.stringify(assets)+';\n'+model+'\n'+worker);
try { await fs.copyFile(path.join(root,'.openai/hosting.json'),path.join(root,'dist/.openai/hosting.json')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
console.log('Blockout Worker built with editor assets and MCP endpoint.');
