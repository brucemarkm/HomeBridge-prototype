import {spawn,spawnSync} from 'node:child_process';
import {existsSync,mkdirSync,openSync,closeSync,readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
import {setTimeout as delay} from 'node:timers/promises';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const endpoint='http://127.0.0.1:3000';
async function healthy(){try{const r=await fetch(endpoint,{signal:AbortSignal.timeout(1500)});if(!r.ok)return false;const html=await r.text();if(!html.toLowerCase().includes('homebridge'))throw new Error('Port 3000 is serving another application. It was left untouched.');return true}catch(e){if(e.message?.includes('another application'))throw e;return false}}
if(await healthy()){console.log('Homebridge is already available on cloud port 3000.');process.exit(0)}
if(!existsSync(resolve(root,'node_modules/next/dist/bin/next')))throw new Error('Dependencies are missing. Run npm ci first.');
if(!existsSync(resolve(root,'.next/BUILD_ID'))){const built=spawnSync('npm',['run','build'],{cwd:root,stdio:'inherit'});if(built.status!==0)process.exit(built.status||1)}
mkdirSync(resolve(root,'.next'),{recursive:true});
const log=resolve(root,'.next/preview.log');
const fd=openSync(log,'a');
const child=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','0.0.0.0','--port','3000'],{cwd:root,detached:true,stdio:['ignore',fd,fd]});
closeSync(fd);
let failure;child.on('error',error=>{failure=error});child.unref();
for(let i=0;i<80;i++){if(failure)throw failure;if(await healthy()){writeFileSync(resolve(root,'.next/preview.pid'),String(child.pid));console.log('Homebridge is running in the background on cloud port 3000.');console.log('Use port 3000 in the cloud viewer. Logs: .next/preview.log');process.exit(0)}await delay(250)}
console.error('Homebridge did not become ready. Server output:');console.error(readFileSync(log,'utf8').slice(-4000));process.exit(1);
