// Révision espacée (type Anki) — algorithme et persistance
const SRS = {
    STORAGE_KEY: 'freejapan_srs',
    SESSION_FIRST_TIME_MAX: 20,
    SESSION_DUE_MAX: 25,
    SESSION_NEW_PER_DAY: 5,
    SESSION_TOTAL_MAX: 30,
    sessionCards: [],
    sessionIndex: 0,
    currentCard: null,
    lastCorrect: false,

    // Construire la liste complète des cartes (vocabulaire) avec un id unique
    buildPool() {
        const pool = [];
        ['hiragana', 'katakana'].forEach(type => {
            const words = type === 'hiragana' ? hiraganaWords : katakanaWords;
            Object.keys(words).forEach(level => {
                words[level].forEach((item, index) => {
                    pool.push({
                        id: `${type}-${level}-${index}`,
                        char: item.word,
                        romaji: item.romaji,
                        meaning: item.meaning || '',
                        english: item.english || ''
                    });
                });
            });
        });
        return pool;
    },

    getState() {
        try {
            const raw = localStorage.getItem(SRS.STORAGE_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            return {};
        }
    },

    saveState(state) {
        try {
            localStorage.setItem(SRS.STORAGE_KEY, JSON.stringify(state));
        } catch (e) {}
    },

    // Date du jour en YYYY-MM-DD (minuit UTC pour cohérence)
    todayKey() {
        const d = new Date();
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    },

    // True si l'utilisateur n'a encore jamais fait de révision (compteur à zéro)
    isFirstTimeUser() {
        const state = SRS.getState();
        const pool = SRS.buildPool();
        const learned = pool.filter(card => {
            const s = state[card.id];
            return s && (s.repetitions || 0) > 0;
        }).length;
        return learned === 0;
    },

    // Cartes à réviser aujourd'hui (méthode type Anki)
    // - Première utilisation : uniquement 20 mots nouveaux
    // - Ensuite : mots dus (priorité aux "encore") + quelques mots nouveaux, plafond 30
    getDueCards() {
        const pool = SRS.buildPool();
        const state = SRS.getState();
        const today = SRS.todayKey();

        if (SRS.isFirstTimeUser()) {
            const shuffled = pool.slice();
            shuffleArray(shuffled);
            return shuffled.slice(0, SRS.SESSION_FIRST_TIME_MAX);
        }

        const due = pool.filter(card => {
            const s = state[card.id];
            if (!s || !s.nextReview) return false;
            return s.nextReview <= today;
        });

        const newCards = pool.filter(card => {
            const s = state[card.id];
            return !s || !s.nextReview;
        });

        shuffleArray(due);
        shuffleArray(newCards);

        const againFirst = due.sort((a, b) => {
            const ia = (state[a.id] && state[a.id].interval) || 0;
            const ib = (state[b.id] && state[b.id].interval) || 0;
            return ia - ib;
        });

        const dueCapped = againFirst.slice(0, SRS.SESSION_DUE_MAX);
        const newToAdd = Math.min(SRS.SESSION_NEW_PER_DAY, newCards.length, SRS.SESSION_TOTAL_MAX - dueCapped.length);
        const session = dueCapped.concat(newToAdd > 0 ? newCards.slice(0, newToAdd) : []);
        shuffleArray(session);
        return session;
    },

    // Nombre de cartes pour la prochaine session (affiché sur le tableau de bord)
    getDueCount() {
        if (SRS.isFirstTimeUser()) {
            return Math.min(SRS.SESSION_FIRST_TIME_MAX, SRS.buildPool().length);
        }
        const pool = SRS.buildPool();
        const state = SRS.getState();
        const today = SRS.todayKey();
        const dueCount = pool.filter(card => {
            const s = state[card.id];
            return s && s.nextReview && s.nextReview <= today;
        }).length;
        const newCount = pool.filter(card => !state[card.id] || !state[card.id].nextReview).length;
        const dueCapped = Math.min(dueCount, SRS.SESSION_DUE_MAX);
        const newToAdd = Math.min(SRS.SESSION_NEW_PER_DAY, newCount, SRS.SESSION_TOTAL_MAX - dueCapped);
        return Math.min(SRS.SESSION_TOTAL_MAX, dueCapped + newToAdd);
    },

    // Planifier la prochaine révision (Again = 1j, Bien = interval*1.5, Facile = interval*2)
    scheduleCard(id, rating) {
        const state = SRS.getState();
        const today = SRS.todayKey();
        const cur = state[id] || { interval: 0, nextReview: today };

        let nextInterval = cur.interval;
        let nextReview = today;

        if (rating === 'again') {
            nextInterval = 0;
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            nextReview = tomorrow.getFullYear() + '-' + String(tomorrow.getMonth() + 1).padStart(2, '0') + '-' + String(tomorrow.getDate()).padStart(2, '0');
        } else if (rating === 'good') {
            nextInterval = nextInterval < 1 ? 1 : Math.min(60, Math.round(nextInterval * 1.5));
            const next = new Date(today);
            next.setDate(next.getDate() + nextInterval);
            nextReview = next.getFullYear() + '-' + String(next.getMonth() + 1).padStart(2, '0') + '-' + String(next.getDate()).padStart(2, '0');
        } else if (rating === 'easy') {
            nextInterval = nextInterval < 1 ? 2 : Math.min(60, Math.round(nextInterval * 2));
            const next = new Date(today);
            next.setDate(next.getDate() + nextInterval);
            nextReview = next.getFullYear() + '-' + String(next.getMonth() + 1).padStart(2, '0') + '-' + String(next.getDate()).padStart(2, '0');
        }

        state[id] = {
            nextReview,
            interval: nextInterval,
            repetitions: (cur.repetitions || 0) + 1
        };
        SRS.saveState(state);
    },

    // Vérifier la réponse : romaji ou sens (français/anglais) accepté. Réponse vide = incorrect.
    checkAnswer(card, userAnswer) {
        const raw = userAnswer.trim().toLowerCase();
        if (raw.length === 0) return false;
        const norm = (s) => s.toLowerCase().replace(/\s+/g, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        const romajiNorm = norm(card.romaji);
        const userNorm = norm(raw);

        if (userNorm === romajiNorm) return true;
        if (card.meaning && norm(card.meaning) === userNorm) return true;
        if (card.meaning && card.meaning.toLowerCase().includes(raw)) return true;
        if (card.english && norm(card.english) === userNorm) return true;
        if (card.english && card.english.toLowerCase().includes(raw)) return true;

        return false;
    },

    startSession() {
        SRS.sessionCards = SRS.getDueCards();
        SRS.sessionIndex = 0;
        document.querySelector('.srs-review .flashcard-container').classList.remove('hidden');
        document.querySelector('#srs-review .input-section').classList.remove('hidden');
        document.getElementById('srs-session-done').classList.add('hidden');
        if (SRS.sessionCards.length === 0) {
            SRS.showSessionDone();
            return;
        }
        SRS.showCurrentCard();
    },

    showCurrentCard() {
        if (SRS.sessionIndex >= SRS.sessionCards.length) {
            SRS.showSessionDone();
            return;
        }
        SRS.currentCard = SRS.sessionCards[SRS.sessionIndex];
        const card = SRS.currentCard;
        const displayEl = document.getElementById('srs-character-display');
        if (displayEl) displayEl.innerHTML = formatSmallChars(card.char);
        const inputEl = document.getElementById('srs-answer-input');
        if (inputEl) { inputEl.value = ''; inputEl.focus(); }
        document.getElementById('srs-feedback').classList.add('hidden');
        document.getElementById('srs-rate-buttons').classList.add('hidden');
        document.getElementById('srs-check-answer').classList.remove('hidden');
        SRS.updateRemaining();
    },

    updateRemaining() {
        const el = document.getElementById('srs-remaining');
        if (el) el.textContent = Math.max(0, SRS.sessionCards.length - SRS.sessionIndex);
    },

    checkAndShowFeedback() {
        const inputEl = document.getElementById('srs-answer-input');
        const card = SRS.currentCard;
        if (!card || !inputEl) return;
        SRS.lastCorrect = SRS.checkAnswer(card, inputEl.value.trim());
        const feedbackEl = document.getElementById('srs-feedback');
        const msg = SRS.lastCorrect
            ? 'Correct ! ' + card.romaji + ' — ' + (card.meaning || card.english || '')
            : 'Pas tout à fait. ' + card.romaji + ' — ' + (card.meaning || card.english || '');
        feedbackEl.innerHTML = msg.replace(/\n/g, '<br>');
        feedbackEl.className = 'feedback ' + (SRS.lastCorrect ? 'correct' : 'incorrect');
        feedbackEl.classList.remove('hidden');
        document.getElementById('srs-check-answer').classList.add('hidden');
        document.getElementById('srs-rate-buttons').classList.remove('hidden');
    },

    rateAndNext(rating) {
        if (!SRS.currentCard) return;
        SRS.scheduleCard(SRS.currentCard.id, rating);
        SRS.sessionIndex++;
        SRS.showCurrentCard();
    },

    showSessionDone() {
        document.querySelector('.srs-review .flashcard-container').classList.add('hidden');
        document.querySelector('#srs-review .input-section').classList.add('hidden');
        document.getElementById('srs-feedback').classList.add('hidden');
        document.getElementById('srs-rate-buttons').classList.add('hidden');
        document.getElementById('srs-session-done').classList.remove('hidden');
    }
};
