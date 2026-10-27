const fs=require('node:fs');
const path=require('node:path');
const decoder=new TextDecoder('windows-1252');
const characters='\u2018\u2019\u201c\u201d\u2013\u2014\u2026\u2022\u2192\u2190\u00a9\u00e7\u2605\u2654\u2655\u2656\u2657\u2658\u2659\u265a\u265b\u265c\u265d\u265e\u265f';
const replacements=[...characters].map(c=>[decoder.decode(Buffer.from(c)),c]);
const files=process.argv.slice(2);const changes=[];
for(const name of files){const old=fs.readFileSync(name,'utf8');let updated=old;for(let pass=0;pass<3;pass++)for(const [broken,correct] of replacements)updated=updated.split(broken).join(correct);if(old!==updated){const before=old.split(/\r?\n/),after=updated.split(/\r?\n/);changes.push({name,lines:before.flatMap((line,i)=>line===after[i]?[]:[{old:line,updated:after[i]}])});}}
process.stdout.write(JSON.stringify(changes));
