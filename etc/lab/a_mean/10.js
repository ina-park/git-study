// function floor(min, max) {
//     var num = Math.floor((Math.random() * (max - min + 1) + min));

//     console.log(max - min)
//     console.log('max',max)
//     console.log('min',min)

//     return num;
// }

// console.log(floor(5, 10))


function play(maxNum) {

    var randomNum = Math.floor(Math.random() * maxNum);

    var playResult = '';
    
    if (randomNum == '0') {
        playResult = '가위';
    } else if (randomNum == '1') {
        playResult = '바위';
    } else if (randomNum == '2') {
        playResult = '보';
    } else {
        console.log('잘못 입력하셨습니다.');
        return false;
    }

    return playResult;
}

function printPlay(x, y) {
    console.log('당신:' + x + ',' + '컴퓨터:' + y);
}

function printWinner(x) {
    console.log(x + '의 승리입니다');
}

function printDraw() {
    console.log('비겼습니다');
}

function playGame() {
    var yourName = '_당신';
    var computerName = '_컴퓨터';
    
    var yourValue = play(3);
    var computerValue = play(3);

    printPlay(yourValue, computerValue);

    if (yourValue == '가위' && computerValue == '보'|| yourValue == '바위' && computerValue == '가위' || yourValue == '보' && computerValue == '바위') { // 당신 우승
        printWinner(yourName);
    } else if (yourValue == '보' && computerValue == '가위'|| yourValue == '가위' && computerValue == '바위' || yourValue == '바위' && computerValue == '보') { // 컴퓨터 우승
        printWinner(computerName);
    } else {
        printDraw();
    }
}

console.log(playGame())