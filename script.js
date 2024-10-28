// Elementos do DOM
const wordContainer = document.getElementById('word-container');
const letterContainer = document.getElementById('letter-container');
const checkButton = document.getElementById('check-button');
const nextButton = document.getElementById('next-button');
const showAnswerButton = document.getElementById('show-answer-button');
const message = document.getElementById('message');
const attemptsDisplay = document.getElementById('attempts');
const timerDisplay = document.getElementById('timer');
const scoreDisplay = document.getElementById('score');
const levelDisplay = document.getElementById('level-display');
const streakDisplay = document.getElementById('streak-display');
const hintButton = document.getElementById('hint-button');
const soundButton = document.getElementById('sound-button');
const categorySelect = document.getElementById('category-select');
const achievementModal = document.getElementById('achievement-modal');
const tutorialModal = document.getElementById('tutorial-modal');
const modalClose = document.getElementById('modal-close');
const tutorialClose = document.getElementById('tutorial-close');
const tutorialButton = document.getElementById('tutorial-button');
const achievementsArea = document.getElementById('achievements-area');

// Configurações do jogo
const gameConfig = {
    levels: {
        'fácil': { timeLimit: 30, multiplier: 1, wordLength: 4, hintCost: 1 },
        'médio': { timeLimit: 20, multiplier: 1.5, wordLength: 6, hintCost: 2 },
        'difícil': { timeLimit: 15, multiplier: 2, wordLength: 8, hintCost: 3 }
    },
    sounds: {
        correct: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-game-success-tone-2882.mp3'),
        wrong: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-wrong-answer-fail-notification-946.mp3'),
        achievement: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3'),
        click: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-click-melodic-tone-1129.mp3'),
        hint: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-magical-spell-2102.mp3'),
        confetti: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3')
    },
    achievements: {
        novato: { name: '🌟 Novato', score: 10, message: 'Começou sua jornada!' },
        aprendiz: { name: '🎯 Aprendiz', score: 50, message: 'Está pegando o jeito!' },
        mestre: { name: '👑 Mestre', score: 100, message: 'Você é um mestre das palavras!' },
        veloz: { name: '⚡ Veloz', time: 5, message: 'Resolveu super rápido!' },
        perfeito: { name: '💯 Perfeito', streak: 5, message: 'Sequência perfeita!' }
    }
};

// Categorias de palavras
const wordCategories = {
    animais: [
        'GATO', 'CACHORRO', 'LEÃO', 'TIGRE', 'ELEFANTE', 'GIRAFA', 'ZEBRA',
        'MACACO', 'PINGUIM', 'COELHO', 'URSO', 'LOBO', 'ÁGUIA', 'COBRA',
        'BALEIA', 'GOLFINHO', 'TUBARÃO', 'CAVALO', 'VACA', 'OVELHA'
    ],
    frutas: [
        'MAÇÃ', 'BANANA', 'LARANJA', 'UVA', 'MORANGO', 'ABACAXI', 'MANGA',
        'PERA', 'MELANCIA', 'KIWI', 'LIMÃO', 'CEREJA', 'GOIABA', 'MAMÃO',
        'COCO', 'MARACUJÁ', 'AMEIXA', 'FIGO', 'ROMÃ', 'AÇAÍ'
    ],
    cores: [
        'AZUL', 'VERDE', 'VERMELHO', 'AMARELO', 'ROXO', 'LARANJA', 'ROSA',
        'MARROM', 'PRETO', 'BRANCO', 'CINZA', 'DOURADO', 'PRATA', 'BEGE',
        'VIOLETA', 'TURQUESA', 'ÍNDIGO', 'CORAL', 'CREME', 'VINHO'
    ],
    profissões: [
        'MÉDICO', 'PROFESSOR', 'ADVOGADO', 'ENGENHEIRO', 'DENTISTA',
        'ARQUITETO', 'BOMBEIRO', 'POLICIAL', 'CHEF', 'PILOTO', 'ATOR',
        'MÚSICO', 'PINTOR', 'ESCRITOR', 'CIENTISTA', 'JORNALISTA',
        'MOTORISTA', 'VENDEDOR', 'PADEIRO', 'MECÂNICO'
    ]
};

