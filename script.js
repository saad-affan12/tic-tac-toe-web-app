// Tic-Tac-Toe logic with Player vs Player and Player vs Computer (Minimax AI)
// X always starts. Player is X in PvC. Computer is O.
const boardEl = document.getElementById('board');
const cells = Array.from(document.querySelectorAll('.cell'));
const statusEl = document.getElementById('status');
const turnEl = document.getElementById('turn');
const logEl = document.getElementById('log');
const modeSelect = document.getElementById('mode');
const restartBtn = document.getElementById('restart');

let board = Array(9).fill(null);
let currentPlayer = 'X'; // 'X' or 'O'
let gameOver = false;

const winningCombos = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

function render(){
  cells.forEach((cell,i)=>{
    cell.textContent = board[i] || '';
    cell.classList.toggle('disabled', !!board[i] || gameOver);
  });
  turnEl.textContent = currentPlayer;
}

function log(message){
  const li = document.createElement('li');
  li.textContent = message;
  logEl.prepend(li);
  // keep log to 20 items
  while(logEl.children.length>20) logEl.removeChild(logEl.lastChild);
}

function checkWinner(bd){
  for(const combo of winningCombos){
    const [a,b,c] = combo;
    if(bd[a] && bd[a] === bd[b] && bd[a] === bd[c]){
      return bd[a];
    }
  }
  if(bd.every(Boolean)) return 'tie';
  return null;
}

function makeMove(index){
  if(gameOver || board[index]) return false;
  board[index] = currentPlayer;
  const result = checkWinner(board);
  if(result){
    gameOver = true;
    if(result === 'tie'){
      log('Result: Tie');
      statusEl.textContent = 'Result: Tie';
    } else {
      log(`Winner: ${result}`);
      statusEl.textContent = `Winner: ${result}`;
    }
  } else {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    statusEl.textContent = `Turn: ${currentPlayer}`;
    // if PvC and it's computer's turn, trigger AI
    if(modeSelect.value === 'pvc' && currentPlayer === 'O'){
      setTimeout(()=>{
        const aiMove = bestMove(board);
        makeMove(aiMove);
        render();
      }, 300);
    }
  }
  return true;
}

cells.forEach((cell,i)=>{
  cell.addEventListener('click', ()=>{
    if(gameOver) return;
    // If PvC and it's computer's turn, ignore clicks
    if(modeSelect.value === 'pvc' && currentPlayer === 'O') return;
    const moved = makeMove(i);
    if(moved){
      render();
    }
  });
});

function reset(newMode){
  board = Array(9).fill(null);
  currentPlayer = 'X';
  gameOver = false;
  statusEl.textContent = `Turn: ${currentPlayer}`;
  if(newMode){
    log(`Mode changed to ${newMode === 'pvc' ? 'Player vs Computer' : 'Player vs Player'}`);
  } else {
    log('Game reset');
  }
  render();
}

// Minimax AI for optimal play (computer plays as 'O')
function bestMove(bd){
  // if center is free, take it for speed in opening
  if(!bd[4]) return 4;
  let bestScore = Infinity;
  let move = null;
  for(let i=0;i<9;i++){
    if(!bd[i]){
      bd[i] = 'O';
      let score = minimax(bd, 0, false);
      bd[i] = null;
      if(score < bestScore){
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

function minimax(bd, depth, isMaximizing){
  const result = checkWinner(bd);
  if(result !== null){
    if(result === 'X') return 10 - depth;
    if(result === 'O') return -10 + depth;
    if(result === 'tie') return 0;
  }
  if(isMaximizing){
    let best = -Infinity;
    for(let i=0;i<9;i++){
      if(!bd[i]){
        bd[i] = 'X';
        best = Math.max(best, minimax(bd, depth+1, false));
        bd[i] = null;
      }
    }
    return best;
  } else {
    let best = Infinity;
    for(let i=0;i<9;i++){
      if(!bd[i]){
        bd[i] = 'O';
        best = Math.min(best, minimax(bd, depth+1, true));
        bd[i] = null;
      }
    }
    return best;
  }
}

// UI controls
modeSelect.addEventListener('change', ()=>{
  reset(modeSelect.value);
  // if PvC and computer starts? we keep X as player, so X starts
});

restartBtn.addEventListener('click', ()=> reset());

// initial render
render();
