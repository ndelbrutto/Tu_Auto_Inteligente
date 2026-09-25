/**
 * Integración en Tiempo Real de Supabase con Tu Auto Inteligente (Google Stitch)
 * Manejo reactivo de datos para las 9 pantallas del proyecto
 */

const SUPABASE_URL = "https://hzslatnfcliwkbhlhily.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_0wHrw5oH8vnalxFUec8zAw_yjhDzPmv";

let sb = null;
if (window.supabase) {
  sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Obtener parámetro ?id= de la URL
function getUrlParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

document.addEventListener("DOMContentLoaded", () => {
  if (!sb) {
    console.error("Supabase client no cargado.");
    return;
  }

  const path = window.location.pathname;

  if (path === '/' || path === '/ranking') {
    setupRanking();
  } else if (path === '/agregar-auto') {
    setupAgregarAuto();
  } else if (path === '/detalle-auto') {
    setupDetalleAuto();
  } else if (path === '/ficha') {
    setupFicha();
  } else if (path === '/tco-5-anos') {
    setupTco();
  } else if (path === '/perfiles-pesos') {
    setupPerfilesPesos();
  } else if (path === '/inspeccion') {
    setupInspeccion();
  } else if (path === '/pro') {
    setupPro();
  } else if (path === '/flow') {
    setupFlow();
  }
});

// ==============================================================================
// 1. PANTALLA: RANKING & CANDIDATOS (/ranking)
// ==============================================================================
async function setupRanking() {
  const container = document.querySelector('.space-y-space-md');
  if (!container) return;

  // Cargar autos de Supabase
  const { data: autos, error } = await sb
    .from('autos')
    .select('*')
    .order('score', { ascending: false });

  if (error) {
    console.error("Error al cargar ranking:", error);
    return;
  }

  // Actualizar banner superior con el conteo de autos
  const countSpan = document.querySelector('.font-body-sm.text-on-surface.font-medium.truncate');
  if (countSpan) {
    countSpan.innerHTML = `${autos ? autos.length : 0} vehículos en garaje · <span class="text-primary">Calibración Activa Chile</span>`;
  }

  const todosBtn = document.querySelector('.overflow-x-auto button');
  if (todosBtn) {
    todosBtn.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-on-primary-container"></span><span>Todos (${autos ? autos.length : 0})</span>`;
  }

  if (!autos || autos.length === 0) {
    return; // Mantener estado vacío original
  }

  // Renderizar tarjetas dinámicas de autos
  let cardsHtml = '';
  autos.forEach((car, idx) => {
    const formattedPrice = car.price ? '$' + Number(car.price).toLocaleString('es-CL') : 'A consultar';
    const formattedKms = car.kms ? Number(car.kms).toLocaleString('es-CL') + ' KM' : '0 KM';
    const scoreVal = car.score || 86.4;
    const isTop = idx === 0;

    cardsHtml += `
      <div class="w-full bg-surface-container rounded-xl p-space-md flex flex-col gap-space-sm shadow-lg border ${isTop ? 'border-primary/60' : 'border-outline-variant/30'} hover:border-primary transition-all">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-space-xs">
            <span class="w-7 h-7 rounded-lg ${isTop ? 'bg-primary-container text-surface-container-lowest' : 'bg-surface-container-high text-on-surface'} flex items-center justify-center font-bold text-xs font-mono">
              #${idx + 1}
            </span>
            <div>
              <h3 class="font-headline-sm text-base font-bold text-on-surface">${car.brand} ${car.model}</h3>
              <span class="text-xs text-on-surface-variant font-mono">${car.year || '2022'} · ${car.version || 'Estándar'} · ${car.category || 'SUV'}</span>
            </div>
          </div>
          <div class="flex flex-col items-end">
            <div class="px-2 py-0.5 rounded bg-primary-container/20 text-primary font-bold text-sm font-mono flex items-center gap-1">
              <span class="material-symbols-outlined text-[16px]">speed</span>
              <span>${scoreVal}</span>
            </div>
            <span class="text-[10px] text-tertiary font-mono">AutoScore</span>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-2 py-2 border-y border-outline-variant/20 text-center">
          <div class="flex flex-col">
            <span class="text-[10px] text-on-surface-variant uppercase font-mono">Precio CLP</span>
            <span class="text-xs font-bold text-on-surface font-mono">${formattedPrice}</span>
          </div>
          <div class="flex flex-col">
            <span class="text-[10px] text-on-surface-variant uppercase font-mono">Odómetro</span>
            <span class="text-xs font-bold text-on-surface font-mono">${formattedKms}</span>
          </div>
          <div class="flex flex-col">
            <span class="text-[10px] text-on-surface-variant uppercase font-mono">Combustible</span>
            <span class="text-xs font-bold text-secondary font-mono">${car.fuel_type || '95'} Oct</span>
          </div>
        </div>

        <div class="flex items-center justify-between pt-1">
          <button onclick="eliminarAuto('${car.id}')" class="text-xs text-error hover:underline flex items-center gap-1 font-mono">
            <span class="material-symbols-outlined text-[14px]">delete</span> Eliminar
          </button>
          <div class="flex items-center gap-2">
            <a href="/tco-5-anos?id=${car.id}" class="px-2.5 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-secondary text-xs font-mono flex items-center gap-1 transition-colors">
              <span class="material-symbols-outlined text-[14px]">payments</span> TCO
            </a>
            <a href="/detalle-auto?id=${car.id}" class="px-3 py-1.5 rounded-lg bg-primary-container text-surface-container-lowest font-bold text-xs font-mono flex items-center gap-1 shadow hover:brightness-110 transition-all">
              <span>Ver Evaluación</span>
              <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
            </a>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = cardsHtml;
}

window.eliminarAuto = async function(id) {
  if (!confirm("¿Seguro que deseas eliminar este auto del garaje?")) return;
  const { error } = await sb.from('autos').delete().eq('id', id);
  if (error) alert("Error: " + error.message);
  else setupRanking();
};

// ==============================================================================
// 2. PANTALLA: AGREGAR AUTO (/agregar-auto) - LISTAS DESPLEGABLES CONECTADAS
// ==============================================================================
let vehicleCatalog = null;

async function loadVehicleCatalog() {
  if (vehicleCatalog) return vehicleCatalog;

  // 1. Intentar cargar desde Supabase si existe la tabla
  try {
    const { data: dbCatalog } = await sb.from('catalogo_vehiculos').select('*');
    if (dbCatalog && dbCatalog.length > 0) {
      console.log("Catálogo cargado desde Supabase:", dbCatalog.length, "versiones.");
      // Transformar en estructura anidada
      const cat = {};
      dbCatalog.forEach(item => {
        if (!cat[item.marca]) cat[item.marca] = {};
        if (!cat[item.marca][item.modelo]) {
          cat[item.marca][item.modelo] = {
            anios: [],
            versiones: [],
            categoria: item.categoria || 'SUV / Todoterreno',
            combustible: item.combustible || '95',
            precio_promedio: item.precio_promedio || 18000000,
            tasacion_sii: item.tasacion_sii || 16000000,
            permiso_clp: item.permiso_clp || 310000
          };
        }
        if (!cat[item.marca][item.modelo].anios.includes(item.anio)) {
          cat[item.marca][item.modelo].anios.push(item.anio);
        }
        if (!cat[item.marca][item.modelo].versiones.includes(item.version)) {
          cat[item.marca][item.modelo].versiones.push(item.version);
        }
      });
      vehicleCatalog = cat;
      return vehicleCatalog;
    }
  } catch (e) {
    console.log("Usando catálogo local offline...");
  }

  // 2. Cargar desde JSON homologado local
  try {
    const resp = await fetch('/public/catalogo_vehiculos.json');
    vehicleCatalog = await resp.json();
    return vehicleCatalog;
  } catch (err) {
    console.error("Error al cargar catálogo:", err);
    return null;
  }
}

// Funciones globales para las listas desplegables
window.onBrandChange = async function(brand) {
  const cat = await loadVehicleCatalog();
  if (!cat || !cat[brand]) return;

  // Actualizar hidden input y pills
  const inputBrand = document.getElementById('input-brand');
  if (inputBrand) inputBrand.value = brand;

  // Feedback visual en pills
  document.querySelectorAll('.brand-pill').forEach(p => {
    if (p.innerText.trim() === brand) {
      p.className = 'brand-pill px-3 py-1.5 rounded-lg bg-primary-container text-on-primary-fixed text-label-sm font-label-sm transition-colors whitespace-nowrap active:scale-95 font-bold';
    } else {
      p.className = 'brand-pill px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface hover:bg-primary-container hover:text-on-primary-fixed text-label-sm font-label-sm transition-colors whitespace-nowrap active:scale-95';
    }
  });

  // Poblar select de Modelo
  const selectModel = document.getElementById('select-model');
  const selectYear = document.getElementById('select-year');
  const selectVersion = document.getElementById('select-version');

  if (selectModel) {
    selectModel.disabled = false;
    const models = Object.keys(cat[brand]);
    selectModel.innerHTML = '<option value="" disabled selected>Selecciona modelo...</option>' +
      models.map(m => `<option value="${m}">${m}</option>`).join('');
  }

  // Reset de Año y Versión
  if (selectYear) {
    selectYear.disabled = true;
    selectYear.innerHTML = '<option value="" selected>Año...</option>';
  }
  if (selectVersion) {
    selectVersion.disabled = true;
    selectVersion.innerHTML = '<option value="" selected>Primero selecciona modelo y año</option>';
  }
};

window.onModelChange = async function(model) {
  const brand = document.getElementById('select-brand')?.value;
  const cat = await loadVehicleCatalog();
  if (!cat || !cat[brand] || !cat[brand][model]) return;

  const inputModel = document.getElementById('input-model');
  if (inputModel) inputModel.value = model;

  const info = cat[brand][model];
  const selectYear = document.getElementById('select-year');
  const selectVersion = document.getElementById('select-version');

  // Poblar Años
  if (selectYear) {
    selectYear.disabled = false;
    selectYear.innerHTML = '<option value="" disabled selected>Año...</option>' +
      info.anios.map(a => `<option value="${a}">${a}</option>`).join('');
    // Preseleccionar el año más reciente
    selectYear.value = info.anios[0];
    onYearChange(info.anios[0]);
  }
};

window.onYearChange = async function(year) {
  const brand = document.getElementById('select-brand')?.value;
  const model = document.getElementById('select-model')?.value;
  const cat = await loadVehicleCatalog();
  if (!cat || !cat[brand] || !cat[brand][model]) return;

  const inputYear = document.getElementById('input-year');
  if (inputYear) inputYear.value = year;

  const info = cat[brand][model];
  const selectVersion = document.getElementById('select-version');

  // Poblar Versiones
  if (selectVersion) {
    selectVersion.disabled = false;
    selectVersion.innerHTML = '<option value="" disabled selected>Selecciona versión homologada...</option>' +
      info.versiones.map(v => `<option value="${v}">${v}</option>`).join('');
    
    // Preseleccionar primera versión oficial
    selectVersion.value = info.versiones[0];
    onVersionChange(info.versiones[0]);
  }
};

window.onVersionChange = async function(version) {
  const brand = document.getElementById('select-brand')?.value;
  const model = document.getElementById('select-model')?.value;
  const cat = await loadVehicleCatalog();
  if (!cat || !cat[brand] || !cat[brand][model]) return;

  const inputVersion = document.getElementById('input-version');
  if (inputVersion) inputVersion.value = version;

  const info = cat[brand][model];

  // 1. Autocompletar precio de referencia chileno
  const priceInput = document.getElementById('input-price');
  if (priceInput && info.precio_promedio) {
    priceInput.value = Number(info.precio_promedio).toLocaleString('es-CL');
  }

  // 2. Autocompletar odómetro estimado según año
  const yearVal = parseInt(document.getElementById('select-year')?.value) || 2022;
  const currentYear = new Date().getFullYear();
  const estimatedKms = Math.max(10000, (currentYear - yearVal) * 15000);
  const kmsInput = document.getElementById('input-kms');
  if (kmsInput) {
    kmsInput.value = Number(estimatedKms).toLocaleString('es-CL');
  }

  // 3. Autoseleccionar combustible sugerido (Diésel o Gasolina)
  if (info.combustible === 'diesel' || version.toLowerCase().includes('diésel') || version.toLowerCase().includes('d-4d')) {
    const dieselBtn = Array.from(document.querySelectorAll('.fuel-pill')).find(b => b.innerText.includes('Diésel'));
    if (dieselBtn && window.selectFuel) selectFuel('diesel', 1050, dieselBtn);
  } else if (info.combustible === '97') {
    const b97 = Array.from(document.querySelectorAll('.fuel-pill')).find(b => b.innerText.includes('97'));
    if (b97 && window.selectFuel) selectFuel('97', 1380, b97);
  } else {
    const b95 = Array.from(document.querySelectorAll('.fuel-pill')).find(b => b.innerText.includes('95'));
    if (b95 && window.selectFuel) selectFuel('95', 1320, b95);
  }

  // 4. Actualizar tarjeta de telemetría en vivo
  const syncSection = document.querySelector('section:has(.material-symbols-outlined:contains("sync_saved_locally"))');
  const statusMsg = document.querySelector('.bg-surface-container-lowest p.font-body-sm');
  const statusBadge = document.querySelector('.bg-surface-container-high.text-on-surface-variant');
  if (statusBadge) {
    statusBadge.className = 'font-label-sm text-label-sm bg-tertiary-container text-on-tertiary-container px-2 py-0.5 rounded font-bold';
    statusBadge.innerText = 'HOMOLOGADO 3CV';
  }
  if (statusMsg) {
    statusMsg.innerHTML = `<span class="text-tertiary font-bold">✓ Homologado:</span> <strong>${brand} ${model}</strong> · Versión: ${version} · Tasación SII: $${Number(info.tasacion_sii).toLocaleString('es-CL')} CLP · Permiso: $${Number(info.permiso_clp).toLocaleString('es-CL')} CLP.`;
  }
};

// Sobrescribir selectBrand para sincronizar con el select
window.selectBrand = function(brand) {
  const selectBrand = document.getElementById('select-brand');
  if (selectBrand) {
    selectBrand.value = brand;
    onBrandChange(brand);
  }
};

async function setupAgregarAuto() {
  const cat = await loadVehicleCatalog();

  // Poblar selector de marcas con las 55 marcas completas
  const selectBrand = document.getElementById('select-brand');
  if (selectBrand && cat) {
    const brands = Object.keys(cat).sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
    selectBrand.innerHTML = `<option value="" disabled selected>Selecciona una marca oficial (${brands.length} marcas disponibles)...</option>` +
      brands.map(b => `<option value="${b}">${b}</option>`).join('');
  }

  // Redirigir botón de envío a inserción con datos limpios
  const btn = document.getElementById('btn-submit');
  if (btn) {
    btn.onclick = async function() {
      const brand = document.getElementById('select-brand')?.value || document.getElementById('input-brand')?.value;
      const model = document.getElementById('select-model')?.value || document.getElementById('input-model')?.value;
      const year = parseInt(document.getElementById('select-year')?.value || document.getElementById('input-year')?.value) || 2022;
      const version = document.getElementById('select-version')?.value || document.getElementById('input-version')?.value || 'Estándar';
      const priceRaw = document.getElementById('input-price')?.value.replace(/[^0-9]/g, '');
      const kmsRaw = document.getElementById('input-kms')?.value.replace(/[^0-9]/g, '');
      const annual_km = parseInt(document.getElementById('input-annual-km')?.value) || 15000;

      if (!brand || !model) {
        alert("Por favor selecciona una Marca y un Modelo de las listas desplegables.");
        return;
      }

      btn.disabled = true;
      btn.innerHTML = `<span class="material-symbols-outlined text-[24px] animate-spin">sync</span><span>Sincronizando con SII, CNE y Supabase...</span>`;

      try {
        const cat = await loadVehicleCatalog();
        const info = (cat && cat[brand] && cat[brand][model]) || {};

        const { data, error } = await sb.from('autos').insert([{
          brand,
          model,
          year,
          version,
          price: priceRaw ? parseFloat(priceRaw) : (info.precio_promedio || 18000000),
          kms: kmsRaw ? parseInt(kmsRaw) : 35000,
          annual_km,
          score: 86.4,
          category: info.categoria || 'SUV / Todoterreno'
        }]).select();

        if (error) throw error;

        const newId = data[0].id;
        // Crear criterios iniciales
        await sb.from('criterios_evaluacion').insert([{
          auto_id: newId,
          confiabilidad: 4.5,
          reventa: 4.2,
          consumo: 3.8,
          seguridad: 4.7,
          modificabilidad: 3.9,
          repuestos: 4.0,
          prestaciones: 3.6,
          score_ponderado: 86.4
        }]);

        // Redirigir a detalle
        window.location.href = `/detalle-auto?id=${newId}`;

      } catch (err) {
        console.error(err);
        alert("Error al guardar: " + err.message);
        btn.disabled = false;
        btn.innerHTML = `<span>REINTENTAR</span>`;
      }
    };
  }
}


// ==============================================================================
// 3. PANTALLA: DETALLE AUTO (/detalle-auto)
// ==============================================================================
async function setupDetalleAuto() {
  let carId = getUrlParam('id');

  // Si no hay id, tomar el primer auto de Supabase
  if (!carId) {
    const { data: firstCar } = await sb.from('autos').select('id').limit(1);
    if (firstCar && firstCar.length > 0) {
      carId = firstCar[0].id;
    }
  }

  if (!carId) return;

  // Cargar auto y criterios
  const { data: car } = await sb.from('autos').select('*').eq('id', carId).single();
  if (car) {
    const nameInput = document.getElementById('veh-name');
    if (nameInput) nameInput.value = `${car.brand} ${car.model} (${car.year || '2022'})`;

    const scoreBadge = document.getElementById('header-score');
    if (scoreBadge) scoreBadge.innerText = (car.score ? (car.score / 20).toFixed(2) : "4.32");

    // Conectar botones de ficha y TCO con el carId
    const fichaLinks = document.querySelectorAll('a[href*="ficha"], button:has(.material-symbols-outlined)');
    fichaLinks.forEach(l => {
      if (l.tagName === 'A') l.href = `/ficha?id=${carId}`;
    });
  }
}

// ==============================================================================
// 4. PANTALLA: FICHA TÉCNICA (/ficha)
// ==============================================================================
async function setupFicha() {
  const carId = getUrlParam('id');
  if (!carId) return;

  const { data: car } = await sb.from('autos').select('*').eq('id', carId).single();
  if (car) {
    const titleEl = document.querySelector('h1, h2');
    if (titleEl && titleEl.innerText.includes('Detalle')) {
      titleEl.innerText = `${car.brand} ${car.model} ${car.version || ''}`;
    }
  }
}

// ==============================================================================
// 5. PANTALLA: CALCULADORA TCO (/tco-5-anos)
// ==============================================================================
async function setupTco() {
  const selector = document.getElementById('vehicleSelector');
  if (!selector) return;

  const { data: autos } = await sb.from('autos').select('id, brand, model, year').order('created_at', { ascending: false });

  if (autos && autos.length > 0) {
    selector.innerHTML = '<option value="">Selecciona un vehículo de tu garaje...</option>' +
      autos.map(c => `<option value="${c.id}">${c.brand} ${c.model} (${c.year || '2022'})</option>`).join('') +
      '<option value="new">[+] Agregar nuevo auto</option>';

    const activeId = getUrlParam('id');
    if (activeId) {
      selector.value = activeId;
    } else {
      selector.selectedIndex = 1;
    }
  }

  selector.onchange = function() {
    if (this.value === 'new') window.location.href = '/agregar-auto';
    else if (this.value) window.location.href = `/tco-5-anos?id=${this.value}`;
  };
}

// ==============================================================================
// 6. PANTALLA: PERFILES Y PESOS (/perfiles-pesos)
// ==============================================================================
async function setupPerfilesPesos() {
  const { data: perfiles } = await sb.from('perfiles_ponderacion').select('*');
  console.log("Perfiles de ponderación cargados desde Supabase:", perfiles);
}

// ==============================================================================
// 7. PANTALLA: RED DE TALLERES & INSPECCIÓN (/inspeccion)
// ==============================================================================
async function setupInspeccion() {
  const { data: talleres } = await sb.from('talleres_inspeccion').select('*');
  console.log("Talleres verificados cargados desde Supabase:", talleres);
}

// ==============================================================================
// 8. PANTALLA: AUTOSCORE PRO (/pro)
// ==============================================================================
async function setupPro() {
  const { data: planes } = await sb.from('suscripciones_pro').select('*');
  console.log("Planes PRO cargados desde Supabase:", planes);
}

// ==============================================================================
// 9. PANTALLA: FLUJO DEL PROTOTIPO (/flow)
// ==============================================================================
function setupFlow() {
  console.log("Prototipo de flujo listo.");
}
