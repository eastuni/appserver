/**
 * change search java script
 * @author Product Factory Team
 * @version $$id: main.js, v 0.1 $$
 */
$(function() {

    setMainTapLeftPosition();
    renderChangeList();     // 메인화면 초기세팅
    renderChangeListGrid();

    if(writeYn != 'Y'){
        $('.write-btn').hide();
    }
});

$('body').css('overflow-y','scroll');

var $el = $('.pf-pc');

var changeListTpl;

var changeListGrid;
var form;

var onEvent = PFUtil.makeEventBinder($el);
var lengthVlad = PFValidation.realTimeLengthCheck($('body'));

lengthVlad('.task-valid-100',100);
PFComponent.toolTip($el);

changeListTpl = getTemplate('changeListTpl');


/**
 * TreeGrid형태를 조립하기위한 관계도 세팅
 */
var PD_PD_M_TABLES = {
	'PD_PD_CG_R' : 'Y',
	'PD_PD_CHNG_H' : 'Y',
	'PD_PD_R' : 'Y',
	'PD_PD_DOC_D' : 'Y',
	'PD_CL_M' : 'Y',
	'PD_PD_STS_H' : 'Y',
	'PD_PD_CUST_R' : 'Y',
	'PD_CG_STS_H' : 'Y',
	'PD_CG_M' : 'Y',
	'PD_PD_BR_R' : 'Y'};

var PD_PD_CND_M_TABLES = {
	'PD_PD_CND_STS_H' : 'Y',
	'PD_PD_LST_CND_D' : 'Y',
	'PD_PD_RNG_CND_D' : 'Y',
	'PD_PD_INT_CND_D' : 'Y',
	'PD_PD_FEE_CND_D' : 'Y',
	'PD_PD_CX_LST_CND_D' : 'Y',
	'PD_PD_CX_RNG_CND_D' : 'Y',
	'PD_PD_CX_INT_CND_D' : 'Y',
	'PD_PD_CX_FEE_CND_D' : 'Y',
	'PD_CX_STRC_M' : 'Y',
	'PD_CX_CMPS_D' : 'Y',
	'PD_CX_TIER_D' : 'Y'
};

var PD_PDT_M = {
	'PD_PDT_STS_H' : 'Y',
	'PD_PDT_CGT_R' : 'Y'
};

var PD_CGT_M = {
	'PD_CGT_CT_R' : 'Y',
	'PD_RNG_CT_D' : 'Y',
	'PD_CGT_CT_CT_R' : 'Y',
	'PD_CGT_CTV_CTV_R' : 'Y',
	'PD_LST_CT_D' : 'Y',
	'PD_RNG_CT_D' : 'Y'
};

var PD_CT_M = {
	'PD_LST_CT_M' : 'Y'
};

/******************************************************************************************************************
 * 이벤트 함수
 ******************************************************************************************************************/

//
onEvent('click', 'a', function(e) { e.preventDefault(); });

// 초기화버튼 클릭시
onEvent('click','.pf-reset-form-btn',function(e) {

	form.reset();
	$('.searchDscd').change();
    $('.start-date').val(PFUtil.addMonths(PFUtil.getToday(),-1));
    $('.end-date').val(PFUtil.getToday());

    //changeListGrid.resetData();
	$('.pf-pc-change-list-grid').empty();
	renderChangeListGrid();

    var $gridFooter =  $('.grid-paging-footer');
    $gridFooter.find('span').text('');
    $gridFooter.find('.grid-page-input').val('1');

});

// 조회버튼 클릭시
onEvent('click', '.change-list-inquiry-btn', function(e) {
	searchChangeData();
});

