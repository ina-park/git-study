/**
 * @fileOverview sfd 메인 Class
 */
/**
 * 기본 서브 모듈 모두 로드하는 메인 모듈
 * @class sfd
 */
sfdCacheBust = 'bust=' + (new Date()).getTime();
define([
	'/ria/common/core/Sfd.module.js?' + sfdCacheBust,
	'/ria/common/core/Sfd.listValue.js?' + sfdCacheBust,
	'/ria/common/core/Sfd.message.js?' + sfdCacheBust,
	'/ria/common/core/Sfd.server.js?' + sfdCacheBust,
	'/ria/common/core/Sfd.tracker.js?' + sfdCacheBust,
	'/ria/common/core/Sfd.utils.js?' + sfdCacheBust,
	'/ria/common/core/Sfd.view.js?' + sfdCacheBust,
	'/ria/common/resource/debug/Sfd.debug.js?' + sfdCacheBust,
	'/ria/common/core/Sfd.lib.js?' + sfdCacheBust,
	'/ria/common/vendor/exlib.js?' + sfdCacheBust
], function(module, listValue, message, server, tracker, utils, view, dbg) {
	'use strict';

	/* globals sfdCookie directRemarketingGoogleRia */

	// 프로세스 로드 후 추후 로드될 lib
	/*// TweenMax는 순수모바일에서는 구동되지 않도록 정할 예정(리소스를줄이기위해 animate로 대체)
    require(['../../vendor/case/TweenMax'], function(dummyData) {
        require([     
            '../../vendor/case/Draggable.min' // Tweenlite완료 후 로드 되어야 함 
        ]);
    });*/

	var sfd; /// {Object} Shell
	var self = {
		/// version info
		version: {
			modified: '{version-modified}',
			deploy: '{version-deploy}',
			hash: '{version-hash}'
		},
		/**
		 * 서브 모듈 세팅 및 기본 작업
		 * @category 초기화
		 * @see
		 * sfd.module, sfd.listValue, sfd.message, sfd.server, sfd.utils, sfd.views 등 로드 및 초기화
		 */   
		initialization: function() {
			sfd = this;

			sfd.debug = dbg;
			sfd.debug.initialization(sfd);

			sfd.module = module;
			sfd.listValue = listValue;
			sfd.message = message;
			sfd.server = server;
			sfd.tracker = tracker;
			sfd.utils = utils;
			sfd.view = view;
			sfd.module.initialization(sfd);
			sfd.listValue.initialization(sfd);
			sfd.message.initialization(sfd);
			sfd.server.initialization(sfd);
			sfd.tracker.initialization(sfd);
			sfd.utils.initialization(sfd);
			sfd.view.initialization(sfd);
			sfd.env.initialize(sfd.data);
			if (!sfd.env.isIE10Below()) {
				sfd.history.initialization();
			}

			// Core 모듈 버전체크 
			checkCoreModuleVersion();
						
			// Data 기본 초기화 값들 세팅
			setInitialData();

			// <STRIP_WHEN_RELEASE							
			// CI테스트 툴 적용여부값 
			if (self.env.parameters.none2e === 'true') {
				if (['dev', 'local'].includes(self.env.server)) {
					self.env.none2e = true;
				}
			}
			// STRIP_WHEN_RELEASE>
			
			// 스플렁크 운영 대상 여부 처리 
			if (self.env.parameters.splunk === 'false') {
				sfd.tracker.isSplunk = false;
			} else {
				sfd.tracker.isSplunk = true;
			}

			// sfd.data.setValue('wa', (self.env.parameters.wa == 'true') ? true : false);

			// 기본 HTML 초기화 작업
			initializeHTML();

			// 공통 모듈 로드
			loadDeviceModule(function(success) { // 기기 공통 모듈 로드
				if (success) {
					loadDivisionModule(function(success) { // 상품 공통 모듈 로드
						if (success) {
							self.commonSystemReady();
						} else {
							sfd.core.hideLoading('loading-start');
							sfd.core.alert('E0044'); // '죄송합니다. 시스템 오류가 발생했습니다.<br/>잠시 후 다시 시도해 주세요.'
						}
					});	
				} else {
					sfd.core.hideLoading('loading-start');
					sfd.core.alert('E0044'); // '죄송합니다. 시스템 오류가 발생했습니다.<br/>잠시 후 다시 시도해 주세요.'
				}
			});

			// 외부에서 접근하고자 하는것들 등록
			initializeExternalInterface();
		   

			// 전역 이벤트 처리
			if (sfd.env.deviceType != 'MO') {
				$(window).bind('touchmove', function(e) {
					e.preventDefault();
				});
			}
			$('.depth-modal.modal-loading').on('click', function(e) {
				if (window.event && window.event.shiftKey) {
					$(this).hide();
				}
			});
			
			/*window.onerror = function(errorMsg, url, lineNumber, column, errorObj) {
				setTimeout(function() {
					// 보안모듈, 마케팅라이브러리등 다양한 에러 케이스가 있어서 에러 체크 후 리로드는 스플렁크로 케이스 확인 필요
				}, 10);
			};*/
		},
		/**
		 * 공통 모듈 로드 완료된 후 호출됨
		 * @category 초기화
		 */
		commonSystemReady: function() {

			sfd.tracker.eventLog({
			    logType: 'etcLog',
			    code: 'brower_version_' + sfd.env.browser.group + '_' + sfd.env.browser.majorVersion,
			    description: 'brower_version_info'
			})

			// ssid, sbid 복사 임시처리 
			// window.sfdCookie.set('ssid', window.sfdCookie.get('_ssid'));
			// window.sfdCookie.set('sbid', window.sfdCookie.get('_sbid'));

			loadExternalModules();

			// 이벤트 조회 
			// sfd.module.eventManager.eventStart();
			// // 파킹 시작
			// sfd.module.parkingManager.parkingStart();

			// <STRIP_WHEN_RELEASE
			// $('#btn-mlogo').text($('#btn-mlogo').text() + ' (' + sfd.env.server + (sfd.env.screenReader ? '-접근성' : '') + ')');
			// STRIP_WHEN_RELEASE>
			// 
			document.title = sfd.data.dataObject.title;
		},
		/**
         * Console에 로그 찍기 (debug 1)
		 * @category 로그
         * @see
		 * URL 파라미터 debug 설정되어 있고 1일 때만 로그 찍음.
         */
		log: function() {
			if (self.env.isDebug && self.env.debugLevel < 2) {
				consoleLog.apply(null, arguments);
			}
		}, 
		/**
         * Console에 로그 찍기 (debug 1, 2)
		 * @category 로그
         * @see 
		 * URL 파라미터 debug 설정되어 있고 2이하일 때만 로그 찍음.
         */
		log2: function() {
			if (self.env.isDebug && self.env.debugLevel < 3) {
				consoleLog.apply(null, arguments);
			}
		},
		/**
         * Console에 로그 찍기  (debug 1, 2, 3)
		 * @category 로그
         * @see 
		 * URL 파라미터 debug 설정되어 있고 2이하일 때만 로그 찍음.
         */
		log3: function() {
			if (self.env.isDebug && self.env.debugLevel < 4) {
				consoleLog.apply(null, arguments);
			}
		},
		// <STRIP_WHEN_RELEASE
		/*lc: new LocalConnection({
            name: 'lcrialog',
            debug: false
        }),*/
		// STRIP_WHEN_RELEASE>
		/**
		 * 사용안함 (deprecated)
		 * @category 로그
		 * @param {*} inMsg 
		 */
		klog: function(inMsg) {
			// console.log('tmplog_klog',inMsg);
			// <STRIP_WHEN_RELEASE
			/*try {
                var lc = new LocalConnection({
                    name: 'lcrialog',
                    debug: false
                });
                self.lc.send('log', inMsg);
            } catch (e) {}*/
			// STRIP_WHEN_RELEASE>
		},
		/**
         * Console에 경고로그 찍기
		 * @category 로그
		 * @see
		 * 디버그 모드 아니면 안찍음
         */
		warnLog: function() {
			try {
				if (sfd.env.isDebug && window.console) {
					if ('function' === typeof window.console.warn) {
						window.console.warn.apply(null, arguments);
					} else if ('function' === typeof window.console.log) {
						window.console.log.apply(null, arguments);
					}
				}
			} catch (e) {
			}
		},
		/**
         * Console에 에러로그 찍기
		 * @category 로그
		 * @see
		 * 디버그 모드 아니면 안찍음
         */
		errorLog: function() {
			try {
				if (sfd.env.isDebug && window.console) {
					if ('function' === typeof window.console.error) {
						window.console.error.apply(null, arguments);
					} else if ('function' === typeof window.console.log) {
						window.console.log.apply(null, arguments);
					}
				}
			} catch (e) {}
		},
		/**
		 * 사용안함 (deprecated)
		 * @category 로그
		 */
		admLog: function(inObj) {
			// ex sfd.admLog({'msg':'상담원테스트메세지'});
			// http://myanycar.kobaltlab.com/test/aproject/adminreceive.html
			try {
				// document.dbgsend.adminInLog(inObj);
			} catch (e) {}
		},
		/**
		 * Core 모듈 다시 로드. (운영계 테스트용)
		 * @category 디버깅
		 * @param {String} url 다시 로드할 모듈 경로
		 * @param {String} key sfd에 저장할 key. sfd.*key* 로 연결됨.
		 */
		reloadCoreModule: function(url, key) {
			require([url],
			    function(module) {
					sfd[key] = module;
					sfd[key].initialization();
			    }
			);
		},
		/**
		 * 로드된 page view 객체들 저장
		 * @for sfd
		 */
		page: {},

		end: ''
	};

	/**
	 * core 기본. 상품별로 core 확장해서 사용.
	 * @class sfd.core
	 */
	var coreExtend = {
		_isDeeplinkNormal: 'none', /// <화면제어> 브라우져 히스토리버튼 체크(false:화면버튼 true:브라우져버튼)
		module: null, /// {Object} 각 상품(Division) 모듈
		moduleLOB: null, /// {Object} lobCd별 모듈. LL은 ModuleLong, LP는 ModuleGeneral, MV는 ModuleCar가 연결됨
		moduleDevice: null, /// {Object} 기기별 모듈. Mobile: ModuleDeviceMobile, PC: ModuleDevicePC
		/// <안쓰임>
		splunkLog: function(option) {

		},
		/**
		 * 홈페이지의 사이드바 페이지 오픈 
		 * @category 화면제어
		 * @param {String} code 메뉴 코드
		 * @param {String} tab 사이드바 탭 번호
		 */
		showSidebarPage: function( code, tab ) {
			if (window.parent && window.parent != this) {
				// 일괄, 연계판매등의 상품에서 나는 에러인 경우는 부모를 리프레시 
				if (window.parent.$global) {
					window.parent.$global.uiQuickPage( code, tab );
				}
			} else {
				if ($global) {
					$global.uiQuickPage( code, tab );
				}
			}
		},
		/**
		 * 부속코드 업데이트
		 * @category 자동차
		 * @param {String} inStartDate 날짜
		 */
		getPartListForCar: function(inStartDate) {
			var startDate = inStartDate || sfd.data.dataObject.startDate
			// 부속조회 상품 변경 
			if (['car', 'bloc', 'endo'].includes(sfd.data.dataObject.divisionName)) {
				sfd.core.simpleRun( 'getPartsList', {
					startDate: (startDate) ? startDate : sfd.data.dataObject.sysdate,
					productCode: sfd.data.dataObject.productCode,
					endoCls: (sfd.data.dataObject.divisionName == 'endo') ? 'Y' : ''
				}, function(res) {
					sfd.data.dataObject.partsList = res;
					sfd.listValue.partsList = res;
				});
			}			
		},

		// 아래 주석은 문서용임
		/**
		 * 서버 통신 (로딩처리, 에러 기본처리 됨)
		 * @category 통신
         * @method run
         * @param  {String} tranName    트랜 이름
         * @param  {Object} data    서버로 보내는 인자
         * @param  {Function} [onSuccess] 성공 callback 함수
         * @param  {Function} [onError] 실패 callback 함수
		 * @see
		 * 각 상품별 Core.js에서 구현되어 있음.
		 */

		// 아래 주석은 문서용임
		/**
		 * 서버 통신 (로딩처리, 에러 기본처리 안됨)
		 * @category 통신
         * @method simpleRun
         * @param  {String} tranName    트랜 이름
         * @param  {Object} data    서버로 보내는 인자
         * @param  {Function} [onSuccess] 성공 callback 함수
         * @param  {Function} [onError] 실패 callback 함수
		 * @see
		 * 각 상품별 Core.js에서 구현되어 있음.
		 */

		/**
		 * 서버 통신 (Promise 버전)
		 * @category 통신 
		 * @param {String} tranName 트랜 이름
		 * @param {Object} data 전송 파라미터
		 */
		runPromise: function(inForm, inParam) {
			return sfd.server.runPromise(inForm, inParam);
		},
		/**
		 * 특정 요소에 focus 처리.
		 * @category 화면제어
		 * @param {Object} [el] focus 줄 요소의 jQuery object. 지정 안하면 #wrapper에 focus 처리.
		 * @see
		 * PC에서만 동작함
		 */
		focusblur: function(el) {
			// 우선 PC만 적용 
			if (sfd.env.deviceType == 'MO') {
				return; 
			}
			var $el = (el instanceof jQuery) ? el : $(el);

			if ($el && $el.length > 0) {
				$el.focus();
			} else {
				$('#wrapper').focus();
			}
		},
		/**
		 * 홈 화면으로 이동
		 * @category 유틸리티
		 */
		gotoHomepage: function(inCode) {
			// 활동 로그 (리뉴얼 되면서 추가된 종료체크 로그) (장영휘 차장)
			if (sfd.data.dataObject.lobCd != 'MV') {
				// 장기일반만 호출 
				sfd.core.runInsertCommonLog( 'RIAEND' );
			}

			var inCode = inCode || 'referrer';
			var _homeURL = '/';
			
			// 모바일일경우 URL 변경
			if (sfd.env.deviceType == 'MO') {
				_homeURL = '/m';
			}

			if (sfd.env.isApp) {
				// 모바일앱인 경우
				sfd.app.goHome();
			} else {
				// 기타
				//referrer
				if ( inCode == 'home' ) {
					if (window.parent && window.parent != this) {
						// 일괄, 연계판매등의 상품에서 나는 에러인 경우는 부모를 리프레시 
						window.parent.location.href = _homeURL;
					} else {
						window.location.href = _homeURL;
					}
					
				} else if (self.env.referrer) {

					if (window.location.href == self.env.referrer) {
						// 강제 url변경으로 자신의 url과 레퍼러url이 동일할 경우 홈으로 이동 
						window.location.href = _homeURL;
					} else {
						window.location.href = self.env.referrer;
					}
					
				} else {
					window.location.href = _homeURL;
				}
			}
		},
		/**
		 * 모든 상품의 최초 통신이 끝나면 호출 
		 * @category 통신
		 */
		startRunCompleteEx: function() {
			// 이벤트 조회 
			sfd.module.eventManager.eventStart();

			// 부속 목록 조회 & 업데이트 (파킹시점에 문제가 되어 우선 제거)
			// sfd.core.getPartListForCar();

			// <STRIP_WHEN_RELEASE			
			// Snapshot 있으면 load
			if (sfd.env.parameters.snapshot) {
				var interval = null;
				interval = setInterval(function() {
					if (sfd.view.isPageTransitioning == false) {
						clearInterval(interval);
						sfd.debug.snapshot.load(self.env.parameters.snapshot);
					}
				}, 500);
			}
			// STRIP_WHEN_RELEASE>

			// 리아아트 대상 조회
			/* checkRiaArt();// 비 운영기간에는 주석처리	*/
		},
		/**
		 * 현재 페이지의 진행 방향. 순방항:next 역방향:prev
		 * @category 화면제어
		 * @return {String} 순반향인 경우 "next", 역방향인 경우 "prev".
		 */
		showPageDir: function() {
			return sfd.data.dataObject.pageDir;
			// if(!sfd.data.dataObject.pageCurrentNum || !sfd.data.dataObject.pageActiveNum)return 'next';
			// return (sfd.data.dataObject.pageCurrentNum >= sfd.data.dataObject.pageActiveNum)?'next':'prev';			
		},
		/**
		 * 페이지 reload 후 특정 페이지로 열기 (결제 페이지에서만 사용)
		 * @category 유틸리티
		 * @param {Boolean} val reload 할지 말지 여부. false로 지정하면 아무것도 안함.
		 * @see
		 * 자동차인 경우 계산 결과 자동 저장 후 reload
		 */
		reloadGotoPage: function( val ) {
			if ( String(val) == 'true' && sfd.data.getValue('currPageName') == 'Payment' ) {
				// &contractNo=aaa&reloadPage=Payment
				if ( sfd.data.dataObject.lobCd == 'MV' ) {
					// 자동차 
					sfd.core.reloadGotoPage2();
				} else {
					// 일/장
					window.location.href = '/ria/pc/product/' + sfd.data.dataObject.divisionName + '/?contractNo=' + sfd.data.dataObject.contractNo + '&reloadPage=Payment';
				}
			}
		},

		/**
		 * 입력 Validate 메시지 보여주기/감추기 (deprecated)
		 * @category 안쓰임
		 * @param {*} el msg 넣을 jQuery Element 또는 jQuery selector
		 * @param {String} msg sfd.message Message Code 또는 메시지
		 * @see
		 * 사용안하는 것 같음. TODO: 확인 후 삭제하기
		 */
		validateMessage: function(el, msg) {
			if (typeof el == 'string') {
				el = $(el);
			}
			if (msg) {
				el.html('<small class="sfd-icon-x sf-validate-msg">' + sfd.message.getMessage(msg) + '</small>');    
			} else {
				el.children('.sf-validate-msg').remove();
			}
		},
		/**
		 * 스마트헬프 보이기
		 * @category 화면제어
		 * @param {Object|String} [options] PC인 경우 옵션, mobile인 경우는 메시지
		 * PC 옵션
		 * Key | Type | 기본값 | 설명
		 * ---|---|---
		 * message | String | - | 도움말 메시지
		 * closeTimer | Number | - | 특정 시간 이후 자동으로 사라지게 하려면 시간 지정
		 * buttonTitle | String | - | 버튼 보여주고 싶은 경우 지정
		 * buttonHandler | Function | - |  버튼 눌렸을 때 callback 함수
		 * closeHandler | Function | - | 닫힐 때 callback 함수
		 */
		showSmartHelp: function(options) {
			if (sfd.env.deviceType == 'MO') {
				if (sfd.core.moduleDevice && sfd.core.moduleDevice.showSmartHelp) {
					sfd.core.moduleDevice.showSmartHelp(options);
				}
			} else {
				if (sfd.page.ModuleSmartHelp) {
					sfd.page.ModuleSmartHelp.showSmartHelp(options);
				}
			}
		},
		/**
		 * 스마트헬프 감추기
		 * @category 화면제어
		 * @param {Object} [options] 옵션 (안쓰이고 있음)
		 */
		hideSmartHelp: function(options) {
			if (sfd.env.deviceType == 'MO') {
				if (sfd.core.moduleDevice && sfd.core.moduleDevice.hideSmartHelp) {
					sfd.core.moduleDevice.hideSmartHelp(options);
				}
			} else {
				if (sfd.page.ModuleSmartHelp) {
					sfd.page.ModuleSmartHelp.hideSmartHelp(options);
				}
			}
		},
		/**
		 * 단계로그 비동기 호출(비동기로 호출해도 문제없는 대부분의 단계로그들)
		 * @category 통신
		 * @method runInsertCommonLog
		 * @param  {Object|String} obj 단계로그 코드 '0002' or {code:'0002'} 형태
		 *
		 // 일반적인 스텝로그
		 sfd.core.runInsertCommonLog('0002')

		 // 추가 파라메터가 있는경우 
		 sfd.core.runInsertCommonLog({
		    code : '0002',
		    connJoinCls : '',
		    birthDay : ''
		 })
		 */
		runInsertCommonLog: function( obj ) {
			var header = sfd.data.getValue('frmStepHeader');
			var mergeData = typeof obj == 'string' ? { code: obj } : obj;
			var tranName = (sfd.data.dataObject.lobCd == 'MV') ? 'insertStepCheck' : 'insertCommonLog';
			sfd.core.simpleRun(tranName, $.extend({
				'stepCode': header + mergeData.code,
				'prodCd': sfd.data.getValue('productCode'),
				'productCode': sfd.data.getValue('productCode')
			}, mergeData), function() {});
		},

		/**
		 * 보험약관 및 리플렛 PDF 보여주기
		 * @category 상품
		 * @param {String} name 보험약관 또는 리플렛 이름
		 */
		showClausesLeafletPDF: function(name) {
			// 현재 사용되지 않고 있어 주석처리. 추후 필요한 경우 풀어서 사용. by njh
			// var kindOfPDFViewer = {
			// 	terms_car: { param: 'terms_car', prdName: '자동차보험(개인용)', fileSrc: 'myanycar_personal.pdf' }
			// 	, terms_corp: { param: 'terms_corp', prdName: '자동차보험(업무용)', fileSrc: 'myanycar_business.pdf' }
			// 	, terms_bike: { param: 'terms_bike', prdName: '자동차보험(이륜차)', fileSrc: 'bike.pdf' }
			// 	, terms_mydrive: { param: 'terms_mydrive', prdName: '운전자보험', fileSrc: 'MyDrive.pdf' }
			// 	, terms_mysweethome: { param: 'terms_mysweethome', prdName: '주택화재보험', fileSrc: 'mySweetHome.pdf' }
			// 	, terms_golf: { param: 'terms_golf', prdName: '골프보험', fileSrc: 'vipgolf.pdf' }
			// 	, terms_cancer: { param: 'terms_cancer', prdName: '암보험', fileSrc: 'cancer_insu.pdf' }
			// 	, terms_realloss: { param: 'terms_realloss', prdName: '의료실비보험', fileSrc: '/docs/realloss.pdf' }
			// 	, terms_baby: { param: 'terms_baby', prdName: '어린이보험(태아)', fileSrc: 'mykids_01.pdf' }
			// 	, terms_kids: { param: 'terms_kids', prdName: '어린이보험(~15세)', fileSrc: 'mykids.pdf' }
			// 	, terms_mother: { param: 'terms_mother', prdName: '임산부보험', fileSrc: 'mother.pdf' }
			// 	, terms_annuityFD: { param: 'terms_annuityFD', prdName: '연금저축보험(무배당)', fileSrc: 'MyAnnuityFD.pdf' }
			// 	, terms_annuity: { param: 'terms_annuity', prdName: '연금저축보험(유배당)', fileSrc: 'MyAnnuity.pdf' }
			// 	, terms_save: { param: 'terms_save', prdName: '저축보험', fileSrc: 'mydream.pdf' }
			// 	, terms_travel: { param: 'terms_travel', prdName: '해외여행보험', fileSrc: 'travel.pdf' }
			// 	, terms_study: { param: 'terms_study', prdName: '해외유학보험', fileSrc: 'study.pdf' }
			// 	, terms_family: { param: 'terms_family', prdName: '해외여행보험', fileSrc: 'travel.pdf' }
			// 	, terms_intravel: { param: 'terms_intravel', prdName: '국내여행보험', fileSrc: 'inTravel.pdf' }
			// 	, terms_health: { param: 'terms_health', prdName: '건강보험', fileSrc: 'health_insu.pdf' }
			// 	, terms_dental: { param: 'terms_dental', prdName: '치아보험', fileSrc: 'dental.pdf' }
			// 	, terms_smartM: { param: 'terms_smartM', prdName: 'Smart 맞춤보장보험', fileSrc: 'smartm.pdf' }
			// 	, terms_pet: { param: 'terms_pet', prdName: '반려견보험', fileSrc: 'pet.pdf' }
			// 	, leaflet_health: { param: 'leaflet_health', prdName: '건강보험 리플렛', fileSrc: 'leaflet_health.pdf' }
			// 	, leaflet_myKids: { param: 'leaflet_myKids', prdName: '자녀보험 리플렛', fileSrc: 'leaflet_myKids.pdf' }
			// 	, leaflet_cancer: { param: 'leaflet_cancer', prdName: '암보험 리플렛', fileSrc: 'leaflet_cancer.pdf' }
			// 	, leaflet_myDrive: { param: 'leaflet_myDrive', prdName: '운전자보험 리플렛', fileSrc: 'leaflet_myDrive.pdf' }
			// 	, leaflet_mySweetHome: { param: 'leaflet_mySweetHome', prdName: '주택화재보험 리플렛', fileSrc: 'leaflet_mySweetHome.pdf' }
			// 	, leaflet_realLoss: { param: 'leaflet_realLoss', prdName: '의료실비보험 리플렛', fileSrc: 'leaflet_realLoss.pdf' }
			// 	, leaflet_dental: { param: 'leaflet_dental', prdName: '치아보험 리플렛', fileSrc: 'leaflet_dental.pdf' }
			// 	, leaflet_smartM: { param: 'leaflet_smartM', prdName: 'Smart 맞춤보장보험 리플렛', fileSrc: 'leaflet_smartm.pdf' }
			// 	, leaflet_pet: { param: 'leaflet_pet', prdName: '반려견보험 리플렛', fileSrc: 'leaflet_pet.pdf' }
			// 	, m_leaflet_health: { param: 'm_leaflet_health', prdName: '건강보험 리플렛', fileSrc: 'm_leaflet_health.pdf' }
			// 	, m_leaflet_myKids: { param: 'm_leaflet_myKids', prdName: '자녀보험 리플렛', fileSrc: 'm_leaflet_myKids.pdf' }
			// 	, m_leaflet_cancer: { param: 'm_leaflet_cancer', prdName: '암보험 리플렛', fileSrc: 'm_leaflet_cancer.pdf' }
			// 	, m_leaflet_myDrive: { param: 'm_leaflet_myDrive', prdName: '운전자보험 리플렛', fileSrc: 'm_leaflet_myDrive.pdf' }
			// 	, m_leaflet_mySweetHome: { param: 'm_leaflet_mySweetHome', prdName: '주택화재보험 리플렛', fileSrc: 'm_leaflet_mySweetHome.pdf' }
			// 	, m_leaflet_realLoss: { param: 'm_leaflet_realLoss', prdName: '의료실비보험 리플렛', fileSrc: 'm_leaflet_realLoss.pdf' }
			// 	, m_leaflet_dental: { param: 'm_leaflet_dental', prdName: '치아보험 리플렛', fileSrc: 'm_leaflet_dental.pdf' }
			// 	, m_leaflet_smartM: { param: 'm_leaflet_smartM', prdName: 'Smart 맞춤보장보험 리플렛', fileSrc: 'm_leaflet_smartm.pdf' }
			// 	, m_leaflet_pet: { param: 'm_leaflet_pet', prdName: '반려견보험 리플렛', fileSrc: 'm_leaflet_pet.pdf' }
			// }

			// var kindInfoPDF = kindOfPDFViewer[name];
			// if (kindInfoPDF.fileSrc && kindInfoPDF.fileSrc.startsWith('/') == false) { 
			// 	// 기본 경로에 있어서 파일 이름만 지정된 경우 절대 경로로 변환
			// 	kindInfoPDF.fileSrc = '/CR_MyAnycarWeb/mall/pdf/' + kindInfoPDF.fileSrc;
			// }
			// var viewerUrl = '/docs/pdfviewer.html?prdName=' + kindInfoPDF.param;
			// // var viewerTitle = "삼성화재 다이렉트 약관보기 - "+kindInfoPDF.prdName;

			var viewerUrl = '/docs/pdfviewer.html?prdName=' + name;
			if (sfd.env.deviceType == 'MO') {
				return viewerUrl;
			} else {
				window.open(viewerUrl, '', 'menubar=no, scrollbars=no, resizable=yes, status=no, top=0px,left=0px,width=825px,height=800px');
			}
		},

		/**
		 * 상품내 출력물 보여주기
		 * @category 상품
		 * @param {String} typeStr 출력물 종류 (terms: 보험약관, leaflet: 상품안내서(리플렛), policy: 보험증권, subscription: 청약서류, manual: 상품설명서, summary: 요약자료, certificate: 가입증명서)
		 * @param {String} divisionNameStr 리아 상품구분
		 */
		viewDocument: function(typeStr, divisionNameStr, subDivisionNameStr, inUnitData) {
			if (!typeStr) {
				typeStr = 'terms';
			}
			if (!inUnitData) {
				inUnitData = inUnitData || sfd.data;
			}
			if (!divisionNameStr) {
				divisionNameStr = inUnitData.getValue('divisionName');
			}
			if (!subDivisionNameStr) {
				subDivisionNameStr = inUnitData.getValue('subDivisionName') || 'indi';
			}

			
			sfd.log('productCode' + inUnitData.getValue('productCode'));

			var documentData = sfd.listValue.documentData[divisionNameStr];
			var result = '';

			// 출력물 변수값이 있으면
			if (documentData) {
				var documentValue = '';

				// 서브 상품군으로 나뉘어져 있으면
				if (documentData.indi) {
					if (typeStr == 'terms' && ['M20072000', 'M20073000'].indexOf(inUnitData.getValue('productCode')) > -1) {
						documentValue = documentData.corp[typeStr];
					} else {
						documentValue = documentData[subDivisionNameStr][typeStr];
					}
				} else {
					if (divisionNameStr == 'pet') {
						documentValue = documentData[subDivisionNameStr][typeStr];
					} else {
						documentValue = documentData[typeStr];
					}					
				}

				// PC면
				if (sfd.env.deviceType == 'PC') {
					// 새창 (이벤트 호출함수 안에서 바로 실행하지 않는 window.open() 은 팝업차단 설정에 걸려서 미리띄움)
					var windowOpen = window.open('about:blank', '', 'width=800px, height=800px, menubar=no, scrollbars=yes, toolbar=no, status=yes, location=yes, resizable=yes');
				}

				var contractNo = inUnitData.getValue('contractNo');		// 설계번호
				var policyNo = inUnitData.getValue('policyNo');			// 증권번호

				// 건강보험이면
				if (divisionNameStr == 'health') {
					// 실손묶음 상품에서 진행한 건강보험과 구분해서 값을 취함
					contractNo = inUnitData.getValue('contractNoH') || inUnitData.getValue('contractNo');
					policyNo = inUnitData.getValue('policyNoH') || inUnitData.getValue('policyNo');
				}

				// PDF 파일 타입이면
				if (typeStr == 'terms' || typeStr == 'leaflet') {
					// 모바일이면
					if (sfd.env.deviceType == 'MO') {
						// 약관
						switch (typeStr) {
							case 'terms':
								var title = '악관';
								if (inUnitData.getValue('divisionName') != 'car') {
									title = '보험약관 확인';
								}

								sfd.core.moduleDevice.showPdfView(documentValue, $(this), title);
								break;
							case 'leaflet':
								documentValue = 'm_' + documentValue;
								sfd.core.moduleDevice.showPdfView(documentValue, $(this), '상품안내서 보기');
								break;
						}
						return;

					} else {
						// 새창 URL 적용
						if (windowOpen) {
							windowOpen.location.href = '/docs/pdfviewer.html?prdName=' + documentValue;
						}
					}

				// 트랜ID 호출 타입이면
				} else {
					var paramObj = {planNo: contractNo};

					if (!(divisionNameStr == 'endo' && typeStr == 'certificate')) {
						$.extend(paramObj, {
							policyNo: policyNo
						});
					}
					
					sfd.log3('도큐먼트 트랜 호출 ~~~~~', {planNo: contractNo,	policyNo: policyNo});
					sfd.log('도큐먼트 트랜 테스트 : ', paramObj);

					sfd.server.runPage(documentValue, paramObj, function(resStr) {
						result = resStr;
						sfd.log3('도큐먼트 트랜 응답 ~~~~~', resStr);

						// 모바일이면
						if (sfd.env.deviceType == 'MO') {
							return result;

						} else {
							if (windowOpen) {
								windowOpen.document.open();
								windowOpen.document.write(result);
								windowOpen.document.close();
							}
						}
					});
				}
			} else {
				sfd.core.alert('해당 상품(' + divisionNameStr + ')에는 ' + typeStr + ' 타입에 대한 Document 정의가 없습니다.');
			}
		},

		/**
		 * 상품별 고유코드 반환
		 * @category 정보
		 * @param {String} key 고유코드 키값
		 * Key | 설명
		 * ---|---
		 * parking | 파킹 확인 코드
		 * counsel | 상담신청 코드
		 * bbs | 게시판 코드
		 * category | 게시판 카테고리 코드
		 * screen | 스플렁크 로그, 이벤트 확인(SCREENID)용 코드
		 * minAge | 최소 가입연령
		 * maxAge | 최대 가입연령
		 * label | 화면표시용 상품명
		 * @param {String} [divisionName] 상품 divisionName. 생략하면 현재 진행중인 divisionName 사용됨.
		 * @param {String} [subDivisionName] 상품 subDivisionName. 생략하면 현재 진행중인 subDivisionName 사용됨.
		 * @see 
		 * 실제 데이터는 sfd.listValue.uniqueCodeData 참고.
		 */
		getUniqueCode: function(key, divisionName, subDivisionName) {
			if (!key) {
				key = 'label';
			}
			if (!divisionName) {
				divisionName = sfd.data.getValue('divisionName');
			}
			if (!subDivisionName) {
				subDivisionName = sfd.data.getValue('subDivisionName') || 'indi';
			}

			var result;
			var uniqueData = sfd.listValue.uniqueCodeData[divisionName];

			// 상품 값이 있으면
			if (uniqueData) {
				// 서브 상품군으로 나뉘어져 있으면
				// if (uniqueData.indi) {
				if (uniqueData[subDivisionName]) {
					result = uniqueData[subDivisionName] ? uniqueData[subDivisionName][key] : undefined;
				} else {
					result = uniqueData[key];
				}
			}
			return result;
		},

		/**
		 * 공통 경로 얻기
		 * @category 정보
		 * @param {String} location 위치.
		 * 값 | 설명
		 * ---|---
		 * global | 전역 공통
		 * device | 기기 공통
		 * product | 상품 공통
		 * productSub | 하위 상품 공통 (예: 마이다이렉트 공통)
		 * @param {String} kind 위치 경로 뒤에 붙일 경로. 예) resource, popup, image, ...
		 * @return {String} 경로
		 * ```js
		 * sfd.core.getCommonPath('global', 'resource'); // => /ria/common/resource
		 * sfd.core.getCommonPath('global', 'image'); // => /ria/common/image
		 * 
		 * sfd.core.getCommonPath('device', 'resource'); // => /ria/pc/product/common/resource
		 * sfd.core.getCommonPath('device', 'popup'); // => /ria/pc/product/common/popup
		 * 
		 * // 상품이 PC 자동차인 경우
		 * sfd.core.getCommonPath('product', 'resource'); // => /ria/pc/product/car/resource

		 * // 상품이 마이다이렉트인 경우
		 * sfd.core.getCommonPath('product', 'resource'); // => /ria/mobile/product/mydirect/view/resource
		 * sfd.core.getCommonPath('productSub', 'resource'); // => /ria/mobile/product/mydirect/common/resource
		 * ```
		 */
		getCommonPath: function(location, kind) {
			var result;
			var deviceFolder = sfd.env.deviceType == 'MO' ? 'mobile' : 'pc';
			switch (location) {
				case 'product':
					var productPath = sfd.data.getValue('productPath') || sfd.data.getValue('divisionName');
					var subPath = sfd.data.getValue('subPath');
					if (subPath) {
						result = sfd.utils.joinPath(sfd.env.rootPath, deviceFolder, 'product', productPath, subPath, kind);
					} else {
						result = sfd.utils.joinPath(sfd.env.rootPath, deviceFolder, 'product', productPath, kind);
					}
					break;
				case 'productSub':
					var productPath = sfd.data.getValue('productPath') || sfd.data.getValue('divisionName');
					result = sfd.utils.joinPath(sfd.env.rootPath, deviceFolder, 'product', productPath, 'common', kind);
					break;
				case 'device':
					result = sfd.utils.joinPath(sfd.env.rootPath, deviceFolder, 'product/common', kind);
					break;
				default:
					result = sfd.utils.joinPath(sfd.env.rootPath, 'common', kind);
					break;
			}
			return result;
		},
	
		/**
		 * Module 로드 (JS 모듈)
		 * @category 모듈
		 * @param {Object} options 옵션
		 * Key | Type | 기본값 | 설명
		 * ---|---|---|---
		 * **name** | String 또는 Array | - | 모듈 이름 (.js 는 생략). 여러개 한꺼번에 로드하고 싶으면 배열로 지정.
		 * location | String 또는 Array | "global" | 모듈 위치. "global": 전역, "device": 기기, "product": 상품, "productSub": 상품 하위 공통(예: 마이다이렉트 공통)
		 * path | String 또는 Array | - | location 무시하고 특정 경로에 있는 모듈 로드하고 싶은 경우 지정.
		 * cache | Boolean | false | 모듈 경로 뒤에 캐시 방지용 cacheBust 추가함. cacheBust 넣지 않으려면 true로 지정.
		 * **onLoaded** | Function | - | 로딩 완료되었을 때 콜백
		 * onLoadError | Function | - | HTML 로딩 실패 콜백
		 * @see
		 * 여러개 한꺼번에 로드할 때 **location**이 각각 다르면 순서에 맞게 **location** 도 배열로 지정. (path 지정하는 경우도 마찬가지)
		 * location은 모두 같은 경우 그냥 String 하나로 지정 가능.
		 * 
		 * @example
		 * Global 모듈 로드
		 * ```js
		 * sfd.core.loadModule({
         *   name: 'ModuleName',
         *   onLoaded: function (module) {
         *   }
		 * });
		 * ```
		 * 
		 * 기기 공통 모듈 로드
		 * ```js
		 * sfd.core.loadModule({
         *   name: 'ModuleName',
		 *   location: 'device',
         *   onLoaded: function (module) {
         *   }
		 * });
		 * ```
		 * 
		 * 여러개 로드
		 * ```js
		 * sfd.core.loadModule({
		 *   name: ['ModuleName1', 'ModuleName2'],
		 *   location: ['global', 'device'], // 모두 같은 location인 경우 location은 그냥 String 하나로 지정 가능
		 *   onLoaded: function(module1, module2) {
		 *   }
		 * });
		 * ```
		 */
		loadModule: function(options) {
			var moduleNames = Array.isArray(options.name) ? options.name : [options.name || ''];
			moduleNames = moduleNames.map(function(name) {
				if (name.endsWith('.js')) {
					name.replace(/\.js$/, '');
				}
				return name;
			});
			var preventCaching = (options.cache !== true); // 캐시방지 처리 할지 여부

			// 모듈 경로 설정
			var moduleURLs = moduleNames.map(function(name, index) {
				var result;
				var location = Array.isArray(options.location) ? options.location[index] : options.location;
				var path = Array.isArray(options.path) ? options.path[index] : options.path;
				if (path) {
					result = sfd.utils.joinPath(path, name + '.js', preventCaching);
				} else {
					result = sfd.utils.joinPath(sfd.core.getCommonPath(location, 'resource'), name + '.js', preventCaching);
				}
				return result;
			});

			// 모듈 로드
			require(moduleURLs, function() {
				// 로그
				var modules = [];
				for (var i = 0; i < arguments.length; i++) {
					sfd.view.checkModuleLoaded({
						moduleName: moduleNames[i],
						moduleType: 'module',
						fileType: 'js',
						moduleContent: arguments[i]
					});

					modules.push(arguments[i]);
				}

				// 로드 완료 콜백
				if (options.onLoaded) {
					options.onLoaded.apply(null, modules);
				} else {
					// <STRIP_WHEN_RELEASE					
					sfd.errorLog('sfd.core.loadModule()에 onLoaded 콜백이 지정되지 않았습니다.');
					// STRIP_WHEN_RELEASE>
				}

			}, function() {
				// 로드실패 callback 
				if (options.onLoadError) {
					options.onLoadError();
				}
			});
		},

		/**
		 * 이벤트 핸들러 추가 
		 * @category 컨트롤
		 * @method addEvent
		 * @param  {Object} inEventPage      해당 객체의 페이지(this)
		 * @param  {String} inSelector       선택자
		 * @param  {String} event     이벤트 종류.
		 * @param  {String} handlerName      이벤트 핸들러 이름 (**inEventPage.events.handlerName()** 호출하게 됨)
		 * @example
		 * ```js
		 * sfd.core.addEvent(self, '#btn-sample1', 'click', 'btnSample1Click');
		 * ```
		 *  
		 * 한 element에 여러 이벤트 한꺼번에 걸기
		 * ```js
		 * sfd.core.addEvent(self, '#input-sample1', {
		 *     keydown: 'inputSample1KeyDown',
		 *     keyup: 'inputSample1KeyUp'
		 * });
		 * ```
		 */
		addEvent: function(inEventPage, inSelector, event, handlerName) {

			if (typeof inSelector == 'string') {              
				inSelector = $(inEventPage.ns + ' ' + inSelector);
			}
			
			var events = [];
			if (typeof event == 'object') {
				$.each(event, function(key, value) {
					events.push({
						name: key,
						handlerName: value
					});
				});
			} else {
				events.push({
					name: event,
					handlerName: handlerName
				})
			}
			
			$.each(events, function(index, event) {
				if (event.handlerName.includes('_')) {
					// <STRIP_WHEN_RELEASE
					alert(inEventPage.moduleName + '페이지 의 핸들러' + event.handlerName + '의 네이밍에 언더바(_)를 사용할 수 없습니다. (camelCase사용)' + sfd.core.printNamingRule());
					// STRIP_WHEN_RELEASE>
				}
				
				if (sfd.env.isDebug) {
					if (event.handlerName.includes('_')) {
						// <STRIP_WHEN_RELEASE
						alert('debugMessage16081013 : \n' + inEventPage.moduleName + '페이지 의 핸들러' + event.handlerName + '의 네이밍에 언더바(_)를 사용할 수 없습니다. (camelCase사용)' + sfd.core.printNamingRule());
						// STRIP_WHEN_RELEASE>
						return;
					}
					
					if ( inSelector.length === 0 ) {
						sfd.tracker.eventLog({
					        logType: 'etcLog',
					        code: 'client_debug_handlerError',
					        description: inEventPage.ns + '_' + event.handlerName
						});
						// <STRIP_WHEN_RELEASE
						alert('debugMessage02011117 : ' + inEventPage.ns + '에 존재하지 않는 객체에 핸들러(' + event.handlerName + ')가 걸려있어요<br/>또는 html태그가 꼬여있는지 확인해주세요.');
						// STRIP_WHEN_RELEASE>
					}
				}
			
				// page handler 
				inSelector.on(event.name, inEventPage.events[event.handlerName]);
	
			})
		},
		/**
		 * 이벤트 핸들러 제거
		 * @category 컨트롤
		 * @method removeEvent
		 * @param  {Object} inEventPage				해당 객체의 페이지(this)
		 * @param  {String} inSelector				선택자
		 * @param  {String} event					이벤트 종류 
		 * @param  {String | Array} handlerName		이벤트 핸들러 이름
		 */
		removeEvent: function(inEventPage, inSelector, event, handlerName) {
			if (typeof inSelector == 'string') {
				inSelector = $(inEventPage.ns + ' ' + inSelector);
			}

			if (Array.isArray(handlerName)) {
				$.each(handlerName, function(i, item) {
					inSelector.off(event, inEventPage.events[item]);
				});
			} else {
				inSelector.off(event, inEventPage.events[handlerName]);
			}
		},
		/**
		 * IME변경 
		 * @category 컨트롤
		 * @method setChangeIME
		 * @param  {String}     val K:한글 E:영어
		 */
		setChangeIME: function(val) {
			try {
				// document.dbgsend.setChangeIME(val);
			} catch (e) {
				sfd.log('setChangeIME err ');
			}
		},
		/**
		 * 현재 상품 DID인지 여부
		 * @category 정보
		 * @return {Boolean} DID면 true, 아니면 false
		 */
		isDID: function() {
			if (!sfd.sfdProductOptions) {
				sfd.sfdProductOptions = {};
			} // Todo: 누군가 해야함.. sfdProductOptions 이게없어서 오류나요
			return (sfd.sfdProductOptions.type == 'DID');
		},

		/**
		 * Page 객체. (로딩된 적이 있는 것만)
		 * @category 모듈
		 * @param {String} [name] Page name. 지정하지 안하면 현재 page.
		 * @return {Object} Page 객체. name 못찾거나 아직 로딩된 적이 없으면 null.
		 */
		getPage: function(name) {
			return sfd.view.getPage(name);
		},

		/**
		 * Popup 객체.(로딩된 적이 있는 것만)
		 * @category 모듈
		 * @param {String} [name] Popup name. 지정하지 않으면 현재 보여지는 popup.
		 * @return {Object} Popup 객체. name 못찾거나 아직 로딩된 적이 없으면 null.
		 */
		getPopup: function(name) {
			return sfd.view.getPopup(name);
		},

		/**
		 * Module 객체.(로딩된 적이 있는 것만)
		 * @category 모듈
		 * @param {String} name Module name.
		 * @return {Object} Module 객체. name 못찾거나 아직 로딩된 적이 없으면 null.
		 */
		getModule: function(name) {
			return sfd.view.getModule(name);
		},
		/**
		 * core showPage할때 deeplink 진행중? (deeplink중인경우 캐치 )
		 * @category 화면제어
		 * @param  {Arguments}        args 
		 * @return {Boolean} deeplink 진행중이면 true, 아니면 false
		 */
		isDeeplinkProceeding: function( args ) {
			if ( self.core.isDeeplinkBrowser() && args.length == 1 ) {
				return true;// deeplink진행 중 
			}
			return false;// deeplink비대상 또는 deeplink셋팅완료 
		},
		/**
		 * Deep Link 지원 브라우져 여부
		 * @category 화면제어
		 * @return {Boolean} 지원 브라우져면 true, 아니면 false.
		 */
		isDeeplinkBrowser: function() {
			// 10이하인경우 deeplink 패스 
			return !sfd.env.isIE10Below();
		},

		// 아래 주석은 문서용임
		/**
		 * 페이지 화면에 표시
		 * @category 화면제어
         * @method showPage
         * @param  {String} id 페이지 ID. 페이지 파일명과 동일. 또는 "next"(다음페이지), "prev"(이전페이지).
		 * @see
		 * 각 상품별 Core.js에서 구현되어 있음.
		 */

		/**
		 * 페이지 화면에 표시 (내부로직용)
		 * @category 화면제어
		 * @param {String} inName 페이지 이름
		 * @param {Object} option 옵션 (현재는 옵션 없음)
		 */
		showPage2: function(inName, option) {
			
			// 결제 미완료인경우 비정상으로 showPage('next') 방지
			if (inName == 'next' &&
				['car'].includes(sfd.data.dataObject.divisionName) &&
				sfd.data.getValue('currPageName') == 'Payment' &&
				!sfd.data.getValue('clearingData')) {
				return;
			}
			sfd.core.focusblur();

			// sfd.core.showLoading('loading-common',{isBlank:true, timer: 300});
			sfd.core.showLoading('loading-common', {isBlank: true, timer: 300});
			sfd.data.dataObject.showPageOption = option;
			if ( sfd.env.deviceType == 'PC' ) {
				sfd.core.hideSmartHelp();
			}

			// 변수 변환 됨으로 임시저장
			var oldInName = inName;

			// inName이 next, prev, historyBack 인 경우 실제 page name으로 변환
			inName = sfd.view.resolvePageName(inName);

			sfd.log('sfdExtend showPage2 resolvePageName', inName)

			// 안드로이드일 경우 먼저체크{
			if (sfd.env.deviceType == 'MO' && sfd.env.isApp && sfd.env.os.group == 'Android') {
				var currPageName = sfd.view.getPageName();
				if (oldInName == 'prev' && inName === null && (currPageName.indexOf('Front') > -1)) {
					sfd.core.gotoHomepage();
					return;
				}
			}

			// inName값이 없으면 리턴
			if (!inName) {
				return;
			}

			// 딥링크 지원 체크
			/*
			if (['example', 'document', 'airport'].includes(sfd.data.getValue('productPath')) == false) {
				sfd.view.changeView(inName);
				return;
			}
			*/

			if ( !self.core.isDeeplinkBrowser() ) { // IE7이하 Deeplink지원이 안되는 경우 
				sfd.view.changeView(inName);
				return;
			}

			var _currDeeplink = sfd.history.deeplink.getState().data.state;
			sfd.log('showPage-currPageName ' + _currDeeplink + ' , ' + inName);

			// 현재 페이지 인 경우 return;
			// IE7bug deeplink bug (둘 다 null인 경우)
			if ( !_currDeeplink && !inName ) {
				return;
			}
			if ( _currDeeplink == inName ) { // 주소가 변경되여 페이지를 보여줄 경우( Step2/2 )
				this.showPageDeeplink(inName);
			} else { // 주소변경을 위한 히스토리 setting( Step1/2 )
				sfd.history.showPage(inName);
			}
		},
		/**
		 * 페이지 이동
		 * @category 화면제어
		 * @param {String} inName 이동할 페이지 이름
		 */
		showPageDeeplink: function(inName) {
			
			sfd.view.changeView(inName);
			sfd.core._isDeeplinkNormal = 'none';
		},

		// <STRIP_WHEN_RELEASE
		/**
		 * 네이밍 룰 안내 문구
		 * @category 개발 가이드
		 * @return {String} 안내 문구
		 */
		printNamingRule: function() {
			return '\n\nhtml Class 및 ID : btn-next-recent \n 이미지 : btn-next-recent.png\n js 변수 및 메소드 : btnNextRecent'
		},
		// STRIP_WHEN_RELEASE>

		/**
		 * 지정한 index의 Step View로 전환
		 * @category 화면제어
		 * @param {String|Object} container Step View selector 또는 jQuery object. ex) $('.stepview')
		 * @param {Integer} index 보여줄 Step View index.
		 * @param {Boolean} [animated=true] 애니메이션 사용할지 여부.
		 * @param {Function} [callback] 화면 전환 완료 callback
		 */
		showStep: function(container, index, animated, callback) {
			sfd.view.showStep(container, index, animated, callback);
		},

		/**
		 * sfd.core.showStep() 로 변경됨. (deprecated)
		 * @category 화면제어
		 */
		showSubpage: function(container, index, animated, callback) {
			sfd.view.showSubpage(container, index, animated, callback);
		},

		/**
		 * Dropdown 만들기
		 * @category 컨트롤
		 * @param {Object} option 옵션
		 * 옵션|Type|설명
		 * ---|---|---
		 * target|String 또는 Object|Dropdown으로 만들 container의 selector 또는 element object.
		 * items|Array|목록 구성할 항목들의 배열. {label: '라벨', value: 'A'} 형태의 항목을 가진 배열.
		 * defaultText|String|값 미지정 상태(null)의 텍스트. 지정 안한경우 '선택'
		 * placement|String|'top'으로 지정한 경우 위로 목록이 나옴. 기본은 'down'
		 * width|Integer 또는 String|목록 박스 넓이. 숫자로 넣는경우 px 단위. %로 넣고 싶으면 '80%' 형태로
		 * height|Integer 또는 String|목록 박스 높이. 숫자로 넣는경우 px 단위. %로 넣고 싶으면 '80%' 형태로
		 * scrollTo|String|선택된 값이 없을 때 scroll 시켜서 보여줄 항목의 value.
		 */
		makeDropdown: function(option) {
			return sfd.view.makeDropdown(option);
		},

		/**
		 * Dropdown 목록 변경
		 * @category 컨트롤
		 * @param {Object} option 변경 옵션
		 * 옵션|Type|설명
		 * ---|---|---
		 * target|String 또는 Object|변경할 Dropdown selector 또는 element object.
		 * items|Array|[{label: 'SKT', value: '1'}, {label: 'KT', value: '2'}, ...] 형태의 배열
		 * updateValue|Boolean|기존 설정된 값이 새 items에 없는 경우 Dropdown에 설정된 값 reset 처리할지 여부.
		 */
		updateDropdownList: function(option) {
			return sfd.view.updateDropdownList(option);
		},

		/**
		 * Dropdown 옵션 변경 (현재는 defaultText만 지원)
		 * @category 컨트롤
		 * @param {Object} options Dropdown 옵션
		 * Key|Type|Default|설명
		 * ---|---|---
		 * target|String 또는 Object|-|변경할 Dropdown selector 또는 element object.
		 * defaultText|String|"선택"|선택된 값 없을 때 기본 텍스트.
		 */
		updateDropdown: function(options) {
			sfd.view.updateDropdown(options);
		},

		// 아래 주석은 문서용임
		/**
		 * 팝업 열기
		 * @category 화면제어
		 * @method showPopup
		 * @param {String} id 팝업ID. 팝업 파일명과 동일.
		 * @param {Object} [options] 팝업에 전달할 데이터, 콜백함수 등
		 * Key | Type | 설명
		 * ---|---|---
		 * focusButton | String 또는 Object | 팝업 닫힌 후 focus 처리할 요소의 selector 또는 jQuery object. 
		 * message | String 또는 Array | alert 타입의 팝업에서 메시지.
		 * closeHandler | Function | 닫힘 콜백
		 * 팝업에 전달 필요한 data 추가 가능
		 * @see
		 * 각 상품별 Core.js에서 구현되어 있음.
		 */
		
		/**
		 * 팝업 열기 (내부로직용)
		 * @category 화면제어
		 * @method showPopupEx
		 * @param  {String}  name   팝업 클래스 이름
		 * @param  {Object}  [options] 팝업에 전달할 객체(변수, callback함수 등)
		 * @see
		 * 내부적으로 3번째 인자 사용 중이니 3번째 인자 추가하려면 확인 필요함.
		 */
		showPopupEx: function(name, options) {
			sfd.view.showPopup(name, options);
		},

		/// <화면제어> sfd.view.popupContentsLoaded() 사용하세요. (deprecated)
		modalContentsLoaded: function(popup) {
			sfd.view.popupContentsLoaded(popup);
		},

		// 아래 주석은 문서용임
		/**
		 * Alert
		 * @category 화면제어
		 * @method alert
		 * @param {String|Array} message 메시지 또는 메시지 코드(Sfd.message.js 참고). (PC에서는 String으로만 사용)
		 * @param {Object} [options] 옵션.
		 * Key | Type | 기본값 | 설명
		 * ---|---|---|---
		 * closeHandler | Function | - | 확인 버튼 눌림 콜백 함수
		 * focusButton | jQuery Object 또는 String | - | Alert 닫히고 focus 될 element. (접근성 처리 등)
		 * debugMsg | String | - | 디버깅용으로 메시지에 추가할 내용. 통테계/운영계 반영때는 안나옴.
		 * okTitle | String | "확인" | 확인 버튼 Label을 다른 것으로 하고 싶을 때 지정.
		 * 
		 * PC용 옵션
		 * Key | Type | 기본값 | 설명
		 * ---|---|---|---
		 * width | Number | - | Alert 너비를 특정 길이로 지정하고 싶을 때 사용
		 *
		 * Mobile 옵션
		 * Key | Type | 기본값 | 설명
		 * ---|---|---|---
		 * titleText | String | - | Alert 제목.
		 * textAlign | String | "left" | 메시지 정렬. "left", "center", "right".
		 * cancelTitle | String | - | 취소 버튼 추가하고 싶은 경우 Title 지정.
		 * position | String | - | "row"로 지정하면 확인, 취소 버튼이 위 아래로 배치됨.
		 * isDot | Boolean | false | 메시지 List 사용하는 경우. 각 메시지 앞에 Bullet 표시할지 여부.
		 * @see
		 * 각 상품별 Core.js에서 구현되어 있음.
		 */

		// 아래 주석은 문서용임
		/**
		 * confirmAlert
		 * @category 화면제어
		 * @method confirmAlert
		 * @param {String|Array} message 메시지. (PC에서는 String으로만 사용)
		 * @param {Object} [options] 옵션.
	 	 * Key | Type | 기본값 | 설명
 		 * ---|---|---|---
		 * closeHandler | Function | - | 확인 버튼 눌림 콜백 함수
		 * focusButton | jQuery Object 또는 String | - | Alert 닫히고 focus 될 element. (접근성 처리 등)
		 * okTitle | String | "확인" | 확인 버튼 사용자 정의 Title.
		 * cancelTitle | String | "취소" | 취소 버튼 사용자 정의 Title.

		 * PC용 옵션
		 * Key | Type | 기본값 | 설명
		 * ---|---|---|---
		 * width | Number | - | Alert 너비를 특정 길이로 지정하고 싶을 때 사용

		 * Mobile 옵션
		 * Key | Type | 기본값 | 설명
		 * ---|---|---|---
		 * titleText | String | - | Alert 제목.
		 * textAlign | String | "left" | 메시지 정렬. "left", "center", "right".
		 * cancelTitle | String | - | 취소 버튼 추가하고 싶은 경우 Title 지정.
		 * position | String | - | "row"로 지정하면 확인, 취소 버튼이 위 아래로 배치됨.
		 * isDot | Boolean | false | 메시지 List 사용하는 경우. 각 메시지 앞에 Bullet 표시할지 여부.
		 * @see
		 * 각 상품별 Core.js에서 구현되어 있음.
		 */

		// 아래 주석은 문서용임
		/**
		 * 팝업 닫기
		 * @category 화면제어
		 * @method hidePopup
		 * @param {String} id 팝업ID. 팝업 파일명과 동일.
		 * @see
		 * 각 상품별 Core.js에서 구현되어 있음.
		 */

		/**
		 * 팝업 닫기 (내부로직용)
		 * @category 화면제어
		 * @param {String|Object} name 팝업 이름 또는 팝업 object
		 */
		hidePopupEx: function(name) {
			if (sfd.core.isDID()) {
				sfd.core.popoverAllClose();
				sfd.page.Popup.off();
			} else {
				var popup = typeof name == 'string' ? sfd.core.getPopup(name) : name;
				if (popup) {
					popup.off();
				}
			}
		},
		
		/**
		 * Modal 닫기 시작
		 * @category 화면제어
		 * @param {Object} modal Modal 객체
		 */
		modalContentsHideStart: function(modal) {
			sfd.view.hidePopup(modal.moduleName);	
		},

		/// <안쓰임> 각종 서식 출력 
		formatPrint: function() {
			
		},
		/**
		 * 사용자 입력 정합성 확인 (deprecated)
		 * @category 안쓰임
		 * @param {String} inPage 안쓰임
		 * @param {*} inSelector 검사할 element selector 또는 jQuery element
		 * @param {Bool} guide 메시지 가이드 여부. true 안내 메시지, false면 정합성 결과만 반환
		 * @param {Function} callback 검사 완료 callback 함수
		 * @see
		 * TODO: 확인 후 삭제
		 */
		checkValidate: function( inPage, inSelector, guide, callback ) {

			if (typeof inSelector == 'string') {
				inSelector = $(inPage.ns + ' ' + inSelector);
			}
			return sfd.view.checkValidateV( inSelector, guide, callback );
		},
		/*
		 * 팝오버 보이기 
		 * @method popover
		 * @param  {Object} obj    대상객체
		 * @param  {Object} option {
				'placement':'top', 말풍선 위치
				'content':'메세지'   말풍선 메세지
			}
			* @return {void}        
			*/
		// popover: function(obj, option) {
		//     sfd.core.popoverAllClose();
		//     $(obj).data('mainWidth', sfd.data.dataObject.mainWidth);
		//     $(obj).attr('data-toggle', 'popover');
		//     $(obj).attr('data-toggle-create', 'dynamic');// 원래 들어있는 속성과 구분하기 위해 추가(다이나믹생성은 distory로 제거)
		//     $(obj).attr('data-container', 'body');
		//     $(obj).attr('data-placement', 'top');
		//     $(obj).attr('data-content', '필수 입력항목 입니다.');
		//     if (option && option.placement) $(obj).attr('data-placement', option.placement);
		//     if (option && option.content) $(obj).attr('data-content', option.content);
		//     $('[data-toggle=popover]').on('shown.bs.popover', function() {

		//     })
		//     setTimeout(function() {
		//         $(obj).popover('show');
		//     }, 100);

		//     // data-container="body" data-toggle="popover" data-placement="top" data-content="Vivamus sagittis lacus vel augue laoreet rutrum faucibus."
		// },
		/**
		 * 모든 툴팁 닫기
		 * @category 화면제어
		 * @param {Object} [e] 이벤트객체
		 */
		tooltipAllClose: function(e) {
			$('[role=tooltip]').filter(function( index ) {
				// 근접도움말은 걸러낸다 
				var _c = '';
				if ( $(this).data()['bs.popover'] && $(this).data()['bs.popover'].options.container ) {
					_c = $(this).data()['bs.popover'].options.container;
				}
				return ( _c != '#shell-comm-container')
			}).remove();

		},

		/**
		 * 팝오버 모두 닫기
		 * @category 화면제어
		 * @method popoverAllClose
		 * @param {Object} [e] 이벤트객체
		 */
		popoverAllClose: function(e) {
			// wrapper에 넣은 dropdown도 닫기
			$('#wrapper > .dropdown-menu').each(function() {
				if (!e || (e && e.target && $(e.target).closest('.dropdown-menu').length == 0)) {
					var $dropdown = $(this).data('sfd-dropdown');
					if ($dropdown) {
						if (!e || $dropdown.is($(e.target).closest('.dropdown-container')) == false) {
							var $button = $dropdown.find('.dropdown-toggle');
							$button.trigger('click');
						}
					}
				}
			});

			if (!e) {
				$(document).trigger('sfd.close-all-float'); // 이 이벤트 받는 모든 떠다니는 요소들 닫힐 수 있도록
			}

			// 나머지 popover
			var $popovers = $('*[data-toggle="popover"]');

			if ($popovers.length == 0) {
				return;
			}

			// popover가 있는 경우 각각 $tip객체가 열려있는지 조사
			$popovers.each(function () {				
				// 해당 버튼에 해당하는 근접도움말이 있는경우 해당 근접도움말의 상태 체크를 해서 열려있으면 클릭을 한번 더 발생시켜서 토글 방식으로 종료

				var $btn = $(this);
				var $tip = $btn.data('bs.popover') ? $btn.data('bs.popover').$tip : null;
				if ($tip && $tip.hasClass('in')) {
					// 열린 경우 
					if (e && e.target && $(e.target) && // 타겟이 존재하고 
						( 
							$(e.target).closest('[role="tooltip"]').length > 0 || // 근접도움말 안에서 클릭이면 종료안함 
							$(e.target).attr('data-content') == $btn.attr('data-content')// 마우스다운의타겟이 동일하면 종료안함(결국 마우스업(클릭)에서 종료됨-토글방식)
						) ) {
						// 종료를 안하는 경우 
					} else {
						// 종료(토글)
						$btn.trigger('click');
					}						
				}				
			});

			// 버튼이 없는 근접도움말 종료 
			$('.popover.fade.in').each(function() {
				
				var $this = $(this);
				// 열린 경우 
				if (e && e.target && $(e.target) && // 타겟이 존재하고 
					( 
						$(e.target).closest('.popover.fade.in').length > 0 
					) ) {
					// 종료를 안하는 경우 
				} else if ( $this.find('.sfd-icon-close').length == 0 ) {
					$this.hide();
				}
			})
		},

		/**
		 * 페이지/팝업 컨텐츠 HTML 에서 템플릿으로 사용할 elment 들을 뽑아서 page.htmlTemplate 에 저장.
		 * @category 화면제어
		 * @param {Object} page 페이지 object
		 * @see
		 * 페이지/팝업 js `on` 함수 처음에 호출.
		 * HTML에서 template 클래스 가진 요소들을 page.htmlTemplate에 저장하고 HTML에서 제거됨.
		 * template 클래스 가진 요소들은 page.htmlTemplate에 저장할 이름을 data-template-name 속성으로 지정
		 * 
		 * ```html
		 * <li class="template" data-template-name="list-item">
		 *     <button type="button"><strong>{{label}}</strong></button>
		 * </li>
		 * ```
		 * 
		 * ```js
		 * $('#list').empty().appendTemplate({
		 *     template: self.htmlTemplate['list-item'],
		 *     ...
		 * })
		 * ```
		 */
		buildHTMLTemplate: function(page) {
			// if (page.htmlTemplate && page.htmlTemplate.length > 0) {
			// 	return;
			// }
			var $view = $(page.ns);
			var $templates = $view.find('.template');
			$templates.each(function() {
				var $template = $(this);
				var name = $template.attr('data-template-name');
				if (!name) {
					return;
				}

				if (!page.htmlTemplate[name]) {
					$template
						.remove() // HTML에서 제거
						.removeClass('template') // template class 제거
						.removeAttr('data-template-name');  // template 속성 제거

					page.htmlTemplate[name] = $template; // 저장
				} else {
					// 이미 같은 템플릿 넣은 상태면 그냥 제거
					$template.remove();
				}
			});

			// <template> 지원
			$templates = $view.find('template');
			$templates.each(function() {
				var $template = $(this);
				var name = $template.attr('data-name');
				if (!name) {
					return;
				}
				$template.remove();
				if (!page.htmlTemplate[name]) {					
					page.htmlTemplate[name] = $template; // 저장
				}
			});
		},

		/// <안쓰임>
		showNoClick: function() {

		},
		/// <안쓰임>
		hideNoClick: function() {

		},

		// 아래 주석은 문서용임
		/**
		 * 로딩 Indicator 보이기
		 * @category 화면제어
		 * @method showLoading
		 * @param {String} [id="loading-common"] 로딩 indicator ID. 지정 안하면 기본 로딩 indicator 보여줌.
		 * @param {Object} [options] 옵션.
		 * Key | Type | 기본값 | 설명
		 * ---|---|---|---
		 * isBlank | Boolean | false | 화면 클릭 막을때 로딩은 안보이고 막만 생기게 하는 용도로 사용.
		 * timer | Number | - | 특정시간 후에 자동으로 닫힘. 1000이 1초.
		 * @see
		 * 각 상품별 Core.js에서 구현되어 있음.
		 */

		/**
		 * 로딩 Indicator 보이기 (내부로직용)
		 * @category 화면제어
		 * @method showLoadingEx
		 * @param  {String}    [id="loading-common"] 로딩 indicator ID
		 * @param  {Object}    [options] 옵션
		 * Key | Type | 기본값 | 설명
		 * ---|---|---|---
		 * isBlank | Boolean | false | 아무것도 보이지 않고 투명하게 화면 가리기만 하는 로딩 여부.
		 * timer | Integer | 0 | 특정 시간 뒤에 자동으로 닫히도록 하고 싶을 때 지정.
		 */
		showLoadingEx: function(id, options) {
			id = (typeof id == 'object' || !id) ? 'loading-common' : id;
			options = (typeof id == 'object' && !options) ? id : options;
			options = $.extend({
				isBlank: false,
				timer: 0
			}, options);
			/*var _tag = '';
			if(inOption)_tag = inOption.tag;*/

			// if (sfd.data.dataObject.divisionName == 'mydirect') {
			// 	$global.uiLoading({ visible: true });
			// 	return;
			// }
			
			var $loading = $('#' + id);

			// 기본로딩인 경우 그냥 오픈
			if (id == 'loading-common') {
				// 투명 로딩 체크 
				if (options.isBlank) {
					$loading.children('.loading-contents').css('opacity', 0);
				} else {
					$loading.children('.loading-contents').css('opacity', 1);
				}
				// 타이머 체크 
				if (options.timer) {
					setTimeout(function() {
						$loading.hide();
					}, options.timer);
				}

				// $('#' + inName).show();
				$loading.css({
					'display': 'inline-block',
					'opacity': 0
				}).stop().animate({
					opacity: 1
				}, 500);

				/*if (sfd.env.screenReader) {
					$target.focus();
				}*/
				
			} else {
				$loading.css('opacity', 1).show();
				// 타이머 체크
				if (options.timer) {
					setTimeout(function() {
						$loading.hide();
					}, options.timer);
				}
			}/*else {
				$('#' + inName).modal({
					backdrop: false,
					keyboard: (sfd.env.isDebug) ? true : false
				});
			}*/

		},
		/// <화면제어> 로딩 센터로 보내기 
		loadingResize: function() {
			var $window = $(window);
			if ( sfd.env.deviceType != 'MO' ) {
				$('#shell-loading').offset({
					left: $window.width() / 2 - $('#shell-loading').width() / 2,
					top: $window.height() / 2 - $('#shell-loading').height() / 2
				});
			} else {
				$('#shell-loading').offset({
					left: $window.width() / 2 - $('#shell-loading').width() / 2,
					top: sfd.data.dataObject.mainHeight / 2 - $('#shell-loading').height() / 2
				});
			}
			// sfd.log(sfd.data.dataObject.mainHeight,sfd.data.dataObject.mainHeight/2 , $('#modules').height(),$('#modules').height()/2);
			
			// sfd.log($(window).width()/2 - $('#shell-loading').width()/2,sfd.data.dataObject.mainHeight/2 - $('#shell-loading').height()/2);
		},

		// 아래 주석은 문서용임
		/**
		 * 로딩 Indicator 닫기
		 * @category 화면제어
		 * @method hideLoading
		 * @param {String} [id="loading-common"] 로딩 indicator ID. 지정 안하면 기본 로딩 indicator 닫음.
		 * @param {Object} [options] 옵션
		 * Key | Type | 기본값 | 설명
		 * ---|---|---|---
		 * animated | Bool 또는 Integer | true | 애니메이션 처리할지 여부 또는 애니메이션 시간. 기본 애니메이션 시간은 500.
		 * @see
		 * 각 상품별 Core.js에서 구현되어 있음.
		 */

		/**
		 * 로딩 Indicator 닫기 (내부로직용)
		 * @category 화면제어
		 * @method hideLoadingEx
		 * @param {String} [id="loading-common"] 로딩 indicator ID.
		 * @param {Object} [options] 옵션
		 * Key | Type | 기본값 | 설명
		 * ---|---|---|---
		 * animated | Bool 또는 Integer | true | 애니메이션 처리할지 여부 또는 애니메이션 시간. 기본 애니메이션 시간은 500.
		 */
		hideLoadingEx: function(id, options) {
			id = (typeof id == 'object' || !id) ? 'loading-common' : id;
			options = (typeof id == 'object' && !options) ? id : options;
			options = $.extend({
				animated: true
			}, options);
			// if (sfd.data.dataObject.divisionName == 'mydirect') {
			// 	$global.uiLoading({ visible: false }); 
			// 	return;
			// }

			if (id.substr(0, 4) == 'tag_') {
				id = 'loading-common';
			}
			/*if (id) {
				$('#' + id).modal('hide');
				$('#' + id).hide();
				return;
			}else{*/

			// visible 이 켜진 경우만 닫기
			$('.modal-loading:visible').modal('hide');
			var $loading = $('#' + id);
			var duration = options.animated === true ? 500 : (typeof options.animated == 'number' ? options.animated : 0);
			$loading.stop().animate({ opacity: 0 }, duration, function() {
				$loading.css({ 'display': 'none' });
			});
		},
		/**
		 * Control의 값 get/set
		 * @category 컨트롤
		 * @method elValue
		 * @param {String|Object} el 대상객체 selector 또는 object.
		 * @param {Any} [value] 설정할 값. (set으로 사용할 때만 지정)
		 * @param {Boolean} [triggerEvent=true] 이벤트 발생시킬지 여부. true면 el의 값이 변경되었을 경우 change 이벤트 발생시킴.
		 * @param {Any} [data] 값 설정할 때 추가로 필요한 정보 있을 때 사용. (Dropdown 사용자 입력 값 설정 같은 경우)
		 * @return {Any} get으로 사용할 때 element의 값 반환.
		 * @see
		 * 값 설정할 때 값이 기존 값과 다르면 change 이벤트가 발생하도록 되어 있으니 이 점 주의해서 사용.
		 */
		elValue: function(el, value, triggerEvent, data) {
			if (arguments.length > 1) {
				sfd.view.val(el, value, triggerEvent, data);
			} else {
				return sfd.view.val(el);
			}
		},

		/// <안쓰임>
		chkCaller: function(arg) {
			// 기능 삭제
			// return true;
			// sfd.log('arg.callee.caller',arg)
			

			// return true;
			// try {
			//     if (arg.callee.caller == null) {
			//         var isDebug = (sfd.env.parameters.debug > 0) ? true : false;
			//         if (
			//             // sfd.env.server != 'local' &&// 로컬이 아니고 
			//             isDebug == false // 디버그모드도 아니면 
			//         ) {
			//             console.error(sfd.message.console0001)
			//             sfd.core.alert(sfd.message.console0001);
			//             return false;
			//         }
			//         return true;
			//     }
			// } catch (e) {

			// }


			return true;
		},		

		/**
		 * 키보드보안/보안키패드 적용 필요한 input 필드 있는 form 초기화.
		 * @category 보안
		 * @param {String|Object} form 적용할 form id, selector 또는 jQuery object.
		 * @param  {Boolean} [isKeypad=true]	보안키패드 적용여부
		 * @see
		 * form 안에 자동 생성되는 .nppfs-elements, .nppfs-keypad-div 제거하고 초기화 시킴.
		 */
		initSecureForm: function(form, isKeypad) {
			if (isKeypad === undefined) {
				isKeypad = true;
			}
			if (typeof form == 'string' && /^[a-zA-Z0-9\-_]+$/.test(form) && form != 'form') {
				form = '#' + form; // selector가 아니고 id만 넣은 경우
			}
			var $form = (form instanceof jQuery) ? form : $(form);
			
			$form.find('.nppfs-elements').empty();
			$form.find('.nppfs-keypad-div').remove();

			if (typeof npPfsStartupV2 !== 'undefined') {
				window.npPfsStartupV2($form.get(0), [false, false, false, isKeypad, false, false]);
			}
		},

		/**
		 * 키보드보안/보안키패드 사용할 필드들 모두 검색해서 초기화함. (기존 초기화 되었던 것들은 제외)
		 * @category 보안
		 * @param {String|Object} [form] 특정 요소만 하고 싶은 경우 요소가 속한 form id, selector 또는 jQuery Object
		 * @param {String|Object} [field] 특정 요소만 하고 싶은 경우 요소의 id, selector 또는 jQuery Object
		 * @see
		 * 키보드보안/보안키패드 사용하는 input 동적으로 추가한 경우 사용
		 * form, field 지정 안하면 현재 페이지 전체 검색해서 초기화 안된것들 초기화함
		 */
		initSecureField: function(form, field) {
			// <STRIP_WHEN_RELEASE
			if (sfd.env.server == 'local' ) {
				return; // 로컬에서는 아무것도 하지 않음
			}
			// ci 오토 테스트 지원 처리 
			if (sfd.env.none2e) {
				return;
			}
			// STRIP_WHEN_RELEASE>

			if (!window.npPfsCtrl) {
				return;
			}

			if (form && field) {
				// 지정한 요소만 초기화
				if (typeof form == 'string' && /^[a-zA-Z0-9\-_]+$/.test(form) && form != 'form') {
					form = '#' + form; // selector가 아니고 id만 넣은 경우
				}	
				var $form = (form instanceof jQuery) ? form : $(form);
				if (typeof field == 'string' && /^[a-zA-Z0-9\-_]+$/.test(field) && field != 'input') {
					field = '#' + field; // selector가 아니고 id만 넣은 경우
				}	
				var $field = (field instanceof jQuery) ? field : $(field);
				window.npPfsCtrl.RegistDynamicField($form.get(0), $field.get(0));
			} else {
				// 전체 재검색
				window.npPfsCtrl.RescanField();
			}
		},

		/**
		 * 키보드보안/보안키패드가 적용된 form 의 NOS hidden 필드값 가져오기
		 * @category 보안
		 * @param  {String|Object} form 키보드보안/보안키패드 적용된 form id, selector 또는 jQuery object.
		 * @return {Object} NOS hidden 필드 값들.
		 * 반환값 예
		 * 
		 * ```js
		 * {
		 *   __E2E_KEYPAD__: '1f0blkjsf837sdflkj39872394dslfjf123...',
		 *   __E2E_RESULT__: '1eb987sdlfj3297sdfjsljflkj3l4jsd98f...',
		 *   __E2E_UNIQUE__: '15121413213232',
		 *   __KH_b1a23984729347fd: '',
		 *   __KI_designJuminNo2: 'ab341lkjdlfjs9f87194ul1jelsjlfjf...',
		 *   __KU_b1a23984729347fd: 'N'
		 * }
		 * ```
		 * 
		 * @example
		 * ```js
		 * sfd.core.getSecureFieldData('ssn-form');
		 * ```
		 */	
		getSecureFieldData: function(form) {
			var result = {};
			if (typeof form == 'string' && /^[a-zA-Z0-9\-_]+$/.test(form) && form != 'form') {
				form = '#' + form; // selector가 아니고 id만 넣은 경우
			}	
			var $form = (form instanceof jQuery) ? form : $(form);

			$form.find('.nppfs-elements input[type="hidden"]').each(function(i) {
				var $field = $(this);
				result[$field.attr('name')] = $field.val();
			});
			return result;
		},

		/**
		 * 단말정보수집용 값 추가/설정
		 * @category 단말정보수집
		 * @param {String} name 키 이름
		 * @param {String} value 정보 값
		 */
		setDeviceInfo: function(name, value) {
			var selector = '#nos-device-info-form input[type="hidden"][name="' + name + '"]';
			if ($(selector).length == 0) {
				$('#nos-device-info-form').append('<input type="hidden" name="' + name + '" value="' + value + '" />');
			} else {
				$(selector).val(value);
			}
		},

		/**
		 * 단말정보수집용 data 얻기
		 * @category 단말정보수집
		 * @return {Object} 단말정보수집용 data.
		 */
		getDeviceInfo: function() {
			var result = {};
			$('#nos-device-info-form input[type="hidden"]').each(function(i) {
				var $field = $(this);
				result[$field.attr('name')] = $field.val();
			});
			return result;
		},
		
		/**
		 * sfd.view.form('#form').init() 사용하세요. (deprecated)
		 * @category Form Validation
		 * @param {String|Object} form Form selector 또는 jQuery object.
		 * @param {Object} [option] 옵션
		 * Key|Type|설명
		 * ---|---|---
		 * validationThreshold | Integer | 텍스트 입력의 경우 몇 글자 이상 입력되었을 때 실시간 검사 할지. 기본값 1
		 * live | Bool | 실시간 검사할지 여부. 다음 버튼 활성화/비활성화 처리만 필요해도 true 설정해야함. 기본값 true
		 * liveUpdateUI | Bool | 실시간 검사 후 UI 업데이트 할지 여부. 기본값 false.
		 * button | String 또는 Object | Validation 성공/실패시 업데이트 할 버튼의 selector 또는 jQuery object.
		 * excludeDisabled | Bool | disabled 된 입력필드는 확인하지 말지 여부. 기본값 false (disabled도 확인함)
		 * onValidate | Function | 기본 Validation 완료 후 최종 결과 처리하기 전 콜백.<br>function(isValid) {}. 콜백에서 return false 하면 검사 실패로, true로 하면 검사 성공으로 처리됨.
		 * onLiveValidated | Function | 실시간 검사 Validation 완료 콜백.<br>function(isValid) {}
		 * onButtonStateChange | Function | 버튼 상태 변경(enabled/disabled) 될 때 콜백. `sfd.core.initFormValidation()` 함수 호출할 때 일단 한번은 무조건 발생.<br>function(isEnabled) {}
		 * @see
		 * 페이지 로딩될 때 값들 미리 채우는 로직이 있다면, 해당 작업이 완료된 후에 이 함수를 호출해주세요.
		 * hidden 처리된 input은 validation에서 제외됨.
		 * disabled 처리된 input은 options.excludeDisabled로 설정 가능.
		 */
		initFormValidation: function(form, option) {
			sfd.view.form(form).init(option);
		},

		/**
		 * sfd.view.form('#form').refresh() 사용하세요. (deprecated)
		 * @category Form Validation
		 * @param {Object} [option] 옵션. 자세한 설명은 initFormValidation() 함수 참고
		 * @param {String|Object} form From selector 또는 jQuery object.
		 */
		refreshFormValidation: function(form, option) {
			sfd.view.form(form).refresh(option);
		},

		/**
		 * sfd.view.form('#form').destroy() 사용하세요. (deprecated)
		 * @category Form Validation
		 * @param {String|Object} form From selector 또는 jQuery object.
		 */
		destroyFormValidation: function(form) {
			sfd.view.form(form).destroy();
		},

		/**
		 * sfd.view.form('#form').reset() 사용하세요. (deprecated)
		 * @category Form Validation
		 * @param {String|Object} form From selector 또는 jQuery object.
		 */
		resetFormValidation: function(form) {
			sfd.view.form(form).reset();
		},

		/**
		 * sfd.view.form('#form').validate({ live: true }) 사용하세요. (deprecated)
		 * @category Form Validation
		 * @param {String|Object} form From selector 또는 jQuery object.
		 * @see
		 * change 이벤트 발생 안하는 조건 등에서 이 함수를 호출하면 validation 확인 후 연결 버튼 업데이트 처리 함.
		 */
		validationFormChanged: function(form) {
			sfd.view.form(form).validate({ live: true });
		},
		
		/**
		 * sfd.view.form('#form').reset(field) 사용하세요. (deprecated)
		 * @category Form Validation
		 * @param {String|Object} form Field selector 또는 jQuery object.
		 */
		resetFieldValidation: function (field) {
			if (!field) {
				return;
			}

			var $form = $(field).closest('form');
			if ($form.length == 0) {
				return;
			}

			sfd.view.form($form).reset(field);
		},

		/**
		 * sfd.view.form('#form').validate() 사용하세요. (deprecated)
		 * @category Form Validation
		 * @param {String|Object} form Form selector 또는 jQuery object.
		 * @param {Object} [option] 옵션
		 * Key | Type | Default | 설명
		 * ---|---|---|---
		 * group | String | null | 특정 그룹만 Validation 하는 경우.<br>입력필드 태그에 `data-parsley-group="group1"` 또는 `data-parsley-group="['group1', 'group3']"` 처럼 여러그룹 지정 가능.
		 * updateUI | Boolean | true | Validation 실패했을 때 UI 업데이트 할지 여부.
		 * onFailed | Function | null | 기본 validation 실패했을 때 실패한 jQuery element 목록 전달. function(invalidElements) {}
		 * onCustomValidationFailed | Function | null | initFormValidation 할 때 onValidate 콜백에서 실패 반환하는 경우
		 * @return {Boolean} Validation 성공한 경우 true. 실패한 경우 false.
		 */
		validateForm: function(form, option) {
			return sfd.view.form(form).validate(option);
		},

		/**
		 * sfd.view.form('#form').isValid() 사용하세요. (deprecated)
		 * @category Form Validation
		 * @param {String|Object} form Form selector 또는 jQuery object.
		 * @param {Object} [option] 옵션
		 * Key | Type | Default | 설명
		 * ---|---|---|---
		 * group | String | null | 특정 그룹만 Validation 하는 경우.<br>입력필드 태그에 `data-parsley-group="group1"` 또는 `data-parsley-group="['group1', 'group3']"` 처럼 여러그룹 지정 가능.
		 * @return {Boolean} Validation 성공한 경우 true. 실패한 경우 false.
		 */
		isFormValid: function(form, option) {
			return sfd.view.form(form).isValid(option);
		},

		/**
		 * sfd.view.form('#form').validate(field) 사용하세요. (deprecated)
		 * @category Form Validation
		 * @param {String|Object} el 입력필드 selector 또는 jQuery object.
		 * @param {Object} [option] 옵션
		 * Key | Type | Default | 설명
		 * ---|---|---|---
		 * updateUI | Boolean | true | Validation 실패했을 때 UI 업데이트 할지 여부.
		 * @return {Boolean} Validation 성공한 경우 true. 실패한 경우 false.
		 */
		validateField: function(el, option) {
			var $form = $(el).closest('form');
			if ($form.length == 0) {
				return false;
			}
			return sfd.view.form($form).validate(el, option);
		},

		/**
		 * sfd.view.form('#form').setFieldRequired() 사용하세요. (deprecated)
		 * @category Form Validation
		 * @param {String|Object} el 여러 입력 필드를 포함하고 있는 container element 또는 특정 입력 필드의 selector나 jQuery object.
		 * @param {Boolean} isEnabled Validation에서 제외시키고 싶으면 false, 다시 포함시키고 싶으면 true.
		 */
		formValidationEnabled: function(el, isEnabled) {
			var $container = (typeof el == 'string') ? $(el) : el;
			if ($container.length == 0) {
				// <STRIP_WHEN_RELEASE
				sfd.warnLog('formValidationEnabled: 없는 element를 지정했습니다.');
				// STRIP_WHEN_RELEASE>
				return;
			}

			var $form = $(el).closest('form');
			if ($form.length == 0) {
				return false;
			}
			sfd.view.form($form).setFieldRequired(el, isEnabled);
		},
		
		/**
		 * 팝업 내용 인쇄
		 * @category 유틸리티
		 * @param {Boolean} [preview=true] IE인 경우 인쇄 미리보기 보여줄지 여부.
		 * @see
		 * 인쇄용 CSS Class
		 * Class | 설명
		 * ---|---
		 * no-print | 특정 element 인쇄 제외 (자리는 차지하고 있음)
		 * print-hidden | 인쇄할 때 지정된 요소를 없앰
		 * print-background | 특정 element 및 하위 element들 배경 강제 인쇄.<br>Chrome, Safari에서만 적용되고 IE에서는 사용자가 직접 배경인쇄 옵션 켜야함.
		 * print-autoheight | 화면 표시를 위해 height를 지정해놓아 잘리는 경우 이 CSS class 지정.
		 * print-content | 프린트 할 내용이 iframe으로 만든 경우 iframe에 이 CSS class 지정.<br>iframe을 인쇄하는 경우 IE에서 미리보기로 열기는 안됨.
		 * 
		 * 가로(Landscape)로 인쇄
		 * 팝업 HTML style에 아래처럼 추가. Chrome, Safari에서만 적용되고 IE에서는 사용자가 직접 옵션 선택해야함.
		 * ```css
		 * &commat;media print {
		 *   &commat;page {
		 *     size: landscape;
		 *   }
		 * }
		 * ```
		 */
		print: function(preview) {
			if (preview === undefined) {
				preview = true;
			}

			if (sfd.env.isIE8Below()) {
				sfd.core.alert('현재 브라우져에서는 화면인쇄 기능을 지원하지 않습니다.\n화면인쇄 기능을 사용하려면 최신 버전의 브라우져를 사용해 주세요.');
				return;
			}

			var printWindow = window;

			$('body').addClass('printing');

			// 인쇄할 컨텐츠가 iframe으로 있는지 확인
			var $iframe = $('iframe.print-content');
			if ($iframe.length > 0) {
				printWindow = $iframe[0].contentWindow;
				if (sfd.env.isIE()) {
					preview = false; // iframe 인쇄할 때는 preview로 열기 불가
				}
			}
			if (preview == true) {
				if (sfd.env.isIE()) {
					// var OLECMDID = 7;
					// var PROMPT = 1;
					// var WebBrowser = '<OBJECT ID="WebBrowser1" WIDTH=0 HEIGHT=0 CLASSID="CLSID:8856F961-340A-11D0-A96B-00C04FD705A2"></OBJECT>';
					// document.body.insertAdjacentHTML('beforeEnd', WebBrowser);
					// WebBrowser1.ExecWB(OLECMDID, PROMPT);

					try {
						//참고로 IE 5.5 이상에서만 동작함
						//웹 브라우저 컨트롤 생성
						var webBrowser = '<object id="previewWeb" width="0" height="0" classid="CLSID:8856F961-340A-11D0-A96B-00C04FD705A2"></object>';
						//웹 페이지에 객체 삽입
						printWindow.document.body.insertAdjacentHTML('beforeEnd', webBrowser);
						//ExexWB 메쏘드 실행 (7 : 미리보기 , 8 : 페이지 설정 , 6 : 인쇄하기(대화상자))
						printWindow.previewWeb.ExecWB(7, 1);
						//객체 해제
						printWindow.previewWeb.outerHTML = '';
					} catch (e) {
						printWindow.print();
						//alert("- 도구 > 인터넷 옵션 > 보안 탭 > 신뢰할 수 있는 사이트 선택\n   1. 사이트 버튼 클릭 > 사이트 추가\n   2. 사용자 지정 수준 클릭 > 스크립팅하기 안전하지 않은 것으로 표시된 ActiveX 컨트롤 (사용)으로 체크\n\n※ 위 설정은 프린트 기능을 사용하기 위함임");
					}
				} else {
					printWindow.print();
				}
			} else {
				if (sfd.env.isIE()) {
					try {
						printWindow.document.execCommand('print', false, null);
					} catch (e) {
						printWindow.print();
					}		
				} else {
					printWindow.print();
				}
			}

			$('body').removeClass('printing');
		},
		/**
		 * 구글 리마케팅
		 * @category 외부
		 * @param {String} inDivision Division Name
		 * @param {String} inGubun 구분값
		 */
		directRemarketingGoogleRia: function( inDivision, inGubun ) {
			inDivision = inDivision || 'car';
			if ( sfd.env.server == 'www' ) {
				try {
					directRemarketingGoogleRia( inDivision, inGubun );
				} catch (e) {
					sfd.tracker.eventLog({
				        logType: 'etcLog',
				        code: 'client_debug_directRemarketingGoogleRiaError'
					});
				}				
			}
		},
		/**
		 * 챗봇 초기화
		 * @category 외부
		 */
		initChatbot: function() {
			sfd.view.loadModule({
				url: '/ria/common/resource/Chatbot',
				isExternalCSS: true,
				onLoaded: function(module) {
					$('#shell-chatbot').html(module.viewHtml);
					setTimeout(function() {
						sfd.page.Chatbot.showChatbot();
					}, 300)
				}
			});
		},
		end: ''
	};
	self.coreExtend = coreExtend;
	/// @endclass

	/**
	 * data 기본. 상품별로 data 확장해서 사용.
	 * @class sfd.data
	 */
	var dataExtend = {
		/**
		 * 해당 ID의 인증여부 리턴
		 * @category 인증정보
		 * @param  {String}     id 고객ID
		 * @return {Boolean}       인증여부
		 */
		isCertedToId: function(id) {
			if (sfd.data.dataObject.certedInfo == null) {
				return false;
			}
			if (sfd.data.dataObject.certedInfo[id]) {
				return true;
			}
			return false;
		},
		/**
		 * 기본 인증 여부
		 * @category 인증정보
		 * @param  {String}  inMode 인증 모드 구분값
		 * @return {Boolean}        인증 여부
		 */
		isCerted: function(inMode) {
			var _j = sfd.data.getValue('designID');
			// 인증 정보가 없으면 false 
			if ( !sfd.data.dataObject.certedInfo ) {
				return false;
			}
			// 인증 정보에 해당하는 사람이 없으면 false 
			if ( !sfd.data.dataObject.certedInfo[_j] ) {
				return false;
			}

			if ( inMode == 'kidi' ) { // normal(설계자의 기본 인증 여부)
				return sfd.data.isCertedToId(_j);
			} else { // 
				// 공인인증 내역이 있으면 
				if (sfd.data.dataObject.certedInfo[_j].cert) {
					return true;
				}
				// 휴대폰 내역이 있으면 
				if (sfd.data.dataObject.certedInfo[_j].mobile) {
					return true;
				}
				// 카드인증 내역이 있으면 
				if (sfd.data.dataObject.certedInfo[_j].card) {
					return true;
				}
			}
			return false;
		},
		/**
		 * 공인인증 진행여부 
		 * @category 인증정보
		 * @param  {String} id 아이디
		 * @return {Boolean}  공인인증을 한적이 있는지 여부 
		 */		
		isPkiCertExistToId: function(id) {
			if (sfd.data.dataObject.certedInfo == null) {
				return false;
			}

			// 공인인증으로 한것이 존재하는지 체크
			if (sfd.data.dataObject.certedInfo[id] && sfd.data.dataObject.certedInfo[id].cert) {
				return true;
			}
			return false;
		},
		/**
		 * 인증진행 정보 조회 
		 * @category 인증정보
		 * @param  {String}      id 조회 사용자 ID 
		 * @return {Object}         인증정보 객체
		 */
		getCertedInfo: function(id) {
			if ( !sfd.data.dataObject.certedInfo ) {
				return null;
			}
			return sfd.data.dataObject.certedInfo[id];
		},
		/**
		 * 인증정보 저장
		 * @category 인증정보
		 * @param {Object} inRunInfo 
		 */
		saveCertedInfo: function(inRunInfo) {
			
			var _id = '';
			var _obj = true;
			var _type = '';
			if (inRunInfo.param.designId) {
				_id = inRunInfo.param.designId;
			}
			if (inRunInfo.param.custId) {
				_id = inRunInfo.param.custId;
			}
			if ( [ 
				'goKidiCert', 
				'goCertLong', 
				'goPkiEx',
				'endoPkiCert'
			].includes(inRunInfo.form)) {
				_obj = true;
				_type = 'cert';
			} else if ( [ 
				'goCertMobile2', 
				'goKidiCertMobile2'
			].includes(inRunInfo.form)) {
				_obj = sfd.data.dataObject.__authMobilePhoneInfo;
				_type = 'mobile';
			} else if ( [ 
				'goCertCardLong', 
				'goKidiCertCard',
				'endoCardCert'
			].includes(inRunInfo.form)) {
				_obj = true;
				_type = 'card';
			}

			if (!sfd.data.dataObject.certedInfo) {
				sfd.data.dataObject.certedInfo = {};
			}
			if (!sfd.data.dataObject.certedInfo[_id]) {
				sfd.data.dataObject.certedInfo[_id] = {};
			}
			sfd.data.dataObject.certedInfo[_id]
			sfd.data.dataObject.certedInfo[_id][_type] = _obj;
			sfd.data.dataObject.__authMobilePhoneInfo = null;
		},		

		// <STRIP_WHEN_RELEASE
		/**
		 * 데이터를 주어진 데이터로 통째로 교체
		 * @category 디버깅
		 * @param {Object} inData 덮어쓸 데이터
		 */
		setDatadump: function(inData) {
			// 몇가지 변할 수 없는 데이터 검증
			if ( sfd.env.deviceType != inData.type ||
				sfd.data.dataObject.productPath != inData.productPath ||
				sfd.data.dataObject.productCode != inData.productCode ||
				sfd.data.dataObject.divisionName != inData.divisionName ||
				sfd.data.dataObject.productCode != inData.productCode ||
				sfd.data.dataObject.frmStepHeader != inData.frmStepHeader  ) {
				alert('동일상품 또는 데이터가 올바른지 한 번 더 확인 부탁드립니다.');
			}
			sfd.data.dataObject = inData;
		},
		// STRIP_WHEN_RELEASE>

		/**
		 * 자동차용 템플릿 객체 얻기
		 * @category 템플릿
		 * @param {Object} ruleJson 
		 * @return {Object} 정리된 템플릿 객체. 서버에서 받은 템플릿 객체에서 쓸데없는 것들을 지우고 반환함.
		 */
		makeTemplateCar: function(ruleJson) {
			var _r = sfd.utils.copyObject(ruleJson);
			// permitsMap제거
			delete               _r.permitsMap;
			delete               _r.contracts[0].bonusMaluss[0].permitsMap;
			removePermitsMap(    _r.contracts[0].clauses);
			_r.contracts[0].coverageBundles[0] = {}
			// removePermitsMapDeep(_r.contracts[0].coverageBundles[0].coverages);
			delete               _r.contracts[0].insureds[0].permitsMap;
			removePermitsMap(    _r.contracts[0].insureds[0].specialEquipments);
			delete               _r.contracts[0].permitsMap;
			delete               _r.contracts[0].relatedPolicys[0].permitsMap;
			function removePermitsMap(arr) {
				$.each(arr, function(i, item) {
					delete item.permitsMap;
				})
			}
			// function removePermitsMapDeep(arr) {
			// 	$.each(arr, function(i, item) {
			// 		if (item.deducts) {
			// 			removePermitsMap(item.deducts);
			// 		}
			// 		delete item.permitsMap;
			// 	})
			// }
			return _r;
		},

		/**
		 * 장기상품용 템플릿 객체 얻기
		 * @category 템플릿
		 * @param {Object} ruleJson 
		 * @return {Object} 정리된 템플릿 객체. 서버에서 받은 템플릿 객체에서 쓸데없는 것들을 지우고 반환함.
		 */
		makeTemplateLong: function(ruleJson) {
			var calcTemplate = {
				'uniqCode': null,				// 객체별 식별코드
				'pmId': null,					// 템플릿 ID
				'begDt': null,					// 보험증권 시작일
				'genDetDt': null,				// 생성 결정일
				'saleFrmDt': null,				// 생성일
				// 단위 설계
				'contracts': [{
					'uniqCode': null,			// 객체별 식별코드
					'pmId': null,				// 템플릿 ID
					'begDt': null,				// 보험 개시일자
					'fstOfrDt': null,			// 청약일자
					'lobCd': null,				// 보종구분
					'prodId': null,				// 상품코드
					'rcmPnNo': null,			// 추천 플랜번호
					'mthnTaFg': null,			// 보험차익 비과세대상 여부
					'rscCnsnFg': null,			// 통신수단 이용한해지 동의
					'saleTpCd': null,			// 상품판매형 구분
					'shpCd': null,				// 계약 형태코드
					// 담보별 보험료
					'premiums': [{
						'uniqCode': null,		// 객체별 식별코드
						'pmId': null,			// 템플릿 ID
						'payFrqCd': null		// 납입주기
					}],
					// 적림담보 번들
					'coverageBundles': [{
						'uniqCode': null,		// 객체별 식별코드
						// 담보
						'coverages': []
					}],
					// 목적물
					'insureds': [{
						'uniqCode': null,		// 객체별 식별코드
						'pmId': null,			// 템플릿 ID
						'catCd': null,			// 오브젝트 범주
						'tpCd': null,			// 오브젝트 유형
						'ageNtry': null,		// 가입 연령
						'brthDt': null,			// 피보험자 생년월일
						'drvrTpCd': null,		// 운전차 용도
						'gndrCd': null,			// 성별
						// 'injrGrd2Cd': null,		// 상해급수II
						'injrGrdCd': null,		// 상해급수 (20190322 4월 개정으로 변경)
						'insrdPsnId': null,		// 피보험자 ID
						'insrdPsnNm': null,		// 피보험자 명
						'jobClsfCd': null,		// 직업코드 (세분화)
						'jobCd': null,			// 직업코드
						'mnsdRltnCd': null,		// 주피보험자 관계코드
						'moNsTrFg': null,		// 이륜자동차 부담보특약 가입여부
						// 담보 번들
						'coverageBundles': [{
							'uniqCode': null,	// 객체별 식별코드
							// 담보
							'coverages': []
						}]
					}]
				}]
			};

			return unUseDeleteKey(sfd.utils.copyObject(ruleJson), calcTemplate);

			// 사용하지 않는 키 삭제
			function unUseDeleteKey(targetObj, calcTemplateObj) {
				var key;

				for (key in targetObj) {
					// 사용 목록에 없는 키면
					if (!calcTemplateObj.hasOwnProperty(key)) {
						delete targetObj[key];
					}
				}
				
				for (key in targetObj) {
					// 키 값이 배열이면
					if (Array.isArray(targetObj[key])) {
						if (calcTemplateObj[key].length) {
							unUseDeleteKey(targetObj[key][0], calcTemplateObj[key][0]);
						} else {
							targetObj[key] = [];
						}
					}
				}
				return targetObj;
			}
		},
		/**
		 * HTML/Data 바인딩
		 * @category 유틸리티
		 * @param  {String|Object} [container=''] 바인딩 컨테이너. (공백, self, #id, $('#id'))
		 * @param  {Object} [data=null]  Merge data 혹은 data.dataObject
		 * ```js
		 *  // 1. (자동바인딩) 기본 getValue 바인딩
		 *  	<span sfd-data="carNo"></span>
		 *  
		 *  // 2. (자동바인딩) sfd-data에 자바스크립트 표현식 사용 (@로시작)
		 *  	self 또는 sfd로 접근 가능한 변수 혹은 메소드만 가능
		 * 	 	<span sfd-data="@self.converCompany(sfd.data.dataObject.makeCompanyCode)"></span>
		 * 	
		 *  // 3. (수동바인딩) 코드를 변환해서 바인딩 (@로시작)
		 *  	<span sfd-data="@makeCompanyCode"></span>
		 *  	sfd.data.binding(self, {
		 *  		'@makeCompanyCode': self.converCompany(sfd.data.dataObject.makeCompanyCode)
		 *  	})
		 * ```  
		 */
		binding: function(container, data) {
			sfd.view.binding.match(container, data, true);
		},

		/**
		 * 여러개 값을 한번에 얻기
		 * @category 유틸리티
		 * @param {Array} keys 얻으려는 값들의 키 목록.
		 * @return {Object} { key1: value1, key2: value2 } 형태의 객체.
		 */
		getValues: function(keys, keyPrefix) {
			var result = {};
			keys.forEach(function(key) {
				if (keyPrefix) {
					key = keyPrefix + key.chartAt(0).toUpperCase() + key.slice(1);
				}
				result[key] = sfd.data.getValue(key);
			});
			return result;
		},

		/**
		 * 보험기간 코드, 납입기간 코드 산출
		 * @category 안쓰임
		 * @param {*} code 
		 * @param {*} inprVl 
		 * @param {*} cltrPrmVl 
		 */
		getTermCode: function(code, inprVl, cltrPrmVl) {
			var obj = {
				INPRDSCCODE: '1',
				PMPRDSCCODE: '1'
			}

			inprVl = parseInt(inprVl, 10).toString();
			cltrPrmVl = parseInt(cltrPrmVl, 10).toString();

			var rule = sfd.data.getValue('ruleJson');
			var table = rule.tableMaps.LT_Cov_Periods_Ages;
			var listCods = getItemOfList(table, 'COVMODULEID', code);
			var listInsus = getItemOfList(listCods, 'INPRD', inprVl);
			var listResult = getItemOfList(listInsus, 'PMPRD', cltrPrmVl);
			if (listResult && listResult.length > 0 ) {
				obj.INPRDSCCODE = listResult[0].INPRDSCCODE;
				obj.PMPRDSCCODE = listResult[0].PMPRDSCCODE;
			}
			
			return obj;

			/*
			* 일치하는 값을 가진 아이템을 반환
			* @param targetArr		검사 대상
			* @param keyStr		검색 키
			* @param valueObj		검색 값
			* @param multiBln		검색후 리턴형 (true: 배열, false: 단일)
			*/
			function getItemOfList(targetArr, keyStr, valueObj, multiBln) {
				multiBln = multiBln === false ? false : true;

				var indices = getIndexOfList(targetArr, keyStr, valueObj, multiBln);
				var result = [];

				// 리턴형이 배열이면
				if (multiBln) {
					for (var i = 0; i < indices.length; i++) {
						result.push(targetArr[indices[i]]);
					}

				} else {                        
					result = targetArr[indices];
				}
				return result;
			}

			/*
			 * 일치하는 값을 가진 아이템의 인덱스를 반환
			 * @param targetArr		검사 대상
			 * @param keyStr		검색 키
			 * @param valueObj		검색 값
			 * @param multiBln		검색후 리턴형 (true: 배열, false: 단일)
			 */
			function getIndexOfList(targetArr, keyStr, valueObj, multiBln) {
				multiBln = multiBln === false ? false : true;

				if (!targetArr) {
					targetArr = [];
				}
				var result = [];

				for (var i = 0; i < targetArr.length; i++) {
					if (targetArr[i][keyStr] == valueObj) {
						result.push(i);
					}
				}

				// 리턴형이 배열이 아니면
				if (!multiBln) {
					result = (result.length) ? result[0] : -1;
				}
				return result;
			}
		},

		/**
		 * 주소팝업 결과, 계약조회 등 데이터의 주소정보를 내부 저장형태로 변환
		 * @category 연락정보
		 * @param {Object} src 소스 데이터. (주소팝업 결과, 계약 조회 응답, 내 정보 조회 응답 등). null로 지정하면 모든 값이 null로 채워짐. ''로 지정하면 모든 값이 ''로 채워짐.
		 * @param {String} keyPrefix 반환 데이터 객체의 key name에 붙일 prefix. 예) "piboja"
		 * @return {Object} 내부(sfd.data) 저장형태의 주소정보.
		 * Key | Type | 설명
		 * ---|---|---
		 * AddressCls | String | 주소 위치 종류. "0002": 자택, "0003": 회사. src가 주소팝업 결과 객체인 경우 이 값은 생략됨.
		 * AddressNwOdCls | String | 주소 종류. "2": 도로명주소(신주소), "1": 지번주소(구주소)
		 * ZipCodeSeqRoad | Integer | 도로명주소 우편번호 순번. 예) 0
		 * ZipCode1Road | String | 도로명주소 우편번호 앞자리. 예) "062"
		 * ZipCode2Road | String | 도로명주소 우편번호 뒷자리. 예) "33"
		 * Address1Road | String | 도로명주소 기본정보. 예) "서울 서초구 서초대로74길"
		 * BldgNoRoad | String | 도로명주소 건물번호. 예) "15"
		 * Address2Road | String | 도로명주소 상세정보. 예) "1001동 101호"
		 * AddressAddAddrRfnRoad | String | 도로명주소 참고정보. 예) "(서초동, 삼성물산(주))"
		 * ZipCodeSeq | Integer | 지번주소 우편번호 순번. 예) 0
		 * ZipCode1 | String | 지번주소 우편번호 앞자리. 예) "062"
		 * ZipCode2 | String | 지번주소 우편번호 뒷자리. 예) "33"
		 * Address1 | String | 지번주소 기본정보. 예) "서울 서초구 서초1동"
		 * Address2 | String | 지번주소 상세정보. 예) "1342-12 25층"
		 */
		convertAddressData: function(src, keyPrefix) {
			keyPrefix = keyPrefix || '';

			var data;
			var result = {};

			if (!src) {
				// 초기화
				var value = src;
				src = {
					custAddressCls: value, // 자택을 기본으로
					AddressNwOdCls: value, 
					// 주소 (도로명)
					zipCodeSeqRoad: value, 
					custZipCodeRoad1: value, 
					custZipCodeRoad2: value, 
					custAddressRoad1: value, 
					custBldgNoRoad: value, 
					custAddressRoad2: value, 
					custAddressRoadRfn: value, 
					// 주소 (지번)
					zipCodeSeq: value, 
					custZipCode1: value, 
					custZipCode2: value, 
					custAddress1: value, 
					custAddress2: value
				};
			} 

			if (src.old && src['new']) {
				// src가 주소팝업에서 얻은 형태
				var address = src['new'];
				var oldAddress = src.old;
				data = {
					AddressNwOdCls: src.preferType == 'new' ? '2' : '1', // "2": 도로명주소, "1": 지번주소
					// 주소 (도로명)
					ZipCodeSeqRoad: address.zipCode.seq,
					ZipCode1Road: address.zipCode.part1,
					ZipCode2Road: address.zipCode.part2,
					Address1Road: address.address1,
					Address2Road: address.address2,
					AddressAddAddrRfnRoad: address.reference,
					BldgNoRoad: address.bldgNo,
					
					// 주소 (지번)
					ZipCodeSeq: oldAddress.zipCode.seq,
					ZipCode1: oldAddress.zipCode.part1,
					ZipCode2: oldAddress.zipCode.part2,
					Address1: oldAddress.address1,
					Address2: oldAddress.address2
				};				
			} else {
				// src가 서버에서 받은 형태
				data = {
					// 주소
					AddressNwOdCls: src.custAddressNwOdCls || '', // "2": 도로명주소, "1": 지번주소
					// 주소 (도로명)
					ZipCodeSeqRoad: src.zipCodeSeqRoad, 
					ZipCode1Road: src.custZipCodeRoad1 || '', 
					ZipCode2Road: src.custZipCodeRoad2 || '', 
					Address1Road: src.custAddressRoad1 || '', 
					BldgNoRoad: src.custBldgNoRoad || '', 
					Address2Road: src.custAddressRoad2 || '', 
					AddressAddAddrRfnRoad: src.custAddressRoadRfn || '', 
					// 주소 (지번)
					ZipCodeSeq: src.zipCodeSeq, 
					ZipCode1: src.custZipCode1 || '', 
					ZipCode2: src.custZipCode2 || '', 
					Address1: src.custAddress1 || '', 
					Address2: src.custAddress2 || ''
				};

				if (src.custAddressCls) {
					data.AddressCls = src.custAddressCls; // 회사, 자택
				}
			}

			sfd.utils.setValues(result, data, keyPrefix);

			return result;
		},

		/**
		 * 계약조회 응답, 내 정보 조회 응답 등 데이터의 연락정보를 내부 저장형태로 변환
		 * @category 연락정보
		 * @param {Object} src 소스 데이터. (계약 조회 응답, 내 정보 조회 응답 등). null로 지정하면 모든 값이 null로 채워짐. ''로 지정하면 모든 값이 ''로 채워짐.
		 * @param {String} keyPrefix 반환 데이터 객체의 key name에 붙일 prefix. 예) "piboja"
		 * @param {Object} [option] 옵션
		 * Key | Type | 기본값 | 설명
		 * ---|---|---|---
		 * forceMobilePhone | Boolean | false | 무조건 휴대전화 정보로 저장하려는 경우 true로 지정.
		 * @return {Object} 내부(sfd.data) 저장형태의 주소정보.
		 * Key | Type | 설명
		 * ---|---|---
		 * PhoneCls | String | 전화 종류. "1": 휴대폰, "2": 자택전화, "3": 회사전화
		 * PhoneNo1 | String | 지역번호/통신사번호
		 * PhoneNo2 | String | 국번
		 * PhoneNo3 | String | 개별번호
		 * Email | String | 이메일 주소
		 * * 주소정보는 convertAddressData() 함수 설명 참고.
		 */
		convertContactData: function(src, keyPrefix, option) {
			option = $.extend({
				forceMobilePhone: false
			}, option);
			keyPrefix = keyPrefix || '';

			var result = {};

			if (!src) {
				var value = src;
				src = {
					phoneCls: value,
					mTel1: value,
					mTel2: value,
					mTel3: value,
					emailId1: value
				};
			}

			var telType = 'm';
			var phoneCls = '1';
			if (option.forceMobilePhone == false) {
				telType = src.mTel1 ? 'm' : (src.hTel1 ? 'h' : (src.oTel1 ? 'o' : ''));
				phoneCls = src.mTel1 ? '1' : '2';
			}

			var data = {
				// 전화
				PhoneCls: phoneCls,
				PhoneNo1: src[telType + 'Tel1'],
				PhoneNo2: src[telType + 'Tel2'],
				PhoneNo3: src[telType + 'Tel3'],
				// 이메일
				Email: src.emailId1
			};

			sfd.utils.setValues(result, data, { keyPrefix: keyPrefix });

			// 주소정보 추가
			sfd.utils.setValues(result, this.convertAddressData(src, keyPrefix));

			return result;
		},

		/**
		 * 주소 정보 저장 (sfd.data 이외의 데이터 객체에 저장도 가능)
		 * @category 연락정보
		 * @param {Object} src 소스 데이터. 주소팝업 결과 객체, 고객정보 가져오기, 계약조회 등 서버에서 조회한 데이터 사용 가능.
		 * 						null로 지정하면 주소정보를 모두 null로 초기화 시킴. ''로 지정하면 모두 ''로 초기화 시킴.
		 * @param {String|Array} keyPrefix 저장될 때 key name prefix. 배열로 여러개 지정하면 각 prefix별로 저장됨. 예) 'piboja'
		 * @param {Object} [option] 옵션
		 * Key | Type | 기본값 | 설명
		 * ---|---|---|---
		 * dest | Object | - | sfd.data가 아니라 다른 데이터 객체에 저장하고 싶은 경우 대상 data 객체 지정
		 * format | String | - | 장기 상품 저장 형태로 저장하고자하는 경우 'long' 으로 지정
		 * @see
		 * 저장하는 데이터
		 * 각 key name에 keyPrefix 붙어서 저장됨. 예) pibojaAddress1
		 * Key | Type | 설명
		 * ---|---|---
		 * AddressCls | String | 주소 위치 종류. "0002": 자택, "0003": 회사. src가 주소팝업 결과 객체인 경우 이 값은 생략됨.
		 * AddressNwOdCls | String | 주소 종류. "2": 도로명주소(신주소), "1": 지번주소(구주소)
		 * ZipCodeSeqRoad | Integer | 도로명주소 우편번호 순번. 예) 0
		 * ZipCode1Road | String | 도로명주소 우편번호 앞자리. 예) "062"
		 * ZipCode2Road | String | 도로명주소 우편번호 뒷자리. 예) "33"
		 * Address1Road | String | 도로명주소 기본정보. 예) "서울 서초구 서초대로74길"
		 * BldgNoRoad | String | 도로명주소 건물번호. 예) "15"
		 * Address2Road | String | 도로명주소 상세정보. 예) "1001동 101호"
		 * AddressAddAddrRfnRoad | String | 도로명주소 참고정보. 예) "(서초동, 삼성물산(주))"
		 * ZipCodeSeq | Integer | 지번주소 우편번호 순번. 예) 0
		 * ZipCode1 | String | 지번주소 우편번호 앞자리. 예) "062"
		 * ZipCode2 | String | 지번주소 우편번호 뒷자리. 예) "33"
		 * Address1 | String | 지번주소 기본정보. 예) "서울 서초구 서초1동"
		 * Address2 | String | 지번주소 상세정보. 예) "1342-12 25층"
		 * @example
		 * ```js
		 * // 주소팝업 결과를 sfd.data에 피보험자 주소정보로 저장
		 * sfd.data.setAddressData(result, 'piboja');
		 * 
		 * // 서버응답의 주소정보를 sfd.data에 피보험자/계약자 주소정보로 저장
		 * sfd.data.setAddressData(serverResponse, ['piboja', 'contractor']);
		 * 
		 * // 주소팝업 결과를 resultData에 피보험자 주소정보로 저장
		 * sfd.data.setAddressData(result, 'piboja', { dest: resultData });
		 * ```
		 */
		setAddressData: function(src, keyPrefix, option) {
			option = $.extend({
				dest: null,
				format: null
			}, option);

			var keyPrefixes = Array.isArray(keyPrefix) ? keyPrefix : [keyPrefix];
			
			// 내부 저장 형태로 변환
			var addressData = this.convertAddressData(src); 

			if (option.format == 'long') {
				// 장기는 고객정보 데이터 관리하는 형태가 달라서 별도 포맷으로 저장

				// <STRIP_WHEN_RELEASE
				if (option.dest && Array.isArray(keyPrefix) && keyPrefix.length > 1) {
					sfd.core.alert('sfd.data.setContactData(): 장기상품은 option에 dest 지정한 경우 keyPrefix 한 개만 지정할 수 있습니다.');
					return;
				}
				// STRIP_WHEN_RELEASE>

				addressData = sfd.core.moduleLong.convertAddressData(addressData);
				keyPrefixes.forEach(function(keyPrefix) {
					var dest = option.dest || sfd.data.getValue(keyPrefix + 'Info');
					sfd.utils.setValues(dest, addressData);
				});	
				
				if (option.dest) {
					return; // sfd.data에 저장하는게 아니면 아래 공통형태 저장은 패스
				}
			}

			// 저장
			var dest = option.dest || sfd.data.dataObject;
			keyPrefixes.forEach(function(keyPrefix) {
				sfd.utils.setValues(dest, sfd.utils.copyObject(addressData), { keyPrefix: keyPrefix });
			});
		},

		/**
		 * 연락 정보(전화번호, 이메일, 주소) 저장 (기본 sfd.data 이외의 데이터 객체에 저장도 가능)
		 * @category 연락정보
		 * @param {Object} src 소스 데이터. 고객정보 가져오기, 계약조회 등 서버에서 조회한 데이터 사용 가능.
		 * 						null로 지정하면 연락정보를 모두 null로 초기화 시킴. ''로 지정하면 모두 ''로 초기화 시킴.
		 * @param {String|Array} keyPrefix 저장될 때 key name prefix. 배열로 여러개 지정하면 각 prefix별로 저장됨. 예) 'piboja'
		 * @param {Object} [option] 옵션
		 * Key | Type | 기본값 | 설명
		 * ---|---|---|---
		 * dest | Object | - | 기본 데이터(sfd.data)가 아니라 다른 데이터 객체에 저장하고 싶은 경우 대상 data 객체 지정.
		 * forceMobilePhone | Boolean | false | 무조건 휴대전화 정보로 저장하려는 경우 true로 지정.
		 * format | String | - | 장기 상품 저장 형태로 저장하고자하는 경우 'long' 으로 지정
		 * @see
		 * 저장하는 데이터
		 * 각 key name에 keyPrefix 붙어서 저장됨. 예) pibojaPhoneCls
		 * Key | Type | 설명
		 * ---|---|---
		 * PhoneCls | String | 전화 종류. "1": 휴대폰, "2": 자택전화, "3": 회사전화
		 * PhoneNo1 | String | 지역번호/통신사번호
		 * PhoneNo2 | String | 국번
		 * PhoneNo3 | String | 개별번호
		 * Email | String | 이메일 주소
		 * * 주소정보는 setAddressData() 설명 참고.
		 * 
		 * @example
		 * ```js
		 * // 서버응답의 연락정보를 sfd.data에 피보험자 연락정보로 저장
		 * sfd.data.setContactData(serverResponse, 'piboja'); 
		 * 
		 * // 서버응답의 연락정보를 sfd.data에 피보험자/계약자 연락정보로 저장 (둘이 똑같은 값으로)
		 * sfd.data.setContactData(serverResponse, ['piboja', 'contractor']);
		 * 
		 * // 서버응답의 연락정보를 resultData에 피보험자 연락정보로 저장
		 * sfd.data.setContactData(serverResponse, 'piboja', { dest: resultData });
		 * ```
		 */
		setContactData: function(src, keyPrefix, option) {
			option = $.extend({
				dest: null,
				forceMobilePhone: false,
				format: null
			}, option);
			var keyPrefixes = Array.isArray(keyPrefix) ? keyPrefix : [keyPrefix];

			// 내부 저장 형태로 변환
			var contactData = this.convertContactData(src);

			if (option.format == 'long') {
				// 장기는 고객정보 데이터 관리하는 형태가 달라서 별도 포맷으로 저장

				// <STRIP_WHEN_RELEASE
				if (option.dest && Array.isArray(keyPrefix) && keyPrefix.length > 1) {
					sfd.core.alert('sfd.data.setContactData(): 장기상품은 option에 dest 지정한 경우 keyPrefix 한 개만 지정할 수 있습니다.');
					return;
				}
				// STRIP_WHEN_RELEASE>

				contactData = sfd.core.moduleLong.convertContactData(contactData);
				keyPrefixes.forEach(function(keyPrefix) {
					var dest = option.dest || sfd.data.getValue(keyPrefix + 'Info');
					sfd.utils.setValues(dest, contactData);
				});	
				
				if (option.dest) {
					return; // sfd.data에 저장하는게 아니면 아래 공통형태 저장은 패스
				}
			}

			// 저장
			var dest = option.dest || sfd.data.dataObject;
			keyPrefixes.forEach(function(keyPrefix) {
				sfd.utils.setValues(dest, sfd.utils.copyObject(contactData), { keyPrefix: keyPrefix });
			});
		},

		/**
		 * 주소정보 복사
		 * @category 연락정보
		 * @param {String} srcKeyPrefix 복사할 소스 key prefix. 예) "contractor"
		 * @param {String} destKeyPrefix 복사될 대상 key prefix. 예) "piboja"
		 * @param {Object} [option] 옵션
		 * Key | Type | 기본값 | 설명
		 * ---|---|---|---
		 * dest | Object | - | 복사될 대상 data object. 지정 안하는 경우 sfd.data.dataObject 사용됨.
		 * src | Object| - | 복사할 소스 data object. 지정 안하는 경우 destData가 지정된 경우 destData가 사용되고, destData가 지정 안된 경우에는 sfd.data.dataObject 사용됨.
		 * format | String | - | 장기상품 데이터 포맷인 경우 "long" 지정.
		 * @example
		 * ```js
		 * sfd.data.copyAddressData('piboja', 'contractor'); // 피보험자 주소정보를 계약자 주소정보로 복사 (sfd.data.dataObject)
		 * 
		 * sfd.data.copyAddressData('piboja', 'contractor', { dest: resultData }); // 피보험자 주소정보를 계약자 주소정보로 복사 (resultData)
		 * 
		 * sfd.data.copyAddressData('piboja', 'piboja', { dest: resultData, src: sfd.data.dataObject }); // sfd.data의 피보험자 주소정보를 resultData로 복사
		 * ```
		 */
		copyAddressData: function(srcKeyPrefix, destKeyPrefix, option) {
			var destData;
			var srcData;
			var format;

			if (arguments.length == 3 && typeof option == 'object' && option.ver == 2) {
				destData = option.dest;
				srcData = option.src;
				format = option.format;
			} else {
				var tempKeyPrefix = arguments[1];
				destKeyPrefix = arguments[0];
				srcKeyPrefix = tempKeyPrefix;
				destData = arguments[2];
				srcData = arguments[3];
				format = sfd.data.getValue('lobCd') == 'LL' ? 'long' : null;
			}

			if (format == 'long') {
				// 장기는 고객정보 데이터 관리하는 형태가 다름
				sfd.core.moduleLong.copyAddressData(destKeyPrefix, srcKeyPrefix, destData, srcData); // TODO: moduleLong 반영되면 포맷 수정해야함

			} else {
				// 자동차/일반 상품
				destData = destData || sfd.data.dataObject;
				srcData = srcData || destData;
	
				sfd.utils.copyValues(destData, srcData, [
					'AddressCls', 'AddressNwOdCls',
					'ZipCode1', 'ZipCode2', 'Address1', 'Address2', // 지번주소
					'ZipCode1Road', 'ZipCode2Road', 'Address1Road', 'BldgNoRoad', 'Address2Road', 'AddressAddAddrRfnRoad' // 도로명주소
				], {
					destKeyPrefix: destKeyPrefix, 
					srcKeyPrefix: srcKeyPrefix
				});		
			}
		},

		/**
		 * 연락정보(전화번호, 이메일, 주소) 복사
		 * @category 연락정보
		 * @param {String} srcKeyPrefix 복사할 소스 key prefix. 예) "contractor"
		 * @param {String} destKeyPrefix 복사될 대상 key prefix. 예) "piboja"
		 * @param {Object} option 옵션
		 * Key | Type | 기본값 | 설명
		 * ---|---|---|---
		 * dest | Object | - | 복사될 대상 data object. 지정 안하는 경우 sfd.data.dataObject 사용됨.
		 * src | Object| - | 복사할 소스 data object. 지정 안하는 경우 destData가 지정된 경우 destData가 사용되고, destData가 지정 안된 경우에는 sfd.data.dataObject 사용됨.
		 * format | String | - | 장기상품 데이터 포맷인 경우 "long" 지정.
		 * @example
		 * ```js
		 * sfd.data.copyContactData('piboja', 'contractor'); // 피보험자 연락정보를 계약자 연락정보로 복사 (sfd.data.dataObject)
		 * 
		 * sfd.data.copyContactData('piboja', 'contractor', { dest: resultData }); // 피보험자 연락정보를 계약자 연락정보로 복사 (resultData)
		 * 
		 * sfd.data.copyContactData('piboja', 'piboja', { dest: resultData, src: sfd.data.dataObject); // sfd.data의 피보험자 연락정보를 resultData로 복사
		 * ```
		 */
		copyContactData: function(srcKeyPrefix, destKeyPrefix, option) {
			var destData;
			var srcData;
			var format;

			if (arguments.length == 3 && typeof option == 'object' && option.ver == 2) {
				destData = option.dest;
				srcData = option.src;
				format = option.format;
			} else {
				var tempKeyPrefix = arguments[1];
				destKeyPrefix = arguments[0];
				srcKeyPrefix = tempKeyPrefix;
				destData = arguments[2];
				srcData = arguments[3];
				format = sfd.data.getValue('lobCd') == 'LL' ? 'long' : null;
			}


			if (format == 'long') {
				// 장기는 고객정보 데이터 관리하는 형태가 다름
				sfd.core.moduleLong.copyContactData(destKeyPrefix, srcKeyPrefix, destData, srcData); // TODO: moduleLong 반영되면 포맷 수정해야함

			} else {
				// 자동차/일반 상품
				destData = destData || sfd.data.dataObject;
				srcData = srcData || destData;

				// 전화번호, 이메일
				sfd.utils.copyValues(destData, srcData, [
					// 전화번호
					'PhoneCls', 'PhoneNo1', 'PhoneNo2', 'PhoneNo3', 
					// 이메일
					'Email'
				], {
					destKeyPrefix: destKeyPrefix, 
					srcKeyPrefix: srcKeyPrefix
				});

				// 주소
				sfd.data.copyAddressData(srcKeyPrefix, destKeyPrefix, { dest: destData, src: srcData, ver: 2 });
			}
		},

		/**
		 * 심사를 위한 주소 정보 얻기 (다른 소스 데이터 선택 가능)
		 * @category 연락정보
		 * @param {String} keyPrefix 데이터 객체 key name prefix. 예) "piboja"
		 * @param {Object} [option] 옵션
		 * Key | Type | 기본값 | 설명
		 * ---|---|---|---
		 * src | Object | - | 기본 데이터(sfd.data) 이외의 데이터 객체로부터 값을 얻으려는 경우 지정.
		 * resultKeyPrefix | String | - | 결과 데이터 객체의 key name prefix를 지정하고 싶은 경우 사용. 예) "contractor"
		 * format | String | - | 장기 상품 저장 형태 데이터에서 가져오는 경우 'long' 으로 지정
		 * @return {Object} 심사를 위한 주소정보
		 * Object의 key 는 아래와 같음
		 * 각 key에 keyPrefix 붙음. 예) pibojaAddress1
		 * - 주소 구분: AddressCls, AddressNwOdCls
		 * - 지번주소: ZipCode1, ZipCode2, Address1, Address2
		 * - 도로명 주소: ZipCode1Road, ZipCode2Road, Address1Road, BldgNoRoad, Address2Road, AddressAddAddrRfnRoad
		 * 자세한 값 정보는 sfd.data.setAddressData() 설명 참고.
		 * @example
		 * ```js
		 * // 피보험자 주소정보 얻음
		 * var pibojaContactData = sfd.data.getAddressDataForUnderwriting("piboja"); 
		 * // { pibojaAddressCls: '0002', ... }
		 * 
		 * // 피보험자 주소정보를 그대로 계약자 주소정보로 얻음
		 * var contractorContactData = sfd.data.getAddressDataForUnderwriting("piboja", { resultKeyPrefix: 'contractor' }); 
		 * // { contractorAddressCls: '0002', ... }
		 * ```
		 */
		getAddressDataForUnderwriting: function(keyPrefix, option) {
			option = $.extend({
				src: null,
				resultKeyPrefix: null,
				format: null
			}, option);
			var result = {};
			var src = option.src || sfd.data.dataObject;
			var destKeyPrefix = option.resultKeyPrefix || keyPrefix;

			if (option.format == 'long') {
				// 장기는 고객정보 데이터 관리하는 형태가 다름				
				result = sfd.core.moduleLong.getAddressDataForUnderwriting(keyPrefix, option);
			} else {
				// 자동차/일반
				sfd.data.copyAddressData(keyPrefix, destKeyPrefix, { dest: result, src: src, ver: 2 });
			}

			return result;
		},

		/**
		 * 심사를 위한 연락정보(전화번호, 이메일, 주소) 얻기 (다른 소스 데이터 선택 가능)
		 * @category 연락정보
		 * @param {String|Array} keyPrefix 데이터 객체 key name prefix. 예) "piboja"
		 * @param {Object} [option] 옵션 
		 * Key | Type | 기본값 | 설명
		 * ---|---|---|---
		 * src | Object | - | 기본 데이터(sfd.data) 이외의 데이터 객체로부터 값을 얻으려는 경우 지정.
		 * resultKeyPrefix | String | - | 결과 객체 key name에 keyPrefix 인자 값 말고 다르게 저장하고 싶은 경우 지정.
		 * format | String | - | 장기 상품 저장 형태 데이터에서 가져오는 경우 'long' 으로 지정
		 * @return {Object} 심사를 위한 연락정보(전화번호, 이메일, 주소)
		 * Object의 key 는 아래와 같음.
		 * 각 key name에 keyPrefix 붙음. 예) pibojaAddress1
		 * - 전화번호: PhoneCls, PhoneNo1, PhoneNo2, PhoneNo3
		 * - 이메일: Email
		 * - 주소: sfd.data.getAddressDataForUnderwriting() 참고.
		 * @example
		 * ```js
		 * // 피보험자 연락정보 얻음
		 * var pibojaContactData = sfd.data.getContactDataForUnderwriting('piboja'); 
		 * // { "pibojaPhoneCls": "1", "pibojaPhoneNo1": "010", ... }
		 * 
		 * // 피보험자 연락정보를 그대로 계약자 연락정보로 얻음
		 * var contractorContactData = sfd.data.getContactDataForUnderwriting('piboja', { resultKeyPrefix: 'contractor' }); 
		 * // { "contractorPhoneCls": "1", "contractorPhoneNo1": "010", ... }
		 * ```
		 */
		getContactDataForUnderwriting: function(keyPrefix, option) {
			option = $.extend({
				src: null,
				resultKeyPrefix: null,
				format: null
			}, option);
			var result = {};
			var src = option.src || sfd.data.dataObject;
			var destKeyPrefix = option.resultKeyPrefix || keyPrefix;

			if (option.format == 'long') {
				// 장기는 고객정보 데이터 관리하는 형태가 다름
				result = sfd.core.moduleLong.getContactDataForUnderwriting(keyPrefix, option);
			} else {
				// 자동차/일반
				sfd.data.copyContactData(keyPrefix, destKeyPrefix, {dest: result, src: src, ver: 2 });
			}

			return result;
		},

		endVal: ''
	};
	self.dataExtend = dataExtend;
	/// @endclass

	/**
	 * 공용 유틸에서 사용하지 않는 애들 (제거예정)
	 * @class sfd.coreUtils
	 */
	var coreUtils = {	
		/*
		* Element 치환 필요한것 치환
		* @param {String} inStr 치환할 것들 있는 string
		* @param {Object} option 현재는 옵션 없음
		* @return {String} 치환된 string
		*/
		// 사용하는 곳 없어서 일단 주석 처리
		// replacedElement: function( inStr, option ) {
		// 	var pool = sfd.view.createElementPool;

		// 	function bindingParams() {
		// 		var paramStr = String(arguments[0].substr(0, arguments[0].length - 1));
		// 		// 파라메터가 존재하는 경우
		// 		// 우선은 퍼포먼스 고려해서 id만 치환한다. 
		// 		if (paramStr.split(' ').length > 1) {
		// 			var paramArr = (paramStr.replace(new RegExp('<\\s*?' + item.name), '')).split(' ');
		// 			var paramArrObj = paramStrToObj(paramArr);
					
		// 			if (paramArrObj.id) {
		// 				item.template = item.template.replace( /{{ id }}/g, paramStrToObj(paramArr).id );
		// 			}
		// 			// if(paramArrObj.class)item.template = item.template.replace( /{{ class }}/g, paramStrToObj(paramArr).class );
		// 			return item.template;
		// 		} else {
		// 			return item.template;
		// 		}
		// 	}

		// 	$.each( pool, function( i, item ) {
		// 		// opentag인 경우 
		// 		if ( item.order == 'front' ) {
		// 			// 파라메터포함 검색
		// 			var frontTagFullPattern = new RegExp('<\\s*?' + item.name + '\\b[^>]*>', 'g');
		// 			inStr = inStr.replace( frontTagFullPattern, bindingParams);
					
		// 		} else {
		// 			inStr = inStr.replace(new RegExp(item.pattern, 'g'), item.template);
		// 		}
		// 	});
			
		// 	return inStr;
		// 	function paramStrToObj(inArr) {
				
		// 		var r = {};
		// 		for (var item in inArr ) {
		// 			if (item) {
		// 				var itemArr = item.split('=');
		// 				r[itemArr[0]] = (itemArr.length > 1) ? itemArr[1].replace(/"/g, '') : null;
		// 			}
		// 		}
				
		// 		return r;
		// 	}
		// 	// inStr = sfd.core.customElement(inStr, option );
		// 	// return inStr;
		// },
		/**
		* sfd.view.scrollBox($el).init(width, height, options) 사용하세요.  (deprecated)
		* @method areaScroll
		* @param  {String|Object}   selector 스크롤할 마스크의 selector 또는 jQuery Object. See 참고
		* @param  {Number}   width      넓이 
		* @param  {Number}   height      높이
		* @param {Object} options 옵션 (IScroll 옵션 참고. http://iscrolljs.com)
		* @return {Object}   areaScroll 스크롤러 객체(IScroll). IE 8, 9인 경우 innerScroll.
		* @see
		* selector에 지정한 element의 첫번째 자식 element를 스크롤 내용으로 사용하게 되니 반드시 selector 안에 하나의 자식이 있어야 함.
		*/
		areaScroll: function(selector, width, height, options) {
			var $el = typeof selector == 'string' ? $(selector) : selector;

			// <STRIP_WHEN_RELEASE
			if (sfd.env.isDebug && $el.length > 1) {
				alert('debugMessage242925: areaScroll은 한 번에 하나의 Element씩 적용할 수 있습니다.');
			}
			// STRIP_WHEN_RELEASE>

			// 이미 스크롤이 적용되어 있다면, 저장해놨던 scroller return
			if ( $el.find('.iScrollVerticalScrollbar').length > 0 ||
				$el.find('.slimScrollBar').length > 0) {
				return $el.data('scroller');
			}

			// CSS 적용
			$el.css({
				width: width,
				height: height,
				position: 'relative',
				overflow: 'hidden'
			});
			
			var result;           
			if ( sfd.env.deviceType == 'PC' ) {
				// IE 8, 9에서는 그냥 innerScroll로
				result = sfd.coreUtils.innerScroll($el, width, height, options);
				
			} else {
				// 그 외에는 IScroll
				var deviceType = sfd.env.deviceType
				options = $.extend({
					scrollbars: true,
					mouseWheel: true,
					// checkDOMChanges: false, 
					// desktopCompatibility: true,
					click: true,
					fadeScrollbars: deviceType == 'MO',
					interactiveScrollbars: deviceType != 'MO'
				}, options);

				result = new IScroll($el.get(0), options); // scroll 영역 생성					
				$el.data('scroller', result); // scroller 저장
			}
			return result;
		},

		/**
		* sfd.view.scrollBox($el).init(width, height, options) 사용하세요.  (deprecated)
		* @method innerScroll
		* @param  {String|Object}   selector 스크롤할 마스크의 selector 혹은 jQuery element
		* @param  {Number}   width      넓이 
		* @param  {Number}   height      높이
		* @param {Object} options 옵션
		* Key | Type | 설명
		* ---|---|---
		* alwaysVisible | Boolean | 스크롤바 항상 보일지 여부. 기본값 true
		* railVisible | Boolean | 스크롤바 바 부분 보일지 여부. 기본값 true
		* wheelStep | Integer | 휠 돌리면 몇 라인 스크롤할지. 기본값 10
		* 
		* 더 자세한 옵션은 exlib.js에 slimScroll 옵션 참고
		* 
		* @return {Object} innerScroll 스크롤러 객체(slimScroll). (접근성 모드에서는 selector에 해당하는 jQuery Object)
		*/
		innerScroll: function(selector, width, height, options) {
			var $el = typeof selector == 'string' ? $(selector) : selector;

			// 이미 스크롤이 적용되어 있다면, 저장해놨던 scroller 객체 그대로 반환
			if ( $el.find('.iScrollVerticalScrollbar').length > 0 || $el.find('.slimScrollBar').length > 0) {
				return $el.data('scroller');
			}
			
			// CSS 적용
			var css = {
				height: height,
				position: 'relative',
				overflow: 'hidden'
			};				
			if (width != '100%') {
				css.width = width;
			}
			$el.css(css);

			// Scroll 생성
			var result;

			if (sfd.env.screenReader) {
				// 접근성 모드인 경우 innerScroll 적용 안함
				result = $el.css('overflow', 'scroll');
			} else {
				options = $.extend({
					width: width,
					height: height,
					alwaysVisible: true,
					railVisible: true,
					wheelStep: 10
				}, options);
				
				result = $el.slimScroll(options); // scroll 영역 생성
			}
			
			$el.data('scroller', result); // scroller 저장

			return result;
		},
		endVal: ''
	}
	self.coreUtils = coreUtils;
	/// @endclass

	/**
	 * 히스토리 관리
	 * @class sfd.history
	 */
	var history = {
		//deeplink : {},
		initialization: function() {
			sfd.history.deeplink = window.History;
			sfd.history.deeplink.Adapter.bind(window, 'statechange', function() {
				// Log the State
				var State = sfd.history.deeplink.getState();
				var _currPageName = sfd.data.getValue('currPageName');
				var _movePageName = State.data.state;
				var _curPageIdx = sfd.view.getPageIndex(_currPageName);
				var _movePageIdx = sfd.view.getPageIndex(_movePageName);
				// var _pageActiveNum = parseInt(sfd.data.getValue('pageActiveNum'));				
				// alert(sfd.core._isDeeplinkNormal);
				if (sfd.core._isDeeplinkNormal == 'none') {
					// 브라우져
					if ( _curPageIdx > _movePageIdx ) {

						// 모바일 && 팝업을 검사해서 팝업이 있을경우는 팝업만 닫고 페이지 이동은 X
						if ( sfd.env.deviceType == 'MO' ) {
							sfd.core.moduleDevice.goBackButton();
							return;
						}

						// 이전버튼
						$('#btn-prev-step').trigger('click');
						// sfd.core.getPage(_currPageName).event.btnPrevClick();
					} else if ( _curPageIdx < _movePageIdx ) {
						// 다음버튼
						$('#btn-next-step').trigger('click');
						// sfd.core.getPage(_currPageName).event.btnNextClick();
					}
				} else {
					if (sfd.data.dataObject.divisionName == 'document') {
						sfd.core.showPage(_movePageName);
						return;
					}
					// 화면 
					if (sfd.data.getValue('currPageName') == 'Finish') { // 최종패널인 경우 
						/*sfd.core.alert('결제가 완료된 경우 돌아가실 수 없습니다.');
						return;*/
					}

					/*if (
						_movePageIdx > _pageActiveNum + 1 &&
						sfd.env.server != 'local' // 로컬이 아니고 
					) {
						var _debugMsg = _movePageIdx + ',' + _pageActiveNum + 1 + ',' + (_movePageIdx > _pageActiveNum + 1);
						sfd.core.alert('진행하실 수 없는 단계입니다.', { debugMsg: _debugMsg });
						return;
					}*/

					sfd.log('statechange:', State.data, State.title, State.url);
					sfd.core.showPage(_movePageName, $.extend({ ptype: 'deeplink' }, sfd.data.dataObject.showPageOption));
				}  				
			});			
		},
		showPage: function(inName) {
			
			sfd.core._isDeeplinkNormal = true;
			// alert('showPage history '+inName+' , '+sfd.core._isDeeplinkNormal)
			//var pageUrl = window.location.href;
			//sfd.log('History.enabled',History.history.enabled);
			var _paramstr = '';
			var _parameters = sfd.env.parameters;
			for (var i in _parameters) {
				if (i != 'state') {
					_paramstr += '&' + i + '=' + _parameters[i];
				}
			}
			if (sfd.history.deeplink.enabled) {
				sfd.history.deeplink.pushState({ state: inName, rand: Math.random() }, inName, '?state=' + inName + _paramstr);
			} else {

			}
			document.title = sfd.data.dataObject.title;
		}
	};
	self.history = history;
	/// @endclass

	/**
	 * 구동환경 관련 정보
	 * @class sfd.env
	 */
	var env = {
		rootPath: '/ria', /// {String} <서버> ria 루트 경로. 예) "/ria"
		server: 'www', /// {String} <서버> 서버 타입.
		referrer: '', /// {String} <접속정보> referrer
		parameters: {}, /// {Object} <접속정보> URL 파라미터 정보 {key1: value1, key2: value2, ...}
		parentInfo: null, /// {Object} <접속정보> iframe 안에 열린 경우 부모 정보?
		stageWidth: 0, /// {Integer} <화면> 필요한지 확인
		stageHeight: 0, /// {Integer} <화면> 필요한지 확인
		mainWidth: 0, /// {Integer|String} <화면> 필요한지 확인
		mainHeight: 0, /// {Integer|String} <화면> 필요한지 확인
		os: {}, /// {Object} <클라이언트> OS 정보. name, group, fullVersion, majorVersion, minorVersion
		browser: {}, /// {Object} <클라이언트> 브라우져 정보. name, group, fullVersion, majorVersion, minorVersion
		deviceType: '', /// {String} <클라이언트> 기기 종류. 각 상품 Data.js에 정의한 type 기준임. PC, MO, DID
		deviceSubtype: '', /// {String} <클라이언트> 기기 하위 종류. pc: pc, mobile: phone, tablet
		isApp: false, /// {Boolean} <클라이언트> 삼성화재 다이렉트 App 내에서 열렸는지 여부
		app: {}, /// {Object} <클라이언트> App 정보. name, version, interfaceVersion. 삼성화재 다이렉트 앱은 아니지만 모바일 앱내 WebView 인 경우 name 정보만 들어 있음 (safari, chrome, naver, daum, kakaotalk, line, nate, toss, ...)
		screenReader: false, /// {Boolean} <접속정보> 접근성모드 여부
		openSizeInfo: {}, /// {Object} <화면> 처음 열릴 때 크기 정보. wrapperWidth, shellMain, shellLeft
		isDebug: false, /// {Boolean} <디버그> 디버그 모드 여부
		debugLevel: 0, /// {Integer} <디버그> 디버그 레벨
		// <STRIP_WHEN_RELEASE
		/**
		 * 디버그 옵션
		 * @category 디버그
		 * @type {Object}
		 * @see
		 * `sfd.env.isDebug` 가 **false** 일 때는 존재하지 않으니 반드시 `sfd.env.debug` 존재 확인 후 사용.
		 * Key | Type | 설명
		 * ---|---|---
		 * useCertPC | Boolean | Mobile 버전에서 PC 공인인증 사용할지 여부.
		 * certPass | Boolean | 개발계에서 공인인증 자동으로 진행처리할지 여부.
		 */
		debug: {},
		// STRIP_WHEN_RELEASE>
		/**
		 * 환경 정보 초기화
		 * @category 초기화
		 * @param {Object} data sfd.data 객체
		 */
		initialize: function(data) {
			var w = data.getValue('mainWidth');
			var h = data.getValue('mainHeight');
			var system = getSystemInfo();
			var saveParentsInfo = null;
			try {
				saveParentsInfo = parent.sfsfd.saveParentsInfo;
			} catch (e) {}
	
			this.os = system.os;
			this.browser = system.browser;
			this.referrer = document.referrer;
			this.parentInfo = saveParentsInfo;
			this.stageWidth = $(window).width();
			this.stageHeight = $(window).height();
			this.mainWidth = w || $(window).width();
			this.mainHeight = h || $(window).height();
			this.parameters = parseURLParameters(location);
			this.server = getServer();
			this.deviceType = data.getValue('type');
			this.deviceSubtype = getDeviceSubtype(system.os.group);
			this.openSizeInfo = {
				wrapperWidth: $('#wrapper').width(),
				shellMain: $('#shell-main').width(),
				shellLeft: ($('#shell-left').width()) ? $('#shell-left').width() : 0 // 없을 수 있는 항목은 null처리 
			}
			this.screenReader = (this.parameters.sr == 'true');
			this.debugLevel = parseInt(this.parameters.debug, 10) || 0;
			this.isDebug = this.debugLevel > 0;
			// <STRIP_WHEN_RELEASE
			if (this.server == 'local') {
				if (!this.isIE()) {
					this.isDebug = true; // 로컬이고 IE 아닌 경우 기본으로 debug 모드
				}
			}
			// STRIP_WHEN_RELEASE>			
			if (this.isDebug) {
				this.debug = {}; // Debug 옵션
			}

			if (this.parameters.certTest != '1' && this.server == 'dev' && (this.parameters.certPass == '1' || navigator.platform == 'MacIntel')) {
				// 개발계에서 certPass 지정된 경우 공인인증 실제로 안하고 한거처럼 진행시킴 (macOS에서는 certPass 없어도 자동진행으로 처리)
				this.debug.certPass = true;
			}

			// 모바일인 경우 
			if (this.deviceType == 'MO') {
				// PC용 공인인증 사용 여부
				if (this.debug && this.server != 'www') {
					this.debug.useCertPC = (['Win32', 'Win64'].includes(navigator.platform) && this.parameters.certPC == 'true');
				}

				// 앱 정보 확인
				var appName = getMobileAppName();
				if (appName) {
					if (appName == 'sfd') {
						// 삼성화재 다이렉트 앱인 경우
						var match = navigator.userAgent.match(/SamsungFireDirectApp\/([0-9]+\.[0-9]+(\.[0-9]+){0,1})_([0-9]{0,3})/);
						if (match) {
							this.isApp = true;
							this.app = {
								name: appName,
								version: match[1],
								interfaceVersion: parseInt(match[3], 10)
							}
						}	
					} else {
						// 기타 앱 내 WebView인 경우 앱 이름 (safari, chrome, naver, daum, kakaotalk, line, nate)
						this.app = {
							name: appName
						}
					}
				}
			}
		},		
		/**
		 * 크롬인가?
		 * @category 유틸리티 함수
		 * @return {Boolean}
		 */
		isChrome: function() {
			return this.browser.group == 'Chrome';
		},
		/**
		 * 사파리인가? 
		 * @category 유틸리티 함수
		 * @return {Boolean}
		 */
		isSafari: function() {
			return this.browser.group == 'Safari';
		},
		/**
		 * IE인가? 
		 * @category 유틸리티 함수
		 * @return {Boolean}
		 */
		isIE: function() {
			return this.browser.group == 'Explorer';
		},
		/**
		 * IE6이하?
		 * @category 유틸리티 함수
		 * @return {Boolean}
		 */
		isIE6Below: function() {
			return this.browser.group == 'Explorer' && this.browser.majorVersion <= 6;
		},
		/**
		 * IE7이하?
		 * @category 유틸리티 함수
		 * @return {Boolean}
		 */
		isIE7Below: function() {
			return this.browser.group == 'Explorer' && this.browser.majorVersion <= 7;
		},
		/**
		 * IE8이하?
		 * @category 유틸리티 함수
		 * @return {Boolean}
		 */
		isIE8Below: function() {
			return this.browser.group == 'Explorer' && this.browser.majorVersion <= 8;
		},
		/**
		 * IE9이하?
		 * @category 유틸리티 함수
		 * @return {Boolean}
		 */
		isIE9Below: function() {
			return this.browser.group == 'Explorer' && this.browser.majorVersion <= 9;
		},
		/**
		 * IE10이하?
		 * @category 유틸리티 함수
		 * @return {Boolean}
		 */
		isIE10Below: function() {
			return this.browser.group == 'Explorer' && this.browser.majorVersion <= 10;
		},
		/**
		 * IE11이하?
		 * @category 유틸리티 함수
		 * @return {Boolean}
		 */
		isIE11Below: function() {
			return this.browser.group == 'Explorer' && this.browser.majorVersion <= 11;
		}
	}
	self.env = env;
	/// @endclass

	/**
	 * @class sfd
	 */

	return self;

	/**
	 * Core 모듈 버전 확인 및 로그 처리
	 */
	function checkCoreModuleVersion() {
		if (sfd.env.isIE8Below()) {
			return; // IE8에서는 패스
		}

		var checkCoreFilePromise = function(options) {
			sfd.view.checkModuleLoaded({
				moduleName: options.moduleName,
				moduleType: 'core',
				fileType: 'js',
				moduleContent: options.moduleContent
			});
			var p = new promise.Promise();
			setTimeout(function() {
				p.done(null);
			}, 500);
			return p;
		};

		// 버전체크 
		promise.chain([
			function() {
				return checkCoreFilePromise({
					moduleName: 'Sfd.module',
					moduleContent: module
				});
			},
			function() {
				return checkCoreFilePromise({
					moduleName: 'Sfd.listValue',
					moduleContent: listValue
				});
			},
			function() {
				return checkCoreFilePromise({
					moduleName: 'Sfd.message',
					moduleContent: message
				});
			},
			function() {
				return checkCoreFilePromise({
					moduleName: 'Sfd.server',
					moduleContent: server
				});
			},
			function() {
				return checkCoreFilePromise({
					moduleName: 'Sfd.tracker',
					moduleContent: tracker
				});
			},
			function() {
				return checkCoreFilePromise({
					moduleName: 'Sfd.utils',
					moduleContent: utils
				});
			},
			function() {
				return checkCoreFilePromise({
					moduleName: 'Sfd.view',
					moduleContent: view
				});
			}
		]);
	}

	/**
	 * 처음 설정해야할 data 값들 세팅.
	 */
	function setInitialData() {
		var module = sfd.module;

		sfd.data.setValue('sysdate', '');
		sfd.data.setValue('today', '');
		sfd.data.setValue('env', JSON.parse(JSON.stringify(self.env)));
		sfd.data.setValue('stageWidth', $('#wrapper').width());
		sfd.data.setValue('serverGubun', self.env.server);

		// 서버 인터페이스
		sfd.data.interfaces = $.extend(true, module.interfaces, sfd.data.interfaces);
		sfd.data.interfacesSkipDecryption = module.interfacesSkipDecryption.concat(sfd.data.interfacesSkipDecryption);
		sfd.data.interfacesSkipParseJSON = module.interfacesSkipParseJSON.concat(sfd.data.interfacesSkipParseJSON);
		
		// 이벤트
		if (sfd.data.dataObject.productPath != 'mydirect') {
			var eventType = sfd.env.parameters.eventType || sfdCookie.get('type'); // URL 파라미터가 있는 경우 파라미터 우선
			var eventOTK = sfd.env.parameters.eventOTK || sfdCookie.get('param'); // URL 파라미터가 있는 경우 파라미터 우선

			sfd.data.setValue('dlpoType', eventType );
			sfd.data.setValue('eventType', eventType );
			sfd.data.setValue('eventOTK', eventOTK );
		}
	}

	/**
	 * 기본 HTML 초기화 작업. (기본 CSS Class 적용. 요소 추가 등)
	 * @see
	 * 환경(OS, Browser 등)을 CSS class로 등록
	 * - 기기 : sfd-mobile, sfd-pc (실제 기기가 아닌 상품 data에 deviceType 기준)
	 * - OS: win, mac, linux, chromeos, android, ios, blackberry
	 * - Browser: ie, chrome, safari, firefox, opera, spartan
	 * - Browser가 ie 인 경우: ie8, ie9, ie10, ie11
	 */
	function initializeHTML() {
		var env = sfd.env;

		// html 에 환경 CSS class 추가
		var htmlClasses = [];

		htmlClasses.push(env.deviceType == 'MO' ? 'sfd-mobile' : 'sfd-pc'); // device
		htmlClasses.push((function(os) { // os
			switch (os) {
				case 'Mac OS': return 'mac';
				case 'Windows': return 'win';
				case 'Chrome OS': return 'chromeos';
				default: return os.replace(/\s/g, '').toLowerCase();
			}
		})(env.os.group || ''));
		htmlClasses.push((function(browser) { // browser
			if (env.os.group == 'Android' && browser == 'Safari') {
				return 'androidbrowser';
			}
			switch (browser) {
				case 'Explorer': return 'ie';
				case 'Windows': return 'win';
				case 'Chrome OS': return 'chromeos';
				default: return browser.replace(/\s/g, '').toLowerCase();
			}
		})(env.browser.group || ''));
		if (env.browser.group == 'Explorer') { // IE인 경우 ie8, ie9 처럼 버전도 추가
			htmlClasses.push('ie' + env.browser.majorVersion);
		}

		var $html = $('html');
		$html.addClass(htmlClasses.join(' '));
		if ($html.hasClass('ios') && $html.hasClass('mac')) {
			$html.removeClass('mac'); // 홈페이지 js 에서 잘못 넣는 것 있어서 제거 처리
		}

		// #wrapper 요소에 환경 CSS class 추가
		var wrapperClasses = [];

		wrapperClasses.push('division-name-' + sfd.data.dataObject.divisionName);
		wrapperClasses.push('browser-' + (function(browser) {
			return browser == 'Internet Explorer' ? 'IE' : browser.replace(/\s/g, '');
		})(env.browser.name || ''));
		wrapperClasses.push('ver' + sfd.env.browser.majorVersion);

		$('#wrapper').addClass(wrapperClasses.join(' '));
		
		// 필요한 요소 추가		
		if (sfd.env.deviceType == 'PC') {
			// PC 
			// 근접도움말 뷰포트 추가
			$('<div id="shell-tooltip-viewport"></div>').insertBefore('#shell');
		} else {
			// Mobile
			if (sfd.env.os.group == 'iOS') {
				// iPhoneX safeArea 지원
				var $viewport = $('meta[name=viewport]');
				var viewportContent = $viewport.attr('content');
				if (viewportContent.includes('viewport-fit=') == false) {
					$viewport.attr('content', viewportContent + ', viewport-fit=cover');
				} else {
					$viewport.attr('content', viewportContent.replace(/viewport\-fit=[a-z]+/, 'viewport-fit=cover'));
				}
			}
		}
	}

	/**
	 * 기기(PC, Mobile) 공통 모듈 로드
	 * @param {Function} completed 로드 완료 callback 함수. `function(success) {}`
	 * @see
	 * 로드된 기기 공통 모듈은 `sfd.core.moduleDevice`로 사용.
	 */
	function loadDeviceModule(completed) {
		var deviceType = sfd.env.deviceType;
		var device = (deviceType == 'MO') ? deviceType = 'Mobile' : (deviceType == 'PC') ? deviceType = 'PC' : null;
		if (device) {
			require([
				'/ria/common/resource/ModuleDevice' + device + '.js?' + sfdCacheBust
			], function (resource) {
				sfd.core.moduleDevice = resource;
				sfd.core.moduleDevice.initialization(sfd);

				completed(true);
			}, function (err) {
				sfd.warnLog('Error 해당 기기 공통 모듈파일이 없는 것 같아요.' + err); 
				completed(false);
			});
		} else {
			sfd.warnLog('상품에 deviceType이 지정되어 있지 않음.'); 
			completed(false);
		}
	}

	/**
	 * 상품 공통 모듈 로드
	 * @param {Function} completed 로드 완료 callback 함수. `function(success) {}`
	 * @see
	 * 로드된 상품 공통 모듈은 `sfd.core.module`로 사용.
	 * 
	 * 추가 공통 모듈
	 * - 자동차 상품
	 * 배서, 이륜차, 할까말까의 경우 **sfd.core.module**은 ModuleCar가 로드되어 있고,
	 * 자기 공통 모듈은 `sfd.core.moduleEndo`, `sfd.core.moduleBike`, `sfd.core.moduleClaim`로 사용.
	 * - 일반 상품
	 * `sfd.core.moduleGeneral`
	 * - 장기 상품
	 * `sfd.core.moduleLong`
	 */
	function loadDivisionModule(completed) {
		var divisionName = sfd.data.dataObject.divisionName || '';

		// 각 상품별 공통 모듈 파일 로드
		if (!divisionName) {
			// divisionName 없는 경우(테스트상품 등) 공통 모듈 로딩 안하고 바로 시작. (공통모듈 파일 없으면 시간이 좀 걸려서)
			completed(true);
		} else {
			var modules = [];

			// 기본 상품 공통 모듈 sfd.core.module
			var moduleName = divisionName;
			if (['bloc', 'endo', 'bike', 'claim'].includes(divisionName)) {
				// 일괄, 배서, 이륜차, 할까말까는 ModuleCar를 상품 공통 모듈로 사용
				moduleName = 'car';
			}
			moduleName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
			var fileName = 'Module' + moduleName;
			modules.push('/ria/common/resource/' + fileName + '.js?' + sfdCacheBust);

			// 추가 공통 모듈 sfd.core.moduleXXX
			var additionalModuleName = null;
			var lobCd = sfd.data.getValue('lobCd');
			switch (lobCd) {
				case 'LL': // 장기상품
					additionalModuleName = 'ModuleLong';
					break;
				case 'LP': // 일반상품
					additionalModuleName = 'ModuleGeneral';
					break;
				default: // 자동차상품
					// 배서, 이륜차, 할까말까는 ModuleCar를 core.module로 접근 자신의 공통모듈은 moduleEndo처럼 접근			
					if (['endo', 'bike', 'claim'].includes(divisionName)) {
						additionalModuleName = 'Module' + divisionName.charAt(0).toUpperCase() + divisionName.slice(1);
					}
					break;
			}
			if (additionalModuleName) {
				modules.push('/ria/common/resource/' + additionalModuleName + '.js?' + sfdCacheBust);
			}

			// 모듈 로드
			require(modules, function (module, additionalModule) {
				if (module) {
					// 상품 공통 모듈
					sfd.core.module = module;
					sfd.core.module.initialization(sfd);
					
					sfd.view.checkModuleLoaded({
						moduleName: fileName,
						moduleType: 'module',
						fileType: 'js',
						moduleContent: module
					});
				}

				if (additionalModule) {
					// 추가 공통 모듈이 있는 경우
					var moduleKey = additionalModuleName.charAt(0).toLowerCase() + additionalModuleName.slice(1);
					sfd.core[moduleKey] = additionalModule;
					sfd.core[moduleKey].initialization(sfd);

					sfd.view.checkModuleLoaded({
						moduleName: additionalModuleName,
						moduleType: 'module',
						fileType: 'js',
						moduleContent: additionalModule
					});
				}
				completed(true);

			}, function (err) {
				sfd.warnLog('Error 해당 상품 공통 모듈 파일이 없는 것 같아요.', err);
				completed(false);
			});
		}		
	}

	/**
	 * 추가 의존 모듈들(보안모듈, 홈페이지 모듈 등) 초기화/로드
	 * @see
	 * jQuery 로드된 후 호출해야 함
	 */
	function loadExternalModules() {
		var _productPath = sfd.data.dataObject.productPath;
		
		sfd.server.externalSolution.init();
		// core, data 준비완료
		sfd.core.systemReady();
		sfd.data.systemReady();

		// 파킹용 상품코드 입력
		try {
			if (window.$global) {
				$global.riapage = _productPath;
				$global.uiParkingPage()
			}
		} catch (e) {}

		// smartHelp로드
		if ( sfd.env.deviceType == 'PC' ) {

			if ( sfd.env.isIE7Below() ) {
			    location.href = '/util/ubrowser_info.html';
			}

			if ( $('#shell-smarthelp').length > 0 ) {
				sfd.view.loadModule({
					name: 'ModuleSmartHelp',
					url: '/ria/pc/product/common/resource/ModuleSmartHelp',
					onLoaded: function(module) {
						sfd.view.writeHtml($('#shell-smarthelp'), module.viewHtml);
						// $('#shell-smarthelp').html(module.viewHtml);
					}
				});
			}

			$.getScript('/resources/js/ui.plugins.min.js');

			// 파킹용 상품코드 입력
			try {
				if (window.$global) {
					// $global.riapage = _productPath;
					// $global.uiParkingPage()
				}
			} catch (e) {}

			// 홈페이지 ui js로드 
			/*$.getScript('/resources/js/ui.global.min.js', function() {
		            $(doc).ready(function(){ //side 가이드 실행
		                $global.uiQuickJson({ id:'uiQuickWrap', json:'/resources/json/quick.json', type:'ria_'+_productPath });    });
		        })(jQuery, window, document);

		        // 파킹용 상품코드 입력
				try{
					if( $global ) $global.riapage = _productPath;
				}catch(e){}

			});*/
			// $.getScript('/resources/js/ui.plugins.min.js');
			
		} 
	}

	/**
	 * 외부에서 externalSfd로 접근해서 사용하고자 하는것들 초기화
	 * @see
	 * Key | Type | 설명
	 * ---|---|---
	 * alert | Function | sfd.core.alert() 연결
	 * axmodule_nos | Function | NOS 설치여부 get/set. function(val) {}
	 * axmodule_anysign | Function | AnySign 설치여부 get/set. function(val) {}
	 * reloadGotoPage | Function | sfd.coreExtend.reloadGotoPage() 연결
	 */
	function initializeExternalInterface() {
		window.externalSfd = {
			// ria alert
			alert: sfd.core.alert,
			// nos 설치여부 get/set
			axmodule_nos: function(val) {
				if ( arguments.length > 0 ) {
					sfd.data.dataObject.axmodule_nos = val;
				} else {
					return sfd.data.dataObject.axmodule_nos;
				}
			},
			// anysign 설치여부 get/set
			axmodule_anysign: function(val) {
				if ( arguments.length > 0 ) {
					sfd.data.dataObject.axmodule_anysign = val;
				} else {
					return sfd.data.dataObject.axmodule_anysign;
				}
			},
			reloadGotoPage: self.coreExtend.reloadGotoPage 
		};
	}

	/**
	 * Console에 로그 찍기
	 * @private
	 * @see
	 * debug 모드가 아니면 안찍음.
	 */
	function consoleLog() {
		try {
			if (sfd.env.isDebug && window.console && window.console.log) {
				window.console.log.apply(window.console, arguments);
			}
		} catch (e) {}
	}

	/**
	 * URL 파라미터를 object 형태로 반환
	 * @private
	 * @param {Object} location location object.
	 * @returns {Object} {param1: value1, param2: value2, ...} 형태의 URL 파라미터
	 */
	function parseURLParameters(location) {
		var result = {};
		var s = location.search.substr(1);
		s = s.split('&amp;').join('&'); // 임시로 주소 인자에 &가 &amp;로 넘어오는 경우 인자가 잘못 들어오는 경우 방지를 위해
		var params = s.split('&');

		for (var i = 0; i < params.length; i++) {
			var p = params[i].split('=');
			if (p.length < 2) {
				continue;
			}

			var key = p[0];
			p.splice(0, 1);
			var value = p.join('='); //.split('mytmpamp;').join('&amp;');
			if (value.length > 0) {
				result[key] = decodeURIComponent(value);
			}
		}
		return result;
	}

	/**
	 * 현재 서버 종류 반환
	 * @return {String} 로컬: "local", 개발계: "dev", 통테계: "test", 가동계: "www"
	 */
	function getServer() {
		var g = location.protocol + '//' + location.host;
		var result = 'www';

		// var tests = ['//ntest', '//test', '42.8.220.49'];
		// if (sfd.utils.containsAny(g, tests)) {
		// 	result = 'test';
		// }
		var tests2 = ['\x2f\x2f\x6e\x74\x65\x73\x74', '\x2f\x2f\x74\x65\x73\x74', '\x34\x32\x2e\x38\x2e\x32\x32\x30\x2e\x34\x39'];
		if (sfd.utils.containsAny(g, tests2)) {
			result = '\x74\x65\x73\x74';
		}
		// <STRIP_WHEN_RELEASE
		var locals = ['localhost', '127.0.0.1', '42.241.131.', '42.243.134.', '10.0.', 'file://'];
		var devs = ['//ndev', '//dev', '42.8.220.60', '42.8.220.65', 'erp.anycardirect.com', 'legacy.anycardirect.com'];
		if (sfd.utils.containsAny(g, locals)) {
			result = 'local';
		} else if (sfd.utils.containsAny(g, devs)) {
			result = 'dev';
		}
		// STRIP_WHEN_RELEASE>

		return result;
	}

	/**
	 * 현재 디바이스 종류 구분
	 * @private
	 * @param {Object} os OS 정보
	 * @return {String} 폰이면 'phone', 태블릿이면 'tablet', 나머지는 'pc'
	 * @see
	 * 모바일 OS고 window.width, window.height 둘 다 768 이상이면 tablet. 아니면 phone
	 * 나머지는 PC
	 */
	function getDeviceSubtype(os) {
		if (['iOS', 'Android', 'Windows Phone', 'BlackBerry'].includes(os) == true) {
			if ($(window).width() >= 768 && $(window).height() >= 768) {
				return 'tablet';
			} else {
				return 'phone';
			}
		} else {
			return 'pc';
		}
	}

	/**
	 * 시스템 정보 얻기
	 * @private
	 * @return {Object} 시스템 정보 담은 Object.
	 * Key | 설명
	 * os | OS 정보
	 * browser | 브라우져 정보
	 */
	function getSystemInfo() {

		var pgwBrowser = {};
		pgwBrowser.userAgent = navigator.userAgent;
		pgwBrowser.browser = {};
		pgwBrowser.os = {};
		// var resizeEvent = null;

		// The order of the following arrays is important, be careful if you change it.

		var browserData = [
			{ name: 'Chromium', group: 'Chrome', identifier: 'Chromium/([0-9\.]*)' },
			{ name: 'Chrome Mobile', group: 'Chrome', identifier: 'Chrome/([0-9\.]*) Mobile', versionIdentifier: 'Chrome/([0-9\.]*)' },
			{ name: 'Chrome', group: 'Chrome', identifier: 'Chrome/([0-9\.]*)' },
			{ name: 'Chrome for iOS', group: 'Chrome', identifier: 'CriOS/([0-9\.]*)' },
			{ name: 'Android Browser', group: 'Chrome', identifier: 'CrMo/([0-9\.]*)' },
			{ name: 'Firefox', group: 'Firefox', identifier: 'Firefox/([0-9\.]*)' },
			{ name: 'Opera Mini', group: 'Opera', identifier: 'Opera Mini/([0-9\.]*)' },
			{ name: 'Opera', group: 'Opera', identifier: 'Opera ([0-9\.]*)' },
			{ name: 'Opera', group: 'Opera', identifier: 'Opera/([0-9\.]*)', versionIdentifier: 'Version/([0-9\.]*)' },
			{ name: 'IEMobile', group: 'Explorer', identifier: 'IEMobile/([0-9\.]*)' },
			{ name: 'Internet Explorer', group: 'Explorer', identifier: 'MSIE ([a-zA-Z0-9\.]*)' },
			{ name: 'Internet Explorer', group: 'Explorer', identifier: 'Trident/([0-9\.]*)', versionIdentifier: 'rv:([0-9\.]*)' },
			{ name: 'Spartan', group: 'Spartan', identifier: 'Edge/([0-9\.]*)', versionIdentifier: 'Edge/([0-9\.]*)' },
			{ name: 'Safari', group: 'Safari', identifier: 'Safari/([0-9\.]*)', versionIdentifier: 'Version/([0-9\.]*)' }
		];

		var osData = [
			{ name: 'Windows 2000', group: 'Windows', identifier: 'Windows NT 5.0', version: '5.0' },
			{ name: 'Windows XP', group: 'Windows', identifier: 'Windows NT 5.1', version: '5.1' },
			{ name: 'Windows Vista', group: 'Windows', identifier: 'Windows NT 6.0', version: '6.0' },
			{ name: 'Windows 7', group: 'Windows', identifier: 'Windows NT 6.1', version: '7.0' },
			{ name: 'Windows 8', group: 'Windows', identifier: 'Windows NT 6.2', version: '8.0' },
			{ name: 'Windows 8.1', group: 'Windows', identifier: 'Windows NT 6.3', version: '8.1' },
			{ name: 'Windows 10', group: 'Windows', identifier: 'Windows NT 10.0', version: '10.0' },
			{ name: 'Windows Phone', group: 'Windows Phone', identifier: 'Windows Phone ([0-9\.]*)' },
			{ name: 'Windows Phone', group: 'Windows Phone', identifier: 'Windows Phone OS ([0-9\.]*)' },
			{ name: 'Windows', group: 'Windows', identifier: 'Windows' },
			{ name: 'Chrome OS', group: 'Chrome OS', identifier: 'CrOS' },
			{ name: 'Android', group: 'Android', identifier: 'Android', versionIdentifier: 'Android ([a-zA-Z0-9\.-]*)' },
			{ name: 'iPad', group: 'iOS', identifier: 'iPad', versionIdentifier: 'OS ([0-9_]*)', versionSeparator: '[_|\.]' },
			{ name: 'iPod', group: 'iOS', identifier: 'iPod', versionIdentifier: 'OS ([0-9_]*)', versionSeparator: '[_|\.]' },
			{ name: 'iPhone', group: 'iOS', identifier: 'iPhone OS', versionIdentifier: 'OS ([0-9_]*)', versionSeparator: '[_|\.]' },
			{ name: 'macOS Catalina', group: 'Mac OS', identifier: 'Mac OS X (10([_|\.])15([0-9_\.]*))', versionSeparator: '[_|\.]' },
			{ name: 'macOS Mojave', group: 'Mac OS', identifier: 'Mac OS X (10([_|\.])14([0-9_\.]*))', versionSeparator: '[_|\.]' },
			{ name: 'Mac OS X High Sierra', group: 'Mac OS', identifier: 'Mac OS X (10([_|\.])13([0-9_\.]*))', versionSeparator: '[_|\.]' },
			{ name: 'Mac OS X Sierra', group: 'Mac OS', identifier: 'Mac OS X (10([_|\.])12([0-9_\.]*))', versionSeparator: '[_|\.]' },
			{ name: 'Mac OS X El Capitan', group: 'Mac OS', identifier: 'Mac OS X (10([_|\.])11([0-9_\.]*))', versionSeparator: '[_|\.]' },
			{ name: 'Mac OS X Yosemite', group: 'Mac OS', identifier: 'Mac OS X (10([_|\.])10([0-9_\.]*))', versionSeparator: '[_|\.]' },
			{ name: 'Mac OS X Mavericks', group: 'Mac OS', identifier: 'Mac OS X (10([_|\.])9([0-9_\.]*))', versionSeparator: '[_|\.]' },
			{ name: 'Mac OS X Mountain Lion', group: 'Mac OS', identifier: 'Mac OS X (10([_|\.])8([0-9_\.]*))', versionSeparator: '[_|\.]' },
			{ name: 'Mac OS X Lion', group: 'Mac OS', identifier: 'Mac OS X (10([_|\.])7([0-9_\.]*))', versionSeparator: '[_|\.]' },
			{ name: 'Mac OS X Snow Leopard', group: 'Mac OS', identifier: 'Mac OS X (10([_|\.])6([0-9_\.]*))', versionSeparator: '[_|\.]' },
			{ name: 'Mac OS X Leopard', group: 'Mac OS', identifier: 'Mac OS X (10([_|\.])5([0-9_\.]*))', versionSeparator: '[_|\.]' },
			{ name: 'Mac OS X Tiger', group: 'Mac OS', identifier: 'Mac OS X (10([_|\.])4([0-9_\.]*))', versionSeparator: '[_|\.]' },
			{ name: 'Mac OS X Panther', group: 'Mac OS', identifier: 'Mac OS X (10([_|\.])3([0-9_\.]*))', versionSeparator: '[_|\.]' },
			{ name: 'Mac OS X Jaguar', group: 'Mac OS', identifier: 'Mac OS X (10([_|\.])2([0-9_\.]*))', versionSeparator: '[_|\.]' },
			{ name: 'Mac OS X Puma', group: 'Mac OS', identifier: 'Mac OS X (10([_|\.])1([0-9_\.]*))', versionSeparator: '[_|\.]' },
			{ name: 'Mac OS X Cheetah', group: 'Mac OS', identifier: 'Mac OS X (10([_|\.])0([0-9_\.]*))', versionSeparator: '[_|\.]' },
			{ name: 'Mac OS', group: 'Mac OS', identifier: 'Mac OS' },
			{ name: 'Ubuntu', group: 'Linux', identifier: 'Ubuntu', versionIdentifier: 'Ubuntu/([0-9\.]*)' },
			{ name: 'Debian', group: 'Linux', identifier: 'Debian' },
			{ name: 'Gentoo', group: 'Linux', identifier: 'Gentoo' },
			{ name: 'Linux', group: 'Linux', identifier: 'Linux' },
			{ name: 'BlackBerry', group: 'BlackBerry', identifier: 'BlackBerry' }
		];

		//  Set browser data
		var setBrowserData = function() {
			var userAgent = pgwBrowser.userAgent.toLowerCase();

			// Check browser type
			for (var i = 0, len = browserData.length; i < len; i++) {
				// for (i in browserData) {
				var browserRegExp = new RegExp(browserData[i].identifier.toLowerCase());
				var browserRegExpResult = browserRegExp.exec(userAgent);

				if (browserRegExpResult != null && browserRegExpResult[1]) {
					pgwBrowser.browser.name = browserData[i].name;
					pgwBrowser.browser.group = browserData[i].group;

					// Check version
					if (browserData[i].versionIdentifier) {
						var versionRegExp = new RegExp(browserData[i].versionIdentifier.toLowerCase());
						var versionRegExpResult = versionRegExp.exec(userAgent);

						if (versionRegExpResult != null && versionRegExpResult[1]) {
							setBrowserVersion(versionRegExpResult[1]);
						}

					} else {
						setBrowserVersion(browserRegExpResult[1]);
					}

					break;
				}
			}

			return true;
		};

		// Set browser version
		var setBrowserVersion = function(version) {
			var splitVersion = version.split('.', 2);
			pgwBrowser.browser.fullVersion = version;

			// Major version
			if (splitVersion[0]) {
				pgwBrowser.browser.majorVersion = parseInt(splitVersion[0]);
			}

			// Minor version
			if (splitVersion[1]) {
				pgwBrowser.browser.minorVersion = parseInt(splitVersion[1]);
			}

			return true;
		};

		//  Set OS data
		var setOsData = function() {
			var userAgent = pgwBrowser.userAgent.toLowerCase();

			// Check browser type
			for (var i = 0, len = osData.length; i < len; i++) {
				// for (i in osData) {
				var osRegExp = new RegExp(osData[i].identifier.toLowerCase());
				var osRegExpResult = osRegExp.exec(userAgent);

				if (osRegExpResult != null) {
					pgwBrowser.os.name = osData[i].name;
					pgwBrowser.os.group = osData[i].group;

					// Version defined
					if (osData[i].version) {
						setOsVersion(osData[i].version, (osData[i].versionSeparator) ? osData[i].versionSeparator : '.');

						// Version detected
					} else if (osRegExpResult[1]) {
						setOsVersion(osRegExpResult[1], (osData[i].versionSeparator) ? osData[i].versionSeparator : '.');

						// Version identifier
					} else if (osData[i].versionIdentifier) {
						var versionRegExp = new RegExp(osData[i].versionIdentifier.toLowerCase());
						var versionRegExpResult = versionRegExp.exec(userAgent);

						if (versionRegExpResult != null && versionRegExpResult[1]) {
							setOsVersion(versionRegExpResult[1], (osData[i].versionSeparator) ? osData[i].versionSeparator : '.');
						}
					}

					break;
				}
			}

			return true;
		};

		// Set OS version
		var setOsVersion = function(version, separator) {
			if (separator.substr(0, 1) == '[') {
				var splitVersion = version.split(new RegExp(separator, 'g'), 2);
			} else {
				var splitVersion = version.split(separator, 2);
			}

			if (separator != '.') {
				version = version.replace(new RegExp(separator, 'g'), '.');
			}

			pgwBrowser.os.fullVersion = version;

			// Major version
			if (splitVersion[0]) {
				pgwBrowser.os.majorVersion = parseInt(splitVersion[0]);
			}

			// Minor version
			if (splitVersion[1]) {
				pgwBrowser.os.minorVersion = parseInt(splitVersion[1]);
			}

			return true;
		};

		// Replace default value for the user-agent tester on pgwjs.com
		if (typeof window.pgwJsUserAgentTester != 'undefined') {
			pgwBrowser.userAgent = window.pgwJsUserAgentTester;
		}

		// Initialization
		setBrowserData();
		setOsData();

		if (!pgwBrowser.browser.name) {
			// Simulator에서는 userAgent에 browser 정보가 없음
			if (pgwBrowser.os.group == 'iOS') {
				pgwBrowser.browser = { name: 'Safari', group: 'Safari', majorVersion: pgwBrowser.os.majorVersion || 0, minorVersion: 0 };
			}
		}

		return pgwBrowser;
	} // getBrowserInfo()

	function getMobileAppName() {
		var result = null;
		var ua = navigator.userAgent;

		if (/SamsungFireDirectApp/.test(ua)) {
			result = 'sfd';
		} else if (/NAVER/.test(ua)) {
			result = 'naver';
		} else if (/DaumApps/.test(ua)) {
			result = 'daum';
		} else if (/KAKAOTALK/.test(ua)) {
			result = 'kakaotalk';
		} else if (/Line/.test(ua)) {
			result = 'line';
		} else if (/nate_app/.test(ua)) {
			result = 'nate';
		} else if (/SamsungBrowser/.test(ua)) {
			result = 'samsungbrowser';
		} else if (/TossApp/.test(ua)) {
			result = 'toss';
 		} else if (/Safari/.test(ua)) {
			// 사파리지만 agent 안에 CriOS 있으면 크롬
			if (/CriOS|Android/.test(ua)) {
				result = 'chrome';
			} else {
				result = 'safari';
			}
		} else if (/Chrome/.test(ua)) {
			result = 'chrome';
		} else if (/CriOS/.test(ua)) {
			result = 'crios';
		} else if (/GSA/.test(ua)) {
			result = 'gsa';
		}

		return result;
	}

	/**
	 * 리아아트(명절, 크리스마스 등에 사용할 메인화면 디자인) 확인 및 노출/가림 처리
	 */
	function checkRiaArt() {

		var riaArtInfoResult = null;

		/*if ( sfd.env.server != 'local' ) {
			return;
		}*/

		if ( sfd.data.getValue('eventType') && sfd.module.eventManager.isEventPossible() ) {
			return;
		}

		if ( 
			sfd.env.deviceType != 'MO' && 
			sfd.listValue.riaArtInfo && 
			sfd.listValue.riaArtInfo.length > 0 ) {
			// 운영 기간인가?
			var sysInt = parseInt(sfd.data.dataObject.sysdate + '' + sfd.data.dataObject.systime.substr(0, 4));

			$.each( sfd.listValue.riaArtInfo, function(i, item) {
            	// sfd.log('tmplog_riaArtInfo sysInt',riaArtInfoResult,item ,item.startDate <= sysInt , item.endDate >= sysInt	);
				if ( item.startDate <= sysInt && item.endDate >= sysInt ) {
					riaArtInfoResult = item;
					return false;
				}
			});
		}

		if ( riaArtInfoResult && 
			 riaArtInfoResult.products.includes( sfd.data.dataObject.divisionName ) && 
			 riaArtInfoResult.server.includes( sfd.env.server ) &&
			 !riaArtInfoResult.ignoreType.includes( sfd.data.dataObject.dlpoType )
		) {
			// 보여짐 
			showRiaArt();

			// 가려지는 시점 
			$('#wrapper').on('sf.change-page-start', function() {
				// sfd.listValue.checkRiaArtState : null(초기값) show(보여짐) hide(가려짐)
				// 한번 보여졌다 사라졌으면 다시 안나타남 
				if ( sfd.listValue.checkRiaArtState == 'hide' ) {
					return; 
				}
	            var riaArtTarget = true;
	            
	            // 0번 스텝이고 리아아트가 안보여진 시점이면 
	            if ( riaArtTarget && sfd.listValue.checkRiaArtState == 'show' ) {
	            	hideRiaArt()
	            }
	        });
		}

		function showRiaArt() {
			sfd.listValue.checkRiaArtState = 'show';
			$('<div id="ria-art"></div>').appendTo('#wrapper');
        	$('#shell').css('z-index', 2);
        	$('#ria-art').css({
        		// 'opacity': 0,
        		// 'display': 'none',
        		'background': 'url(' + riaArtInfoResult.url + ') no-repeat center top',
        		'width': '1180px',
        		'height': '960px',
        		'position': 'absolute',
        		'z-index': 1/*,
        		'margin-left': '-180px'*/
        	});
        	// transition: background 300ms ease-in 200ms;
			$('#Front #dlpo').css('opacity', '0');
			$('#FrontCorp #dlpo').css('opacity', '0');
			// $('#wrapper').css('background-color', 'transparent');
		}

		function hideRiaArt() {
			$('#ria-art').fadeOut( 600 );
        	$('#Front #dlpo').css('opacity', '1');
        	$('#FrontCorp #dlpo').css('opacity', '1');
			// $('#wrapper').css('background-color', '#fff');
			sfd.listValue.checkRiaArtState = 'hide';
		}
	}
});
