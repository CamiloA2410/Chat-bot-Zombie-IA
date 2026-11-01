// =====================================================
//  CEREBRO DEL ZOMBIE
// =====================================================

// Léxico expandido con 10 nuevas palabras
const LEXICO = {
  // positivas
  gracias: 2, favor: 1, hermoso: 3, hermoso: 3, genial: 3,
  grande: 1, poderoso: 3, increible: 3, amigo: 2, amable: 2, valiente: 2,
  admiro: 3, respeto: 2, bonito: 2, bueno: 2, buena: 2, quiero: 1,
  ayuda: 1, ayudar: 1, feliz: 2, gusto: 2, encanta: 3, amo: 3, mejor: 2,
  vacuna: 3, salvar: 2, cura: 3, vida: 2, humano: 2,

  // negativas
  feo: -3, fea: -3, tonto: -3, estupido: -4, idiota: -4, odio: -4,
  malo: -2, mala: -2, miedo: -1, mata: -3, matar: -3, muere: -3,
  basura: -4, aburrido: -3, gordo: -3, inutil: -3, cobarde: -3,
  callate: -3, horrible: -3, asco: -3, peor: -2, nunca: -1, robar: -3,
  infectado: -3, podrido: -4, morder: -3, apestas: -4, cerebro: -2
};

const NEGADORES = ["no", "nunca", "jamas", "tampoco"];

function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zñ\s]/g, " ")
    .trim();
}

function analizarSentimiento(texto) {
  const palabras = normalizar(texto).split(/\s+/);
  let puntaje = 0;

  palabras.forEach((palabra, i) => {
    let valor = LEXICO[palabra] || 0;
    if (valor !== 0 && (NEGADORES.includes(palabras[i - 1]) || NEGADORES.includes(palabras[i - 2]))) valor = -valor;
    puntaje += valor;
  });

  if (texto.includes("!") && puntaje < 0) puntaje -= 1;
  return puntaje;
}

// 2 Nuevas intenciones agregadas: "vacuna" e "infeccion"
const INTENCIONES = [
  { nombre: "saludo",    claves: ["hola", "buenas", "saludos", "hey", "buenos"] },
  { nombre: "vacuna",    claves: ["vacuna", "cura", "antidoto", "medicina", "frasco"] },
  { nombre: "infeccion", claves: ["virus", "infeccion", "zombie", "enfermo", "morder"] },
  { nombre: "nombre",    claves: ["nombre", "llamas", "quien"] },
  { nombre: "chiste",    claves: ["chiste", "gracioso", "risa", "broma"] },
  { nombre: "comida",    claves: ["comida", "hambre", "comer", "cerebro", "carne"] },
  { nombre: "despedida", claves: ["adios", "chao", "bye", "hasta"] }
];

function detectarIntencion(texto) {
  const palabras = normalizar(texto).split(/\s+/);
  for (const intencion of INTENCIONES) {
    if (intencion.claves.some(c => palabras.includes(c))) return intencion.nombre;
  }
  return "desconocida";
}

const RESPUESTAS = {
  saludo: {
    bien: "Hola, humano. Aún me queda algo de conciencia...",
    mal:  "¿Por qué me hablas tan fuerte? ¡Tengo hambre!"
  },
  vacuna: {
    bien: "¿La vacuna? La guardo muy bien... Tal vez seas digno de tenerla.",
    mal:  "¡La vacuna es mía! ¡Los humanos solo la quieren destruir!"
  },
  infeccion: {
    bien: "No elegí convertirme en esto... Agradezco que no me veas como un monstruo.",
    mal:  "¡Estéril basura! ¡El virus nos hará a todos iguales!"
  },
  nombre: {
    bien: "Antes me llamaban Gru... Ahora solo soy un sobreviviente.",
    mal:  "¡Mi nombre no te importa! ¡Solo importa tu funeral!"
  },
  chiste: {
    bien: "¿Qué hace un zombie en un examen? ¡Perder la cabeza!",
    mal:  "Tus bromas no me dan gracia... Me dan ganas de m*tarte."
  },
  comida: {
    bien: "¿Tienes algo de comida? Extraño los sabores ricos de cuando vivía.",
    mal:  "¿Comida? ¡Tu cerebro se ve delicioso!"
  },
  despedida: {
    bien: "Ve con cuidado... Hay otros como yo que no hablarán contigo.",
    mal:  "¡Vete antes de que pierda el control!"
  },
  desconocida: {
    bien: "Ugh... Tus palabras son raras, pero se sienten amables.",
    mal:  "Grrr... No entiendo lo que dices insecto y me hace odiarte."
  }
};

async function consultarDragonIA(texto, historial) {
  try {
    const respuesta = await fetch("/api/dragon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mensaje: texto, historial }),
      signal: AbortSignal.timeout(20000)
    });
    if (!respuesta.ok) return null;
    return await respuesta.json();
  } catch (error) {
    return null;
  }
}