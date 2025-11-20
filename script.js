// État de l'application
let currentMode = null;
let currentCards = [];
let currentCardIndex = 0;
let score = 0;
let totalAnswered = 0;
let selectedGroups = [];
let selectionState = {}; // Sauvegarde de l'état de sélection des groupes et caractères

// État du jeu memory
let memoryType = null; // 'hiragana' ou 'katakana'
let memoryMode = null; // 'simple', 'accents', 'composite'
let allCharacters = []; // Tous les caractères disponibles
let currentSeries = []; // Série actuelle de 5 caractères
let selectedSign = null;
let selectedRomaji = null;
let matchedPairs = [];
let memoryAttempts = 0;
let wrongMatch = false;

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
const memoryGroupSelection = document.getElementById('memory-group-selection');
const memoryGame = document.getElementById('memory-game');
const memoryBoard = document.getElementById('memory-board');

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    updateCurrentYear();
});

function updateCurrentYear() {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

function setupEventListeners() {
    // Menu cards
    document.querySelectorAll('.menu-card').forEach(card => {
        card.addEventListener('click', () => {
            const mode = card.dataset.mode;
            handleModeSelection(mode);
        });
    });

    // Group selection
    // Gérer la checkbox toggle
    document.addEventListener('change', (e) => {
        if (e.target && e.target.id === 'toggle-all-groups-checkbox') {
            toggleAllGroups();
        }
    });
    document.getElementById('start-test').addEventListener('click', startTest);
    document.getElementById('back-to-menu').addEventListener('click', showMenu);
    
    // Header link
    document.getElementById('header-link').addEventListener('click', (e) => {
        e.preventDefault();
        showMenu();
    });

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
    
    // Memory game
    document.getElementById('back-to-menu-memory').addEventListener('click', showMenu);
    document.getElementById('back-from-memory').addEventListener('click', () => {
        if (memoryMode) {
            showMemoryModeSelection(memoryType);
        } else {
            showMemoryGroupSelection();
        }
    });
    document.getElementById('restart-memory').addEventListener('click', () => {
        if (memoryType && memoryMode) {
            startMemoryGame(memoryType, memoryMode);
        }
    });
    document.getElementById('next-series').addEventListener('click', () => {
        document.getElementById('memory-complete').classList.add('hidden');
        startNewSeries();
    });
    document.getElementById('back-to-menu-memory-complete').addEventListener('click', showMenu);

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
    
    if (mode === 'memory-easy') {
        showMemoryGroupSelection();
    } else if (mode.includes('chars')) {
        showGroupSelection(mode);
    } else {
        showLevelSelection(mode);
    }
}

function showGroupSelection(mode) {
    menu.classList.add('hidden');
    groupSelection.classList.remove('hidden');
    
    const familyColumns = document.getElementById('family-columns');
    familyColumns.innerHTML = '';
    
    const data = mode.includes('hiragana') ? hiraganaData : katakanaData;
    const hiraganaTabs = document.getElementById('hiragana-tabs');
    const katakanaTabs = document.getElementById('katakana-tabs');
    
    // Afficher les onglets selon le mode
    if (mode.includes('hiragana')) {
        hiraganaTabs.classList.remove('hidden');
        katakanaTabs.classList.add('hidden');
        setupTabs(mode, 'hiragana-tabs', hiraganaData);
    } else if (mode.includes('katakana')) {
        hiraganaTabs.classList.add('hidden');
        katakanaTabs.classList.remove('hidden');
        setupTabs(mode, 'katakana-tabs', katakanaData);
    } else {
        hiraganaTabs.classList.add('hidden');
        katakanaTabs.classList.add('hidden');
        renderFamilyColumns(data, mode, null);
    }
}

function setupTabs(mode, tabsContainerId, data) {
    const tabButtons = document.querySelectorAll(`#${tabsContainerId} .tab-btn`);
    
    // Catégories de groupes (identique pour hiragana et katakana)
    const categories = {
        simple: ['basic', 'k', 's', 't', 'n', 'h', 'm', 'y', 'r', 'w'],
        matere: ['g', 'z', 'd', 'b', 'p'],
        composite: ['kya', 'sha', 'cha', 'nya', 'hya', 'mya', 'rya', 'gya', 'ja', 'bya', 'pya']
    };
    
    // Retirer les anciens event listeners en clonant les boutons
    tabButtons.forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
    });
    
    // Ajouter les nouveaux event listeners
    const newTabButtons = document.querySelectorAll(`#${tabsContainerId} .tab-btn`);
    newTabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Sauvegarder l'état de sélection actuel avant de changer d'onglet
            saveSelectionState();
            
            // Retirer la classe active de tous les boutons
            newTabButtons.forEach(b => b.classList.remove('active'));
            // Ajouter la classe active au bouton cliqué
            btn.classList.add('active');
            
            // Rendre les colonnes selon la catégorie sélectionnée
            const category = btn.dataset.tab;
            renderFamilyColumns(data, mode, categories[category]);
            // Mettre à jour les notifications et le texte du bouton après le rendu
            setTimeout(() => {
                updateTabNotifications(mode);
                updateToggleButtonText();
            }, 100);
        });
    });
    
    // Afficher par défaut les simples
    renderFamilyColumns(data, mode, categories.simple);
    
    // Mettre à jour les notifications des onglets et le texte du bouton après le rendu initial
    setTimeout(() => {
        updateTabNotifications(mode);
        updateToggleButtonText();
    }, 100);
}

