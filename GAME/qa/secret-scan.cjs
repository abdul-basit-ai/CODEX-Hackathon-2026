const fs=require('node:fs');
const path=require('node:path');
const env=fs.readFileSync('../chess-companion/.env','utf8');
const line=env.split(/\r?\n/).find(x=>x.startsWith('OPENAI_API_KEY='));
const key=line?.slice(line.indexOf('=')+1).trim().replace(/^["']|["']$/g,'');
if(!key)throw new Error('No key found for the local secret check');
for(const file of fs.readdirSync('.output/public/assets')){
 if(!file.endsWith('.js'))continue;
 if(fs.readFileSync(path.join('.output/public/assets',file),'utf8').includes(key))throw new Error('Secret detected in client build');
}
console.log('Client secret scan passed');