// 검색구분코드 변경 시
onEvent('change', '.searchDscd', function(e){

	$('.code1').val('');
	$('.name1').val('');
	$('.code2').val('');
	$('.name2').val('');

	if( $('.searchDscd').val() == '07' ||	// 상품관계
		$('.searchDscd').val() == '10' ||	// 서비스관계
		$('.searchDscd').val() == '14'){	// 포인트관계)

		$('.code1').show();
		$('.name1').show();
		$('.code1-select').hide();

		$('.code2').hide();
		$('.name2').hide();
		$('.code2-select').show();
	}
	else if( $('.searchDscd').val() == '08' ||	// 상품조건
			 $('.searchDscd').val() == '11' ||	// 서비스조건
		 	 $('.searchDscd').val() == '15' ||	// 포인트조건
		 	 $('.searchDscd').val() == '28' ){	// 계산규칙

		$('.code1').show();
		$('.name1').show();
		$('.code1-select').hide();

		$('.code2').show();
		$('.name2').show();
		$('.code2-select').hide();
	}
	else if($('.searchDscd').val() == '16' ||	// 분류체계
			$('.searchDscd').val() == '17' ||	// 상품그룹
			$('.searchDscd').val() == '18' || 	// 서비스그룹
			$('.searchDscd').val() == '19'){	// 포인트그룹
		$('.code1').hide();
		$('.name1').hide();
		$('.code1-select').show();

		$('.code2').hide();
		$('.name2').hide();
		$('.code2-select').show();
	}
	else if($('.searchDscd').val() == '20' || 	// 금리체계
			$('.searchDscd').val() == '21' || 	// 수수료할인통합한도
			$('.searchDscd').val() == '22' ){	// 기준금리
		$('.code1').hide();
		$('.name1').hide();
		$('.code1-select').show();

		$('.code2').hide();
		$('.name2').hide();
		$('.code2-select').hide();
	}
	else{
		// code1 input만 활성
		$('.code1').show();
		$('.name1').show();
		$('.code1-select').hide();

		$('.code2').hide();
		$('.name2').hide();
		$('.code2-select').hide();
	}

	switch ($('.searchDscd').val()) {
		case '01':	// 조건템플릿
		case '23':	// 공통조건
			$('.code1').prop('placeholder',bxMsg('cndCd'));	// 조건코드
			break;

		case '02':	// 조건군템플릿
			$('.code1').prop('placeholder',bxMsg('MTM0200String1'));	// 조건군템플릿코드
			break;

		case '03':	// 상품템플릿
			$('.code1').prop('placeholder',bxMsg('pdTmpltCd'));	// 상품템플릿코드
			break;

		case '04':	// 서비스템플릿
			$('.code1').prop('placeholder',bxMsg('ServiceTemplateCode'));	// 서비스템플릿
			break;

		case '05':	// 포인트템플릿
			$('.code1').prop('placeholder',bxMsg('PointTemplateCode'));	// 포인트템플릿코드
			break;

		case '06':	// 상품기본
			$('.code1').prop('placeholder',bxMsg('pdCd'));	// 상품코드
			break;

		case '07':	// 상품관계
			$('.code1').prop('placeholder',bxMsg('pdCd'));	// 상품코드
			renderRelCode('01');
			break;

		case '08':	// 상품조건
			$('.code1').prop('placeholder',bxMsg('pdCd'));	// 상품코드
			$('.code2').prop('placeholder',bxMsg('cndCd'));	// 조건코드
			break;

		case '09':	// 서비스기본
		case '12':	// 서비스제공조건
			$('.code1').prop('placeholder',bxMsg('ServiceCode'));	// 서비스코드
			break;

		case '11':	// 서비스조건
			$('.code1').prop('placeholder',bxMsg('ServiceCode'));	// 서비스코드
			$('.code2').prop('placeholder',bxMsg('cndCd'));			// 조건코드
			break;

		case '10':	// 서비스관계
			$('.code1').prop('placeholder',bxMsg('ServiceCode'));	// 서비스코드
			renderRelCode('02');
			break;

		case '13':	// 포인트기본
			$('.code1').prop('placeholder',bxMsg('PointCode'));		// 포인트코드
			break;

		case '14':	// 포인트관계
			$('.code1').prop('placeholder',bxMsg('PointCode'));		// 포인트코드
			renderRelCode('03');
			break;

		case '15':	// 포인트조건
			$('.code1').prop('placeholder',bxMsg('PointCode'));		// 포인트코드
			$('.code2').prop('placeholder',bxMsg('cndCd'));			// 조건코드
			break;

		case '16':	// 분류체계
			renderClStrctrCode('01', '1');
			break;

		case '17':	// 상품그룹관리
			renderClStrctrCode('01', '2');
			break;

		case '18':	// 서비스그룹관리
			renderClStrctrCode('02', '2');
			break;

		case '19':	// 포인트그룹관리
			renderClStrctrCode('03', '2');
			break;

		case '20':	// 금리체계
			renderIntRtStrctrCode();
			break;

		case '21':	// 수수료할인통합한도
			renderFeeDcIntgLimitCode();
			break;

		case '22':	// 기준금리
			renderComboBox("BaseIntRtKndCode", $('.code1-select'), null, true);
			break;

		case '24': // 계산단위템플릿
			$('.code1').prop('placeholder',bxMsg('calculationUnitTemplate'));	// 계산단위템플릿
			break;

		case '25': // 계산산식
			$('.code1').prop('placeholder',bxMsg('formulaId'));	// 산식ID
			break;

		case '26': // 계산구성요소템플릿
			$('.code1').prop('placeholder',bxMsg('calculationComposeTemplate'));	// 계산구성요소템플릿
			break;

		case '28': // 계산규칙
			$('.code2').prop('placeholder',bxMsg('calculationRuleId'));	// 계산규칙식별자

		case '27': // 계산단위
			$('.code1').prop('placeholder',bxMsg('calculationUnitId'));	// 계산단위식별자
			break;


		default:
			break;
	}

});

