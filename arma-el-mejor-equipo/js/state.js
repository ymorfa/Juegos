// Estado global de la partida. S se crea en screens/setup.js; todas las pantallas lo leen y modifican.
const app = document.getElementById('app');
const START_PTS = 100;
let S = null;

const full = i => S.players[i].team.length >= S.teamSize;
const pname = i => esc(S.players[i].name);
const elig = () => [0,1].filter(i=>!full(i));
const broke = () => elig().every(i=>S.players[i].pts===0);
