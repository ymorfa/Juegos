
/* ---------- RESULTADO ---------- */
function renderResult(w){
  battleToken++;
  let body;
  if(w<0){
    body=`<h1 class="logo">¡Empate!</h1><div class="panel"><p>Ningún equipo tiene animales. ¡Hay que ofrecer más en la subasta!</p></div>`;
  } else {
    const all=[...(S.T?S.T[0]:[]),...(S.T?S.T[1]:[])];
    const mvp=all.length?all.reduce((m,a)=>a.kos>m.kos?a:m,all[0]):null;
    const surv=(S.T?S.T[w]:[]).filter(a=>!a.out);
    body=`<header class="result-head"><div class="trophy" aria-hidden="true">🏆</div><h1 class="logo">¡Gana ${pname(w)}!</h1></header>
      <div class="auction">
        ${mvp&&mvp.kos?`<div class="card-spot"><p class="left">⭐ Jugador estrella: derrotó a ${mvp.kos} rival${mvp.kos===1?'':'es'}</p>${cardHTML(mvp,{flip:true})}</div>`:''}
        <div class="panel">
          <p>Siguen de pie: ${surv.map(a=>`${a.emoji} <b>${a.name}</b> (${a.cur} ❤️)`).join(', ')||'todo el equipo'}</p>
          <p>💰 Puntos que sobraron: ${pname(0)} ${S.players[0].pts}, ${pname(1)} ${S.players[1].pts}</p>
        </div>
      </div>`;
  }
  app.innerHTML=`<div class="screen result">${body}
    <div class="row-btns">
      ${w>=0?`<button class="btn big primary" id="again">🔁 Revancha con los mismos equipos</button>
      <button class="btn big" id="order">🔀 Cambiar el orden y volver a pelear</button>`:''}
      <button class="btn big" id="new">🆕 Nueva subasta</button>
    </div></div>`;
  if(w>=0){$('#again').onclick=runBattle; $('#order').onclick=()=>renderLineup(); confetti();}
  $('#new').onclick=()=>renderSetup();
}
