// État de l'application
let currentMode = null;
let currentCards = [];
let currentCardIndex = 0;
let score = 0;
let totalAnswered = 0;
let selectedGroups = [];

// Éléments DOM
const menu = document.getElementById('menu');
const groupSelection = document.getElementById('group-selection');
const levelSelection = document.getElementById('level-selection');
const testArea = document.getElementById('test-area');
const results = document.getElementById('results');
const answerInput = document.getElementById('answer-input');
const checkAnswerBtn = document.getElementById('check-answer');
const nextCardBtn = document.getElementById('next-card');
const feedback = document.getElementById('feedback');
const characterDisplay = document.getElementById('character-display');
const translationDisplay = document.getElementById('translation-display');
const progressFill = document.getElementById('progress');
const scoreDisplay = document.getElementById('score');
const totalDisplay = document.getElementById('total');
const headerBackBtn = document.getElementById('header-back-menu');

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
});

function setupEventListeners() {
    // Menu cards
    document.querySelectorAll('.menu-card').forEach(card => {
        card.addEventListener('click', () => {
            const mode = card.dataset.mode;
            handleModeSelection(mode);
        });
    });

    // Group selection
    document.getElementById('select-all-groups').addEventListener('click', selectAllGroups);
    document.getElementById('deselect-all-groups').addEventListener('click', deselectAllGroups);
    document.getElementById('select-all-characters').addEventListener('click', selectAllCharacters);
    document.getElementById('deselect-all-characters').addEventListener('click', deselectAllCharacters);
    document.getElementById('start-test').addEventListener('click', startTest);
    document.getElementById('back-to-menu').addEventListener('click', showMenu);

    // Level selection
    document.getElementById('back-to-menu-words').addEventListener('click', showMenu);

    // Test controls
    checkAnswerBtn.addEventListener('click', checkAnswer);
    nextCardBtn.addEventListener('click', nextCard);
    document.getElementById('finish-test').addEventListener('click', finishTest);
    document.getElementById('restart-test').addEventListener('click', restartTest);

    // Results
    document.getElementById('restart-from-results').addEventListener('click', restartTest);
    document.getElementById('back-to-menu-results').addEventListener('click', showMenu);
    
    // Header back button
    headerBackBtn.addEventListener('click', showMenu);

    // Enter key support
    answerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            if (!nextCardBtn.classList.contains('hidden')) {
                nextCard();
            } else {
                checkAnswer();
            }
        }
    });
}

function handleModeSelection(mode) {
    currentMode = mode;
    
    if (mode.includes('chars')) {
        showGroupSelection(mode);
    } else {
        showLevelSelection(mode);
    }
}