onEvent('change', '.code1-select', function(e){

	switch ($('.searchDscd').val()) {
    	case '16':	// 분류체계
    	case '17':	// 상품그룹관리
    		renderClCode('01');
    		break;

		case '18':	// 서비스그룹관리
			renderClCode('02');
			break;

		case '19':	// 포인트그룹관리
			renderClCode('03');
			break;

		default:
			break;
	}
});

// code1 클릭 시
onEvent('click', '.code1', function(e){

	switch ($('.searchDscd').val()) {
	case '01':	// 조건템플릿
	case '23':	// 공통조건
		var submitEvent = function(item){
			if(item){
				$('.code1').val(item.code);
		    	$('.name1').val(item.name);
			}
		};
		PFPopup.selectConditionTemplate({}, submitEvent); //renderConditionTemplateListSearchPopup(submitEvent, 'SINGLE');
		break;

	case '02':	// 조건군템플릿
		var submitEvent = function(item){
			if(item){
				$('.code1').val(item.code);
		    	$('.name1').val(item.name);
			}
		};
		PFPopup.selectConditionGroupTemplate({}, submitEvent);	//renderConditionGroupTemplateListSearchPopup(submitEvent);
		break;

	case '03':	// 상품템플릿
	case '04':	// 서비스템플릿
	case '05':	// 포인트템플릿
		var submitEvent = function(thirdCategorySelect){
			if(thirdCategorySelect){
				$('.code1').val(thirdCategorySelect.code);
		    	$('.name1').val(thirdCategorySelect.name);
			}else{
				// 상품/서비스/포인트 템플릿을 선택해 주세요
				PFComponent.showMessage(bxMsg('Z_ProductTemplateSelect'), 'warning');
				return;
			}

		};
		if($('.searchDscd').val() == '03'){
			PFPopup.selectProductTemplate({pdInfoDscd:'01'}, submitEvent);	//searchPdTemplatePopup(submitEvent, '01');
		}else if($('.searchDscd').val() == '04'){
			PFPopup.selectProductTemplate({pdInfoDscd:'02'}, submitEvent);	//searchPdTemplatePopup(submitEvent, '02');
		}else{
			PFPopup.selectProductTemplate({pdInfoDscd:'03'}, submitEvent);	//searchPdTemplatePopup(submitEvent, '03');
		}
		break;

	case '06':	// 상품기본
	case '07':	// 상품관계
	case '08':	// 상품조건
	case '09':	// 서비스기본
	case '10':	// 서비스관계
	case '11':	// 서비스조건
	case '12':	// 서비스제공조건
	case '13':	// 포인트기본
	case '14':	// 포인트관계
	case '15':	// 포인트조건
		var submitEvent = function(product, firstCategorySelect, secondCategorySelect, thirdCategorySelect){
			if(product){
				$('.code1').val(product.code);
		    	$('.name1').val(product.name);
			}else{
				// 상품을 선택해 주세요.
				PFComponent.showMessage(bxMsg('Z_ProductSelect'), 'warning');
				return;
			}
		};

		// 상품
		if($('.searchDscd').val() == '06' || $('.searchDscd').val() == '07' || $('.searchDscd').val() == '08'){
			//makeSearchProductListPopup(submitEvent, '01');
			PFPopup.selectProduct({pdInfoDscd:'01'}, submitEvent);
		}
		// 서비스
		else if($('.searchDscd').val() == '09' || $('.searchDscd').val() == '10' || $('.searchDscd').val() == '11' || $('.searchDscd').val() == '12'){
			//makeSearchProductListPopup(submitEvent, '02');
			PFPopup.selectProduct({pdInfoDscd:'02'}, submitEvent);
		}
		// 포인트
		else{
			//makeSearchProductListPopup(submitEvent, '03');
			PFPopup.selectProduct({pdInfoDscd:'03'}, submitEvent);
		}
		break;

	case '24':	// 계산단위템플릿
		var submitEvent = function(selected){
			if(selected){
				$('.code1').val(selected.calculationUnitConditionCode);
		    	$('.name1').val(selected.calculationUnitConditionName);
			}else{
				// 사용할 계산단위 템플릿을 선택해주세요
				PFComponent.showMessage(bxMsg('selectCalculationUnitTemplateMessage'), 'warning');
				return;
			}
		};
		PFPopup.selectCalculationUnitTemplate({}, submitEvent);
		break;

	case '25':	// 산식
		var submitEvent = function(selected){
			if(selected){
				$('.code1').val(selected.formulaId);
		    	$('.name1').val(selected.formulaName);
			}else{
				// 산식을 선택하세요.
				PFComponent.showMessage(bxMsg('selectFormulaMessage'), 'warning');
				return;
			}
		};
		PFPopup.selectFormula({}, submitEvent);
		break;

	case '26':	// 계산구성요소템플릿
		var submitEvent = function(selected){
			if(selected){
				$('.code1').val(selected.composeElementConditionCode);
		    	$('.name1').val(selected.composeElementConditionName);
			}else{
				// 계산 구성요소를 선택해주세요
				PFComponent.showMessage(bxMsg('selectComposeElementMessage'), 'warning');
				return;
			}
		};
		PFPopup.selectCalculationComposeTemplate({}, submitEvent);
		break;

	case '27': // 계산단위
	case '28': // 계산규칙
		var submitEvent = function(selected){
			if(selected){
				$('.code1').val(selected.calculationUnitId);
		    	$('.name1').val(selected.calculationUnitConditionName);
			}else{
				// 계산단위를 선택해 주세요.
				PFComponent.showMessage(bxMsg('selectCalculationUnitMessage'), 'warning');
				return;
			}
		};
		PFPopup.selectCalculationUnit({}, submitEvent);
		break;

	default:
		break;
	}

});

