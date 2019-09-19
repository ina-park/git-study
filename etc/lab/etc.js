/**
 * 프로토타입
 */

// function Person() {}

// var joon = new Person();
// var jisoo = new Person();

// Person.prototype.getType = function() {
//     return '인간';
// };

// console.log(joon.getType());
// console.log(jisoo.getType());

// jisoo.age = 25;

// console.log(joon.age);
// console.log(jisoo.age);

// Person.prototype.getType = function() {
//     return '사람';
// }

// console.log(jisoo.getType())

// function Person(name) {
//     this.name = name || '이나';
// }

// Person.prototype.getName = function() {
//     return this.name;
// }

// function Korean(name) {
//     Person.apply(this, arguments);
// }

// var kor1 = new Korean('지수');
// console.log(kor1.name);


// function Person(name) {
//     this.name = name || '이나';
// }
// Person.prototype.getName = function() {
//     return this.name;
// }
// function Korean(name) {
//     Person.apply(this, arguments);
// }
// Korean.prototype = new Person();
// var kor1 = new Korean('지수');
// console.log(kor1.getName());

// var person = {
//     type: "인간",
//     name: "인삼",
//     getType: function() {
//         return this.type;
//     },
//     getName: function() {
//         return this.name;
//     }
// }

// var joon = Object.create(person);
// // joon.name = "이나";

// console.log(joon.getType())
// console.log(joon.getName())

