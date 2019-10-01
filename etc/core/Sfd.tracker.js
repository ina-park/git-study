/**
 * 스플렁크 로그
 * @class sfd.tracker
 * @see
 * 기본 로그
 *
 * 1. 마우스 클릭의 모든 타겟은 버튼로그 호출 (공통)
 * 2. 특정 버튼에 별도의 로그코드 또는 디스크립션이 필요한 경우 (개별-필요한경우만)
 *   attribute 에 log-id="코드" 와 log-title="설명"
 * 3. 로그 비대상 버튼인 경우 (개별-필요한경우만)
 *   attribute 에  log-ignore="true"
 * 4. etc로그가 필요한 경우 (개별-필요한경우만)
 * ```js
 * sfd.tracker.eventLog({
 *     logType : 'etcLog',
 *     code : '로그코드',
 *     description : '로그설명'
 * })
 * ```
 * 5. 보내는 스플렁크 객체 확인 (공통)
 *   콘솔에서 splunk필터 걸어서 확인
 * 6. 나머지 스플렁크 코드 포인트 (공통)
 *     - 패널이 바뀔때
 *     - 팝업이 뜰때
 *     - alet이 뜰때
 *     - 디버그에러
 *     - 서버에러
 *     - 트랜호출
 *     - 트랜응답
 *     - 이벤트팩토리
 */
