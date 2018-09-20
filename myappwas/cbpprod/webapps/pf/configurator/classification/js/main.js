/**
 * classification java script
 * @author Product Factory Team
 * @version $$id: main.js, v 0.1 $$
 */
$(function() {
    $('body').css('overflow-y', 'scroll');
    lengthVlad('.length-check-input', 50);
    PFComponent.toolTip($el);

    var hash = parent.$('.pf-hidden .hash').text();
    if(hash) {
        location.hash = hash;
        parent.$('.pf-hidden .hash').text('');
    }

    // Start Rendering Page
    renderClassficationTreeBox();                       // 상품분류 Tree Box

});

var pageType_Classification = '1';
var pageType_ProductGroupPage = '2';
// OHS 2017.02.23 추가 - Service Group 추가
var pageType_ServiceGroupPage = '3';

var productClassificationCode;
var isComplexGridRend = false;

var modifyFlag = false;
var selectedCellIndex;

var $el = $('.pf-cl');          // Page Root jQuery Element

var classificationLeftTreeTpl,                       // 트리
    classificationDetailInfoTpl,
    classificationStructureBaseManagementPopupTpl,  // 분류체계기본 관리
    classificationManagementPopupTpl,               // 하위 분류체계 관리
    classificationInfoFormTpl,                      // 상품관계관리
    relProductAddPopupTpl,                          // 상품목록 검색
    cndInfoTpl,                                     // 조건정보 그리드 영역
    applyRuleTpl,                                   // 적용규칙
    cnd4FeeConditionValueType4TblByComplex;

var navTree, navTreeStore,
    relatedPdGrid,
    conditionInfoGrid,
    cndValueType1Grid;

var selectedCondition,
    YforNewColumn,
    stepCndCd,
    isNewData;

var classForEvent;

var pdInfoDscd_Product = '01',
    pdInfoDscd_Service = '02',
    pdInfoDscd_Point   = '03';

var pdInfoDscd = (pageType == '3' ? pdInfoDscd_Service : pdInfoDscd_Product);  // 초기값 = 상품

var classificationTokens; // OHS 20180502 - 타 영역의 적용규칙 삭제처럼 단위로 삭제하기 위함

/**
 * OHS 2017.02.23 추가 - 기존 pageType 값을 classificationStructureTypeCode 에 세팅하여 처리하였으나
 * 상품그룹과 서비스그룹을 분리하면서 pageType 값또한 분리하여 아래와같이 변수선언하여 처리하도록 변경
 * 현재 값을 상품과 서비스가 같으므로 아래와같이 변환처리해줌.
 */
var G_classificationStructureTypeCode = (pageType == '3' ? pageType_ProductGroupPage : pageType);

var loginTntInstId, tntInstId, mother;

var clickEventForNewData = {};

var productRelgridDeleteData = [],
    conditionInfogridDeleteDate  =[];

var onEvent = PFUtil.makeEventBinder($el);

var lengthVlad = PFValidation.realTimeLengthCheck($el);

var operatorSet = new Set();
operatorSet.add('min');
operatorSet.add('max');
operatorSet.add('avg');
operatorSet.add('sum');
operatorSet.add('and');
operatorSet.add('or');
operatorSet.add('not');
operatorSet.add('priority');
operatorSet.add('match');

// Load Template in HTML
classificationLeftTreeTpl = getTemplate('classificationLeftTreeTpl');
classificationDetailInfoTpl = getTemplate('classificationDetailInfoTpl');
classificationStructureBaseManagementPopupTpl = getTemplate('classificationStructureBaseManagementPopupTpl');
classificationManagementPopupTpl = getTemplate('classificationManagementPopupTpl');
classificationInfoFormTpl = getTemplate('classificationInfoFormTpl');
relProductAddPopupTpl = getTemplate('relProductAddPopupTpl');

// OHS 2017.02.23 추가 - Service Group 추가
if(pageType === pageType_ServiceGroupPage){
    applyRuleTpl = getTemplate('applyRuleTpl');
    operatorSet.delete('and');
    operatorSet.delete('or');
    operatorSet.delete('match');

}
if(pageType === pageType_ProductGroupPage || pageType === pageType_ServiceGroupPage){
    productConditionHistoryPopupTpl = getTemplate('productConditionHistoryPopupTpl');
    cndInfoTpl = getTemplate('cndInfoTpl');
    cnd4FeeConditionValueType4TblByComplex = getTemplate('cnd4FeeConditionValueType4TblByComplex');
}



/******************************************************************************************************************
 * 이벤트 함수
 ******************************************************************************************************************/

onEvent('click', 'a', function (e) {
    e.preventDefault();
});

onEvent('click', '.refresh-icon', function(e) {
    renderClassificationNavTree.isRendered = false;
    renderClassificationNavTree();
    $('.pf-detail-wrap').removeClass('active');
});

onEvent('click', '.sidebar-toggler', function (e) {
    var $target = $(e.currentTarget);

    $el.toggleClass('contents-expand');

    if($el.hasClass('contents-expand')) {
        $target.text('>');
    }else {
        $target.text('<');
    }

    setTimeout(function () {
        $('.manual-resize-component:visible').resize();
    }, 600);
});

onEvent('change', '.pf-multi-entity', function(e){

    tntInstId = $el.find('.pf-multi-entity').val();     // 기관콤보 change 시 tntInstId 변경

    $('.tab-nav-list').empty();
    $('.tab-content').empty();

    if($(e.currentTarget).val() != $('.login-tntInst-id').text()) {
        $($('.default-layout-task-menu').find('.your-task')[0]).attr('data-status', 'true');
        $($('.default-layout-task-menu').find('.your-task')[0]).removeClass('task-hide');
        $($('.default-layout-task-menu').find('.your-task')[0]).val('');
        $($('.default-layout-task-menu').find('.my-task-list')[0]).addClass('task-hide');
    }else{
        $($('.default-layout-task-menu', parent.document).find('.your-task')[0]).removeAttr('data-status');
        $($('.default-layout-task-menu', parent.document).find('.your-task')[0]).addClass('task-hide');
        $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).removeClass('task-hide');
        $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).find('option').eq(0).prop('selected',true);
    }

    renderClassificationNavTree.isRendered = false;
    renderClassificationInfo();
    $el.find('.pf-cl-info-wrap').removeClass('active');
});

// 상품정보구분 콤보 변경 시
onEvent('change', '.pd-info-dscd', function(e) {
    pdInfoDscd = $('.pd-info-dscd').val();
    renderClassificationNavTree.isRendered = false;
    renderClassificationInfo();
});

// add button click event
onEvent('click', '.add-rel-product-btn', function() {
    var submitEvent = function(data) {
        clickEventForNewData.pdInformationCode = data.code;
        clickEventForNewData.pdInformationName = data.name;
        setNewGridData(clickEventForNewData,relatedPdGrid);

    }

    if(pdInfoDscd == pdInfoDscd_Product){
        PFPopup.selectProduct({}, submitEvent);
    }else if(pdInfoDscd == pdInfoDscd_Service){
        PFPopup.selectService({}, submitEvent);
    }else if(pdInfoDscd == pdInfoDscd_Point){
        PFPopup.selectProduct({ pdInfoDscd: '03' }, submitEvent);
    }

});
onEvent('click', '.add-cnd-tmplt-btn', function() { //조건정보 추가
    PFPopup.selectConditionTemplate({
      targetCondition: ['01', '02'],
      multi: false,
    }, (data) => {
    	data = data ? [data] : [];
        $.each(data,function(index, row){

            var gridData = conditionInfoGrid.getAllData();
            for(var i = 0; i < gridData.length ;i++){
                if(gridData[i].cndCode === row.code){
                    PFComponent.showMessage(bxMsg('AlreadySavedCondition'), 'warning');
                    return;
                }
            }

            var applyStartDate = PFUtil.getNextDate() + ' ' + '00:00:00';
            var applyEndDate = '9999-12-31 23:59:59';

            clickEventForNewData.applyStart = applyStartDate;
            clickEventForNewData.applyEnd = applyEndDate;
            clickEventForNewData.conditionClassifyCode = '01'; //새로 그리드에 추가된 데이터라면 일반조건으로
            clickEventForNewData.status = '01';
            clickEventForNewData.statusNm = codeMapObj['ProductStatusCode']['01'];
            clickEventForNewData.activeYn = 'N';
            clickEventForNewData.process = 'C';
            clickEventForNewData.cndCode = row.code;
            clickEventForNewData.cndName = row.name;
            clickEventForNewData.conditionTypeCode = row.type;
            clickEventForNewData.conditionDetailTypeCode = row.currentCatalogId;
            clickEventForNewData.minValue = 0;
            clickEventForNewData.maxValue = 0;


            isNewData = true;

            //목록
            if (clickEventForNewData.conditionTypeCode == '01') {

            }
            //범위
            else if (clickEventForNewData.conditionTypeCode == '02') {

            }

            if (clickEventForNewData.conditionTypeCode === '01') {

                clickEventForNewData.conditionTypeCodeNm = codeArrayObj['ProductConditionTypeCode'][0].name;
                var requestParam = {};

                requestParam.tntInstId = tntInstId;
                requestParam.conditionCode = clickEventForNewData.cndCode;

                PFRequest.get('/condition/template/getConditionTemplate.json', requestParam, {
                    success: function (responseData) {

                        var detailList = [];
                        var selectedList;

                        if (!clickEventForNewData.listConditionValue) {
                            selectedList = [];
                            clickEventForNewData.listConditionValue = {};
                        } else {
                            selectedList = clickEventForNewData.listConditionValue.defineValues;
                        }

                        for (var i = 0; i < responseData.values.length; i++) {

                            var data = {};
                            data.code = responseData.values[i].key;
                            data.name = responseData.values[i].value;

                            if(clickEventForNewData.conditionClassifyCode !== '02') {
                                for (var j = 0; j < selectedList.length; j++) {
                                    if (selectedList[j].isSelected && data.code === selectedList[j].code) {
                                        data.isSelected = true;
                                        if (selectedList[j].isDefaultValue) {
                                            data.isDefaultValue = true;
                                        }
                                    }
                                }
                            }
                            detailList.push(data);
                        }

                        clickEventForNewData.listConditionValue.defineValues = detailList;
                        selectedCondition = clickEventForNewData;
                        cndValueType1Grid = null;

                        makeConditionValueManagementPopup(selectedCondition, conditionInfoGrid.store.data.length, true);

                    },
                    bxmHeader: {
                        application: 'PF_Factory',
                        service: 'CndTemplateService',
                        operation: 'queryCndTemplate'
                    }
                });

            } else {
                clickEventForNewData.conditionTypeCodeNm = codeArrayObj['ProductConditionTypeCode'][1].name;
                clickEventForNewData.rangeConditionValue = {};
                clickEventForNewData.rangeConditionValue.isSystemMaxValue == false;
                selectedCondition = clickEventForNewData;
                makeConditionValueManagementPopup(selectedCondition, null, true);
            }
        });
    });
});

onEvent('click', '.product-save-btn', function() {
    saveClassificationRelation();
    var emptyObj;
    conditionInfoGrid = emptyObj;
});

