const $grid = $('#sudoku-grid');
const $popup = $('#popup');
const puzzle = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9]
];
let $activeCell = null;
let gameStarted = false;
let sudokuSolved = false;
let timer = null;
let seconds = 0;
let isRunning = false;

const $playBtn = $('.play-button');
$playBtn.click(function () {
    if (!isRunning) {
        $('.timer-container').show();
        gameStarted = true;
        isRunning = true;
        timer = setInterval(() => {
            seconds++;
            updateDisplay();
        }, 1000);
    }
});

function formatTime(seconds) {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
}

function updateDisplay() {
    $('.timer').text(formatTime(seconds));
}

// Build the matrix
for (let g = 0; g < 9; g++) {
    const $miniGrid = $(`<div class="mini-grid" id="mini-grid-${g + 1}"></div>`);

    const startRow = Math.floor(g / 3) * 3;
    const startCol = (g % 3) * 3;

    for (let i = 0; i < 9; i++) {
        const row = startRow + Math.floor(i / 3);
        const col = startCol + (i % 3);
        const cellValue = puzzle[row][col];
        const $cell = $(`<div class="cell" id="cell-${row}-${col}"></div>`);

        if (cellValue !== 0) {
            $cell.text(cellValue).addClass('fixed');
        }

        $miniGrid.append($cell);
    }
    $grid.append($miniGrid);
}

// Build the pop-up menu
for (let i = 1; i <= 9; i++) {
    const $btn = $(`<button id="btn-${i}">${i}</button>`);
    $popup.append($btn);
}
const $clearBtn = $('<button class="clear-btn">Clear</button>');
$popup.append($clearBtn);

// Clear button
const $clearAllBtn = $('.clear-all-btn');

// Clear All Confirm
const $clearAllConfirm = $('.clear-all-confirm');
const $clearAllYes = $('#clear-yes');
const $clearAllNo = $('#clear-no');

$grid.on('click', '.cell:not(.fixed)', function (e) {
    if (gameStarted) {
        $activeCell = $(this);
        openPopup(e.pageX, e.pageY);
    }
});

for (let i = 1; i <= 9; i++) {
    $(`#btn-${i}`).click(function () {
        if ($activeCell) {
            const id = $activeCell.attr('id');
            const [_, rowStr, colStr] = id.split('-');
            const row = parseInt(rowStr);
            const col = parseInt(colStr);
            $activeCell.text(i);

            let issue = checkIssue(row, col, i);

            if (issue) {
                $activeCell.addClass('incorrect');
            } else {
                $activeCell.removeClass('incorrect');
                sudokuSolved = checkSudokuSolved();

                if (sudokuSolved) {
                    clearInterval(timer);
                    isRunning = false;
                    gameStarted = false;
                    $('#game-msg').text(`Hurrah, you have solved it! Time taken - ${formatTime(seconds)}. Refresh to play again`);
                }
            }

            closePopup();
        }
    });
}

$clearBtn.click(function () {
    if ($activeCell) {
        $activeCell.text('').removeClass('incorrect');
        closePopup();
    }
});

$clearAllBtn.click(function (e) {
    if (gameStarted) openClearAllMenu(e.pageX, e.pageY);
});

$clearAllYes.click(function () {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            let $cell = $(`#cell-${i}-${j}`);
            if ($cell.hasClass('fixed')) {
                continue;
            }
            else {
                $cell.text('').removeClass('incorrect');
            }
        }
    }

    closeClearAllMenu();
});

$clearAllNo.click(function () {
    closeClearAllMenu();
});

$(document).click(function (e) {
    if (!$(e.target).closest('.popup, .cell').length) {
        closePopup();
    }
    if (!$(e.target).closest('.clear-all-confirm').length && !$(e.target).closest('.clear-all-btn').length) {
        closeClearAllMenu();
    }
});

function checkIssue(row, col, i) {
    let issue = false;

    for (let c = 0; c < 9; c++) {
        if (c !== col && parseInt($(`#cell-${row}-${c}`).text()) === i) {
            issue = true;
            break;
        }
    }

    if (!issue) {
        for (let r = 0; r < 9; r++) {
            if (r !== row && parseInt($(`#cell-${r}-${col}`).text()) === i) {
                issue = true;
                break;
            }
        }
    }

    if (!issue) {
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;
        for (let r = startRow; r < startRow + 3; r++) {
            for (let c = startCol; c < startCol + 3; c++) {
                if ((r !== row || c !== col) && parseInt($(`#cell-${r}-${c}`).text()) === i) {
                    issue = true;
                    break;
                }
            }
        }
    }

    return issue;
}

function checkSudokuSolved() {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            let $cell = $(`#cell-${i}-${j}`);
            if ($cell.hasClass('fixed')) {
                continue;
            }
            if ($cell.text() === '' || $cell.hasClass('incorrect')) {
                return false;
            }
        }
    }
    return true;
}

function openPopup(x, y) {
    $popup.css({
        display: 'grid',
        left: x + 'px',
        top: y + 'px'
    });
}

function closePopup() {
    $popup.hide();
    $activeCell = null;
}

function openClearAllMenu(x, y) {
    $clearAllConfirm.css({
        display: 'flex',
        left: x + 'px',
        top: y + 'px'
    });
}

function closeClearAllMenu() {
    $clearAllConfirm.hide();
}