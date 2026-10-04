
/* ---------- SUBASTA ---------- */
// null = la subasta sigue; '' = terminó normal; texto = terminó por otra razón
function overReason(){
  if((full(0)&&full(1))||!S.pool.length) return '';
  if(broke()) return S.raffle ? null : 'Ya no les quedan puntos para ofrecer, así que se termina la subasta.';
  if(S.pool.every(a=>S.rejected.has(a.id))) return 'Nadie quiere ninguno de los animales que quedan, así que se termina la subasta.';
  return null;
}
function playerPanel(i){
  const p = S.players[i], u = S.auc;
  const active = u && !u.done && u.turn===i;
  let slots='';
  for(let k=0;k<S.teamSize;k++) slots+=miniCard(p.team[k]);
  return `<div class="pp c${i+1} ${active?'active':''}">
    <div class="pp-top"><span class="pp-name">${pname(i)}</span><span class="pp-pts" title="Puntos">💰 ${p.pts}</span></div>
    <div class="slots">${slots}</div></div>`;
}
function canBid(i){return !full(i) && S.players[i].pts > S.auc.bid;}

function renderAuction(animateCard){
  const u=S.auc, a=u.animal;
  let zone;
  if(u.done){
    const why=overReason(), over=why!==null;
    zone = `<p class="banner">${u.msg}</p>
      ${why?`<p class="hint">${why}</p>`:''}
      <button class="btn big primary wide" id="next">${over?'¡Ver los equipos! 🏟️':'Siguiente animal ▶'}</button>`;
  } else {
    const t=u.turn, can=canBid(t)&&!u.locked, pts=S.players[t].pts;
    // si el rival ya pasó (u.passes===1, sin ofertas) está fuera: basta 1 punto para llevárselo
    const alone=u.passes===1;
    const steps=alone
      ? `<button class="btn bid" data-n="1" ${!can?'disabled':''}>¡Me lo llevo por 1 punto! 🙌</button>`
      : [1,5,10].map(n=>`<button class="btn bid" data-n="${n}" ${(!can||u.bid+n>pts)?'disabled':''}>+${n}</button>`).join('')
        +`<button class="btn bid" data-n="all" ${!can?'disabled':''}>¡Todo! (${pts})</button>`;
    const rival=u.leader>=0&&u.leader!==t;
    zone = `<div class="turn c${t+1}">Turno de ${pname(t)}</div>
      <p class="offer">${u.leader<0?'Nadie ha ofrecido todavía.':`Va ganando <span class="who pc${u.leader+1}">${pname(u.leader)}</span> con <b class="offer-num">${u.bid}</b> puntos`}</p>
      ${u.msg?`<p class="hint">${u.msg}</p>`:''}
      <div class="bids c${t+1}">${steps}</div>
      <button class="btn wide" id="pass" ${u.locked?'disabled':''}>${rival?`Me rindo, que se lo lleve ${pname(u.leader)} 🏳️`:'Paso 🙅'}</button>`;
  }
  app.innerHTML = `<div class="screen">
    <div class="grid2">${playerPanel(0)}${playerPanel(1)}</div>
    <div class="auction">
      <div class="card-spot">${cardHTML(a,{flip:!!animateCard})}<p class="left">Quedan ${S.pool.length} en la bolsa</p></div>
      <div class="panel bidzone">${zone}</div>
    </div></div>`;
  if(u.done){$('#next').onclick=nextAnimal;}
  else{
    app.querySelectorAll('.bid').forEach(b=>b.onclick=()=>doBid(b.dataset.n));
    $('#pass').onclick=()=>doPass();
  }
}

function nextAnimal(){
  if(overReason()!==null){renderLineup();return;}
  const a=S.pool.pop();
  S.auc={animal:a,bid:0,leader:-1,turn:S.starter,passes:0,done:false,msg:'',locked:false};
  S.starter=1-S.starter;
  const e=elig();
  if(e.length===1){award(e[0],0,`porque el equipo de ${pname(1-e[0])} ya está completo`,true);return;}
  // solo llega aquí con el sorteo activado (si no, overReason ya terminó la subasta)
  if(broke()){award(e[Math.random()*e.length|0],0,'por sorteo 🎲, porque a nadie le quedan puntos',true);return;}
  renderAuction(true); autoCheck();
}
function doBid(n){
  const u=S.auc, p=u.turn;
  u.bid = n==='all' ? S.players[p].pts : u.bid + (+n);
  if(u.passes>0){award(p,u.bid);return;}   // el otro ya pasó y no puede volver a ofrecer
  u.leader=p; u.msg=''; u.turn=1-p;
  renderAuction(); autoCheck();
}
function autoCheck(){
  const u=S.auc; if(u.done) return;
  if(!canBid(u.turn)){
    u.msg = `${pname(u.turn)} ${full(u.turn)?'ya tiene su equipo completo':'no tiene puntos suficientes'}…`;
    u.locked=true; renderAuction();
    setTimeout(()=>{ if(S.auc===u && !u.done) doPass(); },1300);
  }
}
function doPass(){
  const u=S.auc, p=u.turn; u.locked=false;
  if(u.leader>=0 && u.leader!==p){award(u.leader,u.bid);return;}
  u.passes++;
  if(u.passes>=2){resolveNoBids();return;}
  u.msg=`${pname(p)} pasó y ya no puede ofrecer por este animal. ¿Lo quieres tú?`; u.turn=1-p;
  renderAuction(); autoCheck();
}
function resolveNoBids(){
  const u=S.auc, e=elig();
  if(S.raffle && Math.random()<.5){award(e[Math.random()*e.length|0],0,'por sorteo 🎲');return;}
  // regresa a la bolsa en un lugar al azar (nunca como el siguiente, salvo que sea el único)
  S.pool.splice(Math.floor(Math.random()*S.pool.length),0,u.animal);
  S.rejected.add(u.animal.id);
  u.done=true;
  u.msg=`Nadie quiso al <b>${u.animal.name}</b> ${u.animal.emoji}. ¡Regresa ${BIOMES[S.biome].home} y podría volver a salir!`;
  renderAuction();
}
function award(p,price,why,fresh){
  const u=S.auc, pl=S.players[p];
  pl.pts-=price; pl.team.push(u.animal); u.done=true; S.rejected.clear();
  u.msg = price>0
    ? `🎉 ¡<span class="who pc${p+1}">${pname(p)}</span> se lleva al <b>${u.animal.name}</b> ${u.animal.emoji} por <b>${price}</b> punto${price===1?'':'s'}!`
    : `🎁 ¡<span class="who pc${p+1}">${pname(p)}</span> se lleva al <b>${u.animal.name}</b> ${u.animal.emoji} gratis ${why}!`;
  renderAuction(!!fresh);
}
