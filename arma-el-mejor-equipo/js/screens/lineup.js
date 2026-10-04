
/* ---------- ALINEACIÓN ---------- */
// 1 a 5 iconos según qué tan alto es el valor comparado con el máximo de todos los animales
function statIcons(a,[k,icon,label]){
  const n=Math.max(1,Math.ceil(a[k]/STAT_MAX[k]*5));
  return `<span class="ic" title="${label}: ${a[k]}" aria-label="${label} ${a[k]}">${icon.repeat(n)}<span class="off">${icon.repeat(5-n)}</span><b>${a[k]}</b></span>`;
}
function teamList(i){
  const p=S.players[i];
  const rows = p.team.length ? p.team.map((a,k)=>`
    <div class="tl-row r-${rarity(a).key}"><span class="tl-num">${k+1}</span>${miniCard(a)}
      <span class="tl-name">${a.name}<small><span aria-hidden="true">${starText(stars(a))}</span> ${rarity(a).label}</small></span>
      <span><button class="mini" aria-label="Subir a ${a.name}" data-t="${i}" data-k="${k}" data-d="-1" ${k===0?'disabled':''}>▲</button><button class="mini" aria-label="Bajar a ${a.name}" data-t="${i}" data-k="${k}" data-d="1" ${k===p.team.length-1?'disabled':''}>▼</button></span>
      <div class="tl-stats">${STATS.map(st=>statIcons(a,st)).join('')}</div>
    </div>`).join('') : '<div class="empty">Este equipo no tiene animales 😢</div>';
  return `<div class="tl c${i+1}"><div class="tl-head"><h3>${pname(i)}</h3><small>Le sobraron 💰 ${p.pts}</small></div>${rows}</div>`;
}
// Cada jugador acomoda su equipo en una pantalla aparte, con una pantalla de "pásale el dispositivo" antes,
// para que ninguno vea el orden del otro.
function renderLineup(i=0,show=false){
  S.auc=null;
  if(i>1){runBattle();return;}
  if(!S.players[i].team.length){renderLineup(i+1);return;}
  if(!show){
    passDevice(app,{title:'Orden secreto', who:pname(i), whoClass:`pc${i+1}`, other:pname(1-i),
      button:`Soy ${pname(i)}, ver mi equipo 👀`, onReady:()=>renderLineup(i,true)});
    return;
  }
  window.scrollTo(0,0);
  const last = i===1 || !S.players[1].team.length;
  app.innerHTML=`<div class="screen">
    <h2 class="title">Tu orden de pelea</h2>
    <p class="sub">Acomoda a tus animales con las flechas. El número 1 sale primero a la arena.</p>
    <div class="sorter"><span>Acomodar rápido, el más alto primero</span>
      ${STATS.map(([k,icon,label])=>`<button class="btn" data-sort="${k}">${icon} ${label}</button>`).join('')}
      <button class="btn" data-sort="power">⭐ Poder</button></div>
    ${teamList(i)}
    <button class="btn big primary wide" id="done">${last?'¡Listo, a pelear! ⚔️':'Listo, esconder mi equipo 🙈'}</button></div>`;
  app.querySelectorAll('.mini').forEach(b=>b.onclick=()=>{
    const t=S.players[i].team, k=+b.dataset.k, j=k+(+b.dataset.d);
    [t[k],t[j]]=[t[j],t[k]]; renderLineup(i,true);
  });
  app.querySelectorAll('[data-sort]').forEach(b=>b.onclick=()=>{
    const k=b.dataset.sort, val=a=>k==='power'?power(a):a[k];
    S.players[i].team.sort((x,y)=>val(y)-val(x)); renderLineup(i,true);
  });
  $('#done').onclick=()=>renderLineup(i+1);
}
