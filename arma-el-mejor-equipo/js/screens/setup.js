
/* ---------- INICIO ---------- */
// Abanico de 5 cartas, una de cada rareza (de común a holográfica), del bioma elegido.
function fanHTML(biome){
  const list=BIOMES[biome].animals;
  return [1,2,3,4,5].map(st=>{
    const tier=list.filter(a=>stars(a)===st);
    return tier.length?miniCard(tier.reduce((m,a)=>power(a)>power(m)?a:m),'fan-card'):'';
  }).join('');
}
function renderSetup(){
  const prev = S || {};
  const n1 = prev.players ? prev.players[0].name : 'Jugador 1';
  const n2 = prev.players ? prev.players[1].name : 'Jugador 2';
  const size = prev.teamSize || 5, dice = prev.dice !== undefined ? prev.dice : true;
  const raffle = !!prev.raffle, biome = prev.biome || 'tierra';
  document.documentElement.dataset.biome = biome;
  app.innerHTML = `
  <div class="screen">
    <header class="hero">
      <h1 class="logo">Arma el Mejor Equipo</h1>
      <div class="fan" id="fan" aria-hidden="true">${fanHTML(biome)}</div>
    </header>
    <div class="panel setup">
      <fieldset>
        <legend>¿Con qué animales juegan?</legend>
        <div class="seg biome-pick">${Object.entries(BIOMES).map(([k,b])=>`<label><input type="radio" name="biome" value="${k}" ${k===biome?'checked':''}><span>${b.label}<small>${b.animals.length} animales</small></span></label>`).join('')}</div>
      </fieldset>
      <div class="grid2 stack">
        <label class="field f1">Jugador 1<input id="n1" maxlength="14" value="${esc(n1)}"></label>
        <label class="field f2">Jugador 2<input id="n2" maxlength="14" value="${esc(n2)}"></label>
      </div>
      <fieldset>
        <legend>Animales por equipo</legend>
        <div class="seg nums">${[3,4,5,6,7,8].map(v=>`<label><input type="radio" name="size" value="${v}" ${v===size?'checked':''}><span>${v}</span></label>`).join('')}</div>
      </fieldset>
      <label class="check"><input type="checkbox" id="dice" ${dice?'checked':''}><span>🎲 Modo suerte<small>Golpes críticos y daño que cambia un poco en cada ataque.</small></span></label>
      <label class="check"><input type="checkbox" id="raffle" ${raffle?'checked':''}><span>🎁 Sorteo<small>Si nadie quiere un animal, a veces se le regala a uno de los dos.</small></span></label>
      <div class="setup-go">
        <p>Cada quien empieza con <b>💰 ${START_PTS} puntos</b>.</p>
        <button class="btn big primary" id="start">Empezar la subasta 🔨</button>
      </div>
    </div>
    <details class="panel rules">
      <summary>¿Cómo se juega?</summary>
      <ol>
        <li>Cada quien empieza con ${START_PTS} puntos. Sale un animal al azar y, por turnos, cada quien sube la oferta (+1, +5, +10 o todos sus puntos) o dice <b>Paso</b>.</li>
        <li>Si pasas, ya no puedes volver a ofrecer por ese animal: si el otro ofrece aunque sea 1 punto, se lo lleva.</li>
        <li>Si alguien pasa mientras el otro va ganando, el que va ganando se lleva al animal y paga su oferta.</li>
        <li>El marco de cada carta dice qué tan fuerte es el animal: común, bronce, plata, oro y holográfica (la más fuerte).</li>
        <li>Si nadie ofrece nada, el animal regresa a la bolsa y puede volver a salir más adelante. Con el <b>Sorteo</b> activado, a veces se le regala a uno de los dos al azar.</li>
        <li>Si a ninguno le quedan puntos, o nadie quiere ninguno de los animales que quedan, se termina la subasta.</li>
        <li>Con los equipos listos, cada quien acomoda su orden de pelea en secreto y ¡a la arena! Pelean uno contra uno; el ganador se queda con la vida que le sobre.</li>
        <li>⚔️ Más <b>Ataque</b> = más daño. 🛡️ La <b>Defensa</b> lo reduce, pero nunca a cero (100 de defensa = la mitad del daño).</li>
        <li>⚡ El más <b>veloz</b> ataca primero y además ataca más seguido.</li>
      </ol>
    </details>
  </div>`;
  app.querySelectorAll('[name="biome"]').forEach(r=>r.onchange=()=>{
    document.documentElement.dataset.biome=r.value; $('#fan').innerHTML=fanHTML(r.value);
  });
  $('#start').onclick = () => {
    const startPts = START_PTS, biome = $('[name="biome"]:checked').value;
    S = {
      players:[
        {name:$('#n1').value.trim()||'Jugador 1', pts:startPts, team:[]},
        {name:$('#n2').value.trim()||'Jugador 2', pts:startPts, team:[]}
      ],
      startPts, teamSize:+$('[name="size"]:checked').value, dice:$('#dice').checked, raffle:$('#raffle').checked, biome,
      pool:shuffle(BIOMES[biome].animals.slice()), rejected:new Set(), starter:Math.random()<.5?0:1, auc:null
    };
    nextAnimal();
  };
}
