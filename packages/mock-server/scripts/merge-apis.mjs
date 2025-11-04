import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { glob } from 'glob';
import { writeFile } from 'fs/promises';
import SwaggerMerger from 'swagger-merger';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');
const demosDir = resolve(rootDir, 'src/demos');
const outputFile = resolve(rootDir, 'openapi.yaml');

async function mergeOpenAPIs() {
  console.log('[API-Merger] Buscando archivos *.openapi.yaml en:', demosDir);

  const files = await glob(`${demosDir}/**/*.openapi.yaml`);

  if (files.length === 0) {
    console.warn(
      '[API-Merger] No se encontraron archivos .openapi.yaml. Creando un archivo base vacío.'
    );
    await writeFile(
      outputFile,
      `openapi: 3.0.0\ninfo: {title: "Mock API", version: "1.0.0"}\npaths: {}`,
      'utf-8'
    );
    return;
  }

  console.log(
    `[API-Merger] Encontrados ${files.length} archivos. Fusionando...`
  );

  const merger = new SwaggerMerger({
    info: {
      title: 'EA Portfolio Mock API (Fusionada)',
      version: '1.0.0',
    },
  });

  for (const file of files) {
    await merger.addFile(file);
  }

  const mergedYaml = await merger.compose();
  await writeFile(outputFile, mergedYaml, 'utf-8');

  console.log(
    `[API-Merger] ¡Éxito! API fusionada y guardada en: ${outputFile}`
  );
}

mergeOpenAPIs().catch((err) => {
  console.error('[API-Merger] Error al fusionar APIs:', err);
  process.exit(1);
});
