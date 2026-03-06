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
        
        // Uniquement les VRAIS petits caractères (pas あ い う え お / ア イ ウ エ オ / や ゆ よ / ヤ ユ ヨ)
        // Petits hiragana: ぁぃぅぇぉ (3041,3043,3045,3047,3049), っ (3063), ゃゅょ (3083-3085 uniquement)
        // Petits katakana: ァィゥェォ (30A1,30A3,...), ッ (30C3), ャュョ (30E3-30E5 uniquement)
        const isSmallHiragana =
            (charCode >= 0x3041 && charCode <= 0x3049 && (charCode & 1) === 1) ||
            charCode === 0x3063 ||
            (charCode >= 0x3083 && charCode <= 0x3085);
        const isSmallKatakana =
            (charCode >= 0x30A1 && charCode <= 0x30A9 && (charCode & 1) === 1) ||
            charCode === 0x30C3 ||
            (charCode >= 0x30E3 && charCode <= 0x30E5);
        
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

function initTheme() {
    const theme = localStorage.getItem('theme');
    const toggle = document.getElementById('theme-dark-toggle');
    if (theme === 'dark' && toggle) {
        document.body.classList.add('dark-mode');
        toggle.checked = true;
    } else if (toggle) {
        document.body.classList.remove('dark-mode');
        toggle.checked = false;
    }
}

function setTheme(dark) {
    if (dark) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
    }
}
