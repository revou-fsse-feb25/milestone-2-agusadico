// Game state
const gameState = {
    playerName: '',
    playerScore: 0,
    computerScore: 0,
    choices: ['rock', 'paper', 'scissors'],
    computerLastChoice: null,
    leaderboard: JSON.parse(localStorage.getItem('rpsLeaderboard')) || []
};

// DOM Elements
const elements = {
    registration: document.getElementById('registration'),
    nicknameInput: document.getElementById('nickname'),
    startButton: document.getElementById('startGame'),
    playerName: document.getElementById('playerName'),
    playerScore: document.getElementById('playerScore'),
    computerScore: document.getElementById('computerScore'),
    result: document.getElementById('result'),
    choiceButtons: document.querySelectorAll('.choice-btn'),
    leaderboardBody: document.getElementById('leaderboardBody')
};

// Add continuation dialog HTML
    document.body.insertAdjacentHTML('beforeend', `
        <div id="continueDialog" class="fixed inset-0 bg-black/90 flex items-center justify-center z-50 hidden">
            <div class="bg-cyan-500 border-4 border-blue-900 shadow-[8px_8px_0px_0px_rgba(30,58,138,1)] p-12 rounded-lg max-w-2xl w-full mx-4">
                <div id="resultMessage" class="text-2xl font-bold mb-16 text-center leading-relaxed"></div>
                <h2 class="text-2xl font-bold mb-8 text-center">Would you like to continue?</h2>
                <div class="flex gap-8 px-8">
                    <button id="continuePlaying" class="flex-1 bg-orange-500 hover:-translate-y-1 hover:translate-x-1 px-8 py-4 rounded-md text-xl text-white font-bold transition-transform relative border-4 border-blue-900 shadow-[4px_4px_0px_0px_rgba(30,58,138,1)] hover:shadow-none">Continue</button>
                    <button id="newGame" class="flex-1 bg-green-500 hover:-translate-y-1 hover:translate-x-1 px-8 py-4 rounded-md text-xl text-white font-bold transition-transform relative border-4 border-blue-900 shadow-[4px_4px_0px_0px_rgba(30,58,138,1)] hover:shadow-none">New Game</button>
                </div>
            </div>
        </div>
    `);

// Add resultMessage to elements
elements.resultMessage = document.getElementById('resultMessage');

// Add new element reference
elements.continueDialog = document.getElementById('continueDialog');
elements.continuePlaying = document.getElementById('continuePlaying');
elements.newGame = document.getElementById('newGame');

// Update game logic
const gameLogic = {
    // Initialize the game
    init() {
        this.bindEvents();
        this.updateLeaderboard();
    },

    // Bind event listeners
    bindEvents() {
        elements.startButton.addEventListener('click', () => this.startGame());
        elements.choiceButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleChoice(e.currentTarget.dataset.choice));
        });
        elements.continuePlaying.addEventListener('click', () => this.continuePlaying());
        elements.newGame.addEventListener('click', () => this.startNewGame());
    },

    // Add continuation methods
    showContinueDialog() {
        elements.continueDialog.classList.remove('hidden');
    },

    continuePlaying() {
        elements.continueDialog.classList.add('hidden');
    },

    startNewGame() {
        window.location.href = '../index.html';
    },

    // Update handleChoice method
    handleChoice(playerChoice) {
        const computerChoice = this.getComputerChoice();
        const result = this.determineWinner(playerChoice, computerChoice);
        this.updateScore(result);
        this.displayResult(playerChoice, computerChoice, result);
        this.updateLeaderboard();
        
        // Reset computer's choice after displaying result
        setTimeout(() => {
            gameState.computerLastChoice = null;
            this.showContinueDialog();
        }, 1000);
    },

    // Get computer's choice
    getComputerChoice() {
        if (!gameState.computerLastChoice) {
            gameState.computerLastChoice = gameState.choices[Math.floor(Math.random() * gameState.choices.length)];
        }
        const choice = gameState.computerLastChoice;
        console.log('Computer actual choice:', choice);
        return choice;
    },

    // Start the game
    startGame() {
        const nickname = elements.nicknameInput.value.trim();
        if (nickname) {
            gameState.playerName = nickname;
            elements.playerName.textContent = nickname;
            elements.registration.style.display = 'none';
        } else {
            // Create custom alert dialog
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

    // Determine the winner
    determineWinner(playerChoice, computerChoice) {
        if (playerChoice === computerChoice) return 'tie';
        
        switch (playerChoice) {
            case 'rock':
                return computerChoice === 'scissors' ? 'win' : 'lose';
            case 'paper':
                return computerChoice === 'rock' ? 'win' : 'lose';
            case 'scissors':
                return computerChoice === 'paper' ? 'win' : 'lose';
        }
    },

    // Update the score
    updateScore(result) {
        switch (result) {
            case 'win':
                gameState.playerScore++;
                elements.playerScore.textContent = gameState.playerScore;
                break;
            case 'lose':
                gameState.computerScore++;
                elements.computerScore.textContent = gameState.computerScore;
                break;
        }
        
        this.updateLocalStorage();
    },

    // Display the result
    displayResult(playerChoice, computerChoice, result) {
        const resultText = {
            win: 'You win! 🎉',
            lose: 'Computer wins! 😢',
            tie: "It's a tie! 🤝"
        };

        const choiceLabel = choice => `<span class="inline-block px-4 py-2 mx-2 bg-cyan-500 text-white rounded-md border-4 border-blue-900 shadow-[4px_4px_0px_0px_rgba(30,58,138,1)] font-bold uppercase transform -rotate-2 hover:rotate-0 transition-transform">${choice}</span>`;
        
        const message = `<div class="flex items-center justify-center gap-2 flex-wrap"><span class="text-xl">You chose</span> ${choiceLabel(playerChoice)} <span class="text-xl">vs Computer's</span> ${choiceLabel(computerChoice)} <span class="text-3xl font-bold ml-2">${resultText[result]}</span></div>`;
        elements.result.innerHTML = message;
        elements.resultMessage.innerHTML = message;
    },

    // Update leaderboard
    updateLeaderboard() {
        // Update leaderboard data
        const playerIndex = gameState.leaderboard.findIndex(p => p.name === gameState.playerName);
        if (playerIndex >= 0) {
            gameState.leaderboard[playerIndex].score = gameState.playerScore;
        } else if (gameState.playerName) {
            gameState.leaderboard.push({
                name: gameState.playerName,
                score: gameState.playerScore
            });
        }

        // Sort and limit to top 10
        gameState.leaderboard.sort((a, b) => b.score - a.score);
        gameState.leaderboard = gameState.leaderboard.slice(0, 10);

        // Update DOM
        elements.leaderboardBody.innerHTML = gameState.leaderboard
            .map((player, index) => `
                <tr class="border-b border-gray-700">
                    <td class="py-2 text-center">#${index + 1}</td>
                    <td class="py-2 text-center">${player.name}</td>
                    <td class="py-2 text-center">${player.score}</td>
                </tr>
            `).join('');

        this.updateLocalStorage();
    },

    // Update localStorage
    updateLocalStorage() {
        localStorage.setItem('rpsLeaderboard', JSON.stringify(gameState.leaderboard));
    }
};

// Initialize the game
gameLogic.init();