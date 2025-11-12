# JLPT Cards - Application de Flashcards pour Hiragana et Katakana

Une application web interactive pour apprendre et pratiquer les caractères Hiragana et Katakana japonais, ainsi que les mots associés.

## Fonctionnalités

- **Hiragana Characters** : Pratiquez vos connaissances des caractères Hiragana
- **Hiragana Words** : Pratiquez les mots Hiragana par niveau JLPT (N5 à N1)
- **Katakana Characters** : Pratiquez vos connaissances des caractères Katakana
- **Katakana Words** : Pratiquez les mots Katakana (basique, intermédiaire, avancé)

## Comment utiliser

1. Ouvrez `index.html` dans votre navigateur web
2. Sélectionnez le mode d'apprentissage souhaité
3. Pour les caractères : sélectionnez les groupes à pratiquer, puis cliquez sur "Commencer le test"
4. Pour les mots : sélectionnez le niveau souhaité
5. Tapez le Romaji équivalent du caractère ou mot affiché
6. Cliquez sur "Vérifier" ou appuyez sur Entrée
7. Consultez vos résultats à la fin du test

## Structure du projet

- `index.html` : Structure HTML de l'application
- `styles.css` : Styles CSS modernes et responsives
- `script.js` : Logique JavaScript de l'application
- `data.js` : Données des caractères et mots japonais
- `build.js` : Script de build pour optimiser les fichiers
- `dist/` : Dossier contenant la version optimisée (généré automatiquement)

## Build et Optimisation

Pour créer une version optimisée de l'application :

```bash
node build.js
```

Cela va :
- Minifier le CSS et JavaScript
- Bundler tous les fichiers JS en un seul
- Inliner le CSS dans le HTML
- Créer un fichier `dist/index.html` optimisé (~17% plus léger)

**Gains de performance** :
- Taille originale : ~101 KB
- Taille optimisée : ~83 KB
- Réduction : ~17.6%
- Requêtes HTTP : 4 fichiers → 1 fichier

## Technologies utilisées

- HTML5
- CSS3 (avec animations et design moderne)
- JavaScript (Vanilla JS, pas de dépendances)

## Fonctionnalités techniques

- Interface utilisateur moderne et responsive
- Système de flashcards interactif
- Suivi des scores et statistiques
- Barre de progression
- Feedback immédiat sur les réponses
- Support du clavier (touche Entrée)
- Mélange aléatoire des cartes

## Compatibilité

L'application fonctionne sur tous les navigateurs modernes (Chrome, Firefox, Safari, Edge).

