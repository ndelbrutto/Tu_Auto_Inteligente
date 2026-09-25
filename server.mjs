import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const screensDir = path.join(__dirname, 'screens');

// Mapa de rutas y pantallas
const routes = [
  { path: '/', file: 'ranking.html', title: 'Ranking & Candidatos', icon: 'leaderboard', isPrimary: true },
  { path: '/ranking', file: 'ranking.html', title: 'Ranking & Candidatos', icon: 'leaderboard', isPrimary: true },
  { path: '/agregar-auto', file: 'agregar-auto.html', title: 'Agregar Auto (Supabase)', icon: 'add_circle', isPrimary: true },
  { path: '/detalle-auto', file: 'detalle-auto.html', title: 'Detalle y Evaluación', icon: 'directions_car', isPrimary: true },
  { path: '/tco-5-anos', file: 'tco-5-anos.html', title: 'Costos TCO 5 Años', icon: 'payments', isPrimary: true },
  { path: '/ficha', file: 'ficha.html', title: 'Ficha Autocompletada', icon: 'description', isPrimary: false },
  { path: '/perfiles-pesos', file: 'perfiles-pesos.html', title: 'Perfiles y Pesos', icon: 'tune', isPrimary: false },
  { path: '/inspeccion', file: 'inspeccion.html', title: 'Inspección Pre-Compra', icon: 'fact_check', isPrimary: false },
  { path: '/pro', file: 'pro.html', title: 'AutoScore PRO', icon: 'workspace_premium', isPrimary: false },
  { path: '/flow', file: 'flow.html', title: 'Flujo de Prototipo', icon: 'alt_route', isPrimary: false }
];

