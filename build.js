#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Fonction simple de minification CSS
function minifyCSS(css) {
    return css
        .replace(/\/\*[\s\S]*?\*\//g, '') // Supprimer les commentaires
        .replace(/\s+/g, ' ') // Remplacer les espaces multiples par un seul
        .replace(/;\s*}/g, '}') // Supprimer le point-virgule avant }
        .replace(/\s*{\s*/g, '{') // Supprimer les espaces autour de {
        .replace(/;\s*/g, ';') // Supprimer les espaces après ;
        .replace(/:\s*/g, ':') // Supprimer les espaces après :
        .replace(/,\s*/g, ',') // Supprimer les espaces après ,
        .trim();
}

// Fonction simple de minification JS
function minifyJS(js) {
    return js
        .replace(/\/\*[\s\S]*?\*\//g, '') // Supprimer les commentaires multi-lignes
        .replace(/\/\/.*$/gm, '') // Supprimer les commentaires ligne
        .replace(/\s+/g, ' ') // Remplacer les espaces multiples par un seul
        .replace(/;\s*}/g, '}') // Supprimer le point-virgule avant }
        .replace(/\s*{\s*/g, '{') // Supprimer les espaces autour de {
        .replace(/;\s*/g, ';') // Supprimer les espaces après ;
        .replace(/,\s*/g, ',') // Supprimer les espaces après ,
        .replace(/\s*=\s*/g, '=') // Supprimer les espaces autour de =
        .replace(/\s*\(\s*/g, '(') // Supprimer les espaces après (
        .replace(/\s*\)\s*/g, ')') // Supprimer les espaces avant )
        .trim();
}

// Lire les fichiers
const html = fs.readFileSync('index.html', 'utf8');
const css = fs.readFileSync('styles.css', 'utf8');
const script = fs.readFileSync('script.js', 'utf8');
const data = fs.readFileSync('data.js', 'utf8');

// Minifier
const minifiedCSS = minifyCSS(css);
const minifiedScript = minifyJS(script);
const minifiedData = minifyJS(data);

// Combiner les JS en un seul bundle
const bundledJS = minifiedData + '\n' + minifiedScript;

// Créer le HTML avec CSS inline et JS bundle
const newHTML = html
    .replace(/<link rel="stylesheet" href="styles\.css">/, `<style>${minifiedCSS}</style>`)
    .replace(/<script src="data\.js"><\/script>\s*<script src="script\.js"><\/script>/, `<script>${bundledJS}</script>`);

// Créer le dossier dist s'il n'existe pas
if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
}

// Écrire les fichiers
fs.writeFileSync('dist/index.html', newHTML);

// Calculer les tailles
const originalSize = fs.statSync('index.html').size + 
                     fs.statSync('styles.css').size + 
                     fs.statSync('script.js').size + 
                     fs.statSync('data.js').size;
const newSize = fs.statSync('dist/index.html').size;
const reduction = ((1 - newSize / originalSize) * 100).toFixed(1);

console.log(`✓ Build terminé !`);
console.log(`  Taille originale: ${(originalSize / 1024).toFixed(2)} KB`);
console.log(`  Taille optimisée: ${(newSize / 1024).toFixed(2)} KB`);
console.log(`  Réduction: ${reduction}%`);
console.log(`  Fichiers créés dans: dist/index.html`);

