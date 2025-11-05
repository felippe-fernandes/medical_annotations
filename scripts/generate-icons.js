// Script para gerar ícones PNG do emoji 🩺
// Este script cria os ícones necessários para PWA

const fs = require('fs');
const path = require('path');

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <text y=".9em" font-size="90">🩺</text>
</svg>`;

const publicDir = path.join(__dirname, '..', 'public');
const svgPath = path.join(publicDir, 'icon.svg');

// Salvar SVG
fs.writeFileSync(svgPath, svgContent);
console.log('✓ icon.svg criado');

console.log('\n⚠️  Para gerar os PNGs, você precisa usar uma ferramenta online ou instalar sharp:');
console.log('\nOpção 1 - Online (Recomendado):');
console.log('1. Acesse: https://convertio.co/pt/svg-png/');
console.log('2. Faça upload de public/icon.svg');
console.log('3. Converta para PNG com 512x512px');
console.log('4. Salve como public/icon-512x512.png');
console.log('5. Converta novamente para 192x192px');
console.log('6. Salve como public/icon-192x192.png');
console.log('7. Converta para 32x32px para favicon');
console.log('8. Salve como public/favicon.ico\n');

console.log('Opção 2 - Usar sharp (requer instalação):');
console.log('npm install sharp');
console.log('node scripts/generate-icons-sharp.js\n');
