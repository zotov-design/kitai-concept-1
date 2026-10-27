import fs from 'node:fs';
import path from 'node:path';
const files=['index.html','styles.css','refinements.css','app.js','components.js','qa-metrics.js'];
const assets=new Set();
fs.mkdirSync('release/assets',{recursive:true});
for(const file of files){
  const source=fs.readFileSync(path.join('dist',file),'utf8');
  if(source.includes('www.figma.com/api/mcp/asset/'))throw Error('Temporary Figma URL in runtime');
  for(const match of source.matchAll(/assets\/[a-zA-Z0-9_.-]+/g))assets.add(match[0]);
  fs.copyFileSync(path.join('dist',file),path.join('release',file));
}
let bytes=0;
for(const asset of assets){
  const source=path.join('dist',asset);
  const stat=fs.statSync(source);
  if(!stat.size)throw Error(`Empty asset: ${asset}`);
  fs.copyFileSync(source,path.join('release',asset));bytes+=stat.size;
}
console.log(JSON.stringify({pages:1,localAssets:assets.size,assetBytes:bytes,preservedOriginals:true}));