function saveSelectionState() {
    // Sauvegarder l'état de tous les groupes et caractères visibles
    const groupCheckboxes = document.querySelectorAll('#family-columns input[type="checkbox"][id^="group-"]');
    const charCheckboxes = document.querySelectorAll('#family-columns input[type="checkbox"][id^="char-"]');
    
    groupCheckboxes.forEach(cb => {
        const groupId = cb.id.replace('group-', '');
        if (!selectionState[groupId]) {
            selectionState[groupId] = {};
        }
        selectionState[groupId].groupChecked = cb.checked;
    });
    
    charCheckboxes.forEach(cb => {
        const [groupId, index] = cb.value.split('-');
        if (!selectionState[groupId]) {
            selectionState[groupId] = {};
        }
        if (!selectionState[groupId].characters) {
            selectionState[groupId].characters = {};
        }
        selectionState[groupId].characters[index] = cb.checked;
    });
}

function restoreSelectionState(group) {
    // Restaurer l'état sauvegardé pour un groupe spécifique
    if (!selectionState[group]) {
        // Par défaut, tous les groupes de l'onglet "simple" sont sélectionnés
        const simpleGroups = ['basic', 'k', 's', 't', 'n', 'h', 'm', 'y', 'r', 'w'];
        const isInSimpleTab = simpleGroups.includes(group);
        return { groupChecked: isInSimpleTab, characters: {} };
    }
    return selectionState[group];
}