// Estado do jogo
const gameState = {
    currentWord: '',
    shuffledWord: '',
    attempts: 0,
    timeLeft: 20,
    totalScore: 0,
    wordCompleted: false,
    currentLevel: 'fácil',
    streak: 0,
    soundEnabled: true,
    hintsRemaining: 3,
    achievements: new Set(),
    categoryStreak: {},
    timerInterval: null,
    modalOpen: false,
    revealedHints: new Set()
};// Funções de utilidade
function getLevelEmoji(level) {
    const emojis = {
        'fácil': '😊',
        'médio': '😎',
        'difícil': '🤓'
    };
    return emojis[level] || '🎮';
}

function getCategoryEmoji(category) {
    const emojis = {
        animais: '🐾',
        frutas: '🍎',
        cores: '🎨',
        profissões: '👨‍💼'
    };
    return emojis[category] || '📝';
}

function shuffleWord(word) {
    if (!word) return '';
    return word.split('').sort(() => Math.random() - 0.5).join('');
}

function playSound(soundName) {
    if (gameState.soundEnabled && gameConfig.sounds[soundName]) {
        const sound = gameConfig.sounds[soundName];
        sound.currentTime = 0;
        sound.play().catch(() => {});
    }
}

// Funções principais do jogo
function checkWord() {
    if (gameState.wordCompleted || gameState.modalOpen) return;

    const currentAttempt = Array.from(wordContainer.children)
        .map(box => box.textContent)
        .join('');

    if (currentAttempt === gameState.currentWord) {
        handleCorrectAnswer();
    } else {
        handleWrongAnswer();
    }
}

function showAnswer() {
    if (!gameState.currentWord) return;
    
    clearInterval(gameState.timerInterval);
    
    // Limpa o container de palavras e mostra a resposta correta
    wordContainer.innerHTML = '';
    gameState.currentWord.split('').forEach(letter => {
        const letterBox = document.createElement('div');
        letterBox.className = 'letter-box correct';
        letterBox.textContent = letter;
        wordContainer.appendChild(letterBox);
    });
    
    // Limpa o container de letras
    letterContainer.innerHTML = '';
    
    // Atualiza a mensagem
    message.textContent = `A palavra correta é: ${gameState.currentWord}`;
    message.style.color = '#4ECDC4';
    
    // Atualiza o estado do jogo
    gameState.wordCompleted = true;
    gameState.streak = 0;
    
    // Esconde o botão de mostrar resposta
    if (showAnswerButton) {
        showAnswerButton.style.display = 'none';
    }
    
    // Atualiza o display
    updateDisplay();
}

function nextWord() {
    clearInterval(gameState.timerInterval);
    
    const category = categorySelect?.value || Object.keys(wordCategories)[0];
    const words = wordCategories[category];
    const levelConfig = gameConfig.levels[gameState.currentLevel];
    
    const filteredWords = words.filter(word => 
        word.length <= levelConfig.wordLength && 
        word.length >= Math.max(3, levelConfig.wordLength - 2)
    );
    
    gameState.currentWord = filteredWords[Math.floor(Math.random() * filteredWords.length)];
    gameState.shuffledWord = shuffleWord(gameState.currentWord);
    gameState.revealedHints = new Set();
    
    createLetterBoxes(gameState.shuffledWord, letterContainer);
    wordContainer.innerHTML = '';
    message.textContent = '';
    
    gameState.attempts = 0;
    gameState.wordCompleted = false;
    gameState.timeLeft = levelConfig.timeLimit;
    
    if (showAnswerButton) {
        showAnswerButton.style.display = 'none';
    }
    if (checkButton) {
        checkButton.style.backgroundColor = '#4ECDC4';
        checkButton.style.cursor = 'pointer';
    }
    
    updateDisplay();
    startTimer();
}

function handleCorrectAnswer() {
    clearInterval(gameState.timerInterval);
    
    const basePoints = calculatePoints();
    const timeBonus = Math.floor(gameState.timeLeft / 2);
    const streakBonus = calculateStreakBonus();
    const levelMultiplier = gameConfig.levels[gameState.currentLevel].multiplier;
    
    const totalPoints = Math.floor((basePoints + timeBonus + streakBonus) * levelMultiplier);
    
    gameState.streak++;
    gameState.totalScore += totalPoints;
    
    showSuccessMessage(totalPoints, timeBonus, streakBonus);
    updateDisplay();
    
    gameState.wordCompleted = true;
    playSound('correct');
    createConfettiEffect();
    checkAchievements();
    saveAchievements();
}

