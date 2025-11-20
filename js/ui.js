// Navigation et gestion de l'interface utilisateur
const UI = {
    handleModeSelection(mode) {
        AppState.currentMode = mode;
        
        if (mode === 'memory-easy') {
            MemoryGame.showGroupSelection();
        } else if (mode.includes('chars')) {
            UI.showGroupSelection(mode);
        } else {
            UI.showLevelSelection(mode);
        }
    },
    
    showGroupSelection(mode) {
        DOM.menu.classList.add('hidden');
        DOM.groupSelection.classList.remove('hidden');
        
        const familyColumns = document.getElementById('family-columns');
        familyColumns.innerHTML = '';
        
        const data = mode.includes('hiragana') ? hiraganaData : katakanaData;
        const hiraganaTabs = document.getElementById('hiragana-tabs');
        const katakanaTabs = document.getElementById('katakana-tabs');
        
        if (mode.includes('hiragana')) {
            hiraganaTabs.classList.remove('hidden');
            katakanaTabs.classList.add('hidden');
            UI.setupTabs(mode, 'hiragana-tabs', hiraganaData);
        } else if (mode.includes('katakana')) {
            hiraganaTabs.classList.add('hidden');
            katakanaTabs.classList.remove('hidden');
            UI.setupTabs(mode, 'katakana-tabs', katakanaData);
        } else {
            hiraganaTabs.classList.add('hidden');
            katakanaTabs.classList.add('hidden');
            UI.renderFamilyColumns(data, mode, null);
        }
    },
    
    setupTabs(mode, tabsContainerId, data) {
        const tabButtons = document.querySelectorAll(`#${tabsContainerId} .tab-btn`);
        
        const categories = {
            simple: ['basic', 'k', 's', 't', 'n', 'h', 'm', 'y', 'r', 'w'],
            matere: ['g', 'z', 'd', 'b', 'p'],
            composite: ['kya', 'sha', 'cha', 'nya', 'hya', 'mya', 'rya', 'gya', 'ja', 'bya', 'pya']
        };
        
        tabButtons.forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
        });
        
        const newTabButtons = document.querySelectorAll(`#${tabsContainerId} .tab-btn`);
        newTabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                UI.saveSelectionState();
                newTabButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const category = btn.dataset.tab;
                UI.renderFamilyColumns(data, mode, categories[category]);
                setTimeout(() => {
                    UI.updateTabNotifications(mode);
                    UI.updateToggleButtonText();
                }, 100);
            });
        });
        
        UI.renderFamilyColumns(data, mode, categories.simple);
        setTimeout(() => {
            UI.updateTabNotifications(mode);
            UI.updateToggleButtonText();
        }, 100);
    },
    
    saveSelectionState() {
        const groupCheckboxes = document.querySelectorAll('#family-columns input[type="checkbox"][id^="group-"]');
        const charCheckboxes = document.querySelectorAll('#family-columns input[type="checkbox"][id^="char-"]');
        
        groupCheckboxes.forEach(cb => {
            const groupId = cb.id.replace('group-', '');
            if (!AppState.selectionState[groupId]) {
                AppState.selectionState[groupId] = {};
            }
            AppState.selectionState[groupId].groupChecked = cb.checked;
        });
        
        charCheckboxes.forEach(cb => {
            const [groupId, index] = cb.value.split('-');
            if (!AppState.selectionState[groupId]) {
                AppState.selectionState[groupId] = {};
            }
            if (!AppState.selectionState[groupId].characters) {
                AppState.selectionState[groupId].characters = {};
            }
            AppState.selectionState[groupId].characters[index] = cb.checked;
        });
    },
    
    restoreSelectionState(group) {
        if (!AppState.selectionState[group]) {
            const simpleGroups = ['basic', 'k', 's', 't', 'n', 'h', 'm', 'y', 'r', 'w'];
            const isInSimpleTab = simpleGroups.includes(group);
            return { groupChecked: isInSimpleTab, characters: {} };
        }
        return AppState.selectionState[group];
    },
    
    renderFamilyColumns(data, mode, filterGroups) {
        const familyColumns = document.getElementById('family-columns');
        familyColumns.innerHTML = '';
        
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
        
        const groupsToRender = filterGroups 
            ? Object.keys(data).filter(group => filterGroups.includes(group))
            : Object.keys(data);
        
        groupsToRender.forEach(group => {
            const familyColumn = document.createElement('div');
            familyColumn.className = 'family-column';
            
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
            
            const savedState = UI.restoreSelectionState(group);
            const simpleGroups = ['basic', 'k', 's', 't', 'n', 'h', 'm', 'y', 'r', 'w'];
            const defaultChecked = simpleGroups.includes(group);
            groupSwitch.checked = savedState.groupChecked !== undefined ? savedState.groupChecked : defaultChecked;
            
            groupSwitch.addEventListener('change', () => {
                UI.updateGroupSwitchItem(switchItem, groupSwitch.checked);
                UI.toggleGroupCharacters(group, groupSwitch.checked);
                UI.updateTabNotifications(mode);
                UI.updateToggleButtonText();
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
            
            const groupDiv = document.createElement('div');
            groupDiv.className = 'character-group';
            
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
                
                const charSwitchContainer = document.createElement('label');
                charSwitchContainer.className = 'switch';
                
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = `char-${group}-${index}`;
                checkbox.value = `${group}-${index}`;
                
                const savedState = UI.restoreSelectionState(group);
                const simpleGroups = ['basic', 'k', 's', 't', 'n', 'h', 'm', 'y', 'r', 'w'];
                const defaultChecked = simpleGroups.includes(group);
                const charChecked = savedState.characters && savedState.characters[index] !== undefined 
                    ? savedState.characters[index] 
                    : defaultChecked;
                checkbox.checked = charChecked;
                
                checkbox.addEventListener('change', () => {
                    UI.updateCharacterSwitchState(charDiv, checkbox.checked);
                    UI.updateGroupCheckboxState(group);
                    UI.updateTabNotifications(mode);
                    UI.updateToggleButtonText();
                });
                
                const charSlider = document.createElement('span');
                charSlider.className = 'slider';
                
                charSwitchContainer.appendChild(checkbox);
                charSwitchContainer.appendChild(charSlider);
                
                charDiv.appendChild(charSpan);
                charDiv.appendChild(romajiSpan);
                charDiv.appendChild(charSwitchContainer);
                
                UI.updateCharacterSwitchState(charDiv, checkbox.checked);
                
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
            
            UI.updateGroupSwitchItem(switchItem, groupSwitch.checked);
            
            familyColumns.appendChild(familyColumn);
        });
    },
    
    toggleGroupCharacters(group, checked) {
        const data = AppState.currentMode.includes('hiragana') ? hiraganaData : katakanaData;
        if (!data[group]) return;
        
        const groupChars = data[group].map(c => c.char);
        const allCharDivs = document.querySelectorAll('.character-switch-item');
        
        allCharDivs.forEach(charDiv => {
            const charSpan = charDiv.querySelector('.character-char');
            const checkbox = charDiv.querySelector('input[type="checkbox"]');
            
            if (charSpan && checkbox && groupChars.includes(charSpan.textContent)) {
                checkbox.checked = checked;
                UI.updateCharacterSwitchState(charDiv, checked);
            }
        });
    },
    
    updateCharacterSwitchState(charDiv, checked) {
        if (checked) {
            charDiv.classList.add('active');
        } else {
            charDiv.classList.remove('active');
        }
    },
    
    updateGroupSwitchItem(switchItem, checked) {
        if (checked) {
            switchItem.classList.add('active');
        } else {
            switchItem.classList.remove('active');
        }
    },
    
    updateGroupCheckboxState(group) {
        const data = AppState.currentMode.includes('hiragana') ? hiraganaData : katakanaData;
        if (!data[group]) return;
        
        const groupCheckbox = document.getElementById(`group-${group}`);
        if (!groupCheckbox) return;
        
        let selectedCount = 0;
        const allCharDivs = document.querySelectorAll('.character-switch-item');
        allCharDivs.forEach(charDiv => {
            const charSpan = charDiv.querySelector('.character-char');
            const checkbox = charDiv.querySelector('input[type="checkbox"]');
            if (charSpan && checkbox && data[group].some(c => c.char === charSpan.textContent)) {
                if (checkbox.checked) selectedCount++;
            }
        });
        
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
    },
    
    updateTabNotifications(mode) {
        const data = mode && mode.includes('hiragana') ? hiraganaData : katakanaData;
        if (!data) return;
        
        const categories = {
            simple: ['basic', 'k', 's', 't', 'n', 'h', 'm', 'y', 'r', 'w'],
            matere: ['g', 'z', 'd', 'b', 'p'],
            composite: ['kya', 'sha', 'cha', 'nya', 'hya', 'mya', 'rya', 'gya', 'ja', 'bya', 'pya']
        };
        
        const tabsContainerId = mode.includes('hiragana') ? 'hiragana-tabs' : 'katakana-tabs';
        const tabsContainer = document.getElementById(tabsContainerId);
        if (!tabsContainer) return;
        
        Object.keys(categories).forEach(category => {
            const tabBtn = tabsContainer.querySelector(`.tab-btn[data-tab="${category}"]`);
            if (!tabBtn) return;
            
            let unselectedCount = 0;
            categories[category].forEach(group => {
                if (!data[group]) return;
                
                const groupCheckbox = document.getElementById(`group-${group}`);
                if (groupCheckbox) {
                    const allCharCheckboxes = document.querySelectorAll(`input[type="checkbox"][id^="char-${group}-"]`);
                    allCharCheckboxes.forEach(checkbox => {
                        if (!checkbox.checked) {
                            unselectedCount++;
                        }
                    });
                } else {
                    const savedState = UI.restoreSelectionState(group);
                    const simpleGroups = ['basic', 'k', 's', 't', 'n', 'h', 'm', 'y', 'r', 'w'];
                    const isInSimpleTab = simpleGroups.includes(group);
                    
                    if (savedState.groupChecked === false || (savedState.groupChecked === undefined && !isInSimpleTab)) {
                        unselectedCount += data[group].length;
                    } else if (savedState.characters && Object.keys(savedState.characters).length > 0) {
                        data[group].forEach((char, index) => {
                            if (!savedState.characters[index]) {
                                unselectedCount++;
                            }
                        });
                    } else if (!isInSimpleTab) {
                        unselectedCount += data[group].length;
                    }
                }
            });
            
            const existingBadge = tabBtn.querySelector('.tab-notification-badge');
            if (existingBadge) {
                existingBadge.remove();
            }
            
            if (unselectedCount > 0) {
                const badge = document.createElement('span');
                badge.className = 'tab-notification-badge';
                badge.textContent = unselectedCount > 99 ? '99+' : unselectedCount;
                tabBtn.appendChild(badge);
            }
        });
    },
    
    showLevelSelection(mode) {
        DOM.menu.classList.add('hidden');
        DOM.levelSelection.classList.remove('hidden');
        
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
                TestGame.startWordTest(mode, level);
            });
            levelButtons.appendChild(button);
        });
    },
    
    toggleAllGroups() {
        const allGroupCheckboxes = document.querySelectorAll('#family-columns input[type="checkbox"][id^="group-"]');
        const toggleCheckbox = document.getElementById('toggle-all-groups-checkbox');
        
        if (allGroupCheckboxes.length === 0) return;
        
        const allChecked = Array.from(allGroupCheckboxes).every(cb => cb.checked);
        
        allGroupCheckboxes.forEach(cb => {
            cb.checked = !allChecked;
            cb.dispatchEvent(new Event('change'));
        });
        
        if (toggleCheckbox) {
            toggleCheckbox.checked = !allChecked;
        }
        UI.updateTabNotifications(AppState.currentMode);
    },
    
    updateToggleButtonText() {
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
    },
    
    showMenu() {
        DOM.groupSelection.classList.add('hidden');
        DOM.levelSelection.classList.add('hidden');
        DOM.testArea.classList.add('hidden');
        DOM.results.classList.add('hidden');
        DOM.memoryGroupSelection.classList.add('hidden');
        DOM.memoryGame.classList.add('hidden');
        DOM.menu.classList.remove('hidden');
        
        AppState.currentMode = null;
        AppState.currentCards = [];
        AppState.currentCardIndex = 0;
        AppState.score = 0;
        AppState.totalAnswered = 0;
    }
};