// code2 클릭 시
onEvent('click', '.code2', function(e){

	switch ($('.searchDscd').val()) {
	case '08':	// 상품조건
	case '11':	// 서비스조건
	case '15':	// 포인트조건
		var submitEvent = function(item){
			if(item){
				$('.code2').val(item.code);
		    	$('.name2').val(item.name);
			}
		};
		PFPopup.selectConditionTemplate({}, submitEvent); 	//renderConditionTemplateListSearchPopup(submitEvent, 'SINGLE');
		break;

	case '28': // 계산규칙

		var submitEvent = function(item){
			if(item){
				$('.code2').val(item.calculationRuleId);
		    	$('.name2').val(item.formulaName);
			}
		};
		PFPopup.selectCalculationRule({calculationUnitId:$('.code1').val() }, submitEvent);
		break;

	default:
		break;
	}

});

/******************************************************************************************************************
 * 사용자 함수
 ******************************************************************************************************************/

// 메인화면 초기세팅
function renderChangeList() {

    $('.pf-pcge-conts').html(changeListTpl());
    form = PFComponent.makeYGForm($('.change-query-table'));

    renderComboBox('pdInfoChngSearchDscd', $('.searchDscd'));

    PFUtil.getDatePicker();

    // Set default start, end date
    $('.start-date').val(PFUtil.addMonths(PFUtil.getToday(),-1));
    $('.end-date').val(PFUtil.getToday());
}


