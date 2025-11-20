// Fonctions utilitaires

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function formatSmallChars(char) {
    let formattedChar = '';
    
    for (let i = 0; i < char.length; i++) {
        const currentChar = char[i];
        const charCode = currentChar.charCodeAt(0);
        
        // Détecter les petits caractères hiragana et katakana
        // Petits hiragana: ぁ-ぉ, っ, ゃ-ょ (U+3041-U+3049, U+3063, U+3083-U+3087)
        // Petits katakana: ァ-ォ, ッ, ャ-ョ (U+30A1-U+30A9, U+30C3, U+30E3-U+30E7)
        const isSmallHiragana = (charCode >= 0x3041 && charCode <= 0x3049) || charCode === 0x3063 || (charCode >= 0x3083 && charCode <= 0x3087);
        const isSmallKatakana = (charCode >= 0x30A1 && charCode <= 0x30A9) || charCode === 0x30C3 || (charCode >= 0x30E3 && charCode <= 0x30E7);
        
        if (isSmallHiragana || isSmallKatakana) {
            formattedChar += `<span class="small-char">${currentChar}</span>`;
        } else {
            formattedChar += currentChar;
        }
    }
    
    return formattedChar;
}

function updateCurrentYear() {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

