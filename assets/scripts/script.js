const backspace = document.getElementById('backspace');
const buttons = document.querySelectorAll('button');
const changeSignButton = document.getElementById('change-sign');
const clearAllButton = document.getElementById('clear');
const clearEntryButton = document.getElementById('clear-entry');
const decimalButton = document.getElementById('decimal');
const entry = document.querySelector('.entry');
const equals = document.getElementById('equals');
const functionButtons = document.querySelectorAll('.function');
const log = document.querySelector('.log');
const numberButtons = document.querySelectorAll('.number');
const operatorButtons = document.querySelectorAll('.operator');

let leftOperand = null;
let operator = null;
let rightOperand = null;
let clearAllBoxes = false;
let clearEntry = false;     // Clear entry box once during number input
let isDecimal = false;
let isError = false;
let functionDisabled = false;
let key = '';
entry.textContent = '0';


const body = document.querySelector('body');

body.addEventListener('click', () => {
    displayBackend();
})

body.addEventListener('keydown', () => {
    displayBackend();
})

function displayBackend() {
    console.clear();
    console.log(`
    Left Operand: ${leftOperand}\n
    Operator: ${operator}\n
    Right Operand: ${rightOperand}\n
    Clear All: ${clearAllBoxes}\n
    Clear Entry: ${clearEntry}\n
    Is a Decimal: ${isDecimal}\n
    Error Occurred: ${isError}\n
    Functions Disabled: ${functionDisabled}\n
    Key Pressed: ${key}\n
    `)
}

// ⌫
backspace.addEventListener('click', () => {
    if (clearAllBoxes) {
        clearMemory();
        clearAllBoxes = false;
    }
    else if (clearEntry) {
        clearEntryBox();
        clearEntry = false;
    }
    else {
        let content = entry.textContent;

        if (entry.textContent[content.length - 1] === '.') {
            isDecimal = false;
        }

        entry.textContent = content.slice(0, content.length - 1);

        if (entry.textContent === '') {
            entry.textContent = '0';
        }
    }
})

// +-
changeSignButton.addEventListener('click', () => {
    negate();
})

// C - Clear
clearAllButton.addEventListener('click', () => {
    clearMemory();
})

// CE
clearEntryButton.addEventListener('click', () => {
    if (clearAllBoxes) {
        clearMemory();
        clearAllBoxes = false;
    }
    else {
        clearEntryBox();
    }
})

// .
decimalButton.addEventListener('click', () => {
    if (isDecimal) {
        return;
    }

    if (clearAllBoxes) {
        clearMemory();
        clearAllBoxes = false;
    }

    isDecimal = true;
    addToEntry('.');
})

// Clear focus
document.addEventListener('keydown', () => {
    document.activeElement.blur();
})

// =
equals.addEventListener('click', () => {
    if (isError) {
        clearMemory();
        return;
    }

    if (leftOperand === null) {
        leftOperand = +entry.textContent;
        displayToLog(leftOperand, '=');
        updateEntryBox(leftOperand);
    }
    else if (!clearEntry) {
        if (operator === null) {
            leftOperand = +entry.textContent;
            displayToLog(leftOperand, '=');
            updateEntryBox(leftOperand);
        }
        else if (leftOperand != null) {
            rightOperand = +entry.textContent;
            let result = solve(leftOperand, rightOperand, operator);

            displayToLog(leftOperand, operator, rightOperand, '=');
            clearEntryBox();
            updateEntryBox(result);
        }
    }
    else {
        if (rightOperand != null) {
            leftOperand = +entry.textContent;
            let result = solve(leftOperand, rightOperand, operator);
            displayToLog(leftOperand, operator, rightOperand, '=')
            updateEntryBox(result);
        }
        else {
            leftOperand = +entry.textContent;

            displayToLog(leftOperand, '=');
        }
    }

    isDecimal = false;
    clearEntry = true;
    clearAllBoxes = true;
})

window.addEventListener('keydown', (e) => {
    buttonClick(e, true);
})

window.addEventListener('keyup', (e) => {
    buttonClick(e, false);
})

window.addEventListener('mousedown', (e) => {
    buttonClick(e, true, false);
})

window.addEventListener('mouseup', (e) => {
    buttonClick(e, false, false);
})

// Numbers
for (let button of numberButtons) {
    button.addEventListener('click', (e) => {

        if (clearAllBoxes) {
            clearMemory();
        }

        addToEntry(e.target.id);
    })
}

// Operators
for (let button of operatorButtons) {
    button.addEventListener('click', (e) => {
        let oldOperator = operator;
        operator = e.target.id;

        if (clearEntry) {
            if (clearAllBoxes) {
                leftOperand = +entry.textContent;
                updateEntryBox(leftOperand);
            }
            displayToLog(leftOperand, operator);
            clearAllBoxes = false;
        }
        else {
            if (leftOperand !== null) {
                rightOperand = +entry.textContent;

                let result = solve(leftOperand, rightOperand, oldOperator);

                if (!isNaN(result)) { // Is a number
                    displayToLog(result, operator);
                    leftOperand = result;
                    clearAllBoxes = false;
                }
                else {
                    toggleFunctionButtons('disable');
                    clearAllBoxes = true;
                }

                updateEntryBox(result);
            }
            else {
                leftOperand = +entry.textContent;
                displayToLog(leftOperand, operator);
                clearAllBoxes = false;
            }
        }

        isDecimal = false;
        clearEntry = true;
    })
}

// Insert numbers to the entry box
function addToEntry(input) {
    if (clearEntry === true) {
        if (input === '.') {
            entry.textContent = '0';
        }
        else {
            entry.textContent = '';
        }
        clearEntry = false;
    }
    else if (entry.textContent.length > 10) {
        return;
    }
    else {
        if (entry.textContent === '0') {
            if (input === '.') {
                entry.textContent = '0';
            }
            else {
                entry.textContent = '';
            }
        }
    }

    entry.textContent += input;
}

