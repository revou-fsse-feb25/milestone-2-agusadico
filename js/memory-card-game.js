// Game state
const gameState = {
    playerName: '',
    moves: 0,
    isPlaying: false,
    flippedCards: [],
    matchedPairs: 0,
    leaderboard: JSON.parse(localStorage.getItem('memoryGameLeaderboard')) || []
};

// Card images (8 pairs)
const cardImages = [
    'card1.png', 'card2.png', 'card3.png', 'card4.png',
    'card5.png', 'card6.png', 'card7.png', 'card8.png'
].map(img => `../images/memory-cards/${img}`);

// DOM Elements
const elements = {
    registration: document.getElementById('registration'),
    nicknameInput: document.getElementById('nickname'),
    startButton: document.getElementById('startGame'),
    playerName: document.getElementById('playerName'),
    moves: document.getElementById('moves'),
    gameGrid: document.getElementById('gameGrid'),
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

    bindEvents() {
        elements.startButton.addEventListener('click', () => this.startGame());
        elements.continuePlaying.addEventListener('click', () => this.continuePlaying());
        elements.newGame.addEventListener('click', () => this.startNewGame());
        elements.nicknameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.startGame();
        });
        
        elements.quitGameBtn.addEventListener('click', () => {
            elements.quitDialog.classList.remove('hidden');
            elements.quitDialog.classList.add('flex');
        });
        
        elements.confirmQuit.addEventListener('click', () => {
            window.location.href = '../index.html';
        });
        
        elements.cancelQuit.addEventListener('click', () => {
            elements.quitDialog.classList.remove('flex');
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
            this.createBoard();
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
        gameState.moves = 0;
        gameState.isPlaying = true;
        gameState.flippedCards = [];
        gameState.matchedPairs = 0;
        elements.moves.textContent = '0';
    },

    createBoard() {
        const cards = [...cardImages, ...cardImages];
        this.shuffleArray(cards);
        
        elements.gameGrid.innerHTML = cards.map((img, index) => `
            <div class="card cursor-pointer transform transition-transform duration-500" data-index="${index}">
                <div class="card-inner relative w-full h-32 transform-style-preserve-3d transition-transform duration-500">
                    <div class="card-front absolute w-full h-full bg-cyan-500 rounded-lg border-4 border-blue-800"></div>
                    <div class="card-back absolute w-full h-full bg-white rounded-lg border-4 border-blue-800 backface-hidden">
                        <img src="${img}" alt="card" class="w-full h-full object-contain p-2">
                    </div>
                </div>
            </div>
        `).join('');

        document.querySelectorAll('.card').forEach(card => {
            card.addEventListener('click', () => this.handleCardClick(card));
        });
    },

    handleCardClick(card) {
        if (!gameState.isPlaying || gameState.flippedCards.length >= 2 || 
            card.classList.contains('flipped') || card.classList.contains('matched')) {
            return;
        }

        card.classList.add('flipped');
        card.querySelector('.card-inner').style.transform = 'rotateY(180deg)';
        gameState.flippedCards.push(card);

        if (gameState.flippedCards.length === 2) {
            gameState.moves++;
            elements.moves.textContent = gameState.moves;
            this.checkMatch();
        }
    },

    checkMatch() {
        const [card1, card2] = gameState.flippedCards;
        const img1 = card1.querySelector('img').src;
        const img2 = card2.querySelector('img').src;

        if (img1 === img2) {
            gameState.matchedPairs++;
            card1.classList.add('matched');
            card2.classList.add('matched');
            gameState.flippedCards = [];

            if (gameState.matchedPairs === cardImages.length) {
                this.endGame();
            }
        } else {
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                card1.querySelector('.card-inner').style.transform = '';
                card2.querySelector('.card-inner').style.transform = '';
                gameState.flippedCards = [];
            }, 1000);
        }
    },

    endGame() {
        gameState.isPlaying = false;

        // Update leaderboard
        const newScore = {
            name: gameState.playerName,
            moves: gameState.moves
        };

        const existingPlayer = gameState.leaderboard.find(p => p.name === gameState.playerName);
        if (!existingPlayer || existingPlayer.moves > gameState.moves) {
            gameState.leaderboard = gameState.leaderboard.filter(p => p.name !== gameState.playerName);
            gameState.leaderboard.push(newScore);
            gameState.leaderboard.sort((a, b) => a.moves - b.moves);
        }

        localStorage.setItem('memoryGameLeaderboard', JSON.stringify(gameState.leaderboard));
        this.updateLeaderboard();

        // Show continue dialog
        elements.resultMessage.innerHTML = `Congratulations!<br>You completed in ${gameState.moves} moves!`;
        elements.continueDialog.classList.remove('hidden');
        elements.continueDialog.classList.add('flex');
    },

    continuePlaying() {
        elements.continueDialog.classList.remove('flex');
        elements.continueDialog.classList.add('hidden');
        this.resetGame();
        this.createBoard();
    },

    startNewGame() {
        window.location.href = '../index.html';
    },

    updateLeaderboard() {
        if (!elements.leaderboardBody) return;
        
        const topTenPlayers = gameState.leaderboard.slice(0, 10);
        
        elements.leaderboardBody.innerHTML = topTenPlayers
            .map((player, index) => `
                <tr class="border-b border-blue-900 ${player.name === gameState.playerName ? 'bg-blue-900/20' : ''}">
                    <td class="py-2 text-center font-bold">#${index + 1}</td>
                    <td class="py-2 text-center">${player.name}</td>
                    <td class="py-2 text-center font-bold">${player.moves}</td>
                </tr>
            `).join('');
    },

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
};

// Initialize the game
gameLogic.init();