onEvent('contextmenu','.pf-panel-body', function(e){

    var target = e.target.className;

    if(target != 'pf-panel-body') return;

    if(loginTntInstId != tntInstId) return; // 선택한 기관이 로그인한 기관코드와 다른 경우 분류체계 신규 context menu를 보여주지 않음

    // 분류체계 신규 context menu
    PFUI.use(['pfui/menu'], function (Menu) {

        // 분류체계신규 이벤트
        var createClassificationStructureEvent = function () {
            if(!isHaveProject()){
                haveNotTask();
                return;
            }

            var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
            if(isNotMyTask(projectId)){
                return;
            };

            if($($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val() === ''){
                selectNotTask();
                selectedYourTask();
                return;
            }

            if( $($('.default-layout-task-menu', parent.document).find('.your-task')[0]).attr('data-status')=='true'){
                selectedYourTask();
                return;
            }

            var data = {
                work: "CREATE",
                applyStartDate : PFUtil.getNextDate() + ' 00:00:00',
                applyEndDate : '9999-12-31 23:59:59'
            };
            renderClassificationStructureBasePopup(data);
        }

        if(writeYn != 'Y'){
            return;
        }

        // 분류체계 신규 context menu
        var classificationStructureNewContextMenu = new Menu.ContextMenu({
            children: [
                makeContextMenu('icon-folder-close', bxMsg('CreateClassificationStructure'), createClassificationStructureEvent)     // 분류체계 신규
            ]
        });

        // 상품그룹 신규 context menu
        var productGroupNewContextMenu = new Menu.ContextMenu({
            children: [
                makeContextMenu('icon-folder-close', bxMsg('CreateProductGroup'), createClassificationStructureEvent)     // 분류체계 신규
            ]
        });

        // 서비스그룹 신규 context menu
        var serviceGroupNewContextMenu = new Menu.ContextMenu({
            children: [
               makeContextMenu('icon-folder-close', bxMsg('CreateServiceGroup'), createClassificationStructureEvent)     // 서비스그룹 신규
           ]
       });

        var x = e.pageX;
        var y = e.pageY >= 500 ? e.pageY - (28 * 4) : e.pageY;

        if(pageType === pageType_Classification){
            classificationStructureNewContextMenu.set('xy', [x, y]);
            classificationStructureNewContextMenu.show();
        }
        else if(pageType === pageType_ProductGroupPage) {
            productGroupNewContextMenu.set('xy', [x, y]);
            productGroupNewContextMenu.show();
        }
        // OHS 2017.02.23 추가 - 서비스그룹 추가
        else if(pageType === pageType_ServiceGroupPage) {
        	serviceGroupNewContextMenu.set('xy', [x, y]);
        	serviceGroupNewContextMenu.show();
        }
    });

    return false;
});

onEvent('click', '.class-str-save-btn', function(e){
    saveClassificationStructure('UPDATE');
});

onEvent('click', '.class-str-delete-btn', function(e){
	// OHS20180323 수정 - confirm 메소드 내부에서 처리하도록 함.
	deleteClassificationStructure($('.classificationStructureDistinctionCode').val(), $('.start-date').val(), bxMsg('DPE00001_Delete_Confirm'));
});

onEvent('click', '.class-save-btn', function(e){
    saveClassification('UPDATE');
});

onEvent('click', '.class-delete-btn', function(e){
    PFComponent.showConfirm(bxMsg('DPE00001_Delete_Confirm'), function() {
        deleteClassification($('.classificationStructureDistinctionCode').val(), $('.classificationCode').val(), $('.start-date').val());
    }, function() {
        return;
    });
});

// 상품그룹에서 상품그룹조건 확장버튼
onEvent('click', '.pf-cl-condition-expend-view-btn', function(e) {

    var $button = $('.pf-cl-condition-info-tpl .pf-cl-condition-expend-view-btn');
    $button.toggleClass('cnd-info-expand');

    if($button.hasClass('cnd-info-expand')){
        //$(e.currentTarget).text('▲');
        $(e.currentTarget).html('<i class="bw-icon i-25 i-close3"></i>');

        $('.pf-cl-condition-info-tpl .pf-panel-body').show();
        PFUtil.getAllDatePicker(true, $('.pf-cl-condition-info-tpl .pf-panel-body'));

        if (!conditionInfoGrid) {
            searchClassificationConditionList();
        }

    }else{
        //$(e.currentTarget).text('▼');
        $(e.currentTarget).html('<i class="bw-icon i-25 i-open3"></i>');
        $('.pf-cl-condition-info-tpl .pf-panel-body').hide();
    }

});

// 상품그룹에서 적용규칙 확장버튼
onEvent('click', '.pf-cl-apply-rule-expend-view-btn', function(e) {

    var $button = $('.pf-cl-apply-rule-tpl .pf-cl-apply-rule-expend-view-btn');
    $button.toggleClass('apply-rule-expand');

    if($button.hasClass('apply-rule-expand')){

        $(e.currentTarget).html('<i class="bw-icon i-25 i-close3"></i>');

        $('.pf-cl-apply-rule-tpl .pf-panel-body').show();
        PFUtil.getDatePicker(true, $('.pf-cl-apply-rule-wrap'));
        $('.pf-cl-apply-rule-tpl .start-date').val(PFUtil.getToday() + ' 00:00:00');
        $('.pf-cl-apply-rule-tpl .end-date').val('9999-12-31 23:59:59');

        renderComboBox('ProductStatusCode', $('.pf-cl-apply-rule-tpl .status'), '01');

        searchApplyRule();

    }else{
        $(e.currentTarget).html('<i class="bw-icon i-25 i-open3"></i>');
        $('.pf-cl-apply-rule-tpl .pf-panel-body').hide();
    }

});

onEvent("click", ".text-input-btn", function(e){
    var cntnt = $(".pf-cl-apply-rule-tpl .apply-rule").val() + $(e.currentTarget).val();
    $(".pf-cl-apply-rule-tpl .apply-rule").val(cntnt);

    setTokens($(e.currentTarget).val()); // OHS20180503 추가 - 계산모듈처럼 적용
    
    var ruleContent = $(e.currentTarget).parent().parent().parent().find('.apply-rule').val();
    var count = 0;

    for(var i = 0 ; i < ruleContent.length ; i++){
        if (ruleContent.charAt(i) === '('){
            count++;
        }else if(ruleContent.charAt(i) === ')'){
            count--;
        }
    }

    if(count !== 0){
        $('.applyRuleSyntaxError').show();
        return;
    }

    if(ruleVerifier(ruleContent)){
        $('.applyRuleSyntaxError').hide();
    }else{
        $('.applyRuleSyntaxError').show();
    }
 });

onEvent("click", ".back-space-btn", function(e){
	
	// OHS 20180502 - 계산영역처럼 단위로 지움
	// 수기입력하였을때는 기존처럼 slice를 이용하여 지움
	var result = "";
    var delimiter = "";
    if(classificationTokens && classificationTokens.length > 0) {
    	$.each(classificationTokens, function(index, token) {
    		if (token.type === TokenType.ARITHMETIC)
    			result += delimiter;
    			result += token.value;

    		if (token.type === TokenType.ARITHMETIC || token.type === TokenType.COMMA)
    			result += delimiter;
    	});
    }
    
 	if(classificationTokens && classificationTokens.length > 0 && result.replace(/ /gi, '') == $(".pf-cl-apply-rule-tpl .apply-rule").val().replace(/ /gi, '')) {
 		classificationTokens.pop();
        $(".pf-cl-apply-rule-tpl .apply-rule").val(PFFormulaEditor.toContent(classificationTokens, " "));
	}
	else {
		var cntnt = $(".pf-cl-apply-rule-tpl .apply-rule").val().slice(0, -1);
		$(".pf-cl-apply-rule-tpl .apply-rule").val(cntnt);
	}

    var ruleContent = $(e.currentTarget).parent().parent().parent().find('.apply-rule').val();
    var count = 0;

    for(var i = 0 ; i < ruleContent.length ; i++){
        if (ruleContent.charAt(i) === '('){
            count++;
        }else if(ruleContent.charAt(i) === ')'){
            count--;
        }
    }

    if(count !== 0){
        $('.applyRuleSyntaxError').show();
        return;
    }

    if(ruleContent == '') {
    	classificationTokens = PFFormulaEditor.tokenize(''); // 초기화
    	$(e.currentTarget).parent().parent().parent().find('.apply-rule-desc').val(''); // 적용규칙설명 초기화
    }
    
    if(ruleVerifier(ruleContent)){
        $('.applyRuleSyntaxError').hide();
    }else{
        $('.applyRuleSyntaxError').show();
    }
});

//OHS 20180418 - 적용규칙 값이 변경될때 값이 하나도없으면 tokens 초기화처리
onEvent('change', '.apply-rule', function(e) {
	if($(e.currentTarget).val() == '') {
		classificationTokens = PFFormulaEditor.tokenize(''); // 초기화
		$('.apply-rule-desc').val('');
	}
});

// 적용규칙 검증
onEvent('keyup.xdsoft', '.apply-rule', function(e) {

    var ruleContent = $(e.currentTarget).parent().parent().find('.apply-rule').val();
    var count = 0;

    for(var i = 0 ; i < ruleContent.length ; i++){
        if (ruleContent.charAt(i) === '('){
            count++;
        }else if(ruleContent.charAt(i) === ')'){
            count--;
        }
    }

    if(count !== 0){
        $('.applyRuleSyntaxError').show();
        return;
    }

    if(ruleVerifier(ruleContent)){
        $('.applyRuleSyntaxError').hide();
    }else{
        $('.applyRuleSyntaxError').show();
    }

});


onEvent('keydown.xdsoft', '.prod-grp-cnd-search', function(e) {

    if (e.keyCode == '13') {
        var searchBaseDate = $('.prod-grp-cnd-search').val();
        searchClassificationConditionList(searchBaseDate);
    }

});

onEvent('focusout', '.prod-grp-cnd-search', function(e) {

        var searchBaseDate = $('.prod-grp-cnd-search').val();
        searchClassificationConditionList(searchBaseDate);


});

onEvent('click', '.classification-search-btn', function(e){

    var classificationName = $('.search-classification-name').val();
    loadClassificationList(classificationName);
});

onEvent('keydown.xdsoft', '.search-classification-name', function(e) {

    if (e.keyCode == '13') {
        var classificationName = $('.search-classification-name').val();
        loadClassificationList(classificationName);
    }
});

onEvent('click', '.search-classification-name', function(e){
        $el.find('.classification-search-list-wrap').removeClass('active');
});

// 적용규칙 이력보기 버튼 클릭
onEvent('click', '.pf-cl-apply-rule-history-btn', function(e) {

    var $applyRuleTable = $('.pf-cl-apply-rule-wrap .bx-info-table');
    var formData = PFComponent.makeYGForm($applyRuleTable).getData();

    formData.tntInstId  = getLoginTntInstId();

    PFPopup.showApplyRuleHistory({
      param: formData,
      pdInfoDscd,
    });
});


// 적용규칙 검증
onEvent('click', '.rule-validation-btn', function(e) {

	var $applyRuleInfo = $('.pf-cl-apply-rule-wrap');
	var ruleContent = $applyRuleInfo.find('.apply-rule').val();
    var count = 0;

    for(var i = 0 ; i < ruleContent.length ; i++){
        if (ruleContent.indexOf(i) === '('){
        	count++;
        }else if(ruleContent.indexOf(i) === ')'){
        	count--;
        }
    }

    if(count !== 0 || !ruleVerifier(ruleContent)){
    	PFComponent.showMessage(bxMsg('applyRuleSyntaxError'), 'warning'); //문법이상

    } else{
    	var requestParam = {
			'tntInstId' : tntInstId,
			'ruleApplyTargetDscd' : '08',	// 서비스그룹
			'pdInfoDscd' : pdInfoDscd,
			'ruleContent' : ruleContent
	    };

    	// 서버 호출
	    PFRequest.get('/common/verifyApplyRule.json', requestParam, {
	        success: function (responseData) {
	        	if (responseData) {
	        		$applyRuleInfo.find('.apply-rule-desc').val(responseData);
	        		PFComponent.showMessage(bxMsg('noAbnormality'),  'success');
	        	}
	        },
	        bxmHeader: {
	            application: 'PF_Factory',
	            service: 'CommonService',
	            operation: 'verifyApplyRule'
	        }
	    });
    }
});


//적용규칙 저장 버튼
onEvent('click', '.pf-cl-apply-rule-save-btn', function(e) {
    saveApplyRule();
});

//적용규칙 삭제 버튼
onEvent('click', '.pf-cl-apply-rule-delete-btn', function(e) {
    deleteApplyRule();
});

//적용규칙 도움말 포커스아웃 처리를 할때 HELP 영역을 클릭하였을경우 사라지지않도록 처리하기위함
var isHelpAreaClick = false;

// 적용규칙 도움말 버튼 클릭
onEvent('click', '.pf-cal-apply-rule-help-btn', function(e){
	// 버튼 아이콘이 보여 도움말 툴팁이 가려지는 케이스를 방지하기위해 hide() 처리
	var $toolTip = $('.tooltip');
	if($toolTip) $($toolTip).hide();

	var $helpDiv = $('.help-area');
	var applyRuleExample = bxMsg('ApplyRuleHelpMessage');
	$($helpDiv).html('<p class="help-area-message">' + applyRuleExample + '</p>');
	$($helpDiv).css({top: e.pageY+15, left: e.pageX+15}).show();

	$('.help-area-message').on('mousedown', function(e) {
		isHelpAreaClick = true;
	});
});

// 적용규칙 도움말 포커스아웃 처리
onEvent('focusout', '.pf-cal-apply-rule-help-btn', function(e){
	if(!isHelpAreaClick) {
		var $helpDiv = $('.help-area');
		if($helpDiv) $($helpDiv).hide();
		isHelpAreaClick = false;
	}
	else {
		isHelpAreaClick = false;
		$('.pf-cal-apply-rule-help-btn').focus();
	}
});

/******************************************************************************************************************
 * BIZ 함수
 ******************************************************************************************************************/
// 분류체계 저장
function saveClassificationStructure(work, that){

	var form;
    var name;

    if(that){
    	form = PFComponent.makeYGForm($('.pfui-stdmod-body .classification-structure-base-management-popup .pf-cls-str-base-form'));
    	name = $('.pfui-stdmod-body .classification-structure-base-management-popup .classification-structure-name').val();       // 분류체계기본명
    }else{
    	form = PFComponent.makeYGForm($('.pf-cls-str-base-form'));
    	name = $('.classification-structure-name').val();       // 분류체계기본명
    }

    if(!name){
    	// OHS20180321 - 상품,서비스,분류별로 에러메세지 분리
    	let errorMessage = '';
    	if(pageType === pageType_ProductGroupPage) {
    		errorMessage = bxMsg('ProductGroupNameError');
    	}
    	else if(pageType === pageType_ServiceGroupPage) {
    		errorMessage = bxMsg('ServiceGroupNameError');
    	}
    	else {
    		errorMessage = bxMsg('ClassificationStructureNameError');
    	}
        PFComponent.showMessage(errorMessage, 'warning');
        return;
    }

	if(!modifyFlag){
		// 변경된 정보가 없습니다.
		PFComponent.showMessage(bxMsg('nothingToSave'), 'warning');
		return;
	}

    if(!isHaveProject()){
        haveNotTask();
        return;
    }

    var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
    if(isNotMyTask(projectId)){
        return;
    }

    var nameLengthCheck = PFValidation.finalLengthCheck('',100,name);
    var mandatoryCheck = PFValidation.mandatoryCheck('.mandatory');

    var requestUrl, bxmHeader;
    if(work == "CREATE"){
        requestUrl = "/classification/createClassificationMaster.json";
        bxmHeader = {
            application: 'PF_Factory',
            service: 'ClassificationMasterService',
            operation: 'createClassificationMaster'
        };
    }else if(work == "UPDATE"){
        requestUrl = "/classification/updateClassificationMaster.json";
        bxmHeader = {
            application: 'PF_Factory',
            service: 'ClassificationMasterService',
            operation: 'updateClassificationMaster'
        };
    }

    var requestData = form.getData();
    requestData.pdInfoDscd = pdInfoDscd;
    requestData.projectId = projectId;
    requestData.tntInstId = tntInstId;
    // requestData.classificationStructureTypeCode = pageType; // OHS 2017.02.23 수정 - 아래와같이 변경처리
    requestData.classificationStructureTypeCode = G_classificationStructureTypeCode; // OHS 2017.02.27 수정 - 기존 저장 후 매핑되지않고있음 코드 자리수 불일치

    if(nameLengthCheck && mandatoryCheck){
        PFRequest.post(requestUrl, requestData, {
            success: function(result){

                PFComponent.showMessage(bxMsg('Z_SaveSucceed'), 'success');
                modifyFlag = false;

                if(that) {
                    that.close();
                }

                var classificationStructureDistinctionCode;
                var classificationCode;
                if(work == "UPDATE"){
	                // OHS20180322 추가
	                var hashString = PFUtil.getHash();
	                hashString.split('&').forEach(function (el) {
	                    if (el.split('=')[0] === 'classificationStructureDistinctionCode') {
	                    	classificationStructureDistinctionCode = el.split('=')[1];
	                    } else if (el.split('=')[0] === 'classificationCode') {
	                    	classificationCode = el.split('=')[1];
	                    }
	                });
                }
                else {
                	classificationStructureDistinctionCode = result;
                }

                var traceArr = [];
                var trace = '';
                if(classificationStructureDistinctionCode && classificationCode) {
                	trace = classificationStructureDistinctionCode + '.' + classificationCode;
                }
                else if(classificationStructureDistinctionCode && !classificationCode) {
                	trace = classificationStructureDistinctionCode;
                }
                if(trace != '') {
                	traceArr.push(trace);
                }

                traceTree.traceList = traceArr;
                traceTree.depth = 0;
                traceTree.completeTrace = false;

                renderClassificationNavTree.isRendered = false;
                renderClassificationNavTree();

             },
            bxmHeader : bxmHeader
        });
    }
}

// 분류체계삭제
function deleteClassificationStructure(id, applyStartDate, confirmMessage) {
    if (!isHaveProject()) {
        haveNotTask();
        return;
    }

    var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
    if (isNotMyTask(projectId)) {
        return;
    }

    var requestData = {
        classificationStructureDistinctionCode: id,
        pdInfoDscd: pdInfoDscd,
        projectId: projectId,
        tntInstId: tntInstId,
        applyStartDate : applyStartDate
    };

    // OHS20180321 - confirm 추가
    PFComponent.showConfirm(confirmMessage, function() {
    	PFRequest.post('/classification/deleteClassificationMaster.json', requestData, {
            success : function (responseMessage) {
                if (responseMessage) {
                    PFComponent.showMessage(bxMsg('Z_DeleteSucced'), 'success');                                        // 삭제에 성공하였습니다.
                    modifyFlag = false;

                    /**
                    var pathArr = [];
                    treeItem.path.forEach(function(path){
                        if(path && path != id){
                            pathArr.push(path);
                        }
                    });
                    traceTree.traceList = pathArr;
                    */

                    traceTree.traceList = [];
                    traceTree.depth = 0;
                    traceTree.completeTrace = false;

                    renderClassificationNavTree.isRendered = false;
                    renderClassificationNavTree();

                    $el.find('.pf-cl-info-wrap').removeClass('active');
                }
            },
            bxmHeader: {
                application: 'PF_Factory',
                service: 'ClassificationMasterService',
                operation: 'deleteClassificationMaster'
            }
        });
    }, function() {
        return;
    });
}

// 분류 저장
function saveClassification(work, data, that){

	var form;
    var name;

    if(that){
        form = PFComponent.makeYGForm($('.pfui-stdmod-body .classification-management-popup .pf-cls-form'));
        name = $('.pfui-stdmod-body .classification-management-popup .classification-name').val();       // 분류기본명
    }else{
        form = PFComponent.makeYGForm($('.pf-cls-form'));
        name = $('.classification-name').val();       // 분류체계기본명
    }

    if(!name){

    	// OHS20180323 - 상품,서비스,분류별로 에러메세지 분리
    	let errorMessage = '';
    	if(pageType === pageType_ProductGroupPage) {
    		errorMessage = bxMsg('ProductGroupNameError');
    	}
    	else if(pageType === pageType_ServiceGroupPage) {
    		errorMessage = bxMsg('ServiceGroupNameError');
    	}
    	else {
    		// 분류체계기본명은 필수입력사항입니다
    		errorMessage = bxMsg('ClassificationNameError');
    	}
        PFComponent.showMessage(errorMessage, 'warning');
        return;
    }

	if(!modifyFlag){
		// 변경된 정보가 없습니다.
		PFComponent.showMessage(bxMsg('nothingToSave'), 'warning');
		return;
	}

    if(!isHaveProject()){
        haveNotTask();
        return;
    }

    var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
    if(isNotMyTask(projectId)){
        return;
    }

    var nameLengthCheck = PFValidation.finalLengthCheck('',100,name);
    var mandatoryCheck = PFValidation.mandatoryCheck('.mandatory');

    var requestUrl, bxmHeader;
    if(work == "CREATE"){
        requestUrl = "/classification/createClassificationDetail.json";
        bxmHeader = {
            application: 'PF_Factory',
            service: 'ClassificationDetailService',
            operation: 'createClassificationDetail'
        };
    }else if(work == "UPDATE"){
        requestUrl = "/classification/updateClassificationDetail.json";
        bxmHeader = {
            application: 'PF_Factory',
            service: 'ClassificationDetailService',
            operation: 'updateClassificationDetail'
        };
    }

    var requestData = form.getData();
    requestData.pdInfoDscd = pdInfoDscd;
    requestData.projectId = projectId;
    requestData.tntInstId = tntInstId;

    if(nameLengthCheck && mandatoryCheck){
        PFRequest.post(requestUrl, requestData, {
            success: function(resposeData){

                PFComponent.showMessage(bxMsg('Z_SaveSucceed'), 'success');
                modifyFlag = false;

                if(that) {
                    that.close();
                }

                if(work == 'UPDATE') {
                    data = navTreeStore.findNode(requestData.classificationStructureDistinctionCode + '.' + requestData.classificationCode);
                }
                // OHS20180323 CREATE 추가
                else {
                	var parentNode = navTree.getSelected()
                	var pathArr = parentNode.path;
                	pathArr.push(requestData.classificationStructureDistinctionCode + '.' + resposeData);
                	data.path = pathArr;
                }

                var pathArr = [];
                data.path.forEach(function(path){
                    if(path){
                        pathArr.push(path);
                    }
                });
                pathArr.push(resposeData);

                traceTree.traceList = pathArr;
                traceTree.depth = 0;
                traceTree.completeTrace = false;

                renderClassificationNavTree.isRendered = false;
                renderClassificationNavTree();

            },
            bxmHeader : bxmHeader
        });
    }
}

// 분류 삭제
function deleteClassification(code, id, applyStartDate, treeItem) {
    if(!isHaveProject()){
        haveNotTask();
        return;
    }

    var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
    if(isNotMyTask(projectId)){
        return;
    }
    var requestData = {
        classificationStructureDistinctionCode : code,
        classificationCode : id,
        pdInfoDscd : pdInfoDscd,
        tntInstId: tntInstId,
        projectId : projectId,
        applyStartDate : applyStartDate
    };

    PFRequest.post('/classification/deleteClassificationDetail.json',requestData, {
        success:function(responseMessage){
            if(responseMessage) {
                PFComponent.showMessage(bxMsg('Z_DeleteSucced'), 'success');                                        // 삭제에 성공하였습니다.
                modifyFlag = false;

                var pathArr = [];

                // OHS 2017.09.08 수정 - treeItem is undefined script error
                if(!treeItem && classForEvent) {
                	classForEvent.path.forEach(function(path){
                		if(path && path != id){
                			pathArr.push(path);
                		}
                	});
                }
                else {
                    treeItem.path.forEach(function(path){
                        if(path && path != id){
                            pathArr.push(path);
                        }
                    });
                }


                traceTree.traceList = pathArr;
                traceTree.depth = 0;
                traceTree.completeTrace = false;

                renderClassificationNavTree.isRendered = false;
                renderClassificationNavTree();

                $el.find('.pf-cl-info-wrap').removeClass('active');
            }
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'ClassificationDetailService',
            operation: 'deleteClassificationDetail'
        }
    });
}

// 관계 저장
function saveClassificationRelation(){

    if(!isHaveProject()){
        haveNotTask();
        return;
    }

    var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
    if(isNotMyTask(projectId)){
        return;
    }

    // requestData
    var requestParam = {};
    var hash = PFUtil.getHash();
    $.each(hash.split('&'),function(index, hashItem){
        var param = hashItem.split('=');
        requestParam[param[0]] = param[1];
    })

    // 그리드데이터
    var gridData;
    if (!PFValidation.mandatoryCheck('.mandatory') || !PFValidation.specialCharacter('.special')) {
        return;
    }

    //gridData = relatedPdGrid.getAllData();
    gridData = productRelgridDeleteData.concat(relatedPdGrid.getAllData());

    if(!modifyFlag){
		// 변경된 정보가 없습니다.
		PFComponent.showMessage(bxMsg('nothingToSave'), 'warning');
		return;
	}

    requestParam['voList'] = gridData;
    requestParam.pdInfoDscd = pdInfoDscd;
    requestParam.projectId = projectId;
    requestParam.tntInstId = tntInstId;

    var nameLengthCheck = PFValidation.finalLengthCheck('',100,name);
    var mandatoryCheck = PFValidation.mandatoryCheck('.mandatory');

    // 상품관계 저장 서비스 호출
    if(nameLengthCheck && mandatoryCheck){
        PFRequest.post('/classification/updateClassificationInformationRelation.json',requestParam,{
            success : function(){
                PFComponent.showMessage(bxMsg('Z_SaveSucceed'), 'success');
                modifyFlag = false;

                var item = navTreeStore.findNode(requestParam.classificationStructureDistinctionCode + '.' + requestParam.classificationCode);

                var pathArr = [];
                // OHS20180410 - 트리조회시 오류가생겨 트리가 만들어지지않을경우 스크립트오류 방지
                if(item) {
	                item.path.forEach(function(path){
	                    if(path){
	                        pathArr.push(path);
	                    }
	                });
                }

                traceTree.traceList = pathArr;
                traceTree.depth = 0;
                traceTree.completeTrace = false;
                traceTree.notDblClick = true;

                productRelgridDeleteData = [];
                conditionInfogridDeleteDate  =[];

                renderClassificationNavTree.isRendered = false;
                renderClassificationNavTree();
                renderClassificationInfo(classForEvent);

            },
            bxmHeader: {
                application: 'PF_Factory',
                service: 'ClassificationInformationRelationService',
                operation: 'updateClassificationInformationRelation'
            }
        });
    }
}


// 검색트림
function loadClassificationList(name) {
    var ua = window.navigator.userAgent;
    if (ua.indexOf('MSIE') > 0 || ua.indexOf('Trident') > 0) {
    	name = encodeURI(name);
    }
    $el.find('.classification-search-list-wrap').addClass('active');
    $el.find('.classification-search-list-wrap').empty();

    var tntInstId = $el.find('.pf-multi-entity').val();

    PFUI.use(['pfui/tree', 'pfui/data'], function (Tree, Data) {

        var store;
        if(g_serviceType == g_bxmService){    // bxm

        	var params = {
                header: {
                    application: 'PF_Factory',
                    service: 'ClassificationDetailService',
                    operation: 'queryListClassificationDetail',
                    locale: getCookie('lang')
                },
                input: {
                    tntInstId: tntInstId,
                    pdInfoDscd: pdInfoDscd,
                    classificationName : name,
                    classificationStructureTypeCode : G_classificationStructureTypeCode,
                    commonHeader: {
                        loginTntInstId: getLoginTntInstId(),
                        lastModifier: getLoginUserId()
                    }
                }
            };

            store = new Data.TreeStore({
                autoLoad: false,
                dataProperty: 'list',
                url: '/serviceEndpoint/json/request.json',
                proxy : {
                    method : 'POST',
                    ajaxOptions : {
                        contentType: 'application/json; charset=UTF-8',
                        data:JSON.stringify(params)
                    },
                    dataType : 'json'
                },
                map: {
                    'classificationName': 'text',
                    'classificationCode': 'id'
                }
            });


        }else{
            store = new Data.TreeStore({
                autoLoad: false,
                dataProperty: 'list',
                url: '/classification/getListClassificationDetail.json?tntInstId='+tntInstId+'&classificationName='+name+'&commonHeaderMessage={"loginTntInstId":"'+getLoginTntInstId()+ '", "lastModifier":"' + getLoginUserId() +'"}'
                +'&pdInfoDscd='+pdInfoDscd+'&classificationStructureTypeCode='+G_classificationStructureTypeCode,
                map: {
                    'classificationName': 'text',
                    'classificationCode': 'id'
                }
            });
        }

        store.on('beforeprocessload', function (ev) {
            var data = ev.data;

            if(data.ModelMap){
                data.responseMessage = data.ModelMap.responseMessage;
                delete data.ModelMap.responseMessage;
            }

            if (data.responseMessage) {
                data.list = data.responseMessage;
            } else if (data.responseError) {
                data.list = [];
            }

        });

        store.load();

        var tree = new Tree.TreeList({
            render : '.classification-search-list-wrap',
            showLine : false,
            store : store,
            showRoot : false
        });

        tree.render();

        tree.on('itemclick', function(e) {

            location.hash = 'classificationStructureDistinctionCode=' + e.item.classificationStructureDistinctionCode
                            + '&classificationCode=' + e.item.id
                            + '&fullPath=' + e.item.fullPath
                            + '&searchBoxFlag=Y';

            location.reload();

            if(!modifyFlag){
                $el.find('.classification-search-list-wrap').removeClass('active');
            }
        });
    });
}

/******************************************************************************************************************
 * rendering 함수
 ******************************************************************************************************************/

// 트리박스
function renderClassficationTreeBox() {
    $('.pf-cl-left-tree-box').html(classificationLeftTreeTpl());

    loginTntInstId = getLoginTntInstId();  // loginTntInstId = $('.product-factory-header', parent.document).find('.login-tntInst-id').text();
    tntInstId = getLoginTntInstId();
    mother = getMortherYn();

    // 기관코드 콤보 바인딩
    renderTntInstComboBox($el.find('.pf-multi-entity'), tntInstId, function(returnValue) {

        if(!returnValue) return;

        if (!getMortherYn()) {
            $el.find('.pf-multi-entity-yn').hide();
        }

        if(parent.parameter && parent.parameter.length > 0){
            pdInfoDscd = parent.parameter;
            parent.parameter = '';
        }

        renderComboBox('PdInfoDscd', $('.pd-info-dscd'), pdInfoDscd);   // 상품정보구분코드 콤보
        renderClassificationInfo();                		//renderProductInfo();
    });
}

// 트리와 메인화면을
function renderClassificationInfo(treeItem) {

    var path = (treeItem) ? treeItem.id : null;
    var hash;

    classForEvent = treeItem;
    if(path == null){
        hash = '';
        $el.find('.pf-cl-info-wrap').removeClass('active');
    }

// pf-event에서 처리
//    $('.pf-detail-wrap').on('change','input',function(){
//        modifyFlag = true;
//        $('.most-significant-box').attr('data-edited','true');
//    });

    hash = PFUtil.getHash();

    if (!hash) {
        traceTree.completeTrace = true;
        renderClassificationNavTree($('.pd-info-dscd').val());
        return;
    }

    var requestParam = {};
    $.each(hash.split('&'),function(index, hashItem){
        var param = hashItem.split('=');
        requestParam[param[0]] = param[1];
    });
    
    if(requestParam.fullPath){
        this.fullPath = requestParam.fullPath;
    }else{
        this.fullPath = undefined;
    }
    requestParam.pdInfoDscd = pdInfoDscd;      // 상품정보구분코드
    requestParam.tntInstId = tntInstId;
    
    // OHS 20180418 - 트리 검색박스에서 클릭시, 불필요하게 재조회(트리관련된 로직)를 피하기위해 아래로직을 태움.
    if(requestParam.searchBoxFlag && requestParam.searchBoxFlag == 'Y') {
        PFRequest.get('/classification/getListClassificationInformationRelation.json', requestParam, {
            success: function(responseData) {
                var pathArr = [], path;
                var navigationArr = responseData.navigation.split('.');
                var responseClassificationStructureDistinctionCode;
                
                responseClassificationStructureDistinctionCode = responseData.classificationStructureDistinctionCode;
                pathArr.push(responseClassificationStructureDistinctionCode);
                if(navigationArr){
    	            navigationArr.forEach(function (el) {
                        pathArr.push(responseClassificationStructureDistinctionCode +'.'+ el.split(':')[0]);
    	            });
                }
                traceTree.traceList = pathArr;
                traceTree.depth = 0;
                traceTree.completeTrace = false;

                renderClassificationNavTree();
            }
        });
        return;
    }

    PFRequest.get('/classification/getListClassificationInformationRelation.json', requestParam, {
        success: function(responseData) {

            var navigationArr = responseData.navigation.split('.');
            var navigationStr = '';
            var responseClassificationCode;
            var responseClassificationStructureDistinctionCode;

            responseClassificationCode = navigationArr[0].split(':')[0];
            responseClassificationStructureDistinctionCode = responseData.classificationStructureDistinctionCode;

            navigationArr.forEach(function(navi){
                if(navigationStr == ''){
                    navigationStr = navi.split(':')[1];
                }else {
                    navigationStr = navigationStr + ' > ' + navi.split(':')[1];
                }

                // OHS 2017.02.23 추가 - 서비스그룹 추가
                if(pageType === pageType_ProductGroupPage || pageType === pageType_ServiceGroupPage){
                    productClassificationCode = navi.split(':')[0];
                }

            });
            responseData.navigation = navigationStr;

            /* OHS 20161115 주석 - 타이틀명 통일
            if(pdInfoDscd == pdInfoDscd_Product){
                responseData.relTitle = bxMsg('PfRelationManagement');
            }
            else if(pdInfoDscd == pdInfoDscd_Service){
                responseData.relTitle = bxMsg('ServiceRelationManagement');
            }
            else if(pdInfoDscd == pdInfoDscd_Point){
                responseData.relTitle = bxMsg('PointRelationManagement');
            }
            */
            responseData.relTitle = bxMsg('ClassificationStructureManagement');

            $el.find('.pf-cl-info-wrap').addClass('active');
            $el.find('.pf-cl-info').html(classificationInfoFormTpl(responseData));

            // 권한이 없으면 버튼 숨김
            if(writeYn != 'Y'){
                $('.write-btn').hide();
            }

            if(tntInstId == loginTntInstId){    // enable
                $el.find('.add-rel-product-btn').prop('disabled', false);
                $el.find('.product-save-btn').prop('disabled', false);
            }else{                              // disable
                $el.find('.add-rel-product-btn').prop('disabled', true);
                $el.find('.product-save-btn').prop('disabled', true);
            }

            productRelgridDeleteData = [];
            renderClassificationGrid(responseData.voList);

            // OHS 2017.02.23 추가 - 서비스그룹 추가
            if(pageType === pageType_ProductGroupPage || pageType === pageType_ServiceGroupPage) {

                var cndExpendbutton = '<button class="bw-btn bx-btn-small pf-cl-condition-expend-view-btn">' +
                    '<i class="bw-icon i-25 i-open3"></i>'
                    + '</button>';

                $el.find('.pf-cl-info').append(cndInfoTpl());
                $el.find('.pf-cl-condition-info-tpl .header-btn-group').append(cndExpendbutton);
                $el.find('.pf-cl-condition-info-tpl .pf-panel-body').hide();
            }
            if(pageType === pageType_ServiceGroupPage){
                var ruleExpendbutton = '<button class="bw-btn bx-btn-small pf-cl-apply-rule-expend-view-btn">' +
                    '<i class="bw-icon i-25 i-open3"></i>'
                    + '</button>';

                $el.find('.pf-cl-info').append(applyRuleTpl());
                $el.find('.pf-cl-apply-rule-tpl .apply-rule')[0].placeholder = bxMsg('noneApplyRule'); // OHS 20171207 추가 - 다른적용규칙 패턴과 동일하게 화면 구성
                $el.find('.pf-cl-apply-rule-tpl .header-btn-group').append(ruleExpendbutton);
                $el.find('.pf-cl-apply-rule-tpl .pf-panel-body').hide();
                $('.apply-rule-info-wrap .and').hide();
                $('.apply-rule-info-wrap .or').hide();
                $('.apply-rule-info-wrap .not').hide();
                $('.apply-rule-info-wrap .match').hide();
                $('.applyRuleSyntaxError').hide();

                if(pageType === pageType_ServiceGroupPage){
                    $('.formula-cal-btn.and').hide();
                    $('.formula-cal-btn.or').hide();
                    $('.formula-cal-btn.match').hide();
                }
            }

            var pathArr = [], path;

            pathArr.push(responseClassificationStructureDistinctionCode);

            if(navigationArr){
	            navigationArr.forEach(function (el) {
                    pathArr.push(responseClassificationStructureDistinctionCode +'.'+ el.split(':')[0]);
	            });
            }

            traceTree.traceList = pathArr;
            traceTree.depth = 0;
            traceTree.completeTrace = false;

            renderClassificationNavTree();
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'ClassificationInformationRelationService',
            operation: 'queryListClassificationInformationRelation'
        }
    });
}


/******************************************************************************************************************
 * 트리 관련
 ******************************************************************************************************************/
function renderClassificationNavTree() {

    if (renderClassificationNavTree.isRendered) {
        return;
    }
    renderClassificationNavTree.isRendered = true;


    PFUI.use(['pfui/tree', 'pfui/data', 'pfui/menu'], function (Tree, Data, Menu) {

        /* --------------------------------------
         * nvaTreeStore
         * -------------------------------------- */
        var classificationStructureTypeCode;

        //if(pageType === pageType_Classification){
        //    classificationStructureTypeCode = pageType_Classification;
        //}else if(pageType === pageType_ProductGroupPage){
        //    classificationStructureTypeCode = pageType_ProductGroupPage;
        //}

        if (g_serviceType == g_bxmService){
            var params = {
                header: {
                    application: 'PF_Factory',
                    service: 'ClassificationMasterService',
                    operation: 'queryListClassificationMaster'
                },
                input: {
                    tntInstId: tntInstId,
                    pdInfoDscd: pdInfoDscd,
                    //classificationStructureTypeCode : pageType, // OHS 2017.02.23 수정 - 아래와같이 변경처리
                    classificationStructureTypeCode : G_classificationStructureTypeCode,
                    commonHeader: {
                        loginTntInstId: loginTntInstId,
                        motherTntInstId: getMotherTntInstId(),
                        lastModifier : getLoginUserId()
                    }
                }
            };

            navTreeStore = new Data.TreeStore({
                autoLoad: false,
                url: '/serviceEndpoint/json/request.json',
                dataProperty: 'list',
                proxy : {
                    method : 'POST',
                    ajaxOptions : {
                        contentType: 'application/json; charset=UTF-8',
                        data:JSON.stringify(params)
                    },
                    dataType : 'json'
                },
                map: {
                    'bottom': 'leaf',
                    'classificationStructureName': 'text',
                    'classificationStructureDistinctionCode': 'id'          // 분류체계구분코드
                }
            });
        } else {

                navTreeStore = new Data.TreeStore({
                    autoLoad: false,
                    url: '/classification/getListClassificationMaster.json?tntInstId=' + tntInstId +
                    '&commonHeaderMessage={"loginTntInstId":"' + loginTntInstId + '", "motherTntInstId" : "' + getMotherTntInstId() + '", "lastModifier" : "' + getLoginUserId()+ '"}' +
                    '&pdInfoDscd=' + pdInfoDscd +
                    //'&classificationStructureTypeCode=' + pageType, // OHS 2017.02.23 수정 - 아래와같이 변경처리
                    '&classificationStructureTypeCode=' + G_classificationStructureTypeCode,
                    dataProperty: 'list',
                    map: {
                        'bottom': 'leaf',
                        'classificationStructureName': 'text',
                        'classificationStructureDistinctionCode': 'id'          // 분류체계구분코드
                    }
                });

        }

        // click change url params
        // csl='folder' and 'leaf=false' 일 때 호출됨
        navTreeStore.on('beforeload', function (ev) {
            var params = ev.params;
            var node = navTreeStore.findNode(params.id);
            var queryParams;

            if(!node) { return; }

            // 상품관계관리가 존재하면
            if (node.related) {
                return;
            }
            //  하위분류가 없으면
            else if(node.bottom) {
                return;
            }
            // 하위분류조회
            else {
                if(g_serviceType == g_bxmService){
                    queryParams = {
                        header: {
                            application: 'PF_Factory',
                            service: 'ClassificationDetailService',
                            operation: 'queryListClassificationDetail'
                        },
                        input: {
                            tntInstId: tntInstId,
                            pdInfoDscd: pdInfoDscd,
                            commonHeader: {
                                loginTntInstId: loginTntInstId
                            }
                        }
                    };

                    if(node.level == 1) {
                        queryParams.input.classificationStructureDistinctionCode = node.id;                         // 분류체계구분코드

                    } else if (node.level > 1) {
                        queryParams.input.classificationStructureDistinctionCode = node.classificationStructureDistinctionCode;  // 분류체계구분코드
                        queryParams.input.levelNumber = node.levelNumber;														// 레벨
                        queryParams.input.higherClassificationCode = node.classificationCode;                                                   // 상위분류코드
                    }
                    navTreeStore.get('proxy').set('ajaxOptions', {
                        contentType: 'application/json; charset=UTF-8',
                        data:JSON.stringify(queryParams)
                    });

                }else {

                    queryParams = 'tntInstId=' + tntInstId
                        + '&pdInfoDscd=' + pdInfoDscd
                        + '&commonHeaderMessage={"loginTntInstId":"' + loginTntInstId + '", "motherTntInstId" : "' + getMotherTntInstId() +'"}';
                    if (node.level == 1) {
                        queryParams = queryParams
                            + '&classificationStructureDistinctionCode=' + node.id;                                     // 분류체계구분코드

                    } else if (node.level > 1) {
                        queryParams = queryParams
                            + '&classificationStructureDistinctionCode=' + node.classificationStructureDistinctionCode  // 분류체계구분코드
                            + '&levelNumber=' + node.levelNumber														// 레벨
                            + '&higherClassificationCode=' + node.classificationCode;                                   // 상위분류코드
                    }

                    navTreeStore.get('proxy').set('url', '/classification/getListClassificationDetail.json?' + queryParams);
                }

                navTreeStore.set('map', {
                    'classificationName'                    : 'text',
                    //'classificationCode'                    : 'id',
                    'bottom'                                : 'leaf'
                });
            }
        });

        navTreeStore.on('beforeprocessload', function (ev) {
            var data = ev.data;
            if(data.ModelMap){
                data.list = data.ModelMap.responseMessage;
            }else {
                data.list = data.responseMessage;
            }

            // OHS20180320 data.list 체크 추가
            if(data.list && data.list.length > 0){
                data.list.forEach(function(element){
                    if(!element.bottom && !element.related){
                        element.cls = 'Folder';
                    }
                    if(element.bottom && !element.related){
                        element.cls = 'PT';
                    }
                    if(element.classificationCode) {
                        element.id = element.classificationStructureDistinctionCode + '.' + element.classificationCode;
                    }
                });
            }
        });

        navTreeStore.on('load', function() {
            traceTree();
        });

        navTreeStore.load();


        /* --------------------------------------
         * navTree 생성
         * -------------------------------------- */

        $('.pf-cl-tree-nav').empty();

        navTree = new Tree.TreeList({
            render: '.pf-cl-tree-nav',
            showLine: false,
            store: navTreeStore,
            checkType: 'none',
            showRoot: false
        });

        navTree.render();

        // tree item double click
        navTree.on('itemdblclick', function(e) {

            location.hash = makeClassificationInfoParameter(e.item);

            // OHS 2017.02.23 수정 - 기존에서 사용했던 2곳은 주석처리하고 if문밖에서 아에 값을 세팅.(스크립트오류방지)
            classForEvent = e.item;

            if (e.item.related) {   // 상품관계관리가 존재하는 경우
                var emptyObj;
                conditionInfoGrid = emptyObj;
                if(!modifyFlag){
                    renderClassificationInfo(e.item);
                }else{

                    PFComponent.showConfirm(bxMsg('warningDontSaved'), function() {
                        renderClassificationInfo(e.item);
                        modifyFlag = false;
                        //$('.most-significant-box').removeAttr('data-edited');
                    }, function() {
                        return;
                    });
                }
            }else{
                if(e.item.level == 1){
                    var requestData = { classificationStructureDistinctionCode : e.item.id,
                        pdInfoDscd : pdInfoDscd,
                        tntInstId: tntInstId,
                        applyStartDate : e.item.applyStartDate
                    };
                    PFRequest.get('/classification/getClassificationMaster.json',requestData, {
                        success: function(responseMessage) {

                        	modifyFlag = false;

                        	// OHS20180323 추가 - 개발과제 매핑되도록 처리
                        	if(responseMessage && responseMessage.projectBaseVO) {
                        		setTaskRibbonInput(responseMessage.projectBaseVO.projectId, responseMessage.projectBaseVO.name);
                        	}

                            $el.find('.pf-cl-info-wrap').addClass('active');
                            $el.find('.pf-cl-info').html(classificationDetailInfoTpl());
                            $el.find('.pf-cl-detail-info').html(classificationStructureBaseManagementPopupTpl(responseMessage));

                            PFUtil.getDatePicker(true, $('.classification-structure-base-management-popup'));

                            $el.find('.save-btn').addClass('class-str-save-btn');
                            $el.find('.delete-btn').addClass('class-str-delete-btn');
                            $el.find('.save-btn').removeClass('class-save-btn');
                            $el.find('.delete-btn').removeClass('class-delete-btn');

                            // 권한이 없으면 버튼 숨김
                            if(writeYn != 'Y'){
                                $('.write-btn').hide();
                            }

                            if(tntInstId == loginTntInstId){    // enable
                                $el.find('.save-btn').prop('disabled', false);
                                $el.find('.delete-btn').prop('disabled', false);
                            }else{                              // disable
                                $el.find('.save-btn').prop('disabled', true);
                                $el.find('.delete-btn').prop('disabled', true);
                            }

                            if(responseMessage.activeYn == 'N' || (getSelectedProjectId() && isEmergency(getSelectedProjectId())) ){
                                $('.delete-btn').prop('disabled', false);
                            }else{
                                $('.delete-btn').prop('disabled', true);
                            }

                           	// OHS 2017.02.27 수정 - Benefit 영역에서 공통코드 신규 매핑('P0109' BnftGroupTypeCode)
                        	if(pageType == pageType_ServiceGroupPage) {
                        		renderComboBox("BnftGroupTypeCode", $('.cls-prod-group-type-select'), null, true, false);
                        	}
                        	else {
                        		renderComboBox("ProductGroupTypeCode", $('.cls-prod-group-type-select'), null, true, false);
                        	}

                            renderComboBox("ProductBooleanCode", $('.cls-str-active-yn-select'));
                            // OHS 2017.02.28 수정 - classificationStructureTypeCode -> classificationStructureUsageDistinctionCode 로 변경
                            $('.cls-prod-group-type-select').val(responseMessage.classificationStructureUsageDistinctionCode);

                            $('.cls-str-active-yn-select').val(responseMessage.activeYn);
                        },
                        bxmHeader: {
                            application: 'PF_Factory',
                            service: 'ClassificationMasterService',
                            operation: 'queryClassificationMaster'
                        }
                    });
                }else{

                        var requestData = { classificationStructureDistinctionCode : e.item.classificationStructureDistinctionCode,
                            classificationCode : e.item.classificationCode,
                            pdInfoDscd : pdInfoDscd,
                            tntInstId: tntInstId,
                            applyStartDate : e.item.applyStartDate};

                        PFRequest.get('/classification/getClassificationDetail.json',requestData, {
                            success : function(responseMessage){

                            	modifyFlag = false;

                              	// OHS20180323 추가 - 개발과제 매핑되도록 처리
                            	if(responseMessage && responseMessage.projectBaseVO) {
                            		setTaskRibbonInput(responseMessage.projectBaseVO.projectId, responseMessage.projectBaseVO.name);
                            	}

                                $el.find('.pf-cl-info-wrap').addClass('active');
                                $el.find('.pf-cl-info').html(classificationDetailInfoTpl());
                                $el.find('.pf-cl-detail-info').html(classificationManagementPopupTpl(responseMessage));
                                PFUtil.getDatePicker(true, $('.classification-management-popup'));

                                $el.find('.save-btn').removeClass('class-str-save-btn');
                                $el.find('.delete-btn').removeClass('class-str-delete-btn');
                                $el.find('.save-btn').addClass('class-save-btn');
                                $el.find('.delete-btn').addClass('class-delete-btn');

                                // 권한이 없으면 버튼 숨김
                                if(writeYn != 'Y'){
                                    $('.write-btn').hide();
                                }

                                if(tntInstId == loginTntInstId){    // enable
                                    $el.find('.save-btn').prop('disabled', false);
                                    $el.find('.delete-btn').prop('disabled', false);
                                }else{                              // disable
                                    $el.find('.save-btn').prop('disabled', true);
                                    $el.find('.delete-btn').prop('disabled', true);
                                }

                                if(responseMessage.activeYn == 'N' || (getSelectedProjectId() && isEmergency(getSelectedProjectId())) ){
                                    $('.delete-btn').prop('disabled', false);
                                }else{
                                    $('.delete-btn').prop('disabled', true);
                                }

                                renderComboBox("ProductBooleanCode", $('.cls-active-yn-select'));
                                $('.cls-active-yn-select').val(responseMessage.activeYn);


                            },
                            bxmHeader: {
                                application: 'PF_Factory',
                                service: 'ClassificationDetailService',
                                operation: 'queryClassificationDetail'
                            }
                        });

                }
            }
        });


        /* --------------------------------------
         * Context Menu Event - 분류체계
         * -------------------------------------- */

        // 분류체계기본 조회 이벤트
        var searchClassificationStructureEvent = function() {
            var requestData = { classificationStructureDistinctionCode : treeItem.id,
                pdInfoDscd : pdInfoDscd, // OHS 20171207 수정 - PdInfoDscd -> pdInfoDscd ( BXM에서 대소문자 차이로 입력값을 받지 못함 )
                tntInstId: tntInstId,
                applyStartDate : treeItem.applyStartDate
            };
            PFRequest.get('/classification/getClassificationMaster.json',requestData, {
                success: function(responseMessage) {
                    responseMessage.work = "UPDATE";
                    renderClassificationStructureBasePopup(responseMessage);

                  	// OHS20180323 추가 - 개발과제 매핑되도록 처리
                	if(responseMessage && responseMessage.projectBaseVO) {
                		setTaskRibbonInput(responseMessage.projectBaseVO.projectId, responseMessage.projectBaseVO.name);
                	}
                	if(responseMessage.classificationStructureDistinctionCode) {
                		location.hash = makeClassificationInfoParameter(navTreeStore.findNode(responseMessage.classificationStructureDistinctionCode));
                	}
                },
                bxmHeader: {
                    application: 'PF_Factory',
                    service: 'ClassificationMasterService',
                    operation: 'queryClassificationMaster'
                }
            });
        }

        // 분류체계기본 삭제 이벤트
        var deleteClassificationStructureEvent = function() {
        	// OHS20180323 추가 - 기본삭제전에 하위정보가 존재할경우 confirm으로 한번더 확인함
        	if(treeItem && treeItem.children && treeItem.children.length > 0) {
        		// 하위 정보가 존재합니다. 정말 삭제하시겠습니까?
        		deleteClassificationStructure(treeItem.id, treeItem.applyStartDate, bxMsg('DeleteExistSubData'));
        	}
        	else {
        		deleteClassificationStructure(treeItem.id, treeItem.applyStartDate, bxMsg('DPE00001_Delete_Confirm'));
        	}

        }

        /* --------------------------------------
         * Context Menu Event - 분류
         * -------------------------------------- */

        // 분류 신규 이벤트
        var createClassificationEvent = function() {
            var data = {work : "CREATE"};
            if(treeItem.level == 1){
                data.classificationStructureDistinctionCode = treeItem.id;
                data.higherClassificationCode = "";
                data.levelNumber = 0;
                data.applyStartDate = PFUtil.getNextDate() + ' 00:00:00';
                data.applyEndDate = '9999-12-31 23:59:59';
            }else if(treeItem.level > 1){
                data.classificationStructureDistinctionCode = treeItem.classificationStructureDistinctionCode;
                data.higherClassificationCode = treeItem.classificationCode;
                data.levelNumber = treeItem.levelNumber;
                data.applyStartDate = PFUtil.getNextDate() + ' 00:00:00';
                data.applyEndDate = '9999-12-31 23:59:59';
            }

            data.path = treeItem.path;

            renderClassificationPopup(data);
        }

        // 분류 조회 이벤트
        var searchClassificationEvent = function() {
            var requestData = { classificationStructureDistinctionCode : treeItem.classificationStructureDistinctionCode,
                classificationCode : treeItem.classificationCode,
                pdInfoDscd : pdInfoDscd,
                tntInstId: tntInstId,
                applyStartDate : treeItem.applyStartDate};
            PFRequest.get('/classification/getClassificationDetail.json',requestData, {
                success: function(responseMessage){
                    responseMessage.work = "UPDATE";
                    renderClassificationPopup(responseMessage);

                    // OHS20180323 추가 - 개발과제 매핑되도록 처리
                    if(responseMessage && responseMessage.projectBaseVO) {
                    	setTaskRibbonInput(responseMessage.projectBaseVO.projectId, responseMessage.projectBaseVO.name);
                    }
                },
                bxmHeader: {
                    application: 'PF_Factory',
                    service: 'ClassificationDetailService',
                    operation: 'queryClassificationDetail'
                }
            });
        }

        // 분류기본 삭제 이벤트
        var deleteClassificationEvent = function() {

            deleteClassification(treeItem.classificationStructureDistinctionCode, treeItem.classificationCode, treeItem.applyStartDate, treeItem);

        }

        /* --------------------------------------
         * Context Menu Event - 상품 관계 관리
         * -------------------------------------- */
        var PfRelationManagementEvent = function(){
            location.hash = makeClassificationInfoParameter(treeItem);
            var emptyObj;
            conditionInfoGrid = emptyObj;
            if(!modifyFlag){
                renderClassificationInfo(treeItem);
            }else{
                PFComponent.showConfirm(bxMsg('warningDontSaved'), function() {
                    renderClassificationInfo(treeItem);
                    modifyFlag = false;
                    //$('.most-significant-box').removeAttr('data-edited');
                }, function() {
                    return;
                });
            }
        }

        /* --------------------------------------
         * Context Menu
         * -------------------------------------- */
        var relationManagementLabel;
        if(pdInfoDscd == pdInfoDscd_Product){
            relationManagementLabel = bxMsg('PfRelationManagement');
        }
        else if(pdInfoDscd == pdInfoDscd_Service){
        	relationManagementLabel = bxMsg('ServiceRelationManagement');
        }
        else if(pdInfoDscd == pdInfoDscd_Point){
        	relationManagementLabel = bxMsg('PointRelationManagement');
        }

        // 분류체계 context menu
        var classificationStructureContextMenu = new Menu.ContextMenu({
            children: [
                makeContextMenu('icon-zoom-in', bxMsg('SearchClassificationStructure'), searchClassificationStructureEvent),    // 분류체계기본 조회
                makeContextMenu('icon-remove' , bxMsg('DeleteClassificationStructure'), deleteClassificationStructureEvent),    // 분류체계 삭제
                makeContextMenu('icon-plus'   , bxMsg('CreateClassification')         , createClassificationEvent)              // 분류 신규
            ]
        });

        var classificationStructureActiveContextMenu = new Menu.ContextMenu({
            children: [
                makeContextMenu('icon-zoom-in', bxMsg('SearchClassificationStructure'), searchClassificationStructureEvent),    // 분류체계기본 조회
                makeContextMenu('icon-plus'   , bxMsg('CreateClassification')         , createClassificationEvent)              // 분류 신규
            ]
        });

        var centerClassificationStructureContextMenu = new Menu.ContextMenu({
            children: [
                makeContextMenu('icon-zoom-in', bxMsg('SearchClassificationStructure'), searchClassificationStructureEvent),    // 분류체계기본 조회
            ]
        });

        //상품그룹 context menu
        var productGroupContextMenu = new Menu.ContextMenu({
            children: [
                makeContextMenu('icon-zoom-in', bxMsg('SearchProductBaseGroup'), searchClassificationStructureEvent),           // 상품그룹기본 조회
                makeContextMenu('icon-remove' , bxMsg('DeleteProductBaseGroup'), deleteClassificationStructureEvent),           // 상품그룹기본 삭제
                makeContextMenu('icon-plus'   , bxMsg('CreateProductGroupSub')         , createClassificationEvent)                // 분류 신규
            ]
        });
        var productGroupActiveContextMenu = new Menu.ContextMenu({
            children: [
                makeContextMenu('icon-zoom-in', bxMsg('SearchProductBaseGroup'), searchClassificationStructureEvent),           // 상품그룹기본 조회
                makeContextMenu('icon-plus'   , bxMsg('CreateProductGroupSub')         , createClassificationEvent)                // 분류 신규
            ]
        });

        var centerProductGroupContextMenu = new Menu.ContextMenu({
            children: [
                makeContextMenu('icon-zoom-in', bxMsg('SearchProductGroup'), searchClassificationStructureEvent),    // 분류체계기본 조회
            ]
        });

        // OHS 2017.02.27 추가 - 서비스그룹 context menu
        var serviceGroupContextMenu = new Menu.ContextMenu({
            children: [
                makeContextMenu('icon-zoom-in', bxMsg('SearchServiceBaseGroup'), searchClassificationStructureEvent),           // 서비스그룹기본 조회
                makeContextMenu('icon-remove' , bxMsg('DeleteServiceBaseGroup'), deleteClassificationStructureEvent),           // 서비스품그룹기본 삭제
                makeContextMenu('icon-plus'   , bxMsg('CreateServiceGroupSub')         , createClassificationEvent)             // 하위 그룹 신규
            ]
        });
        var serviceGroupActiveContextMenu = new Menu.ContextMenu({
            children: [
                makeContextMenu('icon-zoom-in', bxMsg('SearchServiceBaseGroup'), searchClassificationStructureEvent),           // 서비스그룹기본 조회
                makeContextMenu('icon-plus'   , bxMsg('CreateServiceGroupSub')         , createClassificationEvent)             // 하위 신규
            ]
        });

        var centerserviceGroupContextMenu = new Menu.ContextMenu({
            children: [
                makeContextMenu('icon-zoom-in', bxMsg('SearchServiceGroup'), searchClassificationStructureEvent),    			// 서비스그룹 조회
            ]
        });

        // 분류 상품관계도 없고 하위분류도 없는 경우 Context menu - 모든 context menu를 다 보여줌.
        var classificationBottomContextMenu = new Menu.ContextMenu({
            children: [
                makeContextMenu('icon-zoom-in', bxMsg('SearchClassification'), searchClassificationEvent),          // 분류 조회
                makeContextMenu('icon-remove' , bxMsg('DeleteClassification'), deleteClassificationEvent),          // 분류 삭제
                makeContextMenu('icon-plus'   , bxMsg('CreateClassification'), createClassificationEvent),          // 분류 신규
                makeContextMenu('icon-file'   , relationManagementLabel, PfRelationManagementEvent)           // 상품관계관리
            ]
        });

        var classificationBottomActiveContextMenu = new Menu.ContextMenu({
            children: [
                makeContextMenu('icon-zoom-in', bxMsg('SearchClassification'), searchClassificationEvent),          // 분류 조회
                makeContextMenu('icon-plus'   , bxMsg('CreateClassification'), createClassificationEvent),          // 분류 신규
                makeContextMenu('icon-file'   , relationManagementLabel, PfRelationManagementEvent)           // 상품관계관리
            ]
        });


        // 분류 Related Context menu
        var classificationRelatedContextMenu = new Menu.ContextMenu({
            children: [
                makeContextMenu('icon-zoom-in', bxMsg('SearchClassification'), searchClassificationEvent),          // 분류 조회
                makeContextMenu('icon-remove' , bxMsg('DeleteClassification'), deleteClassificationEvent),          // 분류 삭제
                makeContextMenu('icon-file'   , relationManagementLabel, PfRelationManagementEvent)           // 상품관계관리
            ]
        });

        var classificationRelatedActiveContextMenu = new Menu.ContextMenu({
            children: [
                makeContextMenu('icon-zoom-in', bxMsg('SearchClassification'), searchClassificationEvent),          // 분류 조회
                makeContextMenu('icon-file'   , relationManagementLabel, PfRelationManagementEvent)           // 상품관계관리
            ]
        });

        // 상품그룹 Related Context menu
        var productGroupRelatedContextMenu = new Menu.ContextMenu({
            children: [
                makeContextMenu('icon-zoom-in', bxMsg('SearchProductGroup'), searchClassificationEvent),            // 상품그룹 조회
                makeContextMenu('icon-remove' , bxMsg('DeleteProductGroup'), deleteClassificationEvent),            // 상품그룹 삭제
                makeContextMenu('icon-file'   , relationManagementLabel, PfRelationManagementEvent)           // 상품관계관리
            ]
        });

        var productGroupRelatedActiveContextMenu = new Menu.ContextMenu({
            children: [
                makeContextMenu('icon-zoom-in', bxMsg('SearchProductGroup'), searchClassificationEvent),            // 상품그룹 조회
                makeContextMenu('icon-file'   , relationManagementLabel, PfRelationManagementEvent)           // 상품관계관리
            ]
        });

        var centerProductGroupRelatedContextMenu = new Menu.ContextMenu({
            children: [
                makeContextMenu('icon-zoom-in', bxMsg('SearchProductGroup'), searchClassificationEvent),            // 상품그룹 조회
            ]
        });

        // OHS 2017.02.27 추가 - 서비스그룹 Related Context menu
        var serviceGroupRelatedContextMenu = new Menu.ContextMenu({
            children: [
                makeContextMenu('icon-zoom-in', bxMsg('SearchServiceGroup'), searchClassificationEvent),            // 상품그룹 조회
                makeContextMenu('icon-remove' , bxMsg('DeleteServiceGroup'), deleteClassificationEvent),            // 상품그룹 삭제
                makeContextMenu('icon-file'   , relationManagementLabel, PfRelationManagementEvent)           // 분류체계정보
            ]
        });

        var serviceGroupRelatedActiveContextMenu = new Menu.ContextMenu({
            children: [
                makeContextMenu('icon-zoom-in', bxMsg('SearchServiceGroup'), searchClassificationEvent),            // 서비스그룹 조회
                makeContextMenu('icon-file'   , relationManagementLabel, PfRelationManagementEvent)           	// 서비스그룹정보
            ]
        });

        var centerServiceGroupRelatedContextMenu = new Menu.ContextMenu({
            children: [
                makeContextMenu('icon-zoom-in', bxMsg('SearchServiceGroup'), searchClassificationEvent),            // 서비스그룹 조회
            ]
        });

        // 분류 하위분류 있는 경우 Context menu
        var classificationContextMenu = new Menu.ContextMenu({
            children: [
                makeContextMenu('icon-zoom-in', bxMsg('SearchClassification'), searchClassificationEvent),          // 분류 조회
                makeContextMenu('icon-remove' , bxMsg('DeleteClassification'), deleteClassificationEvent),          // 분류 삭제
                makeContextMenu('icon-plus'   , bxMsg('CreateClassification'), createClassificationEvent)           // 분류 신규
            ]
        });

        var classificationActiveContextMenu = new Menu.ContextMenu({
            children: [
                makeContextMenu('icon-zoom-in', bxMsg('SearchClassification'), searchClassificationEvent),          // 분류 조회
                makeContextMenu('icon-plus'   , bxMsg('CreateClassification'), createClassificationEvent)           // 분류 신규
            ]
        });

        var centerClassificationContextMenu = new Menu.ContextMenu({
            children: [
                makeContextMenu('icon-zoom-in', bxMsg('SearchClassification'), searchClassificationEvent),          // 분류 조회
            ]
        });


        // context menu 추가
        navTree.on('itemcontextmenu', function(ev){

            if(loginTntInstId != tntInstId) return; // 타기관 선택 시 contextmenu 보여주지 않음

            var item = ev.item;
            navTree.setSelected(item);
            treeItem = item;

            var y = ev.pageY >= 500 ? ev.pageY-(28*4) : ev.pageY;


            if(treeItem.level == 1){
                // 분류체계인 경우
                if(pageType === pageType_Classification){
                    if(writeYn != 'Y'){
                        centerClassificationStructureContextMenu.set('xy', [ev.pageX, y]);
                        centerClassificationStructureContextMenu.show();
                    }
                    // 비활동이거나 emergency
                    else if(treeItem.activeYn == 'N' || (getSelectedProjectId() && isEmergency(getSelectedProjectId()))){
                        classificationStructureContextMenu.set('xy', [ev.pageX, y]);
                        classificationStructureContextMenu.show();
                    }
                    // 활동일때
                    else{
                        classificationStructureActiveContextMenu.set('xy', [ev.pageX, y]);
                        classificationStructureActiveContextMenu.show();
                    }
                }
                // 상품그룹인 경우
                else if(pageType === pageType_ProductGroupPage){
                    if(writeYn != 'Y'){
                        centerProductGroupContextMenu.set('xy', [ev.pageX, y]);
                        centerProductGroupContextMenu.show();
                    }
                    else if(treeItem.activeYn == 'N' || (getSelectedProjectId() && isEmergency(getSelectedProjectId()))){
                        productGroupContextMenu.set('xy', [ev.pageX, y]);
                        productGroupContextMenu.show();
                    }
                    else{
                        productGroupActiveContextMenu.set('xy', [ev.pageX, y]);
                        productGroupActiveContextMenu.show();
                    }
                }
                // OHS 2017.02.23 추가 - 서비스그룹 추가
                else if(pageType === pageType_ServiceGroupPage) {
                    if(writeYn != 'Y'){
                        centerServiceGroupContextMenu.set('xy', [ev.pageX, y]);
                        centerServiceGroupContextMenu.show();
                    }
                    else if(treeItem.activeYn == 'N' || (getSelectedProjectId() && isEmergency(getSelectedProjectId()))){
                        serviceGroupContextMenu.set('xy', [ev.pageX, y]);
                        serviceGroupContextMenu.show();
                    }
                    else{
                        serviceGroupActiveContextMenu.set('xy', [ev.pageX, y]);
                        serviceGroupActiveContextMenu.show();
                    }
                }
            }
            // 분류인 경우
            else if(treeItem.level > 1) {
                if(pageType === pageType_ProductGroupPage){
                    if(writeYn != 'Y'){
                        centerProductGroupRelatedContextMenu.set('xy', [ev.pageX, y]);
                        centerProductGroupRelatedContextMenu.show();
                    }
                    else if(treeItem.activeYn == 'N' || (getSelectedProjectId() && isEmergency(getSelectedProjectId()))){
                        productGroupRelatedContextMenu.set('xy', [ev.pageX, y]);
                        productGroupRelatedContextMenu.show();
                    }
                    else {
                        productGroupRelatedActiveContextMenu.set('xy', [ev.pageX, y]);
                        productGroupRelatedActiveContextMenu.show();
                    }
                }
                // OHS 2017.02.23 추가 - 서비스그룹 추가
                else if(pageType === pageType_ServiceGroupPage) {
                    if(writeYn != 'Y'){
                        centerServiceGroupRelatedContextMenu.set('xy', [ev.pageX, y]);
                        centerServiceGroupRelatedContextMenu.show();
                    }
                    else if(treeItem.activeYn == 'N' || (getSelectedProjectId() && isEmergency(getSelectedProjectId()))){
                        serviceGroupRelatedContextMenu.set('xy', [ev.pageX, y]);
                        serviceGroupRelatedContextMenu.show();
                    }
                    else {
                        serviceGroupRelatedActiveContextMenu.set('xy', [ev.pageX, y]);
                        serviceGroupRelatedActiveContextMenu.show();
                    }
                }
                else if(pageType === pageType_Classification){
                    if(writeYn != 'Y'){
                        centerClassificationContextMenu.set('xy', [ev.pageX, y]);
                        centerClassificationContextMenu.show();
                    }else{
                        // 상품관계가 연결된 경우
                        if(treeItem.related){
                            if(treeItem.activeYn == 'N' || (getSelectedProjectId() && isEmergency(getSelectedProjectId()))) {
                                classificationRelatedContextMenu.set('xy', [ev.pageX, y]);
                                classificationRelatedContextMenu.show();
                            }else{
                                classificationRelatedActiveContextMenu.set('xy', [ev.pageX, y]);
                                classificationRelatedActiveContextMenu.show();
                            }
                        }
                        // 상품관계가 연결되지 않은 경우
                        else{
                            // 하위 분류가 없는 경우
                            if (treeItem.leaf) {
                                if(treeItem.activeYn == 'N' || (getSelectedProjectId() && isEmergency(getSelectedProjectId()))) {
                                    classificationBottomContextMenu.set('xy', [ev.pageX, y]);
                                    classificationBottomContextMenu.show();
                                }else{
                                    classificationBottomActiveContextMenu.set('xy', [ev.pageX, y]);
                                    classificationBottomActiveContextMenu.show();
                                }

                            }
                            // 하위 분류가 있는 경우
                            else {
                                if(treeItem.activeYn == 'N' || (getSelectedProjectId() && isEmergency(getSelectedProjectId()))){
                                    classificationContextMenu.set('xy', [ev.pageX, y]);
                                    classificationContextMenu.show();
                                }
                                else {
                                    classificationActiveContextMenu.set('xy', [ev.pageX, y]);
                                    classificationActiveContextMenu.show();
                                }
                            }
                        }
                    }
                }
            }

            return false;
        });

    });


}

// 트리 박스 스크롤
function scrollMove(){
	if($('.pfui-tree-item.pfui-tree-item-selected')
			&& $('.pfui-tree-item.pfui-tree-item-selected').offset()) {
	    var selectedItemTop = $('.pfui-tree-item.pfui-tree-item-selected').offset().top;
	    $('.pf-left-nav .pf-panel-body').scrollTop(selectedItemTop-200);
	}
}

//
function traceTree() {
    if(traceTree.completeTrace) {return;}

    var currentNode = navTreeStore.findNode(traceTree.traceList[traceTree.depth]);

    // OHS20180323 수정 - 트리를 선택하고, 해당트리에 더블클릭 이벤트를주어 상세페이지가 열리도록 처리
    if(((traceTree.traceList.length - 1) === traceTree.depth)) {
        setTimeout(function() {
            classForEvent = currentNode;
            navTree.setSelection(currentNode);

        	if(!traceTree.notDblClick) {
            	setTimeout(function() {
            		$('.pfui-tree-item.pfui-tree-item-selected').trigger('dblclick');
	            }, 100);
            }
            scrollMove();
        }, 500);
        
        traceTree.completeTrace = true;
        return;
    }else {
    	navTree.expandNode(currentNode);
        // OHS 20180326 추가 - 트리의 마지막일때만 setSelection 처리한다.
        if(currentNode && currentNode.leaf == true) {
        	navTree.setSelection(currentNode);
	        setTimeout(function() {
	        	$('.pfui-tree-item.pfui-tree-item-selected').trigger('dblclick');
	        }, 100);
        }
    }
    traceTree.depth++;
}

/******************************************************************************************************************
 * 그리드 관련
 ******************************************************************************************************************/
function renderClassificationGrid(data) {

    var columns = [];

    if(pdInfoDscd == pdInfoDscd_Product) {
        columns.push({text: bxMsg('DPP0107String1'), flex: 1, dataIndex: 'pdInformationCode'});                  // 상품코드
        columns.push({text: bxMsg('DPP0107String2'), flex: 2, dataIndex: 'pdInformationName'});                  // 상품명
    }else if(pdInfoDscd == pdInfoDscd_Service) {
        columns.push({text: bxMsg('ServiceCode'), flex: 1, dataIndex: 'pdInformationCode'});                  // 상품코드
        columns.push({text: bxMsg('ServiceName'), flex: 2, dataIndex: 'pdInformationName'});                  // 상품명
    }else if(pdInfoDscd == pdInfoDscd_Point) {
        columns.push({text: bxMsg('PointCode'), flex: 1, dataIndex: 'pdInformationCode'});                  // 상품코드
        columns.push({text: bxMsg('PointName'), flex: 2, dataIndex: 'pdInformationName'});                  // 상품명
    }

    columns.push({
        text: bxMsg('DPP0127String6'), width: 150, dataIndex: 'applyStartDate',                            // 적용시작일
        editor: {
            allowBlank: false,
            listeners: {
                focus: function(_this) {
                    var isNextDay = true;
                    if(getSelectedProjectId() && (isEmergency(getSelectedProjectId()) || isUpdateStatus(getSelectedProjectId()))){
                        isNextDay = false;
                    }
                    PFUtil.getGridDateTimePicker(_this, 'applyStartDate', relatedPdGrid, selectedCellIndex, isNextDay);
                },
                blur: function(_this, e){
                    PFUtil.checkDate(e.target);
                }
            }
        },
        listeners: {
            click: function() {
                selectedCellIndex = $(arguments[1]).parent().index();
            }
        }
    });

    columns.push({
        text: bxMsg('DPP0127String7'), width:150,dataIndex:'applyEndDate',     // 적용종료일
        editor: {
            allowBlank: false,
            listeners: {
                focus: function(_this) {
                    PFUtil.getGridDateTimePicker(_this, 'applyEndDate', relatedPdGrid, selectedCellIndex, true);
                },
                blur: function(_this, e){
                    PFUtil.checkDate(e.target, '9999-12-31 23:59:59');
                }
            }
        },
        listeners: {
            click: function() {
                selectedCellIndex = $(arguments[1]).parent().index();
            }
        }
    });

    columns.push({   // delete row
        xtype: 'actioncolumn', width: 35, align: 'center', sortable: false,
        items: [{
            icon: '/images/x-delete-16.png',
            handler: function (grid, rowIndex, colIndex, item, e, record) {
                if(record.data.activeYn == 'N' || (getSelectedProjectId() && isEmergency(getSelectedProjectId())) ) {
                    if (record.data.process != 'C') {
                        record.data.process = 'D';
                        productRelgridDeleteData.push(record.data);
                    }
                    record.destroy();
                    modifyFlag = true;
                }else{
                    PFComponent.showMessage(bxMsg('dontDeleteActiveTypeConditionTemplate'), 'warning');
                }
            }
        }]
    });

    relatedPdGrid = PFComponent.makeExtJSGrid({
        //pageAble: true,
        fields: ['pdInformationCode', 'pdInformationName', 'applyStartDate', 'applyEndDate', 'activeYn', 'process'],
        gridConfig: {
            renderTo: '.pf-cl-grid',
            columns: columns,
            listeners: {
                scope: this,
                'celldblclick': function (_this, td, cellIndex, record, tr, rowIndex, e, eOpts) {

                    var cntnt = $('.apply-rule').val() + "#"+record.get('pdInformationCode');
                    $('.apply-rule').val(cntnt);

                    if (classificationTokens) {
	                    // OHS20180502 추가 - 계산영역처럼 적용
	                    classificationTokens.push({
	                        type: TokenType.CONDITION,
	                        value: "#"+record.get('pdInformationCode')
	                    });
                    }
                }
            },
            plugins: [getGridCellEditiongPlugin()]
        }
    });

    relatedPdGrid.setData(data);
}

// grid cell editing plugin
function getGridCellEditiongPlugin(){
    return Ext.create('Ext.grid.plugin.CellEditing', {
        clicksToEdit: 1,
        listeners : {
            afteredit: function(e, editor){
                if(editor.originalValue !=  editor.value){
                    if(editor.field != 'applyEndDate' && (editor.record.get('process') == null || editor.record.get('process').length == 0)) {
                        var originalData = $.extend(true, {}, editor.record.data);
                        originalData[editor.field] = editor.record.modified[editor.field];
                        originalData['process'] = 'D';
                        productRelgridDeleteData.push(originalData);

                        editor.record.set('process', 'C');
                    }else if(editor.record.get('process') != 'C'){
                        editor.record.set('process', 'U');
                    }
                    modifyFlag = true;
                }
            },
            beforeedit:function(e, editor){
                if( editor.record.data.activeYn == 'N' ||                                            // 비활동인 경우
                    (getSelectedProjectId() && isEmergency(getSelectedProjectId()))    ||     // emergency 인 경우
                    (getSelectedProjectId() && isUpdateStatus(getSelectedProjectId())) ){     // 상품정보 수정인 경우
                    // 모두 수정 가능
                }
                else if(editor.field == 'applyStartDate' && editor.record.get('process') != 'C') {
                    return false;
                }
            }
        }
    });
}

// 그리드 new data
function setNewGridData(clickEventForNewData,relatedPdGrid){

    var applyStartDate = PFUtil.getNextDate() + ' ' + '00:00:00';
    var applyEndDate = '9999-12-31 23:59:59';

    clickEventForNewData.applyStartDate = applyStartDate;
    clickEventForNewData.applyEndDate = applyEndDate;
    clickEventForNewData.applyStart = applyStartDate;
    clickEventForNewData.applyEnd = applyEndDate;
    clickEventForNewData.activeYn = 'N';
    clickEventForNewData.process = 'C';

    relatedPdGrid.addData(clickEventForNewData);

    modifyFlag = true;
};

/******************************************************************************************************************
 * 사용자 함수
 ******************************************************************************************************************/
// 파라미터 조합
function makeClassificationInfoParameter(treeItem) {
    var returnVal = ''; // OHS20180322 수정 - 문자열조립을 위해 ''로 초기화

    if (treeItem.level == 1) {
        returnVal = 'classificationStructureDistinctionCode=' + treeItem.id;
    }else if(treeItem.level > 1) { // OHS20180322 수정 - 문법오류 수정
        returnVal = 'classificationStructureDistinctionCode=' + treeItem.classificationStructureDistinctionCode
            + '&classificationCode=' + treeItem.classificationCode;
    }

    return returnVal;
}


// Context Menu 생성
function makeContextMenu(icon, title, clickEvent, UIEvent){
    var listener;

    if(UIEvent){
        listener = {
            'click': function (e) {
                clickEvent();
            },
            afterRenderUI: function(e) {
                UIEvent();
            }
        }
    } else{
        listener = {
            'click': function (e) {
                clickEvent();
            }
        }
    }

    var contextMenu = {
        iconCls: icon,
        text: title,
        listeners: listener
    }

    return contextMenu;
}





function renderConditionInfoGrid(){
    conditionInfoGrid = PFComponent.makeExtJSGrid({
        pageAble: true,
        fields: ['cndCode', 'cndName', 'conditionTypeCode', 'applyStart','applyEnd', 'conditionValue', 'conditionDetailTypeCode', 'conditionClassifyCode'
            ,'status','complexConditionTitleInfoList', 'complexConditionMatrix', 'rangeConditionValue', 'listConditionValue',
            {name:'rangeConditionValue',
                convert: function(newValue, record) {
                    if (newValue) {
                        return newValue;
                    } else {
                        if (!record || !newValue) {
                            var rangeConditionValue = {};
                            rangeConditionValue.minValue = '0.00';
                            rangeConditionValue.maxValue = '0.00';
                            rangeConditionValue.increaseValue = '0.00';
                            rangeConditionValue.defalueValue = '0.00';
                        }
                        return rangeConditionValue;
                    }
                }
            },
             'process'],
        gridConfig: {
            renderTo: '.pf-cnd-tmplt-grid',
            columns: [
                {text: bxMsg('DPP0128String2'), flex: 0.3, dataIndex: 'cndCode'},
                {text: bxMsg('DTP0203String2'), flex: 1, dataIndex: 'cndName'},
                {text: bxMsg('DPP0127String6'), width: 150, dataIndex: 'applyStart'},
                {text: bxMsg('DPP0127String7'), width:150,dataIndex:'applyEnd'},
                {
                    text: bxMsg('ConditionValue'),
                    flex: 1,
                    renderer: function (value, p, record) {
                        var yVal = '', extFormat, yTitle1 = '', yVal1 = '';
                        var conditionTypeCode = record.get('conditionTypeCode');
                        var conditionClassifyCode = record.get('conditionClassifyCode');

                        if (conditionTypeCode == '01') {

                            if (conditionClassifyCode === '01'&& record.get('listConditionValue')) {
                                record.get('listConditionValue').defineValues.forEach(function (el) {

                                    if(el.isSelected){
                                        yVal = yVal + el.code + '，';
                                    }

                                });

                                if (yVal != '' && yVal.length > 0) {
                                    yVal = yVal.substring(0, yVal.length - 1);
                                }
                            }else if(conditionClassifyCode === '02'){
                                yVal = codeMapObj['ProductConditionClassifyCode']['02'];
                            }

                            extFormat = Ext.String.format('<p class="ext-condition-value-column">{0}</p>', yVal);
                        } else {

                            var minString, maxString, defaultString;

                            if(!conditionClassifyCode|| conditionClassifyCode === '01') {
                                minString = record.get('rangeConditionValue').minValue;

                                if(record.get('rangeConditionValue').isSystemMaxValue){
                                    maxString = bxMsg('systemMax');
                                }else{
                                    maxString = record.get('rangeConditionValue').maxValue;
                                }
                                defaultString = record.get('rangeConditionValue').defalueValue;
                            	
                            	
                            	// OHS 20180417 추가 - 소숫점일치를 위해 추가
                            	// 금액
                            	if(record.get('conditionDetailTypeCode') == '01') {
                                	defaultString = PFValidation.gridFloatCheckRenderer(defaultString, 19, 2, true);
                                	minString = PFValidation.gridFloatCheckRenderer(minString, 19, 2, true);
                                	if(!record.get('rangeConditionValue').isSystemMaxValue) {
                                		maxString = PFValidation.gridFloatCheckRenderer(maxString, 19, 2, true);
                                	}
                            	}
                            	// 율
                            	else if(record.get('conditionDetailTypeCode') == '05' || record.get('conditionDetailTypeCode') == '08') {
                                	defaultString = PFValidation.gridFloatCheckRenderer(defaultString, 3, 6, true);
                                	minString = PFValidation.gridFloatCheckRenderer(minString, 3, 6, true);
                                	if(!record.get('rangeConditionValue').isSystemMaxValue) {
                                		maxString = PFValidation.gridFloatCheckRenderer(maxString, 3, 6, true);
                                	}
                            	}
                            	else {
                                	defaultString = PFValidation.gridFloatCheckRenderer(defaultString, 8, 0, true);
                                	minString = PFValidation.gridFloatCheckRenderer(minString, 8, 0, true);
                                	if(!record.get('rangeConditionValue').isSystemMaxValue) {
                                		maxString = PFValidation.gridFloatCheckRenderer(maxString, 8, 0, true);
                                	}
                            	}
                            	
                                yTitle1 = bxMsg('DPS0129Unit1String1') + ' : ';
                                yVal1 = minString + '~' + maxString + '(' + defaultString + ')';

                                extFormat = Ext.String.format('<p class="ext-condition-value-column">{0} {1} </p>', yTitle1, yVal1);
                            }else if(conditionClassifyCode === '02') {
                                extFormat = Ext.String.format('<p class="ext-condition-value-column">{0}</p>', codeMapObj['ProductConditionClassifyCode']['02']);
                            }
                        }

                        return extFormat;
                    }
                },
            ],
            listeners: {
                scope: this,
                'celldblclick': function (_this, td, cellIndex, record, tr, rowIndex, e, eOpts) {

                    isComplexGridRend = false;
                    //set popup data
                    var popupData = {};
                    var isNew;

                    popupData = record.data;
                    selectedCondition = record.data;

                    popupData.productClassificationCode = productClassificationCode;
                    popupData.statusNm = codeMapObj['ProductStatusCode'][popupData.status];


                    if(popupData.process === 'C'){
                        isNew = true;
                    }else {
                        isNew = false;
                    }

                    isNewData = isNew;

                    //목록
                    if (popupData.conditionTypeCode == '01') {
                        popupData.conditionTypeCodeNm = codeArrayObj['ProductConditionTypeCode'][0].name;
                    }
                    //범위
                    else if (popupData.conditionTypeCode == '02') {
                        popupData.conditionTypeCodeNm = codeArrayObj['ProductConditionTypeCode'][1].name;
                    }

                    if (record.get('conditionTypeCode') === '01') {

                        var requestParam = {};

                        requestParam.tntInstId = tntInstId;
                        requestParam.conditionCode = popupData.cndCode;

                        PFRequest.get('/condition/template/getConditionTemplate.json', requestParam, {
                            success: function (responseData) {

                                var detailList = [];
                                var selectedList;

                                    if (!popupData.listConditionValue) {
                                        selectedList = [];
                                        popupData.listConditionValue = {};
                                    } else {
                                        selectedList = popupData.listConditionValue.defineValues;
                                    }

                                for (var i = 0; i < responseData.values.length; i++) {

                                    var data = {};
                                    data.code = responseData.values[i].key;
                                    data.name = responseData.values[i].value;

                                    if(popupData.conditionClassifyCode !== '02') {
                                        for (var j = 0; j < selectedList.length; j++) {
                                            if (selectedList[j].isSelected && data.code === selectedList[j].code) {
                                                data.isSelected = true;
                                                if (selectedList[j].isDefaultValue) {
                                                    data.isDefaultValue = true;
                                                }
                                            }
                                        }
                                    }
                                    detailList.push(data);
                                }

                                popupData.listConditionValue.defineValues = detailList;
                                selectedCondition = popupData;
                                cndValueType1Grid = null;
                                makeConditionValueManagementPopup(selectedCondition, rowIndex, isNew);

                            },
                            bxmHeader: {
                                application: 'PF_Factory',
                                service: 'CndTemplateService',
                                operation: 'queryCndTemplate'
                            }
                        });

                    } else {
                        selectedCondition = popupData;
                        makeConditionValueManagementPopup(selectedCondition, rowIndex, isNew);
                    }

                }
            },
            plugins: [getGridCellEditiongPlugin()]
        }
    });
    return conditionInfoGrid;
}




function searchClassificationConditionList(searchBaseDate) {

    var requestData = {};

    if(searchBaseDate && searchBaseDate !== null && searchBaseDate !== ''){
        requestData.applyStart = searchBaseDate;
    }

    requestData.tntInstId = tntInstId;
    requestData.pdInfoDscd = pdInfoDscd;
    requestData.classificationStructureDistinctionCode = classForEvent.classificationStructureDistinctionCode;
    requestData.classificationCode = classForEvent.classificationCode;
    requestData.isComplexCnd = false;

    PFRequest.get('/classification/getListClassificationCnd.json', requestData, {
        success: function (result) {
            // 삼품그룹 조건정보 그리드
            result.forEach(function (el) {
                el.status = el.cndStatusCode;

                if (!el.isComplexCnd) { //단순

                    el.conditionClassifyCode = '01';

                    if (el.conditionTypeCode === '01') {//목록
                        var conditionList = [];

                        el.listConditionValue.defineValues.forEach(function (condition) {
                            var obj = {}
                            obj.listCode = condition.code;
                            conditionList.push(obj);
                        });
                        el.conditionList = conditionList
                    } else if (el.conditionTypeCode === '02') {//범위
                        el.conditionDetailTypeCode = el.rangeConditionValue.conditionDetailTypeCode;
                    }
                } else if (el.isComplexCnd) {//복합

                    el.conditionClassifyCode = '02';

                    if (el.conditionTypeCode === '02') {//범위
                        el.conditionDetailTypeCode = el.complexConditionMatrix[0].y.conditionDetailTypeCode;
                    }
                }
            });

            if(!conditionInfoGrid){
                conditionInfoGrid = renderConditionInfoGrid();
            }
            conditionInfoGrid.setData(result);
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'ClassificationCndService',
            operation: 'queryListClassificationCnd'
        }
    });
}





// 개발과제가 Emergency 일 때
function fnEmergencyControl(flag){

    if(writeYn == 'Y'){
        if(flag) {
            $('.write-btn').prop('disabled', false);

            if(isNewData){
                $('.cnd-mod-btn').prop('disabled', true);
            }
            if($('.condition-table-wrap .status').val() == '01'){
                $('.cnd-reg-btn').prop('disabled', true);
            }else if($('.condition-table-wrap .status').val() == '04'){
                $('.cnd-mod-btn').prop('disabled', false);
                $('.cnd-delete-btn').prop('disabled', false);
            }
        }
        else{

            if(isNewData){
                $('.cnd-reg-btn').prop('disabled', false);
            }

            if($('.cls-active-yn-select').val() == 'Y' || $('.cls-str-active-yn-select').val() == 'Y'){
                $('.delete-btn').prop('disabled', true);
            }

            if($('.condition-table-wrap .status').val() == '04'){
                $('.cnd-reg-btn').prop('disabled', false);
                $('.cnd-delete-btn').prop('disabled', true);
                $('.cnd-mod-btn').prop('disabled', true);
            }
        }
    }
}


function ruleVerifier(ruleContent){
	if(ruleContent == '') return true;
    ruleContent = ruleContent.toLowerCase();
    ruleContent = ruleContent.replace(/ /gi, '');
    
    // OHS20180416 추가 - 특이케이스 체크를 위함
	var _additionalRuleVerifier = function() {
		var resultFlag = true;

		// 규칙에 사용된 조건의 갯수
        var customCndCount = ruleContent.indexOf('#') != -1 ? ruleContent.split('#').length : 0;
        
		if(operator == 'match') {
			var pattOne = new RegExp(/\([0-9]+/);
			var pattTwo = new RegExp(/\)\)+/);
			resultFlag = pattOne.test(ruleContent);
			resultFlag = pattTwo.test(ruleContent);
			
			customCndCount = customCndCount + 1; // match에서는 문법상 ,가 하나더 무조건 있으므로 +1처리
		}
        // 조건의 갯수가 1개이상이어야 함
        // 조건의 갯수만큼 , 로 구분지어야 함. (조건갯수 - 1 은 , 의 갯수. 단, match는 예외처리)
        if(customCndCount - 1 > 1 
        		&& (ruleContent.indexOf(',') == -1)
        				|| (ruleContent.indexOf(',') != -1 && ruleContent.split(',').length != customCndCount -1)) {
        	resultFlag = false;
        	return resultFlag;
        }
        
        // OHS 20180418 추가 - 수수료할인 or 우대금리 or 적용규칙에서 동일한 Discount로 적용규칙을 구성하였을때 체크
        var verifierTokens = PFFormulaEditor.tokenize(ruleContent ? ruleContent.toUpperCase() : '');
        if(verifierTokens == null || verifierTokens.length < 1) {
        	resultFlag = false;
        	return resultFlag;
        }
        
        var functionType1 = null;
        var functionType2 = null;
        for(var i = 0; i < verifierTokens.length; i++) {
        	var dupDiscount = 0;
        	if(verifierTokens[i].type == TokenType.FUNCTION) {
        		functionType1 = verifierTokens[i].value;
        	}
        	
        	for(var j = 0; j < verifierTokens.length; j++) {
        		if(verifierTokens[j].type == TokenType.FUNCTION) {
                    functionType2 = verifierTokens[j].value;
                }
                // 같은 FUNCTION 일때
                if(functionType1 == functionType2) {
                    // 같은 DISCOUNT 일때
                    if(
                    		// 우대금리 이외의 적용규칙 패턴
                    		(TokenType.DISCOUNT == verifierTokens[i].type 
                            && TokenType.DISCOUNT == verifierTokens[j].type
                            && verifierTokens[i].value == verifierTokens[j].value)
                            ||
                            // 우대금리 패턴
                            (TokenType.CONDITION == verifierTokens[i].type 
                            && TokenType.CONDITION == verifierTokens[j].type
                            && verifierTokens[i].value == verifierTokens[j].value)) {
                        dupDiscount++;
                    }
                }
        	}
        	if(dupDiscount > 1) {
        		resultFlag = false;
        		break;
        	}
        }
		return resultFlag;
	}
	
    var node;
    var firstIndex = ruleContent.indexOf('(');
    var operator = ruleContent.substring(0, firstIndex);
    
    if(operator.length > 0 && operatorSet.has(operator)){
    	// OHS20180416 - 추가검증
    	if(!_additionalRuleVerifier(operator)) {
    		return false;
    	}
        //정의된 연산자중 하나면
        //괄호 안의 내용을 다시 검증
        var startIndex = 0;
        var count = 0;
        var lastIndex = ruleContent.lastIndexOf(')');
        var paramContent = ruleContent.substring(firstIndex + 1, lastIndex);

        // OHS20180416 추가 - 규칙에 ')' 가 없으면 false 처리
        if(lastIndex == -1 || lastIndex !== ruleContent.length-1){
            return false;
        }

        var result = null;

        for(var i = 0 ; i < paramContent.length ; i++){

            if(paramContent.charAt(i) === '('){
                count++;
            }else if(paramContent.charAt(i) === ')'){
                count--;
            }else if(paramContent.charAt(i) === ','){
                if(count === 0){
                    result = ruleVerifier(paramContent.substring(startIndex, i));
                    //재귀호출
                    startIndex = i+1;
                }
            }else if(paramContent.length === i+1){
                result = ruleVerifier(paramContent.substring(startIndex, i));
            }

            if(result !== null && !result){
                break;
            }
        }

        if(result === null){
            return false;
        }
        // OHS20180416 - 체크로직 추가
        if(ruleContent != "" && !ruleContent.match('\\(') && !ruleContent.match('\\)')){
            return false;
        }
        return result;

    }else{
        // OHS20180416 - 체크로직 추가
    	if(ruleContent != '' && operatorSet.has(ruleContent)) {
    		return false;
    	}
        //연산자가 아니고 피연산자(#****)도 아니면 에러
        var patt = new RegExp(/^#||[0-9]+/);
        if(!patt.test(ruleContent)){
            return false;
        }else{
            if(ruleContent.match('\\(') || ruleContent.match('\\)')){
                return false;
            }
            return true;
        }
    }
}

// 적용규칙 저장
function saveApplyRule(){

    if(!isHaveProject()){
        haveNotTask();
        return;
    }

    var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
    if(isNotMyTask(projectId)){
        return;
    }

    $applyRuleInfo = $('.pf-cl-apply-rule-wrap');
    var formData = PFComponent.makeYGForm($applyRuleInfo).getData();

    formData.projectId						= getSelectedProjectId();
    formData.ruleStatusCode					= $applyRuleInfo.find('.status').val();
    formData.tntInstId                      = getLoginTntInstId();
    formData.pdInfoDscd                     = pdInfoDscd;
    formData.classificationStructureDistinctionCode = classForEvent.classificationStructureDistinctionCode;
    formData.classificationCode = classForEvent.classificationCode
    formData.ruleApplyTargetDistinctionCode = '08';

    PFRequest.post('/benefit/saveBenefitRuleMaster.json', formData, {
        success: function(responseMessage) {
            if (responseMessage) {
                PFComponent.showMessage(bxMsg('workSuccess'), 'success');
                //resetFormModifed();
                searchApplyRule();
            }
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'BenefitRuleMasterService',
            operation: 'saveBenefitRuleMaster'
        }
    });
}

// 적용규칙 삭제
function deleteApplyRule(){

    if(!isHaveProject()){
        haveNotTask();
        return;
    }

    var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
    if(isNotMyTask(projectId)){
        return;
    }

    $applyRuleInfo = $('.pf-cl-apply-rule-wrap');
    var formData = PFComponent.makeYGForm($applyRuleInfo).getData();

    formData.projectId						= getSelectedProjectId();
    formData.tntInstId                      = getLoginTntInstId();

    PFRequest.post('/benefit/deleteBenefitRuleMaster.json', formData, {
        success: function(responseMessage) {
            if (responseMessage) {
                PFComponent.showMessage(bxMsg('workSuccess'), 'success');
                //resetFormModifed();
                searchApplyRule();
            }
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'BenefitRuleMasterService',
            operation: 'deleteBenefitRuleMaster'
        }
    });
}

// 적용규칙 조회
function searchApplyRule(){

    $applyRuleInfo = $('.pf-cl-apply-rule-wrap');

    var requestParam = {
        tntInstId                       : getLoginTntInstId(),
        ruleApplyTargetDistinctionCode  : '08',
        pdInfoDscd : pdInfoDscd,
        classificationStructureDistinctionCode : classForEvent.classificationStructureDistinctionCode,
        classificationCode : classForEvent.classificationCode
    };

    PFRequest.get('/benefit/getBenefitRuleMaster.json', requestParam, {
        success: function(responseData) {

            // 조회일때
        	// OHS 20180502 추가 - responseData 가 null 일경우 스크립트오류 발생
            if (responseData && responseData.ruleId) {
                $applyRuleInfo.find('.start-date').val(responseData.applyStartDate);
                $applyRuleInfo.find('.end-date').val(responseData.applyEndDate);
                $applyRuleInfo.find('.rule-id').val(responseData.ruleId);
                $applyRuleInfo.find('.apply-rule').val(responseData.ruleContent);
                $applyRuleInfo.find('.apply-rule-desc').val(responseData.ruleDesc);
                $applyRuleInfo.find('.max-amount').val(responseData.maxAmount);
                $applyRuleInfo.find('.max-rate').val(responseData.maxRate);
                $applyRuleInfo.find('.status').val(responseData.ruleStatusCode);
                $applyRuleInfo.find('.ruleId').val(responseData.ruleId);
                $applyRuleInfo.find('.rule-apply-target-distinction-code').val(responseData.ruleApplyTargetDistinctionCode); // OHS20171207 추가

                classificationTokens = PFFormulaEditor.tokenize(responseData.ruleContent); // OHS20180503 - 계산영역 token 적용

                if (responseData.ruleStatusCode == '01') {          // 상태코드
                    $('.pf-cp-apply-rule-delete-btn').prop('disabled', false);  // 삭제버튼 활성
                } else {
                    $('.pf-cp-apply-rule-delete-btn').prop('disabled', true);  // 삭제버튼 비활성
                }
                $('.pf-cp-apply-rule-grapic-view-btn').prop('disabled', false);  // 그래픽으로보기 버튼 활성

                // 신규일 때
            } else {
            	classificationTokens = PFFormulaEditor.tokenize(''); // OHS20180503 - 계산영역 token 적용, 초기화
                $applyRuleInfo.find('.start-date').val(PFUtil.getNextDate() + ' 00:00:00');
                $applyRuleInfo.find('.end-date').val('9999-12-31 23:59:59');
                $applyRuleInfo.find('.rule-id').val('');
                $applyRuleInfo.find('.apply-rule').val('');
                $applyRuleInfo.find('.apply-rule-desc').val('');
                $applyRuleInfo.find('.max-amount').val('0');
                $applyRuleInfo.find('.max-rate').val('0');
                $applyRuleInfo.find('.status').val('01');
                $applyRuleInfo.find('.rule-apply-target-distinction-code').val('08');
                $('.pf-cp-apply-rule-delete-btn').prop('disabled', true);  // 삭제버튼 비활성
                $('.pf-cp-apply-rule-grapic-view-btn').prop('disabled', true);  // 그래픽으로보기 버튼 비활성

            }
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'BenefitRuleMasterService',
            operation: 'queryBenefitRuleMaster'
        }
    });
}

function setTokens(value) {
	//OHS 20180416 추가 - 계산영역처럼 적용함
	var operatorSet = new Set();
	operatorSet.add('min');
	operatorSet.add('max');
	operatorSet.add('avg');
	operatorSet.add('sum');
	operatorSet.add('and');
	operatorSet.add('or');
	operatorSet.add('not');
	operatorSet.add('priority');
	operatorSet.add('match');
	
	var s = value != '' ? value.toLowerCase() : '';
	var type;
	
	if (operatorSet.has(s)) { // function
	  type = TokenType.FUNCTION;
	
	} else if (s === "(") {
	  type = TokenType.OPEN_BRACKET;
	
	} else if (s === ")") {
	  type = TokenType.CLOSE_BRACKET;
	
	} else if (s === ",") {
	  type = TokenType.COMMA;
	
	} else if (s === "+" || s === "-" || s === "*" || s === "/") {
	  type = TokenType.ARITHMETIC;
	} else {
	  type = TokenType.NUMBER;
	}
	s = s.toUpperCase();
	classificationTokens.push({
	  type: type,
	  value: s
	});
}