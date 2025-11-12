#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

console.log('Installation des dépendances...');
try {
    execSync('npm install --silent', { stdio: 'inherit' });
} catch (e) {
    console.log('Dépendances déjà installées ou erreur');
}

console.log('Minification avancée...');

// Minifier CSS avec csso
try {
    execSync('npx csso styles.css -o dist/styles.min.css', { stdio: 'inherit' });
} catch (e) {
    console.log('Erreur minification CSS');
}

// Minifier JS avec terser
try {
    execSync('npx terser data.js script.js -c -m -o dist/bundle.min.js', { stdio: 'inherit' });
} catch (e) {
    console.log('Erreur minification JS');
}

// Créer le HTML optimisé
const html = fs.readFileSync('index.html', 'utf8');
const minCSS = fs.readFileSync('dist/styles.min.css', 'utf8');
const minJS = fs.readFileSync('dist/bundle.min.js', 'utf8');

const optimizedHTML = html
    .replace(/<link rel="stylesheet" href="styles\.css">/, `<style>${minCSS}</style>`)
    .replace(/<script src="data\.js"><\/script>\s*<script src="script\.js"><\/script>/, `<script>${minJS}</script>`);

fs.writeFileSync('dist/index.html', optimizedHTML);

const originalSize = fs.statSync('index.html').size + 
                     fs.statSync('styles.css').size + 
                     fs.statSync('script.js').size + 
                     fs.statSync('data.js').size;
const newSize = fs.statSync('dist/index.html').size;
const reduction = ((1 - newSize / originalSize) * 100).toFixed(1);

console.log(`\n✓ Minification avancée terminée !`);
console.log(`  Taille originale: ${(originalSize / 1024).toFixed(2)} KB`);
console.log(`  Taille optimisée: ${(newSize / 1024).toFixed(2)} KB`);
console.log(`  Réduction: ${reduction}%`);