function showGroupSelection(mode) {
    menu.classList.add('hidden');
    groupSelection.classList.remove('hidden');
    headerBackBtn.classList.remove('hidden');
    
    const groupCheckboxes = document.getElementById('group-checkboxes');
    const characterCheckboxes = document.getElementById('character-checkboxes');
    groupCheckboxes.innerHTML = '';
    characterCheckboxes.innerHTML = '';
    
    const data = mode.includes('hiragana') ? hiraganaData : katakanaData;
    const groupNames = {
        basic: 'Basique (あ-お)',
        k: 'K (か-こ)',
        s: 'S (さ-そ)',
        t: 'T (た-と)',
        n: 'N (な-の)',
        h: 'H (は-ほ)',
        m: 'M (ま-も)',
        y: 'Y (や-よ)',
        r: 'R (ら-ろ)',
        w: 'W (わ-を-ん)',
        g: 'G (が-ご)',
        z: 'Z (ざ-ぞ)',
        d: 'D (だ-ど)',
        b: 'B (ば-ぼ)',
        p: 'P (ぱ-ぽ)',
        kya: 'Kya (きゃ-きょ)',
        sha: 'Sha (しゃ-しょ)',
        cha: 'Cha (ちゃ-ちょ)',
        nya: 'Nya (にゃ-にょ)',
        hya: 'Hya (ひゃ-ひょ)',
        mya: 'Mya (みゃ-みょ)',
        rya: 'Rya (りゃ-りょ)',
        gya: 'Gya (ぎゃ-ぎょ)',
        ja: 'Ja (じゃ-じょ)',
        bya: 'Bya (びゃ-びょ)',
        pya: 'Pya (ぴゃ-ぴょ)'
    };
    
    // Créer les switches de groupes
    Object.keys(data).forEach(group => {
        const switchItem = document.createElement('div');
        switchItem.className = 'group-switch-item active';
        
        const label = document.createElement('div');
        label.className = 'group-switch-label';
        label.textContent = groupNames[group] || group;
        
        const switchContainer = document.createElement('label');
        switchContainer.className = 'switch';
        
        const groupSwitch = document.createElement('input');
        groupSwitch.type = 'checkbox';
        groupSwitch.id = `group-${group}`;
        groupSwitch.value = group;
        groupSwitch.checked = true;
        groupSwitch.addEventListener('change', () => {
            updateGroupSwitchItem(switchItem, groupSwitch.checked);
            toggleGroupCharacters(group, groupSwitch.checked);
        });
        
        const slider = document.createElement('span');
        slider.className = 'slider';
        
        switchContainer.appendChild(groupSwitch);
        switchContainer.appendChild(slider);
        
        switchItem.appendChild(label);
        switchItem.appendChild(switchContainer);
        
        switchItem.addEventListener('click', (e) => {
            if (e.target !== groupSwitch && e.target !== slider && !switchContainer.contains(e.target)) {
                groupSwitch.checked = !groupSwitch.checked;
                groupSwitch.dispatchEvent(new Event('change'));
            }
        });
        
        groupCheckboxes.appendChild(switchItem);
    });
    
    // Créer les checkboxes individuelles organisées par famille
    Object.keys(data).forEach(group => {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'character-group';
        
        const title = document.createElement('div');
        title.className = 'character-group-title';
        title.textContent = groupNames[group] || group;
        groupDiv.appendChild(title);
        
        const itemsDiv = document.createElement('div');
        itemsDiv.className = 'character-items';
        
        data[group].forEach((char, index) => {
            const charDiv = document.createElement('div');
            charDiv.className = 'character-switch-item active';
            charDiv.dataset.group = group;
            charDiv.dataset.index = index;
            
            const charSpan = document.createElement('div');
            charSpan.className = 'character-char';
            charSpan.textContent = char.char;
            
            const romajiSpan = document.createElement('div');
            romajiSpan.className = 'character-romaji';
            romajiSpan.textContent = char.romaji;
            
            const switchContainer = document.createElement('label');
            switchContainer.className = 'switch';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `char-${group}-${index}`;
            checkbox.value = `${group}-${index}`;
            checkbox.checked = true;
            checkbox.addEventListener('change', () => {
                updateCharacterSwitchState(charDiv, checkbox.checked);
                updateGroupCheckboxState(group);
            });
            
            const slider = document.createElement('span');
            slider.className = 'slider';
            
            switchContainer.appendChild(checkbox);
            switchContainer.appendChild(slider);
            
            charDiv.appendChild(charSpan);
            charDiv.appendChild(romajiSpan);
            charDiv.appendChild(switchContainer);
            
            charDiv.addEventListener('click', (e) => {
                if (e.target !== checkbox && e.target !== slider && !switchContainer.contains(e.target)) {
                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(new Event('change'));
                }
            });
            
            itemsDiv.appendChild(charDiv);
        });
        
        groupDiv.appendChild(itemsDiv);
        characterCheckboxes.appendChild(groupDiv);
    });
}

function toggleGroupCharacters(group, checked) {
    const data = currentMode.includes('hiragana') ? hiraganaData : katakanaData;
    if (!data[group]) return;
    
    // Trouver tous les caractères de ce groupe et les cocher/décocher
    const groupChars = data[group].map(c => c.char);
    const allCharDivs = document.querySelectorAll('.character-switch-item');
    
    allCharDivs.forEach(charDiv => {
        const charSpan = charDiv.querySelector('.character-char');
        const checkbox = charDiv.querySelector('input[type="checkbox"]');
        
        if (charSpan && checkbox && groupChars.includes(charSpan.textContent)) {
            checkbox.checked = checked;
            updateCharacterSwitchState(charDiv, checked);
        }
    });
}

function updateCharacterSwitchState(charDiv, checked) {
    if (checked) {
        charDiv.classList.add('active');
    } else {
        charDiv.classList.remove('active');
    }
}

function updateGroupSwitchItem(switchItem, checked) {
    if (checked) {
        switchItem.classList.add('active');
    } else {
        switchItem.classList.remove('active');
    }
}

