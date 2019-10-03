/**
 * 각종 값 모음들
 * @class sfd.listValue
 * @see 
 * 대부분 [{label: '화면표시제목', value: '값'}, ...] 형태의 배열임.
 * 타입이 배열이 아닌 경우 이름이 복수형이 아님. (ex: driverLimit, driverLimitLabel)
 */
define(function() {
	'use strict';

	var sfd;
	var _phoneCompanyCodes = [
		{ label: '010', value: '010' },
		{ label: '011', value: '011' },
		{ label: '016', value: '016' },
		{ label: '017', value: '017' },
		{ label: '018', value: '018' },
		{ label: '019', value: '019' }
	];
	var _telephoneAreaCodes = [
		// { label: '0130', value: '0130' },
		{ label: '02', value: '02' },
		{ label: '031', value: '031' },
		{ label: '032', value: '032' },
		{ label: '033', value: '033' },
		{ label: '041', value: '041' },
		{ label: '042', value: '042' },
		{ label: '043', value: '043' },
		{ label: '044', value: '044' },
		{ label: '051', value: '051' },
		{ label: '052', value: '052' },
		{ label: '053', value: '053' },
		{ label: '054', value: '054' },
		{ label: '055', value: '055' },
		{ label: '061', value: '061' },
		{ label: '062', value: '062' },
		{ label: '063', value: '063' },
		{ label: '064', value: '064' },
		{ label: '070', value: '070' }
	];

	var _faxAreaCode = [
		{ label: '0303', value: '0303' },
		{ label: '0502', value: '0502' },
		{ label: '0504', value: '0504' },
		{ label: '0505', value: '0505' },
		{ label: '0506', value: '0506' }		
	]

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
		 * 카드 목록 및 할부 정보 등(자동차용)
		 * @category 결제
		 * @property cards
		 * @type {Array}
		 * @see
		 * ["01","02","10","03","07","16","06","05","09","11","14"] afterCharge 20180910 open
		 * 
		 * 구성
		 * Key | Type | 설명
		 * ---|---|---
		 * value | String | 코드. 예) "01"
		 * label | String | 이름. 예) "삼성카드"
		 * appCard | Boolean | 앱카드 지원 여부
		 * savePoint | Boolean | 세이브포인트 지원 여부
		 * bonusPoint | Boolean | 보너스포인트 지원 여부
		 * afterCharge | Boolean | 후청구 지원 여부
		 * guides | Array | 할부 안내 정보 배열. 예) [{ months: ['10'], label: '1~3회 이자부담 4~10회 무이자' }, ...]
		 */
		cards: [
			{ value: '01', label: '삼성카드', appCard: true, savePoint: true, bonusPoint: true, afterCharge: true,
				guides: [
					{months: ['02', '03', '04', '05', '06', '10'],
						label: '무이자할부대상 5만원 이상 결제'}
					// {months: ['10'],
					// 	label: '1~3회 이자부담 4~10회 무이자'}
				] 
			},
			{ value: '10', label: '삼성S클래스카드', appCard: true, savePoint: true, bonusPoint: true, afterCharge: true, guides: [] },
			{ value: '02', label: '삼성애니카플러스카드', appCard: true, savePoint: true, bonusPoint: true, afterCharge: true,
				guides: [
					{months: ['02', '03', '04', '05', '06', '10'],
						label: '무이자할부대상 5만원 이상 결제'}
					// {months: ['10'],
					// 	label: '1~3회 이자부담 4~10회 무이자'}
				] 
			},
			{ value: '16', label: '삼성화재다이렉트신한카드', appCard: true, savePoint: false, bonusPoint: false, afterCharge: true,
				guides: [
					{months: ['02', '03', '04', '05', '06', '10'],
						label: '무이자할부대상 5만원 이상 결제'}
					// {months: ['10'],
					// 	label: '1~2회 이자부담 3~10회 무이자'}
				] 
			},
			{ value: '14', label: '삼성화재다이렉트롯데카드', appCard: false, savePoint: true, bonusPoint: false, afterCharge: true,
				guides: [
					{months: ['02', '03', '04', '05', '06'],
						label: '무이자할부대상 5만원 이상 결제'}
				] 
			},	
			{ value: '03', label: '현대카드', appCard: true, savePoint: false, bonusPoint: true, afterCharge: true,
				guides: [
					{months: ['02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
						label: '무이자할부대상 5만원 이상 결제'}					
				] 
			},
			{ value: '07', label: '신한(LG)카드', appCard: true, savePoint: false, bonusPoint: false, afterCharge: true,
				guides: [
					{months: ['02', '03', '04', '05', '06', '10'],
						label: '무이자할부대상 5만원 이상 결제'}
					// {months: ['10'],
					// 	label: '1~2회 이자부담 3~10회 무이자'}
				] 
			},
			{ value: '09', label: '하나카드', appCard: false, savePoint: false, bonusPoint: true, afterCharge: true, guides: []},
			{ value: '11', label: '롯데카드', appCard: false, savePoint: false, bonusPoint: false, afterCharge: true, guides: []},
			{ value: '06', label: 'KB국민카드', appCard: false, savePoint: false, bonusPoint: false, afterCharge: true,
				guides: [
					{months: ['02', '03', '04', '05', '06', '12'],
						label: '무이자할부대상 5만원 이상 결제'},
					{months: ['10'],
						label: '1~2회 이자부담 3~10회 무이자'}
				] 
			},
			{ value: '05', label: 'BC카드', appCard: false, savePoint: false, bonusPoint: false, afterCharge: true, guides: []},
			{ value: '12', label: '씨티카드', appCard: false, savePoint: false, bonusPoint: false, afterCharge: false, guides: []},
			{ value: '13', label: '우리카드', appCard: false, savePoint: false, bonusPoint: false, afterCharge: false, guides: [] },
			{ value: '08', label: '기타 모든 카드', appCard: false, savePoint: false, bonusPoint: false, afterCharge: false, guides: [] }
		],

		/**
		 * 카드 목록 및 할부 정보 등(일반장기용)
		 * @category 결제
		 * @type {Array}
		 * @see
		 * 구성
		 * Key | Type | 설명
		 * ---|---|---
		 * value | String | 코드. 예) "01"
		 * label | String | 이름. 예) "삼성카드"
		 * appCard | Boolean | 앱카드 지원 여부
		 * savePoint | Boolean | 세이브포인트 지원 여부
		 * bonusPoint | Boolean | 보너스포인트 지원 여부
		 * afterCharge | Boolean | 후청구 지원 여부
		 */
		cardsForNonCar: [
			{ value: '01', label: '삼성카드', appCard: true, savePoint: true, bonusPoint: true, afterCharge: false },
			{ value: '03', label: '현대카드', appCard: true, savePoint: false, bonusPoint: false, afterCharge: false },
			{ value: '07', label: '신한(LG)카드', appCard: true, savePoint: false, bonusPoint: false, afterCharge: false },
			{ value: '09', label: '하나카드', appCard: false, savePoint: false, bonusPoint: false, afterCharge: false },
			{ value: '11', label: '롯데카드', appCard: false, savePoint: false, bonusPoint: false, afterCharge: false },
			{ value: '06', label: 'KB국민카드', appCard: false, savePoint: false, bonusPoint: false, afterCharge: false },
			{ value: '05', label: 'BC카드', appCard: false, savePoint: false, bonusPoint: false, afterCharge: false },
			{ value: '12', label: '씨티카드', appCard: false, savePoint: false, bonusPoint: false, afterCharge: false },
			{ value: '13', label: '우리카드', appCard: false, savePoint: false, bonusPoint: false, afterCharge: false },
			{ value: '08', label: '기타 모든 카드', appCard: false, savePoint: false, bonusPoint: false, afterCharge: false }
		],
		/**
		 * 카드 목록(삼성페이용)
		 * @category 결제
		 * @type {Array}
		 * @see
		 * 구성
		 * Key | Type | 설명
		 * ---|---|---
		 * value | String | 코드. 예) "01"
		 * label | String | 이름. 예) "삼성카드"
		 * appCard | Boolean | 앱카드 지원 여부
		 * savePoint | Boolean | 세이브포인트 지원 여부
		 * bonusPoint | Boolean | 보너스포인트 지원 여부
		 * afterCharge | Boolean | 후청구 지원 여부
		 * guides | Array | 할부 안내 정보 배열. 예) [{ months: ['10'], label: '1~3회 이자부담 4~10회 무이자' }, ...]
		 */
		cardsForSamsungPay: [
			{ value: '01', label: '삼성카드', appCard: false, savePoint: false, bonusPoint: true, afterCharge: true,
				guides: [
					{months: ['02', '03', '04', '05', '06', '10'],
						label: '무이자할부대상 5만원 이상 결제'}
					// {months: ['10'],
					// 	label: '1~3회 이자부담 4~10회 무이자'}
				] 
			}
		],
		/**
		 * 카드 목록(SSG Pay용)
		 * @category 결제
		 * @property cardsForSSG
		 * @type {Array}
		 * @see
		 * ["01","02","10","03","07","16","06","05","09","11","14"] afterCharge 20180910 open
		 */
		cardsForSSG: [
			{ value: '01', label: '삼성카드', appCard: false, savePoint: false, bonusPoint: false, afterCharge: true	},
			{ value: '03', label: '현대카드', appCard: false, savePoint: false, bonusPoint: false, afterCharge: true },
			{ value: '07', label: '신한(LG)카드', appCard: false, savePoint: false, bonusPoint: false, afterCharge: true },
			{ value: '09', label: '하나카드', appCard: false, savePoint: false, bonusPoint: false, afterCharge: true },
			{ value: '11', label: '롯데카드', appCard: false, savePoint: false, bonusPoint: false, afterCharge: true },
			{ value: '06', label: 'KB국민카드', appCard: false, savePoint: false, bonusPoint: false, afterCharge: true }/* ,
			{ value: '05', label: 'BC카드', appCard: false, savePoint: false, bonusPoint: false, afterCharge: true } */
		],
		/**
		 * 카드 목록(Kakao Pay용)
		 * @category 결제
		 * @property cardsForKakao
		 * @type {Array}
		 * @see
		 */
		cardsForKakao: [
			{ value: '01', label: '삼성카드', appCard: false, savePoint: false, bonusPoint: false, afterCharge: false	},
			{ value: '03', label: '현대카드', appCard: false, savePoint: false, bonusPoint: false, afterCharge: false },
			{ value: '07', label: '신한(LG)카드', appCard: false, savePoint: false, bonusPoint: false, afterCharge: false },
			{ value: '06', label: 'KB국민카드', appCard: false, savePoint: false, bonusPoint: false, afterCharge: false },
			{ value: '00', label: '카카오머니', appCard: false, savePoint: false, bonusPoint: false, afterCharge: false }
		],
		/**
		 * 카드 목록(법인용, 일반장기용)
		 * @category 결제
		 * @property cardsForCorp
		 * @type {Array}
		 * @see
		 * 구성
		 * Key | Type | 설명
		 * ---|---|---
		 * value | String | 코드값
		 * label | String | 이름
		 */
		cardsForCorp: [
			{ value: '01', label: '삼성카드' },
			{ value: '03', label: '현대카드' },
			{ value: '07', label: '신한(LG)카드' },
			{ value: '09', label: '하나카드' },
			{ value: '11', label: '롯데카드' },
			{ value: '06', label: 'KB국민카드' },
			{ value: '05', label: 'BC카드' },
			{ value: '12', label: '씨티카드' },
			{ value: '13', label: '우리카드' },
			{ value: '08', label: '기타 모든 카드' }
		],
		/**
		 * 은행 목록
		 * @category 결제
		 * @property banks
		 * @type {Array}
		 * @see
		 * 구성
		 * Key | Type | 설명
		 * ---|---|---
		 * value | String | 코드. 예) "039"
		 * label | String | 이름. 예) "경남은행"
		 * RT | Boolean | 실시간계좌이체 지원 여부
		 */
		banks: [
			{ value: '039', label: '경남은행', RT: true },
			{ value: '034', label: '광주은행', RT: true },
			{ value: '004', label: '국민은행', RT: true },
			{ value: '003', label: '기업은행', RT: true },
			{ value: '011', label: '농협은행', RT: true },
			{ value: '031', label: '대구은행', RT: true },
			{ value: '032', label: '부산은행', RT: true },
			{ value: '002', label: '산업은행', RT: false },
			{ value: '045', label: '새마을금고', RT: true },
			{ value: '007', label: '수협중앙회', RT: false },
			{ value: '023', label: 'SC제일은행', RT: true },
			{ value: '088', label: '신한은행', RT: true },
			{ value: '047', label: '신협은행', RT: false },
			{ value: '027', label: '씨티은행', RT: true },
			{ value: '020', label: '우리은행', RT: true },
			{ value: '071', label: '우체국', RT: true },
			{ value: '037', label: '전북은행', RT: true },
			{ value: '035', label: '제주은행', RT: false },
			// { value: '021', label: '조흥은행', RT: false },
			// { value: '006', label: '주택은행', RT: false },
			{ value: '012', label: '지역 농.축협', RT: true }, // 20190626 추가
			{ value: '090', label: '카카오뱅크', RT: false },
			{ value: '089', label: 'K뱅크', RT: false },
			{ value: '081', label: 'KEB하나은행', RT: true }
		],
		/**
		 * 증권사 목록
		 * @category 결제
		 * @property securitiesFirms
		 * @type {Array}
		 * @see
		 * 구성
		 * Key | Type | 설명
		 * ---|---|---
		 * value | String | 코드. 예) "039"
		 * label | String | 이름. 예) "경남은행"
		 * RT | Boolean | 실시간계좌이체 지원 여부
		 */
		securitiesFirms: [
			{ value: '261', label: '교보증권', RT: false },
			{ value: '264', label: '키움증권', RT: false },
			{ value: '267', label: '대신증권', RT: false },
			{ value: '238', label: '미래에셋 대우', RT: false },
			{ value: '279', label: '동부증권', RT: false },
			{ value: '287', label: '메리츠증권', RT: false },
			{ value: '290', label: '부국증권', RT: false },
			{ value: '240', label: '삼성증권', RT: true },
			{ value: '291', label: '신영증권', RT: false },
			{ value: '278', label: '신한금융투자', RT: false },
			{ value: '268', label: '아이엠투자증권', RT: false },
			{ value: '209', label: '유안타증권', RT: false },
			{ value: '280', label: '유진투자증권', RT: false },
			{ value: '265', label: '이트레이드증권', RT: false },
			{ value: '270', label: '하나대투증권', RT: false },
			{ value: '262', label: '하이투자증권', RT: false },
			{ value: '243', label: '한국투자증권', RT: false },
			{ value: '269', label: '한화증권', RT: false },
			{ value: '218', label: '현대증권', RT: false },
			{ value: '263', label: 'HMC투자증권', RT: false },
			{ value: '292', label: 'LIG투자증권', RT: false },
			{ value: '247', label: 'NH투자증권', RT: false },
			{ value: '266', label: 'SK증권', RT: false }
		],
		/**
		 * 보험회사 목록
		 * @category 결제
		 * @property insuranceCompany
		 * @type {Array}
		 * @see
		 * 구성
		 * Key | Type | 설명
		 * ---|---|---
		 * value | String | 코드값
		 * label | String | 이름
		 */
		insuranceCompany: [
			{value: '01', label: '메리츠' },
			{value: '02', label: '한화' },
			{value: '03', label: '롯데' },
			{value: '04', label: '그린' },
			{value: '05', label: '흥국쌍용' },
			{value: '06', label: '제일' },
			{value: '07', label: '리젠트' },
			{value: '08', label: '삼성' },
			{value: '09', label: '현대' },
			{value: '10', label: 'KB' },
			{value: '13', label: '동부' },
			{value: '16', label: '대한재보험' },
			{value: '17', label: 'AIG' },
			{value: '18', label: '시그나' },
			{value: '19', label: '비질렌트' },
			{value: '21', label: '택시공제' },
			{value: '22', label: '버스공제' },
			{value: '23', label: '화물공제' },
			{value: '24', label: '개인택시공제' },
			{value: '25', label: '전세버스공제' },
			{value: '29', label: '미쓰이스미토모' },
			{value: '31', label: '대한보증보험' },
			{value: '32', label: '한국보증보험' },
			{value: '41', label: '교보AXA' },
			{value: '42', label: '더케이' },
			{value: '43', label: '에르고다음' },
			{value: '44', label: 'NH농협손해보험' },
			{value: '45', label: '현대하이카' },
			{value: '99', label: '기타' }
		],

		/**
		 * 카드 할부 개월수 목록
		 * @category 결제
		 * @property dripMonths
		 * @type {Array}
		 */
		dripMonths: [
			{ value: '00', label: '일시불' },
			{ value: '02', label: '2개월' },
			{ value: '03', label: '3개월' },
			{ value: '04', label: '4개월' },
			{ value: '05', label: '5개월' },
			{ value: '06', label: '6개월' },
			{ value: '07', label: '7개월' },
			{ value: '08', label: '8개월' },
			{ value: '09', label: '9개월' },
			{ value: '10', label: '10개월' },
			{ value: '11', label: '11개월' },
			{ value: '12', label: '12개월' }
		],
		/**
		 * 분납 코드 목록
		 * @category 결제
		 * @property payIntlCdList
		 * @type {Array}
		 * @see
		 * 구성
		 * Key | Type | 설명
		 * ---|---|---
		 * value | String | 코드값
		 * label | String | 이름
		 */
		payIntlCdList: [
			{ value: '77', label: '일시납' },
			{ value: '23', label: '2회비연속(자동이체)' },
			{ value: '20', label: '2회연속(자동이체)' },
			{ value: '30', label: '3회연속(자동이체)' },
			{ value: '40', label: '4회연속(자동이체)' },
			{ value: '50', label: '5회연속(자동이체)' },
			{ value: '60', label: '6회연속(자동이체)' }
		],
		/**
		 * 휴대폰 통신사 목록
		 * @category 연락정보
		 * @property phoneCompanies
		 * @type {Array}
		 * @see
		 * 구성
		 * Key | Type | 설명
		 * ---|---|---
		 * value | String | 코드값
		 * label | String | 이름
		 */		
		phoneCompanies: [
			{ value: '1', label: 'SKT' },
			{ value: '2', label: 'KT' },
			{ value: '3', label: 'LGU+' },
			{ value: '5', label: 'SKT(알뜰폰)' },
			{ value: '6', label: 'KT(알뜰폰)' },
			{ value: '7', label: 'LGU+(알뜰폰)' }
		],
		/**
		 * 휴대폰 앞 번호 목록
		 * @category 연락정보
		 * @property phoneCompanyCodes
		 * @type {Array}
		 * @see
		 * 구성
		 * Key | Type | 설명
		 * ---|---|---
		 * value | String | 코드값
		 * label | String | 이름
		 */
		phoneCompanyCodes: _phoneCompanyCodes,
		/**
		 * 일반전화 지역번호 목록
		 * @category 연락정보
		 * @property telephoneAreaCodes
		 * @type {Array}
		 * @see
		 * 구성
		 * Key | Type | 설명
		 * ---|---|---
		 * value | String | 코드값
		 * label | String | 이름
		 */
		telephoneAreaCodes: _telephoneAreaCodes,
		/**
		 * 팩스 가능한 국번만 별도로 뺌
		 * @category 연락정보
		 * @property faxTelephoneAreaCodes
		 * @type {Array}
		 * @see
		 * 구성
		 * Key | Type | 설명
		 * ---|---|---
		 * value | String | 코드값
		 * label | String | 이름
		 */
		faxTelephoneAreaCodes: _telephoneAreaCodes.concat(_faxAreaCode),		
		/**
		 * 휴대폰 앞 번호 목록 + 일반전화 지역번호 목록
		 * @category 연락정보
		 * @property phoneAreaCodes
		 * @type {Array}
		 * @see
		 * 구성
		 * Key | Type | 설명
		 * ---|---|---
		 * value | String | 코드값
		 * label | String | 이름
		 */
		phoneAreaCodes: _phoneCompanyCodes.concat(_telephoneAreaCodes),
		/**
		 * 자주 사용하는 이메일 주소 도메인 목록
		 * @category 연락정보
		 * @property emailDomains
		 * @type {Array}
		 * @see
		 * 구성
		 * Key | Type | 설명
		 * ---|---|---
		 * value | String | 코드값
		 * label | String | 이름
		 */
		emailDomains: [
			{ label: 'naver.com', value: 'naver.com' },
			{ label: 'hanmail.net', value: 'hanmail.net' },
			{ label: 'daum.net', value: 'daum.net' },
			{ label: 'nate.com', value: 'nate.com' },
			{ label: 'gmail.com', value: 'gmail.com' },
			{ label: 'hotmail.com', value: 'hotmail.com' },
			{ label: 'korea.kr', value: 'korea.kr' },
			// { label: 'empal.com', value: 'empal.com' },
			// { label: 'lycos.co.kr', value: 'lycos.co.kr' },
			{ label: 'korea.com', value: 'korea.com' },
			{ label: 'dreamwiz.com', value: 'dreamwiz.com' },
			// { label: 'paran.com', value: 'paran.com' },
			// { label: 'chol.com', value: 'chol.com' },
			{ label: 'yahoo.co.kr', value: 'yahoo.co.kr' },
			{ label: 'samsung.com', value: 'samsung.com' },
			// { label: 'divider', value: 'divider' },
			// { label: '직접입력', value: 'userCustomInput' }
			{ label: '직접입력', value: 'selfInput', displayType: 'selfInput', restrictClass: 'onlyEmail' }
		],
		/**
		 * 주소 종류 목록
		 * @category 연락정보
		 * @type {Array}
		 * @see
		 * 구성
		 * Key | Type | 설명
		 * ---|---|---
		 * value | String | 코드값
		 * label | String | 이름
		 */
		addressTypes: [
			{ value: '0002', label: '자택' },
			{ value: '0003', label: '직장' }
		],
		/**
		 * 휴일 목록
		 * @category 날짜
		 * @type {Array}
		 * @see
		 * 구성
		 * Key | Type | 설명
		 * ---|---|---
		 * value | String | 코드값
		 * label | String | 이름
		 */
		holidays: [
			{ value: '99990101', label: '신정' },
			{ value: '99990301', label: '삼일절' },
			{ value: '99990505', label: '어린이날' },
			{ value: '99990501', label: '근로자의날' },
			// { value: '99990514', label: '석가탄신일' },
			{ value: '99990606', label: '현충일' },
			{ value: '99990815', label: '광복절' },
			{ value: '99991003', label: '개천절' },
			{ value: '99991009', label: '한글날' },
			{ value: '99991225', label: '성탄절' },

			{ value: '20160208', label: '구정' },
			{ value: '20160209', label: '구정' },
			{ value: '20160210', label: '대체휴일' },
			{ value: '20160413', label: '20대 국회의원선거' },
			{ value: '20160914', label: '추석' },
			{ value: '20160915', label: '추석' },
			{ value: '20160916', label: '추석' },

			// 2018
			{ value: '20180215', label: '설날' },
			{ value: '20180216', label: '설날' },
			{ value: '20180507', label: '대체휴일' },
			{ value: '20180522', label: '석가탄신일' },
			{ value: '20180613', label: '지방선거' },
			{ value: '20180924', label: '추석' },
			{ value: '20180925', label: '추석' },
			{ value: '20180926', label: '대체휴일' },

			// 2019
			{ value: '20190204', label: '구정' },
			{ value: '20190205', label: '구정' },
			{ value: '20190206', label: '구정' },
			{ value: '20190506', label: '어린이날 대체휴일' },
			{ value: '20190912', label: '추석' },
			{ value: '20190913', label: '추석' }
		],
		/**
		 * 휴일 상담신청 메세지제어 목록
		 * @category 상담신청
		 * @type {Array}
		 * @see
		 * 구성
		 * Key | Type | 설명
		 * ---|---|---
		 * period | String | 제어시작일-제어종료일. 예) '20170920-20170922'
		 * selectable | Boolean | 선택가능 여부.
		 * code | String | 추가정보 코드.
		 * message | String | 안내 메세지.
		 */
		holidaysCounselRequest: [
			{ period: '20170920-20170922', selectable: true,  code: null, message: '고객님, 죄송하지만 12(목) 이후, 업무처리가 지연되어 고객님께 드리는 연락이 다소 늦어지더라도 조금 더 기다려 주세요.' },
			{ period: '20180920-20180922', selectable: false, code: null, message: '고객님, 죄송하지만 12(목) 이후, 업무처리가 지연되어 고객님께 드리는 연락이 다소 늦어지더라도 조금 더 기다려 주세요.' },
			{ period: '20070301-20070303', selectable: false, code: null, message: 'end' }
		],
		/**
		 * 가족관계 목록
		 * @category 가족
		 * @type {Array}
		 * @see
		 * 구성
		 * Key | Type | 설명
		 * ---|---|---
		 * value | String | 코드값
		 * label | String | 이름
		 */
		relations: [
			{ value: '961', label: '미지정' },
			{ value: '962', label: '배우자' },
			{ value: '963', label: '3촌이내친족' }
		],
		/**
		 * 가족관계 그룹 목록
		 * @category 가족
		 * @type {Array}
		 * @see
		 * 구성
		 * Key | Type | 설명
		 * ---|---|---
		 * value | String | 코드값
		 * label | String | 이름
		 */
		relationGroups: [
			{ value: '953', label: '법정상속인' },
			{ value: '954', label: '배우자' },
			{ value: '955', label: '자녀' },
			{ value: '956', label: '부모' },
			{ value: '957', label: '기타가족' },
			/*{ value: '958', label: '친족' },
			{ value: '959', label: '고용관계' },*/
			{ value: '960', label: '기타' }
		],
		/**
		 * 운전자한정 코드 목록
		 * @category 운전자한정
		 * @type {Object}
		 */		
		driverLimit: {
			'M20071000': ['4', '7', '3', '2', '5', '1'],
			'M20072000': {   
				'default': ['1'],
				'A173': ['4', '3', '2', '1'], 
				'A373': ['4', '3', '2', '1'],
				'A473': ['4', '3', '2', '1'], 
				'A014': ['4', '3', '2', '1'],
				'A047': ['4', '3', '2', '1'], 
				'A048': ['4', '3', '2', '1'],
				'A043': ['4', '3', '2', '1'], 
				'A106': ['4', '3', '2', '1'],
				'A306': ['4', '3', '2', '1'], 
				'A406': ['4', '3', '2', '1'],
				'A044': ['4', '3', '2', '1'] 
			},
			'M20073000': ['1'],
			'M20075000': ['8', '2', '1']
		},
		/**
		 * 운전자한정 화면 표시용 텍스트 목록
		 * @category 운전자한정
		 * @type {Object}
		 * @see
		 * code: label 형태
		 */		
		driverLimitLabel: {
			'4': '기명피보험자<br>1인',
			'7': '기명피보험자<br>+ 지정 1인',
			'3': '부부',
			'2': '가족<br>(형제자매 제외)',
			'5': '가족 + 형제자매',
			'1': '누구나운전<br>(기본)',
			'8': '기명피보험자<br>1인'
		},
		/**
		 * 운전자한정 화면 표시용 텍스트 목록(MOBILE용)
		 * @category 운전자한정
		 * @type {Object}
		 * code: label 형태
		 */		
		moDriverLimitLabel: {
			'4': '기명피보험자1인',
			'7': '1인+지정 1인',
			'3': '부부',
			'2': '가족(형제자매 제외)',
			'5': '가족+형제자매',
			'1': '누구나운전(기본)',
			'8': '기명피보험자1인'
		},
		/**
		 * 자동차 옵션 목록
		 * @category 자동차
		 * @type {Array}
		 * @see
		 * 구성
		 * Key | Type | 설명
		 * ---|---|---
		 * value | String | 코드값
		 * label | String | 이름
		 */
		carOptions: [
			{ value: '01', label: '에어콘' },
			{ value: '07', label: '패키지스페셜팩' },
			{ value: '08', label: '오토매틱' },
			{ value: '09', label: '알루미늄휠' },
			{ value: '11', label: '선루프' },
			{ value: '13', label: 'CD플레이어' },
			{ value: '14', label: 'ABS' },
			{ value: '15', label: '이모빌라이저(모젠)' },
			{ value: '16', label: '보조범퍼' },
			{ value: '17', label: '네비게이션' },
			{ value: '18', label: '에어백(운전석)' },
			{ value: '19', label: '에어백(+조수석)' },
			{ value: '22', label: '열선시트' },
			{ value: '23', label: '후방탐지기' },
			{ value: '25', label: '신차패키지(부속패키지)', displayType: 'selfInput' },
			{ value: '99', label: '기타부속품', displayType: 'selfInput' }
		],
		/**
		 * 자동차 cartype 5 7 옵션 목록 기계장치
		 * @category 자동차
		 * @type {Array}
		 * @see
		 * 구성
		 * Key | Type | 설명
		 * ---|---|---
		 * value | String | 코드값
		 * label | String | 이름
		 */	
		carMachineOptions: [
			{ value: '01', label: '방송장치' },
			{ value: '02', label: '녹음장치' },
			{ value: '03', label: '렌트겐' },
			{ value: '04', label: '토오키' },
			{ label: '선택없음', value: '' }
		],
		/**
		 * 자동차 cartype7 옵션 목록 carForm
		 * @category 자동차
		 * @type {Array}
		 * @see
		 * 구성
		 * Key | Type | 설명
		 * ---|---|---
		 * value | String | 코드값
		 * label | String | 이름
		 */	
		carFormOptions: [
			{ value: '01', label: '밴' },
			{ value: '02', label: '패널' },
			{ value: '03', label: '냉동장치' },
			{ value: '04', label: '냉장장치' },
			{ value: '05', label: '탱크로리' },
			{ value: '06', label: '적재함높인것' },
			{ value: '07', label: '일반탑' },
			{ label: '선택없음', value: '' }
		],	
		/**
		 * 고지사항 장착장비 목록 (승합)
		 * @category 자동차
		 * @type {Array}
		 * @see
		 * 구성
		 * Key | Type | 설명
		 * ---|---|---
		 * value | String | 코드값
		 * label | String | 이름
		 */
		spclEqptCodesType5: [
			{value: 'A', label: '집게장치'},
			{value: 'Z', label: '특수장비'}
		],
		/**
		 * 고지사항 장착장비 목록 (화물)
		 * @category 자동차
		 * @type {Array}
		 * @see
		 * 구성
		 * Key | Type | 설명
		 * ---|---|---
		 * value | String | 코드값
		 * label | String | 이름
		 */
		spclEqptCodesType7: [
			{value: 'A', label: '집게장치'},
			{value: 'Y', label: '기중기 붐장치'},
			{value: 'Z', label: '특수장비'}
		],
		/**
		 * 고지사항 적재화물 목록
		 * @category 자동차
		 * @type {Array}
		 * @see
		 * 구성
		 * Key | Type | 설명
		 * ---|---|---
		 * value | String | 코드값
		 * label | String | 이름
		 */
		loadGdsTpCodes: [
			 { value: '100', label: '위험물' },
			 { value: '101', label: '활어' },
			 { value: '111', label: '수산물(활어제외)' },
			 { value: '102', label: '쓰레기' },
			 { value: '103', label: '건축폐기물' },
			 { value: '104', label: '사업장 고체폐기물' },
			 { value: '105', label: '분뇨' },
			 { value: '106', label: '이삿짐' },
			 { value: '112', label: '건축자재' },
			 { value: '113', label: '화공/화학제품' },
			 { value: '114', label: '세탁물' },
			 { value: '115', label: '주류' },
			 { value: '116', label: '현금수송' },
			 { value: '117', label: '액상/기상/지정 폐기물' },
			 { value: '121', label: '항공화물, 컨테이너' },
			 { value: '107', label: '농산물' },
			 { value: '108', label: '축산물' },
			 { value: '109', label: '음식료품' },
			 { value: '110', label: '생활용품' },
			 { value: '118', label: '섬유류' },
			 { value: '119', label: '전자/기계/금속류' },
			 { value: '120', label: '플라스틱/고무/나무류' }
		],
		/**
		 * 고지사항 승객운송 목록
		 * @category 자동차
		 * @type {Array}
		 * @see
		 * 구성
		 * Key | Type | 설명
		 * ---|---|---
		 * value | String | 코드값
		 * label | String | 이름
		 */
		compShpCodes: [
			{ value: '01', label: '임대차계약버스' },
			{ value: '02', label: '마을셔틀, 새마을버스' },
			{ value: '03', label: '전문용역업체 소유버스' },
			{ value: '04', label: '관계당국허가유상운송버스' },
			{ value: '05', label: '전세버스회사자가용버스' },
			{ value: '06', label: '단체소속구성원용버스' },
			{ value: '07', label: '불특정다수대상유상운송버스' },
			{ value: '08', label: '기타개인소유대형버스' },
			{ value: '09', label: '여행사관광회사소유버스' },
			{ value: '10', label: '기타법인소유버스' },
			{ value: '51', label: '미인가운송영업(나라시)' },
			{ value: '52', label: '대리운전 픽업용' },
			{ value: '53', label: '커피,차 배달용' },
			{ value: '54', label: '유흥업소 사용' },
			{ value: '55', label: '장애인운송용' },
			{ value: '88', label: '기타(유상운송해당없음)' }
	   ],
	   /**
		 * 과실비율 목록
		 * @category 자동차
		 * @type {Array}
		 * @see
		 * 구성
		 * Key | Type | 설명
		 * ---|---|---
		 * value | String | 코드값
		 * label | String | 이름
		 */		
		faultRate: [
			{ value: '00', label: '과실 없음(상대방 과실 100%)' },
			{ value: '49', label: '50% 미만(저과실)' },
			{ value: '50', label: '50% 이상' }
		],
		/**
		 * 대인상해 급수 목록
		 * @category 자동차
		 * @type {Array}
		 * @see
		 * 구성
		 * Key | Type | 설명
		 * ---|---|---
		 * value | String | 코드값
		 * label | String | 이름
		 */		
		injuryGrade: [
			{ value: '14', label: '14급' },
			{ value: '13', label: '13급' },
			{ value: '12', label: '12급' },
			{ value: '11', label: '11급' },
			{ value: '10', label: '10급' },
			{ value: '09', label: '9급' },
			{ value: '08', label: '8급' },
			{ value: '07', label: '7급' },
			{ value: '06', label: '6급' },
			{ value: '05', label: '5급' },
			{ value: '04', label: '4급' },
			{ value: '03', label: '3급' },
			{ value: '02', label: '2급' },
			{ value: '01', label: '1급' },
			{ value: '00', label: '사망' }
		],
		/**
		 * 납입주기 (주로 장기에서 쓰임, 자리수패딩안붙습니다!!!!!!)
		 * @category 결제
		 * @type {Array}
		 * @see
		 * 구성
		 * Key | Type | 설명
		 * ---|---|---
		 * value | String | 코드값
		 * label | String | 이름
		 */
		paymentPeriod: [
			{ value: '12', label: '월납'},
			{ value: '4', label: '3월납'},
			{ value: '2', label: '6월납'},
			{ value: '1', label: '연납'}
		],
		/**
		 * 납입주기(월) (연금(무배당), 연금(유배당)에서 사용)
		 * @category 완료, 청약내용
		 * @type {Array}
		 * @see
		 * 구성
		 * Key | Type | 설명
		 * ---|---|---
		 * value | String | 코드값
		 * label | String | 이름
		 */
		receiveCycle: [
			{ value: '12', label: '매월'},
			{ value: '4', label: '매3개월'},
			{ value: '2', label: '매6개월'},
			{ value: '1', label: '매년'}
		],
		/**
		 * 운행용도 (패딩 안붙음)
		 * @category 직업
		 * @type {Array}
		 * @see
		 * 구성
		 * Key | Type | 설명
		 * ---|---|---
		 * value | String | 코드값
		 * label | String | 이름
		 */
		driveInfo: [
			{ value: '1', label: '자가용' },
			{ value: '2', label: '영업용' },
			{ value: '5', label: '운전안함'}
		],

		/**
		 * 주택유형 목록
		 * @category 주택
		 * @type {Array}
		 * @see
		 * 구성
		 * Key | Type | 설명
		 * ---|---|---
		 * value | String | 코드값
		 * label | String | 이름
		 */
		houseKind: [
			{value: '1', label: '아파트/주상복합아파트'},
			{value: '2', label: '연립/다세대 주택'},
			{value: '3', label: '단독/다가구 주택'}
		],
		
		/**
		 * 주거유형명 목록
		 * @category 주택
		 * @type {Array}
		 * @see
		 * 구성
		 * Key | Type | 설명
		 * ---|---|---
		 * value | String | 코드값
		 * label | String | 이름
		 */
		houseOwnerCls: [
			{value: '1', label: '자가 소유 주택'},
			{value: '2', label: '임차 주택'}
		],

		/**
		 * 상품별 고유코드 데이터
		 * @category 상품
		 * @property uniqueCodeData
		 * @type {Object}
		 * @see
		 * divisionName이 메인 key로 사용됨. (subDivision 존재하는 경우 subDivisionName을 하위 key로 사용)
		 * 값 Data 구성
		 * Key | 설명
		 * ---|---
		 * parking | 파킹 확인 코드
		 * counsel | 상담신청 코드
		 * bbs | 게시판 코드
		 * category | 게시판 카테고리
		 * screen | 스플렁크 로그, 이벤트 확인(SCREENID)용 코드
		 * minAge | 최소 가입연령 (반려견만 일단위)
		 * maxAge | 최대 가입연령
		 * label | 화면표시용 상품명
		 */
		uniqueCodeData: {
			'car':	{
				'indi':	{parking: '0',		counsel: '',		bbs: '00000085',	category: '',			screen: '20071',	minAge: 0,	maxAge: 99,	simple: 'N',	label: '자동차보험'},
				'corp':	{parking: '1',		counsel: '',		bbs: '00000085',	category: '',			screen: '20073',	minAge: 0,	maxAge: 99,	simple: 'N',	label: '자동차보험(법인용)'}},
			'bloc':	{
				'indi':	{parking: '0',		counsel: '',		bbs: '00000085',	category: '',			screen: '20071',	minAge: 0,	maxAge: 99,	simple: 'N',	label: '자동차보험(일괄)'},
				'corp':	{parking: '1',		counsel: '',		bbs: '00000085',	category: '',			screen: '20073',	minAge: 0,	maxAge: 99,	simple: 'N',	label: '자동차보험(일괄)'}},
			'bike':	{parking: '6',		counsel: '',		bbs: '00000085',	category: '',			screen: '20075',	minAge: 0,	maxAge: 99,	simple: 'N',	label: '이륜자동차보험(오토바이)'},
			'endo':	{parking: '7',		counsel: '',		bbs: '00000085',	category: '',			screen: '21001',	minAge: 0,	maxAge: 99,	simple: 'N',	label: '배서'},
			'claim':	{parking: '8',		counsel: '',		bbs: '00000085',	category: '',			screen: '21002',	minAge: 0,	maxAge: 99,	simple: 'N',	label: '할까말까'},
			'driver':	{
				'indi':	{parking: 'A',		counsel: '5452',	bbs: '00000367',	category: '00000021',	screen: 'L501',		minAge: 19,	maxAge: 70,	simple: 'Y',	label: '운전자보험'},
				'tiny':	{parking: 'A',		counsel: '5452',	bbs: '00000367',	category: '00000021',	screen: 'ETC2',		minAge: 19,	maxAge: 70,	simple: 'Y',	label: '운전자보험'}},
			'home':	{parking: 'B',		counsel: '5453',	bbs: '00000367',	category: '00000022',	screen: 'L505',		minAge: 19,	maxAge: 99,	simple: 'Y',	label: '주택화재보험'},
			'child':	{parking: 'F',		counsel: '5454',	bbs: '00000367',	category: '00000025',	screen: 'L503',		minAge: 0,	maxAge: 45,	simple: 'Y',	label: '어린이보험'},
			'realLoss':	{parking: 'E',		counsel: '5457',	bbs: '00000367',	category: '00000024',	screen: 'L504',		minAge: 0,	maxAge: 65,	simple: 'Y',	label: '실손의료비보험'},
			'cancer':	{parking: 'G',		counsel: '5417',	bbs: '00000367',	category: '00000023',	screen: 'L502',		minAge: 19,	maxAge: 65,	simple: 'Y',	label: '암보험'},
			'health':	{parking: 'J',		counsel: '5061',	bbs: '00000367',	category: '00000034',	screen: 'L507',		minAge: 19,	maxAge: 65,	simple: 'Y',	label: '건강보험'},
			'dental':	{parking: 'L510',	counsel: '5461',	bbs: '00000367',	category: '00000035',	screen: 'L510',		minAge: 2,	maxAge: 65,	simple: 'Y',	label: '치아보험'},
			'smartM':	{parking: 'L511',	counsel: '5462',	bbs: '00000367',	category: '00000036',	screen: 'L511',		minAge: 19,	maxAge: 65,	simple: 'Y',	label: 'Smart 맞춤보장보험'},
			'savings':	{parking: 'D',		counsel: '5455',	bbs: '00000367',	category: '00000029',	screen: 'L301',		minAge: 19,	maxAge: 70,	simple: 'N',	label: '저축보험'},
			'annuity':	{parking: 'C',		counsel: '5456',	bbs: '00000367',	category: '00000027',	screen: 'L302',		minAge: 19,	maxAge: 75,	simple: 'N',	label: '연금저축보험'},
			'annuityFD':	{parking: 'L303',	counsel: '5420',	bbs: '00000367',	category: '00000033',	screen: 'L303',		minAge: 19,	maxAge: 75,	simple: 'N',	label: '연금저축보험(무배당)'},
			'travel':	{
				'indi':	{parking: '2',		counsel: '5306',	bbs: '00000367',	category: '00000028',	screen: 'G203',		minAge: 0,	maxAge: 99,	simple: 'Y',	label: '해외여행보험'},
				'family':	{parking: '2',		counsel: '5306',	bbs: '00000367',	category: '00000028',	screen: 'G204',		minAge: 0,	maxAge: 99,	simple: 'Y',	label: '해외여행보험(가족형)'},
				'indiLong':	{parking: '2',		counsel: '5306',	bbs: '00000367',	category: '00000028',	screen: 'G204',		minAge: 0,	maxAge: 99,	simple: 'Y',	label: '유학보험'}},
			'travelDomestic':	{parking: '3',		counsel: '5303',	bbs: '00000367',	category: '00000030',	screen: 'G205',		minAge: 0,	maxAge: 99,	simple: 'N',	label: '국내여행보험'},
			'golf':	{parking: '5',		counsel: '5301',	bbs: '00000367',	category: '00000032',	screen: 'G202',		minAge: 19,	maxAge: 79,	simple: 'N',	label: '골프보험'},
			'pet':	   {
				'dog': {parking: 'G206',	counsel: '5463',	bbs: '00000367',	category: '00000037',	screen: 'G206',		minAge: 60/*일*/,	maxAge: 8,	simple: 'Y',	label: '반려견보험'},
				'cat': {parking: 'G207',	counsel: '5464',	bbs: '00000367',	category: '00000037',	screen: 'G207',		minAge: 60/*일*/,	maxAge: 8,	simple: 'Y',	label: '반려묘보험'}},
			// 원데이는 변경필요
			'oneday':	{parking: 'Z',	counsel: '',	bbs: '00000085',	category: '',	screen: '25001',		minAge: 60/*일*/,	maxAge: 6,	simple: 'Y',	label: '원데이 자동차보험'}
		},

		/**
		 * 상품별 출력물 데이터 
		 * @category 상품
		 * @property documentData
		 * @type {Object}
		 * @see
		 * divisionName이 메인 key로 사용됨. (subDivision 존재하는 경우 subDivisionName을 하위 key로 사용)
		 * 값 Data 구성
		 * Key | 설명
		 * ---|---
		 * terms | 보험약관
		 * leaflet | 상품안내서(리플렛)
		 * policy | 보험증권
		 * subscription | 청약서류
		 * manual | 상품설명서
		 * summary | 요약자료
		 * certificate | 가입증명서
		 */
		documentData: {
			'car': {
				'indi':	{terms: 'terms_car',				leaflet: '',					policy: 'printInsurancePolicy',		subscription: 'printSubscription',		manual: 'printProductManual',		summary: '',							certificate: 'printFinishCertificate',		label: '자동차보험'},
				'corp':	{terms: 'terms_corp',				leaflet: '',					policy: 'printInsurancePolicy',		subscription: 'printSubscription',		manual: 'printProductManual',		summary: '',							certificate: 'printFinishCertificate',		label: '자동차보험(법인)'}},
			'bloc': {terms: 'terms_car',					leaflet: '',					policy: 'printInsurancePolicy',		subscription: 'printSubscription',		manual: 'printProductManual',		summary: '',							certificate: 'printFinishCertificate',		label: '자동차보험(일괄)'},
			'bike': {terms: 'terms_bike',					leaflet: '',					policy: 'printInsurancePolicy',		subscription: 'printSubscription',		manual: 'printProductManual',		summary: '',							certificate: 'printFinishCertificate',		label: '이륜자동차보험(오토바이)'},
			'oneday': {terms: 'terms_oneday',				leaflet: 'leaflet_oneday',		policy: 'printInsurancePolicy',		subscription: 'printSubscription',		manual: 'printProductManual',		summary: '',							certificate: 'printFinishCertificate',		label: '원데이보험'},
			'endo': {terms: 'terms_endo',					leaflet: '',					policy: 'printInsurancePolicy',		subscription: 'printSubscription',		manual: 'printProductManual',		summary: '',							certificate: 'printEndoFinishCertificate',	label: '자동차보험', 					changePaper: 'printEndoChangePaper'},
			'driver': {terms: 'terms_mydrive',				leaflet: 'leaflet_myDrive',		policy: 'printInsurancePolicyLong',	subscription: 'printSubscriptionLong',	manual: 'printProductManualLong',	summary: 'printProductSummaryLong',		certificate: '',							label: '운전자보험'},
			'home': {terms: 'terms_mysweethome',			leaflet: 'leaflet_mySweetHome',	policy: 'printInsurancePolicyLong',	subscription: 'printSubscriptionLong',	manual: 'printProductManualLong',	summary: 'printProductSummaryLong',		certificate: '',							label: '주택화재보험'},
			'child': {terms: 'terms_kids',					leaflet: 'leaflet_myKids',		policy: 'printInsurancePolicyLong',	subscription: 'printSubscriptionLong',	manual: 'printProductManualLong',	summary: 'printProductSummaryLong',		certificate: '',							label: '어린이보험'},
			'baby': {terms: 'terms_baby',					leaflet: 'leaflet_myKids',		policy: 'printInsurancePolicyLong',	subscription: 'printSubscriptionLong',	manual: 'printProductManualLong',	summary: 'printProductSummaryLong',		certificate: '',							label: '어린이보험'},
			'childNR': {terms: 'terms_kids_zero',			leaflet: 'leaflet_myKids',		policy: 'printInsurancePolicyLong',	subscription: 'printSubscriptionLong',	manual: 'printProductManualLong',	summary: 'printProductSummaryLong',		certificate: '',							label: '어린이보험(무해지 환급형)'},
			'realLoss': {terms: 'terms_realloss',			leaflet: 'leaflet_realLoss',	policy: 'printInsurancePolicyLong',	subscription: 'printSubscriptionLong',	manual: 'printProductManualLong',	summary: 'printProductSummaryLong',		certificate: '',							label: '실손의료비보험'},
			'cancer': {terms: 'terms_cancer',				leaflet: 'leaflet_cancer',		policy: 'printInsurancePolicyLong',	subscription: 'printSubscriptionLong',	manual: 'printProductManualLong',	summary: 'printProductSummaryLong',		certificate: '',							label: '암보험'},
			'health': {terms: 'terms_health',				leaflet: 'leaflet_health',		policy: 'printInsurancePolicyLong',	subscription: 'printSubscriptionLong',	manual: 'printProductManualLong',	summary: 'printProductSummaryLong',		certificate: '',							label: '건강보험'},
			'dental': {terms: 'terms_dental',				leaflet: 'leaflet_dental',		policy: 'printInsurancePolicyLong',	subscription: 'printSubscriptionLong',	manual: 'printProductManualLong',	summary: 'printProductSummaryLong',		certificate: '',							label: '치아보험'},
			'smartM': {terms: 'terms_smartM',				leaflet: 'leaflet_smartM',		policy: 'printInsurancePolicyLong',	subscription: 'printSubscriptionLong',	manual: 'printProductManualLong',	summary: 'printProductSummaryLong',		certificate: '',							label: 'Smart 맞춤보장보험'},
			'savings': {terms: 'terms_save',				leaflet: '',					policy: 'printInsurancePolicyLong',	subscription: 'printSubscriptionLong',	manual: 'printProductManualLong',	summary: 'printProductSummaryLong',		certificate: '',							label: '저축보험'},
			'annuity': {terms: 'terms_annuity',				leaflet: '',					policy: 'printInsurancePolicyLong',	subscription: 'printSubscriptionLong',	manual: 'printProductManualLong',	summary: 'printProductSummaryLong',		certificate: '',							label: '연금저축보험'},
			'annuityFD': {terms: 'terms_annuityFD',			leaflet: '',					policy: 'printInsurancePolicyLong',	subscription: 'printSubscriptionLong',	manual: 'printProductManualLong',	summary: 'printProductSummaryLong',		certificate: '',							label: '연금저축보험(무배당)'},
			'travel': {
				'indi':	{terms: 'terms_travel',				leaflet: '',					policy: 'printInsurancePolicyGen',	subscription: 'printSubscriptionGen',	manual: '',							summary: '',							certificate: 'printCertificateGen',			label: '해외여행보험'},
				'family':	{terms: 'terms_travel',			leaflet: '',					policy: 'printInsurancePolicyGen',	subscription: 'printSubscriptionGen',	manual: '',							summary: '',							certificate: 'printCertificateGen',			label: '해외여행보험(가족형)'},
				'indiLong':	{terms: 'terms_study',			leaflet: '',					policy: 'printInsurancePolicyGen',	subscription: 'printSubscriptionGen',	manual: '',							summary: '',							certificate: 'printCertificateGen',			label: '유학보험'}
			},
			'travelDomestic': {terms: 'terms_intravel',		leaflet: '',					policy: 'printInsurancePolicyGen',	subscription: 'printSubscriptionGen',	manual: '',							summary: '',							certificate: '',							label: '국내여행보험'},
			'golf': {terms: 'terms_golf',					leaflet: '',					policy: 'printInsurancePolicyGen',	subscription: 'printSubscriptionGen',	manual: '',							summary: '',							certificate: '',							label: '골프보험'},
			'pet': {
				'dog': {terms: 'terms_pet',					leaflet: 'leaflet_pet',			policy: 'printInsurancePolicyGen',	subscription: 'printSubscriptionGen',	manual: '',							summary: '',							certificate: '',							label: '반려견보험'},
				'cat': {terms: 'terms_cat',					leaflet: 'leaflet_cat',			policy: 'printInsurancePolicyGen',	subscription: 'printSubscriptionGen',	manual: '',							summary: '',							certificate: '',							label: '반려묘보험'}
			}			
		},

		/**
		 * 실시간 계좌 이체(RT) 관련 정보
		 * @category 결제
		 * @property rtInfo
		 * @type {Object}
		 */
		rtInfo: {
			// RT 전체 작동여부 
			onair: true,
			// RT 시작시간
			startTimeInfo: {
				value:	'003000',
				desc:	'RT가능 시작시간 HHMMMM'
			},
			// RT 종료시간
			endTimeInfo: {
				value:	'233000',
				desc:	'RT가능 끝시간 HHMMMM'
			},
			// 특정고객 RT 패스
			ableCustIdList: [
				'BA13497569',
				'CA03060626'
			]
		},
		/**
		 * 질병고지 관련 정보
		 * @category 고지
		 * @type {Object}
		 */
		noticeDiseaseInfo: {
			// TODO: dental 에서 사용하는 것 정리하고 제거			
			/**
			 * 질병리스트 값
			 * @category 고지
			 * @type {Array}
			 * @see
			 * 구성
			 * Key | Type | 설명
			 * ---|---|---
			 * id | String | 질병코드. 예) "04038" 
			 * diseaseName | String | 병명. 예) "고혈압"
			 * detailBody | Array | 상세부위 (length가 0이면 null, 1개면 고정값, 2개 이상이면 UI에서 선택값). 예) ['34', '21']
			 * specialQuestion | Array | 각 질병 고유의 특수질문 코드. 예) ['D0590', 'D0600']
			 * 
			 * ! specailQuestion의 값은 서버로 보낼 특수질문지 코드값만 모아둔 항목입니다. (질문지가 아닌 체크박스 값을 넣지 않도록 조심해주세요.)
			 */
			diseaseList: [

				// 추가항목: 염좌, 골절, 요통, 폐렴, 대장용종, 어깨병토, 자궁근종
				{id: '04038', diseaseName: '고혈압',             	detailBody: ['00'],						specialQuestion: ['D0010', 'D0011', 'D0020', 'D0021', 'D0022', 'D0030', 'D0690', 'D0691']},
				{id: '03007', diseaseName: '고콜레스테롤혈증',   	detailBody: ['00'],						specialQuestion: ['D0040', 'D0050', 'D0920', 'D0921', 'D0060', 'D0061', 'D0070']},
				{id: '01003', diseaseName: '골절',           	 	detailBody: ['02', '07', '08', '12', '27', '28', '30', '31', '26', '29', '13', '25', '04', '06', '14', '33', '45', '42'], specialQuestion: ['D0770', 'D0970', 'removedate']},			//removedate는 추가고지사항에 담아서 보내는 값이기에 따로 코드가 없다
				{id: '03032', diseaseName: '갑상선기능저하증',   	detailBody: ['03'],						specialQuestion: ['D0430', 'D0440']},
				{id: '03033', diseaseName: '갑상선기능항진증',   	detailBody: ['03'],						specialQuestion: ['D0300', 'D0301', 'D0310', 'D0311', 'D0320', 'D0330']},
				{id: '07021', diseaseName: '대장용종',           	detailBody: ['11'],						specialQuestion: ['D0780', 'D950', 'D960']},
				{id: '02004', diseaseName: '위염',               	detailBody: ['34'],						specialQuestion: ['D0590', 'D0600']},
				{id: '02015', diseaseName: '위식도역류질환',     	detailBody: ['34', '21'],				specialQuestion: ['D0710']},
				{id: '08010', diseaseName: '자궁근종',           	detailBody: ['38'],						specialQuestion: ['D0550', 'D0760']},
				{id: '08007', diseaseName: '신장(요로)결석',     	detailBody: ['15'],						specialQuestion: ['D0200', 'D0210', 'D0220', 'D0230']},
				{id: '01005', diseaseName: '어깨병터(어깨통증)', 	detailBody: ['30', '27'],				specialQuestion: []},

				// {id: '01042', diseaseName: '염좌(삠) - 척추',       detailBody: ['00'],						specialQuestion: ['D0410']},
				// {id: '01041', diseaseName: '염좌(삠) - 척추 제외',  detailBody: ['00'],						specialQuestion: ['D0400']},
				{id: '01006', diseaseName: '염좌',  				detailBody: ['02', '07', '08', '12', '27', '28', '30', '31', '26', '29', '13', '25', '04', '06', '14', '33', '45', '42'], specialQuestion: []},
				
				{id: '01023', diseaseName: '요통',           		detailBody: ['06', '14', '33'],						specialQuestion: []},
				{id: '01020', diseaseName: '추간판탈출증(디스크)',  detailBody: ['04', '14', '33', '45'],	specialQuestion: ['D0120']},
				{id: '09009', diseaseName: '백내장',            	detailBody: ['24'],						specialQuestion: ['D0130', 'D0140', 'D0141', 'D0150', 'D0151']},
				{id: '05005', diseaseName: '폐렴',           		detailBody: ['09'],						specialQuestion: []},
				{id: '11001', diseaseName: '기타질환1',         	detailBody: ['00'],							specialQuestion: []},
				{id: '11002', diseaseName: '기타질환2',         	detailBody: ['00'],							specialQuestion: []},
				
				// {id: '02030', diseaseName: 'B형간염',           detailBody: ['01'],						specialQuestion: []},
				// {id: '02033', diseaseName: '간기능이상',        detailBody: ['01'],						specialQuestion: []},
				// {id: '02003', diseaseName: '소화성궤양',        detailBody: ['34'],						specialQuestion: []},
				
				// {id: '03013', diseaseName: '당부하부전',        detailBody: ['00'],						specialQuestion: []},
				// {id: '08033', diseaseName: '자궁내막증식증',    detailBody: ['38'],						specialQuestion: []},
				// {id: '09005', diseaseName: '녹내장',            detailBody: ['24'],						specialQuestion: ['D0160', 'D0170', 'D0171', 'D0180', 'D0181', 'D0190']},


				//dental
				{ id: '09058', diseaseName: '풍치', detailBody: [], specialQuestion: [] },
				{ id: '09059', diseaseName: '치아결손', detailBody: [], specialQuestion: [] },
				{ id: '09061', diseaseName: '치주농양', detailBody: [], specialQuestion: [] },
				{ id: '09062', diseaseName: '기타 치과질환', detailBody: [], specialQuestion: [] },
				{ id: '09063', diseaseName: '치아우식증', detailBody: [], specialQuestion: [] },
				{ id: '09064', diseaseName: '치아흔들림', detailBody: [], specialQuestion: [] },
				{ id: '09065', diseaseName: '치은염', detailBody: [], specialQuestion: [] },
				{ id: '09066', diseaseName: '치근단염', detailBody: [], specialQuestion: [] },
				{ id: '09067', diseaseName: '치수염', detailBody: [], specialQuestion: [] },
				{ id: '09070', diseaseName: '치통', detailBody: [], specialQuestion: [] },
				{ id: '09071', diseaseName: '치아파절', detailBody: [], specialQuestion: [] }




			],
			/**
			 * 질병공통 질문코드
			 * @type {Array}
			 */
			commonQuestion: ['U0002', 'U0003', 'U0004', 'U0005', 'U0006', 'D0007', 'D0008', 'D0009', 'U0010', 'U0012'],

			/**
			 * 드롭다운 listValue(날짜드롭다운 제외)
			 * @type {Object}
			 * `code: [{ value: '1', label: '치료중(검진중' }, ...]` 형태
			 */
			diseaseDropdownList: {
				//치료상황 목록
				U0002: [
					{value: '1', label: '치료중(검진중)'},
					{value: '2', label: '치료종료 후 정기검진 중'},
					{value: '3', label: '완치(검진 및 진료없음)'}
				],
				// 입원 기간 목록
				U0006: [
					{value: '00', label: '치료 사실 없음'},
					{value: '01', label: '1주 이하'},
					{value: '02', label: '1~2주 이하'},
					{value: '03', label: '2~3주 이하'},
					{value: '04', label: '3~4주 이하'},
					{value: '05', label: '1~2개월 이하'},
					{value: '06', label: '2~12개월 이하'},
					{value: '07', label: '12개월 초과'}
				], 
				// 통원 횟수 목록
				D0007: [
					{value: '00', label: '없음'},
					{value: '01', label: '1회'},
					{value: '02', label: '2회'},
					{value: '03', label: '3회'},
					{value: '04', label: '4회'},
					{value: '05', label: '5회'},
					{value: '06', label: '5회 초과'}
				], 
				// 재발 여부 목록
				U0010: [
					{value: '0', label: '없음'},
					{value: '1', label: '1회'},
					{value: '2', label: '2회 이상'}
				],
				///////// 특수질문항목 /////////
				D0040: [
					{value: 'D0041', label: '복용중'},  
					{value: 'D0042', label: '복용중단'},
					{value: 'D0043', label: '복용한적없음'}
				],
				D0050: [
					{value: 'D0051', label: '6개월 미만'},  
					{value: 'D0052', label: '6개월 이상'} 
				],
				D0070: [
					{value: 'D0071', label: '정상'},  
					{value: 'D0072', label: '비정상'} 
				],
				D0590: [
					{value: 'D0591', label: '없음'},  
					{value: 'D0592', label: '있음'} 
				],
				D0710: [
					{value: 'D0711', label: '예'},  
					{value: 'D0712', label: '아니오'}, 
					{value: 'D0713', label: '모름'} 
				],
				D0430: [
					{value: 'D0431', label: '정상'},  
					{value: 'D0432', label: '비정상'} 
				],
				D0440: [
					{value: 'D0441', label: '6개월미만'},  
					{value: 'D0442', label: '6개월~1년'}, 
					{value: 'D0443', label: '1년이상'}, 
					{value: 'D0444', label: '모름'} 
				],
				D0320: [
					{value: 'D0321', label: '정상'},  
					{value: 'D0322', label: '비정상'} 
				],
				D0130: [
					{value: 'D0131', label: '왼쪽 눈'},  
					{value: 'D0132', label: '오른쪽 눈'},  
					{value: 'D0133', label: '양쪽 눈'}  
				],
				D0190: [
					{value: 'D0191', label: '있음'},
					{value: 'D0192', label: '없음'}
				],
				D0210: [
					{value: 'D0211', label: '양측성'},
					{value: 'D0212', label: '일측성'}
				],
				D0220: [
					{value: 'D0221', label: '있음'},
					{value: 'D0222', label: '없음'},
					{value: 'D0223', label: '모름'}
				],
				D0780: [
					{value: 'D0782', label: '있음'},
					{value: 'D0781', label: '없음'}			
				],
				D950: [
					{value: 'D951', label: '1회'},
					{value: 'D952', label: '2회'},
					{value: 'D953', label: '3회'},
					{value: 'D954', label: '4회 이상'}
				],
				D960: [
					{value: 'D961', label: '1~3개'},
					{value: 'D962', label: '4~10개'},
					{value: 'D963', label: '11개 이상'}
				],
				D0550: [
					{value: 'D0551', label: '없음'},
					{value: 'D0552', label: '있음'}
				],
				D0760: [
					{value: 'D0761', label: '근종용해술'},
					{value: 'D0762', label: '근종절제술'},
					{value: 'D0763', label: '자궁동맥색전술'},
					{value: 'D0764', label: '자궁절제술'},
					{value: 'D0765', label: '기타'}
				],
				D0410: [
					{value: 'D0411', label: '3회 미만'},
					{value: 'D0412', label: '3회 이상'}
				],
				D0400: [
					{value: 'D0401', label: '3회 미만'},
					{value: 'D0402', label: '3회 이상'}
				],
				D0770: [
					{value: 'D0771', label: '1회'},
					{value: 'D0772', label: '2회 이상'}
				],
				D0970: [
					{value: 'D0972', label: '예(현재 핀삽입 유지중)'},
					{value: 'D0973', label: '예(핀제거 완료)'},
					{value: 'D0971', label: '아니오'}
				]

			},

			/**
			 * 질병별 드롭다운 생성해야하는 곳 ID 리스트 가져옴
			 * @param {String} diseaseID 질병ID
			 * @return {Array} Dropdown 목록에 사용할 label, value 배열
			 */
			getTotalDropdown: function(diseaseID) {
				// 기본 드롭다운 항목
				var dropdownList = [
					'U0002',
					'U0010',
					'U0005-Y',
					'U0005-M',
					'U0005-D',
					'U0006',
					'D0007',
					'D0008-Y',
					'D0008-M',
					'D0008-D',
					'D0009-Y',
					'D0009-M',
					'D0009-D'
				]
				var mergeData = [];
				// 특수 항목 드롭다운 생성
				switch (diseaseID) {
					case '04038': // 고혈압
						mergeData = [
							'D0011-Y',
							'D0011-M'
						];
						break;
					case '03007': // 고콜레스테롤혈증
						mergeData = [
							'D0040',
							'D0050',
							'D0061-Y',
							'D0061-M',
							'D0070'
						];
						break;
					case '01003': // 골절
						mergeData = [
							'D0770',
							'D0970',
							'D960',
							'removedate-Y',
							'removedate-M'
						];
						break;

					case '07021': // 대장용종
						mergeData = [
							'D0780',
							'D950',
							'D960'
						];
						break;
					case '02004': // 위염
						mergeData = [
							'D0590'
						];
						break;
					case '02015': // 위식도역류
						mergeData = [
							'D0710'
						]
						break;
					case '08010': // 자궁근종
						mergeData = [
							'D0550',
							'D0760'
						]
						break;
					case '03032': // 갑상선기능저하증
						mergeData = [
							'D0430',
							'D0440'
						]
						break;
					case '03033': // 갑상선기능항진증
						mergeData = [
							'D0301-Y',
							'D0301-M',
							'D0311-Y',
							'D0311-M',
							'D0320'
						]
						break;
					case '09009': // 백내장
						mergeData = [
							'D0130'
						]
						break;

					case '09005': // 녹내장
						mergeData = [
							'D0190'
						];
						break;

					case '08007': // 요로결석
						mergeData = [
							'D0210',
							'D0220'
						];
						break;
					case '01042': // 염좌(삠) - 척추
						mergeData = [
							'D0410'
						]
						break;
					case '01041': // 염좌(삠) - 척추제외
						mergeData = [
							'D0400'
						]
						break;
					default:

						break;
				}
				// 특수항목 리스트 합치기
				dropdownList = dropdownList.concat(mergeData);
				return dropdownList;
			}

		},
		/**
		 * 은행 장애 정보
		 * @category 결제
		 * @property bankBreakDownList
		 * @type {Array}
		 * @see
		 * 항목 구성
		 * Key | Type | 설명 | 예
		 * ---|---|---|---
		 * type | String | 비교타입 | "*" 
		 * code | String | 비교은행 코드 | "*"
		 * startDate | String | 시작 날짜시간 | "201612160000"
		 * endDate | String | 종료 날짜시간 | "201612160300"
		 * isSelectable | Boolean | 선택 가능 여부 | false
		 * message | String | 안내 메시지 | "고객님께 안내..."
		 */
		bankBreakDownList: [
			{
				type: '*',						// 비교타입
				code: '*',						// 비교은행 코드
				startDate: '201612160000',		// 시작
				endDate: '201612160300',		// 종료
				isSelectable: false,			// 선택 가능여부
				message: '고객님께 안내드립니다.금결원 시스템 개선 작업으로 아래 시간 동안 실시간 계좌이체가 불가합니다.신용카드 결제를 이용하시거나, 아래 시간 이후에 다시 방문해 주세요.▷ 중단 예정시간 : 12.16일(금요일) 새벽 0시~3시'
			},
			{
				type: 'RT',						// 비교타입
				code: '020',					// 은행코드
				startDate: '201805050000',		// 시작
				endDate: '201805072400',		// 종료
				isSelectable: false,			// 선택 가능여부
				message: "★★ 우리은행 서비스 일시 중단 안내 ★★<br/><br/>우리은행 시스템 개선작업으로 아래와 같이 보험료 결제가 일시 중단 됨을 안내해 드립니다.<br/>우리은행을 이용하시는 고객님께서는 다른 은행 계좌를 이용하시거나,<br/>아래 시간 이후에 다시 방문해 주세요.<br/><br/>▷ 중단 예정시간 : '18.5.5(토) 00시 ~ '18.5.7(월) 24시'"
			},
			{
				type: 'PG',
				code: '020',
				startDate: '201805050000',
				endDate: '201805072400',
				isSelectable: false,			// 선택 가능여부
				message: "★★ 우리은행 서비스 일시 중단 안내 ★★<br/><br/>우리은행 시스템 개선작업으로 우리은행 계좌 등록이 일시 중단됩니다.<br/>우리은행을 이용하시는 고객님께서는 다른 은행 계좌를 이용하시거나,<br/>아래 시간 이후에 다시 방문해 주세요.<br/><br/>▷ 중단 예정시간 : '18.5.5(토) 00시 ~ '18.5.7(월) 24시'"
			},
			{
				type: 'RT',
				code: '005',
				startDate: '201606080000',
				endDate: '999912310000',
				isSelectable: false,			// 선택 가능여부
				message: '고객님께 안내드립니다.외환은행은 하나은행으로 통합되었습니다.<br/>기존 외환은행 계좌를 이용하시려면<br/>하나은행을 선택하신 후 진행해 주세요.'
			},
			{
				type: 'PG',
				code: '005',
				startDate: '201606080000',
				endDate: '999912310000',
				isSelectable: false,			// 선택 가능여부
				message: '고객님께 안내드립니다.외환은행은 하나은행으로 통합되었습니다.<br/>기존 외환은행 계좌를 이용하시려면<br/>하나은행을 선택하신 후 진행해 주세요.'
			},
			{
				type: 'PG',
				code: '034',
				startDate: '201611070000',
				endDate: '201611092400',
				isSelectable: false,			// 선택 가능여부
				message: "★★ 아래 시간 동안 광주은행 결제가 불가능합니다! ★★광주은행의 시스템 개선작업으로 아래와 같이<br/>보험료 결제가 일시 중단 됨을 안내해 드립니다.광주은행을 이용하시려는 고객님께서는 아래의 시간 동안<br/>다른 은행을 이용하시거나, 아래 시간 이후에 다시 방문해 주세요.▷ 중단 예정시간 : 11.7일(월) <font letterspacing='0'>00:00 ~ 11.9일(수)24:00까지</font>'"
			},
			{
				type: 'RT',
				code: '034',
				startDate: '201611070000',
				endDate: '201611092400',
				isSelectable: false,			// 선택 가능여부
				message: "★★ 아래 시간 동안 광주은행 결제가 불가능합니다! ★★광주은행의 시스템 개선작업으로 아래와 같이<br/>보험료 결제가 일시 중단 됨을 안내해 드립니다.광주은행을 이용하시려는 고객님께서는 아래의 시간 동안<br/>다른 은행을 이용하시거나, 아래 시간 이후에 다시 방문해 주세요.▷ 중단 예정시간 : 11.7일(월) <font letterspacing='0'>00:00 ~ 11.9일(수)24:00까지</font>'"
			}
			// 아래태스트하려면쓰세요
			// {
			// 	type: "RT",
			// 	code: "01",
			// 	startDate: "201611070000",
			// 	endDate: "202011092400",
			// 	isSelectable: false,			// 선택 가능여부
			// 	message: "★★ 아래 시간 동안 광주은행 결제가 불가능합니다! ★★광주은행의 시스템 개선작업으로 아래와 같이<br/>보험료 결제가 일시 중단 됨을 안내해 드립니다.광주은행을 이용하시려는 고객님께서는 아래의 시간 동안<br/>다른 은행을 이용하시거나, 아래 시간 이후에 다시 방문해 주세요.▷ 중단 예정시간 : 11.7일(월) <font letterspacing='0'>00:00 ~ 11.9일(수)24:00까지</font>'"
			// },
		],

		/**
		 * 카드 장애 정보
		 * @category 결제
		 * @property cardBreakDownList
		 * @type {Array}
		 * @see
		 * 항목 구성
		 * Key | Type | 설명 | 예
		 * ---|---|---|---
		 * code | String | 카드 코드 | "08"
		 * startDate | String | 시작 날짜시간 | "201612160000"
		 * endDate | String | 종료 날짜시간 | "201612160300"
		 * isSelectable | Boolean | 선택 가능 여부 | false
		 * message | String | 안내 메시지 | "고객님께 안내..."
		 */
		cardBreakDownList: [
			{
				code: '08',					// 카드코드
				startDate: '201611070000',	// 시작
				endDate: '201611092400',	// 종료
				isSelectable: true,			// 선택 가능여부
				message: "★★ 농협카드(체크) 이용이 불가능합니다! ★★ 농협의 시스템 개선작업으로 해당 카드로는 보험료 결제가 일시 중단됨을 안내해 드립니다.(단, 일반신용카드는 사용 가능하며, 체크카드의 사용이 중단됩니다.)농협체크카드를 사용하시려는 고객께서는 다른 결제수단을 이용하시거나, 아래 시간 이후에 다시 방문해 주세요.▷ 중단 예정시간: 1.27일(금) <font letterspacing='0'>00</font>시 ~ 1.30일(월) <font letterspacing='0'>24</font>시"
			}
			// 아래태스트하려면쓰세요
			// {
			// 	code:"01",					// 카드코드
			// 	startDate: "201611070000",	// 시작
			// 	endDate: "202011092400",	// 종료
			// 	isSelectable: true,			// 선택 가능여부
			// 	message: "★★ 농협카드(체크) 이용이 불가능합니다! ★★ 농협의 시스템 개선작업으로 해당 카드로는 보험료 결제가 일시 중단됨을 안내해 드립니다.(단, 일반신용카드는 사용 가능하며, 체크카드의 사용이 중단됩니다.)농협체크카드를 사용하시려는 고객께서는 다른 결제수단을 이용하시거나, 아래 시간 이후에 다시 방문해 주세요.▷ 중단 예정시간: 1.27일(금) <font letterspacing='0'>00</font>시 ~ 1.30일(월) <font letterspacing='0'>24</font>시",
			// },
		],

		/**
		 * 최근계산기록보기 노출시킬 이벤트코드 목록
		 * @category 이벤트
		 * @type {Array}
		 * @see
		 * 구성
		 * Key | Type | 설명
		 * ---|---|---
		 * value | String | 코드값
		 */		
		savedListVisibleEventCodes: [
			{ value: 'A_A_001' } // 예시임
		],

		/** 
		 * 다이렉트 가입불가 직업 리스트
		 * @category 직업
		 * @type {Array}
		 * @see
		 * 직업코드(String) 배열
		 */ 
		impossibleJobList: [
			'622106',	// 보험설계사(타사)
			'622108'	// 보험대리점(타사)
		],
		/**
		 * 영업용만 선택 가능한 직업 리스트
		 * @category 직업
		 * @type {Array}
		 * @see
		 * 직업코드(String) 배열
		 */
		bizJobList: [
			'736211',	// 영업용택시운전기사
			'736212',	// 개인택시(모범)운전기사
			'736214',	// 영업용승용차운전자(일반택시)
			'736215',	// 영업용승용차운전자(개인택시)
			'736224',	// 대리운전기사
			'736236',	// 영업용승합차운전자(26인승이상)
			'736237',	// 영업용승합차운전자(11-25인승)
			'736238',	// 영업용화물차운전자(2.5톤이상)
			'736248',	// 영업용화물차운전자(2.5톤미만)
			'736330',	// 적재용차량운전원
			'736414',	// 영업용콜밴운전자
			'736415',	// 영업용렉카차운전자
			'873299',	// 영업용특수차운전자(렉카차 제외) (20190401 추가)
			'873339'	// 일반건설기계운전자(영업용) (20190401 추가)
		],
		/**
		 * 자가용만 선택 가능한 직업 리스트 (운전안함은 선택 못함)
		 * @category 직업
		 * @type {Array}
		 * @see
		 * 직업코드(String) 배열
		 */
		indiJobList: [
			'736246',	// 광산왕복차운전기사
			'A31211',	// 소방사(운전분야)
			'330193',	// 구급차운전원
			'530220',	// 자동차경주선수(카레이서)
			'530221',	// 오토바이경주선수(모터싸이클레이싱)
			'736221',	// 일반승용차운전기사
			'736225',	// 자가용승합차운전자(11-25인승)
			'736230',	// 자가용승용차운전자
			'736240',	// 자가용승합차운전자(26인승이상)
			'736251',	// 자동차대여원(운전직)
			'736252',	// 렌터카운전원
			'736411',	// 긴급자동차운전자(앰블란스)
			'736412',	// 각종차량시운전자
			'736413',	// 법인장기임대렌트카운전자
			'736223',	// 우편배달차운전기사
			'736226',	// 자가용화물차운전자(2.5톤이상)
			'736227',	// 자가용화물차운전자(2.5톤미만)
			'736242',	// 유조차량운전기사
			'736243',	// 트레일러트럭운전기사
			'736410',	// 렉카차(견인차)운전기사
			'736418',	// 자가용렉카차운전자
			'736500',	// 폭발물,인화물차량운전자및정기탑승자
			'640514',	// 물품배달원
			'640518',	// 음식,음료,신문등배달원(이륜차)
			'736228',	// 오토바이운전자
			'736244',	// 덤프트럭운전기사
			'736245',	// 레미콘차량운전기사
			'736247',	// 콘크리트펌프카운전기사
			'736311',	// 굴삭기운전기사
			'736312',	// 불도저운전기사
			'736313',	// 준설기운전기사
			'736315',	// 도로정지기운전기사
			'736316',	// 도로포장기운전기사
			'736317',	// 터널굴착기운전기사
			'736321',	// 브리지크레인운전기사
			'736322',	// 타워크레인운전기사
			'736323',	// 이동크레인운전기사
			'736324',	// 호이스트운전기사
			'736330',	// 적재용차량운전원
			'736331',	// 지게차운전원
			'736501'	// 항타기운전원
		],
		/**
		 * 자가용/영업용 둘다 선택 가능한 직업 리스트
		 * @category 직업
		 * @type {Array}
		 * @see
		 * 직업코드(String) 배열
		 */
		indiBizJobList: [
			'736242',	// 유조차량운전기사
			'736243',	// 트레일러트럭운전기사
			'736244',	// 덤프트럭운전기사
			'736245',	// 레미콘차량운전기사
			'736247',	// 콘크리트펌프카운전기사
			'736311',	// 굴삭기운전기사
			'736312',	// 불도저운전기사
			'736313',	// 준설기운전기사
			'736315',	// 도로정지기운전기사
			'736316',	// 도로포장기운전기사
			'736317',	// 터널굴착기운전기사
			'736321',	// 브리지크레인운전기사
			'736322',	// 타워크레인운전기사
			'736323',	// 이동크레인운전기사
			'736500',	// 폭발물,인화물 차량운전자 및 정기탑승자
			'736501'	// 항타기 운전원
		],

		/**
		 * 선택형 가입 불가능한 직업 리스트
		 * @category 직업
		 * @type {Array}
		 * @see
		 * 직업코드(String) 배열
		 */
		deductImpossibleJobList: [
			'213133',	// 항만건설토목기술자
			'323003',	// 의료코디네이터
			'510322',	// 관현악단지휘자
			'510332',	// 무용가
			'522211',	// 영화배우
			'522216',	// 임시고용배우
			'522226',	// 방송·영화연출 보조원
			'530216',	// 운동 선수(격투기 제외,장비 착용)
			'602352',	// 대금사업자
			'623214',	// 스튜어드
			'632303',	// 장의사종업원
			'632924',	// 점술관련종업원
			'633211',	// 푸드코디네이터
			'640213',	// 가사쇼핑대행원
			'731104',	// 석재재단및완성원
			'731353',	// 선박배관원
			'731357',	// 플랜트 배관공
			'734114',	// 카메라수리원
			'734116',	// 휴대폰 수리원
			'736418',	// 자가용렉카차운전자
			'900105',	// 수리 및 정비 관련업체 사무직 관리자
			'931532',	// 원심분리기조작원
			'932316',	// 고무캘린더기조작원
			'932694',	// 끈제조기조작원
			'932825',	// 포도주제조장치조작원
			'934332',	// 목재선반조정원
			'A31207',	// 특수공무원(경호원)
			'B90002'	// 체육대학대학원생
		],
		/**
		 * 위험직군 직업 리스트
		 * @category 직업
		 * @type {Array}
		 * @see
		 * 직업코드(String) 배열
		 */
		dangerJobList: [
			'223240',	// 경비행기,헬기,테스트조종사
			'223611',	// 선박기관사
			'223612',	// 선장
			'223613',	// 항해사
			'522217',	// 스턴트맨
			'522393',	// 곡예사, 차력사
			'522394',	// 동물 조련사
			'530214',	// 아마추어경주선수
			'530215',	// 전문산악인
			'530218',	// 경륜 선수(싸이클 레이싱)
			'530220',	// 자동차 경주 선수(카레이서)
			'530221',	// 오토바이경주선수(모터싸이클 레이싱)
			'530222',	// 오지 탐험가
			'530229',	// 경마 선수(기수)
			'530230',	// 경정 선수(모터보트 레이싱)
			'623231',	// 선박사무장
			'633142',	// 선박조리사
			'634101',	// 선박승무원
			'635216',	// 해난구조원
			'640332',	// 건물외부청소원
			'731431',	// 건물외벽청결원
			'736246',	// 광산왕복차운전기사
			'736401',	// 갑판장
			'736402',	// 갑판원
			'736405',	// 바지선선원
			'736412',	// 각종차량 시운전자
			'833021',	// 내수면어부
			'833022',	// 연안어부
			'833023',	// 해녀
			'833024',	// 잠수부
			'833030',	// 원양어업종사원
			'834111',	// 굴착기조작원
			'834112',	// 착암기조작원
			'834113',	// 채광기조작원
			'834201',	// 광원
			'834202',	// 채석원
			'834203',	// 광업골조공
			'834300',	// 점화및발파원
			'841400',	// 어업관련단순노무자
			'842000',	// 광업관련단순노무자
			'A21221',	// 경찰(경사/경장)-교통
			'A21225',	// 해양경찰(경사/경장)
			'A31201',	// 순경-교통
			'A31205',	// 해양경찰(순경)
			'A31215',	// 경찰특공대원
			'223314',	// 도료및비누제품기능자
			'731223',	// 보도블럭설치원
			'731231',	// 거푸집설치원
			'731233',	// 시멘트혼합및완성원
			'731254',	// 무대목수
			'731355',	// 관부설원
			'731419',	// 기타 건물도장 및 관련기능원
			'732113',	// 금속주입원
			'732119',	// 기타 금속 주형/모형 제조원
			'732139',	// 기타 구조금속 준비/건립원
			'732211',	// 신선원
			'733229',	// 기타 공업용 기계설치/정비원
			'733341',	// 전신/전화설치원(옥외)
			'733343',	// 전신/전화수리원(옥외)
			'734213',	// 도자기녹로원
			'734215',	// 유약처리원
			'736313',	// 준설기운전기사
			'736314',	// 항타기조작원
			'740105',	// 건물건축운반인부
			'740215',	// 이사짐운반원
			'820300',	// 광업 기술자
			'831529',	// 기타 가축 사육자
			'831530',	// 가금사육자
			'832013',	// 벌목원
			'841102',	// 과수작물관련단순노무자
			'931212',	// 제강로조작원
			'931251',	// 금속인발기조작원
			'931252',	// 금속압출기조작원
			'931314',	// 유리인발기조작원
			'931414',	// 목재처리기조작원
			'931419',	// 기타 목재가공장치 조작원
			'931420',	// 펄프제조장치조작원
			'931433',	// 조성장치조작원
			'931521',	// 조제장치조작원
			'931524',	// 시멘트가공로조작원
			'932116',	// 프레스기및전단기조작원
			'932234',	// 금속분무기조작원
			'932235',	// 금속완성용기계조작원
			'932311',	// 타이어경화기조작원
			'932316',	// 고무캘린더기조작원
			'932401',	// 목공선반조작원
			'932409',	// 기타 목재용 기계조작원
			'932991',	// 주입,포장 및 봉함기 조작원
			'934339',	// 기타 목재공작기 조정원
			'A21112',	// 위관급장교(특수부대)
			'B31005'	// 남자무직
		],
		/**
		 * 비용손해 제한 직업 리스트
		 * @category 직업
		 * @type {Array}
		 * @see
		 * 직업코드(String) 배열
		 */
		costLossJobList: [
			'330193',	// 구급차운전원
			'736211',	// 영업용택시운전기사
			// '736212',	// 개인택시(모범)운전기사		// 20190826 제외 (최유리 책임)
			'736214',	// 영업용승용차운전자일반택시
			// '736215',	// 영업용승용차운전자개인택시	// 20190826 제외 (최유리 책임)
			'736224',	// 대리운전기사
			'736410',	// 렉카차운전기사
			'736411',	// 긴급자동차운전자(앰블란스)
			'736412',	// 각종차량시운전자
			'736414',	// 영업용콜밴운전자
			'736415',	// 영업용렉카차운전자
			'736418'	// 자가용렉카차운전자
		],
		/**
		 * 비급여 담보 제한 직업 리스트
		 * @category 직업
		 * @type {Array}
		 * @see
		 * 직업코드(String) 배열
		 */
		nonPaymentJobList: [
			'842000',	// 광업관련단순노무자
			'834300',	// 점화및발파원
			'530215',	// 전문산악인
			'530228',	// 운동 선수(격투기 제외,장비 비착용)
			'530217',	// 운동선수(격투기)
			'530216',	// 운동 선수(격투기 제외,장비 착용)
			'530218',	// 경륜 선수(싸이클 레이싱)
			'530229',	// 경마 선수(기수)
			'530221',	// 오토바이경주선수(모터싸이클 레이싱)
			'530230',	// 경정 선수(모터보트 레이싱)
			'530220',	// 자동차 경주 선수(카레이서)
			'622106',	// 보험설계사(타사)
			'841400',	// 어업관련단순노무자
			'833022',	// 연안어부
			'833030',	// 원양어업종사원
			'833021',	// 내수면어부
			'833024',	// 잠수부
			'833023',	// 해녀
			'832013',	// 벌목원
			'841300',	// 임업관련단순노무자
			'530222',	// 오지 탐험가
			'522393',	// 곡예사, 차력사
			'522217',	// 스턴트맨
			'622108',	// 보험대리점(타사)
			'300901',	// 병원사무장
			'132242',	// 병원접수원
			'432969',	// 레저관련종사원
			'833026',	// 염전생산 종사원
			'630149',	// 양식원(내륙)
			'630159',	// 양식원(바다)
			'774119',	// 광원/채석원 및 석재 절단원
			'843419',	// 광석 및 석제품 가공기 조작원
			'875019',	// 굴착기·착암기 및 채광기 조작원
			'875029',	// 시추장비 조작원
			'B33019'	// 무직(직업종사자 제외)
		],
		/**
		 * 소아 직업 리스트 (만11세 이하)
		 * @category 직업
		 * @type {Array}
		 * @see
		 * 직업코드(String) 배열
		 */
		childrenJobList: [
			'B60000',	// 미취학아동
			'B50000'	// 초등학생
		],
		/**
		 * 미성년 직업 리스트 (만15세 이하)
		 * @category 직업
		 * @type {Array}
		 * @see
		 * 직업코드(String) 배열
		 */
		studentJobList: [
			'B60000',	// 미취학아동
			'B50000',	// 초등학생
			'B40000',	// 중학생
			'B33000',	// 고등학생
			'B20002',	// 대학생(2-3년제)
			'B20001',	// 대학생(4-6년제)
			'B10001',	// 대학원생(박사과정)
			'B10002',	// 대학원생(석사과정)
			'B34000',	// 학원생
			'A22001',	// 사관학교생도
			'B90003',	// 특수학교학생
			'B90004',	// 체육학교학생
			'B20003',	// 항공대학생(비행기및정비관련학과)
			'A22002',	// 경찰대학생
			'B90002'	// 체육대학대학원생
		],

		/**
		 * 리아아트(명절, 크리스마스 등에 사용할 메인화면 디자인) 적용 정보
		 * @category 이벤트
		 * @type {Array}
		 * @see
		 * 항목 object 구성
		 * Key | Type | 설명
		 * ---|---|---
		 * name | String | 이름
		 * products | Array | 적용상품 divisionName 배열.
		 * device | Array | 적용 기기 종류 배열. 예) ['PC'], ['PC', 'MO']
		 * server | Array | 적용 서버 종류 배열. 예) ['local', 'dev']
		 * url | String | 이미지 URL
		 * startDate | Integer | 적용 시작 날짜/시간. 예) 201902010000
		 * endDate | Integer | 적용 종료 날짜/시간. 예) 201902071000
		 * ignoreType | Array | 적용 무시할 타입 배열. 이 배열에 있는 타입으로 들어온 경우 리아아트 적용 안함.
		 */
		riaArtInfo: [
			{
				name: '2019신년리아아트',
				products: ['car'],
				device: ['PC'],
				server: ['local', 'dev', 'test', 'www'],
				url: '/ria/common/image/riaart_201902.png?20190201',
				startDate: 201902010000,
				endDate: 201902071000,
				ignoreType: [
					'AX_J_002',
					'AX_J_008',
					'AX_J_011',
					'AX_J_012',
					'AX_J_018',
					'AX_J_055',
					'AX_J_056',
					'A_J_100',
					'A_J_101',
					'A_J_102',
					'A_J_103',
					'A_J_227'
				]
			}
		],

		/**
		 * 자동차 원데이 이벤트 정보
		 * @category 이벤트
		 * @type {Array}
		 * @see
		 * 항목 object 구성
		 * Key | Type | 설명
		 * ---|---|---
		 * goodsKo | String | 상품명(한글). 예) "모바일 주유권 1만원"
		 * goodsImg | String | 상품이미지 파일명. 예) "comm-oneday-goods.png"
		 * startDate | Integer | 이벤트 시작일. 예) 201812190900
		 * startDate | Integer | 이벤트 종료일. 예) 201812182359
		 */
		carOnedayEventInfo: [
			/*{
				goodsKo: '모바일 주유권 1만원',// 12월18일 반영시 ~ 24시 (1만원)
				goodsImg: 'comm-oneday-goods-10000.png',
				startDate: 201812111700,
				endDate: 201812182359
			},
			{
				goodsKo: '모바일 주유권 2만원', // 12월19일 09시 ~ 24시 (2만원)
				goodsImg: 'comm-oneday-goods.png',
				startDate: 201812190900,
				endDate: 201812192359
			}*/
			{
				goodsKo: '모바일 주유권 1만원', // 12월18일 반영시 ~ 24시 (1만원)
				goodsImg: 'comm-oneday-goods-10000.png',
				startDate: 201901070900,
				endDate: 201901312359
			},
			{
				goodsKo: '모바일 주유권 1만원', // 12월18일 반영시 ~ 24시 (1만원)
				goodsImg: 'comm-oneday-goods-10000.png',
				startDate: 201902070900,
				endDate: 201902261859
			}
		],
		/**
		 * 상시 이벤트 정보 
		 * @category 이벤트
		 * @param  {String}      inFilter all: 전상품정보, code: 진행 중 이벤트 코드 
		 * @return {Object}               이벤트정보
		 * @example
		 * ```js
		 * if (sfd.listValue.baseEventInfo('code') == 'SSGPAY') {
		 *    ...
		 * }
		 * ```
		 */
		baseEventInfo: function(inFilter) {
			var r = null;
			var divisionName = sfd.data.dataObject.divisionName;
			var eventInfo = [
				/*{
					divisionName: 'car',
					code: 'SSGPAY',
					startDate: '2019070100',
					endDate: '2019073100'
				}*/
			]
			if ( inFilter == 'all' ) {
				return eventInfo;
			}
			var sysInt = parseInt( sfd.data.dataObject.sysdate + sfd.data.dataObject.systime.substr(0, 2) );
			$.each(eventInfo, function(i, item) {
				var startInt = parseInt(item.startDate);
				var endInt = parseInt(item.endDate);
				if ( item.divisionName == divisionName && 
					 sysInt >= startInt && 
					 sysInt < endInt) {
 					r = item;
					return false;
				}
			});
			// SSGPAY이벤트 대상자인 경우 개인&30만원이상 체크 
			if (r && r.code == 'SSGPAY') {
				if (sfd.data.dataObject.subDivision == 'corp') {
					r = null;
				}
				if (parseInt(sfd.data.dataObject.firstReceivePremium) < 300000) {
					r = null;
				}
			}
			if (r && inFilter == 'code') {
				r = r.code;
			}
			return r;
		},
		/**
		 * 카드결제이벤트 정보
		 * @category 이벤트
		 * @param {String} [val] 모든 이벤트 정보 얻고 싶은 경우 "all"로 지정.
		 * @return {Object} 카드결제 이벤트 정보
		 * 구성
		 * Key | Type | 설명
		 * ---|---|---
		 * type | String | 카드 종류. ex) "hyundaiCard", "samsungCard"
		 * startDate | String | 시작 날짜. YYYYMMDD 형식
		 * endDate | String | 종료 날짜. YYYYMMDD 형식
		 * passValue | String | 뭔지 모르겠음. ex) "N"
		 * paymentMethod | String | 콤마로 구분된 가능한 결제 방법(paymentMethod)코드 목록
		 * cardList | String | 콤마로 구분된 가능한 카드 코드 목록
		 */
		paymentCardEventInfo: function(val) {
			var _info = null;
			var eventInfo = [
				{// 9월 현대 ------------------------------------- 
					type: 'hyundaiCard',
					startDate: '2019090100', 
					endDate: '2019091024', 
					passValue: 'N',
					paymentMethod: '01,05,06,07',
					cardList: '01,02,03,06,07,16,10'
				},
				{// 9월 삼성
					type: 'samsungCard',
					startDate: '2019091100',
					endDate: '2019093024',
					passValue: 'N',
					paymentMethod: '01,05,06,07',
					cardList: '01,02,03,10'
				}
				,
				{// 10월 현대 ------------------------------------- 
					type: 'hyundaiCard',
					startDate: '2019100100', 
					endDate: '2019101324', 
					passValue: 'N',
					paymentMethod: '01,05,06,07',
					cardList: '01,02,03,06,07,16,10'
				},
				{// 10월 삼성
					type: 'samsungCard',
					startDate: '2019101400',
					endDate: '2019103124',
					passValue: 'N',
					paymentMethod: '01,05,06,07',
					cardList: '01,02,03,10'
				}				

			];
			if ( val == 'all' ) {
				return eventInfo;
			}
			var sysInt = parseInt( sfd.data.dataObject.sysdate + sfd.data.dataObject.systime.substr(0, 2) );
			// 해당 yyyymmddhh 경우에 오픈 이벤트가 있는지 여부 
			$.each(eventInfo, function(i, item) {
				var cardStartInt = parseInt(item.startDate);
				var cardEndInt = parseInt(item.endDate);
				sfd.log('paymentCardEventInfo', sysInt, cardStartInt, cardEndInt, sysInt >= cardStartInt, sysInt <= cardEndInt)
				if ( sysInt >= cardStartInt && sysInt < cardEndInt) {
 					_info = item;
					return false;
				}
			});
			return _info;
		},
		/**
		 * 체험기 이벤트 안내정보 
		 * @category 이벤트
		 * @type {Object}
		 */
		reviewEventInfo: {
			divisionDefault: {
				goodsURL: 'event-goods-Flower-vase-full.png?20190128',
				goodsURL_PC: 'event-goods-Flower-vase-join.png?20190128',
				goodsURL_MO: 'event-goods-Flower-vase.png?20190128',
				infoTitle01: '꽃병소화기',
				infoTitle02_PC: '{{productNameKo}} 가입 후, 가입후기를 남겨주시는 모든 분께 드립니다. ',
				infoTitle02_MO: '{{productNameKo}} 가입 후,<br/>가입후기를 남겨주시는 모든 분께<br/><span class="text-orange">꽃병소화기</span>를 드립니다!',
				infoDetail: '<div class="bullet-arrow11">참여 : {{productNameKo}} 가입 후 가입후기를 작성하시면 자동 참여</div>' +
							'<div class="bullet-arrow11">경품 : 꽃병소화기(제품 소진 시 다른 경품으로 변경 가능)</div>' +
							'<div class="bullet-arrow11">발송 : 참여일 기준 다다음달 10일 경, 가입 시 입력하신 휴대폰번호로 문자를 발송해 드립니다.<br/>그 문자를 통해 받으실 주소를 알려주세요.<br/>(월 보험료 2만원 이상 가입, 2회차 정상유지건)</div>' +
							'<div class="ne-bullet-star">이벤트 문의는 다이렉트 고객콜센터(1577-3339)로 연락주세요.</div>',
				joinTitle01: '보험을 가입해주셔서 감사합니다!',
				joinTitle02: '가입시 느낀 점이나 바라는 점을 남겨주시는 모든 분께 <span class="text-orange">꽃병소화기</span>를 드립니다!',
				joinDetail: '<div class="event-title-sub">이벤트 참여 안내</div>' +
	                        '<div class="bullet-arrow10">{{productNameKo}} 가입 후, 가입후기를 작성하시면 자동으로 참여됩니다.</div>' +
	                        '<div class="bullet-arrow10">경품은 참여일 기준 다다음달 10일 경, 가입 시 입력하신 휴대폰번호로 문자를 발송해 드립니다. 그 문자를 통해 받으실 주소를 알려주세요.<br/>(월 보험료 2만원 이상 가입, 2회차 정상유지건)</div>' +
	                        '<div class="bullet-arrow10">이벤트 문의는 인터넷 고객센터(1577-3339)로 연락 주세요.</div>'
			}
		},

		/**
		 * List에서 value 값 가진 항목
		 * @category 유틸리티 함수
		 * @param {String} listName List 이름
		 * @param {String} value 찾으려는 value
		 * @return {Object} List에서 value값을 가진 항목. list가 없거나 value 못찾은 경우 null.
		 * @see
		 * listName이 "banks"인 경우 증권사(securitiesFirms) 포함해서 검색함.
		 * @example
		 * ```js
		 * sfd.listValue.item('banks', '039');
		 * // return { "value": "039", "label": "경남은행" }
		 * 
		 * sfd.listValue.item('carOptions', '01');
		 * // return { "value": "01", "label": "에어컨" }
		 * 
		 * sfd.listValue.item('fuelTypes', 'G');
		 * // return { "value": "G", "label": "가솔린" }
		 * ```
		 */
		item: function(listName, value) {
			var result = null;

			var list;
			switch (listName) {
				case 'banks':
					list = self[listName].concat(self.securitiesFirms);
					break;
				default: 
					list = self[listName];
			}

			if (!list) {
				return result;
			}

			for (var i = 0; i < list.length; i++) {
				if (list[i].value == value) {
					result = list[i];
					break;
				}
			}
			return result;
		},

		/**
		 * List에서 value 값 가진 항목의 label
		 * @category 유틸리티 함수
		 * @param {String} listName List 이름
		 * @param {String} value 찾으려는 value
		 * @return {String} List에서 value값을 가진 항목의 label. list가 없거나 value 못찾은 경우 null.
		 * @see
		 * listName이 "banks"인 경우 증권사(securitiesFirms) 포함해서 검색함.
		 * @example
		 * ```js
		 * sfd.listValue.label('banks', '039');
		 * // return '경남은행'
		 * 
		 * sfd.listValue.label('carOptions', '01');
		 * // return '에어컨'
		 * 
		 * sfd.listValue.label('fuelTypes', 'G');
		 * // return '가솔린'
		 * ```
		 */
		label: function(listName, value) {
			var item = self.item(listName, value);
			return item ? item.label : null;
		},

		/**
		 * 분납코드 코드를 label로 변환
		 * @category 결제
		 * @param {String} [cd] 분납 코드 넣으면 해당 label 얻기
		 * @return {String} 분납 코드에 따른 label 반환
		 */	
		getPayIntLabel: function(cd) {
			var payIntlNmList = self.payIntlCdList; // 분납코드
			var _r = '';
			$.each( payIntlNmList, function(i, item) {
				if (item.value == cd) {
					_r = item.label;
					return false;
				}
			});
	
			return _r;
		},

		/**
		 * 자동차 연료 목록
		 * @category 자동차
		 * @type {Array}
		 * @see
		 * 구성
		 * Key | Type | 설명
		 * ---|---|---
		 * value | String | 코드값
		 * label | String | 이름
		 */
		fuelTypes: [
			{ value: 'D', label: '디젤' },
			{ value: 'L', label: 'LPG' },
			{ value: 'G', label: '가솔린' },
			{ value: 'H', label: '하이브리드' },
			{ value: 'E', label: '전기차' },
			{ value: 'B', label: '바이퓨얼' },
			{ value: 'P', label: '플러그인하이브리드' },
			{ value: 'F', label: '수소전지' }
		],
		/**
		 * sfd.listValue.fuelTypes 사용하세요.(deprecated)
		 * @category 자동차
		 */
		getFuelTypes: function() {
			return this.fuelTypes;			
		},

		/**
		 * 자동차 연료코드에 해당하는 label. sfd.listValue.label('fuelTypes', value); 사용하세요. (deprecated)
		 * @category 자동차
		 * @param {String} code 연료코드
		 */
		getFuelLabel: function(code) {
			return this.label('fuelTypes', code);
		},

		/**
		 * 지정된 범위의 년도 목록 얻기
		 * @category 날짜
		 * @method getYears
		 * @param {String} start 시작 년도 (기본값: 오늘날짜 기준 년)
		 * @param {String} end 끝 년도 (기본값: start 다음 년)
		 * @return {Array} 연도 목록. [{value: 2018, label: '2018년'}, ...]
		 */
		getYears: function(start, end) {
			var isReverse = true;
			var s = parseInt(String(start).substr(0, 4));
			var e = parseInt(String(end).substr(0, 4));
			if ( s > e) {
				isReverse = false;
			}

			start = Math.min(s, e);
			end = Math.max(s, e);

			if (!start) {
				start = new Date().toString('yyyy');
			}
			if (!end) {
				end = parseInt(start) + 1;
			}
		   
			var result = [];
			for (var i = end; i >= start; i--) {
				
				result.push({ 
					value: i, 
					label: i + '년' 
				});
			}
		
			if (isReverse) {
				return result.reverse();
			} else {
				return result;
			}
			
		},
		/**
		 * 은행인지 증권사인지 리턴
		 * @category 결제
		 * @method getBankType
		 * @param {String} code 코드 
		 * @return {String} 은행인 경우 "banks", 증권사인 경우 "securitiesFirms"
		 */		
		getBankType: function(code) {
			var bankType = '';

			$.each(self.securitiesFirms, function(i, v) {
				if (v.value == code) {
					bankType = 'securitiesFirms';
					return
				}
			})

			$.each(self.banks, function(i, v) {
				if (v.value == code) {
					bankType = 'banks';
					return
				}
			})
			return bankType;
		},
		/**
		 * 지정된 범위의 월 목록 얻기
		 * @category 날짜
		 * @method getMonths
		 * @param {Int} start 시작 월 (기본값: 1)
		 * @param {Int} end 끝 월 (기본값: 12)
		 * @return {Array} 월 목록. [{value: '01', label: '01'}, ...]
		 */
		getMonths: function(start, end) {
			if (!start) {
				start = 1;
			}
			if (!end) {
				end = 12;
			}
			var result = [];
			for (var i = start; i <= end; i++) {
				var value = sfd.utils.padLeft(i);
				result.push({ 
					value: value, 
					label: value + '월'
				});
			}
			return result;
		},
		/**
		 * 지정된 월의 일 목록 얻기
		 * @category 날짜
		 * @method getDays
		 * @param {String} yyyymmdd YYYYMMDD 형태의 날짜 문자열 (기본값: 오늘날짜)
		 * @return {Array} yyyymmdd 날짜 월에 포함된 일 목록. [{value: '01', label: '01'}, ...]
		 */
		getDays: function(yyyymmdd) {
			/*if (!yyyymmdd) {
				yyyymmdd = sfd.utils.dateToString(new Date());
			}*/
			var daysCount = 31;
			if (yyyymmdd) {
				sfd.utils.daysInMonth(yyyymmdd)
			}
			var result = [];
			for (var i = 1; i <= daysCount; i++) {
				var value = sfd.utils.padLeft(i);
				result.push({ 
					value: value, 
					label: value + '일'
				});
			}
			return result;
		},
		/**
		 * 지정된 범위의 주 목록 얻기 (기본적으로 임신주수)
		 * @category 날짜
		 * @method getWeeks
		 * @param {Int} start 시작 주 (기본값: 4)
		 * @param {Int} end 끝 주 (기본값: 40)
		 * @return {Array} 주 목록. [{value: '1', label: '1'}, ...]
		 */
		getWeeks: function(start, end) {
			if (!start) {
				start = 4;
			}
			if (!end) {
				end = 40;
			}
			var result = [];
			for (var i = start; i <= end; i++) {
				var value = i;
				result.push({ 
					value: value, 
					label: value + '주'
				});
			}
			return result;
		},
		/**
		 * 은행명 가져오기. sfd.listValue.label('banks', value); 사용하세요. (deprecated)
		 * @category 결제
		 * @method getBankName
		 * @param {String} code 은행코드 
		 * @return {String} 은행명
		 */	
		getBankName: function(code) {
			return this.item('banks', code);			
		},
		/**
		 * 보험회사 명칭 가져오기. sfd.listValue.label('insuranceCompany', value); 사용하세요. (deprecated)
		 * @category 결제
		 * @method getInsuranceCompany
		 * @param {String} value 보험회사 값 
		 * @return {String} 보험회사 명칭
		 */	
		getInsuranceCompany: function(value) {
			return this.label('insuranceCompany', value);
		},
		/**
		 * 납입주기 명칭 가져오기. sfd.listValue.label('insuranceCompany', value); 사용하세요. (deprecated)
		 * @category 결제
		 * @param {String} value 납입주기 값 
		 * @return {String} 납입주기 명칭
		 */			
		getPaymentPeriodName: function(value) {
			return this.label('paymentPeriod', value);
		},

		/**
		 * 대인배상 급수 명칭 가져오기. sfd.listValue.label('injuryGrade', value); 사용하세요. (deprecated)
		 * @category 자동차
		 * @param {String} value 대인배상 급수 코드
		 * @param {String} 납입주기 명칭
		 */
		getInjuryGradeName: function(value) {
			return this.label('injuryGrade', value);
		},

		/**
		 * 외국인 등록용 국가 목록
		 * @category 국가
		 * @type {Array}
		 * @see
		 * 구성
		 * Key | Type | 설명
		 * ---|---|---
		 * label | String | 국가코드#한글명#영문명. 예) "KR#한국#South Korea"
		 * data | String | 국가코드 예) "KR"
		 */
		countries: [
			{ label: 'AD#안도라#Andorran', data: 'AD' },
			{ label: 'AE#아랍에미리트#Utd.Arab Emir.', data: 'AE' },
			{ label: 'AF#아프가니스탄#Afghanistan', data: 'AF' },
			{ label: 'AG#앤티가 바부다#Antigua/Barbuda', data: 'AG' },
			{ label: 'AI#앵귈라#Anguilla', data: 'AI' },
			{ label: 'AL#알바니아#Albania', data: 'AL' },
			{ label: 'AM#아르메니아#Armenia', data: 'AM' },
			{ label: 'AO#앙골라#Angola', data: 'AO' },
			{ label: 'AQ#남극 대륙#Antarctica', data: 'AQ' },
			{ label: 'AR#아르헨티나#Argentina', data: 'AR' },
			{ label: 'AS#미국령 사모아#Samoa, America', data: 'AS' },
			{ label: 'AT#오스트리아#Austria', data: 'AT' },
			{ label: 'AU#오스트레일리아#Australia', data: 'AU' },
			{ label: 'AW#아루바#Aruba', data: 'AW' },
			{ label: 'AX#올란드제도#Aland Islands', data: 'AX' },
			{ label: 'AZ#아제르바이잔#Azerbaijan', data: 'AZ' },
			{ label: 'BA#보스니아헤르체고비나#Bosnia-Herz.', data: 'BA' },
			{ label: 'BB#바베이도스#Barbados', data: 'BB' },
			{ label: 'BD#방글라데시#Bangladesh', data: 'BD' },
			{ label: 'BE#벨기에#Belgium', data: 'BE' },
			{ label: 'BF#부르키나파소#Burkina Faso', data: 'BF' },
			{ label: 'BG#불가리아#Bulgaria', data: 'BG' },
			{ label: 'BH#바레인#Bahrain', data: 'BH' },
			{ label: 'BI#부룬디#Burundi', data: 'BI' },
			{ label: 'BJ#베냉#Benin', data: 'BJ' },
			{ label: 'BL#생바르미텔르미#St Barthélemy', data: 'BL' },
			{ label: 'BM#버뮤다#Bermuda', data: 'BM' },
			{ label: 'BN#브루나이#Brunei Daruss.', data: 'BN' },
			{ label: 'BO#볼리비아#Bolivia', data: 'BO' },
			{ label: 'BQ#보네르, 사바#Bonaire, Saba', data: 'BQ' },
			{ label: 'BR#브라질#Brazil', data: 'BR' },
			{ label: 'BS#바하마#Bahamas', data: 'BS' },
			{ label: 'BT#부탄#Bhutan', data: 'BT' },
			{ label: 'BV#부베이 섬#Bouvet Islands', data: 'BV' },
			{ label: 'BW#보츠와나#Botswana', data: 'BW' },
			{ label: 'BY#벨로루시#Belarus', data: 'BY' },
			{ label: 'BZ#벨리즈#Belize', data: 'BZ' },
			{ label: 'CA#캐나다#Canada', data: 'CA' },
			{ label: 'CC#코코넛 섬#Coconut Islands', data: 'CC' },
			{ label: 'CD#콩고민주공화국#Dem. Rep. Congo', data: 'CD' },
			{ label: 'CF#중앙 아프리카#CAR', data: 'CF' },
			{ label: 'CG#콩고#Rep.of Congo', data: 'CG' },
			{ label: 'CH#스위스#Switzerland', data: 'CH' },
			{ label: "CI#코트디부아르#Cote d'Ivoire", data: 'CI' },
			{ label: 'CK#쿡 제도#Cook Islands', data: 'CK' },
			{ label: 'CL#칠레#Chile', data: 'CL' },
			{ label: 'CM#카메룬#Cameroon', data: 'CM' },
			{ label: 'CN#중국#China', data: 'CN' },
			{ label: 'CO#콜롬비아#Colombia', data: 'CO' },
			{ label: 'CR#코스타리카#Costa Rica', data: 'CR' },
			{ label: 'CS#세르비아몬테네그로#Serbia/Monten.', data: 'CS' },
			{ label: 'CU#쿠바#Cuba', data: 'CU' },
			{ label: 'CV#카보베르데#Cape Verde', data: 'CV' },
			{ label: 'CW#쿠라카오#Curaçao', data: 'CW' },
			{ label: 'CX#크리스마스 섬#Christmas Islnd', data: 'CX' },
			{ label: 'CY#키프로스#Cyprus', data: 'CY' },
			{ label: 'CZ#체코#Czech Republic', data: 'CZ' },
			{ label: 'DE#독일#Germany', data: 'DE' },
			{ label: 'DJ#지부티#Djibouti', data: 'DJ' },
			{ label: 'DK#덴마크#Denmark', data: 'DK' },
			{ label: 'DM#도미니카#Dominica', data: 'DM' },
			{ label: 'DO#도미니카 공화국#Dominican Rep.', data: 'DO' },
			{ label: 'DZ#알제리#Algeria', data: 'DZ' },
			{ label: 'EC#에콰도르#Ecuador', data: 'EC' },
			{ label: 'EE#에스토니아#Estonia', data: 'EE' },
			{ label: 'EG#이집트#Egypt', data: 'EG' },
			{ label: 'EH#서사하라#West Sahara', data: 'EH' },
			{ label: 'ER#에리트레아#Eritrea', data: 'ER' },
			{ label: 'ES#스페인#Spain', data: 'ES' },
			{ label: 'ET#에티오피아#Ethiopia', data: 'ET' },
			{ label: 'EU#유럽연합#European Union', data: 'EU' },
			{ label: 'FI#핀란드#Finland', data: 'FI' },
			{ label: 'FJ#피지#Fiji', data: 'FJ' },
			{ label: 'FK#포클랜드 제도#Falkland Islnds', data: 'FK' },
			{ label: 'FM#미크로네시아#Micronesia', data: 'FM' },
			{ label: 'FO#페로 제도#Faroe Islands', data: 'FO' },
			{ label: 'FR#프랑스#France', data: 'FR' },
			{ label: 'GA#가봉#Gabon', data: 'GA' },
			{ label: 'GB#영국#United Kingdom', data: 'GB' },
			{ label: 'GD#그레나다#Grenada', data: 'GD' },
			{ label: 'GE#그루지야#Georgia', data: 'GE' },
			{ label: 'GF#프랑스령 기아나#French Guayana', data: 'GF' },
			{ label: 'GG#건지#Guernsey', data: 'GG' },
			{ label: 'GH#가나#Ghana', data: 'GH' },
			{ label: 'GI#지브롤터#Gibraltar', data: 'GI' },
			{ label: 'GL#그린란드#Greenland', data: 'GL' },
			{ label: 'GM#감비아#Gambia', data: 'GM' },
			{ label: 'GN#기니#Guinea', data: 'GN' },
			{ label: 'GP#과들루프#Guadeloupe', data: 'GP' },
			{ label: 'GQ#적도 기니#Equatorial Guin', data: 'GQ' },
			{ label: 'GR#그리스#Greece', data: 'GR' },
			{ label: 'GS#사우스 조지아#S. Sandwich Ins', data: 'GS' },
			{ label: 'GT#과테말라#Guatemala', data: 'GT' },
			{ label: 'GU#괌#Guam', data: 'GU' },
			{ label: 'GW#기니비사우#Guinea-Bissau', data: 'GW' },
			{ label: 'GY#가이아나#Guyana', data: 'GY' },
			{ label: 'HK#홍콩#Hong Kong', data: 'HK' },
			{ label: 'HM#허드 맥도널드 제도#Heard/McDon.Isl', data: 'HM' },
			{ label: 'HN#온두라스#Honduras', data: 'HN' },
			{ label: 'HR#크로아티아#Croatia', data: 'HR' },
			{ label: 'HT#아이티#Haiti', data: 'HT' },
			{ label: 'HU#헝가리#Hungary', data: 'HU' },
			{ label: 'ID#인도네시아#Indonesia', data: 'ID' },
			{ label: 'IE#아일랜드#Ireland', data: 'IE' },
			{ label: 'IL#이스라엘#Israel', data: 'IL' },
			{ label: 'IM#맨 섬#Isle of Man', data: 'IM' },
			{ label: 'IN#인도#India', data: 'IN' },
			{ label: 'IO#영국령 인도양 식민지#Brit.Ind.Oc.Ter', data: 'IO' },
			{ label: 'IQ#이라크#Iraq', data: 'IQ' },
			{ label: 'IR#이란#Iran', data: 'IR' },
			{ label: 'IS#아이슬란드#Iceland', data: 'IS' },
			{ label: 'IT#이탈리아#Italy', data: 'IT' },
			{ label: 'JE#저지#Jersey', data: 'JE' },
			{ label: 'JM#자메이카#Jamaica', data: 'JM' },
			{ label: 'JO#요르단#Jordan', data: 'JO' },
			{ label: 'JP#일본#Japan', data: 'JP' },
			{ label: 'KE#케냐#Kenya', data: 'KE' },
			{ label: 'KG#키르기스스탄#Kyrgyzstan', data: 'KG' },
			{ label: 'KH#캄보디아#Cambodia', data: 'KH' },
			{ label: 'KI#키리바시#Kiribati', data: 'KI' },
			{ label: 'KM#코모로#Comoros', data: 'KM' },
			{ label: 'KN#세인트 키츠 네비스#St Kitts&Nevis', data: 'KN' },
			{ label: 'KP#북한#North Korea', data: 'KP' },
			{ label: 'KR#한국#South Korea', data: 'KR' },
			{ label: 'KW#쿠웨이트#Kuwait', data: 'KW' },
			{ label: 'KY#케이맨 제도#Cayman Islands', data: 'KY' },
			{ label: 'KZ#카자흐스탄#Kazakhstan', data: 'KZ' },
			{ label: 'LA#라오스#Laos', data: 'LA' },
			{ label: 'LB#레바논#Lebanon', data: 'LB' },
			{ label: 'LC#세인트 루시아#St. Lucia', data: 'LC' },
			{ label: 'LI#리히텐슈타인#Liechtenstein', data: 'LI' },
			{ label: 'LK#스리랑카#Sri Lanka', data: 'LK' },
			{ label: 'LR#라이베리아#Liberia', data: 'LR' },
			{ label: 'LS#레소토#Lesotho', data: 'LS' },
			{ label: 'LT#리투아니아#Lithuania', data: 'LT' },
			{ label: 'LU#룩셈부르크#Luxembourg', data: 'LU' },
			{ label: 'LV#라트비아#Latvia', data: 'LV' },
			{ label: 'LY#리비아#Libya', data: 'LY' },
			{ label: 'MA#모로코#Morocco', data: 'MA' },
			{ label: 'MC#모나코#Monaco', data: 'MC' },
			{ label: 'MD#몰도바#Moldova', data: 'MD' },
			{ label: 'ME#몬테네그로#Montenegro', data: 'ME' },
			{ label: 'MF#세인트마틴#Saint Martin', data: 'MF' },
			{ label: 'MG#마다가스카르#Madagascar', data: 'MG' },
			{ label: 'MH#마셜 제도#Marshall Islnds', data: 'MH' },
			{ label: 'MK#마케도니아#Macedonia', data: 'MK' },
			{ label: 'ML#말리#Mali', data: 'ML' },
			{ label: 'MM#미얀마#Burma', data: 'MM' },
			{ label: 'MN#몽골#Mongolia', data: 'MN' },
			{ label: 'MO#마카오#Macau', data: 'MO' },
			{ label: 'MP#북마리아나 제도#N.Mariana Islnd', data: 'MP' },
			{ label: 'MQ#마르티니크#Martinique', data: 'MQ' },
			{ label: 'MR#마우레타니아#Mauretania', data: 'MR' },
			{ label: 'MS#몬트세라트#Montserrat', data: 'MS' },
			{ label: 'MT#몰타#Malta', data: 'MT' },
			{ label: 'MU#모리셔스#Mauritius', data: 'MU' },
			{ label: 'MV#몰디브#Maldives', data: 'MV' },
			{ label: 'MW#말라위#Malawi', data: 'MW' },
			{ label: 'MX#멕시코#Mexico', data: 'MX' },
			{ label: 'MY#말레이시아#Malaysia', data: 'MY' },
			{ label: 'MZ#모잠비크#Mozambique', data: 'MZ' },
			{ label: 'NA#나미비아#Namibia', data: 'NA' },
			{ label: 'NC#뉴칼레도니아#New Caledonia', data: 'NC' },
			{ label: 'NE#니제르#Niger', data: 'NE' },
			{ label: 'NF#노퍽 섬#Norfolk Islands', data: 'NF' },
			{ label: 'NG#나이지리아#Nigeria', data: 'NG' },
			{ label: 'NI#니카라과#Nicaragua', data: 'NI' },
			{ label: 'NL#네덜란드#Netherlands', data: 'NL' },
			{ label: 'NO#노르웨이#Norway', data: 'NO' },
			{ label: 'NP#네팔#Nepal', data: 'NP' },
			{ label: 'NR#나우루#Nauru', data: 'NR' },
			{ label: 'NT#NATO#NATO', data: 'NT' },
			{ label: 'NU#니우에#Niue', data: 'NU' },
			{ label: 'NZ#뉴질랜드#New Zealand', data: 'NZ' },
			{ label: 'OM#오만#Oman', data: 'OM' },
			{ label: 'PA#파나마#Panama', data: 'PA' },
			{ label: 'PE#페루#Peru', data: 'PE' },
			{ label: 'PF#프랑스령 폴리네시아#Frenc.Polynesia', data: 'PF' },
			{ label: 'PG#파푸아뉴기니#Pap. New Guinea', data: 'PG' },
			{ label: 'PH#필리핀#Philippines', data: 'PH' },
			{ label: 'PK#파키스탄#Pakistan', data: 'PK' },
			{ label: 'PL#폴란드#Poland', data: 'PL' },
			{ label: 'PM#생피에르앤드미클롱#St.Pier,Miquel.', data: 'PM' },
			{ label: 'PN#핏케언 제도#Pitcairn Islnds', data: 'PN' },
			{ label: 'PR#푸에르토리코#Puerto Rico', data: 'PR' },
			{ label: 'PS#팔레스타인#Palestine', data: 'PS' },
			{ label: 'PT#포르투갈#Portugal', data: 'PT' },
			{ label: 'PW#팔라우#Palau', data: 'PW' },
			{ label: 'PY#파라과이#Paraguay', data: 'PY' },
			{ label: 'QA#카타르#Qatar', data: 'QA' },
			{ label: 'RE#리유니언 섬#Reunion', data: 'RE' },
			{ label: 'RO#루마니아#Romania', data: 'RO' },
			{ label: 'RS#세르비아#Serbia', data: 'RS' },
			{ label: 'RU#러시아#Russian Fed.', data: 'RU' },
			{ label: 'RW#르완다#Rwanda', data: 'RW' },
			{ label: 'SA#사우디아라비아#Saudi Arabia', data: 'SA' },
			{ label: 'SB#솔로몬 제도#Solomon Islands', data: 'SB' },
			{ label: 'SC#세이셸#Seychelles', data: 'SC' },
			{ label: 'SD#수단#Sudan', data: 'SD' },
			{ label: 'SE#스웨덴#Sweden', data: 'SE' },
			{ label: 'SG#싱가포르#Singapore', data: 'SG' },
			{ label: 'SH#세인트 헬레나#Saint Helena', data: 'SH' },
			{ label: 'SI#슬로베니아#Slovenia', data: 'SI' },
			{ label: 'SJ#스발바르#Svalbard', data: 'SJ' },
			{ label: 'SK#슬로바키아#Slovakia', data: 'SK' },
			{ label: 'SL#시에라리온#Sierra Leone', data: 'SL' },
			{ label: 'SM#산마리노#San Marino', data: 'SM' },
			{ label: 'SN#세네갈#Senegal', data: 'SN' },
			{ label: 'SO#소말리아#Somalia', data: 'SO' },
			{ label: 'SR#수리남#Suriname', data: 'SR' },
			{ label: 'SS#남수단#South Sudan', data: 'SS' },
			{ label: 'ST#상투메 프린시페#S.Tome,Principe', data: 'ST' },
			{ label: 'SV#엘살바도르#El Salvador', data: 'SV' },
			{ label: 'SX#세인트 마틴#Sint Maarten', data: 'SX' },
			{ label: 'SY#시리아#Syria', data: 'SY' },
			{ label: 'SZ#스와질란드#Swaziland', data: 'SZ' },
			{ label: 'TC#터크스 케이커스 제도#Turksh Caicosin', data: 'TC' },
			{ label: 'TD#차드#Chad', data: 'TD' },
			{ label: 'TF#프랑스남쪽영역#French S.Territ', data: 'TF' },
			{ label: 'TG#토고#Togo', data: 'TG' },
			{ label: 'TH#태국#Thailand', data: 'TH' },
			{ label: 'TJ#타지키스탄#Tajikistan', data: 'TJ' },
			{ label: 'TK#토켈라우#Tokelau Islands', data: 'TK' },
			{ label: 'TL#동티모르#East Timor', data: 'TL' },
			{ label: 'TM#투르크메니스탄#Turkmenistan', data: 'TM' },
			{ label: 'TN#튀니지#Tunisia', data: 'TN' },
			{ label: 'TO#통가#Tonga', data: 'TO' },
			{ label: 'TP#동티모르#East Timor', data: 'TP' },
			{ label: 'TR#터키#Turkey', data: 'TR' },
			{ label: 'TT#트리니다드 토바고#Trinidad,Tobago', data: 'TT' },
			{ label: 'TV#투발루#Tuvalu', data: 'TV' },
			{ label: 'TW#대만#Taiwan', data: 'TW' },
			{ label: 'TZ#탄자니아#Tanzania', data: 'TZ' },
			{ label: 'UA#우크라이나#Ukraine', data: 'UA' },
			{ label: 'UG#우간다#Uganda', data: 'UG' },
			{ label: 'UM#소수 외부 제도#Minor Outl.Isl.', data: 'UM' },
			{ label: 'UN#UN#United Nations', data: 'UN' },
			{ label: 'US#미국#USA', data: 'US' },
			{ label: 'UY#우르과이#Uruguay', data: 'UY' },
			{ label: 'UZ#우즈베키스탄#Uzbekistan', data: 'UZ' },
			{ label: 'VA#바티칸#Vatican City', data: 'VA' },
			{ label: 'VC#세인트 빈센트#St. Vincent', data: 'VC' },
			{ label: 'VE#베네수엘라#Venezuela', data: 'VE' },
			{ label: 'VG#영국령 버진 아일랜드#Brit.Virgin Is.', data: 'VG' },
			{ label: 'VI#미국령 버진 아일랜드#Amer.Virgin Is.', data: 'VI' },
			{ label: 'VN#베트남#Vietnam', data: 'VN' },
			{ label: 'VU#바누아투#Vanuatu', data: 'VU' },
			{ label: 'WF#월리스 푸투나#Wallis,Futuna', data: 'WF' },
			{ label: 'WS#사모아#Samoa', data: 'WS' },
			{ label: 'YE#예멘#Yemen', data: 'YE' },
			{ label: 'YT#마요트#Mayotte', data: 'YT' },
			{ label: 'ZA#남아프리카 공화국#South Africa', data: 'ZA' },
			{ label: 'ZM#잠비아#Zambia', data: 'ZM' },
			{ label: 'ZW#짐바브웨#Zimbabwe', data: 'ZW' }
		],
		/**
		 * sfd.listValue.countries 사용하세요.(deprecated)
		 * @category 국가
		 */
		getCountryData: function() {
			return this.countries;
		},

		/**
		 * 
		 * 홈, 닫기 배너 관련 객체 가져오기
		 * 
		 * @category 홈, 닫기 배너
		 * @see
		 * sfd.listValue.getRecommendEndTarget()
		 * 항목 object 구성
		 * Key | Type | 설명
		 * ---|---|---
		 * label | String | 상품이름
		 * product | String | 상품 고유이름
		 * targetProduct | String | 가야할 상품이름 또는 특정 문자 예) calljoin
		 * address | String | 가야할 주소
		 */
		getRecommendEndTarget: function() {

			// 디바이스 체크
			var _deviceName = sfd.env.deviceType == 'PC' ? 'pc' : 'mo';
			// 상품
			var _divisionName = sfd.data.getValue('divisionName');

			// OTK 리스트
			var list = [
				{ label: '자동차', 			product: 'car',
					targetList: {
						'pc': { targetProduct: 'calljoin', 			address: '',			subTargetProduct: 'driver',		subAddress: 'C1411IB0001',			isSubProductFunc: isSubProductCarFunc },
						'mo': { targetProduct: 'calljoin', 			address: '' }
					}},
				{ label: '이륜차', 			product: 'bike',
					targetList: {
						'pc': { targetProduct: 'dental',		address: 'D1904IB0001' },
						'mo': { targetProduct: 'dental',		address: 'S1906IB0006' }	// 아직 정의는 없지만 PC 가 치아 보내길래 그냥 치아보낸다 address 막쓴거임 정의 다시받아야함 
					}},
				{ label: '법인', 			product: 'corp',
					targetList: {
						'pc': { targetProduct: 'driver',		address: 'C1411IB0005' },
						'mo': { targetProduct: 'driver',		address: 'C1411IB0005' }
					}},
				{ label: '운전자', 			product: 'driver',
					targetList: {
						'pc': {	targetProduct: 'home',			address: 'W1801IB0007' },
						'mo': {	targetProduct: 'smartM',		address: 'S1906IB0001' }
					}},
				{ label: '어린이', 			product: 'child',
					targetList: {
						'pc': {	targetProduct: 'smartM',		address: 'S1807IB0019',		subTargetProduct: 'smartM',			subAddress: 'S1807IB0019', 		isSubProductFunc: isSubProductChildFunc },
						// 'mo': {	targetProduct: 'realLoss-k',		address: 'Q1906IB0001',		subTargetProduct: 'dental-k',		subAddress: 'D1906IB0001', 		isSubProductFunc: isSubProductChildFunc }
						'mo': {	targetProduct: 'realLoss-k',		address: 'Q1906IB0001',		subTargetProduct: 'realLoss',		subAddress: 'Q1909IB0002', 		isSubProductFunc: isSubProductChildFunc }
					}},
				{ label: '주택',			product: 'home',
					targetList: {
						'pc': {	targetProduct: 'dental',		address: 'D1902IB0002' },
						'mo': {	targetProduct: 'smartM',		address: 'S1906IB0002' }
					}},
				{ label: '암', 				product: 'cancer',
					targetList: {
						'pc': {	targetProduct: 'dental',		address: 'D1902IB0002' },
						'mo': {	targetProduct: 'smartM',		address: 'S1906IB0003' }
					}},
				{ label: '실손',			product: 'realLoss',
					targetList: {
						'pc': {	targetProduct: 'dental',		address: 'D1902IB0001' },
						'mo': {	targetProduct: 'smartM',		address: 'S1906IB0004' }
					}},
				{ label: '건강', 			product: 'health',
					targetList: {
						'pc': {	targetProduct: 'dental',		address: 'D1902IB0002' },
						'mo': {	targetProduct: 'smartM',		address: 'S1906IB0005' }
					}},
				{ label: '치아', 			product: 'dental',
					targetList: {
						'pc': {	targetProduct: 'home',			address: 'W1901IB0002' },
						'mo': {	targetProduct: 'smartM',		address: 'S1906IB0006' }
					}},
				{ label: '연금(유)', 		product: 'annuity',
					targetList: {
						'pc': {	targetProduct: 'smartM',		address: 'S1807IB0025' },
						'mo': {	targetProduct: 'smartM',		address: 'S1906IB0007' }
					}},
				{ label: '연금(무)', 		product: 'annuityFD',
					targetList: {
						'pc': {	targetProduct: 'smartM',		address: 'S1807IB0026' },
						'mo': {	targetProduct: 'smartM',		address: 'S1906IB0008' }
					}},
				{ label: '저축', 			product: 'savings',
					targetList: {
						'pc': {	targetProduct: 'smartM',		address: 'S1807IB0027' },
						'mo': {	targetProduct: 'smartM',		address: 'S1906IB0009' }
					}},
				{ label: '스마트보험',		product: 'smartM',
					targetList: {
						'pc': {	targetProduct: 'dental',		address: 'D1807IB0001' },
						// 'mo': {	targetProduct: 'dental',		address: 'D1906IB0002' }
						'mo': {	targetProduct: 'realLoss',		address: 'Q1909IB0003' }
					}},
				{ label: '해외/유학',		product: 'travel',
					targetList: {
						'pc': {	targetProduct: 'smartM',		address: 'S1807IB0028' },
						'mo': {	targetProduct: 'realLoss',		address: 'Q1907IB0004' }
					}},
				{ label: '국내', 			product: 'travelDomestic',
					targetList: {
						'pc': {	targetProduct: 'smartM',		address: 'S1807IB0029' },
						'mo': {	targetProduct: 'smartM',		address: 'S1906IB0010' }
					}},
				{ label: '골프', 			product: 'golf',
					targetList: {
						'pc': {	targetProduct: 'smartM',		address: 'S1906IB0011' },
						'mo': {	targetProduct: 'smartM',		address: 'S1906IB0011' }
					}},
				{ label: '반려견',			product: 'pet',
					targetList: {
						'pc': {	targetProduct: 'home',			address: 'W1901IB0002' },
						// 'mo': {	targetProduct: 'home',			address: 'W1906IB0001' }
						'mo': {	targetProduct: 'smartM',		address: 'S1909IB0003' }
					}}
			];

			return initTargetObj();

			function initTargetObj() {

				var obj = sfd.utils.findObject( list, 'product', _divisionName);
		
				// 없으면?? 어쩌지
				if (!obj) {
					obj = list[0];
				}
		
				obj.targetProduct = obj.targetList[_deviceName].targetProduct;
				obj.address = obj.targetList[_deviceName].address;
		
				// 조건이 있다면 체크
				if (typeof obj.targetList[_deviceName].isSubProductFunc == 'function') {
					if (obj.targetList[_deviceName].isSubProductFunc()) {
						obj = sfd.utils.copyObject(obj);
						obj.targetProduct = obj.targetList[_deviceName].subTargetProduct;
						obj.address = obj.targetList[_deviceName].subAddress;
					}
				}
		
				return obj;
			}
		
			// 기타 컨디션 체크
			function isSubProductChildFunc() {
				var result = false;
		
				if (sfd.data.getValue('targetCls') == 'A') {
					result = true;
				}
		
				return result;
			}
		
			// 자동차 컨디션 체크
			function isSubProductCarFunc() {
		
				var result = false;
		
				var openNameStr = '';
				var pageStepInt = parseInt(sfd.data.getValue('pageStep'))
				var pageName = sfd.view.getPageName();
		
				if ([
					'Front', 
					'FrontCorp',
					'CarSelection',
					'CarInfo', 
					'DriverInfo',
					'DriverInfoCorp', 
					'CarNotice', 
					'DongilPolicy', 
					'DongilPolicyCorp'
				].includes(pageName)) {		// 법인
					// openNameStr = 'callFree2';
					openNameStr = 'driver';
					if ([
						'CarSelection',
						'CarInfo', 
						'DriverInfo',
						'DriverInfoCorp', 
						'CarNotice', 
						'DongilPolicy', 
						'DongilPolicyCorp'
					].includes(pageName)) {
						openName2Str = 'callFree2';
					} else {
						openNameStr = 'callFree2';
					}
		
				} else {
					// 2,3 자동차 이탈 TM팝업 종료 
					/*var systimeInt = parseInt( sfd.data.getValue('systime') );
					if( (systimeInt > 90000 && systimeInt < 180000) &&
						([ 2, 3 ].includes( pageStepInt ) )){
						openNameStr = 'tm';
					} else {
						openNameStr = 'driver';
					}*/
					openNameStr = 'driver';
					
				}
		
				if (openNameStr == 'driver') {
					result = true;
				}
		
				return result;
			}

		},
	

		end: ''
	};
	return self;
});