function renderFamilyColumns(data, mode, filterGroups) {
    const familyColumns = document.getElementById('family-columns');
    familyColumns.innerHTML = '';
    
    // Noms de groupes selon le mode (hiragana ou katakana)
    const isKatakana = mode.includes('katakana');
    const groupNames = {
        basic: isKatakana ? 'Basique (ア-オ)' : 'Basique (あ-お)',
        k: isKatakana ? 'K (カ-コ)' : 'K (か-こ)',
        s: isKatakana ? 'S (サ-ソ)' : 'S (さ-そ)',
        t: isKatakana ? 'T (タ-ト)' : 'T (た-と)',
        n: isKatakana ? 'N (ナ-ノ)' : 'N (な-の)',
        h: isKatakana ? 'H (ハ-ホ)' : 'H (は-ほ)',
        m: isKatakana ? 'M (マ-モ)' : 'M (ま-も)',
        y: isKatakana ? 'Y (ヤ-ヨ)' : 'Y (や-よ)',
        r: isKatakana ? 'R (ラ-ロ)' : 'R (ら-ろ)',
        w: isKatakana ? 'W (ワ-ヲ-ン)' : 'W (わ-を-ん)',
        g: isKatakana ? 'G (ガ-ゴ)' : 'G (が-ご)',
        z: isKatakana ? 'Z (ザ-ゾ)' : 'Z (ざ-ぞ)',
        d: isKatakana ? 'D (ダ-ド)' : 'D (だ-ど)',
        b: isKatakana ? 'B (バ-ボ)' : 'B (ば-ぼ)',
        p: isKatakana ? 'P (パ-ポ)' : 'P (ぱ-ぽ)',
        kya: isKatakana ? 'Kya (キャ-キョ)' : 'Kya (きゃ-きょ)',
        sha: isKatakana ? 'Sha (シャ-ショ)' : 'Sha (しゃ-しょ)',
        cha: isKatakana ? 'Cha (チャ-チョ)' : 'Cha (ちゃ-ちょ)',
        nya: isKatakana ? 'Nya (ニャ-ニョ)' : 'Nya (にゃ-にょ)',
        hya: isKatakana ? 'Hya (ヒャ-ヒョ)' : 'Hya (ひゃ-ひょ)',
        mya: isKatakana ? 'Mya (ミャ-ミョ)' : 'Mya (みゃ-みょ)',
        rya: isKatakana ? 'Rya (リャ-リョ)' : 'Rya (りゃ-りょ)',
        gya: isKatakana ? 'Gya (ギャ-ギョ)' : 'Gya (ぎゃ-ぎょ)',
        ja: isKatakana ? 'Ja (ジャ-ジョ)' : 'Ja (じゃ-じょ)',
        bya: isKatakana ? 'Bya (ビャ-ビョ)' : 'Bya (びゃ-びょ)',
        pya: isKatakana ? 'Pya (ピャ-ピョ)' : 'Pya (ぴゃ-ぴょ)'
    };
    
    // Filtrer les groupes si nécessaire
    const groupsToRender = filterGroups 
        ? Object.keys(data).filter(group => filterGroups.includes(group))
        : Object.keys(data);
    
    // Créer une colonne pour chaque famille avec son switch et ses caractères
    groupsToRender.forEach(group => {
        // Créer la colonne de famille
        const familyColumn = document.createElement('div');
        familyColumn.className = 'family-column';
        
        // Créer le switch de groupe en haut de la colonne
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
        
        // Restaurer l'état sauvegardé ou utiliser la valeur par défaut selon l'onglet
        const savedState = restoreSelectionState(group);
        const simpleGroups = ['basic', 'k', 's', 't', 'n', 'h', 'm', 'y', 'r', 'w'];
        const defaultChecked = simpleGroups.includes(group);
        groupSwitch.checked = savedState.groupChecked !== undefined ? savedState.groupChecked : defaultChecked;
        
        groupSwitch.addEventListener('change', () => {
            updateGroupSwitchItem(switchItem, groupSwitch.checked);
            toggleGroupCharacters(group, groupSwitch.checked);
            updateTabNotifications(mode);
            updateToggleButtonText();
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
        
        familyColumn.appendChild(switchItem);
        
        // Créer le conteneur pour les caractères individuels
        const groupDiv = document.createElement('div');
        groupDiv.className = 'character-group';
        
        const itemsDiv = document.createElement('div');
        itemsDiv.className = 'character-items';
        
        // Créer les caractères individuels de cette famille
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
            
            const charSwitchContainer = document.createElement('label');
            charSwitchContainer.className = 'switch';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `char-${group}-${index}`;
            checkbox.value = `${group}-${index}`;
            
            // Restaurer l'état sauvegardé ou utiliser la valeur par défaut selon l'onglet
            const savedState = restoreSelectionState(group);
            const simpleGroups = ['basic', 'k', 's', 't', 'n', 'h', 'm', 'y', 'r', 'w'];
            const defaultChecked = simpleGroups.includes(group);
            const charChecked = savedState.characters && savedState.characters[index] !== undefined 
                ? savedState.characters[index] 
                : defaultChecked;
            checkbox.checked = charChecked;
            
            checkbox.addEventListener('change', () => {
                updateCharacterSwitchState(charDiv, checkbox.checked);
                updateGroupCheckboxState(group);
                updateTabNotifications(mode);
                updateToggleButtonText();
            });
            
            const charSlider = document.createElement('span');
            charSlider.className = 'slider';
            
            charSwitchContainer.appendChild(checkbox);
            charSwitchContainer.appendChild(charSlider);
            
            charDiv.appendChild(charSpan);
            charDiv.appendChild(romajiSpan);
            charDiv.appendChild(charSwitchContainer);
            
            // Mettre à jour l'état visuel selon la valeur restaurée
            updateCharacterSwitchState(charDiv, checkbox.checked);
            
            charDiv.addEventListener('click', (e) => {
                if (e.target !== checkbox && e.target !== charSlider && !charSwitchContainer.contains(e.target)) {
                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(new Event('change'));
                }
            });
            
            itemsDiv.appendChild(charDiv);
        });
        
        groupDiv.appendChild(itemsDiv);
        familyColumn.appendChild(groupDiv);
        
        // Mettre à jour l'état visuel du switch de groupe selon la valeur restaurée
        updateGroupSwitchItem(switchItem, groupSwitch.checked);
        
        // Ajouter la colonne au conteneur principal
        familyColumns.appendChild(familyColumn);
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

function updateTabNotifications(mode) {
    const data = mode && mode.includes('hiragana') ? hiraganaData : katakanaData;
    if (!data) return;
    
    // Catégories de groupes
    const categories = {
        simple: ['basic', 'k', 's', 't', 'n', 'h', 'm', 'y', 'r', 'w'],
        matere: ['g', 'z', 'd', 'b', 'p'],
        composite: ['kya', 'sha', 'cha', 'nya', 'hya', 'mya', 'rya', 'gya', 'ja', 'bya', 'pya']
    };
    
    // Déterminer le conteneur d'onglets selon le mode
    const tabsContainerId = mode.includes('hiragana') ? 'hiragana-tabs' : 'katakana-tabs';
    const tabsContainer = document.getElementById(tabsContainerId);
    if (!tabsContainer) return;
    
    // Pour chaque catégorie d'onglet
    Object.keys(categories).forEach(category => {
        const tabBtn = tabsContainer.querySelector(`.tab-btn[data-tab="${category}"]`);
        if (!tabBtn) return;
        
        // Compter les caractères non sélectionnés dans cette catégorie
        let unselectedCount = 0;
        categories[category].forEach(group => {
            if (!data[group]) return;
            
            // Compter les caractères non sélectionnés dans ce groupe
            const groupCheckbox = document.getElementById(`group-${group}`);
            if (groupCheckbox) {
                // Le groupe est rendu, compter les caractères non sélectionnés
                const allCharCheckboxes = document.querySelectorAll(`input[type="checkbox"][id^="char-${group}-"]`);
                allCharCheckboxes.forEach(checkbox => {
                    if (!checkbox.checked) {
                        unselectedCount++;
                    }
                });
            } else {
                // Le groupe n'est pas encore rendu, utiliser l'état sauvegardé ou la valeur par défaut
                const savedState = restoreSelectionState(group);
                const simpleGroups = ['basic', 'k', 's', 't', 'n', 'h', 'm', 'y', 'r', 'w'];
                const isInSimpleTab = simpleGroups.includes(group);
                
                if (savedState.groupChecked === false || (savedState.groupChecked === undefined && !isInSimpleTab)) {
                    // Tous les caractères sont non sélectionnés
                    unselectedCount += data[group].length;
                } else if (savedState.characters && Object.keys(savedState.characters).length > 0) {
                    // Compter les caractères non sélectionnés dans l'état sauvegardé
                    data[group].forEach((char, index) => {
                        if (!savedState.characters[index]) {
                            unselectedCount++;
                        }
                    });
                } else if (!isInSimpleTab) {
                    // Par défaut, tous les caractères des groupes non dans l'onglet "simple" sont non sélectionnés
                    unselectedCount += data[group].length;
                }
            }
        });
        
        // Retirer l'ancienne pastille si elle existe
        const existingBadge = tabBtn.querySelector('.tab-notification-badge');
        if (existingBadge) {
            existingBadge.remove();
        }
        
        // Ajouter une pastille rouge si il y a des caractères non sélectionnés
        if (unselectedCount > 0) {
            const badge = document.createElement('span');
            badge.className = 'tab-notification-badge';
            badge.textContent = unselectedCount > 99 ? '99+' : unselectedCount;
            tabBtn.appendChild(badge);
        }
    });
}

function showLevelSelection(mode) {
    menu.classList.add('hidden');
    levelSelection.classList.remove('hidden');
    
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

function toggleAllGroups() {
    const allGroupCheckboxes = document.querySelectorAll('#family-columns input[type="checkbox"][id^="group-"]');
    const toggleCheckbox = document.getElementById('toggle-all-groups-checkbox');
    
    if (allGroupCheckboxes.length === 0) return;
    
    // Vérifier si tous les groupes sont sélectionnés
    const allChecked = Array.from(allGroupCheckboxes).every(cb => cb.checked);
    
    // Inverser l'état de tous les groupes
    allGroupCheckboxes.forEach(cb => {
        cb.checked = !allChecked;
        cb.dispatchEvent(new Event('change'));
    });
    
    // Mettre à jour la checkbox toggle et les notifications
    if (toggleCheckbox) {
        toggleCheckbox.checked = !allChecked;
    }
    updateTabNotifications(currentMode);
}

function updateToggleButtonText() {
    const toggleCheckbox = document.getElementById('toggle-all-groups-checkbox');
    if (!toggleCheckbox) return;
    
    const toggleText = document.querySelector('.toggle-checkbox-text');
    const allGroupCheckboxes = document.querySelectorAll('#family-columns input[type="checkbox"][id^="group-"]');
    
    if (allGroupCheckboxes.length === 0) {
        toggleCheckbox.checked = false;
        toggleCheckbox.indeterminate = false;
        if (toggleText) toggleText.textContent = 'Tout sélectionner';
        return;
    }
    
    // Vérifier si tous les groupes sont sélectionnés
    const allChecked = Array.from(allGroupCheckboxes).every(cb => cb.checked);
    const someChecked = Array.from(allGroupCheckboxes).some(cb => cb.checked);
    
    if (allChecked) {
        toggleCheckbox.checked = true;
        toggleCheckbox.indeterminate = false;
        if (toggleText) toggleText.textContent = 'Tout désélectionner';
    } else if (someChecked) {
        toggleCheckbox.checked = false;
        toggleCheckbox.indeterminate = true;
        if (toggleText) toggleText.textContent = 'Tout sélectionner';
    } else {
        toggleCheckbox.checked = false;
        toggleCheckbox.indeterminate = false;
        if (toggleText) toggleText.textContent = 'Tout sélectionner';
    }
}


function startTest() {
    // Récupérer les caractères sélectionnés individuellement
    const checkedCharacters = Array.from(document.querySelectorAll('#family-columns input[type="checkbox"]:checked'))
        .filter(cb => cb.id.startsWith('char-'))
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

function findRandomWordWithCharacter(character) {
    // Trouver un mot aléatoire contenant le caractère testé
    const isHiragana = currentMode && currentMode.includes('hiragana');
    const wordsData = isHiragana ? hiraganaWords : katakanaWords;
    
    // Collecter tous les mots de tous les niveaux qui contiennent ce caractère
    const matchingWords = [];
    
    Object.keys(wordsData).forEach(level => {
        wordsData[level].forEach(word => {
            if (word.word.includes(character)) {
                matchingWords.push(word);
            }
        });
    });
    
    // Retourner un mot aléatoire s'il y en a
    if (matchingWords.length > 0) {
        const randomIndex = Math.floor(Math.random() * matchingWords.length);
        return matchingWords[randomIndex];
    }
    
    return null;
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
        
        // Ajouter un mot aléatoire contenant ce caractère (seulement pour les tests de caractères, pas pour les mots)
        if (!card.meaning && card.char) {
            const exampleWord = findRandomWordWithCharacter(card.char);
            if (exampleWord) {
                message += `\n\n💡 Exemple: ${exampleWord.word} (${exampleWord.romaji})`;
                if (exampleWord.meaning) {
                    message += ` - 🇫🇷 ${exampleWord.meaning}`;
                    if (exampleWord.english) {
                        message += ` | 🇬🇧 ${exampleWord.english}`;
                    }
                }
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
    memoryGroupSelection.classList.add('hidden');
    memoryGame.classList.add('hidden');
    menu.classList.remove('hidden');
    
    currentMode = null;
    currentCards = [];
    currentCardIndex = 0;
    score = 0;
    totalAnswered = 0;
}

// Fonctions pour le jeu de memory
function showMemoryGroupSelection() {
    menu.classList.add('hidden');
    memoryGroupSelection.classList.remove('hidden');
    
    const buttonsContainer = document.getElementById('memory-group-buttons');
    buttonsContainer.innerHTML = '';
    
    // Créer deux boutons : Hiragana et Katakana
    const hiraganaButton = document.createElement('button');
    hiraganaButton.className = 'memory-group-btn';
    hiraganaButton.innerHTML = `
        <div class="memory-group-icon">ひ</div>
        <div class="memory-group-info">
            <div class="memory-group-title">Hiragana</div>
            <div class="memory-group-chars">Apprendre les caractères Hiragana</div>
        </div>
    `;
    hiraganaButton.addEventListener('click', () => {
        showMemoryModeSelection('hiragana');
    });
    buttonsContainer.appendChild(hiraganaButton);
    
    const katakanaButton = document.createElement('button');
    katakanaButton.className = 'memory-group-btn';
    katakanaButton.innerHTML = `
        <div class="memory-group-icon">カ</div>
        <div class="memory-group-info">
            <div class="memory-group-title">Katakana</div>
            <div class="memory-group-chars">Apprendre les caractères Katakana</div>
        </div>
    `;
    katakanaButton.addEventListener('click', () => {
        showMemoryModeSelection('katakana');
    });
    buttonsContainer.appendChild(katakanaButton);
}

function showMemoryModeSelection(type) {
    memoryType = type;
    
    const buttonsContainer = document.getElementById('memory-group-buttons');
    buttonsContainer.innerHTML = '';
    
    // Créer trois boutons : Simples, Accents, Combinés
    const simpleButton = document.createElement('button');
    simpleButton.className = 'memory-group-btn';
    simpleButton.innerHTML = `
        <div class="memory-group-icon">📝</div>
        <div class="memory-group-info">
            <div class="memory-group-title">Simples</div>
            <div class="memory-group-chars">Basiques (あ-お, か-こ, etc.)</div>
        </div>
    `;
    simpleButton.addEventListener('click', () => {
        startMemoryGame(type, 'simple');
    });
    buttonsContainer.appendChild(simpleButton);
    
    const accentsButton = document.createElement('button');
    accentsButton.className = 'memory-group-btn';
    accentsButton.innerHTML = `
        <div class="memory-group-icon">🔊</div>
        <div class="memory-group-info">
            <div class="memory-group-title">Avec accents</div>
            <div class="memory-group-chars">が-ご, ざ-ぞ, だ-ど, etc.</div>
        </div>
    `;
    accentsButton.addEventListener('click', () => {
        startMemoryGame(type, 'accents');
    });
    buttonsContainer.appendChild(accentsButton);
    
    const compositeButton = document.createElement('button');
    compositeButton.className = 'memory-group-btn';
    compositeButton.innerHTML = `
        <div class="memory-group-icon">🔗</div>
        <div class="memory-group-info">
            <div class="memory-group-title">Combinés</div>
            <div class="memory-group-chars">きゃ-きょ, しゃ-しょ, etc.</div>
        </div>
    `;
    compositeButton.addEventListener('click', () => {
        startMemoryGame(type, 'composite');
    });
    buttonsContainer.appendChild(compositeButton);
    
    // Ajouter un bouton retour
    const backButton = document.createElement('button');
    backButton.className = 'btn btn-secondary';
    backButton.style.marginTop = '20px';
    backButton.innerHTML = '<span class="icon-back">←</span> Retour';
    backButton.addEventListener('click', () => {
        showMemoryGroupSelection();
    });
    buttonsContainer.appendChild(backButton);
}

function startMemoryGame(type, mode) {
    memoryType = type;
    memoryMode = mode;
    memoryGroupSelection.classList.add('hidden');
    memoryGame.classList.remove('hidden');
    
    // Définir les groupes selon le mode
    const groupsByMode = {
        simple: ['basic', 'k', 's', 't', 'n', 'h', 'm', 'y', 'r', 'w'],
        accents: ['g', 'z', 'd', 'b', 'p'],
        composite: ['kya', 'sha', 'cha', 'nya', 'hya', 'mya', 'rya', 'gya', 'ja', 'bya', 'pya']
    };
    
    // Collecter les caractères du mode choisi
    const data = type === 'hiragana' ? hiraganaData : katakanaData;
    allCharacters = [];
    const groups = groupsByMode[mode];
    
    groups.forEach(groupKey => {
        if (data[groupKey]) {
            data[groupKey].forEach(char => {
                allCharacters.push({
                    char: char.char,
                    romaji: char.romaji,
                    id: `pair-${char.char}-${char.romaji}`
                });
            });
        }
    });
    
    // Mélanger tous les caractères
    shuffleArray(allCharacters);
    
    // Démarrer la première série
    startNewSeries();
}

function startNewSeries() {
    // Prendre 5 caractères aléatoires
    if (allCharacters.length < 5) {
        // Si on n'a plus assez de caractères, remélanger tous les caractères
        const data = memoryType === 'hiragana' ? hiraganaData : katakanaData;
        allCharacters = [];
        Object.keys(data).forEach(groupKey => {
            data[groupKey].forEach(char => {
                allCharacters.push({
                    char: char.char,
                    romaji: char.romaji,
                    id: `pair-${char.char}-${char.romaji}`
                });
            });
        });
        shuffleArray(allCharacters);
    }
    
    currentSeries = allCharacters.splice(0, 5);
    
    // Mélanger les deux listes séparément
    const signs = [...currentSeries].map(c => ({ ...c, type: 'sign' }));
    const romajis = [...currentSeries].map(c => ({ ...c, type: 'romaji' }));
    shuffleArray(signs);
    shuffleArray(romajis);
    
    // Réinitialiser l'état
    selectedSign = null;
    selectedRomaji = null;
    matchedPairs = [];
    memoryAttempts = 0;
    wrongMatch = false;
    
    renderMemoryBoard(signs, romajis);
    updateMemoryStats();
}

function renderMemoryBoard(signs, romajis) {
    memoryBoard.innerHTML = '';
    
    // Créer le conteneur pour les deux colonnes
    const container = document.createElement('div');
    container.className = 'memory-match-container';
    
    // Colonne gauche : signes
    const signsColumn = document.createElement('div');
    signsColumn.className = 'memory-column memory-signs-column';
    const signsTitle = document.createElement('h3');
    signsTitle.textContent = 'Signes';
    signsTitle.className = 'memory-column-title';
    signsColumn.appendChild(signsTitle);
    
    const signsList = document.createElement('div');
    signsList.className = 'memory-list';
    
    signs.forEach((item, index) => {
        const signElement = document.createElement('div');
        signElement.className = 'memory-item memory-sign';
        signElement.dataset.id = item.id;
        signElement.dataset.char = item.char;
        signElement.dataset.romaji = item.romaji;
        signElement.textContent = item.char;
        
        // Vérifier si cette paire est déjà trouvée
        if (matchedPairs.some(p => p.id === item.id)) {
            signElement.classList.add('matched');
            signElement.style.opacity = '0.5';
            signElement.style.cursor = 'default';
        } else {
            signElement.addEventListener('click', () => {
                selectSign(signElement, item);
            });
        }
        
        signsList.appendChild(signElement);
    });
    
    signsColumn.appendChild(signsList);
    container.appendChild(signsColumn);
    
    // Colonne droite : romajis
    const romajisColumn = document.createElement('div');
    romajisColumn.className = 'memory-column memory-romajis-column';
    const romajisTitle = document.createElement('h3');
    romajisTitle.textContent = 'Romajis';
    romajisTitle.className = 'memory-column-title';
    romajisColumn.appendChild(romajisTitle);
    
    const romajisList = document.createElement('div');
    romajisList.className = 'memory-list';
    
    romajis.forEach((item, index) => {
        const romajiElement = document.createElement('div');
        romajiElement.className = 'memory-item memory-romaji';
        romajiElement.dataset.id = item.id;
        romajiElement.dataset.char = item.char;
        romajiElement.dataset.romaji = item.romaji;
        romajiElement.textContent = item.romaji;
        
        // Vérifier si cette paire est déjà trouvée
        if (matchedPairs.some(p => p.id === item.id)) {
            romajiElement.classList.add('matched');
            romajiElement.style.opacity = '0.5';
            romajiElement.style.cursor = 'default';
        } else {
            romajiElement.addEventListener('click', () => {
                selectRomaji(romajiElement, item);
            });
        }
        
        romajisList.appendChild(romajiElement);
    });
    
    romajisColumn.appendChild(romajisList);
    container.appendChild(romajisColumn);
    
    memoryBoard.appendChild(container);
}

function selectSign(element, item) {
    // Désélectionner l'ancien signe si présent
    if (selectedSign) {
        selectedSign.element.classList.remove('selected');
    }
    
    selectedSign = { element, item };
    element.classList.add('selected');
    
    // Si un romaji est déjà sélectionné, vérifier la correspondance
    if (selectedRomaji) {
        checkMatch();
    }
}

function selectRomaji(element, item) {
    // Désélectionner l'ancien romaji si présent
    if (selectedRomaji) {
        selectedRomaji.element.classList.remove('selected');
    }
    
    selectedRomaji = { element, item };
    element.classList.add('selected');
    
    // Si un signe est déjà sélectionné, vérifier la correspondance
    if (selectedSign) {
        checkMatch();
    }
}

function checkMatch() {
    if (!selectedSign || !selectedRomaji) return;
    
    memoryAttempts++;
    
    // Vérifier si c'est une paire correcte
    if (selectedSign.item.id === selectedRomaji.item.id) {
        // Paire trouvée !
        selectedSign.element.classList.add('matched');
        selectedSign.element.classList.remove('selected', 'wrong');
        selectedRomaji.element.classList.add('matched');
        selectedRomaji.element.classList.remove('selected', 'wrong');
        
        selectedSign.element.style.opacity = '0.5';
        selectedSign.element.style.cursor = 'default';
        selectedRomaji.element.style.opacity = '0.5';
        selectedRomaji.element.style.cursor = 'default';
        
        // Désactiver les clics
        selectedSign.element.replaceWith(selectedSign.element.cloneNode(true));
        selectedRomaji.element.replaceWith(selectedRomaji.element.cloneNode(true));
        
        matchedPairs.push(selectedSign.item);
        
        if (matchedPairs.length === 5) {
            // Série terminée
            setTimeout(() => {
                showSeriesComplete();
            }, 500);
        }
    } else {
        // Pas de paire, afficher l'erreur en rouge
        wrongMatch = true;
        selectedSign.element.classList.add('wrong');
        selectedRomaji.element.classList.add('wrong');
        
        // Sauvegarder les références avant de les réinitialiser
        const signElement = selectedSign.element;
        const romajiElement = selectedRomaji.element;
        
        // Réinitialiser les sélections immédiatement
        selectedSign = null;
        selectedRomaji = null;
        
        setTimeout(() => {
            signElement.classList.remove('selected', 'wrong');
            romajiElement.classList.remove('selected', 'wrong');
            wrongMatch = false;
        }, 1000);
    }
    
    if (!wrongMatch) {
        selectedSign = null;
        selectedRomaji = null;
    }
    updateMemoryStats();
}

function showSeriesComplete() {
    document.getElementById('memory-complete').classList.remove('hidden');
    document.getElementById('memory-final-attempts').textContent = memoryAttempts;
}

function updateMemoryStats() {
    document.getElementById('memory-pairs-found').textContent = matchedPairs.length;
    document.getElementById('memory-total-pairs').textContent = 5;
    document.getElementById('memory-attempts').textContent = memoryAttempts;
}


function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