// 조회
function searchChangeData(){
    var requestData = form.getData({dateFormat:'yyyy-MM-dd'});

    /*
     * 필수입렵체크
     */
    // 상품/서비스/포인트 조건 일때
    if($('.searchDscd').val() == '08' || $('.searchDscd').val() == '11' || $('.searchDscd').val() == '15'){
    	if($('.code2').val() == '' || $('.code2').val() == null){
    		// 조건코드는 필수입니다.
    		PFComponent.showMessage(bxMsg('mandatoryCndCd'), 'warning');
    		return;
    	}
    }

    /*
     * 상품정보구분코드
     */
    // 서비스
    if($('.searchDscd').val() == '04' || $('.searchDscd').val() == '09' || $('.searchDscd').val() == '10' ||
       $('.searchDscd').val() == '11' || $('.searchDscd').val() == '12' || $('.searchDscd').val() == '18'){
    	requestData.pdInfoDscd = '02';
    }
    // 포인트
    else if($('.searchDscd').val() == '05' || $('.searchDscd').val() == '13' || $('.searchDscd').val() == '14' ||
            $('.searchDscd').val() == '15' || $('.searchDscd').val() == '19'){
    	requestData.pdInfoDscd = '03';
    }
    // 상품
    else{
    	requestData.pdInfoDscd = '01';
    }

    /*
     * 콤보값 set
     */
    if( $('.searchDscd').val() == '07' ||	// 상품관계
		$('.searchDscd').val() == '10' ||	// 서비스관계
		$('.searchDscd').val() == '14'){	// 포인트관계

		requestData.code2 = $('.code2-select').val();
	}
    else if( $('.searchDscd').val() == '16' || 		// 분류체계
    		 $('.searchDscd').val() == '17' ||		// 상품그룹
    		 $('.searchDscd').val() == '18' ||		// 서비스그룹
    		 $('.searchDscd').val() == '19' ){		// 포인트그룹
    	requestData.code1 = $('.code1-select').val();
    	requestData.code2 = $('.code2-select').val();
    }
    else if( $('.searchDscd').val() == '20' || 	//금리체계
    		 $('.searchDscd').val() == '21' || 	//수수료할인통합한도
    		 $('.searchDscd').val() == '22'){	//기준금리
    	requestData.code1 = $('.code1-select').val();
    }

    requestData.startDate = !requestData.startDate ? '1900-01-01 00:00:00' : requestData.startDate += ' 00:00:00';
    requestData.endDate = !requestData.endDate ? '9999-12-31 23:59:59' : requestData.endDate += ' 23:59:59';

	PFRequest.get('/project/queryProductInfoChange.json', requestData, {
		bxmHeader: {
	        application: 'PF_Factory',
	        service: 'ProductInfoChangeService',
	        operation: 'queryProductInfoChange',
	      },
		success: function(responseData) {

			var newResultObj = {};
			var resultArr = [];

			responseData.forEach(function (record) {
				var resultObj;

				if(record.changeTargetTable == 'PD_PD_M') {

					resultObj = {
							'gmtCreate' : record.gmtCreate,
							'changeTargetTable' : record.changeTargetTable,
							'changeType' : record.changeType,
							'allTableColumns' : record.allTableColumns,
							'projectId' : record.projectId,
							'projectName' : record.projectName,
							'progressStatus' : record.progressStatus,
							'projectRegStaffName': record.projectRegStaffName,
							'targetTableKey' : record.targetTableKey,
							'txDataContentKeyValue' : record.txDataContentKeyValue,
							'leaf' : false
					};

					// PD_PD_M 일경우 child 조립 대상 테이블
					var childObjArr = [];
				   responseData.forEach(function (record_) {
					   if(record.gmtCreate === record_.gmtCreate && (record_.changeTargetTable == 'PD_PD_CG_R'
							|| record_.changeTargetTable == 'PD_PD_CHNG_H'
							|| record_.changeTargetTable == 'PD_PD_R'
							|| record_.changeTargetTable == 'PD_PD_DOC_D'
							|| record_.changeTargetTable == 'PD_CL_M'
							|| record_.changeTargetTable == 'PD_PD_STS_H'
							|| record_.changeTargetTable == 'PD_PD_CUST_R'
							|| record_.changeTargetTable == 'PD_CG_STS_H'
							|| record_.changeTargetTable == 'PD_CG_M'
							|| record_.changeTargetTable == 'PD_PD_BR_R')) {

							var childObj = {
								'gmtCreate' : record_.gmtCreate,
								'changeTargetTable' : record_.changeTargetTable,
								'changeType' : record_.changeType,
								'allTableColumns' : record_.allTableColumns,
								'projectId' : record_.projectId,
								'projectName' : record_.projectName,
								'progressStatus' : record_.progressStatus,
								'projectRegStaffName': record_.projectRegStaffName,
								'targetTableKey' : record_.targetTableKey,
								'txDataContentKeyValue' : record_.txDataContentKeyValue,
								'leaf' : true
							};

							childObjArr.push(childObj);
						   }
				   });
				   resultObj.children = childObjArr;

				}
				else if(record.changeTargetTable == 'PD_PD_CND_M') {
					  resultObj = {
							'gmtCreate' : record.gmtCreate,
							'changeTargetTable' : record.changeTargetTable,
							'changeType' : record.changeType,
							'allTableColumns' : record.allTableColumns,
							'projectId' : record.projectId,
							'projectName' : record.projectName,
							'progressStatus' : record.progressStatus,
							'projectRegStaffName': record.projectRegStaffName,
							'targetTableKey' : record.targetTableKey,
							'txDataContentKeyValue' : record.txDataContentKeyValue,
							'leaf' : false
					};

					// PD_PD_CND_M 일경우 child 조립 대상 테이블
					var childObjArr = [];
				   responseData.forEach(function (record_) {
					   if(record.gmtCreate === record_.gmtCreate && (record_.changeTargetTable == 'PD_PD_CND_STS_H'
							|| record_.changeTargetTable == 'PD_PD_LST_CND_D'
							|| record_.changeTargetTable == 'PD_PD_RNG_CND_D'
							|| record_.changeTargetTable == 'PD_PD_INT_CND_D'
							|| record_.changeTargetTable == 'PD_PD_FEE_CND_D'
							|| record_.changeTargetTable == 'PD_PD_CX_LST_CND_D'
							|| record_.changeTargetTable == 'PD_PD_CX_RNG_CND_D'
							|| record_.changeTargetTable == 'PD_PD_CX_INT_CND_D'
							|| record_.changeTargetTable == 'PD_PD_CX_FEE_CND_D'

								// TODO 그룹핑 - 복합구조영역 재검토 필요.
//										|| record_.changeTargetTable == 'PD_CX_STRC_M'
//										|| record_.changeTargetTable == 'PD_CX_CMPS_D'
//										|| record_.changeTargetTable == 'PD_CX_TIER_D'
					   )) {

						   var isAllKeyYn = true;
						   record.targetTableKey.forEach(function(key) {
							  record.txDataContentKeyValue.forEach(function(value) {

								 if(value.key == key) {
									 record_.txDataContentKeyValue.forEach(function(value_) {
										if(value_.key == value.key && value_.value != value.value) {
											isAllKeyYn = false;
											return false;
										}
									 });
								 }
							  });
						   });

						   if(isAllKeyYn) {
							   var childObj = {
								'gmtCreate' : record_.gmtCreate,
								'changeTargetTable' : record_.changeTargetTable,
								'changeType' : record_.changeType,
								'allTableColumns' : record_.allTableColumns,
								'projectId' : record_.projectId,
								'projectName' : record_.projectName,
								'progressStatus' : record_.progressStatus,
								'projectRegStaffName': record_.projectRegStaffName,
								'targetTableKey' : record_.targetTableKey,
								'txDataContentKeyValue' : record_.txDataContentKeyValue,
								'leaf' : true
							   };

							   childObjArr.push(childObj);
						   }
						   }
				   });
				   resultObj.children = childObjArr;
				}
				else if(record.changeTargetTable == 'PD_PDT_M') {
					  resultObj = {
							'gmtCreate' : record.gmtCreate,
							'changeTargetTable' : record.changeTargetTable,
							'changeType' : record.changeType,
							'allTableColumns' : record.allTableColumns,
							'projectId' : record.projectId,
							'projectName' : record.projectName,
							'progressStatus' : record.progressStatus,
							'projectRegStaffName': record.projectRegStaffName,
							'targetTableKey' : record.targetTableKey,
							'txDataContentKeyValue' : record.txDataContentKeyValue,
							'leaf' : false
					};

					// PD_PDT_M 일경우 child 조립 대상 테이블
					var childObjArr = [];
				   responseData.forEach(function (record_) {
					   if(record.gmtCreate === record_.gmtCreate && (record_.changeTargetTable == 'PD_PDT_STS_H'
						   || record_.changeTargetTable == 'PD_PDT_CGT_R')) {

						   var isAllKeyYn = true;
						   record.targetTableKey.forEach(function(key) {
							  record.txDataContentKeyValue.forEach(function(value) {

								 if(value.key == key) {
									 record_.txDataContentKeyValue.forEach(function(value_) {
										if(value_.key == value.key && value_.value != value.value) {
											isAllKeyYn = false;
											return false;
										}
									 });
								 }
							  });
						   });

						   if(isAllKeyYn) {
							   var childObj = {
								'gmtCreate' : record_.gmtCreate,
								'changeTargetTable' : record_.changeTargetTable,
								'changeType' : record_.changeType,
								'allTableColumns' : record_.allTableColumns,
								'projectId' : record_.projectId,
								'projectName' : record_.projectName,
								'progressStatus' : record_.progressStatus,
								'projectRegStaffName': record_.projectRegStaffName,
								'targetTableKey' : record_.targetTableKey,
								'txDataContentKeyValue' : record_.txDataContentKeyValue,
								'leaf' : true
							   };

							   childObjArr.push(childObj);
						   }
						   }
				   });
				   resultObj.children = childObjArr;
				}
				else if(record.changeTargetTable == 'PD_CGT_M') {
					resultObj = {
							'gmtCreate' : record.gmtCreate,
							'changeTargetTable' : record.changeTargetTable,
							'changeType' : record.changeType,
							'allTableColumns' : record.allTableColumns,
							'projectId' : record.projectId,
							'projectName' : record.projectName,
							'progressStatus' : record.progressStatus,
							'projectRegStaffName': record.projectRegStaffName,
							'targetTableKey' : record.targetTableKey,
							'txDataContentKeyValue' : record.txDataContentKeyValue,
							'leaf' : false
					};

					// PD_CGT_M 일경우 child 조립 대상 테이블
					var childObjArr = [];
					responseData.forEach(function (record_) {
						if(record.gmtCreate === record_.gmtCreate && (record_.changeTargetTable == 'PD_CGT_CT_R'
							|| record_.changeTargetTable == 'PD_RNG_CT_D'
							|| record_.changeTargetTable == 'PD_CGT_CT_CT_R'
							|| record_.changeTargetTable == 'PD_CGT_CTV_CTV_R'
							|| record_.changeTargetTable == 'PD_LST_CT_D'
							|| record_.changeTargetTable == 'PD_PDT_CGT_R')) {

							var isAllKeyYn = true;
							record.targetTableKey.forEach(function(key) {
								record.txDataContentKeyValue.forEach(function(value) {

									if(value.key == key) {
										record_.txDataContentKeyValue.forEach(function(value_) {
											if(value_.key == value.key && value_.value != value.value) {
												isAllKeyYn = false;
												return false;
											}
										});
									}
								});
							});

							if(isAllKeyYn) {
								var childObj = {
										'gmtCreate' : record_.gmtCreate,
										'changeTargetTable' : record_.changeTargetTable,
										'changeType' : record_.changeType,
										'allTableColumns' : record_.allTableColumns,
										'projectId' : record_.projectId,
										'projectName' : record_.projectName,
										'progressStatus' : record_.progressStatus,
										'projectRegStaffName': record_.projectRegStaffName,
										'targetTableKey' : record_.targetTableKey,
										'txDataContentKeyValue' : record_.txDataContentKeyValue,
										'leaf' : true
								};

								childObjArr.push(childObj);
							}
						}
					});
					resultObj.children = childObjArr;
				}
				else if(record.changeTargetTable == 'PD_CT_M') {
					resultObj = {
							'gmtCreate' : record.gmtCreate,
							'changeTargetTable' : record.changeTargetTable,
							'changeType' : record.changeType,
							'allTableColumns' : record.allTableColumns,
							'projectId' : record.projectId,
							'projectName' : record.projectName,
							'progressStatus' : record.progressStatus,
							'projectRegStaffName': record.projectRegStaffName,
							'targetTableKey' : record.targetTableKey,
							'txDataContentKeyValue' : record.txDataContentKeyValue,
							'leaf' : false
					};

					// PD_CT_M 일경우 child 조립 대상 테이블
					var childObjArr = [];
					responseData.forEach(function (record_) {
						if(record.gmtCreate === record_.gmtCreate && (record_.changeTargetTable == 'PD_LST_CT_M')) {

							var isAllKeyYn = true;
							record.targetTableKey.forEach(function(key) {
								record.txDataContentKeyValue.forEach(function(value) {

									if(value.key == key) {
										record_.txDataContentKeyValue.forEach(function(value_) {
											if(value_.key == value.key && value_.value != value.value) {
												isAllKeyYn = false;
												return false;
											}
										});
									}
								});
							});

							if(isAllKeyYn) {
								var childObj = {
										'gmtCreate' : record_.gmtCreate,
										'changeTargetTable' : record_.changeTargetTable,
										'changeType' : record_.changeType,
										'allTableColumns' : record_.allTableColumns,
										'projectId' : record_.projectId,
										'projectName' : record_.projectName,
										'progressStatus' : record_.progressStatus,
										'projectRegStaffName': record_.projectRegStaffName,
										'targetTableKey' : record_.targetTableKey,
										'txDataContentKeyValue' : record_.txDataContentKeyValue,
										'leaf' : true
								};

								childObjArr.push(childObj);
							}
						}
					});
					resultObj.children = childObjArr;
				}
				else {
					if(PD_PD_M_TABLES[record.changeTargetTable] == undefined
							&& PD_PD_CND_M_TABLES[record.changeTargetTable] == undefined
							&& PD_CGT_M[record.changeTargetTable] == undefined
							&& PD_CT_M[record.changeTargetTable] == undefined
							&& PD_PDT_M[record.changeTargetTable] == undefined ) {

						   resultObj = {
								'gmtCreate' : record.gmtCreate,
								'changeTargetTable' : record.changeTargetTable,
								'changeType' : record.changeType,
								'allTableColumns' : record.allTableColumns,
								'projectId' : record.projectId,
								'projectName' : record.projectName,
								'progressStatus' : record.progressStatus,
								'projectRegStaffName': record.projectRegStaffName,
								'targetTableKey' : record.targetTableKey,
								'txDataContentKeyValue' : record.txDataContentKeyValue,
								'leaf' : true
						};
					}
				}

				if(resultObj != undefined) resultArr.push(resultObj);
			});
			$('.pf-pc-change-list-grid').empty();
			renderChangeListGrid(resultArr);
			//changeListGrid.setData(resultArr);
		}
	});

    //loadGridData(changeListGrid,requestData);
}

