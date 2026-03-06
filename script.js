// Point d'entrée principal de l'application

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    updateCurrentYear();
});

function setupEventListeners() {
    // Menu cards
    document.querySelectorAll('.menu-card').forEach(card => {
        card.addEventListener('click', () => {
            const mode = card.dataset.mode;
            UI.handleModeSelection(mode);
        });
    });

    // Group selection
    document.addEventListener('change', (e) => {
        if (e.target && e.target.id === 'toggle-all-groups-checkbox') {
            UI.toggleAllGroups();
        }
    });
    document.getElementById('start-test').addEventListener('click', TestGame.startTest);
    document.getElementById('back-to-menu').addEventListener('click', UI.showMenu);
    
    // Header link
    document.getElementById('header-link').addEventListener('click', (e) => {
        e.preventDefault();
        UI.showMenu();
    });

    // Level selection
    document.getElementById('back-to-menu-words').addEventListener('click', UI.showMenu);

    // Test controls
    DOM.checkAnswerBtn.addEventListener('click', TestGame.checkAnswer);
    DOM.nextCardBtn.addEventListener('click', TestGame.nextCard);
    document.getElementById('finish-test').addEventListener('click', TestGame.finishTest);
    document.getElementById('restart-test').addEventListener('click', TestGame.restartTest);

    // Results
    document.getElementById('restart-from-results').addEventListener('click', TestGame.restartTest);
    document.getElementById('back-to-menu-results').addEventListener('click', UI.showMenu);
    
    // Memory game
    document.getElementById('back-to-menu-memory').addEventListener('click', UI.showMenu);
    document.getElementById('back-from-memory').addEventListener('click', MemoryGame.showGroupSelection);
    document.getElementById('restart-memory').addEventListener('click', () => {
        if (AppState.memoryType && AppState.memoryMode) {
            MemoryGame.start(AppState.memoryType, AppState.memoryMode);
        }
    });
    document.getElementById('next-series').addEventListener('click', () => {
        document.getElementById('memory-complete').classList.add('hidden');
        MemoryGame.startNewSeries();
    });
    document.getElementById('back-to-menu-memory-complete').addEventListener('click', UI.showMenu);

    // SRS - Révision espacée
    document.getElementById('srs-start-review').addEventListener('click', () => {
        document.getElementById('srs-dashboard').classList.add('hidden');
        document.getElementById('srs-review').classList.remove('hidden');
        SRS.startSession();
    });
    document.getElementById('srs-back-to-menu').addEventListener('click', UI.showMenu);
    document.getElementById('srs-review-back').addEventListener('click', () => {
        document.getElementById('srs-review').classList.add('hidden');
        UI.showSrsDashboard();
    });
    document.getElementById('srs-check-answer').addEventListener('click', SRS.checkAndShowFeedback);
    document.getElementById('srs-rate-again').addEventListener('click', () => SRS.rateAndNext('again'));
    document.getElementById('srs-rate-good').addEventListener('click', () => SRS.rateAndNext('good'));
    document.getElementById('srs-rate-easy').addEventListener('click', () => SRS.rateAndNext('easy'));
    document.getElementById('srs-done-back').addEventListener('click', UI.showMenu);
    document.getElementById('srs-answer-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            if (document.getElementById('srs-rate-buttons').classList.contains('hidden')) {
                SRS.checkAndShowFeedback();
            } else {
                SRS.rateAndNext('good');
            }
        }
    });

    // Enter key support
    DOM.answerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            if (!DOM.nextCardBtn.classList.contains('hidden')) {
                TestGame.nextCard();
            } else {
                TestGame.checkAnswer();
            }
        }
    });
}
