/**
 * fee discount integration java script
 * @author Product Factory Team
 * @version $$id: main.js, v 0.1 $$
 */
$(function() {
    $('body').css('overflow-y', 'scroll');
    lengthVlad('.length-check-input', 50);
    PFComponent.toolTip($el);

    // Start Rendering Page
    renderFeeDiscountIntegrationTreeBox();                       // 상품분류 Tree Box

});

var modifyFlag = false;
var selectedCellIndex;

var $el = $('.pf-fdi');          // Page Root jQuery Element

var feeDiscountIntegrationLeftTreeTpl,                       // 트리
    feeDiscountIntegrationInfoTpl,
    feeDiscountIntegrationBaseManagementPopupTpl,  // 수수료통합한도기본 관리
    feeDiscountIntegrationInfoFormTpl,                      // 상품관계관리
    limitCndInfoTpl,                                // 한도조건
    relProductAddPopupTpl,                          // 상품목록 검색
    cndValueType2Tpl,                               // 범위형 조건값입력 팝업
    cnd4FeePopupTpl,
    cnd4FeeSubPopupTpl
    ;

var detailRequestParam; //수수료할인팝업 호출시 사용 변수

// 상품정보구분코드
var pdInfoDscd_Product = '01';  // 상품
var pdInfoDscd_Service = '02';  // 서비스
var pdInfoDscd_Point   = '03';  // 포인트

var navTree, navTreeStore,
    relatedfeeDiscountGrid,
    limitConditionInfoGrid,
    feeDiscountLimitConditionInfoGrid,
    cndValueType1Grid,
    limitListCndCodeGrid,
    provListCndCodeHistoryGrid
    ;

var selectedCondition,
    YforNewColumn,
    isNewData;



var pdInfoDscd = '01';  // 초기값 = 상품
var loginTntInstId, tntInstId, mother;

var clickEventForNewData = {};

var feeDiscountIntegrationGridDeleteData = [],
    limitConditionInfogridDeleteDate  =[];

var onEvent = PFUtil.makeEventBinder($el);

var lengthVlad = PFValidation.realTimeLengthCheck($el);
// Load Template in HTML
feeDiscountIntegrationLeftTreeTpl = getTemplate('feeDiscountIntegrationLeftTreeTpl');
feeDiscountIntegrationInfoTpl = getTemplate('feeDiscountIntegrationInfoTpl');
feeDiscountIntegrationBaseManagementPopupTpl = getTemplate('feeDiscountIntegrationBaseManagementPopupTpl');
feeDiscountIntegrationInfoFormTpl = getTemplate('feeDiscountIntegrationInfoFormTpl');
limitCndInfoTpl = getTemplate('limitCndInfoTpl');
cnd4FeePopupTpl = getTemplate('cnd4FeePopupTpl');
cndApplyRuleTpl = getTemplate('cndApplyRuleTpl');  // 적용규칙
cnd4FeeSubPopupTpl = getTemplate('cnd4FeeSubPopupTpl');
cnd4FeeConditionValueType4TblByComplex = getTemplate('cnd4FeeConditionValueType4TblByComplex');
/******************************************************************************************************************
 * 이벤트 함수
 ******************************************************************************************************************/

onEvent('click', 'a', function (e) {
    e.preventDefault();
});

onEvent('click', '.refresh-icon', function(e) {
    renderFeeDiscountIntegrationNavTree.isRendered = false;
    renderFeeDiscountIntegrationNavTree();
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

    renderFeeDiscountIntegrationNavTree.isRendered = false;
    renderFeeDiscountIntegrationInfo();
    $el.find('.pf-cl-info-wrap').removeClass('active');
});

// 상품정보구분 콤보 변경 시
onEvent('change', '.pd-info-dscd', function(e) {
    pdInfoDscd = $('.pd-info-dscd').val();
    renderFeeDiscountIntegrationNavTree.isRendered = false;
    renderFeeDiscountIntegrationInfo();
});

// add button click event
onEvent('click', '.add-fee-discount-btn', function() {
    var submitEvent = function(data){
    	if(data){
	        $.each(data,function(index, row){
	            row.applyStartDate = PFUtil.getNextDate() + ' ' + '00:00:00';
	            row.process = 'C';
	            row.activeYn = 'N';
	            row.applyStartDateFeeDiscount = row.applyStartDate;
	            relatedfeeDiscountGrid.addData(row);
	            modifyFlag = true;
	        });
    	}
    }
    makeFeeDiscountSearchPopup(submitEvent);
});

onEvent('click', '.add-limit-cnd-btn', function(){
    var submitEvent = function(selectedData) {
        var data = selectedData[0];
        var code = data.code;
        var name = data.name;

        var requestData = {};

        requestData.tntInstId = tntInstId;
        requestData.feeDiscountIntegrationLimitCd = classForEvent.id;
        requestData.cndDscd = '02';
        requestData.providedConditionCode = code;

        PFRequest.get('/benefit/queryListBenefitProvideCndForFeeIntegration.json', requestData, {
            success: function (result) {
                // 삼품그룹 조건정보 그리드

                if(result.length > 0){
                    PFComponent.showMessage(bxMsg('AlreadySavedCondition'), 'warning');          // 분류체계기본명은 필수입력사항입니다
                }else{
                    data['applyStartDate'] = PFUtil.getNextDate() + ' 00:00:00';
                    data['applyEndDate'] = '9999-12-31 23:59:59';
                    data['process'] = 'C';
                    data['cndDscd'] = '02';

                    data['providedConditionTypeCode'] = data.type;
                    data['providedConditionCode'] = code;
                    data['providedConditionName'] = name;
                    data['providedConditionStatusCode'] = '01'; // 조건의 active 상태가 아님 -> 제공조건의 상태는 최소 01.수정가능으로 서비스에서 생성함.
                    data['providedConditionDetailTypeCode'] = data.conditionDetailTypeCode;
                    data['provideCndAdditionalInfoDetailList'] = [];

                    delete data['content'];
                    delete data['code'];
                    delete data['name'];
                    delete data['type'];
                    delete data['typeNm'];
                    delete data['conditionDetailTypeCode'];

                    renderLimitCndPopup(data); // /configurator/product/js/limit-condition-popup.js
                }
            },
            bxmHeader: {
                application: 'PF_Factory',
                service: 'BenefitProvideCndService',
                operation: 'queryListBenefitProvideCndForIntegration'
            }
        });
    };

    renderAddLimitCndPopup(submitEvent);
});

