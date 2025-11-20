// État de l'application
const AppState = {
    // État du test
    currentMode: null,
    currentCards: [],
    currentCardIndex: 0,
    score: 0,
    totalAnswered: 0,
    selectedGroups: [],
    selectionState: {}, // Sauvegarde de l'état de sélection des groupes et caractères
    
    // État du jeu memory
    memoryType: null, // 'hiragana' ou 'katakana'
    memoryMode: null, // 'simple', 'accents', 'composite'
    allCharacters: [], // Tous les caractères disponibles
    currentSeries: [], // Série actuelle de 5 caractères
    selectedSign: null,
    selectedRomaji: null,
    matchedPairs: [],
    memoryAttempts: 0,
    wrongMatch: false
};