/*
    Adds or removes 'clicked' class and acts different depending on keyboard or mouse press
*/
function buttonClick(event, click, keyboard = true) {
    let id = null;
    let currentKey = null;

    if (keyboard) {
        id = translateKeyCode(event);
        key = event.code;
    }
    else {
        id = event.target.id;
        key = id;
    }

    try {
        currentKey = document.getElementById(id);

        // Firefox Developer Edition binds the Slash and Numpad buttons to Quick Find, so the divide button will not have any clicking effects when using the keyboard
        if (keyboard && (key === 'Slash' || key === 'NumpadDivide')) {
            return;
        }
        else {
            if (click) {
                if (keyboard) {
                    currentKey.click();
                }
                currentKey.classList.add('clicked');
            }
            else {
                currentKey.classList.remove('clicked');
            }
        }
    }
    catch (error) {
        if (click) {
            console.error(`${error.name}: Invalid key press.`);
        }
        else {
            return;
        }
    }
}

/*
    Clear all data and display data
*/
function clearMemory() {
    leftOperand = null;
    operator = null;
    rightOperand = null;
    clearEntry = false;  // Clear entry box once during number input
    clearAllBoxes = false;
    clearEntry = false;
    isDecimal = false;
    isError = false;
    toggleFunctionButtons('enable');
    clearLogBox();
    clearEntryBox();
}

function clearEntryBox() {
    entry.textContent = '0';
    isDecimal = false;
}

function clearLogBox() {
    log.textContent = '';
}

function countWholeNumbers(input) {
    let str = input.toString();

    if (str.includes('.')) {
        return str.split('.')[0].length;
    }
    else {
        return str.length;
    }
}

function displayToLog(leftNumber, operator, rightNumber = '', equalSign = '') {
    if (operator === '=') {
        log.innerHTML = `${leftNumber} =`;
    }
    else {
        log.innerHTML = `${leftNumber} ${getOperationSign(operator)} ${rightNumber} ${equalSign}`.trim();
    }
}

function updateEntryBox(input) {
    clearEntryBox();
    let holder = input.toString();

    if (holder.length > 10) {
        holder = (+holder).toPrecision(2);
    }

    entry.textContent = holder;
}

function add(a, b) {
    return a + b;
}

function subtract(a, b) {
    return a - b;
}

function multiply(a, b) {
    return a * b;
}

function divide(a, b) {
    if (b === 0) {
        isError = true;
        toggleFunctionButtons('disable');
        clearAllBoxes = true;

        return 'yeet';
    }
    else {
        return a / b;
    }
}

// Converts operation keywords to signs (add -> +)
function getOperationSign(sign) {
    switch (sign) {
        case 'add':
            return '+';
        case 'subtract':
            return '-';
        case 'multiply':
            return '&times;';
        case 'divide':
            return '&#xF7;';
        case '':
            return '';
        default:
            console.error('No sign available.');
    }
}

// Negates current entry
function negate() {
    entry.textContent = -(+entry.textContent);
}

function solve(a, b, operator) {
    let result = 0;

    switch (operator) {
        case 'add':
            result = add(a, b);
            break;
        case 'subtract':
            result = subtract(a, b);
            break;
        case 'multiply':
            result = multiply(a, b);
            break;
        case 'divide':
            result = divide(a, b);
            break;
    }

    return result;
}

function toggleFunctionButtons(toggle) {
    switch (toggle) {
        case 'enable':
            functionDisabled = false;


            for (let item of operatorButtons) {
                item.classList.remove('disabled');
            }

            break;
        case 'disable':
            functionDisabled = true;


            for (let item of operatorButtons) {
                item.classList.add('disabled');
            }

            break;
    }
}

/*
    Translates keyboard presses (eg. 'NumpadAdd' -> 'add')
*/
function translateKeyCode(keyEvent) {
    let result = null;

    switch (keyEvent.code) {
        case 'Backspace':
            result = 'backspace';
            break;
        case 'Digit0':
        case 'Numpad0':
            result = '0';
            break;
        case 'Digit1':
        case 'Numpad1':
            result = '1';
            break;
        case 'Digit2':
        case 'Numpad2':
            result = '2';
            break;
        case 'Digit3':
        case 'Numpad3':
            result = '3';
            break;
        case 'Digit4':
        case 'Numpad4':
            result = '4';
            break;
        case 'Digit5':
        case 'Numpad5':
            result = '5';
            break;
        case 'Digit6':
        case 'Numpad6':
            result = '6';
            break;
        case 'Digit7':
        case 'Numpad7':
            result = '7';
            break;
        case 'Digit8':
        case 'Numpad8':
            if (keyEvent.shiftKey) {
                result = 'multiply';
            }
            else {
                result = '8';
            }
            break;
        case 'Digit9':
        case 'Numpad9':
            result = '9';
            break;
        case 'Enter':
        case 'NumpadEnter':
            result = 'equals';
            break;
        case 'Escape':
            result = 'clear';
            break;
        case 'Equal':
            if (keyEvent.shiftKey) {
                result = 'add';
            }
            else {
                result = 'equals';
            }
            break;
        case 'Minus':
        case 'NumpadSubtract':
            result = 'subtract';
            break;
        case 'NumpadAdd':
            result = 'add';
            break;
        case 'NumpadMultiply':
            result = 'multiply';
            break;
        case 'Period':
        case 'NumpadDecimal':
            result = 'decimal';
            break;
        case 'Slash':
        case 'NumpadDivide':
            result = 'divide';
            break;
    }

    return result;
}