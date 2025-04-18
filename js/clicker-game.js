// Game state
const gameState = {
    playerName: '',
    score: 0,
    timeLeft: 10,
    isPlaying: false,
    timerInterval: null,
    leaderboard: JSON.parse(localStorage.getItem('clickerLeaderboard')) || []
};

// DOM Elements
const elements = {
    registration: document.getElementById('registration'),
    nicknameInput: document.getElementById('nickname'),
    startButton: document.getElementById('startGame'),
    playerName: document.getElementById('playerName'),
    timer: document.getElementById('timer'),
    score: document.getElementById('score'),
    clickButton: document.getElementById('clickButton'),
    leaderboardBody: document.getElementById('leaderboardBody'),
    continueDialog: document.getElementById('continueDialog'),
    continuePlaying: document.getElementById('continuePlaying'),
    newGame: document.getElementById('newGame'),
    resultMessage: document.getElementById('resultMessage'),
    quitGameBtn: document.getElementById('quitGameBtn'),
    quitDialog: document.getElementById('quitDialog'),
    confirmQuit: document.getElementById('confirmQuit'),
    cancelQuit: document.getElementById('cancelQuit')
};

// Game Logic
const gameLogic = {
    init() {
        this.bindEvents();
        this.updateLeaderboard();
    },

    continuePlaying() {
        elements.continueDialog.classList.add('hidden');
        this.resetGame();
        this.startTimer();
    },

    startNewGame() {
        // Clear the current game state
        clearInterval(gameState.timerInterval);
        gameState.isPlaying = false;
        gameState.score = 0;
        
        // Redirect to index page
        window.location.href = '../index.html';
    },

    bindEvents() {
        elements.startButton.addEventListener('click', () => this.startGame());
        elements.clickButton.addEventListener('click', () => this.handleClick());
        elements.continuePlaying.addEventListener('click', () => this.continuePlaying());
        elements.newGame.addEventListener('click', () => this.startNewGame());
        elements.nicknameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.startGame();
        });
        
        // Add quit game button events
        elements.quitGameBtn?.addEventListener('click', () => {
            elements.quitDialog.classList.remove('hidden');
        });
        
        elements.confirmQuit?.addEventListener('click', () => {
            window.location.href = '../index.html';
        });
        
        elements.cancelQuit?.addEventListener('click', () => {
            elements.quitDialog.classList.add('hidden');
        });
    },

    startGame() {
        const nickname = elements.nicknameInput.value.trim();
        if (nickname) {
            gameState.playerName = nickname;
            elements.playerName.textContent = nickname;
            elements.registration.style.display = 'none';
            this.resetGame();
            this.startTimer();
        } else {
             const alertDialog = document.createElement('div');
             alertDialog.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-50';
             alertDialog.innerHTML = `
                 <div class="bg-cyan-500 border-4 border-blue-900 shadow-[8px_8px_0px_0px_rgba(30,58,138,1)] p-8 rounded-lg max-w-md w-full mx-4">
                     <p class="text-2xl font-bold mb-8 text-center text-white">Please enter a nickname! 😊</p>
                     <div class="flex justify-center">
                         <button class="bg-orange-500 hover:-translate-y-1 hover:translate-x-1 px-8 py-3 rounded-md text-white font-bold transition-transform border-4 border-blue-900 shadow-[4px_4px_0px_0px_rgba(30,58,138,1)] hover:shadow-none">OK</button>
                     </div>
                 </div>
             `;
             document.body.appendChild(alertDialog);
 
             // Add click event to close alert
             const okButton = alertDialog.querySelector('button');
             okButton.addEventListener('click', () => {
                 alertDialog.remove();
                 elements.nicknameInput.focus();
             });       
        }
    },

    resetGame() {
        gameState.score = 0;
        gameState.timeLeft = 10;
        gameState.isPlaying = true;
        elements.score.textContent = '0';
        elements.timer.textContent = '10';
        elements.clickButton.disabled = false;
    },

    startTimer() {
        if (gameState.timerInterval) clearInterval(gameState.timerInterval);
        
        gameState.timerInterval = setInterval(() => {
            gameState.timeLeft--;
            elements.timer.textContent = gameState.timeLeft;
            
            if (gameState.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    },

    handleClick() {
        if (!gameState.isPlaying) return;
        
        gameState.score++;
        elements.score.textContent = gameState.score;
        
        // Add click animation
        elements.clickButton.classList.add('scale-95');
        setTimeout(() => elements.clickButton.classList.remove('scale-95'), 100);
    },

    endGame() {
        clearInterval(gameState.timerInterval);
        gameState.isPlaying = false;
        elements.clickButton.disabled = true;

        // Find player's best score
        const existingPlayer = gameState.leaderboard.find(p => p.name === gameState.playerName);
        const bestScore = existingPlayer ? Math.max(existingPlayer.score, gameState.score) : gameState.score;

        // Create or update player entry with best score
        const newScore = {
            name: gameState.playerName,
            score: bestScore
        };

        // Remove existing entry and add updated one
        gameState.leaderboard = gameState.leaderboard.filter(p => p.name !== gameState.playerName);
        gameState.leaderboard.push(newScore);

        // Sort all scores but don't limit the array
        gameState.leaderboard.sort((a, b) => b.score - a.score);
        
        // Save all scores to localStorage
        localStorage.setItem('clickerLeaderboard', JSON.stringify(gameState.leaderboard));
        
        // Update display
        this.updateLeaderboard();
        
        // Show continue dialog
        const message = `Game Over!<br>Final Score: ${gameState.score}`;
        elements.resultMessage.innerHTML = message;
        elements.continueDialog.classList.remove('hidden');
    },

    updateLeaderboard() {
        if (!elements.leaderboardBody) return;
        
        // Only display top 10 in the UI
        const topTenPlayers = gameState.leaderboard.slice(0, 10);
        
        elements.leaderboardBody.innerHTML = topTenPlayers
            .map((player, index) => `
                <tr class="border-b border-blue-900 ${player.name === gameState.playerName ? 'bg-blue-900/20' : ''}">
                    <td class="py-2 text-center font-bold">#${index + 1}</td>
                    <td class="py-2 text-center">${player.name}</td>
                    <td class="py-2 text-center font-bold">${player.score}</td>
                </tr>
            `).join('');
    }
};

// Initialize the game
gameLogic.init();