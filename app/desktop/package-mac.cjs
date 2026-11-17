// Build the locally signed Apple Silicon application from verified release inputs.
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync: run } = require('node:child_process');
const { buildPaths } = require('./build-paths.cjs');
const { checksumFor, verifyArtifact } = require('./artifact-integrity.cjs');
const config = require('./package.json');

async function main() {
  if (process.platform !== 'darwin' || process.arch !== 'arm64') throw new Error('This package target requires an Apple Silicon Mac. Use the source build on other platforms.');
  const paths = buildPaths();
  const version = config.build.electronVersion;
  const work = path.resolve(process.env.JJ_PACKAGE_WORK || path.join(paths.buildRoot, 'mac-package'));
  const output = paths.outputRoot;
  const sourceArchive = path.join(output, 'J&J-Equity-Source.zip');
  for (const required of [paths.runtimeRoot, sourceArchive]) if (!fs.existsSync(required)) throw new Error(`Missing package input: ${required}`);
  fs.mkdirSync(work, { recursive: true });
  fs.mkdirSync(output, { recursive: true });
  const filename = `electron-v${version}-darwin-arm64.zip`;
  const zip = path.resolve(process.env.JJ_ELECTRON_ARCHIVE || path.join(work, filename));
  const checksums = path.resolve(process.env.JJ_ELECTRON_SHASUMS || path.join(work, `electron-v${version}-SHASUMS256.txt`));
  const release = `https://github.com/electron/electron/releases/download/v${version}`;
  if (!fs.existsSync(zip)) run('curl', ['--fail', '--location', '--retry', '2', `${release}/${filename}`, '-o', zip], {stdio:'inherit'});
  if (!fs.existsSync(checksums)) run('curl', ['--fail', '--location', '--retry', '2', `${release}/SHASUMS256.txt`, '-o', checksums], {stdio:'inherit'});
  await verifyArtifact(zip, checksumFor(fs.readFileSync(checksums, 'utf8'), filename));
  const unpack = path.join(work, 'unpack');
  fs.rmSync(unpack, {recursive:true,force:true});
  run('ditto', ['-x', '-k', zip, unpack]);
  const image = path.join(work, 'image');
  fs.rmSync(image, {recursive:true,force:true});
  fs.mkdirSync(image);
  const app = path.join(image, 'J&J Equity.app');
  fs.renameSync(path.join(unpack,'Electron.app'), app);
  const plist = path.join(app,'Contents/Info.plist');
  const resources = path.join(app,'Contents/Resources');
  const iconset = path.join(work, 'jj-equity.iconset');
  fs.mkdirSync(iconset, { recursive: true });
  for (const size of [16,32,128,256,512]) for (const scale of [1,2]) {
    const name = `icon_${size}x${size}${scale === 2 ? '@2x' : ''}.png`;
    run('sips', ['-z', String(size*scale), String(size*scale), path.join(__dirname,'assets/jj-equity.png'), '--out', path.join(iconset,name)], {stdio:'ignore'});
  }
  run('iconutil', ['-c','icns',iconset,'-o',path.join(resources,'jj-equity.icns')]);
  for (const [key, value] of Object.entries({CFBundleDisplayName:'J&J Equity',CFBundleName:'J&J Equity',CFBundleIdentifier:'com.jjequity.desktop',CFBundleShortVersionString:config.version,CFBundleVersion:config.version,CFBundleIconFile:'jj-equity.icns',LSApplicationCategoryType:'public.app-category.finance'})) run('plutil', ['-replace',key,'-string',value,plist]);
  fs.mkdirSync(path.join(resources,'app'));
  for(const name of ['main.cjs','package.json']) fs.copyFileSync(path.join(__dirname,name),path.join(resources,'app',name));
  fs.cpSync(paths.runtimeRoot,path.join(resources,'runtime'),{recursive:true,dereference:true});
  fs.rmSync(path.join(resources,'default_app.asar'),{force:true});
  fs.copyFileSync(sourceArchive,path.join(resources,'J&J-Equity-Source.zip'));
  run('xattr',['-cr',app]);
  run('codesign',['--force','--deep','--sign','-',app],{stdio:'inherit'});
  fs.symlinkSync('/Applications',path.join(image,'Applications'));
  run('hdiutil',['create','-volname','J&J Equity','-srcfolder',image,'-ov','-format','UDZO',path.join(output,`J&J-Equity-${config.version}-arm64.dmg`)],{stdio:'inherit'});
  console.log(`J&J Equity ${config.version} package created. This local signature is not Apple notarization.`);
}
main().catch(error => { console.error(error.message); process.exit(1); });
