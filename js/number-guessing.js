// Game state
const gameState = {
    targetNumber: 0,
    attempts: 5,
    maxAttempts: 5,
    isPlaying: false,
    startTime: 0,
    nickname: ''
};

// DOM Elements
const elements = {
    welcomeScreen: document.getElementById('welcomeScreen'),
    gameScreen: document.getElementById('gameScreen'),
    nickname: document.getElementById('nickname'),
    startGame: document.getElementById('startGame'),
    guessInput: document.getElementById('guessInput'),
    submitGuess: document.getElementById('submitGuess'),
    attempts: document.getElementById('attempts'),
    hint: document.getElementById('hint'),
    playerInfo: document.getElementById('playerInfo'),
    leaderboardBody: document.getElementById('leaderboardBody')
};

// Initialize game
function initGame() {
    // Load leaderboard
    updateLeaderboard();
    
    // Event listeners
    elements.startGame.addEventListener('click', startNewGame);
    elements.submitGuess.addEventListener('click', handleGuess);
    elements.guessInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleGuess();
    });
}

// Start new game
function startNewGame() {
    const nickname = elements.nickname.value.trim();
    if (!nickname) {
        // Create custom alert message
        const alertMessage = document.createElement('div');
        alertMessage.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-50';
        alertMessage.innerHTML = `
            <div class="bg-cyan-500 border-4 border-blue-900 shadow-[8px_8px_0px_0px_rgba(30,58,138,1)] p-8 rounded-lg max-w-md w-full mx-4 text-center">
                <p class="text-2xl font-bold mb-8">Please enter a nickname! 😊</p>
                <button class="bg-orange-500 hover:-translate-y-1 hover:translate-x-1 px-6 py-3 rounded-md text-white font-bold transition-transform border-4 border-blue-900 shadow-[4px_4px_0px_0px_rgba(30,58,138,1)] hover:shadow-none">OK</button>
            </div>
        `;
        document.body.appendChild(alertMessage);

        // Add click event to close alert
        const okButton = alertMessage.querySelector('button');
        okButton.addEventListener('click', () => {
            alertMessage.remove();
            elements.nickname.focus();
        });

        return;
    }

    gameState.nickname = nickname;
    gameState.targetNumber = Math.floor(Math.random() * 100) + 1;
    gameState.attempts = gameState.maxAttempts;
    gameState.isPlaying = true;
    gameState.startTime = Date.now();

    // Update UI
    elements.welcomeScreen.classList.add('hidden');
    elements.gameScreen.classList.remove('hidden');
    elements.playerInfo.textContent = `Player: ${nickname}`;
    elements.attempts.textContent = `Attempts remaining: ${gameState.attempts}`;
    elements.hint.textContent = '';
    elements.guessInput.value = '';
    elements.guessInput.focus();
}

// Handle guess
function handleGuess() {
    if (!gameState.isPlaying) return;

    const guess = parseInt(elements.guessInput.value);
    if (isNaN(guess) || guess < 1 || guess > 100) {
        alert('Please enter a valid number between 1 and 100');
        return;
    }

    gameState.attempts--;
    elements.attempts.textContent = `Attempts remaining: ${gameState.attempts}`;
    elements.guessInput.value = '';

    // Check guess
    if (guess === gameState.targetNumber) {
        handleWin();
    } else {
        const hint = guess > gameState.targetNumber ? 'Too high!' : 'Too low!';
        
        // Create hint popup
        const hintPopup = document.createElement('div');
        hintPopup.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50';
        hintPopup.innerHTML = `
            <div class="bg-cyan-500 p-6 rounded-lg border-4 border-blue-900 shadow-[8px_8px_0px_0px_rgba(30,58,138,1)] transform transition-all">
                <p class="text-3xl font-bold text-white mb-4">${hint}</p>
                <button class="w-full bg-orange-500 text-white font-bold py-2 px-4 rounded border-4 border-blue-900 shadow-[4px_4px_0px_0px_rgba(30,58,138,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">OK</button>
            </div>
        `;
        
        document.body.appendChild(hintPopup);

        // Auto-remove popup after 1.5 seconds or on button click
        const okButton = hintPopup.querySelector('button');
        okButton.addEventListener('click', () => hintPopup.remove());
        setTimeout(() => hintPopup.remove(), 1500);

        elements.hint.textContent = hint;

        if (gameState.attempts === 0) {
            handleLoss();
        }
    }
}

// Handle win
function handleWin() {
    const timeTaken = Math.floor((Date.now() - gameState.startTime) / 1000);
    const attemptsUsed = gameState.maxAttempts - gameState.attempts;
    
    const message = `Congratulations! You found the number in ${attemptsUsed} attempts!`;
    elements.hint.textContent = message;
    elements.resultMessage.textContent = message;
    gameState.isPlaying = false;

    saveScore({
        nickname: gameState.nickname,
        attempts: attemptsUsed,
        time: timeTaken
    });

    updateLeaderboard();
    setTimeout(() => {
        elements.continueDialog.classList.remove('hidden');
    }, 1000);
}

