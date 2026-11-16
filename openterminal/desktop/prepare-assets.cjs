const fs=require('node:fs'),path=require('node:path');
const dest=path.resolve('web/public/maplibre');fs.mkdirSync(dest,{recursive:true});
for(const name of ['maplibre-gl-worker.mjs','maplibre-gl-shared.mjs'])fs.copyFileSync(path.join('node_modules/maplibre-gl/dist',name),path.join(dest,name));

fs.copyFileSync('node_modules/maplibre-gl/LICENSE.txt',path.join(dest,'LICENSE.txt'));
