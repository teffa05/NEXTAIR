/* ================= Google Translate (estable) ================= */
function googleTranslateElementInit() {
  // Esta función será llamada por el script de Google (cb=googleTranslateElementInit)
  new google.translate.TranslateElement({
    pageLanguage: 'es',
    includedLanguages: 'es,en,fr,de,it,pt,zh-CN,ja,ko,ar,ru',
    layout: google.translate.TranslateElement.InlineLayout.SIMPLE
  }, 'google_translate_element');
}

/* Espera por el select inyectado por Google y lo devuelve o null si timeout */
function waitForTranslateCombo(timeout = 8000) {
  return new Promise((resolve) => {
    const start = Date.now();
    const id = setInterval(() => {
      const combo = document.querySelector('.goog-te-combo');
      if (combo) { clearInterval(id); resolve(combo); }
      else if (Date.now() - start > timeout) { clearInterval(id); resolve(null); }
    }, 250);
  });
}

/* Función pública que cambia idioma de forma robusta */
async function doTranslate(lang) {
  const combo = await waitForTranslateCombo(8000);
  if (!combo) {
    alert('El traductor aún no está listo. Intenta nuevamente en unos segundos.');
    return;
  }
  combo.value = lang;
  combo.dispatchEvent(new Event('change'));
}
// Exponer globalmente (por si hay onclick inline en HTML)
window.doTranslate = doTranslate;

/* Delegación: enlaces con data-lang también llamarán doTranslate */
document.addEventListener('click', (ev) => {
  const el = ev.target.closest('[data-lang]');
  if (!el) return;
  ev.preventDefault();
  const lang = el.getAttribute('data-lang');
  doTranslate(lang);
});

/* ================= Leaflet mapa interactivo (Norteamérica) ================= */
let map;
let leafletMarkers = [];

function initMap() {
  map = L.map('map', { zoomControl:true }).setView([40, -95], 4);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
}

/* Datos de ejemplo (Norteamérica) */
const puntos = [
  { lugar: "Los Ángeles, CA (EE. UU.)", coords:[34.05,-118.25], contaminante:"PM2.5", nombre:"Material Particulado 2.5", abrev:"PM2.5", valor:40 },
  { lugar: "Houston, TX (EE. UU.)", coords:[29.76,-95.36], contaminante:"NO₂", nombre:"Dióxido de Nitrógeno", abrev:"NO₂", valor:70 },
  { lugar: "Toronto, ON (Canadá)", coords:[43.7,-79.42], contaminante:"O₃", nombre:"Ozono", abrev:"O₃", valor:180 },
  { lugar: "Nueva York, NY (EE. UU.)", coords:[40.71,-74.01], contaminante:"CO", nombre:"Monóxido de Carbono", abrev:"CO", valor:160 },
  { lugar: "Las Vegas, NV (EE. UU.)", coords:[36.17,-115.14], contaminante:"SO₂", nombre:"Dióxido de Azufre", abrev:"SO₂", valor:30 },
  { lugar: "Vancouver, BC (Canadá)", coords:[49.28,-123.12], contaminante:"PM10", nombre:"Material Particulado 10", abrev:"PM10", valor:55 }
];

/* Determina nivel y color según valor */
function evaluarNivel(valor) {
  valor = Number(valor);
  if (valor <= 50) return { texto:'Buena', color:'green', clase:'nivel-verde' };
  if (valor <= 100) return { texto:'Moderada', color:'yellow', clase:'nivel-amarillo' };
  if (valor <= 150) return { texto:'Insalubre (grupos sensibles)', color:'orange', clase:'nivel-naranja' };
  if (valor <= 200) return { texto:'Insalubre', color:'red', clase:'nivel-rojo' };
  return { texto:'Muy insalubre', color:'purple', clase:'nivel-morado' };
}

