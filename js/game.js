'use strict'

const MINE = '💣';
const FLAG = '🚩';
const NORMAL = '😃'
const LOSE = '🤯'
const WIN = '😎'


var gBoard;
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    MineCount: 0,
    secsPassed: 0,
    life: 3
}
var gSeconds = 0;
var gMins = 0;
var gTimerInterval;
var gMineCount = 0;
var elSmiley = document.querySelector('.smiley')
var gBoardI;
var gBoardJ;
var gHintRemain = 3;
var gIsHintActive = false;
var gSafeRemain = 3;
var gIsSafeActive = false;
var g7Boom = false;
var g7BoomCounter = null
var undoArr = [];
var undoPos = [];

function init() {
    elSmiley.innerText = NORMAL;

}

function createMineField(i, j, mineCount) {
    if (gGame.isOn) return
    gBoardI = i;
    gBoardJ = j;
    gBoard = createMat(i, j);
    renderMat(gBoard, 'tbody');
    gMineCount = mineCount;
}

function restart() {
    closeModal();
    gGame.isOn = false;
    // gGame.isOn = true;
    gGame.life = 3;
    document.querySelector('.life').innerText = 'life: 3';
    gGame.secsPassed = 0;
    gGame.shownCount = 0;
    gGame.MineCount = 0;
    gGame.markedCount = 0
    elSmiley.innerText = NORMAL;
    gBoard = createMat(gBoardI, gBoardJ);
    renderMat(gBoard, 'tbody');
    clearInterval(gTimerInterval);
    gSeconds = 0;
    gMins = 0;
    document.getElementById('seconds').innerText = 0;
    document.getElementById('mins').innerText = 0;
    gHintRemain = 3
    document.querySelector('.hint').innerText = gHintRemain + ' hints';
    gIsHintActive = false;
    gSafeRemain = 3
    document.querySelector('.safe').innerText = gHintRemain + ' safe clicks';
    g7Boom = false;
    g7BoomCounter = '';
    undoPos = [];
    undoArr = [];

}

function firstClick(i, j) {
    for (var i = 0; i < gMineCount; i++) {
        var currRandPos = getRandomEmpty(i, j);
        // console.log(currRandPos.i, currRandPos.j);
        gBoard[currRandPos.i][currRandPos.j].isMine = true
        gGame.MineCount++;
    }
    setMinesNegsCount(gBoard);
}

function getRandomEmpty(clickI = true, clickJ = true) {
    var empty = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (!gBoard[i][j].isMine && (i !== clickI && j !== clickJ) && !gBoard[i][j].isShown) empty.push({ i: i, j: j })
        }
    }
    return empty[getRandomIntInclusive(0, empty.length - 1)]
}

function cellClicked(elCell, i, j) {
    //7 boom special case
    if (g7Boom) {
        gTimerInterval = setInterval(startTimer, 1000);
        gGame.isOn = true;
        g7Boom = false;
        gBoard[i][j].isShown = true;
        gGame.shownCount++
        if (gBoard[i][j].isMine) {
            elCell.classList.add('mine')
            elCell.innerText = MINE;
            gGame.life--;
        }
        else {
            elCell.classList.add('shown');
            elCell.innerText = gBoard[i][j].minesAroundCount;
        }
        setMinesNegsCount(gBoard);
        return;
    }
    //first click
    if (gGame.shownCount === 0) {
        gTimerInterval = setInterval(startTimer, 1000);
        gGame.isOn = true
        firstClick(i, j);
    }
    //cant press when lose/win
    if (!gGame.isOn) return
    //cant press on flags
    if (gIsHintActive && !gBoard[i][j].isShown) {
        var hinteds = nextMoveHint({ i: i, j: j });
        gIsHintActive = false
        setTimeout(function () { clearAllHinted(hinteds); }, 1000);
        return
    }
    else if (gBoard[i][j].isMarked) return;
    //cant press on already shown
    else if (elCell.classList.contains('shown')) return
    // if (gBoard[i][j].isShown) return;
    else if (gBoard[i][j].isMine) {
        if (elCell.classList.contains('mine')) return;
        var audio = new Audio('sound/mine.mp3');
        audio.play();
        gGame.life--;
        document.querySelector('.life').innerText = `life: ${gGame.life}`
        elCell.classList.add('mine')
        elCell.innerText = MINE;
        if (gGame.life === 0) {
            elSmiley.innerText = LOSE;
            showAllMines();
            clearInterval(gTimerInterval);
            var audio = new Audio('sound/lose.mp3');
            audio.play();
            gGame.isOn = false;
            document.querySelector('.model_content').innerText = 'You Lose';
            openModal();
        }
        undoArr.push(gBoard);
        undoPos.push({ i: i, j: j });
        return
    }
    gBoard[i][j].isShown = true;
    elCell.classList.add('shown');
    elCell.innerText = gBoard[i][j].minesAroundCount;
    if (gBoard[i][j].minesAroundCount === 0) {
        showAllAround0({ i: i, j: j })
        elCell.innerText = '';
    }
    gGame.shownCount++;
    checkGameOver();
    undoArr.push(gBoard);
    undoPos.push({ i: i, j: j });
}


function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (!board[i][j].isMine) {
                board[i][j].minesAroundCount = countMinesAround(i, j)
            }
        }
    }
}

