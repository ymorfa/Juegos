// Simulación de balance: cada animal pelea contra todos los demás de su grupo, sin suerte, usando
// exactamente las fórmulas del juego (js/animals.js + js/combat.js).
// Uso: node tools/balance.js            → % de victorias por animal y estrellas
const fs=require('fs'), path=require('path'), vm=require('vm');
const ctx={S:{dice:false}};
vm.createContext(ctx);
for(const f of ['animals.js','combat.js'])
  vm.runInContext(fs.readFileSync(path.join(__dirname,'..','js',f),'utf8'),ctx,{filename:f});
const {BIOMES,calcDamage,interval,stars}=vm.runInContext('({BIOMES,calcDamage,interval,stars})',ctx);

// Igual que runBattle() pero 1 contra 1; los empates de velocidad se prueban en ambos órdenes.
function fight(A,B){
  let wins=0,hits=0;
  for(const tie of [0,1]){
    const f=[{...A,cur:A.hp,next:interval(A)},{...B,cur:B.hp,next:interval(B)}];
    for(;;){
      const s=f[0].next<f[1].next?0:f[1].next<f[0].next?1:tie;
      f[1-s].cur-=calcDamage(f[s],f[1-s]).dmg; hits++;
      if(f[1-s].cur<=0) break;
      f[s].next+=interval(f[s]);
    }
    if(f[0].cur>0) wins++;
  }
  return {w:wins/2,hits:hits/2};
}
for(const [key,b] of Object.entries(BIOMES)){
  const list=b.animals, rows=list.map(a=>({a,w:0}));
  let H=0,n=0,oneHit=0;
  list.forEach((a,i)=>list.forEach((d,j)=>{ if(i===j) return;
    const r=fight(a,d); rows[i].w+=r.w; H+=r.hits; n++; if(r.hits<=1) oneHit++; }));
  rows.sort((x,y)=>y.w-x.w);
  console.log(`\n== ${b.label} (${list.length} animales): ${(H/n).toFixed(1)} golpes por pelea, ${(100*oneHit/n).toFixed(0)}% se acaban de 1 golpe`);
  for(const r of rows) console.log(`${r.a.emoji} ${r.a.name.padEnd(24)} ${String(Math.round(100*r.w/(list.length-1))).padStart(3)}%  ${'★'.repeat(stars(r.a))}`);
}
