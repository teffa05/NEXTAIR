const btnActualizar = document.getElementById("btn-actualizar");
const cargando = document.getElementById("cargando");
const filtro = document.getElementById("filtro-contaminante");
const canvas = document.getElementById("mapa");
const ctx = canvas.getContext("2d");
const zoomIn = document.getElementById("zoom-in");
const zoomOut = document.getElementById("zoom-out");

let zoom = 1;

// Coordenadas simuladas (ejes del mapa)
const latitudes = ["-3.75°", "-3.70°", "-3.65°", "-3.60°", "-3.55°", "-3.50°"];
const longitudes = ["-73.50°", "-73.45°", "-73.40°", "-73.35°", "-73.30°", "-73.25°"];

// Insertar coordenadas dinámicamente
document.querySelector(".latitudes.superior").innerHTML = latitudes.map(l => `<span>${l}</span>`).join("");
document.querySelector(".latitudes.inferior").innerHTML = latitudes.map(l => `<span>${l}</span>`).join("");
document.querySelector(".longitudes.izquierda").innerHTML = longitudes.map(l => `<span>${l}</span>`).join("");
document.querySelector(".longitudes.derecha").innerHTML = longitudes.map(l => `<span>${l}</span>`).join("");

// === DIBUJAR MAPA BASE ===
function dibujarMapa(tipo) {
  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.scale(zoom, zoom);

  // Fondo
  ctx.fillStyle = "#e0f7fa";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Simular zonas de contaminación
  if (tipo === "no2") {
    ctx.fillStyle = "rgba(255, 0, 0, 0.4)"; // rojo
  } else if (tipo === "o3") {
    ctx.fillStyle = "rgba(0, 0, 255, 0.4)"; // azul
  } else {
    ctx.fillStyle = "rgba(0, 255, 0, 0.4)"; // verde
  }

  // Dibujar áreas irregulares
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const r = 50 + Math.random() * 80;
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fill();
  }

  // Líneas de cuadrícula
  ctx.strokeStyle = "rgba(0,0,0,0.1)";
  for (let i = 0; i < 10; i++) {
    ctx.beginPath();
    ctx.moveTo(0, (i + 1) * 50);
    ctx.lineTo(canvas.width, (i + 1) * 50);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo((i + 1) * 80, 0);
    ctx.lineTo((i + 1) * 80, canvas.height);
    ctx.stroke();
  }

  ctx.restore();
}

// Inicializar mapa
dibujarMapa("no2");

// === BOTÓN ACTUALIZAR ===
btnActualizar.addEventListener("click", () => {
  cargando.classList.remove("oculto");
  setTimeout(() => {
    cargando.classList.add("oculto");
    dibujarMapa(filtro.value);
  }, 1500);
});

// === ZOOM ===
zoomIn.addEventListener("click", () => {
  zoom += 0.2;
  dibujarMapa(filtro.value);
});

zoomOut.addEventListener("click", () => {
  if (zoom > 0.6) zoom -= 0.2;
  dibujarMapa(filtro.value);
});