// Inyección del menú de navegación interactivo
function injectNavigation(html, currentPath) {
  const normCurrent = currentPath === '/' ? '/ranking' : currentPath;

  const navBarHtml = `
  <!-- INYECCIÓN NAVEGACIÓN GLOBAL STITCH -->
  <div id="stitch-nav-bar" style="position: fixed; bottom: 0; left: 0; right: 0; z-index: 9999; background: rgba(16, 19, 26, 0.95); backdrop-filter: blur(16px); border-top: 1px solid rgba(255, 255, 255, 0.12); padding: 8px 12px; font-family: 'Space Grotesk', system-ui, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; display: flex; align-items: center; justify-content: space-around;">
      
      <a href="/ranking" style="display: flex; flex-direction: column; align-items: center; text-decoration: none; color: ${normCurrent === '/ranking' ? '#f5a623' : '#a0a5b2'}; font-size: 11px; font-weight: 600; gap: 2px;">
        <span class="material-symbols-outlined" style="font-size: 22px;">leaderboard</span>
        <span>Ranking</span>
      </a>

      <a href="/agregar-auto" style="display: flex; flex-direction: column; align-items: center; text-decoration: none; color: ${normCurrent === '/agregar-auto' ? '#f5a623' : '#a0a5b2'}; font-size: 11px; font-weight: 600; gap: 2px;">
        <span class="material-symbols-outlined" style="font-size: 22px;">add_circle</span>
        <span>+ Auto</span>
      </a>

      <a href="/detalle-auto" style="display: flex; flex-direction: column; align-items: center; text-decoration: none; color: ${normCurrent === '/detalle-auto' ? '#f5a623' : '#a0a5b2'}; font-size: 11px; font-weight: 600; gap: 2px;">
        <span class="material-symbols-outlined" style="font-size: 22px;">directions_car</span>
        <span>Detalle</span>
      </a>

      <a href="/tco-5-anos" style="display: flex; flex-direction: column; align-items: center; text-decoration: none; color: ${normCurrent === '/tco-5-anos' ? '#f5a623' : '#a0a5b2'}; font-size: 11px; font-weight: 600; gap: 2px;">
        <span class="material-symbols-outlined" style="font-size: 22px;">payments</span>
        <span>TCO</span>
      </a>

      <button onclick="toggleScreenDrawer()" type="button" style="background: none; border: none; cursor: pointer; display: flex; flex-direction: column; align-items: center; color: #3ceda4; font-size: 11px; font-weight: 600; gap: 2px; padding: 0;">
        <span class="material-symbols-outlined" style="font-size: 22px;">apps</span>
        <span>Todas (9)</span>
      </button>

    </div>
  </div>

  <!-- DRAWER CON LAS 9 PANTALLAS COMPLETAS -->
  <div id="stitch-screens-drawer" style="display: none; position: fixed; inset: 0; z-index: 10000; background: rgba(0,0,0,0.75); backdrop-filter: blur(8px); padding: 16px; align-items: flex-end; justify-content: center; font-family: 'Space Grotesk', system-ui, sans-serif;">
    <div style="background: #191c22; border: 1px solid #32353c; border-radius: 20px; width: 100%; max-width: 540px; max-height: 85vh; overflow-y: auto; padding: 20px; box-shadow: 0 -10px 40px rgba(0,0,0,0.8); display: flex; flex-direction: column; gap: 14px;">
      
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #32353c; padding-bottom: 12px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="material-symbols-outlined" style="color: #f5a623; font-size: 26px;">grid_view</span>
          <div>
            <h3 style="margin: 0; color: #e1e2eb; font-size: 17px; font-weight: 700;">Pantallas de Tu Auto Inteligente</h3>
            <span style="font-size: 12px; color: #3ceda4;">9 Diseños sincronizados desde Google Stitch</span>
          </div>
        </div>
        <button onclick="toggleScreenDrawer()" style="background: #272a31; border: none; color: #e1e2eb; border-radius: 50%; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; cursor: pointer;">✕</button>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        ${routes.filter(r => r.path !== '/').map(r => `
          <a href="${r.path}" style="display: flex; align-items: center; gap: 10px; padding: 12px; border-radius: 12px; text-decoration: none; background: ${normCurrent === r.path ? '#272a31' : '#1d2026'}; border: 1px solid ${normCurrent === r.path ? '#f5a623' : '#32353c'}; color: ${normCurrent === r.path ? '#f5a623' : '#e1e2eb'}; transition: all 0.2s;">
            <span class="material-symbols-outlined" style="font-size: 22px; color: ${normCurrent === r.path ? '#f5a623' : '#a0a5b2'};">${r.icon}</span>
            <div style="display: flex; flex-direction: column;">
              <span style="font-size: 13px; font-weight: 700; line-height: 1.2;">${r.title}</span>
              <span style="font-size: 10px; color: #767d8f; font-family: monospace;">${r.path}</span>
            </div>
          </a>
        `).join('')}
      </div>

    </div>
  </div>

  <script>
    function toggleScreenDrawer() {
      const el = document.getElementById('stitch-screens-drawer');
      if (el) {
        el.style.display = el.style.display === 'none' ? 'flex' : 'none';
      }
    }
  </script>
  <!-- FIN INYECCIÓN -->
  `;

  // Asegurar padding al final para que el navbar no tape contenido
  const paddingFix = `<div style="height: 70px; width: 100%;"></div>`;

  if (html.includes('</body>')) {
    return html.replace('</body>', `${paddingFix}${navBarHtml}</body>`);
  }
  return html + paddingFix + navBarHtml;
}

