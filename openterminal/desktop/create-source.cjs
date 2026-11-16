const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execFileSync: run } = require('node:child_process');
const root = path.resolve(__dirname,'..');
const wm = process.env.JJ_WORLD_MONITOR_SOURCE || path.resolve(root,'../worldmonitor');
const output = process.env.JJ_OUTPUT_DIR || path.resolve(root,'../outputs');
const stage = fs.mkdtempSync(path.join(os.tmpdir(),'jj-equity-source-'));
const dest = path.join(stage,'J&J-Equity-Source');
fs.mkdirSync(dest); fs.mkdirSync(output,{recursive:true});
function sourceFilter(base) { return source => { const rel=path.relative(base,source).split(path.sep); return !rel.some(p => ['node_modules','.git','.next','dist','runtime','.env','.env.local','.api-key','.DS_Store'].includes(p) || p.endsWith('.db') || p.includes('.db-')); }; }
fs.cpSync(root,path.join(dest,'openterminal'),{recursive:true,filter:sourceFilter(root)});
fs.mkdirSync(path.join(dest,'worldmonitor'));
if(fs.existsSync(path.join(wm,'.git'))) {
  const archive=path.join(stage,'worldmonitor.tar');
  run('git',['-C',wm,'archive','--format=tar','-o',archive,'HEAD']);
  run('tar',['-xf',archive,'-C',path.join(dest,'worldmonitor')]);
} else fs.cpSync(wm,path.join(dest,'worldmonitor'),{recursive:true,filter:sourceFilter(wm)});
fs.writeFileSync(path.join(dest,'BUILD.md'),`# J&J Equity 1.2.0\n\nApple Silicon macOS build. Requires Node.js 24, npm, Apple command-line tools, and Internet access.\n\nKeep openterminal and worldmonitor side by side. From openterminal run:\n\n    npm ci\n    npm run desktop:build\n\nThe build compiles the upstream headless intelligence API handlers and native J&J Equity widgets, includes Node.js, and creates an ad-hoc-signed DMG in the sibling outputs folder. No Apple Developer certificate is included.\n\nThe app uses the public cloud fallback implemented by World Monitor's official sidecar. Premium features and credential-dependent sources retain their upstream access requirements. The source trees contain no portfolio databases, personal API keys, or environment files.\n`);
fs.writeFileSync(path.join(dest,'SOURCE-NOTICES.md'),`# Source and licence notices\n\nJ&J Equity combines OpenTerminal (ErTasselli/openterminal, MIT) and World Monitor (koala73/worldmonitor, AGPL-3.0-only). The J&J integration source is provided under AGPL-3.0-only. Preserve both upstream licences and attribution. This is an independently assembled application, not an official World Monitor release.\n\nWorld Monitor source revision: 59fe6bbc15082888aeb01295c3615dab5d1c1a04, version 2.11.6. Its complete original source and vendor patches are in worldmonitor/. Integration and build scripts are in openterminal/desktop/. Exact npm dependency resolutions are in each package-lock.json. Third-party dependencies retain their respective licences.\n\nWorld Monitor copyright (C) 2024-2026 Elie Habib. Full AGPL licence: worldmonitor/LICENSE. OpenTerminal licence: openterminal/LICENSE.\n`);
run('ditto',['-c','-k','--sequesterRsrc','--keepParent',dest,path.join(output,'J&J-Equity-Source.zip')]);
console.log('Source archive created');
