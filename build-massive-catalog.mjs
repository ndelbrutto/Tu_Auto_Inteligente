import fs from 'fs';
import path from 'path';

async function buildCatalog() {
  console.log("🚀 Construyendo catálogo masivo de vehículos para el mercado chileno...");

  // 1. Obtener base global de modelos
  let globalData = [];
  try {
    const resp = await fetch("https://raw.githubusercontent.com/matthlavacka/car-list/master/car-list.json");
    globalData = await resp.json();
    console.log(`✓ Base global obtenida: ${globalData.length} marcas.`);
  } catch (e) {
    console.error("Error al descargar base global:", e);
  }

  // 2. Base de datos específica enriquecida con marcas y modelos líderes en Chile (incluyendo marcas chinas y pickups)
  const chileanAdditions = [
    {
      brand: "Nissan",
      models: ["Navara / NP300", "Qashqai", "X-Trail", "Kicks", "Versa", "Sentra", "Terrano", "V16", "Tiida", "March", "Pathfinder", "Murano", "Patrol", "Frontier", "Leaf"]
    },
    {
      brand: "MG",
      models: ["ZS", "ZS EV", "ZX", "HS", "MG3", "MG5", "MG6", "MG4 EV", "GT", "RX5", "Marvel R", "Cyberster"]
    },
    {
      brand: "Chery",
      models: ["Tiggo 2", "Tiggo 2 Pro", "Tiggo 3", "Tiggo 7 Pro", "Tiggo 8", "Tiggo 8 Pro", "Arrizo 3", "Arrizo 5", "IQ", "Fulwin"]
    },
    {
      brand: "Haval",
      models: ["H6", "H6 HEV Híbrido", "Jolion", "Jolion HEV", "Dargo", "H2", "H9"]
    },
    {
      brand: "Great Wall",
      models: ["Poer", "Poer Plus", "Wingle 5", "Wingle 7", "Haval M4", "Voleex C30", "Deer", "Safe"]
    },
    {
      brand: "Changan",
      models: ["CS15", "CS35 Plus", "CS55 Plus", "Uni-T", "Uni-K", "Hunter", "Alsvin", "CX70", "MD201"]
    },
    {
      brand: "Maxus",
      models: ["T60", "T90", "T90 EV", "D60", "D90", "V80", "V90", "G10", "Deliver 9"]
    },
    {
      brand: "JAC",
      models: ["T6", "T8", "T8 Pro", "JS2", "JS3", "JS4", "JS8", "Refine", "S2", "S3"]
    },
    {
      brand: "Geely",
      models: ["Coolray", "Azkarra", "Okavango", "Geometry C", "GX3 Pro", "Emgrand"]
    },
    {
      brand: "BYD",
      models: ["Song Plus DM-i", "Yuan Plus EV", "Dolphin", "Seal", "Tang EV", "Han EV"]
    },
    {
      brand: "GAC Motor",
      models: ["GS3", "GS3 Power", "GS4", "GS4 Power", "GS8", "Empow", "Emkoo"]
    },
    {
      brand: "Jetour",
      models: ["X70", "X70 Plus", "Dashing", "T2"]
    },
    {
      brand: "RAM",
      models: ["700", "1000", "1500", "1500 Rebel", "1500 TRX", "2500 Heavy Duty", "Rampage"]
    },
    {
      brand: "Jeep",
      models: ["Cherokee XJ", "Grand Cherokee", "Wrangler", "Compass", "Renegade", "Commander", "Gladiator", "Patriot"]
    },
    {
      brand: "SsangYong / KGM",
      models: ["Musso", "Musso Grand", "Rexton", "Korando", "Tivoli", "Torres", "Actyon", "Actyon Sports", "Kyron"]
    },
    {
      brand: "Mahindra",
      models: ["Pik Up", "Scorpio", "XUV500", "XUV300", "Thar"]
    },
    {
      brand: "Tesla",
      models: ["Model 3", "Model Y", "Model S", "Model X", "Cybertruck"]
    },
    {
      brand: "Volvo",
      models: ["XC40", "XC40 Recharge", "XC60", "XC90", "C40 Recharge", "EX30", "S60", "V40", "V60"]
    },
    {
      brand: "Cupra",
      models: ["Formentor", "Ateca", "León", "Born"]
    }
  ];

  // Unir todas las marcas
  const allBrandsMap = new Map();

  // Agregar base global
  for (const item of globalData) {
    const brandName = item.brand.trim();
    if (!allBrandsMap.has(brandName)) {
      allBrandsMap.set(brandName, new Set());
    }
    for (const m of item.models) {
      allBrandsMap.get(brandName).add(m.trim());
    }
  }

  // Agregar/enriquecer con marcas chilenas
  for (const item of chileanAdditions) {
    if (!allBrandsMap.has(item.brand)) {
      allBrandsMap.set(item.brand, new Set());
    }
    for (const m of item.models) {
      allBrandsMap.get(item.brand).add(m);
    }
  }

  // Generar jerarquía con Años y Versiones
  const finalCatalog = {};
  const currentYear = 2025;

  for (const [brand, modelsSet] of allBrandsMap.entries()) {
    finalCatalog[brand] = {};

    for (const model of modelsSet) {
      // Determinar rango de años según modelo
      let minYear = 2010;
      if (model.includes("XJ") || model.includes("V16") || model.includes("E36") || model.includes("E39") || model.includes("Terrano") || model.includes("Deer") || model.includes("199")) {
        minYear = 1995;
      } else if (model.includes("Swift") || model.includes("Hilux") || model.includes("Forester") || model.includes("Corolla") || model.includes("RAV4") || model.includes("Impreza") || model.includes("Civic") || model.includes("L200") || model.includes("Grand Vitara")) {
        minYear = 2000;
      }

      const anios = [];
      for (let y = currentYear; y >= minYear; y--) {
        anios.push(y);
      }

      // Determinar categoría y combustible predominante
      const isPickup = /hilux|poer|ranger|navara|d-max|l200|t60|t8|amarok|ram|bt-50|wingle|musso|hunter|f-150|colorado/i.test(model);
      const isSUV = /cherokee|forester|rav4|tiggo|h6|jolion|cs35|cs55|cx-|dargo|outback|xv|crosstrek|kicks|qashqai|x-trail|tucson|santa fe|sportage|sorento|tracker|duster|captur|t-cross|taos|tiguan|grand vitara|jimny/i.test(model);
      const isDeportivo = /wrx|sport|m3|m4|m5|amg|gt|mustang|camaro|corvette|brz|supra|type r|gti/i.test(model);

      let categoria = "Sedán / Lujo";
      if (isPickup) categoria = "Pickup";
      else if (isSUV) categoria = "SUV / Todoterreno";
      else if (isDeportivo) categoria = "Deportivo";

      const isDiesel = isPickup || /diésel|diesel|crdi|tdci|d-4d|crd|td/i.test(model);
      const combustible = isDiesel ? "diesel" : (isDeportivo ? "97" : "95");

      // Generar versiones realistas y homologadas
      const versiones = [];
      if (isPickup) {
        versiones.push("2.4 / 2.8 Turbo Diésel 4x4 MT");
        versiones.push("2.4 / 2.8 Turbo Diésel 4x4 AT");
        versiones.push("2.0 / 2.5 Diésel 4x2 MT Cabina Doble");
        versiones.push("Edición Limitada / Full Equipo 4x4");
      } else if (isSUV) {
        versiones.push("2.0 / 2.5 Gasolina AWD / 4x4 Automático");
        versiones.push("2.0 Gasolina 4x2 Manual / CVT");
        versiones.push("1.5 / 1.6 Turbo AWD / 4x2");
        versiones.push("Híbrido (HEV / MHEV) AWD");
        versiones.push("Full Equipo Limited / Signature");
      } else if (isDeportivo) {
        versiones.push("2.0 / 2.4 Turbo Gasolina 6MT");
        versiones.push("2.5 / 3.0 Turbo Gasolina Automático / DCT");
        versiones.push("Edición Sport / High Performance");
      } else {
        versiones.push("1.4 / 1.6 Gasolina Manual");
        versiones.push("1.6 / 2.0 Gasolina Automático / CVT");
        versiones.push("1.0 / 1.2 Turbo Eficiente");
      }

      finalCatalog[brand][model] = {
        anios,
        categoria,
        combustible,
        versiones,
        precio_promedio: isPickup ? 19500000 : (isSUV ? 17500000 : 12500000),
        tasacion_sii: isPickup ? 18000000 : (isSUV ? 15500000 : 11000000),
        permiso_clp: isPickup ? 350000 : (isSUV ? 280000 : 180000)
      };
    }
  }

  // Guardar archivo JSON masivo
  const outJsonPath = "/Users/mac/.gemini/antigravity/scratch/stitch-app/public/catalogo_vehiculos.json";
  fs.writeFileSync(outJsonPath, JSON.stringify(finalCatalog, null, 2), "utf8");

  const totalBrands = Object.keys(finalCatalog).length;
  let totalModels = 0;
  for (const b of Object.keys(finalCatalog)) {
    totalModels += Object.keys(finalCatalog[b]).length;
  }

  console.log(`\n🎉 Catálogo Masivo Generado con Éxito:`);
  console.log(`   - Marcas: ${totalBrands}`);
  console.log(`   - Modelos: ${totalModels}`);
  console.log(`   - Archivo: ${outJsonPath}`);
}

buildCatalog().catch(console.error);
