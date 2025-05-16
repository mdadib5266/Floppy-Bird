document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    const scoreDisplay = document.getElementById('scoreDisplay');
    const startScreen = document.getElementById('startScreen');
    const gameOverScreen = document.getElementById('gameOverScreen');
    const startButton = document.getElementById('startButton');
    const restartButton = document.getElementById('restartButton');
    const finalScoreDisplay = document.getElementById('finalScore');

    // Game constants
    const BIRD_WIDTH = 34;
    const BIRD_HEIGHT = 24;
    const PIPE_WIDTH = 52;
    const PIPE_GAP = 120; // Space between top and bottom pipe
    const GRAVITY = 0.4;
    const FLAP_STRENGTH = -7;
    const PIPE_SPEED = 2;
    const PIPE_SPAWN_INTERVAL = 1800; // milliseconds

    let birdX, birdY, birdVelocityY;
    let pipes = [];
    let score;
    let frameCount;
    let gameRunning = false;
    let lastPipeSpawnTime = 0;

    // --- Initialization and Reset ---
    function setCanvasDimensions() {
        canvas.width = 320; // Common retro game width
        canvas.height = 480; // Common retro game height
    }

    function resetGame() {
        birdX = 50;
        birdY = canvas.height / 2 - BIRD_HEIGHT / 2;
        birdVelocityY = 0;
        pipes = [];
        score = 0;
        frameCount = 0;
        lastPipeSpawnTime = 0;
        updateScoreDisplay();
    }

    function startGame() {
        resetGame();
        gameRunning = true;
        startScreen.style.display = 'none';
        gameOverScreen.style.display = 'none';
        canvas.focus(); // For keyboard input
        gameLoop();
    }

    // --- Game Objects ---
    function drawBird() {
        ctx.fillStyle = 'yellow'; // Simple bird
        ctx.fillRect(birdX, birdY, BIRD_WIDTH, BIRD_HEIGHT);
        // You could draw an image here:
        // const birdImg = new Image();
        // birdImg.src = 'bird.png';
        // ctx.drawImage(birdImg, birdX, birdY, BIRD_WIDTH, BIRD_HEIGHT);
    }

    function drawPipes() {
        ctx.fillStyle = 'green';
        pipes.forEach(pipe => {
            // Top pipe
            ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
            // Bottom pipe
            ctx.fillRect(pipe.x, pipe.topHeight + PIPE_GAP, PIPE_WIDTH, canvas.height - (pipe.topHeight + PIPE_GAP));
        });
    }

    // --- Game Logic ---
    function updateBird() {
        birdVelocityY += GRAVITY;
        birdY += birdVelocityY;

        // Collision with top/bottom
        if (birdY + BIRD_HEIGHT > canvas.height) { // Hit ground
            birdY = canvas.height - BIRD_HEIGHT;
            birdVelocityY = 0;
            endGame();
        }
        if (birdY < 0) { // Hit ceiling
            birdY = 0;
            birdVelocityY = 0;
            // Some versions allow hitting ceiling, some end game.
            // endGame(); // Optional: end game if bird hits ceiling
        }
    }

    function updatePipes() {
        // Spawn new pipes
        if (Date.now() - lastPipeSpawnTime > PIPE_SPAWN_INTERVAL) {
            const minPipeHeight = 50;
            const maxPipeHeight = canvas.height - PIPE_GAP - minPipeHeight;
            const topHeight = Math.floor(Math.random() * (maxPipeHeight - minPipeHeight + 1)) + minPipeHeight;

            pipes.push({
                x: canvas.width,
                topHeight: topHeight,
                passed: false
            });
            lastPipeSpawnTime = Date.now();
        }

        // Move pipes and remove off-screen ones
        for (let i = pipes.length - 1; i >= 0; i--) {
            pipes[i].x -= PIPE_SPEED;

            // Scoring
            if (!pipes[i].passed && pipes[i].x + PIPE_WIDTH < birdX) {
                score++;
                pipes[i].passed = true;
                updateScoreDisplay();
                // console.log("Score:", score); // For debugging
            }

            if (pipes[i].x + PIPE_WIDTH < 0) {
                pipes.splice(i, 1);
            }
        }
    }

    function checkCollisions() {
        // Bird vs Pipes
        for (let pipe of pipes) {
            if (
                birdX < pipe.x + PIPE_WIDTH &&
                birdX + BIRD_WIDTH > pipe.x &&
                (birdY < pipe.topHeight || birdY + BIRD_HEIGHT > pipe.topHeight + PIPE_GAP)
            ) {
                endGame();
                return;
            }
        }
    }

    function flap() {
        if (gameRunning) {
            birdVelocityY = FLAP_STRENGTH;
        }
    }

    function updateScoreDisplay() {
        scoreDisplay.textContent = `Score: ${score}`;
    }

    function endGame() {
        if (!gameRunning) return; // Prevent multiple calls
        gameRunning = false;
        finalScoreDisplay.textContent = score;
        gameOverScreen.style.display = 'flex';
    }

    // --- Game Loop ---
    function gameLoop() {
        if (!gameRunning) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update game state
        updateBird();
        updatePipes();
        checkCollisions();

        // Draw game objects
        drawPipes();
        drawBird();

        frameCount++;
        requestAnimationFrame(gameLoop);
    }

    // --- Event Listeners ---
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', startGame);

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault(); // Prevent page scrolling
            if (!gameRunning && gameOverScreen.style.display === 'none' && startScreen.style.display === 'flex') {
                // If on start screen, space starts the game
                startGame();
            } else {
                flap();
            }
        }
    });

    canvas.addEventListener('click', () => {
        if (!gameRunning && gameOverScreen.style.display === 'none' && startScreen.style.display === 'flex') {
             // If on start screen, click starts the game
            startGame();
        } else {
            flap();
        }
    });

    // --- Initial Setup ---
    setCanvasDimensions();
    resetGame(); // Set initial positions but don't start loop
    startScreen.style.display = 'flex'; // Show start screen initially
});