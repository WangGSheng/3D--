let soup = require('./text')
let readline = require('readline');

let x = 0

// let P = [' ▓▓▓', '▓ ▓▓', '▓▓ ▓', '▓▓▓ ']
// let P = ["▂▁▇▃", "▄▁▂▃", "▁▃▄▂", "▂▃▁▄"]
// let P = ["▶▷▷▷", "▷▶▷▷", "▷▷▶▷", "▷▷▷▶"]
let P = ["●○○○", "○●○○", "○○●○", "○○○●"]
// let P = ['👙🔞🔞🔞', '🔞👙🔞🔞', '🔞🔞👙🔞', '🔞🔞🔞👙']

function randomNum(minNum, maxNum) {
    switch(arguments.length){
        case 1:
            return parseInt(Math.random() * minNum + 1, 10)
        case 2:
            return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10)
        default:
            return 0
    }
}

let rNum = randomNum(0, soup.length)

module.exports = (percentage, message, ...args) => {
    x &= 3
    // process.stdout.write("\r \x1b[46m\x1b[30m " + P[x++] + ' \x1b[0m ' + '莫急!莫急!慢慢来...')
    let txt = `\x1b[0m\x1b[36m ${ P[x++] } \x1b[36m${ soup[rNum][1] }`

    percentage = parseInt(percentage * 100)

    if (process.stdout.isTTY) {
        if(percentage > 95 ){
            readline.cursorTo(process.stdout, 0)
            process.stdout.write(`                                                            `)
            process.stdout.write(`\n`);
        }else{
            process.stdout.cursorTo(0)
            process.stdout.write(`${percentage}% ${ txt }`)
        }
    }else{
        if(percentage > 95){
            process.stdout.write(`\r                                                           `);
            process.stdout.write(`\n`);
        }else{
            process.stdout.write(`\r${ percentage }% ${ txt }`)
        }

    }
}
