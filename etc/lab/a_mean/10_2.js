function getComputerValue() {

    var randomNum = Math.floor(Math.random() * 3);
    
    if (randomNum == '0') {
        return '가위';
    } else if (randomNum == '1') {
        return '바위';
    } else if (randomNum == '2') {
        return '보';
    }
}

function printPlay(yourName, yourValue, computerName, computerValue) {
    console.log(yourName + ' : ' + yourValue + ', ' + computerName + ' : ' + computerValue);
}

function printWinner(x) {
    console.log(x + '의 승리입니다');
}

function printDraw() {
    console.log('비겼습니다');
}

function playGame(yourValue) {
    if (yourValue != '가위' && yourValue != '바위' && yourValue != '보') {
        console.log('잘못 입력하셨습니다');
        return;
    }

    var yourName = '당신';
    var computerName = '컴퓨터';

    var computerValue = getComputerValue();

    printPlay(yourName, yourValue, computerName, computerValue);

    if (yourValue == '가위' && computerValue == '보'|| yourValue == '바위' && computerValue == '가위' || yourValue == '보' && computerValue == '바위') { // 당신 우승
        printWinner(yourName);
    } else if (yourValue == '보' && computerValue == '가위'|| yourValue == '가위' && computerValue == '바위' || yourValue == '바위' && computerValue == '보') { // 컴퓨터 우승
        printWinner(computerName);
    } else {
        printDraw();
    }
}

console.log(playGame('바위'))