// 그리드데이터 Load
// function loadGridData(grid, data) {
//     var option = {
//         'isReset' : true,
//         bxmHeader: {
//             application: 'PF_Factory',
//             service: 'ProductInfoChangeService',
//             operation: 'queryProductInfoChange'
//         }
//     };

//     grid.loadData(data,option);
// }

// 상품관계 콤보 바인딩
function renderRelCode(pdInfoDscd){

	var requestParam = {
		pdInfoDscd: pdInfoDscd
	};

	PFRequest.get('/common/relation/getListPdRelationConfiguration.json', requestParam,{
        async: false,
        success: function(response) {
            var options = [];
            $.each(response, function(index, el){

            	if(el.useYn == 'Y'){
            		var $option = $('<option>');
                    $option.val(el.relTpCd);
                    $option.text(el.relTpNm);

                    options.push($option);
            	}
            });

            $('.code2-select').html(options);
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'PdRelationConfigurationService',
            operation: 'getListPdRelationConfiguration'
        }
    });
}

// 분류체계 콤보 바인딩
function renderClStrctrCode(pdInfoDscd, classificationStructureTypeCode){

	var requestParam = {
		pdInfoDscd: pdInfoDscd,
		classificationStructureTypeCode : classificationStructureTypeCode
	};

	PFRequest.get('/classification/getListClassificationMaster.json', requestParam,{
        async: false,
        success: function(response) {
            var options = [];
            $.each(response, function(index, el){
        		var $option = $('<option>');
                $option.val(el.classificationStructureDistinctionCode);
                $option.text(el.classificationStructureName);

                options.push($option);
            });

            $('.code1-select').html(options);
            renderClCode(pdInfoDscd);
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'ClassificationMasterService',
            operation: 'queryListClassificationMaster'
        }
    });
}

