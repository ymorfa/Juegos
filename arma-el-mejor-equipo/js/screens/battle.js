
/* ---------- BATALLA ---------- */
let battleToken=0, speed=1;
const sleep = ms => new Promise(r=>setTimeout(r, ms/speed));

function hpColor(p){return p>.5?'var(--spd)':p>.2?'var(--gold)':'var(--hp)';}
function setTag(s,f){
  const pct=f.cur/f.hp;
  $('#tag'+s).innerHTML=`<div class="tname">${f.emoji} ${f.name}</div>
    <div class="hpbar"><i style="width:${pct*100}%;background:${hpColor(pct)}"></i></div>
    <div class="hpnum">${f.cur}/${f.hp} ❤️</div>`;
}
function say(html){$('#say').innerHTML=html;}
function renderBench(s,now){
  $('#bench'+s).innerHTML=`<span class="bname">${pname(s)}</span>`+
    S.T[s].map((a,k)=>miniCard(a,`${a.out?'out':''} ${k===now&&!a.out?'now':''}`)).join('');
}
function replay(el,cls){el.classList.remove('atk','hit','faint','enter');void el.offsetWidth;el.classList.add(cls);}
function popDamage(s,txt,crit){
  const d=document.createElement('div');d.className='dmg'+(crit?' crit':'');d.textContent=txt;
  $('#fw'+s).appendChild(d); setTimeout(()=>d.remove(),1200);
}
async function enter(s,f,idx){
  $('#fe'+s).textContent=f.emoji; setTag(s,f); renderBench(s,idx);
  replay($('#fw'+s),'enter');
  say(`¡<span class="who pc${s+1}">${pname(s)}</span> manda a <b>${f.name}</b> ${f.emoji}!`);
  await sleep(1000);
}
function setSpeed(v){
  speed=v;
  ['sp1','sp2'].forEach(id=>{const b=$('#'+id);if(b)b.classList.toggle('on',(id==='sp1'&&v===1)||(id==='sp2'&&v===2.5));});
}

async function runBattle(){
  const tok=++battleToken; speed=1;
  S.T=[0,1].map(i=>S.players[i].team.map(a=>({...a,cur:a.hp,kos:0,out:false})));
  const T=S.T;
  if(!T[0].length||!T[1].length){renderResult(T[0].length?0:T[1].length?1:-1);return;}
  app.innerHTML=`<div class="screen">
    <div class="arena">
      <div class="sunball"></div>${S.biome==='mar'?'<span class="cloud a">🫧</span><span class="cloud b">🐠</span>':'<span class="cloud a">☁️</span><span class="cloud b">☁️</span>'}
      <div class="vs">VS</div>
      ${[0,1].map(s=>`<div class="side s${s}"><div class="tag c${s+1}" id="tag${s}"></div>
        <div class="fwrap" id="fw${s}"><span class="bob"><span class="femo" id="fe${s}"></span></span></div><div class="shadow"></div></div>`).join('')}
    </div>
    <div class="bubble" id="say" aria-live="polite">¡Prepárense!</div>
    <div class="grid2"><div class="bench c1" id="bench0"></div><div class="bench c2" id="bench1"></div></div>
    <div class="controls">
      <button class="btn on" id="sp1">▶ Normal</button>
      <button class="btn" id="sp2">⏩ Rápido</button>
      <button class="btn" id="skip">⏭️ Ir al final</button>
    </div></div>`;
  $('#sp1').onclick=()=>setSpeed(1); $('#sp2').onclick=()=>setSpeed(2.5); $('#skip').onclick=()=>setSpeed(200);
  const alive=()=>tok===battleToken;
  const idx=[0,0];
  // barra de turnos: cada animal tiene la hora de su próximo ataque (next); el que entra empieza desde "ahora"
  T[0][0].next=interval(T[0][0]); T[1][0].next=interval(T[1][0]);
  await enter(0,T[0][0],0); if(!alive())return;
  await enter(1,T[1][0],0); if(!alive())return;

  while(idx[0]<T[0].length && idx[1]<T[1].length){
    const f=[T[0][idx[0]],T[1][idx[1]]];
    const s = f[0].next<f[1].next?0:f[1].next<f[0].next?1:(Math.random()<.5?0:1);
    const o=1-s, att=f[s], def=f[o], now=att.next;
    att.next+=interval(att);
    say(`${att.emoji} <b>${att.name}</b> usa <b class="pc${s+1}">${att.move}</b>!`);
    replay($('#fw'+s),'atk');
    await sleep(320); if(!alive())return;
    const {dmg,crit}=calcDamage(att,def);
    def.cur=Math.max(0,def.cur-dmg);
    replay($('#fw'+o),'hit'); popDamage(o,(crit?'¡CRÍTICO! ':'')+'-'+dmg,crit); setTag(o,def);
    await sleep(crit?1100:800); if(!alive())return;
    if(def.cur<=0){
      att.kos++; def.out=true;
      replay($('#fw'+o),'faint');
      say(`💫 ¡<b>${def.name}</b> ya no puede seguir! Gana <b>${att.name}</b> ${att.emoji}`);
      renderBench(o,-1);
      await sleep(1300); if(!alive())return;
      idx[o]++;
      if(idx[o]<T[o].length){const nf=T[o][idx[o]]; nf.next=now+interval(nf); await enter(o,nf,idx[o]); if(!alive())return;}
    }
  }
  await sleep(500); if(!alive())return;
  renderResult(idx[0]<T[0].length?0:1);
}
