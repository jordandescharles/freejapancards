// Logique du jeu de test/flashcards
const TestGame = {
    displayCard() {
        if (AppState.currentCardIndex >= AppState.currentCards.length) {
            TestGame.finishTest();
            return;
        }
        
        const card = AppState.currentCards[AppState.currentCardIndex];
        const formattedChar = formatSmallChars(card.char);
        DOM.characterDisplay.innerHTML = formattedChar;
        
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
                DOM.translationDisplay.innerHTML = translationText;
                DOM.translationDisplay.classList.remove('hidden');
            } else {
                DOM.translationDisplay.classList.add('hidden');
            }
        } else {
            DOM.translationDisplay.classList.add('hidden');
        }
        
        DOM.answerInput.value = '';
        DOM.answerInput.focus();
        DOM.feedback.classList.add('hidden');
        DOM.nextCardBtn.classList.add('hidden');
        DOM.checkAnswerBtn.classList.remove('hidden');
    },
    
    findRandomWordWithCharacter(character) {
        const isHiragana = AppState.currentMode && AppState.currentMode.includes('hiragana');
        const wordsData = isHiragana ? hiraganaWords : katakanaWords;
        
        const matchingWords = [];
        Object.keys(wordsData).forEach(level => {
            wordsData[level].forEach(word => {
                if (word.word.includes(character)) {
                    matchingWords.push(word);
                }
            });
        });
        
        if (matchingWords.length > 0) {
            const randomIndex = Math.floor(Math.random() * matchingWords.length);
            return matchingWords[randomIndex];
        }
        
        return null;
    },
    
    checkAnswer() {
        const userAnswer = DOM.answerInput.value.trim().toLowerCase();
        const card = AppState.currentCards[AppState.currentCardIndex];
        const correctAnswer = card.romaji.toLowerCase();
        
        const normalizedUser = userAnswer.replace(/\s+/g, '');
        const normalizedCorrect = correctAnswer.replace(/\s+/g, '');
        
        AppState.totalAnswered++;
        
        if (normalizedUser === normalizedCorrect) {
            AppState.score++;
            let message = `Correct! ${card.char} = ${card.romaji}`;
            if (card.meaning) {
                message += `\n🇫🇷 ${card.meaning}`;
                if (card.english) {
                    message += ` | 🇬🇧 ${card.english}`;
                }
            }
            
            if (!card.meaning && card.char) {
                const exampleWord = TestGame.findRandomWordWithCharacter(card.char);
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
            
            TestGame.showFeedback(true, message);
        } else {
            let message = `Incorrect. La bonne réponse est: ${card.romaji}`;
            if (card.meaning) {
                message += `\n🇫🇷 ${card.meaning}`;
                if (card.english) {
                    message += ` | 🇬🇧 ${card.english}`;
                }
            }
            TestGame.showFeedback(false, message);
        }
        
        TestGame.updateStats();
        TestGame.updateProgress();
        
        DOM.checkAnswerBtn.classList.add('hidden');
        DOM.nextCardBtn.classList.remove('hidden');
    },
    
    showFeedback(isCorrect, message) {
        DOM.feedback.innerHTML = message.replace(/\n/g, '<br>');
        DOM.feedback.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
        DOM.feedback.classList.remove('hidden');
    },
    
    nextCard() {
        AppState.currentCardIndex++;
        TestGame.displayCard();
    },
    
    updateProgress() {
        const progress = (AppState.currentCardIndex / AppState.currentCards.length) * 100;
        DOM.progressFill.style.width = `${progress}%`;
    },
    
    updateStats() {
        DOM.scoreDisplay.textContent = AppState.score;
        DOM.totalDisplay.textContent = AppState.totalAnswered;
    },
    
    finishTest() {
        DOM.testArea.classList.add('hidden');
        DOM.results.classList.remove('hidden');
        
        const percentage = AppState.totalAnswered > 0 ? Math.round((AppState.score / AppState.totalAnswered) * 100) : 0;
        
        document.getElementById('final-score').textContent = AppState.score;
        document.getElementById('final-total').textContent = AppState.totalAnswered;
        document.getElementById('final-percentage').textContent = `${percentage}%`;
    },
    
    startCardTest() {
        DOM.groupSelection.classList.add('hidden');
        DOM.levelSelection.classList.add('hidden');
        DOM.testArea.classList.remove('hidden');
        
        AppState.currentCardIndex = 0;
        AppState.score = 0;
        AppState.totalAnswered = 0;
        
        TestGame.displayCard();
        TestGame.updateProgress();
        TestGame.updateStats();
        
        DOM.answerInput.value = '';
        DOM.answerInput.focus();
        DOM.feedback.classList.add('hidden');
        DOM.nextCardBtn.classList.add('hidden');
        DOM.checkAnswerBtn.classList.remove('hidden');
    },
    
    startTest() {
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
        
        const data = AppState.currentMode.includes('hiragana') ? hiraganaData : katakanaData;
        
        AppState.currentCards = [];
        checkedCharacters.forEach(({ group, index }) => {
            if (data[group] && data[group][index]) {
                AppState.currentCards.push(data[group][index]);
            }
        });
        
        if (AppState.currentCards.length === 0) {
            alert('Aucune carte disponible');
            return;
        }
        
        shuffleArray(AppState.currentCards);
        TestGame.startCardTest();
    },
    
    startWordTest(mode, level) {
        const data = mode.includes('hiragana') ? hiraganaWords : katakanaWords;
        
        if (!data[level]) {
            alert('Niveau non disponible');
            return;
        }
        
        AppState.currentCards = data[level].map(item => ({
            char: item.word,
            romaji: item.romaji,
            meaning: item.meaning,
            english: item.english || null
        }));
        
        shuffleArray(AppState.currentCards);
        TestGame.startCardTest();
    },
    
    restartTest() {
        DOM.results.classList.add('hidden');
        DOM.testArea.classList.add('hidden');
        
        if (AppState.currentMode.includes('chars')) {
            UI.showGroupSelection(AppState.currentMode);
        } else {
            UI.showLevelSelection(AppState.currentMode);
        }
    }
};