/* Dibuja marcadores y llena la sección de resultados */
function dibujar(pollList) {
  // limpiar marcadores
  leafletMarkers.forEach(m => map.removeLayer(m));
  leafletMarkers = [];

  // filtrar puntos
  const filtrados = pollList && pollList.length ? puntos.filter(p => pollList.includes(p.abrev)) : puntos;

  // si hay puntos, ajustar bounds
  const coords = [];
  filtrados.forEach(p => {
    const nivel = evaluarNivel(p.valor);
    const marker = L.circleMarker(p.coords, {
      radius: 8,
      color: nivel.color,
      fillColor: nivel.color,
      fillOpacity: 0.8
    }).addTo(map);

    marker.bindPopup(`<strong>${p.lugar}</strong><br>${p.nombre} (${p.abrev})<br>Valor: ${p.valor} µg/m³<br><span style="color:${nivel.color};font-weight:700">${nivel.texto}</span>`);
    leafletMarkers.push(marker);
    coords.push(p.coords);
  });

  if (coords.length) {
    const bounds = L.latLngBounds(coords);
    map.fitBounds(bounds.pad(0.3));
  } else {
    map.setView([40, -95], 4);
  }

  // actualizar resultados en la leyenda (ubicación, color, elemento, valor, nivel)
  const cont = document.getElementById('resultados');
  cont.innerHTML = '';
  if (filtrados.length === 0) {
    cont.innerHTML = '<div class="item">No hay datos para los contaminantes seleccionados.</div>';
    return;
  }

  filtrados.forEach(p => {
    const nivel = evaluarNivel(p.valor);
    const item = document.createElement('div');
    item.className = 'item';
    item.innerHTML = `
      <div class="color-swatch" style="background:${nivel.color}"></div>
      <div class="detalle">
        <strong>${p.lugar}</strong>
        <div>${p.nombre} (${p.abrev})</div>
        <div>Valor: <b>${p.valor} µg/m³</b></div>
        <div>Nivel: <span class="${nivel.clase}">${nivel.texto}</span></div>
      </div>
    `;
    cont.appendChild(item);
  });
}

/* ================= UI: filtros, dropdown y lógica de habilitar botón ================= */
function actualizarBotonDropdown() {
  const boton = document.getElementById('dropdownContaminantes');
  const checks = Array.from(document.querySelectorAll('.contaminante-checkbox'));
  const sel = checks.filter(c => c.checked);
  if (sel.length === 0) {
    boton.textContent = 'Seleccionar contaminantes';
    boton.title = 'Seleccionar contaminantes';
  } else if (sel.length === 1) {
    const c = sel[0];
    boton.textContent = `${c.dataset.nombre} (${c.value})`;
    boton.title = boton.textContent;
  } else {
    boton.textContent = sel.map(c => c.value).join(', ');
    boton.title = sel.map(c => c.value).join(', ');
  }
}

/* Habilitar/deshabilitar botón Actualizar según fecha, hora y selección */
function verificarFiltros() {
  const fecha = document.getElementById('fecha').value;
  const hora = document.getElementById('hora').value;
  const anySelected = Array.from(document.querySelectorAll('.contaminante-checkbox')).some(c => c.checked);
  document.getElementById('btnActualizar').disabled = !(fecha && hora && anySelected);
}

/* Evento inicialización UI */
document.addEventListener('DOMContentLoaded', () => {
  // init map
  initMap();

  // checkbox listeners
  document.querySelectorAll('.contaminante-checkbox').forEach(cb => {
    cb.addEventListener('change', () => {
      actualizarBotonDropdown();
      // no dibujamos inmediatamente; se dibuja al pulsar "Actualizar Mapa"
      verificarFiltros();
    });
  });

  // fecha/hora listeners
  document.getElementById('fecha').addEventListener('change', verificarFiltros);
  document.getElementById('hora').addEventListener('change', verificarFiltros);

  // botón actualizar
  document.getElementById('btnActualizar').addEventListener('click', (e) => {
    e.preventDefault();
    const checks = Array.from(document.querySelectorAll('.contaminante-checkbox')).filter(c => c.checked);
    const seleccionados = checks.map(c => c.value);
    // Simulación o llamada real aquí: dibujar con filtrado
    dibujar(seleccionados);
  });

  // inicializar botón y resultados con todos los puntos
  actualizarBotonDropdown();
  dibujar([]); // muestra todos por defecto
});