function updateGroupCheckboxState(group) {
    const data = currentMode.includes('hiragana') ? hiraganaData : katakanaData;
    if (!data[group]) return;
    
    const groupCheckbox = document.getElementById(`group-${group}`);
    if (!groupCheckbox) return;
    
    // Compter les caractères sélectionnés dans ce groupe
    let selectedCount = 0;
    const allCharDivs = document.querySelectorAll('.character-switch-item');
    allCharDivs.forEach(charDiv => {
        const charSpan = charDiv.querySelector('.character-char');
        const checkbox = charDiv.querySelector('input[type="checkbox"]');
        if (charSpan && checkbox && data[group].some(c => c.char === charSpan.textContent)) {
            if (checkbox.checked) selectedCount++;
        }
    });
    
    // Mettre à jour la checkbox du groupe et son style visuel
    const switchItem = groupCheckbox.closest('.group-switch-item');
    if (selectedCount === 0) {
        groupCheckbox.checked = false;
        groupCheckbox.indeterminate = false;
        if (switchItem) {
            switchItem.classList.remove('active');
        }
    } else if (selectedCount === data[group].length) {
        groupCheckbox.checked = true;
        groupCheckbox.indeterminate = false;
        if (switchItem) {
            switchItem.classList.add('active');
        }
    } else {
        groupCheckbox.checked = false;
        groupCheckbox.indeterminate = true;
        if (switchItem) {
            switchItem.classList.add('active');
        }
    }
}

function showLevelSelection(mode) {
    menu.classList.add('hidden');
    levelSelection.classList.remove('hidden');
    headerBackBtn.classList.remove('hidden');
    
    const levelButtons = document.getElementById('level-buttons');
    levelButtons.innerHTML = '';
    
    const levels = mode.includes('hiragana') 
        ? ['n5', 'n4', 'n3', 'n2', 'n1']
        : ['basic', 'intermediate', 'advanced'];
    
    const levelLabels = {
        n5: 'N5 (50 mots)',
        n4: 'N4 (70 mots)',
        n3: 'N3 (70 mots)',
        n2: 'N2 (70 mots)',
        n1: 'N1 (160 mots)',
        basic: 'Basique (35 mots)',
        intermediate: 'Intermédiaire (50 mots)',
        advanced: 'Avancé (50 mots)'
    };
    
    levels.forEach(level => {
        const button = document.createElement('button');
        button.className = 'level-btn';
        button.textContent = levelLabels[level];
        button.addEventListener('click', () => {
            startWordTest(mode, level);
        });
        levelButtons.appendChild(button);
    });
}

function selectAllGroups() {
    document.querySelectorAll('#group-checkboxes input[type="checkbox"]').forEach(cb => {
        cb.checked = true;
        cb.dispatchEvent(new Event('change'));
    });
}

function deselectAllGroups() {
    document.querySelectorAll('#group-checkboxes input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
        cb.dispatchEvent(new Event('change'));
    });
}

function selectAllCharacters() {
    document.querySelectorAll('#character-checkboxes input[type="checkbox"]').forEach(cb => {
        cb.checked = true;
        cb.dispatchEvent(new Event('change'));
    });
    // Mettre à jour les groupes
    const data = currentMode.includes('hiragana') ? hiraganaData : katakanaData;
    Object.keys(data).forEach(group => updateGroupCheckboxState(group));
}

function deselectAllCharacters() {
    document.querySelectorAll('#character-checkboxes input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
        cb.dispatchEvent(new Event('change'));
    });
    // Mettre à jour les groupes
    const data = currentMode.includes('hiragana') ? hiraganaData : katakanaData;
    Object.keys(data).forEach(group => updateGroupCheckboxState(group));
}

function startTest() {
    // Récupérer les caractères sélectionnés individuellement
    const checkedCharacters = Array.from(document.querySelectorAll('#character-checkboxes input[type="checkbox"]:checked'))
        .map(cb => {
            const [group, index] = cb.value.split('-');
            return { group, index: parseInt(index) };
        });
    
    if (checkedCharacters.length === 0) {
        alert('Veuillez sélectionner au moins un caractère');
        return;
    }
    
    const data = currentMode.includes('hiragana') ? hiraganaData : katakanaData;
    
    currentCards = [];
    checkedCharacters.forEach(({ group, index }) => {
        if (data[group] && data[group][index]) {
            currentCards.push(data[group][index]);
        }
    });
    
    if (currentCards.length === 0) {
        alert('Aucune carte disponible');
        return;
    }
    
    // Mélanger les cartes
    shuffleArray(currentCards);
    
    startCardTest();
}

function startWordTest(mode, level) {
    const data = mode.includes('hiragana') ? hiraganaWords : katakanaWords;
    
    if (!data[level]) {
        alert('Niveau non disponible');
        return;
    }
    
    currentCards = data[level].map(item => ({
        char: item.word,
        romaji: item.romaji,
        meaning: item.meaning,
        english: item.english || null
    }));
    
    // Mélanger les cartes
    shuffleArray(currentCards);
    
    startCardTest();
}