function handleWrongAnswer() {
    gameState.attempts++;
    gameState.streak = 0;
    
    updateDisplay();
    showErrorMessage();
    playSound('wrong');
    
    if (gameState.attempts >= 3) {
        if (showAnswerButton) {
            showAnswerButton.style.display = 'inline-block';
        }
        checkButton.style.backgroundColor = '#cccccc';
        checkButton.style.cursor = 'default';
        gameState.wordCompleted = true;
    }
}

// Função de Dicas (useHint) adicionada aqui
function useHint() {
    if (gameState.wordCompleted || gameState.hintsRemaining <= 0) return;
    
    const hintCost = gameConfig.levels[gameState.currentLevel].hintCost;
    
    // Encontra uma letra que ainda não foi revelada
    const wordLetters = gameState.currentWord.split('');
    const unrevealedIndices = wordLetters
        .map((_, index) => index)
        .filter(index => !gameState.revealedHints.has(index));
    
    if (unrevealedIndices.length === 0) return;
    
    // Escolhe uma letra aleatória para revelar
    const randomIndex = unrevealedIndices[Math.floor(Math.random() * unrevealedIndices.length)];
    gameState.revealedHints.add(randomIndex);
    
    // Move a letra correta para a posição certa
    const correctLetter = wordLetters[randomIndex];
    
    // Limpa a posição atual se já houver uma letra
    const currentBoxes = Array.from(wordContainer.children);
    if (currentBoxes[randomIndex]) {
        letterContainer.appendChild(currentBoxes[randomIndex]);
    }
    
    // Encontra e move a letra correta
    Array.from(letterContainer.children).forEach(box => {
        if (box.textContent === correctLetter) {
            box.classList.add('hint');
            wordContainer.insertBefore(box, wordContainer.children[randomIndex]);
        }
    });
    
    // Atualiza o estado do jogo
    gameState.hintsRemaining--;
    gameState.totalScore = Math.max(0, gameState.totalScore - hintCost);
    
    // Efeitos visuais e sonoros
    playSound('hint');
    updateDisplay();
    
    // Mostra mensagem
    message.textContent = `💡 Dica usada! (-${hintCost} pontos)`;
    message.style.color = '#6C5CE7';
}// Funções de UI
function createLetterBoxes(word, container) {
    if (!container || !word) return;
    
    container.innerHTML = '';
    for (let letter of word) {
        const letterBox = document.createElement('div');
        letterBox.className = 'letter-box';
        letterBox.textContent = letter;
        letterBox.addEventListener('click', () => moveLetter(letterBox));
        container.appendChild(letterBox);
    }
}

function moveLetter(letterBox) {
    if (gameState.wordCompleted || gameState.modalOpen) return;
    
    if (letterBox.parentNode === letterContainer) {
        wordContainer.appendChild(letterBox);
    } else {
        letterContainer.appendChild(letterBox);
    }
    playSound('click');
}

function updateDisplay() {
    if (scoreDisplay) {
        scoreDisplay.textContent = `🌟 Pontos: ${gameState.totalScore}`;
    }
    if (streakDisplay) {
        streakDisplay.textContent = `🔥 Sequência: ${gameState.streak}`;
    }
    if (levelDisplay) {
        levelDisplay.textContent = `📊 Nível: ${gameState.currentLevel}`;
    }
    if (attemptsDisplay) {
        attemptsDisplay.textContent = `Tentativas: ${gameState.attempts}`;
    }
    if (hintButton) {
        hintButton.textContent = `💡 (${gameState.hintsRemaining})`;
        hintButton.disabled = gameState.hintsRemaining <= 0;
    }
}

function updateTimerDisplay() {
    if (!timerDisplay) return;
    
    timerDisplay.textContent = `⏰ Tempo: ${gameState.timeLeft}s`;
    
    if (gameState.timeLeft <= 5) {
        timerDisplay.classList.add('time-warning');
    } else {
        timerDisplay.classList.remove('time-warning');
    }
}

function showSuccessMessage(points, timeBonus, streakBonus) {
    let msg = `🎉 Parabéns! (+${points} pontos)`;
    if (timeBonus > 0) msg += `<br>⚡ Bônus de tempo: +${timeBonus}`;
    if (streakBonus > 0) msg += `<br>🔥 Bônus de sequência: +${streakBonus}`;
    message.innerHTML = msg;
    message.style.color = '#4ECDC4';
}