// 분류 콤보 바인딩
function renderClCode(pdInfoDscd){

	var clStrctuDscd = $('.code1-select').val();
	var requestParam = {
		pdInfoDscd: pdInfoDscd,
		classificationStructureDistinctionCode : clStrctuDscd
	};

	PFRequest.get('/classification/getListClassificationDetail.json', requestParam,{
        async: false,
        success: function(response) {
            var options = [];

            var $defaultOption = $('<option>');

            $defaultOption.val('');
            $defaultOption.text('');

            options.push($defaultOption);

            $.each(response, function(index, el){
        		var $option = $('<option>');
                $option.val(el.classificationCode);
                $option.text(el.classificationName);

                options.push($option);
            });

            $('.code2-select').html(options);
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'ClassificationDetailService',
            operation: 'queryListClassificationDetail'
        }
    });
}

// 금리체계 콤보 바인딩
function renderIntRtStrctrCode(){

	var requestParam = {};

	PFRequest.get('/interestRateStructure/getListInterestRateStructureMaster.json', requestParam,{
        async: false,
        success: function(response) {
            var options = [];
            $.each(response, function(index, el){
        		var $option = $('<option>');
                $option.val(el.intRtStructureCode);
                $option.text(el.intRtStructureName);

                options.push($option);
            });

            $('.code1-select').html(options);
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'InterestRateStructureService',
            operation: 'getListInterestRateStructureMaster'
        }
    });
}

