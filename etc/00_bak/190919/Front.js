define(function() {
	var sfd;
	var _subDivisionName; 			// 선택한 상품 ( dog, cat )
	var _searchDogData = {};		// 애견 검색 데이터

	var _curStep;					// 현재 스탭	
	var _slideWidth;				// 스탭 슬라이드 크기

	var self = {
		// version info
		version: {
			modified: '{version-modified}',
			deploy: '{version-deploy}',
			hash: '{version-hash}'
		},
		ns: '', // 외부에서 #파일명 셋팅 - ID형태
		moduleName: '', // 외부에서 파일명 셋팅
		viewHtml: null,
		initialization: function(d) {
			sfd = d;
			sfd.view.loadResourceHtml(self.moduleName);
		},
		init: init,
		// 페이지 보여짐
		on: function() {
			sfd.core.addEvent(self, '#btn-prev-step', 'click', 'clickPrevStep');
			sfd.core.addEvent(self, '#btn-next-step-type', 'click', 'clickNextStepType');
			sfd.core.addEvent(self, '#btn-next-step-info', 'click', 'clickNextStepInfo');
			sfd.core.addEvent(self, '#select-prod-type', 'change', 'changeType');

			sfd.core.addEvent(self, '#btn-recent', 'click', 'clickRecentBtn');
			sfd.core.addEvent(self, '#btn-search-pet', 'click', 'btnSearchDog');

			sfd.core.addEvent(self, '.btn-caution', 'click', 'clickCautionBtn');
			sfd.core.addEvent(self, '#btn-info', 'click', 'clickInfoBtn');
			sfd.core.addEvent(self, '#btn-compliance', 'click', 'clickComplianceBtn');	
			
			// 상품구분
			_subDivisionName = sfd.data.getValue('subDivisionName');

			sfd.log('sfd.data.dataObject.pageDir', sfd.data.dataObject.pageDir);

			if (sfd.data.dataObject.pageDir == 'next') {

				// 상품구분
				_divisionName = sfd.data.getValue('divisionName');

				// 초기화
				init();

				// 입력 정합성 체크
				validate();

			} 
			// 이전페이지
			else {
				slideStep(1);
				// 타입에 따라 텍스트 넣어주기
				changeStringView(0);
				// 인풋 데이터 셋팅
				settingInput();
			}
			
		},
		// 페이지 사라짐
		off: function() {

		},
		events: {
			changeType: function(){

				var _selectType = sfd.core.elValue($ns('input[name="radio-petCls"]'));
				var _anotherProductName = _selectType == 'dog' ? 'cat':'dog';

				sfd.log('_selectType',_selectType);
				sfd.log('_anotherProductName',_anotherProductName);

				$ns('#dlpo-product-'+_selectType).css({'opacity':'0', 'z-index':'5'});
				$ns('#dlpo-product-'+_anotherProductName).css({'z-index':'0'});
				$ns('#dlpo-product-'+_selectType).stop().animate( {'opacity':'1'}, 500, function(){});

			},
			clickPrevStep: function(){
				sfd.log('btnPrevStep');
				slideStep(0);
			},
			clickNextStepType: function() {
				var _clickStep = $(this).data('step');
				validate(_clickStep);
				changeStringView(_clickStep);
				
			},
			clickNextStepInfo: function() {
				var _clickStep = $(this).data('step');
				validate(_clickStep);
			},
			clickRecentBtn: function(event) {
				
				var activeIndex_num = sfd.data.getValue('pageActiveNum');		// 갈수있는 최대 인덱스

				// front 패널 다음 패널로 진행했으면
				if (activeIndex_num > 0) {
					sfd.core.confirmAlert('E1030', {
						okTitle: '계속진행',
						closeHandler: function(resultObj) {
							if (resultObj == 'confirm') {
								nextFunc();
							}
						}
					});
				} else {
					nextFunc();
				}

				function nextFunc() {
					// 패널 데이터 초기화
					sfd.data.dataInit(0);

					// 실명인증 팝업
					//sfd.core.showPopup('CommonUserConnect', {
					sfd.core.showPopup('CommonParentConnect', {
						focusButton: event.currentTarget,
						closeHandler: function(resultObj) {
							if (resultObj && resultObj != 'esc') {

								var designID_str = sfd.data.getValue('designID');
								// 최근계산기록 리스트 조회
								sfd.core.runPromise('getRecentCalculateInfos', {
									//'insuredId': designID_str,					// 피보험자 ID
									'contractId': sfd.data.getValue('contractorID')
								}).then(

									function(errorBln, jsonObj) {
										if (errorBln) return;

										// 최근계산기록 이 있으면
										if ( jsonObj['recentCalculateInfos'] && jsonObj['recentCalculateInfos'].length ) {
											// 반려견 보험은 과거 기록은 제외함
											if(checkRecentListPet(jsonObj['recentCalculateInfos'])){
												sfd.core.showPopup('CommonRecentCalcList', {
													param: jsonObj
												});
											}
											else{
												sfd.core.alert('EL0002');
											}

										} else {
											sfd.core.alert('EL0002');
										}
									}
								);
							}
						}
					});
				}
			},			
			btnSearchDog: function(){
				sfd.core.showPopup('SearchDog',{closeHandler:function(result){
					sfd.log('result',result);
					if(result && result != 'esc'){
						
						_searchDogData = result;
						
						var _petCd = _searchDogData.petCd;        // 애견종류코드
						var _petColorCd = _searchDogData.petClr;  // 애견털색
						var _dogType = sfd.core.module.getPetName(_petCd) + '/' + sfd.core.module.getPetColor(_petCd,_petColorCd);
						sfd.core.elValue($ns('#kind-pet'), _dogType); 
					}
				}});
			},
			clickCautionBtn: function(event) {
				sfd.core.showPopup('CommonCompliance', {focusButton: event.currentTarget});
			},
			clickInfoBtn: function(event) {
				// var _noticeName = 'DriverProductInfo';
				// switch(_divisionName){
				// 	case 'driver': _noticeName = 'DriverProductInfo'; break;
				// 	case 'health': _noticeName = 'DriverProductInfo'; break;
				// 	case 'smartM': _noticeName = 'SmartMProductInfo'; break;
				// 	case 'pet':    _noticeName = 'PetProductInfo'; break;
				// }

				// sfd.core.showPopup(_noticeName, {focusButton: event.currentTarget, tabNo: 1});
				sfd.core.showPopup('PetProductInfo', {focusButton: event.currentTarget, tabNo: 1});
			},
			clickComplianceBtn: function(event) {
				// sfd.core.showClausesLeafletPDF("leaflet_myDrive");

				if(_divisionName == 'pet'){
					sfd.core.showPopup('PetProductInfo', {focusButton: event.currentTarget, tabNo: 2});
				}
				else{
					sfd.core.viewDocument('leaflet');
				}
				
			}
		}
	};
	return self;

	function init() {
		// 스텝 초기화
		initStep();

		// 기본 DLPO 설정
		settingDefaultDLPO();
	}
	
	// 반려견 보험인 경우 과거 리스트는 제외 함 제외후 운영가능한 리스트가 존재하는지 여부 확인
	function checkRecentListPet(inOriData){
		var _result = false;
		var _agreeDate;
		var _today = sfd.utils.stringToDate( sfd.data.getValue('sysdate') );
		
		$.each( inOriData, function(index, item){
			_agreeDate = sfd.utils.stringToDate( item.agreementDate );
			if( _agreeDate.getTime() >= _today.getTime() ){
				_result = true;
				return false;
			}
		} );

		return _result;
	}

	function initStep() {
		// 현재 스탭
		_curStep = 0;
		
		// 스탭 슬라이드 크기
		_slideWidth = 472;

		var $stepTrack = $ns('#step-track');
		var $stepSlide = $stepTrack.find('[id^="step"]');
		var _slideLength = $stepTrack.children('[id^="step"]').length;

		$stepTrack.width(_slideWidth * _slideLength);
		$('#step01').addClass('end');



	}

	function slideStep(inStep){

		var _slideWidth = -472;
		var $stepTrack = $ns('#step-track');
		var $stepSlide = $stepTrack.find('[id^="step"]');
				
		var _position = _slideWidth * inStep;
		var _duration = 500;


		// 슬라이드 시작
		$stepTrack.stop();
		$stepTrack.animate({'left': _position}, _duration, 'easeInOutExpo', function(){});	

		

		if (_curStep != inStep) {
			$('#step01').removeClass('end');

			setTimeout(function(){
				$('#step00').addClass('end');
			}, _duration)
			
		}
		else {
			$('#step00').removeClass('end');

			setTimeout(function(){
				$('#step01').addClass('end');
			}, _duration)			
		}


		_curStep = inStep;


		// $stepSlide.removeClass('active');
		// $stepSlide.eq(_curStep).addClass('active');	


	}

	function validate(inStep) {

		var _isChange = false;

		_curStep = inStep;

		sfd.core.initFormValidation($ns('#prod-info-form'), {
			button: $ns('#btn-next-step-info'),
		});	

		sfd.core.initFormValidation($ns('#prod-type-form'), {
			button: $ns('#btn-next-step-type'),
			onButtonStateChange: function(isEnabled) {
				var $button = $ns('#btn-next-step-type');
				if (isEnabled) {
					$button.html('보험료 계산하기');
				}
			}
		});

		if (_curStep == 0) {

			// step00
			var onValidationTypeFailed = function(invalidElements) {
				var $firstFailedEl = invalidElements[0];
				if ($firstFailedEl.isVisible(':radio') && $firstFailedEl.attr('name') == 'radio-petCls') {
					sfd.core.alert('보험가입 형태를 선택해 주세요.');
				}
			}		
			if (sfd.core.validateForm('#prod-type-form', { onFailed: onValidationTypeFailed }) != true) {
				return;
			}
			slideStep(1);


			// 데이터
			_subDivisionName = sfd.core.elValue($ns('input[name="radio-petCls"]'));

			// 데이터 값이 있을때
			var oldSubDivisionName = sfd.data.getValue('subDivisionName');
			if (oldSubDivisionName) {
				// 펫 유형이 변경되면
				if (oldSubDivisionName != _subDivisionName) {
					// 정보입력 패널 초기화
					sfd.core.elValue($ns('#kind-pet'), null);
					sfd.core.elValue($ns('#input-birth'), null);		
				}
			}

			sfd.data.setValue('subDivisionName', _subDivisionName);
			
			// 상품룰 상품별 제어
			sfd.data.setValue('ruleJson', sfd.data.getValue('ruleJson_'+_subDivisionName));
			sfd.data.setValue('templateJson', sfd.data.getValue('templateJson_'+_subDivisionName));

			// 선택한 상품코드 셋팅
			sfd.data.setValue('productCode', sfd.data.getValue('productCode_'+_subDivisionName));

			sfd.core.getPage('Left').updateProduct();
			
		} else if (_curStep == 1) {

			// 파슬리 에러문구 체인지
			if (_subDivisionName == 'cat') {
				$ns('#kind-pet').attr('data-parsley-required-message', '반려묘의 종류를 선택해 주세요.');
			} else {
				$ns('#kind-pet').attr('data-parsley-required-message', '반려견의 종류를 선택해 주세요.');
			}

			// step01
			var onValidationInfoFailed = function(invalidElements) {
				var $firstFailedEl = invalidElements[0];
			}					
			if (sfd.core.validateForm('#prod-info-form', { onFailed: onValidationInfoFailed }) != true) {
				return;
			}

			var birth_str = sfd.core.elValue('#input-birth');
			var gender_str = sfd.core.elValue('#select-gender');
			var jumin_str = sfd.utils.dateToSSN(birth_str, gender_str);

			var _petCd = sfd.data.getValue('petCd');        // 애견종류코드
			var _petColorCd = sfd.data.getValue('petClr');  // 애견털색
			
			var manAge_num = sfd.utils.manAge(birth_str, sfd.data.getValue('sysdate'));			// 만나이
			var insuredAge_num = sfd.utils.insuredAge(jumin_str, sfd.data.getValue('sysdate'));	// 보험나이
			var minAge = sfd.core.getUniqueCode('minAge', 'pet' , _subDivisionName); /*일*/
			var maxAge = sfd.core.getUniqueCode('maxAge', 'pet' , _subDivisionName); 
			var _dogBirth = sfd.utils.daysBetween(birth_str, sfd.data.getValue('sysdate'));

			if(!sfd.data.getValue('contractNo')) _isChange = true;				// 보험료계산을 안했으면
			if(birth_str != sfd.data.getValue('petBirth')) _isChange = true;	// 애견 생년월일 변경
			if(_searchDogData && _searchDogData.petCd != _petCd) _isChange = true;				// 애견 종류 변경 ( 애견 종류에 따라 특정담보 미가입 )
			//if(_searchDogData.petClr != _petColorCd) _isChange = true;			// 애견 털색 변경 ( 우선은 변경 체크 안하고 추후에 필요하면 활성화 )		

			var alertStr;

			if((_dogBirth < minAge || manAge_num > maxAge)){
				alertStr = '고객님께 안내해 드립니다.<br><br>반려견보험은 생후 '+ minAge +'일에서 만 '+ maxAge +'세까지 가입이 가능합니다. 반려견의 생년월일을 확인해 주세요.';
				if(_subDivisionName == 'cat') alertStr = alertStr.replace(/견/g, '묘');
			}
			
			// 가입연령 확인
			if(alertStr){
				$ns('#btn-next-step-info').setEnabled(false, {visualOnly: true});
				sfd.core.alert(alertStr);
				return false;
			}

			if (_isChange) {
				// 패널 데이터 초기화
				sfd.data.dataInit(0);

				sfd.data.setValue('petBirth', birth_str);
				sfd.data.setValue('designSSN', jumin_str);

				processPet();

			} else {
				processJump();
			}

		}
	}

	function changeStringView(inStep) {
		_curStep = inStep;

		if (_curStep == 0) {
			switch(_subDivisionName) {
				case 'dog':
					$ns('.__change-type-text').text('반려견');
					break;

				case 'cat':
					$ns('.__change-type-text').text('반려묘');
					break;
			}
		}
	}

	function settingInput() {
		var _petCd = sfd.data.getValue('petCd');        // 펫종류코드
		var _petColorCd = sfd.data.getValue('petClr');  // 펫털색
		var _petBirth = sfd.data.getValue('petBirth');	// 펫생일
		var _dogType = '';

		$ns('#kind-pet').setEnabled(false);

		if(_petCd && _petColorCd) {
			_dogType = sfd.core.module.getPetName(_petCd) + '/' + sfd.core.module.getPetColor(_petCd,_petColorCd);
			_searchDogData.petCd = _petCd;	
			_searchDogData.petClr = _petColorCd;	
		}

		// sfd.log('settingInput-_subDivisionName',_subDivisionName);
		// sfd.log('settingInput-_dogType',_dogType);
		// sfd.log('settingInput-_petBirth',_petBirth);
		
		sfd.core.elValue($ns('input[name="radio-petCls"]'), _subDivisionName); 
		sfd.core.elValue($ns('#kind-pet'), _dogType); 
		sfd.core.elValue($ns('#input-birth'), _petBirth);
	}
	
	function settingDefaultDLPO(){
		if(!_subDivisionName){
			$ns('#dlpo').find('[id^="dlpo-"]').css({'opacity':'0','z-index':'0'});
			$ns('#dlpo').find('#dlpo-product').css({'opacity':'1'});
		}
	}	

	function processPet() {
		
		// 애견 보험 기본 조건
		// 보험기간 1년, 플랜형(실속, 표준, 고급)
		// 개시일 today

		// 보험기간 갱신 - 1년
		var _startDate = sfd.data.getValue('sysdate');
		// 슬관절 수술비2 테스트를 위해서 9/25일 이후로 설정
		if( sfd.env.server != 'www' ){
			_startDate = sfd.utils.dateToString( sfd.utils.dateAfterDays(_startDate,30) );
		}
		var _endDate = sfd.utils.dateAfterYears(_startDate, 1);
		_endDate = sfd.utils.dateToString(_endDate);
		sfd.data.setValue('startDate', _startDate);
		sfd.data.setValue('endDate', _endDate );

		var _birth = sfd.core.elValue('#input-birth');
		var _manAge = sfd.utils.manAge(_birth, sfd.data.getValue('sysdate'));
		var _age = sfd.utils.manAge(_birth, sfd.data.getValue('sysdate'));

		sfd.log('processPet-_startDate',_startDate);
		sfd.log('processPet-_endDate',_endDate);
		sfd.log('processPet-_birth',_birth);
		sfd.log('processPet-_age',_age);

		// 강아지 생년월일 갱신
		sfd.data.setValue('petBirth',_birth);

		// 강아지 나이 갱신
		sfd.data.setValue('petAge',_age);
		
		// 애견 정보 갱신
		sfd.utils.saveObjectToData(_searchDogData);
		
		processNext();
	}

	// 다음 진행
	function processNext() {
		// 활동 로그
		runInsertCommonLog({'code':'2100'}).then (
			function(errorBln, jsonObj) {
				if (errorBln) return;

				// 보험료 재계산
				return runCreatePremiumInfo();
			}
		).then(
			function(errorBln, jsonObj) {
				if (errorBln) return;
				processJump();
			}
		);
	}
	// 다음 이동
	function processJump() {
		// 이벤트 체크
		sfd.module.eventManager.eventLongCheck({
			callback: function() {
				// 진행 모드 저장
				sfd.data.setValue('processMode', 'normal');
				
				sfd.core.showPage('next');
			}
		});
	}

	// 활동 로그
	function runInsertCommonLog(paramObj) {
		var jumin_str = sfd.data.getValue('designSSN');
		var birth_str = sfd.utils.ssnToDate(jumin_str).yyyymmdd();
		var sex_str = sfd.utils.genderCode(jumin_str, 'en');
		sex_str = (sex_str == 'm') ? '1' : '2';

		if(_divisionName == 'pet'){
			birth_str = sfd.data.getValue('petBirth');
			sex_str = '';
		}

		return sfd.core.runPromise('insertCommonLog', {
			'stepCode': sfd.data.getValue('frmStepHeader') + paramObj['code'],
			'prodCd': sfd.data.getValue('productCode'),
			'productCode': sfd.data.getValue('productCode'),
			'birthDay' : birth_str,
			'sex' : sex_str
		});
	}

	// 보험료 계산
	function runCreatePremiumInfo() {
		var calcQuote_obj = sfd.core.module.saleQ.getResult();
		var tranName_str = _subDivisionName == 'dog' ? 'getPremiumInfoDog':'getPremiumInfoCat';

		return sfd.core.runPromise(tranName_str, calcQuote_obj);
	}


	function $ns(selctorStr) {
		return $(self.ns + ' ' + selctorStr);
	}
});
