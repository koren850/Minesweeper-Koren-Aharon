
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
// copy a mat quickly if needed from some reason
function copyMat(mat) {
    var coppiedMat = []
    for (var i = 0; i < mat.length; i++) {
        coppiedMat[i] = []
        for (var j = 0; j < mat[0].length; j++) {
            coppiedMat[i][j] = mat[i][j]
        }
    }
    return coppiedMat
}

//rendering simple matrix, the selector is the class of the div we want to push it in
function renderMat(mat, selector) {
    var strHTML = '';
    for (var i = 0; i < mat.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < mat[0].length; j++) {
            var cellContent = mat[i][j].isShown ? mat[i][j].minesAroundCount : ' ';
            var className = `cell cell${i}${j}`;
            strHTML += `<td oncontextmenu="flag(this,${i},${j})" onclick="cellClicked(this,${i},${j})" class="${className}"> ${cellContent}</td>`
        }
        strHTML += '</tr>'
    }
    var elContainer = document.querySelector(selector);
    elContainer.innerHTML = strHTML;
}

// rendering a cell instead of rendering the whole mat again
// location such as: {i: 2, j: 7}
function renderCell(location, value) {
    // Select the elCell and set the value 
    var elCell = document.querySelector(`.cell${location.i}-${location.j} `);
    elCell.innerHTML = value;
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

//another counting negs function, adjust vars to the question
function countNegsAroundShown(elCell, pos) {
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue;
            if (i === pos.i && j === pos.j) continue;
            if (gGame.isOn && !gBoard[i][j].isShown && !gBoard[i][j].isMine && !gBoard[i][j].isMarked) {
                // if (gBoard[i][j].minesArounCount === 0) showAllAround0({ i: i, j: j })
                var currNeg = document.querySelector(`.cell${i}${j}`);
                currNeg.classList.add('shown')
                currNeg.innerText = gBoard[i][j].minesAroundCount;
                console.log(currNeg);
                // cellClicked(currNeg, i, j);

            }
        }
    }
}
function showAllAround0(pos) {
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue;
            if (i === pos.i && j === pos.j) continue;
            gBoard[i][j].isShown = true
            var curr0neg = document.querySelector(`.cell${i}${j}`)
            if (!curr0neg.classList.contains('shown')) {
                gGame.shownCount++
                undoArr.push(gBoard);
                undoPos.push({ i: i, j: j });
            }
            else {

            }
            curr0neg.classList.add('shown');
            curr0neg.innerText = gBoard[i][j].minesAroundCount;
            // undoArr.push(gBoard);
            // undoPos.push({ i: i, j: j });
        }
    }

}


//needed to move computer players randomaly, look on pacman CR for more info
function getMoveDiff() {
    var randNum = getRandomIntInt(0, 100);
    if (randNum < 25) {
        return { i: 0, j: 1 };
    } else if (randNum < 50) {
        return { i: -1, j: 0 };
    } else if (randNum < 75) {
        return { i: 0, j: -1 };
    } else {
        return { i: 1, j: 0 };
    }
}

//need to move your player, look on pacman CR for more info, 
// how it communicates with movePacman function
function getNextLocation(eventKeyboard) {
    var nextLocation = {
        i: gPacman.location.i,
        j: gPacman.location.j,
    };
    switch (eventKeyboard.code) {
        case 'ArrowUp':
            nextLocation.i--;
            gDeg = '-90deg'
            break;
        case 'ArrowDown':
            nextLocation.i++;
            gDeg = '90deg'
            break;
        case 'ArrowLeft':
            nextLocation.j--;
            gDeg = '180deg'
            break;
        case 'ArrowRight':
            nextLocation.j++;
            gDeg = '0deg'
            break;
        default:
            return null;
    }
    return nextLocation;
}

//////////// GENERAL FUNCTIONS /////////////

function playSound() {
    var sound = new Audio("");//enter the file path here
    sound.play();
}

//enter a parameter if needed
function openModal() {
    var elModal = document.querySelector('.modal');
    elModal.style.display = 'block';

    var elText = elModal.querySelector('p');
    elText.innerText = isVictory ? 'You won!!! 🏆' : 'You lost! Let\'s try angin ';
}

// usually activeted by a button in the modal
function closeModal() {
    var elModal = document.querySelector('.modal');
    elModal.style.display = 'none';
}

function checkForEmptyCell() {
    // the empty cell is random
    var emptyCellArr = []
    for (var i = 0; i < gBoard.length - 1; i++) {
        for (var j = 0; j < gBoard[0].length - j; j++) {
            var currCell = gBoard[i][j]
            // if(enter condtion for an empty cell here for the currCell var ){
            var emptyCellPos = { i, j }
            emptyCellArr.push(emptyCellPos)
            // }
        }
    }
    var emptyCellIdx = getRandomIntInclusive(0, emptyCellArr.length - 1)
    var emptyCell = emptyCellArr[emptyCellIdx]
    return emptyCell
}

//creates an array of unique numbers 
function createRandomUniqueNumArr(startingNum, endingNum) {
    var numArr = []
    for (var i = startingNum; i <= endingNum; i++) {
        numArr.push(i);
    }
    shuffle(numArr)

    return numArr
}

function sortNumArr(numArray) {
    numArray.sort(function (a, b) {
        return a - b;
    });
}

//draws a random num from an array of nums
function drawNums() {
    var numsArr = [] //enter you array here, maybe the function can recives it
    shuffle(numsArr)
    var randomNum = numsArr[0]
    return randomNum
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

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}


/////////// TIME AND TIMERS FUNCTIONS /////////////////////

// just getting the current time
function getTime() {
    var currTime = new Date().getTime()
    return currTime
}

//simple timer, counting seconds, set interval to 100ms for smooth run


//more advanced timer, aa:bb:cc kind, when setting interval need to set it for 100ms
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
function clearTimer() {
    clearInterval(gTimerInterval);
    //update model
    gSeconds = 0;
    gMins = 0;
    //update dom
    var elTens = document.getElementById("mins")
    var elSeconds = document.getElementById("seconds")
    elTens.innerHTML = "0";
    elSeconds.innerHTML = "0";
}

