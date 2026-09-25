import { stitch } from "@google/stitch-sdk";
import "dotenv/config";

async function main() {
  const apiKey = process.env.STITCH_API_KEY;

  if (!apiKey || apiKey === "PEGA_AQUI_TU_API_KEY") {
    console.error("❌ Error: Debes configurar tu STITCH_API_KEY en el archivo .env");
    console.error("Abre el archivo .env y reemplaza 'PEGA_AQUI_TU_API_KEY' con tu clave real.");
    process.exit(1);
  }

  console.log("🚀 Conectando a Google Stitch...");

  try {
    // 1. Crear un proyecto
    console.log("Creando proyecto de demostración...");
    const project = await stitch.createProject("Demo Project");
    console.log(`✅ Proyecto creado con ID: ${project.id}`);

    // 2. Generar pantalla con prompt
    const prompt = "A clean and modern login page with email/password and social login options";
    console.log(`🎨 Generando pantalla con el prompt: "${prompt}"...`);
    const screen = await project.generate(prompt);

    // 3. Obtener URLs de los recursos generados
    const htmlUrl = await screen.getHtml();
    const imageUrl = await screen.getImage();

    console.log("\n✨ ¡Pantalla generada con éxito!");
    console.log(`📄 Código HTML: ${htmlUrl}`);
    console.log(`🖼️  Captura de pantalla: ${imageUrl}`);
  } catch (error) {
    console.error("❌ Ocurrió un error al interactuar con la API:", error);
  }
}

main();
