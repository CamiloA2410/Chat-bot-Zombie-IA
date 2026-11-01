// =====================================================
//  LÓGICA DEL JUEGO
// =====================================================

// Dificultad cambiada:
const MAX_TURNOS = 7;
const META = 100;

let confianza = 10;
let turnos = MAX_TURNOS;
let terminado = false;
const historial = [];

const chat = document.getElementById("chat");
const formulario = document.getElementById("formulario");
const entrada = document.getElementById("entrada");
const zombie = document.getElementById("zombie");
const barra = document.getElementById("confianza");
const estado = document.getElementById("estado");
const marcadorTurnos = document.getElementById("turnos");

// Reproducción de efectos de sonido usando Web Audio API
function reproducirSonido(tipo) {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);

  if (tipo === "victoria") {
    osc.type = "sine";
    osc.frequency.setValueAtTime(440, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);

  } else if (tipo === "derrota") {
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(300, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.6);
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.6);
  }
}

function agregarMensaje(texto, clase) {
  const div = document.createElement("div");
  div.className = "msg " + clase;
  div.textContent = texto;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;

  const voz = new SpeechSynthesisUtterance(texto);
voz.lang = "es-ES";
speechSynthesis.speak(voz);
}

function actualizarPantalla() {
  confianza = Math.max(0, Math.min(META, confianza));
  const porcentaje = (confianza / META) * 100;
  barra.style.width = porcentaje + "%";
  barra.style.background = confianza < 25 ? "#ff1744" : confianza < 60 ? "#ffb400" : "#4caf50";
  estado.textContent = `Confianza: ${confianza} / ${META}`;
  marcadorTurnos.textContent = `Turnos restantes: ${turnos}`;

  zombie.className = "zombie";
  if (confianza >= 60) { zombie.textContent = "🧠"; zombie.classList.add("feliz"); }
  else if (confianza < 25) { zombie.textContent = "🩸"; zombie.classList.add("enojado"); }
  else { zombie.textContent = "🧟"; }
}

function terminar(gano) {
  terminado = true;
  entrada.disabled = true;
  formulario.querySelector("button").disabled = true;
  if (gano) {
    reproducirSonido("victoria");
    agregarMensaje("🧪 Gru te entrego el frasco con la vacuna secreta. ¡GANASTE!", "zombie-msg");
  } else {
    reproducirSonido("derrota");
    agregarMensaje("💀 Gru sucumbió a la infección y te atacó. GAME OVER.", "zombie-msg");
  }
}

formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  if (terminado) return;

  const texto = entrada.value.trim();
  if (!texto) return;
  entrada.value = "";
  agregarMensaje(texto, "jugador");

  entrada.disabled = true;
  formulario.querySelector("button").disabled = true;


  // Verificación de Palabra Mágica Secreta (+50 confianza)
  const textoNormalizado = normalizar(texto);
  let esMagica = false;
  if (textoNormalizado.includes("antidoto")) {
    confianza += 50;
    esMagica = true;
  }

  
  const ia = await consultarDragonIA(texto, historial);
  const intencion = detectarIntencion(texto);
  let sentimiento, cambio, respuesta;

  if (ia && ia.sentimiento !== null) {
    sentimiento = ia.sentimiento;
    cambio = sentimiento * 2.5;
    respuesta = ia.respuesta;
  } else if (ia) {
    sentimiento = analizarSentimiento(texto);
    cambio = sentimiento * 6;
    respuesta = ia.respuesta;
  } else {
    sentimiento = analizarSentimiento(texto);
    cambio = sentimiento * 6;
  }

  if (!esMagica) {
    confianza += Math.round(Math.max(-25, Math.min(25, cambio)));
  }
  turnos--;

  if (!ia) {
    const humor = sentimiento >= 0 && confianza >= 25 ? "bien" : "mal";
    respuesta = RESPUESTAS[intencion][humor];
    if (esMagica) respuesta = "¡Esa palabra...! Abre mi mente. Confío en ti.";
  }

  agregarMensaje(respuesta, "zombie-msg");
  historial.push({ rol: "jugador", texto }, { rol: "zombie", texto: respuesta });

  actualizarPantalla();

  if (confianza >= META) terminar(true);
  else if (confianza <= 0 || turnos === 0) terminar(false);
  else {
    entrada.disabled = false;
    formulario.querySelector("button").disabled = false;
    entrada.focus();
  }
});

actualizarPantalla();
agregarMensaje("Un zombie tambaleante cuida un laboratorio... Te mira y murmura: «Grrr... ¿Humano?...»", "zombie-msg");

const voz = new SpeechSynthesisUtterance(texto);
voz.lang = "es-ES";
speechSynthesis.speak(voz);