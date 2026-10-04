// Utilidades compartidas por todos los juegos (scripts clásicos: todo queda global).
const $ = s => document.querySelector(s);
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

// Pantalla para pasar el dispositivo a un jugador sin que el otro vea (para información secreta).
// opts: {title, who, whoClass, other, button, onReady}
function passDevice(root, {title, who, whoClass='', other, button, onReady}){
  window.scrollTo(0,0);
  root.innerHTML=`<div class="screen">
    <h2 class="title">${title}</h2>
    <div class="panel secret">
      <div class="eye" aria-hidden="true">🙈</div>
      <p>Pásale el dispositivo a <span class="who ${whoClass}">${who}</span>.<br>${other}, ¡no se vale mirar!</p>
      <button class="btn big primary" id="reveal">${button}</button>
    </div></div>`;
  root.querySelector('#reveal').onclick=onReady;
}

function confetti(){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const bits=['🎉','⭐','🎊','✨','🏆','🎈'];
  for(let i=0;i<40;i++){
    const c=document.createElement('span');c.className='confetti';
    c.textContent=bits[i%bits.length];
    c.style.left=Math.random()*100+'vw';
    c.style.animationDuration=(2.2+Math.random()*2)+'s';
    c.style.animationDelay=(Math.random()*.8)+'s';
    document.body.appendChild(c); setTimeout(()=>c.remove(),5200);
  }
}
