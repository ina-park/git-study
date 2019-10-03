/**
 * @fileOverview JS 기본 Type 확장. jQuery Plugin 확장 등
 */

// ES 15.2.3.6 Object.defineProperty ( O, P, Attributes )
// Partial support for most common case - getters, setters, and values
(function() {
	if (!Object.defineProperty ||
		!(function () { try { Object.defineProperty({}, 'x', {}); return true; } catch (e) { return false; } } ())) {
		var orig = Object.defineProperty;
		Object.defineProperty = function (o, prop, desc) {
			// In IE8 try built-in implementation for defining properties on DOM prototypes.
			if (orig) { try { return orig(o, prop, desc); } catch (e) {} }
	
			if (o !== Object(o)) { throw TypeError("Object.defineProperty called on non-object"); }
			if (Object.prototype.__defineGetter__ && ('get' in desc)) {
				Object.prototype.__defineGetter__.call(o, prop, desc.get);
			}
			if (Object.prototype.__defineSetter__ && ('set' in desc)) {
				Object.prototype.__defineSetter__.call(o, prop, desc.set);
			}
			if ('value' in desc) {
				o[prop] = desc.value;
			}
			return o;
		};
	}
}()); 

 /**
 * @extends JSON
 */
if(typeof(JSON) == "object"){
	/**
	 * JSON Object를 문자열로 변환 (브라우져에서 지원 안하는 경우만 추가)
	 * @category polyfill
	 * @method stringify
	 * @param {*} obj 변환할 JSON Object
	 * @return {String} 변환된 문자열
	 */
    JSON.stringify = JSON.stringify || function(obj) {
        var t = typeof(obj);
        if (t != "object" || obj === null) {
            // simple data type
            if (t == "string") obj = '"' + obj + '"';
            return String(obj);
        } else {
            // recurse array or object
            var n, v, json = [],
                arr = (obj && obj.constructor == Array);
            for (n in obj) {
                v = obj[n];
                t = typeof(v);
                if (t == "string") v = '"' + v + '"';
                else if (t == "object" && v !== null) v = JSON.stringify(v);
                json.push((arr ? "" : '"' + n + '":') + String(v));
            }
            return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
        }
    };
}
/**
 * Array prototype 확장
 * @extends Array
 * @see
 * Array prototype 확장하는 경우 Object.defineProperty() 사용.
 * for (key in list){} 사용하는 경우 key에 나오기 때문에 반드시 Object.hasOwnProperty()로 key 확인해야 함.
 */
if (!Array.isArray) {
	/**
	 * 특정 객체가 배열인지 확인. Static 함수임.
	 * @category polyfill
	 * @param {*} value 배열인지 확인하고자하는 객체
	 * @return {Boolean} 배열이면 true, 아니면 false
	 * @see Static 함수라서 ```Array.isArray(obj)``` 처럼 사용.
	 */
	Array.isArray = function(value) {
		return Object.prototype.toString.call(value) === '[object Array]';
	}
}

if (!Array.prototype.indexOf) {
	/**
	 * 배열에서 특정 obj의 위치 반환
	 * @category polyfill
	 * @param {*} obj 찾을 Object
	 * @param {Int} start 찾기 시작할 Index (기본값 0)
	 * @return {Int} 찾으면 배열에서의 Index, 못찾으면 -1.
	 */
    Array.prototype.indexOf = function(obj, start) {
        for (var i = (start || 0), j = this.length; i < j; i++) {
            if (this[i] === obj) {
				return i; 
			}
        }
        return -1;
    }
}
if (!Array.prototype.push) {
	/**
	 * 배열에 항목 추가
	 * @category polyfill
	 * @param {...*} arguments 추가할 Object 또는 Object들
	 * @return {Int} 추가된 후 배열 길이
	 */
    Array.prototype.push = function() {
		for (var i = 0, l = arguments.length; i < l; i++) {
			this[this.length] = arguments[i];
		}
        return this.length;
    };
}

if (!Array.prototype.map) {

	/**
	 * 배열의 각 요소를 매핑 처리 후 새로운 배열로 반환
	 * @category polyfill
	 * @param {Function} callback 매핑 함수. `function(item, index, array){}`
	 * @return {Array} 새로 매핑된 요소들을 가진 배열
	 */
	Array.prototype.map = function(callback, thisArg) {
  
		var T, A, k;

		if (this == null) {
			throw new TypeError(' this is null or not defined');
		}

		// 1. Let O be the result of calling ToObject passing the |this| 
		//    value as the argument.
		var O = Object(this);

		// 2. Let lenValue be the result of calling the Get internal 
		//    method of O with the argument "length".
		// 3. Let len be ToUint32(lenValue).
		var len = O.length >>> 0;

		// 4. If IsCallable(callback) is false, throw a TypeError exception.
		// See: http://es5.github.com/#x9.11
		if (typeof callback !== 'function') {
			throw new TypeError(callback + ' is not a function');
		}

		// 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
		if (arguments.length > 1) {
			T = thisArg;
		}

		// 6. Let A be a new array created as if by the expression new Array(len) 
		//    where Array is the standard built-in constructor with that name and 
		//    len is the value of len.
		A = new Array(len);

		// 7. Let k be 0
		k = 0;

		// 8. Repeat, while k < len
		while (k < len) {

			var kValue, mappedValue;

			// a. Let Pk be ToString(k).
			//   This is implicit for LHS operands of the in operator
			// b. Let kPresent be the result of calling the HasProperty internal 
			//    method of O with argument Pk.
			//   This step can be combined with c
			// c. If kPresent is true, then
			if (k in O) {

				// i. Let kValue be the result of calling the Get internal 
				//    method of O with argument Pk.
				kValue = O[k];

				// ii. Let mappedValue be the result of calling the Call internal 
				//     method of callback with T as the this value and argument 
				//     list containing kValue, k, and O.
				mappedValue = callback.call(T, kValue, k, O);

				// iii. Call the DefineOwnProperty internal method of A with arguments
				// Pk, Property Descriptor
				// { Value: mappedValue,
				//   Writable: true,
				//   Enumerable: true,
				//   Configurable: true },
				// and false.

				// In browsers that support Object.defineProperty, use the following:
				// Object.defineProperty(A, k, {
				//   value: mappedValue,
				//   writable: true,
				//   enumerable: true,
				//   configurable: true
				// });

				// For best browser support, use the following:
				A[k] = mappedValue;
			}
			// d. Increase k by 1.
			k++;
		}

		// 9. return A
		return A;
	};
}

if (!Array.prototype.filter) {
	/**
	 * 배열에서 특정 요소들만 필터링함.
	 * @category polyfill
	 * @param {Function} func 필터링 함수. `function(item, index, array){}`
	 * @return {Array} 필터링된 배열.
	 */
	Array.prototype.filter = function(func, thisArg) {
		'use strict';
		if ( ! ((typeof func === 'Function' || typeof func === 'function') && this) ) {
			throw new TypeError();
		}
		
		var len = this.length >>> 0,
			res = new Array(len), // preallocate array
			t = this, c = 0, i = -1;
		if (thisArg === undefined) {
			while (++i !== len) {
				// checks to see if the key was set
				if (i in this){
					if (func(t[i], i, t)) {
						res[c++] = t[i];
					}
				}
			}
		} else {
			while (++i !== len) {
				// checks to see if the key was set
				if (i in this) {
					if (func.call(thisArg, t[i], i, t)) {
						res[c++] = t[i];
					}
				}
			}
		}
		
		res.length = c; // shrink down array to proper size
		return res;
	};
}

if (!Array.prototype.includes) {
	/**
	 * 배열에서 요소가 포함되어 있는지 확인
	 * @category polyfill
	 * @method includes
	 * @param {Any} searchElement 찾을 요소
	 * @param {Integer} [fromIndex=0] fromIndex 뒤로 찾음.
	 * @return {Boolean} searchElement가 배열에 포함되어 있으면 true 없으면 false.
	 */
	Object.defineProperty(Array.prototype, 'includes', {
		value: function(searchElement, fromIndex) {
			if (this == null) {
				throw new TypeError('"this" is null or not defined');
			}
	
			// 1. Let O be ? ToObject(this value).
			var o = Object(this);
	
			// 2. Let len be ? ToLength(? Get(O, "length")).
			var len = o.length >>> 0;
	
			// 3. If len is 0, return false.
			if (len === 0) {
				return false;
			}
	
			// 4. Let n be ? ToInteger(fromIndex).
			//    (If fromIndex is undefined, this step produces the value 0.)
			var n = fromIndex | 0;
	
			// 5. If n ≥ 0, then
			//  a. Let k be n.
			// 6. Else n < 0,
			//  a. Let k be len + n.
			//  b. If k < 0, let k be 0.
			var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
	
			function sameValueZero(x, y) {
				return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
			}
	
			// 7. Repeat, while k < len
			while (k < len) {
				// a. Let elementK be the result of ? Get(O, ! ToString(k)).
				// b. If SameValueZero(searchElement, elementK) is true, return true.
				if (sameValueZero(o[k], searchElement)) {
					return true;
				}
				// c. Increase k by 1. 
				k++;
			}

			// 8. Return false
			return false;
		}
	});
}

if (!Array.prototype.fill) {
	/**
	 * 배열을 특정 값으로 채움.
	 * @category polyfill
	 * @method fill
	 * @param {Any} value 배열을 채울 값.
	 * @return {Array} 값이 채워진 배열.
	 */
	Object.defineProperty(Array.prototype, 'fill', {
		value: function (value) {

			// Steps 1-2.
			if (this == null) {
				throw new TypeError('this is null or not defined');
			}

			var O = Object(this);

			// Steps 3-5.
			var len = O.length >>> 0;

			// Steps 6-7.
			var start = arguments[1];
			var relativeStart = start >> 0;

			// Step 8.
			var k = relativeStart < 0 ?
				Math.max(len + relativeStart, 0) :
				Math.min(relativeStart, len);

			// Steps 9-10.
			var end = arguments[2];
			var relativeEnd = end === undefined ?
				len : end >> 0;

			// Step 11.
			var final = relativeEnd < 0 ?
				Math.max(len + relativeEnd, 0) :
				Math.min(relativeEnd, len);

			// Step 12.
			while (k < final) {
				O[k] = value;
				k++;
			}

			// Step 13.
			return O;
		}
	});
}

// https://tc39.github.io/ecma262/#sec-array.prototype.find
if (!Array.prototype.find) {
	/**
	 * 배열에서 조건에 맞는 첫번째 항목 얻기
	 * @category polyfill
	 * @method find
	 * @param {Function} predicate 조건 판단할 함수. 조건에 맞으면 true, 아니면 false 반환해야함.
	 * @return {Any} 조건에 맞는 첫번째 항목. 못찾은 경우 undefined.
	 */
	Object.defineProperty(Array.prototype, 'find', {
		value: function(predicate) {
			// 1. Let O be ? ToObject(this value).
			if (this == null) {
				throw new TypeError('"this" is null or not defined');
			}

			var o = Object(this);

			// 2. Let len be ? ToLength(? Get(O, "length")).
			var len = o.length >>> 0;

			// 3. If IsCallable(predicate) is false, throw a TypeError exception.
			if (typeof predicate !== 'function') {
				throw new TypeError('predicate must be a function');
			}

			// 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
			var thisArg = arguments[1];

			// 5. Let k be 0.
			var k = 0;

			// 6. Repeat, while k < len
			while (k < len) {
				// a. Let Pk be ! ToString(k).
				// b. Let kValue be ? Get(O, Pk).
				// c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
				// d. If testResult is true, return kValue.
				var kValue = o[k];
				if (predicate.call(thisArg, kValue, k, o)) {
					return kValue;
				}
				// e. Increase k by 1.
				k++;
			}
			// 7. Return undefined.
			return undefined;
		},
		configurable: true,
		writable: true
	});
}

// https://tc39.github.io/ecma262/#sec-array.prototype.findindex
if (!Array.prototype.findIndex) {
	/**
	 * 배열에서 조건에 맞는 첫번째 항목 index 얻기
	 * @category polyfill
	 * @method findIndex
	 * @param {Function} predicate 조건 판단할 함수. 조건에 맞으면 true, 아니면 false 반환해야함.
	 * @return {Integer} 조건에 맞는 첫번째 항목의 index. 못찾은 경우 -1.
	 */
	Object.defineProperty(Array.prototype, 'findIndex', {
		value: function(predicate) {
			// 1. Let O be ? ToObject(this value).
			if (this == null) {
				throw new TypeError('"this" is null or not defined');
			}

			var o = Object(this);

			// 2. Let len be ? ToLength(? Get(O, "length")).
			var len = o.length >>> 0;

			// 3. If IsCallable(predicate) is false, throw a TypeError exception.
			if (typeof predicate !== 'function') {
				throw new TypeError('predicate must be a function');
			}

			// 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
			var thisArg = arguments[1];

			// 5. Let k be 0.
			var k = 0;

			// 6. Repeat, while k < len
			while (k < len) {
			// a. Let Pk be ! ToString(k).
			// b. Let kValue be ? Get(O, Pk).
			// c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
			// d. If testResult is true, return k.
				var kValue = o[k];
				if (predicate.call(thisArg, kValue, k, o)) {
					return k;
				}
				// e. Increase k by 1.
				k++;
			}
			// 7. Return -1.
			return -1;
		},
		configurable: true,
		writable: true
	});
}

// Production steps of ECMA-262, Edition 5, 15.4.4.18
// Reference: http://es5.github.io/#x15.4.4.18
if (!Array.prototype.forEach) {
	/**
	 * 배열 모든 항목 돌면서 필요한 것 실행
	 * @category polyfill
	 * @method forEach
	 * @param {Function} callback 항목별로 수행할 기능 구현하는 함수. function(item, index, array){}
	 * @see
	 * 중간에 멈출 수 없고 무조건 모든 항목을 다 돌면서 callback이 실행됨.
	 */
	Array.prototype.forEach = function (callback /*, thisArg*/ ) {

		var T, k;

		if (this == null) {
			throw new TypeError('this is null or not defined');
		}

		// 1. Let O be the result of calling toObject() passing the
		// |this| value as the argument.
		var O = Object(this);

		// 2. Let lenValue be the result of calling the Get() internal
		// method of O with the argument "length".
		// 3. Let len be toUint32(lenValue).
		var len = O.length >>> 0;

		// 4. If isCallable(callback) is false, throw a TypeError exception. 
		// See: http://es5.github.com/#x9.11
		if (typeof callback !== 'function') {
			throw new TypeError(callback + ' is not a function');
		}

		// 5. If thisArg was supplied, let T be thisArg; else let
		// T be undefined.
		if (arguments.length > 1) {
			T = arguments[1];
		}

		// 6. Let k be 0.
		k = 0;

		// 7. Repeat while k < len.
		while (k < len) {

			var kValue;

			// a. Let Pk be ToString(k).
			//    This is implicit for LHS operands of the in operator.
			// b. Let kPresent be the result of calling the HasProperty
			//    internal method of O with argument Pk.
			//    This step can be combined with c.
			// c. If kPresent is true, then
			if (k in O) {

				// i. Let kValue be the result of calling the Get internal
				// method of O with argument Pk.
				kValue = O[k];

				// ii. Call the Call internal method of callback with T as
				// the this value and argument list containing kValue, k, and O.
				callback.call(T, kValue, k, O);
			}
			// d. Increase k by 1.
			k++;
		}
		// 8. return undefined.
	};
}

if (!Array.prototype.remove) {
	/**
	 * 배열에서 특정 항목들 삭제
	 * @category 자체확장
	 */
	Array.prototype.remove = function() {
	    var idx, 
	    	arg = arguments, 
	    	len = arg.length, 
	    	ax;
	    while (len && this.length) {
	        idx = arg[--len];
	        while ((ax = this.indexOf(idx)) !== -1) {
	            this.splice(ax, 1);
	        }
	    }
	    return this;
	};
}


/**
 * String prototype 확장
 * @extends String
 */

/**
 * 왼쪽에 특정 문자열로 패딩 처리
 * @category 자체확장
 * @param {Int} n 패딩 처리해서 몇 글자가 될지
 * @param {String} str 패딩 문자
 * @return {String} 패딩 처리된 String
 */
String.prototype.padLeft = function(n, str){
    if(n <= this.length){
        return ''+this;
    }
    return Array(n - this.length + 1).join(str||'0')+this;
}

/**
 * 오른쪽에 특정 문자열로 패딩 처리
 * @category 자체확장
 * @param {Int} n 패딩 처리해서 몇 글자가 될지
 * @param {String} str 패딩 문자
 * @return {String} 패딩 처리된 String
 */
String.prototype.padRight = function(n, str){
    if(n <= this.length){
        return ''+this;
    }
    return this + Array(n - this.length + 1).join(str||'0');
}

