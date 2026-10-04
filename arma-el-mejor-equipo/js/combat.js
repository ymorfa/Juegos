// Fórmulas de combate, poder y estrellas. Depende de: animals.js
/* ---------- FÓRMULAS DE COMBATE ----------
 Daño      = POWER × Ataque × DEF_K ÷ (DEF_K + Defensa)   (mínimo 1)
             La defensa reduce un % que crece cada vez menos (100 de defensa = la mitad del daño), así
             nunca hay animales invencibles y cada punto de defensa vale lo mismo en "vida efectiva".
 Velocidad = barra de turnos: cada animal actúa cada 1000 ÷ (Velocidad + SPD_BASE) unidades de tiempo.
             El más rápido empieza y ataca más seguido; SPD_BASE evita que la diferencia sea exagerada.
 Suerte    = daño ×0.85–1.00 y 1/16 de crítico ×1.5 (solo en "modo suerte"). */
const POWER = 0.5, DEF_K = 100, SPD_BASE = 60;
const interval = a => 1000/(a.spd+SPD_BASE);
// Poder de pelea ≈ √(daño por tiempo × vida efectiva); las estrellas son quintiles entre todos los animales.
const power = a => Math.sqrt(a.atk*(a.spd+SPD_BASE) * a.hp*(DEF_K+a.def));
const ALL_ANIMALS = Object.values(BIOMES).flatMap(b=>b.animals);
const POWER_RANK = ALL_ANIMALS.map(power).sort((x,y)=>x-y);
function stars(a){return 1+Math.min(4,Math.floor(5*POWER_RANK.indexOf(power(a))/POWER_RANK.length));}

function calcDamage(att,def){
  const base = POWER*att.atk*DEF_K/(DEF_K+def.def);
  if(!S.dice) return {dmg:Math.max(1,Math.round(base)), crit:false};
  const crit = Math.random()<1/16;
  const roll = 0.85 + Math.random()*0.15;
  return {dmg:Math.max(1,Math.round(base*roll*(crit?1.5:1))), crit};
}

// Atributos que se muestran con iconos (alineación); STAT_MAX = el más alto de todos los animales
const STATS = [['hp','❤️','Vida'],['atk','⚔️','Ataque'],['def','🛡️','Defensa'],['spd','⚡','Velocidad']];
const STAT_MAX = Object.fromEntries(STATS.map(([k])=>[k,Math.max(...ALL_ANIMALS.map(a=>a[k]))]));
