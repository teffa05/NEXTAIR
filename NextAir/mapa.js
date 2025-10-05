// === TRADUCTOR ===
function toggleDropdown() {
  document.getElementById("languageDropdown").classList.toggle("show");
}

function doTranslate(lang) {
  console.log("Traducción simulada:", lang);
}

// === MAPA ===
const canvas = document.getElementById("mapaCanvas");
const ctx = canvas.getContext("2d");
const loader = document.getElementById("loader");
const btnActualizar = document.getElementById("btnActualizar");
const mensajeError = document.getElementById("mensajeError");

let zoom = 1;

function dibujarMapa() {
  const ancho = (canvas.width = canvas.offsetWidth);
  const alto = (canvas.height = canvas.offsetHeight);

  ctx.clearRect(0, 0, ancho, alto);
  ctx.fillStyle = "#e6f2ff";
  ctx.fillRect(0, 0, ancho, alto);

  // Cuadrícula
  ctx.strokeStyle = "#b3d1ff";
  for (let x = 0; x < ancho; x += 50 * zoom) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, alto);
    ctx.stroke();
  }
  for (let y = 0; y < alto; y += 50 * zoom) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(ancho, y);
    ctx.stroke();
  }

  // Puntos contaminantes simulados
  const tipo = document.getElementById("contaminante").value;
  let color;
  switch (tipo) {
    case "no2": color = "rgba(255,0,0,0.6)"; break;
    case "o3": color = "rgba(0,128,255,0.6)"; break;
    case "hcho": color = "rgba(255,165,0,0.6)"; break;
    default: color = "rgba(0,0,0,0.3)";
  }

  for (let i = 0; i < 25; i++) {
    const x = Math.random() * ancho;
    const y = Math.random() * alto;
    const r = 10 * zoom;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }
}

// === Validación de filtros ===
function validarFiltros() {
  const contaminante = document.getElementById("contaminante").value;
  const fecha = document.getElementById("fecha").value;
  const hora = document.getElementById("hora").value;

  if (contaminante && fecha && hora) {
    btnActualizar.disabled = false;
    mensajeError.classList.add("oculto");
  } else {
    btnActualizar.disabled = true;
  }
}

document.getElementById("contaminante").addEventListener("change", validarFiltros);
document.getElementById("fecha").addEventListener("change", validarFiltros);
document.getElementById("hora").addEventListener("change", validarFiltros);

// === Evento Actualizar ===
btnActualizar.addEventListener("click", () => {
  const contaminante = document.getElementById("contaminante").value;
  const fecha = document.getElementById("fecha").value;
  const hora = document.getElementById("hora").value;

  if (!contaminante || !fecha || !hora) {
    mensajeError.classList.remove("oculto");
    return;
  }

  mensajeError.classList.add("oculto");
  loader.classList.remove("oculto");

  setTimeout(() => {
    loader.classList.add("oculto");
    dibujarMapa();
  }, 1000);
});

// === Zoom ===
document.getElementById("zoomIn").addEventListener("click", () => {
  zoom *= 1.2;
  dibujarMapa();
});

document.getElementById("zoomOut").addEventListener("click", () => {
  zoom /= 1.2;
  dibujarMapa();
});

// === Reglas ===
function generarReglas() {
  const reglaH = document.querySelector(".regla-horizontal");
  const reglaV = document.querySelector(".regla-vertical");
  reglaH.innerHTML = "";
  reglaV.innerHTML = "";

  for (let i = 0; i <= 5; i++) {
    reglaH.innerHTML += `<span>${(i * 10 + 70).toFixed(2)}°</span>`;
    reglaV.innerHTML += `<span>${(i * -5 + 10).toFixed(2)}°</span>`;
  }
}

window.addEventListener("load", () => {
  generarReglas();
  dibujarMapa();
  validarFiltros(); // inicia con el botón desactivado
});
