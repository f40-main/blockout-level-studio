const fs=require('node:fs');
const path=require('node:path');
const {DatabaseSync}=require('node:sqlite');
function database(filename,migrationsDir){
 const sqlite=new DatabaseSync(filename);sqlite.exec('CREATE TABLE IF NOT EXISTS local_migrations (name TEXT PRIMARY KEY)');
 for(const name of fs.readdirSync(migrationsDir).filter(n=>n.endsWith('.sql')).sort()){if(sqlite.prepare('SELECT name FROM local_migrations WHERE name = ?').get(name))continue;sqlite.exec(fs.readFileSync(path.join(migrationsDir,name),'utf8'));sqlite.prepare('INSERT INTO local_migrations (name) VALUES (?)').run(name);}
 return {sqlite,prepare(sql){return {bind(...values){const statement=sqlite.prepare(sql);return {async first(){return statement.get(...values)||null;},async all(){return {results:statement.all(...values)};},async run(){const result=statement.run(...values);return {meta:{changes:Number(result.changes)}};}};}};}};
}
module.exports={database};