if (!String.prototype.trim) {
	/**
	 * String 왼쪽 오른쪽에 빈 문자를 제거함.
	 * @category polyfill
	 * @return {String} 왼쪽 오른쪽 빈 문자 제거된 String
	 */
	String.prototype.trim = function() {
		return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
	};
}

// IE8에서 substr 음수 사용 안되는 것 수정
if ('ab'.substr(-1) != 'b') {	
	String.prototype.substr = function(substr) {
		return function(start, length) {
			return substr.call(this, start < 0 ? this.length + start : start, length)
		}
	}(String.prototype.substr);
}

if (!String.prototype.includes) {
	/**
	 * String 에 특정 문자열 포함되어 있는지 확인
	 * @category polyfill
	 * @return {Boolean} 포함하고 있으면 true, 없으면 false
	 * @see ES6에서는 기본 지원 함수임.
	 */
	String.prototype.includes = function(search, start) {
		'use strict';
		if (typeof start !== 'number') {
			start = 0;
		}
		
		if (start + search.length > this.length) {
			return false;
		} else {
			return this.indexOf(search, start) !== -1;
		}
	};
}

if (!String.prototype.startsWith) {
	/**
	 * 문자열이 특정 문자 또는 문자열로 시작하는지 확인
	 * @category polyfill
	 * @param {String} search 확인할 문자열
	 * @param {Integer} [pos=0] 
	 * @return {Boolean} 문자열이 search로 시작하면 true 아니면 false.
	 */
	String.prototype.startsWith = function(search, pos) {
		return this.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
	};
}

if (!String.prototype.endsWith) {
	/**
	 * 문자열이 특정 문자 또는 문자열로 끝나는지 확인
	 * @category polyfill
	 * @param {String} search 확인할 문자열
	 * @return {Boolean} 문자열이 search로 끝나면 true 아니면 false.
	 */
	String.prototype.endsWith = function(search, this_len) {
		if (this_len === undefined || this_len > this.length) {
			this_len = this.length;
		}
		return this.substring(this_len - search.length, this_len) === search;
	};
}

if (!String.prototype.repeat) {
	/**
	 * 현재 문자열을 지정한 횟수만큼 반복한 문자열 반환
	 * @category polyfill
	 * @param {Integer} count 반복 횟수
	 * @return {String} 반복해서 합친 문자열. `'0'.repeat(5); // "00000"` 
	 */
	String.prototype.repeat = function(count) {
		'use strict';
		if (this == null) {
			throw new TypeError('can\'t convert ' + this + ' to object');
		}
		var str = '' + this;
		count = +count;
		if (count != count) {
			count = 0;
		}
		if (count < 0) {
			throw new RangeError('repeat count must be non-negative');
		}
		if (count == Infinity) {
			throw new RangeError('repeat count must be less than infinity');
		}
		count = Math.floor(count);
		if (str.length == 0 || count == 0) {
			return '';
		}
		// Ensuring count is a 31-bit integer allows us to heavily optimize the
		// main part. But anyway, most current (August 2014) browsers can't handle
		// strings 1 << 28 chars or longer, so:
		if (str.length * count >= 1 << 28) {
			throw new RangeError('repeat count must not overflow maximum string size');
		}
		var rpt = '';
		for (var i = 0; i < count; i++) {
			rpt += str;
		}
		return rpt;
	}
}

/**
 * Number prototype 확장
 * @extends Number
 */

/**
 * 왼쪽에 특정 문자열로 패딩 처리
 * @category 자체확장
 * @param {Int} n 패딩 처리해서 몇 글자가 될지
 * @param {String} str 패딩 문자
 * @return {String} 패딩 처리된 String
 */
Number.prototype.padLeft = function(n, str){
    return this.toString().padLeft(n, str);
}

/**
 * 오른쪽 특정 문자열로 패딩 처리
 * @category 자체확장
 * @param {Int} n 패딩 처리해서 몇 글자가 될지
 * @param {String} str 패딩 문자
 * @return {String} 패딩 처리된 String
 */
Number.prototype.padRight = function(n, str){
    return this.toString().padRight(n, str);
}

/**
 * Int 형으로 변환. undefined 인 경우 0 리턴
 * @category 자체확장
 * @for String
 * @return {Int} 변환된(parseInt()) 숫자. String이 undefined인 경우에는 0
 */
String.prototype.toInt = function(){
    if(!this || this == ''){
        return 0;
    }
    return parseInt(this.split('.').join('').split('-').join('').split('/').join(''), 10);
}

/**
 * Int 형으로 변환. undefined 인 경우 0 리턴
 * @category 자체확장
 * @for Number
 * @return {Int} 변환된(parseInt()) 숫자. Number가 undefined인 경우에는 0
 */
Number.prototype.toInt = function(){
    if(this == undefined){
        return 0;
    }
    return parseInt(this.toString().split('.').join('').split('-').join('').split('/').join(''), 10);
}

/**
 * 연월일 구분자 삽입 (YYYYMMDD -> YYYY-MM-DD)
 * @category 자체확장
 * @for String
 * @param {String} format 연월일 구분자 포맷
 * format|결과
 * ---|---
 * full|2018년02년03월
 * dash|2018-02-03
 * \*|2018\*02\*03
 * @return {String} 변환된 String.
 */
String.prototype.formatDate = function(format){
	// YYYYMDD 를 변환
	var v = this.split('.').join('').split('-').join('').split('/').join('');
    var year = v.substr(0,4);
    var month = v.substr(4,2);
    var day = v.substr(6,2);

    var result = year + '.' + month + '.' + day;

    if (format == 'full') {
        result = year + '년 ' + month + '월 ' + day + '일';
    } else if (format == 'dash') {
        result = year + '-' + month + '-' + day;
    }else if(format != undefined){
        result = year + format + month + format + day;
    }

    return result;
}

/**
 * 문자열 Date 로 변환
 * @category 자체확장
 * @for String
 * @return {Date} 변환된 Date.
 */
String.prototype.getDate = function(){
	// YYYYMDD 를 변환
	var dateString = this.split('.').join('').split('-').join('').split('/').join('');

	var year = Number(dateString.substr(0,4));
	var month = Number(dateString.substr(4,2));
	var date = Number(dateString.substr(6,2));
	var result = new Date(year,month - 1,date);

	return result;
}

/**
 * 숫자를 날짜 문자열로 변환
 * @category 자체확장
 * @for Number
 * @return {Date} 변환된 날짜 문자열. "YYYY-MM-DD"
 */
Number.prototype.formatDate = function(format){
	return this.toString().formatDate(format);
}

/**
 * 천단위 콤마 추가된 문자열로 변환
 * @category 자체확장
 * @for String
 * @return {String} 변환된 금액 String. ex) 1,221,500
 */
String.prototype.formatNumber = function(n){   
    if (!this || this == '')
		return '0';

	var sValue = this.toString();

	if(n){
		sValue = parseInt((parseInt(sValue) / n)).toString();
	}
	var sRegExp = new RegExp('(-?[0-9]+)([0-9]{3})');
        
    var sep = ',';
    while (sRegExp.test(sValue)) {
        sValue = sValue.replace(sRegExp, '$1' + sep + '$2');
    }
    return sValue;    
}

/**
 * 천단위 콤마 추가된 문자열로 변환
 * @category 자체확장
 * @for Number
 * @return {String} 변환된 금액 String. ex) 1,221,500
 */
Number.prototype.formatNumber = function(n){
    if (!this || this == '')
    return '0';

	if(n){
		return parseInt((this / n)).toString().formatNumber();
	}else{
		return this.toString().formatNumber();
	}
}

/**
 * Date prototype 확장
 * @extends Date
 */

/**
 * Date에서 YYYYMMDD 형태의 문자열 얻음
 * @category 자체확장
 * @for Date
 * @return {String} YYYYMMDD 형태로 변환된 문자열.
 */
Date.prototype.yyyymmdd = function() {
	var yyyy = String(this.getFullYear());
	var month = this.getMonth() + 1;
	var day = this.getDate();
	return yyyy + '' + (month < 10 ? '0' + String(month) : String(month)) + '' + (day < 10 ? '0' + String(day) : String(day));
}

/// @endclass

/**
 * Flash 파일 관리 기능
 * @class swfobject
 */
