const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = 'c:/Users/Nigglet/Desktop/ANTI-CHATGPT ADS';
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const ZIP_OUTPUT_DESKTOP = 'c:/Users/Nigglet/Desktop/ChatGPT_Clean_v1.0.0_PRODUCTION.zip';
const ZIP_OUTPUT_LOCAL = path.join(ROOT_DIR, 'ChatGPT_Clean_v1.0.0_PRODUCTION.zip');

console.log('🚀 Iniciando Build de Produção Seguro para ChatGPT Clean...');

// 1. Limpar e criar pasta dist
if (fs.existsSync(DIST_DIR)) {
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
}
fs.mkdirSync(DIST_DIR, { recursive: true });

// 2. Função auxiliar para copiar ficheiros
function copyFile(file) {
  const src = path.join(ROOT_DIR, file);
  const dest = path.join(DIST_DIR, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`  ✓ Copiado: ${file}`);
  } else {
    console.warn(`  ⚠️ Ficheiro não encontrado: ${file}`);
  }
}

// 3. Função auxiliar para copiar diretórios recursivamente
function copyDir(srcDir, destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (let entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 4. Copiar manifest e assets estáticos
copyFile('manifest.json');
copyFile('popup.html');
copyFile('popup.css');
copyFile('styles.css');
copyFile('jspdf.umd.min.js');

// Copiar pasta icons
const iconsSrc = path.join(ROOT_DIR, 'icons');
const iconsDest = path.join(DIST_DIR, 'icons');
if (fs.existsSync(iconsSrc)) {
  copyDir(iconsSrc, iconsDest);
  console.log('  ✓ Diretório de Ícones copiado com sucesso.');
}

// 5. Ofuscação e Minificação Avançada com Terser
console.log('\n🔒 Ofuscando e Minificando Scripts JavaScript (content.js e popup.js)...');

function minifyJS(filename) {
  const srcPath = path.join(ROOT_DIR, filename);
  const destPath = path.join(DIST_DIR, filename);
  
  console.log(`  ⏳ Ofuscando ${filename}...`);
  try {
    execSync(
      `npx terser "${srcPath}" --compress drop_console=false,dead_code=true,drop_debugger=true --mangle toplevel=true,eval=true --comments false --output "${destPath}"`,
      { stdio: 'inherit' }
    );
    const origSize = fs.statSync(srcPath).size;
    const minSize = fs.statSync(destPath).size;
    console.log(`  ✓ ${filename} ofuscado com sucesso! Tamanho: ${(origSize/1024).toFixed(1)} KB ➔ ${(minSize/1024).toFixed(1)} KB (-${((1 - minSize/origSize)*100).toFixed(0)}%)`);
  } catch (err) {
    console.error(`  ❌ Erro ao ofuscar ${filename}:`, err.message);
    throw err;
  }
}

minifyJS('content.js');
minifyJS('popup.js');

// 6. Validar Sintaxe do Código Ofuscado
console.log('\n🔍 Validando sintaxe do código gerado...');
execSync(`node --check "${path.join(DIST_DIR, 'content.js')}" "${path.join(DIST_DIR, 'popup.js')}"`, { stdio: 'inherit' });
console.log('  ✓ Sintaxe 100% válida e aprovada!');

// 7. Gerar Arquivo ZIP Seguro
console.log('\n📦 Empacotando ficheiro ZIP de Produção...');

if (fs.existsSync(ZIP_OUTPUT_DESKTOP)) {
  fs.unlinkSync(ZIP_OUTPUT_DESKTOP);
}
if (fs.existsSync(ZIP_OUTPUT_LOCAL)) {
  fs.unlinkSync(ZIP_OUTPUT_LOCAL);
}

// Compactar via PowerShell
execSync(`powershell -Command "Compress-Archive -Path '${DIST_DIR}/*' -DestinationPath '${ZIP_OUTPUT_LOCAL}' -Force"`, { stdio: 'inherit' });
fs.copyFileSync(ZIP_OUTPUT_LOCAL, ZIP_OUTPUT_DESKTOP);

console.log('\n🎉 SUCESSO! O pacote seguro foi gerado em:');
console.log(`👉 ${ZIP_OUTPUT_DESKTOP}`);
console.log(`👉 ${ZIP_OUTPUT_LOCAL}`);
console.log('\n🛡️ Segurança: Todos os scripts foram ofuscados, e ficheiros privados (chaves, geradores, markdown) foram completamente excluídos!');