onEvent('click', '.fee-dicount-rel-save-btn', function() {
	saveFeeDiscountRelation();
    var emptyObj;
    limitConditionInfoGrid = emptyObj;
});

onEvent('contextmenu','.pf-panel-body', function(e){

    var target = e.target.className;

    if(target != 'pf-panel-body') return;

    if(loginTntInstId != tntInstId) return; // 선택한 기관이 로그인한 기관코드와 다른 경우 분류체계 신규 context menu를 보여주지 않음

    // 분류체계 신규 context menu
    PFUI.use(['pfui/menu'], function (Menu) {

        // 분류체계신규 이벤트
        var createFeeDiscountIntegrationEvent = function () {
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

            var data = {work: "CREATE"};
            renderFeeDiscountIntegrationBasePopup(data);
        }

        if(writeYn != 'Y'){
            return;
        }

        // 분류체계 신규 context menu
        var feeDiscountIntegrationNewContextMenu = new Menu.ContextMenu({
            children: [
                makeContextMenu('icon-folder-close', bxMsg('createFeeDiscountIntegrationLimit'), createFeeDiscountIntegrationEvent)     // 통합한도 신규
            ]
        });

        var x = e.pageX;
        var y = e.pageY >= 500 ? e.pageY - (28 * 4) : e.pageY;

        feeDiscountIntegrationNewContextMenu.set('xy', [x, y]);
        feeDiscountIntegrationNewContextMenu.show();
    });

    return false;
});

onEvent('click', '.class-str-save-btn', function(e){
    saveFeeDiscountIntegration('UPDATE');
});

onEvent('click', '.class-str-delete-btn', function(e){

    PFComponent.showConfirm(bxMsg('DPE00001_Delete_Confirm'), function() {
        deleteFeeDiscountIntegration($('.feeDiscountIntegrationLimitCd').val());
    }, function() {
        return;
    });
});

onEvent('click', '.class-save-btn', function(e){
    saveClassification('UPDATE');
});

// 상품그룹에서 상품그룹조건 확장버튼
onEvent('click', '.pf-limit-condition-expend-view-btn', function(e) {
    var $button = $('.pf-limit-condition-info-tpl .pf-limit-condition-expend-view-btn');
    $button.toggleClass('cnd-info-expand');

    if($button.hasClass('cnd-info-expand')){
        //$(e.currentTarget).text('▲');
        $(e.currentTarget).html('<i class="bw-icon i-25 i-close3"></i>');
        $('.pf-limit-condition-info-tpl .pf-panel-body').show();
        PFUtil.getAllDatePicker(true, $('.pf-limit-condition-info-tpl .pf-panel-body'));

        if (!feeDiscountLimitConditionInfoGrid) {
            searchFeeDiscountIntegrationLimitConditionList();
        }

    }else{
        //$(e.currentTarget).text('▼');
        $(e.currentTarget).html('<i class="bw-icon i-25 i-open3"></i>');
        $('.pf-limit-condition-info-tpl .pf-panel-body').hide();
    }

});

onEvent('keydown.xdsoft', '.prod-grp-cnd-search', function(e) {

    if (e.keyCode == '13') {
        var searchBaseDate = $('.prod-grp-cnd-search').val();
        searchFeeDiscountIntegrationLimitConditionList(searchBaseDate);
    }

});

onEvent('focusout', '.prod-grp-cnd-search', function(e) {

    var searchBaseDate = $('.prod-grp-cnd-search').val();
    searchFeeDiscountIntegrationLimitConditionList(searchBaseDate);

});
/******************************************************************************************************************
 * BIZ 함수
 ******************************************************************************************************************/
