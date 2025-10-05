// === GOOGLE TRANSLATE ===
function googleTranslateElementInit() {
  new google.translate.TranslateElement({pageLanguage: 'es'}, 'google_translate_element');
}
function doTranslate(lang) {
  const combo = document.querySelector(".goog-te-combo");
  if (combo) {
    combo.value = lang;
    combo.dispatchEvent(new Event("change"));
  } else {
    alert("Cargando traductor... inténtalo en un momento.");
  }
}

// === MAPA VACÍO ===
document.getElementById("map").innerHTML =
  "<div class='text-center p-5 text-muted'>🗺️ Aquí se mostrará el mapa (fuente externa)</div>";

// === FILTROS ===
const btnChecklist = document.querySelector(".dropdown-checklist-btn");
const contentChecklist = document.querySelector(".dropdown-checklist-content");
const checkboxes = contentChecklist.querySelectorAll("input[type='checkbox']");
const selectedDisplay = document.getElementById("selectedContaminantes");
const inputFecha = document.getElementById("fecha");
const inputHora = document.getElementById("hora");
const btnActualizar = document.getElementById("btnActualizar");
const resultadosDiv = document.querySelector(".resultados");

btnChecklist.addEventListener("click", () => {
  contentChecklist.classList.toggle("show");
});
window.addEventListener("click", (e) => {
  if (!e.target.closest(".dropdown-checklist")) contentChecklist.classList.remove("show");
});

checkboxes.forEach(chk => {
  chk.addEventListener("change", () => {
    const seleccionados = Array.from(checkboxes)
      .filter(c => c.checked)
      .map(c => c.parentNode.textContent.trim());
    selectedDisplay.textContent = seleccionados.length > 0 ?
      seleccionados.join(", ") : "Seleccionar contaminantes";
    verificarFiltros();
  });
});

btnActualizar.disabled = true;
function verificarFiltros() {
  const seleccionados = Array.from(checkboxes).some(c => c.checked);
  btnActualizar.disabled = !(inputFecha.value && inputHora.value && seleccionados);
}
[inputFecha, inputHora].forEach(input => input.addEventListener("change", verificarFiltros));

btnActualizar.addEventListener("click", () => {
  btnActualizar.textContent = "Cargando...";
  btnActualizar.disabled = true;
  setTimeout(() => {
    mostrarResultados();
    btnActualizar.textContent = "Actualizar Mapa";
    verificarFiltros();
  }, 1000);
});

// === RESULTADOS ===
function mostrarResultados() {
  resultadosDiv.innerHTML = "";
  const seleccionados = Array.from(checkboxes).filter(c => c.checked);

  if (seleccionados.length === 0) {
    resultadosDiv.innerHTML = "<p>No se seleccionaron contaminantes.</p>";
    return;
  }

  seleccionados.forEach(c => {
    const nombreCompleto = c.parentNode.textContent.trim();
    const elemento = document.createElement("div");
    elemento.innerHTML = `
      <p><strong>${nombreCompleto}</strong><br>
      Valor estimado: ${(Math.random() * 250).toFixed(1)} µg/m³<br>
      Nivel: ${nivelAleatorio()}</p>
      <hr>`;
    resultadosDiv.appendChild(elemento);
  });
}

function nivelAleatorio() {
  const niveles = ["Buena", "Moderada", "Insalubre grupos sensibles", "Insalubre", "Muy insalubre"];
  return niveles[Math.floor(Math.random() * niveles.length)];
}