define(function() {
	'use strict';

	var sfd;
	var $wrapper;
	var divisionName;
	var subDivisionName;
	var productCode;
	var userAgent;
	var serverCallTime;
	var ssid;
	var sbid;
	var clientID;
	var usageTime = 0; /// 사용자의 리아 사용시간
	var usageAllEvent = 0;
	var usageButtonEvent = 0;
	// var ajaxFailCount = 0;

	var self = {
		// version info
		version: {
			modified: '{version-modified}',
			deploy: '{version-deploy}',
			hash: '{version-hash}'
		},
		productKoName: '', /// 한글 상품명
		logCount: { normal: 0, changePanel: 0, survey: 0, smartAnswer: 0}, /// 로그 카운트
		isSplunk: null, /// 스플렁크 사용 여부
		requestTimeout: 100, /// 로그 통신 요청 타임아웃
		history: [],
		initialization: function(d) {
			sfd = d;
			divisionName = sfd.data.dataObject.divisionName;
			subDivisionName = sfd.data.dataObject.subDivisionName;
			userAgent = navigator.userAgent;
			productCode = sfd.data.dataObject.productCode;
			ssid = sfdCookie.get('ssid');
			sbid = sfdCookie.get('sbid');
			clientID = sfd.server.getGUID();
			$wrapper = $('#wrapper');

			startUsageTimer();			
			registerErrorHandler(sfd);

			if (document.documentElement.addEventListener) {
				document.documentElement.addEventListener('click', documentClickHandler, true);
			} else {
				document.documentElement.attachEvent('onclick', documentClickHandler);
			}

			// 페이지 변경 핸들러
			$wrapper.on('sf.change-page-complete', function() {
				// 페이지 로드 후 로그 추가
				sfd.tracker.eventLog({
					logType: 'changePanel'
				});
			});
		},
		/**
		 * 기록해야할 로그인지 확인
		 */
		isValidLog: function(log) {
			if (!log) {
				return false;
			}

			if (log.logType == 'serverError') {
				// 서버 에러 확인
				if (log.server_error_code == 'BVD0030006') {
					if (log.server_comm_info.startsWith('VD.ADDA0545'/*createMainConnect*/) || log.server_comm_info.startsWith('VD.MPDG0200'/*sendDeviceInfo*/)) {
						return false;
					}
				}
			}

			return true;
		},
		/**
		 * 이벤트 로그 기록 (스플렁크)
		 * @param {Object} log 기록할 로그 정보 담은 object
		 * log 구성
		 * Key | Type | 설명
		 * ---|---|---
		 * logType | String | 로그 종류. 아래 logType 참고
		 * code | String | logType 별로 다름
		 * description | String | logType 별로 다름
		 * event_cls | String | eventFactory logType에서만 사용
		 * server_comm_info | String | 서버 인터페이스 호출 정보 (TranID_callname)<br>serverCall, serverCallback, serverError logType에서만 사용됨.
		 * server_error_code | String | 서버 에러 코드. serverError logType에서만 사용됨.
		 * server_error_msg | String | 서버 에러 메시지. serverError logType에서만 사용됨.
		 * 
		 * logType
		 * - button: 사용자 클릭
		 *     - code: 클릭한 요소의 class, id 정보
		 *     - description: 클릭한 요소의 텍스트 정보
		 * - changePanel: 페이지 전환
		 * - renw_cls_cd: 자동차 진행계약 신/당/타 구분값
		 * - popup: 팝업 열림
		 *     - code: 팝업 module name
		 *     - description: 팝업 제목 (최대40자)
		 * - alert: Alert
		 *     - code: Alert 메시지 (최대40자)
		 *     - description: Alert module name
		 * - debguError: Script 오류
		 *     - code: 기본 메시지
		 *     - description: 추가 상세 정보
		 * - serverError
		 *     - server_comm_info: TranID_callname
		 *     - server_error_code: 에러 코드
		 *     - server_error_msg: 에러 메시지
		 * - serverCall
		 *     - server_comm_info: TranID_callname
		 * - serverCallback
		 *     - server_comm_info: TranID_callname
		 * - changePanelWas
		 * - eventFactory
		 * - etcLog: 기타 기록 필요한 것들 자유롭게 code, description 사용
		 */
		eventLog: function(log) {
			
			var type = (log && log.logType) || 'normal';
			var p = {};
			try {
				sfd.warnLog('splunklog eventLog', type, log);
				if (self.isValidLog(log) == false) {
					// 로그 기록하지 말아야할 것은 패스
					return;
				}

				var prodName = getProductKoName();
				var panelCode = makePanelCode();
				var panelName = sfd.view.getPageName();
				var data = sfd.data.dataObject;

				if (!panelCode) {
					panelCode = panelName ? '-' : '시스템로드중';
				}

				usageAllEvent++;
				if ( type == 'button' ) {
					usageButtonEvent++;
				}

				// 기본구성
				var time = new Date();
				var timestamp = timestampText(time); // 2019-01-21 13:00:00 // .123
				var resolution = sfd.env.stageWidth + 'x' + sfd.env.stageHeight;
				var plcyNo = (['Finish', 'RecommendProduct', 'RelayFinish', 'BlocFinish'].includes(panelName)) ? sfd.data.getValue('policyNo') : '';
				var deviceCls = '';
				if (sfd.env.deviceType == 'PC') {
					deviceCls = '01';
				} else if (sfd.env.deviceType == 'MO') {
					deviceCls = sfd.env.isApp ? '03' : '02';
				}

				if (['changePanel', 'survey', 'smartAnswer'].includes(type)) {
					p.v_sq            = self.logCount[type]++;
				} else {
					p.v_sq            = self.logCount.normal++;
				}

				p.timestamp           = timestamp.substr(0, 19);                // 1 발생시각 timestamp 2014-12-29 13:00:00
				p.device_cls          = deviceCls;                              // 2 유입매체구분 device_cls  01 (01: PC RIA, 02 : 모바일 웹, 03: 모바일 앱, 04: PC 웹)
				p.ssid                = ssid;                                   // 3 세션 ID session_id Xv57JY2NQx372RzS1pDzRQm8mjfgMvzg9KjjgZkgGRD63GWKpTTJ!-475195187!871651502
				p.sbid                = sbid;                                   // 4 브라우저 ID browser_id
				p.flash_id            = clientID;
				p.client_id           = clientID;
				p.mobile_app_id       = '';                                     // 5 모바일app_id mobile_app_id 모바일앱인 경우에만                               //            6 Flash ID flash_id
				p.planner_id          = data.designID;      	                // 8 고객 번호 planner_id
				p.contractor_id       = data.contractorID;      	                // 8 고객 번호 planner_id
				p.piboja_id           = data.pibojaID;      	                // 8 고객 번호 planner_id
				p.inflow_code         = data.eventType;                         // 9 타입 inflow_code AX_J_002
				p.parameter           = data.eventOTK;                          //          10 파라미터 parameter A1234OB0001
				// p.parameter2          = sfd.data.getValue('eventParameter2'); //          11 New 파라미터 parameter2 A1234OB0001
				p.panel_code          = panelCode;                              //            12 패널 코드 panel_code P1
				p.panel_name          = escapeText(panelName);      //            13 패널 명 panel_name 1. 고객정보
				p.button_code         = '';                                      //            14 버튼 코드 button_code 0102_99
				p.popup_code          = '';                                      //            16 팝업 코드 popup_code 0201_popuprenewalMethod2
				p.popup_name          = '';                                      //            17 팝업 명 popup_name
				p.alert_code          = '';                                      //               Alert Module
				p.alert_msg           = '';                                      //            19 Alert 메시지
				p.contract_no         = data.contractNo;            //            18 설계번호 contract_no D1400000000000
				p.plcy_no             = plcyNo;                                //            19 증권번호 plcy_no
				// p.car_no              = makeCarNo();                             //            20 차량번호 car_no자동차보종인 경우만
				p.response_time       = '';                                      //            21응답시간 response_time 3.16
				p.step_code           = '';                                      //            22 was기준 단계 step_code 보험료계산, (정합성, 심사), 결제
				p.type_code           = '01';                                    //            23 처리결과 type_code 01 (01:성공, 02:실패)
				p.client_error_msg    = '';                                      //            24 처리결과 에러 정보  client_error_msg 화면 디버그 에러 정보  02일때만
				p.server_comm_info    = '';                                      //            25 서버통신 정보 server_comm_info frmCalcDateInfo_P1 R1 (모바일은 url 직접) 02일때만
				p.server_error_code   = '';                                      //            26 서버 응답 에러 코드 server_error_code BVD0030006 02일때만
				p.server_error_msg    = '';                                      //            27 서버 응답 에러 코드 server_error_msg 서버에러 02일때만
				// p.event_cd            = splunkEventCode;       //         이벤트 코드
				p.event_cls           = '';                                      //            이벤트 참여완료 여부
				p.user_agent          = userAgent;                                //          28 브라우저/OS/단말기 user_agent
				// p.flash_version       = flash_version;                           //            29 FlashPlayer 버전 flash_version 10,1,102,64
				// p.language            = language;                                //            30 Os언어 language
				p.resolution          = resolution;                              //            31 해상도 resolution 1600x900
				p.prod_code           = getProductSplunkID();                              //          32 상품코드 20071
				p.prod_name           = prodName;                              //            33 상품이름 개인승용
				p.logType             = type;
				p.site_cls            = '01';                                    // 01 직판/ 02 대표
				p.etc_log             = getUsageInfoStr();                       // 정의되진 않았으나 남겨두어야 할 것들 (자체 기준으로 정리)
				// survey
				p.satisfaction        = '';                                       // 만족도
				p.dissatisfaction     = '';                                       // 불만족 사유
				p.contractreason      = '';                                       // 보험가입 이유
				p.subject             = '';                                       // 목록
				p.owner               = '';                                       // 이름
				p.renw_cls_cd         = sfd.data.getValue('renw_cls_cd');

				switch (type) {
					case 'changePanel':
						p.panel_code         = panelCode;        //			12 패널 코드 panel_code P1
						p.panel_name         = escapeText(panelName);        //			13 패널 명 panel_name 1. 고객정보
						break;
					case 'renw_cls_cd':
						p.renw_cls_cd        = log.renw_cls_cd;
						break;
					case 'popup':
						p.popup_code         = productCode +  '_' + log.code;
						p.popup_name         = escapeText(log.description);
						break;
					case 'alert':
						p.alert_code         = escapeText(productCode +  '_' + log.description);
						p.alert_msg          = escapeText(log.code);
						break;
					case 'debugError':
						p.type_code          = '02';
						p.client_error_msg   = escapeText(log.description.replace(/(bust|_)=[0-9]+&?/gi, ''));
						break;
					case 'serverError':
						p.type_code          = '02';        //			23 처리결과 type_code 01 (01:성공, 02:실패)
						p.server_comm_info   = log.server_comm_info;        //			  25 서버통신 정보 server_comm_info frmCalcDateInfo_P1 R1 (모바일은 url 직접) 02일때만
						p.server_error_code  = log.server_error_code;        //			26 서버 응답 에러 코드 server_error_code BVD0030006 02일때만
						p.server_error_msg   = escapeText(log.server_error_msg);        //			27 서버 응답 에러 코드 server_error_msg 서버에러 02일때만
						p.response_time      = '';                                      //			21응답시간 response_time 3.16
						break;
					case 'serverCall':
						p.server_comm_info   = log.server_comm_info;
						serverCallTime       = time.getTime();
						break;
					case 'serverCallback':
						p.server_comm_info   = log.server_comm_info;        //			  25 서버통신 정보 server_comm_info frmCalcDateInfo_P1 R1 (모바일은 url 직접) 02일때만
						p.response_time      = millisToSeconds(time.getTime() - serverCallTime);
						break;
					case 'changePanelWas':
						p.step_code          = panelCode;
						break;
					case 'eventFactory':
						p.event_cls          = log.event_cls;
						break;
					case 'etcLog':
						p.etc_log            = productCode +  '_' + log.code;
						p.button_name        = escapeText(log.description);
						break;
					case 'survey':
						/*sfd.tracker.eventLog({
							"logType" : "survey",
							"satisfaction" : "만족도",
							"dissatisfaction" : "불만족 사유",
							"contract_reason" : "보험가입 이유",
							"subject" : "내용",
							"owner" : "이름"
						})*/
						if (log.survey_type) {
							p.survey_type = log.survey_type;
						}
						p.satisfaction        = log.satisfaction;                                       // 만족도	　
						p.dissatisfaction     = log.dissatisfaction;                                       // 불만족 사유	　
						p.contract_reason     = log.contract_reason;                                       // 보험가입 이유	　
						p.subject             = log.subject;                                       // 목록	　
						p.owner               = sfd.data.getValue('contractorName');       
						break;
					case 'smartAnswer':
						/**
						 * internet_ml 처리
						 *  
						 * ssid:기존값
						 * sbid:기존값
						 * planner_id:기존값
						 * prod_name:기존값
						 * prod_code:기존값
						 * panel_name:기존값
						 * panel_code:기존값
						 * device_cls:기존값
						 * data:고객질문
						 * prediction:python 리턴값(0101,1313)
						 * correct:상담신청을 하면 1, 아니면 null
						 * gubun:smartanswer
						 * sq:상담시퀀스
						 * 
						 */
						p.data               = log.questionText;// 고객 질문 
						p.prediction         = (log.prediction) ? String(log.prediction) : '';// 응답 코드 배열 
						p.correct            = (log.isCounselSubmit) ? '1' : '';// 상담신청 여부 (1:신청, null:미신청)
						p.gubun              = 'smartanswer';
						p.company_id         = '';// 안창현 책임님 빈값 추가 요청 
						p.sq                 = log.sequenceCount; // 상담시퀀스 
						break;
					default:
						// button
						p.button_code        = productCode +  '_' + log.code;
						p.button_name        = escapeText(log.description);
						p.etc_log            = log.pointInfo + panelCode + getUsageInfoStr();
						break;
				}

				// splunk를 운영 안하는 상품 필터링
				if ( ['airport'].includes(divisionName) ) {
					self.isSplunk = false;
				}

			} catch (e) {
				sfd.errorLog('eventLog exception', e);
			}

			self.submitLog(type, p);
		},
		/**
		 * 로그 서버로 전송
		 * @private
		 * @param {String} type 로그 종류
		 * @param {Object} param 서버 전송 데이터
		 */
		submitLog: function(type, param) {
			try {
				var host = 'https://direct.samsungfire.com:7443';
				var loggerPath = '';
				switch (type) {
					case 'changePanel': // 패널이동로그
						loggerPath = '/ria_panel.jsp';
						break;
					case 'survey': // 헬프 및 설문조사 로그
						loggerPath = '/ria_exper.jsp';
						break;
					case 'smartAnswer': // 헬프 및 설문조사 로그
						loggerPath = '/internet_ml.jsp';
						break;
					default: // 일반 로그
						loggerPath = '/ria_client.jsp';
						break;
				}
	
				// 스플렁크 강제 비대상 처리
				if (self.isSplunk === false) {
					return;
				}
	
				sfd.log('check splunklog submit', type, param);
				if (sfd.env.isDebug && sfd.env.debugLevel < 2) {
					self.history.push( param );
				}
					
				// 운영계만 적용
				if (sfd.env.server != 'www') {
					return;
				}
	
				// 로그 연속 실패가 10회가 넘어가면
				// if (ajaxFailCount > 10) {
				// 	return;
				// }
	
				// 로그 호출
				var splunkXhr = $.ajax({
					type: 'POST',
					url: host + loggerPath,
					data: param,
					dataType: 'text',
					cache: false,
  					timeout: this.requestTimeout
				}).done(function (responseText) {
					// ajaxFailCount = 0; // 초기화
				}).fail(function (XHR, textStatus, errorThrown) {
					// ajaxFailCount++; // 에러 카운팅
				});
				
				setTimeout(function() {
					splunkXhr.abort();
				}, this.requestTimeout);

			} catch (e) {
				sfd.errorLog('submitLog exception', e);
			}
		},
		end: ''
	}; // self

	function startUsageTimer() {
		setInterval(function() {
			usageTime++;
		}, 1000);
	}

	function documentClickHandler(event) {
		var $target = $(event.target);
		// <a>, <button> 안에 요소 클릭한 경우 a, button 을 target으로
		var $button = $target.closest('a');
		if ($button.length > 0) {
			$target = $button;
		} else if (($button = $target.closest('button')) && $button.length > 0) {
			$target = $button;
		} else if (($button = $target.closest('[role="button"]')) && $button.length > 0) {
			$target = $button;
		}

		if ($target.hasClass('btn-adropdown') && event.pageX <= 0 && event.pageY <= 0) {
			// Dropdown 항목 클릭했을 때 닫기 위해 click 이벤트 발생시키는거는 패스
			return;
		}

		if ( $target.attr('log-ignore') == 'true' ) {
			return;
		}
		var logID = getLogID();
		var logDesc = getLogDesc();
		var parentStr = getParentStr();
		var shellOffset = $wrapper.offset();
		var x = event.clientX - shellOffset.left;
		var y = event.clientY - shellOffset.top;

		// 로그생성
		if ( logID ) {
			self.eventLog({
				logType: 'button',
				code: parentStr + '_' + logID,
				description: logDesc,
				pointInfo: '(' + x + ',' + y + ')'
				// description: '(' + x + ',' + y + ')' + logDesc
			});
		}

		// parent id
		function getParentStr() {
			var r = 'wrapper';
			if ( $target.closest('.mobile-full').length > 0 ) {
				r = $target.closest('.mobile-full').attr('id');
			} else if ( $target.closest('.modal-popup').length > 0 ) {
				r = $target.closest('.modal-popup').attr('id');
			}  else if ( $target.closest('.modal-alert').length > 0 ) {
				r = $target.closest('.modal-alert').attr('id');
			} else if ( $target.closest('.page-content').length > 0 ) {
				r = $target.closest('.page-content').attr('id');
			}
			return r;
		}

		// id
		function getLogID() {
			var r = '';
			if ( $target.attr('log-id') ) {
				r = $target.attr('log-id');
			} else if ( $target.attr('id') ) {
				r = $target.attr('id');
			}  else if ( $target.attr('class') ) {
				r = $target.attr('class');
			} else if ( $target.attr('aria-controls') ) {
				r = $target.attr('aria-controls');
			}
			r = $target.prop('tagName') + '_' + r.replace(/\s/g, '_')
			return r;
		}

		// 설명
		function getLogDesc() {
			var r = '';
			if ( $target.attr('log-title') ) {
				r = $target.attr('log-title');
			} else {
				r = escapeText($target.text() || '');
				if (!r) {
					// title 속성 확인
					r = $target.attr('title');
					
					if (!r && $target.is('input') && $target.attr('id')) {
						// input 이면 label 찾아보기
						r = $('label[for="' + $target.attr('id') + '"]').text();
					}
				}
				if (r) {
					r = r.substr(0, 10);
				}
			}
			return r;
		}
	}

	/**
	 * 스플렁크 로그 값이 사용하기 위해 사용 불가 문자 치환 또는 제거 처리
	 * @param {String} text 변환할 문자열
	 * @return {String} 제거/치환되어야 할 문자 처리된 문자열
	 * @see
	 * 콤마(,), =, \n(줄바꿈), \r, \t(탭) 문자 사용 금지
	 * 값 제일 앞에 괄호"(" 또는 중괄호"[" 문자 오면 안됨
	 */
	function escapeText(text) {
		if (!text) {
			return text;
		}
		text = text.replace(/=|,/g, ':'); // =, 콤마(,) => :
		text = text.replace(/\n|\r|\t/g, ' '); // 줄바꿈,탭 => 빈칸
		text = text.replace(/ {2,}/g, ' '); // 두개이상 빈칸 => 한칸
		if (text.startsWith('(') || text.startsWith('[')) {
			text = text.substr(1);
		}
		return text.trim();
	}

	function timestampText(time) {
		var d = String(time.getFullYear()) + '-' + sfd.utils.padLeft(time.getMonth() + 1) + '-' + sfd.utils.padLeft(time.getDate());
		var t = sfd.utils.padLeft(time.getHours()) + ':' + sfd.utils.padLeft(time.getMinutes()) + ':' + sfd.utils.padLeft(time.getSeconds()) + '.' + sfd.utils.padLeft(String(time.getMilliseconds()), 3);
		return d + ' ' + t;
	}

	// 사용자의 진행 경과정보 저장
	function getUsageInfoStr() {
		return '_ut' + usageTime + '_ua' + usageAllEvent + '_ub' + usageButtonEvent;
	}

	/**
	 * 현재 진행 중인 상품의 한글 이름
	 * @return {String} 한글 상품이름 ex) 개인업무용, 개인승용, 배서, 할까말까, ...
	 */
	function getProductKoName() {
		var divisionName = sfd.data.dataObject.divisionName;
		var _subDivisionName = sfd.data.dataObject.subDivisionName;
		var _productCode = sfd.data.dataObject.productCode;
		var _r = '';
		if (String(_r) == 'null') {
			_r = '';
		}
		switch (divisionName) {
			case 'car':
				if (_productCode == 'M20073000') { //  
					_r = '법인업무용';
				} else if (_productCode == 'M200732000') { //  
					_r = '개인업무용';
				} else { //  
					_r = '개인승용';
				}
				break;
			case 'bloc':
				if (_subDivisionName == 'corp') { // 법인 
					_r = '일괄법인용';
				} else { // 개인
					_r = '일괄개인용';
				}
				break;				
			case 'endo':
				_r = '배서';
				break;
			case 'bike':
				_r = '개인이륜차';
				break;				
			case 'claim':
				_r = '할까말까';
				break;	
			case 'travel':
				if ( ['indi', 'family'].includes( _subDivisionName ) ) { //  
					_r = '해외여행';//해외여행
				} else { //  
					_r = '글로벌케어';//글로벌케어
				}
				break;				
			case 'golf':
				_r = 'VIP골프';
				break;				
			case 'goldColor':
				_r = '단기운전자';
				break;				
			case 'travelDomestic':
				_r = '국내여행';
				break;				
			case 'driver':
				if ( _subDivisionName == 'tiny') {
					_r = '장기운전자(연계판매)';
				} else if ( _subDivisionName == 'easy') {
					_r = '장기운전자(간편계산)';
				} else {
					_r = '장기운전자';
				}
				break;				
			case 'home':
				_r = '주택화재';
				break;				
			case 'savings':
				_r = '저축';
				break;				
			case 'annuity':
				_r = '연금(유배당)';
				break;				
			case 'annuityFD':
				_r = '연금(무배당)';
				break;				
			case 'child':
				if (sfd.data.getValue('targetCls') == 'A') { //  
					_r = '자녀(어린이)';
				} else { //  
					_r = '자녀(태아)';
				}
				break;				
			case 'expense':
			case 'realLoss':
				_r = '실손의료비';
				break;				
			case 'cancer':
				_r = '암';
				break;				
			case 'injury':
				_r = '상해';
				break;				
			case 'mother':
				_r = '임산부';
				break;				
			case 'health':
				_r = '건강';
				break;				
			case 'dental':
				_r = '치아';
				break;				
			case 'smartM':
				_r = '스마트M';
				break;
			case 'oneday':
				_r = '원데이';
				break;
		}
		return _r;
	}

	// 상품아이디
	function getProductSplunkID() {
		var divisionName = sfd.data.dataObject.divisionName;
		var productCode = sfd.data.dataObject.productCode;
		var r;

		switch (divisionName) {
			case 'goldColor':
				r = 'G201';
				break;
			case 'expense':
				r = 'L504';
				break;
			case 'injury':
				r = 'L506';
				break;
			case 'mother':
				r = 'L508';
				break;
			default:
				r = sfd.core.getUniqueCode('screen', divisionName, subDivisionName);
		}

		// 없는 애들은 그냥 상품코드 리턴
		if (!r) {
			r = productCode;
			if (!r || r == 'null') {
				r = '';
			}
		}
		return r;
	}

	function millisToSeconds(inMil) {
		return inMil / 1000;
	}


	/**
	 * 패널명을 '개인승용_02_01'과 같이 변환
	 * @private
	 * @return {String} 패널 코드
	 */
	function makePanelCode() {
		if (!self.productKoName) {
			self.productKoName = getProductKoName();
		}
		var r = null;

		var pageMetadata = sfd.view.getPageMetadata();
		if (pageMetadata) {
			var step = sfd.utils.padLeft(pageMetadata.step) + '_' + sfd.utils.padLeft(pageMetadata.substep);
			r = self.productKoName + '_' + step;
		}

		return r;
	}

	/**
	 * window.onerror 이벤트 세팅
	 * @private
	 * @param {Object} sfd sfd object
	 */
	function registerErrorHandler(sfd) {

		window.onerror = function(message, url, lineNumber, column, errorObj) {
			setTimeout(function() {
				try {
					// 아래 단어를 포함하는 에러 발생시에 패스 시킨다.
					var exceptionErr = ['checkDomStatus', 'setuserNo is not defined', 'isApplication is not defined', 'cafe is not defined', 'PAPP_MENU_TYPE', 'accessing a cross-origin frame'];
					for (var i = 0; i < exceptionErr.length; i++) {
						if (message.indexOf(exceptionErr[i]) > -1) {
							if (sfd.env.isDebug) {
								sfd.log('exceptionErr', message);
							}
							return;
						}
					}
					if (message == 'Script error.') {
						return; // 이 에러는 로그로는 추적 불가능한 외부 스크립트 오류라서 제외시킴
					}

					var stack = (errorObj && errorObj.stack) || '';
					var info = 'msg:' + message + '#url:' + url + '#row:' + lineNumber + '#col:' + column + '#stack:' + stack;
					// 보안모듈 PC에러로 추정되는 부분 제거해봄 
					if ( String(lineNumber) == '11' && String(column) == '2877' ) {
						self.eventLog({
						      logType: 'etcLog',
						      code: '보안모듈디버그에러-별도확인',
						      description: info
						 });
						return;
					}
					// Mobile 토스앱에서만 발생하는 오류 제거
					if (lineNumber == 1 && (column > 6480 && column < 6490) && message.includes('style')) {
						self.eventLog({
							logType: 'etcLog',
							code: 'Toss앱오류-별도확인',
							description: info
						});
						return;
					}
					
					self.eventLog({
						logType: 'debugError',
						code: message,
						description: info
					});
				} catch (e) {
					if (sfd.env.isDebug) {
						sfd.log(e);
					}
				}
			}, 10);
		};
	}

	return self;
});