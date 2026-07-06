let playerScore = 0;
let computerScore = 0;

const playerScoreDisplay = document.getElementById('player-score-display');
const computerScoreDisplay = document.getElementById('computer-score-display');
const statusMessage = document.getElementById('status-message');
const choices = document.querySelectorAll('.choice-btn');
const resetBtn = document.getElementById('reset-btn');

function getComputerChoice() {
  const options = ['rock', 'paper', 'scissors'];
  const randomIndex = Math.floor(Math.random() * options.length);
  return options[randomIndex];
}

function playRound(playerSelection) {
  const computerSelection = getComputerChoice();
  
  if (playerSelection === computerSelection) {
    statusMessage.textContent = `It's a tie! Both chose ${playerSelection}.`;
    statusMessage.style.color = 'var(--warning)';
    return;
  }
  
  const hasPlayerWon = 
    (playerSelection === 'rock' && computerSelection === 'scissors') ||
    (playerSelection === 'paper' && computerSelection === 'rock') ||
    (playerSelection === 'scissors' && computerSelection === 'paper');

  if (hasPlayerWon) {
    playerScore++;
    playerScoreDisplay.textContent = playerScore;
    statusMessage.textContent = `You win! ${playerSelection} beats ${computerSelection}.`;
    statusMessage.style.color = 'var(--success)';
  } else {
    computerScore++;
    computerScoreDisplay.textContent = computerScore;
    statusMessage.textContent = `You lose! ${computerSelection} beats ${playerSelection}.`;
    statusMessage.style.color = 'var(--danger)';
  }
}

choices.forEach(button => {
  button.addEventListener('click', () => {
    const playerSelection = button.id;
    playRound(playerSelection);
  });
});

resetBtn.addEventListener('click', () => {
  playerScore = 0;
  computerScore = 0;
  playerScoreDisplay.textContent = '0';
  computerScoreDisplay.textContent = '0';
  statusMessage.textContent = 'Choose your weapon!';
  statusMessage.style.color = 'var(--text-main)';
});