// Inyección de Supabase específicamente en la pantalla de Agregar Auto
function injectSupabaseScript(html) {
  if (html.includes('supabase.createClient')) return html;

  const script = `
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script>
    const SUPABASE_URL = "https://hzslatnfcliwkbhlhily.supabase.co";
    const SUPABASE_ANON_KEY = "sb_publishable_0wHrw5oH8vnalxFUec8zAw_yjhDzPmv";
    const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Sobrescribir el botón de submit para guardar en Supabase
    const origHandler = window.handleGenerateEvaluation;
    window.handleGenerateEvaluation = async function() {
      const btn = document.getElementById('btn-submit');
      const brand = document.getElementById('input-brand')?.value || 'Subaru';
      const model = document.getElementById('input-model')?.value || 'Forester';
      const year = parseInt(document.getElementById('input-year')?.value) || 2022;
      const version = document.getElementById('input-version')?.value || 'Estándar';
      const priceRaw = document.getElementById('input-price')?.value?.replace(/[^0-9]/g, '') || '0';
      const kmsRaw = document.getElementById('input-kms')?.value?.replace(/[^0-9]/g, '') || '0';
      const annual_km = parseInt(document.getElementById('input-annual-km')?.value) || 15000;

      if (btn) {
        btn.innerHTML = '<span class="material-symbols-outlined text-[24px] animate-spin">sync</span><span>GUARDANDO EN SUPABASE...</span>';
      }

      try {
        const { data, error } = await supabaseClient
          .from('autos')
          .insert([{
            brand,
            model,
            year,
            version,
            price: parseFloat(priceRaw) || null,
            kms: parseInt(kmsRaw) || null,
            annual_km,
            score: 86.4
          }])
          .select();

        if (error) {
          console.error("Supabase Error:", error);
          alert("Aviso de Supabase: " + error.message + "\\n(Asegúrate de haber ejecutado schema.sql en el SQL Editor de Supabase).");
          if (btn) btn.innerHTML = '<span>REINTENTAR</span>';
        } else {
          if (btn) {
            btn.innerHTML = '<span class="material-symbols-outlined text-[24px]">check_circle</span><span>¡GUARDADO EN SUPABASE (86.4 / 100)!</span>';
            btn.style.backgroundColor = '#00d08b';
            btn.style.color = '#002112';
          }
          alert("¡Auto " + brand + " " + model + " guardado con éxito en tu base de datos de Supabase!");
        }
      } catch (e) {
        console.error(e);
        alert("Error: " + e.message);
      }
    };
  </script>
  `;

  return html.replace('</body>', `${script}</body>`);
}

const publicDir = path.join(__dirname, 'public');

function injectSupabaseGlobal(html) {
  const scripts = `
  <!-- SDK & CLIENTE SUPABASE EN TIEMPO REAL -->
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script src="/public/supabase-integration.js"></script>
  `;
  if (html.includes('</head>')) {
    return html.replace('</head>', `${scripts}</head>`);
  }
  return html.replace('</body>', `${scripts}</body>`);
}

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // Servir archivos estáticos de /public/
  if (pathname.startsWith('/public/')) {
    const pubFile = path.join(publicDir, pathname.replace('/public/', ''));
    if (fs.existsSync(pubFile)) {
      const mime = pubFile.endsWith('.js') ? 'application/javascript' : 'text/plain';
      res.writeHead(200, { 'Content-Type': `${mime}; charset=utf-8` });
      res.end(fs.readFileSync(pubFile));
      return;
    }
  }

  // Buscar ruta coincidente
  const match = routes.find(r => r.path === pathname);

  if (match) {
    const filePath = path.join(screensDir, match.file);
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');

      // 1. Inyectar Supabase SDK y script global reactivo en todas las pantallas
      content = injectSupabaseGlobal(content);

      // 2. Inyectar barra de navegación
      content = injectNavigation(content, pathname);

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(content);
      return;
    }
  }

  // 404 Not Found
  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`
    <div style="font-family: sans-serif; text-align: center; padding: 40px; background: #10131a; color: #fff; min-height: 100vh;">
      <h1>404 - Pantalla no encontrada</h1>
      <p>La ruta <code>${pathname}</code> no existe.</p>
      <a href="/" style="color: #f5a623; text-decoration: underline;">Volver al Ranking de Autos</a>
    </div>
  `);
});

server.listen(PORT, () => {
  console.log(`\n🚀 Servidor de Navegación Node.js activo en: http://localhost:${PORT}`);
  console.log(`📍 Rutas disponibles:`);
  routes.filter(r => r.path !== '/').forEach(r => {
    console.log(`   - http://localhost:${PORT}${r.path} (${r.title})`);
  });
});
