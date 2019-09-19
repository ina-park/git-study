/**
 * 공통으로 사용하는 유틸 함수들 모음
 * @class sfd.utils
 * @see
 * 상품 로직과 관련없는 일반적인 유틸 함수들 모음만 이곳에 추가.
 * 전상품 공통으로 사용한다고 이곳에 추가 X.
 */
define(function() {
	'use strict';

	var sfd;
	var self = {
		// version info
		version: {
			modified: '{version-modified}',
			deploy: '{version-deploy}',
			hash: '{version-hash}'
		},
		/**
		 * 초기화
		 * @category 초기화
		 * @param {Object} d sfd 객체
		 */
		initialization: function(d) {
			sfd = d;
		},

		/**
		 * 값이 비었는지 체크
		 * @category 확인 
		 * @method isEmpty
		 * @param  {Any}  value 확인할 값
		 * @return {Boolean}	value가 undefined, null, '' 인 경우 true. 그 외의 경우엔 false.
		 */
		isEmpty: function(value) {
			return (value == undefined || value == null || value == '');
		},

		/**
		 * 문자열이 영문자와 숫자로만 구성되어 있는지 확인
		 * @category 확인 
		 * @method isAlphaNum
		 * @param {String} str 확인할 문자열
		 * @return {Boolean} 모든 문자가 숫자/영문자면 true 아니면 false.
		 */
		isAlphaNum: function(str) {
			return /(^[a-zA-Z0-9]+$)/.test(str);
		},

		/**
		 * 문자열이 모두 대문자인지 확인
		 * @category 확인 
		 * @method isUppercase
		 * @param  {String}	str	확인할 문자열
		 * @return {Boolean}	모든 문자가 대문자인 경우 true 아니면 false.
		 */
		isUppercase: function(str) {
			return str == str.toUpperCase();
		},

		/**
		 * 문자열이 모두 숫자인지 확인
		 * @category 확인 
		 * @method isNum
		 * @param {String} str 확인할 문자열
		 * @return {Boolean} 문자열내 모든 문자가 숫자면 true 아니면 false.
		 */
		isNum: function(str) {
			return /^[0-9]*$/.test(str);
		},

		/**
		 * [sfd.utils.isHangul](#isHangul) 사용하세요. (deprecated)
		 * @category 확인 
		 * @method isKor
		 * @param {String} str 확인할 문자열
		 * @return {Boolean} 문자열내 모든 문자가 한글이면 true 아니면 false.
		 */
		isKor: function(str) {
			return this.isHangul(str);
		},

		/**
		 * 문자열이 한글로만 구성되어 있는지 확인
		 * @category 확인 
		 * @param {String} str 확인할 문자열
		 * @return {Boolean} 문자열내 모든 문자가 한글이면 true 아니면 false.
		 */
		isHangul: function(str) {
			return /^[가-힣]*$/.test(str);
		},

		/**
		 * 입력된 키보드 키 코드값이 숫자키인지 확인
		 * @category 확인 
		 * @method isNumberKeyCode
		 * @param {Number} code 확인할 코드
		 * @return {Boolean} 입력된 키 코드가 숫자키면 true 아니면 false.
		 */
		isNumberKeyCode: function(code) {
			return (code > 47 && code < 58) || (code > 96 && code < 105);
		},

		/**
		 * 문자열이 개인정보 보호를 위해 Asterisk(*) 처리 되어 있는지 확인
		 * @category 확인 
		 * @param {String} text 확인할 문자열
		 * @return {Boolean} 보호 처리된 문자열이면 true, 아니면 false
		 * @see
		 * 문자열이 아래 조건에 만족하면 true.
		 * 8글자 이상인 경우 * 3개 이상,
		 * 5글자 이상인 경우 * 2개 이상,
		 * 4글자 이하인 경우 * 1개 이상
		 */
		isSecuredText: function(text) {
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
				// 8글자 이상인 경우 3글자 이상 * 처리된 경우
				return numberOfAsterisk >= 3;
			} else if (text.length >= 5) {
				// 5글자 이상인 경우 2글자 이상 * 처리된 경우
				return numberOfAsterisk >= 2;
			} else {
				// 4글자 이하인 경우에는 1글자 이상 * 처리된 경우
				return numberOfAsterisk >= 1;
			}
		},

		/**
		 * 한글 문자 초성/중성/종성 분리
		 * @category 문자열 
		 * @param {String} char 한글 문자
		 * @return {Array} 초성, 중성, 종성 배열.
		 */
		decomposeHangul: function(char) {
			var result = [];

			// 0xAC00 : 유니코드 한글 시작위치
			var code = char.charCodeAt() - 0xAC00;
			// 종성
			var coda = code % 28;
			// 중성
			code = Math.floor(code / 28);
			var nucleus = code % 21;
			//초성
			code = Math.floor(code / 21);
			var onset = code; 
	
			// 0x1100 : 초성 시작위치
			if (onset >= 0) {
				result.push(String.fromCharCode(onset + 0x1100));
			}
			// 0x1161 : 중성 시작위치
			if (nucleus >= 0) {
				result.push(String.fromCharCode(nucleus + 0x1161));
			}
			// 0x11A7 : 종성 시작위치
			if (coda > 0) {
				result.push(String.fromCharCode(coda + 0x11A7));
			}
			return result;
		},

		/**
		 * 단어에 맞는 한글 조사 얻기
		 * @category 문자열 
		 * @param {String} word 맞는 조사를 확인할 단어
		 * @param {String|Array} candidates 조사 후보. "은는", "이가", "을를", "와과", "으로"
		 * 순서 상관없고, 중간에 콤마 있어도 상관없음. 예) "는,은"
		 * 배열로도 가능. 예) ["은", "는"]
		 * @return {String} word에 맞는 조사. 예) "은"
		 * ```js
		 * sfd.utils.getPostPosition('한글', '은는'); // => "은"
		 * sfd.utils.getPostPosition('당신', '와과'); // => "과"
		 * ```
		 * @see
		 * - word에 괄호로 감싼 단어가 뒤에 있으면 조사 판단에서는 무시함.
		 *   예) 하나(둘)은(는) => 는
		 * - word가 영문인 경우 아직 완전하지는 않음.
		 */
		getPostPosition: function(word, candidates) {
			word = word.trim().replace(/\(.+\)$/, '').trim(); // 조사 앞 단어에 괄호가 있으면 그 안에 내용은 무시

			var lastChar = word.charAt(word.length - 1);
			var result = '';

			// normalize candidates
			if (Array.isArray(candidates)) {
				candidates = candidates.join('');
			}
			candidates = candidates.replace(/[^은는이가을를와과으로]/g, ''); // 필요한거 외에는 제거

			if (candidates.includes('은') && candidates.includes('은')) {
				candidates = '은는';
			} else if (candidates.includes('이') && candidates.includes('가')) {
				candidates = '이가';
			} if (candidates.includes('을') && candidates.includes('를')) {
				candidates = '을를';
			} if (candidates.includes('와') && candidates.includes('과')) {
				candidates = '와과';
			} if (candidates.includes('으') && candidates.includes('로')) {
				candidates = '으로';
			}

			var isHangul = this.isHangul(lastChar);
			var isNum = this.isNum(lastChar);
			var components = isHangul ? this.decomposeHangul(lastChar) : [];
			var hasFinalConsonant = false;
			if (isHangul) {
				hasFinalConsonant = components.length == 3;
			} else if (isNum) {
				hasFinalConsonant = ['0', '1', '3', '6', '7', '8'].includes(lastChar);
			} else {
				hasFinalConsonant = ['NG', 'LE', 'ME', 'LL', 'AN', 'EN', 'ON', 'UN', 'AL', 'EL'].includes(word.substr(-2).toUpperCase());
			}

			switch (candidates) {
				case '은는':
					result = hasFinalConsonant ? '은' : '는';
					break;
				case '이가':
					result = hasFinalConsonant ? '이' : '가';
					break;
				case '을를':
					result = hasFinalConsonant ? '을' : '를';
					break;
				case '와과':
					result = hasFinalConsonant ? '과' : '와';
					break;
				case '으로':
					if (isHangul) {
						result = (hasFinalConsonant == false || components[2] == 'ㄹ') ? '로' : '으로';
					} else if (isNum) {
						result = (hasFinalConsonant == false || lastChar == '1') ? '로' : '으로';
					} else {
						result = (hasFinalConsonant == false || lastChar.toUpperCase() == 'L') ? '로' : '으로';
					}
					break;
			}
			return result;
		},

		/**
		 * 단어에 맞는 한글 조사 붙이기
		 * @category 문자열 
		 * @param {String} word 조사를 붙일 단어
		 * @param {String|Array} candidates 붙일 조사 후보. "은는", "이가", "을를", "와과", "으로"
		 * 순서 상관없고, 중간에 콤마 있어도 상관없음. 예) "는,은"
		 * 배열로도 가능. 예) ["은", "는"]
		 * @return {String} word에 맞는 조사를 붙인 문자열.
		 * ```js
		 * sfd.utils.getPostPosition('한글', '은는'); // => "한글은"
		 * sfd.utils.getPostPosition('당신', '와과'); // => "당신과"
		 * ```
		 */
		attachPostPosition: function(word, candidates) {
			return word + this.getPostPosition(word, candidates);
		},

		/**
		 * 문자열에서 조사를 맞는 조사로 선택해서 변환함.
		 * @category 문자열 
		 * @param {String} text 변환할 문자열. 변환될 조사는 {은,는} {을,를}, 은(는), 이(가) 형태로 되어 있어야 함.
		 * @return {String} 맞는 조사들로 변환된 문자열.
		 * ```js
		 * sfd.utils.correctPostPositions('한글{은,는} 대단합니다.'); // => "한글은 대단합니다."
		 * sfd.utils.correctPostPositions('한글은(는) 대단합니다.'); // => "한글은 대단합니다."
		 * ```
		 */
		correctPostPositions: function(text) {
			// "은(는)" 형태로 조사가 되어 있는 경우
			text = text.replace(/(([^\s]+\s*(\([^\(\)]*\))*\s*)(은\(는\)|이\(가\)|을\(를\)|와\(과\)|로\(으로\)|는\(은\)|가\(이\)|를\(을\)|과\(와\)|으로\(로\)))+?/g, function() {
				var word = arguments[2];
				var candidates = arguments[4];
				return self.attachPostPosition(word, candidates);
			});

			// "{은,는}" 형태로 조사가 되어 있는 경우
			return text.replace(/(([^\s]+\s*(\([^\{\}\(\)]*\))*\s*)\{(은,는|이,가|을,를|와,과|로,으로|는,은|가,이|를,을|과,와|으로,로)\})+?/g, function() {
				var word = arguments[2];
				var candidates = arguments[4];
				return self.attachPostPosition(word, candidates);
			});
		},

		/**
		 * 랜덤 숫자(정수)
		 * @category 숫자
		 * @method randomInt
		 * @return {Integer}	랜덤 생성된 숫자 (0 ~ 100000 사이 정수값).
		 */
		randomInt: function() {
			return parseInt(Math.random() * 100000, 10);
		},

		/**
		 * 문자열에서 공백 제거
		 * @method removeWhitespace
		 * @category 문자열
		 * @param  {String}	str	변환할 문자열
		 * @return {String}	공백 제거된 문자열.
		 */
		removeWhitespace: function(str) {
			return str.replace(/\s/g, '');
		},

		/**
		 * 문자열에서 숫자가 아닌 문자 제거 (빈칸, 특수기호 등)
		 * @method removeNonNumeric
		 * @category 문자열
		 * @param  {String}	str	변환할 문자열
		 * @return {String}	숫자 외 문자가 제거된 문자열.
		 */
		removeNonNumeric: function(str) {
			var result = String(str);
			if (result) {
				result = result.replace(/[^\d]/g, '');
			}
			return result;
		},

		/**
		 * 자릿수에 맞춰서 왼쪽 패딩 처리
		 * @category 문자열
		 * @param {Any} value 패딩 처리할 숫자 또는 문자열
		 * @param {Integer} [n=2] 자릿수
		 * @param {String} [pad='0'] 패딩처리 문자
		 * @return {String} 패딩처리된 문자열 ex) padLeft(1, 2) => '01'
		 */
		padLeft: function(value, n, pad) {
			if (!n) {
				n = 2;
			}
			var result = String(value);
			while (n - result.length > 0) {
				result = (pad || '0') + result;
			}
			return result;
		},

		/**
		 * 자릿수에 맞춰서 오른쪽 패딩 처리
		 * @category 문자열
		 * @param {Any} value 패딩 처리할 숫자 또는 문자열
		 * @param {Integer} [n=2] 자릿수
		 * @param {String} [pad='0'] 패딩처리 문자
		 * @return {String} 패딩처리된 문자열 ex) padRight(1, 2) => '10'
		 */
		padRight: function(value, n, pad) {
			if (!n) {
				n = 2;
			}
			var result = String(value);
			while (n - result.length > 0) {
				result = result + (pad || '0');
			}
			return result;
		},

		/**
		 * Array 복사
		 * @category Array/Object
		 * @method copyArray
		 * @param {Array} array 복사하려는 배열
		 * @param {Boolean} [deep=false] 배열 안에 object 들도 모두 복사할지 여부.
		 * @return {Array} array와 동일한 항목들을 가진 새로 생성된 배열.
		 */
		copyArray: function(array, deep) {
			if (!array) {
				return array;
			}
			return deep ? JSON.parse(JSON.stringify(array)) : [].concat(array);
		},

		/**
		 * Object 복사
		 * @category Array/Object
		 * @method copyObject
		 * @param {Object} object 복사하려는 배열
		 * @return {Object} object와 동일한 key/value가 들어있는 새로 생성된 Object.
		 */
		copyObject: function(object) {
			if (!object) {
				return null;
			}
			return JSON.parse(JSON.stringify(object));
		},

		/**
		 * Object의 여러 값을 한 번에 업데이트
		 * @category Array/Object
		 * @param {Object} object 업데이트하려는 object.
		 * @param {Object} keyValues 업데이트하려는 key, value 정보.
		 * @param {Object} [options] 옵션
		 * Key | Type | 설명
		 * ---|---|---
		 * keyPrefix | String | keyValues에 지정한 key 이름에 동일하게 prefix 넣고 싶은 경우 지정.
		 * @example
		 * ```js
		 * sfd.utils.setValues(data, {
		 *   email: 'email@email.com',
		 *   name: '홍길동'
		 * });
		 * // => 아래처럼 세팅하는 것과 동일
		 * // data.email = 'email@email.com';
		 * // data.name = '홍길동';
         * 
		 * // key prefix 사용하는 경우
		 * sfd.utils.setValues(data, {
		 *   Email: otherData.email,
		 *   Name: otherData.name
		 * }, {
		 *   keyPrefix: 'contractor'
		 * });
		 * // => 아래처럼 세팅하는 것과 동일
		 * // data.contractorEmail = otherData.email;
		 * // data.contractorName = otherData.name
		 * ```
		 */
		setValues: function(object, keyValues, options) {
			options = options || {};

			if (!keyValues) {
				return;
			}

			var keys = this.keys(keyValues);
			for (var i = 0; i < keys.length; i++) {
				var key = keys[i];
				object[(options.keyPrefix || '') + key] = keyValues[key];
			}
		},

		/**
		 * Object의 여러 값을 다른 object에서 복사.
		 * @category Array/Object
		 * @param {Object} dest 업데이트하려는 object.
		 * @param {Object} src 값을 가져올 object.
		 * @param {Object} keys 값을 복사하려는 key 배열.
		 * @param {Object} [option] 옵션
		 * Key | Type | 기본값 | 설명
		 * ---|---|---|---
		 * srcKeyPrefix | String | - | src object 에 값 가져올 key 에 prefix 넣으려는 경우 지정.
		 * destKeyPrefix | String | - | dest object 에 값 복사할 때 key 에 prefix 넣으려는 경우 지정.
		 * skipUndefined | Boolean | false | src object 에 key가 없는 경우 해당 key 값 처리는 생략할지 여부
		 * @example
		 * ```js
		 * sfd.utils.copyValues(destData, srcData, [
		 *   'email',
		 *   'name'
		 * ]);
		 * // => 아래처럼 세팅하는 것과 동일
		 * // destData.email = srcData.email;
		 * // destData.name = srcData.name;
		 * 
		 * // key prefix 사용하는 경우
		 * sfd.utils.copyValues(destData, srcData, [
		 *   'Email',
		 *   'Name'
		 * ], {
		 *   destKeyPrefix: 'contractor', 
		 *   srcKeyPrefix: 'piboja'
		 * });
		 * // => 아래처럼 세팅하는 것과 동일
		 * // destData.contractorEmail = srcData.pibojaEmail;
		 * // destData.contractorName = srcData.pibojaName;
		 * ```
		 */
		copyValues: function(dest, src, keys, option) {
			option = option || {};

			keys.forEach(function(key) {
				var srcKey = (option.srcKeyPrefix || '') + key;
				var destKey = (option.destKeyPrefix || '') + key;

				var value = src[srcKey];
				if (option.skipUndefined == true && value === undefined) {
					return;
				}

				dest[destKey] = value;
			});
		},

		/**
		 * Object 에 특정 key 값들이 있는지 확인
		 * @category Array/Object
		 * @param {Object} object 확인하려는 object.
		 * @param {String|Array} keys 확인하려는 key 또는 key 배열.
		 * @param {Object} [option] 옵션
		 * Key | Type | 설명
		 * ---|---|---
		 * keyPrefix | String | keys에 지정한 key 이름에 동일하게 prefix 넣고 싶은 경우 지정.
		 * @return {Boolean} 모두 값이 들어있으면 true. 하나라도 값이 없으면 false.
		 * @see
		 * 값이 없는지 판단은 값이 undefined거나 null 이거나 빈문자열이면 없는것으로 간주.
		 * 숫자 0은 값이 들어있는 것으로 판단함.
		 * @example
		 * ```js
		 * if (sfd.utils.valueExists(resultData, ['PhoneNo1', 'PhoneNo2', 'PhoneNo3'], { keyPrefix: 'piboja' })) {
		 * 	// resultData.pibojaPhoneNo1, resultData.pibojaPhoneNo2, resultData.pibojaPhoneNo3 세개 값이 모두 있는 경우
		 *  ...
		 * }
		 * ```
		 */
		valueExists: function(object, keys, option) {
			option = option || {};
			keys = typeof keys == 'string' ? [keys] : keys;

			var result = true;

			var index = keys.findIndex(function(key) {
				var value = object[(option.keyPrefix || '') + key];
				return (value === undefined || value === null || value === '');
			});
			if (index != -1) {
				result = false; // 빈 값이 있는걸 발견했으면 false
			}			
			return result;
		},

		/**
		 * Object/Array keyPath에 해당하는 값 변경
		 * @category Array/Object
		 * @param {Object|Array} obj 값을 넣으려는 object 또는 array
		 * @param {String|Array} keyPath 값을 변경하려는 key 경로. 예) "baseDate", "contract/name", "contract/2/name", ['contract', 2, 'name']
		 * @param {*} value 변경하려는 값
		 * @param {Boolean} [extendValue=false] true로 설정하면 기존에 value가 object면 value에 있는 값만 업데이트함. false면 그냥 value로 변경.
		 * @param {Boolean} [createIntermediates=false] true로 설정하면 path 의 중간 key 들이 없는 경우 생성함.
		 */
		setValue: function(obj, keyPath, value, extendValue, createIntermediates) {
			var keys = Array.isArray(keyPath) ? keyPath : keyPath.split('/');
			var o = obj;
			var lastKey = keys.pop();
			for (var i = 0; i < keys.length; i++) {
				var key = keys[i];
				if (typeof key == 'number' || Array.isArray(o)) {
					key = parseInt(key, 10);
					if (o[key] === undefined && createIntermediates == true) {
						o[key] = [];
					}
				} else {
					if (o[key] === undefined && createIntermediates == true) {
						o[key] = {};
					}
				}
				o = o[key];
				if (!o) {
					break;
				}
			}
			if (o && typeof o == 'object') {
				if (typeof lastKey != 'number' && Array.isArray(o)) {
					lastKey = parseInt(lastKey, 10);
				}

				if (typeof value == 'object' && extendValue == true) {
					o[lastKey] = $.extend(o[lastKey] || {}, value);
				} else {
					o[lastKey] = value;
				}
			}
		},

		/**
		 * Object/Array keyPath에 해당하는 값 반환
		 * @category Array/Object
		 * @param {Object|Array} obj 값을 찾을 object 또는 array
		 * @param {String|Array} keyPath 값을 얻으려는 key 경로. 예) "baseDate", "contract/name", "contract/2/name", ['contract', 2, 'name']
		 * @return {*} keyPath에 해당하는 값. 경로가 없는 경우 undefined 반환.
		 */
		getValue: function(obj, keyPath) {
			var result;
			var keys = Array.isArray(keyPath) ? keyPath : keyPath.split('/');
			var o = obj;
			var lastKey = keys.pop();
			for (var i = 0; i < keys.length; i++) {
				var key = keys[i];
				if (typeof key != 'number' && Array.isArray(o)) {
					key = parseInt(key, 10);
				}
				o = o[key];
				if (!o) {
					break;
				}
			}

			if (o && typeof o == 'object') {
				if (typeof lastKey != 'number' && Array.isArray(o)) {
					lastKey = parseInt(lastKey, 10);
				}
				result = o[lastKey];
			}
			return result;
		},

		/**
		 * Object 배열에서 key=value 를 가진 항목 반환
		 * @category Array/Object
		 * @method findObject
		 * @param {Array} list 찾기 대상이 되는 배열
		 * @param {String} key 값 확인하려는 Object 키값
		 * @param {Any} value 찾으려는 Object 값
		 * @return {Object} key=value 가진 Object. 못찾은 경우 null.
		 */
		findObject: function(list, key, value) {
			var result = null;
			for (var i = 0; i < list.length; i++) {
				if (list[i][key] == value) {
					result = list[i];
					break;
				}
			}
			return result;
		},

		/**
		 * Object 배열에서 지정한 key 값들만 뽑아서 배열로 반환
		 * @category Array/Object
		 * @param {Array} list 소스 배열.
		 * @param {String} key 값을 뽑을 key 이름.
		 * @return {Array} 뽑은 값들의 배열
		 * @example
		 * ```js
		 * var list = [{ code: '01', label: '옵션1' }, { code: '05', label: '옵션2' }, { code: '08', label: '옵션3' }];
		 * sfd.utils.extractValues(list, 'code');
		 * // => ['01', '05', '08']
		 * 
		 * sfd.utils.extractValues(list, 'label');
		 * // => ['옵션1', '옵션2', '옵션3']
		 * ```
		 */
		extractValues: function(list, key) {
			return list.map(function(item) {
				return item[key] || undefined;
			});
		},

		/**
		 * 배열에서 첫번째 항목을 제거하고 반환.
		 * @category Array/Object
		 * @param {Array} list 첫번째 항목을 추출할 배열
		 * @param {*} [defaultValue] list가 null/undefined이거나 빈 배열인 경우 반환할 기본값
		 * @return {*} 배열의 첫번째 항목. 배열이 없거나 비어있고 defaultValue가 지정된 경우 defaultValue 반환.
		 */
		shift: function(list, defaultValue) {
			return (list && list.shift()) || defaultValue;
		},

		/**
		 * 배열에서 key, value 비교 조건에 맞는 것들만 추출.
		 * @category Array/Object
		 * @param {Array} list 소스 배열.
		 * @param {Object} filter 필터 조건.
		 * Key | Type | 설명
		 * ---|---|---
		 * key | String | 확인할 object의 key 이름. list가 object가 아닌 그냥 값의 배열이면 생략.
		 * value | Any | 확인할 object key에 해당하는 값. 지정 안하면 key가 존재하는 것들 추출.
		 * @param {String} [condition="equal"] 비교 조건
		 * 값 | 설명
		 * ---|---
		 * equal | filter value 와 같은 값 가진 항목들 추출
		 * notequal | filter value 와 다른 값 가진 항목들 추출
		 * includes | filter value를 포함한 값을 가진 항목들 추출
		 * notincludes | filter value를 포함하지 않은 값을 가진 항목들 추출
		 * starts | filter value로 시작하는 값을 가진 항목들 추출
		 * ends | filter value로 끝나는 값을 가진 항목들 추출
		 * @param {Object} [options] 옵션
		 * Key | Type | 기본값 | 설명
		 * ---|---|---|---
		 * caseInsensitive | Boolean | false | 대소문자 구분 없이 비교하고 싶으면 true로 지정.
		 * strictEquality | Boolean | false | true로 지정하면 ===, !== 로 비교. false로 지정하면 ==, != 로 비교.
		 * @return {Array} 필터/비교 조건에 맞는 항목들만 추출한 배열
		 * @example
		 * Object의 type 값이 '01'인 것들만 추출.
		 * ```js
		 * var list = [{ type: '01', label: '테스트1' }, { type: '01', label: '테스트2' }, { type: '02', label: '테스트3' }];
		 * sfd.utils.filter(list, { key: 'type', value: '01' });
		 * // => [{ type: '01', label: '테스트1' }, { type: '01', label: '테스트1' }]
		 * ```
		 * Object의 type 값이 '01'이 아닌 것들만 추출.
		 * ```js
		 * var list = [{ type: '01', label: '테스트1' }, { type: '01', label: '테스트2' }, { type: '02', label: '테스트3' }];
		 * sfd.utils.filter(list, { key: 'type', value: '01' }, "notequal");
		 * // => [{ type: '02', label: '테스트3' }]
		 * ```
		 * 값을 확인하지는 않고 object에 key가 존재하는 것들 모두 추출.
		 * ```js
		 * var list = [{ code: '01', amount: 100 }, { code: '02', amount: 200 }, { code: '03' }];
		 * sfd.utils.filter(list, { key: 'amount' });
		 * // => [{ code: '01', amount: 100 }, { code: '02', amount: 200 }]
		 * ```
		 */
		filter: function(list, filter, condition, options) {
			var indexes = this.indexesOf(list, filter, condition, options);
			var result = [];
			var index;
			for (var i = 0; i < indexes.length; i++) {
				index = indexes[i];
				result.push(list[index]);
			}
			return result;
		},

		/**
		 * 배열에서 key, value 비교 조건에 맞는 첫번째 항목의 index 얻기
		 * @category Array/Object
		 * @param {Array} list 확인할 배열
		 * @param {Object} filter 필터 조건 (filter 함수 설명 참고)
		 * @param {String} [condition="equal"] 비교 조건 (filter 함수 설명 참고)
		 * @param {Object} [options] 옵션 (filter 함수 설명 참고)
		 * @return {Integer} 필터/비교 조건에 해당하는 항목의 index. 발견 못한 경우 -1.
		 * @example
		 * Object의 type 값이 '02'인 첫번째 object의 index.
		 * ```js
		 * var list = [{ type: '01', label: '테스트1' }, { type: '02', label: '테스트2' }, { type: '01', label: '테스트3' }];
		 * sfd.utils.indexOf(list, { key: 'type', value: '02' });
		 * // => 1;
		 * ```
		 */
		indexOf: function(list, filter, condition, options) {
			options = $.extend(options || {}, { findFirstOnly: true });
			var indexes = this.indexesOf(list, filter, condition, options);
			return indexes.length == 1 ? indexes[0] : -1;
		},

		/**
		 * 배열에서 key, value 비교 조건에 해당하는 모든 항목들의 index들 얻기
		 * @category Array/Object
		 * @param {Array} list 확인할 배열
		 * @param {Object} filter 필터 조건 (filter 함수 설명 참고)
		 * @param {String} [condition="equal"] 비교 조건 (filter 함수 설명 참고)
		 * @param {Object} [options] 옵션 (filter 함수 설명 참고)
		 * @return {Array} 필터/비교 조건에 해당하는 항목들의 index 배열. 발견 못한 경우 빈 배열.
		 * @example
		 * Object의 type 값이 '01'인 것들의 index.
		 * ```js
		 * var list = [{ type: '01', label: '테스트1' }, { type: '02', label: '테스트2' }, { type: '01', label: '테스트3' }];
		 * sfd.utils.indexesOf(list, { key: 'type', value: '01' });
		 * // => [0, 2];
		 * ```
		 */
		indexesOf: function(list, filter, condition, options) {
			condition = condition || 'equal';
			options = $.extend({
				caseInsensitive: false,
				strictEquality: false
			}, options);

			var result = [];
			var item;
			var isMatch;

			// 대소문자 구분 안함 옵션 true면, filter.value 값 소문자로 변경
			if (options.caseInsensitive && filter.value && typeof filter.value == 'string') {
				filter.value = filter.value.toLowerCase();
			}

			for (var i = 0; i < list.length; i++) {
				item = list[i];
				var itemValue = !filter.key ? item : item[filter.key]; // key가 없으면 단순 배열, 있으면 object 배열로 간주

				if (filter.key && filter.value === undefined) {
					// key만 지정된 경우. key 존재여부만 확인
					isMatch = item && item[filter.key] !== undefined;
				} else {
					// 대소문자 구분 안함 옵션 true면, 비교 대상 값들을 모두 소문자로 변경
					if (options.caseInsensitive && itemValue) {
						if (typeof itemValue == 'string') {
							itemValue = itemValue.toLowerCase();
						} else if (Array.isArray(itemValue)) {
							itemValue = itemValue.map(function(v) {
								return typeof v == 'string' ? v.toLowerCase() : v;
							});
						}
					}
					// condition에 따라 비교
					switch (condition) {
						case 'equal':
							isMatch = options.strictEquality === true ? (itemValue === filter.value) : (itemValue == filter.value);
							break;
						case 'notequal':
							isMatch = options.strictEquality === true ? (itemValue !== filter.value) : (itemValue != filter.value);
							break;
						case 'includes':
							isMatch = (typeof itemValue == 'string' || Array.isArray(itemValue)) && itemValue.includes(filter.value);
							break;
						case 'notincludes':
							isMatch = (typeof itemValue == 'string' || Array.isArray(itemValue)) && (itemValue.includes(filter.value) == false);
							break;
						case 'starts':
							isMatch = (typeof itemValue == 'string' && itemValue.startsWith(filter.value) == false);
							break;
						case 'ends':
							isMatch = (typeof itemValue == 'string' && itemValue.endsWith(filter.value) == false);
							break;
					}
				}

				if (isMatch) {
					result.push(i);
					if (options.findFirstOnly === true) {
						break;
					}
				}
			}
			return result;
		},

		/**
		 * Object에서 지정한 키들을 삭제.
		 * @category Array/Object
		 * @param {Object} object 지정한 키들을 삭제할 object.
		 * @param {Array} keys 삭제할 key 들의 배열
		 * @param {Boolean} [recursive=true] 하위 값들 키도 삭제할지 여부.
		 */
		deleteKeys: function(object, keys, recursive) {
			recursive = recursive === undefined ? true : recursive;
			if (Array.isArray(object)) {
				for (var i = 0; i < object.length; i++) {
					if (typeof object[i] == 'object') {
						this.deleteKeys(object[i], keys, recursive);
					}
				}
			} else {
				var allKeys = this.keys(object);
				for (var i = 0; i < allKeys.length; i++) {
					var key = allKeys[i];
	
					if (keys.includes(key)) {
						try {
							delete object[key];
						} catch (e) {								
							object[key] = undefined;
						}
					} else {
						if (recursive == true && typeof object[key] == 'object') {
							this.deleteKeys(object[key], keys, recursive);
						}
					}
				}	
			}
			return object;
		},

		/**
		 * 주민등록번호에서 생일 얻기
		 * @category 변환
		 * @method dateOfBirth
		 * @param {String} ssn 주민등록번호
		 * @return {Date} 생일 날짜. 실패한 경우 null.
		 */
		dateOfBirth: function(ssn) {
			var result = null;
			
			if (ssn.length == 7 || ssn.length > 8) {
				// 주민등록번호일 경우 (주민등록번호 다 온게 아니고 앞에 7자리만 온 경우도)
				var code = ssn.substr(6, 1);
				if (['3', '4', '7', '8'].indexOf(code) != -1) {
					 //2000년 이후 출생자인경우 3,4,7,8 인 경우
					result = '20' + ssn.substr(0, 6);
				} else { //2000년 이전 출생자 인경우
					result = '19' + ssn.substr(0, 6);
				}
			} else if (ssn.length == 8 && self.isNum(ssn)) {
				// 년월일일 경우 그대로
				result = ssn;
			}
			return self.stringToDate(result);
		},

		/**
		 * 주민등록번호에서 생일 얻기
		 * @category 변환
		 * @method ssnToDate
		 * @param  {String}  ssn 주민등록번호
		 * @return {Date} 생일.
		 */
		ssnToDate: function(ssn) {
			return self.dateOfBirth(ssn);
		},

		/**
		 * 날짜를 주민등록번호 형태로 변환
		 * @category 변환
		 * @method dateToSSN
		 * @param  {Date|String}    date   Date 또는 YYYYMMDD문자열
		 * @param  {String}  gender 남자: "2" 또는 "m" 여자: "1" 또는 "f"
		 * @param {Boolean} [pad="X"] 주민등록번호 뒷자리 채울 문자. null 또는 false로 넘기면 7자리만 반환.
		 * @return {String}         주민등록번호 문자열 (pad가 null 이면 7자리, 아니면 13자리). 변환 실패하는 경우 null.
		 */
		dateToSSN: function(date, gender, pad) {
			if (pad === undefined) {
				pad = 'X';
			}

			var result = typeof date == Object ? self.dateToString(date) : String(date);
			if (!date || date.length != 8) {
				return null;
			}
			
			var genderCode;
			if (parseInt(gender, 10) == 2 || gender == 'm') {
				// 남성
				genderCode = result.substr(0, 2) == '19' ? '1' : '3';
			} else if (parseInt(gender, 10) == 1 || gender == 'f') {
				// 여성
				genderCode = result.substr(0, 2) == '19' ? '2' : '4';
			}
			result = result.slice(2); // 19/20 부분 제거

			// 성별 코드
			if (genderCode) {
				result += genderCode;
			} else {
				result += pad;
			}

			// 나머지 뒷자리 pad 처리
			if (pad) {
				var astLength = 13 - result.length;
				result += Array(astLength + 1).join(pad);
			}
			return result;
		},
		
		/**
		 * 화면 표시용 숫자 문자열로 변환.(기본은 천단위 콤마 삽입)
		 * @category Formatting
		 * @method formatNumber
		 * @param  {Number|String}	n	변경할 숫자.
		 * @param  {Object}	[options] 옵션
		 * Key | Type | 기본값 | 설명
		 * ---|---|---|---
		 * compact | Boolean | false | "12만3천" 처럼 한글단위 사용 짧은 숫자문자열로 변환하려면 true로 지정.
		 * 
		 * `compact`를 true로 지정했을 때 사용할 수 있는 옵션들
		 * Key | Type | 기본값 | 설명
		 * ---|---|---|---
		 * unitChars | Array 또는 String | ['', '십', '백', '천'] | 일, 십, 백, 천 중단위 문자. 억/만 단위만 표시하고 싶으면 'none'.
		 * dropBelow | Int | 0 | 버리고싶은 단위. 만단위까지만 하고 싶으면 10000
		 * thousandSeparator | Bool | false | 천단위 콤마 넣을지 여부. true로 설정하면 unitChars은 'none'으로 강제 세팅됨.
		 * preserveHundredMillion | Bool | false | 억이상은 단위 한글 없이 숫자 그대로 표시할지.
		 * compactZeros | Bool | false | 1000 => 1천, 100 => 1백, 1400 => 1400.
		 * @return {String}	변환된 문자열.
		 * @example
		 * 옵션 없이 사용하는 경우는 그냥 천단위 콤마 처리만 됨
		 * ```js
		 * sfd.utils.formatNumber(123000);
		 * // => "123,000"
		 * ```
		 * 
		 * `compact` 옵션 true로 사용하는 경우
		 * ```js
		 * sfd.utils.formatNumber(123000, { compact: true });
		 * // => "1십2만3천"
		 * 
		 * sfd.utils.formatNumber(1234567, { compact: true });
		 * // => "1백2십3만4천5백6십7"
		 * 
		 * sfd.utils.formatNumber(113200000, { 
		 *   compact: true,
		 *   dropBelow: 10000, 
		 *   unitChars: 'none' 
		 * });
		 * // => "1억1320만"
		 * 
		 * sfd.utils.formatNumber(15000000, {
		 *   compact: true,
		 *   dropBelow: 10000, 
		 *   thousandSeparator: true 
		 * });
		 * // => "1,500만"
		 * 
		 * sfd.utils.formatNumber(113200000, {
		 *   compact: true,
		 *   dropBelow: 10000,
		 *   thousandSeparator: true 
		 * });
		 * // => "1억1,320만"
		 * 
		 * sfd.utils.formatNumber(30000000, {
		 *   compact: true,
		 *   unitChars: 'none', 
		 *   dropBelow: 10000,
		 *   compactZeros: true 
		 * });
		 * // => "3천만"
		 * 
 		 * sfd.utils.formatNumber(3000000, {
		 *   compact: true,
		 *   unitChars: 'none',
		 *   dropBelow: 10000,
		 *   compactZeros: true 
		 * });
		 * // => "3백만"
		 * 
		 * sfd.utils.formatNumber(32000000, {
		 *   compact: true,
		 *   unitChars: 'none',
		 *   dropBelow: 10000,
		 *   compactZeros: true
		 * });
		 * // => "3200만"
		 * ```
		 */
		formatNumber: function(n, options) {
			options = $.extend({
				compact: false
			}, options);

			if (!n) {
				return '0';
			}

			if (options.compact === true) {
				return this.numberString(n, options);
			} else {
				var regExp = new RegExp('(-?[0-9]+)([0-9]{3})');
				var result = String(n);
				var separator = ',';
				while (regExp.test(result)) {
					result = result.replace(regExp, '$1' + separator + '$2');
				}
				return result;
			}
		},

		/**
		 * [sfd.utils.formatNumber(num, { compact: true});](#formatNumber) 로 사용하세요. (deprecated)
		 * @category Formatting
		 * @method numberString
		 * @param {Number|String} num 변환할 숫자 혹은 숫자로 구성된 문자열
		 * @param {Object} options 옵션
		 * 옵션|Type|설명
		 * ---|---|---
		 * unitChars | Array 또는 String | 일, 십, 백, 천 중단위 문자. 억/만 단위만 표시하고 싶으면 'none'.<br>기본값: ['', '십', '백', '천']
		 * dropBelow | Int | 버리고싶은 단위. 만단위까지만 하고 싶으면 10000
		 * thousandSeparator | Bool | 천단위 콤마 넣을지 여부. true로 설정하면 unitChars은 'none'으로 강제 세팅됨.
		 * preserveHundredMillion | Bool | 억이상은 단위 한글 없이 숫자 그대로 표시할지.<br>기본값 false
		 * compactZeros | Bool | 1000 => 1천, 100 => 1백, 1400 => 1400.<br>기본값 false
		 * @return {String} 변환된 문자열
		 * @see 
		 * sfd.utils.formatNumber(10000, { compact: true }); 로 사용하세요.
		 * @example
		 * ```js
		 * sfd.utils.numberString(123000);
		 * // => "1십2만3천"
		 * 
		 * sfd.utils.numberString(1234567);
		 * // => "1백2십3만4천5백6십7"
		 * 
		 * sfd.utils.numberString(113200000, { 
		 *   dropBelow: 10000, 
		 *   unitChars: 'none' 
		 * });
		 * // => "1억1320만"
		 * 
		 * sfd.utils.numberString(15000000, {
		 *   dropBelow: 10000, 
		 *   thousandSeparator: true 
		 * });
		 * // => "1,500만"
		 * 
		 * sfd.utils.numberString(113200000, {
		 *   dropBelow: 10000,
		 *   thousandSeparator: true 
		 * });
		 * // => "1억1,320만"
		 * 
		 * sfd.utils.numberString(30000000, {
		 *   unitChars: 'none', 
		 *   dropBelow: 10000,
		 *   compactZeros: true 
		 * });
		 * // => "3천만"
		 * 
 		 * sfd.utils.numberString(3000000, {
		 *   unitChars: 'none',
		 *   dropBelow: 10000,
		 *   compactZeros: true 
		 * });
		 * // => "3백만"
		 * 
		 * sfd.utils.numberString(32000000, {
		 *   unitChars: 'none',
		 *   dropBelow: 10000,
		 *   compactZeros: true
		 * });
		 * // => "3200만"
		 * ```
		 */
		numberString: function(num, options) {
			options = $.extend({
				dropBelow: 0, // 절삭하려는 단위
				unitChars: ['', '십', '백', '천'], // 중단위 문자
				preserveHundredMillion: false, // 억이상 숫자 그대로 표시
				thousandSeparator: false,
				compactZeros: false
			}, options);

			if (options.midUnit) {
				options.unitChars = options.midUnit; // 구소스 호환을 위해
			}

			if (options.thousandSeparator == true) {
				options.unitChars = 'none';
			}
			if (Array.isArray(options.unitChars) == false || options.unitChars.join('').length == 0) {
				options.unitChars = null;
			}

			if (!num) {
				return '0';
			}

			if (typeof num == 'string') {
				num = parseInt(num, 10);
			}

			// 절삭 옵션 있으면 절삭
			if (options.dropBelow > 0) {
				num = num - num % options.dropBelow;
			}
			var overHundredMillion;
			// 억이상 숫자그대로 표시 옵션 처리
			if (options.preserveHundredMillion === true || options.thousandSeparator === true) {
				overHundredMillion = Math.floor(num / 100000000);
				num = num - overHundredMillion * 100000000;
			}

			// 변환 작업을 위해 문자열로
			num = String(num);

			// 한자리는 그냥 반환
			if (num == '0') {
				if (overHundredMillion != undefined && overHundredMillion > 0) {
					num = String(overHundredMillion) + '억';
				}	
				return num;
			}

			// 대단위 유닛
			var bigUnit = ['', '만', '억', '조'];
			var replaceUnit = ['억만'];
			var replaceUnitTo = ['억'];

			// 변수
			var slices = []; // 대단위(4자리)로 저장

			// 대단위 나누기 (1234560789 -> ['12', '3456', '789'])
			for (var i = num.length; i > 0; i -= 4) {
				// 각 slice별로 앞쪽 0은 없애고 집어넣음 (0001 => 1)
				var slice = parseInt(num.substring(i - 4, i), 10);
				slices.push(slice == 0 ? '' : String(slice));
			}

			// 중단위 문자(일십백천) 넣음
			if (options.unitChars) {
				for (var i = 0; i < slices.length; i++) {
					var nums = slices[i].split('').reverse();
					var zeros = '';
					slices[i] = nums.map(function(num, index) {
						if (num == '0') {
							zeros += '0';
							return '';
						} else {
							var unit = options.unitChars[index] || zeros;
							zeros = '';
							return num + unit;
						}
					}).reverse().join('');
				}
			}

			// 대단위 합치기
			var result = slices.map(function(slice, index) {
				return slice + bigUnit[index];
			}).reverse().join('');

			// 단위문자가 중복되는거 제거 (억만 -> 억)
			for (var i = 0; i < replaceUnit.length; i++) {
				result = result.replace(replaceUnit[i], replaceUnitTo[i]);
			}

			// 십억이상 보존 했던거 붙임
			if (overHundredMillion != undefined && overHundredMillion > 0) {
				result = String(overHundredMillion) + '억' + result;
			}

			// 1000 -> 1천, 100 -> 1백
			if (options.compactZeros) {
				// 1000 -> 1천  100만 1백만
				var regex = /([0-9일십백천]+)(억|만|)/g;
				var match;
				var commaResult = [];
				while ((match = regex.exec(result))) {
					if (match[1].length == 4 && match[1].slice(-3) == '000') {
						// 1000 => 1천
						commaResult.push(match[1].replace('000', '천') + match[2]);
					} else if (match[1].length == 3 && match[1].slice(-2) == '00') {
						// 100 => 1백
						// 1400 => 14백 : 이런 경우는 안바꿈  
						commaResult.push(match[1].replace('00', '백') + match[2]);
					} else {
						commaResult.push(match[1] + match[2]);
					}
				}
				result = commaResult.join('');
			}

			// 천단위 콤마 추가
			if (options.thousandSeparator) {
				var regex = /([0-9일십백천]+)(억|만|)/g;
				var match;
				var commaResult = [];
				while ((match = regex.exec(result))) {
					if (self.isNum(match[1])) {
						// 콤마 넣기
						commaResult.push(self.formatNumber(match[1]) + match[2]);
					} else {
						// 중간에 문자 들어간건 콤마 넣지 말아야함
						commaResult.push(match[1] + match[2]);
					}
				}
				result = commaResult.join('');
			}
			return result;
		},

		/**
		 * 소수점자리 표시
		 * @category Formatting
		 * @method formatFloat
		 * @param  {Number|String}	n	변경할 숫자.
		 * @param  {Number}	number		소수점 자리수
		 * 
		 * @return {String}	변환된 문자열.
		 * @example
		 * ```js
		 * sfd.utils.formatFloat(3, 3);
		 * // => "3.000"
		 * sfd.utils.formatFloat('2.2', 3);
		 * // => "3.200"
		 * ```
		 */
		formatFloat: function(n, number) {
			// 첫번째 인자가 숫자가 아니면 숫자로 바꿈
			n = typeof n != 'number' ? Number(n) : n;
			var num = typeof number != 'number' ? 0 : number;
			
			return n.toFixed(num);
		},

		/**
		 * 날짜 문자열이 정상적인 날짜인지 확인. (정확한 월별 일 범위 확인까지 함)
		 * @category 확인
		 * @param {String} str 날짜 문자열. 예) 20180101, 2018/1/1, 2018.01.01
		 * @param {Boolean} [isBirthDate=false] 생일인 경우 연도 범위를 좁혀서 확인하고자 할때 true로 지정. (현재 연도 + 1 넘으면 false 처리. 출생예정일 입력도 있을 수 있으니)
		 * @return {Boolean} 정상적인 날짜 텍스트면 true 아니면 false.
		 * @see
		 * 1900년 이전이나 2200년 이후는 false로 간주.
		 */
		isValidDateString: function(str, isBirthDate) {
			var result = false;
			str = str ? str.trim() : '';

			var checkMatch = function(year, month, day) {
				var isValid = false;
				var year = parseInt(year, 10);
				var month = parseInt(month, 10);
				var day = parseInt(day, 10);

				if (month <= 12 && day <= 31 && year >= 1900 && year < 2300) {
					isValid = (day <= self.daysInMonth(year, month));
				}
				if (isValid && isBirthDate === true) {
					// 생일은 현재 연도 + 1 넘어가면 false 처리
					if (year > (new Date()).getFullYear() + 1) {
						isValid = false;
					}
				}
			
				return isValid;
			}

			// 구분자 없는 경우 (뒤에 시간도 있을 수 있으니 앞쪽만 확인)
			var match = str.match(/^(\d{4})(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])/);
			if (match) {
				result = checkMatch(match[1], match[2], match[3]);
			} else {
				// 구분자 있는 경우
				match = str.match(/^(\d{4})(-|\/|\.)(0?[1-9]|1[012])(-|\/|\.)(0?[1-9]|[12][0-9]|3[01])($|\s)/);
				if (match) {
					result = checkMatch(match[1], match[3], match[5]);
				}
			}
			return result;
		},

		/**
		 * YYYYMMDD, YYYY/MM/DD 등 날짜 문자열을 Date형으로 변환
		 * @category 변환
		 * @method stringToDate
		 * @param {String} str YYYYMMDD 또는 YYYY/MM/DD 처럼 년월일 사이 구분자(/-.) 있는 날짜 문자열.
		 * 구분자 있는 경우 월, 일이 꼭 2자리 아니어도 됨
		 * @return {Date} 변환된 Date. 문자열이 날짜 형태가 아닌 경우 null.
		 * @see
		 * 현재 지원 형식
		 * - yyyyMMdd
		 * - yyyy/MM/dd, yyyy.MM.dd, yyyy-MM-dd (구분자가 있는 경우 월/일 꼭 두자리 아니어도 됨)
		 * - YYYYMMDDHHmm, yyyyMMddHHmmss, yyyyMMdd HHmmss
		 */
		stringToDate: function(str) {
			if (!str) {
				return null;
			}
			if (this.isValidDateString(str) == false) {
				return null;
			}

			str = str.replace(/\s/g, '');

			// YYYYMMDD
			var match = str.match(/^(\d{4})(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])$/);
			if (match) {
				return new Date(parseInt(match[1], 10), parseInt(match[2], 10) - 1, parseInt(match[3], 10));
			} 

			// YYYY/MM/DD 처럼 년월일 사이 구분자(-/.) 있는 경우(월, 일이 꼭 2자리 아닌 것도 처리됨)
			match = str.match(/^(\d{4})(-|\/|\.)(0?[1-9]|1[012])(-|\/|\.)(0?[1-9]|[12][0-9]|3[01])$/);
			if (match) {
				return new Date(parseInt(match[1], 10), parseInt(match[3], 10) - 1, parseInt(match[5], 10));
			}

			// yyyyMMddHHii
			var match = str.match(/^(\d{4})(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])([01][0-9]|2[0-4])([0-5][0-9])$/);
			if (match) {
				var hours = parseInt(match[4], 10);
				var minutes = parseInt(match[5], 10);
				return new Date(parseInt(match[1], 10), parseInt(match[2], 10) - 1, parseInt(match[3], 10), hours, minutes);
			}

			// yyyyMMddHHiiss
			var match = str.match(/^(\d{4})(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])([01][0-9]|2[0-4])([0-5][0-9])([0-5][0-9])$/);
			if (match) {
				var hours = parseInt(match[4], 10);
				var minutes = parseInt(match[5], 10);
				var seconds = parseInt(match[6], 10);			
				return new Date(parseInt(match[1], 10), parseInt(match[2], 10) - 1, parseInt(match[3], 10), hours, minutes, seconds);
			}
			
			return null;
		},
		/**
		 * Date형을 YYYYMMDD 형태의 문자열로 변환
		 * @category 변환
		 * @method dateToString
		 * @param {Date|String} date	변환하려는 Date
		 * @param {String} [format='yyyyMMdd'] 표준 날짜/시간 형식.
		 * @return {String}	YYYYMMDD 형태의 날짜 문자열
		 * @example
		 * format: '-' => 2018-05-12
		 * format: '/' => 2018/05/12
		 * format: '.' => 2018.05.12
		 * format: 'label' => 2018년 05월 12일
		 * format: 'yyyy/MM/dd' => 2018/12/05
		 * format: 'yyyy-MM-dd HH:mm:ss' => 2018-05-12 17:30:24
		 * format: 'yyyy년 MM월 dd일' => 2018년 05월 12일
		 * format: 'yyyy년 M월 d일' => 2018년 5월 12일
		 * @see
		 * 간단 Format
		 * Format|설명|예
		 * ---|---|---
		 * -|YYYY-MM-DD 형태로 반환|2018-06-18
		 * /|YYYY/MM/DD 형태로 반환|2018/06/18
		 * .|YYYY.MM.DD 형태로 반환|2018.06.18
		 * label|YYYY년 MM월 DD일 형태로 반환|2018년 06월 18일
		 * 
		 * 상세 Format: 아래 Format들 조합으로 구성 가능
		 * Format|설명|예
		 * ---|---|---
		 * s |      초 0-59. | "0" to "59"
		 * ss |     초. 한자리수인 경우 앞에 0 붙임 | "00" to "59"
		 * m |      분 0-59. | "0"  or "59"
		 * mm |     분 00-59. 한자리수인 경우 앞에 0 붙임 | "00" or "59"
		 * h |      시간 1-12. | "1"  to "12"
		 * hh |     시간 01-12. 한자리수인 경우 앞에 0 붙임 | "01" to "12"
		 * H |      시간 0-23. | "0" to "23"
		 * HH |     시간 00-23. 한자리수인 경우 앞에 0 붙임 | "00" to "23"
		 * d |      날짜 1~31. | "1"  to "31"
		 * dd |     날짜 00~31. 한자리수인 경우 앞에 0 붙임 | "01" to "31"
		 * ddd |    짧은 요일 | "Mon" to "Sun"
		 * dddd |   긴 요일 | "Monday" to "Sunday"
		 * M |      월 1-12. | "1" to "12"
		 * MM |     월 01-12.  한자리수인 경우 앞에 0 붙임 | "01" to "12"
		 * MMM |    월 짧은 텍스트 | "1월" to "12월"
		 * MMMM |   월 긴 텍스트 | "1월" to "12월"
		 * yy |     두자리수 년도 |  "99" or "08"
		 * yyyy |   네자리수 년도 |  "1999" or "2008"
		 * t |      오전 또는 오후 |  "오전" or "오후"
		 * tt |     오전 또는 오후 |  "오전" or "오후"
		 */
		dateToString: function(date, format) {
			if (typeof date == 'string') {
				date = this.stringToDate(date);
			}
			// format shortcut인 경우 변환
			if (!format) {
				format = 'yyyyMMdd';
			} else if (format == '-') {
				format = 'yyyy-MM-dd';
			} else if (format == '.') {
				format = 'yyyy.MM.dd';
			} else if (format == '/') {
				format = 'yyyy/MM/dd';
			} else if (format == 'full' || format == 'label') {
				format = 'yyyy년 MM월 dd일';
			}

			var x = date;

			return format.replace(/(\\)?(dd?d?d?|MM?M?M?|yy?y?y?|hh?|HH?|mm?|ss?|tt?|S)/g,
				function(m) {
					if (m.charAt(0) === '\\') {
						return m.replace('\\', '');
					}
					var p = self.padLeft;
					x.h = x.getHours;
					switch (m) {
						case 'hh':
							return p(x.h() < 13 ? (x.h() === 0 ? 12 : x.h()) : (x.h() - 12));
						case 'h':
							return x.h() < 13 ? (x.h() === 0 ? 12 : x.h()) : (x.h() - 12);
						case 'HH':
							return p(x.h());
						case 'H':
							return x.h();
						case 'mm':
							return p(x.getMinutes());
						case 'm':
							return x.getMinutes();
						case 'ss':
							return p(x.getSeconds());
						case 's':
							return x.getSeconds();
						case 'yyyy':
							return p(x.getFullYear(), 4);
						case 'yy':
							return p(x.getFullYear());
						case 'dddd':
							return self.weekdayLabel(x);
						case 'ddd':
							return self.weekdayLabel(x, true);
						case 'dd':
							return p(x.getDate());
						case 'd':
							return x.getDate();
						case 'MMMM':
							return String(x.getMonth() + 1) + '월';
						case 'MMM':
							return String(x.getMonth() + 1) + '월';
						case 'MM':
							return p((x.getMonth() + 1));
						case 'M':
							return x.getMonth() + 1;
						case 't':
							return x.h() < 12 ? '오전' : '오후';
						case 'tt':
							return x.h() < 12 ? '오전' : '오후';
						case 'S':
							return String(x.getDate());
						default:
							return m;
					}
				}
			);
		},

		/**
		 * 날짜를 포맷화된 문자열로 변환
		 * @category Formatting
		 * @method formatDate
		 * @param {String|Date} date Date나 YYYYMMDD, YYYY/MM/DD 형태의 날짜 문자열.
		 * @param {String} [format='.'] [sfd.utils.dateToString()](#dateToString) format 인자 설명 참고. 접근성모드에서는 기본값 ''.
		 * @return {String} 변환된 문자열.
		 * @example
		 * 간단 포맷 사용
		 * ```js
		 * sfd.utils.formatDate('20180512'); // => "2018.05.12"
		 * 
		 * sfd.utils.formatDate('20180512', '-'); // => "2018-05-12"
		 * sfd.utils.formatDate('20180512', '/'); // => "2018/05/12"
		 * sfd.utils.formatDate('20180512', 'label'); // => "2018년 05월 12일"
		 * ```
		 * 
		 * 사용자 정의 포맷 사용
		 * ```js
		 * var date = new Date();
		 * sfd.utils.formatDate(date, 'yyyy/MM/dd'); // => "2019/06/13"
		 * sfd.utils.formatDate(date, 'yyyy-MM-dd HH:mm:ss'); // => "2019-06-13 17:30:24"
		 * sfd.utils.formatDate(date, 'yyyy년 MM월 dd일'); // => "2019년 06월 13일"
		 * sfd.utils.formatDate(date, 'yyyy년 M월 d일'); // => "2019년 6월 13일"
		 * ```
		 */
		formatDate: function(date, format) {
			var defaultFormat = sfd && sfd.env && sfd.env.screenReader ? '' : '.';
			format = format || defaultFormat;

			if (typeof date == 'string' || self.isNum(date) ) {
				var dateString = String(date);
				date = self.stringToDate(dateString);
				if (!date) {
					return dateString; // 날짜로 변환 실패하면 인자로 넘어온거 그대로 반환
				}
			}
			return self.dateToString(date, format);
		},

		/**
		 * 기간(시작일 ~ 종료일) 포맷화된 문자열로 변환
		 * @category Formatting
		 * @param {String|Date} fromDate 시작일 날짜 또는 시작일에 표시할 텍스트.
		 * @param {String|Date} toDate 종료일 날짜 또는 종료일에 표시할 텍스트.
		 * @param {Object} options 옵션
		 * Key | Type | 기본값 | 설명
		 * ---|---|---|---
		 * tilt | String | " ~ " | 중간에 표시할 문자열
		 * dateFormat | String | "." | 날짜 표시 포맷. ex) ".", "/", "full"
		 * @return {String} 변환된 문자열
		 * @example
		 * ```js
		 * sfd.utils.formatPeriod('20190101', '20190330'); // => "2019.01.01 ~ 2019.03.30"
		 * sfd.utils.formatPeriod('시작시점', '20190330'); // => "시작시점 ~ 2019.03.30"
		 * sfd.utils.formatPeriod('20190101', '20190330', { dateFormat: 'full' }); // => "2019년 01월 01일 ~ 2019년 03월 30일"
		 * sfd.utils.formatPeriod('20190101', '20190330', { tilt: '-' }); // => "2019.01.01-2019.03.30"
		 * sfd.utils.formatPeriod('', '20190330'); // => "~ 2019.03.30"
		 * ```
		 */
		formatPeriod: function(fromDate, toDate, options) {
			options = $.extend({
				tilt: ' ~ ',
				dateFormat: '.'
			}, options);

			var result = '';

			result += this.formatDate(fromDate || '', options.dateFormat) || fromDate || '';
			result += options.tilt;
			result += this.formatDate(toDate || '', options.dateFormat) || toDate || '';

			return result.trim();
		},

		/**
		 * 화면 표시용 주민등록번호(법인번호) 문자열로 변환. 
		 * @category Formatting
		 * @param  {String}   ssn 주민등록번호 또는 법인 번호
		 * @return {String} 변환된 문자열.
		 * @example
		 * ```js
		 * // 주민등록번호
		 * sfd.utils.formatSSN('830101-1234567'); // => "830101-1******"
		 * 
		 * // 법인번호
		 * sfd.utils.formatSSN('2120073727'); // => "212-00-73727"
		 * ```
		 */
		formatSSN: function(ssn, options) {
			if (!ssn) {
				return '';
			}
			if (ssn.includes('-')) {
				ssn = ssn.replace(/\-/g, '');
			}

			if ( ssn.length == 13 ) {
				return ssn.substr(0, 6) + '-' + ssn.substr(6, 1) + '******';
			} else if (ssn.length == 10) {
				return ssn.substr(0, 3) + '-' + ssn.substr(3, 2) + '-' + ssn.substr(5, 5);
			}
			return ssn;
		},

		/**
		 * 화면표시용 우편번호 문자열로 변환.
		 * @category Formatting
		 * @param {String|Object} zipCode 5자리 또는 6자리 우편번호. 혹은 {part1:'', part2:''} 들어있는 Object
		 * @param {Boolean} [bracket=true] 좌우 괄호 포함시킬지 여부.
		 * @return {String} 우편번호. 예) "(06626)"
		 * 
		 */
		formatZipCode: function(zipCode, bracket) {
			if (bracket === undefined) {
				bracket = true;
			}
			if (!zipCode) {
				return '';
			}

			zipCode = ((typeof zipCode == 'object') ? (zipCode.part1 || '') + (zipCode.part2 || '') : zipCode.split('-').join(''));
			zipCode = $.trim(zipCode);

			if (!zipCode) {
				return '';
			}

			var result = zipCode;
			if (zipCode.length == 5) {
				result = zipCode;
			} else {
				result = zipCode.substr(0, 3) + '-' + zipCode.substr(3);
			}

			if (bracket) {
				result = '(' + result + ')';
			}
			return result;
		},

		/**
		 * 화면표시용 카드번호 변환.
		 * @category Formatting
		 * @param {String} cardNo 카드번호. - 들어간거나 안들어간거 상관 없음.
		 * @param {Boolean} [secured=true] 뒤 7/8 자리 * 처리할지 여부.
		 * @return {String} 카드번호. 예) "1234-3311-****-****"
		 * 
		 */
		formatCardNo: function(cardNo, secured) {
			if (secured === undefined) {
				secured = true;
			}
			if (!cardNo) {
				return '';
			}

			cardNo = cardNo.replace(/-/g, '');

			if (cardNo.length > 8 && secured === true) {
				var length = cardNo.length;
				cardNo = cardNo.substr(0, 8).padRight(length, '*');
			}
			if (cardNo.length <= 8) {
				return cardNo.replace(/-/g, '').replace(/([\d*]{4})([\d*]{1,4})/g, '$1-$2');
			} else if (cardNo.length <= 12) {
				return cardNo.replace(/-/g, '').replace(/([\d*]{4})([\d*]{4})([\d*]{1,4})/g, '$1-$2-$3');
			} else if (cardNo.length > 12) {
				return cardNo.replace(/-/g, '').replace(/([\d*]{4})([\d*]{4})([\d*]{4})([\d*]{1,4})/g, '$1-$2-$3-$4');
			}

			return cardNo;
		},

		/**
		 * [sfd.utils.formatZipCode()](#formatZipCode) 사용하세요. (deprecated)
		 * @category Formatting
		 */
		zipCodeLabel: function(zipCode, bracket) {
			return this.formatZipCode(zipCode, bracket);
		},

		/**
		 * 화면표시용 주소 문자열로 변환.
		 * @category Formatting
		 * @param {Object} data 주소 정보 들어 있는 데이터. (서버 데이터 또는 주소팝업 결과 데이터)
		 * @param {Object} options 옵션
		 * Key | Type | 기본값 | 설명
		 * ---|---|---|---
		 * keyPrefix | String | - | data에 key prefix. 예) "piboja", "contractor"
		 * isOldAddress | Boolean | AddressNwOdCls 값 참조<br>없으면 false | data에 addressNwOdCls가 없거나 강제로 설정하고 싶은 경우 구주소면 true, 신주소면 false로 지정.
		 * split | Boolean | false | true로 지정하면 [address1, address2]로 나눠서 반환
		 * appendReference | Boolean | true | 도로명주소 추가 주소정보(예:(서초동,삼성물산서초사옥)) 포함할지 여부.
		 * prependZipCode | Boolean | false | split 옵션이 false인 경우만 적용됨. 예) "(01332) 서울 서초구 서초대로74길 14, 19층 (서초동,삼성물산서초사옥)"
		 * secured| Boolean | false | true로 지정하면 상세주소 부분 * 처리.
		 * @return {String|Array} 변환된 문자열 또는 문자열 배열
		 * @example
		 * ```js
		 * sfd.utils.formatAddress(data); 
		 * // => "서울 서초구 서초대로74길 14, 19층 (서초동,삼성물산서초사옥)"
		 * 
		 * sfd.utils.formatAddress(data, { split: true });
		 * // => ["서울 서초구 서초대로74길", "14, 19층 (서초동,삼성물산서초사옥)"]
		 * 
		 * sfd.utils.formatAddress(data, { secured: true }); 
		 * // => "서울 서초구 서초대로74길 ****"
		 * ```
		 */
		formatAddress: function(data, options) {
			var key = function(name) {
				return options && options.keyPrefix ? options.keyPrefix + name : name.charAt(0).toLowerCase() + name.slice(1);
			}

			if (!data) {
				return (options && options.split) ? ['', ''] : '';
			}
			var addressTypeCode = data[key('AddressNwOdCls')] || data.preferType;
			var isNewAddress = addressTypeCode == '2' || addressTypeCode == '02' || addressTypeCode == 'new';

			options = $.extend({
				keyPrefix: null,
				isOldAddress: !isNewAddress,
				split: false,
				appendReference: true,
				secured: false
			}, options)

			
			var address1 = '';
			var address2 = '';

			if (typeof data['new'] == 'object' && typeof data.old == 'object') {
				// 주소팝업 결과 형식
				if (options.isOldAddress == false) {
					// 신주소(도로명)
					address1 = data['new'].address1;
					address2 = this.join([this.join([data['new'].bldgNo, data['new'].address2], ', '), data['new'].reference], ' ');

				} else {
					// 구주소(지번)
					address1 = data.old.address1;
					address2 = data.old.address2;
				}
			} else {
				// 다이렉트 주소 저장 형식
				if (options.isOldAddress == false) {
					// 신주소(도로명)
					var address1Key = key('Address1Road');
					var buildingNoKey = key('BldgNoRoad');
					var address2Key = key('Address2Road');	
					var reference = options.appendReference ? data[key('AddressAddAddrRfnRoad')] || data[key('AddressRfnRoad')] || '' : '';

					address1 = data[address1Key];
					address2 = this.join([this.join([data[buildingNoKey], data[address2Key]], ', '), reference], ' ');
				} else {
					// 구주소(지번)
					var address1Key = key('Address1');
					var address2Key = key('Address2');
	
					address1 = data[address1Key];
					address2 = data[address2Key];
				}	
			}

			if (options.secured && address2) {
				address2 = '****';
			}

			var result = options.split ? [address1, address2] : this.join([address1, address2], ' ');
			if (options.split == false && options.prependZipCode == true) {
				// 우편번호 
				var zipCode = '';
				if (typeof data['new'] == 'object' && typeof data.old == 'object') {
					// 주소팝업 결과 형식
					if (options.isOldAddress == false) {
						zipCode = this.formatZipCode(data['new'].zipCode, true);
					} else {
						zipCode = this.formatZipCode(data.old.zipCode, true);
					}
				} else {
					// 다이렉트 주소 저장 형식
					if (options.isOldAddress == false) {
						zipCode = this.formatZipCode({ part1: data[key('ZipCode1Road')], part2: data[key('ZipCode2Road')] }, true);
					} else {
						zipCode = this.formatZipCode({ part1: data[key('ZipCode1')], part2: data[key('ZipCode2')] }, true);
					}	
				}
				result = sfd.utils.join([zipCode, result], ' ');
			}

			return result;
		},

		/**
		 * [sfd.utils.formatAddress()](#formatAddress) 사용하세요. (deprecated)
		 * @category Formatting
		 */
		addressLabel: function(data, options) {
			return this.formatAddress(data, options);
		},

		/**
		 * 화면 표시용 이메일주소 문자열로 변환.
		 * @category Formatting
		 * @param  {String}    email 이메일주소. 전체 주소 또는 사용자이름 부분.
		 * @param  {String}    [domain] 도메인. email에 사용자 이름 부분만 지정한 경우 사용.
		 * @param  {String}    [options] 옵션
		 * Key | Type | 기본값 | 설명
		 * ---|---|---|---
		 * secured | Boolean | false | true로 설정하면 사용자이름 부분 뒷자리 일부를 * 처리해서 반환
		 * @return {String}          변환된 문자열
		 * @example
		 * 다양한 인자 처리 가능
		 * ```js
		 * sfd.utils.formatEmail('username', 'domain.com'); 
		 * // => "user@domain.com"
		 * sfd.utils.formatEmail('username@domain.com'); 
		 * // => "user@domain.com"
		 * 
		 * ```
		 * 보안 옵션 사용
		 * ```js
		 * sfd.utils.formatEmail('username', 'domain.com', { secured: true }); 
		 * // => "us**@domain.com"
		 * ```
		 */
		formatEmail: function(email, domain, options) {
			if (!email) {
				return '';
			}

			if (typeof domain == 'object') {
				options = domain;
				domain = null;
			}
			options = $.extend({
				secured: false
			}, options);

			if (!domain) {
				domain = email.split('@')[1];
				email = email.split('@')[0];
			}

			if (!email || !domain) {
				return '';
			}

			if (options.secured) {
				if (email.length > 4) {
					email = email.substr(0, email.length - 4) + '****';
				} else if (email.length > 2) {
					email = email.substr(0, email.length - 2) + '**';
				} else {
					email = email.charAt(0) + '*';
				}
			}

			return email + '@' + domain;
		},

		/**
		 * 화면 표시용 전화번호 문자열로 변환.
		 * @category Formatting
		 * @param {Object|String} tel1 전화번호 object 또는 문자열. 아래 예제 참고.
		 * @param {*} [tel2] 국번.
		 * @param {*} [tel3] 개별번호.
		 * @param {*} [options] 옵션
		 * Key | Type | 기본값 | 설명
		 * ---|---|---|---
		 * secured | Boolean | false | true로 설정하면 뒷자리를 * 처리해서 반환
		 * @return {String} 화면표시용 전화번호.
		 * @example
		 * 다양한 인자 처리 가능
		 * ```js
		 * sfd.utils.formatPhoneNumber('010', '1234', '5678');
		 * sfd.utils.formatPhoneNumber('01012345678');
		 * sfd.utils.formatPhoneNumber('010-1234-5678');
		 * sfd.utils.formatPhoneNumber({ phone1: '010', phone2: '1234', phone3: '5678' });
		 * sfd.utils.formatPhoneNumber({ phoneNo1: '010', phoneNo2: '1234', phoneNo3: '5678' });
		 * sfd.utils.formatPhoneNumber({ part1: '010', part2: '1234', part3: '5678' });
		 * => "010-1234-5678"
		 * ```
		 * 보안 옵션 사용
		 * ```js
		 * sfd.utils.formatPhoneNumber('01012345678', { secured: true });
		 * => "010-1234-****"
		 * ```
		 */
		formatPhoneNumber: function(tel1, tel2, tel3, options) {
			if (typeof tel1 == 'object' || (typeof tel1 == 'string' && (!tel2 || typeof tel2 == 'object'))) {
				// tel1에 전화번호 object로 넘어오거나, tel1에 문자열 하나로 넘긴 경우				
				options = tel2;

				var phoneNumber = this.parsePhoneNumber(tel1);
				tel1 = phoneNumber.part1;
				tel2 = phoneNumber.part2;
				tel3 = phoneNumber.part3;
			}
			options = $.extend({
				secured: false
			}, options);

			if (!tel1 || !tel2 || !tel3) {
				return '';
			}

			if (options.secured) {
				tel3 = '****';
			}
			return tel1 + '-' + tel2 + '-' + tel3;
		},

		/**
		 * [sfd.utils.formatCarNo(carNo);](#formatCarNo) 사용하세요. (deprecated)
		 * @category Formatting
		 */
		carNoForSecureDisplay: function(carNo) {
			return this.formatCarNo(carNo);
		},

		/**
		 * 화면표시용 자동차 번호 문자열로 변환.
		 * @category Formatting
		 * @param {String} carNo 변환할 자동차번호
		 * @param {Object} options 옵션
		 * Key | Type | 기본값 | 설명
		 * ---|---|---|---
		 * secured | Boolean | true | 자동차번호 일부를 * 처리할지 여부.
		 * shortVIN | Boolean | false | true로 지정하면 차대번호 끝자리 6개만 반환.
		 * padVIN | String | 'A' | 6자리 차대번호인 경우 17자리로 채워짐. 채우지 않으려면 빈문자열 또는 false로 지정.
		 * @return {String} 변환된 문자열.
		 * ```js
		 * sfd.utils.formatCarNo('03수1234'); => "**수1234"
		 * sfd.utils.formatCarNo('AAAAAA'); => "신규"
		 * sfd.utils.formatCarNo('123456ABCDEFGHIJK', { shortVIN: true }); => "FGHIJK"
		 * sfd.utils.formatCarNo('123456', { padVIN: 'A' }); => "AAAAAAAAAAA123456"
		 * ```
		 */
		formatCarNo: function(carNo, options) {
			options = $.extend({
				padVIN: '',
				shortVIN: false,
				secured: true
			}, options);

			var result = carNo || '';
			if (!carNo) {
				return result;
			}

			if (carNo.length == 17 || carNo.length == 6) {
				// 차대번호인 경우 그대로
				if (carNo.substr(-6) == 'AAAAAA') {
					result = '신규';
				} else if (carNo.length == 6 && options.padVIN) {
					result = Array(11 + 1).join(options.padVIN) + carNo;
				}

				if (result.length == 17 && options.shortVIN == true) {
					result = result.substr(-6);
				}
			} else {
				// 자동차번호 뒤부터 5자리 빼고 앞쪽은 * 처리
				if (options.secured === true) {
					var astLength = carNo.length - 5;
					result = Array(astLength + 1).join('*') + carNo.slice(-5);
				}
			}
			return result;
		},

		/**
		 * 두 날짜가 몇일 차이인지 계산 (date2 - date1)
		 * @category 날짜/시간
		 * @method daysBetween
		 * @param {Any} date1 시작 날짜 (Date 혹은 YYYYMMDD 형태의 문자열)
		 * @param {Any} date2 끝 날짜 (Date 혹은 YYYYMMDD 형태의 문자열)
		 * @return {Number} date2 - date1 일수. date2이 date1보다 이전 날짜면 음수값으로 반환.
		 * @example
		 * 	date1: 2018/1/5, date2: 2018/1/10 => 5 반환
		 * 	date1: 2018/1/10, date2: 2018/1/5 => -5 반환
		 */
		daysBetween: function(date1, date2) {
			if (typeof date1 == 'string') {
				date1 = self.stringToDate(date1);
			}
			if (typeof date2 == 'string') {
				date2 = self.stringToDate(date2);
			}
			var interval = date2.getTime() - date1.getTime();
			return parseInt((((interval / 1000) / 60) / 60) / 24, 10);
		},

		/**
		 * 특정 날짜의 요일
		 * @category 날짜/시간
		 * @method weekdayLabel
		 * @param {Any} date 날짜 (Date 혹은 YYYYMMDD 형태의 문자열)
		 * @param {Boolean} [short=false] true로 설정하면 '요일' 뺀 짧은 버전. (월, 화, 수, ...)
		 * @return {String} date의 요일: 월요일, 화요일, 수요일, ...
		 */
		weekdayLabel: function(date, short) {
			if (typeof date == 'string') {
				date = self.stringToDate(date);
			}
			return ['일', '월', '화', '수', '목', '금', '토'][date.getDay()] + (short != true ? '요일' : '');
		},

		/**
		 * 윤년여부 체크
		 * @category 날짜/시간
		 * @method isLeapYear
		 * @param  {Any} dateOrYear 기준날짜(Date 혹은 YYYYMMDD 형태의 문자열) 혹은 년도
		 * @return {Boolean}	윤년이면 true, 아니면 false.
		 */
		isLeapYear: function(dateOrYear) {
			var year;
			if (typeof dateOrYear == 'string') {
				if (dateOrYear.length == 4) {
					year = parseInt(dateOrYear, 10);
				} else {
					var date = self.stringToDate(dateOrYear);
					if (!date) {
						return false;
					}
					year = date.getFullYear();	
				}
			} else if (typeof dateOrYear == 'number') {
				// 년도만 넘긴 경우
				year = dateOrYear;
			} else {
				year = dateOrYear.getFullYear();
			}

			// 윤년 여부를 리턴
			return ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0);
		},

		/**
		 * 날짜가 말일인지 여부
		 * @category 날짜/시간
		 * @method isLastDateInMonth
		 * @param {Any} date 확인하려는 날짜 (Date 혹은 YYYYMMDD 형태의 문자열)
		 * @return {Boolean} 말일이면 true, 아니면 false.
		 */
		isLastDateInMonth: function(date) {
			if (typeof date == 'string') {
				date = self.stringToDate(date);
			}

			return date.getDate() == self.daysInMonth(date);
		},

		/**
		 * 날짜가 속한 월이 몇일로 구성되어 있는지
		 * @category 날짜/시간
		 * @method daysInMonth
		 * @param {Any} dateOrYear 확인하려는 날짜 (Date 혹은 YYYYMMDD 형태의 문자열) 혹은 년도
		 * @param {Integer} month dateOrYear가 년도인 경우 사용
		 * @return {Integer} 날짜가 속한 월의 일수.
		 */
		daysInMonth: function(dateOrYear, month) {
			var date = dateOrYear;
			if (arguments.length == 1 && typeof dateOrYear == 'string') {
				date = self.stringToDate(dateOrYear);
			} else if (arguments.length == 2 && typeof dateOrYear == 'number' && typeof month == 'number') {
				date = new Date(dateOrYear, month - 1, 1);
			}

			return [31, self.isLeapYear(date) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][date.getMonth()];
		},

		/**
		 * 날짜에서 몇일 뒤 날짜
		 * @category 날짜/시간
		 * @method dateAfterDays
		 * @param  {Any}	date	기준날짜 (Date 혹은 YYYYMMDD 형태의 문자열)
		 * @param  {Integer}	days	더할 일수
		 * @return {Date}	기준날짜에 days 일수 더해진 날짜.
		 */
		dateAfterDays: function(date, days) {
			if (typeof date == 'string') {
				date = self.stringToDate(date);
			}
			return new Date(date.getTime() + 60 * 60 * 24 * 1000 * days);
		},

		/**
		 * 날짜에서 몇일 앞 날짜
		 * @category 날짜/시간
		 * @param  {String|Object}	date	기준날짜 (Date 혹은 YYYYMMDD 형태의 문자열)
		 * @param  {Integer}	days	뺄 일수
		 * @return {Date}	기준날짜에 days 일수 빼진 날짜.
		 */
		dateBeforeDays: function (date, days) {
			if (typeof date == 'string') {
				date = self.stringToDate(date);
			}
			return new Date(date.getTime() - 60 * 60 * 24 * 1000 * days);
		},

		/**
		 * 기준 날짜의 내년 날짜 (윤년 고려해서 계산: 2.28 => 2.29 말일은 말일)
		 * @category 날짜/시간
		 * @method dateNextYear
		 * @param  {Any}	date	기준날짜 (Date 혹은 YYYYMMDD 형태의 문자열)
		 * @return {Date}	기준날짜 일년후 날짜.
		 */
		dateNextYear: function(date) {
			return self.dateAfterYears(date, 1);
		},

		/**
		 * 날짜에서 몇년 뒤 날짜 (윤년 고려해서 계산: 2.28 => 2.29 말일은 말일)
		 * @category 날짜/시간
		 * @method dateAfterYears
		 * @param  {Any}	date	기준날짜 (Date 혹은 YYYYMMDD 형태의 문자열)
		 * @param  {Number}	years 더할 년도
		 * @return {Date}	기준날짜에 years 년 더해진 날짜.
		 */
		dateAfterYears: function(date, years) {
			if (typeof date == 'string') {
				date = self.stringToDate(date);
			}
			var year = date.getFullYear();
			var month = date.getMonth() + 1;
			var day = date.getDate();

			var result = new Date(year + years, month - 1, day);

			// 2월인 경우 말일 처리
			if (month == 2) {
				var isResultLeapYear = self.isLeapYear(year + years);

				if (day == 29) {
					// 기준일이 2/29인 경우 n년 뒤에 윤년이면 2/29, 평년이면 2/28
					result = new Date(year + years, 1, isResultLeapYear ? 29 : 28);
				} else if (day == 28 && isResultLeapYear) {
					// 기준일이 2월 28일인데 n년 뒤가 윤년이다.
					// 기준일 속한 해가 윤년이건 평년이건 상관없이 n년뒤가 윤년이면 28,29 -> 29 by beyond
					result = new Date(year + years, 1, 29);
				}
			}
			return result;
		},

		/**
		 * 6개월전 날짜를 리턴 (말일은 말일 처리)
		 * @category 날짜/시간
		 * @method dateBeforeSixMonths
		 * @param {Any} date 기준날짜 (Date 혹은 YYYYMMDD 형태의 문자열)
		 * @return {Date} 기준날짜 6개월 전 날짜.
		 * @see
		 * 8월31일 -> 2월28일(윤년일경우 2월29일)
		 * 8월30일 -> 2월28일(윤년일경우 2월29일)
		 * 8월29일 -> 2월28일(윤년일경우 2월29일)
		 * 8월28일 -> 2월28일(윤년일경우 2월28일)
		 */
		dateBeforeSixMonths: function(date) {
			if (typeof date == 'string') {
				date = self.stringToDate(date);
			}

			var result = new Date(date.getFullYear(), date.getMonth() - 6, 1);
			var lastDayInResultMonth = self.daysInMonth(result);

			if (self.isLastDateInMonth(date)) {
				// 기준일이 말일이면,
				// 결과 날짜도 말일
				result.setDate(lastDayInResultMonth);
			} else {
				// 기준일이 평일이면,

				if (date.getDate() > lastDayInResultMonth) {
					// 기준일 월에 날짜가 결과일 월에는 없으면 말일로
					// 8월30일 -> 2월30일 없으니 2월 말일로
					result.setDate(lastDayInResultMonth);
				} else {
					// 특별한 조건 안걸리면 월만 6 뺀 날짜로
					result.setDate(date.getDate());
				}
			}
			return result;
		},

		/**
		 * 몇개월 후 날짜를 리턴 (말일은 말일 처리)
		 * @category 날짜/시간
		 * @method dateAfterMonths
		 * @param {Any} date 기준날짜 (Date 혹은 YYYYMMDD 형태의 문자열)
		 * @return {Date} 기준날짜 6개월 전 날짜.
		 * @see
		 * 8월31일 -> 2월28일(윤년일경우 2월29일)
		 * 8월30일 -> 2월28일(윤년일경우 2월29일)
		 * 8월29일 -> 2월28일(윤년일경우 2월29일)
		 * 8월28일 -> 2월28일(윤년일경우 2월28일)
		 */
		dateAfterMonths: function(date, num) {

			if (typeof date == 'string') {
				date = self.stringToDate(date);
			}

			var result = new Date(date.getFullYear(), date.getMonth() + num, 1);
			var lastDayInResultMonth = self.daysInMonth(result);

			if (self.isLastDateInMonth(date)) {
				// 기준일이 말일이면,
				// 결과 날짜도 말일
				result.setDate(lastDayInResultMonth);
			} else {
				// 기준일이 평일이면,

				if (date.getDate() > lastDayInResultMonth) {
					// 기준일 월에 날짜가 결과일 월에는 없으면 말일로
					// 8월30일 -> 2월30일 없으니 2월 말일로
					result.setDate(lastDayInResultMonth);
				} else {
					// 특별한 조건 안걸리면 넘어온 날짜로
					result.setDate(date.getDate());
				}
			}
			return result;
		},

		/**
		 * 일반나이 계산
		 * @category 나이
		 * @method age
		 * @param  {Any}	dateOfBirth	주민등록번호 또는 출생일 날짜 (Date 혹은 YYYYMMDD 형태의 문자열)
		 * @param  {Any} baseDate 계산 기준일 (Date 혹은 YYYYMMDD 형태의 문자열), 지정안하면 오늘 기준.
		 * @return {Integer}	일반나이. 계산 오류 발생한 경우 null.
		 */
		 age: function(dateOfBirth, baseDate) {
			if (!baseDate) {
				// 계산 기준일 지정 안하면 오늘로
				baseDate = new Date();
			}
			if (typeof baseDate == 'string') {
				// 계산 기준일 문자열이면 Date로 변환
				baseDate = self.stringToDate(baseDate);
			}
			if (typeof dateOfBirth == 'string') {
				if (dateOfBirth.length == 13) {
					// 주민등록번호면 출생일로 변환
					dateOfBirth = self.dateOfBirth(dateOfBirth);
				} else {
					//  출생일 문자열이면 Date로 변환
					dateOfBirth = self.stringToDate(dateOfBirth);
				}
			}

			if (!dateOfBirth) {
				return null;
			}

			// 우선 계산기준일 년도 - 생일 년도
			var result = baseDate.getFullYear() - dateOfBirth.getFullYear();

			// 생일이 지났으면 +1
			var monthDelta = baseDate.getMonth() - dateOfBirth.getMonth();
			var dayDelta = baseDate.getDate() - dateOfBirth.getDate();

			if (monthDelta > 0 || (monthDelta == 0 && dayDelta >= 0)) {
				result += 1;
			}
			return result;
		},

		/**
		 * 만나이 계산
		 * @category 나이
		 * @method manAge
		 * @param  {Any}	dateOfBirth	주민등록번호 또는 출생일 날짜 (Date 혹은 YYYYMMDD 형태의 문자열)
		 * @param  {Any} baseDate 계산 기준일 (Date 혹은 YYYYMMDD 형태의 문자열), 지정안하면 오늘 기준.
		 * @return {Integer}	만나이. 계산 오류 발생한 경우 null.
		 */
		manAge: function(dateOfBirth, baseDate) {
			if (!baseDate) {
				// 계산 기준일 지정 안하면 오늘로
				baseDate = new Date();
			}
			if (typeof baseDate == 'string') {
				// 계산 기준일 문자열이면 Date로 변환
				baseDate = self.stringToDate(baseDate);
			}
			if (typeof dateOfBirth == 'string') {
				if (dateOfBirth.length == 13) {
					// 주민등록번호면 출생일로 변환
					dateOfBirth = self.dateOfBirth(dateOfBirth);
				} else {
					//  출생일 문자열이면 Date로 변환
					dateOfBirth = self.stringToDate(dateOfBirth);
				}
			}

			if (!dateOfBirth) {
				return null;
			}

			// 우선 계산기준일 년도 - 생일 년도
			var result = baseDate.getFullYear() - dateOfBirth.getFullYear();

			// 생일이 안지났으면 -1
			var monthDelta = baseDate.getMonth() - dateOfBirth.getMonth();
			var dayDelta = baseDate.getDate() - dateOfBirth.getDate();

			if (monthDelta < 0 || (monthDelta == 0 && dayDelta < 0)) {
				result -= 1;
			}
			return result;

		},

		/**
		 * 보험나이 계산
		 * @category 나이
		 * @method insuredAge
		 * @param  {Any}	dateOfBirth	주민등록번호 또는 출생일 날짜 (Date 혹은 YYYYMMDD 형태의 문자열)
		 * @param  {Any} baseDate 계산 기준일 (Date 혹은 YYYYMMDD 형태의 문자열), 지정안하면 오늘 기준.
		 * @return {Integer}	보험나이. 계산 오류 발생한 경우 null.
		 */
		insuredAge: function(dateOfBirth, baseDate) {
			if (!baseDate) {
				// 계산 기준일 지정 안하면 오늘로
				baseDate = new Date();
			}
			if (typeof baseDate == 'string') {
				// 계산 기준일 문자열이면 Date로 변환
				baseDate = self.stringToDate(baseDate);
			}
			if (typeof dateOfBirth == 'string') {
				if (dateOfBirth.length == 13) {
					// 주민등록번호면 출생일로 변환
					dateOfBirth = self.dateOfBirth(dateOfBirth);
				} else {
					//  출생일 문자열이면 Date로 변환
					dateOfBirth = self.stringToDate(dateOfBirth);
				}
			}

			if (!dateOfBirth) {
				return null;
			}

			// 우선 계산기준일 년도 - 생일 년도
			var result = baseDate.getFullYear() - dateOfBirth.getFullYear();

			// 생일 6개월 이전이면 -1, 6개월 이후면 +1
			var monthDelta = baseDate.getMonth() - dateOfBirth.getMonth();
			var dayDelta = baseDate.getDate() - dateOfBirth.getDate();

			if (monthDelta > 6 || (monthDelta == 6 && dayDelta >= 0)) {
				// 기준일이 생일보다 6개월 이후면 +1
				result += 1;
			} else if (monthDelta < -6 || (monthDelta == -6 && dayDelta < 0)) {
				// 기준일이 생일보다 6개월 이전이면 -1
				result -= 1;
			}

			return result;
		},

		/**
		 * 임신주수 계산
		 * @category 나이
		 * @method weekAge
		 * @param  {Any}	dateOfBirth	출생일 날짜 (Date 혹은 YYYYMMDD 형태의 문자열)
		 * @param  {Any} 	baseDate 계산 기준일 (Date 혹은 YYYYMMDD 형태의 문자열), 지정안하면 오늘 기준.
		 * @return {Integer}	임신주수. 계산 오류 발생한 경우 null.
		 */
		weekAge: function(dateOfBirth, baseDate) {
			if (!baseDate) {
				// 계산 기준일 지정 안하면 오늘로
				baseDate = new Date();
			}
			if (typeof baseDate == 'string') {
				// 계산 기준일 문자열이면 Date로 변환
				baseDate = self.stringToDate(baseDate);
			}
			if (typeof dateOfBirth == 'string') {
				//  출생일 문자열이면 Date로 변환
				dateOfBirth = self.stringToDate(dateOfBirth);
			}

			if (!dateOfBirth) {
				return null;
			}

			// 출산예정일까지 남은 일수
			var remainder_num = sfd.utils.daysBetween(baseDate, dateOfBirth);
			var return_num = Math.floor((280 - remainder_num) / 7);
			return_num = Math.max(return_num, 4);

			return return_num;
		},

		/**
		 * 주민등록번호에서 성별 코드 얻기 (숫자)
		 * @category 변환
		 * @method genderCode
		 * @param  {String}	ssn	주민등록번호
		 * @param {String} [type="num"] num 또는 en
		 * @return {Integer}	type이 "num"인 경우 남자: 2, 여자 1, type이 "en" 인 경우 남자: 'm', 여자: 'f'
		 */
		genderCode: function(ssn, type) {
			var result = (parseInt(ssn.slice(6, 7), 10) % 2) + 1;
			if (type == 'en') {
				result = result == 2 ? 'm' : 'f';
			}
			return result;
		},

		/**
		 * 주민등록번호에서 성별 얻기
		 * @category 변환
		 * @method genderLabel
		 * @param  {String} ssn 주민등록번호
		 * @param  {String} [lang='ko'] 'ko': 한글, 'en': 영문
		 * @return {String} lang이 'ko' 면 '남자' 또는 '여자', 'en'이면 'Male' 또는 'Female'.
		 */
		genderLabel: function(ssn, lang) {
			var gender = self.genderCode(ssn);
			if (lang == 'en') {
				return gender == 2 ? 'Male' : 'Female';
			} else {
				return gender == 2 ? '남자' : '여자';
			}
		},

		/**
		 * 자동차번호 종류 코드 (차대번호, 자동차번호)
		 * @category 자동차
		 * @method carNoCls
		 * @param {String} carNo 자동차번호
		 * @return {String} 자동차번호인 경우 '0', 차대번호인 경우 '1'
		 */
		carNoCls: function(carNo) {
			// TODO: 이 함수는 자동차 module로 옮겨야 할듯
			return (carNo.length == 6 || carNo.length == 17) ? '1' : '0'; // 0: 차량번호, 1: 차대번호
		},

		/**
		 * base64/URLEncoded data 바이너리 데이터 변환
		 * @category 데이터
		 * @method dataURIToBlob
		 * @param {String} dataURI base64/URLEncoded 형태의 Data 문자열
		 * @see 
		 * IE 하위 버전 지원 안되는거 같은데 사용시 확인 필요한듯
		 */
		dataURIToBlob: function(dataURI) {
			var byteString;
			if (dataURI.split(',')[0].indexOf('base64') >= 0) {
				byteString = atob(dataURI.split(',')[1]);
			} else {
				byteString = unescape(dataURI.split(',')[1]);
			}

			// smime component 분리
			var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
			var ia = new Uint8Array(byteString.length);
			for (var i = 0; i < byteString.length; i++) {
				ia[i] = byteString.charCodeAt(i);
			}
			return new Blob([ia], {type: mimeString});
		},

		/**
		 * Object를 data 에 setValue 로 추가
		 * @category 데이터
		 * @param {Object} object 추가하려는 object
		 * @param {Object} [targetData=sfd.data] 대상 data (지정 안하면 sfd.data)
		 */
		saveObjectToData: function(object, targetData) {
			if (!targetData && sfd) {
				targetData = sfd.data;
			}
			for (var i in object) {
				// 이름에 __ 가 붙은 경우는 저장 안함(내부 참조용)
				if (i.substr(0, 2) != '__') {
					targetData.setValue(uniformVal(i), object[i]);
				}
			}

			function uniformVal(val) {
				if (val == 'designJumin' || val == 'designJuminNo') {
					return 'designSSN';

				} else if (val == 'pibojaJumin' || val == 'pibojaJuminNo') {
					return 'pibojaSSN';

				} else if (val == 'contractorJumin' || val == 'contractorJuminNo' || val == 'contractJuminNo') {
					return 'contractorSSN';

				} else if (val == 'pibojaId') {
					return 'pibojaID';

				} else if (val == 'contractorId' || val == 'contractId') {
					return 'contractorID';

				} else if (val == 'designId') {
					return 'designID';

				}
				return val;
			}
		},

		/**
		 * iframe 통해서 POST 요청
		 * @category 통신
		 * @param {String} targetName Target iframe name.
		 * @param {Object} targetData 전송할 data.
		 * @param {String} url POST 요청할 URL
		 */
		postIframe: function(targetName, targetData, url) {
			if ($('#iframeForm').length > 0) {
				$('#iframeForm').remove();
			}

			var sendData = targetData;

			var actionURL = url;
			// <STRIP_WHEN_RELEASE
			if (sfd.env.server == 'local') {
				actionURL = 'http://localhost:3333/api/appcard';
			}
			// STRIP_WHEN_RELEASE>
			
			var $form = $('<form style="display:none" id="iframeForm" />').attr({
				method: 'post',
				action: actionURL,
				target: targetName
			});

			for (var key in sendData) {
				var keyData = sendData[key];
				// 해당 객체가 object 일때는 string 으로 변환해서 젆송한다. ssg  가 이런 케이스 이다. 
				if (typeof sendData[key] == 'object') {
					keyData = JSON.stringify(keyData);
				}
				var $f = $('<textarea name="' + key + '">' + keyData + '</textarea>');
				$form.append($f);
			}

			$('body').append($form);
			$form.submit();	
		},
		
		/**
		 * heystack에 needle 중 하나라도 포함하고 있는지 확인
		 * @category 확인
		 * @param {String|Array} heystack needle 포함 여부를 확인할 문자열 또는 배열
		 * @param {String|Array} needle 찾을 문자열
		 * @return {Boolean} heystack에서 needle 발견하면 true 아니면 false.
		 * @example
		 * ```js
		 * sfd.utils.containsAny('abcdef', ['1', 'b']); 
		 * // return true
		 * ```
		 */
		containsAny: function(heystack, needle) {
			var list = Array.isArray(needle) ? needle : [needle];
			var result = false;
			for (var i = 0; i < list.length; i++) {
				if (heystack.indexOf(list[i]) >= 0) {
					result = true;
					break;
				}
			}
			return result;
		},

		/**
		 * heystack에 needle 모두를 포함하고 있는지 확인
		 * @category 확인
		 * @param {String|Array} heystack needle 포함 여부를 확인할 문자열 또는 배열
		 * @param {String|Array} needle 찾을 문자열
		 * @return {Boolean} heystack에서 needle 모두를 발견하면 true 아니면 false.
		 * @example
		 * ```js
		 * sfd.utils.containsAll('abcdef', ['1', 'b']); 
		 * // return false
		 * sfd.utils.containsAll('abcdef', ['a', 'b']); 
		 * // return true
		 * ```
		 */
		containsAll: function(heystack, needle) {
			var list = Array.isArray(needle) ? needle : [needle];
			var result = true;
			for (var i = 0; i < list.length; i++) {
				if (heystack.indexOf(list[i]) == -1) {
					result = false;
					break;
				}
			}
			return result;
		},

		/**
		 * 배열의 모든 항목이 모두 동일한 특정값으로 되어 있는지 확인
		 * @category 확인
		 * @param {Array} array 확인할 배열.
		 * @param {String|Number|Boolean} value 확인할 값. 
		 * @example
		 * ```js
		 * // 모든 값이 true인지 확인
		 * sfd.utils.isAll([true, true, true], true); => true
		 * sfd.utils.isAll([true, false, true], true); => false
		 * 
		 * // 모든 값이 'N'인지 확인
		 * sfd.utils.isAll(['N', 'N', 'N'], 'N'); => true
		 * sfd.utils.isAll(['Y', 'N', 'N'], 'N'); => false
		 * ```
		 */
		isAll: function(array, value) {
			var index = array.findIndex(function(item) {
				return item !== value;
			});
			return index == -1;
		},

		/**
		 * 두 Object가 같은지 확인
		 * @category 확인
		 * @param {*} a 비교할 object
		 * @param {*} b 비교할 object
		 * @return {Boolean} 같으면 true, 다르면 false
		 * @see
		 * Object의 키 순서는 상관없이 비교되지만,
		 * 비교하려는 a, b 자체가 배열이거나 하위에 값 중 배열이 있는 경우 배열 내 순서가 일치해야 같은 것으로 판단함.
		 * 
		 * 일반적인 Ojbect들 비교에는 문제 없겠지만, JS object 비교는 아주 난해하기때문에 아주 특수한 케이스에는 예상과 다른 결과가 나올 수도 있음.
		 * underscorejs 에 isEqual 함수 가져온 것임.
		 */
		isEqual: function(a, b) {
			var eq, deepEq;
			eq = function(a, b, aStack, bStack) {
				// Identical objects are equal. `0 === -0`, but they aren't identical.
				// See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
				if (a === b) {
					return a !== 0 || 1 / a === 1 / b;
				}
				// `null` or `undefined` only equal to itself (strict comparison).
				if (a == null || b == null) {
					return false;
				}
				// `NaN`s are equivalent, but non-reflexive.
				if (a !== a) {
					return b !== b;
				}
				// Exhaust primitive checks
				var type = typeof a;
				if (type !== 'function' && type !== 'object' && typeof b != 'object') {
					return false;
				}
				return deepEq(a, b, aStack, bStack);
			};
		  
			// Internal recursive comparison function for `isEqual`.
			deepEq = function(a, b, aStack, bStack) {
				// Compare `[[Class]]` names.
				var className = Object.prototype.toString.call(a);
				if (className !== Object.prototype.toString.call(b)) {
					return false;
				}
				switch (className) {
					// Strings, numbers, regular expressions, dates, and booleans are compared by value.
					case '[object RegExp]':
						// RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
					case '[object String]':
						// Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
						// equivalent to `new String("5")`.
						return '' + a === '' + b;
					case '[object Number]':
						// `NaN`s are equivalent, but non-reflexive.
						// Object(NaN) is equivalent to NaN.
						if (+a !== +a) {
							return +b !== +b;
						}
						// An `egal` comparison is performed for other numeric values.
						return +a === 0 ? 1 / +a === 1 / b : +a === +b;
					case '[object Date]':
					case '[object Boolean]':
						// Coerce dates and booleans to numeric primitive values. Dates are compared by their
						// millisecond representations. Note that invalid dates with millisecond representations
						// of `NaN` are not equivalent.
						return +a === +b;
						// case '[object Symbol]':
						//   return SymbolProto.valueOf.call(a) === SymbolProto.valueOf.call(b);
				}
			
				var areArrays = className === '[object Array]';
				if (!areArrays) {
					if (typeof a != 'object' || typeof b != 'object') {
						return false;
					}
			
					// Objects with different constructors are not equivalent, but `Object`s or `Array`s
					// from different frames are.
					var aCtor = a.constructor, bCtor = b.constructor;
					if (aCtor !== bCtor && !(isFunction(aCtor) && aCtor instanceof aCtor &&
											isFunction(bCtor) && bCtor instanceof bCtor)
										&& ('constructor' in a && 'constructor' in b)) {
						return false;
					}
				}
				// Assume equality for cyclic structures. The algorithm for detecting cyclic
				// structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
			
				// Initializing stack of traversed objects.
				// It's done here since we only need them for objects and arrays comparison.
				aStack = aStack || [];
				bStack = bStack || [];
				var length = aStack.length;
				while (length--) {
					// Linear search. Performance is inversely proportional to the number of
					// unique nested structures.
					if (aStack[length] === a) {
						return bStack[length] === b;
					}
				}
		  
				// Add the first object to the stack of traversed objects.
				aStack.push(a);
				bStack.push(b);
			
				// Recursively compare objects and arrays.
				if (areArrays) {
					// Compare array lengths to determine if a deep comparison is necessary.
					length = a.length;
					if (length !== b.length) {
						return false;
					}
					// Deep compare the contents, ignoring non-numeric properties.
					while (length--) {
						if (!eq(a[length], b[length], aStack, bStack)) {
							return false;
						}
					}
				} else {
					// Deep compare objects.
					var keys = self.keys(a), key;
					length = keys.length;
					// Ensure that both objects contain the same number of properties before comparing deep equality.
					if (self.keys(b).length !== length) {
						return false;
					}
					while (length--) {
						// Deep compare each member
						key = keys[length];
						if (!(has(b, key) && eq(a[key], b[key], aStack, bStack))) {
							return false;						
						}
					}
				}
				// Remove the first object from the stack of traversed objects.
				aStack.pop();
				bStack.pop();
				return true;
			};

			return eq(a, b);
		},

		/**
		 * Object에 key 이름들을 반환
		 * @category Array/Object
		 * @param {Object} Object
		 * @return {Array} Key 이름 배열.
		 * @see
		 * IE8 이하 버전에서는 key 이름이 valueOf, isPrototypeOf, toString, propertyIsEnumerable, hasOwnProperty, toLocaleString 중 하나인 경우 반환되는 배열에 포함되지 않음.
		 */
		keys: function(obj) {
			var isObject = function() {
				var type = typeof obj;
				return type === 'function' || type === 'object' && !!obj;
			};

			if (!isObject(obj)) {
				return [];
			}
			if (Object.keys) {
				return Object.keys(obj);
			}
			var keys = [];
			for (var key in obj) {
				if (has(obj, key)) {
					keys.push(key);
				}
			}
			// Ahem, IE < 9.
			// IE < 9 인 경우 아래 이름 가진 key 들은 반환되지 않음.
			// var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString', 'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

			// var collectNonEnumProps = function(obj, keys) {
			// 	var nonEnumIdx = nonEnumerableProps.length;
			// 	var constructor = obj.constructor;
			// 	var proto = _.isFunction(constructor) && constructor.prototype || ObjProto;

			// 	// Constructor is a special case.
			// 	var prop = 'constructor';
			// 	if (has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

			// 	while (nonEnumIdx--) {
			// 	prop = nonEnumerableProps[nonEnumIdx];
			// 	if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
			// 		keys.push(prop);
			// 	}
			// 	}
			// };

			// var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
			// if (hasEnumBug) {
			// 	collectNonEnumProps(obj, keys);
			// }
			return keys;
		},

		/**
		 * Text 템플릿에 값 채우기
		 * @category 문자열
		 * @param {Object} options 옵션
		 * Key|Type|설명
		 * ---|---|---
		 * template | String | 템플릿 텍스트
		 * data | Object | 템플릿에 채울 data
		 * @return {String} 치환자가 모두 치환된 문자열
		 * @example
		 * ```js
		 * var startDate = sfd.data.getValue('startDate');
		 * var endDate = sfd.data.getValue('endDate');
		 * 
		 * var travelPeriod = sfd.utils.textTemplate({
		 *   template: '{{startDate}} ({{startWeekday}}) {{startHour}}시 ~ {{endDate}} ({{endWeekday}}) {{endHour}}',
		 *   data: {
		 *     startDate: sfd.utils.formatDate(startDate, '.'),
		 *     startWeekday: sfd.utils.weekdayLabel(startDate, true),
		 *     startHour: sfd.data.getValue('startHour'),
		 *     endDate: sfd.utils.formatDate(endDate, '.'),
		 *     endWeekday: sfd.utils.weekdayLabel(endDate, true),
		 *     endHour: sfd.data.getValue('endHour')
		 *   }
		 * });
		 * // travelPeriod: "2018.08.15 (수) 9시 ~ 2018.08.16 (목) 20시"
		 * ```
		 */
		textTemplate: function(options) {
			var result = options.template;
			var data = options.data;

			// template에 있는 key 들 얻고 (치환해야 할 것들)
			var keys = [];
			var match;
			var regex = /\{\{([a-zA-Z0-9_-]+)\}\}/gm;
			while ((match = regex.exec(options.template)) !== null) {
				keys.push(match[1]);
			}
	
			// template 치환
			for (var i = 0; i < keys.length; i++) {
				var key = keys[i];
				var value = data[key];

				regex = new RegExp('\{\{' + key + '\}\}', 'g');
				result = result.replace(regex, value);
			}
			return result;
		},

		/**
		 * 여러 텍스트를 합치기
		 * @category 변환
		 * @param {Array} list 합칠 String 배열.
		 * @param {String} [separator=","] 합칠때 사용할 구분자. 기본값은 ", "
		 * @return {String} separator로 합쳐진 텍스트. list 에서 항목이 null, undefined, '' 인건 무시됨.
		 */
		join: function(list, separator) {
			if (separator === undefined) {
				separator = ', ';
			}
			if (!list || list.length == 0) {
				return '';
			}

			list = list.filter(function(item) {
				return item !== undefined && item !== null && item !== '';
			});

			return list.join(separator);
		},

		/**
		 * 여러 경로 조각을 합치기
		 * @category 변환
		 * @param {String|Array} components 경로 조각 문자열 또는 배열
		 * @param {Boolean} [appendCacheBust=false] 캐시 방지하도록 경로 마지막에 파라미터 추가할지 여부. ex) bust=123456
		 * @return {String} 합쳐진 경로
		 * @example
		 * ```js
		 * sfd.utils.joinPath('/ria', 'common/resource/Module.js', true);
		 * // return "/ria/common/resource/Module.js?bust=124123"
		 * 
		 * var pathComponents = ['ria', 'pc', 'product/car'];
		 * sfd.utils.joinPath(pathComponents);
		 * // return "/ria/pc/product/car"
		 * ```
		 */
		joinPath: function(components, appendCacheBust) {
			var result;
			if (Array.isArray(arguments[0])) {
				components = arguments[0];
			} else {
				components = Array.prototype.slice.call(arguments);
				if (components[components.length - 1] === true) {
					components.pop();
					appendCacheBust = true;
				}
			}

			result = components[0];
			for (var i = 1; i < components.length; i++) {
				var c = components[i];
				if (c.startsWith('/')) {
					c = c.slice(1);
				}
				if (result.endsWith('/')) {
					result = result.slice(0, -1);
				}
				result = result + '/' + c;
			}
			if (appendCacheBust === true) {
				result += (result.includes('?') ? '&' : '?') + 'bust=' + (new Date()).getTime();
			}
			return result;
		},

		/**
		 * 전화번호를 각 부분별로 나눔.
		 * @category 변환
		 * @param {String|Object} number 전화번호
		 * @param {String} [number2] number에 지역번호/통신사번호만 지정한 경우 나머지 전화번호.
		 * @return {Object} 부분별로 분리된 전화번호 object.
		 * Key | Type | 설명
		 * ---|---|---
		 * type | String | "1": 휴대폰번호, "2": 일반전화
		 * part1 | String | 휴대폰 앞번호 또는 국번. 예) "010", "02"
		 * part2 | String | 전화번호 앞자리. 예) "1234"
		 * part3 | String | 전화번호 뒷자리. 예) "5566"
		 * @example
		 * ```js
		 * sfd.utils.parsePhoneNumber('01012345678');
		 * sfd.utils.parsePhoneNumber('010', '12345678');
		 * => { type: "1", part1: "010", part2: "1234", part3: "5678" }
		 * ```
		 * number를 object로 지정 가능
		 * ```js
		 * sfd.utils.parsePhoneNumber({ phone1: "010", phone2: "1234", phone3: "5678" });
		 * sfd.utils.parsePhoneNumber({ phoneNo1: "010", phoneNo2: "1234", phoneNo3: "5678" });
		 * => { type: "1", part1: "010", part2: "1234", part3: "5678" }
		 * ```
		 */
		parsePhoneNumber: function(number, number2) {
			var result = {
				type: '',
				part1: '',
				part2: '',
				part3: ''
			}

			if (typeof number == 'string' && typeof number2 == 'string') {
				number = number + number2;
			}

			if (!number || (typeof number == 'string' && number.length < 7)) {
				// number가 비정상
				return result;
			}

			if (typeof number == 'object') {
				// number가 object인 경우
				var part1 = number.phoneNo1 || number.phone1 || number.part1 || '';
				var part2 = number.phoneNo2 || number.phone2 || number.part2 || '';
				var part3 = number.phoneNo3 || number.phone3 || number.part3 || '';
				
				if (part1.length == 1 || part1.length > 4) {
					// 앞자리 이상
					return result;
				}
				if ((part2.length != 3 && part2.length != 4) || part3.length != 4) {
					// 전화번호 부분 이상
					return result;
				}
				result.part1 = part1;
				result.part2 = part2;
				result.part3 = part3;

			} else {
				// number가 string인 경우
				number = number.replace(/\-/g, '');
				var body = number;

				if (number.length > 8) {
					// 앞자리 분리
					// 휴대폰 앞번호 확인
					var match = number.match(/^(010|011|016|017|018|019)/);
					result.part1 = (match && match[1]) || '';

					if (!result.part1) {
						// 일반 전화번호 국번 확인
						match = number.match(/^(0130|02|051|053|032|062|042|052|031|033|041|043|044|054|055|063|061|064|0502|0504|0505|0506|070|0303)/);						
						result.part1 = (match && match[1]) || '';
					}
					if (!result.part1) {
						return result; // 앞자리 분리 실패
					}
					body = number.substr(result.part1.length);
				}

				// 전화번호 앞/뒤 분리
				result.part2 = body.substr(0, body.length == 7 ? 3 : 4); // 세자리 또는 네자리
				result.part3 = body.slice(-4); // 뒤 네자리
			}

			// 전화번호 종류
			if (/^(010|011|016|017|018|019)$/.test(result.part1)) {
				result.type = '1'; // 휴대폰
			} else {
				result.type = '2'; // 일반전화
			}
			return result;
		},

		/**
		 * [sfd.utils.parsePhoneNumber()](#parsePhoneNumber) 사용하세요. (deprecated)
		 * @category 변환
		 * @method makeObjectPhoneString
		 * @param  {String} no 전화번호. 예) "01026680000"
		 * @return {Object}
		 * Key | Type | 설명
		 * ---|---|---
		 * type | String | "1": 휴대폰, "2": 일반전화
		 * phone1 | String | 지역번호/통신사번호
		 * phone2 | String | 전화번호 앞자리
		 * phone3 | String | 전화번호 뒷자리
		 * phoneBody | String | 지역번호/통신사번호 뺀 번호
		 */
		makeObjectPhoneString: function(no) {
			var result = {
				type: '',
				phone1: '',
				phone2: '',
				phone3: '',
				phoneBody: ''
			}
			if (!no) {
				return result;
			}

			var phoneNumber = this.parsePhoneNumber(no);
			result.type = phoneNumber.type;
			result.phone1 = phoneNumber.part1;
			result.phone2 = phoneNumber.part2;
			result.phone3 = phoneNumber.part3;
			result.phoneBody = phoneNumber.part2 + phoneNumber.part3;

			return result;
		},

		
		/**
		 * 특정기간동안 운행거리로 년간 운행거리를 추산(년평균 운행거리 계산)
		 * @category 자동차
		 * @param {String|Date} startDate 기준시작일
		 * @param {String|Date} endDate 기준끝일
		 * @return {String|Number} 운행거리
		 */
		averageMileagePerYear: function(startDate, endDate, mileage) {	
			// TODO: 이 함수는 자동차 module로 옮겨야 할듯
			if (typeof startDate == 'string') {
				startDate = self.stringToDate(startDate);
			}

			if (typeof endDate == 'string') {
				endDate = self.stringToDate(endDate);
			}

			//실제 운행일
			var pastDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
			//1일당 운행거리;
			var unitRange = Number(mileage) / pastDays;
			//1년간 평균 운행거리 추정
			var averageRange = parseInt(unitRange * 365);
			
			return averageRange;
		},

		/**
		 * 텍스트 클립보드로 복사하기
		 * @category 시스템
		 * @method copyToClipboard
		 * @param  {String}        text 복사할 텍스트 
		 * @return {void}            
		 */
		copyToClipboard: function(text) {
			if (isIE()) {
				window.clipboardData.setData('Text', text);
				if (sfd) {
					sfd.core.alert('복사되었습니다.');
				}
				return;
			}
			prompt('Ctrl+C를 눌러 복사하세요.', text);

			function isIE() {
				var userAgent = navigator.userAgent.toLowerCase();
				if (userAgent.includes('chrome') == true) { 
					return false;
				}
				if (userAgent.includes('msie') == true) {
					return true;
				}
				if (userAgent.includes('windows nt') == true) {
					return true;
				}
				return false;
			}
		},

		/**
		 * sfd.core.initSecureForm() 사용하세요. (deprecated)
		 * @category 미분류(이전예정)
		 * @method setNosForm
		 * @param {String} id NOS 적용할 form ID.
		 * @param  {Boolean} isKeypad	키패드 적용여부
		 * @param  {Boolean} isDeviceInfo	단말정보 수집여부
		 */
		setNosForm: function(id, isKeypad, isDeviceInfo) {
			if (sfd.env.deviceType == 'MO') {
				if (typeof npPfsStartupV2 !== 'undefined') {
					window.npPfsStartupV2(document.getElementById(id), [false, false, false, isKeypad, false, isDeviceInfo], 'npkencrypt', 'on'); // 요건 키패드
				}
			}
		},

		/**
		 * sfd.core.getSecureFieldData() 사용하세요. (deprecated)
		 * @category 미분류(이전예정)
		 * @method getNppfsFields
		 * @param  {String} formID NOS 적용된 form 의 ID
		 * @return {Object} NOS form hidden 값들.
		 * @example
		 * ```js
		 * sfd.utils.getNppfsFields('ssn-form');
		 * ```
		 */
		getNppfsFields: function(formID) {
			var nppfsData = {};

			// if(sfd.env.server == 'local'){
			// 	$('#'+formId+' input[type="hidden"]').each(function(i){
			// 		nppfsData[$(this).attr('name')] = $(this).attr('value');
			// 	});
			// }else{
			// 	$('#'+formId+' div.nppfs-elements input[type="hidden"]').each(function(i){
			// 		nppfsData[$(this).attr('name')] = $(this).attr('value');
			// 	});
			// }		

			$('#' + formID + ' input[type="hidden"]').each(function(i) {
				nppfsData[$(this).prop('name')] = $(this).prop('value');
			});		

			/*$.each( ['__E2E_RESULT__', 
					'__E2E_UNIQUE__', 
					'designJuminNo2__E2E__', 
					'__E2E_KEYPAD__', 
					'__KH_475cd1a57695', 
					'__KI_designJuminNo2', 
					'__KU_475cd1a57695'], function(i, item){
				nppfsData[item] = $('input[name='+item+']').attr('value');
			})*/

			return nppfsData;
		},

		/**
		 * sfd.core.setDeviceInfo() 사용하세요. (deprecated)
		 * @category 미분류(이전예정)
		 * @method addNppfsField
		 * @param  {String} name	필드 이름
		 * @param  {String} value	필드 값
		 */		
		addNppfsField: function(name, value) {
			if ($('#nos-device-info-form input[type="hidden"][name="' + name + '"]').length == 0) {
				$('#nos-device-info-form').append('<input type="hidden" name="' + name + '" value="' + value + '" />');
			}

			$('#nos-device-info-form input[type="hidden"][name="' + name + '"]').val(value);
		},

		/**
		 * NFilter 키패드 데이터(key=value|key=value|...)에서 특정 key의 값 얻기
		 * @category 미분류(이전예정)
		 * @method nFilterEncDataForKey
		 * @param {String} data 키패드 모듈에서 받은 데이터
		 * @param {String} key 찾으려는 값의 key
		 * @return {String} key 에 해당하는 값. 없는 경우 빈 문자열.
		 */
		nFilterEncDataForKey: function(data, key) {
			var result = '';
			var items = data.split('|');
			for (var i = 0; i < items.length; i++) {
				var kv = items[i].split('=');
				if (kv[0] == key) {
					result = kv[1];
					break;
				}
			}
			return result;
		},
		/**
		 * 서버에서 받아온 시간 기준 현재 시간 반환.
		 * @category 날짜/시간
		 * @return {Object} 서버 시간(sysdate, systime) 있는 경우 아래 형태의 object. 서버시간 정보 없는 경우 null.
		 * Key | Type | 설명
		 * ---|---|---
		 * sysdate | String | 서버에서 받은 sysdate
		 * systime | String | 서버에서 받은 systime
		 * currentDate | String | sysdate/systime 기준 현재 날짜. 예) "20180315"
		 * currentTime | String | sysdate/systime 기준 현재 시간. 예) "101530"
		 * tYear | Number | 연도
		 * tMonth | Number | 월
		 * tDay | Number | 일
		 * tHour | Number | 시
		 * tMin | Number | 분
		 * tSec | Number | 초
		 * tWeek | Number | 요일 (0: 일요일, 1: 월요일, ...)
		 * @see
		 * currentDate, currentTime 계산은 sysdate/systime에 현재 시간(new Date())에서 상품 시작시간(sfd.data.getValue('flowStartTime'))을 뺀 진행시간을 더해서 구함.
		 */
		getCurrentDate: function() {
			// 서버에서 받아온시간 Date 객채화
			var serverDate = sfd.data.getValue('sysdate');
			var serverTime = sfd.data.getValue('systime');
			if (serverDate) {
				var year = parseInt(serverDate.substr(0, 4), 10);
				var month = parseInt(serverDate.substr(4, 2), 10) - 1;
				var day = parseInt(serverDate.substr(6, 2), 10);
				var hour = parseInt(serverTime.substr(0, 2), 10);
				var min = parseInt(serverTime.substr(2, 2), 10);
				var sec = parseInt(serverTime.substr(4, 2), 10);

				var sst = new Date(year, month, day, hour, min, sec); // Server Start Time 로그인시 서버 시작시간

				// flowTime = 상품 시작시간 + 현재시간 
				var flowTime = (new Date()).getTime() - sfd.data.getValue('flowStartTime');

				var d = new Date();
				d.setTime(sst.getTime() + flowTime);
				var tWeek = d.getDay();
				var tYear = d.getFullYear();
				var tMonth = d.getMonth() + 1;
				var tHour = d.getHours();
				var tDay = d.getDate();
				var tMin = d.getMinutes();
				var tSec = d.getSeconds();

				var strMonth = tMonth.toString();
				var strDay = tDay.toString();
				var strHour = tHour.toString();
				var strMin = tMin.toString();
				var strSec = tSec.toString();

				if (strMonth.length == 1) {
					strMonth = '0' + strMonth;
				}

				if (strDay.length == 1) {
					strDay = '0' + strDay;
				}

				if (strHour.length == 1) {
					strHour = '0' + strHour;
				}

				if (strMin.length == 1) {
					strMin = '0' + strMin;
				}

				if (strSec.length == 1) {
					strSec = '0' + strSec;
				}


				var currentDate = tYear.toString() + strMonth + strDay;
				var currentTime = strHour + strMin + strSec;

				return {
					sysdate: serverDate,
					systime: serverTime,
					currentDate: currentDate,
					currentTime: currentTime,
					tYear: tYear,
					tMonth: tMonth,
					tDay: tDay,
					tHour: tHour,
					tMin: tMin,
					tSec: tSec,
					tWeek: tWeek
				}
			} else {
				return null;
			}
		},
		/**
		 * OTK 로 연결될 링크를 생성해준다.
		 * @category 미분류(이전예정)
		 * @param {Object} info OTK 링크에 필요한 otk 및 추가 파라미터들.
		 * @return {String} OTK 및 추가 정보(info)로 만들어진 overture_index.jsp URL.
		 * @example
		 * ```js
		 * var link = sfd.utils.getOTKLink({ otk: "A123" }); // => https://direct.samsungfire.com/CR_MyAnycarWeb/overture_index.jsp?OTK=A123
		 * location.replace(link);
		 * ```
		 */
		getOTKLink: function(info) {
			// TODO: core 쪽으로 옮기는게 좋을듯
			var protocol = location.protocol;
			var host = location.host;
			var otk = info.otk;
			var etcParameter = '';
			
			if (sfd.env.deviceType == 'MO') {
				etcParameter = '&dynamicPass=Y';
			}
			
			for (var v in info) {
				if (v != 'otk') {
					etcParameter += '&' + v + '=' + info[v];
				}
			}
		
			return protocol + '//' + host + '/CR_MyAnycarWeb/overture_index.jsp?OTK=' + otk + etcParameter;
		},

		/**
		 * 휴일 확인 (sfd.listValue 참조)
		 * @category 날짜/시간
		 * @method isHoliday
		 * @param {String|Date} date 확인할 날짜
		 * @return {Boolean} 날짜가 휴일이면 true, 아니면 false.
		 */
		isHoliday: function(date) {
			var dateStr = this.dateToString(date);
			if (!dateStr) {
				return false;
			}

			var index = sfd.listValue.holidays.findIndex(function(holiday) {
				var holidayDateStr = holiday.value.replace('9999', dateStr.substr(0, 4));
				return holidayDateStr == dateStr;
			});
			return index != -1;
		},

		/**
		 * 주말인지 확인
		 * @category 날짜/시간
		 * @method isWeekend
		 * @param {String|Date} date 확인할 날짜
		 * @return {Boolean} 주말이면 true, 아니면 false
		 */
		isWeekend: function(date) {
			var dateStr = this.dateToString(date);
			if (!dateStr) {
				return false;
			}

			var weekdayLabel = this.weekdayLabel(dateStr, true);
			return ['토', '일'].includes(weekdayLabel);
		},

		/**
		 * sfd.module.payment.rt.isAvailable() 사용하세요. (deprecated)
		 * @category 미분류(이전예정)		 
		 * @method isAbleRtTime
		 * @param {Object} options 옵션
		 * Key|Type|설명
		 * ---|---|---
		 * date | String | 수동으로 비교하고싶은 날짜
		 * time | String | 수동으로 비교하고싶은 시간
		 * @return {Boolean} RT 가능여부
		 * @see
		 * 기본적으로 서버시간 기준으로체크 한다
		 * 수동으로 날짜를 확인하고 싶을 경우 옵션을 넣는다
		 */
		isAbleRtTime: function(option) {
			return sfd.module.payment.rt.isAvailable();
		},

		/**
		 * sfd.module.checkDateForCounsel() 사용하세요. (deprecated)
		 * @category 미분류(이전예정)		 
		 * @method checkAbleCounselTime
		 * @param {Object} options 옵션
		 * Key|Type|설명
		 * ---|---|---
		 * date | String | 수동으로 비교하고싶은 날짜
		 * time | String | 수동으로 비교하고싶은 시간
		 *
		 * @return {boolean} 상담 가능여부
		 * 
		 * * Key|Type|설명
		 * ---|---|---
		 * result | boolean | 통과여부
		 * message | String | 안내문구
		 * isSelectable | boolean | 선택가능여부
		 * @see
		 * 기본적으로 서버시간 기준으로체크 한다
		 * 수동으로 날짜를 확인하고 싶을 경우 옵션을 넣는다
		 */
		checkAbleCounselTime: function(option) {
			// TODO: 이 함수는 module 쪽으로 옮겨야 할듯
			var option = $.extend({
				'date': sfd.data.dataObject.sysdate,
				'time': sfd.data.dataObject.systime
			}, option);

			// 초기화
			var resultObj = {
				result: false,			// 통과여부
				message: '',			// 메시지
				isSelectable: false		// 선택가능여부
			}

			// 상담시간 정보
			var counselInfo = {
				// RT 시작시간
				startTimeInfo: {
					value:	'090000',
					desc:	'상담가능 시작시간 HHMMMM'
				},
				// RT 종료시간
				endTimeInfo: {
					value:	'170000',
					desc:	'상담가능 끝시간 HHMMMM'
				}
			}
			var message = '';

			if (sfd.utils.isHoliday(option.date)) {
				// 공휴일
				message = 'E0089';
			} else if (sfd.utils.isWeekend(option.date)) {
				// 주말(토,일 요일)
				message = 'E0089';
			} else if (!_isBizTime(option.date)) {
				// 상담시간
				message = 'E0090';
			} else if (_getHolidayMessageInfo(option.date)) {
				// 지연일 체크
				var info = _getHolidayMessageInfo(option.date);
				message = info.message;
				resultObj.isSelectable = info.selectable;
			} else {
				// 그외 통과
				resultObj.result = true;
			}

			// 메시지
			resultObj.message = message;


			// 리턴
			return resultObj;

			// 상담시간
			function _isBizTime(dayStr) {
				var _r = true;

				if (dayStr == sfd.data.getValue('sysdate') &&				// 오늘이면
					Number(sfd.data.getValue('systime')) >= counselInfo.endTimeInfo.value)  {		// 오후 5시를 넘었으면
					_r = false;
				}
				return _r;
			}

			// 지연일 체크
			function _getHolidayMessageInfo(dayStr) {
				var result = null;
				var dayNum = parseInt(dayStr);

				$.each(sfd.listValue.holidaysCounselRequest, function(i, item) {
					var beginDayNum = parseInt(item.period.split('-')[0]);
					var endDayNum = parseInt(item.period.split('-')[1]);

					// 기간내에 속할 경우
					if (beginDayNum <= dayNum && dayNum <= endDayNum) {
						result = item;
						return false;
					}
				});
				return result;
			}
		},

		/**
		 * 은행, 카드 고장 체크
		 * @category 미분류(이전예정)
		 * @param {Object} options 옵션
		 * Key|Type|설명
		 * ---|---|---
		 * type | String | 비교타입 - RT PG *(모두) 등
		 * code | String | 은행,카드 코드
		 * mode | String | 은행,카드 모드 - // 'card' or 'bank'
		 * date | String | 수동으로 비교하고싶은 날짜
		 * time | String | 수동으로 비교하고싶은 시간
		 * 
		 * @return {Object} RT 가능여부
		 * 
		 * Key|Type|설명
		 * ---|---|---
		 * result | boolean | 통과여부
		 * message | String | 안내문구
		 * isSelectable | String | 선택가능여부
		 * 
		 * @see
		 * sfd.utils.checkBreakDownPayment()
		 * sfd.utils.checkBreakDownPayment({type: 비교타입, code: '비교코드', mode: '은행,카드 모드'})
		 * 
		 * 기본적으로 서버시간 기준으로체크 한다
		 * 수동으로 날짜를 확인하고 싶을 경우 옵션을 넣는다
		 * 타입체크는 은행모드에서만한다
		 */
		checkBreakDownPayment: function(options) {
			// TODO: 이 함수는 module 쪽으로 옮겨야 할듯
			var options = $.extend({
				type: '*',
				code: '00',
				mode: 'bank',	// 'card' or 'bank'
				date: sfd.data.dataObject.sysdate,
				time: sfd.data.dataObject.systime
			}, options);

			// 리스트
			var _list = sfd.listValue.bankBreakDownList;
			if (options.mode == 'card') {
				_list = sfd.listValue.cardBreakDownList;
			}

			var resultObj = {
				result: true,			// 통과여부
				message: '',			// 메시지
				isSelectable: false	// 선택가능여부
			}

			// 파라미터 정합성체크
			if (options.code == '00') {
				// <STRIP_WHEN_RELEASE
				resultObj._localError = '파라미터가 잘못되었습니다.';
				// STRIP_WHEN_RELEASE>
				return resultObj;
			}

			$.each(_list, function(i, v) {
				if (options.code != v.code && v.code != '*') {
					// 비교대상 코드가아니면 리턴
					return true;
				} else if (options.type != v.type && v.type != '*' && options.mode == 'bank') {
					// 비교대상 타입이 아니면 리턴
					return true;
				}
				// 날짜시간안에 안 걸리면 리턴
				if (!isDate(v.startDate, v.endDate)) {
					return true;
				}

				// 여기까지 왔으면 걸린거다
				resultObj.result = false;
				resultObj.message = v.message;
				resultObj.isSelectable = v.isSelectable;

				return false;
			});

			return resultObj;

			// 날짜와시간 모두 비교
			function isDate(startDate, endDate) {
				// 가능 시간
				var myDate = (options.date).toString() + (options.time).toString();
				return startDate <= myDate && myDate < endDate
			}
		},

		/**
		 * 문자열에 개인정보(이메일, 주민등록번호) 존재여부 확인.
		 * @category 확인
		 * @param  {String}  text 확인할 문자열
		 * @return {Boolean} 개인정보 존재하는 경우 true, 없는 경우 false.
		 */
		includesPrivacyInfo: function(text) {
			text = text || '';
			text = text.replace(/-| /gi, '');
			if (verifyEmail(text)) {
				return true;
			}
			if (verifySSN2(text)) {
				return true;
			}
			return false;

			function verifyEmail(text) {
				if (!text || !text.match(/(\w+\.)*\w+@(\w+\.)+[A-Za-z]+/)) {
					return false;
				} else {
					return true;
				}
			}
			// 주민등록번호 체크
			function verifySSN2(text) {
				if (!text || !text.match(/\d{7,}/)) {
					return false;
				} else {
					return true;
				}
			}
		},

		/**
		 * 문자열에 개인정보(이메일, 주민등록번호) 존재여부 확인. (존재하는 경우 안내 alert 노출)
		 * @category 확인
		 * @param  {String}  text 확인할 문자열
		 * @return {Boolean} 개인정보 존재하는 경우 true, 없는 경우 false.
		 * @see
		 * 체험기, 상담신청 내용 입력확인
		 */
		isExistUserInfo: function(inText) {
			var result = this.includesPrivacyInfo(inText);
			if (result) {
				sfd.core.alert('입력하신 내용에 개인정보가 포함되어 있습니다.<br>이메일, 휴대폰번호 등 개인정보를 제외하고 입력해 주세요.');
			}
			return result;
		},
		
		/**
		 * HTML 특수문자를 &코드;로 변환.
		 * @category 변환
		 * @param {String} str 변환할 문자열.
		 * @return {String} 변환된 문자열.
		 * 변환전 | 변환후
		 * ---|---
		 * `&` | `&amp;`
		 * `<` | `&lt;`
		 * `>` | `&gt;`
		 * `"` | `&quot;`
		 * `'` | `&#39;`
		 */
		safeTag: function(str) {
			if (!str || str.length == 0) {
				return str;
			}
			str = str.split('&').join('&amp;');
			str = str.split('<').join('&lt;');
			str = str.split('>').join('&gt;');
			str = str.split('"').join('&quot;');
			str = str.split("'").join('&#39;');
			return str;
		},
		/**
		 * &코드;로 되어 있던 HTML 특수문자를 일반 문자로 변환.
		 * @category 변환
		 * @param {String} str 변환할 문자열.
		 * @return {String} 변환된 문자열.
		 * 변환전 | 변환후
		 * ---|---
		 * `&amp;` | `&`
		 * `&lt;` | `<`
		 * `&gt;` | `>`
		 * `&quot;` | `"`
		 * `&#39;` | `'`
		 */
		unSafeTag: function(str) {
			if (!str || str.length == 0) {
				return str;
			}
			str = str.split('&amp;').join('&');
			str = str.split('&lt;').join('<');
			str = str.split('&gt;').join('>');
			str = str.split('&quot;').join('"');
			str = str.split('&#39;').join("'");
			return str;
		},

		/**
		 * UUID 생성
		 * @category 기타
		 * @return {String} 생성된 UUID
		 */
		uuid: function() {
			return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
				var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
				return v.toString(16);
			});
		},

		endVal: ''
	};

	

	function has(obj, path) {
		return obj != null && Object.prototype.hasOwnProperty.call(obj, path);
	};

	function isFunction(obj) {
		return typeof obj == 'function' || false;
	};

	return self;


});