// 수수료할인통합한도 저장
function saveFeeDiscountIntegration(work, that, selector){
    if(!isHaveProject()){
        haveNotTask();
        return;
    }

    var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
    if(isNotMyTask(projectId)){
        return;
    }

    var form;
    var name;
    if(that){
    	form = PFComponent.makeYGForm($('.pfui-stdmod-body .fee-discount-integration-limit-management-popup .pf-fdi-limit-base-form'));
    	name = $('.fee-discount-integration-name').val();
    }else{
    	form = PFComponent.makeYGForm($(' .pf-fdi-limit-base-form'));
    	name = $('.fee-discount-integration-name').val();       // 분류체계기본명
    }

    if(!name){
        PFComponent.showMessage(bxMsg('feeDiscountIntegrationNameError'), 'warning');          // 분류체계기본명은 필수입력사항입니다
        return;
    }

    if(!modifyFlag){
		// 변경된 정보가 없습니다.
		PFComponent.showMessage(bxMsg('nothingToSave'), 'warning');
		return;
	}

    var nameLengthCheck = PFValidation.finalLengthCheck('',100,name);
    var mandatoryCheck = PFValidation.mandatoryCheck('.mandatory');

    var requestUrl, bxmHeader;
    if(work == "CREATE"){
        requestUrl = "/feeIntegration/createFeeDiscountIntegrationLimitMaster.json";
        bxmHeader = {
            application: 'PF_Factory',
            service: 'FeeDiscountIntegraionLimitService',
            operation: 'createFeeDiscountIntegrationLimit'
        };
    }else if(work == "UPDATE"){
        requestUrl = "/feeIntegration/updateFeeDiscountIntegrationLimitMaster.json";
        bxmHeader = {
            application: 'PF_Factory',
            service: 'FeeDiscountIntegraionLimitService',
            operation: 'updateFeeDiscountIntegrationLimit'
        };
    }

    var requestData = form.getData();
    requestData.pdInfoDscd = pdInfoDscd;
    requestData.projectId = projectId;
    requestData.tntInstId = tntInstId;

    if(work == 'CREATE') {
        requestData.activeYn = 'N';
    }

    if(nameLengthCheck && mandatoryCheck){
        PFRequest.post(requestUrl, requestData, {
            success: function(result){

                PFComponent.showMessage(bxMsg('Z_SaveSucceed'), 'success');
                modifyFlag = false;

                if(that) {
                    that.close();
                }

                var feeDiscountIntegrationLimitCd = result.feeDiscountIntegrationLimitCd ? result.feeDiscountIntegrationLimitCd : requestData.feeDiscountIntegrationLimitCd;
                traceTree.traceList = [feeDiscountIntegrationLimitCd];
                traceTree.depth = 0;
                traceTree.completeTrace = false;

                renderFeeDiscountIntegrationNavTree.isRendered = false;
                renderFeeDiscountIntegrationNavTree();

            },
            bxmHeader : bxmHeader
        });
    }
}

// 할인통합한도 삭제
function deleteFeeDiscountIntegration(id) {
    if (!isHaveProject()) {
        haveNotTask();
        return;
    }

    var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
    if (isNotMyTask(projectId)) {
        return;
    }

    var requestData = {
        feeDiscountIntegrationLimitCd: id,
        pdInfoDscd: pdInfoDscd,
        projectId: projectId,
        tntInstId: tntInstId
    };
    PFRequest.post('/feeIntegration/deleteFeeDiscountIntegrationLimitMaster.json', requestData, {
        success : function (responseMessage) {
            if (responseMessage) {
                PFComponent.showMessage(bxMsg('Z_DeleteSucced'), 'success');                                        // 삭제에 성공하였습니다.
                modifyFlag = false;

                var pathArr = [];
                treeItem.path.forEach(function(path){
                    if(path && path != id){
                        pathArr.push(path);
                    }
                });

                traceTree.traceList = pathArr;
                traceTree.depth = 0;
                traceTree.completeTrace = false;

                renderFeeDiscountIntegrationNavTree.isRendered = false;
                renderFeeDiscountIntegrationNavTree();

                $el.find('.pf-fdi-info-wrap').removeClass('active');
            }
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'FeeDiscountIntegraionLimitService',
            operation: 'deleteFeeDiscountIntegrationLimit'
        }
    });
}

// 분류 저장 -> 사용안함
//function saveClassification(work, data, that){
//
//    if(!isHaveProject()){
//        haveNotTask();
//        return;
//    }
//
//    var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
//    if(isNotMyTask(projectId)){
//        return;
//    }
//
//    var form = PFComponent.makeYGForm($('.pf-cls-form'));
//
//    var name = $('.classification-name').val();       // 분류체계기본명
//    if(!name){
//        PFComponent.showMessage(bxMsg('ClassificationNameError'), 'warning');          // 분류체계기본명은 필수입력사항입니다
//        return;
//    }
//
//    var nameLengthCheck = PFValidation.finalLengthCheck('',100,name);
//    var mandatoryCheck = PFValidation.mandatoryCheck('.mandatory');
//
//    var requestUr, bxmHeaderl;
//    if(work == "CREATE"){
//        requestUrl = "/classification/createClassificationDetail.json";
//        bxmHeader = {
//            application: 'PF_Factory',
//            service: 'ClassificationDetailService',
//            operation: 'createClassificationDetail'
//        };
//    }else if(work == "UPDATE"){
//        requestUrl = "/classification/updateClassificationDetail.json";
//        bxmHeader = {
//            application: 'PF_Factory',
//            service: 'ClassificationDetailService',
//            operation: 'updateClassificationDetail'
//        };
//    }
//
//    var requestData = form.getData();
//    requestData.pdInfoDscd = pdInfoDscd;
//    requestData.projectId = projectId;
//    requestData.tntInstId = tntInstId;
//
//    if(nameLengthCheck && mandatoryCheck){
//        PFRequest.post(requestUrl, requestData, {
//            success: function(resposeData){
//
//                PFComponent.showMessage(bxMsg('Z_SaveSucceed'), 'success');
//                modifyFlag = false;
//
//                if(that) {
//                    that.close();
//                }
//
//                if(work == 'UPDATE') {
//                    data = navTreeStore.findNode(requestData.classificationStructureDistinctionCode + '.' + requestData.classificationCode);
//                }
//
//                var pathArr = [];
//                data.path.forEach(function(path){
//                    if(path){
//                        pathArr.push(path);
//                    }
//                });
//                pathArr.push(resposeData);
//
//                traceTree.traceList = pathArr;
//                traceTree.depth = 0;
//                traceTree.completeTrace = false;
//
//                renderFeeDiscountIntegrationNavTree.isRendered = false;
//                renderFeeDiscountIntegrationNavTree();
//
//            },
//            bxmHeader : bxmHeader
//        });
//    }
//}