function startCardTest() {
    groupSelection.classList.add('hidden');
    levelSelection.classList.add('hidden');
    testArea.classList.remove('hidden');
    headerBackBtn.classList.remove('hidden');
    
    currentCardIndex = 0;
    score = 0;
    totalAnswered = 0;
    
    displayCard();
    updateProgress();
    updateStats();
    
    answerInput.value = '';
    answerInput.focus();
    feedback.classList.add('hidden');
    nextCardBtn.classList.add('hidden');
    checkAnswerBtn.classList.remove('hidden');
}

function displayCard() {
    if (currentCardIndex >= currentCards.length) {
        finishTest();
        return;
    }
    
    const card = currentCards[currentCardIndex];
    characterDisplay.textContent = card.char;
    
    // Afficher les traductions si c'est un mot (pas un caractère seul)
    if (card.meaning) {
        let translationText = '';
        if (card.meaning) {
            translationText = `<span class="translation-fr">🇫🇷 ${card.meaning}</span>`;
        }
        if (card.english) {
            translationText += translationText ? ' | ' : '';
            translationText += `<span class="translation-en">🇬🇧 ${card.english}</span>`;
        }
        if (translationText) {
            translationDisplay.innerHTML = translationText;
            translationDisplay.classList.remove('hidden');
        } else {
            translationDisplay.classList.add('hidden');
        }
    } else {
        translationDisplay.classList.add('hidden');
    }
    
    answerInput.value = '';
    answerInput.focus();
    feedback.classList.add('hidden');
    nextCardBtn.classList.add('hidden');
    checkAnswerBtn.classList.remove('hidden');
}

function checkAnswer() {
    const userAnswer = answerInput.value.trim().toLowerCase();
    const card = currentCards[currentCardIndex];
    const correctAnswer = card.romaji.toLowerCase();
    
    // Normaliser les réponses (supprimer les espaces, etc.)
    const normalizedUser = userAnswer.replace(/\s+/g, '');
    const normalizedCorrect = correctAnswer.replace(/\s+/g, '');
    
    totalAnswered++;
    
    if (normalizedUser === normalizedCorrect) {
        score++;
        let message = `Correct! ${card.char} = ${card.romaji}`;
        if (card.meaning) {
            message += `\n🇫🇷 ${card.meaning}`;
            if (card.english) {
                message += ` | 🇬🇧 ${card.english}`;
            }
        }
        showFeedback(true, message);
    } else {
        let message = `Incorrect. La bonne réponse est: ${card.romaji}`;
        if (card.meaning) {
            message += `\n🇫🇷 ${card.meaning}`;
            if (card.english) {
                message += ` | 🇬🇧 ${card.english}`;
            }
        }
        showFeedback(false, message);
    }
    
    updateStats();
    updateProgress();
    
    checkAnswerBtn.classList.add('hidden');
    nextCardBtn.classList.remove('hidden');
}

function showFeedback(isCorrect, message) {
    // Remplacer les sauts de ligne par des <br> pour l'affichage HTML
    feedback.innerHTML = message.replace(/\n/g, '<br>');
    feedback.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
    feedback.classList.remove('hidden');
}

function nextCard() {
    currentCardIndex++;
    displayCard();
}

function updateProgress() {
    const progress = (currentCardIndex / currentCards.length) * 100;
    progressFill.style.width = `${progress}%`;
}

function updateStats() {
    scoreDisplay.textContent = score;
    totalDisplay.textContent = totalAnswered;
}

function finishTest() {
    testArea.classList.add('hidden');
    results.classList.remove('hidden');
    headerBackBtn.classList.remove('hidden');
    
    const percentage = totalAnswered > 0 ? Math.round((score / totalAnswered) * 100) : 0;
    
    document.getElementById('final-score').textContent = score;
    document.getElementById('final-total').textContent = totalAnswered;
    document.getElementById('final-percentage').textContent = `${percentage}%`;
}

function restartTest() {
    results.classList.add('hidden');
    testArea.classList.add('hidden');
    
    if (currentMode.includes('chars')) {
        showGroupSelection(currentMode);
    } else {
        showLevelSelection(currentMode);
    }
}

function showMenu() {
    groupSelection.classList.add('hidden');
    levelSelection.classList.add('hidden');
    testArea.classList.add('hidden');
    results.classList.add('hidden');
    menu.classList.remove('hidden');
    headerBackBtn.classList.add('hidden');
    
    currentMode = null;
    currentCards = [];
    currentCardIndex = 0;
    score = 0;
    totalAnswered = 0;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