function showErrorMessage() {
    const messages = [
        '😊 Tente novamente!',
        '💪 Você consegue!',
        '🤔 Quase lá...'
    ];
    message.textContent = messages[Math.min(gameState.attempts - 1, messages.length - 1)];
    message.style.color = '#FF6B6B';
}

function createConfettiEffect() {
    const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#6C5CE7', '#A8E6CF'];
    
    // Toca o som de comemoração
    playSound('confetti');
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDuration = (Math.random() * 2 + 1) + 's';
        confetti.style.opacity = Math.random();
        document.body.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 3000);
    }
}

// Sistema de conquistas e salvamento
function saveAchievements() {
    try {
        localStorage.setItem('wordGameAchievements', 
            JSON.stringify(Array.from(gameState.achievements)));
        localStorage.setItem('wordGameScore', 
            gameState.totalScore.toString());
    } catch (error) {
        console.error('Erro ao salvar conquistas:', error);
    }
}

function loadAchievements() {
    try {
        const savedAchievements = localStorage.getItem('wordGameAchievements');
        const savedScore = localStorage.getItem('wordGameScore');
        
        if (savedAchievements) {
            gameState.achievements = new Set(JSON.parse(savedAchievements));
        }
        if (savedScore) {
            gameState.totalScore = parseInt(savedScore, 10);
        }
        
        updateAchievementsDisplay();
    } catch (error) {
        console.error('Erro ao carregar conquistas:', error);
        gameState.achievements = new Set();
    }
}

function checkAchievements() {
    Object.entries(gameConfig.achievements).forEach(([key, achievement]) => {
        if (!gameState.achievements.has(key)) {
            if ((achievement.score && gameState.totalScore >= achievement.score) ||
                (achievement.time && gameState.timeLeft >= achievement.time) ||
                (achievement.streak && gameState.streak >= achievement.streak)) {
                
                gameState.achievements.add(key);
                showAchievementNotification(achievement);
                saveAchievements();
                updateAchievementsDisplay();
            }
        }
    });
}

function updateAchievementsDisplay() {
    if (!achievementsArea) return;
    
    achievementsArea.innerHTML = '';
    gameState.achievements.forEach(achievementKey => {
        const achievement = gameConfig.achievements[achievementKey];
        if (achievement) {
            const achievementElement = document.createElement('div');
            achievementElement.className = 'achievement-badge';
            achievementElement.title = achievement.message;
            achievementElement.textContent = achievement.name.split(' ')[0];
            achievementsArea.appendChild(achievementElement);
        }
    });
}// Funções de Timer e Cálculos
function startTimer() {
    clearInterval(gameState.timerInterval);
    updateTimerDisplay();
    
    gameState.timerInterval = setInterval(() => {
        gameState.timeLeft--;
        updateTimerDisplay();
        
        if (gameState.timeLeft <= 0) {
            clearInterval(gameState.timerInterval);
            endGame(false);
        }
    }, 1000);
}

function endGame(success) {
    clearInterval(gameState.timerInterval);
    gameState.wordCompleted = true;
    
    if (showAnswerButton) {
        showAnswerButton.style.display = 'inline-block';
    }
    if (checkButton) {
        checkButton.style.backgroundColor = '#cccccc';
        checkButton.style.cursor = 'default';
    }
    
    if (!success) {
        message.textContent = '😔 Tempo esgotado!';
        message.style.color = '#FF6B6B';
        gameState.streak = 0;
        updateDisplay();
    }
}

function calculatePoints() {
    switch(gameState.attempts) {
        case 0: return 10;  // Primeira tentativa
        case 1: return 5;   // Segunda tentativa
        case 2: return 2;   // Terceira tentativa
        default: return 0;
    }
}

function calculateStreakBonus() {
    if (gameState.streak >= 5) return 15;
    if (gameState.streak >= 3) return 10;
    if (gameState.streak >= 2) return 5;
    return 0;
}

// Funções de Modal
function setupModalListeners() {
    modalClose?.addEventListener('click', () => closeModal(achievementModal));
    tutorialClose?.addEventListener('click', () => closeModal(tutorialModal));
    tutorialButton?.addEventListener('click', () => showModal(tutorialModal));

    window.addEventListener('click', (e) => {
        if (e.target === achievementModal || e.target === tutorialModal) {
            closeModal(e.target);
        }
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && gameState.modalOpen) {
            closeAllModals();
        }
    });
}

