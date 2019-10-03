/**
 * 화면 제어
 * @class sfd.view
 */
define(['/ria/common/core/Sfd.control.js?' + sfdCacheBust], function(sfdControls) {
	'use strict';

	var sfd;
	var dataviewer;

	var loadingPageName = ''; 	/// <Page View> {String} 모듈/리소스 로드 진행중인 page name.
	var loadingPopupName = '';	/// <Popup View> {String} 로딩 중인 popup 이름
	var alertQueue = [];		/// <Popup View> {Array} Alert 여러개 호출되는 경우 차례대로 보여주기 위한 queue
	var pendingPopup = null; 	/// <Popup View> {Object} 열려고 하는데 어떤 작업이 안료된 후 열려야해서 잠시 대기 중인 팝업. { name, options }

	var self = {
		// version info
		version: {
			modified: '{version-modified}',
			deploy: '{version-deploy}',
			hash: '{version-hash}'
		},
		$wrapper: null,				/// {Object} 전체 컨텐츠 wrapper jQuery object.
		currPageName: '',			/// <Page View> {String} 현재 page 이름
		prevPageName: '',			/// <Page View> {String} 이전 page 이름
		currPage: null,				/// <Page View> {Object} 현재 page 객체 (deprecated) // TODO: 나중에 사용하는 곳 없는지 확인 후 제거
		prevPage: null,				/// <Page View> {Object} 이전 page 객체 (deprecated) // TODO: 나중에 사용하는 곳 없는지 확인 후 제거
		currPageObj: null,			/// <Page View> {Object} 현재 page 메타정보 (deprecated) // TODO: 나중에 사용하는 곳 없는지 확인 후 제거
		prevPageObj: null,			/// <Page View> {Object} 이전 page 메타정보 (deprecated) // TODO: 나중에 사용하는 곳 없는지 확인 후 제거
		currPageKoName: '',			/// <Page View> {String} 현재 page 제목 (deprecated) // TODO: 나중에 사용하는 곳 없는지 확인 후 제거
		prevPageKoName: '',			/// <Page View> {String} 이전 page 제목 (deprecated) // TODO: 나중에 사용하는 곳 없는지 확인 후 제거
		historyList: [],			/// <Page View> {Array} Page 히스토리 저장
		isPageTransitioning: false, /// <Page View> {Boolean} Page 전환 transition 진행중인지 여부.
		currPopupName: '',			/// <Popup View> {String} 현재 열려있는 popup 이름
		isConfirmOpened: false,		/// <Popup View> {Boolean} Confirm popup 보여지고 있는지 여부
		isPopupTransitioning: false, /// <Popup View> {Boolean} Popup 보여주거나 닫는 transition 진행중인지 여부.
		allResourceQueue: [],		/// <리소스 관리> {Array} 모든 리소스
		openResourceQueue: [],		/// <리소스 관리> {Array} 초기화 시점 로드할 리소스
		loadedOpenResourceCount: 0,	/// <리소스 관리> {Int} 로드된 초기화 리소스 갯수
		versions: [],				/// <리소스 관리> {Array} 로드된 모듈들 정보. `{ moduleName, moduleType, fileType, moduleContent }`
		support: {					/// <유틸리티> {Object} 특정 기능 구현되어있는지 확인하기 위한 정보
		},

		alertQueue: [], /// <Popup View> {Array} 기존로직용 (deprecated)
		// TODO: 아래 <안쓰임>들 사용되는지 확인
		currOpenComponent: [], /// <안쓰임> {Array} 현재 오픈한 콤포넌트를 등록한다
		cacheResource: [], /// <안쓰임> {Array} 필요한 리소스를 키밸류로 캐싱. (사용하는 곳 없음)
		commonResource: [ /// <안쓰임> {Array} 공통 리소스 (사용하는 곳 없음)
			// { type: 'resource', name:'Alert',          description:'경고,안내',  product:'common' }
		],
		/// <안쓰임> {Array} 공통 리소스 (사용하는 곳 없음)
		commonResourceDID: [
			// { type: 'page',     name:'CodeSnippet',    title:'CodeSnippet',   product:'common' },
			// { type: 'resource', name:'Popup',          description:'팝업',      product:'common' },
			// { type: 'resource', name:'Loading',        description:'공통로딩',   product:'common' }
		],		
		commonResourcePC: [], /// <안쓰임> {Array} PC 공통 리소스 (사용하는 곳 없음)
		xmlResource: [], /// <안쓰임> {Array} XML 리소스 (사용하는 곳 없음)

		/** 
		 * 초기화 작업. 오프 시점에 로드해야할 리소스/XML 로드. 기본 HTML 및 이벤트 준비 
		 * @category 초기화
		 */
		initialization: function(d) {
			sfd = d;
			self.$wrapper = $('#wrapper');
			self.binding.tick();
			
			if (self.initSFDControls) {
				self.initSFDControls(sfd); // control들 초기화
			}

			// elementInfos
			$('<div id="password-hint"></div>').insertAfter(self.$wrapper);
			/*$('<div id="dbgsendCon"></div>').insertAfter($('#wrapper'));
            swfobject.embedSWF('../common/resource/dbgsend.swf', 'dbgsendCon', '1', '1', '11.0', null, {}, { wmode: 'window', bgcolor: '#FFFFFF', menu: 'false', allowScriptAccess: 'always' }, { name: 'dbgsend', id: 'dbgsend' });
*/
			self.openResourceLoadStart();


			if (sfd.data.getValue('transitionEffect') == 'horizontal') {
				$('#shell-main').html('<div id="panel-container0" class="panel-container"></div><div id="panel-container1" class="panel-container">2</div>');
				$('#panel-container1').css('left', $('#shell-main').width());
				$('#panel-container1').hide();
			} else if (sfd.data.getValue('transitionEffect') == 'vertical') {
			} else {
				$('#shell-main').html('<div id="panel-container0" class="panel-container"></div>');
				$('#panel-container0').css('left', '0px');
			}

			self.$wrapper.mousedown(function(e) {
				// popover 관리
				sfd.core.popoverAllClose(e);   
				sfd.core.tooltipAllClose(); 
				
				// TODO: 아래 코드 사용되는지 확인
				checkComponent();

				function checkComponent() {                   
					if (self.currOpenComponent.length == 0) {
						// 열린 콤포넌트가 없으면 return 
						return;
					}

					if ($('.component-container').has(e.target).length == 0 &&
                        $('.component-container-stack1').has(e.target).length == 0) { // 스테이지 클릭 
						closeOpenComponents();
					}
				}

				function closeOpenComponents() {
					for (var i = 0, len = self.currOpenComponent.length; i < len; i++) {
						self.currOpenComponent[i].stageClick();
					}
					self.currOpenComponent = [];
				}

			}).mouseover(function(e) {

			})

			$(document).on('keydown', function(event) {
				if (event.keyCode == 27/*ESC*/) {
					sfd.core.popoverAllClose();
				}
				documentKeydown(event);
			});;

			$(window).resize(function() {
				resizeComplete(function() {
					self.windowResizeComplete()
				}, 500);
			});
			var resizeComplete = (function() {
				var timer = 0;
				return function(callback, ms) {
					clearTimeout(timer);
					timer = setTimeout(callback, ms);
				};
			})();
			self.windowResizeComplete({ isFirst: true });
			
			// <STRIP_WHEN_RELEASE
			// 화면에 View ID 표시
			if (localStorage.getItem('sfd.debugging.viewIdentifier') == 'visible') {
				self.$wrapper.one('sf.change-page-complete', function() {
					toggleViewIdentifier();
				});	
			}
			// STRIP_WHEN_RELEASE>
		},
		/**
		 * 윈도우 Resize 이벤트 처리
		 * @category 기타
		 * @param {Object} option 옵션
		 */
		windowResizeComplete: function(option) {
			var $window = $(window);
			// 브라우져 최초 리사이즈는 발생시기키 않는다.
			if ( option == undefined || ( option && !option.isFirst ) ) {
				$(window).trigger('sf.resize-complete');
				// $(window).trigger('windowResizeComplete');
			}
			sfd.core.loadingResize();
			if ( sfd.env.deviceType == 'MO' ) {
				$('#shell-main').css('width', $window.width());
				$('#shell-top').css('width', $window.width());
				$('.modal-loading').css(
					{
						'width': $window.width(),
						'height': $window.height()
					}
				);
			}
		},

		/**
		 * Page 변경. Page 정의에 따라 가로, 세로, 전체, 일반 전환. (deprecated)
		 * @category Page View
		 * @param {String} inName Page name
		 */		 
		changeView: function(inName) {
			this.showPage(inName);
		},

		/**
		 * 지정한 Page 보이기. (프레임워크 내부 호출용임)
		 * @category Page View
		 * @param {String} name Page name
		 * @see
		 * 상품에서 사용할때는 `sfd.core.showPage()` 함수 사용하세요.
		 */		 
		showPage: function(name) {
			if (name == this.getPageName()) {
				sfd.log('현재 페이지를 또 showPage 했어요.');
				return;
			}

			if (this.isPageTransitioning == true && loadingPageName != name) {
				return; // Page 전환 진행 중인 경우에는 무시. (로드하러 갔다가 온 경우에는 진행시켜야함)
			}

			var oldPageName = this.getPageName();
			var oldPage = this.getPage();
			var oldPageIndex = this.getPageIndex();
			var oldPageMetadata = oldPageName ? this.getPageMetadata(oldPageName) : null;
			
			// Page 전환 준비 작업
			this.isPageTransitioning = true; // Page 전환중

			sfd.core.popoverAllClose();
			sfd.core.showLoading('loading-transparent');

			if (!loadingPageName) {
				// onPageWillShow
				if (viewEvent('onPageWillShow', null, name, { returnOnFalse: true }) === false) {
					this.isPageTransitioning = false; 
					return; // 이벤트 함수에서 false 반환한 경우 page 보여주기 취소
				}

				// onPageWillHide
				if (oldPage) {
					viewEvent('onPageWillHide', oldPage, this.getPageName(), { returnOnFalse: true });
				}
			}

			loadingPageName = '';
			// Page 로드 안된 상태인지 확인하고, 먼저 page 로드하고 오도록
			if (!this.getPage(name)) {
				loadingPageName = name;
				sfd.core.showLoading('loading-common');
				loadPage(name);
				return;
			}

			// Page 로드 완료된 상태면 진행 시작
			var newPage = this.getPage(name);
			var newPageIndex = this.getPageIndex(name);
			var newPageMetadata = this.getPageMetadata(name);
			var dir = oldPageIndex < newPageIndex ? 'next' : (oldPageIndex > newPageIndex ? 'prev' : ''); // 페이지 전환 방향

			// <STRIP_WHEN_RELEASE
			if (newPageMetadata == null) {
				alert('debugMessage1709081: ' + name + ' 페이지 정보 null\n\n아래 케이스 확인\n1. 해당 Html페이지가 없는지 확인 \n2. 페이지의 로드를 위해 Data.js의 pages에도 추가했는지 확인');
				this.isPageTransitioning = false;
				return;
			}
			// STRIP_WHEN_RELEASE>

			// 이벤트 trigger
			$('#wrapper').trigger('sf.change-page-start');
			
			// 기존 페이지 off 처리
			if (oldPage) {
				// 기존 페이지 사라짐 animation시작 
				if (oldPage.pageState) {
					oldPage.pageState('hideAnimateStart'); // 구코드 지원을 위해 남겨둠
				}
				oldPage.off();
			}

			// 정보 업데이트
			sfd.data.setValue('pageDir', dir);
			sfd.data.setValue('pageKoName', newPageMetadata.title); // TODO: 나중에 사용하는 곳 없어지면 제거
			if (self.historyList.includes(name) == false) {
				self.historyList.push(name);
			}

			// 기존 페이지, 현 페이지 정보 교체
			this.prevPageName = oldPageName
			this.prevPage = oldPage;
			this.prevPageObj = oldPageMetadata;
			this.prevPageKoName = oldPageMetadata ? oldPageMetadata.title : '';

			this.currPageName = name;
			this.currPage = newPage;
			this.currPageObj = newPageMetadata;
			this.currPageKoName = newPageMetadata.title;

			// 현재 페이지 내용 붙이고 초기화 작업
			var $oldPageContainer = getPageContainer(oldPageName);
			var $newPageContainer = $('#shell-main .panel-container').eq($oldPageContainer == null ? 0 : ($oldPageContainer.index() == 0 ? 1 : 0));
			var scrollTop = $(document).scrollTop();

			$newPageContainer.attr('data-name', name);
			this.writeHtml($newPageContainer, newPage.viewHtml);
			$newPageContainer.css('visibility', 'hidden').show(); // visible 상태여야 page.on() 에서 처리할 때 문제 발생 안함

			if (newPage.on(sfd.data.getValue('showPageOption') || null, pageReady) !== false) {
				// page.on()이 false 반환하는 경우에는 page에서 pageReady 호출하기를 기다리고,
				// false 를 반환하지 않으면 그냥 진행
				pageReady();
			}
			
			function pageReady() {
				self.initView($newPageContainer, 'page', name); // 공통 초기화 작업

				$newPageContainer.css('visibility', '');
				
				if (newPage.onViewReady) {
					newPage.onViewReady();
				}

				// 전환 애니메이션 공통 준비 작업
				if (sfd.env.deviceType == 'MO') {
					$('html,body').stop();  // page.on()에서 scrollTop() animation 있어서 중지시키고
					$(document).scrollTop(scrollTop);
	
					// 제목
					if (newPageMetadata.step == 0) {
						$('#shell-top>.shell-top-title').text(sfd.data.getValue('mainTitle'));
					} else {
						$('#shell-top>.shell-top-title').text(newPageMetadata.title);
					}
				}
	
				// 페이지 전환 애니메이션
				showPageTransitionHorizontal(oldPageName, name);
	
				// 마이다이렉트 처리
				if (sfd.data.dataObject.productPath == 'mydirect') {
					$('#baseMain').css('min-height', $(window).outerHeight() - ($('#baseFooter').outerHeight() + $('#baseHeader').outerHeight()) - 40 );
				}	
			}
		},

		/**
		 * Popup 열기 (프레임워크 내부 호출용임)
		 * @category Popup View
		 * @param {String} name 열려는 poup name
		 * @param {Object} options Popup 옵션
		 * @see
		 * 상품에서 사용할 때는 `sfd.core.showPopup()` 사용하세요.
		 */
		showPopup: function(name, options) {
			var currPopupName = this.getPopupName(); // 지금 열려있는 팝업
			var popup = this.getPopup(name);

			// options 정리
			options = (typeof options === 'function') ? { closeHandler: options } : (options || {});			
			if (isPopupAlert(name) || isPopupConfirm(name, options)) {				
				options.message = sfd.message.getMessage(options.message); // message가 메시지 코드인 경우 실제 메시지로 치환
			}

			if (isPopupConfirm(name, options)) {
				// Confirm 중복 확인
				if (this.isConfirmOpened) {
					sfd.warnLog('Confirm은 중복으로 열 수 없습니다. 코드를 확인해주세요.');
					return;
				}
			} else if (isPopupAlert(name, options)) {
				// Alert queue 처리
			
				// 최초 로딩 시점에 alert이 뜨는 경우(에러 등) 로딩 종료
				if (sfd.env.deviceType == 'PC' && $('#loading-start').isVisible()) {
					sfd.core.hideLoading('loading-start');
				}

				if (alertQueue.length == 0) {
					alertQueue.push({ name: name, options: options });
				} else {
					if (arguments[2] != 'queue') { // queue 에서 꺼낸거 진행 중일 때는 다시 queue에 추가하면 안됨
						var lastAlert = alertQueue[alertQueue.length - 1];
						if (options.message == lastAlert.options.message) { 
							// 동일한 메시지 Alert 중복으로 요청 들어온건 무시 
							// TODO: Mobile message 가 배열로 들어오는거 처리
							sfd.warnLog('동일한 메시지 Alert 무시');
						} else {
							alertQueue.push({ name: name, options: options });
						}
						return;
					}
				}
			}

			// 팝업 상태 확인
			if (popup) {
				// 로딩된 적이 있는 경우
				switch (popup.state) {
					case 'opening': // 열리는 중
						// 로딩 중인 팝업이랑 같은 팝업 또 요청 들어오면 무시 (더블클릭 등으로 중복호출 되는 경우 막음)
						sfd.warnLog('중복 팝업 호출 차단(opening)', name);
						return;
					case 'opened': // 열린 상태 (TODO: 이건 사용하는 쪽에서 닫고 열도록 하는 것이 맞는 것 같은데, 기존 코드가 있어서 일단 유지 njh)
						pendingPopup = { name: name, options: options }; // 다 닫히면 열리도록
						sfd.core.hidePopup(name); // 현재 열린 팝업 닫음
						return;
					case 'closing': // 닫히는 중
						if (isPopupAlert(name, options) == false) { // alert은 queue에서 처리됨
							pendingPopup = { name: name, options: options }; // 다 닫히면 열리도록
						}
						return;
				}
				popup.state = 'opening';
			} else {
				// 처음 로딩
				if (loadingPopupName == name) {
					// Popup module 로딩 중인 팝업 또 요청 들어오면 무시
					sfd.warnLog('중복 팝업 호출 차단(loading)', name);
					return;
				}
				loadingPopupName = name;
			}

			sfd.log('▨ ● ● showPopup', name, options);
			// <STRIP_WHEN_RELEASE
			{ // Coding Guide
				if (!sfd.utils.isUppercase(name.substr(0, 1))) {
					alert(name + ' 팝업의 첫 글자를 대문자로 수정해주세요.');
					return;
				}
				if (!options.focusButton) {
					sfd.warnLog('접근성처리: ' + name + ' 팝업오픈 옵션에 닫을때 포커스가 가야하는 객체를 넣어주세요.{ focusButton: jQuery 객체 또는 selector }');
				}
			}
			// STRIP_WHEN_RELEASE>

			// 팝업 여는 프로세스 진행 시작

			// 기본처리
			this.isPopupTransitioning = true;

			sfd.core.focusblur();			
			sfd.core.popoverAllClose();
			sfd.view.closeSecureKeypad();

			// onPopupWillShow
			sfd.view.$wrapper.trigger('sf.show-popup-start', { name: name });
			if (viewEvent('onPopupWillShow', null, name, { returnOnFalse: true }) === false) {
				this.isPopupTransitioning = false;
				loadingPopupName = null;
				if (popup) {
					popup.state = 'closed';
				}
				return;
			}

			// 상태 변수 업데이트
			this.currPopupName = name;
			sfd.data.setValue('_currentOpenPopup', name);
			if (isPopupConfirm(name, options)) {				
				this.isConfirmOpened = true;
			}
			
			// Popup module 로드
			loadPopup(name, options, function(popup) {
				loadingPopupName = null;
				sfd.core.hideLoading();

				if (popup) {
					// 로드 완료
					sfd.view.popupResource[name] = popup; // module caching 처리

					// 팝업 기본 세팅 및 초기화
					popup.state = 'opening';
					popup.ns = '#' + name;
					popup.moduleName = name;
					popup.initialization(sfd, options); // HTML 로드 등 처리 후 sfd.core.modalContentsLoaded() 호출
				} else {
					// 로드 실패

					// 상태 변수 원복
					self.isPopupTransitioning = false;
					self.currPopupName = currPopupName;
					sfd.data.setValue('_currentOpenPopup', currPopupName);
				}
			});		
		},

		/**
		 * Popup 닫기 (프레임워크 내부 호출용임)
		 * @category Popup View
		 * @param {String|Object} name 닫을 popup name 또는 popup 객체.
		 * @see
		 * 상품에서 사용할 때는 `sfd.core.hidePopup()` 사용하세요.
		 */
		hidePopup: function(name) {
			name = typeof name == 'string' ? name : name.moduleName;
			var popup = this.getPopup(name);
			if (popup.state != 'opened') {
				return;
			}
			popup.state = 'closing';
			this.isPopupTransitioning = true;

			var $popup = $('#' + popup.moduleName);

			// onPopupWillHide
			sfd.view.$wrapper.trigger('sf.hide-popup-start', { name: name });
			viewEvent('onPopupWillHide', popup, name);

			// 닫기 시작
			switch (popup.modalOption.opentype) {
				case 'slide': // PC 슬라이드 팝업
					// X 버튼 애니메이션
					$popup.find('.btn-popup-x').stop().animate({ opacity: 0, left: 0 }, 200);
					hidePopupTransition(popup);
					break;

				case 'full': // Mobile full 팝업
					hidePopupTransition(popup);
					break;

				default: // Alert 등 화면 중앙에 나오는 일반 팝업
					// X 버튼 애니메이션
					if (sfd.env.deviceType == 'PC') {
						$popup.find('.btn-popup-x').stop().animate({ opacity: 0, top: -50 }, 200);
					} else {
						$popup.find('.btn-popup-x').stop().animate({ opacity: 0 }, 200);
					}
					// Modal 닫기
					hidePopupTransition(popup);
					break;
			}
		},

		/**
		 * 지정한 요소에 HTML 세팅
		 * @category View
		 */
		writeHtml: function($el, html) {
			$el.html(html);
			/*var exclude = $el.find('.template[data-template-name]');
			if (exclude.length > 0) {
				exclude.html(exclude.html().replace(/{{/g, '{#{'));
			}
			$el.html(self.mustache.mappingHtml($el.html()));
			if (exclude.length > 0) {
				$el.html($el.html().replace(/{#{/g, '{{'));
			}*/
		},

		/**
		 * sfd.view.showStep() 로 변경됨. (deprecated)
		 * @category Step View
		 * @see
		 * [DevDocs > 컴포넌트/템플릿 > Step View](devdocs://path/docs/page/dev/component/?name=StepView) 참고
		 */
		showSubpage: function(container, index, animated, callback) {
			self.showStep(container, index, animated, callback, true);
		},

		/**
		 * 지정한 index의 Step View로 전환
		 * @category Step View
		 * @param {String|Object} container Step view container selector 또는 jQuery object.
		 * @param {Integer} index 보여줄 step index.
		 * @param {Boolean} [animated=true] 애니메이션 처리 여부.
		 * @param {Function} [callback] 완료 콜백 함수.
		 */
		showStep: function(container, index, animated, callback, _isLegacy) {
			if (animated === undefined) {
				animated = true;
			}
			if (typeof animated == 'function') {
				// animated 생략하고 callback을 지정한 경우
				animated = true;
				callback = animated;
			}

			var step = !_isLegacy ? '.step' : '.inframe-step';
			var contents = !_isLegacy ? '.step-contents' : '.visible-contents';

			// 페이지 스크롤(전체동의 등) 애니메이션 있으면 멈추고 진행 (안멈추면 이상한데로 튐)
			$('html, body').finish();

			var $container = typeof container == 'string' ? $(container) : container;
			var currIndex = parseInt($container.attr('data-step'), 10) || 0;
			var $currStep = $container.children(step).filter(':visible').eq(currIndex);
			var $nextStep = $container.children(step).filter(':visible').eq(index);
			var $currStepContent = $currStep.find(contents);
			var $nextStepContent = $nextStep.find(contents);
			var width = $currStep.outerWidth();
			var hasFixedBottom = (sfd.env.deviceType == 'MO' && sfd.data.getValue('productPath') != 'mydirect');

			if (currIndex == index) {
				animated = false;
			}

			// 변경될 step index를 container data-step 속성으로 저장해둠
			$container.attr('data-step', index);
			
			// 현재 보여주려는 컨텐츠 외에는 감춤
			$container.children(step).filter(':visible').each(function(i) {
				if (i != index && i != currIndex) {
					$(this).find(contents).hide();
					$(this).find('.btns-nextprev').hide();
				}
			});
			
			// 보여질 페이지 show 시키고 (지금은 안보이는 영역에)
			$nextStepContent.show();

			// 하단 fixed 이전/다음 버튼 감추고/보이고 (모바일만 해당)
			if (hasFixedBottom) {
				var $currStepBottom = $currStepContent.find('.btns-nextprev');
				// 닫히는 페이지는 하단 버튼 감추고
				if (index != currIndex) {
					if ($currStepBottom.css('position') == 'fixed') {
						var bottomHeight = 100; //$currStepBottom.outerHeight();
						$currStepBottom.css( { bottom: 0 } ).animate({ bottom: -bottomHeight }, 300, function() {
							$currStepBottom.hide();
						});
					}	
				}

				// 보여질 페이지 하단 버튼 일단 안보이게
				var $nextStepBottom = $nextStepContent.find('.btns-nextprev');
				$nextStepBottom.css({
					position: 'fixed',
					left: 0,
					bottom: -$nextStepBottom.outerHeight()
				}).show();
			}

			if (currIndex != index && sfd.env.deviceType == 'MO') {
				// 가려질 페이지 스크롤 없애고
				var isInPopup = $container.closest('.modal').length > 0;
				var containerOffsetTop = 0;
				var scrollTop = 0;

				if (isInPopup) {
					var $scrollContainer = $container.closest('.modal'); 
					containerOffsetTop = $scrollContainer.find('.modal-header').innerHeight();
					scrollTop = $scrollContainer.scrollTop();
					$scrollContainer.scrollTop(0);
				} else {
					var $scrollContainer = $(document);
					containerOffsetTop = $container.offset().top;
					scrollTop = $scrollContainer.scrollTop();
					$scrollContainer.scrollTop(0);
				}
				$currStep.css({
					overflow: 'hidden', 
					height: $(window).height() - containerOffsetTop,
					'padding-bottom': 200 // 스크롤 될수 있는 적당한 높이 추가
				}).scrollTop(scrollTop);
			}

			var transitionDone = function() {
				if (currIndex != index && sfd.env.deviceType == 'MO') {
					var attrs = {
						overflow: '',
						height: '',
						'padding-bottom': ''
					};
					// 감춰진 페이지는 스크롤 상단으로 올려놓고, css도 원복
					$currStep.css(attrs).scrollTop(0);
					$currStepContent.hide();
					
					$nextStep.css(attrs);
					if (sfd.env.os.group == 'iOS' && $currStepContent.closest('.modal-popup').length > 0) {
						// inframe-container 사용하는 구버전코드들 지원을 위해 일단 지우면 안됨
						if ($container.css('overflow-y') == 'hidden') {
							var minHeight = $(window).height() - containerOffsetTop; // 이거보다 작으면 아래 fixed 버튼들이 사라짐
							if ($nextStepContent.height() < minHeight) {
								$nextStepContent.css('min-height', $(window).height() - containerOffsetTop);
							}
						}
					}
				}

				// Mobile 하단 이전/다음 버튼 보이기
				if (hasFixedBottom) {
					var $nextStepBottom = $nextStepContent.find('.btns-nextprev');
					$nextStepBottom.animate({ bottom: 0 }, 300);
				}

				if (callback) {
					callback();
				}
			}
			
			// 전환 애니메이션
			if (animated) {
				var duration = 500;
				var delay = hasFixedBottom ? 300 : 0;
				$container.stop().delay(delay).animate({
					left: -width * index
				}, duration, 'easeOutExpo', transitionDone);		
			} else {
				$container.stop().css({ left: -width * index });
				transitionDone();
			}
		},

		/**
		 * 현재 보여지는 Step View의 step index 조회
		 * @category Step View
		 * @param {String|Object} container Step view container selector 또는 jQuery object.
		 * @return {Integer} 현재 보여지는 step index. 0부터 시작.
		 */
		getStepIndex: function(container) {
			var $container = $(container);
			return parseInt($container.attr('data-step') || '0', 10);
		},

		/**
		 * Page 메타정보 추가 (dataObject.pages 업데이트).
		 * @category Page View
		 * @param {Object} metadata 추가할 Page 메타정보.
		 * Key | Type | 설명
		 * ---|---|---
		 * type | String | "page"
		 * step | Integer | page step
		 * substep | Integer | page substep
		 * name | String | page 이름. 내부 코드에서 사용하는 영문 이름.
		 * title | String | page 제목. 화면 표시용 제목.
		 * product | String | 기본적으론 필요 없고, 공통 페이지인 경우 "common" 지정.
		 */
		addPage: function(metadata) {
			this.insertPage(metadata);
		},

		/**
		 * 원하는 index에 page 메타정보 삽입 (dataObject.pages 업데이트).
		 * @category Page View
		 * @param {Object} metadata 추가할 Page 메타정보. addPage() 설명 참고.
		 * @param {Integer} [index] dataObject.pages에서 추가할 위치 index. 지정 안하면 제일 뒤에 추가.
		 */
		insertPage: function(metadata, index) {
			if (index === undefined || index >= sfd.data.dataObject.pages.length) {
				sfd.data.dataObject.pages.push(metadata);
			} else {
				sfd.data.dataObject.pages.splice(index, 0, metadata);
			}
			self.updateAllResourceQueue();
		},

		/**
		 * 특정 page 앞에 page 메타정보 삽입 (dataObject.pages 업데이트).
		 * @category Page View
		 * @param {Object} metadata 추가할 page 메타정보. addPage() 설명 참고.
		 * @param {String} pageName 추가할 위치 뒤 page name.
		 */
		insertPageBefore: function(metadata, pageName) {
			var index = this.getPageIndex(pageName);
			this.insertPage(metadata, index);
		},

		/**
		 * 특정 page 뒤에 page 메타정보 삽입 (dataObject.pages 업데이트).
		 * @category Page View
		 * @param {Object} metadata 추가할 page 메타정보. addPage() 설명 참고.
		 * @param {String} pageName 추가할 위치 앞 page name.
		 */
		insertPageAfter: function(metadata, pageName) {
			var index = this.getPageIndex(pageName);
			this.insertPage(metadata, index + 1);
		},

		/**
		 * Page 메타정보 삭제 (dataObject.pages 업데이트).
		 * @category Page View
		 * @param {String} name 삭제하려는 page name.
		 * @return {Object} 삭제된 page 정보.
		 */
		removePage: function(name) {
			var result = null;
			var pages = sfd.data.getValue('pages');
			
			for (var i = 0; i < pages.length; i++) {
				if (pages[i].name == name) {
					result = pages[i];
					pages.splice(i, 1);
					break;
				}
			}
			self.updateAllResourceQueue();
			return result;
		},

		/**
		 * Page 메타정보 (name 지정 안하면 현재 page).
		 * @category Page View
		 * @param {String} [name] Page name. 지정 안하면 현재 page.
		 * @return {Object} Page 정보.
		 * Key | Type | 설명
		 * ---|---|---
		 * type | String | "page"
		 * step | Integer | page step
		 * substep | Integer | page substep
		 * name | String | page 이름. 내부 코드에서 사용하는 영문 이름.
		 * title | String | page 제목. 화면 표시용 제목.
		 * product | String | 기본적으론 필요 없고, 공통 페이지인 경우 "common" 지정.
		 */
		getPageMetadata: function(name) {
			name = name || this.getPageName();

			var result = null;
			if (!name) {
				return result;
			}

			var pages = sfd.data.getValue('pages');
			for (var i = 0; i < pages.length; i++) {
				if (pages[i].name == name) {
					result = pages[i];
					break;
				}
			}
			return result;
		},

		/**
		 * Page index (name 지정 안하면 현재 page).
		 * @category Page View
		 * @param {String} [name] Page name. 지정안하면 현재 page.
		 * @return {Integer} dataObject.pages에서의 index. name에 해당하는 page 없으면 -1.
		 */
		getPageIndex: function(name) {
			name = name || this.getPageName();

			var pages = sfd.data.getValue('pages');
			for (var i = 0; i < pages.length; i++) {
				if (pages[i].name == name) {
					return i;
				}
			}
			return -1;
		},

		/**
		 * 현재 보여지고 있는 page name.
		 * @category Page View
		 * @return {String} Page name
		 */
		getPageName: function() {
			return this.currPageName || '';
		},

		/**
		 * 현재 보여지고 있는 popup name.
		 * @category Popup View
		 * @return {String} Popup name. 보여지고 있는 Popup 없으면 null.
		 */
		getPopupName: function() {
			return this.currPopupName || null;
		},

		/**
		 * Page 객체 (name 지정 안하면 현재 page 객체).
		 * @category Page View
		 * @param {String} [name] Page name. 지정하지 안하면 현재 page.
		 * @return {Object} Page 객체. name 못찾거나 아직 로딩된 적이 없으면 null.
		 */
		getPage: function(name) {
			name = name || this.getPageName();
			if (!name) {
				return null;
			}

			return sfd.page[name] || null;
		},

		/**
		 * Popup 객체 (name 지정 안하면 현재 popup 객체).
		 * @category Popup View
		 * @param {String} [name] Popup name. 지정하지 않으면 현재 보여지는 popup.
		 * @return {Object} Popup 객체. name 못찾거나 아직 로딩된 적이 없으면 null.
		 */
		getPopup: function(name) {
			name = name || this.getPopupName();
			if (!name) {
				return null;
			}
			return this.popupResource[name] || null;
		},

		/**
		 * Module 객체.
		 * @category Module View
		 * @param {String} name Module name.
		 * @return {Object} Module 객체. name 못찾거나 아직 로딩된 적이 없으면 null.
		 */
		getModule: function(name) {
			if (!name) {
				return null;
			}
			return sfd.page[name] || null;
		},

		/**
		 * Page의 제목.
		 * @category Page View
		 * @param {String} [name] 제목 얻으려는 page name. 지정 안하면 현재 page.
		 * @return {String} Page 제목. page 못찾으면 빈 문자열 "".
		 */
		getPageTitle: function(name) {
			name = name || this.getPageName();

			var page = this.getPageMetadata(name);
			if (page) {
				return page.name;
			}
			return '';
		},

		/**
		 * Pages 메타정보 목록에 해당 페이지 존재여부
		 * @category Page View
		 * @param  {String}  name Page name 
		 * @return {Boolean} 있으면 true, 없으면 false.
		 */
		hasPage: function( name ) {
			var pageIndex = sfd.data.dataObject.pages.findIndex(function(page) {
				return page.name == name;
			});
			return pageIndex != -1;
		}, 

		/**
		 * Alias(next, prev, historyBack)에 해당하는 실제 page name.
		 * @category Page View
		 * @param {String} name "next", "prev", "historyBack"
		 * @return {String} Page name. 없으면 null.
		 */
		resolvePageName: function(name) {
			var result = null;
			if (['next', 'prev', 'historyBack'].includes(name) == false) {
				return name; // next, prev, historyBack 이 아니면 이름 그대로 반환
			}

			var pages = sfd.data.getValue('pages');
			var index;
			var currPageIndex = this.getPageIndex();
			
			if (currPageIndex == -1) {
				return null; // 현재 페이지가 없는 상태에서는 판단 불가
			}

			switch (name) {
				case 'next':
					index = currPageIndex + 1;
					
					if (index < pages.length) {
						result = pages[index].name;
						
					} else {
						// <STRIP_WHEN_RELEASE					
						sfd.errorLog('오류 : Page not exist');
						// STRIP_WHEN_RELEASE>
						result = null;
					}
					break;

				case 'prev':
					index = currPageIndex - 1;
					if (index >= 0) {
						result = pages[index].name;
					} else {
						// <STRIP_WHEN_RELEASE
						sfd.errorLog('오류 : Page not exist');
						// STRIP_WHEN_RELEASE>
						result = null;
					}
					break;

				case 'historyBack':
					if (self.historyList.length >= 2) {
					// TODO: 아래 코드 정리 필요. historyList를 변경하면 안되고 page name만 반환하도록..
						var nowIndex = self.historyList.indexOf(sfd.view.getPageName());
						self.historyList = self.historyList.slice(0, nowIndex);
						result = self.historyList[self.historyList.length - 1];
					} else {
						// <STRIP_WHEN_RELEASE
						sfd.errorLog('오류 : Page not exist');					
						// STRIP_WHEN_RELEASE>
						result = null;
					}				
					break;
			}
			return result;
		},
		/**
		 * Data Viewer
		 * @category 디버깅
		 * @return {Object} Data Viewer 객체.
		 */
		getDV: function() {
			if (dataviewer && dataviewer.isAvailable && dataviewer.isAvailable()) {
				return dataviewer;
			} 
			return null;
		},

		/**
		 * 전체 화면을 덮는 투명 덮개(클릭 방지) 보여줌 
		 * @category 유틸리티
		 * @param {Number} [inTime=0] 지정한 시간동안만 보여주고 싶은 경우 시간 지정.
		 */
		showAlphaBackdrop: function(inTime) {
			$('#shell-alpha-backdrop').css('display', 'block');
			if (inTime > 0) {
				setTimeout(function() {
					$('#shell-alpha-backdrop').css('display', 'none');
				}, inTime);
			}
		},
		/**
		 * 전체 화면을 덮는 투명 덮개(클릭 방지) 없앰
		 * @category 유틸리티
		 */
		hideAlphaBackdrop: function() {
			$('#shell-alpha-backdrop').css('display', 'none');
		},
		/**
		 * @category 안쓰임
		 * @param {*} inId 
		 */
		showFixedContainer: function(inId) {
			var _html = $(inId).html();
			$(inId).html('');
			$('#floting-bottom').html( _html );
			$('#floting-bottom').css('bottom', $(inId).height() * -1);
			$('#floting-bottom').animate({
				bottom: 0
			}, 300, 'linear');
			/*$(inId).css('display','none');
            setTimeout(function() {
                $(inId).slideDown();
            },300);*/
            
		},
		/**
		 * @category 안쓰임
		 * @param {*} inId 
		 */
		hideFixedContainer: function(inId) {
			// $(inId).slideUp();
			$('#floting-bottom').animate({
				bottom: $(inId).height() * -1
			}, 300, 'linear', function() {
				$('#floting-bottom').html('');
			});
		},
		/**
         * 벨리데이션 안내를 해야 하는 경우 호출
		 * @category 안쓰임
         * @param  {String}              el     대상객체의 ID
         * @param  {String}              msg    안내메세지 
         * @param  {Object}              option 추가 옵션
         * @return {void}                     
         */
		insertValidateMessage: function( el, msg, option) {
			var target = $(el);
			var guide = $('<small class="sfd-icon-x sf-validate-msg">' + sfd.message.getMessage(msg) + '</small>');
			target.on('mousedown', function(e) {
				if (guide) {
					guide.remove();
				}
			}).on('input', function(e) {
				if (guide) {
					guide.remove();
				}
			})
			// 가이드 dp여부
			if ( option && option.messageTarget ) {
				// 가이드 관련 타겟영역지정이 된 경우
				$(option.messageTarget).html(guide);
			} else {
				// 일반적 가이드는 해당 엘리먼트 아래
				target.after(guide);
			}
		},

		/**
		 * sfd.view.initView() 로 변경. (deprecated)
		 * @category View
		 */
		pageBasicQuery: function() {
			// <STRIP_WHEN_RELEASE
			alert('sfd.view.initView() 사용하세요.');
			// STRIP_WHEN_RELEASE>
		},

		/**
         * Page, popup 시작될때 호출됨. (view 기본 초기화 처리)
		 * @category View
         * @method initView
         * @param  {String} ns Page인 경우 "#panel-container0", Popup인 경우 popup name
         * @param  {String} type "page", "popup", ...
         * @param  {String} name Page인 경우 page name, Popup인 경우 popup name
         */
		initView: function(ns, type, name) {
			var $view = typeof ns == 'string' ? $(ns) : ns;
			ns = $view.attr('id');

			this.initContainer($view, type, name);
            
			if (sfd.core.pageBasicQuery) {
				sfd.core.pageBasicQuery(ns);
			}
		},

		/**
		 * 특정 container 영역 초기화 (container 안에 컨트롤 초기화 등)
		 * @category View
		 * @param {String|Object} container 초기화 작업을 할 container element selector 또는 jQuery object.
		 * @param {String} [type] container 종류. "panel": 페이지, "popup": 팝업
		 * @param {String} [name] container 이름이 있는 경우 지정.
		 * @see
		 * 기본적으로 page, popup 화면에 나올때 호출되서 처리되지만, 추가로 화면 구성 변경하거나 모듈 로드해서 보여주거나 할 때 해당 영역 초기화하기 위해서 사용.
		 * 
		 * 1. 보안키패드 scan
		 * 2. 근접도움말 처리
		 * 3. 스플렁크 로그 처리
		 * 4. Input 제한 처리
		 * 5. 접근성 처리
		 * 6. 기타 필요한 작업
		 */
		initContainer: function(container, type, name) {
			var deviceType = sfd.env.deviceType;
			var $container = typeof container == 'string' ? $(container) : container;

			// 보안키패드
			sfd.core.initSecureField();

			// moduleDevice에서 처리할 것 처리할 수 있도록
			if (sfd.core.moduleDevice && sfd.core.moduleDevice.onInitViewContainer) {
				sfd.core.moduleDevice.onInitViewContainer($container, type, name);
			}

			// 근접도움말
			$container.find('[data-toggle="popover"]').popover();

			// 스플렁크 로그
			// <STRIP_WHEN_RELEASE			
			// 로컬이면서 스플렁크체크모드인 경우 스플렁크 걸려있는지 체크해서 안내
			if (sfd.env.server == 'local' && sfd.data.getValue('modeSplunkchk') && sfd.env.os.group == 'Mac OS') {
				$container.find('*').each(function() {
					var $el = $(this);
                    
					if ($el.hasEvent('click') || $el.is('button')) {
						if ( !$el.attr('log-id') && !$el.attr('log-title') ) {
							sfd.log('check splunklog 로그누락(log-id,log-title) 대상객체 ID:' + $el.attr('id') + ', Class:' + $el.attr('class'));
						} else if ( !$el.attr('log-id') ) {
							sfd.log('check splunklog 로그누락(log-id) 대상객체 ID:' + $el.attr('id') + ', Class:' + $el.attr('class'));    
						} else if ( !$el.attr('log-title') ) {
							sfd.log('check splunklog 로그누락(log-title) 대상객체 ID:' + $el.attr('id') + ', Class:' + $el.attr('class'));
						}
					}
				});
			}
			// STRIP_WHEN_RELEASE>

			// $container.find('[log-id][log-entroll!="true"]').each(function() {
			// 	var $el = $(this);
			// 	// 로그 체크등록 추가
			// 	$el.attr('log-entroll', 'true');
			// 	$el.on('click', function(event) {
			// 		/*if (event.stopPropagation) {    // standard
			// 			event.stopPropagation();
			// 		} else {    // IE6-8
			// 			event.cancelBubble = true;
			// 		}*/
			// 		// sfd.log('check splunklog tmp1',event);
			// 		// sfd.log('check splunklog 대상객체 ID:'+$(event.currentTarget).attr('id')+', title:'+$(event.currentTarget).attr('class'));
			// 		sfd.tracker.eventLog({
			// 			'logType': 'button',
			// 			'code': $(event.currentTarget).attr('log-id'),
			// 			'description': $(event.currentTarget).attr('log-title')
			// 		});
			// 	});
			// });

			// Input restrict
			var validateInputValue = function(input, regex, event, keepCaretPosition) {
				if (keepCaretPosition === undefined) {
					keepCaretPosition = true;
				}

				var $input = $(input);
				var value = $input.val();
				if (regex.test(value)) {
					var selectionStart = input.selectionStart;
					// validated 된 값으로 세팅
					$input.val(value.replace(regex, ''));
					// 커서 위치 유지
					if (keepCaretPosition && selectionStart !== undefined) {
						selectionStart = Math.max(selectionStart - 1, 0);
						$input[0].setSelectionRange(selectionStart, selectionStart);
					}
				}
			}

			var $inputs = $container.find('input');
			$inputs.filter('.onlyEngNum').off( 'keyup.sfd.view' ).on( 'keyup.sfd.view', function(event) {
				validateInputValue(this, /[^a-z0-9]/gi, event);
			});     
			$inputs.filter('.onlyNum').off( 'keyup.sfd.view' ).on( 'keyup.sfd.view', function(event) {
				validateInputValue(this, /[^0-9]/gi, event);
			});
			$inputs.filter('.onlyEng').off( 'keyup.sfd.view' ).on( 'keyup.sfd.view', function(event) {
				validateInputValue(this, /[^a-z]/gi, event);
			});
			$inputs.filter('.onlyEngSpace').off( 'keyup.sfd.view' ).on( 'keyup.sfd.view', function(event) {
				validateInputValue(this, /[^a-zA-Z\s-]/gi, event);
			});
			$inputs.filter('.onlyEmail').off( 'keyup.sfd.view' ).on( 'keyup.sfd.view', function(event) {
				validateInputValue(this, /[^a-z0-9\.\-_]/gi, event);
			});

			var handlerName = 'keyup.sfd.view';
			$inputs.filter('.onlyHanNum').off( handlerName ).on( handlerName, function(event) {
				validateInputValue(this, /[^ㄱ-ㅎㅏ-ㅣ가-힣ㆍ0-9]/gi, event);
			});
			$inputs.filter('.onlyHanNumSpace').off( handlerName ).on( handlerName, function(event) {
				validateInputValue(this, /[a-zA-Z]/gi, event);
			});
			$inputs.filter('.onlyEngHanSpace').off( handlerName ).on( handlerName, function(event) {
				if (sfd.env.deviceType != 'MO') {
					validateInputValue(this, /[^a-zㄱ-ㅎㅏ-ㅣ가-힣ㆍ\s]/gi, event);
				}
			}).on( 'focusout.sfd.view', function(event) { // trim
				if (sfd.env.deviceType == 'MO') {
					validateInputValue(this, /[^a-zㄱ-ㅎㅏ-ㅣ가-힣ㆍ\s]/gi, event);
				}
				
				validateInputValue(this, /(^\s*)|(\s*$)/g, event, false);
			});


			self.binding.match('#' + name, null, true);
			// 웹접근성 모드에 대한 처리들 
			if (sfd.env.screenReader) {
				// 웹접근성 모드
				if (deviceType == 'PC') {
					setTimeout((function() {
						// 탭상세 콘텐츠에 타이틀 추가 
						$container.find('.nav.nav-tabs').each(function() {
							var $tabs = $(this);
							$tabs.find('a[role=tab]').each(function() {
								var $el = $(this);
								$('<h3 class="sr-only">탭 ' + $el.text() + '의 상세 내용입니다.</h3>').prependTo($('.tab-content #' + $el.attr('aria-controls')));
							});
						});

						$container.find('.btn.btn-next-step').css('cssText', 'background-color:#ff7800 !important;')
						$container.find('.section.page-title').each(function() {
							var $el = $(this);
							$el.replaceWith('<h1 class="' + $el.attr('class') + '">' + $el.html() + '</h1>');
						});
						$container.find('.page-title-sub01').each(function() {
							var $el = $(this);
							$el.replaceWith('<h2 class="' + $el.attr('class') + '">' + $el.html() + '</h1>');
						});                        
					})(), 300);

					$container.find('.sr-show').show();
					$container.find('.sr-hide').hide();
				}
			} else {
				// 일반 모드
				if (deviceType == 'PC') {
					// 스크린리더 모드에서 안보이는거 일반모드에서는 보이게
					$container.find('.sr-hide').show();

					// <STRIP_WHEN_RELEASE					
					if (sfd.env.server == 'local') {
						// 카드번호 1234-1234-1234-1234 포맷으로 입력되게 처리
						$container.find('.nos-input-card').off('input.sfd.view').on('input.sfd.view', function() {
							if (window.npPfsExtension) {
								$(this).val(sfd.utils.formatCardNo($(this).val()));
							} else {
								sfd.errorLog('window.npPfsExtension 정의가 안되어 있습니다.');
							}
						});
					}
					// STRIP_WHEN_RELEASE>
					
					// 주민등록번호 입력 처리
					$container.find('.form-ssnbox').each(function() {
						$(this).makeSSNboxForm();
					});
				} else {
					// Mobile

					// <STRIP_WHEN_RELEASE					
					if (sfd.env.server == 'local') {
						// 카드번호 1234-1234-1234-1234 포맷으로 입력되게 처리
						$container.find('.nos-input-card').off('input.sfd.view').on('input.sfd.view', function() {
							if (window.npPfsExtension) {
								$(this).val(sfd.utils.formatCardNo($(this).val()));
							} else {
								sfd.errorLog('window.npPfsExtension 정의가 안되어 있습니다.');
							}
						});
					}
					// STRIP_WHEN_RELEASE>
				}
			}
		},

		/**
         * 콤포넌트 정합성 검사 및 다음버튼 활성화 제어
		 * @category 안쓰임
         * @method checkValidateV
         * @param  {Array}        items       체크할 엘리먼트 리스트 
         * @param  {Boolean}      isGuide     메세지 가이드여부(true:안내메세지 false:최종정합성 결과만 리턴)
         * @return {Boolean}                  true:정합성통과 false:정합성오류
         */
		checkValidateV: function( items, isGuide, inCallback) {

			if (typeof items == 'string') {
				items = $(items);
			}
			// 대상 셀렉트
			// items = items.find(isGuide);

			// 최종 결과 저장
			var _checkValidateResult = true;

			// 대상이 없는경우 true리턴
			if (items.length == 0) {
 				return validateResult();
			}

            
			var validateCnt = 0;
			$.each(items, function(i, item) {
                
				var _tmpVal = null;
				var _item = $(this);// 객체 자신(자신이 그룹인경우도 존재)

				// <STRIP_WHEN_RELEASE 
				if (sfd.env.isDebug) {
					// 디버그용 객체 정합성 체크
					if ( !_item.attr('sf-validate-type') ) { 
						alert('debugMessage12201238 : \n ' + _item.attr('id') + '객체에 sf-validate-type을 정의하거나 validate항목에서 제거하세요.'); 
					}
					if ( !_item.attr('sf-validate-msg') ) { 
						alert('debugMessage12201238 : \n ' + _item.attr('id') + '객체에 sf-validate-msg을 정의하거나 validate항목에서 제거하세요.'); 
					}
				}
				// STRIP_WHEN_RELEASE>
				// _item.addClass('has-feedback has-error');
				// _item.after('<small>'+_item.attr('sf-validate-msg')+'</small>');
				var _typeInfo = _item.attr('sf-validate-type').split('#');
                
				var _type = (_typeInfo.length == 0) ? _typeInfo : _typeInfo[0];//_typeOri.match(/\w+/);
				var _ruleInfo = getRule(_typeInfo);

				// 옵션이 있는경우 파싱
				_tmpVal = _item.attr('sf-validate-area');
				var _area = _tmpVal || null;
				_tmpVal = null;
                
				var _group;
				if ( _type == 'radio' || _type == 'checkbox' ) {
					_group = _item;
				} else {
					_group = _item.closest('.form-group');
				}
                
                
				// .after('<span class="glyphicon glyphicon-remove form-control-feedback"></span>'); 
				// 에러클래스가 없거나 || 정합성이 실패인경우
				// alert( !elValidate( _group, _item, _type, _ruleInfo ) +','+ !_group.hasClass('has-error') );
				// 정합성 체크결과 
				var _elValidate = elValidate({
					group: _group, 
					item: _item, 
					type: _type, 
					ruleInfo: _ruleInfo, 
					area: _area
				} );
                
                
				// 하나의 정합성이라도 미통과면 전체 결과는 false 
				if ( !_elValidate ) {

					validateCnt++;
					_checkValidateResult = false;
					// check state - aleady error direction 
					if ( _group.hasClass('has-error') ) {
						return;
					}
					elValidateHandler( {
						group: _group, 
						item: _item, 
						type: _type, 
						ruleInfo: _ruleInfo, 
						area: _area
					} );
				}
                
				// 가이드 dp여부
				if ( isGuide && !_elValidate && !_group.hasClass('has-error') ) {

					if ( _area ) {
						// 가이드 관련 타겟영역지정이 된 경우
						$('#' + _area).html('<small class="sfd-icon-x sf-validate-msg">' + sfd.message.getMessage(_item.attr('sf-validate-msg')) + '</small>');
					} else {
						// 일반적 가이드는 해당 엘리먼트 아래
						_item.after('<small class="sfd-icon-x sf-validate-msg">' + sfd.message.getMessage(_item.attr('sf-validate-msg')) + '</small>');
					}
                    
					_group.addClass('has-error');
				} else {
					if ( _area ) {
						// 가이드 관련 타겟영역지정이 된 경우
						$('#' + _area).children('.sf-validate-msg').remove();
					} else {
						// 일반적 가이드는 해당 엘리먼트 아래
						_item.next('.sf-validate-msg').remove();
					}

					_group.removeClass('has-error');
				}
			});

            

			function getRule( inTypeInfo ) {
				// typeInfo의 형태는 배열 
				// [input]
				// [input,20]
				// [input,aaa]
				// [input,[a,b,c]]
				var _rule = (inTypeInfo.length < 2) ? null : inTypeInfo[1];
				// 룰이 없는경우 빈값체크룰 반환
				if ( _rule == null ) { 	
					return null; 
				}

				if ( String(_rule).substr(0, 1) == '[') { // 배열
					_rule = _rule.match(/[^\[\]]/);// []괄호제거
					_rule = _rule.split(',');
					return {
						type: 'array',
						value: _rule
					}
				} else if ( $.isNumeric(_rule) ) {
					return {
						type: 'number',
						value: _rule
					}
				} else { // number, string, boolean...
					return {
						type: $.type(_rule),
						value: _rule
					}
				}
			}

			// 해당객체, 상위그룹, 벨리데이션타입
			function elValidate( inOptions) {
                
				var _r = false;
				var _val;
				if ( inOptions.type == 'input' ) {
					_val = inOptions.item.val().length;
				} else if ( inOptions.type == 'radio' || inOptions.type == 'checkbox' ) {
					_val = sfd.core.elValue(inOptions.group);
				} else if ( inOptions.type == 'dropdown' ) {
					_val = sfd.core.elValue(inOptions.group);
				}

				// 룰이있으면
				if ( inOptions.ruleInfo ) {
					if ( inOptions.ruleInfo.type == 'number' ) {
						_r = ( _val >= inOptions.ruleInfo.value ) ? true : false;
					} else if ( inOptions.ruleInfo.type == 'string' ) {
						_r = ( _val == inOptions.ruleInfo.value ) ? true : false;
					} else if ( inOptions.ruleInfo.type == 'array' ) {
						$.each( inOptions.ruleInfo.value, function(i, item) {
							if (item == _val) {
								_r = true;
								return false;// each문 빠져나가기
							}
						});
					}
				} else {
					// 빈값체크
					_r = (_val) ? true : false;
				}
				return _r;
			}

			// 에러 안내하기
			function elValidateError( inOptions) {
				var _elValidate = elValidate(inOptions);
				// 가이드 dp여부
				if ( !_elValidate && !inOptions.group.hasClass('has-error') ) {
					// 가이드 관련 옵션이 있는경우 
					if ( inOptions.area ) {
						$('#' + inOptions.area).html('<small class="sfd-icon-x sf-validate-msg">' + inOptions.item.attr('sf-validate-msg') + '</small>');
					} else {
						inOptions.item.after('<small class="sfd-icon-x sf-validate-msg">' + inOptions.item.attr('sf-validate-msg') + '</small>');
					}
					inOptions.group.addClass('has-error');
				}
			}

			// 에러 안내를 없애기
			function elValidateSuccess( inOptions ) {
				validateCnt--;
				inOptions.group.removeClass('has-error');
				inOptions.group.addClass('has-success');
				if ( inOptions.area ) {
					$('#' + inOptions.area).children('.sf-validate-msg').remove();
				} else {
					inOptions.item.next('.sf-validate-msg').remove();
				}
                
				if (inCallback && validateCnt == 0) {
					inCallback(true);
				}
                
				// TODO:향후 해당 el에 걸린 input핸들러를 제거해야하는 이슈가 있다. 
			}

			// 가이드 핸들링
			function elValidateHandler( inOptions ) {
				if (inOptions.type == 'input') {
					inOptions.item.on('input', function(e) {
						if (elValidate(inOptions)) {
							elValidateSuccess(inOptions);
						} else {
							elValidateError(inOptions);
						}
					});
				} else if ( inOptions.type == 'radio' || inOptions.type == 'checkbox' ) {
					// _val = sfd.core.elValue(inOptions.group);
                    
					inOptions.group.change(function(e) {
                        
						if (elValidate(inOptions)) {
							elValidateSuccess(inOptions);
						} else {
							elValidateError(inOptions);
						}
					})
				} else if ( inOptions.type == 'dropdown' ) {
					// _val = sfd.core.elValue(inOptions.group);

					inOptions.group.change(function(e) {
						if (elValidate(inOptions)) {
							elValidateSuccess(inOptions);
						} else {
							elValidateError(inOptions);
						}
					})
				}
			}

			// 리턴 함수 
			function validateResult() {
				if (inCallback) {
					inCallback(_checkValidateResult);
				}
				return _checkValidateResult;
			}

			return validateResult();
		},
		/**
		 * @category 안쓰임
		 */
		pageValidate: function( ns, moduleName, type ) {
            
			// alert(ns+', '+module+', '+type);
            
			// 모듈 구분 저장 
			var _module = (type == 'panel') ? sfd.core.getPage(moduleName) : sfd.core.getPopup(moduleName);
            
			if (!_module) {
				return; 
			}

			// var _name = $('#' + moduleName + ' *[sf-validate-type]');







			return;
			// alert( ns+', '+module+', '+type );

			// // validation객체 추가 
			// _module.validate = {
			// 	checkNum: '', // 화면 로드당시 validate 체크객체 갯수 '' 인경우 페이지에서 validate-type사용안함(자체validate)
			// 	checkCnt: 0, // 화면 정상입력 체크 객체 갯수 
			// 	change: function() {
			// 		// this.trigger('sf.change-component');
			// 		if (_module.validate.changeComponent) {
			// 			_module.validate.changeComponent();
			// 		}
			// 	},
			// 	result: function() {

			// 		autoDispatch();

			// 		var _validateFilter = $('#' + module + ' *[sf-validate-type]').filter(function(index) {
			// 			// validate 실패 필터링
			// 			return $(this).attr('sf-validate-state') != 'true';
			// 		});
			// 		var _r = [];
			// 		$.each( _validateFilter, function(i, item) {
			// 			var _item = $(item);
			// 			// alert( _item.attr('sf-validate-msg') );
			// 			if (_item) {
			// 				_r.push({
			//					msg: _item.attr('sf-validate-msg'),
			//					target: _item.attr('id')
			// 				});
			// 			}
			// 		});
			// 		return _r;
			// 	}
			// };

			// var _name = $('#' + module + ' *[sf-validate-type=name]');
			// var _ssn1 = $('#' + module + ' *[sf-validate-type=ssn1]');
			// var _ssn2 = $('#' + module + ' *[sf-validate-type=ssn2]');

			// _name.on('input', function(e) {
			// 	var _val = $(this).val();
			// 	if ( _val.length >= 2) {
			// 		$(this).parent().addClass('has-success');
			// 		$(this).attr('sf-validate-state', 'true');
			// 	} else {
			// 		$(this).parent().removeClass('has-success');
			// 		$(this).attr('sf-validate-state', 'false');
			// 	}
			// 	_module.validate.change();
			// }).attr('sf-validate-state', 'none');

			// _ssn1.on('input', function(e) {
			// 	var _val = $(this).val();
			// 	if ( _val.length >= 6) {
			// 		$(this).parent().addClass('has-success');
			// 		$(this).attr('sf-validate-state', 'true');
			// 	} else {
			// 		$(this).parent().removeClass('has-success');
			// 		$(this).attr('sf-validate-state', 'false');
			// 	}
			// 	_module.validate.change();
			// }).attr('validate-state', 'none');

			// _ssn2.on('input', function(e) {
			// 	var _val = $(this).val();
			// 	if ( _val.length >= 7) {
			// 		$(this).parent().addClass('has-success');
			// 		$(this).attr('sf-validate-state', 'true');
			// 	} else {
			// 		$(this).parent().removeClass('has-success');
			// 		$(this).attr('sf-validate-state', 'false');
			// 	}
			// 	_module.validate.change();
			// }).attr('sf-validate-state', 'none'); 

			// // 화면의 체크할 validate object 갯수 
			// _module.validate.checkNum = _name.length + _ssn1.length + _ssn2.length;


			// // 자동입력인경우 체크를 못할 수 있으므로 자동 트리거 발생 
			// setTimeout(autoDispatch, 400);
			// function autoDispatch() {
			// 	$('#' + module + ' *[sf-alidate-type]').trigger('input');
			// }

		},
		/**
		 * 리소스 정보 배열 업데이트
		 * @category 리소스 관리
		 */
		updateAllResourceQueue: function() {
			var _p1 = sfd.data.dataObject.pages; // 로드할 페이지 리소스 리스트
			var _p2 = sfd.data.dataObject.pageModules; // 그밖의 페이지 리소스
			var _c = this.commonResource; // 로드할 공통 리소스 리스트
			var _c2 = (sfd.data.getValue('type') == 'DID') ? this.commonResourceDID : this.commonResourcePC;
            
			this.allResourceQueue = _p1.concat(_p2, _c, _c2);// 전체 리소스 
			this.openResourceQueue = _p2.concat(_c, _c2);// 오픈시점 로드 리소스 
		},
		/**
		 * 오픈 시점에 필요한 리소스 로드 시작
		 * @category 리소스 관리
		 */
		openResourceLoadStart: function() {
			self.updateAllResourceQueue();

			var _chkOverlapNameArr = []; // 로컬인경우 중복된 이름 찾아내기
			// 최초 로드 리소스가 없는 경우  
			if (self.openResourceQueue.length == 0) {
				sfd.core.openResourceAllLoaded();
			} else {
				$.each(self.openResourceQueue, function(i, item) {
					var _moduleName = item.name;
					// <STRIP_WHEN_RELEASE
					if (sfd.env.isDebug) {
						if (_chkOverlapNameArr.includes(_moduleName)) {
							alert('debugMessage1518 : \n"' + _moduleName + '" 페이지명은 공통모듈에서 사용하므로 \n중복사용 할 수 없습니다.\n변경 해주세요.\n\nex : ' + _moduleName + sfd.data.getValue('productPath'));
							return;
						}
						_chkOverlapNameArr.push(_moduleName);
					}
					// STRIP_WHEN_RELEASE>
					require([
						self.getResourcePath(_moduleName) + '.js?' + sfdCacheBust
					], function(loadContent) {
						loadContent.ns = '#' + _moduleName;
						loadContent.moduleName = _moduleName;
						loadContent.initialization(sfd);
						sfd.page[_moduleName] = loadContent;
					});
				});
			}
            
		},
		/**
		 * 오픈 시점에 필요한 리소스 로드 완료 갯수 업데이트
		 * @category 리소스 관리
		 * @param {String} inName 리소스 이름
		 */		
		updateLoadedOpenResourceCount: function(inName) {
			sfd.log('updateLoadedOpenResourceCount - Completed ' + inName);
			// 초기화 리소스 로드 완료 상태에선 더이상 할일 없음
			if (this.openResourceQueue.length == this.loadedOpenResourceCount) {
				return;
			}

			// 초기화 리소스인 경우
			var isOpenResource = !!this.openResourceQueue.find(function(resource) {
				return inName == resource.name;
			});

			if (isOpenResource) {
				this.loadedOpenResourceCount++;
				if (this.openResourceQueue.length == this.loadedOpenResourceCount) {
					sfd.core.openResourceAllLoaded();
				}
			}
		},
		/**
		 * Module View 로드 (JS/HTML)
		 * @category Module View
		 * @param {Object} options 옵션
		 * Key | Type | 설명
		 * ---|---|---
		 * **url** | String | 모듈 파일 경로. 확장자는 빼고 (ex: sfd.utils.joinPath(sfd.core.getCommonPath('device', 'resource'), 'ModuleCarSavedList'))
		 * moduleID | String | 모듈 ID. HTML에 {{ replaced-moduleID }} 있으면 이걸로 대치함. 동일한 Module View를 여러 ID로 사용 가능.
		 * name | String | 모듈 이름. 지정 안하면 url 에서 마지막 이름 부분을 사용함.
		 * container | String 또는 jQuery Object | 로드된 모듈 HTML을 이 conatiner에 넣음.
		 * onLoaded | Function | 로딩 완료되었을 때 콜백
		 * onLoadError | Function | HTML 로딩 실패 콜백
		 * onViewReady | Function | HTML 화면에 붙고, module.on() 호출되고, 기본 초기화 작업(initContainer)까지 완료된 후 호출
		 * onFinished | Function | 잘 모르겠음. "모듈에서 self.finish(리턴객체) 형태로 사용한다" 라고 되어 있음
		 * @example
		 *
		 * ```js
		 * sfd.view.loadModule({
         *   moduleID: 'ModuleID',
         *   url: sfd.utils.joinPath(sfd.core.getCommonPath('device', 'resource'), 'ModuleCarSavedList'),
		 *   container: $('#module-container'),
         *   onLoaded: function (module) {
         *     // 모듈 HTML: module.viewHtml
         *     // 다른 곳에서는 sfd.core.getModule(moduleID) 으로 접근 가능
         *   },
		 *   onViewReady: function(module) {
		 *     // 모듈 기본 초기화 완료됨 (module.on, initContainer() 완료)
		 *   },
         *   onLoadError: function (err) {
         *		// HTML 로딩 실패
         *   }
		 * });
		 * ```
		 */
		loadModule: function(options) {
			if (sfd.env.isDebug) {
				// <STRIP_WHEN_RELEASE				
				if (options.url.includes('.js')) {
					alert('debugMessage009295 : \n loadModule의 url에는 .js 확장자를 제외하고 써주세요.(공통에서 캐시방지 처리함)');
					return;
				}          
				if ( options.moduleID ) {
					if (!sfd.utils.isUppercase(options.moduleID.substr(0, 1))) {
						alert('debugMessage085535 : \n loadModule의 moduleID를 사용하실 경우 [ "' + options.moduleID + '" ]을 대문자로 시작해주세요.');
					}
					if (options.moduleID.includes('-') ) {
						alert('debugMessage085535 : \n loadModule의 moduleID를 사용하실 경우 [ "' + options.moduleID + '" ]에 하이픈(-)을 사용할 수 없어요( camelCase사용 )');
					}
				}      
				// STRIP_WHEN_RELEASE>
			}

			// 로드문제로 추가
			if (sfd.env.deviceType == 'MO') {
				sfd.core.showLoading();
			}

			var initModule = function(name, html, css) {
				var module = sfd.core.getModule(name);

				if (html) {
					if (css) {
						html = html.replace(/#replaced-requirecss/, css);
					}
					var replacedObject = { objName: name };
					module.viewHtml = replacedPropertyStr(html, replacedObject);
				}

				// 기존에 사용했었으니 cleanUp 한 번 하고 시작
				if (module._cleanUp) { 
					module._cleanUp();
				}

				// container 지정한 경우 container에 HTML 넣음.
				if (options.container) {
					var $container = typeof options.container == 'string' ? $(options.container) : options.container;
					self.writeHtml($container, module.viewHtml);
					// $container.html(module.viewHtml);
				}

				// 로드완료 callback 
				if (options.onLoaded) {
					options.onLoaded(module);
				}

				// View 초기화
				module.on();
				
				// $('#' + name).addClass('load-module');
				sfd.view.initContainer(module.ns, 'module', name);

				// 화면 초기화 작업 완료 callback
				if (options.onViewReady) {
					options.onViewReady(module);
				}

				// 모듈에서 self.finish(리턴객체) 형태로 사용한다
				if (options.onFinished) {
					module.finish = options.onFinished;
				}

				// 로드문제로 추가
				if (sfd.env.deviceType == 'MO') {
					sfd.core.hideLoading();
				}
			};

			var moduleName = options.name || options.url.split('/').pop();
			var moduleID = options.moduleID || moduleName;
			
			if (sfd.page[moduleID]) { 
				// 모듈이 존재하는 경우(기존모듈 재시작)
				initModule(moduleID, sfd.page[moduleID].viewHtml);

			} else { 
				// 모듈이 존재하지 않는 경우(로드)
				var sfdCacheBust = 'bust=' + (new Date()).getTime();
				var moduleURL = options.url + '.js?' + sfdCacheBust;
				var htmlURL = 'text!' + options.url + '.html?' + sfdCacheBust;
				var resources = [moduleURL, htmlURL];
				if (options.isExternalCSS) {
					resources.push('text!' + options.url + '.css?' + sfdCacheBust);
				}
				require(resources, function(loadContent, html, css) {
					sfd.view.checkModuleLoaded({
						moduleName: moduleName,
						moduleType: 'module',
						fileType: 'js',
						moduleContent: loadContent
					});
					loadContent.moduleName = moduleName;
					loadContent.ns = '#' + moduleID;
					loadContent.loadModuleVer = '2';
					loadContent.initialization(sfd);
					sfd.page[moduleID] = loadContent;

					initModule(moduleID, html, css);	
				});
			} 			
		},
		/**
		 * sfd.view.loadModule() 사용하세요. (deprecated)
		 * @category Module View
		 */
		loadModule2: function(options) {
			self.loadModule(options);
		},
		/**
		 * Module View 로드 Promise 버전
		 * @category Module View
		 * @param {Object} options 옵션
		 */
		loadModulePromise: function( options ) {
			var p = new promise.Promise();
			if ( !options ) {
				return p;
			}
			sfd.view.loadModule($.extend({
				onLoaded: function (module) {
					if (options.promiseOnLoaded) {
						options.promiseOnLoaded(module);
					}
					p.done(null);
				},
				onViewReady: function(module) {
					if (options.promiseOnViewReady) {
						options.promiseOnViewReady(module);
					}
					p.done(null);
				},
				onLoadError: function (err) {
					if (options.promiseOnLoadError) {
						options.promiseOnLoadError(err);
					}
					p.done(null);
				}
			}, options));
			return p;
		},
		/*
		 * 모듈로드 전 모듈 정보 체크
		 * @method checkModuleLoadStart
		 * @param  {Object}             info 로드 시작 모듈 정보 
		 * @return {void}                  
		 */
		/*checkModuleLoadStart: function( info ) {

		},*/
		/**
		 * 모듈로드 후 모듈 정보 체크 (스플렁크 로그 처리)
		 * @category 유틸리티
		 * @param  {Object} info 로드 완료 모듈 정보 
		 */
		checkModuleLoaded: function( info ) {
			var versionInfo = {};
			// 모듈의 버전정보 객체 체크 
			if ( info && info.moduleContent && info.moduleContent.version ) {
				versionInfo = info.moduleContent.version;
			}

			// 버전 저장 
			var modified = checkVersionStr(versionInfo.modified);
			var deploy = checkVersionStr(versionInfo.deploy);
			var hash = checkVersionStr(versionInfo.hash);
			var infoStr = 'FileVersion : ' + info.moduleType + '/' + info.moduleName + '.' + info.fileType + ' ( modified:' + modified + ' , deploy:' + deploy + ' , hash:' + hash + ' )';

			self.versions.push(info);

			// 스플렁크로그 호출 
			sfd.tracker.eventLog({
			    logType: 'etcLog',
			    code: infoStr,
			    description: info.moduleName + '.' + info.fileType
			});

			// 버전 string체크
			function checkVersionStr(str) {
				if ( !str || str.substr(0, 4) == '{ver' ) {
					return ''
				}
				return str;
			}
		},

		/**
		 * Page View 객체 로드 (deprecated)
		 * @category Page View
		 * @param {String} name Page name
		 * @see
		 * 첫번째 시도 실패하면 100ms 후에 두번째 시도하도록 되어 있음. (두번째도 실패하면 끝)
		 */
		loadPage: function(name) {
			var _moduleName = name;

			// 로드 시도횟수 처리 (첫번째 오류 발생한 경우 두번째 시도까지 하도록 처리)
			if (this.loadPage.tryCount == undefined) {
				this.loadPage.tryCount = {};
			}
			if (!this.loadPage.tryCount[name]) {
				this.loadPage.tryCount[name] = 1;
			} else {
				this.loadPage.tryCount[name] += 1;
			}
			var sfdCacheBust = 'bust=' + (new Date()).getTime();
			var modulePath = self.getResourcePath(_moduleName) + '.js?' + sfdCacheBust;
			require([modulePath], function(loadContent) {
				if (self.loadPage.tryCount[name] == undefined) {
					return; // 에러 후 재시도한 경우 여러차례 호출되서 막음
				}
				self.loadPage.tryCount[name] = undefined; // 시도횟수 초기화

				sfd.core.hideLoading();
				
				loadContent.ns = '#' + _moduleName;
				loadContent.moduleName = _moduleName;
				loadContent.initialization(sfd);
				sfd.view.checkModuleLoaded({
					moduleName: _moduleName,
					moduleType: 'panel',
					fileType: 'js',
					moduleContent: loadContent
				});

				sfd.page[_moduleName] = loadContent;

			}, function() {
				// 로드 에러 발생
				require.undef(modulePath); // 모듈 undef
				if (self.loadPage.tryCount[name] == 1) {
					// 첫번째 시도였으면 300ms 후 한 번 더 시도
					setTimeout(function() {
						sfd.log('loadPage("' + name + '") 2번째 시도');
						sfd.view.loadPage(name);
					}, 300);
				} else {
					// 두번째 시도도 실패
					self.loadPage.tryCount[name] = undefined; // 시도횟수 초기화

					self.isPageTransitioning = false;
				}
			});
		},

		/**
		 * Page View HTML 로드 완료시 호출
		 * @category Page View
		 * @param {String} inName Page name
		 */
		resourceChildLoadedInstant: function(inName) {
			sfd.log('resourceChildLoadedInstant ' + inName, loadingPageName);
			sfd.core.resourceChildLoaded(inName);
			// showPage 진행 중 패널을 로드한 경우이면
			if ( loadingPageName != '' && loadingPageName == inName) {
				self.changeView(inName);
			}
		},

		/**
		 * 페이지별 상품경로 반환
		 * @category 리소스 관리
		 * @param {String} inName 상품이름
		 * @return {String} 리소스가 있는 경우 해당 경로. 없는 경우 inName을 그대로 반환.
		 */
		getResourcePath: function(inName) {
			sfd.log('getResourcePath(' + inName);
			var _p = this.allResourceQueue;
			sfd.log('allResourceQueue', _p)

            
			for (var i = 0; i < _p.length; i++) {
				var _item = _p[i];
				if (_item.name == inName) {
					var _prd = (_item.product) ? _item.product : sfd.data.getValue('productPath');// 상품경로 지정이 있는경우 그 경로의 페이지 로드
					var _fileName = (_item.module) ? _item.module : _item.name;// module속성이 있는경우 그 모듈 파일 로드
					var _deviceType = (sfd.env.deviceType == 'MO') ? 'mobile' : 'pc';
					var _subPath = '';
					if (sfd.data.dataObject.productPath == 'mydirect') {
						if (_prd != 'common') {
 							_subPath = '/' + sfd.data.dataObject.subPath; 
						}
						if (_item.reSubPath) {
 							_subPath = '/' + _item.reSubPath;
 						}
						if (_item['case']) {
							sfd.data.setValue('case', _item['case']);
						}
					}
					// <STRIP_WHEN_RELEASE // 모바일 도큐먼트는 PC꺼 땡겨오기
					if (sfd.env.isDebug) {
						if (sfd.data.dataObject.divisionName == 'document' && sfd.env.deviceType == 'MO') {
							return '/ria/common/pc/product/' + _prd + '/' + _item.type + '/' + _fileName;
						}
					}
					// STRIP_WHEN_RELEASE>
					return '/ria/' + _deviceType + '/product/' + _prd + _subPath + '/' + _item.type + '/' + _fileName;
				}
			}


			// 리소스가 없는경우(모듈같은경우)들어온 값을 그냥 return;
			return inName;
		},
        
		/**
		 * 페이지별 상품경로 반환
		 * @category 유틸리티
		 * @param {String} inName HTML 리소스 이름
		 * @return 상품경로, 없는 경우 입력 inName 그대로 반환
		 */
		getHtmlResourcePath: function(inName) {
			sfd.log('getHtmlResourcePath(' + inName);
			var _p = this.allResourceQueue;
			sfd.log('allResourceQueue', _p)
			for (var i = 0; i < _p.length; i++) {
				var _item = _p[i];
				if (_item.name == inName) {
					var _prd = (_item.product) ? _item.product : sfd.data.getValue('productPath');// 상품경로 지정이 있는경우 그 경로의 페이지 로드
					var _fileName = (_item.template) ? _item.template : _item.name;// module속성이 있는경우 그 모듈 파일 로드
					var _deviceType = (sfd.env.deviceType == 'MO') ? 'mobile' : 'pc';
					var _subPath = '';
					if (sfd.data.dataObject.productPath == 'mydirect') {
						if ( _prd != 'common') {
							_subPath = '/' + sfd.data.dataObject.subPath;
						}
						if (_item.reSubPath) { 
							_subPath = '/' + _item.reSubPath;
 						}
						if (_item['case']) { 
							sfd.data.setValue('case', _item['case']);
 						}
					}
					// <STRIP_WHEN_RELEASE // 모바일 도큐먼트는 PC꺼 땡겨오기
					if (sfd.env.isDebug) {
						if (sfd.data.dataObject.divisionName == 'document' && sfd.env.deviceType == 'MO') {
							return '/ria/common/pc/product/' + _prd + '/' + _item.type + '/' + _fileName;
						}
					}
					// STRIP_WHEN_RELEASE>
					return '/ria/' + _deviceType + '/product/' + _prd + _subPath + '/' + _item.type + '/' + _fileName;
				}
			}

			// 리소스가 없는경우(모듈같은경우)들어온 값을 그냥 return;
			return inName;
		},
		/**
		 * Page View HTML 로드
		 * @category Page View
		 * @param {String} inName Page name
		 */
		loadResourceHtml: function(inName) {
			if (inName == '' || inName == 'PageBasic') {
				if (sfd.env.isDebug) {
					alert('debugMessage001 : \n새로 생성한 페이지의 JS에 pageName을 변경 안한 것 같아요.');
					return;
				}
			}
			var sfdCacheBust = 'bust=' + (new Date()).getTime();
			var _url = self.getHtmlResourcePath(inName) + '.html?' + sfdCacheBust;
			if (sfd.data.getValue('case')) {
				var _url = self.getHtmlResourcePath(inName) + '.html?' + sfdCacheBust + '&case=' + sfd.data.getValue('case')
			}
			// sfd.log('loadResourceHtml url=' + _url);
			// html load
            
			$.ajax({
				url: _url,
				dataType: 'text'
			}).done(function(data) {
				// replaced
				sfd.page[inName].viewHtml = replacedPropertyStr(data, { objName: inName });
                
				// nos초기화 인데 어설피 건들면 안되는 위치임
				// 아무때나 초기화 하면 안되고 1번이 로드 된 후 해야한다.
				// 그리고 한 번만 해야한다. isNppInit 변수로 이중 관리 되긴하지만 초기화 시점 중요 
				// 만약 다른 이름의 1번을 쓴다면 여기에 추가 
				// if ( [ 'Front', 'FrontCorp' ].includes(inName)) {
				// 	sfd.server.externalSolution.uiInit();
				// }
				if ( sfd.view.getPageIndex(inName) == 0 ) {
					sfd.server.externalSolution.uiInit();
				}

				self.resourceChildLoadedInstant(inName);
				self.updateLoadedOpenResourceCount(inName);

			}).fail(function(XHR, textStatus, errorThrown) {
				sfd.errorLog(XHR, textStatus, errorThrown, inName + ': load error');
				self.isPageTransitioning = false;

			}).always(function() {});
			// $('#page-loader').load(_url, function(response, status, xhr) {
			//     if (status == "error") {
			//         sfd.errorLog(inName + ': load error');
			//         return;
			//     }
                
			//     // replaced
			//     sfd.page[inName].viewHtml = sfd.utils.replacedPropertyStr(response, { 
			//         objName: inName
			//     });
                
			//     $('#page-loader').html('');
                
			//     // 리소스 카운팅 처리 및 상품 코어로 callback 
			//     /*if( sfd.data.dataObject.resourceLoadType == 'instant' ) {
			//         sfd.view.resourceChildLoadedInstant(inName);
			//     } else {
			//         sfd.view.openResourceChildLoaded(inName);
			//     }*/

			//     self.resourceChildLoadedInstant(inName);
			//     self.openResourceCount(inName);

                

			//     // sfd.view.resourceChildLoaded(inName);
			// });
		},

		/**
		 * 페이지에 출력할 notice 컨텐츠 영역 로드 (동일한 컨텐츠를 화면 여러곳에서 사용할경우..Beta 테스트중).
		 * @category View
		 * @param {String} inName 페이지 이름
		 * @return {Object} 페이지 object. 없는 경우 null.
		 */		
		loadNoticeContent: function(url, $target) {
			$.ajax({
				type: 'GET',
				url: url + '.html?' + sfdCacheBust,
				cache: false,
				async: false, //비동기 통신 여부 
				headers: { 
					'cache-control': 'no-cache', 
					'pragma': 'no-cache' 
				},
				error: function(request, status, err) {
					// 에러는 몰라 ;;;; 
				},
				success: function (result) {
					$target.append(result);
				}
			});
		},
        		
		/**
		 * Control의 값 얻기/설정하기. 이 함수 직접 사용하지 말고 `sfd.core.elValue()` 함수 사용해주세요.
		 * @category Control
		 * @param  {String|Object} el    대상객체 selector 또는 object.
		 * @param  {Any} [value] 설정할 값. (set으로 사용할 때만 지정)
		 * @param {Boolean} [triggerEvent=true] 이벤트 발생시킬지 여부. true면 el의 값이 변경되었을 경우 change 이벤트 발생시킴.
		 * @return {Any} get으로 사용할 때 control의 값 반환.
		 * @see
		 * 값 설정할 때 값이 기존 값과 다르면 change 이벤트가 발생하도록 되어 있으니 이 점 주의해서 사용.
		 */
		val: function(el, value, triggerEvent, data) {
			var $el;
			var type;

			if (typeof el == 'string') {
				if (el.startsWith('#') || el.startsWith('.')) {
					$el = $(el);
					type = $el.getControlType();
				} else {
					var $radio = $('input[type="radio"][name="' + el + '"]');
					if ($radio.length > 0) {
						// 라디오 이름인 경우
						$el = $radio;
						type = 'radio';
					} else {
						var $checkbox = $('input[type="checkbox"][name="' + el + '"]');
						if ($checkbox.length > 0) {
							// 체크박스 이름인 경우
							$el = $checkbox; //.closest('.btn-group,.btn-group-vertical');
							type = 'checkbox';
						} else {
							// 기타 나머지
							$el = $(el);
							type = $el.getControlType();
						}
					}
				}
			} else {
				$el = (el instanceof jQuery) ? el : $(el);
				type = $el.getControlType();
			}

			if (!type) {
				// type이 뭔지 모르는 경우 그냥 return
				return;
			}

			if (arguments.length == 1) {
				// GET
				return getControlValue($el.eq(0), type);
			} else if (arguments.length > 1) {
				// SET
				$el.each(function() {
					setControlValue($(this), type, value, triggerEvent, data);
				});
			}
		},	

		/**
		 * Alert
		 * @category 안쓰임
		 * @param {Object} result 옵션
		 */
		uiAlert: function(result) {
            
			if (result.type == 'popover') {

				if (result.target) {
					var _target = $(result.target);
					if (result.targetPaernt) {
						_target = _target.parent();
					}
					_target.focus();
					sfd.core.popover(_target, {
						'placement': result.placement,
						'content': result.alertMsg
					});
				}
			} else if (result.type == 'alert') {
				sfd.core.alert(result.alertMsg, {
					'closeHandler': function() {
						if (result.target) {
							$(result.target).focus();
						}
					}
				});
			} else if (result.type == 'underline') {
				if (result.target) {
					var _target = $(result.target);

					if (_target.next().hasClass('input-underline')) {
						_target.next().addClass('input-alert');
						_target.next().css('background-color', '#ff0000');
						if (!_target.next().next().hasClass('alert-direction')) { // 중복인서트 방지
							$('<div class="alert-direction info01-text">' + result.alertMsg + '</div>').insertAfter(_target.next());
						}

					}
				}
			}
		},
		/**
		 * Alert
		 * @category 안쓰임
		 * @param {Object} option 옵션
		 * @param {Object} result 옵션
		 */
		checkAlert: function(option, result) {
			if (option && option.isAlert) {
				if (result.type == 'popover') {
					if (result.target) {
						var _target = $(result.target);
						if (result.targetPaernt) {
							_target = _target.parent();
						}
						_target.focus();
						sfd.core.popover(_target, {
							'placement': result.placement,
							'content': result.alertMsg
						});
					}
				} else if (result.type == 'alert') {
					sfd.core.alert(result.alertMsg, {
						'closeHandler': function() {
							if (result.target) {
								$(result.target).focus();
							}
						}
					});
				} else if (result.type == 'underline') {
					if (result.target) {
						var _target = $(result.target);

						if (_target.next().hasClass('input-underline')) {
							_target.next().addClass('input-alert');
							_target.next().css('background-color', '#ff0000');
							if (!_target.next().next().hasClass('alert-direction')) { // 중복인서트 방지
								$('<div class="alert-direction info01-text">' + result.alertMsg + '</div>').insertAfter(_target.next());
							}

						}
					}
				}
			}
		},
		/**
		 * Dropdown 목록 변경. 이 함수 직접 사용하지 말고, sfd.core.makeDropdown() 사용
		 * @category Control
		 * @param {Object} options 변경 옵션. 자세한 내용은 sfd.core.updateDropdownList() 참고.
		 */
		updateDropdownList: function(options) {
			dropdown.updateList(options);			
		},
		/**
		 * Dropdown 생성. 이 함수 직접 사용하지 말고, sfd.core.makeDropdown() 사용
		 * @category Control
		 * @param options Dropdown 생성 옵션 (sfd.core.makeDropdown 참고)
		 * @return {Object} Dropdown container jQuery 객체.
		 */
		makeDropdown: function(options) {
			return dropdown.create(options);
		},
		/**
		 * Dropdown 옵션 변경 (현재는 defaultText만 지원)
		 * @category Control
		 * @param {Object} options Dropdown 옵션 (sfd.core.updateDropdown 참고)
		 */
		updateDropdown: function(options) {
			dropdown.update(options);
		},

		/**
         * Calendar 생성 함수
		 * @category Control
         * @method componentCalendar
         * @param {Object} opt 달력 옵션
		 * 옵션|타입|기본값|설명
		 * ---|---|---|---
         *   target|jQueryObject||target element 우측하단에 맞춰 Calendar 생성.
         *   selectDate|Date 또는 String||최초 선택 표시할 날짜.
         *   startDate|Date 또는 String||시작날짜. *종료일자 선택시에만 사용된다. 시작일 이전 날짜는 선택 막는다.
         *   [today]|Date 또는 String|new Date()|오늘날짜. 서버기준의 오늘날짜를 받아오기 위한 목적
         *   [minDate]|Date 또는 String|startDate 또는 today|최소선택가능날짜. 설정일 이전날짜는 선택 막는다.
         *   [maxDate]|Date 또는 String||최대선택가능날짜. 설정일 이후날짜는 선택 막는다.
         *   [isDouble]|Boolean|false|기본형 달력 또는 해외여행용(2개짜리)달력을 만들어준다.
         *   [callBack]|Function||날짜 선택시 콜백 설정. function(result) {} 형태이며, result = { date : {Date} , dateStr : {String} } 를 매개변수로 받는다.
        */
		componentCalendar: function (opt) {
			var options = $.extend({
				target: '',
				isDouble: false,
				today: new Date(),
				startDate: '',
				endDate: '',
				maxDate: '',
				minDate: '',
				selectDate: ''
			}, opt);
			var today;
			var isMobile = false;
			var dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'] ;
			var deviceType = sfd.env.deviceType;
			setOptions();

			// 다른 달력이 열려있을경우 그 달력 제거 
			if ($('.component-cal-container')[0]) {
				$('.component-cal-container').remove();
			}

			// 달력을 담을 요소
			var _container = $('<div class="component-cal-container"></div>');

			var displayDate = {
				year: options.minDate.getFullYear(),
				month: options.minDate.getMonth() + 1,
				date: options.minDate.getDate()
			}

			init( options );
			// 받은 옵션값 설정
			function setOptions() {
				var key;
				for ( key in options ) {
					if (options[key]) {
						switch (key) {
							case 'today':
								if (typeof options[key] == 'string') {
									options.today = stringToDate(options.today);
								}
								options.today = new Date( options.today.getFullYear(), options.today.getMonth(), options.today.getDate() );
								today = options.today;
								break;
							case 'startDate':
							case 'endDate':
							case 'selectDate':
							case 'minDate':
							case 'maxDate':
								if (typeof options[key] == 'string') {
									options[key] = stringToDate(options[key]);
								}
								break;
							default:
								break;
						}
					}
				}
				if (!options.minDate) {
					if (options.startDate) {
						options.minDate = options.startDate;
					} else {
						options.minDate = options.today;
					}
				}
			}
			// 기본 Css설정
			function setCss() {                    
				if (deviceType == 'PC') {
					// 날짜표시 input창의 우측끝부분에 달력의 위치를 맞춰준다.
					var width = $('.component-cal-frame').width();
					_container.css({
						'margin-left': options.target.cssWidth() - (width + 2),
						'width': width + 2 + 'px'
					} );
				} else {
					try {
						// 크롬/크로미움 꽤구버전 및 안드로이드 구버전(4.x), G7 등에서 화면 렌더링 제대로 안되는 문제 때문에 강제로 다시 그리게 해줌.
						var modalContent = $('#CommonCalendar .modal-content')[0];
						if (modalContent) {
							modalContent.style.display = 'none';
							modalContent.offsetHeight;
							modalContent.style.display = 'block';
						}
					} catch (e) {}
				}

			}

			// 날짜 설정
			function setDate() {
				var temp = [];
				// 끝나는 일자 선택할 경우
				if (options.startDate) {
					// 선택된 날이 있을 경우
					if (options.selectDate) {
						temp = options.selectDate;
						// 선택된 날짜가 없을 경우
					} else {
						temp = sfd.utils.dateAfterDays(options.startDate, 1);
					}
				} else if (options.selectDate) {
					// 시작 일자 선택할 경우
					temp = options.selectDate
				} else { 
					return; 
				}
				displayDate.year = temp.getFullYear();
				displayDate.month = temp.getMonth() + 1;
				displayDate.date = temp.getDate();
			}

			function monthYearChangeEvent(prevOrNext, type) {
				var _y;
				var _m;
				if (prevOrNext == 'prev') {
					if (type == 'year') {
						_y = displayDate.year - 1;
						_m = displayDate.month - 1;
					} else {
						_y = displayDate.year;
						_m = displayDate.month - 2;
					}
				} else {
					if (type == 'year') {
						_y = displayDate.year + 1;
						_m = displayDate.month - 1;
					} else {
						_y = displayDate.year;
						_m = displayDate.month;
					}
				}
				var temp  = new Date(_y, _m)
				if (prevOrNext == 'prev') {
					temp.moveToLastDayOfMonth()	;
					if (temp.compareTo(options.minDate) == -1) {
						return;
					}
				} else {
					if (options.maxDate && temp.compareTo(options.maxDate) == 1) {
						return;
					}
				}

				displayDate.year = temp.getFullYear();
				displayDate.month = temp.getMonth() + 1;
				// 이벤트 전파 방지
				if (event) {
					event.stopPropagation ? event.stopPropagation() : event.cancelBubble = true;
				}
				deleteCalendar();
				displayCalendar();
				setCss();
			}
			// 기존 달력 지우기
			function deleteCalendar() {
				_container.empty();
			}
			// 실제 달력 그리기
			function displayCalendar() {
				var year, month;
				// var date;
				var frame;

				// 기본달력
				year = displayDate.year;
				month = displayDate.month;
				// date = displayDate.date;
				frame = $('<div class="component-cal-frame"></div>');
				
                
				var firstDayOfWeek = new Date(year, month - 1, 1).getDay();
				var row = 6; // 달력의 행 갯수
				var htmlTop = '';
            
				if (deviceType == 'PC') {
					htmlTop =   '<div class="component-cal-top row-px">\
						<div class="calendar-top-mid">\
							<button type="button" class="btn-acc component-cal-previous-year col-px-23">이전년도 이동</button>\
							<button type="button" class="btn-acc component-cal-previous-month col-px-23">이전달 이동</button>\
							<span class="col-px-153">\
								<span class="cal-txt-year">' + year + '</span>년\
								<span class="cal-txt-month">' + month + '</span>월\
							</span>\
							<button type="button" class="btn-acc component-cal-next-month col-px-23">다음달 이동</button>\
							<button type="button" class="btn-acc component-cal-next-year col-px-23">다음년도 이동</button>\
						</div>\
                    </div>';
				} else {
					htmlTop = '<div class="component-cal-top row-px">\
						<div class="calendar-top-mid"> \
							<button type="button" class="component-cal-previous-year col-percent-9">이전년도 이동</button> \
							<button type="button" class="component-cal-previous-month col-percent-9">이전달 이동</button>\
							<span class="col-percent-64">\
								<span class="cal-txt-year">' + year + '</span>년 \
								<span class="cal-txt-month">' + month +  '</span>월\
							</span>\
							<button type="button" class="component-cal-next-month col-percent-9">다음달 이동</button>\
							<button type="button" class="component-cal-next-year col-percent-9">다음년도 이동</button> \
						</div>\
					</div>';
				}


				frame.append(htmlTop);
				_container.html(frame); 


				// 다음 / 이전버튼의 활성화 유무
				var _lastD = sfd.utils.daysInMonth(year, month);
				if (new Date(year - 1, month - 1, _lastD).compareTo(options.minDate) == -1) {
					$('.component-cal-previous-year').addClass('disabled')
				}
				if (new Date(year, month - 2, _lastD).compareTo(options.minDate) == -1) {
					$('.component-cal-previous-month').addClass('disabled')
				}
				if (new Date(year + 1, month - 1, 1).compareTo(options.maxDate) == 1) {
					$('.component-cal-next-year').addClass('disabled')
				}
				if (new Date(year, month, 1).compareTo(options.maxDate) == 1) {
					$('.component-cal-next-month').addClass('disabled')
				}

				
				var calendar = $('<table class = "component-cal-calendar"></table>');
				var tr = $('<tr class="component-cal-day-of-week"></tr>');
				var th = $('<th></th>');
				for (var i = 0; i < dayOfWeek.length; i++) {
					th = $('<th>' + dayOfWeek[i] + '</th>');
					tr.append(th);
				}
				calendar.append(tr);
				if (deviceType == 'MO') {
					tr = $('<tr><td colspan=7 style="height:0"><div class="component-cal-line"> </div></td></tr>');
					calendar.append(tr);
				}
				var tempDate = 1;
				var diffDate; // 현재 달 외의 일자
				var fullDate; // string형태로 val값에 집어넣는다 (선택시 쉽게 해당 일자를 가져오기위함)
				for (var i = 0; i < row; i++) {
					tr = $('<tr class = "component-cal-rows"></tr>');
					for (var ii = 0; ii < dayOfWeek.length; ii++) {
						if (i == 0 && ii < firstDayOfWeek) {
							// 현재 달의 이전 날짜
							diffDate = sfd.utils.daysInMonth(year, month - 1) - firstDayOfWeek + ii + 1;
							fullDate = new Date(year, month - 2, diffDate); 
							var td = $('<td class="component-cal-previous"> <button class="btn-acc component-cal-date">' + diffDate + '<span class="sr-only">일</span></button> </td>');
							td.find('.component-cal-date').data('date', fullDate);  
                                
							// 최소날짜( default : today )보다 작은날 || 최대날짜 보다 큰날 => 비활성화 
							if ( fullDate.compareTo(options.minDate) == -1 || (options.maxDate && fullDate.compareTo(options.maxDate) == 1)) {
								td.addClass('component-cal-disable');
							}
						} else if (tempDate > sfd.utils.daysInMonth(year, month)) {
							// 현재 달의 이후 날짜
							diffDate = tempDate - sfd.utils.daysInMonth(year, month) ;
							fullDate = new Date(year, month, diffDate) ; 
							td = $('<td class="component-cal-next"><button class="btn-acc component-cal-date">' + diffDate + '<span class="sr-only">일</span></button></td>');
							td.find('.component-cal-date').data('date', fullDate);  

							// 최소날짜( default : today )보다 작은날 || 최대날짜 보다 큰날 => 비활성화 
							if ( fullDate.compareTo(options.minDate) == -1 || (options.maxDate && fullDate.compareTo(options.maxDate) == 1)) {
								td.addClass('component-cal-disable');
							}
							tempDate++;
						} else {
							// 해당 월 실제 날짜
							// Date 형태로 각 날짜의 value값에 저장
							fullDate = new Date(year, month - 1, tempDate); 
							td = $('<td> <button class="btn-acc component-cal-date">' + tempDate + '<span class="sr-only">일</span></button></td>');
							td.find('.component-cal-date').data('date', fullDate);  
							// [공통] 오늘 날짜 표기
							if ( today.toDateString() == fullDate.toDateString() ) {
								td.find('.component-cal-date').addClass('component-cal-today');
							}
							
							// 시작하는 날 선택할 때 
							if ( !options.startDate ) {
								// 최소날짜( default : today )보다 작은날 || 최대날짜 보다 큰날 => 비활성화 
								if ( fullDate.compareTo(options.minDate) == -1 || (options.maxDate && fullDate.compareTo(options.maxDate) == 1)) {
									td.addClass('component-cal-disable').find('.component-cal-date').attr('aria-label', '선택불가 날짜');;
								}
								// 이전 선택날짜 있는경우
								if (options.selectDate) {
									// 선택한 날짜에 selectDate 추가
									if (fullDate.compareTo(options.selectDate) == 0 ) {
										td.find('.component-cal-date').addClass('component-cal-selectDate').find('.sr-only').text('일, 선택됨');
									}
								}
							} else if (options.startDate) {
								// 시작날짜 이전일 경우 || 최대날짜 보다 큰날 => 비활성화 
								if ( options.minDate >= fullDate || (options.maxDate && fullDate.compareTo(options.maxDate) == 1)) {
									td.addClass('component-cal-disable').find('.component-cal-date').attr('aria-label', '선택불가 날짜');
								}
								// 이전 선택날짜가 있는경우
								if (options.selectDate) {
									// 이전 선택날짜 표시
									if (options.selectDate.compareTo(fullDate) == 0 ) {
										td.find('.component-cal-date').addClass('component-cal-selectDate');
									}
								}
							}

							tempDate++;
						}
						// 공휴일 체크
						if (sfd.utils.isHoliday(fullDate.toString('yyyyMMdd'))) {
							td.find('.component-cal-date').addClass('component-cal-holiday');
						}
						// 주말 체크
						if (sfd.utils.isWeekend(fullDate.toString('yyyyMMdd'))) {
							td.find('.component-cal-date').addClass('component-cal-weekend');
						}
						tr.append(td);
					}
					calendar.append(tr);
				}
				frame.append(calendar);
				_container.append(frame);
				if ( options.isDouble && $('.component-cal-calendar').length == 1 ) {
					displayCalendar();
				}
                
			}
			// 선택한 날짜를 리턴해줌
			function selectDate( self ) {
				$('.component-cal-selectDate').removeClass('component-cal-selectDate');
				var selectDate = $(self).data('date');

				if (options.startDate && selectDate < options.startDate) {
					alert( options.startDate + '이후 날짜만 선택 가능' );
					return 
				}
				var result = {
					date: selectDate,
					dateStr: dateToString(selectDate)
				}
				if (deviceType == 'PC') {
					_container.remove();
				} else if (deviceType == 'MO') {
					options.selectDate = selectDate;
					setDate();
					deleteCalendar();
					displayCalendar();
				}
				/*
                {
                    date: new Date(),
                    dateStr: 'yyyyMMdd'
                }
                */
				return result;
			}

			function dateStringFormat( stringDate, separator ) {
				stringDate = stringDate.replace(/[^0-9]/g, '');
				stringDate = stringDate.replace(/(19|20)[0-9]{2}|[0-9]{2}(?=[0-9])/g, '$&' + separator);
				return stringDate;
			}
			// Date  -> 스트링으로 ('20180309')
			function dateToString( date ) {
				var year = date.getFullYear();
				var month = (date.getMonth() + 1).toString();
				var day = date.getDate().toString();
				if (month.length == 1) {
					month = '0' + month;
				}
				if (day.length == 1) {
					day = '0' + day;
				}
				var result = year + month + day;
				return result;
			}
			// 문자열  -> Date형식 ( new Date(2018,03,09) )
			function stringToDate( stringDate ) {
				stringDate = dateStringFormat(stringDate, '/');
				var dateArr = stringDate.split('/');
				var result = new Date(dateArr[0], Number(dateArr[1]) - 1, dateArr[2]);
				return result;
			}

			// 생성
			function init() {
				// 모바일일때
				if (deviceType == 'MO') {
					options.target = $('#inner-calendar-modal-body');
				};
				var target = options.target;
				if (deviceType == 'PC') {
					var targetOffset = target.offset();
					var targetTop = targetOffset.top + target.outerHeight();
					var targetLeft = targetOffset.left - $('#shell-comm-container').offset().left;
					_container.offset({'top': targetTop, 'left': targetLeft});
					// 위치선택
					$('#shell-comm-container').html(_container[0]);
				} else {
					target.html(_container[0]);
				}

				setDate();
				displayCalendar();
				setCss();
				$('button.component-cal-selectDate').focus();

				////////// 이벤트 리스너 ///////////
				// 이벤트 전파 방지
				if (!isMobile) {
					// pc일 경우에는 esc 누를시 달력 제거
					$(window).off('keyup.sfd.calendar').on('keyup.sfd.calendar', function(e) {
						if (e.keyCode == 27) {
							_container.remove();
							$(window).off('keyup.sfd.calendar');
						}
					});
				}
				// 기존 이벤트 삭제 (이벤트 중복 방지)
				_container.off('click');
				$('#wrapper').off('click.sfd.calendar');

				// 이벤트 새로 등록
				if (deviceType == 'PC') {
					$('#wrapper').on('click.sfd.calendar', function(e) {
						// 캘린더 또는 캘린더 Input 영역 외에 눌렸을 때만 닫기
						if (_container.find(e.target).length == 0 && target.is(e.target) == false && target.find(e.target).length == 0) {
							_container.remove();
						}
					});
				}
				_container.on('click', '.component-cal-next-year', function() {
					monthYearChangeEvent('next', 'year');
				}) 
				_container.on('click', '.component-cal-next-month', function() {
					monthYearChangeEvent('next', 'month');
				}) 
				_container.on('click', '.component-cal-previous-year', function() {
					monthYearChangeEvent('prev', 'year');
				}) 
				_container.on('click', '.component-cal-previous-month', function() {
					monthYearChangeEvent('prev', 'month');
				}) 
				_container.on('click', 'td:not(.component-cal-disable) button.component-cal-date', function() {
					if (options.callBack) {
						options.callBack(selectDate(this));
					} else {
						selectDate(this)
					}
				})

			}
		},
		// end componentCalendar
		/**
		 * 업로드 박스 생성
		 * @category Control
		 * @param {Object} $uploadBox jQuery object
		 * @param {*} rel 정보
		 */
		makePhotoUploadBox: function($uploadBox, rel ) {
			var _imageData;
			var _fileOrignInfo;
			var _smallImageData;
			var _fileState = 3;      // 1 : 이미지파일 등록 / 2: 썸네일만 등록 / 3: 등록안됨
			if (rel) {
				$uploadBox.data('rel', rel);
			}
			$uploadBox.find('.thumbnail-frame').on('dragover', function(e) {
				e.stopPropagation();
				e.preventDefault();
				$(this).css('background-color', '#7e8e9d');
			}).on('dragleave', function(e) {
				e.stopPropagation();
				e.preventDefault();
				$(this).css('background-color', '#f2f6fa');
			}).on('drop', function(e) {
				e.stopPropagation();
				e.preventDefault();
				$('.thumbnail-frame').css('background-color', '#f2f6fa');
				var fileList = e.originalEvent.target.files || e.originalEvent.dataTransfer.files;
				$uploadBox.find('.upload-image').files = fileList;
				_imageUpload(fileList);
			});
			$uploadBox.find('.magnify-preview').click(function(e) {
				sfd.core.showPopup('MagnifyPreview', {
					src: _smallImageData
				});
			});
			$uploadBox.find('.upload-image').on('change', function(e) {
				var fileList = e.originalEvent.target.files || e.originalEvent.dataTransfer.files;
				_imageUpload(fileList);
			})
			var _box = {  
				el: $uploadBox,   
				initImage: function() {
					_imageData = '';
					_fileOrignInfo = '';
					_smallImageData = '';
					_fileState = 3;
					if ($uploadBox.find('.img-preview').length == 0) {
						$uploadBox.find('.file-pic').text('파일 없음');
					} else {
						$uploadBox.find('.empty-text').show();
						$uploadBox.find('.magnify-preview').hide();
						$uploadBox.find('.img-preview').removeAttr('src');
					}

					
					$uploadBox.trigger('sf.change-file');
				},
				getImage: function() {
					return _imageData;
				},
				getImageInfo: function() {
					/*{
                        lastModified: 1524215270000,
                        name: "CarIndiH2004.jpg",
                        size: 418070,
                        type: "image/jpeg"
                    }*/
					return _fileOrignInfo;
				},
				// 서버에서 받은 이미지 세팅
				setImage: function(imgSrc) {  
					if ($uploadBox.find('.img-preview').length == 0) {
						$uploadBox.find('.file-pic').text(imgSrc);
					} else {
						_smallImageData = imgSrc;
						$uploadBox.find('.img-preview').attr('src', imgSrc);
						$uploadBox.find('.empty-text').hide();
						if (sfd.env.deviceType != 'MO') {
							$uploadBox.find('.magnify-preview').show();
						}
					}
					
					_imageData = '';
					_fileOrignInfo = '';
					_fileState = 2;
					$uploadBox.trigger('sf.change-file');
					moveUpImg();
				},
				getState: function() {
					return _fileState;
					/* {
                         isSelected:$uploadBox.find('.empty-text').isVisible()
                    }*/
				},
				getThumbnailSrc: function() {
					return $uploadBox.find('.img-preview').attr('src');
				},

				copyUploadImage: function(inImgData, fileOrignInfo) {
					// $uploadBox = inTarget;
					_imageData = inImgData;
					_fileOrignInfo = fileOrignInfo;
					thumbUp(inImgData);
				}
                
                
			}

			return _box;
			function _imageUpload(inFileList) {
				// 파일 검사
				if (inFileList[0] == undefined) {
					return;
				} else {
					// 타입검사
					var type = inFileList[0].type;
					if (type.search('pdf') != -1) {
						sfd.log('pdf 전용 로직');
					// } else if (type.search('image') == -1) {
					} else if (['png', 'bmp', 'gif', 'tif', 'tiff', 'jpg', 'jpeg'].indexOf(type.split('/')[1]) == -1) {
						sfd.core.alert('JPG, PNG 등 이미지 파일만 등록이 가능합니다.');
						return;
					}

					// 사이즈 검사 (10mb 제한)  // 128,828,129byte == 128mb
					var size = inFileList[0].size;
                   
					if (size > 10000000) {
						sfd.core.alert(sfd.message.getMessage('E4220'));                        
						return;
					}

					
				}
				_fileOrignInfo = inFileList;

				// 읽기
				var reader = new FileReader();
				reader.readAsDataURL(inFileList[0]);

				//로드 한 후
				reader.onload = function () {

					_imageData = reader.result;
					
					// 썸네일 창 있는지 없는지 여부 판별 (없다면 자녀사진등록)
					if ( $uploadBox.find('.img-preview').length == 0 ) {
						// 파일명만 적용
						$uploadBox.find('.file-pic').text(inFileList[0].name);
						_fileState = 1;
						$uploadBox.trigger('sf.change-file');
					} else {
						//썸네일 이미지 생성
						thumbUp(_imageData);
						_box.el.trigger('fileRegistered');// 파일 등록완료 
					}

				};
			}
            
			//썸네일 이미지 생성
			function thumbUp(inImgData) {
				var tempImage = new Image(); //drawImage 메서드에 넣기 위해 이미지 객체화
				tempImage.src = inImgData; //data-uri를 이미지 객체에 주입
				tempImage.onload = function () {
					//리사이즈를 위해 캔버스 객체 생성
					var canvas = document.createElement('canvas');
					var canvasContext = canvas.getContext('2d');
					canvasContext.imageSmoothingEnabled = true; // 큰 이미지를 축소하면 많이 깨져서 넣어봤는데 효과는 모르겠음...
					// 섬네일파일 크기 설정
					var _w = tempImage.width;
					var _h = tempImage.height;
					var _ratio = _w / _h;
					var _refV = 500;
					if (_ratio >= 1) {
						canvas.width = _refV;
						canvas.height = _refV / _ratio;
					} else {
						canvas.width = _refV * _ratio;
						canvas.height = _refV;
					}

					//이미지를 캔버스에 그리기
					canvasContext.drawImage(this, 0, 0, canvas.width, canvas.height);
					//캔버스에 그린 이미지를 다시 data-uri 형태로 변환
					_smallImageData = canvas.toDataURL('image/jpeg');

					//썸네일 이미지 보여주기
					// $uploadBox.find('.img-preview').src = oriImgDaga;
					$uploadBox.find('.img-preview').attr('src', _smallImageData);

					_fileState = 1;
					$uploadBox.trigger('sf.change-file');
					moveUpImg();
				};
			}

			function moveUpImg() {
				$uploadBox.find('.empty-text').hide();
				$uploadBox.find('.magnify-preview').show();
				$uploadBox.find('.img-preview').show()
				var _h = $uploadBox.find('.img-preview').height();
				$uploadBox.find('.img-preview').css('top', _h);
				$uploadBox.find('.img-preview').animate({'top': '0'});
			}
		},
		/**
		 * @category Control
		 * @param {*} $table 
		 */
		tableSortingFromIdx: function( $table ) {
			var _sortedList = [];
			var $sortItem = $table.find('.sort-item');

			// 해당 라인의 소팅
			$sortItem.each(function(i, item) {
				_sortedList.push( $(this).attr('idx') );
			});
			_sortedList.sort();
		
			// 순번 배열 저장
			var _elList = [];
			$.each(_sortedList, function(i, item) {
				_elList.push($table.find('[idx=' + item + ']'));
			});
			// 실제 돔 재배치
			$.each(_elList, function(i, item) {
				// $table.append(_elList[i]);
				$('.sort-container').append(_elList[i]);
			})
		},
		/**
		 * 
		 * @category Control
		 * @param {*} inId 
		 */
		makeSortTable: function(inId) {
			// btn-sort 와 sort-label의 갯수,인덱스는 맞아야 한다
			// <STRIP_WHEN_RELEASE 
			if ( sfd.env.isDebug ) {
				if ( $(inId + ' .btn-sort').length !=  $(inId + ' .sort-item').eq(0).find('.sort-label').length) {
					// alert('debugMessage03161224 : \n ' + '.btn-sort갯수(' + $(inId + ' .btn-sort').length + ')와 .sort-item갯수(' + $(inId + ' .sort-item').eq(0).find('.sort-label').length + ')가 동일해야 합니다.');
				}
			}
			// STRIP_WHEN_RELEASE>
			$(inId + ' .btn-sort').click(function(e) {
				// 헤더의 소팅할 인덱스 저장
				var _thIdx = $(inId + ' .btn-sort').index($(this));
				// 
				var _sortList = [];
				var _sortResult = [];
				// 해당 라인의 소팅
				$('.sort-item').each(function(i, item) {
					_sortList.push( $(this).find('.sort-label').eq(_thIdx).text() + '##' + digit3(i) );
				});

				if ($(this).children('.sfd-icon-down-dir').length == 1) {
					_sortList.sort();
					$(this).children('.sfd-icon-down-dir').addClass('sfd-icon-up-dir').removeClass('sfd-icon-down-dir');
				} else {
					_sortList.sort();
					_sortList.reverse();
					$(this).children('.sfd-icon-up-dir').addClass('sfd-icon-down-dir').removeClass('sfd-icon-up-dir');
				}

				// sorting결과의 index추출
				$.each(_sortList, function(i, item) {
					_sortResult.push(parseInt(item.substr(item.length - 3, 3)));
				})

				// 순번 배열 저장
				var _elList = [];
				$.each(_sortResult, function(i, item) {
					_elList.push($('.sort-item')[item]);
				});

				// 실제 돔 재배치
				$.each(_elList, function(i, item) {
					// _elList[i].attr('idx', i);// 인덱스 변경
					$('.sort-container').append(_elList[i]);
				})

				// 돔에 idx갱신
				$('.sort-item').each(function(i, item) {
					$(this).attr('idx', i);
				});

				$(inId).trigger('sf.sorting-complete')
			});

			function digit3(n) {
				if (n < 10) { 
					return '00' + String(n);
 				}
				if (n < 100) {
 					return '0' + String(n);
 				}
				return String(n);
			}

		},		
		/**
         * 기존 소스를 위해 남아있는 함수 (deprecated)
		 * @category 기타
         */
		keyboardControl: function( options ) {
			// 제거 
		},		
		popupResource: [], /// <Popup View> {Array} 팝업 리소스
	
		/**
		 * Popup HTML 로딩
		 * @category Popup View
		 * @param {Object} popup Popup 객체
		 * @param {Object} [options] 옵션
		 * 대부분의 일반적인 경우에는 options 지정할 필요 없음.
		 * Key | Type | 기본값 | 설명
		 * ---|---|---|---
		 * containerID | String | "shell-popup-PopupName" | Popup HTML 넣을 container 요소의 ID
		 * popupWrapper | String 또는 Object | "#shell-popup" | Popup container가 들어갈 popup warpper 의 jQuery 객체 또는 selector
		 * popupPath | String | "../common/popup" | HTML 파일 경로
		 * cache | Boolean | false | true로 지정하는 경우 최초에 한 번만 로딩하고 이후에는 viewHTML에 저장해뒀다가 꺼내서 사용함.
		 * onLoad | Function | HTML 로드 완료되서 container에 넣은 후 콜백(sfd.view.popupContentsLoaded() 호출되기 전). function($container, ready){}
		 * onError | Function | HTML 로드 실패한 경우 콜백.
		 * 
		 * @example
		 * ```js
		 * initialization: function(d, option) {
		 * 	sfd = d;
		 * 	self.option = option || {};
		 * 
		 * 	sfd.view.loadPopupHTML(self);
		 * }
		 * ```
		 * 
		 * onLoad에서 비동기 처리 이후에 진행 원하는 경우 false return 하고, 비동기 처리 완료됐을 때 ready(); 호출.
		 * ```js
		 * sfd.view.loadPopupHTML(self, {
		 * 	onLoad: function($container, ready) {
		 * 		$.ajax({
		 * 			url: 'test.jsp'
		 * 		}).done(function(response) {
		 * 			ready(); // HTML 로딩 완료 이후 처리 진행
		 * 		});
		 * 		return false; // 기본적으로 진행되는 HTML 로딩 완료 이후 처리 진행 막음
		 * 	}
		 * })
		 * ```
		 */
		loadPopupHTML: function(popup, options) {
			options = $.extend({
				containerID: '',
				popupWrapper: '#shell-popup',
				popupPath: null,
				cache: false,
				onLoad: null,
				onError: null
			}, options);

			var popupName = popup.moduleName;

			if (!options.containerID) {
				// 따로 containerID 지정하지 않았으면 기본 형태 사용
				options.containerID = 'shell-popup-' + popupName;
			}
			popup.containerID = options.containerID;
			popup.containerId = options.containerID; // 이건 확인 후에 필요없으면 제거

			options.popupPath = options.popupPath || '../common/popup';
			var htmlPath = sfd.utils.joinPath(options.popupPath, popupName + '.html', true);

			var $container = $('#' + options.containerID);
			if ($container.length == 0) {
				// HTML 넣을 container가 아직 없는 상태면 popupWrapper에 추가
				var $popupWrapper = $(options.popupWrapper);
				$popupWrapper.append('<div id="' + options.containerID + '"></div>');
				$container = $('#' + options.containerID);
			}

			var loadDone = function(response, status, xhr) {
				if (status == 'error') {
					// <STRIP_WHEN_RELEASE
					alert(htmlPath.replace(/\?bust=[0-9]+/, '') + ' 이 없나봐요');
					// STRIP_WHEN_RELEASE>

					if (options.onError) {
						options.onError();
					}
				} else {
					if (options.cache === true && response) {
						popup.viewHTML = response;
					}
				}

				var process = true;
				if (options.onLoad) {
					process = options.onLoad($container, function() {
						sfd.view.popupContentsLoaded(popup);
					}) !== false;
				}

				// HTML 로드 완료 이후 처리 진행
				if (process) {
					sfd.view.popupContentsLoaded(popup);
				}
			};

			// HTML 로드
			if (options.cache === true && popup.viewHTML) {
				// 저장해뒀던거 사용
				$container.html(popup.viewHTML);
				loadDone();
			} else {
				// 파일 로드
				$container.load(htmlPath, loadDone);
			}			
		},

		/**
		 * Popup HTML 로딩 완료
		 * @category Popup View
		 * @param {Object} popup Popup object
		 */
		popupContentsLoaded: function(popup) {
			popup.parentns = '#' + (popup.containerID || popup.containerId);
			var $container = $(popup.parentns);
			
			// HTML 정리
			var html = $container.html();
			if (html.length == 0) {
				// HTML 로드 실패
				popup.state = 'closing';
				// modal.result = null; // 기존 코드들 때문에 이거를 넣어야할지 말아야할지 애매함. njh
				hidePopupTransitionDone(popup);
				return;
			}
			html = replacedPropertyStr(html, { objName: popup.moduleName });
			$container.html(html);

			if (sfd.env.deviceType == 'MO' && popup.modalOption.opentype == 'full') { 
				// 모바일 .modal-header -> .modal-fixed-header로 내용 복사
				if (!sfd.env.screenReader) {
					var $modalFixedHeader = $container.find('.modal-fixed-header');
					var $modalHeader = $container.find('.modal-header');
					$modalFixedHeader.html($modalHeader.html());
				}
			}
	
			// Splunk 로그
			try {
				if (isPopupAlert(popup) || isPopupConfirm(popup)) {
					var message = Array.isArray(popup.option.message) ? popup.option.message.join(' ') : popup.option.message;
					message = message.replace(/(<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>)|(<\/[a-zA-Z]+>)/g, ''); // 태그 제거
					message = (message.length > 40) ? message.substr(0, 40) : message;
					// splunk
					sfd.tracker.eventLog({
						logType: 'alert',
						code: message,
						description: popup.moduleName
					});
				} else {
					// splunk
					var popupTitle = null;
					if (sfd.env.deviceType == 'PC') {
						var $title = $container.find('.modal-body .page-title-main');
						if ($title.length == 0) {
							$title = $container.find('#popup-title');
						}
						if ($title && $title.length > 0) {
							popupTitle = ($title.text() || '');
						}
					} else {
						popupTitle = ($container.find('.modal-header .title').text() || '');
					}
					if (popupTitle) {
						popupTitle = popupTitle.replace(/(\<br(\/| )?\>)|\n|\r|\t/g, ' ');
						popupTitle = popupTitle.replace(/ {2,}/g, ' ').trim();
						popupTitle = popupTitle.substr(0, 40).trim();
					}
					sfd.tracker.eventLog({
						logType: 'popup',
						code: popup.moduleName,
						description: popupTitle || popup.moduleName
					});
				}
			} catch (e) {
				sfd.errorLog('splunk log error', e);
			}
			
			var $modal = $container.find('.modal');
			$container.css('visibility', 'hidden');
			$modal.show(); // 이거 안해주면 깨지는 곳 생김

			// <STRIP_WHEN_RELEASE
			$(window).off('error.sfd-view-popup').on('error.sfd-view', function(e) {
				popup.state = 'closed';
				$modal.hide();
				$(window).off('error.sfd-view-popup');
			});
			// STRIP_WHEN_RELEASE>

			// Modal view 기본 작업
			if (popup.on(null, popupReady) !== false) {
				popupReady();
			}
			setTimeout(function() {
				if (popup.onLazy) {
					popup.onLazy(); // TODO: 이거 onShown으로 이전하던 처리 필요. by njh
				}
			}, 300);

			function popupReady() {
				// <STRIP_WHEN_RELEASE
				$(window).off('error.sfd-view-popup');
				// STRIP_WHEN_RELEASE>

				sfd.view.$wrapper.trigger('sf.popup-on');
				$container.css('visibility', '');

				sfd.view.initView($modal, 'popup', popup.moduleName);

				if (popup.onViewReady) {
					popup.onViewReady();
				}

				// Transition 애니메이션
				showPopupTransition(popup);
			}
		},

		/**
		 * Modal 팝업 종료, 컨테이너 종료 후 closeHandler 호출 (deprecated)
		 * @category Popup View
		 * @param {Object} popup 닫을 modal module
		 * @see
		 * 구코드들 지원을 위해 남겨둠.
		 */
		modalContainerHide: function(modal) {
			// onPopupWillHide
			viewEvent('onPopupWillHide', modal, modal.moduleName);

			hidePopupTransition(modal);
		},
		
		// 사용하는 곳 없어서 일단 주석처리
		// createElementPool: [], // {Array} 생성된 element들
		/*
		 * Element 생성
		 * @param {String} inTagName tag 이름
		 * @param {String} inTemplate 템플릿 string
		 * @param {Object} inOption 옵션. 현재는 옵션 없음.
		 */
		// createElement: function( inTagName, inTemplate, inOption ) {
		// 	var _templateStr = inTemplate.split('{{ replaced-content }}');
		// 	if (_templateStr.length < 2) {
		// 		alert(inTagName + 'custom tag에 {{ replaced-content }}를 설정 해주세요.');
		// 		return;
		// 	}
		// 	sfd.view.createElementPool.push({
		// 		name: inTagName,
		// 		order: 'front', // 시작태그
		// 		pattern: '<' + inTagName + '>',
		// 		template: _templateStr[0]
		// 	});
		// 	sfd.view.createElementPool.push({
		// 		name: inTagName,
		// 		order: 'end', // 종료태그
		// 		pattern: '</' + inTagName + '>',
		// 		template: _templateStr[1]
		// 	});
		// },
		/**
		 * 열려 있는 팝업이 있는지 여부
		 * @category Popup View
		 * @return {Boolean} 열린 팝업이 하나라도 있으면 true, 없으면 false.
		 */
		isPopupOpen: function() {
			var isOpen = false;
			if ($('#shell-popup .modal-dialog').length > 0) {
				isOpen = true;
			}
			return isOpen;
		},

		/**
		 * 현재 열려있는 팝업 목록 (deprecated)
		 * @category Popup View
		 * @return {Array} 열려있는 popup name 목록.
		 */
		getOpenPopupList: function() {
			return this.getOpenPopupNames();
		},

		/**
		 * 현재 열려있는 Popup name 목록 얻기
		 * @category Popup View
		 * @return {Array} 열려있는 popup name 목록.
		 */
		getOpenPopupNames: function() {
			var result = [];
			$('div[id^="shell-popup-"]').each(function(i, item) {
				result.push($(this).attr('id').replace(/shell-popup-/, ''));
			});
			return result;
		},

		/**
		 * sfd.core.initSecureField() 사용하세요. (deprecated)
		 * @category 보안키패드
		 */		
		npPScanField: function(id) {
			// <STRIP_WHEN_RELEASE
			if (sfd.env.server == 'local' ) {
				// 로컬에서는 아무것도 하지 않음
				return;
			}
			// ci 오토 테스트 지원 처리 
			if ( sfd.env.none2e ) {
				return;
			}
			// STRIP_WHEN_RELEASE>

			if (window.npPfsCtrl) {
				window.npPfsCtrl.RescanField();
			}
		},
		/**
		 * 풍선도움말
		 * @category Control
		 * @param {Object} options 옵션
		 * @example
		 * ```js
		 * sfd.view.bubble({
		 * 	target: $('.test-bubble'),
		 * 	content: '../common/help/ChildHSlim01.html',
		 * 	timer: 2000, // *optional
		 * 	position: {top: -50, left: 0}, // *optional
		 * 	hideTrigger: 'mousedown',
		 * 	clickHandler: function() {
		 * 		alert('clickHandler')
		 * 	}, // *optional
		 * 	hideHandler: function() {
		 * 		alert('hideHandler');	
		 * 	} // *optional
		 * });
		 * ```
		 */
		bubble: function(options) {
			// 전체 닫기 
			if ( options == 'hide' ) {
				$('.sfd-bubble').stop().animate({
					opacity: 0
				}, 150, 'easeInOutExpo', function() {
					$('.sfd-bubble').remove();
				});
				
				// 닫기 예약 타이머 종료
				clearTimeout(self.timeoutIdNum);

				return;
			}

			// 특정 객체 닫기 
			if (options.bubbleContent) {
				options.bubbleContent.stop().animate({
					opacity: 0
				}, 1500, 'easeInOutExpo', function() {
					options.bubbleContent.remove();
				});	
				return;
			}
			// 모션 시작위치
			var begin = options.begin || {x: 0, y: 20};
			var crank = {top: 0, left: 0};
			var $content;
			var targetPosition;
			var $target = $el(options.target);
			if ($target.length == 0) {
				// <STRIP_WHEN_RELEASE					
				sfd.core.alert('sfd.view.bubble() - target이 없어요');
				// STRIP_WHEN_RELEASE>
				return;
			}

			$.ajax({ type: 'GET',   
				url: options.content + '?bust=' + sfdCacheBust,   
				success: function(res) {
					$content = $(res);
	            	$content.addClass('sfd-bubble');

	            	$content.insertAfter( $target );
	            	targetPosition = $target.position();
	            	
	            	if (options.position) {
	            		crank = $.extend(crank, options.position);
	            	}
	            	$content.on('click', function(e) {
	            		if (options.clickHandler) {
	            			options.clickHandler(e);
	            		}
	            	});
	            	$content.css('left', targetPosition.left + crank.left + begin.x);
	            	$content.css('top', targetPosition.top + crank.top + begin.y);
	            	$content.stop().animate({
						opacity: 1,
						left: targetPosition.left + crank.left,
						top: targetPosition.top + crank.top
					}, 1500, 'easeInOutExpo');	
				}
			});
			if (options.timer) {
				self.timeoutIdNum = setTimeout(function() {
					$content.stop().animate({
						opacity: 0,
						left: targetPosition.left + crank.left + begin.x,
						top: targetPosition.top + crank.top + begin.y
					}, 1500, 'easeInOutExpo', function() {
						sfd.view.bubble('hide');
						if (options.timerHideHandler) {
	            			options.timerHideHandler(e);
	            		}
					});	
				}, options.timer);
			}
			function $el(el) {
				if (typeof el == 'string') {
					$el = $(el);
				} else {
					$el = (el instanceof jQuery) ? el : $(el);
				}
				return $el;
			}
		},

		/**
		 * 보안키패드 열려있는 상태인지 확인
		 * @category 보안키패드
		 * @return {Boolean} 열려있으면 true, 아니면 false.
		 */
		isSecureKeypadVisible: function() {
			return $('.nppfs-keypad:visible').length > 0;
		},

		/**
		 * 보안키패드 닫기
		 * @category 보안키패드
		 */
		closeSecureKeypad: function() {
			if (sfd.view.isSecureKeypadVisible() == false) {
				return;
			}

			if (!window.npVCtrl || !window.npVCtrl.closeAll) {
				return;
			}
			window.npVCtrl.closeAll();
		},

		// <STRIP_WHEN_RELEASE		
		/**
		 * 매크로 툴바 보이기
		 * @category 디버깅
		 */
		showMacroToolbar: function() {
			if (!sfd.debug.macro) {
				alert('지원하지 않는 기능입니다.');
			}
			sfd.debug.macro.showToolbar();
		},
		// STRIP_WHEN_RELEASE>
		/**
		 * Key/Data 바인딩 처리
		 * @category 유틸리티
		 */
		binding: {
			tickTime: 0,
			/**
			 * dataObject의 데이터 바인딩
			 * @method match
			 * @param  {String|Object}  [el]  바인딩컨테이너(빈값인경우 페이지 전체)
			 * @param  {Object}  [data=null]  merge data 또는 data.dataObject
			 * @param  {Boolean} [isForce]    강제실행여부
			 * @return {void}          
			 */
			match: function(el, data, isForce) {
				var gt = new Date().getTime();
				if ( !isForce && gt - self.binding.tickTime < 500) {
					return;
				}
				self.binding.tickTime = gt;

				// sfd.log('################# 바인딩 실행 테스트')
				var $el;
	
				if (!el) {
					$el = $('#wrapper');
				} else if (typeof el == 'object' && el.ns) {
					// require 오브젝트 
					$el = $(el.ns);
				} else if (typeof el == 'string') {
					// 셀렉터 스트링 
					if (el.startsWith('#') || el.startsWith('.')) {
						$el = $(el);
					} else {
						$el = $(el);
					}
				} else {
					// jQuery객체
					$el = (el instanceof jQuery) ? el : $(el);
				}

				var $elFind = $el.find('*[sfd-data]');
				$elFind.each(function() {
					var $this = $(this);
					var key = $this.attr('sfd-data');
					var value = (data && data[key]) || sfd.data.dataObject[key];
					// #
					if (key.substr(0, 1) == '@') {
						if (key.substr(1, 4) == 'sfd.' || key.substr(1, 5) == 'self.') {
							value = eval(key.substring(1));
						}
						
					} else {
						value = (value || '')
						
					}
					
					// value가 변경된 경우만 갱신 
					if ( $this.html() != value) {
						$this.html(value)
					}
					
				});
			}, 
			tick: function() {	
				setInterval(function() {
					self.binding.match();
				}, 4000);
			}
		},
		/**
		 * Key/Data 매핑 처리
		 * @category 유틸리티
		 */
		mustache: {
			/**
			 * 특정 컨테이너안의 mustache구문 맵핑 {{key}}
			 * @method mapping
			 * @param  {String|Object} el   치환컨테이너
			 * @param  {Object} [data=null]    merge data 혹은 data.dataObject
			 * @example
			 *```js
			 * sfd.view.mustache.mapping(self) // 패널,팝업 생성시 추가 데이터 맵핑 필요한 경우 
			 * sfd.view.mustache.mapping($('#id')) // 특정 컨테이너에 맵핑할 경우 
			 * ```
			 */
			mapping: function(el, data) {
				return;
				var $el;
	
				if (typeof el == 'object' && el.ns) {
					// require 오브젝트 
					$el = $(el.ns);
				} else if (typeof el == 'string') {
					// 셀렉터 스트링 
					if (el.startsWith('#') || el.startsWith('.')) {
						$el = $(el);
					} else {
						$el = $(el);
					}
				} else {
					// jQuery객체
					$el = (el instanceof jQuery) ? el : $(el);
				}

				$el.html(self.mustache.mappingHtml($el.html(), data));
			},
			/**
			 * HTML string의 mustache구문 맵핑
			 * @method mappingHtml
			 * @param  {[String]}     HTML 치환할 String
			 * @param  {[object]}     data merge data 혹은 data.dataObject 
			 * @return {[String]}     치환된 String
			 */
			mappingHtml: function(html, data) {
				// 데이터 지정 안한경우 기본 sfd.data.dataObject 
				data = $.extend(JSON.parse(JSON.stringify(sfd.data.dataObject)), data);
				// html에 있는 데이터만 필터링 
				var dataFilter = (function() {
					var result = {};
					var re = /{{([^{{}}]*)}}/g;
					var match = html.match(re);
					if (match) {
						for (var i = 0, max = match.length; i < max; i++) {
							var key = re.exec(match[i].match(re))[1].replace(/\s/g, '');
							if (key) {
								if ( key.substr(0, 1) == '#' ) {
									result[key] = data[key] || '{{' + key + '}}'
								} else {
									result[key] = data[key] || ''// 없는경우 빈값 
								}
							}
						}
					}
					return result;
				})();
				for (var key in dataFilter) {
					html = html.replace(new RegExp('{{\\s*' + key + '\\s*}}', 'g'), dataFilter[key]);
				}
				return html;
			}
		},
		
		end: ''

	};

	/**
	 * 모든 View 공통
	 * @class SFDView
	 */
	var SFDView = function(extend) {
		this.ns = '';
		this.moduleName = '';
		this._$view = null;

		$.extend(this, extend);
	}

	SFDView.prototype = {		
		$: function(selector) {
			if (!this.ns) {
				return $();
			}
		
			if (!this._$view || this._$view.length == 0) {
				this._$view = $(this.ns);
				if (this._$view.length == 0) {
					this._$view = null;
					return $();
				}
			}
			return selector ? this._$view.find(selector) : this._$view;
		},
		
		_cleanUp: function() {
			this._$view = null;
		}
	}
	window.SFDView = SFDView;

	/**
	 * PageView 기본 클래스
	 * @class SFDPageView
	 */
	var SFDPageView = function(extend) {
		SFDView.call(this, extend);
	}

	SFDPageView.prototype = $.extend({

	}, SFDView.prototype);

	window.SFDPageView = SFDPageView;

	/**
	 * PopupView 기본 클래스
	 * @class SFDPopupView
	 */
	var SFDPopupView = function(extend) {
		SFDView.call(this, extend);
		
		this.isLoaded = false;
	}

	SFDPopupView.prototype = $.extend({
		
	}, SFDView.prototype);

	window.SFDPopupView = SFDPopupView;

	/**
	 * ModuleView 기본 클래스
	 * @class SFDModuleView
	 */
	var SFDModuleView = function(extend) {
		SFDView.call(this, extend);
	}

	SFDModuleView.prototype = $.extend({

	}, SFDView.prototype);

	window.SFDModuleView = SFDModuleView;
	/// @endclass

	$.extend(self, sfdControls);

	/**
	 * Dropdown 모듈
	 * @category Control
	 */
	var dropdown = {
		/**
		 * Dropdown 생성
		 */
		create: function(options) {
			function hasSelfInput(options) {
				var result = options.type == 'selfInput';
				if (!result && options.items) {
					result = options.items.filter(function(item) {
						return item.displayType == 'selfInput'
					}).length > 0;
				}
				return result;
			}

			options = $.extend({
				title: '',
				defaultText: '선택',
				placement: 'down',
				version: 2
			}, options);

			// 기존 코드 호환성 위해서 dataList, targetId 확인
			if (options.dataList && !options.items) {
				// <STRIP_WHEN_RELEASE
				sfd.warnLog('dataList 대신에 items로 사용해주세요.');
				// STRIP_WHEN_RELEASE>
				options.items = options.dataList;
				try {
					delete options.dataList;
				} catch (e) {
					options.dataList = undefined;
				}
			}
			if (options.targetId) {
				// <STRIP_WHEN_RELEASE
				sfd.warnLog('targetId 대신에 target 으로 사용해주세요.');
				// STRIP_WHEN_RELEASE>
				options.target = options.targetId;
				try {
					delete options.targetId;
				} catch (e) {
					options.targetId = undefined;
				}
			}

			var deviceType = sfd.env.deviceType;
			var target = options.target;
			var $dropdown = (target instanceof jQuery) ? target : $(target);

			
			var defaultText = options.defaultText;
			
			// Dropdown Button 생성
			// 버튼
			var $button = $('<button type="button" class="btn btn-adropdown dropdown-toggle left" role="combobox" data-toggle="dropdown"><span class="label"></span><span class="combo-caret"></span></button>');
			$button.css('width', options.width);
			$button.attr({
				id: $dropdown.attr('id') + '-inbtn'
			});
			if (options.title) {
				$button.attr('title', options.title);
			}
			$button.find('.label').html(defaultText);
			// 메뉴
			var $menu = $('<ul class="dropdown-menu scrollable-menu overflow_scrollable overflow-scrollable" role="menu"></ul>');
			$menu.css({
				'min-width': options.width,
				'max-height': options.height
			});

			var $buttonWrapper = $('<div class="btn-group"></div>');
			$buttonWrapper.append($button);
			$buttonWrapper.append($menu);

			if (deviceType == 'MO') {
				$buttonWrapper.addClass('device-mobile');
			}
			if (options.width == '100%') {
				$buttonWrapper.addClass('btn-block');
			}
			$dropdown.html($buttonWrapper);

			// placement가 top이면
			if (options.placement == 'top') {
				$buttonWrapper.wrap('<div class="dropup"></div>');
			}
			
			$dropdown.data('dropdown.options', options); // 옵션 저장
			if (options.version == 2 || deviceType == 'MO') {
				$button.removeAttr('data-toggle');
			}
			$button.data('oriHeight', ($button.innerHeight() < 0) ? 19 : $button.innerHeight());

			// 직접입력 필요한 경우 buttonWrapper 앞에 붙임
			if (hasSelfInput(options)) {
				var widthSize = (options.width - 30) + 'px';
				var $selfInput = $('<div class="form-group user-self-input" style="display:none;position:absolute;z-index:230;"></div>');
				$selfInput.append('<input type="text" name="user-self" class="form-control user-self" title="직접입력" autocomplete="off" placeholder="직접입력" style="width:100%;">');
				$selfInput.append('<div class="input-underline"></div>');

				$selfInput.css('width', widthSize);
				$buttonWrapper.before($selfInput);
			}

			// 목록 업데이트 
			dropdown.updateList(options);

			if (deviceType == 'MO') {
				// Mobile 추가 설정

				// 직접입력 박스 가로크기 조정
				$dropdown.css('position', 'relative');
				var $selfInput = $dropdown.find('.user-self-input');
				$selfInput.css({
					width: 'Calc(100% - 30px)',
					'z-index': '100'
				});
				$button.addClass('form-control');
				$button.removeClass('btn');

			} else if (deviceType == 'PC') {
				// PC 추가 설정

				// Dropdown 메뉴 열렸을 때 이벤트 연결
				$dropdown.off('shown.bs.dropdown.sfd').on('shown.bs.dropdown.sfd', dropdown.events.menuShown);

				// 키보드 이벤트
				$button.off('keydown.sfd.dropdown').on('keydown.sfd.dropdown', function(event) {					
					if (event.keyCode == 38/*Up*/ || event.keyCode == 40/*Down*/) {
						event.preventDefault ? event.preventDefault() : (event.returnValue = false);
						$button.trigger('click');
					}
				});
			}
			$button.off('click.sfd.view').on('click.sfd.view', dropdown.events.dropdownButtonClick);

			return $dropdown;
		},

		/**
		 * Dropdown 항목 업데이트
		 */
		updateList: function(options) {
			options = $.extend({
				updateValue: true
			}, options);

			// 기존 코드 호환성 위해서 dataList, targetId 확인
			if (options.dataList && !options.items) {
				// <STRIP_WHEN_RELEASE
				sfd.warnLog('dataList 대신에 items로 사용해주세요.');
				// STRIP_WHEN_RELEASE>
				options.items = options.dataList;
				try {
					delete options.dataList;
				} catch (e) {
					options.dataList = undefined;
				}
			}
			if (options.targetId) {
				// <STRIP_WHEN_RELEASE
				sfd.warnLog('targetId 대신에 target 으로 사용해주세요.');
				// STRIP_WHEN_RELEASE>
				options.target = options.targetId;
				try {
					delete options.targetId;
				} catch (e) {
					options.targetId = undefined;
				}
			}

			var target = options.target;
			var items = options.items;

			var $dropdown = (target instanceof jQuery) ? target : $(target);
			var $button = $dropdown.find('.dropdown-toggle');

			if (!items || items.length == 0) {
				sfd.log('ID:' + $dropdown.attr('id') + '의 data가 비어있습니다.');
			}
			
			// 업데이트된 options container에 저장
			var savedOptions = $dropdown.data('dropdown.options');
			if (!savedOptions) {
				// <STRIP_WHEN_RELEASE
				sfd.warnLog('Dropdown: sfd.core.makeDropdown() 먼저 해주세요. (#' + $dropdown.attr('id') + ')');
				// STRIP_WHEN_RELEASE>
				return;
			}
			savedOptions = $.extend(savedOptions, options);
			$dropdown.data('dropdown.options', savedOptions); 

			// 입력받은 items로 선택 목록 구성
			var $menu = $dropdown.find('.dropdown-menu');

			var oldValue = $dropdown.prop('optionValue');
			var foundOldValue = false;
			
			var list = items.map(function(item) {
				var value = String(item.value);
				var optionType = item.displayType || '';
				var restrictClass = item.restrictClass || '';

				// li 만들고
				var $li = $('<li><a href="#shell" log-id="dropdown-item">' + item.label + '</a></li>');

				// li 속성 및 값 설정하고
				$li.attr({
					'data-value': value,
					'data-option-type': optionType,
					'data-option-restrict': restrictClass
				}).prop('label', item.label);

				// 구분선이면 divider class 넣고
				if (value == 'divider') {
					$li.addClass('divider');
				}
                
				if (value == oldValue) {
					foundOldValue = true;
				}
				return $li;
			});
			$menu.html(list);

			if (options.updateValue == true) {
				// 기존에 만들어져있던 Dropdown 업데이트하는 경우, 새 목록에 선택된 값이 없으면 reset
				if (oldValue && foundOldValue == false) {
					$dropdown.prop({
						value: '',
						label: '',
						optionType: null,
						optionValue: null
					});
					var defaultText = savedOptions.defaultText || '선택';
					$button.find('.label').html(defaultText);
				}
			}

			if (sfd.env.deviceType == 'PC') {
				// 선택 목록 click 이벤트 처리
				$menu.find('li a').off('click.sfd.view').on('click.sfd.view', dropdown.events.itemClick);
			}
		},
		/// 옵션 변경 (일단 defaultText만 지원)
		update: function(options) {
			var target = options.target;
			var $dropdown = (target instanceof jQuery) ? target : $(target);

			if (options.defaultText) {

				var savedOptions = $dropdown.data('dropdown.options');
				if (!savedOptions) {
					// <STRIP_WHEN_RELEASE
					sfd.warnLog('Dropdown: sfd.core.makeDropdown() 먼저 해주세요. (#' + $dropdown.attr('id') + ')');
					// STRIP_WHEN_RELEASE>
					return;
				}
				savedOptions = $.extend(savedOptions, options);
				$dropdown.data('dropdown.options', savedOptions);

				var value = $dropdown.prop('value');
				if (value === null || value === undefined) {
					$dropdown.find('.btn-adropdown .label').html(options.defaultText);
				}
			}
		},

		/**
		 * 화면 리사이즈되거나 스크롤될 때 메뉴 위치 보정
		 */
		updateMenuPosition: function($menu) {
			var $button = $menu.data('sfd-dropdown-button');
			if (!$button || $button.length == 0) {
				return;
			}

			var y = $button.offset().top + $button.closest('.btn-group').height();
			var x = $button.offset().left;
			// 화면에서 벗어나면 조정
			if (y + $menu.height() > $(window).height() + $(document).scrollTop()) {
				y = $(window).height() + $(document).scrollTop() - $menu.height(); 
			}
			$menu.css({ left: x, top: y });
		},

		/**
		 * Dropdown 메뉴 열기
		 */
		open: function($dropdown) {
			var options = $dropdown.data('dropdown.options');

			if (options.version == 2) {
				// V2
				var $button = $dropdown.find('.dropdown-toggle');
				var $menu = $dropdown.find('.dropdown-menu');
				if ($menu.length == 0) {
					return; // 이미 열려있거나 menu가 생성되어 있지 않음
				}

				var value = sfd.core.elValue($dropdown);
				var optionValue = $dropdown.prop('optionValue'); // 사용자가 입력한 값이 아니라 최초 items에 value 값

				// 선택된 값 처리
				var $oldSelectedItem = $menu.find('li.active');
				$oldSelectedItem.removeClass('active');
				$oldSelectedItem.find('.sr-only').remove(); // 접근성

				var $selectedItem = $menu.find('li[data-value="' + optionValue + '"]');
				if ($selectedItem.length > 0) {
					// 리스트 중 선택
					$selectedItem.addClass('active');
					$selectedItem.find('a').append(' <span class="sr-only">선택됨</span>'); // 접근성
				} else if ($selectedItem.length == 0 && value) {
					// 직접입력
					$dropdown.find('.user-self').val(value);
				}

				// Dropdown이 scroll 되는 컨텐츠 안에 있는 경우 처리
				var $scrollWrapper = $menu.closest('.slimScrollDiv');
				var scroller = null;
				if ($scrollWrapper.length > 0) {
					scroller = $scrollWrapper.children().eq(0).data('scroller');
					if (scroller) {
						scroller.setEnabled(false);
						var buttonTop = $button.closest('.btn-group').offset().top + scroller.scrollTop() - $scrollWrapper.offset().top;
						var buttonHeight = $button.closest('.btn-group').height();
						if (buttonTop + buttonHeight > scroller.scrollTop() + $scrollWrapper.height()) {
							scroller.scrollTop(buttonTop + buttonHeight - $scrollWrapper.height(), false);
						}
					}
				}
				
				// 보여줄 위치 계산하고
				$menu.data('sfd-dropdown', $dropdown);
				$menu.data('sfd-dropdown-button', $button);
				$menu.detach().appendTo($('#wrapper'));

				dropdown.updateMenuPosition($menu);

				// 화면에 표시
				$menu.show();
				
				// 스크롤 필요없는 경우 스크롤 영역 제거
				var optionHeight = parseInt(options.height, 10);
				var menuHeight = $menu.prop('scrollHeight');
				$menu.css('overflow-y', optionHeight >= menuHeight ? 'hidden' : 'scroll');

				// ESC 키 닫기 처리
				$menu.off('keydown.sfd.dropdown').on('keydown.sfd.dropdown', dropdown.events.menuKeyDown);
				// 윈도우 크기 조절될 때 위치 조정
				$(window).off('resize.sfd.dropdown').on('resize.sfd.dropdown', function() {
					dropdown.updateMenuPosition($menu);
				});
				$(document).off('scroll.sfd.dropdown').on('scroll.sfd.dropdown', function() {
					dropdown.updateMenuPosition($menu);
				});

				// 접근성
				var $focusItem = $menu.find('li.active');
				if ($focusItem.length == 0 && options.scrollTo !== undefined && options.scrollTo !== null) {
					$focusItem = $menu.find('li[data-value="' + options.scrollTo + '"]');
				}
				if ($focusItem.length == 0) {
					$focusItem = $menu.find('li').eq(0);
				}
				$focusItem.find('a').focus();
				$menu.data('dropdown.index', $focusItem.index());
				$button.attr('aria-expanded', true);

				// 메뉴 열림 이벤트 trigger (열리고 처리해야할거 처리할 수 있도록)
				$dropdown.trigger('shown.bs');

				// 메뉴 포커스 잃었을 때 닫히도록
				$(document).off('focusin.sfd.dropdown').on('focusin.sfd.dropdown', function(event) {
					var $menu = $('.dropdown-menu:visible');
					// 열려진 메뉴가 없으면 이벤트 핸들러 제거하고 리턴
					if ($menu.length != 1) {
						$(document).off('focusin.sfd.dropdown');
						return;
					}

					// console.log('focusin', event.currentTarget.activeElement.constructor.toString(), event);

					// // IE에서 스크롤바인 경우는 패스
					// if (event.currentTarget && event.currentTarget.activeElement instanceof HTMLAnchorElement) {
					// 	console.log('pass1');
					// 	return;
					// }

					// if (event.target instanceof HTMLAnchorElement) {
					// 	if ($menu.is(event.target.offsetParent)) {
					// 		console.log('pass2');
					// 		return;
					// 	}
					// }

					var $dropdown = $menu.data('sfd-dropdown');
					if ($dropdown) {
						if ($dropdown.find('input.user-self').is(event.target)) {
							dropdown.close($dropdown);
							return;
						}

						if ($.contains($dropdown[0], event.target)) {
							return;
						}
					}

					// // IE에서 스크롤바인 경우는 패스
					// if (event.relatedTarget instanceof HTMLAnchorElement) {
					// 	if ($menu.is(event.relatedTarget.offsetParent)) {
					// 		console.log('pass3');
					// 		return;
					// 	}						
					// }					

					// if (document !== event.target 
					// 	&& $menu[0] !== event.target 
					// 	&& $.contains($menu[0], event.target) == false) {
					// 	$menu.find('a').eq(0).trigger('focus');
					// }
				});

			} else {
				// V1: Bootstrap에서 알아서 띄움. 여기서는 뜰때 처리할 것들
				var $menu = $dropdown.find('.dropdown-menu');

				$menu.find('li.active').removeClass('active');
	
				var value = $dropdown.prop('value');
				var $selectedItem = $menu.find('li[data-value="' + optionValue + '"]');
	
				if ($selectedItem.length > 0 && $selectedItem.attr('data-item-type') != 'selfInput') {
					// 리스트중 선택
					$selectedItem.addClass('active');
				} else if ($selectedItem.length == 0 && value) {
					// 직접입력
					$dropdown.find('.user-self').val(value);
				}
	
				// 스크롤 필요없는 경우 스크롤 영역 제거
				var optionHeight = parseInt(options.height, 10);
				var menuHeight = parseInt($menu.css('height').split('px').join(''), 10);
				$menu.css('overflow-y', optionHeight > menuHeight ? 'hidden' : 'scroll');	
			}
		},

		/**
		 * Dropdown 메뉴 닫기
		 */
		close: function($dropdown) {
			var options = $dropdown.data('dropdown.options');

			if (options.version == 2) {
				$(document).off('focusin.sfd.dropdown');

				// V2
				var $menu = $('#wrapper > .dropdown-menu');
				if ($menu.length == 0) {
					return;
				}
				var $button = $dropdown.find('.dropdown-toggle');

				// 이벤트 끄고
				$menu.removeClass('sfd-dropdown-closing');

				// 닫고
				$menu.hide();
				// 원래 위치로 돌려놓고
				$menu.detach().appendTo($dropdown.find('.btn-group'));
				// 이벤트 제거
				$menu.off('keydown.sfd.dropdown');
				$(window).off('resize.sfd.dropdown');
				$(document).off('scroll.sfd.dropdown');

				// innerScroll 안에 있으면 scroll 다시 enabled 처리
				var $scrollWrapper = $menu.closest('.slimScrollDiv');
				if ($scrollWrapper.length > 0) {
					var scroller = $scrollWrapper.children().eq(0).data('scroller');
					if (scroller) {
						scroller.setEnabled(true);
					}
				}

				// 접근성
				$button.attr('aria-expanded', false);
				if ($dropdown.find('input.user-self').is(document.activeElement) == false) {
					$button.focus();
				}

			} else {
				// V1: Bootstrap에서 닫기 알아서 처리함
			}
		},

		setValue: function($dropdown, value, optionValue, options) {
			options = $.extend({
				triggerEvent: true,
				isInputChange: false
			}, options);

			var $button = $dropdown.find('.dropdown-toggle');
			var $userInputWrapper = $dropdown.find('.user-self-input');
			var $userInput = $userInputWrapper.find('input');
			var oldValue = $dropdown.prop('value');

			if (options.isInputChange) {
				// 사용자 입력 input 변경인 경우
				var oldValue = $dropdown.prop('value');
				$dropdown.prop('value', value);

				// event trigger
				if (options.triggerEvent === true && oldValue != value) {
					$userInput.trigger('change');
				}
			} else {
				if (value === null || value === undefined) {
					// 선택 해제
					var dropdownOptions = $dropdown.data('dropdown.options');
					var label = (dropdownOptions && dropdownOptions.defaultText) || '선택';
	
					$button.find('.label').html(label);
					$dropdown.prop({
						value: null,
						label: label,
						optionType: null,
						optionValue: null
					});

					// event trigger
					if (options.triggerEvent === true && oldValue != value) {
						$dropdown.trigger('change');
					}
					// 직접 입력 열려있던 경우 닫음
					$userInputWrapper.hide()
					$userInput.val('');
					$userInput.off('input.sfd.dropdown propertychange.sfd.dropdown');
				} else {
					// 값 선택
					var $option = $dropdown.find('li[data-value="' + (optionValue || value) + '"]'); // 콤보하위 li검색
					var optionType = $option.attr('data-option-type');
					var label = $option.find('a').html() || '';
					var isUserInput = false;
					
					if (optionType == 'selfInput' || $option.length == 0) {
						// 직접입력 항목
						$option = $dropdown.find('li[data-value="' + (optionValue || 'selfInput') + '"]');
						if ($option.length > 0) {
							var restrictClass = $option.attr('data-option-restrict');
							isUserInput = true;
	
							label = $option.find('a').html() || '';
							optionValue = $option.attr('data-value');
	
							$userInputWrapper.show();
							$userInput.focus().val(value);
	
							// 사용자 입력 Event handler 연결
							$userInput.off('input.sfd.dropdown').on('input.sfd.dropdown', dropdown.events.userInput);
							if (sfd.env.isIE8Below()) {
								$userInput.off('propertychange.sfd.dropdown').on('propertychange.sfd.dropdown', dropdown.events.userInput);
							}

							// 입력 제한 있는 경우 처리
							if (restrictClass) {
								$userInput.addClass(restrictClass);
								sfd.view.initContainer($userInput.parent(), 'framework', 'DropdownUserInput');
							}
						}
					} else {
						// 값 목록에서 발견한 경우. 직접입력이 열려있으면 닫음.
						$userInputWrapper.hide()
						$userInput.val('');
						$userInput.off('input.sfd.dropdown propertychange.sfd.dropdown');
					}
	
					if ($option.length > 0) {
						// Label 업데이트
						$button.find('.label').html(label);

						// Value 업데이트
						$dropdown.prop({
							value: value,
							label: label,
							optionType: isUserInput ? 'selfInput' : null,
							optionValue: optionValue || value
						});
	
						// event trigger
						if (options.triggerEvent == true && oldValue != value) {
							$dropdown.trigger('change');
						}
					} else {
						sfd.log('dropdown에 없는 값을 셋팅 하셨습니다. value : ' + value);
					}
				}				
			}
		},

		events: {
			/*
			 * Dropdown 버튼 클릭 이벤트 처리
			 */
			dropdownButtonClick: function(event) {
				var $dropdown = $(this).closest('.dropdown-container');
				var options = $dropdown.data('dropdown.options');

				if (sfd.env.deviceType == 'MO') {
					// Mobile

					// 키보드 닫히기
					sfd.view.closeSecureKeypad();

					// DropdownPopup 보여줌
					var options = $dropdown.data('dropdown.options');
					var items = options.items;
					if (!items || items.length < 1) {
						sfd.log('Dropdown list: ', items);
						return;
					}
		
					sfd.core.showPopup('DropdownPopup', {
						id: options.target,	// id ex) '#abc
						title: options.title,
						scrollTo: options.scrollTo,
						items: items,
						closeHandler: dropdown.events.mobilePickerClose
					});
		
				} else {
					// PC

					if (options.version == 2) {
						// V2
						var $menu = $dropdown.find('.dropdown-menu');
						if ($menu.length > 0) {
							dropdown.open($dropdown);
						} else {
							dropdown.close($dropdown);
						}
					} else {
						// V1
						if (event && event.isTrigger) {
							return;
						}
	
						var $menu = $dropdown.find('.dropdown-menu');
						if ($menu.is(':visible')) {
							dropdown.close($dropdown);
						} else {
							dropdown.open($dropdown);
						}
					}	
				}
			},
			/*
			 * Dropdown 메뉴 열림 이벤트 처리
			 */
			menuShown: function() {
				var $dropdown = $(this);

				var options = $dropdown.data('dropdown.options');
				var $menu = $dropdown.find('.dropdown-menu');
				if ($menu.length == 0) {
					$menu = $('#wrapper > .dropdown-menu');
				}
				var value = $dropdown.prop('value');
				var valueToShow = value;
				if (valueToShow === null || valueToShow === undefined) {
					valueToShow = options.scrollTo;
				}
				// 특정 값 항목이 보이도록 스크롤 (설정된 값이 있을 때는 설정값으로 없는 경우 scrollTo 옵션이 있으면 그리로)
				if (valueToShow !== null && valueToShow !== undefined) {
					var $itemToShow = $menu.find('li[data-value="' + valueToShow + '"]');
					if ($itemToShow.length > 0) {
						var itemHeight = $itemToShow.height();
						var top = $menu.scrollTop() + $itemToShow.position().top;
						var contentHeight = itemHeight * $menu.find('li').length;
						if (top < $menu.scrollTop() || top + itemHeight > $menu.scrollTop() + $menu.height()) {
							top = top - $menu.height() / 2 + itemHeight / 2;
							if (top > contentHeight - $menu.height()) {
								top = Math.max(0, contentHeight - $menu.height());
							}
							$menu.scrollTop(top);	
						}
					}
				}
			},

			/*
			 * Dropdown 메뉴에서 키보드 위/아래 방향키, ESC키 처리
			 */
			menuKeyDown: function(event) {
				var $menu = $(this);
				var $button = $menu.data('sfd-dropdown-button');
				if (!$button) {
					return;
				}

				switch (event.keyCode) {
					case 27: // ESC
						var $dropdown = $button.closest('.dropdown-container');
						dropdown.close($dropdown);				
						if (event.stopPropagation) {
							event.stopPropagation();
						}
						break;
					case 32: // Space
						$menu.find('a:focus').trigger('click');
						break;
					case 38: // Up
						event.preventDefault ? event.preventDefault() : (event.returnValue = false);
						var $focused = $menu.find(':focus').closest('li');
						if ($focused.length > 0) {
							$focused.prev().find('a').focus();
						} else {
							$menu.find('li').last().find('a').focus();
						}
						break;
					case 40: // Down
						event.preventDefault ? event.preventDefault() : (event.returnValue = false);
						var $focused = $menu.find(':focus').closest('li');
						if ($focused.length > 0) {
							$focused.next().find('a').focus();
						} else {
							$menu.find('li').first().find('a').focus();
						}

						break;
					case 9: //Tab
						event.preventDefault ? event.preventDefault() : (event.returnValue = false);
						var $focused = $menu.find(':focus').closest('li');
						if ($focused.length > 0) {
							if (event.shiftKey) {
								$focused.prev().find('a').focus();
							} else {
								$focused.next().find('a').focus();
							}
						} else {
							$menu.find('li').first().find('a').focus();
						}
						break;
				}
			},
			/*
			 * Dropdown 메뉴에서 항목 선택 처리
			 */
			itemClick: function(event) {
				if (event) {
					event.preventDefault ? event.preventDefault() : (event.returnValue = false);
				}

				var $a = $(this);
				var $li = $a.parent('li');
				var $menu = $li.closest('.dropdown-menu');				
				var $dropdown = $li.closest('.dropdown-container');
				if ($dropdown.length == 0) {
					// dropdown-menu가 #wrapper에 붙여진 경우
					var $button = $li.closest('.dropdown-menu').data('sfd-dropdown-button');
					if ($button) {
						$dropdown = $button.closest('.dropdown-container');
					}
				}
				var $button = $dropdown.find('.dropdown-toggle');

				$menu.addClass('sfd-dropdown-closing');

				$(document).off('focusin.sfd.dropdown');
				if ($menu.parent().is('#wrapper')) {
					$button = $menu.data('sfd-dropdown-button');
					$button.trigger('click');
				}

				// value및 라벨 셋팅
				var oldValue = $dropdown.prop('optionValue');
				var newValue = $li.attr('data-value');
				var optionType = $li.attr('data-option-type');
				
				if (oldValue == newValue) {
					// 선택했던 것 그대로 선택하면 아무것도 안함
					return;
				}

				var $userInput = $dropdown.find('.user-self-input input');
				if (optionType == 'selfInput') {
					// 직접입력 처리
					/* 아직 필요없는 옵션(내부스크롤이 있는 페이지 이면서 직접입력이 있는경우 그때가서 처리)
								$('#email-self-input').offset( {
									left:$(ns+' .dropdown-toggle').offset().left,
									top:$(ns+' .dropdown-toggle').offset().top-32
								} );*/
					// 새로 선택된 항목인 경우 사용자 입력 input 값 비움
					if (newValue != $dropdown.prop('optionValue')) {
						$userInput.val('');
					}
					var userInputValue = $userInput.val();

					dropdown.setValue($dropdown, userInputValue, newValue);

					setTimeout(function() {
						$userInput.focus();
					}, 200);
				} else {
					// 값 선택
					dropdown.setValue($dropdown, newValue);

					// 라벨 데이터가 커서 arrow down을 벗어날 경우 arrow down을 꺼준다 
					// ( 확률상 콤보박스를 작게 생성해야 하는 경우만 넘칠경우에 대한 처리 )
					// TODO: 이거 처리 어찌해야하나
					// if ($button.innerHeight() > $button.data('oriHeight') + 5) {
					// 	$button.addClass('caret-hidden');
					// } else {
					// 	$button.removeClass('caret-hidden');
					// }

					setTimeout(function () {
						$button.trigger('focus');
					}, 200);
				}				
			},

			mobilePickerClose: function(result) {
				if (!result || result == 'notchange') {
					return;
				}

				var $dropdown = $(result.targetID);
				var $button = $dropdown.find('.dropdown-toggle');

				var oldValue = $dropdown.prop('optionValue');
				var newValue = String(result.value);

				// 같은 값이 선택되면 아무것도 하지 않음
				if (newValue == oldValue) {
					return;
				}

				// Label, Value 설정

				var $userInput = $dropdown.find('.user-self-input input');
				if (result.displayType == 'selfInput') {
					// 사용자 입력 선택

					/* TODO: 아직 필요없는 옵션(내부스크롤이 있는 페이지 이면서 직접입력이 있는경우 그때가서 처리)
					$('#email-self-input').offset( {
						left:$(ns+' .dropdown-toggle').offset().left,
						top:$(ns+' .dropdown-toggle').offset().top-32
					} );*/
					
					// 새로 선택된 항목인 경우 사용자 입력 input 값 비움
					if (newValue != $dropdown.prop('optionValue')) {
						$userInput.val('');
					}
					newValue = $userInput.val();
					dropdown.setValue($dropdown, newValue);

					setTimeout(function() {
						$userInput.focus();
					}, 200);
					
				} else {
					// 값 선택
					dropdown.setValue($dropdown, newValue);

					// 포커스
					setTimeout(function() {
						$button.trigger('focus');
					}, 200);
				}
			},
			// 사용자 입력 input event handler
			userInput: function() {
				var $input = $(this);
				var $dropdown = $input.closest('.dropdown-container');
				var optionValue = $dropdown.prop('optionValue'); // 사용자 입력 항목 value 값. (사용자가 입력한 value 값이 아니라 처음 생성할 때 items에 value 값)
				var value = $(this).val();

				dropdown.setValue($dropdown, value, optionValue, { isInputChange: true });
			}
		} // events
	} // dropdown

	/**
	 * 지정한 page의 container 요소
	 * @category Page View
	 * @param {String} name Page name
	 * @return {Object} 지정한 page의 container 요소 jQuery object. 보여지는 page가 없으면 undefined.
	 */
	function getPageContainer(name) {
		var result;
		if (name) {
			result = $('#' + name).closest('.panel-container');
			if (!result || result.length == 0) {
				result = $('.panel-container[data-name="' + name + '"]'); // 마이다이렉트 page에 ID가 없는 경우가 있어서...
			}
		}
		return result;
	}

	/**
	 * Page module 로드
	 * @category Page View
	 * @param {String} name 로드 하려는 page 이름
	 */
	function loadPage(name) {
		var sfdCacheBust = 'bust=' + (new Date()).getTime();
		var modulePath = self.getResourcePath(name) + '.js?' + sfdCacheBust;
		require([modulePath], function(page) {
			sfd.core.hideLoading();
			
			page.ns = '#' + name;
			page.moduleName = name;
			page.initialization(sfd);
			sfd.view.checkModuleLoaded({
				moduleName: name,
				moduleType: 'panel',
				fileType: 'js',
				moduleContent: page
			});

			sfd.page[name] = page;

		}, function() {
			// 로드 에러 발생
			require.undef(modulePath); // 모듈 undef
			sfd.view.isPageTransitioning = false;
			loadingPageName = null;			
		});
	}

	/**
	 * 가로로 slide page 전환
	 * @category Page View
	 * @param {String} oldPageName 현재 보여지는 page name.
	 * @param {String} newPageName 보여질 page name.
	 */
	function showPageTransitionHorizontal(oldPageName, newPageName) {
		var sizeInfo = sfd.env.openSizeInfo;
		var oldPageMetadata = oldPageName ? self.getPageMetadata(oldPageName) : null;
		var newPageMetadata = self.getPageMetadata(newPageName);

		var isFirst = !oldPageName; // 처음으로 열리는 페이지인지 여부
		var $newPageContainer = getPageContainer(newPageName);
		var $oldPageContainer = $('#shell-main .panel-container').eq($newPageContainer.index() == 1 ? 0 : 1);
		var oldPage = oldPageName ? sfd.view.getPage(oldPageName) : null;
		var newPage = sfd.view.getPage(newPageName);

		// 이벤트 trigger		
		if (oldPage && oldPage.pageState) {
			oldPage.pageState('showAnimateStart'); // 구코드 지원을 위해 남겨둠
		}
		// onPageTransitionStart
		viewEvent('onPageTransitionStart', [oldPage, newPage], [oldPageName, newPageName]);

		// Transition 애니메이션 준비
		if (sfd.env.deviceType == 'MO') {
			// Mobile 처리

			if (isFirst == false) {
				// 스크롤된 화면을 고정시키기
				var scrollTop = $(document).scrollTop();
				$(document).scrollTop(0);
				$oldPageContainer.css({
					overflow: 'hidden', 
					height: $(window).height() - parseInt($oldPageContainer.css('padding-bottom'), 10)
				}).scrollTop(scrollTop);
			}
			
			// 하단 fixed 버튼 처리
			if (sfd.data.dataObject.productPath == 'mydirect') {
				// 마이다이렉트
				$('footer').css('visibility', 'hidden');
				$oldPageContainer.css({ position: 'absolute', width: $('main').width() });
				$newPageContainer.css({ position: 'absolute', width: $('main').width() });
			} else {
				// 일반 상품
				var $oldPageBottom = $oldPageContainer.find('.page-bottom, .btns-nextprev');
				var $newPageBottom = $newPageContainer.find('.page-bottom');

				// 기존 페이지 하단 버튼 감춤
				if ($oldPageBottom.css('position') == 'fixed') {
					$oldPageBottom.animate({ bottom: -100 }, 300);
				}

				// 보여질 페이지 하단 버튼 일단 감춰둠
				$newPageBottom.css({ position: 'fixed', bottom: '-100px' });
			}
		} else {
			// PC인 경우 

			// Shell Left 처리
			var sizeInfo = sfd.env.openSizeInfo;
			var $shellLeft = $('#shell-left');
			var $shellMain = $('#shell-main');

			$shellLeft.animateAlpha(1, 300, true);

			if (newPageMetadata.size == 'wide') {
				// 보여질 page가 wide 형태면 #shell-main을 left 영역 없이 넓히기
				if ($shellMain.cssLeft() != 0 && $shellMain.width() != sizeInfo.wrapperWidth) {
					$shellMain.stop().animate({ 
						width: sizeInfo.wrapperWidth, 
						left: 0 
					}, 700, 'easeInOutExpo');
				}
				$shellLeft.animateAlpha(0, 300, true);
			} else {
				// 보여질 page가 wide 가 아니면 #shell-main을 left 영역 고려해서 좁히기
				if ($shellMain.width != sizeInfo.wrapperWidth - sizeInfo.shellLeft && $shellMain.cssLeft() != sizeInfo.shellLeft) {
					$shellMain.stop().animate({
						width: sizeInfo.wrapperWidth - sizeInfo.shellLeft,
						left: sizeInfo.shellLeft
					}, 700, 'easeInOutExpo');	
				}
			}
		}			

		if (isFirst) {
			// 첫페이지 (애니메이션 없이 보여주면 끝)
			if (sfd.env.deviceType == 'PC') {
				// 최초 1번 panel-container의 사이즈 조정
				$newPageContainer.width(sizeInfo.wrapperWidth - (newPageMetadata.size != 'wide' ? sizeInfo.shellLeft : 0));
			}

			setTimeout(function() {
				showPageTransitionHorizontalDone();
			}, 500); // 뭐땜에 필요한지 몰라서 일단 놔둠. njh

			// 4 로딩 종료
			sfd.core.hideLoading('tag_panelLoadid'); // 뭔지 모르겠음. njh

		} else {
			// 페이지 전환 애니메이션
			var dir = sfd.data.getValue('pageDir'); // 진행 방향 "next", "prev"
			var oldShellMainW = sizeInfo.wrapperWidth - (oldPageMetadata && oldPageMetadata.size != 'wide' ? sizeInfo.shellLeft : 0); // 현재 page 너비
			var newShellMainW = sizeInfo.wrapperWidth - (newPageMetadata && newPageMetadata.size != 'wide' ? sizeInfo.shellLeft : 0); // 다음 page 너비
			var startLeft = (dir == 'next') ? sizeInfo.wrapperWidth : -newShellMainW;

			// full 페이지가 존재하고 보여지고 있는경우 가리기
			// TODO: 이 코드 필요한 것인가 확인하고 필요없으면 제거. by njh
			var $shellMainFull = $('#shell-main-full');
			if ( $shellMainFull.length > 0 && $shellMainFull.css('display') != 'none' ) {
				$shellMainFull.css('display', 'none');
				startLeft = 0;
			}

			// 자리잡고
			$newPageContainer.css({ left: startLeft }).show();

			// 애니메이션
			$oldPageContainer.stop().animate({
				left: (dir == 'next' ? -oldShellMainW : newShellMainW)
			}, 700, 'easeInOutExpo');

			$newPageContainer.stop().animate({
				left: 0,
				width: (sfd.env.deviceType == 'MO') ? '100%' : newShellMainW
			}, 700, 'easeInOutExpo', function() {
				showPageTransitionHorizontalDone();
			});
		}

		// 전환 애니메이션 완료시 처리
		function showPageTransitionHorizontalDone() {
			if (sfd.env.deviceType == 'MO') {
				// 모바일인 경우 스크롤 고정시키기 위해 변경했던 속성 복원시킴
				$oldPageContainer.css({
					overflow: '', 
					height: ''
				});

				// 하단 버튼 보이기
				if (sfd.data.dataObject.productPath == 'mydirect') {
					// 마이다이렉트
					$oldPageContainer.css({ position: '', width: '' });
					$newPageContainer.css({ position: '', width: '' });
					$('footer').css('visibility', '');	
				} else {
					// 일반상품
					var $newPageBottom = $newPageContainer.find('.page-bottom');
					// 보여질 페이지 하단 버튼 나옴
					$newPageBottom.animate({ bottom: 0 }, 500);
				}
			}

			// 기존 page container 처리
			$oldPageContainer.empty().hide().removeAttr('data-name');

			showPageTransitionDone(oldPageName, newPageName);
		}
	}

	/**
	 * Page 전환 완료시 처리
	 * @category Page View
	 * @param {String} oldPageName 기존 page name.
	 * @param {String} newPageName 보여질 page name.
	 */
	function showPageTransitionDone(oldPageName, newPageName) {
		var oldPage = oldPageName ? sfd.view.getPage(oldPageName) : null;
		var newPage = sfd.view.getPage(newPageName);

		// onPageTransitionEnd
		viewEvent('onPageTransitionEnd', [oldPage, newPage], [oldPageName, newPageName]);

		// 기존 page 처리
		if (oldPage) {
			if (oldPage.pageState) {
				oldPage.pageState('hideAnimateEnd'); // 구코드 지원을 위해 남겨둠
			}
			// 초기화 필요한 부분 처리
			if (oldPage._cleanUp) {
				oldPage._cleanUp();
			}

			// onPageDidHide
			viewEvent('onPageDidHide', oldPage, oldPageName);
		}

		// data 업데이트
		var isFirst = !oldPageName;
		var pageMetadata = sfd.view.getPageMetadata();
		var pageIndex = sfd.view.getPageIndex();
		var page = sfd.view.getPage();

		sfd.data.setValue('pageCurrentNum', isFirst ? 1 : pageIndex);
		sfd.data.setValue('pageStep', isFirst ? 1 : pageMetadata.step);
		sfd.data.setValue('pageSubStep', isFirst ? 0 : pageMetadata.substep);
		if (sfd.data.getValue('pageActiveNum') < pageIndex) {
			sfd.data.setValue('pageActiveNum', pageIndex);
		}

		// 이벤트 trigger
		sfd.view.$wrapper.trigger('sf.change-page-complete');
		if (page.tweenEnd) {
			page.tweenEnd(); // 구코드 지원을 위해 남겨둠
		}
		if (page.pageState) {
			page.pageState('showAnimateEnd'); // 구코드 지원을 위해 남겨둠
		}
		// 4 로딩 종료
		// sfd.core.hideLoadingEx('loading-transparent', { animated: false });
		$('#loading-transparent').hide();

		self.isPageTransitioning = false;

		// onPageDidShow
		viewEvent('onPageDidShow', newPage, newPageName);
	}	

	/**
	 * Popup module 로드
	 * @category Popup View
	 * @param {String} name 로드 하려는 popup 이름
	 * @param {Object} options popup 옵션
	 * @param {Function} callback 로드 완료 콜백. function(popup) {} 실패한 경우 popup이 null.
	 */
	function loadPopup(name, options, callback) {
		var popup = sfd.core.getPopup(name);
		if (popup) {
			// 이미 로드된 것 있으면 재사용
			callback(popup);
		} else {
			// 이미 로드된 것 없으면 새로 로드
			var cacheBust = '.js?bust=' + (new Date()).getTime();
			var productPath = (sfd.env.deviceType == 'MO') ? 'mobile' : 'pc';
			var popupPath = options.popupPath ? options.popupPath : '/ria/' + productPath + '/product/common/popup/';
			
			require([
				sfd.utils.joinPath(popupPath, name + cacheBust)
			], function(popup) {
				if (!popup) {
					sfd.warnLog('리소스 로딩 실패', sfd.utils.joinPath(popupPath, name + cacheBust));
				}

				sfd.view.checkModuleLoaded({
					moduleName: name,
					moduleType: 'popup',
					fileType: 'js',
					moduleContent: popup
				});

				callback(popup);
			});
		}
	}

	/**
	 * Alert popup 인지 확인
	 * @category Popup View
	 * @param {String|Object} popup Popup object 또는 이름.
	 * @param {Object} options Popup 옵션
	 */
	function isPopupAlert(popup, options) {
		if (typeof popup == 'object') {
			return popup.modalOption.type == 'alert';
		} else {
			var name = popup;
			return (name == 'CommonAlert' || name == 'CommonAlert1') && (!options || !options.cancelTitle);
		}
	}

	/**
	 * Confirm popup 인지 확인
	 * @category Popup View
	 * @param {String|Object} popup Popup object 또는 이름.
	 * @param {Object} options Popup 옵션
	 */
	function isPopupConfirm(popup, options) {
		if (typeof popup == 'object') {
			return !!(popup.modalOption.type == 'confirm' || (popup.moduleName == 'CommonAlert' && popup.option && popup.option.cancelTitle));
		} else {
			var name = popup;
			return !!(name == 'CommonConfirmAlert' || (name == 'CommonAlert' && options && options.cancelTitle));
		}
	}

	/**
	 * Popup 열기 애니메이션
	 * @category Popup View
	 * @param {Object} popup Popup 객체.
	 */
	function showPopupTransition(popup) {
		var modalOption = popup.modalOption;
		var $container = $(popup.parentns);
		
		var $modal = $container.find('.modal');
		var $content = $modal.find('.modal-content');
		var $xButton = $modal.find('.btn-popup-x');
		
		// 오픈 전 준비 작업
		if (sfd.env.deviceType == 'MO') {
			$modal.find('.pop-warning').hide();
			$container.find('.btn-popup-x').attr({ 'role': 'button', 'aria-label': '닫기' });

			if (modalOption.opentype == 'full') {
				modalOption.backdrop = false; // Full 팝업은 backdrop 없앰
			}

			// z-index 동적할당 문제시 바로 삭제
			var zindxShellPopup = parseInt($('#shell-popup').css('z-index'), 10);
			var addIndex = $('#shell-popup > div').length || 0;
			addIndex += zindxShellPopup;
			$container.css({ 'z-index': addIndex, position: 'relative' });

		} else if ( sfd.env.deviceType == 'PC' ) {
			// $('#shell').css('filter', 'blur(0.5px)');

			// IE10이하, devicePixelRatio가 1보다 큰경우, 높이가 낮은 브라우져크기 modal의 overflow속성 scroll로
			if ( sfd.env.isIE10Below() ||
				(window.devicePixelRatio > 1 && window.devicePixelRatio != 2 ) ||
				$(window).height() < 880 ) {
				$modal.css('overflow', 'scroll');
			}
		}

		// Event handler 등록
		if ($modal.hasClass('fade')) {
			// fade 없는 경우 자체 animation/transition 완료 후에 호출함.
			$modal.one('shown.bs.modal.sfd-view', { popup: popup }, showPopupTransitionDone); // 팝업 열림 완료 이벤트
		}
		$modal.one('hidden.bs.modal.sfd-view', { popup: popup }, hidePopupTransitionDone); // 팝업 닫힘 완료 이벤트

		// onPopupShowTransitionStart
		viewEvent('onPopupShowTransitionStart', popup, popup.moduleName);

		// Modal 열기
		var transitionDuration = 300;
		$modal.modal(modalOption);

		switch (modalOption.opentype) {
			case 'slide': // PC 오른쪽에서 나오는 슬라이드 팝업
				// 팝업 slide-in 애니메이션
				$content.css('left', $content.css('width'));
				$content.stop().animate({ left: 0 }, 500, 'easeInOutExpo', function() {
					showPopupTransitionDone.call($modal, popup);
				});

				// X 버튼 애니메이션
				$xButton.css({ opacity: 0, left: 0});
				$xButton.stop().delay(300).animate({ opacity: 1, left: -40 }, 300, function() {
					if (sfd.env.screenReader) {
						$(this).focus(); // 접근성 focus 처리
					}
				});
				break;

			case 'full': // Mobile 전체화면 팝업
				// Footer 애니메이션
				var $modalFixedFooter = $container.find('.modal-fixed-footer');

				$modalFixedFooter.css({ opacity: 0, bottom: -$modalFixedFooter.outerHeight() });
				$modalFixedFooter.delay(200).animate({ opacity: 1, bottom: 0 }, 150);
				break;

			default: // Alert 등 화면 가운데 나오는 팝업 (PC, Mobile 모두 사용)
				if ( sfd.env.deviceType == 'PC' ) {
					// X 버튼 애니메이션
					$xButton.css({ opacity: 0, top: -50, right: 10 });
					$xButton.stop().delay(300).animate({ opacity: 1, right: -50 }, 300, function() {
						if (sfd.env.screenReader) {								
							$xButton.focus(); // 접근성 focus 처리
						}
					});
				} else { // Mobile
					// X 버튼 애니메이션
					$xButton.css({ opacity: 0, top: 0, right: -5, 'z-index': '-1'});
					$xButton.stop().delay(300).animate({ opacity: 1, top: -36 }, 200, function() {
						$(this).css({ 'z-index': 'auto' });
						if (sfd.env.screenReader) {
							$(this).focus();
						}
					});
				}
				break;
		}

		// 다중 Slide팝업인 경우 제일 위 팝업 외에는 모두 안보이게 처리
		if (sfd.env.deviceType == 'PC' && !$modal.hasClass('modal-alert') && $content.hasClass('modal-content-slide')) {
			if ($('.modal-popup').length > 1) {
				$('.modal-popup').filter(function(index) {
					return $modal.attr('id') != $(this).attr('id');
				}).css('opacity', '0');
			}
		}

		// Transition 처리 simulate
		if ($modal.hasClass('fade') == false && modalOption.opentype != 'slide') {
			setTimeout(function() {
				showPopupTransitionDone.call($modal, popup);
			}, transitionDuration);
		}
	}

	/**
	 * Popup 열림 transition 애니에이션 완료시 호출되는 함수
	 * @category Popup View
	 * @param {Object} event jQuery Event 또는 modal module
	 */
	function showPopupTransitionDone(event) {
		var popup = event instanceof jQuery.Event ? event.data.popup : event;
		var modalOption = popup.modalOption;
		var $popup = $(this);
		var name = popup.moduleName;

		// <STRIP_WHEN_RELEASE
		sfd.log('popup shown', popup.moduleName);
		// STRIP_WHEN_RELEASE>

		// onPopupShowTransitionEnd
		viewEvent('onPopupShowTransitionEnd', popup, name);

		if (sfd.env.deviceType == 'MO') {
			$('#shell-main, #shell-top').attr('aria-hidden', 'true');

			if (modalOption.opentype == 'full') {
				// .modal header 감추고 fixed header 보여주고
				setTimeout(function () { // timeout 없이하면 이상하게 보이는 경우 있어서 약간 시간차 두고 변경
					var $container = $popup.parent();
					var $modalFixedHeader = $container.find('.modal-fixed-header');
					var $modalHeader = $popup.find('.modal-header');

					$modalFixedHeader.css('display', 'flex').show();
					$modalFixedHeader.find('.pop-warning').fadeIn();

					$modalHeader.css('opacity', 0).attr('aria-hidden', 'true');
					$modalHeader.find('.btn-popup-x, .title').hide();
				}, 100);
			}
		}

		// 기본 focus 처리
		var $focusElement = null;
		if (sfd.env.deviceType == 'MO') {
			// Mobile (X 버튼이나 확인 버튼)
			var $xButton = $popup.parent().find('.btn-popup-x:visible');
			$focusElement = $xButton.length > 0 ? $xButton : $popup.find('.btn-confirm');
			if ($focusElement.length == 0) {
				$focusElement = $popup.find('#btn-confirm'); // 기존 코드들은 ID로 되어 있어서
			}
		} else {
			// PC (확인 버튼)
			$focusElement = $popup.find('.btn-confirm');
			if ($focusElement.length == 0) {
				$focusElement = $popup.find('#btn-confirm'); // 기존 코드들은 ID로 되어 있어서
			}
		}
		if ($focusElement) {
			$focusElement.trigger('focus');
		}

		popup.isLoaded = true;
		popup.state = 'opened';

		// onPopupDidShow
		sfd.view.$wrapper.trigger('sf.show-popup-complete', { name: name });
		viewEvent('onPopupDidShow', popup, name);

		if (popup.onShown) {
			popup.onShown(); // TODO: 나중에 정리되면 제거
		}

		sfd.view.isPopupTransitioning = false;

		// openHandler가 있는 경우 openHandler호출
		if (popup.option && popup.option.openHandler) {
			popup.option.openHandler();
		}
		
		// Esc 키 이벤트 등록
		$popup.on('keydown.sfd-view', function(event) {
			if (event.keyCode == 27 && popup.onEscKey) {
				popup.onEscKey();
			}
		});
	}	

	/**
	 * Popup 닫기 애니메이션
	 * @category Popup View
	 */
	function hidePopupTransition(popup) {
		if (popup.state != 'opened' && popup.state != 'closing') { // closing은 기존 코드들때문에 통과시킴
			return;
		}
		var name = popup.moduleName;
		
		popup.state = 'closing';


		var modalOption = popup.modalOption
		var $popup = $('#' + popup.moduleName);
		if ($popup.hasClass('modal') == false) {
			$popup = $popup.find('.modal');
		}

		// 이벤트 해제
		$popup.off('keydown.sfd-view');
		sfd.view.$wrapper.trigger('sf.popup-off');

		// 닫힘 Transition 중 UI Click 안되도록 막음
		sfd.view.showAlphaBackdrop();
		sfd.core.showLoading('loading-transparent');

		// 준비 작업
		var $modalPopup = $('.modal-popup');
		if ($modalPopup.length > 1) {
			// 다중 팝업인 경우, 백그라운드 팝업의 alpha를 원복해준다.
			if (sfd.env.deviceType == 'MO' || ['CommonAlert', 'CommonAlert1'].includes(popup.moduleName) == false) {
				$modalPopup.css('opacity', '1');
			}
		}

		// onPopupHideTransitionStart
		viewEvent('onPopupHideTransitionStart', popup, name);

		if (sfd.env.deviceType == 'MO') {
			$('#shell-main, #shell-top').removeAttr('aria-hidden');

			if (modalOption.opentype == 'full') {
				//모바일의 full 팝업인 경우, fixed header 감추고 .modal header 보이고
				var $popupShell = $('#shell-popup-' + popup.moduleName);
				var $modalFixedHeader = $popupShell.find('.modal-fixed-header');
				var $modalFixedFooter = $popupShell.find('.modal-fixed-footer');
				var $modalHeader = $popupShell.find('.modal-header');
				
				$modalFixedHeader.hide();
				$modalHeader.css('opacity', 1)
				$modalFixedFooter.animate({opacity: 0, bottom: -$modalFixedFooter.height()}, 200);
			}	
		}		
		
		if (modalOption.opentype == 'slide') {
			var $content = $popup.find('.modal-content');
			$content.stop().animate({ left: $content.outerWidth() }, 300, 'easeInOutExpo', function() {
				// bootstrap modal 처리
				if (($popup.data('bs.modal') || {}).isShown === true) {
					$popup.modal('hide');
				}
				
				// 기존 코드 처리를 위한 부분 (이미 modal('hide')를 호출하고 이 함수 호출한 경우)
				if (popup._needsTriggerHiddenEvent === true) {
					popup._needsTriggerHiddenEvent = false;
					hidePopupTransitionDone(popup);
				}
			});	
		} else {
			// bootstrap modal 처리
			if (($popup.data('bs.modal') || {}).isShown === true) {
				$popup.modal('hide');
			}
			
			// 기존 코드 처리를 위한 부분 (이미 modal('hide')를 호출하고 이 함수 호출한 경우)
			if (popup._needsTriggerHiddenEvent === true) {
				popup._needsTriggerHiddenEvent = false;
				hidePopupTransitionDone(popup);
			}
		}
	}

	/**
	 * Popup 닫힘 transition 애니메이션 완료시 호출되는 함수
	 * @category Popup View
	 * @param {Object} event jQuery Event 또는 modal module
	 */
	function hidePopupTransitionDone(event) {
		var popup = event instanceof jQuery.Event ? event.data.popup : event;
		{ // 기존 코드에서 $modal.modal('hide') 를 미리 호출하고 sfd.view.modalContainerHide()를 부르는 경우 있어서 처리
			if (popup.state != 'closing') {
				popup._needsTriggerHiddenEvent = true;
				return;
			}
		}

		sfd.log('▨ ● ● hidePopup Data:', popup.containerId, popup.result);

		// onPopupHideTransitionEnd
		viewEvent('onPopupHideTransitionEnd', popup, popup.moduleName);

		// 상태 변수 업데이트
		var popupList = sfd.view.getOpenPopupList();
		sfd.view.currPopupName = popupList.length > 1 ? popupList[popupList.length - 2] : '';
		sfd.data.setValue('_currentOpenPopup', sfd.view.currPopupName);

		if (isPopupConfirm(popup)) {
			// confirm 처리 (confirm은 한개만 열릴 수 있음)
			sfd.view.isConfirmOpened = false;
		} else if (isPopupAlert(popup)) {
			// alert queue 처리
			alertQueue.splice(0, 1); // 제일 처음꺼 제거
		}

		// Clean up
		if (popup._cleanUp) {
			popup._cleanUp();
		}			
		$('#' + (popup.containerID || popup.containerId)).remove();
		sfd.core.hideLoadingEx('loading-transparent', { animated: false });
		sfd.view.hideAlphaBackdrop();
		
		if (popup.option) {
			// closeHandler 호출
			if (popup.option.closeHandler) {
				popup.option.closeHandler.call(popup, popup.result);
			}

			// 접근성 처리: 팝업 닫힌 후 focus 요소 지정된 경우 focus 처리
			if (popup.option.focusButton) {
				var $focusButton = (popup.option.focusButton instanceof jQuery) ? popup.option.focusButton : $(popup.option.focusButton);
				if ($focusButton) {
					$focusButton.focus();
				}
			}
		}

		popup.state = 'closed';

		// onPopupDidHide
		sfd.view.$wrapper.trigger('sf.hide-popup-complete', { name: popup.moduleName });
		viewEvent('onPopupDidHide', popup, popup.moduleName);

		sfd.view.isPopupTransitioning = false;

		// Pending 되었거나 alert queue에 있는 modal 처리
		if (alertQueue.length > 0) {
			// Queue에 남은 alert 있으면 보여주기
			var alertModal = alertQueue[0];
			sfd.view.showPopup(alertModal.name, alertModal.options, 'queue');
		} else if (pendingPopup) {
			// 상태때문에 열리지 못하고 pending된 modal 처리
			var name = pendingPopup.name;
			var options = pendingPopup.options;
			pendingPopup = null;

			sfd.view.showPopup(name, options);
		}
	}

	/**
	 * @category View
	 * @param {String} name 호출할 이벤트 함수 이름. on으로 시작. 예) "onPageWillShow"
	 * @param {Object|Array} modules 이벤트 함수를 호출할 모듈. (여러개인 경우 배열로 지정. 순서대로 호출됨)
	 * @param {Any|Array} parameters 이벤트 함수에 전달할 인자 배열.
	 * @param {Object} options 옵션
	 * Key | Type | 기본값 | 설명
	 * ---|---|---|---
	 * returnOnFalse | Boolean | - | true로 지정하는 경우 이벤트 함수가 false 리턴하면 바로 리턴해버림
	 * @return {Boolean} 이벤트 함수에서 반환한 값.
	 */
	function viewEvent(name, modules, parameters, options) {
		var result;
		options = options || {};
		modules = modules ? (Array.isArray(modules) ? modules : [modules]) : undefined;
		parameters = parameters ? (Array.isArray(parameters) ? parameters : [parameters]) : undefined;

		// moduleDevice
		if (sfd.core.moduleDevice && sfd.core.moduleDevice[name]) {
			result = sfd.core.moduleDevice[name].apply(null, parameters);
		}
		if (options.returnOnFalse && result === false) {
			return result;
		}
		// core
		if (sfd.core[name]) {
			result = sfd.core[name].apply(null, parameters);
		}
		if (options.returnOnFalse && result === false) {
			return result;
		}
		// module
		if (modules) {
			modules.forEach(function(m) {
				if (m && m[name]) {
					result = m[name].apply(null, parameters);
				}
			});
		}
		return result;
	}

	/**
	 * Property 치환할 것들 치환
	 * @category 유틸리티
	 * @param {String} str 치환할 것들 있는 string
	 * @param {Object} options 옵션
	 * productRoot, productPath, objName
	 * @return {String} 치환된 string
	 */
	function replacedPropertyStr(str, options) {
		options = options || {};

		var deviceType = sfd.env.deviceType;
		// 치환할 속성이 있는 경우만
		if (options.productRoot) {
			// root 
			str = str.replace(/{{ productRoot }}/g, options.productRoot);
		} 
		if (options.productPath) {
			// 폴더명
			str = str.replace(/{{ productPath }}/g, options.productPath);
		} 
		// if(options && options.pageTitle)inStr = inStr.replace(/{{ replaced-pageTitle }}/g, options.productPath); // 폴더명
		if (options.objName) {
			str = str.replace(/{{ replaced-pageName }}/g, options.objName); // page id 
			str = str.replace(/replaced-pageName/g, options.objName); // page id    
			str = str.replace(/{{ replaced-moduleID }}/g, options.objName); // page id 
			str = str.replace(/replaced-moduleID/g, options.objName); // page id  
			// inStr = inStr.replace(/scoped/g, options.objName); // page id    
		}

		if (options.moduleID) {
			str = str.replace(/{{ replaced-moduleID }}/g, options.moduleID); // page id 
			str = str.replace(/replaced-moduleID/g, options.moduleID); // page id      
		}

		if (deviceType == 'MO') {
			str = str.replace(/href="#"/g, 'href="javascript:void(0)"'); 

			// if (sfd.data.getValue('divisionName') == 'bike') {	// 모바일에서는 이륜차일때 기타 등등 숨기는 작업들을 하기 위해서
			// 	sfd.core.replaceTitle();
			// }

		} 


		if (sfd.data.dataObject.divisionName == 'bike' ) {
			str = str.replace(/<span class="carTypeLabel">자동차<\/span>/g, '이륜차'); 
		}

		return str;
	}

	/**
	 * Control 값 얻기
	 * @category Control
	 * @param {Object} $el 값을 얻을 요소의 jQuery object.
	 * @param {String} type Control 종류. 예) "text", "checkbox"
	 * @return {*} Control의 값.
	 */
	function getControlValue($el, type) {
		var result;

		switch (type) {
			case 'text':
			case 'textarea':
				result = $el.val();
				break;

			case 'checkbox':
				var $inputs;
				var isGroup = false; // 값을 배열로 처리할지 여부
				if ($el.is('input')) {
					$inputs = $el;
				} else {
					$inputs = $el.find('input[type="checkbox"]');
					isGroup = $el.hasClass('btn-group-vertical') || $el.hasClass('btn-group');

					// value 속성 사용할 때랑 아닐때 동작이 좀 달라서 헷갈릴 수 있음. 어찌 정리를 해야하나 고민 중 (njh)
					if ($inputs.length == 1 && $inputs.attr('value') === undefined) {
					// value 속성 사용 안하고 checkbox가 한 개만 있는 경우는 group으로 처리 안함.
						isGroup = false;
					}
				}

				if (isGroup == false) {
				// 낱개
					result = $inputs.is(':checked');

					// value 지정된 경우는 value 또는 null
					var value = $inputs.attr('value');
					if (value !== undefined && value !== null && value !== '') {
						result = result ? $inputs.attr('value') : null;
					}
				} else {
				// 그룹
					result = [];
					var valueExists = $inputs.filter('[value][value!=""]').length == $inputs.length;

					if (valueExists) {
					// value
						$inputs.filter(':checked').each(function () {
							result.push($(this).attr('value'));
						});

						// 선택된 것이 한 개도 없는 경우 null
						if (result.length == 0) {
							result = null;
						}
					} else {
					// true/false
						$inputs.each(function () {
							result.push($(this).is(':checked'));
						});

						// 모두 false인 경우 result = null
						if (result.includes(true) == false) {
							result = null;
						}
					}
				}
				break;

			case 'radio':
				var $input = $el.is('input') ? $el : $el.find('input[type="radio"]');
				var $radio;
				var name = $input.attr('name');
				if (!name) {
					// <STRIP_WHEN_RELEASE
					if (sfd.env.isDebug) {
						alert('debugMessage1332134 radio(' + ($el.attr('id') || '') + ')에 name이 지정되지 않았습니다.');
					}
					// STRIP_WHEN_RELEASE>

					// name 없이 작성된 코드들이 꽤 있어서 그것들 처리를 위해서
					var $group = $input.closest('.btn-group, .btn-group-vertical, .list-group');
					$radio = $group.find('input[type="radio"]');
				} else {
					var $container = $input.closest('.inframe-step, .modal-content, .page-content');
					if ($container.length > 0) {
						$radio = $container.find('input[type="radio"][name="' + name + '"]');
					} else {
						$radio = $('input[type="radio"][name="' + name + '"]');
					}
				}		
				var $checkedRadio = $radio.filter(':checked');
				if ($checkedRadio.length > 0) {
					result = $checkedRadio.val();
				} else {
					result = null;
				}
				break;

			case 'dropdown':
				if ($el.hasClass('sfd-dropdown')) {
					result = sfd.view.dropdown($el).val();
				} else {
					if ($el.hasClass('dropdown-toggle')) {
						$el = $el.closest('.dropdown-container');
					}
	
					result = $el.prop('value');
					if (result === undefined) {
						result = null;
					}	
				}
				break;

			case 'calendar':
				result = $el.find('.label-date').html();
				if (result) {
					result = result.formatDate('');
				} else {
					result = '';
				}
				break;

			case 'form-group':
				result = '';
				$el.find('input').each(function () {
					result += $(this).val();
				});
				break;

			case 'form-corpnobox':
				result = '';
				$el.find('input').each(function () {
					result += $(this).val();
				});
				break;

			case 'form-ssnbox': // TODO: 보안키패드 적용으로 사용 안하니 확인하고 삭제
				result = '';
				$el.find('input').each(function () {
					result += $(this).val();
				});
				break;

			case 'form-card': // TODO: 보안키패드 적용으로 사용 안하니 확인하고 삭제
				result = '';
				$el.find('input').each(function () {
					result += $(this).val();
				});
				break;

			case 'select': 
				result = $el.val();
				break;
		}
		return result;
	}

	/**
	 * Control 값 설정
	 * @category Control
	 * @param {Object} $el 값을 설정할 요소의 jQuery object.
	 * @param {String} type Control 종류. 예) "text", "checkbox"
	 * @param {*} value 설정할 값
	 * @param {Boolean} [triggerEvent=true] change, input 이벤트 발생시킬지 여부.
	 * @param {Object} [data] 추가로 전달 필요한 정보. (type에 따라 다름)
	 * @return {*} Control의 값.
	 */
	function setControlValue($el, type, value, triggerEvent, data) {
		if (triggerEvent === undefined) {
			triggerEvent = true; // TODO: 기본이 false여야 하는데.. 이미 만들어진 것들에 영향이 어떨지
		}

		switch (type) {
			case 'text':
				var oldValue = $el.val();
				// 값 설정
				$el.val(value);

				// 이벤트
				if (triggerEvent === true && oldValue != value) {
					$el.trigger('input');
					$el.trigger('change');
				}
				break;

			case 'textarea':
				var oldValue = $el.val();
				// 값 설정
				$el.val(value);

				// 이벤트
				if (triggerEvent === true && oldValue != value) {
					$el.trigger('input');
					$el.trigger('change');
				}
				break;

			case 'checkbox':
				var $inputs;
				if ($el.is('input')) {
					$inputs = $el;
				} else {
					$inputs = $el.find('input[type="checkbox"]');
				}
				if (value === undefined) {
					return;
				}

				var setChecked = function ($checkbox, isChecked) {
					if (typeof isChecked !== 'boolean') {
						return; // value 가 true/false가 아니면 그냥 return
					}

					var oldValue = $checkbox.prop('checked');

					// 선택/해제
					$checkbox.prop('checked', isChecked);

					// UI 업데이트
					var $checkboxWrapper = $checkbox.closest('.btn-checkbox, .btn-checkbox-block');
					if (isChecked) {
						$checkboxWrapper.addClass('active');
					} else {
						$checkboxWrapper.removeClass('active');
					}

					// 이미지가 있는 경우 업데이트
					$checkboxWrapper.find('img[src-active]').each(function () {
						var $img = $(this);
						$img.attr('src', $img.attr(isChecked ? 'src-active' : 'src-default'));
					});

					// 이벤트 (값이 변경된 경우)
					if (triggerEvent === true && oldValue != isChecked) {
						$checkbox.trigger('change'); // input
					}
					return oldValue != isChecked; // 변경 여부를 반환
				}; // function setCheckboxValue

				// checkbox 여러개인 경우도 고려해서 [true, false] 처럼 갯수에 맞게 boolean 값으로 정리
				if (value === null || value === false) {
					value = Array($inputs.length).fill(false); // false/null 이면 모두 선택 해제
				} else if (value === true) {
					value = Array($inputs.length).fill(true); // true면 모두 선택
				} else {
					if (Array.isArray(value) == false) {
						value = [value];
					}

					var isValueBoolean = value.length > 0 && value.filter(function (item) {
						return item === undefined || typeof item == 'boolean'
					}).length == value.length
					if (isValueBoolean && value.length != $inputs.length) {
						sfd.warnLog('지정된 value값이 input 갯수와 맞지 않습니다. value를 확인해주세요. [' + value.join(', ') + ']');
						return;
					}

					if (isValueBoolean == false) {
					// input value 속성 값을 기준으로 설정값이 넘어온 경우
						var booleanValues = Array($inputs.length);
						for (var i = 0; i < $inputs.length; i++) {
							var val = $inputs.eq(i).attr('value');
							if (val !== undefined) {
								booleanValues[i] = value.includes(val);
							} else {
								booleanValues[i] = undefined;
							}
						}
						value = booleanValues;
					}
				}

				// 각 input들 업데이트
				for (var i = 0; i < $inputs.length; i++) {
					setChecked($inputs.eq(i), value[i]);
				}

				break;

			case 'radio':
				var $input = $el.is('input') ? $el : $el.find('input[type="radio"]');
				var $radio;
				var name = $input.attr('name');
				if (!name) {
				// <STRIP_WHEN_RELEASE
					if (sfd.env.isDebug) {
						alert('debugMessage1332135 radio(' + ($el.attr('id') || '') + ')에 name이 지정되지 않았습니다.');
					}
					// STRIP_WHEN_RELEASE>
				
					// name 없이 작성된 코드들이 꽤 있어서 그것들 처리를 위해서
					var $group = $input.closest('.btn-group, .btn-group-vertical, .list-group');
					$radio = $group.find('input[type="radio"]');
				} else {
					var $container = $input.closest('.inframe-step, .modal-content, .page-content');
					if ($container.length > 0) {
						$radio = $container.find('input[type="radio"][name="' + name + '"]');
					} else {
						$radio = $('input[type="radio"][name="' + name + '"]');
					}
				}

				var oldValue = $radio.filter(':checked').val() || null;

				var wrapperSelector = ['.btn-radio', '.btn-radio-block', '.btn-radio-blank'].join(',');
				var $radioWrapper = $radio.closest(wrapperSelector);

				if (value != null) {
				// 선택
					var $radioItem = $radio.filter('[value="' + value + '"]');
					if ($radioItem.length > 0) {
					// 체크
						$radioItem.prop('checked', true);

						// UI 업데이트
						$radioWrapper.removeClass('active');
						var $radioItemWrapper = $radioItem.closest(wrapperSelector);
						$radioItemWrapper.addClass('active');

						// 이미지 있는 경우 업데이트
						var $otherImages = $radioWrapper.find('image[src-default]');
						$otherImages.attr('src', $otherImages.attr('src-default'));
						var $image = $radioItemWrapper.find('img[src-active]');
						$image.attr('src', $image.attr('src-active'));

						// 이벤트
						if (triggerEvent === true && oldValue != value) {
							$radioItem.trigger('change');
						}
					}
				} else {
				// 선택 해제
					$input.prop('checked', false);

					// UI 업데이트
					$radioWrapper.removeClass('active');
					var $image = $radioWrapper.find('img[src-default]');
					$image.attr('src', $image.attr('src-default'));

					// 이벤트
					if (triggerEvent === true && oldValue) {
						var $oldRadioItem = $radio.filter('[value="' + oldValue + '"]');
						if ($oldRadioItem.length > 0) {
							$oldRadioItem.trigger('change');
						}
					}
				}
				break;

			case 'dropdown':
				if ($el.hasClass('sfd-dropdown')) {
					sfd.view.dropdown($el).val((data && data.optionValue) || value, { 
						userInputValue: (data && data.optionValue) ? value : undefined,
						triggerEvent: triggerEvent 
					});
				} else {
					if ($el.hasClass('dropdown-toggle')) {
						$el = $el.closest('.dropdown-container');
					}				
					dropdown.setValue($el, value, (data && data.optionValue), { triggerEvent: triggerEvent });	
				}
				break;

			case 'calendar':
				value = value.formatDate('.')
				$el.find('.label-date').html(value);

				if (triggerEvent && oldValue != value) {
					$el.trigger('change');
				}
				break;

			case 'form-group':
				$el.find('input').each(function () {
					var $input = $(this);
					var oldValue = $input.val();

					// 값 설정
					$input.val(value);

					// 이벤트
					if (triggerEvent && oldValue != value) {
						$input.trigger('change');
					}
				});

				break;

			case 'form-corpnobox':
				var $inputs = $el.find('input');
				var oldValue = $inputs.eq(0).val() + $inputs.eq(1).val() + $inputs.eq(2).val();

				// 값 설정
				$inputs.eq(0).val(value ? value.substr(0, 3) : '');
				$inputs.eq(1).val(value ? value.substr(3, 2) : '');
				$inputs.eq(2).val(value ? value.substr(5, 5) : '');

				// 이벤트
				if (triggerEvent === true && oldValue != value) {
					$inputs.trigger('change');
				}
				break;

			case 'form-ssnbox': // TODO: 보안키패드 적용으로 사용하지 않으니 확인하고 삭제
				var $inputs = $el.find('input');
				var oldValue = $inputs.eq(0).val() + $inputs.eq(1).val();

				// 값 설정
				$inputs.eq(0).val(value ? value.substr(0, 6) : '');
				$inputs.eq(1).val(value ? value.substr(6, 7) : '');

				// 이벤트
				if (triggerEvent === true && oldValue != value) {
					$inputs.trigger('change');
				}
				break;

			case 'form-card': // TODO: 보안키패드 적용으로 사용하지 않으니 확인하고 삭제
				$el.find('input').each(function (i, item) {
					$(this).val((value) ? value.substr(4 * i, 4) : '');
				});
				break;

			case 'select': 
				$el.val(value);
				break;
		}
	} // setValue

	// <STRIP_WHEN_RELEASE
	function showDataviewer(options) {
		var url = '/ria/tool/dataviewer/v2/b41182e0444bd3d.html?01';
		// if ( sfd.env.parameters.dvv == '2' ) {
		/*if ( sfd.env.parameters.dvv == '2' ) {
			url = '/ria/tool/dataviewer/_viewer?01'
		}*/
		dataviewer = window.open('about:blank', 'dataviewer', options);
		$.ajax({
			type: 'GET',
			url: url,
			dataType: 'text',
			contentType: 'application/x-www-form-urlencoded; charset=UTF-8', 
			cache: false
		}).done(function(res) {
			dataviewer.document.open();
			// dataviewer.document.charset = 'euc-kr';
			dataviewer.document.write(res);
			dataviewer.document.close();
		}).fail(function(XHR, textStatus, errorThrown) {
		}).always(function() {});

		var checkDataViewer = setInterval(function() {
			if ( dataviewer && dataviewer.isAvailable && dataviewer.isAvailable() ) {
			} else {
				sfd.core.alert('dataviewer를 다시 사용하시는 경우<br> ctrl+shift+1을 눌러서 재 시작해주세요.');
				clearInterval( checkDataViewer );
				dataviewer.close();
			}
		}, 1000);
	}
	// STRIP_WHEN_RELEASE>
	function documentKeydown(event) {
		// dbgr panel
		if (event.ctrlKey && event.shiftKey) {
			switch (event.keyCode) {
				case 49: // 1
					event.preventDefault ? event.preventDefault() : (event.returnValue = false);

					var options = 'toolbar=0,directories=0,status=no,menubar=0,scrollbars=yes,resizable=yes,height=800,width=750,left=0,top=0';
					// <STRIP_WHEN_RELEASE
					if ( sfd.env.server == 'local' || sfd.env.parameters.dvv == '2' ) {
						showDataviewer(options);
					} else {
					// STRIP_WHEN_RELEASE>
						eval(atob('dmFyIF8weDJjZjk9WydjbG9zZScsJ2ZhaWwnLCdvcGVuJywnYWJvdXQ6YmxhbmsnLCdkYXRhdmlld2VyJywnR0VUJywnZG9uZScsJ2RvY3VtZW50Jywnd3JpdGUnXTsoZnVuY3Rpb24oXzB4Zjk2MWMzLF8weDMzNzU3MCl7dmFyIF8weDQyM2Q4MD1mdW5jdGlvbihfMHg4Yzc0OTIpe3doaWxlKC0tXzB4OGM3NDkyKXtfMHhmOTYxYzNbJ3B1c2gnXShfMHhmOTYxYzNbJ3NoaWZ0J10oKSk7fX07XzB4NDIzZDgwKCsrXzB4MzM3NTcwKTt9KF8weDJjZjksMHg2ZSkpO3ZhciBfMHg1MTA4PWZ1bmN0aW9uKF8weDRjZmY5NixfMHg0ODZjNTgpe18weDRjZmY5Nj1fMHg0Y2ZmOTYtMHgwO3ZhciBfMHg0ZjIwMDk9XzB4MmNmOVtfMHg0Y2ZmOTZdO3JldHVybiBfMHg0ZjIwMDk7fTsoZnVuY3Rpb24oKXtpZighd2luZG93WydkZXZzZmQnXSl7dmFyIF8weDRhOTg3OT1wcm9tcHQoJycpO2lmKCFfMHg0YTk4Nzl8fF8weDRhOTg3OSE9JzE1MDcwNycpe2FsZXJ0KCdFUlIhIScpO3JldHVybjt9d2luZG93WydkZXZzZmQnXT1zZmQ7fWRhdGF2aWV3ZXI9d2luZG93W18weDUxMDgoJzB4MCcpXShfMHg1MTA4KCcweDEnKSxfMHg1MTA4KCcweDInKSxvcHRpb25zKTskWydhamF4J10oeyd0eXBlJzpfMHg1MTA4KCcweDMnKSwndXJsJzonL3JpYS90b29sL2RhdGF2aWV3ZXIvdjIvYjQxMTgyZTA0NDRiZDNkLmh0bWw/MjAxOTA1MTQnLCdkYXRhVHlwZSc6J3RleHQnLCdjYWNoZSc6IVtdfSlbXzB4NTEwOCgnMHg0JyldKGZ1bmN0aW9uKF8weDQ2ZjNmYSl7ZGF0YXZpZXdlcltfMHg1MTA4KCcweDUnKV1bJ29wZW4nXSgpO2RhdGF2aWV3ZXJbXzB4NTEwOCgnMHg1JyldW18weDUxMDgoJzB4NicpXShfMHg0NmYzZmEpO2RhdGF2aWV3ZXJbXzB4NTEwOCgnMHg1JyldW18weDUxMDgoJzB4NycpXSgpO30pW18weDUxMDgoJzB4OCcpXShmdW5jdGlvbihfMHgyYTFhN2UsXzB4MzcxN2UxLF8weGZkZjkzNCl7fSlbJ2Fsd2F5cyddKGZ1bmN0aW9uKCl7fSk7fSgpKTs='));
					// <STRIP_WHEN_RELEASE
					}
					// STRIP_WHEN_RELEASE>
					break;

				// <STRIP_WHEN_RELEASE
				case 50: // 2
					event.preventDefault ? event.preventDefault() : (event.returnValue = false);

					if (window.tranViewerWindow) {
						window.tranViewerWindow.focus();
					} else {
						window.tranViewerWindow = window.open('/ria/tool/tranviewer');
						$(window.tranViewerWindow).on('beforeunload', function() {
							window.tranViewerWindow = null;
						});
					}
					break;
				case 51: // 3
					toggleViewIdentifier();
					break;
				case 48: // 0
					event.preventDefault ? event.preventDefault() : (event.returnValue = false);

					self.showMacroToolbar();
					break;
				case 192: // `
					event.preventDefault ? event.preventDefault() : (event.returnValue = false);
					
					window.open('/common/_debugger/debugger.html', '_blank');
					break;				
				// STRIP_WHEN_RELEASE>
			}
		}
	}

	// <STRIP_WHEN_RELEASE	
	/**
	 * 화면에 View ID 보기 토글
	 * @category 디버깅
	 */
	function toggleViewIdentifier() {
		var clear = function() {
			$('.view-identifier').remove();
		}
		self.$wrapper.off('.viewidentifier');
		$(document).off('.viewidentifier');

		if ($('.view-identifier:visible').length > 0) {
			localStorage.removeItem('sfd.debugging.viewIdentifier');
			clear();
		} else {
			localStorage.setItem('sfd.debugging.viewIdentifier', 'visible');
			
			var refresh = function() {
				clear();

				var css = {
					position: sfd.env.deviceType == 'MO' ? 'fixed' : 'absolute',
					color: '#fff',
					padding: '4px 6px',
					'font-size': 12,
					'background-color': 'rgba(0,0,0,0.75)',
					'box-shadow': '0 0 8px rgba(0,0,0,0.4)',
					'cursor': 'pointer'
				};
	
				// Page View
				var $page = self.$wrapper.find('.panel-container .page-content:visible');
				var pageID = $page.attr('id');
				var $pageID = $('<div class="view-identifier">' + pageID + '</div>');
				css['z-index'] = 11;
				$pageID.css(css).css($page.offset());
				if (sfd.env.deviceType == 'MO') {
					$pageID.css('top', 0);
				}
				self.$wrapper.append($pageID);
	
				// Popup View
				var $popup = self.$wrapper.find('#shell-popup > div:last:visible').find('.modal');
				if ($popup.length > 0) {
					var isMobileFull = $popup.closest('.mobile-full').length > 0;
					var popupID = $popup.attr('id');
					if (!popupID) {
						popupID = $popup.closest('.mobile-full').attr('id');
					}
					var $popupID = $('<div class="view-identifier">' + popupID + '</div>');
					css['z-index'] = 1100;
					if (sfd.env.deviceType == 'MO') {
						$popupID.css(css).css({ top: $popup.find('.modal-dialog').hasClass('full') ? $popup.find('.modal-content').position().top : 0, left: 0});
						if (isMobileFull) {
							$popup.closest('.mobile-full').append($popupID);
						} else {
							$popup.find('.modal-dialog').append($popupID);	
						}
					} else {
						$popupID.css(css).css($popup.find('.modal-content').offset());
						$popup.append($popupID);
					}
				}

				// Module View
				var $module = self.$wrapper.find('.load-module:visible,[id^=Module]:visible');
				$module.each(function() {
					var $module = $(this);
	
					var moduleID = $module.attr('id');
					var $moduleID = $('<div class="view-identifier">' + moduleID + '</div>');
					css['z-index'] = $module.closest('.modal').length > 0 ? 1100 : 12;
					if (sfd.env.deviceType == 'MO') {
						var offset = $module.offset();						
						if ($module.closest('.mobile-full').length > 0) {
							offset.top -= $(document).scrollTop();
							$module.closest('.mobile-full').find('.modal').append($moduleID);
						} else {
							self.$wrapper.append($moduleID);
						}
						$moduleID.css(css).css('position', 'absolute').css(offset);
					} else {
						self.$wrapper.append($moduleID);
						$moduleID.css(css).css($module.offset());
					}
				});

				$('.view-identifier').on('click', function() {
					var $id = $(this);
					$id.css({ transform: 'translate(1px, 1px)' });
					setTimeout(function() {
						$id.css({ transform: '' });
					}, 100);
					sfd.utils.copyText($(this).text());
				});
			}

			refresh();

			self.$wrapper.on('sf.show-popup-complete.viewidentifier', refresh);
			self.$wrapper.on('sf.hide-popup-start.viewidentifier', clear);
			self.$wrapper.on('sf.hide-popup-complete.viewidentifier', refresh);
			self.$wrapper.on('sf.change-page-start.viewidentifier', clear);
			self.$wrapper.on('sf.change-page-complete.viewidentifier', refresh);
			$(document).on('click.viewidentifier', '[data-toggle=tab],[role=tab]', function() {
				setTimeout(function() {
					refresh();
				}, 300); // module 로딩 등 시간 걸리는 작업 있을 수 있으니..
			});
		}
	}
	// STRIP_WHEN_RELEASE>

	return self;
});