// 관계 저장
function saveFeeDiscountRelation(){

    if(!isHaveProject()){
        haveNotTask();
        return;
    }

    var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
    if(isNotMyTask(projectId)){
        return;
    }

    if(!modifyFlag){
		// 변경된 정보가 없습니다.
		PFComponent.showMessage(bxMsg('nothingToSave'), 'warning');
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

    gridData = feeDiscountIntegrationGridDeleteData.concat(relatedfeeDiscountGrid.getAllData());

    requestParam['feeDiscountIntegrationLimitFeeDiscountRelationVOList'] = gridData;
    requestParam.pdInfoDscd = pdInfoDscd;
    requestParam.projectId = projectId;
    requestParam.tntInstId = tntInstId;

    var nameLengthCheck = PFValidation.finalLengthCheck('',100,name);
    var mandatoryCheck = PFValidation.mandatoryCheck('.mandatory');

    // 상품관계 저장 서비스 호출
    if(nameLengthCheck && mandatoryCheck){
        PFRequest.post('/feeIntegration/saveFeeDiscountIntegrationLimitFeeDiscountRelation.json',requestParam,{
            success : function(){
                PFComponent.showMessage(bxMsg('Z_SaveSucceed'), 'success');
                modifyFlag = false;

                var item = navTreeStore.findNode(requestParam.feeDiscountIntegrationLimitCd);

                var pathArr = [];
                item.path.forEach(function(path){
                    if(path){
                        pathArr.push(path);
                    }
                });

                traceTree.traceList = pathArr;
                traceTree.depth = 0;
                traceTree.completeTrace = false;

                feeDiscountIntegrationGridDeleteData = [];
                limitConditionInfogridDeleteDate  =[];

                renderFeeDiscountIntegrationNavTree.isRendered = false;
                renderFeeDiscountIntegrationNavTree();
                renderFeeDiscountIntegrationInfo(classForEvent);

            },
            bxmHeader: {
                application: 'PF_Factory',
                service: 'FeeDiscountIntegraionLimitService',
                operation: 'saveFeeDiscountIntegrationLimitFeeDiscountRelation'
            }
        });
    }
}

/******************************************************************************************************************
 * rendering 함수
 ******************************************************************************************************************/

// 트리박스
function renderFeeDiscountIntegrationTreeBox() {
    $('.pf-fdi-left-tree-box').html(feeDiscountIntegrationLeftTreeTpl());

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
        renderFeeDiscountIntegrationInfo();
    });
}

// 트리와 메인화면을
function renderFeeDiscountIntegrationInfo(treeItem) {

    var path = (treeItem) ? treeItem.id : null;
	// OHS20180726 - 최초에만 조건정보 그리드가 그려지고 그 이후 재조회시 그려지지않는문제
	feeDiscountLimitConditionInfoGrid = undefined;
	
// pf-event에서 처리
//      $('.pf-detail-wrap').on('change','input',function(){
//        modifyFlag = true;
//        $('.most-significant-box').attr('data-edited','true');
//    });

    var hash = PFUtil.getHash();
    if(path == null){
        hash = '';
        $el.find('.pf-fdi-info-wrap').removeClass('active');
    }

    if (!hash) {
        traceTree.completeTrace = true;
        renderFeeDiscountIntegrationNavTree($('.pd-info-dscd').val());
        return;
    } else {
        hash.id = path;
    }

    var requestParam = {};
    $.each(hash.split('&'),function(index, hashItem){
        var param = hashItem.split('=');
        requestParam[param[0]] = param[1];
    })

    requestParam.tntInstId = tntInstId;

    PFRequest.get('/feeIntegration/getListFeeDiscountIntegrationLimitFeeDiscountRelation.json', requestParam, {
        success: function(responseData) {

            $el.find('.pf-fdi-info-wrap').addClass('active');
            $el.find('.pf-fdi-info').html(feeDiscountIntegrationInfoFormTpl(treeItem));

            // 권한이 없으면 버튼 숨김
            if(writeYn != 'Y'){
                $('.write-btn').hide();
            }

            if(tntInstId == loginTntInstId){    // enable
                $el.find('.add-fee-discount-btn').prop('disabled', false);
                $el.find('.fee-dicount-rel-save-btn').prop('disabled', false);
            }else{                              // disable
                $el.find('.add-fee-discount-btn').prop('disabled', true);
                $el.find('.fee-dicount-rel-save-btn').prop('disabled', true);
            }

            feeDiscountIntegrationGridDeleteData = [];
            renderFeeDiscountIntegrationRelationGrid(responseData);

            //var button = '<button class="bw-btn bx-btn-small pf-limit-condition-expend-view-btn">' + '▼' + '</button>';
            var button = '<button class="bw-btn bx-btn-small pf-limit-condition-expend-view-btn">' +
                '<i class="bw-icon i-25 i-open3"></i>'
                + '</button>';

            $el.find('.pf-fdi-info').append(limitCndInfoTpl());
            $el.find('.pf-limit-condition-info-tpl .header-btn-group').append(button);
            $el.find('.pf-limit-condition-info-tpl .pf-panel-body').hide();

        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'FeeDiscountIntegraionLimitService',
            operation: 'queryListFeeDiscountIntegrationLimitFeeDiscountRelation'
        }
    });
}


/******************************************************************************************************************
 * 트리 관련
 ******************************************************************************************************************/