function showModal(modal) {
    if (!modal || gameState.modalOpen) return;
    
    gameState.modalOpen = true;
    modal.classList.add('active');
    playSound('click');
    
    const content = modal.querySelector('.modal-content');
    if (content) {
        content.classList.add('modal-enter');
    }
}

function closeModal(modal) {
    if (!modal) return;
    
    const content = modal.querySelector('.modal-content');
    if (content) {
        content.classList.add('modal-exit');
        
        setTimeout(() => {
            modal.classList.remove('active');
            content.classList.remove('modal-exit', 'modal-enter');
            gameState.modalOpen = false;
        }, 300);
    } else {
        modal.classList.remove('active');
        gameState.modalOpen = false;
    }
    
    playSound('click');
}

function closeAllModals() {
    closeModal(achievementModal);
    closeModal(tutorialModal);
}

function showAchievementNotification(achievement) {
    if (!achievementModal || !achievement) return;
    
    const achievementMessage = document.getElementById('achievement-message');
    if (achievementMessage) {
        achievementMessage.innerHTML = `
            <div class="achievement-content">
                <div class="achievement-icon">${achievement.name.split(' ')[0]}</div>
                <div class="achievement-details">
                    <h3>${achievement.name}</h3>
                    <p>${achievement.message}</p>
                </div>
            </div>
        `;
    }
    
    showModal(achievementModal);
    playSound('achievement');
    createConfettiEffect();
}

// Funções de Inicialização
function createLevelSelector() {
    const levelButtons = document.querySelector('.level-buttons');
    if (!levelButtons) return;

    levelButtons.innerHTML = '';
    
    Object.keys(gameConfig.levels).forEach(level => {
        const button = document.createElement('button');
        button.className = `level-btn ${gameState.currentLevel === level ? 'active' : ''}`;
        button.dataset.level = level;
        button.textContent = `${getLevelEmoji(level)} ${level.toUpperCase()}`;
        button.addEventListener('click', () => setLevel(level));
        levelButtons.appendChild(button);
    });
}

function createCategorySelector() {
    if (!categorySelect) return;

    categorySelect.innerHTML = '';
    
    Object.keys(wordCategories).forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = `${getCategoryEmoji(category)} ${category.toUpperCase()}`;
        categorySelect.appendChild(option);
    });
}

function setLevel(level) {
    if (!gameConfig.levels[level]) return;
    
    gameState.currentLevel = level;
    document.querySelectorAll('.level-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.level === level);
    });
    nextWord();
}

function setupEventListeners() {
    checkButton?.addEventListener('click', checkWord);
    nextButton?.addEventListener('click', nextWord);
    showAnswerButton?.addEventListener('click', showAnswer);
    hintButton?.addEventListener('click', useHint);
    soundButton?.addEventListener('click', toggleSound);
    categorySelect?.addEventListener('change', nextWord);
    
    document.addEventListener('keydown', (e) => {
        if (gameState.modalOpen) return;
        
        switch(e.key) {
            case 'Enter': checkWord(); break;
            case ' ': 
                e.preventDefault();
                nextWord(); 
                break;
            case 'h': useHint(); break;
        }
    });
}

function toggleSound() {
    gameState.soundEnabled = !gameState.soundEnabled;
    if (soundButton) {
        soundButton.textContent = gameState.soundEnabled ? '🔊' : '🔇';
    }
    playSound('click');
}

function initializeGame() {
    try {
        const requiredElements = [
            wordContainer, letterContainer, checkButton, 
            nextButton, message, timerDisplay, scoreDisplay
        ];

        if (requiredElements.some(element => !element)) {
            throw new Error('Elementos necessários não encontrados');
        }

        createLevelSelector();
        createCategorySelector();
        setupModalListeners();
        setupEventListeners();
        loadAchievements();
        
        gameState.currentLevel = 'fácil';
        gameState.hintsRemaining = 3;
        gameState.soundEnabled = true;
        
        if (!localStorage.getItem('tutorialSeen')) {
            setTimeout(() => {
                showModal(tutorialModal);
                localStorage.setItem('tutorialSeen', 'true');
            }, 1000);
        }
        
        nextWord();
        updateDisplay();
        
    } catch (error) {
        console.error('Erro na inicialização:', error);
        if (message) {
            message.textContent = 'Erro ao iniciar o jogo. Por favor, recarregue a página.';
        }
    }
}

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', initializeGame);