// 수수료통합한도
function renderFeeDcIntgLimitCode(){
	var requestParam = {};

	PFRequest.get('/feeIntegration/getListFeeDiscountIntegrationLimitMaster.json', requestParam,{
        async: false,
        success: function(response) {
            var options = [];
            $.each(response, function(index, el){
        		var $option = $('<option>');
                $option.val(el.feeDiscountIntegrationLimitCd);
                $option.text(el.feeDiscountIntegrationLimitName);

                options.push($option);
            });

            $('.code1-select').html(options);
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'FeeDiscountIntegraionLimitService',
            operation: 'queryListFeeDiscountIntegrationLimit'
        }
    });
}


/******************************************************************************************************************
 * BIZ 함수(서비스 호출)
 ******************************************************************************************************************/

// 그리드 조회
function renderChangeListGrid(data) {

	Ext.define('Car', {
		extend: 'Ext.data.Model',
        fields: [
            "sequenceNumber","changeType","changeTargetTable","targetTableKey", "allTableColumns",
            "txDataContentKeyValue", "gmtCreate",
            "projectId", "projectName", "progressStatus", "projectRegStaffName"
        ],
		proxy: {
			type: 'memory',
			data: {
				success: true,
				children : data
			}
		}
	});

	var store = Ext.create('Ext.data.TreeStore', {
		model: 'Car'
	});




	Ext.create('Ext.tree.Panel', {
		height: '340px',
		store: store,
		rootVisible: false,
		lines: true,
		useArrows: true,
		renderTo: $('.pf-pc-change-list-grid')[0],
        columns: [
			{xtype: 'treecolumn', text: bxMsg('DAS0101String8'), width:  150  , dataIndex: 'gmtCreate'},
			{text: bxMsg('PAS0501String11'), flex: 1, dataIndex: 'changeTargetTable',
				renderer: function(value) {
					return bxMsg(value.toLowerCase()) || value;
				}
			},
			{text: bxMsg('changeDistinction'), width: 70  , dataIndex: 'changeType',
				renderer: function(value, p, record) {
					var result = '';
					// 등록
					if(value == 'C') {
						result = bxMsg('registration');
					}
					// 수정
					else if(value == 'U') {
						result = bxMsg('modify');
					}
					// 삭제
					else {
						result = bxMsg('Z_Del');
					}
					return result;
				}
			},
			{text: bxMsg('DAS0101String22'), width: 70  , dataIndex: 'projectId'},
			{text: bxMsg('DAS0101String23'), flex:  1  , dataIndex: 'projectName'},
			{text: bxMsg('PAS0201String5'), width: 100  , dataIndex: 'progressStatus',
				renderer: function(value) {
					return codeMapObj.ProgressStatusCode[value] || value;
				}
			},
			{text: bxMsg('DAS0101String9'), width: 100  , dataIndex: 'projectRegStaffName'}
		],
		listeners: {
			scope: this,
			celldblclick:function(_this, _td, _cellIndex, _record, _tr, _rowIndex, _e, _eOpts ) {
				if(_record.data.txDataContentKeyValue && _record.data.txDataContentKeyValue.length > 0 ){
					renderPdInfoChangeDetail(_record.data);
					return false;
				}
			},
			afterrender : function(){
				//searchChangeData();       // 조회
			}
		}
    });
}