/**
 * 서버 통신 처리
 * @class sfd.server
 */
define(function() {
	'use strict';
	var sfd;
	var guid = null;
	var isNppInit = false;
	var activexInstallCnt = 0;
	var tranHistoryTypeString = 'nnn'; /// 단말정보 수집용 트랜타입 히스토리 n:normal c:cert m:multi 
	var self = {
		// version info
		version: {
			modified: '{version-modified}',
			deploy: '{version-deploy}',
			hash: '{version-hash}'
		},
		/**
		 * 외부모듈(AnySign, NOS) 관리
		 * @category 외부모듈
		 * @see
		 * 권인칠 책임님, 안규상 대리님 가이드 
		 */
		externalSolution: {
			/**
			 * AnySign, NOS 설치확인/초기화
			 */
			init: function() {
				
				var _isAnySign = (sfd.env.deviceType == 'PC');
				if (sfd.env.deviceType == 'MO') {
					_isAnySign = (sfd.env.debug && sfd.env.debug.useCertPC == true); // Mobile 상품 PC에서 테스트 하는 경우는 true
				}

				if ( _isAnySign) {

					// <STRIP_WHEN_RELEASE
					if (sfd.env.server != 'local') {
					// STRIP_WHEN_RELEASE>	

						// AnySign.mAnySignShowImg.showImg = false;

						try {
							window.PrintObjectTag(true);
							setTimeout(function () {
								window.AnySign4PC_installCheck(function(result) {
									sfd.log3('AnySign4PC설치여부체크:', result);
									sfd.data.dataObject.axmodule_anysign = (result == 'ANYSIGN4PC_NORMAL') ? true : false;
									self.externalSolution.activexInstallCnt();
								});
							}, 300);
						} catch (e) {
							sfd.errorLog('AnySign4PC 설치여부 확인 예외발생');
						}
					// <STRIP_WHEN_RELEASE
					}
					// STRIP_WHEN_RELEASE>
				}
				
				window.npPfsExtension = new function() {
					/* 키보드보안 입력 제한 */
					this.keyValidation = function(element, keyCode) {
						var dataType = element.getAttribute('data-type');
						var key = parseInt('' + keyCode);
						if (dataType == 'n' || dataType == 'N') {
							if (key < 48 || key > 57) {
								return false;
							}
						}
						return true;
					}

					// $element : 입력양식, 
					// isInput : (true : 데이터 포맷 지정 , false : 데이터 포맷 삭제)
					this.formatter = function($element, isInput) {
						var str = $element.val();
						var type = $element.attr('nppfs-formatter-type');
						switch (type) {
							case 'card': // 1234-5632-****-**** sample format
								if (isInput) {
									str = str.replace(/-/g, '');

									if (str.length >= 9) {
										var length = str.length;
										str = str.substr(0, 8).padRight(length, '*');	
									}
									if (str.length <= 8) {
										return str.replace(/-/g, '').replace(/([\d*]{4})([\d*]{1,4})/g, '$1-$2');
									} else if (str.length <= 12) {
										return str.replace(/-/g, '').replace(/([\d*]{4})([\d*]{4})([\d*]{1,4})/g, '$1-$2-$3');
									} else if (str.length > 12) {
										return str.replace(/-/g, '').replace(/([\d*]{4})([\d*]{4})([\d*]{4})([\d*]{1,4})/g, '$1-$2-$3-$4');
									}
								} else {
									return str.replace(/[^\d*]+/g, '').substr(0, 19);
								}
								break;
						}
						return str;
					}
				   
				};
			},
			/**
			 * NOS 초기화 (보안키패드, 단말정보수집)
			 */
			uiInit: function() {
			
				if (isNppInit) {
					return;
				}

				// HTML에 단말정보수집용 정보 form 없으면 추가
				if (!document.getElementById('nos-device-info-form')) {
					$('body').append('<form id="nos-device-info-form"></form>');
				}
			
				setTimeout(function() {
					// <STRIP_WHEN_RELEASE
					if ( sfd.env.server == 'local') {
						return; // 로컬에서는 아무것도 안함
					}
					// STRIP_WHEN_RELEASE>
	
					try {
						window.npPfsCtrl.isInstall({
							success: function() {
								var isE2EKeyboardUse = true;
								// 가상환경 확인
								window.npPfsCtrl.isVirtualMachine( function(result) {
									if ( result === true ) {										
										isE2EKeyboardUse = false; // 가상환경에서는 키보드보안 사용안함
									}
								});
								// Mac인 경우 키보드보안 작동 여부 
								if ( sfd.env.os.group == 'Mac OS') {
									isE2EKeyboardUse = false;
								}
								sfd.log('NOS 가상환경체크 후 초기화 인자2번째값 : ', isE2EKeyboardUse);

								// 키보드보안, 보안키패드, 단말정보수집 기능 사용
								window.npPfsStartupV2(document.getElementById('nos-device-info-form'), [false, isE2EKeyboardUse, false, true, false, true]);

								// $('#btn-mlogo').html('NOS 설치됨');
								sfd.data.dataObject.axmodule_nos = true;
								//options.Loading.Default = false;
								//npPfsCtrl.init(options);
								// npPfsCtrl.isStartup = true;
								self.externalSolution.activexInstallCnt();
							},
							fail: function() {
								// alert('npPfsStartupV2 fail1');
								// 보안키패드, 단말정보수집 기능 사용
								window.npPfsStartupV2(document.getElementById('nos-device-info-form'), [false, false, false, true, false, true]);
								// $('#btn-mlogo').html('NOS 설치안됨');
								sfd.data.dataObject.axmodule_nos = false;
								self.externalSolution.activexInstallCnt();
								if (window.AnySign) {
									AnySign.mIncaNOSv10Enable = false;									
								}	
							}
						});
					} catch (e) {
						sfd.errorLog('npPfs 초기화 중 예외발생');
					}
					
				}, 500)
				isNppInit = true;
			},
			/**
			 * 외부모듈 설치확인 및 초기화 카운팅
			 */
			activexInstallCnt: function() {
				$('#wrapper').trigger('sf.plugin-complete');
				var _deviceType = sfd.env.deviceType;
				activexInstallCnt++;
				if ( activexInstallCnt == 2 ) {
					if ( _deviceType == 'PC' ) {
						// var _message = '';
						
						/*if( sfd.env.parameters.os.group == 'Mac OS'){
							// Mac인경우  
							// anySign만 체크 
						} else {
							*/
						/*if ( !sfd.data.dataObject.axmodule_anysign &&
								!sfd.data.dataObject.axmodule_nos) {
								// 둘다 미설치  
								_message = '공인인증서, 키보드보안, 방화벽 이용을 원하는 경우, 보안프로그램을 설치해 주세요.(설치없이 휴대폰인증, 보안키패드로 진행이 가능합니다.)';
							} else if ( !sfd.data.dataObject.axmodule_anysign ) {
								// 공인인증만 미설치 
								_message = '공인인증서 이용을 원하는 경우, 보안프로그램을 설치해 주세요.(설치없이 휴대폰인증으로 진행이 가능합니다.)';
							} else if ( !sfd.data.dataObject.axmodule_nos ) {
								// 키보드보안만 미설치 
								_message = '키보드보안, 방화벽 이용을 원하는 경우, 보안프로그램을 설치해 주세요.(설치없이 보안키패드로 진행이 가능합니다.)';
							}
							if ( _message ) {
								sfd.core.showSmartHelp({
									message: _message,
									buttonTitle: '설치하기',
									buttonHandler: function() {
										$global.uiQuickPage('program');
									}
								});
							}*/
						// }

						
						
					}
				}
			}
		},

		/**
		 * GUID 조회 (현재 설정된 GUID가 없으면 새로 생성)
		 * @category GUID
		 * @return {String} GUID
		 */
		getGUID: function() {

			if ( sfd.env.deviceType == 'PC' ) {
				// PC 상품안에 상품인경우 부모에서 가져온 guid셋팅 
				if ( sfd.data.dataObject.divisionName == 'bloc' ) {
					return sfd.data.guid;
				} else if ( sfd.data.dataObject.divisionName == 'driver' && 
					sfd.data.dataObject.subDivisionName == 'tiny' ) {
					return sfd.data.guid;
				}
			}
			
			if ( !guid ) {
				guid = createGUID();
			}
			return guid; 
			
			function createGUID() {
				return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
					var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
					return v.toString(16);
				});
			}
		},

		/**
		 * 현재 GUID 리셋.
		 * @category GUID
		 */		
		resetGUID: function() {
			guid = null;
		},
		/**
		 * GUID 설정
		 * @category GUID
		 * @param {Sring} newGUID 새로 지정할 GUID
		 */
		setGUID: function(newGUID) {
			guid = newGUID;
		},

		/**
		 * 초기화
		 * @param {Object} d sfd 객체.
		 */
		initialization: function(d) {
			sfd = d;
			/*setTimeout(function(){
				self.signJSinitialization();    
			},3000)*/
			if ( window.AnySign ) {
				// 취소 콜백
				AnySign.cancelCallback = function() {
					// signJS.signInfo.callback({ 'sign_cancel': 'N' });
					// alert('TODO : AnySign.cancelCallback')
					sfd.core.hideLoading('tag_anysignCancel');
				}
				AnySign.mShowExpiredCert = true; /* 만료된인증서리스트 포함 */
			}

			if (sfd.debug.tranLog) {
				sfd.debug.tranLog.clear(); // tranviewer용 로그 삭제
			}
		},
		
		/**
		 * 서버 인터페이스(Tran) 정보 조회
		 * @category 서버통신(내부로직용)
		 * @param  {String} tranName Tran 이름
		 * @return {Object} 인터페이스 정보
		 * Key | Type | 설명
		 * ---|---|---
		 * url | String | URL
		 * tranId | String | Tran ID
		 * method | String | 통신방식. POST 또는 GET
		 * desc | String | Tran 설명
		 * type | String | Tran 종류. "normal": 일반, "cert": 인증용
		 */
		getModuleURL: function(tranName) {
			var a = sfd.data.interfaces[tranName];
			if (!a) {
				// <STRIP_WHEN_RELEASE
				if (sfd.data.getValue('divisionName') == 'TranTest') {
					a = {
						tranId: tranName,
						desc: ''
					}
				} else {
				// STRIP_WHEN_RELEASE>
					sfd.core.alert('인터페이스(트랜ID)정의 해주세요 ' + tranName + '<br/><br/>대부분(?)은 공통인터페이스에 정의해주세요.<br/><br/>공통인터페이스는 common/core/sfd.module.js에 <br/>개별인터페이스는 각상품data.js에 정의해 주세요.');
					return null;
				// <STRIP_WHEN_RELEASE
				}
				// STRIP_WHEN_RELEASE>
			}
			var _url = '';
			// <STRIP_WHEN_RELEASE
			if (sfd.env.server == 'local') {
				_url = '/api';
			} else {
			// STRIP_WHEN_RELEASE>
				_url = '//' + location.host + '/CR_MyAnycarWeb/' + ((a.path) ? a.path : 'data') + '/' + a.tranId + '.do';
			// <STRIP_WHEN_RELEASE
			}
			// STRIP_WHEN_RELEASE>
			return { 
				url: _url, 
				tranId: a.tranId, 
				method: (a.method) ? a.method : 'POST', 
				desc: a.desc,
				type: (a.type) ? a.type : 'normal'
			};
		},
		/**
		 * 서버 요청 로그
		 * @category 로그
		 * @param {String} tran Tran 정보
		 * @param {Object} data 요청 data
		 * @param {Object} option 통신 옵션	
		 * Key | Type | 기본값 | 설명
		 * ---|---|---|---
		 * isSimple | Boolean | false | sfd.core.runSimple() 여부
		 */
		_printCallLog: function(tran, data, option) {
			sfd.klog('▨▨▨▨▶ ajaxcall' + ((option && option.isSimple) ? '( ●Simple● )' : '') + ' : ' + tran, data);
			sfd.log3('▨▨▨▨▶ ajaxcall' + ((option && option.isSimple) ? '( ●Simple● )' : '') + ' : ' + tran, data);
			// sfd.log3('▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨');
			// sfd.klog(data);
			sfd.log3(data);
			// sfd.log('ajaxcall_str : ' , {'str':JSON.stringify(sfd.server.runInfo.param, null, 4)});
			sfd.klog(data, '▶ 리아 데이터 보냄 : ' + tran, 0, 3);

		},
		/**
		 * 서버 응답 로그
		 * @category 로그
		 * @param {String} tranName Tran 이름
		 * @param {Object} data 응답 data
		 * @param {Object} option 통신 옵션
		 * Key | Type | 기본값 | 설명
		 * ---|---|---|---
		 * isSimple | Boolean | false | sfd.core.runSimple() 여부
		 */
		_printBackLog: function(tranName, data, option) {
			sfd.klog('◀▨▨▨▨ ajaxcallback' + ((option && option.isSimple) ? '( ●Simple● )' : '') + ' : ' + tranName, data);
			sfd.log3('◀▨▨▨▨ ajaxcallback' + ((option && option.isSimple) ? '( ●Simple● )' : '') + ' : ' + tranName, data);
			// sfd.log3('▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨');
			sfd.log3(data);
			sfd.log3('========================================================');
			
			if ( tranName == 'frmXmlListNoEnc' || tranName == 'frmCalcTemplate' ) {
				// 엄청큰 날 데이터로 넘어오는 애들은 쿠존출력에서는 감싼다. 
				data = {
					'실제 데이터가 문자열': data
				}
			}
			sfd.klog(data, '◁ 서버 데이터 받음 : ' + tranName, 0, 3);
			// $.klog(data,'◁ 서버 데이터 받음 : '+frm,0,3);
		},
		/**
		 * 서버 통신 정보
		 * @category 서버통신 
		 * @property runInfo 
		 * @type {Object}
		 * @see
		 * Object 구성
		 * 항목|기본값|설명
		 * ---|---|---
		 * form|null|폼이름
		 * param|null|전송 데이터
		 * callback|null|콜백 함수
		 * callbackError|null|에러 발생시 콜백 함수
		 * errorPass|false|일괄처럼 에러 무시해야 하거나 callback에서 바로 처리할 경우 true로
		 * simpleRun|false|프로세스와 상관없는 병렬통신
		 * responseJSON|null|응답 JSON
		 * status|''|call(응답기다리는중), back(응답완료)
		 */
		runInfo: {
			'form': null,
			'param': null,
			'callback': null,
			'callbackError': null,
			'errorPass': false, // 일괄처럼 에러를 무시해야 하거나 callback에서 바로 처리할 경우 
			'simpleRun': false, // 프로세스와 상관없는 병렬통신
			'responseJSON': null,
			'status': '' // call(응답기다리는중) back(응답완료) 
		},
		/**
		 * 인터페이스 암호화 처리 여부 확인
		 * @category 암호화
		 * @param {String} inDivisionName Division Name
		 * @param {String} tranName Tran 이름
		 * @return 암호화 해야할 인터페이스면 true, 아니면 false
		 */
		isEncryption: function( inDivisionName, tranName ) {
			if ( inDivisionName == 'airport') {
				return false;
			}
			if ( sfd.data.interfacesSkipDecryption.indexOf(tranName) >= 0) {
				return false;
			}
			return true;
		},
		/**
		 * 서버 페이지 팝업으로 열기
		 * @category 서버통신 
		 * @param {String} tranName Tran 이름
		 * @param {Object} inParam 요청 인자
		 * @param {Function} [callbackFc] 콜백함수. 지정하면 기본 팝업 열지않고 콜백함수로 서버 응답 값만 전달함. `function(responseText) {}`
		 */
		runPage: function(tranName, inParam, callbackFc) {
			// <STRIP_WHEN_RELEASE
			if (typeof inParam == 'string') {
				sfd.core.alert('debugmessage0412 : 패널에서 simpleRun("' + inParam + '" ) 호출은 core.simpleRun을 이용해주세요.');
				return null;
			}
			// STRIP_WHEN_RELEASE>

			var _tagData = {};
			$.each(inParam, function(i, item) {
				if (i.substr(0, 2) == '__') {
					_tagData[i] = item;
					// <STRIP_WHEN_RELEASE
					if (sfd.env.server != 'local') {
					// STRIP_WHEN_RELEASE>
						delete inParam[i];
					// <STRIP_WHEN_RELEASE
					}
					// STRIP_WHEN_RELEASE>
					
				}
			});

			sfd.log2('get tagData', _tagData)

			var self = this;

			var module = sfd.server.getModuleURL(tranName);
			var data = inParam;
			var header = {tranId: module.tranId, pageId: ''};
			var body = JSON.stringify(data);

			var params = 'header=' + JSON.stringify(header) + '&body=' + body;
			if (module.method == 'GET') {
				params = inParam;
			}

			if (!module.tranId) {
				// <STRIP_WHEN_RELEASE				
				alert('tranId 정보 확인해주세요.(' + tranName + ')');
				// STRIP_WHEN_RELEASE>
				return;
			}

			// 파라메터 강제 null처리 
			if ( module.tranId == 'VD.Z0000019') {
				params = null;
			}
			
			if (sfd.env.server == 'local') {
				header.divisionName = sfd.data.dataObject.divisionName;
			}
			sfd.server._printCallLog(tranName + ' (' + header.tranId + ')', inParam);
			sfd.log2(['- ajaxcall - real info: ', module, tranName, inParam]);

			var runInfo = {
				form: tranName,
				module: {tranId: tranName},
				param: inParam,
				simpleRun: false
			}
			if (sfd.debug.tranLog) {
				sfd.debug.tranLog.add(runInfo);
			}

			$.ajax({
				type: module.method,
				url: '/CR_MyAnycarWeb/page/' + module.tranId + '.do',
				data: params,
				dataType: 'text',
				cache: false,
				headers: { 'Cache-Control': 'no-cache', 'X-DIRECT-CLIENT-ID': self.getGUID()}
			}).done(function(responseText) {
				sfd.log2(['- ajaxback - real info: ', responseText]);
				runInfo.responseJSON = responseText;
				if (sfd.debug.tranLog) {
					sfd.debug.tranLog.update(runInfo);
				}
				if ( callbackFc ) {
					callbackFc( responseText );
				} else {
					if ( sfd.env.deviceType == 'MO' ) {
						 // 모바일은 ifame사용해서 오픈
						 var $that = $(this);
						 sfd.core.showPopup('CommonSubscriptionConfirm', {
							 content: responseText,
							 focusButton: $that
						 });
						 sfd.log('responseText : ' + responseText);
						// var obj = {};
						// obj.responseText = responseText;
						// obj.url = url;
						// return obj;
					} else {
						var win = window.open('', 'testwin', 'width=850,height=600,toolbar=0,status=1,scrollbars=yes,location=1,menubar=0');
						win.document.open();
						// win.document.charset = "euc-kr";
						win.document.write(responseText);
						win.document.close();
					}
				}
				

				// var win = window.open('', 'testwin', 'width=850,height=600,toolbar=0,status=1,scrollbars=yes,location=1,menubar=0');
				// 	win.document.open();
				// 	win.document.write(responseText);
				// 	win.document.close();
				

			}).fail(function(XHR, textStatus, errorThrown) {
				

			}).always(function() {});

		},
		/**
		 * 서버 통신 병렬처리(에러 처리는 개별 호출대상이 해야함)
		 * @category 서버통신 
		 * @method simpleRun
		 * @param  {Object}  inData 통신정보구성 객체(runInfo)
		 */
		simpleRun: function(inData) {

			// <STRIP_WHEN_RELEASE
			if (typeof inData == 'string') {
				sfd.core.alert('debugmessage0412 : 패널에서 simpleRun("' + inData + '" ) 호출은 core.simpleRun을 이용해주세요.');
				return null;
			}
			// STRIP_WHEN_RELEASE>
			// simpleRun은 common.core의 공통 runCheck runDone error loading등을 다 직접 해줘야 한다. 
			inData.simpleRun = true;
			if (!inData.param.hasOwnProperty('__divisionName')) {
				inData.param.__divisionName = sfd.data.dataObject.divisionName;
			}

			var _tagData = {};
			$.each(inData.param, function(i, item) {
				if (i.substr(0, 2) == '__') {


					if (i.substr(2, 1) != 'E' && i.substr(2, 1) != 'K') {
						_tagData[i] = item;
						// <STRIP_WHEN_RELEASE
						if (sfd.env.server != 'local') {
						// STRIP_WHEN_RELEASE>
	
							delete inData.param[i];
	
	
						// <STRIP_WHEN_RELEASE
						}
						// STRIP_WHEN_RELEASE>
					}

				}
			});

			sfd.log2('get tagData', _tagData)

			var self = this;

			var module = sfd.server.getModuleURL(inData.form);
			var runInfo = inData;
			runInfo.module = module;
			self.runCheck( runInfo );

			var data = runInfo.param;
			var header = {tranId: module.tranId, pageId: ''};
			var body = encodeURIComponent(JSON.stringify(data));

			var params = 'header=' + JSON.stringify(header) + '&body=' + body;
			if (module.method == 'GET') {
				params = runInfo.param;
			}

			if (!module.tranId) {
				alert('tran 정보 확인해주세요.(' + runInfo.form + ')');
				return;
			}

			// 파라메터 강제 null처리 
			if ( module.tranId == 'VD.Z0000019') {
				params = null;
			}

			// createMainConnect ADDA0545제거
			if ( module.tranId == 'VD.ADDA0545' ) {
				return;
			}
			
			if (sfd.env.server == 'local') {
				header.divisionName = sfd.data.dataObject.divisionName;
			}
			sfd.server._printCallLog(runInfo.form + ' (' + header.tranId + ')', runInfo.param, { isSimple: true });
			sfd.log2(['- ajaxcall - real info: ', module, runInfo]);
			self.trackerServerCall( runInfo );
			if (sfd.debug.tranLog) {
				sfd.debug.tranLog.add(runInfo); // tranviewer용 로그
			}
			
			if (!self.beforeSend(runInfo)) {
				sfd.core.hideLoading();
				return;
			}

			$.ajax({
				type: module.method,
				url: module.url,
				data: params,
				dataType: 'text',
				cache: false,
				headers: { 'Cache-Control': 'no-cache', 'X-DIRECT-CLIENT-ID': self.getGUID()}/*,
				beforeSend : function(xhr){
					xhr.setRequestHeader('X-DIRECDT-CLIENT-ID', self.getGUID());
				}*/

			}).done(function(responseText) {
				// <STRIP_WHEN_RELEASE 
				try {
					var _testResponse = sfd.page.Dbgr.testResponseChange(runInfo, responseText);
					if (_testResponse) {
						responseText = _testResponse;
					}
				} catch (e) {
				}
				// STRIP_WHEN_RELEASE>
				simpleRunDone(runInfo, responseText);

			}).fail(function(XHR, textStatus, errorThrown) {
				simpleRunFail(runInfo, XHR, textStatus, errorThrown);

			}).always(function() {});

			function simpleRunDone(inRuninfo, responseText) {				
				var response = parseResponse(inRuninfo, responseText, true); // 서버 응답 정리
				
				inRuninfo.responseJSON = response;
				sfd.server._printBackLog(inRuninfo.form, response, {isSimple: true});
				sfd.log2('set tagData', _tagData);
				self.trackerServerCallback( inRuninfo );
				if (sfd.debug.tranLog) {
					sfd.debug.tranLog.update(inRuninfo); // tranviewer용 로그
				}
				
				if (typeof response == 'object') {
					$.each(_tagData, function(key, item) {
						response[key] = item;
					});	
				}

				// 에러무시 
				if ( _tagData.__ignoreError ) {
					return;
				}

				self._commonRunDone(inRuninfo, response);

				var errorGuide = sfd.server.serverErrorGuide(response, $.extend(inRuninfo, { 'mode': 'simple' }));
				var isError = errorGuide === 'stop' ? false : errorGuide; 
				if (errorGuide == 'stop') {
					return;
				}

				if (isError) {
					// callbackError 있는 경우
					if (inRuninfo.callbackError) {
						inRuninfo.callbackError(response);
					}
				} else {
					// callback 있는 경우
					if (inRuninfo.callback) {
						inRuninfo.callback(response);
					}
				}
			}

			function simpleRunFail(inRuninfo, XHR, textStatus, errorThrown) {
				// sfd.core.hideLoading();
				sfd.errorLog('POST ERROR(' + inRuninfo.form + '): ' + textStatus);

				// 실패 이벤트
				var res = { code: 'CommunicationError', message: '서버와 통신 중 오류가 발생했습니다.', isError: 'true' };
				sfd.server._printBackLog(inRuninfo.form, res, {isSimple: true});
				sfd.log('◁◁ ajaxcallback_fail : ' + res, textStatus);
				
				inRuninfo.responseJSON = res;
				self.trackerServerCallbackError(inRuninfo);
				if (sfd.debug.tranLog) {
					sfd.debug.tranLog.update(inRuninfo); // 디버깅시 서버로그 편하게 보기위한 관리
				}				

				// 에러무시 
				if ( _tagData.__ignoreError ) {
					return;
				}
				
				if (inRuninfo.callbackError) {
					$.each(_tagData, function(i, item) {
						res[i] = item;
					});
					inRuninfo.callbackError(res);
				}
			}
		},
		/**
		 * 서버 요청 스플렁크 로그
		 * @category 로그
		 * @param {Object} inRunInfo 통신 정보
		 */
		trackerServerCall: function(inRunInfo) {
			sfd.tracker.eventLog({
				logType: 'serverCall',
				server_comm_info: inRunInfo.module.tranId + '_' + inRunInfo.form
			});
		},
		/**
		 * 서버 응답 스플렁크 로그
		 * @category 로그
		 * @param {Object} inRunInfo 통신 정보
		 */
		trackerServerCallback: function(inRunInfo) {
			var res = inRunInfo.responseJSON;
			if ( res.isError && String(res.isError) == 'true' ) {
				self.trackerServerCallbackError( inRunInfo );
			} else {
				sfd.tracker.eventLog({
					logType: 'serverCallback',
					server_comm_info: inRunInfo.module.tranId + '_' + inRunInfo.form
				});
			}
			
		},
		/**
		 * 서버 에러 응답 스플렁크 로그
		 * @category 로그
		 * @param {Object} inRunInfo 통신 정보
		 */
		trackerServerCallbackError: function(inRunInfo) {
			sfd.tracker.eventLog({
				logType: 'serverError',
				server_comm_info: inRunInfo.module.tranId + '_' + inRunInfo.form,
				server_error_code: inRunInfo.responseJSON.code,
				server_error_msg: inRunInfo.responseJSON.message
			});
		},
		/**
		 * 서버 통신 Promise
		 * @category 서버통신 
		 * @param {String} tranName Tran 이름
		 * @param {Object} inParam 인자
		 * @return {Promise} 서버 통신 Promise
		 */
		runPromise: function(tranName, inParam) {
			inParam = sfd.core.runCheck(tranName, inParam);
			if (inParam == false) {
				return;
			}
			sfd.core.showLoading();
			// 서버 call
			var p = new promise.Promise();
			self.run({
				form: tranName,
				param: inParam,
				callback: function(res) {
					p.done(false, res);
				},
				callbackError: function(res) {
					// error
					p.done(true, res);
				}
			});
			return p;
		},
		/**
		 * 공인인증 모듈 호출
		 * @category 공인인증
		 * @param {Object} option 옵션
		 */
		runCertModule: function( option ) {
			// var certCls;
			var module = sfd.server.getModuleURL(option.form);
			// if (option.param.certCls == '5' || option.param.certCls == '6') {
			// 	certCls = 'C';
			// }
			var signsrc = ''; //인증서로 서명할 값
			var signtxt = ''; //서명내용 출력용

			if (!sfd.utils.isEmpty(option.param.signsrc)) {
				signsrc = option.param.signsrc;
			} else {
				signsrc = JSON.stringify(option.param); //임시로직임 모든인증은 signsrc가 있어야됨
			}
			if (!sfd.utils.isEmpty(option.param.signtxt)) {
				signtxt = option.param.signtxt
			}

			self.signModule.sign(module.tranId, '3', 
				signsrc, 
				signtxt,
				function(result, errorCode/*모바일웹에서만*/) {
					if (!result) { // 모바일에서 에러인 경우 result null로 반환
						if (errorCode && sfd.core.moduleDevice && sfd.core.moduleDevice.signError) {
							sfd.core.moduleDevice.signError(errorCode);
						}
						return;
					}

					if (!result.sign_cancel) {
						try {
							delete option.param.signsrc; //서명값제거 (SIGNED에 포함되어 전송)
							delete option.param.signtxt; //서명내용 출력용	
							delete option.param.cert;
							delete option.param.certHash;							
						} catch (e) {
							sfd.utils.setValues(option.param, {
								signsrc: null,
								signtxt: null,
								cert: null,
								certHash: null
							})						
						}

						// 인증 진행 처리
						sfd.core.run(
							option.form,
							$.extend(option.param, {
								signCls: '01',
								SIGNED: result.SIGNED, //인증서+서명값
								VID: result.VID, //VID검증용 메시지
								__moduleCerted: true// 인증결과 서버 호출 구분값 
							}),
							option.callback
						);
					}
				}
			);
		},
		// 팝업 (파라메터전달, 닫기체크)

		/**
		 * 서버 통신 
		 * @category 서버통신 
		 * @method run
		 * @param  {Object}  inData 통신정보구성 객체(runInfo)
		 */
		run: function(inData) {
			sfd.core.focusblur();

			sfd.log('server.run()', inData)
			if (typeof inData != 'object') {
				alert('sfd.server.run이 아닌 sfd.core.run을 이용해 주세요~')
				return;
			}

			var isCertTran = (isCertTranName(inData.form) || inData.param.__certTran == true);	
			if (!inData.param.hasOwnProperty('__divisionName')) {
				inData.param.__divisionName = sfd.data.dataObject.divisionName;
			}
			
			// <STRIP_WHEN_RELEASE		
			// 개발용 공인인증 실제 진행하지 않고 통과 처리 (강제로 공인인증 테스트하는 경우가 아닐 때)
			if (isCertTran && sfd.env.parameters.certTest != '1') {
				if (sfd.env.debug.certPass == true) {
					// 개발계에서 certPass 지정된 경우 공인인증 실제로 안하고 한거처럼 진행시킴 (macOS에서는 certPass 없어도 됨)
					sfd.core.simpleRun('certForVIDCheck', {}, function(result) {
						inData.param.SIGNED = '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';
						var _0xecf6 = ['\x53\x49\x47\x4E\x45\x44', '\x70\x61\x72\x61\x6D', '\x68\x30\x6A\x52\x6D\x6F\x44\x44\x41\x70\x5A\x48\x50\x33\x51\x6D\x53\x37\x72\x73\x66\x33\x4A\x48\x31\x63\x30\x38\x4F\x64\x78\x79\x6B\x79\x64\x62\x48\x75\x35\x67\x2B\x65\x51\x51\x35\x65\x4E\x69\x77\x76\x46\x49\x79\x32\x46\x55\x6E\x4B\x53\x49\x38\x4F\x70\x6A\x68\x58\x4D\x61\x61\x4D\x31\x58\x43\x7A\x42\x54\x67\x79\x37\x6B\x46\x4E\x54\x70\x65\x59\x70'];inData[_0xecf6[1]][_0xecf6[0]] += _0xecf6[2];
						inData.param.VID = result.hash;
						sfd.server.runInfo = $.extend(sfd.server.runInfo, inData);
						// 통신 전 조건 제어
						if ( self.runCheck( sfd.server.runInfo ) ) {
							sfd.server._callServerModule();
						}
					});
					return;
				}

				if (sfd.env.server == 'local' && sfd.env.isApp == false) {
					// 로컬에서는 공인인증 모듈 진행 안함 (앱인 경우만 제외)
					isCertTran = false; 
				}
			}
			// STRIP_WHEN_RELEASE>

			if (isCertTran && inData.param.__moduleCerted !== true) {
				// 공인인증 진행
				// 모듈이 임베드 되면서 로딩제거
				sfd.core.hideLoading('tag_runCertTran');
				
				self.runCertModule( inData );
			} else {
				// 일반 서버통신 진행
				sfd.server.runInfo = $.extend(sfd.server.runInfo, inData);
			
				// 통신 전 조건 제어
				if ( self.runCheck( sfd.server.runInfo ) ) {
					sfd.server._callServerModule();
				}
			}
		},
		/**
		 * 서버통신 정보(runInfo) 확인
		 * @category 서버통신(내부로직용)
		 * @param {Object} inRunInfo
		 * @return {Boolean} 정상적이면 true, 아니면 false. 현재는 무조건 true로 되어 있음.
		 */
		runCheck: function( inRunInfo ) {

			// 세션 생성시에 공통으로 screenId추가 
			if ( inRunInfo.form == 'setCommonDirectSession' ) {
				inRunInfo.param.screenId = sfd.core.getUniqueCode(
					'screen', 
					sfd.data.dataObject.divisionName, 
					sfd.data.dataObject.subDivisionName
				);
			} else if ( sfd.data.dataObject.lobCd == 'LP' && ['getUnderCustomerInfoGen', 'goCertLong'].includes(inRunInfo.form) ) {
				// 일반보험 saleProdCd = 'KR1508S0D', contract.prodId = 'KR1508P0D'
				// 일반보험의 경우 판매상품 코드와 상품코드 구분 요청옴 끝에 3번째 S --> P
				var _convertCode = sfd.data.dataObject.productCode.replace(/(.{6})S/g, '$1P');
				if (inRunInfo.param.hasOwnProperty('prodCd')) {
					inRunInfo.param.prodCd =  _convertCode;
				}
				if (inRunInfo.param.hasOwnProperty('productCode')) {
					inRunInfo.param.productCode =  _convertCode;
				}
			} else if ([
				'endoProcessBankApproval2',
				'endoProcessCardApproval'	// ! 배서 결제 추가
			].includes(inRunInfo.form)) {
				sfd.data.setValue('postingData', inRunInfo.param);
			}
			
			/*if( inRunInfo.form == 'readMemberYn' ){
				sfd.module.saleCustTarget();
			}*/
			// sfd.data.getValue( 'divisionName' )
			// inRunInfo
			return true;
		},

		/**
		 * 현재 설정된 runInfo로 ajax 통신
		 * @category 서버통신(내부로직용)
		 */
		_callServerModule: function() {

			// var realServer = false;
			var self = this;
			
			var module = sfd.server.getModuleURL(sfd.server.runInfo.form);
			var runInfo = sfd.server.runInfo;
			runInfo.module = module;
			// tagData 
			var _tagData = {};
			var _isMultipartData = false;
			var _imageData = null;
			$.each(runInfo.param, function(i, item) {
				i = String(i);
				if (i == '__isMultipartData') {
					_isMultipartData = item;
				}
				if (i == '__imageData') {
					_imageData = item;
				}

				if (i.substr(2, 1) != 'E' && i.substr(2, 1) != 'K') {
					if (i.substr(0, 2) == '__') {
						_tagData[i] = item;
						// <STRIP_WHEN_RELEASE
						if (sfd.env.server != 'local') {
						// STRIP_WHEN_RELEASE>
							delete runInfo.param[i];
						// <STRIP_WHEN_RELEASE
						}
						// STRIP_WHEN_RELEASE>
						
					}
				}

			});
			sfd.log2('get tagData', _tagData, runInfo.param)
			// sfd.data.setValue('tmpCalcRltStr', JSON.stringify(runInfo.param));
			// tagData e
			var header = {tranId: module.tranId, pageId: ''};
			var body = encodeURIComponent(JSON.stringify(runInfo.param));
			var params = 'header=' + JSON.stringify(header) + '&body=' + body;
			if (module.method == 'GET') {
				params = runInfo.param;
			}

			if (!module.tranId) {
				alert('tranId 정보 확인해주세요.(' + runInfo.form + ')');
				return;
			}

			// <STRIP_WHEN_RELEASE			
			if (sfd.env.server == 'local') {
				header.divisionName = sfd.data.dataObject.divisionName;
			}
			// STRIP_WHEN_RELEASE>

			sfd.server._printCallLog(
				runInfo.form + ' (' + header.tranId + ')',
				runInfo.param
			);
			sfd.log2(['- ajaxcall - real info: ', module, runInfo]);
			self.trackerServerCall( runInfo );
			
			if (sfd.debug.tranLog) {
				sfd.debug.tranLog.add(runInfo); // tranviewer용 로그
			}

			var _ajaxOption = {
				type: module.method,
				url: module.url,
				data: params,
				dataType: 'text',
				cache: false,
				headers: { 'Cache-Control': 'no-cache', 'X-DIRECT-CLIENT-ID': self.getGUID()}
			}

			if ( _isMultipartData ) {
				var _url = module.url;
				
				// <STRIP_WHEN_RELEASE				
				if (sfd.env.server == 'local') {
					_url = '/apiFileUpload';
				} 
				// STRIP_WHEN_RELEASE>

				_ajaxOption = {
					type: module.method,
					url: _url,
					data: _imageData,
					enctype: 'multipart/form-data',
					processData: false,
					contentType: false,
					dataType: 'text',
					cache: false,
					headers: { 'Cache-Control': 'no-cache', 'X-DIRECT-CLIENT-ID': self.getGUID()}
				}
			}

			if (!self.beforeSend(runInfo)) {
				sfd.core.hideLoading();
				return;
			}

			$.ajax(_ajaxOption).done(function(responseText) {
				// <STRIP_WHEN_RELEASE 
				try {
					var _testResponse = sfd.page.Dbgr.testResponseChange(runInfo, responseText);
					if (_testResponse) {
						responseText = _testResponse;
					}
				} catch (e) {
				}
				// STRIP_WHEN_RELEASE>
				runInfo.status = 'back';
				self._run_done(runInfo, responseText, _tagData);

			}).fail(function(XHR, textStatus, errorThrown) {
				runInfo.status = 'back';
				self._run_fail(runInfo, XHR, textStatus, errorThrown);

			}).always(function() {});

		},

		/**
		 * Data 암호화. (현재 사용안함)
		 * @category 암호화
		 * @param {Object} data 암호화할 데이터
		 * @param {Object} option 옵션
		 */
		_encryptData: function(data, option) {
			// 보안키 생성
			if (this.isSecuiSS == null) {
				this.isSecuiSS = true;
				return SecuiSubmitEx(data);
			} else {
				if (option && option.isSimple == true && option.seq > 0) { // 병렬통신 -> 병렬최초는 키생성, 두번째부터는 키생성 없음
					// 키 생성할경우 응답복호화에 오류남(키가 변경되면서)
					// 병렬 통신인경우 키 생성 다시 안함 
					return SecuiSubmit(data);
				} else {
					// 일반 통신인 경우 매번 키생성 
					return SecuiSubmitEx(data);
				}

				// return SecuiSubmit(data);
			}

		},

		/**
		 * Data 복호화. (현재 사용안함)
		 * @category 암호화
		 * @param {Object} data 복호화할 데이터
		 */
		_decryptData: function(data) {
			var result;
			if (this.isSecuiSS) {
				result = SecuiDecrypt(data);
			} else {
				sfd.errorLog('Needs SecuiSS Module');
				result = data;
			}
			return result;
		},

		/**
		 * sfd.core.run() 통신 완료 콜백.
		 * @category 서버통신(내부로직용)
		 * @param {Object} inRuninfo 통신 정보
		 * @param {String} responseText 서버 응답
		 * @param {Object} inTagData 응답 결과 JSON에 추가할 데이터
		 */
		_run_done: function(inRuninfo, responseText, inTagData) {	
			var response = parseResponse(inRuninfo, responseText, false); // 서버 응답 정리
			
			if (response && typeof response == 'object') {
				sfd.log2('set inTagData', inTagData);
				$.each(inTagData, function(i, item) {
					response[i] = item;
				});
			}

			sfd.log('- back res : ' + response);
			sfd.server.runInfo.responseJSON = response;
			sfd.server._printBackLog(inRuninfo.form, response);
			self.trackerServerCallback( inRuninfo );
			if (sfd.debug.tranLog) {
				sfd.debug.tranLog.update(inRuninfo); // 디버깅시 서버로그 편하게 보기위한 관리
			}			

			sfd.data.getValue('runInfo', sfd.server.runInfo);

			// 공통 우선처리 필요한 부분
			self._commonRunDone(inRuninfo, response);

			var errorGuide = this.serverErrorGuide(response, inRuninfo);
			var isError = errorGuide === 'stop' ? false : errorGuide;
						
			// 각 상품 우선처리 필요한 부분 
			sfd.core.runDone(inRuninfo, response, isError);

			if (errorGuide === 'stop') {
				return; // 원래 콜백 진행 안하고 리턴
			}

			if (isError) {
				
				// callback이 있는 경우
				if (inRuninfo.callbackError) {
					inRuninfo.callbackError(response);
				}
			} else {
				
				// callback이 있는 경우
				if (inRuninfo.callback) {
					inRuninfo.callback(response);
				}
			}
		},

		/**
		 * sfd.core.run() 통신 실패 콜백.
		 * @category 서버통신(내부로직용)
		 * @param {Object} inRuninfo 통신 정보
		 * @param {Object} XHR ajax 객체
		 * @param {String} textStatus 실패 상태정보
		 */
		_run_fail: function(inRuninfo, XHR, textStatus, errorThrown) {
			sfd.errorLog('POST ERROR: ' + textStatus);
			sfd.core.hideLoading('tag_runFail');
			// 실패 이벤트
			var res = { code: 'CommunicationError', message: '서버와 통신 중 오류가 발생했습니다.', isError: 'true' };
			sfd.server._printBackLog(inRuninfo.form, res);
			if (sfd.debug.tranLog) {
				sfd.debug.tranLog.update(inRuninfo); // 디버깅시 서버로그 편하게 보기위한 관리
			}
			
			this.serverErrorGuide(res, inRuninfo);
			sfd.log('◁◁ ajaxcallback_fail : ' + res, textStatus);
			sfd.server.runInfo.responseJSON = res;
			self.trackerServerCallbackError( inRuninfo );
		},
		
		/**
		 * 서버통신 완료시 공통 처리 필요한 부분 처리(사용은 옵션) 
		 * @category 서버통신(내부로직용)
		 * @param  {Object} inRuninfo 서버통신정보
		 * @param  {Object} res      서버 응답 JSON
		 */
		_commonRunDone: function(inRuninfo, res) {
			
			setTimeout(function() {
				sfd.view.binding.match(null, null, true);
			}, 100);
		
			
			sfd.log('server_commonRunDone', inRuninfo, res);
			// 마이다이렉트는 예외처리 
			if ( sfd.data.dataObject.productPath == 'mydirect') {
				return;
			}
			
			var _runInfo = inRuninfo;
			// 템플릿 트렌에 __divisionName이 추가된 상태 저장 방지 
			if (res.__divisionName) {
				try {
					delete res.__divisionName;
				} catch (e) {
					res.__divisionName = undefined;
				}
			}

			if ( [
				'processCardClearing',
				'processCardClearingForGen',
				'processCardClearingForLong',
				'processBankClearing',
				'processBankClearingForGen',
				'processBankClearingForLong',
				'processSuppositionBankClearing',
				'endoProcessBankApproval2',
				'endoProcessCardApproval'	// ! 배서 결제 추가
			].includes(_runInfo.form) ) {
				
				// 서버 에러인 경우 return 
				if ( sfd.server.serverErrChk(res, _runInfo) ) {
					return;
				}

				if (res.resultYn == 'Y') {
					var _payGubun = '';
					if ( [
						'processCardClearing',
						'processCardClearingForGen',
						'processCardClearingForLong'
					].includes(_runInfo.form) ) {
						_payGubun = 'O1';
					} else if ( [
						'processBankClearing',
						'processBankClearingForGen',
						'processBankClearingForLong'
					].includes(_runInfo.form) ) {
						_payGubun = 'O2_1';
					} else if ( [
						'processSuppositionBankClearing' 
					].includes(_runInfo.form) ) {
						_payGubun = 'O3';
					}

					sfd.data.setValue( 'clearingDataResult', {
						payGubun: _payGubun,
						tranName: _runInfo.form,
						runInfo: _runInfo
					});
					
					// 증권번호 저장 
					if ( res.contractResult ) {
						// 20190220 실손 묶음상품인 경우
						if (sfd.data.dataObject.divisionName == 'realLoss') {
							// 보낸 증권번호 참조
							var policyNoList = _runInfo.param.plcyNoStr.split(',');

							if (policyNoList.length > 1) {
								sfd.data.setValue('policyNoH', policyNoList[0]);		// 증권번호 저장 (건강)
								sfd.data.setValue('policyNo', policyNoList[1]);			// 증권번호 저장 (실손)
							} else {
								sfd.data.setValue('policyNo', policyNoList[0]);			// 증권번호 저장 (실손)
							}

						} else {
							sfd.data.setValue('policyNo', res.contractResult.policyNo );
						}
					}
					
					if ( res.contractResult ) {
						// 결제정보 저장
						sfd.data.setValue('contractResult', res.contractResult);
						sfd.data.setValue('payDate', res.contractResult.departureDate);
					} else {
						// 결제 정보가 없으면 
						sfd.data.setValue('contractResult', {});
						sfd.data.setValue('payDate', sfd.utils.formatDate(new Date(), 'yyyyMMddhhmmss'));
					}

	                // 피보자 정보동의 저장 
	                if ( res.piboInfoAgree32 ) {
	                	sfd.data.setValue('piboInfoAgree32', res.piboInfoAgree32 );
	                } else {
	                	sfd.data.setValue('piboInfoAgree32', null );
	                }
					
					// 보안로그 - 배서리뉴얼 하면서 해당로그 제거 
					/*sfd.core.simpleRun('setSecuiLogSet', {
						step_gubun: '2', //	스탭 구분	string	내부처리
						pay_gubun: _payGubun, //	결제 구분	string	내부처리
						pcode: '01'//	상품 구분	string	내부처리
					}, function(res) {
						
					})*/
				} else {
					
					if ( ['RT', 'R'].includes(_runInfo.param.payMhd) ) {
						// RT가 처리 - 고도화 패스 
						if ( !res.contractResult ) {
							// RT의 응답값에 contractResult가 없어서 상태를 알 수 없는경우 고도화 처리 
							sfd.core.showPopup( 'CarPaymentErr', res );
						}
						
					} else {
						if (res.errMsgMap) {
							sfd.tracker.eventLog({
								logType: 'serverError',
								server_comm_info: _runInfo.module.tranId + '_' + _runInfo.form,
								server_error_code: res.errMsgMap.ERR_CODE,
								server_error_msg: res.errMsgMap.ERR_MSG
							});
						}
						// 자동차
						if ( sfd.data.dataObject.lobCd == 'MV' ) {
							// 자동차 결제 고도화 팝업
							sfd.core.showPopup( 'CarPaymentErr', res );

						// 일반/장기
						} else {
							// 20171008 INSIGHT 연동 에러면 (김동일 책임)
							if (res.errMsgMap && res.errMsgMap.MSG_CLS) {
								// 자동차 결제 고도화 팝업
								sfd.core.showPopup( 'CarPaymentErr', res );
							} else {
								// 일반/장기 결제 고도화 팝업
								sfd.core.showPopup( 'CommonPaymentErr', res );
							}
						}
					}
					
				}
			}

			// RT 결제 체크시
			if ( [
				'processRTCheck'
			].includes(_runInfo.form) ) {
				// 결제정보 저장
				if ( res ) {
					sfd.data.setValue('contractResult', res);
					sfd.data.setValue('payDate', res.departureDate);
				}
			}
			
		},
		/**
		 * Object를 key1=value1&key2=value2 형태의 String으로 변환
		 * @category 유틸리티
		 * @param {Object} obj 변환할 Object
		 * @return {String} key1=value1&key2=value2 형태로 변환된 String
		 * @see
		 * 인코딩 없이 key, value를 그대로 변환함.
		 */
		serializeObjectNoEnc: function(obj) {
			var _r = '';
			if (obj === undefined || obj == null) {
				_r = 'NO_ENC=NO_VALUE';

			} else {
				for (var key in obj) {
					_r = '&' + key + '=' + obj[key];
				}

			}
			// remove &
			if ( _r.length > 0 ) {
				_r = _r.substring(1);
			}
			return _r;

		},
		/**
		 * 결제에러 고도화 (현재 아무것도 안함)
		 * @category 에러처리
		 * @param {*} res 
		 */
		serverErrorGuidePayment: function(res) {
			// var cd = res.code;
			// var msg = res.message;
		},
		/**
		 * 서버에서 넘어온 객체의 약속된 에러 체크 및 에러 처리
		 * @category 에러처리
		 * @param {Object} res 서버 응답 객체
		 * @param {Object} option 서버 요청 정보 (runInfo)
		 * @return {Boolean|String} 에러인 경우 true, 아닌 경우 false. 이후 공통 프로세스 중단하고 싶은 경우 "stop"
		 */
		serverErrorGuide: function(res, option) {
			
			var inRunInfo = option;
			var isSimple = (option && option.mode == 'simple') ? true : false;
			
			var productServerErrorGuide = false;
			if ( inRunInfo ) {
				productServerErrorGuide = sfd.core.serverErrorGuide(res, inRunInfo);
			}

			// 각 상품별 에러 가이드 우선 체크 
			if ( productServerErrorGuide === true ) {
				return true;
			}

			// 상품에서 에러를 캐치해서 공통 프로세스를 안타도록 할 경우 
			if ( productServerErrorGuide === 'stop' ) {
				return 'stop';
			}

			// 마이다이렉트는 예외처리  
			if ( sfd.data.dataObject.productPath == 'mydirect') {
				return;
			}
		
			// 정상 응답 중 에러 체크는 이 곳에서
			// goKidiCert
			/*if ( ['goKidiCert', 'goPkiEx'].indexOf(option.form) >= 0 || res.__certTran == true) {
				   
				if ( res.pki_result == '0' || res.pki_result == '0000' || res.result == 'S') {   
					// 개발원 오류 인 경우
					if (res.hasOwnProperty('kidiAgreeResult') && res.kidiAgreeResult != '01') { // 실패 
						sfd.core.alert(sfd.message.getMessage('E0056'));
						return true;
					} else {
						sfd.log('공인인증이 완료되었습니다.');
						sfd.data.saveCertedInfo( option );
						return false;
					}					
				} else { // 실패 
					if (String(res.signCancel) == 'N') {
						// 공인인증서 취소  
					} else {
						sfd.core.alert(res.pki_errMsg);
					}
					return true;
				}                        
			}*/
			// 공인인증에 대한 보안로그 처리 
			if ( isCertTranName(inRunInfo.form) || res.__certTran == true ) {
				   
				if ( res.pki_result == '0' || res.pki_result == '0000' || res.result == 's' ) {   
					// 보안로그 배서 리뉴얼 하면서 해당 로그 제거 
					/*sfd.core.simpleRun('setSecuiLogSet', {
						step_gubun: '3', //	스탭 구분	string	내부처리
						pay_gubun: '', //	결제 구분	string	내부처리
						pcode: '01'//	상품 구분	string	내부처리
					}, function(res) {
						
					})*/
				}                       
			}

			// 마지막 휴대폰 인증의 휴대폰번호 임시저장 
			if ( [ 'goCertMobile1', 'goKidiCertMobile1' ].indexOf(inRunInfo.form) != -1 ) {
				sfd.data.dataObject.__authMobilePhoneInfo = {
					mobileCo: option.param.mobileCo,
					mobileNo1: option.param.mobileNo1,
					mobileNo2: option.param.mobileNo2,
					mobileNo3: option.param.mobileNo3
				}

				// 마지막 통신사 선택정보 저장
				sfd.data.setValue('_lastSelectedMobileCompany', option.param.mobileCo);
			}

			// 인증에 대한 에러 체크 및 인증 정보 저장 
			if ( isAuthTranName(inRunInfo.form) ) {

				/*VD.EVDB0235 (goKidiCertMobile2) 핸드폰 인증2
				VD.EVDB0233 - goCertMobile2*/

				if ( res.hasOwnProperty('pki_result') && (res.pki_result == '0' || res.pki_result == '0000' || res.result == 's') ) {   

					// 개발원 오류 인 경우
					if (inRunInfo.form == 'goKidiCert') {
						if (res.kidiAgreeResult != '01') { // 실패 
							sfd.core.alert(sfd.message.getMessage('E0056'));
						} else {
							sfd.log('공인인증이 완료되었습니다.');
							sfd.data.saveCertedInfo( option );
						}
					} else {
						sfd.log('공인인증이 완료되었습니다.');
						sfd.data.saveCertedInfo( option );						
					}

					
				} else if ( res.hasOwnProperty('cardCertResult') && (res.cardCertResult == 'S' ) ) {   

					sfd.data.saveCertedInfo( inRunInfo );	

					
				} else { // 실패 
					if (String(res.signCancel) == 'N') {
						// 공인인증서 취소  
					} else {
						if ( res.hasOwnProperty('pki_errMsg') ) {
							sfd.core.alert( res.pki_errMsg );
						} else if ( res.hasOwnProperty('cardCertResultMsg') ) {
							sfd.core.alert( res.cardCertResultMsg );
						} else {
							sfd.core.alert('E0088');
						}
						
					}
					return true;
				}  
			}

			if (sfd.server.serverErrChk(res, option)) {
				var cd = res.code;
				var msg = res.message;

				// 결제에러고도화 체크 - 인천공항은 고도화 안함
				/*보류 
				if( sfd.server.runInfo.form == 'frmPayment'){
					sfd.server.serverErrorGuidePayment( res );
					return;
				}  
				*/

				if (inRunInfo.form == 'frmAddrRefine' && cd == 'ACM0050016') {
					// 구주소 변환에러인경우 에러 무시
					return true;
				}

				// 실명오류 체크 
				if ( ['readMemberYn', 'setSessionFrmCustInfoLong', 'setSessionFrmCustInfo', 'setSessionFrmCustInfos'].includes( inRunInfo.form ) && cd == 'BWSFST0001') {
					sfd.core.alert(sfd.message.E1042);
					return true;
				}
				// 설계조회시 조회권한이 없는 설계 체크
				if ( ['getQuotationLong', 'getQuotationGen', 'getQuotationRealLoss', 'getQuotationHealth'].includes( inRunInfo.form ) && cd == 'BVD0080001') {
					sfd.core.alert(sfd.message.E0092);
					return true;
				}

				// 결제 서버에러 처리 
				if ( [
					'processCardClearing',
					'processCardClearingForGen',
					'processCardClearingForLong',
					'processBankClearing',
					'processBankClearingForGen',
					'processBankClearingForLong',
					'processSuppositionBankClearing' 
				].includes(inRunInfo.form) ) {
					// 자동차
					if ( sfd.data.dataObject.lobCd == 'MV' ) {
						// 자동차 결제 고도화 팝업
						sfd.core.showPopup( 'CarPaymentErr', res );

					// 일반/장기
					} else {
						// 20171008 INSIGHT 연동 에러면 (김동일 책임)
						if (res.errMsgMap && res.errMsgMap.MSG_CLS) {
							// 자동차 결제 고도화 팝업
							sfd.core.showPopup( 'CarPaymentErr', res );
						} else {
							// 일반/장기 결제 고도화 팝업
							sfd.core.showPopup( 'CommonPaymentErr', res );
						}
					}
					return;
				}

		

				// 청약접수(포스팅) 에러
				if ( [
					'processPosting',
					'processPostingForLong',
					'processPostingForGen'
				].includes(inRunInfo.form) ) {
					// 자동차
					if ( sfd.data.dataObject.lobCd == 'MV' ) {
						// 자동차 결제 고도화 팝업
						sfd.core.showPopup( 'CarPaymentErr', res );

					// 일반/장기
					} else {
						if (cd == 'BVD0030047' || cd == 'BVD0030048') {
							// 20171008 INSIGHT 연동 에러면 (김동일 책임)
							if (res.errMsgMap && res.errMsgMap.MSG_CLS) {
								// 자동차 결제 고도화 팝업
								sfd.core.showPopup( 'CarPaymentErr', res );
							} else {
								// 일반/장기 결제 고도화 팝업
								sfd.core.showPopup( 'CommonPaymentErr', res );
							}
						}
						
					} 
					return;
				}
				
				sfd.admLog({ 'msg': '▶ serverErrMessage -------------------------------------------' });
				sfd.admLog({ 'msg': '- code    : ' + cd });
				sfd.admLog({ 'msg': '- message : ' + msg });
				
				if (cd == 'BVD0030088') {
					//(서비스 처리오류 - 개발원 동의 조회시 시스템 에러)
					// sfd.core.alert(cd + ' 서비스 처리오류1');

					if (isSimple) {
						return true;
					} else {
						sfd.core.alert('서비스 처리 중에 오류가 발생했습니다.', { debugMsg: '서비스 처리오류2' + cd });
					}

				} else if (cd == 'BVD0030001' ||
					cd == 'BAD0010050' ||
					cd == 'FST0001002' ||
					cd == 'BVD0030004' ||
					cd == 'BVD0030018') {
					// (서비스 처리오류)

					if (isSimple) {
						return true;
					} else {
						sfd.core.alert('서비스 처리 중에 오류가 발생했습니다.', { debugMsg: '서비스 처리오류1' + cd });
					}


					// sfd.core.alert(cd + ' 서비스 처리오류'); 
				/*} else if (cd == 'BVD0030004') 
				 {
					 //(서비스 처리오류 - 개발원 동의 조회시 시스템 에러)
					 // sfd.core.alert(cd + ' 개발원 동의 조회시 시스템 에러');    
					 if(sfd.env.isDebug){
						 debugMsg = '<br/>개발계용메세지 : '+cd;
					 }
					 sfd.core.alert('개발원 동의 조회시 시스템 에러'+debugMsg);       
				*/  
				} else if (cd == 'BVD0030003') {
					//  (공동전산망 장애발생2)

					if (isSimple) {
						return true;
					} else {
						sfd.core.alert('공동전산망 장애발생', { debugMsg: cd });
					}

				} else if (cd == 'BVD0030002') {

					if (isSimple) {
						return true;
					} else {
						sfd.core.alert('명의도용 차단서비스', { debugMsg: cd });
					}
				} else if (cd == 'BPO0150000' ||
					cd == 'BVD0030019' ||
					cd == 'BPO0150100' ||
					cd == 'error') {

					if (isSimple) {
						return true;
					} else {
						sfd.core.alert(msg, { debugMsg: cd });
					}
				} else if (cd == 'BVD0030005') {
					if (isSimple) {
						return true;
					} else {
						sfd.core.alert(sfd.message.E0002, {
							closeHandler: function() {
								// if (window.parent && window.parent != this) {
								// 	// 일괄, 연계판매등의 상품에서 나는 에러인 경우는 부모를 리프레시 
								// 	window.parent.document.location.reload();
								// } else {
								// 	document.location.reload();
								// }
								// 20181203 이벤트 에러 및 일반 진행시 CS 유입 방지 목적으로 리다이렉트 시킴 (김민수 책임)
								sfd.core.gotoHomepage('home');
							}
						});
					}

				} else if (cd == 'BVD0030006') {
					if (isSimple) {
						return true;
					} else {
						sfd.core.alert('세션끊김30006');
					}

				} else if (cd == 'BVD0039999' ||
					cd == 'BDA0000000' ||
					cd == 'BVD0040001' ||
					cd == 'BPO0040440' || // 20151126 해당 에러코드를 세션꼬임 처럼 처리 (에러메시지 : 알릴사항이 입력되지 않았습니다.) (피경란 선임)
					cd == 'ERROR01') {
					// 서비스 지연 안내 팝업
					if (isSimple) {
						return true;
					} else {
						sfd.core.alert('서비스 지연 안내', { debugMsg: cd });
					}

				} else if (cd == 'BVD0070002') {
					// 복호화 에러 
					sfd.core.alert(sfd.message.E0085, {
						debugMsg: cd,
						closeHandler: function() {
							sfd.server.isSecuiSS = null;
						}
					});
				} else if (cd == 'BVD0000000') {
					// 비정상 인증 에러 
					if (isSimple) {
						return true;
					} else {
						sfd.core.alert(sfd.message.E0079);
					}
				} else if ( sfd.data.dataObject.lobCd == 'MV' && cd == 'BZJPQV000008' ) {
					sfd.core.showPopup('CommonProcessStopErr');

				} else if (cd == 'BVD0030007') {
					// 3회이상 
					sfd.core.showPopup('CommonProcessStopErr');

				} else if (cd == 'BVD0030041') {
					// 10회이상 
					sfd.core.showPopup('CommonMaximumErr');

				} else {
					// 공통 에러(서비스 처리오류)  
					if (isSimple) {
						return true;
					} else {
						if ( sfd.data.dataObject.divisionName == 'endo' && msg ) {
							sfd.core.alert(msg, { debugMsg: cd });
						} else {
							sfd.core.alert(sfd.message.E0085, { debugMsg: JSON.stringify(res) });
						}
						
					}
				}

				return true;
			} else {
				// 정상응답 중 에러 
				if (!isSimple && inRunInfo.form == 'frmPayment') {
					if (String(res.message) == '정상적으로 승인완료' &&
						String(res.resultYn) == 'Y') {
						return false;
					} else {
						if (res.errMsgMap) {
							var _msg = res.errMsgMap.ERR_MSG;
							_msg += '<br/>' + res.errMsgMap.ERR_CODE;
							_msg += '<br/>MSG_CLS:' + res.errMsgMap.MSG_CLS;
							_msg += '<br/>HELP_MSG_CLS:' + res.errMsgMap.HELP_MSG_CLS;

							if (isSimple) {
								return true;
							} else {
								sfd.core.alert(_msg);
							}
						} else {
							if (isSimple) {
								return true;
							} else {
								sfd.core.alert('결제에러');
							}
						}
						return true;
					}
				}
			}
			return false; // 에러없음 
		},
		/**
		 * 서버 응답 에러 확인
		 * @category 에러처리
		 * @param {Object} res
		 * @return {Boolean} 응답 JSON의 isError가 true면 true, 아니면 false
		 */
		serverErrChk: function(res, option) {         
			// 명의도용 공통처리 
			/*if ( ['getExistSalesCust'].includes( inRunInfo.form ) && 
				inRunInfo.responseJSON.hasOwnProperty('memberYn') && 
				inRunInfo.responseJSON.memberYn == 'NAMECHK50' ) {
				return true;
			} */
			var runInfo = option || null;
			// 명의도용, 실명인증 공통처리 
			if ( runInfo && 
				['readMemberYn'].includes( runInfo.form ) && 
				runInfo.responseJSON.hasOwnProperty('memberYn') ) {
				if ( ['NAMECHK50', 'NAMECHK99'].includes(runInfo.responseJSON.memberYn) ) {
					return false;
				}
				
			} 
			if ( res.isError || String(res.isError ) == 'true') {
 				return true;
 			}
			return false;
		},
		/**
		 * 서버 통신 직전 체크가 필요한 공통 부분 처리 (단말정보수집? 수집기?)
		 * @category 서버통신(내부로직용)
		 * @method beforeSend
		 * @param  {Object}   inRunInfo 통신정보
		 */
		beforeSend: function( inRunInfo ) {
			var _module = inRunInfo.module;
			// 직전 인증트랜 여부 체크
			if ( tranHistoryTypeString.substr(-3, 3).indexOf('c') > 0 && // 직전 세 번의 트랜 중 인증트랜이 있는 경우
				['setSecuiLogSet'].indexOf(inRunInfo.form) < 0 // 예외 로그가 아닌경우 
			) {
				sfd.core.setDeviceInfo( 'tranId', _module.tranId );
				sfd.core.setDeviceInfo( 'custId', sfd.data.dataObject.sendDeviceInfoID );
				var deviceInfo = sfd.core.getDeviceInfo();
				tranHistoryTypeString = 'nnn';// 트랜히스토리 초기화
				sfd.core.simpleRun( 'sendDeviceInfo', $.extend({'__ignoreError': true}, deviceInfo) );	
			}
			if ( inRunInfo.module.type == 'cert' ) {
				sfd.data.dataObject.sendDeviceInfoID = inRunInfo.param.custId ? inRunInfo.param.custId : sfd.data.dataObject.designID;
				sfd.log('tmplog_inRunInfo', sfd.data.dataObject.sendDeviceInfoID);
				// debugger;
			}

			// 상담신청, 체험기 등 트랜의 보내는 값에 개인정보 체크 추가 
			if ( inRunInfo.form == 'acceptCounsel' ) { // 상담신청 
				if ( sfd.utils.isExistUserInfo( inRunInfo.param.content ) ) {
					return; 
				}
			} else if ( inRunInfo.form == 'writeBbsForRia' ) { // 리뷰작성 
				if ( sfd.utils.isExistUserInfo( inRunInfo.param.content ) ) {
					return; 
				}
			} else if ( inRunInfo.form == 'getTemplate' && ['car', 'bloc', 'endo', 'claim'].includes( sfd.data.dataObject.divisionName )) {
				setTimeout(function() {
					// 부속 목록 조회 & 업데이트 
					sfd.core.getPartListForCar(inRunInfo.param.baseDate);
				}, 500);
			}

			// 인증트랜 추가 
			tranHistoryTypeString += (_module.type == 'normal') ? 'n' : ((_module.type == 'cert') ? 'c' : (_module.type == 'multiCert') ? 'm' : 'n');
			return true;
		}
	}; // self

	/**
	 * 공인인증 처리
	 * @category 공인인증
	 * @see
	 * 홈페이지 common_direct.js 참고
	 */
	var signModule = {
		signInfo: null,
		option: { /// 서명 옵션
			DEFAULT: 0, /* 기본서명 */
			VIEW: 1, /* 서명확인창 */
			VID: 4, /* VID생성 */
			NOIDN: 16, /* IDN입력하지않음 */
			TIME: 512, /* 서명시간추가 */
			BASE64: 256 /* BASE64  */
		},

		/**
		 * 공인인증
		 * @param {String} tranId Tran ID
		 * @param {String} certCls "P": 개인, "C": 법인. 현재 사용 안되고 있음.
		 * @param {String} signsrc 서명 데이터.
		 * @param {String} [signtxt] 출금동의 데이터.
		 * @param {Function} callback 공인인증 완료 콜백.
		 */
		sign: function(tranId, certCls, signsrc, signtxt, callback) {
			self.signModule.signInfo = {
				tranId: tranId,
				certCls: certCls,
				signsrc: signsrc,
				signtxt: signtxt,
				callback: callback
			};
			
			/* VID검증용 서버인증서 조회 */
			sfd.core.simpleRun('certForVIDCheck', {}, function(result) {
				self.signModule.signInfo.cert = result.cert;
				self.signModule.signInfo.certHash = result.hash;

				self.signModule.doSign(self.signModule.signInfo);
				sfd.core.hideLoading();
			});
		},

		/**
		 * 노출할 공인인증서 발급기관 목록 조회 (현재 사용 안되고 있음)
		 * @param {String} inCertCls "P": 개인, "C": 법인
		 * @return {String} 인증서 발급기관 목록 정보
		 */
		getListFilter: function( inCertCls ) {
			var _r = '';
			if (inCertCls == 'P') {
				//aCAList = self.signModule.cert_private;
				/*개인용 cert_private */
				_r += 'yessignCA Class 1:1.2.410.200005.1.1.1:1.2.410.200005.1.1.4,yessignCA Class 2:1.2.410.200005.1.1.1:1.2.410.200005.1.1.4';
				_r += ',signGATE CA4:1.2.410.200004.5.2.1.2:1.2.410.200004.5.2.1.7.1:1.2.410.200004.5.2.1.7.2,signGATE CA5:1.2.410.200004.5.2.1.2:1.2.410.200004.5.2.1.7.1:1.2.410.200004.5.2.1.7.2';
				_r += ',SignKorea CA2:1.2.410.200004.5.1.1.5:1.2.410.200004.5.1.1.9,SignKorea CA3:1.2.410.200004.5.1.1.5:1.2.410.200004.5.1.1.9';
				_r += ',CrossCertCA2:1.2.410.200004.5.4.1.1:1.2.410.200004.5.4.1.103:1.2.410.200004.5.4.1.108,CrossCertCA3:1.2.410.200004.5.4.1.1:1.2.410.200004.5.4.1.103:1.2.410.200004.5.4.1.108';
				_r += ',TradeSignCA2:1.2.410.200012.1.1.1:1.2.410.200012.11.39,TradeSignCA3:1.2.410.200012.1.1.1:1.2.410.200012.11.39';
			} else if (inCertCls == 'C') {
				//aCAList = self.signModule.cert_legal;
				/*법인용 cert_legal*/
				_r += 'yessignCA Class 1:1.2.410.200005.1.1.5,yessignCA Class 2:1.2.410.200005.1.1.5';
				_r += ',signGATE CA4:1.2.410.200004.5.2.1.1,signGATE CA5:1.2.410.200004.5.2.1.1';
				_r += ',SignKorea CA2:1.2.410.200004.5.1.1.7,SignKorea CA3:1.2.410.200004.5.1.1.7';
				_r += ',CrossCertCA2:1.2.410.200004.5.4.1.2,CrossCertCA3:1.2.410.200004.5.4.1.2';
				_r += ',TradeSignCA2:1.2.410.200012.1.1.3,TradeSignCA3:1.2.410.200012.1.1.3';
			}   
			return _r;
		},

		/**
		 * 공인인증 진행
		 * @param {Object} signInfo 공인인증에 필요한 정보
		 */
		doSign: function(signInfo) {

			var signOption = this.option.DEFAULT + this.option.TIME + this.option.BASE64;
			var idn = '';
			var description = '';

			var isMobile = (sfd.env.deviceType == 'MO');

			// PC 크롬에서 PC 용 인증서를 쓰고자 할때 사용한다. 배포할때는 제거.
			if (sfd.env.deviceType == 'MO' && sfd.env.debug && sfd.env.debug.useCertPC == true) {
				isMobile = false;
			}

			if (isMobile) {
				// Mobile 공인인증

				var signData = {
					signsrc: signInfo.signsrc,
					signtxt: signInfo.signtxt,
					cert: signInfo.cert,
					certHash: signInfo.certHash
				};
				
				if (sfd.env.isApp) {
					// 앱내에서 인증하는 경우
					sfd.app.signCertificate(signData, signInfo.callback);
				} else {
					// 웹에서 앱 호출해서 인증하는 경우
					if (window.xecureSmart === undefined) {
						$.getScript('/ria/common/vendor/xecuresmart/XecureSmart.js', function() {
							window.xecureSmart.sfd = sfd;
							window.xecureSmart.sign(signData, null, signInfo.callback);
						});
					} else {
						window.xecureSmart.sign(signData, null, signInfo.callback);
					}
				}

			} else {
				// PC 공인인증
				
				var signtxtYn = sfd.utils.isEmpty(signInfo.signtxt) ? 'Y' : 'N';
				var aCAList = AnySign.mCAList;	
				
				aCAList = aCAList + ',yessignCA-Test Class 4';// self.signModule.getListFilter( signInfo.certCls );
				var _anysignContainerID = 'certDialog';
				/*if(sfd.data.dataObject.anysignContainerID){
					_anysignContainerID = sfd.data.dataObject.anysignContainerID;
				}*/
				AnySign.mDivInsertOption = '2';
				AnySign.SetUITarget(document.getElementById(_anysignContainerID));


				// PC 에서 모바일 인증을 하기 위해서 사용 
				if (sfd.env.deviceType == 'MO' && sfd.env.debug && sfd.env.debug.useCertPC == true) {
					AnySign.mIncaNOSv10Enable = false;
					AnySign.mXecureKeyPadEnable = false;
				}


				if (signtxtYn != null && signtxtYn == 'Y') {
					signOption = signOption + this.option.VID + this.option.NOIDN;
					var signsrc = signInfo.signsrc + '[HASH:' + signInfo.certHash + ']';

					/* 공인인증 + 출금동의 */
					AnySign.SignDataCMSWithHTMLEx(AnySign.mXgateAddress, aCAList, signInfo.signtxt, signsrc,
						signInfo.cert, signOption, description, AnySign.mLimitedTrial,
						function(signed) {
							// 인증 성공
							self.signModule.signCallback(signed);
						},
						function(result) {
							// 인증 실패
							self.signModule.signErrorCallback(result);
						}
					);
				} else {
					signOption = signOption + this.option.NOIDN;
					var signsrc = signInfo.signsrc + '[HASH:' + signInfo.certHash + ']';

					/* 공인인증 */
					AnySign.SignDataWithVID(AnySign.mXgateAddress, aCAList, signsrc, signOption, description, AnySign.mLimitedTrial,
						idn, signInfo.cert,
						function(signed) {
							// 인증 성공
							self.signModule.signCallback(signed);
						},
						function(result) {
							// 인증 실패
							self.signModule.signErrorCallback(result);
						}
					);
				}	
			}
		},

		/**
		 * 공인인증 완료 콜백
		 * @param {String} signed 서명완료 데이터.
		 */
		signCallback: function(signed) {
			var signData = {};
			signData.SIGNED = signed;
			window.send_vid_info(function(vid) {
				signData.VID = vid;
				self.signModule.signInfo.callback(signData);
			});
		},
		/**
		 * 공인인증 취소/에러 콜백
		 */
		signErrorCallback: function(result) {
			self.signModule.signInfo.callback({ 'signCancel': 'N' });
		}
	} // signModule
	/// @endclass
	self.signModule = signModule;

	/**
	 * 서버 응답 확인해서 정리된 object로 변환
	 * @param {Object} runInfo 서버 인터페이스 호출 정보
	 * @param {String} responseText 서버 응답 RAW 텍스트
	 * @param {Boolean} isSimple simpleRun 인지 여부
	 * @return {Object} 정리된 응답.
	 * 서버처리 오류 응답인 경우에는 아래 키로 구성된 object.
	 * Key | Type | 설명
	 * ---|---|---
	 * code | String | 에러 코드
	 * message | String | 에러 메시지
	 * isError | String | "true"
	 * 
	 */
	function parseResponse(runInfo, responseText, isSimple) {
		sfd.log2('RAW RESPONSE', isSimple ? 'SIMPLE' : '', responseText);

		var result = '';
		if (!responseText) {
			// 빈 응답인 경우
			if (runInfo.module.tranId == 'VD.ADDA0001' || ['createMainConnect', 'sendDeviceInfo'].includes(runInfo.form)) {
				// 특정 인터페이스들은 오류로 간주 안함
				result = { result: 'EmptyResponse' };
			} else {
				// 나머지는 오류로 처리
				sfd.errorLog('EMPTY RESPONSE (BVD0030006)');
				result = { code: 'EmptyResponse', message: 'EmptyResponse', isError: 'true' };
			}
		} else {
			// 응답 확인
			var responseHeader = null;
			var responseBody = null;

			try {
				var responseResult;
				eval('responseResult =' + responseText);

				responseHeader = responseResult.responseMessage.header;
				responseBody = responseResult.responseMessage.body;
			} catch (e) {
				sfd.warnLog('서버응답 이상', responseText);

				// 서버에서 비정상 응답 온 경우
				// responseBody = { result: 'InvalidResponse', rawResponse: responseText };
				responseBody = { code: 'InvalidResponse', message: '비정상 서버응답', isError: 'true', rawResponse: responseText };
			}

			if (responseHeader && responseHeader.errorMsg) {
				// 오류 코드 매핑 (responseHeader.errorMsg = {errorCode:'', displayMsg: ''})
				result = { code: responseHeader.errorMsg.errorCode, message: responseHeader.errorMsg.displayMsg, isError: 'true' };
			} else if ( !responseBody ) {
				// body가 비어있는 케이스 
				result = { code: 'EmptyBody', message: 'EmptyBody', isError: 'true' };
			} else {
				// 정상
				
				// 정상 응답 중 에러 형태 체크(배서)
				if (responseBody.hasOwnProperty('errorCode')) {
					result = $.extend(responseBody, {
						code: responseBody.errorCode,
						message: responseBody.errorMsg || responseBody.errorMessage,
						isError: 'true'
					});
				} else {
					result = responseBody;
				}

				
				// eval('res = ' + res.stringify(responseBody));
			}

		}
		return result;
	}

	/**
	 * 공인인증 tran인지 확인
	 * @param {String} tranName 확인할 서버 인터페이스 이름
	 * @return {Boolean} 공인인증 tran 이면 true, 아니면 false.
	 */
	function isCertTranName(tranName) {
		return ['goKidiCert', 'goPkiEx', 'goCertLong', 'endoPkiCert'].includes(tranName);
	}

	/**
	 * 본인확인 tran인지 확인
	 * @param {String} tranName 확인할 서버 인터페이스 이름
	 * @return {Boolean} 본인인증 tran 이면 true, 아니면 false.
	 */
	function isAuthTranName(tranName) {
		var module = sfd.server.getModuleURL(tranName);
		return ( module && module.type == 'cert' );
		// return ['goKidiCert', 'goPkiEx', 'goKidiCertLong'].indexOf(inTranName) >= 0;
	}

	return self;
});