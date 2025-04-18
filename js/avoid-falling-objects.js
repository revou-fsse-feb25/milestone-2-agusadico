// Game state
const gameState = {
    playerName: '',
    score: 0,
    isPlaying: false,
    gameLoop: null,
    objects: [],
    playerPosition: 10,
    difficulty: 1,
    spawnRate: 1000,
    objectSpeed: 2,
    leaderboard: JSON.parse(localStorage.getItem('fallingObjectsLeaderboard')) || [],
    objectTypes: [
        { image: 'rocks.png', speed: 1, points: -1 },    // Regular bomb
        { image: 'barrel.png', speed: 1.5, points: -1 }, // Faster bomb
        { image: 'anchor-ship.png', speed: 2, points: -1 },   // Fastest bomb
        { image: 'bonus-coin.png', speed: 1.2, points: 100 } // Bonus star
    ]
};

// DOM Elements
const elements = {
    registration: document.getElementById('registration'),
    nicknameInput: document.getElementById('nickname'),
    startButton: document.getElementById('startGame'),
    playerName: document.getElementById('playerName'),
    score: document.getElementById('score'),
    gameArea: document.getElementById('gameArea'),
    player: document.getElementById('player'),
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
        this.setupKeyboardControls();
        this.setupTouchControls();
        this.setupResponsiveLayout();
    },

    setupTouchControls() {
        elements.gameArea.addEventListener('touchstart', (e) => {
            if (!gameState.isPlaying) return;
            gameState.isTouching = true;
            gameState.touchStartX = e.touches[0].clientX;
        });

        elements.gameArea.addEventListener('touchmove', (e) => {
            if (!gameState.isPlaying || !gameState.isTouching) return;
            e.preventDefault();
            
            const touchX = e.touches[0].clientX;
            const diffX = touchX - gameState.touchStartX;
            
            if (Math.abs(diffX) > 10) {
                this.movePlayer(diffX > 0 ? 'right' : 'left');
                gameState.touchStartX = touchX;
            }
        });

        elements.gameArea.addEventListener('touchend', () => {
            gameState.isTouching = false;
        });
    },

    setupResponsiveLayout() {
        const updateLayout = () => {
            const isMobile = window.innerWidth < 768;
            const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
            
            // Adjust game area size
            if (isMobile) {
                elements.gameArea.style.height = '350px';
                elements.player.classList.remove('w-16', 'h-16', 'w-24', 'h-24');
                elements.player.classList.add('w-14', 'h-14');
            } else if (isTablet) {
                elements.gameArea.style.height = '400px';
                elements.player.classList.remove('w-14', 'h-14', 'w-24', 'h-24');
                elements.player.classList.add('w-16', 'h-16');
            } else {
                elements.gameArea.style.height = '480px';
                elements.player.classList.remove('w-14', 'h-14', 'w-16', 'h-16');
                elements.player.classList.add('w-24', 'h-24');
            }

            // Adjust falling objects size - same size for all objects
            const objectSize = isMobile ? 'w-10 h-10' : isTablet ? 'w-16 h-16' : 'w-32 h-32';
            document.querySelectorAll('.falling-object').forEach(obj => {
                obj.classList.remove('w-6', 'h-6', 'w-8', 'h-8', 'w-10', 'h-10', 'w-12', 'h-12', 
                    'w-14', 'h-14', 'w-16', 'h-16', 'w-20', 'h-20', 'w-24', 'h-24', 'w-32', 'h-32',
                    'w-40', 'h-40', 'w-48', 'h-48');
                obj.classList.add(...objectSize.split(' '));
            });
        };

        // Update layout on init and window resize
        updateLayout();
        window.addEventListener('resize', updateLayout);
    },

    spawnObject() {
        const object = document.createElement('div');
        const isMobile = window.innerWidth < 768;
        const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
        
        // Select random object type based on difficulty
        const objectTypeIndex = Math.floor(Math.random() * (gameState.difficulty + 1));
        const objectType = gameState.objectTypes[Math.min(objectTypeIndex, gameState.objectTypes.length - 1)];
        
        const objectSize = isMobile ? 'w-10 h-10' : isTablet ? 'w-16 h-16' : 'w-32 h-32';
        object.className = `falling-object absolute ${objectSize}`;
        object.style.left = `${Math.random() * (elements.gameArea.offsetWidth - 128)}px`;
        object.style.top = '-128px';
        
        const img = document.createElement('img');
        img.src = `../images/avoid-falling-object/${objectType.image}`;
        img.className = 'w-full h-full';
        object.appendChild(img);
        
        elements.gameArea.appendChild(object);
        gameState.objects.push({
            element: object,
            speed: gameState.objectSpeed * objectType.speed * (1 + Math.random() * 0.5),
            points: objectType.points
        });
    },

    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            if (!gameState.isPlaying) return;

            switch(e.key) {
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    this.movePlayer('left');
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    this.movePlayer('right');
                    break;
            }
        });
    },

    movePlayer(direction) {
        const step = window.innerWidth < 768 ? 8 : 5; // Faster movement on mobile
        const playerWidth = elements.player.offsetWidth;
        const gameWidth = elements.gameArea.offsetWidth;
        
        if (direction === 'left') {
            gameState.playerPosition = Math.max(0, gameState.playerPosition - step);
        } else {
            gameState.playerPosition = Math.min(100, gameState.playerPosition + step);
        }

        // Update player position immediately
        const maxPosition = gameWidth - playerWidth;
        const actualPosition = (gameState.playerPosition / 100) * maxPosition;
        requestAnimationFrame(() => {
            elements.player.style.left = `${actualPosition}px`;
        });
    },  // Added missing comma here

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
            gameState.touchStartX = null;
            gameState.isTouching = false;
            elements.playerName.textContent = nickname;
            elements.registration.style.display = 'none';
            elements.gameArea.style.display = 'block'; // Ensure game area is visible
            this.resetGame();
            this.setupResponsiveLayout(); // Ensure layout is set before starting
            this.startGameLoop();
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
        gameState.isPlaying = true;
        gameState.objects = [];
        gameState.difficulty = 1;
        gameState.spawnRate = 1000;
        gameState.objectSpeed = 2;
        elements.score.textContent = '0';
        elements.gameArea.querySelectorAll('.falling-object').forEach(obj => obj.remove());
    },

    startGameLoop() {
        if (gameState.gameLoop) clearInterval(gameState.gameLoop);
        
        let lastSpawn = 0;
        const gameLoop = () => {
            if (!gameState.isPlaying) return;

            const now = Date.now();
            if (now - lastSpawn > gameState.spawnRate) {
                this.spawnObject();
                lastSpawn = now;
            }

            this.updateObjects();
            this.increaseDifficulty();
            gameState.score++;
            elements.score.textContent = gameState.score;

            requestAnimationFrame(gameLoop);
        };

        requestAnimationFrame(gameLoop);
    },

    // Remove the duplicate spawnObject method at the bottom of the file
    // and keep only this one
    spawnObject() {
        const object = document.createElement('div');
        const isMobile = window.innerWidth < 768;
        const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
        const objectSize = isMobile ? 'w-10 h-10' : isTablet ? 'w-16 h-16' : 'w-32 h-32';
        object.className = `falling-object absolute ${objectSize}`;
        object.style.left = `${Math.random() * (elements.gameArea.offsetWidth - 96)}px`;
        object.style.top = '-96px';
        
        // Select random object type based on difficulty
        const objectTypeIndex = Math.floor(Math.random() * (gameState.difficulty + 1));
        const objectType = gameState.objectTypes[Math.min(objectTypeIndex, gameState.objectTypes.length - 1)];
        
        const img = document.createElement('img');
        img.src = `../images/avoid-falling-object/${objectType.image}`;
        img.className = 'w-full h-full';
        object.appendChild(img);
        
        elements.gameArea.appendChild(object);
        gameState.objects.push({
            element: object,
            speed: gameState.objectSpeed * objectType.speed * (1 + Math.random() * 0.5),
            points: objectType.points
        });
    },

    updateObjects() {
        const playerRect = elements.player.getBoundingClientRect();
        const gameAreaRect = elements.gameArea.getBoundingClientRect();
        
        gameState.objects = gameState.objects.filter(obj => {
            const objRect = obj.element.getBoundingClientRect();
            const relativeTop = objRect.top - gameAreaRect.top;
            obj.element.style.top = `${relativeTop + obj.speed}px`;

            const adjustedPlayerRect = {
                left: playerRect.left - gameAreaRect.left,
                right: playerRect.right - gameAreaRect.left,
                top: playerRect.top - gameAreaRect.top,
                bottom: playerRect.bottom - gameAreaRect.top
            };

            const adjustedObjRect = {
                left: objRect.left - gameAreaRect.left,
                right: objRect.right - gameAreaRect.left,
                top: relativeTop,
                bottom: relativeTop + objRect.height
            };

            if (this.checkCollision(adjustedPlayerRect, adjustedObjRect)) {
                obj.element.remove();
                if (obj.points < 0) {
                    this.endGame();
                } else {
                    gameState.score += obj.points;
                    elements.score.textContent = gameState.score;
                    this.showBonusText(objRect.left - gameAreaRect.left, objRect.top - gameAreaRect.top);
                }
                return false;
            }

            if (relativeTop > elements.gameArea.offsetHeight) {
                obj.element.remove();
                return false;
            }

            return true;
        });
    },

    // Add this new method
    showBonusText(x, y) {
        const bonusText = document.createElement('div');
        bonusText.className = 'absolute text-yellow-300 font-bold text-2xl pointer-events-none';
        bonusText.style.left = `${x}px`;
        bonusText.style.top = `${y}px`;
        bonusText.textContent = '+100 points';
        elements.gameArea.appendChild(bonusText);

        // Animate the text floating up and fading out
        bonusText.animate([
            { transform: 'translateY(0)', opacity: 1 },
            { transform: 'translateY(-50px)', opacity: 0 }
        ], {
            duration: 1000,
            easing: 'ease-out'
        }).onfinish = () => bonusText.remove();
    },

    checkCollision(rect1, rect2) {
        return !(rect1.right < rect2.left || 
                rect1.left > rect2.right || 
                rect1.bottom < rect2.top || 
                rect1.top > rect2.bottom);
    },

    increaseDifficulty() {
        const newDifficulty = Math.floor(gameState.score / 500) + 1;
        if (newDifficulty > gameState.difficulty) {
            gameState.difficulty = newDifficulty;
            gameState.spawnRate = Math.max(200, 1000 - (newDifficulty * 100));
            gameState.objectSpeed = Math.min(10, 2 + (newDifficulty * 0.5));
        }
    },

    endGame() {
        gameState.isPlaying = false;

        // Update leaderboard
        const newScore = {
            name: gameState.playerName,
            score: gameState.score
        };

        const existingPlayer = gameState.leaderboard.find(p => p.name === gameState.playerName);
        if (!existingPlayer || existingPlayer.score < gameState.score) {
            gameState.leaderboard = gameState.leaderboard.filter(p => p.name !== gameState.playerName);
            gameState.leaderboard.push(newScore);
            gameState.leaderboard.sort((a, b) => b.score - a.score);
        }

        localStorage.setItem('fallingObjectsLeaderboard', JSON.stringify(gameState.leaderboard));
        this.updateLeaderboard();

        // Show continue dialog
        elements.resultMessage.innerHTML = `Game Over!<br>Final Score: ${gameState.score}`;
        elements.continueDialog.classList.remove('hidden');
        elements.continueDialog.classList.add('flex');
    },

    continuePlaying() {
        elements.continueDialog.classList.remove('flex');
        elements.continueDialog.classList.add('hidden');
        this.resetGame();
        this.startGameLoop();
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
                    <td class="py-2 text-center font-bold">${player.score}</td>
                </tr>
            `).join('');
    }
};

// Initialize the game
gameLogic.init();