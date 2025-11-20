// Logique du jeu de memory
const MemoryGame = {
    showGroupSelection() {
        DOM.menu.classList.add('hidden');
        DOM.memoryGroupSelection.classList.remove('hidden');
        
        const buttonsContainer = document.getElementById('memory-group-buttons');
        buttonsContainer.innerHTML = '';
        
        const modes = [
            { type: 'hiragana', mode: 'simple', label: 'ひ Simples' },
            { type: 'hiragana', mode: 'accents', label: 'ひ Accents' },
            { type: 'hiragana', mode: 'composite', label: 'ひ Combinés' },
            { type: 'katakana', mode: 'simple', label: 'カ Simples' },
            { type: 'katakana', mode: 'accents', label: 'カ Accents' },
            { type: 'katakana', mode: 'composite', label: 'カ Combinés' }
        ];
        
        modes.forEach(({ type, mode, label }) => {
            const button = document.createElement('button');
            button.className = 'memory-mode-btn';
            button.textContent = label;
            button.addEventListener('click', () => {
                MemoryGame.start(type, mode);
            });
            buttonsContainer.appendChild(button);
        });
    },
    
    start(type, mode) {
        AppState.memoryType = type;
        AppState.memoryMode = mode;
        DOM.memoryGroupSelection.classList.add('hidden');
        DOM.memoryGame.classList.remove('hidden');
        
        const groupsByMode = {
            simple: ['basic', 'k', 's', 't', 'n', 'h', 'm', 'y', 'r', 'w'],
            accents: ['g', 'z', 'd', 'b', 'p'],
            composite: ['kya', 'sha', 'cha', 'nya', 'hya', 'mya', 'rya', 'gya', 'ja', 'bya', 'pya']
        };
        
        const data = type === 'hiragana' ? hiraganaData : katakanaData;
        AppState.allCharacters = [];
        const groups = groupsByMode[mode];
        
        groups.forEach(groupKey => {
            if (data[groupKey]) {
                data[groupKey].forEach(char => {
                    AppState.allCharacters.push({
                        char: char.char,
                        romaji: char.romaji,
                        id: `pair-${char.char}-${char.romaji}`
                    });
                });
            }
        });
        
        shuffleArray(AppState.allCharacters);
        MemoryGame.startNewSeries();
    },
    
    startNewSeries() {
        if (AppState.allCharacters.length < 5) {
            const data = AppState.memoryType === 'hiragana' ? hiraganaData : katakanaData;
            AppState.allCharacters = [];
            Object.keys(data).forEach(groupKey => {
                data[groupKey].forEach(char => {
                    AppState.allCharacters.push({
                        char: char.char,
                        romaji: char.romaji,
                        id: `pair-${char.char}-${char.romaji}`
                    });
                });
            });
            shuffleArray(AppState.allCharacters);
        }
        
        AppState.currentSeries = AppState.allCharacters.splice(0, 5);
        
        const signs = [...AppState.currentSeries].map(c => ({ ...c, type: 'sign' }));
        const romajis = [...AppState.currentSeries].map(c => ({ ...c, type: 'romaji' }));
        shuffleArray(signs);
        shuffleArray(romajis);
        
        AppState.selectedSign = null;
        AppState.selectedRomaji = null;
        AppState.matchedPairs = [];
        AppState.memoryAttempts = 0;
        AppState.wrongMatch = false;
        
        MemoryGame.renderBoard(signs, romajis);
        MemoryGame.updateStats();
    },
    
    renderBoard(signs, romajis) {
        DOM.memoryBoard.innerHTML = '';
        
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
        
        signs.forEach((item) => {
            const signElement = document.createElement('div');
            signElement.className = 'memory-item memory-sign';
            signElement.dataset.id = item.id;
            signElement.dataset.char = item.char;
            signElement.dataset.romaji = item.romaji;
            signElement.innerHTML = formatSmallChars(item.char);
            
            if (AppState.matchedPairs.some(p => p.id === item.id)) {
                signElement.classList.add('matched');
                signElement.style.opacity = '0.5';
                signElement.style.cursor = 'default';
            } else {
                signElement.addEventListener('click', () => {
                    MemoryGame.selectSign(signElement, item);
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
        
        romajis.forEach((item) => {
            const romajiElement = document.createElement('div');
            romajiElement.className = 'memory-item memory-romaji';
            romajiElement.dataset.id = item.id;
            romajiElement.dataset.char = item.char;
            romajiElement.dataset.romaji = item.romaji;
            romajiElement.textContent = item.romaji;
            
            if (AppState.matchedPairs.some(p => p.id === item.id)) {
                romajiElement.classList.add('matched');
                romajiElement.style.opacity = '0.5';
                romajiElement.style.cursor = 'default';
            } else {
                romajiElement.addEventListener('click', () => {
                    MemoryGame.selectRomaji(romajiElement, item);
                });
            }
            
            romajisList.appendChild(romajiElement);
        });
        
        romajisColumn.appendChild(romajisList);
        container.appendChild(romajisColumn);
        
        DOM.memoryBoard.appendChild(container);
    },
    
    selectSign(element, item) {
        if (AppState.selectedSign) {
            AppState.selectedSign.element.classList.remove('selected');
        }
        
        AppState.selectedSign = { element, item };
        element.classList.add('selected');
        
        if (AppState.selectedRomaji) {
            MemoryGame.checkMatch();
        }
    },
    
    selectRomaji(element, item) {
        if (AppState.selectedRomaji) {
            AppState.selectedRomaji.element.classList.remove('selected');
        }
        
        AppState.selectedRomaji = { element, item };
        element.classList.add('selected');
        
        if (AppState.selectedSign) {
            MemoryGame.checkMatch();
        }
    },
    
    checkMatch() {
        if (!AppState.selectedSign || !AppState.selectedRomaji) return;
        
        AppState.memoryAttempts++;
        
        if (AppState.selectedSign.item.id === AppState.selectedRomaji.item.id) {
            AppState.selectedSign.element.classList.add('matched');
            AppState.selectedSign.element.classList.remove('selected', 'wrong');
            AppState.selectedRomaji.element.classList.add('matched');
            AppState.selectedRomaji.element.classList.remove('selected', 'wrong');
            
            AppState.selectedSign.element.style.opacity = '0.5';
            AppState.selectedSign.element.style.cursor = 'default';
            AppState.selectedRomaji.element.style.opacity = '0.5';
            AppState.selectedRomaji.element.style.cursor = 'default';
            
            AppState.selectedSign.element.replaceWith(AppState.selectedSign.element.cloneNode(true));
            AppState.selectedRomaji.element.replaceWith(AppState.selectedRomaji.element.cloneNode(true));
            
            AppState.matchedPairs.push(AppState.selectedSign.item);
            
            if (AppState.matchedPairs.length === 5) {
                setTimeout(() => {
                    MemoryGame.showSeriesComplete();
                }, 500);
            }
            
            AppState.selectedSign = null;
            AppState.selectedRomaji = null;
        } else {
            AppState.wrongMatch = true;
            AppState.selectedSign.element.classList.add('wrong');
            AppState.selectedRomaji.element.classList.add('wrong');
            
            const signElement = AppState.selectedSign.element;
            const romajiElement = AppState.selectedRomaji.element;
            
            AppState.selectedSign = null;
            AppState.selectedRomaji = null;
            
            setTimeout(() => {
                signElement.classList.remove('selected', 'wrong');
                romajiElement.classList.remove('selected', 'wrong');
                AppState.wrongMatch = false;
            }, 1000);
        }
        
        MemoryGame.updateStats();
    },
    
    showSeriesComplete() {
        document.getElementById('memory-complete').classList.remove('hidden');
        document.getElementById('memory-final-attempts').textContent = AppState.memoryAttempts;
    },
    
    updateStats() {
        document.getElementById('memory-pairs-found').textContent = AppState.matchedPairs.length;
        document.getElementById('memory-total-pairs').textContent = 5;
        document.getElementById('memory-attempts').textContent = AppState.memoryAttempts;
    }
};

