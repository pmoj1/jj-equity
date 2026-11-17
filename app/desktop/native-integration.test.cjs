const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs'),path=require('node:path'),os=require('node:os');const {buildSync}=require('esbuild');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'jj-native-tests-'));
function compile(entry,name){const file=path.join(temp,name+'.cjs');buildSync({entryPoints:[entry],outfile:file,bundle:true,platform:'node',format:'cjs',alias:{'@':path.resolve('web')}});return require(file);}
test('intelligence route is allowlisted and keeps transport credentials server-side',async()=>{
 const route=compile('web/app/api/intelligence/[dataset]/route.ts','route');const originalFetch=global.fetch;const oldUrl=process.env.INTELLIGENCE_API_URL,oldToken=process.env.INTELLIGENCE_TOKEN;
 try{
  delete process.env.INTELLIGENCE_API_URL;delete process.env.INTELLIGENCE_TOKEN;
  assert.equal((await route.GET(new Request('http://localhost'),{params:Promise.resolve({dataset:'risk'})})).status,503);
  process.env.INTELLIGENCE_API_URL='http://127.0.0.1:1234';process.env.INTELLIGENCE_TOKEN='private-test-token';
  let calls=0;global.fetch=async(url,options)=>{calls++;assert.equal(url,'http://127.0.0.1:1234/api/intelligence/v1/get-risk-scores');assert.equal(options.headers['x-worldmonitor-local-token'],'private-test-token');return Response.json({ciiScores:[{region:'AU',combinedScore:11}]});};
  const response=await route.GET(new Request('http://localhost'),{params:Promise.resolve({dataset:'risk'})});const body=await response.json();assert.equal(response.status,200);assert.equal(body.data.ciiScores[0].region,'AU');assert.ok(!JSON.stringify(body).includes('private-test-token'));
  assert.equal((await route.GET(new Request('http://localhost'),{params:Promise.resolve({dataset:'../../local-config'})})).status,404);assert.equal(calls,1);
  global.fetch=async()=>new Response('',{status:403});assert.equal((await route.GET(new Request('http://localhost'),{params:Promise.resolve({dataset:'risk'})})).status,403);
 }finally{global.fetch=originalFetch;if(oldUrl===undefined)delete process.env.INTELLIGENCE_API_URL;else process.env.INTELLIGENCE_API_URL=oldUrl;if(oldToken===undefined)delete process.env.INTELLIGENCE_TOKEN;else process.env.INTELLIGENCE_TOKEN=oldToken;}
});
test('J&J presets preserve a previous personal desk while exposing every native intelligence panel',()=>{
 const workspace=compile('web/lib/workspace.ts','workspace');
 const widgets=[{id:'chart-custom',type:'chart',linked:true},{id:'portfolio-custom',type:'portfolio',linked:false,symbol:'MSFT'}];
 const layout=[{i:'chart-custom',x:0,y:0,w:7,h:12},{i:'portfolio-custom',x:0,y:12,w:7,h:8}];
 const legacy=workspace.legacyDesk({widgets,layout});
 assert.deepEqual(legacy,{widgets,layout});
 const desks=workspace.defaultDesks();
 desks.personal=legacy;
 const restored=workspace.parseWorkspaceFile({format:'jj-equity-workspace',version:1,workspaceName:'My research',activeDesk:'personal',activeSymbol:'MSFT',watchlist:['MSFT','AAPL'],desks});
 assert.deepEqual(restored.desks.personal,{widgets,layout});
 assert.deepEqual(restored.watchlist,['MSFT','AAPL']);
 assert.equal(restored.activeSymbol,'MSFT');
 for(const type of ['global-map','world-news','country-risk','energy-intel','shipping-intel','hazard-intel','military-intel','cyber-intel']) assert.ok(desks.intelligence.widgets.some(widget=>widget.type===type),type);
 assert.deepEqual(Object.keys(desks),['personal','markets','intelligence','research']);
 assert.equal(workspace.legacyDesk({widgets:[widgets[0],widgets[0]],layout}),null);
});
test('terminal ships native components without embedded upstream pages',()=>{
 const terminal=fs.readFileSync('web/components/Terminal.tsx','utf8');const workspace=fs.readFileSync('web/components/Workspace.tsx','utf8');assert.ok(!/iframe|WorldMonitorWorkspace|WORLD MONITOR/.test(terminal+workspace));for(const name of ['GlobalMap','NewsIntelligence','RiskIntelligence','OperationalFeeds'])assert.ok(workspace.includes(name));
 const prepare=fs.readFileSync('desktop/prepare.cjs','utf8');assert.ok(!prepare.includes("['dist', 'api'"));
});
