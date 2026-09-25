import fs from 'fs';
import path from 'path';

const projectDir = '/Users/mac/.gemini/antigravity/scratch/stitch-app';
const screensDir = path.join(projectDir, 'screens');

if (!fs.existsSync(screensDir)) {
  fs.mkdirSync(screensDir, { recursive: true });
}

const raw = fs.readFileSync(path.join(projectDir, 'screens.json'), 'utf8');
const data = JSON.parse(raw);
const screens = data.result?.structuredContent?.screens || [];

console.log(`Encontradas ${screens.length} pantallas/recursos en el proyecto.`);

const screenMap = [
  { match: "Ranking & Candidatos", slug: "ranking", route: "/ranking", label: "Ranking", icon: "leaderboard" },
  { match: "Agregar Auto", slug: "agregar-auto", route: "/agregar-auto", label: "Agregar Auto", icon: "add_circle" },
  { match: "Detalle y Evaluaci", slug: "detalle-auto", route: "/detalle-auto", label: "Detalle Auto", icon: "directions_car" },
  { match: "Ficha Autocompletada", slug: "ficha", route: "/ficha", label: "Ficha Técnica", icon: "description" },
  { match: "Costos TCO", slug: "tco-5-anos", route: "/tco-5-anos", label: "Costos TCO", icon: "payments" },
  { match: "Perfiles y Pesos", slug: "perfiles-pesos", route: "/perfiles-pesos", label: "Perfiles/Pesos", icon: "tune" },
  { match: "Inspecci", slug: "inspeccion", route: "/inspeccion", label: "Inspección", icon: "fact_check" },
  { match: "AutoScore PRO", slug: "pro", route: "/pro", label: "AutoScore PRO", icon: "workspace_premium" },
  { match: "Prototype Flow", slug: "flow", route: "/flow", label: "Flujo", icon: "alt_route" }
];

async function downloadAll() {
  const downloadedRoutes = [];

  for (const item of screenMap) {
    const found = screens.find(s => s.title && s.title.includes(item.match) && s.htmlCode?.downloadUrl);
    if (!found) {
      console.log(`⚠️ No se encontró HTML para: ${item.match}`);
      continue;
    }

    console.log(`⬇️ Descargando: "${found.title}" -> ${item.slug}.html`);
    const resp = await fetch(found.htmlCode.downloadUrl);
    let html = await resp.text();

    const filePath = path.join(screensDir, `${item.slug}.html`);
    fs.writeFileSync(filePath, html, 'utf8');
    downloadedRoutes.push({
      title: found.title,
      slug: item.slug,
      route: item.route,
      label: item.label,
      icon: item.icon,
      path: filePath
    });
  }

  fs.writeFileSync(
    path.join(projectDir, 'routes-metadata.json'),
    JSON.stringify(downloadedRoutes, null, 2),
    'utf8'
  );

  console.log(`\n✅ ${downloadedRoutes.length} pantallas descargadas exitosamente en ${screensDir}`);
}

downloadAll().catch(console.error);
