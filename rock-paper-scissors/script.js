// Game state
const gameState = {
    target: 3,
    humanScore: 0,
    computerScore: 0,
    ties: 0,
    gameOver: false,
    gameHistory: []
};

// DOM elements
const elements = {
    humanScore: document.getElementById('humanScore'),
    computerScore: document.getElementById('computerScore'),
    ties: document.getElementById('ties'),
    status: document.getElementById('status'),
    logList: document.getElementById('logList'),
    target: document.getElementById('target'),
    resetBtn: document.getElementById('reset'),
    copyBtn: document.getElementById('copyBtn'),
    choiceBtns: document.querySelectorAll('.choice-btn')
};

// Game logic functions
function getRandomChoice() {
    const choices = ['rock', 'paper', 'scissors'];
    return choices[Math.floor(Math.random() * 3)];
}

function determineWinner(humanChoice, computerChoice) {
    if (humanChoice === computerChoice) {
        return 'tie';
    }
    
    const winConditions = {
        rock: 'scissors',
        paper: 'rock',
        scissors: 'paper'
    };
    
    return winConditions[humanChoice] === computerChoice ? 'win' : 'lose';
}

function updateScoreboard() {
    elements.humanScore.textContent = gameState.humanScore;
    elements.computerScore.textContent = gameState.computerScore;
    elements.ties.textContent = gameState.ties;
}

function updateStatus(message, type = '') {
    elements.status.textContent = message;
    elements.status.className = 'status' + (type ? ' ' + type : '');
}

function addToLog(round, humanChoice, computerChoice, result) {
    const logItem = document.createElement('li');
    logItem.className = result;
    
    const resultEmoji = {
        win: '✅',
        lose: '❌',
        tie: '🤝'
    };
    
    logItem.innerHTML = `
        <strong>Round ${round}:</strong> ${resultEmoji[result]} 
        You: ${humanChoice} vs Computer: ${computerChoice} 
        → <strong>${result.toUpperCase()}</strong>
    `;
    
    elements.logList.prepend(logItem);
}

function checkGameOver() {
    if (gameState.humanScore >= gameState.target || gameState.computerScore >= gameState.target) {
        gameState.gameOver = true;
        const humanWins = gameState.humanScore > gameState.computerScore;
        
        if (humanWins) {
            updateStatus('🎉 Congratulations! You won the match!', 'win');
        } else {
            updateStatus('💻 Computer wins the match! Better luck next time!', 'lose');
        }
        
        toggleGameInputs(true);
    }
}

function toggleGameInputs(disabled) {
    elements.choiceBtns.forEach(btn => {
        btn.disabled = disabled;
    });
    elements.target.disabled = disabled;
}

function playRound(humanChoice) {
    if (gameState.gameOver) return;
    
    const computerChoice = getRandomChoice();
    const result = determineWinner(humanChoice, computerChoice);
    
    // Update scores
    if (result === 'win') {
        gameState.humanScore++;
    } else if (result === 'lose') {
        gameState.computerScore++;
    } else {
        gameState.ties++;
    }
    
    // Add to history
    const round = gameState.gameHistory.length + 1;
    gameState.gameHistory.push({
        round,
        human: humanChoice,
        computer: computerChoice,
        result
    });
    
    // Update UI
    updateScoreboard();
    addToLog(round, humanChoice, computerChoice, result);
    
    // Update status message
    const statusMessages = {
        win: 'Great! You won this round! 🎉',
        lose: 'Computer won this round. Keep trying! 💪',
        tie: 'It\'s a tie! Same choice! 🤝'
    };
    
    updateStatus(statusMessages[result], result);
    
    // Check if game is over
    checkGameOver();
}

function resetGame() {
    gameState.humanScore = 0;
    gameState.computerScore = 0;
    gameState.ties = 0;
    gameState.gameOver = false;
    gameState.gameHistory = [];
    
    updateScoreboard();
    elements.logList.innerHTML = '';
    updateStatus(`First to ${gameState.target} wins. Good luck!`);
    toggleGameInputs(false);
}

async function copyGameSummary() {
    const summary = [
        `Rock Paper Scissors - Game Summary`,
        `Target: First to ${gameState.target} wins`,
        `Final Score: You ${gameState.humanScore} - ${gameState.computerScore} Computer (${gameState.ties} ties)`,
        '',
        'Round Details:'
    ];
    
    gameState.gameHistory.forEach(round => {
        summary.push(
            `Round ${round.round}: You chose ${round.human}, Computer chose ${round.computer} → ${round.result.toUpperCase()}`
        );
    });
    
    const summaryText = summary.join('\n');
    
    try {
        await navigator.clipboard.writeText(summaryText);
        updateStatus('📋 Game summary copied to clipboard!', 'tie');
        setTimeout(() => {
            if (!gameState.gameOver) {
                updateStatus(`First to ${gameState.target} wins. Good luck!`);
            }
        }, 2000);
    } catch (error) {
        updateStatus('❌ Could not copy summary. Try again later.', 'lose');
        console.error('Copy failed:', error);
    }
}

// Event listeners
function initEventListeners() {
    // Choice buttons
    elements.choiceBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            playRound(btn.dataset.choice);
        });
    });
    
    // Target selector
    elements.target.addEventListener('change', (e) => {
        gameState.target = parseInt(e.target.value);
        resetGame();
    });
    
    // Reset button
    elements.resetBtn.addEventListener('click', resetGame);
    
    // Copy button
    elements.copyBtn.addEventListener('click', copyGameSummary);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (gameState.gameOver) return;
        
        const key = e.key.toLowerCase();
        const keyMap = {
            'r': 'rock',
            'p': 'paper',
            's': 'scissors'
        };
        
        if (keyMap[key]) {
            playRound(keyMap[key]);
        }
    });
}

// Initialize game
function init() {
    initEventListeners();
    resetGame();
}

// Start the game when page loads
document.addEventListener('DOMContentLoaded', init);