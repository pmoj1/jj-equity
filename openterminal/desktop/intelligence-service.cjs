// Headless upstream integrations. The application renders its own native widgets.
const path = require('node:path');
const { pathToFileURL } = require('node:url');
async function main() {
  const base = path.join(__dirname,'worldmonitor');
  const { createLocalApiServer } = await import(pathToFileURL(path.join(base,'local-api-server.mjs')).href);
  const service = await createLocalApiServer({port:Number(process.env.LOCAL_API_PORT),resourceDir:base,dataDir:process.env.LOCAL_API_DATA_DIR,mode:'desktop-sidecar',cloudFallback:true});
  await service.start();
  function stop(){service.server.close();process.exit(0);}
  process.on('SIGTERM',stop);process.on('SIGINT',stop);
}
main().catch(error=>{console.error(error);process.exit(1);});
