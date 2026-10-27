import { Volt } from '../packages/core/src/index';
import { Elysia } from 'elysia';
import os from 'node:os';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
if (process.argv[2] === '--worker') {
  const mode = process.argv[3];
  const PreviousVolt = mode === 'Volt previous' ? (await import(resolve(process.env.BENCH_BASELINE!))).Volt : Volt;
  const server = mode === 'Elysia' ? new Elysia().get('/ping', () => ({message:'pong'})).get('/context', ({request}) => ({header:request.headers.get('x-test')})).listen({port:0,hostname:'127.0.0.1'}).server!
    : new PreviousVolt({port:0,hostname:'127.0.0.1',nativeRoutes:mode==='Volt native'}).get('/ping', () => ({message:'pong'})).get('/context', (c: { headers: Headers }) => ({header:c.headers.get('x-test')})).listen();
  console.log(server.port);
} else {
  const modes=process.env.BENCH_BASELINE ? ['Volt previous','Volt JS','Volt native','Elysia'] : ['Volt JS','Volt native','Elysia'];
  const results: Array<{mode:string;repeat:number;rps:number;p99:number;errors:number}>=[];
  for(let repeat=0;repeat<5;repeat++) for(const mode of [...modes.slice(repeat%modes.length),...modes.slice(0,repeat%modes.length)]) {
    const child=Bun.spawn([process.execPath,import.meta.path,'--worker',mode],{stdout:'pipe',stderr:'inherit'});
    try {
      const reader=child.stdout.getReader();const {value}=await reader.read();reader.releaseLock();
      const port=Number(new TextDecoder().decode(value).trim());if(!port)throw Error('Server startup failed');
      const url=`http://127.0.0.1:${port}/${process.env.BENCH_SCENARIO === 'context' ? 'context' : 'ping'}`;
      const response=await fetch(url);if(JSON.stringify(await response.json())!==JSON.stringify(process.env.BENCH_SCENARIO === 'context' ? {header:null} : {message:'pong'}))throw Error('Contract failed');
      async function measure(seconds:number) {
        const times:number[]=[];let errors=0;const begin=performance.now(),end=begin+seconds*1000;
        await Promise.all(Array.from({length:30},async()=>{while(performance.now()<end){const start=performance.now();try{const r=await fetch(url);await r.arrayBuffer();if(r.status!==200)errors++;}catch{errors++;}times.push(performance.now()-start);}}));
        const elapsed=(performance.now()-begin)/1000;times.sort((a,b)=>a-b);
        return {rps:Math.round((times.length-errors)/elapsed),p99:times[Math.floor(times.length*.99)]!,errors};
      }
      await measure(1);
      const row={mode,repeat:repeat+1,...await measure(2)};results.push(row);console.log(JSON.stringify(row));
    } finally{child.kill();await child.exited;}
  }
  const median=(a:number[])=>a.toSorted((a,b)=>a-b)[Math.floor(a.length/2)]!;
  console.table(modes.map(mode=>{const rows=results.filter(r=>r.mode===mode);return {mode,medianRps:median(rows.map(r=>r.rps)),minRps:Math.min(...rows.map(r=>r.rps)),maxRps:Math.max(...rows.map(r=>r.rps)),medianP99:median(rows.map(r=>r.p99)),errors:rows.reduce((s,r)=>s+r.errors,0)};}));
  await writeFile(process.env.BENCH_RESULT??'static-native-results.json',JSON.stringify({metadata:{scenario:process.env.BENCH_SCENARIO??'static',bun:Bun.version,cpu:os.cpus()[0]?.model,arch:process.arch,concurrency:30,repeats:5,duration:2},results},null,2));
  if(results.some(r=>r.errors))throw Error('Benchmark had HTTP errors');
}
