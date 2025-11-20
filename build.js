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
const data = fs.readFileSync('data.js', 'utf8');

// Lire tous les modules JS dans l'ordre
const utils = fs.readFileSync('js/utils.js', 'utf8');
const dom = fs.readFileSync('js/dom.js', 'utf8');
const state = fs.readFileSync('js/state.js', 'utf8');
const testGame = fs.readFileSync('js/test-game.js', 'utf8');
const memoryGame = fs.readFileSync('js/memory-game.js', 'utf8');
const ui = fs.readFileSync('js/ui.js', 'utf8');
const script = fs.readFileSync('script.js', 'utf8');

// Minifier
const minifiedCSS = minifyCSS(css);
const minifiedData = minifyJS(data);
const minifiedUtils = minifyJS(utils);
const minifiedDom = minifyJS(dom);
const minifiedState = minifyJS(state);
const minifiedTestGame = minifyJS(testGame);
const minifiedMemoryGame = minifyJS(memoryGame);
const minifiedUI = minifyJS(ui);
const minifiedScript = minifyJS(script);

// Combiner les JS en un seul bundle dans l'ordre
const bundledJS = minifiedData + '\n' + 
                  minifiedUtils + '\n' + 
                  minifiedDom + '\n' + 
                  minifiedState + '\n' + 
                  minifiedTestGame + '\n' + 
                  minifiedMemoryGame + '\n' + 
                  minifiedUI + '\n' + 
                  minifiedScript;

// Créer le HTML avec CSS inline et JS bundle
// Pattern pour matcher tous les scripts (data.js, js/*.js, script.js)
const scriptPattern = /<script src="data\.js"><\/script>\s*<script src="js\/utils\.js"><\/script>\s*<script src="js\/dom\.js"><\/script>\s*<script src="js\/state\.js"><\/script>\s*<script src="js\/test-game\.js"><\/script>\s*<script src="js\/memory-game\.js"><\/script>\s*<script src="js\/ui\.js"><\/script>\s*<script src="script\.js"><\/script>/;
const newHTML = html
    .replace(/<link rel="stylesheet" href="styles\.css">/, `<style>${minifiedCSS}</style>`)
    .replace(scriptPattern, `<script>${bundledJS}</script>`);

// Créer le dossier dist s'il n'existe pas
if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
}

// Créer le dossier img dans dist s'il n'existe pas
if (!fs.existsSync('dist/img')) {
    fs.mkdirSync('dist/img', { recursive: true });
}

// Copier les fichiers HTML supplémentaires
const aboutHTML = fs.readFileSync('about.html', 'utf8');
const releaseNotesHTML = fs.readFileSync('release-notes.html', 'utf8');

// Traiter about.html et release-notes.html de la même manière
const aboutHTMLProcessed = aboutHTML
    .replace(/<link rel="stylesheet" href="styles\.css">/, `<style>${minifiedCSS}</style>`)
    .replace(scriptPattern, `<script>${bundledJS}</script>`)
    .replace(/<script>[\s\S]*?updateCurrentYear[\s\S]*?<\/script>/, `<script>document.getElementById('current-year').textContent = new Date().getFullYear();</script>`);

const releaseNotesHTMLProcessed = releaseNotesHTML
    .replace(/<link rel="stylesheet" href="styles\.css">/, `<style>${minifiedCSS}</style>`)
    .replace(/<script>[\s\S]*?updateCurrentYear[\s\S]*?<\/script>/, `<script>document.getElementById('current-year').textContent = new Date().getFullYear();</script>`);

// Écrire les fichiers HTML
fs.writeFileSync('dist/index.html', newHTML);
fs.writeFileSync('dist/about.html', aboutHTMLProcessed);
fs.writeFileSync('dist/release-notes.html', releaseNotesHTMLProcessed);

// Copier les images
if (fs.existsSync('img/icon-192.png')) {
    fs.copyFileSync('img/icon-192.png', 'dist/img/icon-192.png');
}
if (fs.existsSync('img/icon-512.png')) {
    fs.copyFileSync('img/icon-512.png', 'dist/img/icon-512.png');
}

// Calculer les tailles
const originalSize = fs.statSync('index.html').size + 
                     fs.statSync('styles.css').size + 
                     fs.statSync('script.js').size + 
                     fs.statSync('data.js').size +
                     fs.statSync('js/utils.js').size +
                     fs.statSync('js/dom.js').size +
                     fs.statSync('js/state.js').size +
                     fs.statSync('js/test-game.js').size +
                     fs.statSync('js/memory-game.js').size +
                     fs.statSync('js/ui.js').size;
const newSize = fs.statSync('dist/index.html').size;
const reduction = ((1 - newSize / originalSize) * 100).toFixed(1);

console.log(`✓ Build terminé !`);
console.log(`  Taille originale: ${(originalSize / 1024).toFixed(2)} KB`);
console.log(`  Taille optimisée: ${(newSize / 1024).toFixed(2)} KB`);
console.log(`  Réduction: ${reduction}%`);
console.log(`  Fichiers créés dans dist/:`);
console.log(`    - index.html`);
console.log(`    - about.html`);
console.log(`    - release-notes.html`);
console.log(`    - img/icon-192.png`);
console.log(`    - img/icon-512.png`);

