// Cargar productos dinámicamente desde Google Sheets (usando sheet.best o SheetDB)
const SHEET_URL = 'https://sheet.best/api/sheets/{tu-sheet-id}';

async function cargarProductos() {
  const resp = await fetch(SHEET_URL);
  const productos = await resp.json();

  // Suponiendo que tienes divs con id="lista-frutas" y id="lista-verduras"
  const frutas = productos.filter(p => p.categoria === "Frutas");
  const verduras = productos.filter(p => p.categoria === "Verduras");

  document.getElementById('lista-frutas').innerHTML = frutas.map(prodToHTML).join('');
  document.getElementById('lista-verduras').innerHTML = verduras.map(prodToHTML).join('');
}

function prodToHTML(p, i) {
  return `
    <div class="producto-card">
      <img src="img/${p.imagen || 'default.png'}" alt="${p.nombre}">
      <h3>${p.nombre}</h3>
      <span class="precio">$${p.precio} <small class="unidad">/${p.unidad}</small></span>
      <button class="agregar-btn" onclick="addToCart('${p.nombre}',${p.precio},${p.stock || 0},${i})">
        <i class="fa fa-cart-plus"></i>Agregar
      </button>
    </div>
  `;
}

window.addEventListener('DOMContentLoaded', cargarProductos);