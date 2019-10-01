/**
 * 상품 공통 로직 처리
 * @class sfd.module
 */
define(function() {
	/* globals goCheck, goJoin, goLongCheck, goLongJoin */

	var sfd;
	var $wrapper;
	var self = {
		// version info
		version: {
			modified: '{version-modified}',
			deploy: '{version-deploy}',
			hash: '{version-hash}'
		},
		/**
		 * 모듈 초기화 작업
		 */
		initialization: function(d) {
			sfd = d;
			window.ghkwoekdlfprxm = d;
			$wrapper = $('#wrapper');
			self.addRemarketing();
		},
		/**
		 * 인터페이스 정의
		 * @category 서버 인터페이스
		 * @type {Object}
		 */
		interfaces: {
			setCommonDirectSession: { tranId: 'VD.MADD0518', desc: '다이렉트 공통 세션 생성 프로세스' },
			createMainConnect: { tranId: 'VD.ADDA0545', desc: 'ADS 메인 접속', 'path': 'page', 'method': 'GET' },
			getLoginCheck: { tranId: 'VD.MADD0480', desc: '로그인 값 체크' },
			getLoginInfo: { tranId: 'VD.MADD0535', desc: '로그인정보 조회' },
			readMemberYn: { tranId: 'VD.MADD0458', desc: '실명조회 ( 이게 실명체크 맞음, 위에거랑 헥랄리면 안됨 )' },
			getCalcDateInfo: { tranId: 'VD.MADD0505', desc: '개별 설계 가능일자 제어일자 리턴' },
			getBbsListForRia: { tranId: 'VD.CMBD0010', desc: '게시판 목록 조회_리아용' },
			writeBbsForRia: { tranId: 'VD.CMDJ0089', desc: '게시판 글쓰기' },

			/*eventSearch 대쳬예정*/setSearch: { tranId: 'VD.EVDB0197', desc: '이벤트 팩토리 진행 상태 조회' },
			eventStart: { tranId: 'VD.EVDB0196', desc: '이벤트 여부 조회' },
			eventSearch: { tranId: 'VD.EVDB0197', desc: '이벤트 여부 및 진행 중 이벤트 체크' },
			eventCheck: { tranId: 'VD.EVDB0198', desc: '이벤트 중복 여부체크(10개월중복등)' },
			eventJoin: { tranId: 'VD.EVDB0200', desc: '이벤트 참여' },
			eventLongCheck: { tranId: 'VD.EVDB0208', desc: '이벤트 중복 여부체크(일반, 장기)' },
			eventLongJoin: { tranId: 'VD.EVDB0209', desc: '이벤트 참여(일반, 장기)' },

			getEmergencyInfo: { tranId: 'VD.MARN0044', desc: '긴급안내 팝업 정보 조회' },
			getExistSalesCust: { tranId: 'VD.MADD0536', desc: '판매고객 여부 조회' },

			goKidiAgreeInfo: { tranId: 'VD.MADD0508', desc: '개발원 사전동의 유무 조회' },
			goKidiAgreeInfoLong: { tranId: 'VD.MARN0169', desc: '개발원 사전동의 유무 조회(장기)' },
			getCardPayCls: { tranId: 'VD.MADD0369', desc: '직전 1년간 삼성카드로 결제한 이력여부' },
			getCarContactList: { tranId: 'VD.MADD0017', desc: '가입설계심사' },
			certForVIDCheck: { tranId: 'VD.MPDG0157', desc: '공인인증서 인증 - 가상식별번호(VID) 검증용 서버인증서 조회' },
			certMobileStep1: { tranId: 'VD.EVDB0138', desc: '휴대폰인증 번호 요청' },
			goPrivatePkiRegist: { tranId: 'VD.MARN0210', desc: '사설인증발급' },
			goPrivatePkiCertLong: { tranId: 'VD.MARN0118', desc: '사설인증' },
			goPrivatePkiCertGen: { tranId: 'VD.MARN0119', desc: '사설인증' },
			goPrivatePkiCertEndo: { tranId: 'VD.ESDL0083', desc: '사설인증' },
			goPrivatePkiCertChange: { tranId: 'VD.ESDL0074', desc: '사설인증' },
			tripChangeUnderwriting: { tranId: 'VD.ESDL0071', desc: '마이다이렉트-해외여행기간변경심사' },
			tripChangePaymentCard: { tranId: 'VD.ESDL0073', desc: '마이다이렉트-해외여행기변경 - 카드결제' },
			tripChangeNoPay: { tranId: 'VD.ESDL0076', desc: '마이다이렉트-해외여행기변경 - 결제없음' },
			tripChangeRT: { tranId: 'VD.ESDL0078', desc: '마이다이렉트-해외여행기변경 - RT가능여부' },
			readMemberYnSimpleCalc: { tranId: 'VD.MADD0452', desc: '간편계산(생애첫차)' },
			setSessionSimpleCalc: { tranId: 'VD.MADD0453', desc: '간편계산(생애첫차)' },
			readRenewal: { tranId: 'VD.MADD0471', desc: '개발원 & 당사 계약 일괄 조회' },
			readRecentLog: { tranId: 'VD.MADD0537', desc: '최근 보험료계산 내역 조회' },
			removeRecentLog: { tranId: 'VD.MADD0551', desc: '최근 보험료계산 내역 삭제' },
			setSession: { tranId: 'VD.MADD0472', desc: '세션저장' },
			processAfterCarInfoSave: { tranId: 'VD.MADD0544', desc: '1차심사 및 단계로그 저장' },
			addKidiAgreeInfo: { tranId: 'VD.MADD0455', desc: '보험개발원 조회 동의 정보 추가' },
			getMileagePolicyInfo: { tranId: 'VD.MADD0456', desc: '전계약 에코마일리지 정보 조회' },
			getTemplate: { tranId: 'VD.MADD0538', desc: '설계Template객체 조회' },
			getContactDetailList: { tranId: 'VD.MADD0461', desc: '설계 조회' },
			checkCarNumberCheckExternal: { tranId: 'VD.MADD0502', desc: '적정차량연식 조회(개발원 차량조회)' },
			VD_Z0000025: { tranId: 'VD.MADD0539', desc: '자동차명으로 차명조회' },
			readCompanyList: { tranId: 'VD.MADD0463', desc: '제조사조회' },
			readCarNameList: { tranId: 'VD.MADD0464', desc: '제조사별 대표차명 조회' },
			readCarYear: { tranId: 'VD.MADD0465', desc: '대표차량명으로 해당 차량등록연도 조회' },
			readCarCodeList: { tranId: 'VD.MADD0466', desc: '차량등록연도별 세부차명 조회' },
			readCarDetailInfoList: { tranId: 'VD.MADD0467', desc: '세부차명으로 세부모델 조회' },
			readCarOptions: { tranId: 'VD.MADD0031', desc: '옵션조회' },
			searchCarName: { tranId: 'VD.MADD0560', desc: '차량정보 검색으로 찾기' },
			anycarSpc: { tranId: 'VD.MADD0454', desc: '애니카서비스조회' },
			setNoticeInfo: { tranId: 'VD.MADD0476', desc: '고지저장' },
			pibojaAgreeInfoExistCls: { tranId: 'VD.MADD0516', desc: '피보험자 동의정보 존재여부 조회' },
			readMinOptionAmt: { tranId: 'VD.MADD0532', desc: '전방추돌방지장치 부속추가시 최소부속입력가액' },
			readLeadingSamePolicyForDirect: { tranId: 'VD.MADD0468', desc: '동일증권조회' }, // dongil
			setSamePolicy: { tranId: 'VD.MADD0469', desc: '동일증권셋팅' }, // dongil
			getSamePolicyBloc: { tranId: 'VD.MADD0497', desc: '동일증권조회' }, // dongil
			setSamePolicyBloc: { tranId: 'VD.MADD0498', desc: '동일증권셋팅' }, // dongil
			getSamePolicyCorp: { tranId: 'VD.MADD0491', desc: '법인 전차량일괄계약 조회' }, // dongil
			getMyKidsContractList: { tranId: 'VD.MADD0533', desc: '자녀보험' },
			prevCarPremium: { tranId: 'VD.MADD0473', desc: '당사 자동갱신 전계약조회' },
			renewalCarPremium: { tranId: 'VD.MADD0474', desc: '갱신계산' },
			processCarPremium: { tranId: 'VD.MADD0462', desc: '자동차 보험료 계산' },
			sendMatureSmsEmail: { tranId: 'VD.MADD0499', desc: '만기안내 신청' },
			getSelfServiceContInfo: { tranId: 'VD.MADD0520', desc: '셀프점검 결제정보 조회' },
			processOneShotPremium: { tranId: 'VD.MADD0475', desc: '담보별 원샷 보험료' },
			processMyCarSamplePremium: { tranId: 'VD.MADD0487', desc: '단순보험료' },
			getBlackBoxImageUpload: { tranId: 'VD.CMDJ0091', desc: '블랙박스 사진등록' },
			smsBlackboxImageUploadURL: { tranId: 'VD.MADD0540', desc: '블랙박스 휴대폰사진등록 문자받기' },
			getBlackBoxImageUploadByMobile: { tranId: 'VD.MADD0562', desc: '휴대폰에서 블랙박스 이미지 업로드' },
			//copyMileageImage: { tranId: 'VD.MADD0512', desc: '블랙박스 사진 복사' },
			getEcoMileageImageUpload: { tranId: 'VD.CMDJ0090', desc: '마일리지 사진등록' },
			smsMileageImageUploadURL: { tranId: 'VD.MADD0541', desc: '마일리지 휴대폰사진등록 문자받기' },
			getEcoMileageImageUploadByMobile: { tranId: 'VD.MADD0563', desc: '휴대폰에서 마일리지 이미지 업로드' },
			getEcoMileageImageUploadLast: { tranId: 'VD.CMDJ0067', desc: '전계약 마일리지 종료정산 사진등록' },
			getKidsImageUpload: { tranId: 'VD.CMDJ0093', desc: '자녀사랑할인 서류(자녀관계+임신확인서) 등록' },
			smsKidsImageUploadURL: { tranId: 'VD.MADD0542', desc: '자녀사랑할인 휴대폰사진등록 문자받기' },
			getKidsImageUploadByMobile: { tranId: 'VD.MADD0564', desc: '휴대폰에서 자녀사랑할인 이미지 업로드' },
			getWarningImageUpload: { tranId: 'VD.MADD0566', desc: '차선이탈장치 이미지 업로드' },
			smsWarningImageUploadURL: { tranId: 'VD.MADD0561', desc: '차선이탈경고장치 휴대폰사진등록 문자받기' },
			getWarningImageUploadByMobile: { tranId: 'VD.MADD0565', desc: '휴대폰에서 차선이탈경고장치 이미지 업로드' },
			getFrontAccidentImageUpload: { tranId: 'VD.MADD0592', desc: '전방충돌방지장치 이미지 업로드' },
			smsFrontAccidentImageUploadURL: { tranId: 'VD.MADD0590', desc: '전방충돌방지장치 휴대폰사진등록 문자받기' },
			getFrontAccidentImageUploadByMobile: { tranId: 'VD.MADD0591', desc: '휴대폰에서 전방충돌방지장치 이미지 업로드' },
			getImageUpload: { tranId: 'VD.MADD0595', desc: '일반/장기 공용 이미지 업로드' },	// ! 코드명 : lobCd  값: 일반: LP , 장기 : LL  <-- 반듯이 전송값에 들어가야함, 트랜id 는 위에 펫과 동일하게 변경됨
			uploadOnedayPhoto: { tranId: 'VD.MADD0602', desc: '원데이 자동차 보험 모바일 즉시 이미지 업로드' },	// 앱에서만 쓰임


			readContractBo: { tranId: 'VD.MADD0481', desc: '현재BO조회 - 최근계산기록계산' },
			setTargetEvent: { tranId: 'VD.EVDB0210', desc: '고객Seg별 오퍼링 제공 이벤트' },
			insertCarContact: { tranId: 'VD.MADD0460', desc: '설계저장하기' },
			readCarInfoItem: { tranId: 'VD.MADD0030', desc: '자동차 담보 조회' },
			checkExpenseCoverage: { tranId: 'VD.MADD0501', desc: '법률지원중복조회' },
			createMileageInspectionInfo: { tranId: 'VD.MADD0511', desc: 'PushURL생성' },
			smsAppDownURL:	{ tranId: 'VD.EVDB0169', desc: '모바일 앱 다운 URL SMS 전송' },			// trans.json 미작성
			getCarContractDetail: { tranId: 'VD.MADD0575', desc: '전계약 비교' },
			getImageList: { tranId: 'VD.MADD0545', desc: '이미지 목록 조회' },
			downloadImage: { tranId: 'VD.MADD0546', desc: '이미지 다운로드' },
			underwritingCustInfo: { tranId: 'VD.MADD0477', desc: '사전 심사 처리' },
			moveZipcodeSearchNum: { tranId: 'VD.CMDJ0062', desc: '주소검색_공통팝업_동(읍.면.리) 검색 화면호출' },
			moveZipcodeSearchRdNm: { tranId: 'VD.CMDJ0063', desc: '주소검색_공통팝업_도로명 검색 화면호출' },
			getCustContactInfo: { tranId: 'VD.MADD0515', desc: '피보험자 내정보 불러오기' },
			getCorpCustName: { tranId: 'VD.MADD0495', desc: '질권 사업자 조회' },
			processUnderwriting: { tranId: 'VD.MADD0032', desc: '설계완료 & 심사 처리' },
			readCarWrittenApplicaion: { tranId: 'VD.MADD0479', desc: '설계조회(청약내용 보기) / 설계완료 & 심사처리 후 내부 호출' },
			insertStepCheck: { tranId: 'VD.MADD0483', desc: '엑션을 호출하지 않는 화면 버튼의 단계를 기록하기 위함' },
			getCustMktCheck: { tranId: 'VD.MADD0524', desc: '마케팅 동의 잔여기간 1년 이상 여부값' },
			processPosting: { tranId: 'VD.MADD0527', desc: '자동차 포스팅' },
			processPostingForLong: { tranId: 'VD.MARN0196', desc: '장기 포스팅' },
			processPostingForGen: { tranId: 'VD.MARN0199', desc: '일반 포스팅' },
			processCancelPosting: { tranId: 'VD.MADD0531', desc: '포스팅 취소' },
			setSecuiLogSet: { tranId: 'VD.MADD0488', desc: '보안로그(공인인증 완료 후 내부 호출)' },
			getAnyCarPlusCardReqSave: { tranId: 'VD.MADD0500', desc: '세이브 포인트 설정 유무 체크' },
			searchUpoint: { tranId: 'VD.MADD0503', desc: 'U포인트조회' },
			searchSamsungfirePoint: { tranId: 'VD.MADD0593', desc: '삼성화재포인트조회' },
			getOcbCardInfo: { tranId: 'VD.MADD0523', desc: 'OK캐쉬백조회(결제화면이동시)' },
			getOcbPointInfo: { tranId: 'VD.MADD0522', desc: 'OK캐쉬백포인트 조회(결제화면에서 클릭시)' },
			getMileageInfoSclassCard: { tranId: 'VD.MADD0504', desc: 'S-Class카드 선포인트 사용가능여부 및 가능금액 조회' },
			searchMyShinHanPoint: { tranId: 'VD.MADD0507', desc: '마이신한포인트 조회' },
			getLottePointAndSaveInfo: { tranId: 'VD.MADD0513', desc: '롯데 인슈포인트 조회' },
			processCardClearing: { tranId: 'VD.MADD0528', desc: '카드결제' },
			beforeProcessBankClearing: { tranId: 'VD.MADD0549', desc: 'PG 결제 초기 셋팅' },
			processBankClearing: { tranId: 'VD.MADD0529', desc: 'PG 결제' },
			bankPayPage: { tranId: 'VD.MADD0449', desc: 'BankPayPage', 'method': 'POST' },
			bankPayPageEmbed: { tranId: 'VD.MADD0600', desc: 'BankPayPage', 'method': 'POST' },
			processSuppositionBankClearing: { tranId: 'VD.MADD0530', desc: '무통장 입금' },
			processCardClearingForLong: { tranId: 'VD.MARN0197', desc: '장기 클리어링(신용카드)' },
			processBankClearingForLong: { tranId: 'VD.MARN0198', desc: '장기 클리어링(PG/RT)' },
			processCardClearingForGen: { tranId: 'VD.MARN0200', desc: '일반 클리어링(신용카드)' },
			processBankClearingForGen: { tranId: 'VD.MARN0201', desc: '일반 클리어링(PG/RT)' },
			processRTCheck: { tranId: 'VD.MARN0202', desc: 'RT 결제 상태 체크' },
			afterTreatmentSendInfo: { tranId: 'VD.MADD0506', desc: '피보험자 정보동의 팝업에서 사후동의 처리시 sms/email 발송' },
			insertOfficialApprovalCheck: { tranId: 'VD.MADD0553', desc: '보험자 정보동의 팝업 개인정보즉시동의 PDSV33TB 저장 프로세스' },
			getMedicalInquirySimple: { tranId: 'VD.MADD0521', desc: '실손조회' },
			printAIAutoApplOverview4: { tranId: 'VD.MADD0105', desc: '보험증권 출력' },
			printAIAutoApplOverview3: { tranId: 'VD.MADD0104', desc: '가입증명서 출력', 'etc': '이건 삭제 해도 될듯' },
			driverCoverageJoinCls: { tranId: 'VD.MADD0383', desc: '당사운전자 비용가입자 조회', 'etc': '이건 삭제 해도 될듯' },
			getMobileProductInfoSend: { tranId: 'VD.MSDH0011', desc: '상품설명 보내기' },
			getMobileClausSend: { tranId: 'VD.MSDH0012', desc: '보험약관 보내기' },
			tempSave: { tranId: 'VD.MADD0543', desc: '임시저장하기' },
			saveCustomerInfo: { tranId: 'VD.MADD0547', desc: '피보험자 계약자 저장' },
			underwritingComplete: { tranId: 'VD.MADD0548', desc: '계약자 추가사항 저장, 설계완료, 심사' },
			insertHomepageMonitoringLog: { tranId: 'VD.LGDC0010', desc: '로그' },
			writtenApplicaionCustInfo: { tranId: 'VD.MADD0478', desc: '이메일유입 6번 진행' },
			sendEmail: { tranId: 'VD.MADD0482', desc: 'Email 보내기' },
			getContractList: { tranId: 'VD.MPDG0003', desc: '자동차,장기,일반 전건 조회(자동차,장기,일반순으로 sort)' },
			getGenContractDetail: { tranId: 'VD.MPDG0004', desc: '마이다이렉트 보험계약조회(일반상세)' },
			getLongContractDetail: { tranId: 'VD.MPDG0005', desc: '마이다이렉트 보험계약조회(장기상세)' },
			requestPhoneVerificationCode: { tranId: 'VD.EVDB0138', desc: '배서 휴대폰인증번호 발송' },
			nameCheckEndo: { tranId: 'VD.ESDL0102', desc: '배서-계약조회 실명인증 - 신규트랜' },
			getDecMPadKeyEndo: { tranId: 'VD.MADD0385', desc: '모바일 보안 키패드로 세션에 저장된 정보를 리턴' },
			getInsuredPiboja: { tranId: 'VD.MPDG0151', desc: '피보험자 개인정보 목록' },
			getInsuredPibojaAgreeNotPki: { tranId: 'VD.MPDG0139', desc: '피보험자 동의 (휴대폰, 신용카드 인증후 태운다 주의)사설인증 태우는것이 아님)'},
			sendFax: { tranId: 'VD.MADD0574', desc: '증권증명서 Fax 보내기'},	// 팩스보내기(완료패널 20180710 add)
			dupCodeList: { tranId: 'VD.MADD0552', desc: '중복담보 코드 조회' },
			dupCodeListAdd: { tranId: 'VD.MADD0586', desc: '중복담보 코드 조회' },
			areaGradeForDirect: { tranId: 'VD.MADD0517', desc: '고손해율 지역등급 조회' },
			searchTmapScore: { tranId: 'VD.MADD0577', desc: 't map 점수 조회' },
			searchUBIAgreeInfo: { tranId: 'VD.MADD0597', desc: 'UBI특약 가입 동의정보 조회' },
			getOnestopPossibleList: { tranId: 'VD.MADD0568', desc: '원스탑대상 설계리스트 조회' },
			oneDayEventJoin: { tranId: 'VD.EVDB0238', desc: '원데이 이벤트 조인' },
			carzen: { tranId: 'VD.MADD0594', desc: '카젠 차량상세 조회' },

			ecoRefundAboutPremium: { tranId: 'VD.MADD0578', desc: '전계약 마일리지 예상환급금 조회' },
			ecoRefundConfirmPremium: {tranId: 'VD.MADD0583', desc: '전계약 마일리지 확정환급금 조회'},
			ecoRefundEndoPaper: {tranId: 'VD.MADD0580', desc: '마일리지 정산 특약 환급전표 조회'},
			ecoRefundCalc: { tranId: 'VD.MADD0579', desc: '마일리지 정산 특약 신청'},
			readOcrResultInfo: { tranId: 'VD.MADD0598', desc: 'OCR 판독결과 정보조회'},

			disabledImageUpload: { tranId: 'VD.CMDJ0094', desc: '장애인특약 서류 이미지 업로드'},
			getPartsList: { tranId: 'VD.MADD0587', desc: '자동차 추가부속 목록 조회'},
			imgRegCls: { tranId: 'VD.MADD0567', desc: '이미지 등록 필요 여부 조회'},
			readAnyFitInfo: { tranId: 'VD.MADD0596', desc: '애니핏 정보 조회'},

			// 마이다이렉트
			getCarContractDetailMyDirect: { tranId: 'VD.MPDG0008', desc: '마이다이렉트-자동차보험상세보기' },
			getPremCarDetail: { tranId: 'VD.MPDG0045', desc: '마이다이렉트-자동차보험 납입내역 상세' },
			getPremLongDetail: { tranId: 'VD.MPDG0044', desc: '마이다이렉트-일반/장기 납입내역 상세' },
			getAccountList: { tranId: 'VD.MPDG0051', desc: '마이다이렉트-자동이체계좌번호 변경 리스트' },
			getAccountDetail: { tranId: 'VD.MPDG0052', desc: '마이다이렉트-자동이체계좌번호 변경 상세페이지' },
			getAccountExist: { tranId: 'VD.MPDG0053', desc: '마이다이렉트-자동이체계좌번호 존재여부 확인' },
			getCancelContractList: { tranId: 'VD.MPDG0141', desc: '마이다이렉트-개시전취소 목록조회 gubun(1:자동차,2:장기,3:일반)' },
			getPointPaymentYn: { tranId: 'VD.MPDG0241', desc: '포인트 결제 여부' },
			getCancelDetail: { tranId: 'VD.MPDG0143', desc: '마이다이렉트-개시전취소 상세' },
			getIsCancel: { tranId: 'VD.MPDG0149', desc: '마이다이렉트-취소 가능여부 확인 (G0143 과 G0145 사이에 호출)' },
			loadCancelAccountDetail: { tranId: 'VD.MPDG0145', desc: '마이다이렉트-환급계좌 조회' },
			getCancelResult: { tranId: 'VD.MPDG0146', desc: '마이다이렉트-개시전취소 요청' },
			getCancelCounsel: { tranId: 'VD.MPDG0148', desc: '마이다이렉트-상담신청 요청' },
			mydirectRequestCounsel: { tranId: 'VD.MPDG0232', desc: '마이다이렉트-상담신청 요청' },
			getInsurancePolicySend: { tranId: 'VD.MSDH0009', desc: '마이다이렉트-가입증명서, 보상처리내역서, 할인할증등급서 발송' },
			getStockSend: { tranId: 'VD.MSDH0010', desc: '마이다이렉트-증권발송' },
			getCustomerInfo: { tranId: 'VD.ESDL0060', desc: '전사고객정보 조회' },
			updateCustomerInfo: { tranId: 'VD.ESDL0061', desc: '전사고객정보 수정' },

			getClaimCertSendFax: { tranId: 'VD.MCDE0038', desc: '마이다이렉트-보상처리내역서 팩스 발송' },
			getClaimAccidentList: { tranId: 'VD.MCDE0020', desc: '마이다이렉트-보상처리내역서 목록 조회' },
			getInsurancePolicyList: { tranId: 'VD.MSDH0001', desc: '마이다이렉트-가입증명서, 증권, 할인할증 일괄조회' },
			getPolicyList: { tranId: 'VD.MSDH0002', desc: '마이다이렉트-보험증권 조회' },
			getClaimCarList: { tranId: 'VD.MCDE0002', desc: '마이다이렉트-자동차보상내역 목록' },
			getClaimCarDetail: { tranId: 'VD.MCDE0006', desc: '마이다이렉트-자동차보상내역 상세' },
			getDiscountPolicyList: { tranId: 'VD.MSDH0001', desc: '마이다이렉트-할인할증 등급확인서 목록 조회' },
			getAnycarServiceUseList: { tranId: 'VD.MPDG0190', desc: '마이다이렉트-애니카서비스 이용내역' },
			getClaimViewList: { tranId: 'VD.MPDG0192', desc: '마이다이렉트-장기보상내역 목록' },
			getClaimViewDetail: { tranId: 'VD.MPDG0193', desc: '마이다이렉트-장기보상내역 상세' },
			getLongClaimAccount: { tranId: 'VD.MPDG0214', desc: '마이다이렉트-장기보상지급계좌조회' },
			getCarTroubleNum: { tranId: 'VD.MPDG0195', desc: '마이다이렉트-고장출동요청차량번호조회' },
			insertCarTroubleCallCenter: { tranId: 'VD.MPDG0196', desc: '마이다이렉트-DB저장 고장출동(웹)' },
			getCarTroubleRewardChk: { tranId: 'VD.MPDG0197', desc: '마이다이렉트-모바일 고장출동 유무상서비스 확인' },
			getCarTroubleResult: { tranId: 'VD.MPDG0198', desc: '마이다이렉트-모바일 고장출동요청 결과' },
			sendKakaoLand: { tranId: 'VD.MPDG0199', desc: '마이다이렉트-협력업체위치정보 고객kakaotalk 전송' },
			// 마이다이렉트 납입
			getInstallmentLongList: { tranId: 'VD.MPDG0014', desc: '마이다이렉트-장기납입대상목록조회' },
			getInstallmentLongPayAmount: { tranId: 'VD.MPDG0152', desc: '마이다이렉트-납입할 회차분 할인금액이 반영된 보험료 조회' },
			getInstallmentRTResult: { tranId: 'VD.MPDG0166', desc: '마이다이렉트-RT납입처리(납입시 공인인증 클릭 이벤트)' },
			getInstallmentCardResult: { tranId: 'VD.MPDG0242', desc: '마이다이렉트-카드납' },
			checkAccountForCustomer: { tranId: 'VD.MPDG0171', desc: '마이다이렉트-계좌확인(정합성 리턴)' },
			checkEmail: { tranId: 'VD.CMDJ0002', desc: '마이다이렉트-이메일중복확인' },
			requestCounsel: { tranId: 'VD.MADD0035', desc: '마이다이렉트-상담신청' },
			nameCheckForMydirect: { tranId: 'VD.MMDB0099', desc: '비회원(모바일) 로그인 Hash 생성 및 실명인증-mydirect' },
			checkSession: { tranId: 'VD.MPDG0210', desc: '비회원(모바일) 세션 체크-mydirect' },
			removeSession: { tranId: 'VD.MPDG0209', desc: '세션삭제-mydirect' },
			getDecMPadKey: { tranId: 'VD.MADD0514', 'desc': '모바일 보안 키패드로 세션에 저장된 정보를 리턴'},
			acceptCounsel: { tranId: 'VD.MADD0470', desc: '상담신청' },
			getSmartAnswer: { tranId: 'VD.MADD0526', desc: '머신러닝상담신청' },
			blackBoxCopyImage: { tranId: 'VD.MADD0512', desc: '블랙박스 사진 복사' },
			printFinishCertificate: { tranId: 'VD.MADD0484', desc: '가입증명서 출력' },
			printInsurancePolicy: { tranId: 'VD.MADD0485', desc: '보험증권 출력' },
			printSubscription: { tranId: 'VD.MADD0486', desc: '상품설명서/청약서 통합 출력' },
			printProductManual: { tranId: 'VD.MADD0559', desc: '상품설명서 출력' },
			statisticsDriver: { tranId: 'statisticsDataDriver', desc: '다른분의 가입통계-운전자' }, // 테스트
			getCorpKind: { tranId: 'VD.MADD0534', desc: '자동차 법인 업태/종목 조회' },

			// 일괄
			corpBlocKidi: { tranId: 'VD.MADD0490', desc: '법인갱신설계 일괄 목록조회' },
			processCarPremiumBloc: { tranId: 'VD.MADD0494', desc: '법인용 일괄 신규 보험료계산' },
			renewalCarPremiumBloc: { tranId: 'VD.MADD0550', desc: '법인용 일괄 갱신 보험료계산' },
			carLossYnBloc: { tranId: 'VD.MADD0457', desc: '일괄 전계약 자차미가입 조회' },
			// 법인
			corpInfo: { tranId: 'VD.MADD0492', desc: '법인기업고객확인' },
			readRenewalCorp: { tranId: 'VD.MADD0489', desc: '법인갱신설계목록' },
			getSurveyList: { tranId: 'VD.EVDB0236', desc: '설문조사 질문 및 응답항목조회' },
			setSurveyList: { tranId: 'VD.EVDB0237', desc: '설문조사 답변 저장' },
			underwritingCorpInfo: { tranId: 'VD.MADD0493', desc: '법인개별 고객정보 유도' },

			// 장기
			insertCommonLog: {tranId: 'VD.MARN0147', desc: '활동로그 저장'},
			getLoginCheckForLong: { tranId: 'VD.MADD0535', desc: '로그인 값 체크' },
			getQuotationTemplate: {tranId: 'VD.MARN0195', desc: '템플릿 조회'},
			createPremiumInfo: {tranId: 'VD.MARN0157', desc: '운전자 보험료 계산'},
			createPremiumInfoSmartM: {tranId: 'VD.MARN0214', desc: '스마트맞춤보장 보험료 계산'},
			createPremiumInfoRealLoss: {tranId: 'VD.MARN0220', desc: '실손 보험료 계산'},
			createPremiumInfoHealth: {tranId: 'VD.MARN0193', desc: '건강 보험료 계산'},
			createPremiumInfoDental: {tranId: 'VD.MARN0224', desc: '치아 보험료 계산'},
			createPremiumInfoCancer: {tranId: 'VD.MARN0223', desc: '암 보험료 계산'},
			createPremiumInfoHome: {tranId: 'VD.MARN0222', desc: '주택화재 보험료 계산'},
			createPremiumInfoChild: {tranId: 'VD.MARN0229', desc: '어린이 보험료 계산'},
			createPremiumInfoAnnuity: {tranId: 'VD.MARN0227', desc: '연금저축(유배당) 보험료 계산'},
			createPremiumInfoAnnuityFD: {tranId: 'VD.MARN0231', desc: '연금저축(무배당) 보험료 계산'},
			createPremiumInfoSavings: {tranId: 'VD.MARN0228', desc: '저축 보험료 계산'},
			getSavingsTermination: {tranId: 'VD.MARN0026', desc: '저축 보험료 계산-예상환급률'},
			getLowTax: {tranId: 'VD.MARN0226', desc: '연금 저축 연금한도 및 비과세 한도 상세정보'},
			getAllFixedAmountBeforeInquiry: {tranId: 'VD.MARN0188', desc: '정액담보 조회'},
			getEtrpCustFatcaExistYn: {tranId: 'VD.MARN0150', desc: 'Fatca 정보 조회'},
			createSalesCustFatcaInfo: {tranId: 'VD.MARN0151', desc: 'Fatca 정보 등록'},
			sendPremiumInfoEmail: {tranId: 'VD.MARN0159', desc: '이메일 계산결과 받기'},
			setSessionFrmCustInfoLong: {tranId: 'VD.MARN0155', desc: '기본 정보를 세션에 저장(장기-이것이 실명체크입니다.)'},
			getRecentCalculateInfoCar: { tranId: 'VD.MARN0201', desc: '최근계산기록 리스트 조회(자동차)' },
			getRecentCalculateInfoLong: { tranId: 'VD.MARN0154', desc: '최근계산기록 리스트 조회(장기)' },
			getTerminationRefundInfos: { tranId: 'VD.MARN0163', desc: '예상만기환급리스트 조회' },
			underwritingQuotationLong: { tranId: 'VD.MARN0161', desc: '가입설계 심사(장기)' },
			underwritingQuotationRealLoss: { tranId: 'VD.MARN0161', desc: '실손 가입설계 심사' },
			underwritingQuotationHealth: { tranId: 'VD.MARN0161', desc: '건강 가입설계 심사' },
			underwritingQuotationGen: { tranId: 'VD.MARN0178', desc: '가입설계 심사(일반)' },
			getMedicalInquiryLong: {tranId: 'VD.MARN0160', desc: '다른보험가입여부 손보협회조회(장기)'},
			getMedicalInquiryGen: {tranId: 'VD.MARN0182', desc: '다른보험가입여부 손보협회조회(일반)'},
			getMyCustInfo: {tranId: 'VD.MARN0203', desc: '내정보 불러오기를 위한 고객정보 조회'},		// desc 이상함
			getUnderCustomerInfoLong: {tranId: 'VD.MARN0158', desc: '회원정보 가져오기'},				// desc 이상함
			getUnderCustomerInfoGen: {tranId: 'VD.MARN0176', desc: '일반 보험료 계산완료후 가입하기'},	// desc 이상함
			getContractStatus: {tranId: 'VD.MARN0192', desc: '설계번호를 이용하여 설계상태를 체크한다.'},
			getQuotationLong: {tranId: 'VD.MARN0156', desc: '장기 설계정보 조회'},
			getQuotationRealLoss: {tranId: 'VD.MARN0156', desc: '실손 설계정보 조회'},
			getQuotationHealth: {tranId: 'VD.MARN0156', desc: '건강 설계정보 조회'},
			getQuotationGen: {tranId: 'VD.MARN0173', desc: '일반 설계정보 조회'},
			getCompleteSaleQuestionnaires: {tranId: 'VD.MARN0189', desc: '완전판매모니터링 설문조회'},
			insertCompleteSaleQuestionnairesResult: {tranId: 'VD.MARN0190', desc: '완전판매 모니터링 질문지 결과 저장'},
			changeCollMethFSpcl: {tranId: 'VD.MARN0208', desc: '청약일자 변경(장기)'},
			changeCollMethRealLoss: {tranId: 'VD.MARN0208', desc: '실손청약일자 변경('},
			changeCollMethHealth: {tranId: 'VD.MARN0208', desc: '건강 청약일자 변경'},
			changeCollMethGen: {tranId: 'VD.MARN0209', desc: '청약일자 변경(일반)'},
			prcForConnJoin: {tranId: 'VD.MARN0168', desc: '운전자 연계가입 선행 호출'},
			// saveInfoForSmartCovrAnls: {tranId: 'VD.MARN0141', desc: '보장분석을 위한 고객정보 저장'},	// AS-IS
			saveInfoForSmartCovrAnls: {tranId: 'VD.MARN0212', desc: '보장분석을 위한 고객정보 저장'}, // TO-BE
			getSmartCovrAnls: {tranId: 'VD.MARN0213', desc: '보장분석 정보 데이터'},
			getAccumulatedSimulationData: {tranId: 'VD.MARN0225', desc: '장기 누적 시뮬레이션 데이터 조회'},
			getRenewPremium: {tranId: 'VD.MARN0183', desc: '향후 보험료 조회'},
			getDefaultSetting: {tranId: 'VD.MARN0235', desc: '디폴트 플랜정보 조회'},

			// 출력서 관련 (장기)
			printInsurancePolicyLong: { tranId: 'VD.MARN0211', desc: '보험증권 출력'},
			printSubscriptionLong: { tranId: 'VD.MARN0153', desc: '청약서(복합) 출력'},
			// printSubscriptionLong2: { tranId: 'VD.MARN0166', desc: '청약서 출력'},
			printProductManualLong: { tranId: 'VD.MARN0165', desc: '상품설명서'},
			printProductSummaryLong: { tranId: 'VD.MARN0164', desc: '요약자료 보기'},
			// 출력서 관련 (일반)
			printInsurancePolicyGen: { tranId: 'VD.MARN0180', desc: '보험증권 출력'},
			printSubscriptionGen: { tranId: 'VD.MARN0187', desc: '청약서(복합) 출력'},
			// printSubscriptionGen2: { tranId: 'VD.MARN0178', desc: '청약서 출력'},
			printCertificateGen: { tranId: 'VD.MARN0184', desc: '가입증명서 출력'},

			// 일반(해외여행)
			calculateQuotationForTravel: { tranId: 'VD.MARN0174', desc: '총 보험료 계산(해외/유학 보험)' },
			setSessionFrmCustInfo: { tranId: 'VD.MARN0172', desc: '기본 정보를 세션에 저장(일반)' },
			setSessionFrmCustInfos: { tranId: 'VD.MARN0186', desc: '여행보험 가족형 고객등록 및 실명체크' },
			getInsuredNoticeInfo: { tranId: 'VD.MARN0207', desc: '일반 신계약 고지사항 조회' },
			getRecentCalculateInfos: { tranId: 'VD.MARN0171', desc: '최근계산기록 리스트 조회(일반)' },
			saveStepLogLong: { tranId: 'VD.MARN0146', desc: '단계로그저장(장기)' },
			saveStepLogGen: { tranId: 'VD.MARN0179', desc: '단계로그저장(일반)' },
			getGeneralPolicyExistYn: { tranId: 'VD.MARN0205', desc: '해외여행 전계약정보 존재여부 조회' },
			getGeneralPolicyInfo: { tranId: 'VD.MARN0206', desc: '해외여행 전계약번호로 계약정보 조회' },
			getRealLossPaymentStopList: { tranId: 'VD.MARN0232', desc: '유학보험 실손납입 중지 대상 리스트 조회' },
			getCountryList: { tranId: 'VD.MARN0234', desc: '일반 국가리스트 조회' },
			// 일반(국내여행)
			calculateQuotationForTravelDomestic: { tranId: 'VD.MARN0175', desc: '총 보험료 계산(국내여행 보험)' },
			
			createPremiumInfoGolf: {tranId: 'VD.MARN0230', desc: '골프 보험료 계산'},
			// 카드매출전표조회
			getCreditCardPrint: {tranId: 'VD.MPDG0156', desc: '카드매출전표 조회'},

			// 직업검색
			searchJob: {tranId: 'VD.MARN0204', desc: '직업검색 - 직업명검색, 대중소분류조회'},
			// 주소검색
			searchAddress:	{tranId: 'VD.MPDG0189', desc: '주소검색(공통) - 통합검색'},
			searchAddressZipCode: { tranId: 'VD.CMDJ0057', desc: '주소검색(공통) - 지번주소 검색' },
			searchAddressArea: { tranId: 'VD.CMDJ0058', desc: '주소검색(공통) - 도로명주소 검색 > 시군구' },
			searchAddressRoad: { tranId: 'VD.CMDJ0059', desc: '주소검색(공통) - 도로명주소 검색 > 도로' },
			searchAddressBuilding: { tranId: 'VD.CMDJ0060', desc: '주소검색(공통) - 도로명주소 검색 > 건물번호.건물' },
			refineAddress: { tranId: 'VD.CMDJ0061', desc: '주소검색(공통) - 주소변환' },

			getTempSaveDetail: { tranId: 'VD.MADD0569', desc: '임시저장 상세조회'},
			sendDeviceInfo: { tranId: 'VD.MPDG0200', desc: 'NOS 단말정보수집'},

			getServerTime: { tranId: 'VD.MARN0162', desc: '서버 날짜 시간 가져오기'},
			getNoticeList: { tranId: 'VD.MARN0170', desc: '고지리스트 받아오기'},
			// 앱카드 페이지용 (ifrmae으로 로드 해야 한다.)
			loadAppCardPage: { tranId: 'VD.MARN0152', desc: '앱카드 열기'},
			loadSSGPayPage: { tranId: 'VD.MARN0572', desc: 'SSGPay 열기'},
			// certTran
			goCertMobile1: { tranId: 'VD.EVDB0232', desc: '휴대폰 인증 - 인증번호 조회' },
			goCertMobile2: { tranId: 'VD.EVDB0233', desc: '휴대폰 인증 - 인증 처리', type: 'cert'}, // multiCert
			goCertCardLong: { tranId: 'VD.MARN0143', desc: '신용카드 인증(장기) - 인증 처리', type: 'cert'},
			goCertLong: { tranId: 'VD.MARN0144', desc: '공인인증서 인증(장기) - 인증 처리', type: 'cert'},
			goKidiCertMobile1: { tranId: 'VD.EVDB0234', desc: '휴대폰 인증 - 인증번호 조회(개발원 조회 동의 icps)' },
			goKidiCertMobile2: { tranId: 'VD.EVDB0235', desc: '휴대폰 인증 - 인증 처리(개발원 조회 동의 icps)', type: 'cert'},
			goKidiCert: { tranId: 'VD.MADD0509', desc: '공인인증서 인증 - 인증 처리   (개발원 조회 동의 icps)', type: 'cert'},
			goKidiCertCard: { tranId: 'VD.MADD0510', desc: '신용카드 인증 - 인증 처리 (개발원 조회 동의 icps)', type: 'cert'},
			goPkiEx: { tranId: 'VD.MADD0459', desc: '공인인증', type: 'cert'},
			goPrivatePrivatePkiCert: { tranId: 'VD.MARN0145', desc: '사설인증', type: 'cert'},
			goKidiCertMobile1Others: { tranId: 'VD.MADD0387', desc: '설계자 이외의 고객 개발원사전동의 휴대폰 인증' },
			goKidiCertMobile2Others: { tranId: 'VD.MADD0388', desc: '설계자 이외의 고객 개발원사전동의 휴대폰 인증', type: 'cert'},
			verifyUserWithPhone: { tranId: 'VD.EVDB0139', desc: '배서 휴대폰인증', type: 'cert'},
			getInsuredPibojaAgree: { tranId: 'VD.MPDG0136', desc: '피보험자 동의 공인인증', type: 'cert'},
			getAccountPki: { tranId: 'VD.MPDG0054', desc: '마이다이렉트-자동이체계좌번호 업데이트(공인인증)', type: 'cert'},
			goMydirectPkiCert: { tranId: 'VD.MMDB0100', desc: '비회원(모바일) 공인인증-mydirect', type: 'cert'},
			goMydirectCardCert: { tranId: 'VD.MPDG0211', desc: '비회원(모바일) 신용카드-mydirect', type: 'cert'},
			goMydirectMobileCert1: { tranId: 'VD.MPDG0182', desc: '휴대폰인증번호 요청-mydirect'},
			goMydirectMobileCert2: { tranId: 'VD.MPDG0212', desc: '휴대폰인증-mydirect', type: 'cert'},

			getTimeLimit: { tranId: 'VD.MPDG0215', desc: '마이다이렉트-현재날짜리턴(납입/취소쪽시간제한체크)'},
			mydirectPrivatePhone1: { tranId: 'VD.MPDG0182', desc: '마이다이렉트-전자서명용 휴대폰 문자 받기' },
			mydirectPrivatePhone2: { tranId: 'VD.MPDG0183', desc: '마이다이렉트-전자서명용 휴대폰 인증', type: 'cert'},
			mydirectPrivateCard: { tranId: 'VD.MMDB0085', desc: '마이다이렉트-전자서명용 신용카드 인증', type: 'cert'},
			mydirectCert: { tranId: 'VD.MMDB0020', desc: '마이다이렉트-결제용 공인인증', type: 'cert'},
			mydirectPrivatePkiRegist: { tranId: 'VD.MPDG0184', desc: '마이다이렉트-전자서명 인가코드 받기' },
			mydirectPrivatePkiCert: { tranId: 'VD.MPDG0185', desc: '마이다이렉트-전자서명 검증' },
			getPaymentInfo: { tranId: 'VD.MADD0570', desc: '결제 저장내역 불러오기'},
			insertOfficialApprovalConfirmLog: { tranId: 'VD.MADD0582', desc: '계피상이 피보험자 동의 프로세스'},
			setCarRenewalEvent: { tranId: 'VD.EVDB0251', desc: '자동차 갱신 이벤트 참여'},

			// 애견보험
			getPremiumInfoDog: { tranId: 'VD.MARN0219', desc: '반려견 보험 보험료 계산'},
			getPremiumInfoCat: { tranId: 'VD.MARN0236', desc: '반려묘 보험 보험료 계산'},
			searchDog: { tranId: 'VD.MARN0218', desc: '애견종류&털색 조회'},
			searchDogInfo: { tranId: 'VD.MARN0216', desc: '애견조회' },
			regDogInfo: { tranId: 'VD.MARN0217', desc: '애견 등록 변경' },

			// 연계판매 
			prcForKidiAgree: { tranId: 'VD.MARN0221', desc: '연계고객정보 제공' },	// 연계상품시 개발원조회 할때 이전 상품에서 고객정보를 가져오겠다고 서버에 호출

			// 배서
			endoNameCheck: { tranId: 'VD.ESDL0117', desc: '배서 실명체크' },
			endoPkiCert: { tranId: 'VD.ESDL0118', desc: '배서 공인인증', type: 'cert'},
			endoCardCert: { tranId: 'VD.ESDL0119', desc: '배서 신용카드 인증', type: 'cert'},
			endoKidiAgreeInfo: { tranId: 'VD.ESDL0121', desc: '배서 개발원 동의 이력 조회'},
			endoList: { tranId: 'VD.ESDL0120', desc: '배서 계약 목록 조회' },
			endoPolicy: { tranId: 'VD.ESDL0124', desc: '계약 상세 조회' },
			endoProductInfo: { tranId: 'VD.ESDL0125', desc: '배서 상품 전문 조회' },
			createEndorsement: { tranId: 'VD.ESDL0122', desc: '배서 설계 생성 조회' },
			checkEcoMileageImage: { tranId: 'VD.ESDL0138', desc: '사진등록 가능여부 조회' },
			effectiveDate: { tranId: 'VD.ESDL0123', desc: '배서 기준일 조회' },
			processEndoByTemp: { tranId: 'VD.ESDL0129', desc: '임특 계산 심사' },
			endoConfirmCarNo: { tranId: 'VD.ESDL0127', desc: '자동차 무번호 확정' },
			endoChangeCarNoInfo: { tranId: 'VD.ESDL0128', desc: '자동차 번호 정정' },
			endoChangeCarNo: { tranId: 'VD.ESDL0140', desc: '자동차번호 정정 계산 & 심사 처리 ' },
			processEndoByCoverage: { tranId: 'VD.ESDL0137', desc: '담보 특약 변경 계산 심사' },
			processEndoByCareer: { tranId: 'VD.ESDL0136', desc: '가입경력인정자 배서 ' },
			processEndoByCar: { tranId: 'VD.ESDL0139', desc: '차량대체 배서 ' },
			processEndoByParts: { tranId: 'VD.ESDL0148', desc: '차량정보변경 배서(옵션변경) ' },
			processEndoListByTemp: { tranId: 'VD.ESDL0142', desc: '임특  해지/취소 가능 목록 조회' },
			processEndoByMileageJoin: { tranId: 'VD.ESDL0141', desc: '마일리지 가입심사' },
			processEndoByCancelTempDrive: { tranId: 'VD.ESDL0143', desc: '임특 취소 심사 요청' },
			expectedRefundMileage: { tranId: 'VD.ESDL0146', desc: '마일리지 예상환금급 조회' },
			processEndoByEndTempDrive: { tranId: 'VD.ESDL0144', desc: '임특 해지 심사 요청' },
			ecoInfoList: { tranId: 'VD.ESDL0147', desc: '마일리지 이력 조회' },
			processEndoByKids: { tranId: 'VD.ESDL0145', desc: '자녀사랑 할인특약 추가 배서' },
			printEndoChangePaper: { tranId: 'VD.ESDL0135', desc: '배서 변경내역서 출력' },
			custContractInfo: { tranId: 'VD.ESDL0113', desc: '전사고객정보 조회' },
			updateCustContractInfo: { tranId: 'VD.ESDL0114', desc: '전사고객정보 수정' },
			endoBefCarno: { tranId: 'VD.ESDL0154', desc: '전차량정보 조회' },
			printEndoFinishCertificate: { tranId: 'VD.ESDL0130', desc: '가입증명서 출력(배서)' },


			// 배서 결제 
			endoProcessCardApproval: { tranId: 'VD.ESDL0132', desc: '배서 신용카드 결제' },
			endoProcessBankApproval1: { tranId: 'VD.ESDL0131', desc: '배서 실시간계좌이체 결제1' },
			endoProcessBankApproval2: { tranId: 'VD.ESDL0133', desc: '배서 실시간계좌이체 결제2' },
			endoProcessRefundApproval: { tranId: 'VD.ESDL0134', desc: '배서 환급' },
			accountCheckEndo: { tranId: 'VD.ESDL0112', desc: '마일리지 계좌번호 체크' },
			processEndoByTempCorp: { tranId: 'VD.ESDL0149', desc: '배서법인 임시운전자 특약 배서' },
			processEndoByCancelTempDriveCorp: { tranId: 'VD.ESDL0150', desc: '배서법인 임시운전자 특약취소' },
			processEndoByEndTempDriveCorp: { tranId: 'VD.ESDL0151', desc: '배서법인 임시운전자 특약해지' },
			readMemberCorp: { tranId: 'VD.ESDL0153', desc: '배서법인 고객 정보 조회' },
			isCancelEndoCard: { tranId: 'VD.ESDL0155', desc: '배서신용카드 취소 가능여부' },

			// 할까말까
			getClaimAccidentHistory: {tranId: 'VD.ESDL0116', desc: '할까말까 과거 3년간 사고이력 조회'},
			getClaimAccidentCompare: {tranId: 'VD.ESDL0115', desc: '할까말까 자동차사고보상처리비교'},
			
			// 원데이 이벤트
			getOneDayEventCheck: { tranId: 'VD.EVDB0252', desc: '원데이이벤트 대상자 체크' },
			setTargetEventNew: { tranId: 'VD.EVDB0238', desc: '원데이 이벤트 등록' },

			getCarRenewListForEtc: { tranId: 'VD.MARN0233', desc: '개발원,당사일괄조회(일반장기용)' },

			getTravelRequestBelongings: { tranId: 'VD.MARN0191', desc: '해외여행 사고다발자 조회 트랜' },
			getFrequentAccidents: { tranId: 'VD.MADD0607', desc: '원데이 사고다발 여부 조회' },
			getContractMaintenance: { tranId: 'VD.MADD0606', desc: '원데이 유지계약정보 리스트 ' },


			// 심사 서류 등록 계약상세 조회
			getImageQuotation: { tranId: 'VD.MADD0603', desc: '심사서류등록전설계상세조회' },
			uploadImage: { tranId: 'VD.MADD0604', desc: '심사서류등록 일반/장기 사진등록' },
			uploadImageForCar: { tranId: 'VD.MADD0605', desc: '심사서류등록 자동차 사진등록' },

			// 카카오페이 
			kakaoRequestUrl: { tranId: 'VD.MADD0608', desc: '카카오간편결제요청(url받기)' },

			// 테스트용 트랜
			testUploadImage01: { tranId: 'VD.TEST0001', desc: '테스트 - 이미지 업로드관련' }, 
			endVal: {}
		},

		/**
		 * 서버에서 암호화 안되서 Data가 넘어오는 인터페이스들
		 * @category 서버 인터페이스
		 * @type {Array}
		 */
		interfacesSkipDecryption: [
			'frmXmlListNoEnc',
			'frmCalcTemplate'
		],
		/**
		 * JSON 파싱 안하는 인터페이스 정의
		 * @category 서버 인터페이스
		 * @property interfacesSkipParseJSON
		 * @type {Array}
		 */
		interfacesSkipParseJSON: [
			'frmXmlListNoEnc',
			'frmCalcTemplate'
		],
		
		/**
		 * 설계자의 기본정보를 피보자 또는 계약자에 복사
		 * @category 데이터
		 * @method copyDesignInfo
		 * @param  {Array} dest ['piboja', 'contractor'] 일반적인 경우는 둘 다 복사 미성년자는 피보자만 복사 그 밖에는 알아서
		 */
		copyDesignInfo: function(dest, option) {
			var unitData = (option && option.unitData) ? option.unitData : sfd.data;
			var copyToPiboja = (dest.indexOf('piboja') >= 0);
			var copyToContractor = (dest.indexOf('contractor') >= 0);
			var key, value;
			var keys = ['Name', 'SSN', 'ID', 'Manage', 'Insuage', 'Sex', 'Gender'];

			for (var i = 0; i < keys.length; i++) {
				key = keys[i];
				value = unitData.getValue('design' + key);

				if (copyToPiboja) { // 설계자 정보 -> 피보험자 복사
					unitData.setValue('piboja' + key, value);
				}
				if (copyToContractor) { // 설계자 정보 -> 계약자 복사
					unitData.setValue('contractor' + key, value);
				}
			}
		},

		/**
		 * data의 getValue 전 공통으로 확인
		 * @category 데이터
		 * @method getCheckValue
		 * @param  {String}      inKey 확인할 data key
		 * @return {*}           검색 값 리턴
		 */
		getCheckValue: function(inKey) {
			var data = sfd.data.dataObject;

			if (inKey == 'serverGubun' || inKey == 'host') {
				return sfd.env.server;
			} else if (inKey == 'designSSN1' && data.designSSN) {
				return data.designSSN.substr(0, 6);
			} else if (inKey == 'designSSN2' && data.designSSN) {
				return data.designSSN.substr(6, 7);
			} else if (inKey == 'pibojaSSN1' && data.pibojaSSN) {
				return data.pibojaSSN.substr(0, 6);
			} else if (inKey == 'pibojaSSN2' && data.pibojaSSN) {
				return data.pibojaSSN.substr(6, 7);
			} else if (inKey == 'contractorSSN1' && data.contractorSSN) {
				return data.contractorSSN.substr(0, 6);
			} else if (inKey == 'contractorSSN2' && data.contractorSSN) {
				return data.contractorSSN.substr(6, 7);
			} else if (inKey == 'designJuminNo' ) {
				return data.designSSN;
			} else if (inKey == 'pibojaJuminNo' ) {
				return data.pibojaSSN;
			} else if (inKey == 'contractorJuminNo' ) {
				return data.contractorSSN;
			} else if (inKey == 'currPage') {
				return sfd.view.getPage();
			} else if (inKey == 'prevPageName') {
				return sfd.view.prevPageName;
			} else if (inKey == 'prevPageKoName') {
				if (sfd.view.prevPageName) {
					var prevPageMetadata = sfd.view.getPageMetadata(sfd.view.prevPageName);
					return (prevPageMetadata && prevPageMetadata.title) || '';
				} else {
					return '';
				}
			} else if (inKey == 'currPageName') {
				return sfd.view.getPageName();
			} else if (inKey == 'currPageKoName') {
				var currPageMetadata = sfd.view.getPageMetadata();
				return (currPageMetadata && currPageMetadata.title) || '';
			} else if (inKey == 'currPageObj') {
				return sfd.view.getPageMetadata();
			} else if (inKey == 'isDebug') {
				return sfd.env.isDebug;
			} else if (inKey == 'runInfo') {
				return sfd.server.runInfo;
			} else if (inKey == 'today') {
				return (sfd.data.dataObject.sysdate) ? sfd.utils.stringToDate(sfd.data.dataObject.sysdate) : new Date();
			}
			return 'delegation';
		},
		/**
		 * data의 setValue 전 공통으로 확인
		 * @category 데이터
		 * @method setCheckValue
		 * @param  {String}      inKey   저장할 Key
		 * @param  {*}           inValue 저장할 Object
		 */
		setCheckValue: function(inKey, inValue, arg) {

			// <STRIP_WHEN_RELEASE

			if (sfd.page.Kbdr) {
				sfd.page.Kbdr.refreshData();
			}

			if (sfd.env.isDebug) {
				if ( arg && arg.length < 2 ) {
					alert('debugMessage190328320: 혹시 getValue("' + inKey + '")인데 setValue("' + inKey + '")로 잘못 쓴건 아닌지?');
				}
			}

			if (sfd.env.server == 'local') {
				if (inKey == 'designSSN1' ||
					inKey == 'designSSN2' ||
					inKey == 'pibojaSSN1' ||
					inKey == 'pibojaSSN2' ||
					inKey == 'contractorSSN1' ||
					inKey == 'contractorSSN2') {
					sfd.core.alert('sfd.data.setValue : 주민번호는 꼭 13자리로 저장 해주세요(김재성에게문의)')
				} else if (inKey == 'designJuminNo' ||
					inKey == 'pibojaJuminNo' ||
					inKey == 'contractorJuminNo' ||
					inKey == 'designJuminNo1' ||
					inKey == 'designJuminNo2' ||
					inKey == 'pibojaJuminNo1' ||
					inKey == 'pibojaJuminNo2' ||
					inKey == 'contractorJuminNo1' ||
					inKey == 'contractorJuminNo2') {
					if (!(sfd.data.getValue('lobCd') == 'MV' && sfd.data.getValue('currPageName') == 'ContractorInfo')) {
						sfd.core.alert('sfd.data.setValue : (' + inKey + ') ~jumin 은(는) ~SSN(으)로 통일해 주세요')
					} 
				} else if (inKey == 'makeCompany' ) {
					sfd.core.alert('sfd.data.setValue : makeCompany 은(는) makeCompanyCode (으)로 통일해 주세요')
				}
			}
			// STRIP_WHEN_RELEASE>

			if (inKey == 'designSSN') {
				if ( !sfd.utils.isEmpty(inValue) && inValue.length == 13) {
					sfd.data.dataObject.designManage = sfd.utils.manAge(inValue, sfd.data.dataObject.sysdate);
					sfd.data.dataObject.designInsuage = sfd.utils.insuredAge(inValue, sfd.data.dataObject.sysdate);
					sfd.data.dataObject.designSex = sfd.utils.genderCode(inValue);
				}
			} else if (inKey == 'designJuminNo') {
				sfd.data.dataObject.designSSN = inValue;
			} else if (inKey == 'pibojaJuminNo') {
				sfd.data.dataObject.pibojaSSN = inValue;
			} else if (inKey == 'contractorJuminNo') {
				sfd.data.dataObject.contractorSSN = inValue;
			} else if (inKey == 'systime') {
				sfd.data.dataObject.systime = inValue;
				setSystime();
			}

			// wrapper의 data에 저장할 값 
			if (['sysdate', 'systime'].includes(inKey)) {
				$wrapper.data(inKey, inValue);
			}
			setTimeout(function() {
				sfd.view.binding.match();
			}, 100)
			
			
			
		},

		/**
		 * 완전판매 모니터링 조회
		 * @category 완전판매 모니터링
		 * @param {Object} callback 콜백
		 * @see
		 * sfd.module.callCompleteSale();
		 * 가입한 담보의 코드를 반환하는 sfd.data.damboData.getJoinList(); 필요
		 * 결과 리스트는 sfd.data.getValue('completeSaleList') 에서 호출
		 */
		callCompleteSale: function(callback) {

			// 담보 한줄 만들기
			var damboCodeList = sfd.module.getJoinList();
			var damboCodeArr = [];
			var damboCodeStr = '';

			// 실손 묶음 계산이면
			if (sfd.data.getValue('divisionName') == 'realLoss' && sfd.core.module.isBundle()) {
				damboCodeStr = fullDamboCodeFunc(damboCodeList, 'realLoss');

				// 완전판매 조회 (실손)
				sfd.module.getCompleteSaleQuestionnaires({
					prodCd:	sfd.data.getValue('productCode'),
					damboList: damboCodeStr,
					callback: function (res) {
						// 조회 스크립트 합치기
						mergeScript(res, 'L');

						damboCodeStr = fullDamboCodeFunc(damboCodeList, 'health');

						// 완전판매 조회 (건강)
						sfd.module.getCompleteSaleQuestionnaires({
							prodCd:	sfd.data.getValue('productCodeH'),
							damboList:	damboCodeStr,
							callback:	function (res) {
								// 조회 스크립트 합치기
								mergeScript(res, 'W');
								nextProcess(res);
							}
						});
					}
				});

			} else {
				if (damboCodeList[0] && damboCodeList[0].hasOwnProperty('realCode')) {
					$.each(damboCodeList, function(i, item) {
						damboCodeArr.push(item.realCode);
					});

				// smartM
				} else {
					$.each(damboCodeList, function(m, categoryItem) {
						$.each(categoryItem.damboList, function(n, item) {
							damboCodeArr.push(item.realCode);
						});
					});
				}
				damboCodeStr = damboCodeArr.join('^');

				sfd.module.getCompleteSaleQuestionnaires({
					damboList:	damboCodeStr,
					callback:	function (res) {
						// 조회 스크립트 합치기
						mergeScript(res);
						nextProcess(res);
					}
				});
			}



			var seq = ''
			var seqTitle = '';
			var resultList = [];

			function mergeScript(data, headStr) {
				// seq 구분 문자
				headStr = headStr || '';

				var list = data.questionnairesList;

				if (!list) {
					if (callback) {
						callback(); 
					}
				}

				if (sfd.data.getValue('divisionName') == 'realLoss' && sfd.core.module.isBundle()) {
					var _divisionTitle = '';
					switch (headStr) {
						case 'L':	// 실손
							_divisionTitle = '실손의료비 상품 안내';
							break;
						
						case 'W':	// 건강
							_divisionTitle = '건강보험 상품 안내';
							break;
					}

					resultList.push({
						title: _divisionTitle
					});
				}

				$.each(list, function(i, item) {
					var questContent = data.questionnairesList[i].questContent;
					var content = questContent.content;

					var start = content.indexOf('[');
					var end = content.indexOf(']', start + 1);

					var bluetext = content.substr(start + 1, end - 1);
					var divtext = content.substr(content.indexOf('▶') + 1);

					//서버 전송 하기 위한 값 셋팅

					seq += '^' + headStr + questContent.seq;
					seqTitle +=  '^' + bluetext;

					var _title = '';
					var _scriptArr = [];
					
					if (divtext.indexOf('▶') == -1) {
						_title = bluetext;
						_scriptArr.push(divtext);
					} else {
						_title = bluetext;

						var arrtext = divtext.split('▶');
						for (var j = 0; j < arrtext.length; j++) {
							_scriptArr.push(arrtext[j]);
						}
					}

					if (sfd.data.getValue('divisionName') == 'realLoss' && sfd.core.module.isBundle()) {
						if (i == 0 && bluetext == '실손의료비 상품 안내') {
							resultList.splice(0, 1);
						} else if (i == 0 && bluetext == '건강보험 상품 안내') {
							resultList.splice(0, 1);
						}	
					}

					resultList.push({
						title: _title,
						scriptList: _scriptArr
					});
				})
			}
				
			function nextProcess(data) {
				// 실손, 어린이이고, 태아가입형인 경우
				if (['realLoss', 'child'].indexOf(sfd.data.getValue('divisionName')) > -1 && sfd.data.getValue('targetCls') == '8') {
					var _title = '태아 가입 안내';
					var _scriptArr = [
						'태아 가입 시에는 출생 후 피보험자 변경 통지를 해야 합니다. (다이렉트 고객센터 1577-3339)',
						'쌍둥이 출생의 경우에는 계약자가 지정한 한 명의 자녀를 피보험자로 합니다.',
						'출생한 태아의 성별에 따라 보험료의 변경 및 정산이 발생할 수 있습니다.'
					];

					resultList.push({
						title: _title,
						scriptList: _scriptArr
					});
				}
				// 기타 안내
				if (data.questionnairesList) {
					var _title = '기타 안내';
					var _scriptArr = [
						'보험증권을 받은 날로부터 15일 이내(단, 청약을 한 날부터 30일 한도)에 청약을 철회할 수 있습니다. 단, 진단계약 또는 전문보험계약자(보험모집자, 보험회사 직원 등)가 체결한 계약은 철회할 수 없습니다.',
						'직업, 오토바이 운전, 영업용 차량 운전, 주소 및 연락처 등의 변경이 있는 경우, 지체 없이 회사에 알려주셔야 합니다. (다이렉트 고객센터 1577-3339)',
						'이 보험의 상품 내용과 보상하지 않는 손해 등의 자세한 사항은 보험약관을 따릅니다.'
					];
					if (['annuity', 'annuityFD'].indexOf(sfd.data.getValue('divisionName')) > -1) {
						// 연금저축 (유/무) 문구 상이 2019-04-25 
						_scriptArr = [
							'보험증권을 받은 날로부터 15일 이내(단, 청약을 한 날부터 30일 한도)에 청약을 철회할 수 있습니다. 단, 진단계약 또는 전문보험계약자(보험모집자, 보험회사 직원 등)가 체결한 계약은 철회할 수 없습니다.',
							'이 보험의 상품 내용과 보상하지 않는 손해 등의 자세한 사항은 보험약관을 따릅니다.'
						];
					}
					resultList.push({
						title: _title,
						scriptList: _scriptArr
					});
				};

				if (seq > 0) {
					seq = seq.substring(1);
				}

				sfd.data.setValue('questionnaireSeq', seq);
				sfd.data.setValue('questionnaireTitle', seqTitle);
				sfd.data.setValue('completeSaleList', resultList);
				// 콜백이 있으면 콜백
				if (callback) {
					callback(); 
				}
			}

			function fullDamboCodeFunc(damboCodeListArr, divisionStr) {
				var result = [];
				var damboCodeListArr = [];

				for (var i = 0; i < damboCodeListArr.length; i++) {
					if (damboCodeListArr[i].title == divisionStr) {
						damboCodeListArr = damboCodeListArr[i].damboList;
						break;
					}
				}

				$.each(damboCodeListArr, function(i, item) {
					result.push(item.realCode);
				});

				return result.join('^');
			}
		},

		/**
		 * 완전판매 모니터링 저장
		 * @category 완전판매 모니터링
		 * @param {Object} options  콜백
		 * @see
		 * sfd.module.callInsertCompleteSaleQuestionnairesResult();
		 */
		callInsertCompleteSaleQuestionnairesResult: function(callback) {

			var contractNo = sfd.data.getValue('contractNo');	// 설계번호
			var plcyNo = '';
			var params = {
				'plcyNo':	plcyNo ? plcyNo : contractNo,				// 증권번호(설계번호) - 증권번호가 없을경우 설계번호를 셋팅
				'contractNo':	contractNo,									// '설계번호',
				'custId':	sfd.data.getValue('pibojaID'),				// '고객id',
				'prodCd':	sfd.data.getValue('productCode'),			// '상품코드',
				'returnQuestionnaireSeq':	sfd.data.getValue('questionnaireSeq'),		// '질문순번',
				'returnQuestionnaireTitle':	sfd.data.getValue('questionnaireTitle'),	// '질문타이틀',
				'gubun': '',											// 뭐지?
				'certGubun':	''											// 뭐지?
			};

			sfd.core.simpleRun('insertCompleteSaleQuestionnairesResult', params,
				// 콜백
				function(req) {
					sfd.warnLog('callInsertCompleteSaleQuestionnairesResult', req);
					// 콜백이 있으면 콜백
					if (callback) {
						callback(); 
					}
				},
				// 에러
				function(req) {
					sfd.warnLog('callInsertCompleteSaleQuestionnairesResult', req);
					// 콜백이 있으면 콜백
					if (callback) {
						callback();
					}
				}
			);
		},


		/**
		 * 완전판매 모니터링 조회
		 * @category 완전판매 모니터링
		 * @param {Object} options  콜백
		 * @see
		 * sfd.module.getCompleteSaleQuestionnaires();
		 * 이름변경 가능성 있음
		 */
		getCompleteSaleQuestionnaires: function(options) {

			var option = $.extend({
				prodCd: sfd.data.getValue('productCode'),
				damboList: '',
				callback: null
			}, options);

			var params = {
				prodCd:	option.prodCd,
				damboList:	option.damboList
			};

			sfd.core.run('getCompleteSaleQuestionnaires', params, option.callback);
		},

		/**
		 * 각 보험 가입 담보 리스트
		 * @category 일반/장기
		 * @see
		 * sfd.module.getJoinList();
		 */
		getJoinList: function(inUnitData, divisionNameStr) {
			var list = [];
			var inUnitData = inUnitData || sfd.data;
			if (!divisionNameStr) {
				divisionNameStr = inUnitData.getValue('divisionName'); 
			}

			if (['travel', 'travelDomestic'].includes(divisionNameStr)) {
				try {
					var premium;
					var coverageList = sfd.core.module.saleQ.getCoverageList();
					var planCode = sfd.core.module.saleQ.getPlanCode();

					for (var i = 0 ; i < coverageList.length ; i ++) {
						var o = coverageList[i];
						var coverageAmountLabel = sfd.core.module.saleQ.getCoverageInfoLabel(o.uniqCode, planCode);
						premium = sfd.core.module.saleQ.getPlanCoveragePremium(planCode, o.uniqCode);
						if (premium < 0) {
							coverageAmountLabel = '미가입';
						}
						if (coverageAmountLabel != null) {
							list.push({
								label: o.displayLabel,
								amountText: coverageAmountLabel,
								realCode: o.uniqCode
							});
						}
					}
				} catch (e) {
					sfd.warnLog('getJoinList', e);
				}
			// } else if (['driver', 'health', 'annuity', 'annuityFD', 'savings', 'home', 'cancer', 'child', 'golf', 'oneday'].includes(divisionNameStr)) {
			} else if (['driver', 'health', 'savings', 'home', 'cancer', 'child', 'golf', 'oneday'].includes(divisionNameStr)) {
				var calcData = inUnitData.getValue('calcData');
				if (!calcData || !calcData[0]) {
					return list;
				}
				var damboList = calcData[0].coverage;
				// 리스트만큼 반복
				$.each(damboList, function(i, item) {
					// 운영하지 않는 담보면
					if (item.set == '-') {
						return true;
					}
					// 있으면 표시값 푸쉬
					var dp = {
						label: item.label,
						amountText: item.amountText,
						realCode: item.realCode
					};
					list.push(dp);
				});
			} else if (['pet'].includes(divisionNameStr)) {
				var calcData = inUnitData.getValue('damboData');

				if (!calcData || !calcData[0]) {
					return list;
				}
				
				// 리스트만큼 반복
				$.each(calcData, function(i, item) {
					if (item.amountName == '-') {
						return true;
					}

					// 반려묘 입원통원비는 화면상에는 통합 시킴
					if (item.code == 'E1435B000') {
						return true;
					}

					// 있으면 표시값 푸쉬
					var dp = {
						label: item.damboName,
						amountText: item.amountName,
						realCode: item.code
					};
					
					list.push(dp);
				});				
				
			} else if (['dental'].includes(divisionNameStr)) {
				var calcData = inUnitData.getValue('calcData');
				if (!calcData || !calcData[0]) {
					return list;
				}
				var damboList = calcData[0].coverage;
				// 리스트만큼 반복
				$.each(damboList, function(i, item) {
					// 운영하지 않는 담보면
					if (item.set == '-') {
						return true;
					}

					if (item.group) {
						//그룹함수는 금액이 뭉개져 들어온다. 
						if (Number(item.amount) > 0) {
							var myAmount = Number(item.amountGauge[item.amountGauge.length - 1]);
							item.amountText = sfd.core.module.transAmountText(myAmount * 10000, item.unit);
						}
					}

					// 있으면 표시값 푸쉬
					var dp = {
						label: item.label,
						amountText: item.amountText,
						realCode: item.realCode
					};
					list.push(dp);
				});
			} else if (['smartM'].includes(divisionNameStr)) { 
				var calcData = inUnitData.getValue('calcData');
				if (!calcData || !calcData[0]) {
					return list;
				}

				$.each(calcData, function(i, item) {
					var damboGroup = {
						title: item.title,
						damboList: []
					};

					$.each(calcData[i].coverage, function(j, item) {
						var dpDambo = {
							label: item.label,
							amountText: item.amountText,
							realCode: item.realCode
						};

						damboGroup.damboList.push(dpDambo);
					});
				
					list.push(damboGroup);
				}); 
			} else if (['realLoss'].includes(divisionNameStr)) {
				var calcData = inUnitData.getValue('calcData');

				if (!calcData || !calcData[0]) {
					return list;
				}
				var damboGroup = {
					title: 'realLoss',
					damboList: [],
					contractNo: sfd.data.getValue('contractNo')
				};

				var damboList = calcData[0].coverage;

				// 리스트만큼 반복
				$.each(damboList, function(i, item) {
					if (item.set == '-') {
						return true;
					}
					// 엄마 담보는 화면구성에서 제외
					if (item.type == 'M') {
						return true;
					}
					// 있으면 표시값 푸쉬
					var dp = {
						label: item.label,
						amountText: item.amountText,
						realCode: item.realCode
					};

					damboGroup.damboList.push(dp);
				});

				list.push(damboGroup);
				
				if (!calcData || !calcData[1]) {	
					return list;
				}
				var damboGroup = {
					title: 'health',
					damboList: [],
					contractNo: sfd.data.getValue('contractNoH')
				};

				var hDamboList = calcData[1].coverage;

				$.each(hDamboList, function(j, hItem) {
					if (hItem.set == '-') {
						return true;
					}
					var hDp = {
						label: hItem.label,
						amountText: hItem.amountText,
						realCode: hItem.realCode
					};

					damboGroup.damboList.push(hDp);
				});

				list.push(damboGroup);
			}
			return list;
		},

		/**
		 * sfd.utils.formatAddress() 사용하세요. (deprecated)
		 * @category Formatting
		 */
		addressInfoDisplay: function(inUnitData, inCode) {
			var inUnitData = inUnitData || sfd.data;
			var result = sfd.utils.formatAddress(inUnitData.dataObject, { keyPrefix: 'contractor', isOldAddress: inCode == '1' });
			if (!result) {
				result = '-';
			}
			return result;
		},
		/**
		 * sfd.utils.formatEmail() 사용하세요. (deprecated)
		 * @category Formatting
		 */
		emailInfoDisplay: function(email0, email1) {
			return sfd.utils.formatEmail(email0, email1);
		},
		/**
		 * sfd.utils.formatPhoneNumber() 사용하세요. (deprecated)
		 * @category Formatting
		 */
		phoneNumberInfoDisplay: function(tel0, tel1, tel2) {
			return sfd.utils.formatPhoneNumber(tel0, tel1, tel2);
		},

		/**
		 * 화면표시용 납부방법
		 * @category Formatting
		 * @method getMethodOfPaymentName
		 * @param {String} inCode
		 * @return {String} 변환된 문자열.
		 */
		getMethodOfPaymentName: function(inCode) {
			var _str;
			switch (inCode) {
				case 0 :
					_str = '신용카드(앱/체크카드)';
					break;

				case 1 :
					_str = '간편결제(Pay서비스)';
					break;

				case 2 :
					_str = '실시간 계좌이체';
					break;

				case 3 :
					_str = '무통장입금';
					break;
			}

			return _str;
		},
		/**
		 * 화면표시용 증권번호(완료패널에서 공통으로 사용)
		 * @category Formatting
		 * @method getDisplayPolicyNo
		 * @param {String} inCode
		 * @return {String} 변환된 문자열.
		 */
		getDisplayPolicyNo: function(inCode) {
			var _str;
			if (inCode) {
				if (inCode.substr(0, 3) == '000') {
					_str = inCode.substr(3);
				}
			}

			return _str;
		},

		/**
		 * 상담신청 가능한 날짜인지 확인
		 * @category 공통
		 * @param {Date|String} [date] 확인할 날짜. 지정 안하면 sysdate 사용됨.
		 * @param {String} [time] 확인할 시간. 지정 안하면 systime 사용됨.
		 * @return {Object} 상담 가능여부 및 안내 메시지(필요한 경우)
		 * Key | Type | 설명
		 * ---|---|---
		 * isAvailable | Boolean | 상담 가능한 날짜인 경우 true, 아닌 경우 false
		 * message | String | 안내 메시지. 없는 경우 null.
		 */
		checkDateForCounsel: function(date, time) {
			date = date || sfd.data.getValue('sysdate');
			time = time || sfd.data.getValue('systime');
			if (typeof date != 'string') {
				date = sfd.utils.dateToString(date);
			}

			var result = {
				isAvailable: true,
				message: null
			};
			var businessEndHourNum = 170000; // 상담종료 시간: 오후 5시 

			var isBusinessHour = function(date) {
				// 오늘이 아니면 true, 오늘이면 17시 이전인 경우 true
				return date != sfd.data.getValue('sysdate') || parseInt(sfd.data.getValue('systime'), 10) < businessEndHourNum;
			};

			var getCounselMessage = function(date) {
				var dateNum = parseInt(date, 10);
		
				return sfd.listValue.holidaysCounselRequest.find(function(item) {
					var beginDateNum = parseInt(item.period.split('-')[0], 0);
					var endDateNum = parseInt(item.period.split('-')[1], 0);

					return beginDateNum <= dateNum && dateNum <= endDateNum;
				});
			};

			if (sfd.utils.isHoliday(date) || sfd.utils.isWeekend(date)) {
				result.message = 'E0089'; // 주말, 공휴일
				result.isAvailable = false;
			} else if (isBusinessHour(date) == false) {
				result.message = 'E0090'; // 업무시간 아님
				result.isAvailable = false;
			} else {
				// 기타 지정된 상담업무 관련 안내 정보가 있는지 확인
				var counselMessage = getCounselMessage(date);
				if (counselMessage) {
					result.message = counselMessage.message;
					result.isAvailable = counselMessage.selectable;
				}
			}
			return result;
		},

		/**
		 * 상당신청 가능한 가장 빠른 날짜 얻기
		 * @category 공통
		 * @param {Date|String} [date] 기준 날짜. 지정 안하면 sysdate 사용됨.
		 * @return {Date} date 날짜 기준으로 가장 빠른 상담신청 가능일
		 */
		getFirstAvailableCounselDate: function(date) {
			var result = null;
			date = date || sfd.data.getValue('sysdate');
			if (typeof date == 'string') {
				date = sfd.utils.stringToDate(date);
			}
	
			do {
				var counsel = sfd.module.checkDateForCounsel(date);
				if (counsel.isAvailable) {
					result = date;
				}
				date = sfd.utils.dateAfterDays(date, 1); // 다음 날짜 확인
			} while (result == null);
	
			return result;
		},

		/**
		 * 삼성화재 포인트 사용여부
		 * @category 결제
		 */
		checkUseFirePoint: function() {
			var result = false;
			var pointServiceable = false;	// 삼성화재 포인트 사용 대상아님
			var divisionName = sfd.data.getValue('divisionName');
			var subDivisionName = sfd.data.getValue('subDivisionName');

			var clearingData = sfd.data.getValue('clearingData');

			switch (divisionName) {
				case 'travel':
					if (subDivisionName == 'indi') {	// 개인형
						pointServiceable = true;
					} 
					break;

				case 'driver':
				case 'cancer':
				case 'child':
				case 'dental':
				case 'health':
				case 'home':
				case 'smartM':
				case 'travelDomestic':
					pointServiceable = true;
					break;
			}

			if (pointServiceable && clearingData && clearingData.pointAmt) {	// 포인트 사용 대상이고 삼성화재 포인트가 있으면
				result = true;
			}

			sfd.log('CheckUseFirePoint result ', result);
			return result;
		},
		/**
		 * 화재 포인트 금액
		 * @category 결제
		 */
		getFirePointAmt: function() {
			var isUseFirePoint = sfd.module.checkUseFirePoint();	// 포인트 사용하면
			var clearingData = sfd.data.getValue('clearingData');
			var FirePointAmt = 0;

			if (isUseFirePoint) {
				FirePointAmt = clearingData.pointAmt;
			} 

			sfd.log('getFirePointAmt ', FirePointAmt);
			return FirePointAmt;
		},
		/**
		 * 예상만기환급률 표기
		 * @category 장기
		 */
		getRefundRate: function(inData) {
			var result = (parseInt(inData) == 0) ? inData + '%' : inData + '% (공시이율에 따라 변동됨)';

			sfd.log('getRefundRate', result);
			return result;
		},

		/**
		 * 누적 시뮬레이션 계산후 조정된 담보 리스트만 반환
		 * @category 일반/장기
		 * @return {Array} 계산 후 조정된 담보 목록
		 * @see
		 * 자세한 정보는 ModuleLong 에 accumulatedSimulation 참고
		 */
		getAccumSimulation: function() {
			return sfd.core.moduleLong.accumulatedSimulation.getCoverages();
		},

		/**
		 * 누적 시뮬레이션 계산후 조정된 누적금액을 원본 데이터에 반영
		 * @category 일반/장기
		 * @see
		 * data에 accumSimulationData_json 값 업데이트
		 */
		updateAccumSimulationData: function() {
			sfd.core.moduleLong.accumulatedSimulation.update();
		},

		/**
		 * sfd.module.updateAccumSimulationData() 사용하세요. (deprecated)
		 * @category 일반/장기
		 */
		updateAccumDataJson: function() {
			// 기존코드 호환성을 위해 남겨둠
			this.updateAccumSimulationData();
		},

		/**
		 * 요청 사진 등록
		 * @category 공통
		 * @param {Function} callback 완료 콜백
		 */
		reqPhotoUpload: function(callback) {
			var imageData = sfd.data.getValue('disaImageData');
			if (!imageData) {
				return callback();
			}
			var formdata = new FormData();
			$.each( imageData, function(key, item) {
				var i = key.substr(3);
				formdata.append('uploadPicture' + i, sfd.utils.dataURIToBlob(item.imageData), item.fileName );
			});


			formdata.append('contractorID', sfd.data.getValue('contractorID'));
			formdata.append('planNo', sfd.data.getValue('contractNo'));
			formdata.append('mobileYn', (sfd.env.deviceType == 'PC') ? '' : 'Y');
			formdata.append('lobCd', sfd.data.getValue('lobCd'));

			sfd.core.run('getImageUpload', {
				__isMultipartData: true,
				__imageData: formdata
			}, function(res) {
				if (res.receiveResult == 'S') {
					callback();
				} else {
					sfd.core.alert('사진등록 중 오류가 발생했습니다.\n다시 등록해 주세요.')
				}
			})
		},
		/**
		 * 청약내용 상단 기본테이블 (제거예정)
		 * @category 일반/장기
		 */
		makeSubscriptionInfoTable: function(option) {
			var option = $.extend({
				colgroup: ['40', '60'],
				list: [
					{name: '피보험자/계약자', value: '김삼성/이삼성', viewCallback: ''}
				],
				caption: '가입하려는 기본 정보 표. 피보험자/계약자, 상품명, 직업, 운행용도, 납입주기/보험료, 예상만기환급률, 할인 후 보험료, 할인보험료.'
			}, option);

			// 테이블 전체
			var tableStr =
			'<table class="ne-table mgb-l">' +
				'<caption>{{tableCatption}}</caption>' +
				'<colgroup>' +
					'{{tableCol}}' +
				'</colgroup>' +
				'<tbody>' +
					'{{tableBody}}' +
				'</tbody>' +
			'</table>';

			// 테이블 간격
			var tableColStr = '';

			$.each(option.colgroup, function(i, v) {
				tableColStr += '<col style="width:' + v + '%;">';
			});

			var colgroupLength = option.colgroup.length;
			var tdLength = colgroupLength / 2;	// tr 안에 그려야하는 td 갯수
			
			
			// 테이블 내용
			var tableBodyStr = '';
			var drawTDLength = 0;	// 실제그린 TD갯수

			$.each(option.list, function(i, v) {

				// 그리냐?
				if (v.viewCallback) {
					var isView = true;
					$.each(v.viewCallback, function(ii, vv) {
						if (typeof vv == 'function') {
							// false면 끝
							if (!vv()) {
								isView = false;
								return false;
							}
						}
					});
					// false면 끝
					if (!isView) {
						return true;
					}
				}

				var oneLineStr = '';
				// tr열기
				if (((drawTDLength + 1) % tdLength) == tdLength) {
					oneLineStr += '<tr>';
				}
				
				oneLineStr += '<th>{{name}}</th>';
				oneLineStr += '<td>{{value}}</td>';

				// tr닫기
				if (drawTDLength % tdLength == (tdLength - 1)) {
					oneLineStr += '</tr>';
				}

				// 추가적으로 이름에 붙일게있나
				var addName = '';
				// 헬프건이 있으면
				if (v.nameHelp) {
					addName = '<span tabindex="0" class="sfd-icon-help btn-nearing-help02" data-content="{{help}}" role="button" title="{{title}}"/>';
					addName = '<span tabindex="0" class="sfd-icon-help btn-nearing-help02" data-content="{{help}}" role="button" title="{{title}}"/>';
					addName = addName.replace(/{{title}}/g, v.name);
					addName = addName.replace(/{{help}}/g, v.nameHelp);
				}

				oneLineStr = oneLineStr.replace(/{{name}}/g, v.name + addName);
				oneLineStr = oneLineStr.replace(/{{value}}/g, v.value);
				
				tableBodyStr += oneLineStr;

				// 실제 한줄 그린카운터
				drawTDLength ++;
			});

			tableStr = tableStr.replace(/{{tableCatption}}/g, option.caption);
			tableStr = tableStr.replace(/{{tableCol}}/g, tableColStr);
			tableStr = tableStr.replace(/{{tableBody}}/g, tableBodyStr);

			return tableStr;
		},
		/**
		 * 구글 리마케팅 스크립트 추가를 위한 페이지 전환 이벤트 핸들러 등록
		 * @category 외부
		 */
		addRemarketing: function() {

			var pageListLong = [
				{page: 'Front', tag: 'front'},
				{page: 'Front3', tag: 'front'},
				{page: 'Calculation', tag: 'calc'},
				{page: 'ContractorInfo', tag: 'contract'},
				{page: 'ContractorInfo2', tag: 'contract'},
				{page: 'ContractorInfo3', tag: 'contract'},
				{page: 'SubscriptionInfo', tag: 'subscription'},
				{page: 'Payment', tag: 'payment'},
				{page: 'Finish', tag: 'finish'}
			];
							
			// 페이지 전환 이벤트 
			$('#wrapper').on('sf.change-page-complete', function() {
				var currentPageName = sfd.data.getValue('currPageName');			
				// 개발 통테계에서만 되게 처리

				if (sfd.data.getValue('lobCd') != 'MV') {
	
					// 운전자	1	유입	directRemarketingGoogleRia("myDrive", "front")	/template/rmk_mydrive_front.html
					// 2	계산완료	directRemarketingGoogleRia("myDrive", "calc")	/template/rmk_mydrive_calc.html
					// 3	계약자	directRemarketingGoogleRia("myDrive", "contract")	/template/rmk_mydrive_contract.html
					// 4	심사	directRemarketingGoogleRia("myDrive", "subscription")	/template/rmk_mydrive_subscription.html
					// 5	결제	directRemarketingGoogleRia("myDrive", "payment")	/template/rmk_mydrive_payment.html
					// 6	가입완료	directRemarketingGoogleRia("myDrive", "finish")	/template/rmk_mydrive_finish.html

					// 일반/장기 리마케팅 태그 가능 상품일때 각 페이지별 처리
					// if (['savings'].includes(sfd.data.getValue('divisionName'))) {

					// }

					$.each(pageListLong, function(i, v) {
						if (v.page == currentPageName) {
							sfd.log('태그', v);
							sfd.core.directRemarketingGoogleRia(sfd.data.getValue('divisionName'), v.tag);
							return false;
						}
					})
										
				}	
								
				if (['dev', 'test', 'local'].includes(sfd.env.server)) {
				
				}
			});
		},
		endVal: ''
	};

	/**
	 * 외국인 등록조회
	 * @category 일반/장기
	 */
	var saleCustTarget = {
		/**
		 * 주민등록번호로 외국인 여부 체크 
		 * @method isForeignerToSSN
		 * @param  {String}         ssn 13자리 주민등록번호 
		 * @return {Boolean}            결과 
		 */
		isForeignerToSSN: function(ssn) {
			// 13자리가 아니면 return 
			if (ssn.length < 13) {
				return false;
			}
			// 외국인이면 
			var key = parseInt(ssn.slice(6, 7));
			if (key >= 5 && key <= 8) {
				return true;
			}
			return false;
		},
		/**
		 * @param {Object} options 옵션. ssn, nationCd
		 * @return {Boolean} 판매대상고객이면 true, 아니면 false.
		 */
		isTarget: function( options ) {
			var _r = false;
			var _ssn = '';
			var _nationCd = '';
			if ( options.ssn ) {
				_ssn = options.ssn;
			}
			if ( options.nationCd ) {
				_nationCd = options.nationCd;
			}
			var _ssnKey = parseInt(_ssn.slice(6, 7));
			var _saleCustInfo = sfd.data.getValue( 'saleCustInfo' );
			// 주민번호가 외국인, 국가코드가 없으면
			if ( (_ssnKey >= 5 && _ssnKey <= 8) && !_nationCd ) {
				// 해당 고객의 판매고객등록여부 조회값이 없으면
				if ( _saleCustInfo && _saleCustInfo.hasOwnProperty( _ssn ) ) {
					// 판매고객 미등록 상태이면
					_r = self.saleCustTarget.isSaleCust( _saleCustInfo[_ssn] );
				} else {
					_r = true;
				}
			}
			return _r;

		},
		/**
		 * 판매고객등록 대상인지 여부 확인
		 * @param {Object} obj 확인할 Object
		 * @return {Boolean} 대상이면 true, 아니면 false.
		 */
		isSaleCust: function( obj ) {
			var _r = false;
			// 판매고객 등록 상태면
			if (obj.saleCustYn == 'Y') {
				// 20171025 추가 정보가 필요하면 (국가코드 또는 영문명등이 저장되지 않은 상태)
				if (obj.hasOwnProperty('saleCustInfoAddYn') && obj.saleCustInfoAddYn == 'Y') {
					_r = true;
				}

			} else {
				_r = true;
			}
			return _r;
		},
		/**
		 * 판매고객등록 여부 조회(서버통신)
		 * @param {Object} options 옵션. ssn, name, nextFc
		 */
		callFrmExistSalesCust: function( options ) {
			// alert(options.designName);
			sfd.core.run( 'getExistSalesCust', {
				airPortYn: (sfd.data.getValue('divisionName') == 'airport') ? 'Y' : '',
				designJuminNo1: options.ssn.substr(0, 6),
				designJuminNo2: options.ssn.substr(6, 7)
			}, function( json ) {
				var saleCustInfoObj = sfd.data.getValue('saleCustInfo');
				if ( !saleCustInfoObj ) {
					saleCustInfoObj = {};
				}
				saleCustInfoObj[options.ssn] = json;

				// 주민번호 업데이트 후 저장
				sfd.data.setValue('saleCustInfo', saleCustInfoObj );

				if ( self.saleCustTarget.isSaleCust( json ) ) {
					sfd.core.showPopup('CommonForeignerRegistration', {
						name: options.name,
						closeHandler: function(result) {
							if ( result ) {
								if (!result || result == 'sec') {
									return;
								}
								// 값이 둘다 있는 경우
								if ( result.designNationCd && result.designEnglishName ) {
									options.nextFc( result );
								}
							}
						}
					});
				} else {
					options.nextFc( null );
				}
			});
		},
		/**
		 * 외국인 등록대상 체크 및 등록 처리
		 * 원래 callFrmExistSalesCust를 사용하려 했으나 E2E적용과 기타등등의 이유로 추가 beyond 20180817
		 * @param {Object} options 옵션. ssn, name, nextFc, formID(E2E용도)
		 */
		callFrmCheckForeigner: function(options) {
			var nppfsData = sfd.utils.getNppfsFields(options.formID);
			sfd.core.run( 'getExistSalesCust', $.extend({
				airPortYn: (sfd.data.getValue('divisionName') == 'airport') ? 'Y' : '',
				designJuminNo1: options.ssn.substr(0, 6),
				designJuminNo2: options.ssn.substr(6, 7)
			}, nppfsData), function( jsonObj ) {
				var isFrgnOpen = false;
				if (jsonObj.saleCustYn == 'N') {
					isFrgnOpen = true;
				}
				if (jsonObj.saleCustYn == 'Y' && jsonObj.saleCustInfoAddYn && jsonObj.saleCustInfoAddYn == 'Y') {
					isFrgnOpen = true;
				}
				options.name = options.name ? options.name : null;
				if (jsonObj.frgnYn == 'Y' && isFrgnOpen) {
					// 외국인 정보 입력
					sfd.core.showPopup('CommonForeignerRegistration', {
						name: options.name,
						closeHandler: function(result) {
							sfd.log('CommonForeignerRegistration:', result);
							if ( result ) {
								if (!result || result == 'sec') {
									return;
								}
								// 값이 둘다 있는 경우 (pc와 모바일의 result내 변수명이 다름)
								if ((result.designNationCd && result.designEnglishName) || (result.code && result.EngName)) {
									options.nextFc( result );
								}
							} else {
								// 취소상황
								if (options.cancelFc) {
									options.cancelFc();
								}
							}
						}
					});
				} else {
					options.nextFc( null );
				}
			});
		}
	};
	self.saleCustTarget = saleCustTarget;

	/**
	 * 파킹 관리
	 * @category 파킹
	 */
	var parkingManager = {
		/**
		 * 파킹 확인 (현재 사용하는 곳 없음)
		 * @param {Object} [options] 옵션. 현재 사용되고 있지 않음.
		 */
		parkingStart: function(options) {
			// 파킹 체크
			sfd.module.parkingManager.parkingCheck();
		},
		/**
		 * 파킹 확인
		 * @param {Object} options 옵션
		 * Key | Type | 기본값 | 설명
		 * ---|---|---|---
		 * callback | Function | - | 파킹 확인 완료 콜백.
		 */
		parkingCheck: function(options) {
			options = options || {};

			sfd.log('파킹 체크시 divisionName ~~~~~', sfd.data.getValue('divisionName'));
			sfd.log('파킹 체크시 subDivisionName ~~~~~', sfd.data.getValue('subDivisionName'));
			// 상품별 파킹 구분 코드
			var sendGubun_str = sfd.core.getUniqueCode('parking');
			var pageName_str = sfd.view.getPageName();
			sfd.log('파킹 체크시 parkingGubun ~~~~~', sendGubun_str);
			// 파킹 구분 값이 없으면
			if (!sendGubun_str) {
				if (options.callback) {
					options.callback();
				}
				return;
			}

			var send_obj = {
				'emCls': sendGubun_str
			};

			// 파킹체크 트랜 호출
			sfd.core.simpleRun('getEmergencyInfo', send_obj, function(jsonObj) {
				if (jsonObj.result) {
					//   파킹 데이터
					//   		('EM_CLS' 변수 설명)
					//   		'1x' - Front 페이지에서 안내후 종료
					//   		'2x' - Front 페이지에서 안내후 진행
					//   		'3x' - Calculation 페이지에서 안내후 멈춤
					//   		'4x' - Calculation 페이지에서 안내후 진행
					var parking_obj;

					// 호출한 스탭에 해당하는 메시지만 거름
					for (var i = 0; i < jsonObj.result.length; i++) {
						var result_obj = jsonObj.result[i];
						var resultPage_str = result_obj.EM_CLS.substr(0, 1);
						var resultGubun_str = result_obj.EM_CLS.substr(1);

						// 동일상품 응답 값이면
						if (resultGubun_str == sendGubun_str) {
							// 20151002 이벤트 모드 이면서 전화지연 안내 파킹은 제외
							if (sfd.module.eventManager.isEventPossible() &&
								result_obj.GUDN_TYP_CD == '03') {
								continue;
							}

							// 파킹적용 대상 값이면
							if (Number(result_obj.APPL_YN) == 1) {
								// 프론트 페이지면
								if ((pageName_str == '' || ['Front', 'FrontCorp', 'Front3'].includes( pageName_str) ) && (resultPage_str == '1' || resultPage_str == '2')) {
									parking_obj = result_obj;
									break;

								// 보험료계산 페이지면
								} else if (pageName_str == 'Calculation' && (resultPage_str == '3' || resultPage_str == '4')) {
									parking_obj = result_obj;
									break;
								} else if (pageName_str == 'Payment' && (resultPage_str == '5')) {
									parking_obj = result_obj;
									break;
								}
							}
						}
					}

					// 파킹 데이터가 있으면
					if (parking_obj) {
						var parkingPage_str = result_obj.EM_CLS.substr(0, 1);

						// 시스템 구동 단계면, 프론트 페이지면
						if (pageName_str == '' || ['Front', 'FrontCorp', 'Front3'].includes( pageName_str) ) {
							// 안내후 종료
							if (parkingPage_str == '1') {
								sfd.core.showPopup('CommonMessage', {
									titleText: '현재, 시스템 개선을 위한 정비 작업 중에 있습니다.<br/>잠시 후 다시 방문하셔서 이용해 주세요.',
									messageList: [
										'보다 나은 서비스를 위해 시스템 정비 작업을 하고 있습니다.',
										'아래의 시간 이후에 다시 방문하셔서 이용해 주십시오.<br/>이용에 불편을 드려 죄송합니다.',
										'서비스 중단 시간 안내 : ' + parking_obj.DISPLAY
									],
									closeHandler: function() {
										// 시뮬레이터 종료
										sfd.core.gotoHomepage();
									},
									okTitle: '확인'
								});

							// 안내후 진행
							} else if (parkingPage_str == '2') {
								alertFunc(parking_obj.DISPLAY, options);
							}

						// 보험료계산 페이지면
						} else if (pageName_str == 'Calculation') {
							// 안내후 멈춤
							if (parkingPage_str == '3') {
								alertFunc(parking_obj.DISPLAY);
							}
							// 안내후 진행
							if (parkingPage_str == '4') {
								alertFunc(parking_obj.DISPLAY, options); 
							}
						} else if (pageName_str == 'Payment') {

							// 결제패널에 안내 출력 결제패널 뜨면서 호출해야 한다.
							if (parkingPage_str == '5') {
								alertFunc(parking_obj.DISPLAY); 
							}								
						}

					// 파킹 데이터가 없으면
					} else {
						if (options.callback) {
							options.callback(); 
						}
					}
				}
			});

			function alertFunc(messageStr, paramObj) {
				sfd.core.showPopup('CommonMessage', {
					css: {width: '700px'},		// 인사이트로 제어하는 파킹안내 팝업의 폭은 60% 유지 (상무님)
					titleText: '고객님께 안내해 드립니다.',
					messageList: [messageStr],
					noBullet: true,
					closeHandler: function(resultObj) {
						if (paramObj && paramObj.callback) {
							paramObj.callback();
						}
					},
					okTitle: '확인'
				});
			}
		}
	}; // parkingManager
	self.parkingManager = parkingManager;

	/**
	 * 이벤트 관리
	 * @category 이벤트(프로모션)
	 * @see
	 * #### dlpo 이미지 규칙
	 * 종류 | 경로
	 * ---|---
	 * 1번 DLPO |        /ria/dlpo/{divisionName}/{이벤트타입}_main_pc.png
	 * CPA 참여완료 |       /ria/dlpo/{divisionName}/{이벤트타입}_cpa_ok_pc.png
	 * CPA 참여완료배너 |    /ria/dlpo/{divisionName}/{이벤트타입}_cpa_ok2_pc.png
	 * 배너(CPA) |         /ria/dlpo/{divisionName}/{이벤트타입}_bn_cps_pc.png
	 * CPS 참여팝업 | 	     /ria/dlpo/{divisionName}/{이벤트타입}_cps_pc.png
	 * 
	 * #### 관련 트랜
	 * 
	 *  - eventSearch: { tranId: 'VD.EVDB0197', desc: '이벤트 여부 및 진행 중 이벤트 체크' }
	 *  - eventCheck: { tranId: 'VD.EVDB0198', desc: '이벤트 중복 여부체크(10개월중복등)' }
	 *  - eventJoin: { tranId: 'VD.EVDB0200', desc: '이벤트 참여' }
	 */
	var eventManager = {
		/*
		- as-is기준 변경 벨류
			openRiaCode -> eventType
			direct.data.getValue('eventRiaType') -> sfd.data.dataObject.eventState
			direct.data.getValue('eventJoin') -> sfd.data.dataObject.eventUserState
			direct.data.getValue('eventJoinType') -> sfd.data.dataObject.eventCheckJSON.CAR_CNTL_CLS
		*/
		/*sfd.data.dataObject.eventState: null, // null(이벤트조회전) N(이벤트대상아님) Y(이벤트대상)
		sfd.data.dataObject.eventStartJSON: null,
		sfd.data.dataObject.eventSearchJSON: null,
		sfd.data.dataObject.eventCheckJSON: null,
		sfd.data.dataObject.eventJoinJSON: null,*/

		/**
		 * 이벤트 Script 로드 (현재 사용되지 않음)
		 * @param {Function} callback 이벤트 Script 추가 완료 콜백.
		 */
		addEventScript: function(callback) {
			var scriptLoadCnt = 0;
			$.getScript('/CR_MyAnycarWeb/pages/sfmi/ui/direct/event/renewalEventFactory.js', function() {
				getScriptLoaded();
			});
			$.getScript('/CR_MyAnycarWeb/pages/sfmi/ui/direct/event/renewalEventFactoryCP.js', function() {
				getScriptLoaded();
			});

			function getScriptLoaded() {
				scriptLoadCnt++;
				if ( scriptLoadCnt == 2 ) {
					if (callback) {
						callback();
					}
				}
			}
		},
		/**
		 * 이벤트 조회
		 * @see
		 * 이벤트 조회 상태. sfd.data.getValue('eventState') 값
		 * 값 | 설명
		 * ---|---
		 * null | 이벤트 조회 전
		 * "N" | 이벤트 대상 아님
		 * "Y" | 이벤트 대상
		 */
		eventStart: function(eventStartOption) {
			eventStartOption = eventStartOption || {
				mergeData: null,
				callback: null
			}
			/*eventStart({
				mergeData:{

				},
				callback: function(e){

				}
			})*/
			var deviceType = sfd.env.deviceType;
			var divisionName = sfd.data.dataObject.divisionName;
			var subDivisionName = sfd.data.dataObject.subDivisionName;
			var eventProductDivisionName = {
				PC: [ 'car', 'driver', 'travel', 'smartM', 'health', 'cancer', 'dental', 'home', 'child', 'realLoss' ],
				MO: [ 'car', 'driver', 'travel', 'smartM', 'health', 'cancer', 'dental', 'home', 'child', 'realLoss' ]
			}

			self.eventManager.initPanelEvent();
			
			if ( !isEventProduct() ) {
				return;
			}

			// 이벤트 상품 여부
			function isEventProduct() {
				// 강제 이벤트 대상 설정확인 
				/*if ( sfd.env.parameters && 
					 sfd.env.parameters.forceEventTarget && 
					 sfd.env.parameters.forceEventTarget == 'true') {
					return true;
				}*/

				var _r = false;
				_r = eventProductDivisionName[deviceType].indexOf( divisionName ) != -1;
				// 20190812 연계(칙폭) 이벤트 프로세스 추가 (김현빈 주임)
				// if ( subDivisionName == 'tiny' ) {
				// 	_r = false;
				// }
				return _r;
			}

			// 이벤트 정보 초기화
			sfd.data.dataObject.eventState = null;
			sfd.data.dataObject.eventJoinedArr = [];// 참여한 이벤트의 코드를 저장['04', '08']
			sfd.data.dataObject.eventUserState = null;
			sfd.data.dataObject.eventSearchJSON = null;
			sfd.data.dataObject.eventCheckJSON = null;
			sfd.data.dataObject.eventJoinJSON = null;

			// 20190812 연계이벤트 일때는 트랜호출 단계부터 type 값이 필요함 (강성용 과장)
			var _eventSearchParam = $.extend({
				'screenId': self.eventManager.getScreenID(),
				'device': self.eventManager.getDeviceType()
			}, eventStartOption.mergeData);

			var _eventOptions = {
				header: {
					'X-DIRECT-CLIENT-ID': sfd.server.getGUID()
				}
			}

			sfd.core.simpleRun('eventSearch', _eventSearchParam, function(res) {
				if ( res.eventYn == 'Y' && String(res.eventState) == '2'  ) {
					// 이벤트 진행
					/*<script type="text/javascript" src="/CR_MyAnycarWeb/pages/common/commonsfd.js"></script>
					<script type="text/javascript" src="/CR_MyAnycarWeb/pages/sfmi/ui/direct/event/renewalEventFactory.js"></script>
					<script type="text/javascript" src="/CR_MyAnycarWeb/pages/sfmi/ui/direct/event/renewalEventFactoryCP.js"></script>*/
					var scriptLoadCnt = 0;
					// $.getScript('/CR_MyAnycarWeb/pages/common/commonsfd.js', function() {
					// 	getScriptLoaded();
					// });
					$.getScript('/CR_MyAnycarWeb/pages/sfmi/ui/direct/event/renewalEventFactory.js', function() {
						getScriptLoaded();
					});
					$.getScript('/CR_MyAnycarWeb/pages/sfmi/ui/direct/event/renewalEventFactoryCP.js', function() {
						getScriptLoaded();
					});

					sfd.data.dataObject.eventState = 'Y';
					sfd.data.dataObject.eventSearch = res;
					sfd.data.dataObject.eventType = res.eventFactoryInfo.dlpoType;
					function getScriptLoaded() {
						scriptLoadCnt++;
						if ( scriptLoadCnt == 2 ) {
							var runInfo;
							var _riaEvtFactoryParam = {
								TYPE: 'search',
								SCREENID: self.eventManager.getScreenID(),
								DEVICE: self.eventManager.getDeviceType(),
								CALLBACK: function(res) {
									// // 일반장기 경우 이벤트 대상이면 check를 바로 호출
									// // 자동차는 실명인증 후 호출
									// if( sfd.data.dataObject.lobCd != 'MV'){
									// 	sfd.module.eventManager.eventLongCheck();
									// }
									if (arguments.length > 1) {
										res = arguments[3];
									}
									runInfo.responseJSON = res;
									if (sfd.debug.tranLog) {
										sfd.debug.tranLog.update(runInfo);
									}

									// 이벤트 여부 다시체크(강성용과장님)
									// 첫 이벤트 트랜은 세션클리어 오류가 있다고 함  
									if (res.EVENT_STATE == 'Y' && String(res.IS_NEW_EVT) == 'Y') {
										if (res.VALID == 'Y') {
											// 이벤트 기간 
											sfd.data.dataObject.eventState = 'Y';
											sfd.data.dataObject.eventSearch = res;
											sfd.data.dataObject.eventType = res.EVENT_TYPE;

										} else {
											// 이벤트 기간이 아닌 경우 
											sfd.core.alert('E0083');
											sfd.data.dataObject.eventState = 'N';
											sfd.data.dataObject.eventSearch = res;

										}
										
									} else {
										sfd.data.dataObject.eventState = 'N';
										sfd.data.dataObject.eventSearch = res;
									}

									if (eventStartOption.callback) {
										eventStartOption.callback();
									}
								}
							}

							// 20190812 추가정보 merge (연계이벤트용 TYPE 값 머지)
							_riaEvtFactoryParam = $.extend(_riaEvtFactoryParam, eventStartOption.mergeData);

							runInfo = {
								form: 'riaEvtFactory',
								module: {tranId: 'riaEvtFactory'},
								param: _riaEvtFactoryParam,
								simpleRun: false
							}

							sfd.log('EVENT_LOG riaEvtFactory:', _riaEvtFactoryParam, _eventOptions)
							// 세션생성을 위해 다시 js호출
							if (sfd.env.server != 'local') {
								if (sfd.debug.tranLog) {
									sfd.debug.tranLog.add(runInfo);
								}
								riaEvtFactory(_riaEvtFactoryParam, _eventOptions);
							} else {
								// // 일반장기 경우 이벤트 대상이면 check를 바로 호출
								// // 자동차는 실명인증 후 호출
								// if( sfd.data.dataObject.lobCd != 'MV'){
								// 	sfd.module.eventManager.eventLongCheck();
								// }
							}
						}
					}
					showPageEvent();

				} else if ( res.eventYn == 'Y' && String(res.eventState) == '3' ) {
					sfd.core.alert('E0083');
				}
			})
			function showPageEvent() {
				$('#wrapper').on('sf.change-page-complete', function() {
					var _currentPageName = sfd.data.getValue('currPageName');
					var _pageStep = sfd.data.getValue('pageStep');
					var _pageSubStep = sfd.data.getValue('pageSubStep');
					var alwaysEventMode = sfd.module.eventManager.alwaysEventMode();
					if ( _currentPageName == 'Calculation' ) {
						// PC 4번인경우 배너 노출여부
						sfd.module.eventManager.checkEventBanner();
						if ( alwaysEventMode && alwaysEventMode == 'joinBbs' ) {
							if (sfd.data.dataObject.type == 'PC' && 
								sfd.data.getValue('divisionName') != 'smartM' && // 스마트보장 을 제외한 상품 이벤트 발생
								sfd.data.getValue('pageDir') == 'next' // 순진행인 경우만 
							) {  
								sfd.core.showPopup('CommonEventReviewInfo');
							}
						}

					} else if ( ['ContractorInfo', 'ContractorInfo2', 'ContractorInfo3'].includes( _currentPageName ) ) {
						if ( alwaysEventMode && alwaysEventMode == 'joinBbs' ) {
							if (sfd.data.dataObject.type == 'PC' && 
								sfd.data.getValue('divisionName') == 'smartM' && // 스마트보장 만 이벤트 발생
								sfd.data.getValue('pageDir') == 'next' // 순진행인 경우만 
							) {  
								sfd.core.showPopup('CommonEventReviewInfo');
							}
						}

					} else if ( _currentPageName == 'UserInfo' ) {
						if ( alwaysEventMode && alwaysEventMode == 'joinBbs' ) {
							if ( alwaysEventMode == 'joinBbs' ) {
								sfd.core.showPopup('CommonEventReviewInfo');
							}
						}

					} else if ( _currentPageName == 'Finish' ) {
						// 결제 완료인 경우
						// CPS 이벤트 참여 호출

						// 상시이벤트 체크 
						if ( alwaysEventMode && alwaysEventMode == 'joinBbs' ) {
							sfd.core.showPopup('CommonEventReviewJoin');

						} else {
							// 중간에 CPS 아닌것으로 조치
							if (sfd.module.eventManager.isEventPossibleCPS()) {
								sfd.module.eventManager.eventJoinCPS();
							}
						}
					}

				}).on('sf.change-page-start', function() {
					// 이벤트 배너가 있는경우 지우기
					$('.factory.event-banner04').remove();
				});
			}
		},
		/**
		 * 이벤트 대상 고객인지 확인 (goCheck)
		 * @param {Object} option 옵션
		 * Key | Type | 기본값 | 설명
		 * ---|---|---|---
		 * callback | Function | - | 이벤트 확인 완료 콜백.
		 */
		eventCheck: function( option ) {
			// 이벤트 비 대상인 경우
			if ( sfd.data.dataObject.eventState != 'Y' ) {
				if (option && option.callback) {
					option.callback();
				}
				return;
			}

			


			// 이벤트 체크 보내는 값
			var _eventCheckParam = {
				'SCREENID': self.eventManager.getScreenID(),
				'NAME': sfd.data.getValue('designName'),
				'TYPE': 'check',
				'CUSTID': sfd.data.getValue('designID'),
				'PRODCD': sfd.data.getValue('productCode'),
				'DEVICE': self.eventManager.getDeviceType(),
				CALLBACK: eventCheckComplete
			}
			var _eventOptions = {
				header: {
					'X-DIRECT-CLIENT-ID': sfd.server.getGUID()
				}
			}
			var runInfo = {
				form: 'goCheck',
				module: {tranId: 'goCheck'},
				param: _eventCheckParam,
				simpleRun: false
			}
			
			
			sfd.core.showLoading();
			// 참여
			// <STRIP_WHEN_RELEASE
			if (sfd.env.server == 'local') {
				sfd.core.simpleRun('eventCheck', _eventCheckParam, eventCheckComplete)
			} else {
			// STRIP_WHEN_RELEASE>
				if (sfd.debug.tranLog) {
					sfd.debug.tranLog.add(runInfo);
				}
				goCheck(_eventCheckParam, _eventOptions);
			// <STRIP_WHEN_RELEASE
			}
			// STRIP_WHEN_RELEASE>
			// 조회결과 처리
			function eventCheckComplete(res) {
				// as-is에서는 callback의 인자가 3개가 넘어온다
				if (arguments.length > 1) {
					res = arguments[3]; 
				}
				runInfo.responseJSON = res;
				if (sfd.debug.tranLog) {
					sfd.debug.tranLog.update(runInfo);
				}
				sfd.log('EVENT_LOG eventCheckComplete:', res, arguments)
				sfd.core.hideLoading();
				// 사용자 이벤트 참여이력체크
				if (res.EVENT_JOIN) {
					sfd.data.dataObject.eventUserState = res.EVENT_JOIN;
				}
				sfd.data.dataObject.eventCheckJSON = res;

				sfd.log('EVENT_LOG eventCheck:', _eventCheckParam)
				// 미참여(참여가능)이 아닌경우 이벤트 비대상으로 전환
				if (res.EVENT_JOIN == 'N') {
					if ( option && option.callback ) {
						option.callback();
					}// 콜백이 있는 경우만 기본은 async

				} else {
					sfd.data.dataObject.eventState = 'N';
					sfd.core.showPopup('CommonMessage', {
						titleText: '이미 이벤트에 참여하셨습니다<i>!</i>',
						messageList: [
							'고객님께서는 이미 삼성화재 다이렉트 이벤트에 참여하신 이력이 있습니다.',
							'중복으로 참여하실 경우 보험료 계산은 가능하지만 이벤트 경품은 지급되지 않습니다.'
						],
						closeHandler: option.callback,
						okTitle: '확인'
					});
				}

			}
		},
		/**
		 * 이벤트 참여 (goJoin)
		 * @param {Object} option 옵션
		 * Key | Type | 기본값 | 설명
		 * ---|---|---|---
		 * callback | Function | - | 이벤트 확인 완료 콜백.
		 * JOINPHSECD | String | "04" | 
		 * mergeData | Object | - | 이벤트 참여 데이터에 추가할 데이터
		 */
		eventJoin: function( option ) {

			var _JOINPHSECD = option.JOINPHSECD || '04';
			// 이벤트 비 대상인 경우
			if ( sfd.data.dataObject.eventState != 'Y' ) {
				if (option && option.callback) {
					option.callback();
				}
				return;
			}
			var phoneCertedInfo = sfd.data.getCertedInfo( sfd.data.getValue('designID') );//
			var _phoneNo = '';

			if (phoneCertedInfo && phoneCertedInfo.mobile) {
				phoneCertedInfo = phoneCertedInfo.mobile;
				_phoneNo = phoneCertedInfo.mobileNo1 + '' + phoneCertedInfo.mobileNo2 + '' + phoneCertedInfo.mobileNo3;
			}

			// 이벤트 참여 보내는 값
			var _eventJoinParam = {
				'NAME': sfd.data.getValue('designName'),
				'CUSTID': sfd.data.getValue('designID'),
				'CUSTINFO': 'N',
				'PRIZECD': '',
				'PRODCD': sfd.data.getValue('productCode'),
				'TYPE': 'join',
				'JOINPHSECD': _JOINPHSECD,
				'SENDMETHOD': '',
				'SCREENID': self.eventManager.getScreenID(),
				'CERTNO': '',
				'CERTTERM': '',
				'INFO3': sfd.data.getValue('contractNo'),
				// 'DEVICE': '01',
				'DEVICE': self.eventManager.getDeviceType(),
				'CERTKEY': '',
				'INPUT2': _phoneNo,
				'AGREE': '',
				CALLBACK: eventJoinComplete
			}
			var _eventOptions = {
				header: {
					'X-DIRECT-CLIENT-ID': sfd.server.getGUID()
				}
			}

			// 추가정보 merge
			if ( option && option.mergeData ) {
				_eventJoinParam = $.extend(_eventJoinParam, option.mergeData);
			}
			sfd.core.showLoading();
			// 참여
			var runInfo = {
				form: 'goJoin',
				module: {tranId: 'goJoin'},
				param: _eventJoinParam,
				simpleRun: false
			}
			
			sfd.log('EVENT_LOG eventJoin:', _eventJoinParam);
			// <STRIP_WHEN_RELEASE
			if (sfd.env.server == 'local') {
				sfd.core.simpleRun('eventJoin', _eventJoinParam, eventJoinComplete)
			} else {
			// STRIP_WHEN_RELEASE>
				if (sfd.debug.tranLog) {
					sfd.debug.tranLog.add(runInfo);
				}
				goJoin(_eventJoinParam, _eventOptions);
			// <STRIP_WHEN_RELEASE
			}
			// STRIP_WHEN_RELEASE>
			// 참여결과 처리
			function eventJoinComplete(res) {
				
				// as-is에서는 callback의 인자가 3개가 넘어온다
				if (arguments.length > 1) {
					res = arguments[3];
				}

				sfd.module.eventManager.eventJoinCommonComplete( runInfo, _eventJoinParam, res, option );

				

				/*function forceCloseEventPopup(){
					$.each([ 'CommonEventJoin365','CommonEventJoin','CommonEventJoinCPS' ], function(i, item){
						if( $('#'+item).length > 0 ){
							sfd.core.getPopup(item).off();
							sfd.core.getPopup(item).off();
						}
					});
				}*/
			}

		},
		/**
		 * 갱신 이벤트 참여 (goJoin)
		 * @param {Object} option 옵션
		 * Key | Type | 기본값 | 설명
		 * ---|---|---|---
		 * callback | Function | - | 이벤트 확인 완료 콜백.
		 */
		eventJoinRenew: function( option ) {
			sfd.core.showLoading();

			sfd.core.run('setCarRenewalEvent', {
				eventCd: 'e2018223',
				eventPlanNo: sfd.data.getValue('contractNo'),
				eventDevice: (sfd.env.deviceType == 'PC') ? '01' : '02'//디바이스 기기 구분 (01:PC,02:MOBILE)
			}, function(res) {
				if ( res.errCode == 'Y' ) {
					sfd.core.alert('이벤트에 정상적으로 참여되었습니다.');
				} else if ( res.errCode == 'F' || res.errCode == 'N'  ) {
					sfd.core.alert(res.errMsg);
				}
				if ( option.callback ) {
					option.callback();
				}
			}, function(err) {
				errMessage();
				if ( option.callback ) {
					option.callback(); 
				}
			});

			function errMessage(res) {
				sfd.core.showPopup('CommonMessage', {
					titleText: '서비스가 처리되지 않았습니다.<i>!</i>',
					messageList: [
						'다시 한번 진행해 주세요.'
					],
					okTitle: '확인'
				});
			}

		},
		/**
		 * 이벤트 참여 완료 콜백
		 * @param {Object} runInfo 서버 통신 정보
		 * @param {Object} req 요청 정보
		 * @param {Object} res 응답 정보
		 * @param {Object} joinOption 가입 옵션
		 * Key | Type | 기본값 | 설명
		 * ---|---|---|---
		 * callback | Function | - | 이벤트 확인 완료 콜백.
		 */
		eventJoinCommonComplete: function( runInfo, req, res, joinOption ) {
			runInfo.responseJSON = res;

			if (sfd.debug.tranLog) {
				sfd.debug.tranLog.update(runInfo);
			}


			sfd.log('EVENT_LOG eventJoinComplete:', res, arguments)
			sfd.core.hideLoading();

			sfd.tracker.eventLog({
			    logType: 'etcLog',
			    code: 'eventJoinCommonComplete result_' + res.RESULT,
			    description: 'eventJoinCommonComplete'
			});

			// 이벤트 참여 여부에 따라서 (Y:성공, N:중복, F:에러)
			if (res.RESULT == 'Y') {
				// 가입 이벤트 성공 리턴이면
				if (req.hasOwnProperty('JOINPHSECD') &&
					(req.JOINPHSECD == '06' || req.JOINPHSECD == '08')) {
					sfd.core.alert('이벤트에 정상적으로 참여되었습니다.');
				
				} else {
					sfd.core.showPopup('CommonEventSuccess');
				}
				// 이벤트 참여완료 값 저장
				sfd.data.dataObject.eventJoinedArr.push(req.JOINPHSECD);
				if (joinOption && joinOption.callback) {
					joinOption.callback(res);
				}

			} else if (res.RESULT == 'N') { // 이벤트 참여 여부가 중복이면
				// sfd.core.showPopup('CommonEventRepeat');
				sfd.core.showPopup('CommonMessage', {
					titleText: '이미 이벤트에 참여하셨습니다<i>!</i>',
					messageList: [
						'고객님께서는 이미 삼성화재 다이렉트 이벤트에 참여하신 이력이 있습니다.',
						'중복으로 참여하실 경우 보험료 계산은 가능하지만 이벤트 경품은 지급되지 않습니다.'
					],
					okTitle: '확인'
				});
				if (joinOption && joinOption.callback) {
					joinOption.callback(res); 
				}
				// 열려있는 이벤트 팝업 종료 
				// forceCloseEventPopup();
			} else if (res.RESULT == 'F') { // 이벤트 참여 여부가 에러면
				// sfd.core.showPopup('CommonEventFail');
				sfd.core.showPopup('CommonMessage', {
					titleText: '잠시 후 다시 시도해 주세요<i>!</i>',
					messageList: [
						'시스템에 일시적인 에러가 발생했습니다.',
						'계속 동일한 현상이 반복될 경우 ' + sfd.data.dataObject.eventCheckJSON.PERC_EMAIL + '으로 연락 부탁드립니다.'
					],
					okTitle: '확인'
				});
				if (joinOption && joinOption.callback) {
					joinOption.callback(res);
				}
			} else if (res.RESULT == 'C') { // 이벤트 참여 여부가 에러면
				sfd.core.alert('휴대폰 인증에 오류가 발생했습니다.<br>다시 진행해 주세요.');
				// 열려있는 이벤트 팝업 종료 
				// forceCloseEventPopup();
			}
		},

		/**
		 * 경량화 이벤트 대상 고객인지 확인 (goLongCheck)
		 * @param {Object} option 옵션
		 * Key | Type | 기본값 | 설명
		 * ---|---|---|---
		 * callback | Function | - | 이벤트 확인 완료 콜백.
		 */
		eventLongCheck: function( option ) {
			// 이벤트 비 대상인 경우
			if (sfd.data.dataObject.eventState != 'Y') {
				if (option && option.callback) {
					option.callback(); 
				}
				return;
			}

			// 이벤트 체크 보내는 값
			var _eventCheckParam = {
				// 'DEVICE': '01',
				'DEVICE': self.eventManager.getDeviceType(),
				'TYPE': 'longCheck',
				'PRODCD': sfd.data.getValue('productCode'),
				'SCREENID': sfd.core.getUniqueCode('screen'),
				CALLBACK: eventCheckComplete
			}
			var _eventOptions = {
				header: {
					'X-DIRECT-CLIENT-ID': sfd.server.getGUID()
				}
			}
			sfd.core.showLoading();
			var runInfo = {
				form: 'eventLongCheck',
				module: {tranId: 'eventLongCheck'},
				param: _eventCheckParam,
				simpleRun: false
			}
			sfd.log3('EVENT_LOG 체크 보내는 값:', _eventCheckParam);
			// <STRIP_WHEN_RELEASE
			if (sfd.env.server == 'local') {
				// 팩토리 체크(로컬)
				sfd.core.simpleRun('eventLongCheck', _eventCheckParam, eventCheckComplete)
			} else {
			// STRIP_WHEN_RELEASE>
				// 팩토리 체크(서버)
				if (sfd.debug.tranLog) {
					sfd.debug.tranLog.add(runInfo);
				}
				goLongCheck(_eventCheckParam, _eventOptions);
			// <STRIP_WHEN_RELEASE
			}
			// STRIP_WHEN_RELEASE>


			// 체크 결과 처리
			function eventCheckComplete(res) {
				// as-is에서는 callback의 인자가 3개가 넘어온다
				if (arguments.length > 1) {
					res = arguments[3]; 
				}
				runInfo.responseJSON = res;
				if (sfd.debug.tranLog) {
					sfd.debug.tranLog.update(runInfo);
				}
				sfd.log3('EVENT_LOG 체크 받은 값:', res, arguments);
				sfd.core.hideLoading();
				
				// 사용자 이벤트 참여 이력 변경
				sfd.data.dataObject.eventUserState = 'N';
				sfd.data.dataObject.eventCheckJSON = res;

				// 보험나이
				var insuredAge_num = sfd.utils.insuredAge(sfd.utils.padRight(sfd.data.getValue('designSSN'), 13), sfd.data.getValue('sysdate'));
				var minAge_num = Number(res.STT_PTPT_PSB_AGE);	// 최소 참여가능 나이
				var maxAge_num = Number(res.LST_PTPT_PSB_AGE);	// 최대 참여가능 나이
				if (minAge_num == 0 && maxAge_num == 0) {
					maxAge_num = 99;
				}

				// 20160610 자녀보험 소아형 진행이면
				if (sfd.data.getValue('divisionName') == 'child' &&
					sfd.data.getValue('targetCls') == 'A') {
					// 최소 참여가능 나이 변경
					minAge_num = 0;
				}
				// 20171214 주택보험 진행이면
				if (sfd.data.getValue('divisionName') == 'home') {
					// 최대 참여가능 나이 변경
					maxAge_num = 999;  //수정 phk 2019.03.12
				}

				// 참여제한 나이에 걸리면
				if (insuredAge_num < minAge_num ||	insuredAge_num > maxAge_num) {
					// 이벤트 여부 변경
					sfd.data.dataObject.eventState = 'N';

					sfd.core.alert('죄송합니다.<br/>고객님께서는 이벤트에 참여할 수 있는 연령에 해당되지 않습니다.', {
						closeHandler: option.callback
					});

				} else {
					// 콜백이 있는 경우만 기본은 async
					if (option && option.callback) {
						option.callback();
					}
				}
			}
		},

		/**
		 * 경량화 이벤트 참여 (goLongJoin)
		 * @param {Object} option 옵션
		 * Key | Type | 기본값 | 설명
		 * ---|---|---|---
		 * callback | Function | - | 이벤트 확인 완료 콜백.
		 */
		eventLongJoin: function( option ) {
			sfd.log('eventLongJoin()')
			// 이벤트 비 대상인 경우
			if (sfd.data.dataObject.eventState != 'Y') {
				if (option && option.callback) {
					option.callback(); 
				}
				return;
			}

			// 이벤트 참여 호출 
			self.eventManager.eventLongJoinSubmit( option );

		},
		/**
		 * 경량화 이벤트 참여 서버요청
		 * @param {Object} option 옵션
		 * Key | Type | 기본값 | 설명
		 * ---|---|---|---
		 * callback | Function | - | 이벤트 확인 완료 콜백.
		 * mergeData | Object | - | 이벤트 참여 데이터에 추가할 데이터
		 */
		eventLongJoinSubmit: function( option ) {
			var divisionName_str = sfd.data.getValue('divisionName');
			var step_num = Number(String(sfd.view.getPageMetadata().step).substr(0, 1));
			// 새로운 이벤트 오픈할때 위에줄에서 아래줄로 바꿔서 검증!! var step_num = Number(sfd.data.getValue('pageStep'));
			var type_str = 'longJoin';
			// if (['driver', 'health'].indexOf(divisionName_str) > -1) type_str = 'longJoin';

			var joinShseCd_str = (step_num <= 4) ? '04' : '08';
			// 연계 이벤트면
			if (sfd.data.dataObject.subDivisionName == 'tiny') {
				joinShseCd_str = '06';
			}

			// 이벤트 참여 보내는 값
			var _eventJoinParam = {
				'PRODCD': sfd.data.getValue('productCode'),		// 상품코드
				'INFO3': sfd.data.getValue('contractNo'),		// 설계번호
				'SCREENID': sfd.core.getUniqueCode('screen'),	// 스크린 ID
				'DEVICE': self.eventManager.getDeviceType(),
				'JOINPHSECD': joinShseCd_str,					// 이벤트 참여 단계 코드 ('04':계산이벤트, '08':가입이벤트, '06':연계이벤트)
				'TYPE': type_str,								// 참여 타입 (일반:'join', 간편:'longLoin')
				'CUSTINFO': 'N',								// 디지탈 프라자('MC':GS칼텍스/홈플러스 상품권, 'MCP':파리바게뜨 상품권, 'MCS':S-Money 상품권), 전기공사(지점명),  default:N
				'AGREE': '',									// 동의 여부 ('Y' 동의, 'N' 비동의)
				'CARNO': '',
				'CERTNO': '',									// 인증번호
				'CERTKEY': '',									// 인증번호 매칭 키
				'CUSTID': '',
				'PRIZECD': '',									// 경품정보
				'SENDMETHOD': '',								// 전송방법 ('1' 전체, '2' 전화, '3' SMS, '4' 이메일, '5' 우편)
				CALLBACK: eventJoinComplete
			}
			var _eventOptions = {
				header: {
					'X-DIRECT-CLIENT-ID': sfd.server.getGUID()
				}
			}
			sfd.core.showLoading();

			// 추가정보 merge
			if (option && option.mergeData) {
				_eventJoinParam = $.extend(_eventJoinParam, {
					CUSTID: option.mergeData.custID || '',					// 고객ID
					NAME: option.mergeData.custName,						// 고객명
					INPUT1: '',
					INPUT2: option.mergeData.custPhone,						// 전화번호
					CERTTERM: option.mergeData.certTerm,					// 개인정보 보유, 이용 기간 (5년:'5', 4년:'4', 3년:'3', 2년:'2', 1년:'1')
					DEVICE: option.mergeData.deviceCls						// (PC:'01', MO(웹):'02', MO(앱):'03')
				});
			} else {
				var phoneCertedInfo = sfd.data.getCertedInfo( sfd.data.getValue('designID') );//
				var phoneNo = '';
				if (phoneCertedInfo && phoneCertedInfo.mobile) {
					phoneCertedInfo = phoneCertedInfo.mobile;
					phoneNo = phoneCertedInfo.mobileNo1 + '' + phoneCertedInfo.mobileNo2 + '' + phoneCertedInfo.mobileNo3;
				}
				var deviceCls = '01';
				if ( sfd.data.dataObject.type == 'MO' ) {
					deviceCls = '02';
				}
				// if ( sfd.env.isApp ) {
				// 	deviceCls = '03';
				// }
				_eventJoinParam = $.extend(_eventJoinParam, {
					NAME: sfd.data.getValue('designName'),						// 고객명
					INPUT1: '',
					INPUT2: phoneNo,					// 전화번호
					DEVICE: deviceCls						// (PC:'01', MO(웹):'02', MO(앱):'03')
				});

			}
			var runInfo = {
				form: 'eventLongJoin',
				module: {tranId: 'eventLongJoin'},
				param: _eventJoinParam,
				simpleRun: false
			}

			sfd.log3('EVENT_LOG 참여 보내는 값:', _eventJoinParam);
			// <STRIP_WHEN_RELEASE
			if (sfd.env.server == 'local') {
				// 팩토리 체크(로컬)
				sfd.core.simpleRun('eventLongJoin', _eventJoinParam, eventJoinComplete);
			} else {
			// STRIP_WHEN_RELEASE>
				// 팩토리 체크(서버)
				// 팩토리 체크(서버)
				if (sfd.debug.tranLog) {
					sfd.debug.tranLog.add(runInfo);
				}
				goLongJoin(_eventJoinParam, _eventOptions);
			// <STRIP_WHEN_RELEASE
			}
			// STRIP_WHEN_RELEASE>


			// 참여 결과 처리
			function eventJoinComplete(res) {
				// as-is에서는 callback의 인자가 3개가 넘어온다
				if (arguments.length > 1) {
					res = arguments[3];
				}
				runInfo.responseJSON = res;
				if (sfd.debug.tranLog) {
					sfd.debug.tranLog.update(runInfo);
				}
				sfd.log3('EVENT_LOG 참여 받은 값:', res, arguments);
				sfd.core.hideLoading();

				sfd.data.dataObject.eventJoinJSON = res;
				
				// 이벤트 참여 여부값 (Y:참여, N:미참여, F:불가, C:장기운전자가입자)
				// 이벤트 참여 여부가 중복참여면 (10개월 체크)
				if (res.EVENT_JOIN == 'Y') {
					// 사용자 이벤트 참여 이력 변경
					sfd.data.dataObject.eventUserState = 'Y';
					if (option && option.callback) {
						option.callback(); 
					}

					duplicateFunc();

				// 이벤트 참여 여부가 불가면
				} else if (res.EVENT_JOIN == 'F') {
					if (option && option.callback) {
						option.callback(); 
					}

					failFunc();

				} else {
					// 이벤트 참여 결과에 따라서 (00:성공, 01:중복, 02:실패, 03:실손전체중복, 04:실손일부중복, 05:실손조회오류, 06:인증실패)
					// 이벤트 참여 결과가 성공이면
					if (res.RESULT == '00' || res.RESULT == '04') {
						// 가입 이벤트 성공 리턴이면
						if (_eventJoinParam.hasOwnProperty('JOINPHSECD') &&
							(_eventJoinParam.JOINPHSECD == '06' || _eventJoinParam.JOINPHSECD == '08')) {
							if (option && option.callback) {
								option.callback(); 
							}

							sfd.core.alert('이벤트에 정상적으로 참여되었습니다.');
							
						} else {
							// 사용자 이벤트 참여 이력 변경
							sfd.data.dataObject.eventUserState = 'Y';
							if (option && option.callback) {
								option.callback();
							}

							setTimeout(function() {
								// sfd.showPopup('joinEventSuccess4', res);
								sfd.core.showPopup('CommonEventSuccess');
							}, 500);
						}

					// 이벤트 참여 결과가 실손전체중복이면
					} else if (res.RESULT == '03') {
						// 사용자 이벤트 참여 이력 변경
						sfd.data.dataObject.eventUserState = 'Y';
						if (option && option.callback) {
							option.callback();
						}

						setTimeout(function() {
							// sfd.showPopup('joinEventDuplicate');
							sfd.core.showPopup('CommonEventDuplicate');
						}, 500);

					// 이벤트 참여 결과가 중복이면
					} else if (res.RESULT == '01') {
						// 사용자 이벤트 참여 이력 변경
						sfd.data.dataObject.eventUserState = 'Y';
						if (option && option.callback) {
							option.callback(); 
						}
						
						// sfd.showPopup('joinEventRepeat3');
						duplicateFunc();
						
					// 이벤트 참여 결과가 실패/에러면
					} else if (res.RESULT == '02' || res.RESULT == '05') {
						if (option && option.callback) {
							option.callback();
						}

						// sfd.showPopup('joinEventFail3');
						failFunc();
					
					// 이벤트 참여 결과가 휴대폰 본인인증 오류면
					} else if (res.RESULT == '06') {
						sfd.core.alert('휴대폰인증에 오류가 발생했습니다.<br>다시 진행해 주세요.');
					}
				}
			}

			function duplicateFunc() {
				// CPS 가입이벤트가 있으면
				if (sfd.module.eventManager.isEventPanel('08')) {
					sfd.core.showPopup('CommonMessage', {
						titleText: '이미 이벤트에 참여하셨습니다<i>!</i>',
						messageList: [
							'고객님께서는 이미 삼성화재 다이렉트 계산이벤트에 참여하신 이력이 있습니다.',
							'계산이벤트에 중복으로 참여하는 경우 경품이 지급되지 않지만, 가입이벤트는 계속 참여하실 수 있으니 가입을 진행해 주세요.'
						],
						okTitle: '확인'
					});

				} else {
					sfd.core.showPopup('CommonMessage', {
						titleText: '이미 계산이벤트에 참여하셨습니다<i>!</i>',
						messageList: [
							'고객님께서는 이미 삼성화재 다이렉트 이벤트에 참여하신 이력이 있습니다.',
							'중복으로 참여하실 경우 보험료 계산은 가능하지만 이벤트 경품은 지급되지 않습니다.'
						],
						okTitle: '확인'
					});
				}
			}

			function failFunc() {
				var eventCheck_obj = sfd.data.dataObject.eventCheckJSON || {};
				var email_str = eventCheck_obj.PERC_EMAIL;

				sfd.core.showPopup('CommonMessage', {
					titleText: '잠시 후 다시 시도해 주세요<i>!</i>',
					messageList: [
						'시스템에 일시적인 에러가 발생했습니다.',
						'계속 동일한 현상이 반복될 경우 ' + email_str + '으로 연락 부탁드립니다.'
					],
					okTitle: '확인'
				});
			}
		},
		/**
		 * 가입체험기 이벤트 참여
		 * @param {String} inStatusStr 만족도
		 * @param {String} inInputStr 후기 메시지
		 */
		eventJoinBBS: function(inStatusStr, inInputStr) {
			

			// ! 모바일은 제목포맷이 틀림 : '[모바일(' + sfd.env.os.group  + ')]' 이렇게 가야 해서 수정함

			var gender = ['1', '3', '5', '7'].indexOf(sfd.data.getValue('designJuminNo').substr(6, 1)) > -1 ? 'm' : 'g';
			inInputStr = inInputStr.split('\r').join('｜');

			var subject = inInputStr;
			if (sfd.env.deviceType == 'MO') {
				subject = '[모바일(' + sfd.env.os.group  + ')]' + subject;
			}
						
			sfd.core.run('writeBbsForRia', {
				content_gubun: 'CONTENT',
				job_gubun: 'INSERT',
				path: 'templatedata\\BBS_ANYCAR\\ADMIN\\data\\367',
				state: 'Original',
				status: gender + inStatusStr,
				bbs_id: '00000367', // 통합게시판 ID로 변경 
				content: inInputStr,
				owner: sfd.data.getValue('designName'),
				subject: subject,
				ownerEmail: '',
				ownerTel1: '',
				ownerTel2: '',
				ownerTel3: '',
				selCategoryId: sfd.core.getUniqueCode('category'),
				lobCd: sfd.data.getValue('lobCd'),
				insuredId: sfd.data.getValue('designID')
			}, function(res) {
				sfd.log('체험기이벤트참여결과:', String(res.result) != '1');
				if ( String(res.result) != '1' ) {
					return;
				}

				sfd.module.eventManager.eventLongJoinSubmit({
					callback: function(res) {

					}
				});
			});
		},

		/**
		 * 4번 배너 노출 (조건 확인 후 필요한 경우에 노출)
		 */
		checkEventBanner: function() {

			var deviceType = sfd.env.deviceType;
			// if( deviceType == 'MO' )return;
			var divisionName = sfd.data.dataObject.divisionName;
			var subDivisionName = sfd.data.dataObject.subDivisionName;
			var lobCd = sfd.data.dataObject.lobCd;
			var isCPA = sfd.module.eventManager.isEventPossibleCPA();
			var isCPS = sfd.module.eventManager.isEventPossibleCPS();

			if ( lobCd == 'MV' ) {
				// 자동차 && cps && 만기도래건
				if ( isCPS && sfd.data.dataObject.tasa365Yn != 'Y' ) {
					sfd.module.eventManager.insertEventBanner('cps');
				}
			} else {
				// 2019년 10월 1일 이후 상품판매 금지 상품이면
				if (['home', 'dental'].indexOf(divisionName) > -1) {
					// 20190909 2019년 10월 1일 이후 상품판매 금지에 따른 처리 (김심선 책임)
					if (Number(sfd.data.getValue('sysdate')) >= 20191001) {				// 2019년 10월 개정일을 지났으면
						// 배너 노출 안함
						return;
					}
				}

				// 장기/일반
				if ( isCPA && !isCPS ) {
					// cpa
					sfd.module.eventManager.insertEventBanner('cpa');
				} else if ( !isCPA && isCPS ) {
					// cps
					sfd.module.eventManager.insertEventBanner('cps');
				} else if ( isCPA && isCPS ) {
					// cpa+cps
					sfd.module.eventManager.insertEventBanner('cpa');
				}
			}

		},
		/**
		 * 4번 이벤트 배너 노출 (Mobile)
		 * @param {String} inType 타입
		 */
		insertEventBannerMo: function(inType) {

			var divisionName_str = sfd.data.getValue('divisionName');
			var eventType_str = sfd.data.getValue('eventType');

			sfd.log('temp_event_log insertEventBannerMo  -- MO : ' + inType);

			var $banner = $('<div class="factory event-banner04">\
			<div style="position:relative">\
				<img class="btn-close" style="position:absolute;right:0" src="/ria/common/image/common-eventbanner04-x.png">\
				<img id="banner-cpa" style="width:100%" src="">\
			</div>\
			</div>');


			$banner.find('.btn-close').on('click', function(e) {


				if (sfd.data.dataObject.lobCd != 'MV') {

					var isCPA = sfd.module.eventManager.isEventPossibleCPA();

					if (!isCPA) {
						$banner.fadeOut(300, function() {
							$('.__wrapUtil').css('margin-bottom', '');
							$('.cps-event').hide();
						});							
						return
					}						

					sfd.core.confirmAlert("이벤트 참여를 원하지 않으시면 '확인'을 눌러주시고, 다시 이벤트에 참여하시려면 '취소'를 눌러주세요.", {
						titleText: '이벤트 페이지를 닫으실 경우 참여가 불가능합니다.',
						cancelTitle: '취소',
						closeHandler: function(result) {
							if (result == 'confirm') {
								$banner.fadeOut(300, function() {
									$('.__wrapUtil').css('margin-bottom', '');
									$('.cps-event').hide();
								});
							}

						}
					});


				} else {
					$banner.slideUp(300, function() {
						$('.__wrapUtil').css('margin-bottom', '');
						$('.cps-event').hide();
					});
				}

			});

			// 배너 오픈
			$banner.find('#banner-cpa').on('click', function(e) {

				if ( sfd.data.dataObject.lobCd != 'MV') {
					
					var isCPA = sfd.module.eventManager.isEventPossibleCPA();

					if (!isCPA) {
						
						return
					}
					// smartM인경우 보장분석 진행여부 먼저 체크 
					if ( sfd.data.dataObject.divisionName == 'smartM' && 
						!sfd.core.module.isCovrAnls() ) {
						// 보장분석 안한경우 보장분석 하고 이벤트 진행하세요
						return;

					}
					
					// 자동차는 확인용, 장기일반은 참여
					sfd.module.eventManager.eventJoinCPA();
					$banner.hide();
					$('.__wrapUtil').css('margin-bottom', '');
				}

			});


			var img = new Image();

			var imgURL = '/ria/dlpo/' + divisionName_str + '/' + eventType_str + '_bn_' + inType + '_mo.png';
			img.onload = function() {

				if (!this.width) {
					return;
				}

				var width = (this.width > 500) ? parseInt(this.width / 2, 10) : parseInt(this.width, 10);
				var left = ($(window).width() - width) / 2 ;
				$banner.find('#banner-cpa').attr('src', imgURL);

				// 배너 스타일
				$banner.css({
					'width': width + 'px',
					'margin-left': left + 'px'
				});


				if (sfd.data.dataObject.lobCd != 'MV') {
					// CPA 일때 일반/장기는 여기 꼽는다.
					// if (inType == 'cpa') {
						
					// }
					var isCPA = sfd.module.eventManager.isEventPossibleCPA();

					if (isCPA && inType == 'cps') {	// CPA 이벤트 있는 상태에서 cps 이미지를 붙이고자 할때 리턴한다.
						return;
					}
					$('#shell-event-container').html($banner);

					$('.__wrapUtil').css('margin-bottom', '60px');
					
				}



				if (inType == 'cps' && sfd.data.dataObject.lobCd == 'MV') {

					// 자동차 CPS 이벤트 삽입 조건
					$('.cps-event').html($banner);
					$('.cps-event').fadeIn();
				}

			}


			img.src = imgURL;

		},
		/**
		 * 4번 배너 노출
		 * @param {String} inType 이벤트 타입
		 */
		insertEventBanner: function( inType ) {

			// 4번 배너(cpa)  /ria/dlpo/{divisionName}/{이벤트타입}_banner_cpa_pc.png
			// 4번 배너(cps)  /ria/dlpo/{divisionName}/{이벤트타입}_banner_cps_pc.png
			sfd.log('temp_event_log insertEventBanner');

			var deviceType = sfd.env.deviceType;
			if (deviceType == 'MO') {
				sfd.module.eventManager.insertEventBannerMo(inType);
				return;
			}

			var $banner = $(
				'<div class="factory event-banner04">' +
					'<div class="banner-show">' +
						'<div class="btn-close"><img src="/ria/common/image/common-eventbanner04-x.png"></div>' +
					'</div>' +
					'<div class="banner-hide display-none"><img src="/ria/pc/product/common/image/common-eventbanner-mini.png"></div>' +
				'</div>'
			);
			var _bannerURL = '/ria/dlpo/' + sfd.data.dataObject.divisionName + '/' + sfd.data.dataObject.eventType + '_bn_' + inType + '_pc.png';
			var _bannerWidth = 210;
			var _bannerHeight = 237;
			var _bannerTop = 297;
			var _bannerLeft = 940;
			var _isCloseBtn = true;
			var _isClick = true;
			var divisionName = sfd.data.dataObject.divisionName;

			if ( inType == 'cpa' ) {
				_isCloseBtn = false;
				_isClick = true;
			} else if ( inType == 'cps' ) {
				_isCloseBtn = true;
				_isClick = false;
			}
			if ( sfd.data.dataObject.lobCd == 'MV') {
				// 자동차
				_bannerTop = 393;
				_bannerLeft = 940;
				_bannerWidth = 210;
			} else {
				// 일/장
				_bannerTop = 490;
				_bannerLeft = 960;
				_bannerWidth = 190;
				_bannerHeight = 227;

				if ( divisionName == 'health' || divisionName == 'dental' || divisionName == 'cancer' || divisionName == 'home' || divisionName == 'child') { //
					if ( inType == 'cpa' ) { // cpa
						_isCloseBtn = false;
						_isClick = true;
					} else if ( inType == 'cps' ) { // cps
						_isCloseBtn = true;
						_isClick = false;
						_bannerTop = 485;
						_bannerHeight = 232;
					}
				}
				if ( divisionName == 'smartM' ) {
					_isCloseBtn = false;
					_bannerTop = 643;
					_bannerLeft = 1190;
					_bannerWidth = 150;
					_bannerHeight = 267;
				}
			}

			// 배너 Insert
			$('#shell-event-container').html($banner);

			// 배너 스타일
			$banner.css({
				'width': _bannerWidth,
				// 'height': _bannerHeight,
				'height': 0,
				'position': 'absolute',
				'left': _bannerLeft,
				'top': _bannerTop
			});


			// 배너 오픈
			$banner.children('.banner-show').css({
				'width': _bannerWidth,
				'height': _bannerHeight,
				// 'background-color': '#61D1FC',
				'cursor': (_isClick) ? 'pointer' : 'default',
				'position': 'absolute',
				'background-image': 'url(' + _bannerURL + ')'
			}).on('click', function(e) {
				if ( _isClick ) {
					if ( sfd.data.dataObject.lobCd != 'MV') {

						// smartM인경우 보장분석 진행여부 먼저 체크 
						if ( sfd.data.dataObject.divisionName == 'smartM' && 
							!sfd.core.module.isCovrAnls() ) {
							// 보장분석 안한경우 보장분석 하고 이벤트 진행하세요
							return;

						}

						// 자동차는 확인용, 장기일반은 참여
						sfd.module.eventManager.eventJoinCPA();
						$banner.hide();
					}
				}
			});

			// 배너 미니멈
			$banner.children('.banner-hide').css({
			}).on('click', function(e) {
				$banner.children('.banner-show').slideDown(300);
				$banner.children('.banner-hide').slideUp(300);
			});

			// 배너 클로즈버튼
			/*if( inType == 'cpa' ){
				$banner.find('.btn-close').hide();
			}*/
			if (!_isCloseBtn) {
				$banner.find('.btn-close').hide();
			}
			$banner.find('.btn-close').on('click', function(e) {
				$banner.children('.banner-show').slideUp(300);
				$banner.children('.banner-hide').slideDown(300);
				return false;
			});

			if ( sfd.data.dataObject.lobCd == 'MV' ) {
				// 자동차는 4.5초 후 닫히기 
				setTimeout(function() {
					$banner.find('.btn-close').trigger('click');
				}, 4500);
			}
			// $('#shell-comm-container').html('<div class="event-banner04" style="width:210px; height:213px; background-color:#61D1FC;"></div>');
		},
		/**
		 * CPA 이벤트 참여
		 */
		eventJoinCPA: function() {
			// 이벤트 비 대상인 경우
			if ( sfd.data.dataObject.eventState != 'Y' ) {
				return;
			}

			// if(sfd.env.deviceType == 'MO'){
			// 	// 자동차일때 cps 이벤트가 있을경우 배너를 삽입해준다.
			// 	if(sfd.data.getValue('lobCd') == 'MV' && sfd.module.eventManager.isEventPanel('08')){
			// 		sfd.module.eventManager.insertEventBanner('cps');
			// 	}
			// }
			if ( !sfd.module.eventManager.isEventPanel('04') &&
				 sfd.module.eventManager.isEventPanel('08') ) {
				// cps이벤트만 있는경우
				return;
			}

			var phoneCertedInfo = sfd.data.getCertedInfo( sfd.data.getValue('designID') );//
			if (phoneCertedInfo) {
				phoneCertedInfo = phoneCertedInfo.mobile; 
			}

			// CPS 이벤트 체크
			if (self.eventManager.isEventPanel('04')) {
				// 자동차면
				if ( sfd.data.dataObject.lobCd == 'MV') {
					sfd.core.showPopup('CommonEventJoin', {
						phoneCertedInfo: phoneCertedInfo/*,
						closeHandler:function(result){
							self.eventManager.eventJoin(result);
						}*/
					});

				// 일반, 장기면
				} else {
					if ( ['smartM'].includes(sfd.data.dataObject.divisionName) && phoneCertedInfo ) {
						sfd.core.showPopup('CommonEventJoinLongCerted', {
							phoneCertedInfo: phoneCertedInfo
						});
					} else {
						sfd.core.showPopup('CommonEventJoinLong');
					}
				}
			}

		},
		/// CPS 이벤트 참여
		eventJoinCPS: function() {
			sfd.core.showPopup('CommonEventJoinCPS');
			// sfd.module.eventManager.eventJoin({JOINPHSECD:'08'})
		},
		/**
		 * 현재 이벤트 참여 가능여부 확인
		 * @return {Boolean} 참여 가능하면 true, 아니면 false.
		 */
		isEventPossible: function() {
			// 이벤트 참여 비대상인경우
			if ( sfd.data.dataObject.eventState != 'Y' ) {
				return false;
			}
			// CPA이벤트 참여 완료인경우
			if ( sfd.data.dataObject.eventJoinedArr.indexOf('04') != -1) {
				return false;
			}
			// CPS이벤트 참여 완료인 경우
			if ( sfd.data.dataObject.eventJoinedArr.indexOf('08') != -1) {
				return false;
			}

			return true;
		},
		/**
		 * 현재 CPA이벤트 참여 가능여부 확인
		 * @return {Boolean} 참여 가능하면 true, 아니면 false.
		 */
		isEventPossibleCPA: function() {
			// 이벤트 참여 비대상인경우
			if ( sfd.data.dataObject.eventState != 'Y' ) {
				return false;
			}
			// CPA이벤트가 아니면
			if ( !sfd.module.eventManager.isEventPanel('04') ) {
				return false;
			}
			// CPA이벤트 참여 완료인경우
			if ( sfd.data.dataObject.eventJoinedArr.indexOf('04') != -1) {
				return false; 
			}

			return true;
		},
		/**
		 * 현재 CPS이벤트 참여 가능여부 확인
		 * @return {Boolean} 참여 가능하면 true, 아니면 false.
		 */
		isEventPossibleCPS: function() {
			var alwaysEventMode = sfd.module.eventManager.alwaysEventMode();
			
			// 이벤트 참여 비대상인경우
			if ( sfd.data.dataObject.eventState != 'Y' ) {
				return false;
			}
			// CPA이벤트가 아니면
			if ( !sfd.module.eventManager.isEventPanel('08') ) {
				return false;
			}
			// CPA이벤트 참여 완료인경우
			if ( sfd.data.dataObject.eventJoinedArr.indexOf('08') != -1) {
				return false;
			}
			// joinBbs이벤트는 cps비대상 
			if ( alwaysEventMode && alwaysEventMode == 'joinBbs' ) {
				return false;
			}

			return true;
		},
		// 
		/**
		 * 상시이벤트 구분값(bbs, birthday)
		 * @return {String} "bbs", "birthday"
		 */
		alwaysEventMode: function() {
			// 자동차 계열은 비대상 
			if ( sfd.data.dataObject.lobCd == 'MV' ) {
				return null;
			}

			// 장기일반의 이벤트 중에 상시 이벤트 체크 
			if ( sfd.data.dataObject.eventState == 'Y' &&
				sfd.data.dataObject.eventSearch.INLCK_CLS) {
				return sfd.data.dataObject.eventSearch.INLCK_CLS;
			}
			return null;
		},
		/**
		 * 해당 패널 이벤트 여부
		 * @param {String} inPanelCode 현재 페이지 코드 ('04':계산이벤트, '08':가입이벤트)
		 * @return {Boolean} 이벤트면 true, 아니면 false. (eventState "Y"가 아닌 경우 undefined)
		 */
		isEventPanel: function( inPanelCode ) {
			if ( sfd.data.dataObject.eventState != 'Y' ) {
				return;
			}
			var _r = false;
			var _eventCheckJSON = sfd.data.dataObject.eventCheckJSON;

			// 이벤트 진행이면 (goCheck 값이 있으면 최초에 이벤트로 진행한 것임)
			if (_eventCheckJSON) {

				// 중복참여자 N, 에러, 비대상자(NDRTS체크)
				if ( inPanelCode != '08' && sfd.data.dataObject.eventUserState != 'N' ) {
					return false;
				}
				// 리턴받은 이벤트 단계코드 값이 있으면 (['04'], ['04', '08'], ['08'])
				if ( _eventCheckJSON.EVT_PHSECD ) {
					if (_eventCheckJSON.EVT_PHSECD.indexOf(inPanelCode) > -1) {
						_r = true;

					}
					// CPS 이벤트 대상이 이지만 4번 패널에서 더이상 진행 할수 없는 케이스는 이벤트 대상에서 제외
					if (_r && inPanelCode == '08' && self.eventManager.isImpossibleEvent08()) {
						_r = false;

					}

				} else {
					// 서버에서 CPS 이벤트 작업 전이므로 배너등에서 '04' 로 확인하면 true 로 넘김
					if (inPanelCode == '04') {
						_r = true;

					}
				}
			}

			// 1번에서 참여제한을 받았으면 모든 이벤트 비대상 처리
			if ( sfd.data.dataObject.eventState != 'Y' ) {
				_r = false;

			}

			sfd.log(_r, 'isEventPanel(' + inPanelCode + ') 함수로 체크한 이벤트 여부값 ~~~~~');
			return _r;
		},
		/**
		 * 현재 상품의 SCREENID 값 조회
		 * @return {String} SCREENID 값.
		 */
		getScreenID: function() {
			return sfd.core.getUniqueCode( 'screen' );
		},
		/**
		 * 기기 구분값 조회
		 * @return {String} PC면 "01", Mobile이면 "02".
		 */
		getDeviceType: function() {
			return (sfd.env.deviceType == 'PC') ? '01' : '02';
		},
		/**
		 * CPS 이벤트 대상이지만 4번 패널 이후 진행 불가 케이스체크
		 * @return {Boolean} 진행 가능이면 true, 아니면 false.
		 */
		isImpossibleEvent08: function() {
			var _r = false
			if ( sfd.data.dataObject.divisionName == 'car' ) {
				sfd.data.isImpossibleEvent08();
			}
			return _r;
		},
		/**
		 * Panel 이벤트 초기화
		 */
		initPanelEvent: function() {
			$('#wrapper').on('sf.change-page-complete', function() {
				var _divisionName = sfd.data.dataObject.divisionName;
				var _currentPageName = sfd.data.getValue('currPageName');
				if ( _currentPageName == 'Payment' ) {

					
					if ( _divisionName == 'car' ) {
						
						// 카드 결제 이벤트 대상 여부 체크
						var cardEventInfo = sfd.listValue.paymentCardEventInfo();
						
						// 이벤트 시기 대상 && 30만원이상 && 개인만
						if ( cardEventInfo && parseInt(sfd.data.dataObject.firstReceivePremium) > 300000 && sfd.data.dataObject.subDivisionName != 'corp' ) {
							sfd.core.simpleRun( 'getCardPayCls', {
								'cardKind': cardEventInfo.cardList,
								'paymentMethod': cardEventInfo.paymentMethod,
								'designId': sfd.data.dataObject.contractorID
							}, function(res) {
								// 오픈 대상인 경우
								if ( res.getSamsungCardPayCls == cardEventInfo.passValue ) {

									if (sfd.env.deviceType == 'PC') {
										sfd.core.moduleDevice.showBanner( 'CardPaymentEvent', cardEventInfo );

									} else {
										// 모바일을 결제 화면에 배너만 삽입한다.
										sfd.core.showCardEvent(cardEventInfo);
									}

								}
							});
						}
					}
				}

			})
		},
		endVal: ''
	}; // eventManager
	self.eventManager = eventManager;
	// @endclass

	/**
	 * 결제 공통 프로세스 관리
	 * @category 결제
	 */
	var paymentManager = {
		/**
		 * 실시간계좌이체(RT) 프로세스 
		 * @type {Object}
		 */
		rt: {
			/**
			 * RT 대상여부 확인 (RT 파킹여부, 계약자, 시간 확인)
			 * @return {Boolean} RT 대상이면 true, 아니면 false.
			 */
			isAvailable: function() {
				// 1. RT UI파킹 (조건과 관계없이 가능/불가능 체크)
				if (this.isEnabled() == false) {
					sfd.log('RT UI파킹');
					return false;
				} 

				// 2. RT 가능 계약자
				if (this.isAvailableContractor()) {
					return true;
				}

				// 3. RT 가능 시간
				if (this.isAvailableTime() == false) {
					return false;
				}

				return true;
			},
			/**
			 * sfd.module.payment.rt.isAvailable() 사용하세요. (deprecated)
			 * @return {Boolean} RT 대상이면 true, 아니면 false.
			 */
			isAble: function() {
				return this.isAvailable();
			},

			/**
			 * RT 결제 활성화 여부
			 * @return {Boolean} 활성화 상태면 true, 아니면 false (RT파킹 상태).
			 */
			isEnabled: function() {
				return sfd.listValue.rtInfo.onair;
			},

			/**
			 * 현재 진행하는 계약자가 무조건 RT 가능한지 여부 확인
			 * @return {Booelan} RT 진행 가능한 계약자면 true, 아니면 false.
			 */
			isAvailableContractor: function(contractorID) {
				contractorID = contractorID || sfd.data.getValue('contractorID');
				var result = sfd.listValue.rtInfo.ableCustIdList.includes(contractorID);
				
				sfd.log('RT 가능 계약자 확인', result);
				return result;
			},

			/**
			 * sfd.module.payment.rt.isVailableContractor() 사용하세요. (deprecated)
			 * @return {Booelan} RT 진행 가능한 ID면 true, 아니면 false.
			 */
			isAbleID: function() {
				// <STRIP_WHEN_RELEASE				
				sfd.warnLog('sfd.module.payment.rt.isAvailable() 사용하세요.');
				// STRIP_WHEN_RELEASE>
				return this.isAvailableContractor();
			},

			/**
			 * RT 가능시간 확인
			 * @param {Object} [option] 옵션
			 * Key | Type | 기본값 | 설명
			 * ---|---|---|---
			 * date | String | data.sysdate | 확인하려는 날짜. ex) "20190901"
			 * time | String | data.systime | 확인하려는 시간. ex) "233000"
			 * @return {Boolean} RT 가능한 시간이면 true, 아니면 false.
			 */
			isAvailableTime: function(option) {
				option = option || {};
				var timeNum = parseInt(option.time || sfd.data.getValue('systime'), 10);
				// var date = option.date || sfd.data.getValue('sysdate');
	
				var result = true;
				var rtInfo = sfd.listValue.rtInfo;

				// 필요한 경우 날짜 확인 (현재는 날짜 확인하는 로직 없음)
				// if (['savings', 'golf', 'travelDomestic', 'driver'].includes(sfd.data.getValue('divisionName')) == false) {
				// 	if (sfd.utils.isHoliday(date)) {
				// 		sfd.log('RT 공휴일 불가');
				// 		result = false;
				// 	}
				// 	if (sfd.utils.isWeekend(date)) {
				// 		sfd.log('RT 주말 불가');
				// 		result = false;
				// 	}
				// }
				
				// 시간 확인
				if (timeNum < parseInt(rtInfo.startTimeInfo.value, 10) || parseInt(rtInfo.endTimeInfo.value, 10) <= timeNum) {
					sfd.log('RT 불가능시간');
					result = false;	
				}
	
				return result;
			},

			/**
			 * RT 가능한 은행인지 확인
			 * @param {String} bankCode 은행코드
			 * @return {Boolean} RT 가능한 은행이면 true, 아니면 false.
			 */
			isAvailableBank: function(bankCode) {
				var list = sfd.listValue.banks.concat(sfd.listValue.securitiesFirms); // 은행, 증권사 목록 모두 확인
				var matchedItem = list.find(function(item) {
					return item.value == bankCode;
				});
				return !!(matchedItem && matchedItem.RT);
			},
			/**
			 * sfd.module.payment.rt.isAvailableBank() 사용하세요. (deprecated)
			 * @param {String} bankCode 은행코드
			 * @return {Boolean} RT 가능한 은행이면 true, 아니면 false.
			 */
			isRTBank: function(bankCode) {
				// <STRIP_WHEN_RELEASE				
				sfd.warnLog('sfd.module.payment.rt.isAvailableBank() 사용하세요.');
				// STRIP_WHEN_RELEASE>
				return this.isAvailableBank(bankCode);
			},

			/**
			 * RT 실행
			 * @param {Object} option 
			 * Key | Type | 기본값 | 설명
			 * ---|---|---|---
			 * tranID | String | - | Tran ID
			 * param | Object| - | RT 전송 인자
			 * callback | Function | - | 완료 콜백
			 */
			run: function(option) {
				sfd.core.showLoading();
				// 결제 고도화 비대상(simpleRun)
				sfd.core.simpleRun(option.tranID, option.param, function(res) {
					sfd.core.hideLoading();
					sfd.tracker.eventLog({
					    logType: 'etcLog',
					    code: 'RT_run_resultYn' + res.resultYn,
					    description: 'RT_run_resultYn'
					});
					
					if ( res.resultYn == 'Y' ) {
						sfd.data.setValue('clearingData', option.param);
						paymentManager.rt._intervalCheckComplete(option, 'resultY');
					} else {
						if (res.contractResult && res.contractResult.processStatus) {
							if (res.contractResult.processStatus == '02') {
								// 오류 처리
								sfd.core.alert(res.rtResultMsg);
							} else if (res.contractResult.processStatus == '03') {
								// 10초간 3회 결과 조회
								paymentManager.rt._intervalCheckStart(option, res);
							}
							return;
						} else {

							// 결제실패
							sfd.core.showPopup('CarPaymentErr', res);
						}						
					}
				}, function(err) {
					sfd.core.hideLoading();
					sfd.core.showPopup('CarPaymentErr', err);
				});
			},
			/**
			 * RT 완료 확인. (10초 간격)
			 * @param {Object} runOption 옵션
			 * Key | Type | 기본값 | 설명
			 * ---|---|---|---
			 * callback | Function | - | 완료 콜백. function(code) {}
			 * callbackError | Function | - | 실패 콜백. function(code) {}
			 * @param {Object} clearingRes TODO: 작성필요
			 * @see
			 * 로컬에서는 3초마다 확인
			 */
			_intervalCheckStart: function(runOption, clearingRes) {
				var clearingParam = runOption.param;

				sfd.tracker.eventLog({
				    logType: 'etcLog',
				    code: 'RT_intervalCheckStart',
				    description: 'RT_intervalCheckStart'
				});
				// 초기화 
				var _rtIervalCnt = 0;
				var _rtIervalMaxCnt = 3;
				var _rtIervalTime = 10000;
				// <STRIP_WHEN_RELEASE
				if ( sfd.env.server == 'local') {
					_rtIervalTime = 3000;
				}
				// STRIP_WHEN_RELEASE> 
				sfd.core.showLoading();
				processRTCheck(clearingRes);

				function processRTCheck(clearingRes) {
					// 인터벌 체크 종료
					if ( _rtIervalCnt == _rtIervalMaxCnt ) {
						// 오류처리 종료 
						// 결제실패
						sfd.core.showPopup('CarPaymentErr', clearingRes);
						paymentManager.rt._intervalCheckComplete(runOption, 'intervalMax');
						return;
					}
					/*function _intervalCheckComplete() {
						sfd.tracker.eventLog({
						    logType: 'etcLog',
						    code: 'RT_processRTCheck' + _rtIervalCnt,
						    description: 'RT_processRTCheck'
						});
					}*/
					_rtIervalCnt ++;	
					(function(inRes) {
						setTimeout(function() {
							sfd.core.simpleRun('processRTCheck', {
								payId: inRes.contractResult.approvalNo,					
								certMthdCd: clearingParam.certMthdCd,					
								tryDate: inRes.tryDate,					
								tryTime: inRes.tryTime,									
								contractNoStr: (clearingParam.contractNoStr) ? clearingParam.contractNoStr : '',					
								changeTypeCode: sfd.data.getValue('changeTypeCode'),					
								mailformid: sfd.data.getValue('mailformid'),					
								milgCarCng: clearingParam.milgCarCng			
							}, function(res) {
								if (String(res.isError) == 'true') {
									sfd.core.alert(res.message);
									return;
								}
								sfd.tracker.eventLog({
								    logType: 'etcLog',
								    code: 'RT_processStatus' + res.processStatus,
								    description: 'RT_processStatus'
								});
								if (res.processStatus == '01') {
									// 정상처리됨 
									sfd.data.setValue('clearingData', clearingParam);
									sfd.core.paymentComplete();
									paymentManager.rt._intervalCheckComplete(runOption, res.processStatus);

								} else if (res.processStatus == '02') {
									// 오류처리 종료 
									sfd.core.alert(res.statusMessage);
									// 결제실패
									paymentManager.rt._intervalCheckComplete(runOption, res.processStatus);

								} else if (res.processStatus == '03') {
									// 재 확인 
									processRTCheck(inRes);
								
								}
							})
						}, _rtIervalTime);
					})(clearingRes)
				}
			},
			/**
			 * RT 완료 확인 종료.
			 * @param {Object} runOption 옵션
			 * @param {String} inCode 응답 코드.
			 * "resultY"(RT클리어링 정상), "01"(정상)
			 * "intervalMax"(오류max), "02"(오류)
			 */
			_intervalCheckComplete: function(runOption, inCode) {
				// resultY(RT클리어링 정상), 01(정상)
				// intervalMax(오류max), 02(오류)
				sfd.core.hideLoading();
				sfd.tracker.eventLog({
				    logType: 'etcLog',
				    code: 'RT_intervalCheckComplete_' + inCode,
				    description: 'RT_intervalCheckComplete'
				});
				if ( ['resultY', '01'].includes(inCode) ) {
					if (runOption.callback) {
						runOption.callback({
							code: inCode
						});
					}
				} else {
					if (runOption.callbackError) {
						runOption.callbackError({
							code: inCode
						});
					}
				}
			}
		},
		/**
		 * 뱅크페이 진행 프로세스 
		 * @type {Object}
		 */
		bankPay: {
			_pgInterval: null, /// {Number} 뱅크페이 팝업 닫힘 확인 interval 객체.
			_pgOpenPopup: null, /// {Object} 뱅크페이 팝업 윈도우 객체.
			/**
			 * 뱅크페이 모듈 호출 
			 * @param {Object} options 옵션
			 * Key | Type | 기본값 | 설명
			 * ---|---|---|---
			 * callback | Function | - | 완료 콜백. function({hd_pi, hd_ep_type})();
			 */
			start: function( options ) {
				sfd.core.showLoading();
				// 뱅크페이 전역 콜백 
				window.bankPayProceed = function( _hd_pi, _hd_ep_type ) {
					// sfd.log('bankpay_proceed', [_hd_pi, _hd_ep_type] );
					sfd.core.hidePopup('Bankpay');
					if ( options.callback ) {
						options.callback({
							hd_pi: _hd_pi,
							hd_ep_type: _hd_ep_type
						});
						setTimeout(function() {
							sfd.core.showLoading();
						}, 500);
					}
					self.payment.bankPay.end(true);
				}
				window.bankPayCanceled = function() {
					sfd.core.hidePopup('Bankpay');
				}

				
				// 뱅크페이 페이지 로드 
				sfd.server.runPage( 'bankPayPageEmbed', options.param, function(responseText) {
					sfd.core.showLoading();
					sfd.core.showPopup('Bankpay', {
						bankpayHTML: responseText,
						closeHandler: function(res) {
							// 여기서 안함 
						}
					})
					return;

					var leftPosition = ($(window).width - 720) / 2 - 10;
					var topPosition = ($(window).height - 600) / 2 - 50;
					var features = 'top=' + topPosition + ',left=' + leftPosition + ',height=600,width=720,status=no,dependent=no,scrollbars=no,resizable=no';
					paymentManager.bankPay._pgOpenPopup = window.open('about:blank', 'BANKPAYPOPUP', features);

					if (paymentManager.bankPay._pgOpenPopup) {
						paymentManager.bankPay._pgOpenPopup.document.open();
						paymentManager.bankPay._pgOpenPopup.document.charset = 'euc-kr';
						sfd.log('responseText', responseText);
						paymentManager.bankPay._pgOpenPopup.document.write(responseText);
						paymentManager.bankPay._pgOpenPopup.document.close();
						// 인터벌 실행 
						self.payment.bankPay._interval();	
					} else {
						if (sfd.env.isIE()) {
							sfd.tracker.eventLog({
								    logType: 'etcLog',
								    code: 'bankpay 팝업차단고객 case1 0453',
								    description: 'testlog_debug'
							});
							sfd.core.alert('인터넷 옵션 > 개인 정보 탭에서 "팝업 차단 사용" 해제 또는 팝업 차단 설정에서 direct.samsungfire.com 허용 후 다시 시도해 주세요.');
						} else {
							sfd.tracker.eventLog({
								    logType: 'etcLog',
								    code: 'bankpay 팝업차단고객 case2 0453',
								    description: 'testlog_debug'
							});
							sfd.core.alert('팝업 차단을 해제 후 다시 시도해 주세요.');
						}
					}
				});
			},
			/*
			 * 뱅크페이 모듈 완료되면 호출됨.
			 * @param {Boolean} result 성공여부
			 */
			end: function(result) {
				sfd.core.hideLoading();
				// 성공 또는 실패 응답  
				if ( result ) {
					// runClearing();
				}
				if (paymentManager.bankPay._pgInterval) {
					clearInterval(paymentManager.bankPay._pgInterval);
				}
			},
			/**
			 * 뱅크페이 팝업 닫힘 확인. (2초 간격)
			 */
			_interval: function() {
				paymentManager.bankPay._pgInterval = setInterval(function() {
					if ( paymentManager.bankPay._pgOpenPopup ) {
						if (paymentManager.bankPay._pgOpenPopup.closed) {
							// 닫기버튼
							self.payment.bankPay.end( false );
						} else {
							// 존재 
							// 시간초과 처리 필요 
							sfd.tracker.eventLog({
								    logType: 'etcLog',
								    code: 'testlog_debug_뱅크페이 else 케이스 고객이 있다면? 0451',
								    description: 'testlog_debug'
							});
						}
					} else {
						// 아예 없음 
						// 타임아웃시 팝업창 차단 안내 처리 
						self.payment.bankPay.end( false );
					}
				}, 2000);
			}
				
		}
	}
	self.payment = paymentManager;
	/// @endclass

	var systimeTick
	function setSystime() {
		// 이미 tick이 있는경우 시간만 업데이트
		if (systimeTick) {
			return; 
		}
		systimeTick = setInterval(function() {
			aSeconds();
		}, 1000);

		// 1초 더하기
		function aSeconds() {
			if (!sfd.data.dataObject.systime) {
				return; 
			}
			var systimeStr = sfd.data.dataObject.systime;
			var hh = parseInt(systimeStr.substr(0, 2));
			var mm = parseInt(systimeStr.substr(2, 2));
			var ss = parseInt(systimeStr.substr(4, 2)) + 1;// 1초 +
			// 1분 +
			if (ss == 60 ) {
				ss = 0;
				mm += 1;
			}

			// 1시간 +
			if (mm == 60 ) {
				mm = 0;
				hh += 1;
			}

			// 시간 저장
			sfd.data.dataObject.systime = sfd.utils.padLeft(hh) + sfd.utils.padLeft(mm) + sfd.utils.padLeft(ss);

			// 하루 +
			if (hh == 24 ) {
				changeTomorrow(); 
			}

			// 만기, 은행 카운터를 위한 이벤트 발생
			var _systime = sfd.data.dataObject.systime;
			if (
				[
					'233000', // 은행 정산서비스 시작(23:30:00)
					'000000', // 만기완료당일 타이머 시작(00:00:00)
					'003000' // 은행 정산서비스 종료(00:30:00)
				].indexOf(_systime) >= 0
			) {
				$(window).trigger('sf.time-' + _systime);
			}
			$(window).trigger('sf.time');
		}
	}
	// 다음 날짜로 변경
	function changeTomorrow() {
		sfd.data.dataObject.sysdate = sfd.utils.dateToString(sfd.utils.dateAfterDays(sfd.data.dataObject.sysdate, 1));
		sfd.data.dataObject.systime = '000000';
	}

	return self;
});
