/**
 * interest rate structure java script
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
    renderTreeBox();                       // 상품분류 Tree Box
});

var modifyFlag = false;
var relModifyFlag = false;
var selectedCellIndex;

var $el = $('.pf-irs');          // Page Root jQuery Element

var intRtStructureTreeTpl,                       // 트리
    intRtStructureDetailInfoTpl;

var navTree, navTreeStore,
    grdRelPd;

var pdInfoDscd = '01';  // 초기값 = 상품
var loginTntInstId, tntInstId, mother;

var clickEventForNewData = {};

var deleteRelPdList  =[];
var beforeApplyStartDate;

// 산식 연산자
var operatorSet = new Set();
operatorSet.add('min');
operatorSet.add('max');
operatorSet.add('case');

var onEvent = PFUtil.makeEventBinder($el);

var lengthVlad = PFValidation.realTimeLengthCheck($el);

// Load Template in HTML
intRtStructureTreeTpl = getTemplate('intRtStructureTreeTpl');
intRtStructureDetailInfoTpl = getTemplate('intRtStructureDetailInfoTpl');
/******************************************************************************************************************
 * 이벤트 함수
 ******************************************************************************************************************/

onEvent('click', 'a', function (e) {
    e.preventDefault();
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

    renderIntRtStructureNavTree.isRendered = false;
    renderTree();
    $el.find('.pf-irs-info-wrap').removeClass('active');
});

// 검색버튼
onEvent('click', '.irs-search-btn', function(e) {
    var irsName = $el.find('.irs-search-name').val().split(' ').join('');

    if (irsName) loadIntRtStructureList(irsName);
});

onEvent('click', '.irs-search-name', function(e) {
    $el.find('.irs-search-list-wrap').removeClass('active');
});

// 검색 엔터
onEvent('keyup', '.irs-search-name', function(e) {
    var irsName = this.value.split(' ').join('');
    if (e.keyCode == '13' && irsName) {
    	loadIntRtStructureList(irsName);
    }
});

// 새로고침버튼
onEvent('click', '.irs-refresh-icon', function(e) {
    renderIntRtStructureNavTree.isRendered = false;
    renderIntRtStructureNavTree();
    $('.pf-detail-wrap').removeClass('active');
});

