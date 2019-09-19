function testCharAt(idx) {
    var idx = 'coding everyday';

    return idx;
}

// console.log(testCharAt().charAt(0));
// console.log(testCharAt().charAt(testCharAt().length - 1));
// console.log(testCharAt().charAt(1000) == '');
// console.log(testCharAt().length);

function testCharCodeAt(idx) {
    var idx = 'abc';

    return idx;
}

// console.log(testCharCodeAt().charCodeAt(1));

function testConcat(str) {
    s1 = 'a'
    s2 = 'b'
    s3 = '-'
    s4 = '자바스크립트로 배우는 프로그래밍'

    return str = s1.concat(s2,s3,s4)
}

// console.log(testConcat())

function testIndexOf(str) {
    var str = 'abc자바스크립트 - 레퍼런스';

    return str;
}

// console.log(testIndexOf().indexOf('스'));
// console.log(testIndexOf().indexOf('자바'));

function testLastIndexOf(str) {
    var str = 'abc자바스크립트 - 레퍼런스';

    return str;
}
// console.log(testLastIndexOf().lastIndexOf('스'));


// console.log('b'.localeCompare('b'))

function testMatch(str) {
    var str = 'coding everyday, everywhere, everytime';
    var patt1 = /every.+/gi;

    return str.match(patt1);
}

console.log(testMatch())