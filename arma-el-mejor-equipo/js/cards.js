// Cartas coleccionables: la rareza (marco de la carta) sale de las estrellas. Depende de: combat.js
const RARITY = [null,
  {key:'comun',  label:'Común'},
  {key:'bronce', label:'Bronce'},
  {key:'plata',  label:'Plata'},
  {key:'oro',    label:'Oro'},
  {key:'holo',   label:'Holográfica'}];
const rarity = a => RARITY[stars(a)];
const starText = n => '★'.repeat(n)+'☆'.repeat(5-n);

// Carta grande (subasta). flip = animación de volteo al salir.
function cardHTML(a,{flip=false}={}){
  const st=stars(a), r=RARITY[st];
  const bar=(icon,label,k)=>`<div class="tc-stat"><span>${icon} ${label}</span>
    <span class="tc-bar"><i class="c-${k}" style="width:${Math.round(a[k]/STAT_MAX[k]*100)}%"></i></span><b>${a[k]}</b></div>`;
  return `<article class="tcard r-${r.key}${flip?' flip':''}" aria-label="${a.name}, carta ${r.label}, ${st} de 5 estrellas">
    <div class="tc-face">
      <header class="tc-top"><h2 class="tc-name">${a.name}</h2><span class="tc-hp" title="Vida">${a.hp}<small>❤️</small></span></header>
      <div class="tc-art"><span class="tc-emoji">${a.emoji}</span></div>
      <div class="tc-rarity"><span class="tc-stars" aria-hidden="true">${starText(st)}</span>${r.label}</div>
      <p class="tc-move">Ataque especial: <b>${a.move}</b></p>
      ${bar('⚔️','Ataque','atk')}${bar('🛡️','Defensa','def')}${bar('⚡','Velocidad','spd')}
    </div>
  </article>`;
}

// Mini carta (equipos en la subasta y banca en la batalla). a = null → lugar libre.
function miniCard(a,extra=''){
  if(!a) return `<span class="mcard empty-slot" title="Lugar libre"></span>`;
  return `<span class="mcard r-${rarity(a).key} ${extra}" title="${a.name} (${rarity(a).label})">${a.emoji}</span>`;
}
