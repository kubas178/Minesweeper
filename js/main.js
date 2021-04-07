const board = document.querySelector('.board');
const score = document.querySelector('.score');
const bombs = document.querySelector('.bombs');
const winWindow = document.querySelector('.win-window')
const finalTime = document.querySelector('.win-window .final-time')
const finalScore = document.querySelector('.win-window .final-score')
const startGameBtn = document.querySelector('.start-game');
const title = document.querySelector('h1');
const bombsColors = ['#DC143C', '#FF7F50', '#9400D3', '#FF1493', '#40E0D0', '#FFD700','#00FFFF','#ff9900','#66ff99'];
const darkerBombsColor = ['#ad102f','#d16841','#7102a1','#c70e72','#33b5a8','#e0bd00','#00d1d1','#db8400','#52cc7a'];
let amountOfBombs = 40;
let amountOfFlags = amountOfBombs;
let time = 0;
let flags = 0;
let boardWidth = 15;
let boardHeight = 15;
let cells = [];
let isGameOver = false;
let scoreInterval;


const displayScore = () => {
 scoreInterval = setInterval(() => {
     time++;
     if (time < 10) score.innerHTML = `00${time}`;
     if (time >= 10) score.innerHTML = `0${time}`;
     if (time >= 100) score.innerHTML = `${time}`;
 },1000)
}


startGameBtn.addEventListener('click', () =>{
    bombs.innerHTML = amountOfFlags;
    board.style.display = 'flex';
    generateBoard();
    displayScore();
    startGameBtn.style.display = "none";
    title.style.display = 'none';
})

//generate board

