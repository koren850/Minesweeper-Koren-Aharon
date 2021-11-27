
/////////////// ALL KIND OF MAT FUNCTIONS ////////////////////

//creates a simple matrix
function createMat(rowsLength, collsLength) {
    //if you want the cells value to come from an outside array, u need to use a var 
    // counting the idx and increasing it at the end of the loop
    var board = []
    for (var i = 0; i < rowsLength; i++) {
        board[i] = []
        for (var j = 0; j < collsLength; j++) {
            var cell = {
                location: { i: i, j: j },
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
            //enter anything u want the cells to be, including objects
            board[i][j] = cell
        }
    }
    return board
}

//rendering simple matrix, the selector is the class of the div we want to push it in
function renderMat(mat, selector) {
    var strHTML = '';
    for (var i = 0; i < mat.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < mat[0].length; j++) {
            var cellContent = mat[i][j].isShown ? mat[i][j].minesAroundCount : ' ';
            var className = `cell cell${i}-${j}`;
            strHTML += `<td oncontextmenu="flag(this,${i},${j})" onclick="cellClicked(this,${i},${j})" class="${className}"> ${cellContent}</td>`
        }
        strHTML += '</tr>'
    }
    var elContainer = document.querySelector(selector);
    elContainer.innerHTML = strHTML;
}

//counting bombs around curr cell
function countMinesAround(rowIdx, colIdx) {

    var mineCounter = 0
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > gBoard[0].length - 1) continue
            if (i === rowIdx && j === colIdx) continue
            var isMine = gBoard[i][j].isMine;
            // console.log('cell', cell);
            if (isMine) {
                mineCounter++
            }
        }
    }
    return mineCounter
}

function showAllAround0(pos) {
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue;
            if (i === pos.i && j === pos.j) continue;
            if (!gBoard[i][j].isMine) gBoard[i][j].isShown = true;
            var curr0neg = document.querySelector(`.cell${i}-${j}`);
            if (!curr0neg.classList.contains('shown') && !gBoard[i][j].isMine && !gBoard[i][j].isMarked) {
                gGame.shownCount++
                undoArr.push(gBoard);
                undoPos.push({ i: i, j: j });
                curr0neg.classList.add('shown');
                curr0neg.innerText = gBoard[i][j].minesAroundCount;
                if (gBoard[i][j].minesAroundCount === 0) curr0neg.innerText = '';
                if (gBoard[i][j].minesAroundCount === 0) showAllAround0({ i: i, j: j });
            }
        }
    }

}

function playSound() {
    var sound = new Audio("");//enter the file path here
    sound.play();
}

//enter a parameter if needed
function openModal() {
    var elModal = document.querySelector('.modal');
    elModal.style.display = 'block';
}
// usually activeted by a button in the modal
function closeModal() {
    var elModal = document.querySelector('.modal');
    elModal.style.display = 'none';
}

//shuffle an array
function shuffle(items) {
    var randIdx;
    var keep;
    for (var i = items.length - 1; i > 0; i--) {
        randIdx = getRandomIntInclusive(0, items.length - 1);

        keep = items[i];
        items[i] = items[randIdx];
        items[randIdx] = keep;
    }
    return items;
}

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function startTimer() {
    var elSec = document.getElementById("seconds")
    var elMin = document.getElementById("mins")
    gGame.secsPassed++
    gSeconds++;
    if (gSeconds < 9) {
        elSec.innerHTML = '0' + gSeconds;
    }
    if (gSeconds > 9) {
        elSec.innerHTML = gSeconds;
    }
    if (gSeconds > 60) {
        gMins++;
        elMin.innerHTML = gMins;
        gSeconds = 0;
        elSec.innerHTML = 0;
    }

}