// 금리체계 저장버튼
onEvent('click', '.master-save-btn', function(){

    if(!isHaveProject()){
        haveNotTask();
        return;
    }

    if($($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val() === ''){
        selectNotTask();
        selectedYourTask();
        return;
    }

    if( $($('.default-layout-task-menu', parent.document).find('.your-task')[0]).attr('data-status')=='true'){
        selectedYourTask();
        return;
    }

	if(!modifyFlag){
		// 변경된 정보가 없습니다.
		PFComponent.showMessage(bxMsg('nothingToSave'), 'warning');
		return;
	}

    var requestParam = PFComponent.makeYGForm($('.int-rt-strctr-detail-table')).getData();
    requestParam.projectId =  $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
    requestParam.beforeApplyStartDate = beforeApplyStartDate;

    PFRequest.post('/interestRateStructure/updateInterestRateStructureMaster.json', requestParam, {
        success: function(result) {
            PFComponent.showMessage(bxMsg('workSuccess'), 'success');

            modifyFlag = false;

            traceTree.traceList = result.fullPath.split('.');
            traceTree.depth = 0;
            traceTree.completeTrace = false;
            renderIntRtStructureNavTree.isRendered = false;
            renderIntRtStructureNavTree();

            result.bizDscd = requestParam.bizDscd;
            beforeApplyStartDate = result.applyStartDate;
            bindDetailInfo(result);
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'InterestRateStructureService',
            operation: 'updateInterestRateStructureMaster'
        }
    });

    function bindDetailInfo(data){
        $('.int-rt-strctr-detail-table .tntInstId').val(data.tntInstId);
        $('.int-rt-strctr-detail-table .pdInfoDscd').val(data.pdInfoDscd);
        $('.int-rt-strctr-detail-table .bizDscd').val(data.bizDscd);
        $('.int-rt-strctr-detail-table .intRtStructureTypeCode').val(data.intRtStructureTypeCode);
        $('.int-rt-strctr-detail-table .intRtStructureClassificationCode').val(data.intRtStructureClassificationCode);
        $('.int-rt-strctr-detail-table .intRtStructureCode').val(data.intRtStructureCode);
        $('.int-rt-strctr-detail-table .intRtStructureName').val(data.intRtStructureName);
        $('.int-rt-strctr-detail-table .int-rt-strctr-sts-select').val(data.intRtStructureStatusCode);
        $('.int-rt-strctr-detail-table .apply-start-date').val(data.applyStartDate);
        $('.int-rt-strctr-detail-table .apply-end-date').val(data.applyEndDate);
        $('.int-rt-strctr-detail-table .frctn-aply-way-cd').val(data.fractionApplyWayCode);
        $('.int-rt-strctr-detail-table .frctn-aply-cnt').val(data.fractionApplyCount);
        $('.int-rt-strctr-detail-table .int-rt-strctr-content').val(data.intRtStructureContent);
        $('.int-rt-strctr-detail-table .conversion-content').val(data.conversionContent);
    }
});

// 금리체계 삭제버튼
onEvent('click', '.master-delete-btn', function(){
    if(!isHaveProject()){
        haveNotTask();
        return;
    }

    if($($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val() === ''){
        selectNotTask();
        selectedYourTask();
        return;
    }

    if( $($('.default-layout-task-menu', parent.document).find('.your-task')[0]).attr('data-status')=='true'){
        selectedYourTask();
        return;
    }

    var requestParam = PFComponent.makeYGForm($('.int-rt-strctr-detail-table')).getData();
    requestParam.projectId =  $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();

    PFRequest.post('/interestRateStructure/deleteInterestRateStructureMaster.json', requestParam, {
        success: function(result) {

            PFComponent.showMessage(bxMsg('workSuccess'), 'success');

            traceTree.traceList = [requestParam.bizDscd, requestParam.intRtStructureClassificationCode];
            traceTree.depth = 0;
            traceTree.completeTrace = false;
            renderIntRtStructureNavTree.isRendered = false;
            renderIntRtStructureNavTree();

            $el.find('.pf-irs-info-wrap').removeClass('active');
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'InterestRateStructureService',
            operation: 'deleteInterestRateStructureMaster'
        }
    });
});

// 상품관계 저장버튼
onEvent('click', '.rel-save-btn', function(){
    if(!isHaveProject()){
        haveNotTask();
        return;
    }

    if($($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val() === ''){
        selectNotTask();
        selectedYourTask();
        return;
    }

    if( $($('.default-layout-task-menu', parent.document).find('.your-task')[0]).attr('data-status')=='true'){
        selectedYourTask();
        return;
    }

    var voList = deleteRelPdList.concat(grdRelPd.getAllData());
    voList =  $.grep(voList, function(el, i){
        return  el.process != null && el.process != '';
    });

    if(voList.length == 0){
    	// 변경된 정보가 없습니다.
		PFComponent.showMessage(bxMsg('nothingToSave'), 'warning');
		return;
    }

    var requestParam = {
        tntInstId : tntInstId
        , voList : voList
    };

    requestParam.projectId =  $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();

    PFRequest.post('/interestRateStructure/savePdInterestRateStructureRelation.json', requestParam, {
        success: function (responseData) {

        	if(responseData){

	            var requestParam = PFComponent.makeYGForm($('.int-rt-strctr-detail-table')).getData();
	            PFRequest.get('/interestRateStructure/getListPdInterestRateStructureRelation.json', requestParam, {
	                success: function (responseData) {
	                	relModifyFlag = false;
	                	grdRelPd.setData(responseData.voList);
	                    PFComponent.showMessage(bxMsg('workSuccess'), 'success');
	    	            deleteRelPdList = [];
	                },
	                bxmHeader: {
	                    application: 'PF_Factory',
	                    service: 'InterestRateStructureService',
	                    operation: 'getListPdInterestRateStructureRelation'
	                }
	            });
        	}
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'InterestRateStructureService',
            operation: 'savePdInterestRateStructureRelation'
        }
    });
});

// add button click event
onEvent('click', '.add-rel-product-btn', function() {

    PFPopup.selectProduct({ pdInfoDscd, isSelectTemplate: true, multi: true },
        function (pd, category1, category2, category3) {

        if(pd.length > 0){

            var intRtStructureCode = $('.int-rt-strctr-detail-table .intRtStructureCode').val();

            pd.forEach(function(el){

            	var dup = false;
            	grdRelPd.getAllData().forEach(function(item){
            		if(el.firstCatalogId == item.bizDscd
            				&& el.secondCatalogId == item.productTypeCode
            				&& el.productTemplateCode == item.productTemplateCode
            				&& el.code == item.productCode ){
            			dup = true;
            			return;
            		}
            	})
            	if(dup){
            		PFComponent.showMessage(bxMsg('CannotAddExistingItem'), 'warning');
        	        return;
            	}

                var newData;

                if(el && el.code != '*' && !category3){

                    var requestParam = {
                        pdInfoDscd : pdInfoDscd
                        , id : el.fullPath
                        , firstCatalogId : el.firstCatalogId
                        , secondCatalogId : el.secondCatalogId
                        , code : el.productTemplateCode
                    };
                    PFRequest.get('/product/template/getProductTemplate.json', requestParam, {
                        success: function (responseData) {
                            newData = {
                                'pdInfoDscd': pdInfoDscd
                                , 'bizDscd': category1
                                , 'productTypeCode': responseData.secondCatalogId
                                , 'productTypeName': responseData.secondCatalogName
                                , 'productTemplateCode': responseData.code
                                , 'productTemplateName': responseData.name
                                , 'productCode': el.code
                                , 'productName': el.name
                                , 'applyStartDate': PFUtil.getToday() + " 00:00:00"
                                , 'applyEndDate': '9999-12-31 23:59:59'
                                , 'intRtStructureCode': intRtStructureCode
                                , 'relationInformationStatus' : '01'
                                , 'process': 'C'
                            };
                            grdRelPd.addData(newData);
                        },
                        bxmHeader: {
                            application: 'PF_Factory',
                            service: 'PdTemplateService',
                            operation: 'queryPdTemplate'
                        }
                    });
                }else {
                    newData = {
                        'pdInfoDscd': pdInfoDscd
                        , 'bizDscd': category1
                        , 'productTypeCode': category2 ? category2.code : '*'
                        , 'productTypeName': category2 ? category2.name : bxMsg('Z_All')
                        , 'productTemplateCode': category3 ? category3.code : '*'
                        , 'productTemplateName': category3 ? category3.name : bxMsg('Z_All')
                        , 'productCode': el ? el.code : '*'
                        , 'productName': el ? el.name : bxMsg('Z_All')
                        , 'applyStartDate': PFUtil.getToday() + " 00:00:00"
                        , 'applyEndDate': '9999-12-31 23:59:59'
                        , 'intRtStructureCode': intRtStructureCode
                        , 'relationInformationStatus' : '01'
                        , 'process': 'C'
                    };
                    grdRelPd.addData(newData);
                }
            });
        }
        relModifyFlag = true;
    });
});

// 편집버튼
onEvent('click','.int-rt-strctr-edit-btn', function(e) {
    PFPopup.editFormula({
      formulaContent : $('.int-rt-strctr-detail-table .int-rt-strctr-content').val(),
      type : '03'
    }, (formulaContent, conversionContent) => {
        $('.int-rt-strctr-detail-table .int-rt-strctr-content').val(formulaContent);
        $('.int-rt-strctr-detail-table .conversion-content').val(conversionContent);
    });
});

//공식내용입력 시
onEvent('keyup.xdsoft', '.int-rt-strctr-content', function(e) {

	if(PFFormulaEditor.validate(e.target.value) || e.target.value.length == 0){
		$('.conversion-content').val('');
	}else{
		$('.conversion-content').val(bxMsg('invalidFormula'));
	}

});

// 검증버튼
onEvent('click', '.formula-validation-btn', function(e) {

    var requestParam = PFComponent.makeYGForm($('.int-rt-strctr-detail-table')).getData();

    if(!requestParam.intRtStructureContent){
        PFComponent.showMessage(bxMsg('FormulaContentError'), 'warning');
        return;
    }

    if(!PFFormulaEditor.validate(requestParam.intRtStructureContent)){
    	PFComponent.showMessage(bxMsg('invalidFormula'), 'warning');
        return;
    }

    PFRequest.get('/interestRateStructure/validateFormula.json', requestParam, {
        success: function (responseData) {
        	PFComponent.showMessage(bxMsg("noAbnormality"), "success");
            $('.int-rt-strctr-detail-table .conversion-content').val(responseData);
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'InterestRateStructureService',
            operation: 'validateFormula'
        }
    });
});

// history button click
onEvent('click', '.int-rt-strctr-history-btn', function(e){
    var formData = PFComponent.makeYGForm($('.pf-irs-int-rt-strctr-detail .int-rt-strctr-detail-table')).getData();
    renderFormulaHistoryPopup(formData);
});



/******************************************************************************************************************
 * rendering 함수
 ******************************************************************************************************************/

// 트리박스
function renderTreeBox() {
    $('.pf-irs-left-tree-box').html(intRtStructureTreeTpl());

    loginTntInstId = getLoginTntInstId();  // loginTntInstId = $('.product-factory-header', parent.document).find('.login-tntInst-id').text();
    tntInstId = getLoginTntInstId();
    mother = getMortherYn();

    // 기관코드 콤보 바인딩
    renderTntInstComboBox($el.find('.pf-multi-entity'), tntInstId, function(returnValue) {

        if(!returnValue) return;

        if (!getMortherYn()) {
            $el.find('.pf-multi-entity-yn').hide();
        }
        renderTree();                		//renderProductInfo();
    });
}


// 트리와 메인화면을
function renderTree(treeItem) {

    var path = (treeItem) ? treeItem.id : null;
    if(path == null){
        hash = '';
        $el.find('.pf-irs-info-wrap').removeClass('active');
    }

 // pf-event에서 처리
//    $('.pf-detail-wrap').on('change','input',function(){
//        modifyFlag = true;
//        $('.most-significant-box').attr('data-edited','true');
//    });

    var hash = PFUtil.getHash();
    if (!hash) {
        traceTree.completeTrace = true;
        renderIntRtStructureNavTree();
        return;
    } else {

	    // 메인화면조회
	    var requestParam = {};
	    $.each(hash.split('&'),function(index, hashItem){
            var param = hashItem.split('=');
            requestParam[param[0]] = param[1];
        });
	    requestParam.intRtStructureCode = requestParam.code;

	    delete requestParam.code;
	    delete requestParam.fullpath;

	    PFRequest.get('/interestRateStructure/getInterestRateStructureMaster.json', requestParam, {
	        success: function (result) {

	        	modifyFlag = false;

                setTaskRibbonInput(result.projectBaseVO.projectId, result.projectBaseVO.name);

                var arrPath = result.fullPath.split('.');
	            result.bizDscd = arrPath[0];
	            beforeApplyStartDate = result.applyStartDate;
	            renderDetailInfo(result);

	            traceTree.traceList = arrPath;
                traceTree.depth = 0;
	            renderIntRtStructureNavTree();
	        },
	        bxmHeader: {
	            application: 'PF_Factory',
	            service: 'InterestRateStructureService',
	            operation: 'getInterestRateStructureMaster'
	        }
	    });
    }
}

function renderDetailInfo(data){

    $el.find('.pf-irs-info-wrap').addClass('active');
    $el.find('.pf-irs-info').html(intRtStructureDetailInfoTpl(data));

    // 권한이 없으면 버튼 숨김
    if(writeYn != 'Y'){
        $('.write-btn').hide();
    }

    renderComboBox("ProductStatusCode", $('.int-rt-strctr-detail-table .int-rt-strctr-sts-select'), true);
    renderComboBox("FrctnAplyWayCode", $('.int-rt-strctr-detail-table .frctn-aply-way-cd'), '01', true);


    if(data) {
        $('.int-rt-strctr-sts-select').val(data.intRtStructureStatusCode);
        $('.frctn-aply-way-cd').val(data.fractionApplyWayCode);
        $('.conversion-content').val(data.conversionContent);
    }else{
    	$('.frctn-aply-cnt').val(2);
    }

    PFUtil.getDatePicker(true);

    grdRelPd = renderRelPdGrid('.pf-irs-product-relation .pf-irs-rel-pd-list-grid', data);
}

/******************************************************************************************************************
 * 트리 관련
 ******************************************************************************************************************/
function renderIntRtStructureNavTree() {

    if (renderIntRtStructureNavTree.isRendered) {
        return;
    }
    renderIntRtStructureNavTree.isRendered = true;


    PFUI.use(['pfui/tree', 'pfui/data', 'pfui/menu'], function (Tree, Data, Menu) {

        /* --------------------------------------
         * nvaTreeStore
         * -------------------------------------- */

        var treeType = 'PT';
        var pdInfoDscd = '01';

        if (g_serviceType == g_bxmService){
            var params = {
                header: {
                    application: 'PF_Factory',
                    service: 'CatalogService',
                    operation: 'queryCatalog'
                },
                input: {
                    tntInstId: loginTntInstId,
                    pdInfoDscd: pdInfoDscd,
                    treeType: treeType,
                    commonHeader: {
                        loginTntInstId: loginTntInstId
                    }
                }
            };

            navTreeStore = new Data.TreeStore({
                autoLoad: false,
                url: '/serviceEndpoint/json/request.json',
                dataProperty: 'childCatalogs',
                proxy : {
                    method : 'POST',
                    ajaxOptions : {
                        contentType: 'application/json; charset=UTF-8',
                        data:JSON.stringify(params)
                    },
                    dataType : 'json'
                },
                map: {
                    'name': 'text',
                    'id': 'id',
                    'bottom': 'leaf',
                    'childTransactionCode': 'childTransactionCode',
                    'type': 'type'
                }
            });
        } else {
            navTreeStore = new Data.TreeStore({
                autoLoad: false,
                url: '/catalog/getCatalog.json?commonHeaderMessage={"loginTntInstId":"' + loginTntInstId + '"}&tntInstId=' + loginTntInstId + '&pdInfoDscd=' + pdInfoDscd + '&treeType=' + treeType ,
                dataProperty: 'childCatalogs',
                map: {
                    'name': 'text',
                    'id': 'id',
                    'bottom': 'leaf',
                    'childTransactionCode': 'childTransactionCode',
                    'type': 'type'
                }
            });
        }

        // click change url params
        // csl='folder' and 'leaf=false' 일 때 호출됨
        navTreeStore.on('beforeload', function (ev) {
            var params = ev.params;
            var node = navTreeStore.findNode(params.id);
            var queryParams;

            if(!node) {
                return;
            }


            if(g_serviceType == g_bxmService) {  // bxm


            	if(node.level == 1){

            		var domainCode;
            		if(node.id == '01'){
            			domainCode = 'P0091';
                    }else if(node.id == '02'){
                    	domainCode = 'P0092';
                    }else if(node.id == '03'){
                    	domainCode = 'P0111';
                    }else if(node.id == '10'){
                    	domainCode = 'P0159';
                    }else if(node.id == '11'){
                    	domainCode = 'P0160';
                    }

            		var queryParams = {
                        header: {
                            application: 'PF_Factory',
                            service: 'CommonCodeDetailService',
                            operation: 'queryListCommonCodeDetail',
                            locale: getCookie('lang')
                        },
                        input: {
                            tntInstId: tntInstId,
                            inqrySeqSort: true,
                            domainCode : domainCode,
                            activeYn : 'Y',
                            commonHeader: {
                                loginTntInstId: getLoginTntInstId(),
                                lastModifier: getLoginUserId()
                            }
                        }
                    };

            		navTreeStore.get('proxy').set('ajaxOptions', {
                        contentType: 'application/json; charset=UTF-8',
                        data:JSON.stringify(queryParams)
                    });

                    navTreeStore.set('map', {
                        'instanceName': 'text',
                        'instanceCode': 'id'
                    });

            	}
                else if(node.level == 2){
                	var queryParams = {
                        header: {
                            application: 'PF_Factory',
                            service: 'InterestRateStructureService',
                            operation: 'getListInterestRateStructureMaster',
                            locale: getCookie('lang')
                        },
                        input: {
                            tntInstId: tntInstId,
                            intRtStructureClassificationCode: node.id,
                            commonHeader: {
                                loginTntInstId: getLoginTntInstId(),
                                lastModifier: getLoginUserId()
                            }
                        }
                    };

            		navTreeStore.get('proxy').set('ajaxOptions', {
                        contentType: 'application/json; charset=UTF-8',
                        data:JSON.stringify(queryParams)
                    });

            		navTreeStore.set('map', {
                        'intRtStructureName': 'text',
                        'intRtStructureCode': 'id'
                    });
                }
            }else{
                if(node.level == 1){
                    queryParams = 'tntInstId=' + loginTntInstId + '&commonHeaderMessage={"loginTntInstId":"' + loginTntInstId + '"}'
                        '&inqrySeqSort=true';

                    if(node.id == '01'){
                        queryParams = queryParams + '&domainCode=P0091';
                    }else if(node.id == '02'){
                        queryParams = queryParams + '&domainCode=P0092';
                    }else if(node.id == '03'){
                        queryParams = queryParams + '&domainCode=P0111';
                    }else if(node.id == '10'){
                        queryParams = queryParams + '&domainCode=P0159';
                    }else if(node.id == '11'){
                        queryParams = queryParams + '&domainCode=P0160';
                    }

                    queryParams = queryParams + '&isInqrySeqSort=true';
                    queryParams = queryParams + '&activeYn=Y';

                    navTreeStore.get('proxy').set('url', '/commonCode/getCommonCodeDetailList.json?' + queryParams);
                    navTreeStore.set('map', {
                        'instanceName': 'text',
                        'instanceCode': 'id'
                    });
                }
                else if(node.level == 2){
                    queryParams = 'tntInstId=' + loginTntInstId + '&commonHeaderMessage={"loginTntInstId":"' + loginTntInstId + '"}'
                                + '&intRtStructureClassificationCode='+node.id;
                    navTreeStore.get('proxy').set('url', '/interestRateStructure/getListInterestRateStructureMaster.json?' + queryParams);
                    navTreeStore.set('map', {
                        'intRtStructureName': 'text',
                        'intRtStructureCode': 'id'
                    });
                }
            }
        });

        navTreeStore.on('beforeprocessload', function (ev) {

            var typeArr = [];
            var listData;
            var data = ev.data;

            if(data.ModelMap){
                data.responseMessage = data.ModelMap.responseMessage;
            }

            if($.isArray(data.responseMessage)) {

                data.childCatalogs = data.responseMessage;
                // 2018.02.28. BXM에서 동작하도록 수정
                if((data.commonCodeDetailVO || (data.header && data.header.operation === 'queryListCommonCodeDetail'))
                    && data.childCatalogs.length > 0){
                    data.childCatalogs.forEach(function(el){
                        el.cls = 'Folder';
                        el.leaf = false;
                        el.instanceName = '['+el.instanceCode+'] '+el.instanceName;
                    })
                }
            }
            else if (data.responseMessage) {
                data.childCatalogs = [];
                if(data.responseMessage.childCatalogs.length > 0){
                    data.responseMessage.childCatalogs.forEach(function(el){
                    	// 수신 or 여신 or 외환
                        //if(el.id == '01' || el.id == '02'){
                        	el.bottom = false;
                            data.childCatalogs.push(el);
                        //}
                    })
                }
            }
            else {
                data.responseMessage = [];
            }
        });

        navTreeStore.on('load', function() {
            traceTree();
        });

        navTreeStore.load();


        /* --------------------------------------
         * navTree 생성
         * -------------------------------------- */

        $('.pf-irs-tree-nav').empty();

        navTree = new Tree.TreeList({
            render: '.pf-irs-tree-nav',
            showLine: false,
            store: navTreeStore,
            checkType: 'none',
            showRoot: false
        });

        navTree.render();

        var treeItem;

        // tree item double click
        navTree.on('itemdblclick', function(e) {

            location.hash = 'code='+e.item.id;
            treeItem  = e.item;

            if(treeItem.level == 3){
            	if(!modifyFlag && !relModifyFlag){
            		openIntRtStructureEvent();
            	}else{
            		PFComponent.showConfirm(bxMsg('warningDontSaved'), function() {
            			openIntRtStructureEvent();
                        $('.most-significant-box').removeAttr('data-edited');
                        modifyFlag = false;
                        relModifyFlag = false;
                    }, function() {
                        return;
                    });
            	}
            }
        });

        /* --------------------------------------
         * Context Menu Event - 금리체계
         * -------------------------------------- */

        // 금리체계 열기 이벤트
        var openIntRtStructureEvent = function() {
            var requestParam = {};
            requestParam.tntInstId = treeItem.tntInstId;
            requestParam.intRtStructureCode = treeItem.id;
            requestParam.applyStartDate = treeItem.applyStartDate;

            PFRequest.get('/interestRateStructure/getInterestRateStructureMaster.json', requestParam, {
                success: function (result) {

                    setTaskRibbonInput(result.projectBaseVO.projectId, result.projectBaseVO.name);

                    result.bizDscd = treeItem.path[1];
                    beforeApplyStartDate = result.applyStartDate;

                    renderDetailInfo(result);
                },
                bxmHeader: {
                    application: 'PF_Factory',
                    service: 'InterestRateStructureService',
                    operation: 'getInterestRateStructureMaster'
                }
            });
        }

        // 금리체계 신규 이벤트
        var createIntRtStructureEvent = function() {

            if(!isHaveProject()){
                haveNotTask();
                return;
            }

            if($($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val() === ''){
                selectNotTask();
                selectedYourTask();
                return;
            }

            if( $($('.default-layout-task-menu', parent.document).find('.your-task')[0]).attr('data-status')=='true'){
                selectedYourTask();
                return;
            }

            var data = treeItem.record;
            data.intRtStructureTypeCode = '01';
            data.intRtStructureStatusCode = '01';   // 수정가능
            data.applyStartDate = PFUtil.getToday() + " 00:00:00";
            data.applyEndDate = '9999-12-31 23:59:59';
            renderIntRtStructureCreatePopup(data);
        }


        /* --------------------------------------
         * Context Menu Event - 상품 관계 관리
         * -------------------------------------- */
        var PfRelationManagementEvent = function(){
            location.hash = makeClassificationInfoParameter(treeItem);
            if(!modifyFlag && !relModifyFlag){
                renderTree(treeItem);
            }else{
                PFComponent.showConfirm(bxMsg('warningDontSaved'), function() {
                    renderTree(treeItem);
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


        // 금리체계 신규 context menu
        var intRtStructureNewContextMenu = new Menu.ContextMenu({
            children: [
                makeContextMenu('icon-plus', bxMsg('createIntRtStructure'), createIntRtStructureEvent)     // 금리체계 신규
            ]
        });

        // 금리체계 신규 context menu
        var intRtStructureReadOnlyContextMenu = new Menu.ContextMenu({
            children: [
                makeContextMenu('icon-zoom-in', bxMsg('Context_Menu2'), openIntRtStructureEvent)     // 금리체계 열기
            ]
        });

        var intRtStructureContextMenu = new Menu.ContextMenu({
            children: [
                makeContextMenu('icon-zoom-in', bxMsg('Context_Menu2'), openIntRtStructureEvent)     // 금리체계 열기
            ]
        });

        var intRtStructureEmergencyContextMenu = new Menu.ContextMenu({
            children: [
                makeContextMenu('icon-zoom-in', bxMsg('Context_Menu2'), openIntRtStructureEvent)     // 금리체계 열기
            ]
        });


        // context menu 추가
        navTree.on('itemcontextmenu', function(ev){

            if(loginTntInstId != tntInstId) return; // 타기관 선택 시 contextmenu 보여주지 않음

            var item = ev.item;
            navTree.setSelected(item);
            treeItem = item;

            var y = ev.pageY >= 500 ? ev.pageY-(28*4) : ev.pageY;

            // 최상위인 경우
            if(treeItem.level == 2){
                if(writeYn != 'Y'){

                }else{
                    intRtStructureNewContextMenu.set('xy', [ev.pageX, y]);
                    intRtStructureNewContextMenu.show();
                }

            }
            // 가맹점그룹인 경우
            else if(treeItem.level == 3) {
                // 쓰기 권한이 없는 경우
                if(writeYn != 'Y'){
                    intRtStructureReadOnlyContextMenu.set('xy', [ev.pageX, y]);
                    intRtStructureReadOnlyContextMenu.show();
                }
                // 쓰기 권한이 있는 경우
                else{
                    // 활동여부가 N 이거나 emergency이면
                    if(treeItem.activeYn == 'N' || (getSelectedProjectId() && isEmergency(getSelectedProjectId()))){
                        intRtStructureEmergencyContextMenu.set('xy', [ev.pageX, y]);
                        intRtStructureEmergencyContextMenu.show();
                    }else{
                        intRtStructureContextMenu.set('xy', [ev.pageX, y]);
                        intRtStructureContextMenu.show();
                    }
                }
            }
            return false;
        });

    });


}

// 트리 박스 스크롤
function scrollMove(){
    var selectedItemTop = $('.pfui-tree-item.pfui-tree-item-selected').offset().top;
    $('.pf-left-nav .pf-panel-body').scrollTop(selectedItemTop-200);
}

//
function traceTree() {
    if(traceTree.completeTrace) {return;}

    var currentNode = navTreeStore.findNode(traceTree.traceList[traceTree.depth]);

    if(((traceTree.traceList.length - 1) === traceTree.depth)) {
        setTimeout(function() {
            navTree.setSelection(currentNode);
            scrollMove();
        }, 500)
        traceTree.completeTrace = true;
        return;
    }else {
        navTree.expandNode(currentNode);
    }

    traceTree.depth++;
}


// 검색트리
function loadIntRtStructureList(name) {

    $el.find('.irs-search-list-wrap').addClass('active');
    $el.find('.irs-search-list-wrap').empty();

    var tntInstId = $el.find('.pf-multi-entity').val();
    //var loginTntInstId = $('.product-factory-header', parent.document).find('.login-tntInst-id').text();

    var ua = window.navigator.userAgent;
    if (ua.indexOf('MSIE') > 0 || ua.indexOf('Trident') > 0) {
    	name = encodeURI(name);
    }
    
    PFUI.use(['pfui/tree', 'pfui/data'], function (Tree, Data) {

        var store;
        if(g_serviceType == g_bxmService){    // bxm

            var params = {
                header: {
                    application: 'PF_Factory',
                    service: 'InterestRateStructureService',
                    operation: 'getListInterestRateStructureMaster',
                    locale: getCookie('lang')
                },
                input: {
                    tntInstId: tntInstId,
                    pdInfoDscd: pdInfoDscd,
                    intRtStructureName : name,
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
                	'intRtStructureName': 'text',
                    'intRtStructureCode': 'id'
                }
            });
        }else{
            store = new Data.TreeStore({
                autoLoad: false,
                dataProperty: 'list',
                url: '/interestRateStructure/getListInterestRateStructureMaster.json?tntInstId='+tntInstId+'&intRtStructureName='+name+'&commonHeaderMessage={"loginTntInstId":"'+getLoginTntInstId()+ '", "lastModifier":"' + getLoginUserId() +'"}'
                +'&pdInfoDscd='+pdInfoDscd,
                map: {
                	'intRtStructureName': 'text',
                    'intRtStructureCode': 'id'
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
            render : '.irs-search-list-wrap',
            showLine : false,
            store : store,
            showRoot : false
        });

        tree.render();

        tree.on('itemdblclick', function(e) {

            location.hash = 'code=' + e.item.id+'&path='+e.item.fullPath+'&tntInstId='+e.item.tntInstId;
            location.reload();

            if(!modifyFlag && !relModifyFlag){
                $el.find('.irs-search-list-wrap').removeClass('active');
            }
        });
    });
}


/******************************************************************************************************************
 * 그리드 관련
 ******************************************************************************************************************/
function renderRelPdGrid($selecter, requestData, historyYn) {

    var arrFormulaDscd = $.merge(codeArrayObj['DepositFormulaDscd'].slice(0), codeArrayObj['LoneFormulaDscd']);

    var grid = PFComponent.makeExtJSGrid({
        fields: [
            "tntInstId","pdInfoDscd","applyStartDate","applyEndDate"
            ,"bizDscd", "productTypeCode", {
                name:"productTypeName",
                convert: function(newValue, record){
                    if(record.get('productTypeCode') == '*'){
                        return bxMsg('Z_All');
                    }else{
                        return newValue;
                    }
                }
            }, "productTemplateCode", {
                name: "productTemplateName",
                convert: function(newValue, record){
                    if(record.get('productTemplateCode') == '*'){
                        return bxMsg('Z_All');
                    }else{
                        return newValue;
                    }
                }
            }
            ,"productCode", {
                name: "productName",
                convert: function(newValue, record){
                    if(record.get('productCode') == '*'){
                        return bxMsg('Z_All');
                    }else{
                        return newValue;
                    }
                }
            }, "intRtStructureCode", "relationInformationStatus", 'process'
        ],
        //dataRoot: 'list',
        gridConfig: {
            renderTo: $selecter,
            columns: [
                // 업무구분코드
                {text: bxMsg('DPS0101String10'),  width:70, dataIndex: 'bizDscd', style: 'text-align:center',
                    renderer: function(value) {
                        return codeMapObj.ProductCategoryLevelOneCode[value] || value;
                    },
                    editor: {
                        xtype: 'combo',
                        typeAhead: true,
                        triggerAction: 'all',
                        displayField: 'name',
                        valueField: 'code',
                        editable: false,
                        store: new Ext.data.Store({
                            fields: ['code', 'name'],
                            data: codeArrayObj['ProductCategoryLevelOneCode']
                        })
                    }
                },

                // 상품유형
                {text: bxMsg('DPS0101String11'),  width:100, dataIndex: 'productTypeName', style: 'text-align:center'},

                // 상품템플릿
                {text: bxMsg('DPS0101String3'),  width:120, dataIndex: 'productTemplateName', style: 'text-align:center'},

                // 상품
                //{text: bxMsg('pdCd'),  width:150, dataIndex: 'productCode', style: 'text-align:center'},
                {text: bxMsg('pdNm'),  flex:1, dataIndex: 'productName', style: 'text-align:center'},

                // 적용시작일자
                {text: bxMsg('DPP0127String6'), width:130, dataIndex:'applyStartDate', align: 'center',
                    editor: {
                        allowBlank: false,
                        listeners: {
                            focus: function(_this) {
                                var isNextDay = true;
                                if(getSelectedProjectId() && (isEmergency(getSelectedProjectId()) || isUpdateStatus(getSelectedProjectId()))){
                                    isNextDay = false;
                                }
                                PFUtil.getGridDateTimePicker(_this, 'applyStart', grid, selectedCellIndex, isNextDay);
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

                // 적용종료일자
                {text: bxMsg('DPP0127String7'), width:130, dataIndex:'applyEndDate', align: 'center',
                    editor: {
                        allowBlank: false,
                        listeners: {
                            focus: function(_this) {
                                PFUtil.getGridDateTimePicker(_this, 'applyEnd', grid, selectedCellIndex, true);
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

                // 상태
                {text: bxMsg('DPS0101String6'),  width:80, dataIndex: 'relationInformationStatus', style: 'text-align:center',
                    renderer: function(value) {
                        return codeMapObj.ProductStatusCode[value] || value;
                    },
                    editor: {
                        xtype: 'combo',
                        typeAhead: true,
                        triggerAction: 'all',
                        displayField: 'name',
                        valueField: 'code',
                        editable: false,
                        store: new Ext.data.Store({
                            fields: ['code', 'name'],
                            data: codeArrayObj['ProductStatusCode']
                        })
                    }
                },

                // 삭제
                {   // delete row
                    xtype: 'actioncolumn', width: 35, align: 'center', sortable: false,
                    items: [{
                        icon: '/images/x-delete-16.png',
                        handler: function (grid, rowIndex, colIndex, item, e, record) {
                            if(record.data.process != 'C') {
                                record.data.process = 'D';
                                deleteRelPdList.push(record.data);
                            }
                            record.destroy();
                        }
                    }]
                }
            ],
            plugins : [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1,
                    listeners : {
                        beforeedit:function(e, editor){

                            if((editor.field != 'applyStartDate' && editor.field != 'applyEndDate')){
                                return false;
                            }

                            var projectId = getSelectedProjectId();
                            if( (projectId && (isEmergency(projectId) || isUpdateStatus(projectId))) ||
                                editor.record.data.process == 'C' || editor.record.data.relationInformationStatus == '01'){
                                // emergency, 상품정보수정, 신규, 수정가능상태 일때
                            }
                            else if(editor.field != 'applyEndDate') {
                                // 그 외의 경우는 종료일자만 update 가능
                                return false;
                            }
                        },
                        afteredit: function(e, editor){
                            if(editor.originalValue !=  editor.value){

                                if(editor.field != 'applyEnd' && (editor.record.get('process') == null || editor.record.get('process').length == 0)){
                                    var originalData = $.extend(true, {}, editor.record.data);
                                    originalData[editor.field] = editor.record.modified[editor.field];
                                    originalData['process'] = 'D';
                                    deleteRelPdList.push(originalData);

                                    editor.record.set('process', 'C');
                                }

                                else if(editor.record.get('process') != 'C') {
                                    editor.record.set('process', 'U');
                                }
                            }
                        }
                    }
                })
            ],
            listeners:{
                scope: this,
                'celldblclick': function (_this, td, cellIndex, record, tr, rowIndex, e, eOpts) {
                }
                ,'afterrender': function(){

                    var requestParam = {};
                    requestParam.tntInstId = requestData.tntInstId;
                    requestParam.intRtStructureCode = requestData.intRtStructureCode;

                    PFRequest.get('/interestRateStructure/getListPdInterestRateStructureRelation.json', requestParam, {
                        success: function (responseData) {
                        	relModifyFlag = false;
                            grid.setData(responseData.voList);
                        },
                        bxmHeader: {
                            application: 'PF_Factory',
                            service: 'InterestRateStructureService',
                            operation: 'getListPdInterestRateStructureRelation'
                        }
                    });
                }
            }
        }
    });

    return grid;
}


/******************************************************************************************************************
 * 사용자 함수
 ******************************************************************************************************************/
// 파라미터 조합
function makeClassificationInfoParameter(treeItem) {
    var returnVal;

//    if (treeItem.level == 1) {
        returnVal = 'intRtStructureCode=' + treeItem.id;
//    }else{treeItem.level > 1}{
//        returnVal = 'classificationStructureDistinctionCode=' + treeItem.classificationStructureDistinctionCode
//            + '&classificationCode=' + treeItem.classificationCode;
//    }

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

// 개발과제가 Emergency 일 때
function fnEmergencyControl(flag){

    if(writeYn == 'Y'){
        if(flag) {
            $('.write-btn').prop('disabled', false);
        }
        else if($('.cls-active-yn-select').val() == 'Y'){
            $('.class-delete-btn').prop('disabled', true);
        }
    }
}