const shuffleArray = array =>{
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

const click = cell => {
    let currentID = cell.id;
    if (isGameOver) return;
    if (cell.classList.contains('checked') || cell.classList.contains('flag')) return;
    if (cell.classList.contains('bomb')) { gameOver(cell); }
    else {
        let bombsAround = cell.getAttribute('bombs');
        if(bombsAround != 0) {
            cell.classList.add('checked');
            switch (bombsAround) {
                case '1':
                    cell.style.color = 'royalblue';
                    break;
                case '2':
                    cell.style.color = 'green';
                    break;
                case '3':
                    cell.style.color = 'red';
                    break;
                case '4':
                    cell.style.color = 'violet';
                    break; 
                 case '5':
                    cell.style.color = 'yellow';
                    break; 
                case '6':
                    cell.style.color = 'teal';
                    break;
                case '7':
                    cell.style.color = 'pink';
                    break; 
                case '8':
                    cell.style.color = 'tomato';
                    break;                       
            }
            cell.innerHTML = bombsAround;
            return;
        }
        checkCell(cell, currentID);
    }
    cell.classList.add('checked');
}

const generateBoard = () => {

const bombsCellsArray = Array(amountOfBombs).fill('bomb');
const emptyCellsArray = Array(boardWidth*boardHeight - amountOfBombs).fill('empty');
const allCellsArray = emptyCellsArray.concat(bombsCellsArray);
const shuffledCellsArray = shuffleArray(allCellsArray);

for (let i = 0; i < boardWidth*boardHeight; i++){
    const cell = document.createElement('div');
    cell.setAttribute('id', i);
    cell.classList.add('cell');
    cell.classList.add(shuffledCellsArray[i]);
    board.appendChild(cell);
    cells.push(cell);
    cell.addEventListener('click', e =>{
        click(cell);
    });

    cell.oncontextmenu = function(e) {
        e.preventDefault();
        addFlag(cell);
    }

    }

for(let i = 0; i < cells.length; i++){
    let bombsAround = 0;
    const isLeftEdge = (i %  boardWidth === 0);
    const isRightEdge = (i % boardWidth === boardWidth - 1);
    //counting bombs around cell
    if (cells[i].classList.contains('empty')) {
        //west from cell
        if ( i > 0 && !isLeftEdge && cells[i-1].classList.contains('bomb')) bombsAround++
        // north-east from cell
        if ( i > boardWidth - 1 && !isRightEdge && cells[i+1 - boardWidth].classList.contains('bomb')) bombsAround++
        //north from cell
        if ( i > boardWidth - 1  && cells[i - boardWidth].classList.contains('bomb')) bombsAround++
        //  north-west from cell
        if ( i > boardWidth - 1 && !isLeftEdge && cells[i - 1 - boardWidth].classList.contains('bomb')) bombsAround++
        // east from cell
        if ( i < cells.length - 1 && !isRightEdge && cells[i+1].classList.contains('bomb')) bombsAround++
        // south form cell
        if ( i < cells.length - boardWidth && cells[i + boardWidth].classList.contains('bomb')) bombsAround++
        // south-west from cell
        if ( i < cells.length - boardWidth && !isLeftEdge && cells[i - 1 + boardWidth].classList.contains('bomb')) bombsAround++
        // south-east from cell
        if ( i < cells.length - boardWidth - 1 && !isRightEdge && cells[i + 1 + boardWidth].classList.contains('bomb')) bombsAround++
        cells[i].setAttribute('bombs', bombsAround);
    }
}
    
}

// generateBoard();

function addFlag(cell) {
    if (isGameOver) return;
    if (!cell.classList.contains('checked') && (flags <= amountOfBombs)) {
        const flagImg = document.createElement('img');
        if (!cell.classList.contains('flag')) {
            amountOfFlags--;
            let audio = new Audio('./audio/place_flag.wav');
            audio.volume = 0.3;
            audio.play();
            bombs.innerHTML = amountOfFlags;
            flagImg.src = './img/flag.svg'
            flagImg.alt = "Flag image"
            cell.appendChild(flagImg)
            cell.classList.add('flag');
            flags++;
        } else {
            const flagNode = cell.childNodes;
            const flag = flagNode[0];
            flag.classList.add('flag-animation');
            let audio = new Audio('./audio/flag_out.wav');
            audio.volume = 0.3;
            audio.play();
            amountOfFlags++;
            bombs.innerHTML = amountOfFlags;
            setTimeout(() => {
            cell.classList.remove('flag');
            flag.classList.remove('flag-animation');
            cell.innerHTML = "";
            },950);
            flags--;
        }
    }
    checkForWin()
}

// recursive algorithm to check neighbours cells 
// if there is no bomb around clicked cell reveal all neighbours
// if revealed cell has no bombs around check all newCell neigbours and so on...

function checkCell(cell, id) {
    const isLeftEdge = (id %  boardWidth === 0);
    const isRightEdge = (id % boardWidth === boardWidth - 1);
    setTimeout(() => {
        if (id > 0 && !isLeftEdge) {
            const newID = cells[parseInt(id) - 1].id;
            const newCell  = document.getElementById(newID);
            click(newCell);
        }
        if ( id > boardWidth - 1  && !isRightEdge){
            const newID = cells[parseInt(id) + 1 - boardWidth].id;
            const newCell  = document.getElementById(newID);
            click(newCell);
        }
        if (id > boardWidth) {
            const newID = cells[parseInt(id - boardWidth)].id;
            const newCell = document.getElementById(newID);
            click(newCell);
          }
          if (id > boardWidth + 1 && !isLeftEdge) {
            const newID = cells[parseInt(id) -1 -boardWidth].id;
            const newCell = document.getElementById(newID);
            click(newCell);
          }
          if (id < cells.length - 2 && !isRightEdge) {
            const newID = cells[parseInt(id) +1].id
            const newCell = document.getElementById(newID);
            click(newCell);
          }
          if (id < cells.length - boardWidth && !isLeftEdge) {
            const newID = cells[parseInt(id) -1 + boardWidth].id;
            const newCell = document.getElementById(newID);
            click(newCell);
          }
          if (id < cells.length - boardWidth - 2 && !isRightEdge) {
            const newID = cells[parseInt(id) +1 +boardWidth].id;
            const newCell = document.getElementById(newID);
            click(newCell);
          }
          if (id < cells.length - boardWidth - 2) {
            const newID = cells[parseInt(id) +boardWidth].id;
            const newCell = document.getElementById(newID);
            click(newCell);
          }
    }, 10);
}

//TODO - remove flag when game is over

function gameOver(cell) {
    console.log('gameOver');
    isGameOver = true;
    if ( cell.classList.contains('bomb')) {
        clearInterval(scoreInterval);
        let audio = new Audio('./audio/bomb.wav');
        audio.volume = 0.3;
        audio.play();
        getRandomColorBomb(cell);
    }
    cells.forEach((cell,i) => {
        setTimeout(() => {
        if ( cell.classList.contains('bomb')){
            // const flag = cell.childNodes;
            // cell.removeChild(flag[0]);
            let audio = new Audio('./audio/bomb.wav');
            audio.volume = 0.3;
            audio.play();
            getRandomColorBomb(cell);
    }}, i*25)
    })
}

function getRandomColorBomb(cell){
    const circle = document.createElement('div');
    cell.appendChild(circle);
    circle.classList.add('bomb-circle')
    const random = Math.floor(Math.random() * 10);
    circle.style.backgroundColor = darkerBombsColor[random];
    cell.style.backgroundColor = bombsColors[random];
}

function checkForWin() {
    let matches = 0;
    for(let cell of cells) {
        if (cell.classList.contains('flag') && cell.classList.contains('bomb')) {
            matches++;
        }
        if (matches === amountOfBombs) {
            board.style.display = 'none';
            winWindow.style.display = 'block';
            const final = 999 - time;
            console.log(finalScore);
            finalScore.innerHTML = final;finalTime.innerHTML = time;
            console.log('YOU WIN');
            isGameOver = true;
        }
    }
}