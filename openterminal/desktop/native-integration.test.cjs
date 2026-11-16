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
test('workspace upgrade preserves existing widgets while placing intelligence and charts in one grid',()=>{
 const store=compile('web/store/terminal.ts','store');const widgets=[{id:'chart-custom',type:'chart',linked:true},{id:'portfolio-custom',type:'portfolio',linked:false}];const layout=[{i:'chart-custom',x:0,y:0,w:7,h:12},{i:'portfolio-custom',x:0,y:12,w:7,h:8}];const result=store.integratedDesk(widgets,layout);
 assert.ok(result.widgets.some(w=>w.id==='portfolio-custom'));assert.ok(result.widgets.some(w=>w.type==='global-map'));assert.ok(result.widgets.some(w=>w.type==='world-news'));assert.equal(result.layout.find(l=>l.i==='chart-custom').y,0);assert.ok(result.layout.find(l=>l.i==='portfolio-custom').y>=40);assert.equal(new Set(result.widgets.map(w=>w.id)).size,result.widgets.length);
 const again=store.integratedDesk(result.widgets,result.layout);assert.equal(again.widgets.length,result.widgets.length);
});
test('terminal ships native components without embedded upstream pages',()=>{
 const terminal=fs.readFileSync('web/components/Terminal.tsx','utf8');const workspace=fs.readFileSync('web/components/Workspace.tsx','utf8');assert.ok(!/iframe|WorldMonitorWorkspace|WORLD MONITOR/.test(terminal+workspace));for(const name of ['GlobalMap','NewsIntelligence','RiskIntelligence','OperationalFeeds'])assert.ok(workspace.includes(name));
 const prepare=fs.readFileSync('desktop/prepare.cjs','utf8');assert.ok(!prepare.includes("['dist', 'api'"));
});
