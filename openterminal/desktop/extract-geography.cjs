// Derived from upstream AGPL source. Attribution is retained in the source archive.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {build}=require('esbuild');
async function main(){
 const root=process.env.JJ_WORLD_MONITOR_SOURCE||path.resolve('../worldmonitor');
 const target=path.join(fs.mkdtempSync(path.join(os.tmpdir(),'jj-geo-')),'data.cjs');
 await build({stdin:{contents:`export {PORTS} from './shared/ports-data'; export {PIPELINES} from './shared/pipelines-data'; export {INTEL_HOTSPOTS,CONFLICT_ZONES,STRATEGIC_WATERWAYS} from './shared/geo-data'; export {CURATED_COUNTRIES} from './src/config/countries';`,resolveDir:root},outfile:target,bundle:true,platform:'node',format:'cjs'});
 const d=require(target);
 fs.writeFileSync('web/lib/intelligence-geography.json',JSON.stringify({provenance:{repository:'koala73/worldmonitor',revision:'59fe6bbc15082888aeb01295c3615dab5d1c1a04',license:'AGPL-3.0-only',note:'Curated reference geography; not live events.'},ports:d.PORTS,pipelines:d.PIPELINES,hotspots:d.INTEL_HOTSPOTS,conflicts:d.CONFLICT_ZONES,waterways:d.STRATEGIC_WATERWAYS,countries:d.CURATED_COUNTRIES}));
}
main().catch(e=>{console.error(e);process.exit(1)});