function renderFeeDiscountIntegrationNavTree() {

    if (renderFeeDiscountIntegrationNavTree.isRendered) {
        return;
    }
    renderFeeDiscountIntegrationNavTree.isRendered = true;


    PFUI.use(['pfui/tree', 'pfui/data', 'pfui/menu'], function (Tree, Data, Menu) {

        /* --------------------------------------
         * nvaTreeStore
         * -------------------------------------- */

        if (g_serviceType == g_bxmService){
            var params = {
                header: {
                    application: 'PF_Factory',
                    service: 'FeeDiscountIntegraionLimitService',
                    operation: 'queryListFeeDiscountIntegrationLimit'
                },
                input: {
                    tntInstId: tntInstId,
                    pdInfoDscd: pdInfoDscd,
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
                    'feeDiscountIntegrationLimitName': 'text',
                    'feeDiscountIntegrationLimitCd': 'id'          // 분류체계구분코드
                }
            });
        } else {

            navTreeStore = new Data.TreeStore({
                autoLoad: false,
                url: '/feeIntegration/getListFeeDiscountIntegrationLimitMaster.json?tntInstId=' + tntInstId +
                '&commonHeaderMessage={"loginTntInstId":"' + loginTntInstId + '", "motherTntInstId" : "' + getMotherTntInstId() + '", "lastModifier" : "' + getLoginUserId()+ '"}',
                dataProperty: 'list',
                map: {
                    'bottom': 'leaf',
                    'feeDiscountIntegrationLimitName': 'text',
                    'feeDiscountIntegrationLimitCd': 'id'          // 분류체계구분코드
                }
            });

        }

        // click change url params
        // csl='folder' and 'leaf=false' 일 때 호출됨
        navTreeStore.on('beforeload', function (ev) {
        });

        navTreeStore.on('beforeprocessload', function (ev) {
            var data = ev.data;
            if(data.ModelMap){
                data.list = data.ModelMap.responseMessage;
            }else {
                data.list = data.responseMessage;
            }

            if(data.list.length > 0){
                data.list.forEach(function(element){
                    if(!element.related){
                        element.cls = 'PT';
                    }
                    element.bottom = true;
                    element.id = element.feeDiscountIntegrationLimitCd;

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

        $('.pf-fdi-tree-nav').empty();

        navTree = new Tree.TreeList({
            render: '.pf-fdi-tree-nav',
            showLine: false,
            store: navTreeStore,
            checkType: 'none',
            showRoot: false
        });

        navTree.render();

        // tree item double click
        navTree.on('itemdblclick', function(e) {

            location.hash = makeFeeDiscountIntegrationInfoParameter(e.item);

            if (e.item.related) {   // 상품관계관리가 존재하는 경우
                var emptyObj;
                limitConditionInfoGrid = emptyObj;
                if(!modifyFlag){    //
                    classForEvent = e.item;

                    renderFeeDiscountIntegrationInfo(e.item);
                }else{
                    classForEvent = e.item;
                    PFComponent.showConfirm(bxMsg('warningDontSaved'), function() {
                        renderFeeDiscountIntegrationInfo(e.item);
                        modifyFlag = false;
                        $('.most-significant-box').removeAttr('data-edited');
                    }, function() {
                        return;
                    });
                }
            }else{

                e.item.feeDiscountIntegrationLimitCd = e.item.id;
                e.item.feeDiscountIntegrationLimitName = e.item.text;

                $el.find('.pf-fdi-info-wrap').addClass('active');
                $el.find('.pf-fdi-info').html(feeDiscountIntegrationInfoTpl());
                $el.find('.pf-fdi-detail-info').html(feeDiscountIntegrationBaseManagementPopupTpl(e.item));
                renderComboBox("ProductBooleanCode", $('.fee-discount-integration-active-yn-select'));
                $('.fee-discount-integration-active-yn-select').val(e.item.activeYn);

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

                if(e.item.activeYn == 'N' || (getSelectedProjectId() && isEmergency(getSelectedProjectId())) ){
                    $('.delete-btn').prop('disabled', false);
                }else{
                    $('.delete-btn').prop('disabled', true);
                }

                renderComboBox("ProductGroupTypeCode", $('.cls-prod-group-type-select'), null, true, false);
                renderComboBox("ProductBooleanCode", $('.cls-str-active-yn-select'));
                $('.fee-discount-integration-active-yn-select').val(e.item.activeYn);
            }
        });


        /* --------------------------------------
         * Context Menu Event - 수수료할인통합한도기본 조회
         * -------------------------------------- */

        // 수수료할인통합한도기본 조회 이벤트
        var searchFeeDiscountIntegrationEvent = function() {
            var requestData = {
                feeDiscountIntegrationLimitCd : treeItem.id,
                PdInfoDscd : pdInfoDscd,
                tntInstId: tntInstId
            };
            PFRequest.get('/feeIntegration/getFeeDiscountIntegrationLimitMaster.json',requestData, {
                success: function(responseMessage) {
                    responseMessage.work = "UPDATE";
                    renderFeeDiscountIntegrationBasePopup(responseMessage);
                },
                bxmHeader: {
                    application: 'PF_Factory',
                    service: 'FeeDiscountIntegraionLimitService',
                    operation: 'queryFeeDiscountIntegrationLimit'
                }
            });
        }

        // 분류체계기본 삭제 이벤트
        var deleteFeeDiscountIntegrationEvent = function() {

            deleteFeeDiscountIntegration(treeItem.id);

        }



        /* --------------------------------------
         * Context Menu Event - 상품 관계 관리
         * -------------------------------------- */
        var feeRelationManagementEvent = function(){
            location.hash = 'feeDiscountIntegrationLimitCd=' + treeItem.id;
            classForEvent = treeItem;
            if(!modifyFlag){
                renderFeeDiscountIntegrationInfo(treeItem);
            }else{
                PFComponent.showConfirm(bxMsg('warningDontSaved'), function() {
                    renderFeeDiscountIntegrationInfo(treeItem);
                    modifyFlag = false;
                    $('.most-significant-box').removeAttr('data-edited');
                }, function() {
                    return;
                });
            }
        }

        /* --------------------------------------
         * Context Menu
         * -------------------------------------- */

        // 분류체계 context menu
        var feeDiscountIntegrationContextMenu = new Menu.ContextMenu({
            children: [
                makeContextMenu('icon-zoom-in', bxMsg('searchFeeDiscountIntegrationLimit'), searchFeeDiscountIntegrationEvent),    // 통합한도조회
                makeContextMenu('icon-remove' , bxMsg('deleteFeeDiscountIntegrationLimit'), deleteFeeDiscountIntegrationEvent),    // 통합한도삭제
                makeContextMenu('icon-file'   , bxMsg('feeRelationManagement'), feeRelationManagementEvent)                          // 상품관계관리
            ]
        });

        var feeDiscountIntegrationActiveContextMenu = new Menu.ContextMenu({
            children: [
                makeContextMenu('icon-zoom-in', bxMsg('searchFeeDiscountIntegrationLimit'), searchFeeDiscountIntegrationEvent),    // 통합한도조회
                makeContextMenu('icon-file'   , bxMsg('feeRelationManagement'), feeRelationManagementEvent)                        // 상품관계관리
            ]
        });

        var centerFeeDiscountIntegrationContextMenu = new Menu.ContextMenu({
            children: [
                makeContextMenu('icon-zoom-in', bxMsg('searchFeeDiscountIntegrationLimit'), searchFeeDiscountIntegrationEvent),    // 통합한도조회
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
                if(writeYn != 'Y'){
                    centerFeeDiscountIntegrationContextMenu.set('xy', [ev.pageX, y]);
                    centerFeeDiscountIntegrationContextMenu.show();
                }
                // 비활동이거나 emergency
                else if(treeItem.activeYn == 'N' || (getSelectedProjectId() && isEmergency(getSelectedProjectId()))){
                    feeDiscountIntegrationContextMenu.set('xy', [ev.pageX, y]);
                    feeDiscountIntegrationContextMenu.show();
                }
                // 활동일때
                else{
                    feeDiscountIntegrationActiveContextMenu.set('xy', [ev.pageX, y]);
                    feeDiscountIntegrationActiveContextMenu.show();
                }
            }
            return false;
        });
    });
}

// 트리 박스 스크롤
function scrollMove(){
    var selectedItemTop = $('.pfui-tree-item .pfui-tree-item-selected').offset().top;
    $('.pf-left-nav .pf-panel-body').scrollTop(selectedItemTop-200);
}

//
function traceTree() {
    if(traceTree.completeTrace) {return;}

    var currentNode = navTreeStore.findNode(traceTree.traceList[traceTree.depth]);

    if(((traceTree.traceList.length - 1) === traceTree.depth)) {
        setTimeout(function() {
            navTree.setSelection(currentNode);
            //scrollMove();
        }, 500)
        traceTree.completeTrace = true;
        return;
    }else {
        navTree.expandNode(currentNode);
    }

    traceTree.depth++;
}

/******************************************************************************************************************
 * 그리드 관련
 ******************************************************************************************************************/
function renderFeeDiscountIntegrationRelationGrid(data) {

    relatedfeeDiscountGrid = PFComponent.makeExtJSGrid({
        //pageAble: true,
        fields: ['conditionGroupTemplateCode', 'conditionGroupTemplateName','conditionGroupCode', 'conditionCode', 'conditionName', 'feeDiscountName','feeDiscountSequenceNumber', 'feeDiscountName', 'feeDiscountAmount', 'applyStartDate','applyStartDateFeeDiscount' , 'applyEndDate', 'activeYn', 'process'],
        gridConfig: {
            renderTo: '.pf-fee-discount-grid',
            columns: [
                {text: bxMsg('DTE00002_Title'), flex : 1  , dataIndex: 'conditionGroupTemplateName'},                   // 조건군템플릿
                {text: bxMsg('DPP0128String2'), flex : 1  , dataIndex: 'conditionCode'},                                // 조건코드
                {text: bxMsg('cndNm'), flex : 1  , dataIndex: 'conditionName'},                                         // 조건코드
                {text: bxMsg('feeDcSeqNbr'), flex : 1  , dataIndex: 'feeDiscountSequenceNumber'},                       // 수수료할인일련번호
                {text: bxMsg('feeDcNm'), flex : 1  , dataIndex: 'feeDiscountName'},                                     // 수수료할인일련번호
                {text: bxMsg('DPP0127String6'), width: 150, dataIndex: 'applyStartDate',                                // 적용시작일
                    editor: {
                        allowBlank: false,
                        listeners: {
                            focus: function(_this) {
                                var isNextDay = true;
                                if(getSelectedProjectId() && (isEmergency(getSelectedProjectId()) || isUpdateStatus(getSelectedProjectId()))){
                                    isNextDay = false;
                                }
                                PFUtil.getGridDateTimePicker(_this, 'applyStartDate', relatedfeeDiscountGrid, selectedCellIndex, isNextDay);
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
                },
                {text: bxMsg('DPP0127String7'), width:150,dataIndex:'applyEndDate',     // 적용종료일
                    editor: {
                        allowBlank: false,
                        listeners: {
                            focus: function(_this) {
                                PFUtil.getGridDateTimePicker(_this, 'applyEndDate', relatedfeeDiscountGrid, selectedCellIndex, true);
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
                },
                {   // delete row
                    xtype: 'actioncolumn', width: 35, align: 'center', sortable: false,
                    items: [{
                        icon: '/images/x-delete-16.png',
                        handler: function (grid, rowIndex, colIndex, item, e, record) {
                            if(record.data.activeYn == 'N' || (getSelectedProjectId() && isEmergency(getSelectedProjectId())) ) {
                                if (record.data.process != 'C') {
                                    record.data.process = 'D';
                                    feeDiscountIntegrationGridDeleteData.push(record.data);
                                }
                                modifyFlag = true;
                                record.destroy();
                            }else{
                                PFComponent.showMessage(bxMsg('dontDeleteActiveTypeConditionTemplate'), 'warning');
                            }
                        }
                    }]
                }
            ],
            listeners: {
                'celldblclick': function (_this, td, cellIndex, record, tr, rowIndex, e, eOpts) {

                    detailRequestParam = {
                        conditionGroupTemplateCode: record.get('conditionGroupTemplateCode'),
                        conditionGroupCode: record.get('conditionGroupCode'),
                        conditionCode: record.get('conditionCode'),
                        feeDiscountSequenceNumber: record.get('feeDiscountSequenceNumber'),
                        applyStartDate: record.get('applyStartDateFeeDiscount'),
                        tntInstId: tntInstId
                    }
                    PFRequest.get('/product_condition/getProductConditionFeeDiscount.json', detailRequestParam,
                        {
                            success: function (data) {
                                renderCnd4FeePopup(data, true);
                            },
                            bxmHeader: {
                                application: 'PF_Factory',
                                service: 'PdCndFeeDiscountService',
                                operation: 'queryPdCndFeeDiscount'
                            }
                        }
                    );
                }
            },
            plugins: [getGridCellEditiongPlugin()]
        }
    });

    if(data && data.length > 0){
        relatedfeeDiscountGrid.setData(data);
    }

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
                        feeDiscountIntegrationGridDeleteData.push(originalData);

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

/******************************************************************************************************************
 * 사용자 함수
 ******************************************************************************************************************/
// 파라미터 조합
function makeFeeDiscountIntegrationInfoParameter(treeItem) {
    var returnVal;

    returnVal = 'feeDiscountIntegrationLimitCd=' + treeItem.id;

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


function renderLimitConditionInfoGrid(data){
	feeDiscountLimitConditionInfoGrid = PFComponent.makeExtJSGrid({
        fields: ['providedConditionCode','providedConditionName', 'process',
            'providedConditionStatusCode', 'applyStartDate',
            'applyEndDate', 'providedConditionTypeCode', 'providedConditionDetailTypeCode', 'currencyCode',
            'productBenefitProvidedListConditionList', 'mesurementUnitCode', 'cndDscd', 'providedConditionSequenceNumber',

            {
                name: 'maxValue',
                convert: function(newValue, record) {
                    if (newValue) {
                        return newValue;
                    } else {
                        if (!record || !newValue) {
                            var val = '0.00';
                        }
                        return val;
                    }
                }
            },
            {
                name: 'minValue',
                convert: function(newValue, record) {
                    if (newValue) {
                        return newValue;
                    } else {
                        if (!record || !newValue) {
                            var val = '0.00';
                        }
                        return val;
                    }
                }
            }
        ],
        gridConfig: {
            renderTo: '.pf-limit-cnd-grid',
            columns: [
                {
                    text: bxMsg('DPP0128String2'),   // 조건코드
                    flex: 0.6,
                    dataIndex: 'providedConditionCode'
                },
                {
                    text: bxMsg('DTP0203String2'),   // 조건명
                    flex: 1,
                    dataIndex: 'providedConditionName'
                },
                {
                    text : bxMsg('DPS0101String6'),         // 상태
                    width : 70,
                    align: 'center',
                    dataIndex : 'providedConditionStatusCode',
                    renderer : function(value){
                        return codeMapObj['ProductStatusCode'][value];
                    }
                },
                {
                    text: bxMsg('DPP0127String6'), flex: 0.7, dataIndex: 'applyStartDate',
                },
                {
                    text: bxMsg('DPP0127String7'), flex: 0.7, dataIndex: 'applyEndDate',
                },
                {
                    text: bxMsg('DPS0129String4'), //조건값
                    flex: 1,
                    renderer: function (value, p, record) {
                        var yVal = '', extFormat, yTitle1 = '', yVal1 = '';
                        var conditionTypeCode = record.get('providedConditionTypeCode');

                        if (conditionTypeCode == '01') {

                            if (record.get('productBenefitProvidedListConditionList')) {
                                record.get('productBenefitProvidedListConditionList').forEach(function (el) {
                                    yVal = yVal + '['+el.listCode+']'+ el.listCodeName + '，';
                                });

                                if (yVal != '' && yVal.length > 0) {
                                    yVal = yVal.substring(0, yVal.length - 1);
                                }
                            }

                            extFormat = Ext.String.format('<p class="ext-condition-value-column">{0}</p>', yVal);
                        } else {
                            var minString, maxString;

                            minString = record.get('minValue');
                            maxString = record.get('maxValue');

                            yTitle1 = bxMsg('DPS0129Unit1String1') + ' : ';
                            yVal1 = minString + '~' + maxString;

                            extFormat = Ext.String.format('<p class="ext-condition-value-column">{0} {1} </p>', yTitle1, yVal1);
                        }

                        return extFormat;
                    }
                },
            ],
            listeners: {
                scope: this,
                'viewready' : function(_this, eOpts){

                    if(!data) return;

                    var formData = {};
                    formData.feeDiscountIntegrationLimitCd = classForEvent.id;
                    formData.cndDscd = '02';

                    if($('.bnft-prov-cnd-search').val()) {
                        formData.applyStartDate = $('.bnft-prov-cnd-search').val(); // 조회기준일 추가
                    }
                    else {
                        delete formData.applyStartDate;
                    }
                    PFRequest.get('/benefit/queryListBenefitProvideCndForFeeIntegration.json', formData, {
                        success: function(responseData) {
                        	feeDiscountLimitConditionInfoGrid.setData(responseData);
                        },
                        bxmHeader: {
                            application: 'PF_Factory',
                            service: 'BenefitProvideCndService',
                            operation: 'queryListBenefitProvideCndForIntegration'
                        }
                    });
                },
                'celldblclick': function (_this, td, cellIndex, record, tr, rowIndex, e, eOpts) {
                    renderLimitCndPopup(record.data);
                }
            },
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1,
                    listeners:{
                        afteredit: function(e, editor){
                            if(editor.originalValue !=  editor.value && editor.record.get('process') != 'C'){
                                editor.record.set('process', 'U');
                            }
                        }
                    }
                })
            ]
        } // gridcinfig end
    }); // 그리드 end

    return feeDiscountLimitConditionInfoGrid;
}

function renderCndValueType1Grid(data, popup) {
    var renderTo,
        firstRender = true;

    if (popup) {
        renderTo = '.cnd-value-type1-popup .cnd-val-type1-grid';
    } else {
        renderTo = '.cnd-val-type1-grid';
    }

    cndValueType1Grid = PFComponent.makeExtJSGrid({
        fields: ['code', 'isDefaultValue', 'isSelected', 'name'],
        gridConfig: {
            renderTo: renderTo,
            columns: [
                {xtype: 'checkcolumn', text: bxMsg('PAS0301String4'), width: 120, dataIndex: 'isSelected', align:'center', // 기본값여부
                    listeners: {
                        checkchange: function(column, rowIndex, checked, eOpts) {
                            $(renderTo).find('.type1-grid-default-check').each(function(idx) {
                                var that = this;

                                // If ConditionAgreeLevel By Product Then DefaultCheck Disabled
                                if (selectedCondition.conditionAgreeLevel == '02') {
                                    if (checked && $(that).attr('data-idx') == rowIndex) {
                                        $(that).prop('disabled', false);
                                    } else if (!checked && $(that).attr('data-idx') == rowIndex) {
                                        $(that).prop('disabled', true).prop('checked', false);
                                    }
                                } else {
                                    $(that).prop('disabled', true).prop('checked', false);
                                }
                            });
                            modifyFlag = true;
                        }
                    }},
                {text: bxMsg('DPS0121_21String1'), flex: 1, dataIndex: 'code', align:'center'},
                {text: bxMsg('DPS0121_21String2'), flex: 1, dataIndex: 'name', align:'center'},
                {xtype: 'checkcolumn', text: bxMsg('defaultValue'), dataIndex: 'isDefaultValue',  sortable: false,
                    renderer: function(value, metadata, record, rowIndex) {
                        if (!record.get('isSelected') || selectedCondition.conditionAgreeLevel == '01') {
                            //record.set('defaultValue', true);
                            cndValueType1Grid.store.getAt(rowIndex).set('isDefaultValue', false);
                            return "<input type='checkbox' disabled>";
                        } else {
                            return (new Ext.ux.CheckColumn()).renderer(value);
                        }
                    },
                    listeners: {
                        beforecheckchange: function(column, rowIndex, checked, eOpts) {
                            if (!cndValueType1Grid.store.getAt(rowIndex).data['isSelected'] || selectedCondition.conditionAgreeLevel == '01') {
                                return false;
                            } else {
                                return true;
                            }
                        }
                    }, align: 'center', width: 120}
            ],
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1
                })
            ]
        }
    });
    cndValueType1Grid.setData(data);
}


function searchFeeDiscountIntegrationLimitConditionList(searchBaseDate) {

    var requestData = {};

    if(searchBaseDate && searchBaseDate !== null && searchBaseDate !== ''){
        requestData.applyStartDate = searchBaseDate;
    }

    requestData.tntInstId = tntInstId;
    requestData.feeDiscountIntegrationLimitCd = classForEvent.id;
    requestData.cndDscd = '02';

    PFRequest.get('/benefit/queryListBenefitProvideCndForFeeIntegration.json', requestData, {
        success: function (result) {
            // 삼품그룹 조건정보 그리드

            if(!feeDiscountLimitConditionInfoGrid){
            	feeDiscountLimitConditionInfoGrid = renderLimitConditionInfoGrid();
            }
            feeDiscountLimitConditionInfoGrid.setData(result);
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'BenefitProvideCndService',
            operation: 'queryListBenefitProvideCndForIntegration'
        }
    });
}


function isNotNegativeRangeType(conditionDetailTypeCode){
    if(conditionDetailTypeCode != '01' && conditionDetailTypeCode != '04' && conditionDetailTypeCode != '05'){
        return true;
    }else{
        return false;
    }
}


// 개발과제가 Emergency 일 때
function fnEmergencyControl(flag){

    if(writeYn == 'Y'){
        if(flag) {
            $('.write-btn').prop('disabled', false);

            if(isNewData){
                $('.limit-cnd-mod-btn').prop('disabled', true);
            }
            if($('.limit-cnd-info-popup-tpl .status').val() == '01'){
                $('.limit-cnd-reg-btn').prop('disabled', true);
            }else if($('.limit-cnd-info-popup-tpl .status').val() == '04'){
                $('.limit-cnd-mod-btn').prop('disabled', false);
                $('.limit-cnd-delete-btn').prop('disabled', false);
            }
        }
        else{

            if(isNewData){
                $('.limit-cnd-reg-btn').prop('disabled', false);
            }

            if($('.fee-discount-integration-active-yn-select').val() == 'Y'){
                $('.delete-btn').prop('disabled', true);
            }

            if($('.limit-cnd-info-popup-tpl .status').val() == '04'){
                $('.limit-cnd-reg-btn').prop('disabled', false);
                $('.limit-cnd-mod-btn').prop('disabled', false);
                $('.limit-cnd-delete-btn').prop('disabled', true);
            }
        }
    }
}