var swfobject = function() {

    var UNDEF = "undefined",
        OBJECT = "object",
        SHOCKWAVE_FLASH = "Shockwave Flash",
        SHOCKWAVE_FLASH_AX = "ShockwaveFlash.ShockwaveFlash",
        FLASH_MIME_TYPE = "application/x-shockwave-flash",
        EXPRESS_INSTALL_ID = "SWFObjectExprInst",
        ON_READY_STATE_CHANGE = "onreadystatechange",

        win = window,
        doc = document,
        nav = navigator,

        plugin = false,
        domLoadFnArr = [],
        regObjArr = [],
        objIdArr = [],
        listenersArr = [],
        storedFbContent,
        storedFbContentId,
        storedCallbackFn,
        storedCallbackObj,
        isDomLoaded = false,
        isExpressInstallActive = false,
        dynamicStylesheet,
        dynamicStylesheetMedia,
        autoHideShow = true,
        encodeURIEnabled = false,

        /* Centralized function for browser feature detection
            - User agent string detection is only used when no good alternative is possible
            - Is executed directly for optimal performance
        */
        ua = function() {
            var w3cdom = typeof doc.getElementById !== UNDEF && typeof doc.getElementsByTagName !== UNDEF && typeof doc.createElement !== UNDEF,
                u = nav.userAgent.toLowerCase(),
                p = nav.platform.toLowerCase(),
                windows = p ? /win/.test(p) : /win/.test(u),
                mac = p ? /mac/.test(p) : /mac/.test(u),
                webkit = /webkit/.test(u) ? parseFloat(u.replace(/^.*webkit\/(\d+(\.\d+)?).*$/, "$1")) : false, // returns either the webkit version or false if not webkit
                ie = nav.appName === "Microsoft Internet Explorer",
                playerVersion = [0, 0, 0],
                d = null;
            if (typeof nav.plugins !== UNDEF && typeof nav.plugins[SHOCKWAVE_FLASH] === OBJECT) {
                d = nav.plugins[SHOCKWAVE_FLASH].description;
                // nav.mimeTypes["application/x-shockwave-flash"].enabledPlugin indicates whether plug-ins are enabled or disabled in Safari 3+
                if (d && (typeof nav.mimeTypes !== UNDEF && nav.mimeTypes[FLASH_MIME_TYPE] && nav.mimeTypes[FLASH_MIME_TYPE].enabledPlugin)) {
                    plugin = true;
                    ie = false; // cascaded feature detection for Internet Explorer
                    d = d.replace(/^.*\s+(\S+\s+\S+$)/, "$1");
                    playerVersion[0] = toInt(d.replace(/^(.*)\..*$/, "$1"));
                    playerVersion[1] = toInt(d.replace(/^.*\.(.*)\s.*$/, "$1"));
                    playerVersion[2] = /[a-zA-Z]/.test(d) ? toInt(d.replace(/^.*[a-zA-Z]+(.*)$/, "$1")) : 0;
                }
            } else if (typeof win.ActiveXObject !== UNDEF) {
                try {
                    var a = new ActiveXObject(SHOCKWAVE_FLASH_AX);
                    if (a) { // a will return null when ActiveX is disabled
                        d = a.GetVariable("$version");
                        if (d) {
                            ie = true; // cascaded feature detection for Internet Explorer
                            d = d.split(" ")[1].split(",");
                            playerVersion = [toInt(d[0]), toInt(d[1]), toInt(d[2])];
                        }
                    }
                } catch (e) {}
            }
            return { w3: w3cdom, pv: playerVersion, wk: webkit, ie: ie, win: windows, mac: mac };
        }(),

        /* Cross-browser onDomLoad
            - Will fire an event as soon as the DOM of a web page is loaded
            - Internet Explorer workaround based on Diego Perini's solution: http://javascript.nwbox.com/IEContentLoaded/
            - Regular onload serves as fallback
        */
        onDomLoad = function() {
            if (!ua.w3) {
                return; }
            if ((typeof doc.readyState !== UNDEF && (doc.readyState === "complete" || doc.readyState === "interactive")) || (typeof doc.readyState === UNDEF && (doc.getElementsByTagName("body")[0] || doc.body))) { // function is fired after onload, e.g. when script is inserted dynamically
                callDomLoadFunctions();
            }
            if (!isDomLoaded) {
                if (typeof doc.addEventListener !== UNDEF) {
                    doc.addEventListener("DOMContentLoaded", callDomLoadFunctions, false);
                }
                if (ua.ie) {
                    doc.attachEvent(ON_READY_STATE_CHANGE, function detach() {
                        if (doc.readyState === "complete") {
                            doc.detachEvent(ON_READY_STATE_CHANGE, detach);
                            callDomLoadFunctions();
                        }
                    });
                    if (win == top) { // if not inside an iframe
                        (function checkDomLoadedIE() {
                            if (isDomLoaded) {
                                return; }
                            try {
                                doc.documentElement.doScroll("left");
                            } catch (e) {
                                setTimeout(checkDomLoadedIE, 0);
                                return;
                            }
                            callDomLoadFunctions();
                        }());
                    }
                }
                if (ua.wk) {
                    (function checkDomLoadedWK() {
                        if (isDomLoaded) {
                            return; }
                        if (!/loaded|complete/.test(doc.readyState)) {
                            setTimeout(checkDomLoadedWK, 0);
                            return;
                        }
                        callDomLoadFunctions();
                    }());
                }
            }
        }();

    function callDomLoadFunctions() {
        if (isDomLoaded || !document.getElementsByTagName("body")[0]) {
            return; }
        try { // test if we can really add/remove elements to/from the DOM; we don't want to fire it too early
            var t, span = createElement("span");
            span.style.display = "none"; //hide the span in case someone has styled spans via CSS
            t = doc.getElementsByTagName("body")[0].appendChild(span);
            t.parentNode.removeChild(t);
            t = null; //clear the variables
            span = null;
        } catch (e) {
            return; }
        isDomLoaded = true;
        var dl = domLoadFnArr.length;
        for (var i = 0; i < dl; i++) {
            domLoadFnArr[i]();
        }
    }

    function addDomLoadEvent(fn) {
        if (isDomLoaded) {
            fn();
        } else {
            domLoadFnArr[domLoadFnArr.length] = fn; // Array.push() is only available in IE5.5+
        }
    }

    /* Cross-browser onload
        - Based on James Edwards' solution: http://brothercake.com/site/resources/scripts/onload/
        - Will fire an event as soon as a web page including all of its assets are loaded
     */
    function addLoadEvent(fn) {
        if (typeof win.addEventListener !== UNDEF) {
            win.addEventListener("load", fn, false);
        } else if (typeof doc.addEventListener !== UNDEF) {
            doc.addEventListener("load", fn, false);
        } else if (typeof win.attachEvent !== UNDEF) {
            addListener(win, "onload", fn);
        } else if (typeof win.onload === "function") {
            var fnOld = win.onload;
            win.onload = function() {
                fnOld();
                fn();
            };
        } else {
            win.onload = fn;
        }
    }

    /* Detect the Flash Player version for non-Internet Explorer browsers
        - Detecting the plug-in version via the object element is more precise than using the plugins collection item's description:
          a. Both release and build numbers can be detected
          b. Avoid wrong descriptions by corrupt installers provided by Adobe
          c. Avoid wrong descriptions by multiple Flash Player entries in the plugin Array, caused by incorrect browser imports
        - Disadvantage of this method is that it depends on the availability of the DOM, while the plugins collection is immediately available
    */
    function testPlayerVersion() {
        var b = doc.getElementsByTagName("body")[0];
        var o = createElement(OBJECT);
        o.setAttribute("style", "visibility: hidden;");
        o.setAttribute("type", FLASH_MIME_TYPE);
        var t = b.appendChild(o);
        if (t) {
            var counter = 0;
            (function checkGetVariable() {
                if (typeof t.GetVariable !== UNDEF) {
                    try {
                        var d = t.GetVariable("$version");
                        if (d) {
                            d = d.split(" ")[1].split(",");
                            ua.pv = [toInt(d[0]), toInt(d[1]), toInt(d[2])];
                        }
                    } catch (e) {
                        //t.GetVariable("$version") is known to fail in Flash Player 8 on Firefox
                        //If this error is encountered, assume FP8 or lower. Time to upgrade.
                        ua.pv = [8, 0, 0];
                    }
                } else if (counter < 10) {
                    counter++;
                    setTimeout(checkGetVariable, 10);
                    return;
                }
                b.removeChild(o);
                t = null;
                matchVersions();
            }());
        } else {
            matchVersions();
        }
    }

    /* Perform Flash Player and SWF version matching; static publishing only
     */
    function matchVersions() {
        var rl = regObjArr.length;
        if (rl > 0) {
            for (var i = 0; i < rl; i++) { // for each registered object element
                var id = regObjArr[i].id;
                var cb = regObjArr[i].callbackFn;
                var cbObj = { success: false, id: id };
                if (ua.pv[0] > 0) {
                    var obj = getElementById(id);
                    if (obj) {
                        if (hasPlayerVersion(regObjArr[i].swfVersion) && !(ua.wk && ua.wk < 312)) { // Flash Player version >= published SWF version: Houston, we have a match!
                            setVisibility(id, true);
                            if (cb) {
                                cbObj.success = true;
                                cbObj.ref = getObjectById(id);
                                cbObj.id = id;
                                cb(cbObj);
                            }
                        } else if (regObjArr[i].expressInstall && canExpressInstall()) { // show the Adobe Express Install dialog if set by the web page author and if supported
                            var att = {};
                            att.data = regObjArr[i].expressInstall;
                            att.width = obj.getAttribute("width") || "0";
                            att.height = obj.getAttribute("height") || "0";
                            if (obj.getAttribute("class")) { att.styleclass = obj.getAttribute("class"); }
                            if (obj.getAttribute("align")) { att.align = obj.getAttribute("align"); }
                            // parse HTML object param element's name-value pairs
                            var par = {};
                            var p = obj.getElementsByTagName("param");
                            var pl = p.length;
                            for (var j = 0; j < pl; j++) {
                                if (p[j].getAttribute("name").toLowerCase() !== "movie") {
                                    par[p[j].getAttribute("name")] = p[j].getAttribute("value");
                                }
                            }
                            showExpressInstall(att, par, id, cb);
                        } else { // Flash Player and SWF version mismatch or an older Webkit engine that ignores the HTML object element's nested param elements: display fallback content instead of SWF
                            displayFbContent(obj);
                            if (cb) { cb(cbObj); }
                        }
                    }
                } else { // if no Flash Player is installed or the fp version cannot be detected we let the HTML object element do its job (either show a SWF or fallback content)
                    setVisibility(id, true);
                    if (cb) {
                        var o = getObjectById(id); // test whether there is an HTML object element or not
                        if (o && typeof o.SetVariable !== UNDEF) {
                            cbObj.success = true;
                            cbObj.ref = o;
                            cbObj.id = o.id;
                        }
                        cb(cbObj);
                    }
                }
            }
        }
    }

    /* Main function
        - Will preferably execute onDomLoad, otherwise onload (as a fallback)
    */
    domLoadFnArr[0] = function() {
        if (plugin) {
            testPlayerVersion();
        } else {
            matchVersions();
        }
    };

    function getObjectById(objectIdStr) {
        var r = null,
            o = getElementById(objectIdStr);

        if (o && o.nodeName.toUpperCase() === "OBJECT") {
            //If targeted object is valid Flash file
            if (typeof o.SetVariable !== UNDEF) {
                r = o;
            } else {
                //If SetVariable is not working on targeted object but a nested object is
                //available, assume classic nested object markup. Return nested object.

                //If SetVariable is not working on targeted object and there is no nested object,
                //return the original object anyway. This is probably new simplified markup.

                r = o.getElementsByTagName(OBJECT)[0] || o;
            }
        }

        return r;
    }

    /* Requirements for Adobe Express Install
        - only one instance can be active at a time
        - fp 6.0.65 or higher
        - Win/Mac OS only
        - no Webkit engines older than version 312
    */
    function canExpressInstall() {
        return !isExpressInstallActive && hasPlayerVersion("6.0.65") && (ua.win || ua.mac) && !(ua.wk && ua.wk < 312);
    }

    /* Show the Adobe Express Install dialog
        - Reference: http://www.adobe.com/cfusion/knowledgebase/index.cfm?id=6a253b75
    */
    function showExpressInstall(att, par, replaceElemIdStr, callbackFn) {

        var obj = getElementById(replaceElemIdStr);

        //Ensure that replaceElemIdStr is really a string and not an element
        replaceElemIdStr = getId(replaceElemIdStr);

        isExpressInstallActive = true;
        storedCallbackFn = callbackFn || null;
        storedCallbackObj = { success: false, id: replaceElemIdStr };

        if (obj) {
            if (obj.nodeName.toUpperCase() === "OBJECT") { // static publishing
                storedFbContent = abstractFbContent(obj);
                storedFbContentId = null;
            } else { // dynamic publishing
                storedFbContent = obj;
                storedFbContentId = replaceElemIdStr;
            }
            att.id = EXPRESS_INSTALL_ID;
            if (typeof att.width === UNDEF || (!/%$/.test(att.width) && toInt(att.width) < 310)) { att.width = "310"; }
            if (typeof att.height === UNDEF || (!/%$/.test(att.height) && toInt(att.height) < 137)) { att.height = "137"; }
            var pt = ua.ie ? "ActiveX" : "PlugIn",
                fv = "MMredirectURL=" + encodeURIComponent(win.location.toString().replace(/&/g, "%26")) + "&MMplayerType=" + pt + "&MMdoctitle=" + encodeURIComponent(doc.title.slice(0, 47) + " - Flash Player Installation");
            if (typeof par.flashvars !== UNDEF) {
                par.flashvars += "&" + fv;
            } else {
                par.flashvars = fv;
            }
            // IE only: when a SWF is loading (AND: not available in cache) wait for the readyState of the object element to become 4 before removing it,
            // because you cannot properly cancel a loading SWF file without breaking browser load references, also obj.onreadystatechange doesn't work
            if (ua.ie && obj.readyState != 4) {
                var newObj = createElement("div");
                replaceElemIdStr += "SWFObjectNew";
                newObj.setAttribute("id", replaceElemIdStr);
                obj.parentNode.insertBefore(newObj, obj); // insert placeholder div that will be replaced by the object element that loads expressinstall.swf
                obj.style.display = "none";
                removeSWF(obj); //removeSWF accepts elements now
            }
            createSWF(att, par, replaceElemIdStr);
        }
    }

    /* Functions to abstract and display fallback content
     */
    function displayFbContent(obj) {
        if (ua.ie && obj.readyState != 4) {
            // IE only: when a SWF is loading (AND: not available in cache) wait for the readyState of the object element to become 4 before removing it,
            // because you cannot properly cancel a loading SWF file without breaking browser load references, also obj.onreadystatechange doesn't work
            obj.style.display = "none";
            var el = createElement("div");
            obj.parentNode.insertBefore(el, obj); // insert placeholder div that will be replaced by the fallback content
            el.parentNode.replaceChild(abstractFbContent(obj), el);
            removeSWF(obj); //removeSWF accepts elements now
        } else {
            obj.parentNode.replaceChild(abstractFbContent(obj), obj);
        }
    }

    function abstractFbContent(obj) {
        var ac = createElement("div");
        if (ua.win && ua.ie) {
            ac.innerHTML = obj.innerHTML;
        } else {
            var nestedObj = obj.getElementsByTagName(OBJECT)[0];
            if (nestedObj) {
                var c = nestedObj.childNodes;
                if (c) {
                    var cl = c.length;
                    for (var i = 0; i < cl; i++) {
                        if (!(c[i].nodeType == 1 && c[i].nodeName === "PARAM") && !(c[i].nodeType == 8)) {
                            ac.appendChild(c[i].cloneNode(true));
                        }
                    }
                }
            }
        }
        return ac;
    }

    function createIeObject(url, paramStr) {
        var div = createElement("div");
        div.innerHTML = "<object classid='clsid:D27CDB6E-AE6D-11cf-96B8-444553540000'><param name='movie' value='" + url + "'>" + paramStr + "</object>";
        return div.firstChild;
    }

    /* Cross-browser dynamic SWF creation
     */
    function createSWF(attObj, parObj, id) {
        var r, el = getElementById(id);
        id = getId(id); // ensure id is truly an ID and not an element

        if (ua.wk && ua.wk < 312) {
            return r; }

        if (el) {
            var o = (ua.ie) ? createElement("div") : createElement(OBJECT),
                attr,
                attrLower,
                param;

            if (typeof attObj.id === UNDEF) { // if no 'id' is defined for the object element, it will inherit the 'id' from the fallback content
                attObj.id = id;
            }

            //Add params
            for (param in parObj) {
                //filter out prototype additions from other potential libraries and IE specific param element
                if (parObj.hasOwnProperty(param) && param.toLowerCase() !== "movie") {
                    createObjParam(o, param, parObj[param]);
                }
            }

            //Create IE object, complete with param nodes
            if (ua.ie) { o = createIeObject(attObj.data, o.innerHTML); }

            //Add attributes to object
            for (attr in attObj) {
                if (attObj.hasOwnProperty(attr)) { // filter out prototype additions from other potential libraries
                    attrLower = attr.toLowerCase();

                    // 'class' is an ECMA4 reserved keyword
                    if (attrLower === "styleclass") {
                        o.setAttribute("class", attObj[attr]);
                    } else if (attrLower !== "classid" && attrLower !== "data") {
                        o.setAttribute(attr, attObj[attr]);
                    }
                }
            }

            if (ua.ie) {
                objIdArr[objIdArr.length] = attObj.id; // stored to fix object 'leaks' on unload (dynamic publishing only)
            } else {
                o.setAttribute("type", FLASH_MIME_TYPE);
                o.setAttribute("data", attObj.data);
            }

            el.parentNode.replaceChild(o, el);
            r = o;
        }

        return r;
    }

    function createObjParam(el, pName, pValue) {
        var p = createElement("param");
        p.setAttribute("name", pName);
        p.setAttribute("value", pValue);
        el.appendChild(p);
    }

    /* Cross-browser SWF removal
        - Especially needed to safely and completely remove a SWF in Internet Explorer
    */
    function removeSWF(id) {
        var obj = getElementById(id);
        if (obj && obj.nodeName.toUpperCase() === "OBJECT") {
            if (ua.ie) {
                obj.style.display = "none";
                (function removeSWFInIE() {
                    if (obj.readyState == 4) {
                        //This step prevents memory leaks in Internet Explorer
                        for (var i in obj) {
                            if (typeof obj[i] === "function") {
                                obj[i] = null;
                            }
                        }
                        obj.parentNode.removeChild(obj);
                    } else {
                        setTimeout(removeSWFInIE, 10);
                    }
                }());
            } else {
                obj.parentNode.removeChild(obj);
            }
        }
    }

    function isElement(id) {
        return (id && id.nodeType && id.nodeType === 1);
    }

    function getId(thing) {
        return (isElement(thing)) ? thing.id : thing;
    }

    /* Functions to optimize JavaScript compression
     */
    function getElementById(id) {

        //Allow users to pass an element OR an element's ID
        if (isElement(id)) {
            return id; }

        var el = null;
        try {
            el = doc.getElementById(id);
        } catch (e) {}
        return el;
    }

    function createElement(el) {
        return doc.createElement(el);
    }

    //To aid compression; replaces 14 instances of pareseInt with radix
    function toInt(str) {
        return parseInt(str, 10);
    }

    /* Updated attachEvent function for Internet Explorer
        - Stores attachEvent information in an Array, so on unload the detachEvent functions can be called to avoid memory leaks
    */
    function addListener(target, eventType, fn) {
        target.attachEvent(eventType, fn);
        listenersArr[listenersArr.length] = [target, eventType, fn];
    }

    /* Flash Player and SWF content version matching
     */
    function hasPlayerVersion(rv) {
        rv += ""; //Coerce number to string, if needed.
        var pv = ua.pv,
            v = rv.split(".");
        v[0] = toInt(v[0]);
        v[1] = toInt(v[1]) || 0; // supports short notation, e.g. "9" instead of "9.0.0"
        v[2] = toInt(v[2]) || 0;
        return (pv[0] > v[0] || (pv[0] == v[0] && pv[1] > v[1]) || (pv[0] == v[0] && pv[1] == v[1] && pv[2] >= v[2])) ? true : false;
    }

    /* Cross-browser dynamic CSS creation
        - Based on Bobby van der Sluis' solution: http://www.bobbyvandersluis.com/articles/dynamicCSS.php
    */
    function createCSS(sel, decl, media, newStyle) {
        var h = doc.getElementsByTagName("head")[0];
        if (!h) {
            return; } // to also support badly authored HTML pages that lack a head element
        var m = (typeof media === "string") ? media : "screen";
        if (newStyle) {
            dynamicStylesheet = null;
            dynamicStylesheetMedia = null;
        }
        if (!dynamicStylesheet || dynamicStylesheetMedia != m) {
            // create dynamic stylesheet + get a global reference to it
            var s = createElement("style");
            s.setAttribute("type", "text/css");
            s.setAttribute("media", m);
            dynamicStylesheet = h.appendChild(s);
            if (ua.ie && typeof doc.styleSheets !== UNDEF && doc.styleSheets.length > 0) {
                dynamicStylesheet = doc.styleSheets[doc.styleSheets.length - 1];
            }
            dynamicStylesheetMedia = m;
        }
        // add style rule
        if (dynamicStylesheet) {
            if (typeof dynamicStylesheet.addRule !== UNDEF) {
                dynamicStylesheet.addRule(sel, decl);
            } else if (typeof doc.createTextNode !== UNDEF) {
                dynamicStylesheet.appendChild(doc.createTextNode(sel + " {" + decl + "}"));
            }
        }
    }

    function setVisibility(id, isVisible) {
        if (!autoHideShow) {
            return; 
        }
        var v = isVisible ? "visible" : "hidden",
            el = getElementById(id);
        if (isDomLoaded && el) {
            el.style.visibility = v;
        } else if (typeof id === "string") {
            createCSS("#" + id, "visibility:" + v);
        }
    }

    /* Filter to avoid XSS attacks
     */
    function urlEncodeIfNecessary(s) {
        var regex = /[\\\"<>\.;]/;
        var hasBadChars = regex.exec(s) !== null;
        return hasBadChars && typeof encodeURIComponent !== UNDEF ? encodeURIComponent(s) : s;
    }

    /* Release memory to avoid memory leaks caused by closures, fix hanging audio/video threads and force open sockets/NetConnections to disconnect (Internet Explorer only)
     */
    var cleanup = function() {
        if (ua.ie) {
            window.attachEvent("onunload", function() {
                // remove listeners to avoid memory leaks
                var ll = listenersArr.length;
                for (var i = 0; i < ll; i++) {
                    listenersArr[i][0].detachEvent(listenersArr[i][1], listenersArr[i][2]);
                }
                // cleanup dynamically embedded objects to fix audio/video threads and force open sockets and NetConnections to disconnect
                var il = objIdArr.length;
                for (var j = 0; j < il; j++) {
                    removeSWF(objIdArr[j]);
                }
                // cleanup library's main closures to avoid memory leaks
                for (var k in ua) {
                    ua[k] = null;
                }
                ua = null;
                for (var l in swfobject) {
                    swfobject[l] = null;
                }
                swfobject = null;
            });
        }
    }();

    return {
        /* Public API
            - Reference: http://code.google.com/p/swfobject/wiki/documentation
        */
        registerObject: function(objectIdStr, swfVersionStr, xiSwfUrlStr, callbackFn) {
            if (ua.w3 && objectIdStr && swfVersionStr) {
                var regObj = {};
                regObj.id = objectIdStr;
                regObj.swfVersion = swfVersionStr;
                regObj.expressInstall = xiSwfUrlStr;
                regObj.callbackFn = callbackFn;
                regObjArr[regObjArr.length] = regObj;
                setVisibility(objectIdStr, false);
            } else if (callbackFn) {
                callbackFn({ success: false, id: objectIdStr });
            }
        },

        getObjectById: function(objectIdStr) {
            if (ua.w3) {
                return getObjectById(objectIdStr);
            }
        },

        embedSWF: function(swfUrlStr, replaceElemIdStr, widthStr, heightStr, swfVersionStr, xiSwfUrlStr, flashvarsObj, parObj, attObj, callbackFn) {
            var id = getId(replaceElemIdStr),
                callbackObj = { success: false, id: id };

            if (ua.w3 && !(ua.wk && ua.wk < 312) && swfUrlStr && replaceElemIdStr && widthStr && heightStr && swfVersionStr) {
                setVisibility(id, false);
                addDomLoadEvent(function() {
                    widthStr += ""; // auto-convert to string
                    heightStr += "";
                    var att = {};
                    if (attObj && typeof attObj === OBJECT) {
                        for (var i in attObj) { // copy object to avoid the use of references, because web authors often reuse attObj for multiple SWFs
                            att[i] = attObj[i];
                        }
                    }
                    att.data = swfUrlStr;
                    att.width = widthStr;
                    att.height = heightStr;
                    var par = {};
                    if (parObj && typeof parObj === OBJECT) {
                        for (var j in parObj) { // copy object to avoid the use of references, because web authors often reuse parObj for multiple SWFs
                            par[j] = parObj[j];
                        }
                    }
                    if (flashvarsObj && typeof flashvarsObj === OBJECT) {
                        for (var k in flashvarsObj) { // copy object to avoid the use of references, because web authors often reuse flashvarsObj for multiple SWFs
                            if (flashvarsObj.hasOwnProperty(k)) {

                                var key = (encodeURIEnabled) ? encodeURIComponent(k) : k,
                                    value = (encodeURIEnabled) ? encodeURIComponent(flashvarsObj[k]) : flashvarsObj[k];

                                if (typeof par.flashvars !== UNDEF) {
                                    par.flashvars += "&" + key + "=" + value;
                                } else {
                                    par.flashvars = key + "=" + value;
                                }

                            }
                        }
                    }
                    if (hasPlayerVersion(swfVersionStr)) { // create SWF
                        var obj = createSWF(att, par, replaceElemIdStr);
                        if (att.id == id) {
                            setVisibility(id, true);
                        }
                        callbackObj.success = true;
                        callbackObj.ref = obj;
                        callbackObj.id = obj.id;
                    } else if (xiSwfUrlStr && canExpressInstall()) { // show Adobe Express Install
                        att.data = xiSwfUrlStr;
                        showExpressInstall(att, par, replaceElemIdStr, callbackFn);
                        return;
                    } else { // show fallback content
                        setVisibility(id, true);
                    }
                    if (callbackFn) { callbackFn(callbackObj); }
                });
            } else if (callbackFn) { callbackFn(callbackObj); }
        },

        switchOffAutoHideShow: function() {
            autoHideShow = false;
        },

        enableUriEncoding: function(bool) {
            encodeURIEnabled = (typeof bool === UNDEF) ? true : bool;
        },

        ua: ua,

        getFlashPlayerVersion: function() {
            return { major: ua.pv[0], minor: ua.pv[1], release: ua.pv[2] };
        },

        hasFlashPlayerVersion: hasPlayerVersion,

        createSWF: function(attObj, parObj, replaceElemIdStr) {
            if (ua.w3) {
                return createSWF(attObj, parObj, replaceElemIdStr);
            } else {
                return undefined;
            }
        },

        showExpressInstall: function(att, par, replaceElemIdStr, callbackFn) {
            if (ua.w3 && canExpressInstall()) {
                showExpressInstall(att, par, replaceElemIdStr, callbackFn);
            }
        },

        removeSWF: function(objElemIdStr) {
            if (ua.w3) {
                removeSWF(objElemIdStr);
            }
        },

        createCSS: function(selStr, declStr, mediaStr, newStyleBoolean) {
            if (ua.w3) {
                createCSS(selStr, declStr, mediaStr, newStyleBoolean);
            }
        },

        addDomLoadEvent: addDomLoadEvent,

        addLoadEvent: addLoadEvent,

        getQueryParamValue: function(param) {
            var q = doc.location.search || doc.location.hash;
            if (q) {
                if (/\?/.test(q)) { q = q.split("?")[1]; } // strip question mark
                if (!param) {
                    return urlEncodeIfNecessary(q);
                }
                var pairs = q.split("&");
                for (var i = 0; i < pairs.length; i++) {
                    if (pairs[i].substring(0, pairs[i].indexOf("=")) == param) {
                        return urlEncodeIfNecessary(pairs[i].substring((pairs[i].indexOf("=") + 1)));
                    }
                }
            }
            return "";
        },

        // For internal usage only
        expressInstallCallback: function() {
            if (isExpressInstallActive) {
                var obj = getElementById(EXPRESS_INSTALL_ID);
                if (obj && storedFbContent) {
                    obj.parentNode.replaceChild(storedFbContent, obj);
                    if (storedFbContentId) {
                        setVisibility(storedFbContentId, true);
                        if (ua.ie) { storedFbContent.style.display = "block"; }
                    }
                    if (storedCallbackFn) { storedCallbackFn(storedCallbackObj); }
                }
                isExpressInstallActive = false;
            }
        },

        version: "2.3"

    };
}();

/**
 * jQuery 추가 easing 함수들
 * @extends jQuery.easing
 */
jQuery.extend(jQuery.easing, {
	def: 'easeOutQuad',
	/// swing
    swing: function(x, t, b, c, d) {
        //alert(jQuery.easing.default);
        return jQuery.easing[jQuery.easing.def](x, t, b, c, d);
	},
	/// easeInQuad
    easeInQuad: function(x, t, b, c, d) {
        return c * (t /= d) * t + b;
	},
	/// easeOutQuad
    easeOutQuad: function(x, t, b, c, d) {
        return -c * (t /= d) * (t - 2) + b;
	},
	/// easeInOutQuad
    easeInOutQuad: function(x, t, b, c, d) {
        if ((t /= d / 2) < 1) return c / 2 * t * t + b;
        return -c / 2 * ((--t) * (t - 2) - 1) + b;
	},
	/// easeInCubic
    easeInCubic: function(x, t, b, c, d) {
        return c * (t /= d) * t * t + b;
    },
	/// easeOutCubic
    easeOutCubic: function(x, t, b, c, d) {
        return c * ((t = t / d - 1) * t * t + 1) + b;
	},
	/// easeInOutCubic
    easeInOutCubic: function(x, t, b, c, d) {
        if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
        return c / 2 * ((t -= 2) * t * t + 2) + b;
	},
	/// easeInQuart
    easeInQuart: function(x, t, b, c, d) {
        return c * (t /= d) * t * t * t + b;
	},
	/// easeOutQuart
    easeOutQuart: function(x, t, b, c, d) {
        return -c * ((t = t / d - 1) * t * t * t - 1) + b;
	},
	/// easeInOutQuart
    easeInOutQuart: function(x, t, b, c, d) {
        if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
        return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
	},
	/// easeInQuint
    easeInQuint: function(x, t, b, c, d) {
        return c * (t /= d) * t * t * t * t + b;
	},
	/// easeOutQuint
    easeOutQuint: function(x, t, b, c, d) {
        return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
	},
	/// easeInOutQuint
    easeInOutQuint: function(x, t, b, c, d) {
        if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
        return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
	},
	/// easeInSine
    easeInSine: function(x, t, b, c, d) {
        return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
	},
	/// easeOutSine
    easeOutSine: function(x, t, b, c, d) {
        return c * Math.sin(t / d * (Math.PI / 2)) + b;
	},
	/// easeInOutSine
    easeInOutSine: function(x, t, b, c, d) {
        return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
	},
	/// easeInExpo
    easeInExpo: function(x, t, b, c, d) {
        return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
	},
	/// easeOutExpo
    easeOutExpo: function(x, t, b, c, d) {
        return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
	},
	/// easeInOutExpo
    easeInOutExpo: function(x, t, b, c, d) {
        if (t == 0) return b;
        if (t == d) return b + c;
        if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
        return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
	},
	/// easeInCirc
    easeInCirc: function(x, t, b, c, d) {
        return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
	},
	/// easeOutCirc
    easeOutCirc: function(x, t, b, c, d) {
        return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
	},
	/// easeInOutCirc
    easeInOutCirc: function(x, t, b, c, d) {
        if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
        return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
	},
	/// easeInElastic
    easeInElastic: function(x, t, b, c, d) {
        var s = 1.70158;
        var p = 0;
        var a = c;
        if (t == 0) return b;
        if ((t /= d) == 1) return b + c;
        if (!p) p = d * .3;
        if (a < Math.abs(c)) { a = c;
            var s = p / 4; } else var s = p / (2 * Math.PI) * Math.asin(c / a);
        return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
	},
	/// easeOutElastic
    easeOutElastic: function(x, t, b, c, d) {
        var s = 1.70158;
        var p = 0;
        var a = c;
        if (t == 0) return b;
        if ((t /= d) == 1) return b + c;
        if (!p) p = d * .3;
        if (a < Math.abs(c)) { a = c;
            var s = p / 4; } else var s = p / (2 * Math.PI) * Math.asin(c / a);
        return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
	},
	/// easeInOutElastic
    easeInOutElastic: function(x, t, b, c, d) {
        var s = 1.70158;
        var p = 0;
        var a = c;
        if (t == 0) return b;
        if ((t /= d / 2) == 2) return b + c;
        if (!p) p = d * (.3 * 1.5);
        if (a < Math.abs(c)) { a = c;
            var s = p / 4; } else var s = p / (2 * Math.PI) * Math.asin(c / a);
        if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
        return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
	},
	/// easeInBack
    easeInBack: function(x, t, b, c, d, s) {
        if (s == undefined) s = 1.70158;
        return c * (t /= d) * t * ((s + 1) * t - s) + b;
	},
	/// easeOutBack
    easeOutBack: function(x, t, b, c, d, s) {
        if (s == undefined) s = 1.70158;
        return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
	},
	/// easeInOutBack
    easeInOutBack: function(x, t, b, c, d, s) {
        if (s == undefined) s = 1.70158;
        if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
        return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
	},
	/// easeInBounce
    easeInBounce: function(x, t, b, c, d) {
        return c - jQuery.easing.easeOutBounce(x, d - t, 0, c, d) + b;
	},
	/// easeOutBounce
    easeOutBounce: function(x, t, b, c, d) {
        if ((t /= d) < (1 / 2.75)) {
            return c * (7.5625 * t * t) + b;
        } else if (t < (2 / 2.75)) {
            return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
        } else if (t < (2.5 / 2.75)) {
            return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
        } else {
            return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
        }
	},
	/// easeInOutBounce
    easeInOutBounce: function(x, t, b, c, d) {
        if (t < d / 2) return jQuery.easing.easeInBounce(x, t * 2, 0, c, d) * .5 + b;
        return jQuery.easing.easeOutBounce(x, t * 2 - d, 0, c, d) * .5 + c * .5 + b;
    }
});


/*// shown.bs.popover position
$('[data-toggle=popover]').popover({
  placement: 'bottom',
  template: '<div class="popover" role="tooltip" style="margin-top:10px;"><div class="arrow" style="left:20%;"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
});


*/

// printThis start
//https://github.com/jasonday/printThis/blob/master/printThis.js
;
/**
 * Element 내용을 프린트
 * @class $.printThis
 * @type plugin
 * @for jQuery
 */
(function($) {
	var opt;
	/**
	 * Element 인쇄
	 * @param {Object} options
	 * 옵션|기본값|설명
	 * ---|---|---
	 *  debug| false | show the iframe for debugging
     *  importCSS| true | import parent page css
     *  importStyle| false| import style tags
     *  printContainer| true| print outer container/$.selector
     *  loadCSS| ""| load an additional css file - load multiple stylesheets with an array []
     *  pageTitle| ""| add title to print page
     *  removeInline| false| remove all inline styles
     *  printDelay| 333| variable print delay
     *  header| null| prefix to html
     *  formValues| true| preserve input/form values
     *  doctypeString| '<!DOCTYPE html>' | html doctype
	 * @example
	 *```js
	 *$('#contents').printThis();
	 *```
	 */
    $.fn.printThis = function(options) {
        opt = $.extend({}, $.fn.printThis.defaults, options);
        var $element = this instanceof jQuery ? this : $(this);

        var strFrameName = "printThis-" + (new Date()).getTime();
        if (window.location.hostname !== document.domain && navigator.userAgent.match(/msie/i)) {
            // Ugly IE hacks due to IE not inheriting document.domain from parent
            // checks if document.domain is set by comparing the host name against document.domain
            var iframeSrc = "javascript:document.write(\"<head><script>document.domain=\\\"" + document.domain + "\\\";</script></head><body></body>\")";
            var printI = document.createElement('iframe');
            printI.name = "printIframe";
            printI.id = strFrameName;
            printI.className = "MSIE";
            document.body.appendChild(printI);
            printI.src = iframeSrc;

        } else {
            // other browsers inherit document.domain, and IE works if document.domain is not explicitly set
            var $frame = $("<iframe id='" + strFrameName + "' name='printIframe' />");
            $frame.appendTo("body");
        }


        var $iframe = $("#" + strFrameName);

        // show frame if in debug mode
        if (!opt.debug) $iframe.css({
            position: "absolute",
            width: "0px",
            height: "0px",
            left: "-600px",
            top: "-600px"
        });


        // $iframe.ready() and $iframe.load were inconsistent between browsers    
        setTimeout(function() {

            // Add doctype to fix the style difference between printing and render
            function setDocType($iframe, doctype) {
                var win, doc;
                win = $iframe.get(0);
                win = win.contentWindow || win.contentDocument || win;
                doc = win.document || win.contentDocument || win;
                doc.open();
                doc.write(doctype);
                doc.close();
            }
            if (opt.doctypeString) {
                setDocType($iframe, opt.doctypeString);
            }

            var $doc = $iframe.contents(),
                $head = $doc.find("head"),
                $body = $doc.find("body");

            // add base tag to ensure elements use the parent domain
            var _host = document.location.host;
            if (document.location.protocol == 'file:') _host = document.location.pathname.split('index.html').join('');
            $head.append('<base href="' + document.location.protocol + '//' + _host + '">');

            // import page stylesheets
            if (opt.importCSS) $("link[rel=stylesheet]").each(function() {
                var href = $(this).attr("href");
                if (href) {
                    var media = $(this).attr("media") || "all";
                    $head.append("<link type='text/css' rel='stylesheet' href='" + href + "' media='" + media + "'>")
                }
            });

            // import style tags
            if (opt.importStyle) $("style").each(function() {
                $(this).clone().appendTo($head);
                //$head.append($(this));
            });

            //add title of the page
            if (opt.pageTitle) $head.append("<title>" + opt.pageTitle + "</title>");

            // import additional stylesheet(s)
            if (opt.loadCSS) {
                if ($.isArray(opt.loadCSS)) {
                    jQuery.each(opt.loadCSS, function(index, value) {
                        $head.append("<link type='text/css' rel='stylesheet' href='" + this + "'>");
                    });
                } else {
                    $head.append("<link type='text/css' rel='stylesheet' href='" + opt.loadCSS + "'>");
                }
            }

            // print header
            if (opt.header) $body.append(opt.header);

            // grab $.selector as container
            if (opt.printContainer) $body.append($element.outer());

            // otherwise just print interior elements of container
            else $element.each(function() {
                $body.append($(this).html());
            });

            // capture form/field values
            if (opt.formValues) {
                // loop through inputs
                var $input = $element.find('input');
                if ($input.length) {
                    $input.each(function() {
                        var $this = $(this),
                            $name = $(this).attr('name'),
                            $checker = $this.is(':checkbox') || $this.is(':radio'),
                            $iframeInput = $doc.find('input[name="' + $name + '"]'),
                            $value = $this.val();

                        //order matters here
                        if (!$checker) {
                            $iframeInput.val($value);
                        } else if ($this.is(':checked')) {
                            if ($this.is(':checkbox')) {
                                $iframeInput.attr('checked', 'checked');
                            } else if ($this.is(':radio')) {
                                $doc.find('input[name="' + $name + '"][value=' + $value + ']').attr('checked', 'checked');
                            }
                        }

                    });
                }

                //loop through selects
                var $select = $element.find('select');
                if ($select.length) {
                    $select.each(function() {
                        var $this = $(this),
                            $name = $(this).attr('name'),
                            $value = $this.val();
                        $doc.find('select[name="' + $name + '"]').val($value);
                    });
                }

                //loop through textareas
                var $textarea = $element.find('textarea');
                if ($textarea.length) {
                    $textarea.each(function() {
                        var $this = $(this),
                            $name = $(this).attr('name'),
                            $value = $this.val();
                        $doc.find('textarea[name="' + $name + '"]').val($value);
                    });
                }
            } // end capture form/field values

            // remove inline styles
            if (opt.removeInline) {
                // $.removeAttr available jQuery 1.7+
                if ($.isFunction($.removeAttr)) {
                    $doc.find("body *").removeAttr("style");
                } else {
                    $doc.find("body *").attr("style", "");
                }
            }

            setTimeout(function() {
                if ($iframe.hasClass("MSIE")) {
                    // check if the iframe was created with the ugly hack
                    // and perform another ugly hack out of neccessity
                    window.frames["printIframe"].focus();
                    $head.append("<script>  window.print(); </script>");
                } else {
                    // proper method
                    if (document.queryCommandSupported("print")) {
                        $iframe[0].contentWindow.document.execCommand("print", false, null);
                    } else {
                        $iframe[0].contentWindow.focus();
                        $iframe[0].contentWindow.print();
                    }
                }

                //remove iframe after print
                if (!opt.debug) {
                    setTimeout(function() {
                        $iframe.remove();
                    }, 1000);
                }

            }, opt.printDelay);

        }, 333);

    };

    // defaults
    $.fn.printThis.defaults = {
        debug: false, // show the iframe for debugging
        importCSS: true, // import parent page css
        importStyle: false, // import style tags
        printContainer: true, // print outer container/$.selector
        loadCSS: "", // load an additional css file - load multiple stylesheets with an array []
        pageTitle: "", // add title to print page
        removeInline: false, // remove all inline styles
        printDelay: 333, // variable print delay
        header: null, // prefix to html
        formValues: true, // preserve input/form values
        doctypeString: '<!DOCTYPE html>' // html doctype
    };

    // $.selector container
    jQuery.fn.outer = function() {
        return $($("<div></div>").html(this.clone())).html()
    }
})(jQuery);
// printThis end
// 
// 
// cookiejs start
/**
 * 쿠키 다루는 Class
 * @class sfdCookie
 */
! function(document, undefined) {

    var cookie = function() {
        return cookie.get.apply(cookie, arguments);
    };

    var utils = cookie.utils = {

        isArray: Array.isArray || function(value) {
            return Object.prototype.toString.call(value) === '[object Array]';
        },

        isPlainObject: function(value) {
            return !!value && Object.prototype.toString.call(value) === '[object Object]';
        },

        toArray: function(value) {
            return Array.prototype.slice.call(value);
        },

        getKeys: Object.keys || function(obj) {
            var keys = [],
                key = '';
            for (key in obj) {
                if (obj.hasOwnProperty(key)) keys.push(key);
            }
            return keys;
        },

        encode: function(value) {
            return String(value).replace(/[,;"\\=\s%]/g, function(character) {
                return encodeURIComponent(character);
            });
        },

        decode: function(value) {
            try{
                return decodeURIComponent(value);
            }catch(e){
                return value;
            }
        },

        retrieve: function(value, fallback) {
            return value == null ? fallback : value;
        }

    };
	/// 쿠키 기본 옵션 값들 expires, path, domain, secure
    cookie.defaults = {};
	
    cookie.expiresMultiplier = 60 * 60 * 24;

	/**
	 * 쿠키 설정
	 * @param {String} key 쿠키 키
	 * @param {String} value 쿠키 값
	 * @param {Object} options 옵션
	 * 옵션|설명
	 * ---|---
	 * expires|만료시간. Date, String 또는 일 단위 Number.
	 * path|경로
	 * domain|도메인
	 * secure|보안처리 여부 true 혹은 false
	 */
    cookie.set = function(key, value, options) {
        if (utils.isPlainObject(key)) {


            for (var k in key) {
                if (key.hasOwnProperty(k)) this.set(k, key[k], value);
            }
        } else {
            options = utils.isPlainObject(options) ? options : { expires: options };


            var expires = options.expires !== undefined ? options.expires : (this.defaults.expires || ''),
                expiresType = typeof(expires);

            if (expiresType === 'string' && expires !== '') expires = new Date(expires);
            else if (expiresType === 'number') expires = new Date(+new Date + 1000 * this.expiresMultiplier * expires); // This is needed because IE does not support the `max-age` cookie attribute.

            if (expires !== '' && 'toGMTString' in expires) expires = ';expires=' + expires.toGMTString();

            var path = options.path || this.defaults.path;
            path = path ? ';path=' + path : '';

            var domain = options.domain || this.defaults.domain;
            domain = domain ? ';domain=' + domain : '';

            var secure = options.secure || this.defaults.secure ? ';secure' : '';
            if (options.secure === false) secure = '';

            document.cookie = utils.encode(key) + '=' + utils.encode(value) + expires + path + domain + secure;
        }

        return this;
    };

    cookie.setDefault = function(key, value, options) {
        if (utils.isPlainObject(key)) {
            for (var k in key) {
                if (this.get(k) === undefined) this.set(k, key[k], value);
            }
            return cookie;
        } else {
            if (this.get(key) === undefined) return this.set.apply(this, arguments);
        }
    },

	/**
	 * 쿠키 삭제
	 * @param {*} keys 삭제하려는 쿠키 키. 여러개 삭제하고 싶으면 키 배열 입력.
	 */
    cookie.remove = function(keys) {
        keys = utils.isArray(keys) ? keys : utils.toArray(arguments);

        for (var i = 0, l = keys.length; i < l; i++) {
            this.set(keys[i], '', -1);
        }

        return this;
    };

	/// 모든 쿠키 삭제
    cookie.empty = function() {
        return this.remove(utils.getKeys(this.all()));
    };

	/**
	 * 쿠키 값 얻기
	 * @param {*} keys 값 얻으려는 쿠키의 키. 여러개 얻고 싶으면 키 배열 입력.
	 * @param {*} fallback 값이 없는 경우 기본 값
	 * @return {*}
	 * keys가 배열인 경우 {'key1': 'value1', 'key2': 'value2', ...} 형태의 Object.
	 * keys가 String인 경우 쿠키 값.
	 */
    cookie.get = function(keys, fallback) {
        var cookies = this.all();

        if (utils.isArray(keys)) {
            var result = {};

            for (var i = 0, l = keys.length; i < l; i++) {
                var value = keys[i];
                result[value] = utils.retrieve(cookies[value], fallback);
            }

            return result;

        } else return utils.retrieve(cookies[keys], fallback);
    };
	/**
	 * 모든 쿠키 얻기
	 * @return {Object}
	 * {'key1': 'value1', 'key2': 'value2', ...} 형태의 Object
	 */
    cookie.all = function() {
        if (document.cookie === '') return {};

        var cookies = document.cookie.split('; '),
            result = {};

        for (var i = 0, l = cookies.length; i < l; i++) {
            var item = cookies[i].split('=');
            var key = utils.decode(item.shift());
            var value = utils.decode(item.join('='));
            result[key] = value;
        }

        return result;
    };
	/**
	 * 현재 브라우져에서 쿠키 사용 가능한지 여부
	 * @return {Boolean}
	 * 쿠키 사용 가능한 상태면 true, 아니면 false.
	 */
    cookie.enabled = function() {
        if (navigator.cookieEnabled) return true;

        var ret = cookie.set('_', '_').get('_') === '_';
        cookie.remove('_');
        return ret;
    };

    window.sfdCookie = cookie;

    /*if (typeof define === 'function' && define.amd) {
        define(function () {
            return cookie;
        });
    } else if (typeof exports !== 'undefined') {
        exports.cookie = cookie;
    } else window.cookie = cookie;*/


}(typeof document === 'undefined' ? null : document);
// cookiejs end

(function ($) {
    function initData($el) {
        var _ARS_data = $el.data('_ARS_data');
        if (!_ARS_data) {
            _ARS_data = {
                rotateUnits: 'deg',
                scale: 1,
                rotate: 0
            };
            
            $el.data('_ARS_data', _ARS_data);
        }
        
        return _ARS_data;
    }
    
    function setTransform($el, data) {
        $el.css('transform', 'rotate(' + data.rotate + data.rotateUnits + ') scale(' + data.scale + ',' + data.scale + ')');
    }
    
    $.fn.rotate = function (val) {
        var $self = $(this), m, data = initData($self);
                        
        if (typeof val == 'undefined') {
            return data.rotate + data.rotateUnits;
        }
        
        m = val.toString().match(/^(-?\d+(\.\d+)?)(.+)?$/);
        if (m) {
            if (m[3]) {
                data.rotateUnits = m[3];
            }
            
            data.rotate = m[1];
            
            setTransform($self, data);
        }
        
        return this;
    };
    
    // Note that scale is unitless.
    $.fn.scale = function (val) {
        var $self = $(this), data = initData($self);
        
        if (typeof val == 'undefined') {
            return data.scale;
        }
        
        data.scale = val;
        
        setTransform($self, data);
        
        return this;
    };

    // fx.cur() must be monkey patched because otherwise it would always
    // return 0 for current rotate and scale values
    var curProxied = $.fx.prototype.cur;
    $.fx.prototype.cur = function () {
        if (this.prop == 'rotate') {
            return parseFloat($(this.elem).rotate());
            
        } else if (this.prop == 'scale') {
            return parseFloat($(this.elem).scale());
        }
        
        return curProxied.apply(this, arguments);
    };
    
    $.fx.step.rotate = function (fx) {
        var data = initData($(fx.elem));
        $(fx.elem).rotate(fx.now + data.rotateUnits);
    };
    
    $.fx.step.scale = function (fx) {
        $(fx.elem).scale(fx.now);
    };
    
    var animateProxied = $.fn.animate;
    $.fn.animate = function (prop) {
        if (typeof prop['rotate'] != 'undefined') {
            var $self, data, m = prop['rotate'].toString().match(/^(([+-]=)?(-?\d+(\.\d+)?))(.+)?$/);
            if (m && m[5]) {
                $self = $(this);
                data = initData($self);
                data.rotateUnits = m[5];
            }
            
            prop['rotate'] = m[1];
        }
        
        return animateProxied.apply(this, arguments);
    };
})(jQuery);

// setCursorToTextEnd end 
// 
// 
// start sfd component and plugin 
/**
 * jQuery 확장 함수들
 * @extends jQuery
 */
+ function($) {
    $.fn.extend({
		/**
		 * IE 오류 수정한 innerHTML/outerHTML 
		 * @param {Boolean} inner true면 innerHTML, false면 outerHTML 반환
		 * @return {String} IE 오류 수정한 innterHTML 또는 outerHTML
		 * @see
		 * - IE8에서는 속성의 값들 따옴표가 없는 등의 오류가 있어 이 부분 수정.
		 * - 기타 IE에서는 textarea에 placeholder 있는 경우 내용으로 들어가서 나오는 문제 수정.
		 */
		templateHTML: function(inner) {
			function fixIE8HTML(html) {
				// IE8에서 innerHTML/outerHTML 뽑으면 속성 값들에 따옴표 없어지는 등 깨지는거 수정
				var z = html.match(/(<.+[^>])/g);
				if (z) {
					for (var i = 0; i < z.length; i++) {
						var y;
						var zSaved = z[i];
						var attrRE = /\=[a-zA-Z\.\:\[\]_\(\)\&\$\%#\@\!0-9\/\-\{\}]+[?\s+|?>]/g;
						// z[i] = z[i].replace(/([<|<\/].+?\w+).+[^>]/, function(a) {
						// 	return a.toLowerCase();
						// });
						y = z[i].match(attrRE);
						if (y) {
							var j = 0
							var len = y.length;
							while (j < len) {
								var replaceRE = /(\=)([a-zA-Z\.\:\[\]_\(\)\&\$\%#\@\!0-9\/\-\{\}]+)?([\s+|?>])/g;
								var replacer  = function() {
									var args = Array.prototype.slice.call(arguments);
									return '="' + args[2] + '"' + args[3];
								};
								z[i] = z[i].replace(y[j], y[j].replace(replaceRE, replacer));
								j += 1;
							}
						}
						html = html.replace(zSaved, z[i]);
					}
				}
				return html;
			}

			var $clone = this.clone();

			var isIE = !!navigator.userAgent.match(/msie|trident/i);
			if (isIE) {
				var replacePlaceholder = function() {
					var placeholder = $(this).attr('placeholder');
					var value = $(this).val();
					if (!value || value == placeholder) {
						$(this).attr('temp-ie-placeholder', placeholder).removeAttr('placeholder').val('');
					}
				}
				// IE 버그로 textarea에 placeholder 값이 실제 텍스트 내용으로 들어가는거 때문에...
				if ($clone.is('textarea[placeholder]')) {
					replacePlaceholder.call(this[0]);
				} else {
					$clone.find('textarea[placeholder]').each(replacePlaceholder);
				}
			}

			var result = (inner === true ? $clone[0].innerHTML : $clone[0].outerHTML) || '';

			var isIE8Below = !!navigator.userAgent.match(/msie\s[5-8]/i);
			if (isIE8Below) {
				// IE8에서
				result = fixIE8HTML(result);
			}

			if (isIE) {
				result = result.replace(/temp\-ie\-placeholder/g, 'placeholder');
			}
			return result;
		},

		/**
		 * HTML 템플릿에 값 채워서 추가
		 * @param {Object} options 템플릿 옵션
		 * Key | Type | 설명 | 예
		 * ---|---|---|---
		 * template | String 또는 jQuery object | HTML 템플릿. data에 값으로 치환하려는 부분은 {{key}} 형태로 작성. | '&lt;li data-value="{{value}}">&lt;span>{{label}}&lt;/span>&lt;/li>'
		 * data | Object 또는 Array | template에 치환할 값 정보. template에 {{key}} 를 data[key] 또는 data[index][ky] 값으로 치환함 | { label: "옵션1", value: "01" }
		 * insertAt | integer | 하위에 이미 뭔가 들어있을 때 몇 번째에 집어넣고 싶은 경우
		 * onReplace | Function | template에 치환자와 data가 매칭이 되지 않아 custom으로 매칭 시키거나 할 때 사용 | function (key, value, item, index) {}
		 * onElement | Function | template에서 jQuery element 생성된 후 추가 작업 필요한 경우 처리. | function ($el, item, index) {}
		 * @return {Object|Array} 추가된 jQuery element 또는 jQuery element 배열 (data가 배열인 경우).
		 * @see
		 * template을 jQuery object로 넘기는 경우 최초 사용할 때 HTML에 있던 element를 제거해버리니 추후 다시 사용해야할 필요가 있으면 변수에 저장해놓고 사용해야 함.
		 * [sfd.core.buildHTMLTemplate()](/docs/references/class.html?class=common_sfd.core&symbol=buildHTMLTemplate)과 함께 사용하면 편하게 사용 가능.
		 * @example
		 * ```js
		 * $('ul.items').appendTemplate({
		 * 	template: '<li><button type="button"><strong>{{label}}</strong></button></li>',
		 * 	data: [{label: '항목1', value: '01'}, {label: '항목2', value: '02'}],
		 * 	onElement: function($el, item, index) {
		 * 		$el.data('item', item);
		 * 	}
		 * });
		 * ```
		 * 
		 * ```js
		 * $('ul.items').appendTemplate({
		 * 	template: '<li><button type="button" data-value="{{value}}"><strong>{{newLabel}}</strong><strong>{{oldLabel}}</button></li>',
		 * 	data: [{label: '항목1', value: '01'}, {label: '항목2', value: '02'}],
		 * 	onReplace: function(key, value, item, index) {
		 * 		if (key == 'newLabel') {
		 * 			return '새' + item.label;
		 * 		} else if (key == 'oldLabel') {
		 * 			return '구' + item.label;
		 * 		}
		 * 		// 아무것도 return 안하면 data에 key에 해당하는 값 그대로 사용함.
		 * 	},
		 * 	onElement: function($el, item, index) {
		 * 		$el.data('item', item);
		 * 	}
		 * });
		 * ```
		 */
		appendTemplate: function(options) {

			var template;
			if (typeof options.template == 'string') {
				template = options.template;
			} else {
				var $template = options.template;
				if($template.hasClass('template')) {
					$template.removeClass('template');
				}
				template = $template.templateHTML($template.is('template'));
			}

			var result = [];
			var list = Array.isArray(options.data) ? options.data : [options.data];
	
			// template에 있는 key 들 얻고 (치환해야 할 것들)
			var keys = [];
			var match;
			var regex = /\{\{([a-zA-Z0-9_-]+)\}\}/gm;
			while ((match = regex.exec(template)) !== null) {
				keys.push(match[1]);
			}		
	
			for (var i = 0; i < list.length; i++) {
				var item = list[i];
	
				// template 치환
				var text = template;
				for (var j = 0; j < keys.length; j++) {
					var key = keys[j];
					var value = item[key];
	
					// 치환하기 전에 data 값 변환 필요하면 하고,
					if (options.onReplace) {
						var newValue = options.onReplace(key, value, item, i);
						if (newValue !== undefined) {
							value = newValue;
						}
					}
	
					regex = new RegExp('\{\{' + key + '\}\}', 'g');
					text = text.replace(regex, value);
				}
				var $el = $(text);
				
				// 생성된 항목의 $element에 추가로 여기 해야할 일 있으면 할 수 있게
				if (options.onElement) {
					options.onElement($el, item, i);
				}
	
				result.push($el);
			}

			if (typeof options.insertAt == 'number') {
				if (options.insertAt == 0) {
					this.prepend(result);
				} else if (options.insertAt >= this.children().length) {
					this.append(result);
				} else {
					this.children().eq(options.insertAt - 1).after(result);
				}
			} else {
				this.append(result);
			}
			return result.length == 1 ? result[0] : result;	
		},
		
		/**
		 * Element에 이벤트 추가.
		 * @for jQuery
		 * @param events 이벤트
		 * @param selector Selector
		 * @param data Data
		 * @param {Function} fn 이벤트 발생했을 때 처리 함수
		 */
        addEvent: function( events, selector, data, fn ){
            if( !data || data.log)
            return $(this).on( events, selector, data, fn );
        },
		/**
		 * Element 이벤트 삭제.
		 * @for jQuery
		 * @param events 이벤트
		 * @param selector Selector
		 * @param data Data
		 * @param {Function} fn 이벤트 발생했을 때 처리 함수
		 */
        removeEvent: function( events, selector, data, fn ){
            return $(this).off( types, selector, fn );
        },
		/**
		 * Element에 Focus 이동
		 * @for jQuery
		 * @return {*} Element 객체
		 */
        focusTextToEnd: function() {
            this.focus();
            var $thisVal = this.val();
            this.val('').val($thisVal);
            return this;
		},
		/**
		 * Element에 등록된 이벤트 있는지 확인
		 * @for jQuery
		 * @return {Boolean} Element에 등록된 이벤트 있으면 true, 없으면 false.
		 */
        hasEvent: function(A, F, E) {
            
            var L = 0;
            var T = typeof A;
            var V = false;
            E = E ? E : this;
            A = (T == 'string') ? $.trim(A) : A;
            if(T == 'function') F = A, A = null;
            if(F == E) delete(F);
            var S = E.data('events');
            
            for (e in S) if (S.hasOwnProperty(e)) L++;
            if(L < 1) return V = false;
            if(A && !F) {
                return V = S.hasOwnProperty(A);
            } else
            if(A && S.hasOwnProperty(A) && F) {
                $.each(S[A], function(i, r) {
                    if(V == false && r.handler == F) V = true;
                });
                return V;
            } else
            if(!A && F) {
                $.each(S, function(i, s) {
                    if(V == false) {$.each(s, function(k, r) {
                        if(V == false && r.handler == F) V = true;
                    });}
                });
            }
            
            return V;
        },
		/**
		 * Element가 현재 화면에 보여지는지 확인
		 * @for jQuery
		 * @return 화면에 보여지고 있으면 true, 아니면 false.
		 * display:none, opacity:0, visibility:hidden 중 하나면 화면에 안보이는 것으로 판단.
		 */
        isVisible: function() {
            if( $(this).css('display') == 'none' )return false;
            if( $(this).css('opacity') == '0' )return false;
            if( $(this).css('visibility') == 'hidden' )return false;
            return true;
		},
		/**
		 * Element의 css width 값 얻거나 설정
		 * @for jQuery
		 * @param {*} val 이 파라미터 입력이 있으면 width 설정. 없으면 width 값 얻음.
		 * @return {Number} val 지정 안한 경우 현재 width 값.
		 */		
        cssWidth: function(val) {
            if(val || val==0){
                return $(this).css('width',val);
            }else{
                return Number($(this).css('width').replace(/px/,''));
            }
        },
		/**
		 * Element의 css height 값 얻거나 설정
		 * @for jQuery
		 * @param {*} val 이 파라미터 입력이 있으면 height 설정. 없으면 height 값 얻음.
		 * @return {Number} val 지정 안한 경우 현재 width 값.
		 */		
        cssHeight: function(val) {
            if(val || val==0){
                return $(this).css('height',val);
            }else{
                return Number($(this).css('height').replace(/px/,''));
            }
		},
		/**
		 * Element의 css left 값 얻거나 설정
		 * @for jQuery
		 * @param {*} val 이 파라미터 입력이 있으면 left 설정. 없으면 left 값 얻음.
		 * @return {Number} val 지정 안한 경우 현재 left 값.
		 */		
        cssLeft: function(val) {
            if(val || val==0){
                return $(this).css('left',val);
            }else{
                return Number($(this).css('left').replace(/px/,''));
            }
		},
		/**
		 * Element의 css top 값 얻거나 설정
		 * @for jQuery
		 * @param {*} val 이 파라미터 입력이 있으면 top 설정. 없으면 top 값 얻음.
		 * @return {Number} val 지정 안한 경우 현재 top 값.
		 */				
        cssTop: function(val) {
            if(val || val==0){
                return $(this).css('top',val);
            }else{
                return Number($(this).css('top').replace(/px/,''));
            }
		},
		/**
		 * Element 보여줌 (애니메이션).
		 * @for jQuery
		 * @param {Int} [time=300] 애니메이션 시간. 1000=1초
		 * @param {Int} [delay=0] 딜레이 시간. 1000=1초
		 * @return {Number} val 지정 안한 경우 현재 width 값.
		 */
        showTween: function(time,delay){
            if(!time)time = 300;
            if(!delay)delay = 0;
            this.css('opacity',0);
            this.show();
            this.stop().delay( delay ).animate({
                opacity: 1
            }, time);
        },
		/**
		 * Element 감춤 (애니메이션).
		 * @for jQuery
		 * @param {Int} [time=300] 애니메이션 시간. 1000=1초
		 * @param {Int} [delay=0] 딜레이 시간. 1000=1초
		 * @return {Number} val 지정 안한 경우 현재 width 값.
		 */
        hideTween: function(time,delay){
            if(!time)time = 300;
            if(!delay)delay = 0;
            var _that = this;
            this.stop().delay( delay ).animate({
                opacity: 0
            }, time, $.proxy(function() {
                this.hide();
            },this));
		},
		/**
		 * input의 ime변경(IE만 정상작동)
		 * @method imeMode
		 * @param  {String} mode ime구분( ko:한글, en:영문, onlyEn: 영문만 )
		 * @return {void}     
		 *
		 * 1 css 적용
		 * 한글 <input class="ime-mode:active;"> 
		 * 영여 <input class="ime-mode:inactive;"> 
		 *
		 * 2 js 적용
		 * 한글 $().imeMode('ko');
		 * 영어 $().imeMode('en');
		 */
		imeMode: function( mode ){
			if( ['ko', 'k', 'K'].includes(mode) ){
				this.css('ime-mode', 'active');

			}else if( ['en', 'e', 'E'].includes(mode) ){
				this.css('ime-mode', 'inactive');

			}else if( mode == 'onlyEn '){
				this.css('ime-mode', 'disabled');

			}
		},
        createComponentBasic: function(options) {
   
            var _ns = 'ns-'+parseInt(Math.random()*100000);
            var _popover = $('<div class="component-popover" id="'+_ns+'"></div>');
            var _id = '';
            var _width = 0;
            var _height = 0;
            var _container = $(this);
            var _bust = (new Date()).getTime();
            if( options.insertType == "after" ){
                _container.after(_popover);
            }else{
                _container.html(_popover);
            }
            init( options );
          
            // 생성
            function init( options ){
            
                _container.load('../common/template/'+options.template+'?bust='+_bust, function(response, status, xhr) {
                    if (status == "error") {
                        return;
                    }
                    // html 삭제
                    var pageName = options.template.replace('.html','');
                    // 바꾸기
                    response = response.replace(/{{ replaced-pageName }}/g, pageName); // page id 
                    response = response.replace(/replaced-pageName/g, pageName); // page id
                    // 삽입
                    _container.html( response );
                });
            }
            
            // 삭제
            function removeCompo(){
                _popover.remove();
            };
        },
		/// TODO: 사용하는 곳이 있나? 확인 후 삭제 필요
        createBasicComponent: function(options) {
            var _ns = 'ns-'+parseInt(Math.random()*100000);
            var _popover = $('<div class="component-popover" id="'+_ns+'"></div>');
            var _id = '';
            var _width = 0;
            var _height = 0;
            var _container = $(this);
            var _bust = (new Date()).getTime();
            _container.after(_popover);
            createCompo();
            init();
            // 생성
            function init( options ){
                _popover.load('../common/popup/TemplateAirportCardSlip.html?bust='+_bust, function(response, status, xhr) {
                    if (status == "error") {}
                    _container.html( response );
                });
            }
         
            // 삭제
            function removeCompo(){
                _popover.remove();
            };
        },
		/// TODO: 사용하는 곳이 있나? 확인 후 삭제 필요
        createAirportCalendar: function(options) {
            var _ns = 'ns-'+parseInt(Math.random()*100000);
            var _popover = $('<div class="component-popover" id="'+_ns+'"></div>');
            var _id = '';
            var _width = 0;
            var _height = 0;
            var _container = $(this);
            var _bust = (new Date()).getTime();
            _container.after(_popover);
            init();
            // 생성
            function init( options ){
                _popover.load('../common/popup/TemplateAirportCardSlip.html?bust='+_bust, function(response, status, xhr) {
                    if (status == "error") {}
                    _container.html( response );
                });
            }
            // 삭제
            function removeCompo(){
                _popover.remove();
            };
		},

		/**
         * Control 비활성화. Deprecated: setEnabled(false) 로 사용해주세요.
         * @for jQuery
         */ 
        disabled: function() {
			// <STRIP_WHEN_RELEASE
			try {
				if (window.console && window.console.warn) {
					window.console.warn.call(null, 'Deprecated: $el.disabled() 대신에 $el.setEnabled(false) 로 사용해주세요.');
				}
			} catch(e) {}
			// STRIP_WHEN_RELEASE>
            disabled2($(this),true);
        },
        /**
         * Control 활성화. Deprecated: setEnabled(true) 로 사용해주세요.
         * @for jQuery
         */ 
        enabled: function(){
			// <STRIP_WHEN_RELEASE
			try {
				if (window.console && window.console.warn) {
					window.console.warn.call(null, 'Deprecated: $el.enabled() 대신에 $el.setEnabled(true) 로 사용해주세요.');
				}
			} catch(e) {}
			// STRIP_WHEN_RELEASE>
            disabled2($(this),false);
		},

		/**
		 * Control 활성화 여부 확인
		 * @for jQuery
		 * @param {Object} [options] 옵션
		 * Key | Type | 기본값 | 설명
		 * ---|---|---|---
		 * visualOnly | Boolean | false | 보이기에만 disabled로 만든 상태인지 확인
		 */
		isEnabled: function (options) {
			return isControlEnabled($(this), options);
		},

		/**
		 * Control 활성화/비활성화
		 * @param {Boolean} isEnabled 활성화시키려면 true, 비활성화시키려면 false
		 * @param {Object} [options] 옵션
		 * Key | Type | 기본값 | 설명
		 * ---|---|---|---
		 * visualOnly | Boolean | false | 보이기에만 비활성화(dislabed CSS class 추가) 시키려면 true, 실제 비활성화(element의 disabled 속성 업데이트) 시키려면 false.
		 * 
		 */
		setEnabled: function(isEnabled, options) {
			setControlEnabled($(this), isEnabled, options);
		},

        /**
         * 말줄임 처리(제한적 상황에서만 사용 가능)
         * @method setEllipsis
         * @param  {Number}    width  말줄임 필드의 넓이
         * @param  {Object}    option 
         */
        setEllipsis: function( width, option ){
        	var $self = $(this);
        	if( $self.prop('tagName').toLowerCase() != 'div' ){
        		// <STRIP_WHEN_RELEASE
        		alert('setEllipsis() 태그네임을 div로 해주세요.');
        		// STRIP_WHEN_RELEASE>
        		return;
        	}
        	$self.addClass('ellipsis');
        	$self.css('width', width);
		},
		
		/**
		 * Element의 control type 얻기
		 * @return {String} button, text, textarea, dropdown, radio, checkbox, form-group, form-card, form-ssnbox
		 */
		getControlType: function() {
			var $el = $(this);
			var type;
			if ($el.length == 0) {
				return type;
			}

			if ($el.is('button')) {
				type = 'button';
			} else if ($el.is('input')) {
				// 기본 input
				type = $el.attr('type');
				if (['password', 'email', 'tel', 'search', 'number'].includes(type)) {
					type = 'text';
				}
			} else if ($el.is('textarea')) {
				// textarea
				type = 'textarea';
			} else if ($el.hasClass('dropdown-container') || $el.hasClass('sfd-dropdown')) {
				// dropdown
                type = 'dropdown';
            } else if ($el.hasClass('input-calendar')) {
				// calendar
				type = 'calendar';
			} else if ($el.hasClass('btn-group') || $el.hasClass('btn-group-vertical') || $el.hasClass('list-group')) {
				// radio/checkbox group container
				if ($el.find('[type=radio]').length > 0) {
					type = 'radio';
				} else if ($el.find('[type=checkbox]').length > 0) {
					type = 'checkbox';
				}
			} else if (($el.hasClass('btn-checkbox') || $el.hasClass('btn-checkbox-block')) && $el.find('input').length > 0) {
				// checkbox container
				type = 'checkbox';
			} else if (($el.hasClass('btn-radio') || $el.hasClass('btn-radio-block')) && $el.find('input').length > 0) {
				// radio container
				type = 'radio';
			} else if ($el.hasClass('form-card')) {
				// 신용카드번호
				type = 'form-card';
			} else if ($el.hasClass('form-ssnbox')) {
				// 주민등록번호
				type = 'form-ssnbox';
			} else if ($el.hasClass('form-corpnobox')) {
				// 법인번호
				type = 'form-corpnobox';
			} else if ($el.hasClass('form-group')) { // form-group 은 다른 것들과 같이 지정되었을 수도 있으니 마지막에
				type = 'form-group';

			} else if($el.prop('tagName') == 'SELECT'){
				type = 'select';
			}

			// <STRIP_WHEN_RELEASE
			if (!type) {
				try {
					if (window.console && window.console.warn) {
						window.console.warn.call(null, 'getControlType: ' + ($el.attr('id') || '') + '의 control type을 알 수 없습니다.' );
					}	
				} catch(e) {}
			}			
			// STRIP_WHEN_RELEASE>

			return type;
		},

        /**
         * Element Type 반환 (checkbox, radio, dropdown, ...)
         * @for jQuery
         * @return {String} Element Type (radio, checkbox, dropdown, form-card, form-ssnbox, dropdown-touch, btn-group, btn-radio, btn-checkbox, form-group, textarea, textfield)
         */ 
        getElementType: function($el){

            $el = $(this);
            var type = null;
            if ($el.is(':radio')) {
                type = 'radio';

            } else if ($el.is(':checkbox')) {
                type = 'checkbox';

            } else if ( $el.hasClass('dropdown-container') || $el.hasClass('sfd-dropdown') ) {
                type = 'dropdown';

            } else if ( $el.hasClass('form-corpnobox') ) {
                type = 'form-corpnobox';

            } else if ( $el.hasClass('btn-dropdown-touch') ) {
                type = 'dropdown-touch';

            } else if ( $el.hasClass('btn-group') || $el.hasClass('btn-group-vertical') || $el.hasClass('list-group') ) {
                type = 'btn-group';
                
                if( $el.find('[type=radio]').length > 0 || $el.find('.btn-radio').length > 0 || $el.find('.btn-radio-blank').length > 0){
                    type = 'btn-radio';
                }else if( $el.find('[type=checkbox]').length > 0 || $el.find('.btn-checkbox').length > 0 || $el.find('.btn-checkbox-blank').length > 0 ){
                    type = 'btn-checkbox';
                }

            } else if ( ($el.hasClass('btn-checkbox-block') || $el.hasClass('btn-checkbox')) && $el.find('input').length == 1 ) {
                type = 'btn-checkbox-unit';

            } else if ($el.is('textarea')) {
                type = 'textarea';

            } else if ( $el.hasClass('form-card') ) {
                type = 'form-card';

            } else if ( $el.hasClass('form-ssnbox') ) {
                type = 'form-ssnbox';

            } else if ( $el.hasClass('form-group') ) {//form-card form-ssnbox form-corpnobox보다 아래 있어야 함 
                type = 'form-group';

            } else {
                if (!type) {
                    if ($el.is('input')) {
                        switch ($el.attr('type')) {
                            case 'text':
                            case 'password':
                            case 'email':
                            case 'tel':
                            case 'search':
                                type = 'textfield';
                                break;
                            case 'checkbox':
                                type = 'checkbox';
                                break;
                            case 'radio':
                                type = 'radio';
                                break;
                        }
                    }
                }
            }
            return type;
        },
		/// 사용하는 곳이 있나?
        componentDropdownTouch: function(options) {
            var _ns = 'ns-'+parseInt(Math.random()*100000);
            var _popover = $('<div class="component-popover" id="'+_ns+'"></div>');
            var _id = '';
            var _width = 0;
            var _height = 0;
            var _dropdownBtn;

            $(this).data('dataList',options.dataList);
            this.after(_popover);
            this.on('click',function(e){
                _dropdownBtn = $(this);
                _id = _dropdownBtn.attr('id');
                _width = options.width;
                _height = options.height;
                // var _c = _dropdownBtn.next('.component-popover');
                
                if(options.width != '100%')_popover.css('width',options.width+'px');
                if(options.height != '100%')_popover.css('height',options.height+'px');
                _popover.css('width', _width);
                _popover.css('height',_height);

                if( _popover.css('display') == 'none' ){
                    makeDropdown( options );
                    _popover.showTween(30,20);
                }else{
                    _popover.hideTween(10,0);
                }  
            });

            /*return {
                val: function(){
                    if( arguments.length == 0 ){
                        return 
                    }else if( arguments.length == 1 ){

                    }
                }
            }*/


            function removeCompo(){
                // 데이터 갱신
                _popover.hideTween();
                _popover.remove();
            };

            function makeDropdown( options ) {
                var _html = '';
                _html += '<div class="mask" id="mask">';
                _html +=    '<div class="content">';
                $.each( options.dataList , function(i, item){
                    _html +=     '<div class="dropdown-item" value1="'+item.value+'">'+item.label+'</div>';
                });
                _html +=    '</div>';
                _html += '</div>';
                _popover.html(_html);

                $('#wrapper').on('mousedown',hideDropdown);
                $('#'+_ns+' .dropdown-item').on('click',function(e){
                    _dropdownBtn.attr( 'value1', $(this).attr('value1') );
                    _dropdownBtn.children('.label').text( $(this).text() );
                    //hideDropdown();
                    _popover.hideTween();
                    // #wrapper mousedown removeHandler
                    $('#wrapper').off('mousedown',hideDropdown);
                });
                // 선택할 값이 있는 경우 
                $('#'+_ns+' .dropdown-item[value1='+_dropdownBtn.attr('value1')+']').addClass('active');

                
                setTimeout(function(){
                    areaScrollMobile(_popover.children('.mask'), _width, _height);

                },10);

            }

            function hideDropdown(e){
                // drag인경우 사라지지 않고 스테이지 클릭할경우는 종료되도록
                if(e){
                    // wrapper의 mousedown중 dropdown-item위에서 움직이는 드래그 체크 
                    // dropdown-item의 클릭은 위에서 종료시킨다. 
                    if( $(e.target).attr('class') == 'dropdown-item' )return;
                    _popover.hideTween();
                    // #wrapper mousedown removeHandler
                    $('#wrapper').off('mousedown',hideDropdown);
                }
                
            }

            function areaScrollStatic( selector, inW, inH ) {
                if (typeof selector == 'string') {
                    selector = $(selector);
                }
                var _inW = pxSum(inW, -3);
                var _inH = pxSum(inH, -5);
                selector.css('width', _inW);
                selector.css('height', _inH);
                selector.css('position', 'relative');
                selector.css('overflow', 'hidden');   
                return selector.slimScroll({
                    width: _inW,
                    height: _inH,
                    alwaysVisible: true,
                    railVisible: true,
                    wheelStep: 10
                });
            }

            function areaScrollMobile( selector, inW, inH ) {
                if (typeof selector == 'string') {
                    selector = $(selector);
                }
                var _id = selector.attr('id');
                if(!_id)alert("id를 추가해주세요");
                var _selectorID = '#'+_ns+' #'+selector.attr('id');
                var _inW = pxSum(inW, -3);
                var _inH = pxSum(inH, -5);
                selector.css('width', _inW);
                selector.css('height', _inH);
                selector.css('position', 'relative');
                selector.css('overflow', 'hidden');   
                return new IScroll(_selectorID, {
                    scrollbars: true,
                    mouseWheel: true,
                    click: true,
                    interactiveScrollbars: true
                });
            }

            function pxSum(input, sum){
                var _ori = String(input).replace(/px/g, '');
                _ori = parseInt(_ori);
                _ori = _ori + sum;
                return _ori+'px';
            }

           
		},
		/**
		 * 달력 만들기
		 * @param {Object} options 옵션
		 * @see 사용하는 곳이 있나?
		 */
        careateCalendar: function(options) {
            var _ns = 'ns-'+parseInt(Math.random()*100000);
            var _popover = $('<div class="component-popover" id="'+_ns+'"></div>');
            var _id = '';
            var _width = 0;
            var _height = 0;
            var _dropdownBtn;

            $(this).data('dataList',options.dataList);
            this.after(_popover);
            this.on('click',function(e){
                _dropdownBtn = $(this);
                _id = _dropdownBtn.attr('id');
                _width = options.width;
                _height = options.height;
                // var _c = _dropdownBtn.next('.component-popover');
                
                if(options.width != '100%')_popover.css('width',options.width+'px');
                if(options.height != '100%')_popover.css('height',options.height+'px');
                _popover.css('width', _width);
                _popover.css('height',_height);

                if( _popover.css('display') == 'none' ){
                    makeCalendar( options );
                    _popover.showTween(30,20);
                }else{
                    _popover.hideTween(10,0);
                }  
            });

            /*return {
                val: function(){
                    if( arguments.length == 0 ){
                        return 
                    }else if( arguments.length == 1 ){

                    }
                }
            }*/

            function createCompo(){
                if( options.componentType == 'dropdown' ) {
                    makeDropdown( options );
                }else if( options.componentType == 'calendar' ) {
                    makeCalendar( options );
                }
            };

            function removeCompo(){
                // 데이터 갱신
                _popover.hideTween();
                _popover.remove();
            };
            function makeCalendar( options ){
                _popover.addClass('calendar');
                _popover.load('popup/TemplateCalendar.html?bust='+bust, function(response, status, xhr) {
                    if (status == "error") {}
                });
            }
        },
        /**
         * Element내 input에 주민등록번호 입력 마우스, 키보드 이벤트 처리
         * @param {Object} [options] 현재는 딱히 옵션이 없는 듯
         * @example
         *```js
         * $('.form-card').makeSSNboxForm();
         *```
         */
        makeSSNboxForm: function(options) {
            var that = $(this);
            var form = $(this).find('input');
            var form1,form2;
            
            // 폼 타입에 따른 하위 클래스 네임저장
            if( form.length == 2 ){
                form1 = $(form[0]);
                form2 = $(form[1]);

                form1.mouseup(function(e) {
                    // $(this).select();
                }).keyup(function(e){
                	// backspace, tab
                    if ( ![8, 9].includes( e.keyCode ) && form1.val().length == 6) {
                        form2.select();
                        form2.focus();
                    }
                })
                form2.keyup(function(e) {
                }).keydown(function(e) {
                    if (e.keyCode == 8 && form2.val().length == 0) {
                        form1.focus();
                    }
                })
                
            }

        },
        makeCorpNoboxForm: function(options) {
            var that = $(this);
            var form = $(this).find('input');
            var form1,form2,form3;
            
            // 폼 타입에 따른 하위 클래스 네임저장
            if( form.length == 3 ){
                form1 = $(form[0]);
                form2 = $(form[1]);
                form3 = $(form[2]);

                form1.mouseup(function(e) {
                    $(this).select();
                }).keyup(function(e){
                    if (form1.val().length == 3) {
                        form2.select();
                        form2.focus();
                    }
                })
                form2.keydown(function(event) {
                    if (event.keyCode == 8 && form2.val().length == 0) {
                        form1.focus();
                    }
                }).keyup(function(e){
                    if (form2.val().length == 2) {
                        form3.select();
                        form3.focus();
                    }
                })
                form3.keydown(function(event) {
                    if (event.keyCode == 8 && form3.val().length == 0) {
                        form2.focus();
                    }
                })
                
            }

        },
        isValidDropdown: function(){
            var _r = true;
            var $target = $(this).find('.dropdown-container[data-parsley-required-message]');
            var $errTarget = [];
            $target.each(function(){
                if(!$target.attr('value')){
                    _r = false;

                    $errTarget.push($(this));
                    $(this).find('.btn-adropdown').addClass('parsley-error');

                    $($(this).attr('data-parsley-errors-container')).html( '<ul class="parsley-errors-list filled"><li>'+$(this).attr('data-parsley-required-message')+'</li></ul>' );
                    
                    $(this).on('change',function(){
                        $(this).find('.btn-adropdown').addClass('parsley-success');
                        $(this).find('.btn-adropdown').removeClass('parsley-error');
                        $($(this).attr('data-parsley-errors-container')).html('').hide();
                    });
                }
            });
            
            /*$errTarget.each(function(){
                $(this).on('change',function(){
                    $(this).addClass('parsley-success')
                    $(this).removeClass('parsley-error');
                });
            })
            $errTarget.on('change',function(){
                $(this).addClass('parsley-success')
                $(this).removeClass('parsley-error');
            });*/
            return _r;
		},
		/**
         * Element 투명도 조절(애니메이션)
         * @param	{Number} opacity 결과 alpha 값
         * @param	{Number} [time=200]    애니메이션 시간 
		 * @param	{Boolean} [visibility=false] opacity가 0인 경우 애니메이션 완료 후 visibility 'hidden' 처리여부
         * @param	{Function} fn      애니메이션 완료 후 실행될 콜백함수
         */
		animateAlpha: function(opacity, time, visibilityHidden, fn) {
			if (visibilityHidden === undefined) {
				visibilityHidden = false;
			}
			if (time === undefined) {
				time = 200;
			}
			var $this = this;
			if (visibilityHidden == true && opacity > 0) { 
				this.css('visibility', 'inherit');
			}

			this.stop().animate({
				opacity: opacity
			}, time, function() {
				if (visibilityHidden == true && opacity == 0) {
					$this.css('visibility', 'hidden');
				}
				if (fn) {
					fn();
				}
			});
		},
		template: function() {
			
		},
        _end:''        
	})
	
    function disabled2($el,tf){
        var type = $el.getElementType();
        var method = (tf)?'addClass':'removeClass';
        var propName = 'disabled';
        switch (type) {
            case 'textfield':
                $el.prop(propName, tf)

            case 'dropdown':
                $el.find('.btn-adropdown')[method](propName);
                // if(tf)$el.find('.btn-adropdown').removeClass('parsley-error');
                break;

            case 'btn-radio':
                $el.find('label')[method](propName);
                $el.find('input').prop(propName, tf);
                break;

            case 'btn-checkbox':
                $el.find('label')[method](propName);
                $el.find('input').prop(propName, tf);
                break;

            case 'form-group':
                $el[method](propName);
                $el.find('input').prop(propName, tf);
                break;

            case 'textarea':
                $el[method](propName);
                $el.prop(propName, tf)
                break;

            default:
                $el[method](propName);
        }
	}

	/**
	 * Control 활성화 여부 확인
	 * @private
	 * @param {Object} $el 확인할 jQuery object.
	 * @param {Object} [options] 옵션
	 * Key | Type | 기본값 | 설명
	 * ---|---|---|---
	 * visualOnly | Boolean | false | 보이기에만 disabled로 만든 상태인지 확인
	 * @return {Boolean} 활성화되어 있으면 true, 비활성화 상태면 false.
	 */
	function isControlEnabled($el, options) {
		options = $.extend({
			visualOnly: false
		}, options);

		var result = false;
    	var type = $el.getControlType();

    	switch (type) {
			case 'text':
    		case 'textarea':
				if (options.visualOnly) {
					result = ($el.hasClass('disabled') != true);
				} else {
					result = ($el.prop('disabled') != true);
				}
				break;

    		case 'radio':
				var $input;
				var $label;

				if ($el.is('input')) {
					$input = $el;
					$label = $el.closest('label');
					if ($label.length == 0 && $input.attr('id')) {
						$label = $('label[for="' + $input.attr('id') + '"]');
					}
				} else if ($el.is('label')) {
					$label = $el;
					$input = $el.find('input');
					if ($input.length == 0 && $label.attr('for')) {
						$input = $('#' + $label.attr('for'));
					}
				} else if ($el.hasClass('btn-radio-block')) {
					$input = $el.find('input');
					$label = $el;
				} else {
					$input = $el.find('input');
					$label = $el.find('label');
				}
				if (options.visualOnly) {
					result = ($label.hasClass('disabled') != true);
				} else {
					result = ($input.prop('disabled') != true);
				}
    			break;

    		case 'checkbox':
				if ($el.is('input')) {
					$input = $el;
					$label = $el.closest('label');
					if ($label.length == 0 && $input.attr('id')) {
						$label = $('label[for="' + $input.attr('id') + '"]');
					}
				} else if ($el.is('label')) {
					$label = $el;
					$input = $el.find('input');
					if ($input.length == 0 && $label.attr('for')) {
						$input = $('#' + $label.attr('for'));
					}
				} else {
					$input = $el.find('input');
					$label = $el.find('label');
				}
				if (options.visualOnly) {
    				result = ($label.hasClass('disabled') != true);
				} else {
    				result = ($input.prop('disabled') != true);
				}
    			break;

    		case 'dropdown':
				var $button;
				if ($el.hasClass('sfd-dropdown')) {
					$button = $el.find('button');
				} else {
					$button = $el.hasClass('dropdown-container') ? $el.find('.btn-adropdown') : $el;
				}
				if (options.visualOnly) {
					result = ($button.hasClass('disabled') != true);
				} else {
					result = ($button.prop('disabled') != true);
				}	
				break;

			case 'button':
				if (options.visualOnly) {
					result = ($el.hasClass('disabled') != true);
				} else {
					result = ($el.prop('disabled') != true);
				}
				break;

			case 'form-group':
				result = true;
				var $input = $el.find('input');
				for (var i = 0; i < $input.length; i++) {
					if ((options.visualOnly && $input[i].hasClass('disabled')) || (options.visualOnly == false && $input[i].prop('disabled'))) {
						result = false; // 한개라도 disabled면 false
						break;
					}
				}
				break;

    		default:
				// 버튼 등 다른 type은 class만으로 판단
				if (options.visualOnly) {
					result = ($el.hasClass('disabled') != true);
				} else {
					result = ($el.prop('disabled') != true);
				}
    			break;
		}
		return result;
	}

	function findLabelForInput($input) {
		var $result = $();

		$input.each(function() {
			var $label;
			var $input = $(this);

			var id = $input.attr('id');
			// id로 먼저 찾아보고
			if (id) { 
				$label = $('label[for="' + id + '"]');
			}
			// 없으면 바로 다음/이전에 있는지 찾아보고
			if (!$label || $label.length == 0) {
				$label = $input.next('label');
				if ($label.length == 0) {
					// 없으면 바로 앞에 있는지 확인해보고
					$label = $input.prev('label');
				}
			}

			// 없으면 label이 감싸고 있는지 확인
			if ($label.length == 0) {
				$label = $input.closest('label');
			}

			// 없거나 빈 label 만 발견됐으면 bs class 확인
			if ($label.length == 0 || !$.trim($label.html())) {
				var $wrapper = $input.closest('.btn-' + $input.attr('type') + '-block');
				if ($wrapper.length > 0) {
					$label = $wrapper;
				}
			}

			if ($label && $label.length == 1) {
				$result = $result.add($label);
			}
		});
		return $result;
	}

	/**
	 * Control 활성화/비활성화
	 * @private
	 * @param {Object} $el 확인할 jQuery object.
	 * @param {Boolean} [isEnabled=true] 활성화시키려면 true, 비활성화시키려면 false
	 * @param {Object} [options] 
	 * Key | Type | 기본값 | 설명
	 * ---|---|---|---
	 * visualOnly | Boolean | false | 보이기에만 비활성화(dislabed CSS class 추가) 시키려면 true, 실제 비활성화(element의 disabled 속성 업데이트) 시키려면 false.
	 * 
	 */
    function setControlEnabled($el, isEnabled, options) {
		if (typeof isEnabled == 'object' && options === undefined) {
			options = isEnabled;
		}

		options = $.extend({
			visualOnly: false
		}, options);

		if (isEnabled === undefined) {
			isEnabled = true;
		}

    	var type = $el.getControlType();
		var method = isEnabled ? 'removeClass' : 'addClass';

    	switch (type) {
			case 'text':
				if (isEnabled) {
					$el.prop('disabled', isEnabled == false);
					$el.attr('readonly', isEnabled == false);
				} else {
					if (options.visualOnly == false) {
						$el.prop('disabled', isEnabled == false);
					} else {
						$el.attr('readonly', isEnabled == false);
					}
				}
				break;

			case 'textarea':
				// input disabled 설정
				if (options.visualOnly == false) {
					$el.prop('disabled', isEnabled == false);
				}
				// class 업데이트
				$el[method]('disabled');
				break;

			case 'radio':
				var $input;
				var $label;

				if ($el.is('input')) {
					$input = $el;
					$label = findLabelForInput($input);
				} else if ($el.is('label')) {
					$label = $el;
					$input = $el.find('input');
					if ($input.length == 0 && $label.attr('for')) {
						$input = $('#' + $label.attr('for'));
					}
				} else if ($el.hasClass('btn-radio-block')) {
					$input = $el.find('input');
					$label = $el;
				} else {
					$input = $el.find('input');
					$label = $el.find('label');
				}
				// input disabled 설정
				if (options.visualOnly == false) {
					$input.prop('disabled', isEnabled == false);
				}
				// label class 업데이트
				$label[method]('disabled');
    			break;

    		case 'checkbox':
				var $input;
				var $label;

				if ($el.is('input')) {
					$input = $el;
					$label = findLabelForInput($input);
				} else if ($el.is('label')) {
					$label = $el;
					$input = $el.find('input');
					if ($input.length == 0 && $label.attr('for')) {
						$input = $('#' + $label.attr('for'));
					}
				} else if ($el.hasClass('btn-checkbox-block')) {
					$input = $el.find('input');
					$label = $el;
				} else {
					$input = $el.find('input');
					$label = $el.find('label');
				}
				// input disabled 설정
				if (options.visualOnly == false) {
					$input.prop('disabled', isEnabled == false);
				}
				// label class 업데이트
				$label[method]('disabled');
    			break;

			case 'dropdown':
				var $button;
				if ($el.hasClass('sfd-dropdown')) {
					$button = $el.find('button');
				} else {
					if ($el.hasClass('dropdown-container')) {
						$button = $el.find('.btn-adropdown');
					} else {
						$button = $el;
					}
				}
				// button disabled 설정
				if (options.visualOnly == false) {
					$button.prop('disabled', isEnabled == false);
				}
				// button class 업데이트
				$button[method]('disabled');
                break;

			case 'form-group':
				var $input = $el.find('input');
				// input들 disabled 설정
				if (options.visualOnly == false) {
					$input.prop('disabled', isEnabled == false);
				}
				// class 업데이트
    			$el[method]('disabled');
    			break;

			default:
				if (options.visualOnly == false) {
					$el.prop('disabled', isEnabled == false);
				}
				$el[method]('disabled');
				break;
		}
    }

}(jQuery);
// end sfd component and plugin 
// 
// 
// 콤포넌트 정의 파일 
+ function($) {
    $.fn.extend({    
		/// 사용하는 곳이 있나?
        componentBasic2: function(options) {
            /*
            {
                insertType: after(this의다음) into(this의안)
                
            }
            */
       
            var _ns = 'ns-'+parseInt(Math.random()*100000);
            var _popover = $('<div class="component-popover" id="'+_ns+'"></div>');
            var _id = '';
            var _width = 0;
            var _height = 0;
            var _container = $(this);
            var _bust = (new Date()).getTime();
         
            if( options.insertType == "after" ){
                _container.after(_popover);
            }else{
                _container.html(_popover);
            }
            init( options );
          
            // 생성
            function init( options ){
                _container.load('../common/template/'+options.template+'?bust='+_bust, function(response, status, xhr) {
                    if (status == "error") {}
                    _container.html( response );
                });
            }
            
            // 삭제
            function removeCompo(){
                _popover.remove();
            };
        }
    })
}(jQuery);

// 콤포넌트 정의 파일 
+ function($) {
    $.fn.extend({    
		/**
		 * Element내 input에 카드 번호 입력 마우스, 키보드 이벤트 처리
		 * @param {Object} [options] 현재는 딱히 옵션이 없는 듯
		 * @example
		 *```js
		 * $('.form-card').makeFormCard();
		 *```
		 */
        makeFormCard: function(options) {
            var that = $(this);
            var form = $(this).find('input');
            var form1,form2,form3,form4;
            
            // 폼 타입에 따른 하위 클래스 네임저장
            if( form.length == 4 ){
                form1 = $(form[0]);
                form2 = $(form[1]);
                form3 = $(form[2]);
                form4 = $(form[3]);

                form1.mouseup(function(e) {
                    $(this).select();
                }).keyup(function(e){

                    if (form1.val().length == 4) {
                        form2.select();
                        form2.focus();
                    }
                })
                form2.keyup(function(event) {
                    if (form2.val().length == 4) {
                        form3.select();
                        form3.focus();
                    }

                }).keydown(function(event) {
                    if (event.keyCode == 8 && form2.val().length == 0) {
                        form1.focus();
                    }
                })
                form3.keyup(function(event) {
                    if (form3.val().length == 4) {
                        form4.select();
                        form4.focus();
                    }

                }).keydown(function(event) {
                    if (event.keyCode == 8 && form3.val().length == 0) {
                        form2.focus();
                    }
                })
                form4.keyup(function(event) {
                }).keydown(function(event) {
                    if (event.keyCode == 8 && form4.val().length == 0) {
                        form3.focus();
                    }
                })
            }

        }
    })
    $.fn.extend({    
        makeFormCardMerge: function(options) {
            var that = $(this);
            var form = $(this).find('input');
            var form1,form2,form3,form4;
            var hyphen = $(this).find('.hyphen');

            form.focusin(function(){
                // that.css('border','1px solid #999');
                that.addClass('focusin');
                
            }).focusout(function(){
                that.removeClass('focusin');
                
                // that.css('border','none');
            });

            // 폼 타입에 따른 하위 클래스 네임저장
            if( form.length == 4 ){
                form1 = form.eq(0);//$(form[0]);
                form2 = form.eq(1);//$(form[1]);
                form3 = form.eq(2);//$(form[2]);
                form4 = form.eq(3);//$(form[3]);

                form1.mouseup(function(e) {
                    $(this).select();
                }).keyup(function(e){

                    if (form1.val().length == 4) {
                        form2.focus();
                        hyphen.eq(0).css('opacity','1');
                    }
                })
                form2.keyup(function(event) {
                    if (form2.val().length == 4) {
                        form3.focus();
                        hyphen.eq(1).css('opacity','1');
                    }

                }).keydown(function(event) {
                    if (event.keyCode == 8 && form2.val().length == 0) {
                        form1.focus();
                        hyphen.eq(0).css('opacity','0');
                    }
                })
                form3.keyup(function(event) {
                    if (form3.val().length == 4) {
                        form4.focus();
                        hyphen.eq(2).css('opacity','1');
                    }

                }).keydown(function(event) {
                    if (event.keyCode == 8 && form3.val().length == 0) {
                        form2.focus();
                        hyphen.eq(1).css('opacity','0');
                    }
                })
                form4.keyup(function(event) {
                }).keydown(function(event) {
                    if (event.keyCode == 8 && form4.val().length == 0) {
                        form3.focus();
                        hyphen.eq(2).css('opacity','0');
                    }
                })
            }

            // 폼그룹의 마우스 다운시 비어있는 인풋으로 유도
            that.on('click',function(){
                setTimeout(function(){
                    if ( !form1.val() || form1.val().length<4 ) {
                        form1.focus();
                    }else if(!form2.val() || form2.val().length<4) {
                        form2.focus();
                    }else if(!form3.val() || form3.val().length<4) {
                        form3.focus();
                    }else if(!form4.val() || form4.val().length<4) {
                        form4.focus();
                    }else{
                        form4.focus();
                    }
                },100);
            });

        }
    })


}(jQuery);

/**
 * jQuery Plugin 롤링 애니메이션 숫자
 * @class $.componentRollingNumber
 * @type plugin
 * @for jQuery
 * @see
 * 	전체 width는 입력된 금액값에따라 변화
 * @example
 * 	
 *```js
 *var rollingNumber = $('#rolling-number').componentRollingNumber({
 *	fontSize: 35,
 *	price: 100,
 *	isUnit: true
 *});
 *```
 *
 */
+ function($) {
    $.fn.extend({
		/**
		 * 롤링 애니메이션 숫자 생성
		 * @constructor componentRollingNumber
		 * @param {Object} options 옵션
		 */
        componentRollingNumber: function(options) {
            var _container = $(this);
            // 기본 옵션값
            var opt = {
                fontSize: 35,
                price : 0,
                isUnit : true
            };
            var _price;             // 가격
            var _isUnit;          // 단위(원) 표기 여부

            var isNegative = false;     // 음수일 경우
            // css 요소 
            var _fontSize;
            var _lineHeight;
            var priceArr = [];
            var lastPriceArr = [];

            var that = this;
            var self = {
                price: function( inPrice ){
                    if ( arguments.length == 1 ) {
                        return that.setPrice(inPrice);
                    }else{
                        return that.getPrice();
                    }

                }
			}
			/**
			 * 현재 설정된 가격 값 얻기
			 */
            that.getPrice = function(){
                return Number(_price);
            }
            /**
			 * 가격 값 설정
			 * @param {Int} inPrice 가격
			 */
            that.setPrice = function( inPrice ){
                _price = String(inPrice);
                //기존 css값 가져오기
                _fontSize = _container.find('.component-lm-ul').css('font-size').replace('px','');
                // 배열초기화
                priceArr = []; 
                checkPrice();
                getLastPriceArr(_fontSize);
                makeNumbers();
                setCss();

                animateNumbers();
            }
            init( options );

            // 이전 값을 배열에 저장
            function getLastPriceArr(_fontSize){
                lastPriceArr = []; //배열 초기화
                $.each(_container.find('.component-lm-ul'), function(index){
                    var top = $(this).css('top').replace('px','');
                    top = Number(top);
                    if(top > -19 * _lineHeight ){
                        if(top > -10 * _lineHeight){
                            top -= 10 * _lineHeight;
                        }
                        lastPriceArr.push(top);
                    }else{
                        lastPriceArr.push(0);
                    }                

                });
            }
            
            // 옵션을 통한 초기값 세팅
            function setOptions(options){
                $.extend(opt,options);
                // 가격
                _price =  String(opt.price);
                _fontSize = opt.fontSize;
                _lineHeight = Math.floor(_fontSize * 1.1);
                _isUnit = opt.isUnit;
            }

            // css 설정
            function setCss(){
                var countComma = parseInt( ( _price.length - 1) / 3 );

                var containerWidth = _fontSize * ((0.52 * _price.length) + (0.25 * countComma) + 0.1);
                // 음수일 경우 음수 자리 확보
                if(isNegative){
                    containerWidth += 0.4 * _fontSize;
                }
                // 단위표기 할 경우 단위표기할 자리 확보
                if(_isUnit){
                    containerWidth += 0.9 * _fontSize;
                } 
                // container 너비              
                _container.css('width', containerWidth +  'px');
                // container 높이 
                _container.css('height',_fontSize + 'px');
                // _fontSize
                _container.find('.component-lm-ul, .component-lm-comma, .component-lm-sign').css('font-size',_fontSize + 'px');
                _container.find('.component-lm-ul, .component-lm-comma, .component-lm-sign').css('line-height', _lineHeight + 'px');
                _container.find('.component-lm-ul').find('li').css('height', _lineHeight + 'px');    // 특정폰에서 lineHeight 안먹는 현상 수정
                _container.find('.component-lm-unit').css('font-size',_fontSize * 0.8 + 'px');
                _container.find('.component-lm-unit').css('line-height',_fontSize + 'px');
                // 글자너비
                _container.find('.component-lm-ul').css('width',_fontSize * 0.52 + 'px');
                // 컴마너비
                _container.find('.component-lm-comma').css('width',_fontSize * 0.25 + 'px');
                // 부호(-)너비
                _container.find('.component-lm-sign').css('width',_fontSize * 0.4 + 'px')
                // 단위(원) 너비
                _container.find('.component-lm-unit').css('width',_fontSize * 0.9 + 'px');


                // 폰트 특성상에 의한 패딩
                _container.css('padding-right',(_fontSize * 0.1) + 'px'); 
                // _container.css('padding-top',(_fontSize * 0.1) + 'px')
            }
            // price 체크
            function checkPrice(){
                // 음수양수 체크
                if(Number(_price) < 0){
                    isNegative = true;
                    _price = _price.replace('-','');
                }else{
                    isNegative = false;
                }
                // 앞자리에 0이 나오면 제거
                while( _price.length > 1 && _price.substr(0,1)==0) {
                    _price = _price.substr(1);
                }
            }
            // 롤링 숫자 리스트 생성
            function makeNumbers(){
                // 컨테이너 초기화
                _container.empty();
                // '원' 단위 표기
                if(_isUnit){
                    var unit = $('<div class="component-lm-unit">원</div>');
                    _container.append(unit);
                }
                // ul 생성
                var ul = $('<ul class="component-lm-ul"></ul>');
                // 컴마 요소 생성
                var comma = $('<div class="component-lm-comma">,</div>');
                // li에 넘버 담아서 ul에 삽입
                var i;
                var num;
                for(i = 0, num = 9; i < 20; i++,num--){
                    num = (num == -1 ? 9 : num);
                    var li = document.createElement('li');
                    li.innerText = num;
                    // 값이 1일경우 폰트스타일상 1이 왼쪽으로 쏠려보이므로 padding추가
                    if(num == 1){
                        $(li).css('padding-left',(_fontSize * 0.08) + 'px');
                    }
                    ul.append(li);
                };
                // 자릿수만큼 요소 ul 생성
                for(i = 1; i <= _price.length; i++){
                    ul = ul.clone();
                    comma = comma.clone();
                    _container.append(ul);
                    if(i != _price.length && i % 3 == 0){
                        _container.append(comma);
                    }
                    var tempNumber = _price.substr(-i,1);
                    priceArr.push(tempNumber);
                };
                // 음수일경우 - 삽입
                if(isNegative){
                    var minus = $('<div class="component-lm-sign">-</div>');
                    _container.append(minus);
                }
            };

            function animateNumbers(){
                $.each(_container.find('.component-lm-ul'), function(index){
                    var number =  Number(priceArr[index]); 
                    //var random = (Math.random() > 0.5) ? 10 : 0 // 역동적으로 만들기위해 랜덤으로 한바퀴를 더 돌려준다.
                    if(lastPriceArr[index] == undefined){
                        $(this).css('top', -19 * _lineHeight + 'px');
                        $(this).animate({
                            'top':'+='+(_lineHeight * (number +10)) +'px'
                        },900 + (index * 80));
                    }else{
                        if(lastPriceArr[index] == -9 * _lineHeight){
                            lastPriceArr[index] = -19 * _lineHeight;
                        }
                        $(this).css('top', lastPriceArr[index] + 'px');

                        $(this).animate({
                            'top':'+='+(_lineHeight * (number - 9) - lastPriceArr[index] )+'px'
                        },900 + (index * 80));
                    }
                });
            }

            
          
            // 생성
            function init( options ){
                _container.addClass('component-lm-container');
                _container.attr('aria-hidden',true);    // 접근성관련 작업( 읽히지 않도록 )
                // 초기값 세팅
                setOptions(options);
                checkPrice();
                // css 설정
                getLastPriceArr(_fontSize);
                makeNumbers();
                setCss();
                animateNumbers();

            }

            return self;
        }
    })
}(jQuery);

// $('<script type="text/javascript" src="../common/core/SFCommon.js"></script>').appendTo('body');
+function(document,undefined){
    var today = new Date();
    var today_year = today.getFullYear();
    var today_month = today.getMonth() + 1;
    var today_day = today.getDate();
    var today_hours = today.getHours();
    var today_min = today.getMinutes();

    if (("" + today_month).length == 1) { today_month = "0" + today_month; }
    if (("" + today_day).length == 1) { today_day = "0" + today_day; }
    if (("" + today_hours).length == 1) { today_hours = "0" + today_hours; }
    if (("" + today_min).length == 1) { today_min = "0" + today_min; }

    todayYYYYMMDD = today_year + "" + today_month + "" + today_day;
    todayYYYYMMDDmmss = todayYYYYMMDD + "" + today_hours + "" + today_min;

    ssid = getCookieId("ssid"); //30분
    sbid = getCookieId("sbid"); //10년 


    //BrowgerID 생성 
    function createBID() {
        var s = [];
        var strArray = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        for (var i = 0; i < 5; i++) {
            s[i] = strArray.substr(Math.floor(Math.random() * 52), 1);
            var BrowgerStr = s.join("");
        }

        var browgerTempStr = todayYYYYMMDDmmss.substring(2, 12) + "" + BrowgerStr;
        return browgerTempStr;
    }

    function setCookieId(cookieName, cookieValue, expireMin, expiresCls) {

        if (expiresCls == 1) {

            var date1 = new Date;
            date1.setTime(date1.getTime() + expireMin * 24 * 60 * 60 * 1000);
            var expires = "; expires=" + date1.toGMTString();
            //al-ert("jihyun0803:::sbid:::" + expires)
        }

        if (expiresCls == 2) {
            var date2 = new Date;
            date2.setMinutes(date2.getMinutes() + expireMin);
            var expires = "; expires=" + date2.toGMTString();

            //al-ert("jihyun0803:::ssid:::" + expires)
        }

        document.cookie = cookieName + "=" + escape(cookieValue) + "; path=/" + expires + ";";
        return cookieValue;
    }



    function getCookieId(cookieName) {

        var search = cookieName + "=";
        var cookie = document.cookie;
        var setData = "";
        var returnData = "";

        if (cookie.length > 0) {
            startIndex = cookie.indexOf(search);

            if (startIndex != -1) {
                startIndex += cookieName.length;
                endIndex = cookie.indexOf(";", startIndex);

                if (endIndex == -1) {
                    endIndex = cookie.length;
                    setData = unescape(cookie.substring(startIndex + 1, endIndex));

                } else {
                    setData = unescape(cookie.substring(startIndex + 1, endIndex));
                }
            } else {
                setData = createBID();
            }
        }

        if (cookieName == "ssid") {
            expireMin = 30;
            expiresCls = 2;
        }

        if (cookieName == "sbid") {
            expireMin = 3650;
            expiresCls = 1;
        }

        return setCookieId(cookieName, setData, expireMin, expiresCls);
    }
}(typeof document === 'undefined' ? null : document);


