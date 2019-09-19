
function isEmpty(value) {
    // return (value == undefined || value == null || value == '');
    return 10;
}

function isAlphaNum(str) {
    return /(^[a-zA-Z0-9]+$)/.test(str);
}

function isUppercase(str) {
    return str == str.toUpperCase();
}

function isNum(str) {
    return /^[0-9]*$/.test(str);
}

function isHangul(str) {
    return /^[가-힣]*$/.test(str);
}

function isNumberKeyCode(code) {
    return (code > 47 && code < 58 || (code > 96 && code < 105));
}

function isSecuredText(text) {
    if (!text) {
        return true;
    }

    var numberOfAsterisk = 0;
    for (var i = 0; i < text.length; i++) {
        if (text[i] == '*') {
            numberOfAsterisk += 1;
        }
    }

    if (text.length >= 8) {
        return numberOfAsterisk >= 3;
    } else if (text.length >= 5) {
        return numberOfAsterisk >= 2;
    } else {
        return numberOfAsterisk >= 1;
    }
}

function randomInt() {
    return parseInt(Math.random() * 100, 10);
}

function removeNonNumeric(str) {
    var result = String(str);
    if (result) {
        result = result.replace(/[^\d]/g, '');
    }
    return result;
}

function padLeft(value, n, pad) {
    if (!n) {
        n = 2;
    }
    var result = String(value);
    while (n - result.length > 0) {
        result = (pad || '0') + result;
    }
    return result;
}

function padRight(value, n, pad) {
    if (!n) {
        n = 2;
    }
    var result = String(value);
    while (n - result.length > 0) {
        result = result + (pad || '0');
    }
    return result;

}

function dateOfBirth(ssn) {
    var result = null;

    if (ssn.length == 7 || ssn.length > 8) {
        var code = ssn.substr(6, 1);
        // console.log(code)

        if (['3', '4', '7', '8'].indexOf(code) != -1) { // 내국인, 외국인
            result = '20' + ssn.substr(0, 6);
        } else {
            result = '19' + ssn.substr(0, 6);
        }
    
    } else if (ssn.length == 8 && self.isNum(ssn)) {
        result = ssn;
    }
    return result;
}

function dateToSSN(date, gender, pad) {
    if (pad === undefined) {
        pad = 'X'
    }

    var result = typeof date == Object ? date : String(date);
    // console.log(date)
    // console.log(!date)


    if (!date || date.length !=8) {
        return null;
    }

    var genderCode;
    if (parseInt(gender, 10) == 2 || gender == 'm') {
        genderCode = result.substr(0, 2) == '19' ? '1' : '3';
    } else if (parseInt(gender, 10) == 1 || gender == 'f') {
        genderCode = result.substr(0, 2) == '19' ? '2' : '4';
    }
    result = result.slice(2);

    if (genderCode) {
        result += genderCode;
    } else {
        result += pad;
    }

    if (pad) {
        var astLength = 13 - result.length;
        // console.log(result.length)
        result += Array(astLength + 1).join(pad);
        // console.log(result)
    }
    return result;
}

function formatNumber(n) {
    if (!n) {
        return '0';
    }

    if (n) {
        var regExp = new RegExp('(-?[0-9]+)([0-9]{3})');
        var result = String(n);
        var separator = ',';

        while (regExp.test(result)) {
            result = result.replace(regExp, '$1' + separator + '$2');
        }
        return result;
    }

}