// Handle loss
function handleLoss() {
    const message = `Game Over! The number was ${gameState.targetNumber}`;
    elements.hint.textContent = message;
    elements.resultMessage.textContent = message;
    gameState.isPlaying = false;

    setTimeout(() => {
        elements.continueDialog.classList.remove('hidden');
    }, 1000);
}

// Save score to localStorage
function saveScore(score) {
    const scores = getScores();
    scores.push(score);
    scores.sort((a, b) => {
        if (a.attempts !== b.attempts) {
            return a.attempts - b.attempts;
        }
        return a.time - b.time;
    });
    
    // Keep only top 10 scores
    const topScores = scores.slice(0, 10);
    localStorage.setItem('numberGuessScores', JSON.stringify(topScores));
}

// Get scores from localStorage
function getScores() {
    const scores = localStorage.getItem('numberGuessScores');
    return scores ? JSON.parse(scores) : [];
}

// Update leaderboard display
function updateLeaderboard() {
    const scores = getScores();
    elements.leaderboardBody.innerHTML = scores.map((score, index) => `
        <tr class="border-b border-gray-700">
            <td class="py-2">#${index + 1}</td>
            <td>${score.nickname}</td>
            <td>${score.attempts}</td>
            <td>${score.time}s</td>
        </tr>
    `).join('');
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', initGame);

// Add continuation dialog HTML after DOM Elements
document.body.insertAdjacentHTML('beforeend', `
    <div id="continueDialog" class="fixed inset-0 bg-black/90 flex items-center justify-center z-50 hidden">
        <div class="bg-cyan-500 p-8 rounded-lg max-w-md w-full mx-4">
            <div id="resultMessage" class="text-2xl font-bold mb-4 text-center"></div>
            <h2 class="text-xl font-bold mb-6 text-center">Would you like to continue?</h2>
            <div class="flex gap-4">
                <button id="continuePlaying" class="flex-1 bg-orange-500 hover:-translate-y-1 hover:translate-x-1 px-6 py-3 rounded-md text-white font-bold transition-transform relative border-4 border-blue-900 shadow-[4px_4px_0px_0px_rgba(30,58,138,1)] hover:shadow-none">Continue</button>
                <button id="returnHome" class="flex-1 bg-green-500 hover:-translate-y-1 hover:translate-x-1 px-6 py-3 rounded-md text-white font-bold transition-transform relative border-4 border-blue-900 shadow-[4px_4px_0px_0px_rgba(30,58,138,1)] hover:shadow-none">Home</button>
            </div>
        </div>
    </div>
`);

// Add new elements to elements object
elements.continueDialog = document.getElementById('continueDialog');
elements.resultMessage = document.getElementById('resultMessage');
elements.continuePlaying = document.getElementById('continuePlaying');
elements.returnHome = document.getElementById('returnHome');

// Add event listeners in initGame function
function initGame() {
    // Load leaderboard
    updateLeaderboard();
    
    // Event listeners
    elements.startGame.addEventListener('click', startNewGame);
    elements.submitGuess.addEventListener('click', handleGuess);
    elements.guessInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleGuess();
    });
    
    elements.continuePlaying.addEventListener('click', () => {
        elements.continueDialog.classList.add('hidden');
        elements.welcomeScreen.classList.remove('hidden');
        elements.gameScreen.classList.add('hidden');
    });
    
    elements.returnHome.addEventListener('click', () => {
        window.location.href = '../index.html';
    });
}

// Update handleWin function
function handleWin() {
    const timeTaken = Math.floor((Date.now() - gameState.startTime) / 1000);
    const attemptsUsed = gameState.maxAttempts - gameState.attempts;
    
    const message = `Congratulations! You found the number in ${attemptsUsed} attempts!`;
    elements.hint.textContent = message;
    elements.resultMessage.textContent = message;
    gameState.isPlaying = false;

    saveScore({
        nickname: gameState.nickname,
        attempts: attemptsUsed,
        time: timeTaken
    });

    updateLeaderboard();
    setTimeout(() => {
        elements.continueDialog.classList.remove('hidden');
    }, 1000);
}

// Update handleLoss function
function handleLoss() {
    const message = `Game Over! The number was ${gameState.targetNumber}`;
    elements.hint.textContent = message;
    elements.resultMessage.textContent = message;
    gameState.isPlaying = false;

    setTimeout(() => {
        elements.continueDialog.classList.remove('hidden');
    }, 1000);
}
