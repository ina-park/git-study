define(function () {
	'use strict';

	var sfd = null;
	var isIE8Below = !!navigator.userAgent.match(/msie\s[5-8]/i);
	var deviceType = 'mobile';
	var support = {
		form: true
	};

	if (!Function.prototype.bind) {
		Function.prototype.bind = function (oThis) {
			if (typeof this !== 'function') {
				// closest thing possible to the ECMAScript 5
				// internal IsCallable function
				throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
			}
	
			var aArgs = Array.prototype.slice.call(arguments, 1),
				fToBind = this,
				fNOP = function () {},
				fBound = function () {
					return fToBind.apply(this instanceof fNOP && oThis ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
				};
	
			fNOP.prototype = this.prototype;
			fBound.prototype = new fNOP();
	
			return fBound;
		};
	}

	// /*
	//  * Template Control
	//  * @class SFDTemplate
	//  */	
	// var SFDTemplate = (function() {
	// 	var SFDTemplate = function(target) {
	// 		this.$target = $(target);
	// 	};
	// 	SFDTemplate.DATAKEY = 'SFDTemplate';

	// 	SFDTemplate.prototype = {
	// 		/*
	// 		 * Template Control 생성
	// 		 * @param {Object} option 옵션
	// 		 * Key | Type | 기본값 | 설명
	// 		 * ---|---|---|---
	// 		 */
	// 		init: function(option) {
	// 			option = $.extend({
	// 			}, option);

	// 			this.option = option;
	// 			this.$target.data(SFDTemplate.DATAKEY, this);
	// 			this.id = createUUID();
	// 		},
			
	// 		destroy: function() {				
	// 			this.$target.removeData(SFDTemplate.DATAKEY);
	// 		}			
	// 	};

	// 	return SFDTemplate;
	// })();

	/**
	 * 모바일 스크롤바. sfd.view.scrollBox() 사용하세요.
	 * @class SFDScrollbar
	 * @param {String|Object} target 스크롤바 적용할 요소.
	 * @example
	 * ```js
	 * sfd.view.scrollbar($('#container')).init(); // 생성
	 * sfd.view.scrollbar($('#container')).refresh(); // 갱신
	 * ```
	 */
	var SFDScrollbar = (function() {
		var SFDScrollbar = function (target) {
			this.$target = $(target); /// <요소캐싱> @private {Object} CoverageValuePicker를 적용할 대상 요소
			this.options = null; /// <저장> @private {Object} 옵션
		}
		SFDScrollbar.DATAKEY = 'SFDScrollbar';
		// SFDScrollbar.supports = ['mobile'];
		SFDScrollbar.prototype = {
			/**
			 * 스크롤바 초기화
			 * @category 초기화
			 */
			init: function (options) {
				if (!/android/i.test(navigator.userAgent)) {
					return;
				}

				options = $.extend({}, options);

				this.options = options;
				this.$target.data(SFDScrollbar.DATAKEY, this);
				this.$target.addClass('scrollbar-hidden');
				this.contentHeight = 0;
				this.targetHeight = 0;			

				this.refresh();

				return this
			},
			/**
			 * init() 사용하세요. (deprecated)
			 * @category 초기화
			 */
			create: function (options) {
				return this.init(options);
			},

			/**
			 * 스크롤바 제거
			 * @category 초기화
			 */
			destroy: function () {
				this.$target.removeClass('scrollbar-hidden').find('.sfd-scrollbar').remove();
				this.$target.removeData(SFDScrollbar.DATAKEY);
			},

			/**
			 * 스크롤바 갱신 (내용 변경되어 스크롤바 다시 계산되야 할 때 호출)
			 * @category 기능
			 */
			refresh: function () {
				if (!/android/i.test(navigator.userAgent)) {
					return;
				}
				if (!this.$target || this.$target.length == 0) {
					return;
				}

				var $target = this.$target;
				var scrollbar = this;

				var $scrollbar = $target.find('.sfd-scrollbar');
				if ($scrollbar.length == 0) {
					$scrollbar = $('<div class="sfd-scrollbar"></div>');
				} else {
					$scrollbar.hide();
				}

				this.contentHeight = $target[0].scrollHeight; //this.$target.find('ul').innerHeight();
				this.targetHeight = $target.height();

				if (this.contentHeight - this.targetHeight <= 0) {
					// 스크롤바 필요 없는 높이면 스크롤바 제거
					$target.off('scroll.sfdscrollbar');
					$scrollbar.remove();
					return;
				} else {
					// 스크롤바 높이 정하기
					var scrollbarHeight = Math.max(10, this.targetHeight * (this.targetHeight / this.contentHeight));
					$scrollbar.css('height', scrollbarHeight).show();
				}

				if ($target.find('.sfd-scrollbar').length == 0) {
					$target.append($scrollbar);

					scrollbar.updatePosition();

					// scroll event handler
					$target.off('scroll.sfdscrollbar').on('scroll.sfdscrollbar', function () {
						var scrollbar = $(this).data(SFDScrollbar.DATAKEY);
						if (scrollbar) {
							scrollbar.updatePosition();
						}
					});
				} else {
					scrollbar.updatePosition();
				}
			},

			/**
			 * 스크롤바 위치 업데이트
			 * @private
			 */
			updatePosition: function () {
				var $scrollbar = this.$target.find('.sfd-scrollbar');
				if ($scrollbar.length == 0) {
					return;
				}

				var scrollTop = this.$target.scrollTop();
				var y = scrollTop;
				var containerHeight = this.targetHeight - 2;
				var height = containerHeight - $scrollbar.innerHeight();
				var contentHeight = this.contentHeight; //this.$target[0].scrollHeight; //this.$target.find('ul').innerHeight();
				var scrollbarY = y + height * y / (contentHeight - containerHeight);
				if (scrollbarY < 0) {
					scrollbarY = 0;
				} else if (scrollbarY >= contentHeight - $scrollbar.innerHeight()) {
					scrollbarY = contentHeight - $scrollbar.innerHeight();
				}
				// $scrollbar.css('top', scrollbarY + 1);
				var y = scrollbarY + 1;
				y = Math.round(y);

				if ($scrollbar.position().top != y) {
					var translate = 'translate(0, ' + y + 'px)';
					$scrollbar.css({
						'transform': translate,
						'-webkit-transform': translate
					});
				}
			}
		}
		return SFDScrollbar;
	})();

	/// @endclass

	/**
	 * 담보 값 선택 Control.
	 * @class SFDCoverageValuePicker
	 * @example
	 * HTML
	 * ```html
	 * <div class="sfd-coverage-value-picker" id="coverage-value-picker1"></div>
	 * ```
	 * 
	 * JS
	 * ```js
	 * // 생성
	 * sfd.view.coverageValuePicker($('#coverage-value-picker1')).init({
	 * 	maxVisibleCount: 4,
	 * 	items: [
	 * 		{ label: '사망후유장애<br>1천만<br>부상1000만', amount: 3270, value: 0 },
	 * 		{ label: '사망후유장애<br>3천만<br>부상1500만', amount: 4310, value: 1 },
	 * 		{ label: '사망후유장애<br>5천만<br>부상3000만', amount: 5220, value: 2 },
	 * 		{ label: '사망후유장애<br>8천만<br>부상5000만', amount: 6220, value: 3 }
	 * 	],
	 * 	onChange: function(value, index, item) {
	 * 		console.log('coverageValuePicker change', value, index, item);
	 * 	}
	 * });
	 * 
	 * sfd.view.coverageValuePicker($('#coverage-value-picker1')).val(1); // 값 설정
	 * var value = sfd.view.coverageValuePicker($('#coverage-value-picker1')).val(); // 값 확인
	 * ```
	 */
	var SFDCoverageValuePicker = (function () {

		var SFDCoverageValuePicker = function (target) {
			this.$target = $(target); /// <요소캐싱> @private {Object} CoverageValuePicker를 적용할 대상 요소
			this.options = null; /// <저장> @private {Object} 옵션. init() 참고
			this.value = undefined; /// <저장> @private 값 저장
			this.itemWidth = 124; /// <화면처리> @private {Number} 항목 너비
			this.visibleItemCount = 0; /// <화면처리> @private {Integer} 보이는 갯수
			this.scrollIndex = 0; /// <화면처리> @private {Integer} 제일 왼쪽에 보여지는 항목 index
			this.maxLine = 1; /// <화면처리> @private {Integer} Label 제일 많은 line 수.

			this.$prevButton = null; /// <요소캐싱> @private {Object} 이전버튼 요소 캐싱
			this.$nextButton = null; /// <요소캐싱> @private {Object} 다음버튼 요소 캐싱
			this.$slider = null; /// <요소캐싱> @private {Object} 슬라이더 요소 캐싱
			this.$sliderContainer = null; /// <요소캐싱> @private {Object} 슬라이더 container 요소 캐싱
		};
		SFDCoverageValuePicker.DATAKEY = 'SFDCoverageValuePicker';

		SFDCoverageValuePicker.prototype = {
			/**
			 * 담보선택 Control 초기화
			 * @category 초기화
			 * @param {Object} options 옵션 
			 * Key | Type | 기본값 | 설명
			 * ---|---|---|---
			 * items | Array | [] | {label: String, amount: Number, value: String or Integer, [diff: Number], [disabled: Boolean], [isRecommended: Boolean] } 형태의 Object 배열. amount를 null 로 하면 값 표시 안됨. disabled true로 하면 비활성화되고 선택 불가.
			 * rowLabel | String or Array | ['가입금액', '보험료'] | 왼쪽 Label
			 * defaultValue | String or Integer | - | 생성할 때 기본 선택할 값
			 * markDefaultValue | Boolean | false | defaultValue 항목 표시할지 여부
			 * maxVisibleCount | Integer | 3 | 몇 개 보여질지
			 * itemWidth | Number | - | 항목 너비
			 * itemHeight | Number | - | 항목 높이
			 * labelFontSize | String | - | Label 폰트 크기. "small", "xsmall"
			 * labelMinHeight | Number | - | 항목 Label 최소 높이
			 * isAnimated | Boolean | true | 선택했을 때 애니메이션 여부
			 * isCompact | Boolean | false | 너비가 좁은 형태인 경우 true로 설정.
			 * onBeforeChange | Function | - | 사용자가 값 변경 하려고 할 때 콜백(변경 되기 전). function(newItem, oldItem, newIndex, oldIndex){}.<br>이 콜백에서 false 리턴하면 값 변경 안됨.
			 * onChange | Function | - | 값 변경 완료 후 콜백. function(value, index, item){}
			 */
			init: function (options) {
				options = $.extend({
					items: [],
					rowLabel: ['가입금액', '보험료'],
					defaultValue: undefined,
					markDefaultValue: false,
					maxVisibleCount: 3,
					selectedLabelVisible: false,
					isAnimated: true,
					isCompact: false,
					onBeforeChange: null,
					onChange: null
				}, options);

				if (isIE8Below) {
					// IE8 이하에서는 애니메이션 처리 제외
					options.isAnimated = false;
				}

				// 기존에 만들어진거 있었으면 제거
				var old = this.$target.data(SFDCoverageValuePicker.DATAKEY);
				if (old) {
					old.destroy();
				}
				this.scrollIndex = 0;

				this.options = options;
				this.$target.data(SFDCoverageValuePicker.DATAKEY, this);
				
				// HTML 구성
				this.$target.removeClass('small-label xsmall-label');
				if (options.labelFontSize == 'small' || options.labelFontSize == 'xsmall') {
					this.$target.addClass(options.labelFontSize + '-label');
				}
				this.render();

				// Element 캐시
				this.$sliderContainer = this.$target.find('.slider-container');
				this.$slider = this.$target.find('.slider-list');
				this.$prevButton = this.$target.find('.slider-btn.type-prev');
				this.$nextButton = this.$target.find('.slider-btn.type-next');

				this.updateButtons();

				// 이벤트 등록
				this.initEvents();

				// 기본값 있으면 세팅
				if (options.defaultValue !== undefined) {
					this.val(options.defaultValue);
				}
				return this;
			},

			/**
			 * init() 사용하세요. (deprecated)
			 * @category 초기화
			 * @param {*} options 
			 */
			create: function(options) {
				return this.init(options);
			},

			/**
			 * Target 요소에 저장되어있던 SFDCoverageValuePicker 객체 제거
			 * @category 초기화
			 */
			destroy: function () {
				this.$target.prop('value', undefined);
				this.$target.removeData(SFDCoverageValuePicker.DATAKEY);
			},

			/**
			 * setItems() 사용하세요. (deprecated)
			 * @category Items
			 * @param {Array} items 변경할 항목 배열. {label: String, amount: Number, value: String or Integer, disabled: Boolean} 형태의 Object 배열
			 * @see
			 * 기존 선택된 값이 새 items에 없거나 disabled면 value는 undefined로 초기화됨
			 */
			update: function (items) {
				this.setItems(items);
			},

			/**
			 * 현재 설정되어 있는 항목 목록 얻기.
			 * @category Items
			 * @return {Array} 현재 지정되어 있는 항목 목록.
			 */
			getItems: function() {
				return this.options.items;
			},

			/**
			 * 항목 전체 변경
			 * @category Items
			 * @param {Array} items 변경할 항목 배열. {label: String, amount: Number, value: String or Integer, [diff: Number], [disabled: Boolean], [isRecommended: Boolean]} 형태의 Object 배열
			 * @see
			 * 기존 선택된 값이 새 items에 없거나 disabled면 value는 undefined로 초기화됨
			 */
			setItems: function(items) {
				this.options.items = items;

				// Item 목록 다시 생성
				this.renderItems(items, this.$slider);
				this.layoutUI();
				this.updateButtons();
				this.initEvents();

				// 기존 설정되어 있던 값이 새 items에 없으면 값 초기화
				var found = false;
				for (var i = 0; i < items.length; i++) {
					if (items[i].value == this.value && items[i].disabled !== true) {
						found = true;
						break;
					}
				}

				// 값 다시 설정
				if (found == true) {
					this.val(this.value);
				} else {
					this.val(undefined);
					
					if (this.scrollIndex >= items.length - this.visibleItemCount) {
						// 스크롤 범위 벗어나있으면 처음으로
						this.setScrollIndex(0);
					}
				}
			},

			/**
			 * 여러 항목 한번에 업데이트
			 * @category Items
			 * @param {Array} items 업데이트할 값들을 넣은 배열. 업데이트하지 않을 항목은 null 지정. (현재 항목 갯수와 같아야 함)
			 * @example
			 * ```js
			 * // 1, 2번째 항목 amount 값만 업데이트
			 * sfd.view.coverageValuePicker('#coverage-value-picker').updateItems([ { amount: 1000 }, { amount: 5000 }, null, null ]);
			 * ```
			 */
			updateItems: function(items) {
				if (items.length != this.options.items.length) {
					// <STRIP_WHEN_RELEASE					
					sfd && sfd.core.alert('항목 갯수가 맞지 않습니다.');
					// STRIP_WHEN_RELEASE>
					return;
				}
				this.options.items.forEach(function(item, index) {
					if (items[index]) {
						$.extend(item, items[index]);
					}
				});

				this.setItems(this.options.items);
			},

			/**
			 * 특정 항목 업데이트
			 * @category Items
			 * @param {Integer} index 업데이트할 항목 index.
			 * @param {Object} item 업데이트할 항목 값. (여기에 값 지정한 것만 업데이트 됨)
			 * @param {Boolean} [replace=false] item에 지정한거로 완전 교체하는 경우 true로 지정.
			 * @example
			 * ```js
			 * // 세번째 항목 amount 값만 업데이트
			 * sfd.view.coverageValuePicker('#coverage-value-picker').updateItem(2, { amount: 1000 });
			 * 
			 * // 세번째 항목 통째로 교체
			 * sfd.view.coverageValuePicker('#coverage-value-picker').updateItem(2, { label: '항목1', amount: 1000, value: 2 }, true);
			 * ```
			 */
			updateItem: function(index, item, replace) {
				if (replace !== true) {
					item = $.extend(this.options.items[index], item);
				}
				this.options.items[index] = item;

				this.setItems(this.options.items);
			},

			/**
			 * 값 확인/설정
			 * @category 사용
			 * @param {String|Integer} [value] 값 설정하고 싶은 경우 항목의 value.
			 * @return {String|Integer} 설정된 값 반환.
			 * @see
			 * val() 함수로 값 설정하는 경우 onBeforeChange, onChange 콜백 호출되지 않음.
			 */
			val: function (value) {
				if (value === undefined) {
					// get
					return this.value;
				} else {
					// set
					var $target = this.$target;
					var item = null;
					var index = -1;
					for (var i = 0; i < this.options.items.length; i++) {
						if (this.options.items[i].value === value) {
							item = this.options.items[i];
							index = i;
							break;
						}
					}
					if (item) {
						// value 저장
						this.value = value;
						this.$target.prop('value', value);

						// UI 업데이트
						var $oldItem = $target.find('.slider-item a[aria-selected="true"]');
						var $newItem = this.$target.find('.slider-item').eq(index).find('a');

						// 기존 선택 해제
						$oldItem.attr('aria-selected', 'false')
						$oldItem.find('.label .sr-only').remove(); // 접근성처리

						// 새 항목 선택
						$newItem.attr('aria-selected', 'true');
						$newItem.find('.label').append('<span class="sr-only">선택됨</span>'); // 접근성처리

						this.makeItemVisible($newItem.closest('li'));
					} else {
						this.value = undefined;
						this.$target.prop('value', this.value);

						// UI 업데이트
						var $oldItem = $target.find('.slider-item a[aria-selected="true"]');
						// 기존 선택 해제
						$oldItem.attr('aria-selected', 'false')
						$oldItem.find('.label .sr-only').remove(); // 접근성처리
					}
					return this.value;
				}
			},

			/**
			 * 선택된 항목 index 얻기
			 * @category 사용
			 * @return {Integer} 현재 선택된 항목의 index 반환. 선택된 것 없는 경우 -1.
			 * @example
			 * ```js
			 * var index = sfd.view.coverageValuePicker('#coverageValuePicker').index(); // 현재 선택된 index
			 * ```
			 */
			getSelectedIndex: function() {
				var value = this.value;
				return this.options.items.findIndex(function(item) {
					return item.value == value;
				});
			},

			/**
			 * 항목 index로 선택
			 * @category 사용
			 * @param {Integer} index 선택하려는 항목의 index.
			 * @example
			 * ```js
			 * sfd.view.coverageValuePicker('#coverageValuePicker').index(2); // 세번째 항목 선택
			 * ```
			 */
			selectAtIndex: function(index) {
				if (index >= this.options.items.length) {
					consoleWarn('index(' + index + ')가 범위를 벗어났습니다.');
					return;
				}
				this.val(index < 0 ? null : this.options.items[index].value);
			},

			/**
			 * 항목 클릭 이벤트 핸들러
			 * @category 이벤트 처리
			 * @private
			 */
			onItemClick: function (event) {
				event.preventDefault ? event.preventDefault() : (event.returnValue = false);

				var $a = $(event.currentTarget);
				var $target = this.$target;
				var $oldItem = $target.find('.slider-item a[aria-selected="true"]');
				var newItem = $a.data('item');
				var newIndex = $a.data('index');

				if ($a.is($oldItem) || newItem.disabled === true) {
					// 이미 선택된 항목이거나 비활성화된 항목이면 패스
					return;
				}

				// onBeforeChange
				if (this.options.onBeforeChange) {
					var oldItem = $oldItem.data('item');
					var oldIndex = $oldItem.data('index');
					if (this.options.onBeforeChange(newItem, oldItem, newIndex, oldIndex) === false) {
						// onBeforeChange에서 false 반환하는 경우 더이상 진행 X
						return;
					}
				}

				// 애니메이션
				if (this.options.isAnimated && $oldItem.length) {
					var $target = this.$target;
					var $sliderContainer = this.$sliderContainer;
					var $animateBox = $('<a class="animation-inner-btn"></a>');
					$animateBox.css({
						position: 'absolute',
						left: $oldItem.position().left,
						top: $oldItem.position().top,
						width: $oldItem.outerWidth(),
						height: $oldItem.outerHeight()
					});
					$sliderContainer.append($animateBox);
					$sliderContainer.addClass('animating');

					$animateBox.animate({
						left: $a.position().left
					}, 200, 'easeOutQuad', function() {
						// 애니메이션 끝
						$target.find('.animation-inner-btn').remove();
						$sliderContainer.removeClass('animating');
					});
				}

				// 값 설정
				this.val(newItem.value);
				
				// onChange
				if (this.options.onChange) {
					this.options.onChange.call(this, newItem.value, newIndex, newItem);
				}
				// change 이벤트 발생
				this.$target.trigger('change');
			},

			/**
			 * 항목 Focus 이벤트 핸들러
			 * @category 이벤트 처리
			 * @private
			 */
			onItemFocus: function () {
				this.$sliderContainer.scrollLeft(0);

				var $a = $(event.currentTarget || document.activeElement);
				var $li = $a.closest('li');

				this.makeItemVisible($li);
			},

			/**
			 * 이전 버튼 클릭 이벤트 핸들러
			 * @category 이벤트 처리
			 * @private
			 */
			onPrevClick: function (event) {
				event.preventDefault ? event.preventDefault() : (event.returnValue = false);

				this.setScrollIndex(this.scrollIndex - 1, true);
			},

			/**
			 * 다음 버튼 클릭 이벤트 핸들러
			 * @category 이벤트 처리
			 * @private
			 */
			onNextClick: function (event) {
				event.preventDefault ? event.preventDefault() : (event.returnValue = false);

				this.setScrollIndex(this.scrollIndex + 1, true);
			},

			/**
			 * 이전/다음 버튼 활성화 여부 업데이트
			 * @category 화면처리
			 * @private
			 */
			updateButtons: function () {
				this.$prevButton.attr('aria-disabled', this.scrollIndex == 0 ? 'true' : 'false');
				this.$nextButton.attr('aria-disabled', this.scrollIndex + this.visibleItemCount >= this.options.items.length ? 'true' : 'false');
			},

			/**
			 * 컨트롤 HTML 생성
			 * @category 화면처리
			 * @private 
			 */
			render: function () {
				var options = this.options;
		
				// 비우고
				this.$target.empty();
				if (options.isCompact === true) {
					this.$target.addClass('type-compact');
				}

				// Row Label
				var rowLabels = Array.isArray(options.rowLabel) ? options.rowLabel : [options.rowLabel];
				var rowLabelItems = rowLabels.map(function(label) {
					return '<strong class="item">' + (label || '') + '</strong>';
				});
				this.$target.append('<div class="row-label">' + rowLabelItems.join('') + '</div>');
				
				// Items
				var $slider = $('<div class="slider-container"><ul class="slider-list"></ul></div>');
				var $list = $slider.find('.slider-list');
				this.renderItems(options.items, $list);
				this.$target.append($slider);				

				// prev/next button
				this.$target.prepend('<a href="#" role="button" class="slider-btn type-prev" tabindex="-1" aria-disabled="true"><span class="icon">이전</span></a>');
				this.$target.append('<a href="#" role="button" class="slider-btn type-next" tabindex="-1" aria-disabled="true"><span class="icon">다음</span></a>');
				
				// 레이아웃 계산
				this.layoutUI();
			},			

			/**
			 * 항목 HTML 구성
			 * @category 화면처리
			 * @private
			 * @param {Array} items 항목들 정보
			 * @param {Object} [$container] 생성되니 목록 넣을 container jQuery object.
			 * @return {Array} li 요소 jQuery object 배열.
			 */
			renderItems: function (items, $container) {
				// label max line
				this.maxLine = 1;
				for (var i = 0; i < items.length; i++) {
					var numLines = (items[i].label.match(/<br\s?\/?>/gi) || []).length + 1;
					if (numLines > this.maxLine) {
						this.maxLine = numLines;
					}
				}

				var _this = this;
				var $items = items.map(function(item, index) {
					return renderItem.call(_this, item, index);
				});

				if ($container) {
					$container.html($items);
				}

				return $items;
			},

			/**
			 * Layout 계산
			 * @category 화면처리
			 * @private
			 */
			layoutUI: function() {
				var $slider = this.$target.find('.slider-list');

				// row-label 필요에 따라 보이기/감추기
				var amountCount = this.options.items.filter(function(item) { 
					return item.amount != null 
				}).length;				
				this.$target.find('.row-label .item:eq(1)')[amountCount > 0 ? 'show' : 'hide']();

				// label title 높이
				this.$target.find('.row-label .item:eq(0)').height($slider.find('.slider-item:eq(0) .label').height());

				var $sliderContainer = this.$target.find('.slider-container');
				var boundsWidth = $sliderContainer.width();
				this.itemWidth = boundsWidth / this.options.maxVisibleCount;
				this.visibleItemCount = parseInt(boundsWidth / this.itemWidth, 10);

				var $items = this.$target.find('.slider-item');
				var $as = $items.find('a');

				// 항목 너비
				$items.css('width', this.itemWidth);

				// 항목 내용 너비
				if (this.options.itemWidth) {
					// 옵션 지정 값이 있으면 그 값으로
					$as.css('width', this.options.itemWidth);
				} else {
					if ($as.eq(0).width() > this.itemWidth) {
						$as.css('width', this.itemWidth - (this.options.isCompact ? 4 : 0));
					}
				}

				// 항목 내용 높이
				$as.css('height', this.options.itemHeight);
				// 항목 내용 Label 높이
				if (this.options.labelMinHeight) {
					this.$target.find('.row-label .item').eq(0).css('min-height', this.options.labelMinHeight);
					$as.find('.label').css('min-height', this.options.labelMinHeight);
				}

				// 추가 조정 필요한 부분
				if (this.options.items.length <= this.options.maxVisibleCount && this.options.items.length == 2) {
					// 항목이 2개만 있는 경우에는 가운데로 좀 모아서
					var $sliderWidth = $as.outerWidth() * 2 + 50/*간격*/;
					var boundsWidth = $sliderContainer.width();
					if ($sliderWidth < boundsWidth) {						
						var padding = Math.floor((boundsWidth - $sliderWidth) / 2);
						$sliderContainer.css({
							'padding-left': padding,
							'padding-right': padding
						});
						this.itemWidth = (boundsWidth - padding * 2) / this.options.maxVisibleCount;
						$items.css('width', this.itemWidth);
					}
				}
			},

			/**
			 * 이벤트 초기화
			 * @category 이벤트 처리
			 * @private
			 */
			initEvents: function () {
				var eventName = 'click.sfdcoverageValuePicker';

				this.$target.find('.slider-item a').off('focus.sfdcoverageValuePicker').on('focus.sfdcoverageValuePicker', this.onItemFocus.bind(this));
				this.$target.find('.slider-item a').off(eventName).on(eventName, this.onItemClick.bind(this));
				this.$nextButton.off(eventName).on(eventName, this.onNextClick.bind(this));
				this.$prevButton.off(eventName).on(eventName, this.onPrevClick.bind(this));
			},

			/**
			 * 특정 항목 화면상에서 벗어나있는 경우 화면에 보이도록 함.
			 * @category 화면처리
			 * @private
			 * @param {jQueryObject} $item 항목 li jQuery object
			 */
			makeItemVisible: function($item) {
				var $li = $item;
				var index = this.$slider.find('li').index($li);
				var scrollIndex = this.scrollIndex;

				if (index < this.scrollIndex) {
					scrollIndex = index;
				} else if (index >= this.scrollIndex + this.visibleItemCount) {
					scrollIndex = Math.max(0, index - this.visibleItemCount + 1);
				}
				
				this.setScrollIndex(scrollIndex);
			},

			/**
			 * 스크롤 index 지정.
			 * @category 컨트롤
			 * @private 
			 * @param {Integer} index 
			 * @param {Boolean} animated 
			 */
			setScrollIndex: function(index, animated) {
				if (animated === undefined) {					
					animated = false;
				}

				// index 보정 필요한 경우 보정
				if (index < 0) {
					index = 0;
				} else if (index > this.options.items.length - this.visibleItemCount) {
					index = Math.max(0, this.options.items.length - this.visibleItemCount);
				}
				
				if (this.scrollIndex == index) {
					// 변화가 없으면 패스
					return;
				}

				// 값 저장
				this.scrollIndex = index;

				// UI 업데이트
				var left = -this.itemWidth * this.scrollIndex;
				if (animated) {
					this.$slider.stop().animate({
						'margin-left': left
					}, 200, 'easeOutQuad');	
				} else {
					this.$slider.css({
						'margin-left': left
					});	
				}

				this.updateButtons();
			}
		}; // SFDCoverageValuePicker

		function renderItem(item, index) {
			var $li = $('<li class="slider-item" role="presentation"></li>');
			var $a = $('<a href="#" role="tab" class="inner-btn" aria-selected="false"></a>');

			var label = item.label.split('\n').join('<br>');
			var amountHTML = item.amount !== null ? '<span>' + formatNumber(item.amount) + '</span>원' : '&nbsp;';

			if (this.maxLine > 1) {
				var numLines = (label.match(/<br\s?\/?>/gi) || []).length + 1;
				if (numLines < this.maxLine)	{
					label += Array(this.maxLine - numLines + 1).join('<br>&nbsp;');
				}
			}

			// label
			$a.append('<p class="label" aria-label="' + this.options.rowLabel[0] + '">' + label + '</p>');			
			// amount
			$a.append('<p class="amount" aria-label="' + this.options.rowLabel[1] + '">' + amountHTML + '</p>');
			// diff
			if (this.options.rowLabel.length > 2) {
				var diff = '';
				var prefix = '';
				if (item.diff !== undefined && item.diff !== null) {
					diff = formatNumber(item.diff);
					prefix = item.diff > 0 ? '+' : '';
				}
				diff = diff ? prefix + diff + '원' : '&nbsp;';
				$a.append('<p class="info-add" aria-label="' + this.options.rowLabel[2] + '">' + diff + '</p>');
			}

			$a.data({ index: index, item: item });
			$li.append($a);

			// "현재" 표시
			if (this.options.selectedLabelVisible === true) {
				$a.append('<span class="flag-selected-label">현재</span>');
			}

			// 기본값 표시
			if (this.options.markDefaultValue && this.options.defaultValue === item.value) {
				$a.append('<span class="default-value-mark"></span>');
			}

			// 추천값 표시
			if (item.isRecommended) {
				$a.append('<span class="unit-flag-recomm type-star">추천</span>');
				$a.addClass('type-recomm');
			}

			// 비활성화 항목
			if (item.disabled) {
				$li.addClass('disabled');
				$a.attr('aria-disabled', 'true');
			}

			return $li;
		}

		function formatNumber(n) {
			if (!n) {
				return '0';
			}
			var regExp = new RegExp('(-?[0-9]+)([0-9]{3})');
			var result = String(n);
			var separator = ',';
			while (regExp.test(result)) {
				result = result.replace(regExp, '$1' + separator + '$2');
			}
			return result;
		}


		return SFDCoverageValuePicker;
	})();

	/**
	 * Dropdown Control.
	 * @class SFDDropdown
	 * @example
	 * HTML
	 * ```html
	 * <span class="sfd-dropdown" id="dropdown1"></span>
	 * ```
	 * 
	 * JS
	 * ```js
	 * sfd.view.dropdown($('#dropdown1')).init({
	 * 	 items: [
	 * 	   { label: '옵션1', value: '01' },
	 * 	   { label: '옵션2', value: '02' },
	 * 	   { label: '옵션3', value: '03' }
	 * 	 ],
	 *   defaultLabel: '옵션선택',
	 *   onBeforeOpen: function() {
	 *     // 열리기 전에 items 변경하고 싶은 경우
	 *     this.setItems(sfd.listValue.phoneCompanies, { updateValue: false }); // 기존 선택 값은 유지
	 *   },
	 *   onChange: function(value, label, item) {
	 * 		
	 * 	 }
	 * });
	 * 
	 * sfd.view.dropdown($('#dropdown1')).val('01'); // 값 설정
	 * var value = sfd.view.dropdown($('#dropdown1')).val(); // 값 확인
	 * ```
	 */

	var SFDDropdown = (function() {
		var SFDDropdown = function(target) {
			this.$target = $(target); /// <요소캐싱> @private {Object} Dropdown 적용 대상 요소.
			this.$button = null; /// <요소캐싱> @private {Object} 버튼 요소 캐싱
			this.$wrapper = null; /// <요소캐싱> @private {Object} Wrapper 요소 캐싱
			this.$userInputWrapper = null; /// <요소캐싱> @private {Object} 사용자입력 요소 캐싱

			this.device = deviceType; /// <저장> @private {String} 기기종류. "pc" 또는 "mobile"
			this.options = null; /// <저장> @private {Object} 옵션
			this.id = null; /// <저장> @private {String} 식별자
			this.value = null; /// <저장> @private {String} 옵션 목록의 값
			this.userInputValue = null; /// <저장> @private {String} 사용자 정의 옵션 선택한 경우 입력 값
			this.quickSearchText = ''; /// <저장> @private {String} 키보드 입력으로 찾기 텍스트
			this.lastQuickSearchInputTime = null; /// <저장> @private {Number} 마지막 키보드 입력 시간
		};
		SFDDropdown.DATAKEY = 'SFDDropdown';

		SFDDropdown.prototype = {
			/**
			 * Dropdown Control 생성
			 * @category 초기화
			 * @param {Object} options 옵션
			 * Key | Type | 기본값 | 설명
			 * ---|---|---|---
			 * **items** | Array | [] | {label: String, value: String} 형태의 Object 배열.
			 * defaultLabel | String | "선택" | 선택 값 없을 때 label.
			 * defaultValue | String | - | 생성할 때 기본으로 선택 할 값.
			 * title | String | - | 버튼 요소의 title 속성. Mobile의 경우 DropdownPopup에 제목으로도 사용됨.
			 * width | Integer | - | 너비. .sfd-dropdown 요소에 스타일로 너비 지정해 놓으면 그거 사용함.
			 * height | Number | 300 | 메뉴 높이.
			 * onBeforeOpen | Function | - | 메뉴 열리기 전 콜백. function(){}.<br>이 콜백에서 false 리턴하면 dropdown 메뉴 안열림.<br>setItems() 함수로 열리기 전 항목 설정 가능.
			 * onOpen | Function | - | 메뉴 열린 후 콜백. function(){}
			 * onClose | Function | - | 메뉴 닫힌 후 콜백. function(){}
			 * onChange | Function | - | 값 변경 콜백. function(value, label, item){}
			 * onUserInput | Function | - | 사용자 값 변경 콜백. function(value, label, item){}
			 */
			init: function(options) {
				options = $.extend({
					items: [],
					defaultValue: null,
					defaultLabel: '선택',
					title: '',					
					width: parseInt(this.$target.css('width'), 10),
					height: 300,
					onBeforeOpen: null,
					onOpen: null,
					onClose: null,
					onChange: null,
					onUserInput: null
				}, options);

				// <STRIP_WHEN_RELEASE
				if (this.$target.hasClass('dropdown-container')) {
					var message = 'sfd.view.dropdown()을 사용하려면 HTML을 아래처럼 사용해주세요.<br><br>&lt;span class="sfd-dropdown" id="my-dropdown"&gt;&lt;/span&gt;';
					sfd && sfd.core.alert(message);
					consoleWarn(message);
				}				
				// STRIP_WHEN_RELEASE>

				this.options = options;
				this.$target.data(SFDDropdown.DATAKEY, this);
				this.id = createUUID();
				
				// HTML 생성
				render.call(this);
				renderMenu.call(this);

				// 이벤트 등록
				initEventHandlers.call(this);

				return this;
			},

			/**
			 * init() 사용하세요. (deprecated)
			 * @category 초기화
			 */
			create: function(options) {
				return this.init(options);
			},
			
			/**
			 * 제거
			 * @category 초기화
			 */
			destroy: function() {				
				this.$target.removeData(SFDDropdown.DATAKEY);
			},

			/**
			 * 옵션 변경 (defaultLabel, title, width 지원).
			 * @category 사용
			 * @param {Object} options 변경할 옵션. (defaultLabel, title, width 지원)
			 */
			update: function(options) {
				$.extend(this.options, options);

				// defaultLabel
				if (options.defaultLabel) {
					if (this.value === null) {
						this.$button.find('label').html(options.defaultLabel);
					}
				}
				// title
				if (options.title) {
					if (options.title) {
						this.$button.attr('title', options.title);
					}
				}
				// width
				if (options.width) {
					this.$button.css('width', options.width);
				}
				// items
				if (options.items) {
					this.setItems(options.items);
				}
			},

			/**
			 * Dropdown 메뉴 열기
			 * @category 사용
			 */
			open: function() {
				// 열기 전 이벤트
				if (this.options.onBeforeOpen) {
					if (this.options.onBeforeOpen.call(this) === false) {
						return;
					}
				}
				
				var $dropdown = this.$target;
				var $menu = $dropdown.find('.sfd-dropdown-menu');
				if ($menu.length == 0) {
					return; // 이미 열려있거나 menu가 생성되어 있지 않음
				}
				
				var userInputValue = this.userInputValue;
				var value = this.value;

				// 선택된 값 처리
				var $oldSelectedItem = $menu.find('li.active');
				$oldSelectedItem.removeClass('active');
				$oldSelectedItem.find('.sr-only').remove(); // 접근성

				var $selectedItem = $menu.find('li[data-value="' + value + '"]');
				if ($selectedItem.length > 0) {
					// 리스트 중 선택
					$selectedItem.addClass('active');
					$selectedItem.find('a').append(' <span class="sr-only">선택됨</span>'); // 접근성
				} else if ($selectedItem.length == 0 && userInputValue) {
					// 직접입력
					$dropdown.find('.user-self').val(userInputValue);
				}

				// Dropdown이 scroll 되는 컨텐츠 안에 있는 경우 처리
				setScrollContainerEnabled.call(this, false);
				
				// 값 초기화
				this.quickSearchText = '';

				// 화면에 표시
				$menu.detach().appendTo($('#wrapper'));
				updateMenuPosition.call(this, $menu);
				$menu.show();

				// 접근성
				this.$button.attr('aria-expanded', true);
				
				// 스크롤 필요없는 경우 스크롤 영역 제거
				var optionHeight = parseInt(this.options.height, 10);
				var menuHeight = $menu.prop('scrollHeight');
				$menu.css('overflow-y', optionHeight >= menuHeight ? 'hidden' : '');

				// 메뉴 열림 이벤트 trigger (열리고 처리해야할거 처리할 수 있도록)
				$dropdown.trigger('shown.sfddropdown');

				// 포커스 처리
				var $focusItem = $menu.find('li.active');
				if ($focusItem.length == 0 && this.options.scrollTo !== undefined && this.options.scrollTo !== null) {
					$focusItem = $menu.find('li[data-value="' + this.options.scrollTo + '"]');
				}
				if ($focusItem.length == 0) {
					$focusItem = $menu.find('li').eq(0);
				}
				$focusItem.find('a').focus();

				// 이벤트
				$menu.off('keydown.sfddropdown').on('keydown.sfddropdown', onMenuKeyDown.bind(this)); // ESC 키, 방향키 처리
				$menu.find('li a').off('click.sfddropdown').on('click.sfddropdown', onMenuItemClick.bind(this)); // 항목 클릭
				
				// 윈도우 크기 변경될 때 위치 조정
				$(window).off('resize.sfddropdown').on('resize.sfddropdown', updateMenuPosition.bind(this));
				$(document).off('.sfddropdown').on({
					'sfd.close-all-float': onDocumentCloseAllFloat.bind(this),
					'scroll.sfddropdown': updateMenuPosition.bind(this), // 스크롤 변경될 때 위치 조정
					'mousedown.sfddropdown': onDocumentMouseDown.bind(this),
					'focusin.sfddropdown': onDocumentFocusIn.bind(this) // 메뉴 포커스 잃었을 때 닫히도록
				});
			},

			/**
			 * Dropdown 메뉴 닫기
			 * @category 사용
			 */
			close: function() {
				var $menu = dropdownMenuWithID(this.id).filter(':visible');

				// 이벤트 제거
				$menu.off('.sfddropdown');
				$(document).off('.sfddropdown');
				$(window).off('.sfddropdown');
				
				if ($menu.length == 0) {
					return; // 열려있지 않음
				}
				var $dropdown = this.$target;
				var $button = this.$button;

				// 닫고, 원래 위치로 돌려놓기
				$menu.hide().detach().appendTo(this.$wrapper);

				// innerScroll 안에 있으면 scroll 다시 enabled 처리
				setScrollContainerEnabled.call(this, true);

				// 접근성
				$button.attr('aria-expanded', false);
				if ($dropdown.find('input.user-self').is(document.activeElement) == false) {
					$button.focus();
				}

				if (this.options.onClose) {
					this.options.onClose.call(this);
				}
			},

			/**
			 * 선택 옵션 목록 설정
			 * @category 사용
			 * @param {Array} items Dropdown 메뉴 항목. { value: String, label: String } object 배열.
			 * @param {Object} options 옵션.
			 * Key | Type | 기본값 | 설명
			 * ---|---|---|---
			 * updateValue | Boolean | true | 기존 설정된 값이 새로운 items에 없는 경우 설정된 값 초기화시킬지 여부.
			 */
			setItems: function(items, options) {
				options = $.extend({
					updateValue: true
				}, options);
	
				var $dropdown = this.$target;
	
				if (!items || items.length == 0) {
					consoleWarn('SFDDropdown:' + $dropdown.attr('id') + '의 data가 비어있습니다.');
				}
			
				// 저장
				this.options.items = items; 
				
				var oldValue = this.value;

				// 입력받은 items로 선택 목록 구성	
				renderMenu.call(this);
	
				if (options.updateValue == true) {
					var valueExists = items.filter(function(item) {
						return item.value == oldValue;
					}).length > 0;
	
					// 새 목록에 선택된 값이 없으면 reset
					if (oldValue !== null && valueExists == false) {
						this.val(null);
					}
				}	
			},
			/**
			 * 선택 옵션 목록 얻기
			 * @category 사용
			 * @return {Array} 현재 지정된 옵션 목록.
			 */
			getItems: function() {
				return this.options.items;
			},

			/**
			 * 활성화 여부 확인
			 * @category 사용
			 * @return {Boolean} 활성화 상태면 true, 아니면 false.
			 */
			isEnabled: function(options) {
				options = $.extend({
					visualOnly: false
				}, options);

				if (options.visualOnly == true) {
					return this.$target.hasClass('fake-disabled') == false;
				} else {
					return this.$button.prop('disabled');
				}
			},

			/**
			 * 활성화 여부 설정
			 * @category 사용
			 * @param {Boolean} [isEnabled=true] 활성화 여부.
			 */
			setEnabled: function(isEnabled, options) {
				options = $.extend({
					visualOnly: false
				}, options);

				if (isEnabled === undefined) {
					isEnabled = true;
				}

				if (options.visualOnly == true) {
					isEnabled ? this.$target.removeClass('fake-disabled') : this.$target.addClass('fake-disabled');
				} else {
					this.$button.prop('disabled', !isEnabled);
				}
			},

			/**
			 * 값 확인/설정
			 * @category 사용
			 * @param {String} [value] 값 설정하고 싶은 경우 항목의 value.
			 * @param {Object} [options] 옵션
			 * Key | Type | 기본값 | 설명
			 * ---|---|---|---
			 * userInputValue | String | - | 사용자 입력 항목인 경우 사용자 입력 값.
			 * triggerEvent | Boolean | false | change 이벤트 발생시킬지 여부.
			 * @return {String} 설정된 값 반환.
			 * 사용자 입력 항목이 선택된 경우 선택 항목의 value가 아니라 사용자 입력한 값이 반환됨.
			 * 
			 * 선택 항목의 value 값을 얻고 싶은 경우 getValue() 함수 사용.
			 * ```js
			 * var value = sfd.view.dropdown('#dropdown').getValue();
			 * ```
			 * @see
			 * 사용자 입력 항목이 두 개 이상인 경우 값 설정.
			 * ```js
			 * sfd.view.dropdown('#dropdown').val('01', { userInputValue: '실제입력값' });
			 * ```
			 */
			val: function (value, options) {
				if (value === undefined) {
					// get
					return getValue.call(this);
				} else {
					// set
					setValue.call(this, value, options);
				}
			},

			/**
			 * 선택된 항목의 value 값 얻기.
			 * @category 사용
			 * @return {String} 선택된 항목의 value 값. 선택이 없으면 undefined.
			 */
			getValue: function() {
				return this.value;
			},

			/**
			 * 현재 선택된 항목의 label 얻기.
			 * @category 사용
			 * @return {String} 현재 선택된 값의 label.
			 */
			getLabel: function() {
				var item = this.getItem();
				return item ? item.label : null;
			},

			/**
			 * 현재 선택된 항목 또는 value 값 가진 항목 찾기.
			 * @category 사용
			 * @param {String} [value] 찾을 항목의 value. 지정 안하면 현재 선택된 항목
			 * @return {Object} 발견한 항목 객체. 발견 못한 경우 undefined.
			 */
			getItem: function(value) {
				var result = undefined;
				if (value === undefined) {
					// 현재 선택 항목
					if (!this.options || !this.options.items || this.options.items.length == 0 || this.value === null || this.value === undefined) {
						return result;
					}
	
					for (var i = 0; i < this.options.items.length; i++) {
						if (this.options.items[i].value == this.value) {
							result = this.options.items[i];
							break;
						}
					}	
				} else {
					// value에 해당하는 항목
					for (var i = 0; i < this.options.items.length; i++) {
						if (this.options.items[i].value == value) {
							result = this.options.items[i];
							break;
						}
					}	
				}
				return result;
			}
		};

		/**
		 * Dropdown HTML 생성
		 * @category 화면처리
		 * @private
		 */
		function render() {
			var $dropdown = this.$target;
			var options = this.options;
			var device = this.device;

			// 버튼, 항목메뉴 생성
			var $button = createButton.call(this);
			var $menu = createMenu.call(this);

			var $wrapper = $('<div class="control-wrapper"></div>');
			$wrapper.append($button);
			$wrapper.append($menu);

			if (device == 'mobile') {
				$wrapper.addClass('device-mobile');
			}
			if (options.width == '100%') {
				$wrapper.addClass('btn-block');
			}
			$dropdown.html($wrapper);

			// placement가 top이면
			if (options.placement == 'top') {
				$wrapper.wrap('<div class="dropup"></div>');
			}
			
			$button.data('oriHeight', ($button.innerHeight() < 0) ? 19 : $button.innerHeight());

			// ID 지정
			$dropdown.attr('data-dropdown-id', this.id);
			$menu.attr('data-dropdown-id', this.id);
			
			// 주요 요소 캐싱
			this.$button = $button;
			this.$wrapper = $wrapper;

			return $dropdown;
		}

		/**
		 * Dropdown 메뉴 생성
		 * @category 화면처리
		 * @private
		 */
		function renderMenu() {
			var items = this.getItems();

			var list = items.map(function(item) {
				var value = String(item.value);

				// li 만들고
				var $li = $('<li><a href="#shell" log-id="dropdown-item">' + item.label + '</a></li>');

				// li 속성 및 값 설정하고
				$li.data('item', item);
				$li.attr('data-value', value);

				// 구분선이면 divider class 넣고
				if (value == 'divider') {
					$li.addClass('divider');
				}
				return $li;
			});

			var $menu = this.$target.find('.sfd-dropdown-menu');
			return $menu.html(list);
		}

		/**
		 * Dropdown 사용자 입력 항목 선택한 경우 입력 input 생성
		 * @category 화면처리
		 * @private
		 */
		function renderUserInput(item) {
			if (this.$userInputWrapper) {
				return;
			}

			// 생성
			var $userInputWrapper = $('<div class="form-group userinput-wrapper"></div>');
			$userInputWrapper.append('<input type="text" name="userinput" class="form-control" title="직접입력" autocomplete="off" placeholder="직접입력">');

			// 화면에 표시
			this.$wrapper.before($userInputWrapper);
			$userInputWrapper.show();

			// 요소 캐싱
			this.$userInputWrapper = $userInputWrapper;

			var $userInput = $userInputWrapper.find('input');
			
			// Event handler
			$userInput.on({
				'input.sfddropdown': onUserInput.bind(this),
				'change.sfddropdown': onUserInputChange.bind(this),
				'focus.sfddropdown': function() {
					$(this).closest('.sfd-dropdown').addClass('focus');
				},
				'blur.sfddropdown': function() {
					$(this).closest('.sfd-dropdown').removeClass('focus');
				}
			});
			if (isIE8Below) {
				$userInput.on('propertychange.sfddropdown', onUserInput.bind(this));
			}
		}

		/**
		 * 사용자 입력 input 제거
		 * @category 화면처리
		 * @private
		 */
		function removeUserInput() {
			if (this.$userInputWrapper) {
				this.$userInputWrapper.remove();
				this.$userInputWrapper = null;
			}
		}

		/**
		 * Dropdpown 버튼 생성
		 * @category 화면처리
		 * @private
		 */
		function createButton() {
			var $button = $('<button type="button" class="left" role="combobox"><span class="label"></span><span class="caret"></span></button>');
			$button.css('width', this.options.width);
			if (this.options.title) {
				$button.attr('title', this.options.title);
			}
			$button.find('.label').html(this.options.defaultLabel);

			if (this.device == 'mobile') {
				$button.addClass('form-control');
			} else {
				$button.addClass('btn');
			}

			return $button;
		}

		/**
		 * Dropdpown 메뉴 생성
		 * @category 화면처리
		 * @private
		 */
		function createMenu() {
			var $menu = $('<ul class="sfd-dropdown-menu scrollable-menu overflow_scrollable" role="menu"></ul>');
			$menu.css({
				'min-width': this.options.width,
				'max-height': this.options.height
			});
			return $menu;			
		}

		/**
		 * 기본 이벤트 handler 초기화
		 * @category 이벤트 처리
		 * @private
		 */
		function initEventHandlers() {
			if (this.device == 'pc') {
				// PC

				// Dropdown 메뉴 열렸을 때 이벤트 연결
				this.$target.off('shown.sfddropdown').on('shown.sfddropdown', onMenuShown.bind(this));

				// 키보드 이벤트
				var self = this;
				this.$button.off('keydown.sfddropdown').on('keydown.sfddropdown', function(event) {
					if (event.keyCode == 38/*Up*/ || event.keyCode == 40/*Down*/) {
						event.preventDefault ? event.preventDefault() : (event.returnValue = false);
						self.open();
					}
				});
			}

			this.$button.off('click.sfddropdown').on('click.sfddropdown', onDropdownClick.bind(this));
		}

		/**
		 * 값 얻기
		 * @category 컨트롤
		 * @private
		 * @return {String} 현재 선택된 값. 선택된 것이 없는 경우 null.
		 */
		function getValue() {
			return this.userInputValue !== null ? this.userInputValue : this.value;
		}

		/**
		 * 값 설정
		 * @category 컨트롤
		 * @private
		 * @param {String} value 설정할 값
		 * @param {Object} options 옵션
		 * Key | Type | 기본값 | 설명
		 * ---|---|---|---
		 * userInputValue | String | - | 사용자 입력 항목인 경우 사용자 입력 값.
		 * triggerEvent | Boolean | false | change 이벤트 발생시킬지 여부.
		 */
		function setValue(value, options) {
			options = $.extend({
				userInputValue: null,
				triggerEvent: false,
				isInputChange: false
			}, options);

			var $button = this.$button;
			var $dropdown = this.$target;

			if (value === null || value === undefined) {
				// 선택 해제
				$button.find('.label').html(this.options.defaultLabel);

				if (this.value != null) {
					this.value = null;
					this.userInputValue = null;
					$dropdown.prop('value', null);

					// 직접 입력 열려있던 경우 닫음
					removeUserInput.call(this);

					// event trigger
					if (options.triggerEvent === true) {
						triggerChangeEvent.call(this);
					}
				}					
			} else {
				// 선택
				var item = this.getItem(value);
				if (!item) {
					// 사용자입력 항목의 사용자입력이 value로 지정된 것으로 간주
					var userInputItems = this.options.items.filter(function(item) {
						return item.displayType == 'selfInput';
					});
					if (userInputItems.length == 1) {
						item = userInputItems[0];
						options.userInputValue = value;
						value = item.value;
					}
				}
				if (!item) {
					consoleLog('dropdown에 없는 값을 셋팅 하셨습니다. value : ' + value);
					return;
				}
	
				if (item.displayType == 'selfInput') {
					// 사용자 직접입력 항목

					// 사용자 입력 UI 보여줌
					renderUserInput.call(this, item);
					var $userInput = this.$userInputWrapper.find('input');
					$userInput.val(options.userInputValue).focus();

				} else {
					// 일반 항목
					removeUserInput.call(this);
				}

				var oldValue = this.value;

				// Value 업데이트
				this.value = value;
				this.userInputValue = options.userInputValue;
				$dropdown.prop('value', this.val());
				
				// Label 업데이트
				$button.find('.label').html(item.label);

				// Event trigger
				if (options.triggerEvent == true && oldValue != value) {
					triggerChangeEvent.call(this);
				}
			}
		}
		
		/**
		 * onChange 호출, $traget 요소에 change 이벤트 발생시킴
		 * @category 이벤트 처리
		 * @param {Boolean} [skipNativeEvent=false] `change` 이벤트 발생 생략하고 onChange 콜백만 호출하고 싶은 경우 true로 지정.
		 * @private
		 */
		function triggerChangeEvent(skipNativeEvent) {
			if (this.options.onChange) {
				this.options.onChange.call(this, this.val(), this.getLabel(), this.getItem());
			}

			if (skipNativeEvent !== true) {
				this.$target.trigger('change');
			}
		}

		/**
		 * Dropdown 메뉴의 위치 조정.
		 * @category 화면처리
		 * @private
		 * @see
		 * 화면이 작거나 한 경우 화면 영역 밖으로 나가지 않도록 처리해줌.
		 */
		function updateMenuPosition() {
			if (!this || !this.$button) {
				return;
			}
			var $menu = dropdownMenuWithID(this.id);
			if ($menu.length == 0) {
				return;
			}

			var buttonOffset = this.$button.offset();

			var y = buttonOffset.top + this.$button.closest('.control-wrapper').height();
			var x = buttonOffset.left;
			// 화면에서 벗어나면 조정
			if (y + $menu.height() > $(window).height() + $(document).scrollTop()) {
				y = $(window).height() + $(document).scrollTop() - $menu.height(); 
			}
			$menu.css({ left: x, top: y });
		}

		/**
		 * Dropdown을 포함하고 있는 scroll container의 스크롤 활성화 설정.
		 * @category 화면처리
		 * @private
		 * @param {Boolean} isEnabled Scroll container 스크롤 활성화 여부.
		 * @see
		 * Dropdown 메뉴가 열릴때 스크롤 비활성화 시켰다가, 닫힐 때 다시 활성화 시킴.
		 */
		function setScrollContainerEnabled(isEnabled) {
			var $dropdown = this.$target;
			var $scrollWrapper = $dropdown.closest('.slimScrollDiv');
			var scroller = $scrollWrapper.children().eq(0).data('scroller');
			if (!scroller) {
				return;
			}

			if (isEnabled) {
				// 스크롤 활성화
				scroller.setEnabled(true);
			} else {
				// 스크롤 비활성화
				scroller.setEnabled(false);

				if (this.$button) {
					var $wrapper = this.$button.closest('.control-wrapper');
					var buttonTop = $wrapper.offset().top + scroller.scrollTop() - $scrollWrapper.offset().top;
					var buttonHeight = $wrapper.height();
					if (buttonTop + buttonHeight > scroller.scrollTop() + $scrollWrapper.height()) {
						scroller.scrollTop(buttonTop + buttonHeight - $scrollWrapper.height(), false);
					}
				}
			}
		}

		/**
		 * Dropdown 메뉴 열린 후 처리
		 * @category 이벤트 처리
		 * @private
		 */
		function onMenuShown() {
			var $menu = $('.sfd-dropdown-menu[data-dropdown-id="' + this.id + '"]');

			var value = this.value;

			var valueToShow = value;
			if (valueToShow === null || valueToShow === undefined) {
				valueToShow = this.options.scrollTo;
			}
			// 특정 값 항목이 보이도록 스크롤 (설정된 값이 있을 때는 설정값으로 없는 경우 scrollTo 옵션이 있으면 그리로)
			if (valueToShow !== null && valueToShow !== undefined) {
				var $itemToShow = $menu.find('li[data-value="' + valueToShow + '"]');
				if ($itemToShow.length > 0) {
					makeItemVisible($menu, $itemToShow);
				}
			}

			// 열림 이벤트
			if (this.options.onOpen) {
				this.options.onOpen.call(this);
			}
		}

		/**
		 * Dropdown 메뉴에서 특정 항목을 보이도록 스크롤 처리
		 * @category 화면처리
		 * @private
		 * @param {Object} $menu Dropdown 메뉴 jQuery object.
		 * @param {Object} $item 보이도록 할 항목(li)의 jQuery object.
		 */
		function makeItemVisible($menu, $item) {
			var itemHeight = $item.height();
			var top = $menu.scrollTop() + $item.position().top;
			var contentHeight = itemHeight * $menu.find('li').length;
			if (top < $menu.scrollTop() || top + itemHeight > $menu.scrollTop() + $menu.height()) {
				top = top - $menu.height() / 2 + itemHeight / 2;
				if (top > contentHeight - $menu.height()) {
					top = Math.max(0, contentHeight - $menu.height());
				}
				$menu.scrollTop(top);	
			}
		}

		/**
		 * Dropdown 버튼 눌렸을 때 이벤트 handler.
		 * @category 이벤트 처리
		 * @private
		 */
		function onDropdownClick() {
			var $dropdown = this.$target;
			var options = this.options;

			if (this.device == 'mobile') {
				// Mobile

				// 키보드 닫히기
				sfd.view.closeSecureKeypad(); // TODO: 뭔가 밖으로 빼면 좋을 것 같은데

				if (this.options.onBeforeOpen) {
					if (this.options.onBeforeOpen.call(this) === false) {
						return;
					}
				}	

				// DropdownPopup 보여줌
				var items = this.getItems();
				if (!items || items.length == 0) {
					return;
				}
	
				sfd.core.showPopup('DropdownPopup', {
					id: this.$target,
					title: options.title,
					scrollTo: options.scrollTo,
					items: items,
					openHandler: this.options.openHandler ? this.options.openHandler.bind(this) : undefined,
					closeHandler: onMobilePickerClose.bind(this)
				});
	
			} else {
				// PC

				var $menu = $dropdown.find('.sfd-dropdown-menu');
				if ($menu.length > 0) {
					this.open();
				} else {
					this.close();
				}
			}
		}

		/**
		 * Dropdown 메뉴 항목 클릭했을 때 이벤트 handler.
		 * @category 이벤트 처리
		 * @private
		 * @param {Object} event 이벤트 객체
		 */
		function onMenuItemClick(event) {
			if (event) {
				event.preventDefault ? event.preventDefault() : (event.returnValue = false);
			}

			var $li = $(event.target).parent('li');
			var $button = this.$button;

			$(document).off('focusin.sfddropdown');
			this.close();

			// value및 라벨 셋팅
			var oldValue = this.value;
			var newValue = $li.data('item').value;
			var optionType = $li.data('item').displayType;
			
			if (oldValue == newValue) {
				// 선택했던 것 그대로 선택하면 아무것도 안함
				return;
			}

			if (optionType == 'selfInput') {
				// 직접입력 처리
				/* 아직 필요없는 옵션(내부스크롤이 있는 페이지 이면서 직접입력이 있는경우 그때가서 처리)
							$('#email-self-input').offset( {
								left:$(ns+' .dropdown-toggle').offset().left,
								top:$(ns+' .dropdown-toggle').offset().top-32
							} );*/
				// 새로 선택된 항목인 경우 사용자 입력 input 값 비움
				var userInputValue = this.userInputValue;
				if (newValue != this.value) {
					userInputValue = '';
				}
				this.val(newValue, { userInputValue: userInputValue, triggerEvent: true });

				this.$userInputWrapper.find('input').focus();
			} else {
				// 값 선택
				this.val(newValue, { triggerEvent: true });

				$button.trigger('focus');
			}
		}

		/**
		 * Dropdown 메뉴에서 키 입력 이벤트 handler.
		 * @category 이벤트 처리
		 * @private
		 * @param {Object} event 이벤트 객체
		 */
		function onMenuKeyDown(event) {
			var $menu = dropdownMenuWithID(this.id);
			if ($menu.length == 0) {
				return;
			}

			switch (event.keyCode) {
				case 27: // ESC
					this.close();
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
				case 8: // Backspace
					if (this.quickSearchText) {
						this.quickSearchText = this.quickSearchText.slice(0, -1);
						jumpTo(this.options.items, $menu, this.quickSearchText);
					}
					break;
				default:
					var isAlpha = (event.keyCode >= 65 && event.keyCode <= 90);
					var isNum = (event.keyCode >= 48 && event.keyCode <= 57);
					if (isAlpha || isNum) {
						if (this.quickSearchText && this.lastQuickSearchInputTime) {
							// 마지막 키 입력에서 시간 조금 지난 상태면 초기화 하고 다시 시작
							var now = (new Date()).getTime();
							if (now - this.lastQuickSearchInputTime > 1500) {
								this.quickSearchText = '';
							}
						}
						this.lastQuickSearchInputTime = (new Date()).getTime();

						// 키보드로 label 앞부분 입력해서 바로 이동하기
						var char = String.fromCharCode(event.keyCode);
						if (!event.shiftKey) {
							char = char.toLowerCase();
						}
						this.quickSearchText += char;

						if (jumpTo(this.options.items, $menu, this.quickSearchText) == false) {
							// 매칭되는 것 못 찾음							
							if (this.quickSearchText.length > 1) {


								// 한글을 찾는게 아니라고 판단하면, quickSearchText 초기화
								if (['qwertadsfgzxcv'].includes(this.quickSearchText[0].toLowerCase()) == false ||
									['qwertadsfgzxcv'].includes(this.quickSearchText[1].toLowerCase()) == true) {
									this.quickSearchText = '';
								}
							}
						}
					}
					break;
			}
		}

		/**
		 * Dropdown 메뉴에서 특정 항목으로 focus 이동.
		 * @category 컨트롤
		 * @private
		 * @param {Array} items 항목 배열
		 * @param {Object} $menu Dropdown 메뉴 jQuery object.
		 * @param {String} text 찾을 텍스트
		 * @return {Boolean} 찾았으면 true, 못찾았으면 false.
		 */
		function jumpTo(items, $menu, text) {
			var index = -1;
			var focusedIndex = $menu.find(':focus').closest('li').index();

			var find = function(items, text, fromIndex, toIndex) {
				var result = -1;
				toIndex = toIndex !== undefined ? toIndex : items.length - 1;
				for (var i = fromIndex; i < toIndex + 1; i++) {
					if (items[i].label.toLowerCase().replace(/\s/g, '').startsWith(text)) {
						result = i;
						break;
					}
				}
				return result;
			}

			var search = function(items, text) {
				var result = -1;
				if (focusedIndex > 0) {
					// 현재 포커스부터 뒤로 찾아봄
					result = find(items, text, focusedIndex);
				}
				if (result == -1) {
					// 처음부터 찾아봄
					result = find(items, text, 0, focusedIndex <= 0 ? undefined : focusedIndex);
				}
				return result;
			}

			// 영문으로 찾아보고
			var engText = text.toLowerCase().replace(/\s/g, '');
			index = search(items, engText);

			// 없으면 한글로도 찾아보고
			if (index == -1) {
				var korText = eng2kor(text).toLowerCase().replace(/\s/g, '');
				index = search(items, korText);
			}

			if (index != -1) {
				var $focusItem = $menu.find('li').eq(index);
				makeItemVisible($menu, $focusItem);
				$focusItem.find('a').focus();
				return true;
			} else {
				return false;
			}
		}

		/**
		 * 사용자 입력 항목 input input 이벤트 handler.
		 * @category 이벤트 처리
		 * @private
		 * @param {Object} event 이벤트 객체
		 */
		function onUserInput(event) {
			var $input = $(event.target);
			var userInputValue = $input.val();

			if (this.userInputValue != userInputValue) {

				this.userInputValue = userInputValue;
				this.$target.prop('value', userInputValue);

				// Event trigger
				// this.$target.trigger('input');
				if (this.options.onUserInput) {
					this.options.onUserInput.call(this, userInputValue);
				}
			}
		}

		/**
		 * 사용자 입력 항목 input change 이벤트 handler.
		 * @category 이벤트 처리
		 * @private
		 * @param {Object} event 이벤트 객체
		 */
		function onUserInputChange(event) {
			var $input = $(event.target);
			var userInputValue = $input.val();

			this.userInputValue = userInputValue;
			this.$target.prop('value', userInputValue);

			// Event trigger
			triggerChangeEvent.call(this, true);
		}

		/**
		 * Mobile에서 선택 팝업 닫힘 이벤트 handler.
		 * @category 이벤트 처리
		 * @private
		 * @param {Object} result 선택된 항목. 취소한 경우 null.
		 */
		function onMobilePickerClose(result) {
			if (!result || result == 'notchange') {
				if (this.options.onClose) {
					this.options.onClose.call(this);
				}
				return;
			}

			var oldValue = this.value;
			var newValue = String(result.value);

			// 같은 값이 선택되면 아무것도 하지 않음
			if (newValue == oldValue) {
				if (this.options.onClose) {
					this.options.onClose.call(this);
				}
				return;
			}

			// value 설정
			this.val(newValue, { triggerEvent: true });

			// 이벤트
			if (this.options.onClose) {
				this.options.onClose.call(this);
			}
		}

		/**
		 * `sfd.close-all-float` 이벤트 발생 처리
		 * @category 이벤트 처리
		 * @private
		 */
		function onDocumentCloseAllFloat() {
			this.close();
		}

		/**
		 * document mousedown 이벤트 처리. Dropdown 영역 외에 발생하면 dropdown 메뉴 닫음.
		 * @category 이벤트 처리
		 * @private
		 * @param {Object} event 이벤트 객체
		 */
		function onDocumentMouseDown(event) {
			if (event.target && $(event.target).closest('.sfd-dropdown-menu').length == 0) {
				// 메뉴 영역 바깥 클릭한 경우만
				if (this.$target.is($(event.target).closest('.sfd-dropdown')) == false) {
					this.close();
				}
			}
		}
		
		/**
		 * document focusin 이벤트 처리.
		 * @category 이벤트 처리
		 * @private
		 * @param {Object} event 이벤트 객체
		 * @see
		 * 현재는 dropdown 메뉴 열렸을 때 탭키 처리를 메뉴 안에서만 돌게 처리해놓아서 여기선 특별히 하는 일 없음.
		 */
		function onDocumentFocusIn(event) {
			// var $menu = $('.sfd-dropdown-menu[data-dropdown-id="' + this.id + '"]:visible');
			// 열려진 메뉴가 없으면 이벤트 핸들러 제거하고 리턴
			// if ($menu.length != 1) {
			// 	$(document).off('focusin.sfddropdown');
			// 	return;
			// }

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

			var $userInputWrapper = this.$userInputWrapper;
			if ($userInputWrapper && $userInputWrapper.find('input').is(event.target)) {
				var $input = $userInputWrapper.find('input');
				this.close();
				$input.focus();
				return;
			}

			if ($.contains(this.$target[0], event.target)) {
				return;
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
		}

		/**
		 * DropdownID로 SFDDropdown 객체 얻기.
		 * @private
		 * @param {String} dropdownID Dropdown ID (data-dropdown-id 속성으로 되어 있음)
		 * @return {Object} Dropdown 메뉴 jQuery object.
		 */
		function dropdownMenuWithID(dropdownID) {
			var $menu = $('.sfd-dropdown-menu[data-dropdown-id="' + dropdownID + '"]');
			return $menu;
		}

		/**
		 * 영문 텍스트를 한글로 변환
		 * @private
		 * @param {String} text 변환할 영문 텍스트
		 * @see
		 * 예) "dkssudgktpdy" => "안녕하세요"
		 */
		function eng2kor(text) {
			var engChosung = 'rRseEfaqQtTdwWczxvg'		
			var engChosungReg = '[' + engChosung + ']';		
			var engJungsung = {k: 0, o: 1, i: 2, O: 3, j: 4, p: 5, u: 6, P: 7, h: 8, hk: 9, ho: 10, hl: 11, y: 12, n: 13, nj: 14, np: 15, nl: 16, b: 17, m: 18, ml: 19, l: 20};		
			var engJungsungReg = 'hk|ho|hl|nj|np|nl|ml|k|o|i|O|j|p|u|P|h|y|n|b|m|l';		
			var engJongsung = {'': 0, r: 1, R: 2, rt: 3, s: 4, sw: 5, sg: 6, e: 7, f: 8, fr: 9, fa: 10, fq: 11, ft: 12, fx: 13, fv: 14, fg: 15, a: 16, q: 17, qt: 18, t: 19, T: 20, d: 21, w: 22, c: 23, z: 24, x: 25, v: 26, g: 27};		
			var engJongsungReg = 'rt|sw|sg|fr|fa|fq|ft|fx|fv|fg|qt|r|R|s|e|f|a|q|t|T|d|w|c|z|x|v|g|';
			var regExp = new RegExp('(' + engChosungReg + ')(' + engJungsungReg + ')((' + engJongsungReg + ')(?=(' + engChosungReg + ')(' + engJungsungReg + '))|(' + engJongsungReg + '))', 'g');
		
			var converter = function (args, cho, jung, jong) {		
				return String.fromCharCode(engChosung.indexOf(cho) * 588 + engJungsung[jung] * 28 + engJongsung[jong] + 44032);		
			};

			return text.replace(regExp, converter); 
		}
				
		return SFDDropdown;
	})();
	/// @endclass


	/**
	 * ScrollBox Control.
	 * @class SFDScrollBox
	 * @example
	 * ```js
	 * sfd.view.scrollBox('#scroll-box').init(300, 500); // 초기화
	 * 
	 * sfd.view.scrollBox('#scroll-box').scrollTop(50); // 스크롤 위치 변경. 기본 애니메이션 300ms 적용.
	 * sfd.view.scrollBox('#scroll-box').scrollTop(50, false); // 스크롤 위치 변경. 애니메이션 없이.
	 * sfd.view.scrollBox('#scroll-box').scrollTop(50, 500); // 스크롤 위치 변경. 애니메이션 시간 변경.
	 * 
	 * sfd.view.scrollBox('#scroll-box').refresh(); // Scroll Box 컨텐츠 변경됐을 때 갱신. iScroll 또는 slimScroll인 경우 사용됨.
	 * ```
	 */	
	var SFDScrollBox = (function() {
		var SFDScrollBox = function(target) {
			this.$target = $(target); /// <요소캐싱> @private {Object} ScrollBox를 적용할 대상 요소
			this.options = {}; /// <저장> @private {Object} 옵션
			this.engine = 'native'; /// <저장> @private {String} Scroll 처리 엔진. PC: "slimScroll"(기본), "native"(접근성) , Mobile: "native"(기본), "iScroll"(선택)
		};
		SFDScrollBox.DATAKEY = 'SFDScrollBox';
		SFDScrollBox.prototype = {
			/**
			 * ScrollBox 초기화
			 * @category 초기화
			 * @param {Object} options 옵션
			 * Key | Type | 기본값 | 설명
			 * ---|---|---|---
			 * alwaysVisible | Boolean | true | 스크롤바 항상 보일지 여부. PC에만 적용.
			 * railVisible | Boolean | true | 스크롤바 바 부분 보일지 여부. PC에만 적용.
			 * wheelStep | Integer | 10 | 휠 돌리면 몇 라인 스크롤할지. PC에만 적용.
			 * iScroll | Boolean | false | iScroll 사용할지 여부. Mobile에만 적용.
			 * scrollbarVisible | Boolean | false | 스크롤바를 항상 보일지 여부. Mobile에만 적용.
			 */
			init: function(width, height, options) {
				options = $.extend({
				}, options);

				this.destroy();

				this.options = options;
				this.$target.data(SFDScrollBox.DATAKEY, this);
				this.engine = 'native';
				this.device = deviceType;

				if (this.device == 'mobile') {
					// Mobile인 경우
					
					if (options.iScroll == true) {
						// iScroll 사용
						this.$target.css({
							width: width,
							height: height,
							position: 'relative',
							overflow: 'hidden'
						});
	
						var isMobileDevice = sfd ? ['iOS', 'Android'].includes(sfd.env.os.group) : this.device == 'mobile';
						options = $.extend({
							scrollbars: true,
							mouseWheel: true,
							shrinkScrollbars: 'scale',
							tap: isMobileDevice,
							fadeScrollbars: options.scrollbarVisible === true ? false : true,
							click: !isMobileDevice,
							desktopCompatibility: !isMobileDevice,
							interactiveScrollbars: !isMobileDevice,
							preventDefaultException: { tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT|LABEL)$/ }
						}, options);
		
						this.engine = 'iScroll';
						this.iScroll = new IScroll(this.$target.get(0), options); // scroll 영역 생성	
					} else {
						// Native (overflow scroll 처리)
						// CSS 적용
						this.$target.css({
							width: width,
							height: height,
							position: 'relative',
							'overflow-x': 'hidden',
							'overflow-y': options.iScroll == true ? 'hidden' : 'scroll'
						});

						if (options.scrollbarVisible) {
							this.scrollbar = sfdControl(this.$target, SFDScrollbar).init();
						}
					}	
				} else {
					// PC인 경우
	
					// CSS 적용
					var css = {
						height: height,
						position: 'relative',
						overflow: 'hidden'
					};				
					if (width != '100%') {
						css.width = width;
					}
					this.$target.css(css);
	
					// Scroll 생성
					if (sfd && sfd.env.screenReader) {
						// 접근성 모드인 경우 innerScroll 적용 안함
						this.$target.css('overflow', 'scroll');
					} else {
						options = $.extend({
							width: width,
							height: height,
							alwaysVisible: true,
							railVisible: true,
							wheelStep: 10
						}, options);
						
						this.engine = 'slimScroll';
						this.$target.slimScroll(options); // scroll 영역 생성
					}				
				}
				return this;
			},
			
			/**
			 * ScrollBox 적용했던 것 제거
			 * @category 초기화
			 */
			destroy: function() {
				switch (this.engine) {
					case 'iScroll':
						if (this.iScroll) {
							this.iScroll.destroy();
							this.$target.css({ overflow: '', width: '', height: '' });
							this.iScroll = null;	
						}
						break;
					case 'slimScroll':
						this.$target.slimScroll({ destroy: true });
						this.$target.css({ overflow: '', width: '', height: '' });
						break;
					default:
						this.$target.css({ 'overflow-y': '', 'overflow-x': '', width: '', height: '' });
						if (this.scrollbar) {
							this.scrollbar.destroy();
							this.scrollbar = null;
						}
						break;
				}

				this.$target.removeData(SFDScrollBox.DATAKEY);
			},
			
			/**
			 * 스크롤 위치 변경
			 * @category 기능
			 * @param {Number} top 변경할 스크롤 위치
			 * @param {Boolean|Number} isAnimated 애니메이션 여부.
			 * @param {Function} callback 완료시 콜백
			 */
			scrollTop: function(top, isAnimated, callback) {
				var duration = 300;
				if (isAnimated === false) {
					duration = 0;
				} else if (typeof isAnimated == 'number') {
					duration = isAnimated;
				}

				switch (this.engine) {
					case 'iScroll':
						this.iScroll.scrollTop(top, duration, callback);
						break;
					case 'slimScroll':
						var slimScroll = this.$target.slimScroll();
						slimScroll.scrollTop(top, duration, callback);
						break;
					default:
						// jQuery object
						if (isAnimated === false) {
							this.$target.scrollTop(top);
						} else {
							this.$target.animate({ scrollTop: arguments[0] }, duration, 'easeOutSine', arguments[2]);
						}
						break;
				}
				return this;
			},

			/**
			 * 스크롤 내용 변경됐을 때 호출 해주는 함수
			 * @category 기능
			 */
			refresh: function() {
				switch (this.engine) {
					case 'iScroll':
						this.iScroll.refresh();
						break;
					case 'slimScroll':
						var slimScroll = this.$target.slimScroll();
						slimScroll.showBarEx();
						slimScroll.hideBarEx();
						break;
					default:
						if (this.scrollbar) {
							this.scrollbar.refresh();
						}
						break;
				}
				return this;
			}
		};
		return SFDScrollBox;
	})();
	/// @endclass


	/**
	 * input 요소의 label 찾기 (PC지원을 위해서 사용)
	 * @param {Object} $input input 요소 jQuery object.
	 */
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
	 * Checkbox
	 * @class SFDCheckbox
 	 * @example
	 * 값 설정/확인
	 * ```js
	 * sfd.view.checkbox('checkbox-name').val(true); // 값 설정
	 * var isChecked = sfd.view.checkbox('checkbox-name').val(); // 값 확인
	 * ```
	 * 
	 * 활성화/비활성화
	 * ```js
	 * sfd.view.checkbox('checkbox-name').setEnabled(false); // 비활성화
	 * var isEnabled = sfd.view.checkbox('checkbox-name').isEnabled(); // 활성화여부 확인
	 * ```
	 * 
	 * Control 저장해서 사용 가능
	 * ```js
	 * var checkbox1 = sfd.view.checkbox('checkbox-name');
	 * 
	 * checkbox1.val(true);
	 * checkbox1.setEnabled(false);
	 * if (checkbox1.val() == false) {
	 *   ...
	 * }
	 * ```
	 */	
	var SFDCheckbox = (function() {
		var SFDCheckbox = function(target) {
			this.$target = SFDCheckbox.element(target);

			// <STRIP_WHEN_RELEASE
			if (this.$target.is('input') == false) {
				sfd && sfd.core.alert('체크박스 input을 선택하는 selector 또는 name 속성값을 사용해주세요. ' + this.$target.length);
			}
			// STRIP_WHEN_RELEASE>
			
			this.$target.data(SFDCheckbox.DATAKEY, this);
		};
		SFDCheckbox.DATAKEY = 'SFDCheckbox';
		SFDCheckbox.element = function(target) {
			var result;

			if (typeof target == 'string' && target.startsWith('input') == false && /^[a-zA-Z_]/.test(target)) {
				// selector가 그냥 name만 적은 경우
				target = 'input[name="' + target + '"]';
			}
			result = $(target);

			return result;
		};


		SFDCheckbox.prototype = {
			/**
			 * 값 확인/설정
			 * @category 사용
			 * @param {Boolean} [value] 값 설정하고 싶은 경우 항목의 value. 생략하면 값 확인 모드로 동작.
			 * @param {Object} [options] 옵션
			 * Key | Type | 기본값 | 설명
			 * ---|---|---|---
			 * triggerEvent | Boolean | false | 값 변경된 경우 change 이벤트 발생시킬지 여부.
			 * @return {Boolean|String} 설정된 값 반환(value 지정 안한 경우). 
			 * Checkbox input에 value 속성 지정한 경우에는 체크된 경우 value 값. 해제된 경우 null 반환.
			 */
			val: function (value, options) {
				if (typeof value == 'object') {
					value = undefined;
					options = value;
				}
				options = $.extend({
					triggerEvent: false
				}, options);


				var $input = this.$target;

				if (value === undefined) {	
					// get
					var result = $input.prop('checked');
					if ($input.attr('value') !== undefined && $input.attr('value') !== null) {
						result = result ? $input.attr('value') : false;
					}
					return result;
				} else {
					// set
					var oldValue = $input.prop('checked');

					if (typeof value != 'boolean') {
						$input.prop('checked', $input.attr('value') == value);
					} else {
						$input.prop('checked', value);
					}

					if (deviceType == 'pc') {
						// UI 업데이트
						var $wrapper = $input.closest('.btn-checkbox, .btn-checkbox-block');
						value ? $wrapper.addClass('active') : $wrapper.removeClass('active');

						// 이미지가 있는 경우 업데이트
						$wrapper.find('img[src-active]').each(function () {
							var $img = $(this);
							$img.attr('src', $img.attr(value ? 'src-active' : 'src-default'));
						});
					}

					var newValue = $input.prop('checked');

					if (options.triggerEvent === true && oldValue != newValue) {
						// 이벤트 발생
						$input.trigger('change');
					}
					return oldValue != newValue;
				}
			},

			/**
			 * 활성화 여부 확인
			 * @category 사용
			 * @param {Object} options 
			 * Key | Type | 기본값 | 설명
			 * ---|---|---|---
			 * visualOnly | Boolean | false | 사용자 인터렉션 가능하지만 보이기에만 비활성화 되어 있는건지 확인하려면 true로 지정
			 * @return {Boolean} 활성화 상태면 true, 비활성화 상태면 false.
			 */
			isEnabled: function(options) {
				options = $.extend({
					visualOnly: false
				}, options);


				var $input = this.$target;
				
				if (deviceType == 'pc') {
					if (options.visualOnly)  {
						var $label = findLabelForInput($input);
						return $label.hasClass('disabled') == false;
					} else {
						return $input.prop('disabled') == false;
					}
				} else {
					if (options.visualOnly)  {
						return $input.hasClass('fake-disabled') == false;
					} else {
						return $input.prop('disabled') == false;
					}
				}
			},

			/**
			 * 활성화 여부 설정
			 * @category 사용
			 * @param {Boolean} [isEnabled=true] 활성화 여부.
			 * @param {Object} options 
			 * Key | Type | 기본값 | 설명
			 * ---|---|---|---
			 * visualOnly | Boolean | false | 사용자 인터렉션 가능하지만 보이기에만 활성화/비활성화 처리하려면 true로 지정
			 */
			setEnabled: function(isEnabled, options) {
				options = $.extend({
					visualOnly: false
				}, options);

				if (isEnabled === undefined) {
					isEnabled = true;
				}

				var $input = this.$target;

				if (deviceType == 'pc') {
					// pc (bootstrap)
					var $label = findLabelForInput($input);
					isEnabled ? $label.removeClass('disabled') : $label.addClass('disabled');

					if (options.visualOnly == false) {
						$input.prop('disabled', !isEnabled);
					}

				} else {
					// mobile
					if (options.visualOnly) {
						isEnabled ? $input.removeClass('fake-disabled') : $input.addClass('fake-disabled');
					} else {
						$input.prop('disabled', !isEnabled);
					}	
				}
			}
		};

		return SFDCheckbox;
	})();

	/**
	 * Checkbox Group
	 * @class SFDCheckboxGroup
 	 * @example
	 * 값 설정
	 * ```js
	 * sfd.view.checkboxGroup('#checkbox-group1').val(true); // 한꺼번에 모두 체크
	 * sfd.view.checkboxGroup('#checkbox-group1').val([true, false, false]); // 각 체크박스 값 따로 설정
	 * ```
	 * 
	 * 값 확인
	 * ```js
	 * var isChecked = sfd.view.checkbox('#checkbox-group1').val(); // 값 확인. 배열로 반환 ex) [true, false, false]
	 * ```
	 * 
	 * 활성화/비활성화
	 * ```js
	 * sfd.view.checkbox('checkbox-name').setEnabled(false); // 비활성화 (한꺼번에 모두 비활성화)
	 * var isEnabled = sfd.view.checkbox('checkbox-name').isEnabled(); // 활성화여부 확인. 배열로 반환 ex) [true, true, false]
	 * ```
	 * 
	 * Control 저장해서 사용 가능
	 * ```js
	 * var checkboxGroup1 = sfd.view.checkboxGroup('#checkbox-group1');
	 * 
	 * checkboxGroup1.val(true);
	 * checkboxGroup1.setEnabled([false, true, true]);
	 * if (checkboxGroup1.isAllChecked() == true) {
	 *   ...
	 * }
	 * ```
	 */
	var SFDCheckboxGroup = (function() {
		var SFDCheckboxGroup = function(target) {
			this.$target = $(target);

			this.$target.data(SFDCheckboxGroup.DATAKEY, this);
		};
		SFDCheckboxGroup.DATAKEY = 'SFDCheckboxGroup';

		SFDCheckboxGroup.prototype = {
			/**
			 * 값 확인/설정
			 * @category 사용
			 * @param {Boolean|Array} [value] 값 설정하고 싶은 경우 항목의 value. 생략하면 값 확인 모드로 동작. 배열로 지정해서 각 체크박스마다 다르게 설정 가능. (반드시 체크박스 갯수와 동일한 갯수의 배열이어야 함)
			 * @param {Object} [options] 옵션
			 * Key | Type | 기본값 | 설명
			 * ---|---|---|---
			 * triggerEvent | Boolean | false | 값 변경된 경우 change 이벤트 발생시킬지 여부.
			 * excludeDisabled | Boolean | false | 비활성화 checkbox 제외시킬지 여부.
			 * excludeHidden | Boolean | true | 안보이는 checkbox 제외시킬지 여부.
			 * @return {Array} 체크 여부(Boolean) 또는 value 지정된 input의 경우 value(String|null) 의 배열 반환 (value 지정 안한 경우).
			 */
			val: function (value, options) {
				if (typeof value == 'object' && Array.isArray(value) == false) {
					value = undefined;
					options = value;
				}
				options = $.extend({
					triggerEvent: false,
					excludeDisabled: false,
					excludeHidden: true
				}, options);

				var checkboxes = checkboxesForTarget(this.$target, options);

				if (value === undefined) {	
					// get
					return checkboxes.map(function(checkbox) {
						return checkbox.val(options);
					});
				} else {
					// set
					if (Array.isArray(value) && checkboxes.length != value.length) {
						// 배열로 값 지정했는데, input 갯수랑 맞지 않으면 그냥 리턴
						consoleWarn('Checkbox 갯수와 지정한 값 갯수가 다릅니다.');
						return;
					}

					checkboxes.forEach(function(checkbox, index) {
						checkbox.val(Array.isArray(value) ? value[index] : value, options);
					});
				}
			},

			/**
			 * 그룹내 checkbox가 모두 체크된 상태인지 확인
			 * @category 사용
			 * @return {Boolean} 모두 선택되어 있으면 ture, 아니면 false
			 */
			isAllChecked: function() {
				return this.val().findIndex(function(value) {
					return value === false;
				}) == -1;

			},

			/**
			 * 그룹내 checkbox가 모두 해제된 상태인지 확인
			 * @category 사용
			 * @return {Boolean} 모두 해제되어 있으면 ture, 아니면 false
			 */
			isAllUnchecked: function() {
				return this.val().findIndex(function(value) {
					return value === true || (typeof value == 'string');
				}) == -1;
			},

			/**
			 * 활성화 여부 확인
			 * @category 사용
			 * @param {Object} options 
			 * Key | Type | 기본값 | 설명
			 * ---|---|---|---
			 * visualOnly | Boolean | false | 사용자 인터렉션 가능하지만 보이기에만 비활성화 되어 있는건지 확인하려면 true로 지정
			 * excludeDisabled | Boolean | false | 비활성화 checkbox 제외시킬지 여부.
			 * excludeHidden | Boolean | true | 안보이는 checkbox 제외시킬지 여부.
			 * @return {Array} 각 체크박스 활성화 상태 boolean 배열. ex) [true, false, false]
			 */
			isEnabled: function(options) {
				options = $.extend({
					visualOnly: false,
					excludeDisabled: false,
					excludeHidden: true
				}, options);

				var checkboxes = checkboxesForTarget(this.$target, options);
				
				return checkboxes.map(function(checkbox) {
					return checkbox.isEnabled(options);
				})
			},

			/**
			 * 그룹내 checkbox가 모두 활성화 상태인지 확인
			 * @category 사용
			 * @return {Boolean} 모두 활성화 상태면 ture, 아니면 false
			 */
			isAllEnabled: function(options) {
				return this.isEnabled(options).findIndex(function(isEnabled) {
					return isEnabled === false;
				}) == -1;
			},

			/**
			 * 그룹내 checkbox가 모두 비활성화 상태인지 확인
			 * @category 사용
			 * @return {Boolean} 모두 비활성화 상태면 ture, 아니면 false
			 */
			isAllDisabled: function(options) {
				return this.isEnabled(options).findIndex(function(isEnabled) {
					return isEnabled === true;
				}) == -1;
			},

			/**
			 * 활성화 여부 설정
			 * @category 사용
			 * @param {Boolean} [isEnabled=true] 활성화 여부.
			 * @param {Object} options 
			 * Key | Type | 기본값 | 설명
			 * ---|---|---|---
			 * visualOnly | Boolean | false | 사용자 인터렉션 가능하지만 보이기에만 활성화/비활성화 처리하려면 true로 지정
			 * excludeDisabled | Boolean | false | 비활성화 checkbox 제외시킬지 여부.
			 * excludeHidden | Boolean | true | 안보이는 checkbox 제외시킬지 여부.
			 */
			setEnabled: function(isEnabled, options) {
				options = $.extend({
					visualOnly: false,
					excludeDisabled: false,
					excludeHidden: true
				}, options);

				if (isEnabled === undefined) {
					isEnabled = true;
				}

				var checkboxes = checkboxesForTarget(this.$target, options);
				if (Array.isArray(isEnabled) && isEnabled.length != checkboxes.length) {
					consoleWarn('input 갯수와 지정 값 갯수가 다릅니다.');
					return;
				}
				checkboxes.forEach(function(checkbox, index) {
					checkbox.setEnabled(Array.isArray(isEnabled) ? isEnabled[index] : isEnabled, options);
				});
			}
		};

		function checkboxesForTarget($target, options) {
			options = options || {};

			// group 안에 여러개 한꺼번에
			var $result = $target.find('input[type="checkbox"]');

			if (options.excludeDisabled === true) {
				$result = $result.not(':disabled');
			}
			if (options.excludeHidden === true) {
				$result = $result.not(':hidden');
			}

			return $result.map(function() {
				return new SFDCheckbox(this);
			}).toArray();
		}

		return SFDCheckboxGroup;
	})();

	/**
	 * Radio Button
	 * @class SFDRadioButton
 	 * @example
	 * 값 설정/확인
	 * ```js
	 * sfd.view.radio('radio-name').val('A1'); // "A1" 선택
	 * sfd.view.radio('radio-name').val(null); // 선택 해제
	 * var value = sfd.view.radio('radio-name').val(); // 값 확인
	 * ```
	 * 
	 * 활성화/비활성화
	 * ```js
	 * sfd.view.radio('radio-name').setEnabled(false); // 비활성화
	 * var isEnabled = sfd.view.radio('radio-name').isEnabled(); // 활성화여부 확인 (라디오 버튼 중 한 개라도 활성화 상태면 true)
	 * 
	 * sfd.view.radio('radio-name').setEnabled([true, true, false]); // 라디오 버튼별로 다르게 설정
	 * ```
	 * 
	 * Control 저장해서 사용 가능
	 * ```js
	 * var radio1 = sfd.view.radio('radio-name');
	 * 
	 * radio1.val('A1');
	 * radio1.setEnabled(false);
	 * if (radio1.val() == 'A2') {
	 *   ...
	 * }
	 * ```
	 */	
	 var SFDRadioButton = (function() {
		var SFDRadioButton = function(target) {
			this.$target = SFDRadioButton.element(target);

			// <STRIP_WHEN_RELEASE
			if (this.$target.is('input') == false) {
				sfd && sfd.core.alert('라디오버튼 name 또는 선택자를 확인해주세요. ' + this.$target.length);
			}
			// STRIP_WHEN_RELEASE>

			this.$target.eq(0).data(SFDRadioButton.DATAKEY, this);
		};
		SFDRadioButton.DATAKEY = 'SFDRadioButton';
		SFDRadioButton.element = function(target) {
			var result;

			if (typeof target == 'string' && target.startsWith('input') == false && /^[a-zA-Z_]/.test(target)) {
				// selector가 그냥 name만 적은 경우
				target = 'input[name="' + target + '"]';
			}
			result = $(target);

			if (result.is('input') == false) {
				result = result.find('input[type="radio"]');
			}
			return result;
		};

		SFDRadioButton.prototype = {
			/**
			 * 값 확인/설정
			 * @category 사용
			 * @param {String} [value] 선택하려는 항목의 value. 선택 해제 시키려면 null. 생략하면 값 확인 모드로 동작.
			 * @param {Object} [options] 옵션
			 * Key | Type | 기본값 | 설명
			 * ---|---|---|---
			 * triggerEvent | Boolean | false | 값 변경된 경우 change 이벤트 발생시킬지 여부.
			 * @return {String} 선택된 값 반환(value 지정 안한 경우). 선택된 것이 없는 경우 undefined.
			 */
			val: function (value, options) {
				if (value !== null && typeof value == 'object' && Array.isArray(value) == false) {
					value = undefined;
					options = value;
				}
				options = $.extend({
					triggerEvent: false
				}, options);

				var $input = this.$target;

				if (value === undefined) {
					// get
					return $input.filter(':checked').val();
				} else {
					// set
					var oldValue = $input.filter(':checked').val();
					if (value === null) {
						// 해제
						$input.prop('checked', false);

						if (deviceType == 'pc') {
							// UI 업데이트
							var wrapperSelector = ['.btn-radio', '.btn-radio-block', '.btn-radio-blank'].join(',');
							var $wrapper = $input.closest(wrapperSelector);
							$wrapper.removeClass('active');

							// 이미지 있는 경우 업데이트
							var $image = $wrapper.find('img[src-default]');
							$image.attr('src', $image.attr('src-default'));
						}
					} else {
						// 선택
						var $selected = $input.filter('[value="' + value + '"]');
						$selected.prop('checked', true);

						if (deviceType == 'pc') {
							// UI 업데이트
							var wrapperSelector = ['.btn-radio', '.btn-radio-block', '.btn-radio-blank'].join(',');
							var $wrapper = $input.closest(wrapperSelector);

							$wrapper.filter('.active').removeClass('active');
							var $selectedWrapper = $selected.closest(wrapperSelector);
							$selectedWrapper.addClass('active');

							// 이미지 있는 경우 업데이트
							var $otherImages = $wrapper.find('image[src-default]');
							$otherImages.attr('src', $otherImages.attr('src-default'));
							var $image = $selectedWrapper.find('img[src-active]');
							$image.attr('src', $image.attr('src-active'));
						}
					}

					var newValue = $input.filter(':checked').val();
					if (options.triggerEvent === true && oldValue != newValue) {
						// 이벤트 발생
						$input.trigger('change');
					}
					return oldValue != newValue;
				}
			},

			/**
			 * 활성화 여부 확인
			 * @category 사용
			 * @param {Object} options 옵션
			 * Key | Type | 기본값 | 설명
			 * ---|---|---|---
			 * visualOnly | Boolean | false | 사용자 인터렉션 가능하지만 보이기에만 비활성화 되어 있는건지 확인하려면 true로 지정.
			 * filter | Array | - | 특정 라디오 버튼만 확인하고 싶은 경우. 확인하려는 라디오 버튼의 value 또는 index로 구성된 배열 지정.
			 * @return {Boolean|Array} 활성화 상태면 true, 비활성화 상태면 false. options에 filter 지정한 경우 boolean 배열로 반환.
			 */
			isEnabled: function(options) {
				options = $.extend({
					visualOnly: false,
					filter: []
				}, options);
			
				var result = [];
				var isFilterIndex = options.filter.findIndex(function(item) { 
					return typeof item != 'number'
				}) == -1;

				this.$target.each(function(index) {
					var $input = $(this);
					// 특정 버튼만 설정하도록 한 경우, 필터에 없는거면 패스
					if (options.filter.length > 0) {
						if (isFilterIndex ? options.filter.includes(index) == false : options.filter.includes($input.val()) == false) {
							return;
						}	
					}

					if (deviceType == 'pc') {
						if (options.visualOnly)  {
							var $label = findLabelForInput($input);
							result.push($label.hasClass('disabled') == false);
						} else {
							result.push($input.prop('disabled') == false);
						}
					} else {
						if (options.visualOnly) {
							result.push($input.hasClass('fake-disabled') == false);
						} else {
							result.push($input.prop('disabled') == false);
						}	
					}
				});

				if (options.filter.length == 0) {
					// 필터가 없는 경우 한 개라도 enabled 상태면 true
					result = result.findIndex(function(r) {
						return r == true;
					}) != -1;
				}
				return result;
			},

			/**
			 * 활성화 여부 설정
			 * @category 사용
			 * @param {Boolean|Array} [isEnabled=true] 활성화 여부. 배열로 지정해서 각 라디오 버튼마다 다르게 설정 가능.
			 * @param {Object} options 옵션
			 * Key | Type | 기본값 | 설명
			 * ---|---|---|---
			 * visualOnly | Boolean | false | 사용자 인터렉션 가능하지만 보이기에만 활성화/비활성화 처리하려면 true로 지정
			 * filter | Array | - | 특정 라디오 버튼만 설정하고 싶은 경우. 설정하려는 라디오 버튼의 value 또는 index로 구성된 배열 지정.
			 */
			setEnabled: function(isEnabled, options) {
				if (isEnabled === undefined) {
					isEnabled = true;
				}
				options = $.extend({
					visualOnly: false,
					filter: []
				}, options);

				var isFilterIndex = options.filter.findIndex(function(item) { 
					return typeof item != 'number'
				}) == -1;
				
				this.$target.each(function(index) {
					var isDisabled = !isEnabled;
					var $input = $(this);

					if (options.filter.length > 0) {
						// 특정 버튼만 설정하도록 한 경우, 필터에 없는거면 패스
						if (isFilterIndex ? options.filter.includes(index) == false : options.filter.includes($input.val()) == false) {
							return;
						}
					}

					if (deviceType == 'pc') {
						var $label = findLabelForInput($input);
						isEnabled ? $label.removeClass('disabled') : $label.addClass('disabled');
	
						if (options.visualOnly == false) {
							$input.prop('disabled', !isEnabled);
						}
	
					} else {
						if (options.visualOnly) {
							isDisabled ? $(this).addClass('fake-disabled') : $(this).removeClass('fake-disabled');
						} else {
							$(this).prop('disabled', isDisabled);
						}	
					}
				});
			}
		};

		return SFDRadioButton;
	})();

	/**
	 * Text Input
	 * @class SFDTextInput
 	 * @example
	 * 값 설정
	 * ```js
	 * sfd.view.textInput('#name').val('홍길동'); // 값 설정
	 * ```
	 * 
	 * 값 확인
	 * ```js
	 * var name = sfd.view.textInput('#name').val(); // 값 확인
	 * ```
	 * 
	 * 활성화/비활성화
	 * ```js
	 * sfd.view.textInput('#name').setEnabled(false); // 비활성화
	 * var isEnabled = sfd.view.textInput('#name').isEnabled(); // 활성화여부 확인
	 * ```
	 * 
	 * Control 저장해서 사용 가능
	 * ```js
	 * var nameInput = sfd.view.textInput('#name');
	 * 
	 * nameInput.val('홍길동');
	 * nameInput.setEnabled(false);
	 * if (nameInput.isEnabled() == true) {
	 *   ...
	 * }
	 * ```
	 */
	var SFDTextInput = (function() {
		var SFDTextInput = function(target) {
			this.$target = SFDTextInput.element(target);
			this.$target.data(SFDTextInput.DATAKEY, this);
		};
		SFDTextInput.DATAKEY = 'SFDTextInput';
		SFDTextInput.element = function(target) {
			var result;

			if (typeof target == 'string' && /^(input|textarea)/.test(target) == false && /^[a-zA-Z_]/.test(target)) {
				// selector가 그냥 name만 적은 경우
				target = 'input[name="' + target + '"]';
			}
			result = $(target);

			return result;
		};


		SFDTextInput.prototype = {
			/**
			 * 값 확인/설정
			 * @category 사용
			 * @param {Boolean|Array} [value] 값 설정하고 싶은 경우 항목의 value.
			 * @return {Boolean|Array} 설정된 값 반환.
			 */
			val: function (value, options) {
				if (typeof value == 'object') {
					value = undefined;
					options = value;
				}
				options = $.extend({
					triggerEvent: false
				}, options);

				var $input = this.$target;

				if (value === undefined) {
					// get
					return $input.val();
				} else {
					// set
					var oldValue = $input.val();

					$input.val(value);
					
					var newValue = $input.val();

					if (options.triggerEvent === true && oldValue != newValue) {
						// 이벤트 발생
						$input.trigger('change');
					}
					return oldValue != newValue;
				}
			},

			/**
			 * 활성화 여부 확인
			 * @category 사용
			 * @param {Object} options 옵션
			 * Key | Type | 기본값 | 설명
			 * ---|---|---|---
			 * visualOnly | Boolean | false | 사용자 인터렉션 가능하지만 보이기에만 비활성화 되어 있는건지 확인하려면 true로 지정.
			 * @return {Boolean} 활성화 상태면 true, 비활성화 상태면 false.
			 */
			isEnabled: function(options) {
				options = $.extend({
					visualOnly: false
				}, options);

				var $input = this.$target;
				
				if (options.visualOnly)  {
					return $input.hasClass('fake-disabled') == false;
				} else {
					return $input.prop('disabled') == false;
				}
			},

			/**
			 * 활성화 여부 설정
			 * @category 사용
			 * @param {Boolean} [isEnabled=true] 활성화 여부.
			 * @param {Object} options 옵션
			 * Key | Type | 기본값 | 설명
			 * ---|---|---|---
			 * visualOnly | Boolean | false | 사용자 인터렉션 가능하지만 보이기에만 활성화/비활성화 처리하려면 true로 지정
			 */
			setEnabled: function(isEnabled, options) {
				options = $.extend({
					visualOnly: false
				}, options);

				if (isEnabled === undefined) {
					isEnabled = true;
				}

				var $input = this.$target;

				if (options.visualOnly) {
					isEnabled ? $input.removeClass('fake-disabled') : $input.addClass('fake-disabled');
				} else {
					$input.prop('disabled', !isEnabled);
				}
			},

			/**
			 * 읽기전용 여부 설정
			 * @category 사용
			 * @param {Boolean} [isReadOnly=true] 읽기전용 여부.
			 */
			setReadOnly: function(isReadOnly) {
				if (isReadOnly === undefined) {
					isReadOnly = true;
				}

				var $input = this.$target;

				$input.prop('readonly', isReadOnly);
			}
		};

		return SFDTextInput;
	})();

	/**
	 * Button
	 * @class SFDButton
 	 * @example
	 * 활성화/비활성화
	 * ```js
	 * sfd.view.button('#button').setEnabled(false); // 비활성화
	 * var isEnabled = sfd.view.button('#button').isEnabled(); // 활성화여부 확인
	 * ```
	 */
	 var SFDButton = (function() {
		var SFDButton = function(target) {
			this.$target = $(target);
			this.$target.data(SFDButton.DATAKEY, this);
		};
		SFDButton.DATAKEY = 'SFDButton';

		SFDButton.prototype = {		 
			/**
			 * 활성화 여부 확인
			 * @category 사용
			 * @param {Object} options 
			 * Key | Type | 기본값 | 설명
			 * ---|---|---|---
			 * visualOnly | Boolean | false | 사용자 인터렉션 가능하지만 보이기에만 비활성화 되어 있는건지 확인하려면 true로 지정
			 * @return {Boolean} 활성화 상태면 true, 비활성화 상태면 false.
			 */
			isEnabled: function(options) {
				options = $.extend({
					visualOnly: false
				}, options);


				var $button = this.$target;
				
				if (options.visualOnly) {
					return $button.hasClass('disabled') == false && $button.hasClass('fake-disabled') == false;
				} else {
					return $button.prop('disabled') == false;
				}			
			},

			/**
			 * 활성화 여부 설정
			 * @category 사용
			 * @param {Boolean} [isEnabled=true] 활성화 여부.
			 * @param {Object} options 
			 * Key | Type | 기본값 | 설명
			 * ---|---|---|---
			 * visualOnly | Boolean | false | 사용자 인터렉션 가능하지만 보이기에만 활성화/비활성화 처리하려면 true로 지정
			 */
			setEnabled: function(isEnabled, options) {
				options = $.extend({
					visualOnly: false
				}, options);

				if (isEnabled === undefined) {
					isEnabled = true;
				}

				var $button = this.$target;

				isEnabled ? $button.removeClass('disabled') : $button.addClass('disabled');

				if (options.visualOnly == false) {
					$button.prop('disabled', !isEnabled);
				}
			}
		};

		return SFDButton;
	})();


	/**
	 * Tab
	 * @class SFDTab
	 */
	var SFDTab = (function() {
		var SFDTab = function(target) {
			this.$target = $(target);
			this.$target.data(SFDTab.DATAKEY, this);
		};
		SFDTab.DATAKEY = 'SFDTab';

		SFDTab.prototype = {
			/**
			 * Tab 열기
			 * @param {Integer|String} tab 열려는 Tab의 index 또는 tab-content의 id (aria-controls 속성에 연결되어 있어야 함).
			 */
			show: function(tab) {
				if (typeof tab == 'number') {
					this.$target.find('li').eq(tab).find('a').trigger('click');
				} else {
					this.$target.find('[aria-controls=' + tab + ']').trigger('click');
				}
			}
		};

		return SFDTab;
	})();

	/**
	 * Form (Validation)
	 * @class SFDForm
	 * @see
	 * 사용자 입력 필드 값 확인 및 입력제한 처리. 옵션으로 validation 할 때 기타 원하는 값 확인 로직 추가 가능.
	 * 전체적인 설명은 [[DevDocs > 개발 > 프레임워크 > Form Validation]](/docs/page/dev/framework/validation) 참고.
 	 * @example
	 * 
	 * ```js
	 * // 초기화
	 * sfd.view.form('#ssn-form').init({ button: $('.btn-next-step') });
	 * 
	 * // 입력필드 추가/삭제 등으로 변경 있는 경우 갱신
	 * sfd.view.form('#ssn-form').refresh(); 
	 * 
	 * // 실시간 확인 강제 업데이트 (Code로 필드 값 변경해서 이벤트 발생 안하는 경우 강제 업데이트)
	 * sfd.view.form('#ssn-form').validate({ live: true });
	 * 
	 * // 다음 단계 진행 할 때 validation 처리
	 * btnNextClick: function() {
	 *   if (sfd.view.form('#ssn-form').validate() == false) {
	 *     return; // validation 실패
	 *   }
	 *   ...
	 * }
	 * ```
	 */
	var SFDForm = (function() {

		var SFDForm = function (target) {
			this.$target = $(target); /// <요소캐싱> @private {Object} Validation 처리할 Form 요소.
			// <STRIP_WHEN_RELEASE
			if (this.$target.is('form') == false) {
				sfd && sfd.core.alert('Form 요소를 선택해주세요. ' + this.$target.length);
			}
			// STRIP_WHEN_RELEASE>
			this.$target.data(SFDForm.DATAKEY, this);

			this.option = {}; /// <저장> @private {Object} 옵션. init() 참고
			this.liveCheckFields = []; /// <저장> @private {Array} 실시간 체크하는 요소들 jQuery object 배열.
			this.$actionButton = null; /// <요소캐싱> @private {Object} Validation 상태에 따라 업데이트 할 버튼 요소 jQuery object. 
			this.parsley = null; /// <저장> @private {Object} Form 에 생성된 Parsley 객체.
		};
		SFDForm.DATAKEY = 'SFDForm';
		SFDForm.addCustomValidators = addCustomValidators;

		SFDForm.prototype = {
			/**
			 * Form 초기화 (Validation 포함)
			 * @category 초기화
			 * @param {Object} [option] 옵션
			 * Key | Type | 기본값 | 설명
			 * ---|---|---|---
			 * validation | Boolean | true | Form Validation 사용
			 * 
			 * validation 옵션 true인 경우 사용할 수 있는 옵션
			 * Key | Type | 기본값 | 설명
			 * ---|---|---|---
			 * validationThreshold | Integer | 1 | 텍스트 입력의 경우 몇 글자 이상 입력되었을 때 실시간 검사 할지.
			 * live | Bool | true | 실시간 검사할지 여부. 다음 버튼 활성화/비활성화 처리만 필요해도 true 설정해야함.
			 * liveUpdateUI | Bool | false | 실시간 검사 후 UI 업데이트 할지 여부.
			 * actionButton | String 또는 Object | - | Validation 성공/실패시 업데이트 할 버튼의 selector 또는 jQuery object.
			 * excludeDisabled | Bool | false | disabled 된 입력필드는 확인하지 말지 여부.
			 * onValidate | Function | - | 기본 Validation 완료 후 최종 결과 처리하기 전 콜백.<br>`function(isValid) {}`. 콜백에서 return false 하면 검사 실패로, true로 하면 검사 성공으로 처리됨.
			 * onLiveValidated | Function | - | 실시간 검사 Validation 완료 콜백.<br>`function(isValid) {}`
			 * onButtonStateChange | Function | - | 버튼 상태 변경(enabled/disabled) 될 때 콜백. **init()** 함수 호출할 때 일단 한번은 무조건 발생.<br>`function(isEnabled) {}`
			 * @see
			 * 페이지 로딩될 때 값들 미리 채우는 로직이 있다면, 해당 작업이 완료된 후에 이 함수를 호출해주세요.
			 * hidden 처리된 input은 validation에서 제외됨.
			 * disabled 처리된 input은 option.excludeDisabled로 설정 가능.
			 */			
			init: function(option) {
				// 옵션 설정
				this.option = $.extend({
					validation: true,
					validationThreshold: 1,
					live: true,
					liveUpdateUI: false,
					excludeDisabled: false,
					actionButton: null,
					onValidate: null,
					onLiveValidated: null,
					onButtonStateChange: null
				}, option);

				if (option && option.button && !this.option.actionButton) {
					this.option.actionButton = option.button; // 구코드들에서 사용하던거 지원
				}
				
				this.refresh();
			},

			/**
			 * Form 안에 field 추가/삭제 등 변경 있을 때 호출
			 * @category 사용
			 * @param {Object} [option] 옵션. init() 함수 설명 참고.
			 */
			refresh: function(option) {
				var $form = this.$target;
				
				this.option = $.extend(this.option, option);
				if (option && option.button && !this.option.actionButton) {
					this.option.actionButton = option.button; // 구코드들에서 사용하던거 지원
				}

				if (this.option.validation != true) {
					return; // validation 사용 안하는 경우
				}

				if (this.option.live === undefined) {
					// <STRIP_WHEN_RELEASE
					sfd.core.alert('init() 을 먼저 해주세요.');
					// STRIP_WHEN_RELEASE>
					return;
				}
				
				unregisterLiveCheckEvents.call(this);
				destroyParsley(this.$target);
			
				// Parsley 설정.
				var excluded = ['input[type=button]', 'input[type=submit]', 'input[type=reset]', 'input[type=hidden]', ':hidden', ':not([required])'];
				if (this.option.excludeDisabled == true) {
					excluded.push('[disabled]');
				}

				this.parsley = $form.parsley({
					inputs: ['input', 'textarea', 'select', '.dropdown-container', '.sfd-dropdown'].join(','),
					// inputs: ['[required]'],
					excluded: excluded.join(',')
				}); // 초기화

				if (!this.parsley) {
					consoleWarn('Parsley 초기화에 실패했습니다. ', $form.attr('id'), $form.length);
					this.destroy();
					return;
				}
		
				var $fields = $form.find('[required]');

				// 라디오버튼/체크박스는 UI 변경 없도록. 실패했을 때 focus도 안가도록
				$fields.filter('input[type=radio]').attr({'data-parsley-ui-enabled': 'false', 'data-parsley-no-focus': 'true'});
				$fields.filter('input[type=checkbox]').attr({'data-parsley-ui-enabled': 'false', 'data-parsley-no-focus': 'true'});
				if (deviceType == 'mobile') {
					$fields.filter('.dropdown-container,.sfd-dropdown').not('[data-parsley-errors-container]').attr({'data-parsley-errors-messages-disabled': 'true'});
				}
	
				// 버튼은 일단 비활성화 처리
				if (this.option.actionButton) {
					this.$actionButton = typeof this.option.actionButton == 'string' ? $(this.option.actionButton) : this.option.actionButton;
					this.$actionButton.setEnabled(false, { visualOnly: true} );
				} else {
					this.$actionButton = null;
				}
	
				// 실시간 확인이면, Element 변경 이벤트 걸기
				this.liveCheckFields = [];
				if (this.option.live) {
					registerLiveCheckEvents.call(this);	
				}
	
				// 호출할 때 버튼 갱신 한 번 할 수 있도록 확인
				if (this.$actionButton) {
					updateButton.call(this, null, true);
				}
			},

			/**
			 * Validation 결과 리셋
			 * @param {String|Object} [field] 특정필드만 리셋하려는 경우 selector 또는 요소 객체 지정. 지정 안하면 모든 필드 리셋
			 * @category 사용
			 */
			reset: function(field) {
				if (this.option.validation != true) {
					return; // validation 사용 안하는 경우
				}

				if (field) {
					// 특정 필드만 리셋
					var $field = $(field);

					$field.parsley().reset();
					$field.trigger('sf.force-change');	
				} else {
					// 전체 리셋
					var $form = this.$target;
	
					$form.parsley().reset();
					updateButton.call(this);
	
					$form.find('[required]').eq(0).trigger('sf.force-change');	
				}
			},

			/**
			 * Form validation 제거
			 * @category 초기화
			 */
			destroy: function() {				
				if (this.option.validation == true) {
					unregisterLiveCheckEvents.call(this);
					destroyParsley(this.$target);
				}

				this.$target.removeData(SFDForm.DATAKEY);
			},

			/**
			 * Form 입력 필드 값 확인 후 UI 업데이트.
			 * @category Validation
			 * @param {String|Object} [field] 특정 필드만 확인하고자 하는 경우 해당 필드의 selector 또는 요소 객체. 모든 필드 확인하는 경우 생략.
			 * @param {Object} [option] 옵션
			 * Key | Type | 기본값 | 설명
			 * ---|---|---|---
			 * group | String | null | 특정 그룹만 Validation 하는 경우.<br>입력필드 태그에 `data-parsley-group="group1"` 또는 `data-parsley-group="['group1', 'group3']"` 처럼 여러그룹 지정 가능.
			 * updateUI | Boolean | true | Validation 성공/실패 UI 업데이트 할지 여부.
			 * live | Boolean | false | 실시간 검사 강제로 업데이트 처리. (Code로 필드 값 변경해서 이벤트 발생 안하거나 하는 경우 사용). true로 지정하면 다른 옵션은 무시됨.
			 * onFailed | Function | null | 기본 validation 실패했을 때 실패한 jQuery element 목록 전달. `function(invalidElements) {}`
			 * onCustomValidationFailed | Function | null | init 할 때 onValidate 콜백에서 실패 반환하는 경우
			 * 
			 * field 지정된 경우
			 * Key | Type | 기본값 | 설명
			 * ---|---|---|---
			 * updateUI | Boolean | true | Validation 성공/실패 UI 업데이트 할지 여부.
			 * 
			 * @return {Boolean} Validation 성공한 경우 true. 실패한 경우 false.
			 * @example
			 * ```js
			 * if (sfd.view.form('#form').validate() != true) {
			 *    // Form validation 실패
			 * }
			 * 
			 * // 특정 필드만 확인하는 경우
			 * if (sfd.view.form('#form').validate('input[name=name]') != true) {
			 *   // name 필드 validation 실패
			 * }
			 * ```
			 */
			validate: function(field, option) {
				if (this.option.validation != true) {
					return true; // validation 사용 안하는 경우
				}

				try {
					if (typeof field == 'string' || field instanceof jQuery || field instanceof Element || field instanceof HTMLElement) {
						// field가 지정된 경우 field만 확인
						return validateField.call(this, field, option);
					} else {
						// field가 지정 안됐으면, field 파라미터 자리에 옵션이 들어옴
						option = field;
					}
				} catch (e) {
				}

				option = $.extend({
					group: null,
					updateUI: true,
					live: false,
					onFailed: null,
					onCustomValidationFailed: null
				}, option);

				if (option.live == true) {
					// 실시간 검사 강제 업데이트 처리만 함.
					return updateButton.call(this);
				}
	
				var $form = this.$target;
				var result;
				var customValidationResult = true;
					
				// 신용카드 입력 처리 (보안키패드에서는 maxlength 16으로 해야 정상이라서...)
				var $cardNoInputs = $form.find('[nppfs-formatter-type="card"]');
				fixCardNoFieldMinMax($cardNoInputs);
	
				// validation
				if (option.updateUI === true) {
					result = $form.parsley().validate({group: option.group}) === true;
				} else {
					result = $form.parsley().isValid({group: option.group}) === true;
				}
	
				// 신용카드 입력 처리
				if (deviceType == 'mobile' || sfd.env.server != 'local') {
					fixCardNoFieldMinMax($cardNoInputs, true); // 원래대로
				}
	
				// 사용자 커스텀 확인 필요한 것 지정한 경우
				if (this.option.onValidate) {
					customValidationResult = this.option.onValidate(result);
				}
	
				// onFailed
				if (result == false && option.onFailed) {
					var invalidFields = $form.parsley().fields.filter(function(field) {
						return field.validationResult !== true;
					});
					var $invalidElements = invalidFields.map(function(field) { 
						return field.$element; 
					});
					option.onFailed($invalidElements);	
				}
	
				// onCustomValidationFailed
				if (result == true && customValidationResult == false && option.onCustomValidationFailed) {
					option.onCustomValidationFailed();
				}
	
				return result === true && customValidationResult === true;
			},

			/**
			 * Form 입력 필드 값이 정상적으로 입력되었는지 확인. (UI 업데이트 없이 확인만)
			 * @category Validation
			 * @param {String|Object} [field] 특정 필드만 확인하고자 하는 경우 해당 필드의 selector 또는 요소 객체. 모든 필드 확인하는 경우 생략.
			 * @param {Object} [option] 옵션 (field 지정된 경우는 사용안됨)
			 * Key | Type | 기본값 | 설명
			 * ---|---|---|---
			 * group | String | null | 특정 그룹만 Validation 하는 경우.<br>입력필드 태그에 `data-parsley-group="group1"` 또는 `data-parsley-group="['group1', 'group3']"` 처럼 여러그룹 지정 가능.
			 * @return {Boolean} Validation 성공한 경우 true. 실패한 경우 false.
			 * @example
			 * ```js
			 * if (sfd.view.form('#form').isValid()) {
			 *   // Form 내 모든 입력 필드 값 정상
			 * }
			 * 
			 * // 특정 필드만 확인
			 * if (sfd.view.form('#form').isValid('[name=birthdate]')) {
			 *   // birthdate 입력 필드 값 정상
			 * }
			 * ```
			 */
			isValid: function(field, option) {
				if (this.option.validation != true) {
					return true; // validation 사용 안하는 경우
				}

				try {
					if (typeof field == 'string' || field instanceof jQuery || field instanceof Element || field instanceof HTMLElement) {
						// field가 지정된 경우 field만 확인
						return validateField.call(this, field, { updateUI: false });
					} else {
						// field가 지정 안됐으면, field 파라미터 자리에 옵션이 들어옴
						option = field;
					}
				} catch (e) {
				}

				option = $.extend({
					group: null
				}, option);

				return this.validate({ group: option.group, updateUI: false});
			},

			/**
			 * 특정 필드를 validation에서 제외시키거나 제외시켰던걸 다시 포함시킴
			 * @category 사용
			 * @param {String|Object} field 여러 입력 필드를 포함하고 있는 container element 또는 특정 입력 필드의 selector나 jQuery object.
			 * @param {Boolean} isEnabled Validation에서 제외시키고 싶으면 false, 다시 포함시키고 싶으면 true.
			 * @see
			 * init() 한 이후에 setFieldRequired() 사용하는 경우 refresh() 함수 한 번 호출해줘야 함
			 * field를 입력필드가 아닌 container 요소 지정한 경우에는 그 안에 있는 필드 요소들에는 반드시 **required** 또는 **required-off** 속성이 지정되어 있어야 함.
			 */
			setFieldRequired: function(field, isRequired) {
				var $field = $(field);
	
				function validationEnabled($el, isRequired) {
					if (isRequired) {
						// enabled
						$el.attr('required', true).removeAttr('required-off');
					} else {
						// disabled
						$el.removeAttr('required').attr('required-off', '');
	
						// disabled 필드 리셋 
						$el.parsley().reset();
					}
				}
	
				var tagName = $field[0].tagName;
				if (['INPUT', 'SELECT', 'TEXTAREA'].includes(tagName) || $field.hasClass('dropdown-container') || $field.hasClass('sfd-dropdown')) {
					validationEnabled($field, isRequired);
				} else {
					var $fields = $field.find(isRequired ? '[required-off]' : '[required]');
					// <STRIP_WHEN_RELEASE
					if ($fields.length == 0) {
						consoleWarn('setFieldRequired: 애초에 rquired 가 없던 요소들에는 사용할 수 없습니다.');
					}
					// STRIP_WHEN_RELEASE>
					$fields.each(function() {
						validationEnabled($(this), isRequired);
					});
				}				
			}
		}; // prototype

		/**
		 * Parsley 제거
		 * @param {Object} $form Parsley 제거할 form 요소 jQuery object.
		 */
		function destroyParsley($form) {
			var parsley = $form.parsley();
			if (parsley && parsley.destroy) {
				parsley.destroy();
			}
		}

		/**
		 * 필드 입력값 변경시 실시간 확인
		 * @param {Object} $field 필드 jQuery object.
		 * @param {Object} [option] 옵션
		 * Key | Type | 기본값 | 설명
		 * ---|---|---|---
		 * updateUI | Boolean | true | UI 업데이트 할지 여부
		 */
		function onFieldChange($field, option) {
			option = $.extend({
				updateUI: true
			}, option);

			if ($field.is(':hidden')) {
				// Hidden 상태면 확인 안함
				return;
			}

			if ($field.is(':not([required])')) {
				// Validation 제외시켜놨으면 그냥 리턴
				var multiple = $field.attr('data-parsley-multiple');
				if (multiple) {
					if ($('input[data-parsley-multiple="' + multiple + '"][required]:visible').length == 0) {
						return;
					}
				} else {
					return;
				}
			}

			// 사용불가 문자 제거 처리
			var format = $field.attr('data-parsley-format');
			if (format && $field.attr('validation-autocorrect') != 'off') {
				autoCorrectField($field, format);
			}

			// 실시간 검사해서 표시해주는거 없이 액션 버튼 누를때 검사하는거로 변경해서 이거 일단 제거
			// if ($field.is('input[type=text]') 
			// 	|| $field.is('input[type=tel]') 
			// 	|| $field.is('input[type=email]') 
			// 	|| $field.is('input[type=password]') 
			// 	|| $field.is('input[type=search]') 
			// 	|| $field.is('input[type=number]') 
			// 	|| $field[0].tagName == 'textarea') {
			// 	// text input이나 textarea 인 경우 실시간 확인 threshold 가 안된 경우 그냥 리턴
			// 	var val = $field.val();
			// 	if (!val || val.length < option.validationThreshold) {
			// 		return;
			// 	}
			// }
			var isValid = validateField.call(this, $field, { updateUI: option.updateUI, isLiveCheck: true }); // 변경된 필드 확인
			isValid = isValid && (this.isValid() == true) ; // 다른 필드도 필요하면 확인

			if (this.option.actionButton) {
				updateButton.call(this, isValid);
			}

			// 콜백 호출
			if (this.option.onLiveValidated) {
				this.option.onLiveValidated(isValid);
			}
		}

		/**
		 * 실시간 확인을 위한 이벤트 등록
		 */
		function registerLiveCheckEvents() {
			var _this = this;
			var $form = this.$target;
			var $actionButton = this.$actionButton;

			var $required = $form.find('[required]').not(':hidden');
	
			var $fields = $required.not('[type=radio]');
			$fields.off('.sfdform sf.force-change').on({
				'change.sfdform': function() {
					onFieldChange.call(_this, $(this), { updateUI: _this.option.liveUpdateUI });
				},
				'input.sfdform': function() {
					onFieldChange.call(_this, $(this), { updateUI: _this.option.liveUpdateUI });
				},
				'focusout.sfdform': function() {
					var $field = $(this);
					// Trim 처리
					if ($field.attr('data-parsley-format') && $field.attr('validation-autocorrect') != 'off' && $field.attr('validation-autotrim') != 'off') {
						var oldValue = $field.val();
						if (typeof oldValue == 'string') {
							var newValue = oldValue;
							newValue.trim();
							if (oldValue != newValue) {
								$field.val(newValue);
							}
						}
					}
				},
				'sf.force-change': function() {
					if ($actionButton) {
						updateButton.call(_this);
					}
				}
			});
			if (sfd.env.isIE8Below()) {
				$fields.on({
					'keyup.sfdform': function() {
						onFieldChange.call(_this, $(this), { updateUI: _this.option.liveUpdateUI });	
					}
				});
			}

			// 체크박스 여러개 묶음으로 mincheck 있는거 처리
			$required.filter('input[data-parsley-mincheck]').each(function() {
				var name = $(this).attr('name');
				if (name) {
					$form.find('input[name="' + name + '"]').not('[required]').off('change.sfdform sf.force-change').on({
						'change.sfdform': function() {
							onFieldChange.call(_this, $(this), { updateUI: _this.option.liveUpdateUI });
						},
						'sf.force-change': function() {
							if ($actionButton) {
								updateButton.call(_this);
							}
						}
					});	
				}
			});

			// radio 는 따로
			$required.filter('input[type=radio]').each(function() {
				var multiple = $(this).attr('data-parsley-multiple');
				if (multiple) {
					$form.find('input[data-parsley-multiple=' + multiple + ']').off('change.sfdform').on({
						'change.sfdform': function() {
							onFieldChange.call(_this, $(this));	
						}
					});	
				}
			});

			// E2E필드 이벤트 따로 
			if (window.nq) {
				window.nq('input[required][npkencrypt=on]:visible', $form[0]).off('.sfdform').on('keyup.sfdform', function(e) {
					onFieldChange.call(_this, $(this), { updateUI: _this.option.liveUpdateUI });
				});

				// 화면에 나올 때
				window.nq(document).off('.sfdform').on({
					// 입력필드 focus 됐을 때
					'nppfs-npk-focusin.sfdform': function(event) {
						var $el = $(event.target);
						if ($el.length > 0 && $el.is('[required]')) {
							var form = $el.closest('form').data(SFDForm.DATAKEY);
							if (!form) {
								return;
							}
							onFieldChange.call(form, $el, { updateUI: form.option.liveUpdateUI });
						}
					},
					// 보안키패드 나왔을 때
					'nppfs-npv-after-show.sfdform': function(event) {
						var $el = $(event.target);
						if ($el.length > 0 && $el.is('[required]')) {
							var form = $el.closest('form').data(SFDForm.DATAKEY);
							if (!form) {
								return;
							}

							// 여기서 input 값이 비워지지만 아직 val() 뽑으면 안비워진게 나오는 경우가 있어서
							setTimeout(function() {
								onFieldChange.call(form, $el, { updateUI: form.option.liveUpdateUI });
							}, 20);
						}
					},
					// 확인버튼 클릭시
					'nppfs-npv-after-enter.sfdform': function(event) {
						var $el = $(event.target);
						if ($el.length > 0 && $el.is('[required]')) {
							var form = $el.closest('form').data(SFDForm.DATAKEY);
							if (!form) {
								return;
							}
							onFieldChange.call(form, $el, { updateUI: form.option.liveUpdateUI });
						}
					},
					// x 클릭시 : x 일때도 값은 유지 되므로 유효성 체크 해주세요
					'nppfs-npv-closed.sfdform': function(event) {
						var $el = $(event.target);
						if ($el.length > 0 && $el.is('[required]')) {
							var form = $el.closest('form').data(SFDForm.DATAKEY);
							if (!form) {
								return;
							}
							onFieldChange.call(form, $el, { updateUI: form.option.liveUpdateUI });
						}
					}
				});
				
				// // __hide 옵셥이 있을때 maxlength 만큼 되면 여기 들어옴
				// window.nq(document).on('nppfs-npv-after-hide', function(e) {
				// 	// e.name  <-- 필드에 name 값을 주세요.

				// 	// 해당 name 에 해당하는 유효성 추가 해주세요.
				// 	// onFieldChange(_this, $(this), { updateUI: option.liveUpdateUI });
				// 	// var $el = $('input[name="'+e.name+'"]');
				// 	// if($el) {
				// 	// 	onFieldChange(_this, $el , { updateUI: option.liveUpdateUI });
				// 	// }
				// });			 						
			}

			// 이벤트 처리를 위해서 저장해둠
			var liveCheckFields = [];
			for (var i = 0; i < this.parsley.fields.length; i++) {
				liveCheckFields.push(this.parsley.fields[i].$element);
			}
			this.liveCheckFields = liveCheckFields;
		}

		/**
		 * 실시간 확인 이벤트 제거
		 */
		function unregisterLiveCheckEvents() {
			this.liveCheckFields.forEach(function(field) {
				field.off('.sfdform sf.force-change');
				if (field.attr('npkencrypt') == 'on' && window.nq) {
					// 보안필드에 걸려있던 이벤트 핸들러 제거
					window.nq(field).off('.sfdform');
				}
			});			
		}

		/**
		 * 버튼 상태 업데이트
		 * @param {Boolean} [isValid] 
		 * @param {Boolean} [forceTriggerEvent=false] 
		 * @return {Boolean} Validation 상태.
		 */
		function updateButton(isValid, forceTriggerEvent) {
			var $actionButton = this.$actionButton;
			var isChanged = false;
	
			if (isValid === undefined || isValid === null) {
				isValid = this.isValid();
			}
	
			if ($actionButton && $actionButton.length > 0) {
				var isDisabled = $actionButton.hasClass('disabled');
				isChanged = (isValid == true && isDisabled == true) || (isValid == false && isDisabled == false);
				$actionButton.setEnabled(isValid, { visualOnly: true });
			}
	
			if (isChanged || forceTriggerEvent == true) {
				// 버튼 상태 변경되었으면 콜백 호출 및 이벤트 발생
				if (this.option.onButtonStateChange) {
					this.option.onButtonStateChange.call($actionButton && $actionButton.length ? $actionButton[0] : null, isValid);
				}
				if ($actionButton && $actionButton.length > 0) {
					$actionButton.trigger('sf.state-change');
				}
			}
			return isValid;
		}

		/**
		 * 신용카드 입력 필드 minlength, maxlength 보정 (보안키패드 때문에)
		 * @param {Object} $field 입력필드 jQuery object.
		 * @param {Boolean} [restore=false] Validation 완료 후 다시 복구하는거면 true
		 */
		function fixCardNoFieldMinMax($field, restore) {
			if (restore) {
				$field.each(function() {
					var $cardInput = $(this);
					var savedAttr = $cardInput.data('sfdform-saved-attr');
					if (savedAttr) {
						$cardInput.removeData('sfdform-saved-attr')
						$cardInput.attr(savedAttr);
					}
				});
			} else {
				$field.each(function() {
					var $cardInput = $(this);
					if ($cardInput.val().includes('-') && !$cardInput.data('sfdform-saved-attr')) {
						var minlength = parseInt($cardInput.attr('minlength'), 10);
						var maxlength = parseInt($cardInput.attr('maxlength'), 10);
						var attr = {};
						var savedAttr = {};
						if (minlength) {
							savedAttr.minlength = minlength;
							attr.minlength = minlength + 3;
						}
						if (maxlength) {
							savedAttr.maxlength = maxlength;
							attr.maxlength = maxlength + 3;
						}
	
						$cardInput.data('sfdform-saved-attr', savedAttr);
						$cardInput.attr(attr);
					}
				});
			}
		}

		/**
		 * 특정 필드 값 확인
		 * @category Validation
		 * @param {String|Object} field 확인할 필드 selector 또는 jQuery object.
		 * @param {Object} [option] 옵션
		 * Key | Type | 기본값 | 설명
		 * ---|---|---|---
		 * updateUI | Boolean | true | Validation 결과 UI 업데이트 할지 여부.
		 * @return {Boolean} Validation 성공한 경우 true. 실패한 경우 false.
		 */			
		function validateField(field, option) {
			option = $.extend({
				updateUI: true,
				isLiveCheck: false // 내부적으로만 사용하는 옵션
			}, option);

			var result = false;			
			var $field = $(field, this.$target);
			
			// 신용카드 입력 처리 (보안키패드에서는 maxlength 16으로 해야 정상이라서...)
			var isSecureCardInput = $field.is('[nppfs-formatter-type="card"]');
			if (isSecureCardInput && $field.val().includes('-') && !$field.data('sfdform-saved-attr')) {
				fixCardNoFieldMinMax($field);
			}

			var updateUI = option.updateUI;
			var hadSuccess = $field.hasClass('parsley-success');
			var hadError = $field.hasClass('parsley-error');

			if (option.isLiveCheck == true) {
				// 실시간 검사 중 에러 났었으면 UI 갱신 처리
				if (hadError) {
					updateUI = true;
				}
			}

			// Validate
			if (updateUI === true) {
				result = $field.parsley().validate();
			} else {
				result = $field.parsley().isValid();
			}

			if (option.isLiveCheck) {
				if (hadSuccess && result == false) {
					// 실시간 검사 중 validation 성공이었다가 다시 실패로 변경되는 경우는 일단 reset
					$field.parsley().reset();
				}
			}

			// 신용카드 입력 처리 (보안키패드에서는 maxlength 16으로 해야 정상이라서...)
			if (isSecureCardInput) {
				// validation 끝났으니 원복
				if (deviceType == 'mobile' || sfd.env.server != 'local') {
					fixCardNoFieldMinMax($field, true);
				}
			}

			return result;
		}

		/**
		 * 입력 불가문자 처리
		 * @param {Object} $field 처리할 필드 jQuery object.
		 * @param {String} format 포맷.
		 * Format | 설명
		 * ---|---
		 * date | 날짜. 1900년 이전이나 2200년 이후는 실패로 처리.
		 * birthdate | 생일. 1900년 이후 그리고 현재 연도 + 1 까지만 성공으로 처리 (출생예정일 고려)
		 * tel | 전화번호
		 * ssn1 | 주민등록번호 앞 6자리
		 * cardno | 카드번호
		 * name | 이름
		 * email | 이메일 사용자이름
		 * domain | 이메일 도메인
		 */
		function autoCorrectField($field, format) {
			var validateInputValue = function($input, regex, keepCaretPosition) {
				if (keepCaretPosition === undefined) {
					keepCaretPosition = true;
				}

				var oldValue = $input.val();
				var newValue = oldValue;
				var input = $input[0];

				// 사용 불가 문자 제거
				if (regex.test(newValue)) {
					newValue = newValue.replace(regex, '');
				}
				// Trim (앞에만)
				if ($field.attr('validation-autotrim') != 'off') {
					newValue = newValue.replace(/^\s*/, '');
				}

				if (newValue != oldValue) {
					var selectionStart = input.selectionStart;
					// validated 된 값으로 세팅
					$input.val(newValue);
					// 커서 위치 유지
					if (keepCaretPosition && selectionStart !== undefined) {
						selectionStart = Math.max(selectionStart - 1, 0);
						input.setSelectionRange(selectionStart, selectionStart);
					}
				}
			}

			// format에 맞지 않은 문자 입력되는 경우 자동으로 제거 처리
			var characterGroups = [];
			var groups = format.split('-');
			switch (format) {
				case 'date':
				case 'birthdate':
				case 'tel':
				case 'ssn1':
					groups = ['num'];
					break;
				case 'cardno':
					groups = ['num', 'dash', 'asterisk'];
					break;
				case 'name':
					groups = ['en', 'ko', 'space'];
					break;
				case 'email':
					groups = ['en', 'dash', 'dot', 'underscore'];
					break;
				case 'domain':
					groups = ['en', 'dash', 'dot'];
					break;
			}
			for (var i = 0; i < groups.length; i++) {
				var group = groups[i];
				if (['num', 'en', 'ko', 'space', 'dot', 'underscore', 'dash', 'asterisk'].includes(group)) {
					characterGroups.push(group);
				}
			}

			var pattern = '';
			for (var i = 0; i < characterGroups.length; i++) {
				switch (characterGroups[i]) {
					case 'en':
						pattern += 'a-z';
						break;
					case 'ko':
						if (sfd.env.deviceType == 'MO') {
							// Mobile은 천지인 같은 조합형 키보드에서 사용하는 문자들도 추가
							pattern += 'ㄱ-ㅎㅏ-ㅣ가-힣\u3163\u3161\u318D\u119E\u11A2\u2022\u2025\u00B7\uFE55\u4E10';
						} else {
							pattern += 'ㄱ-ㅎㅏ-ㅣ가-힣';
						}
						break;
					case 'num':
						pattern += '0-9';
						break;
					case 'dash':
						pattern += '\-';
						break;
					case 'dot':
						pattern += '\.';
						break;
					case 'underscore':
						pattern += '_';
						break;
					case 'asterisk':
						pattern += '\*';
						break;
					case 'space':
						pattern += ' ';
						break;
				}
			}

			if (pattern) {
				var regex = new RegExp('[^' + pattern + ']', 'gi');
				validateInputValue($field, regex);	
			}
		}

		/**
		 * Parsley custom validator 등록
		 * @see
		 * Validation 사용되기 전 한 번만 호출되면 됨.
		 */
		function addCustomValidators() {
			// 라디오버튼 값 확인 Validator 없으면 추가
			if (window.Parsley.hasValidator('radioValue') == false) {
				window.Parsley.addValidator('radioValue', {
					requirementType: 'string',
					validateString: function(value, requirement) {
						return value == requirement;
					}
				});	
			}

			// 몇 가지 정형화된 것들 format 으로 검사 가능하도록
			if (window.Parsley.hasValidator('format') == false) {
				window.Parsley.addValidator('format', {
					requirementType: 'string',
					validateString: function(value, requirement) {
						var result = true;
						switch (requirement) {
							case 'date':
							case 'birthdate':
								result = sfd.utils.isValidDateString(value, requirement == 'birthdate');
								break;
							case 'email': 
								result = (/^[a-z0-9\.\-_]+$/i.test(value) == true);
								break;
							case 'domain':
								result = (/^(([a-z0-9\-]{1,63}\.)+[a-z]{2,})$/i.test(value) == true);
								break;
							case 'tel':
								result = (/^[0-9]{7,8}$/.test(value) == true);
								break;
							case 'name':
								result = (/^[a-z가-힣\s]{2,}$/.test(value.trim()) == true);
								break;
							case 'ssn1':
								result = (/^(\d{2})(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])$/.test(value) == true);
								break;
							case 'cardno':
								result = (/^\d{4}\-?\d{4}\-?[\d\*]{4}\-?[\d\*]{2,4}$/.test(value) == true);
								break;
						}
						return result;
					}
				});
			}
		}

		return SFDForm;
	})();
	/// @endclass

	function sfdControl(el, control) {
		var $el = control.element ? control.element(el) : $(el);
		var result = $el.data(control.DATAKEY);
		if (result) {
			return result;
		} else {
			return new control($el);
		}
	}

	function createUUID() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	}

	function consoleLog() {
		// <STRIP_WHEN_RELEASE
		try {
			if (window.console) {
				window.console.log.apply(null, arguments);
			}
		} catch (e) {
		}
		// STRIP_WHEN_RELEASE>
	}

	function consoleWarn() {
		// <STRIP_WHEN_RELEASE		
		try {
			if (window.console) {
				if ('function' === typeof window.console.warn) {
					window.console.warn.apply(null, arguments);
				} else if ('function' === typeof window.console.log) {
					window.console.log.apply(null, arguments);
				}
			}
		} catch (e) {
		}
		// STRIP_WHEN_RELEASE>
	}


	return {
		initSFDControls: function(d) {
			sfd = d;
			deviceType = sfd.data.getValue('type') == 'PC' ? 'pc' : 'mobile';

			$.extend(sfd.view.support, support);

			// Parsley custom validator 등록
			SFDForm.addCustomValidators();
		},
		scrollbar: function (el) {
			return sfdControl(el, SFDScrollbar);
		},
		scrollBox: function(el) {
			return sfdControl(el, SFDScrollBox);
		},
		coverageValuePicker: function (el) {
			return sfdControl(el, SFDCoverageValuePicker);
		},
		dropdown: function(el) {
			return sfdControl(el, SFDDropdown);
		},
		checkbox: function(el) {
			return sfdControl(el, SFDCheckbox);
		},
		checkboxGroup: function(el) {
			return sfdControl(el, SFDCheckboxGroup);
		},
		radio: function(el) {
			return sfdControl(el, SFDRadioButton);
		},
		textInput: function(el) {
			return sfdControl(el, SFDTextInput);
		},
		button: function(el) {
			return sfdControl(el, SFDButton);
		},
		tab: function(el) {
			return sfdControl(el, SFDTab);
		},
		form: function(el) {
			return sfdControl(el, SFDForm);
		}
	};
});