function flag(elCell, i, j) {
    //cant press when lose/win
    if (!gGame.isOn) return
    //cant flag shown
    if (gBoard[i][j].isShown) return
    //unmark flag
    if (gBoard[i][j].isMarked) {
        //model
        gBoard[i][j].isMarked = false;
        gGame.markedCount--;
        //if you unmark a bomb mae the bomb count ++
        if (gBoard[i][j].isMine) gGame.MineCount++;
        //dom
        elCell.innerText = ' ';
    }
    //mark flag
    else {
        //model
        gBoard[i][j].isMarked = true;
        gGame.markedCount++;
        //if you marked bomb make the bomb count -- and check if won
        if (gBoard[i][j].isMine) {
            gGame.MineCount--;
            checkGameOver();
        }
        //dom
        elCell.innerText = FLAG;
    }
}

function checkGameOver() {
    if (gGame.MineCount === 0 && gGame.shownCount === (gBoard.length * gBoard[0].length - gMineCount)) {
        clearInterval(gTimerInterval);
        var audio = new Audio('sound/win.mp3');
        audio.play();
        gGame.isOn = false;
        elSmiley.innerText = WIN;
        document.querySelector('.model_content').innerText = 'You win'
        openModal();
    }
}

function showAllMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].isMine) {
                var currMine = document.querySelector(`.cell${i}${j}`);
                currMine.classList.add('mine')
                currMine.innerText = MINE;
            }
        }
    }
}

function hint(elBtn) {
    if (gIsHintActive || gHintRemain <= 0 || !gGame.isOn) return;
    gHintRemain--;
    gIsHintActive = true;
    elBtn.innerText = `${gHintRemain} hints`
    elBtn.classList.toggle('hinted')

}

function nextMoveHint(pos) {
    var revaled = [];
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue;
            if (gBoard[i][j].isShown) continue;
            if (gBoard[i][j].isMarked) continue;
            revaled.push({ i: i, j: j });
            gBoard[i][j].isShown = true;
            var currCell = document.querySelector(`.cell${i}${j}`);
            currCell.classList.add('hint-active');
            if (gBoard[i][j].isMine) currCell.innerText = MINE;
            else currCell.innerText = gBoard[i][j].minesAroundCount;
        }
    }
    return revaled;
}

function clearAllHinted(arr) {
    for (var i = 0; i < arr.length; i++) {
        var cellPos = { i: arr[i].i, j: arr[i].j }
        gBoard[cellPos.i][cellPos.j].isShown = false;
        var elCell = document.querySelector(`.cell${cellPos.i}${cellPos.j}`);
        elCell.classList.remove('hint-active')
        if (gBoard[cellPos.i][cellPos.j]) elCell.innerText = MINE;
        elCell.innerText = '';
    }
    document.querySelector('.hinted').classList.toggle('hinted')
}

function safe(elBtn) {
    if (gIsHintActive || gSafeRemain <= 0 || !gGame.isOn || gSafeRemain === 0) return;
    gSafeRemain--;
    gIsSafeActive = true;
    elBtn.innerText = `${gSafeRemain} safe clicks`
    var randSafe = getRandomEmpty();
    gBoard[randSafe.i][randSafe.j].isShown = true;
    gGame.shownCount++;
    var elCell = document.querySelector(`.cell${randSafe.i}${randSafe.j}`)
    elCell.classList.add('shown')
    elCell.innerText = gBoard[randSafe.i][randSafe.j].minesAroundCount;
    if (gBoard[randSafe.i][randSafe.j].minesAroundCount === 0) elCell.innerText = '';
}

function createMineField7BOOM() {
    if (gGame.isOn) return
    g7Boom = true;
    gMineCount = 14;
    gGame.MineCount = 14
    gBoard = createMat(8, 8);
    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
            if (i === 0 && j === 0) continue;
            if (((i * 8) + j) % 10 === 7 || ((i * 8) + j) % 7 === 0) {
                console.log('i:' + i + 'j:' + j);
                console.log((i * 8) + j);
                // console.log(((i * 8) + j) % 10);
                gBoard[i][j].isMine = true;
            }
        }
    }
    renderMat(gBoard, 'tbody');
}
function undo() {
    if (!gGame.isOn) return;
    // if (undoArr.length === 1) undoArr = [], undoPos = [];
    if (undoArr.length > 1) {
        gBoard = undoArr.pop();
        var lastBoard = undo[undo.length - 1];
        var currPos = undoPos.pop();
        if (gBoard[currPos.i][currPos.j].isShown) {
            //model
            gBoard[currPos.i][currPos.j].isShown = false;
            gGame.shownCount--;
            //dom
            var shown = document.querySelector(`.cell${currPos.i}${currPos.j}`);
            shown.classList.remove('shown');
            shown.innerText = '';

        }
        if (gBoard[currPos.i][currPos.j].isMine) {
            gGame.life++;
            // gGame.MineCount--;
            var mine = document.querySelector(`.cell${currPos.i}${currPos.j}`);
            mine.classList.remove('mine');
            mine.innerText = '';
            // shown.innerText = gBoard[i][j].minesAroundCount;
        }
        //renderMat(gBoard, 'tbody');
        // for (var i = 0; i < gBoard.length; i++) {
        //     for (var j = 0; j < gBoard[0].length; j++) {
        //         // if (gBoard[i][j].isMine) document.querySelector(`.cell${i}${j}`).classList.add('mine');
        //         if (gBoard[i][j].isShown && !lastBoard[i][j].isShown) {
        //             var shown = document.querySelector(`.cell${i}${j}`)
        //             shown.classList.remove('shown');
        //             shown.innerText = gBoard[i][j].minesAroundCount;
        //             shown.innerText = '';
        //         }
        //         else if (gBoard[i][j].isMarked) document.querySelector(`.cell${i}${j}`).innerText = FLAG;
        //         // if (gBoard[i][j].isMine) document.querySelector(`.cell${i}${j}`).classList.add('mine')
        //     }
        // }

    }
}


