/**
 * @author wb-yealeekim
 * @version $$id: product.js, v 0.1 2015-01-22 PM 3:09 wb-yealeekim Exp $$
 */

var gridRendered = false;
var gridDeleteDate  = [];
var currentEventGrid;

var product = '01';
var service = '02';

/**********************************************************************************************************************
 * event function
 **********************************************************************************************************************/

// 관련조건 2017.08.23 yujin 임시코딩
// onEvent('focus', '.pf-cp-product-info-base-form .allianceContractNumber', function(e){

//     var submitEvent = function(data){
//         if(!data) return;
//         $('.pf-cp-product-info-base-form .allianceContractNumber').val(data[0].code);
//         $('.pf-cp-product-info-base-form .cndName').val(data[0].name);
//     }

//     renderConditionTemplateListSearchPopup(submitEvent, 'SINGLE');
// });

onEvent('click', '.packageYn-check', function(e) {
    var checked = $(e.currentTarget).prop('checked'),
        packageGridWrap = $el.find('.pf-base-package-grid-wrap');

    var isDisabled = $(e.currentTarget).prop('disabled');

    if(!isDisabled){
        if (checked) {
            $('.packageYn-check-value').val('Y');
            (gridRendered) ? packageGridWrap.show() : renderPackageGrid();
        } else {
            $('.packageYn-check-value').val('N');
            packageGridWrap.hide();
        }
    }

});

onEvent('click','.add-rel-info-btn',function(){
    setNewGridData(clickEventForCode, clickEventForNewData, clickEventForGrid);
});

//render add popup of relative product menu
// 상품-상품
// 서비스-서비스
// 서비스-포인트
// 포인트-포인트
onEvent('click', '.add-rel-product-btn', function() {
    clickEventForNewData.isPackageMandatoryProduct = false;
    clickEventForNewData.relationPdInfoDscd = pdInfoDscd_Product;
    setNewGridData(clickEventForCode,clickEventForNewData,clickEventForGrid);
});

onEvent('click', '.add-rel-service-btn', function() {
    clickEventForNewData.isPackageMandatoryProduct = false;
    clickEventForNewData.relationPdInfoDscd = pdInfoDscd_Service;
    setNewGridData(clickEventForCode,clickEventForNewData,clickEventForGrid);
});

onEvent('click', '.add-rel-point-btn', function() {
    clickEventForNewData.isPackageMandatoryProduct = false;
    clickEventForNewData.relationPdInfoDscd = pdInfoDscd_Point;
    setNewGridData(clickEventForCode,clickEventForNewData,clickEventForGrid);
});

// 상품 다건 선택 팝업
onEvent('click','.add-rel-product-popup-btn',function(){
	renderProductListPopupByMulti(pdInfoDscd_Product, false);
	modifyFlag = true;
});

/**
 * 서비스(Benefit)영역 관련서비스 추가버튼 클릭 처리
 * OHS 2017.02.21 수정 - 기존 그리드 1행추가에서 팝업형태로 변경
 */
onEvent('click','.add-rel-service-popup-btn',function(){
	renderProductListPopupByMulti(pdInfoDscd_Service, false);
	modifyFlag = true;
});

/**
 * 서비스(Benefit)영역 관련업종 추가버튼 클릭 처리
 * OHS 2017.02.23 수정 - 기존 그리드 1행추가에서 팝업형태로 변경
 */
onEvent('click','.add-rel-biz-category-popup-btn',function(){
   PFPopup.selectCommonCodeDetailByMulti({
     code: 'P0086',
     codeNm: bxMsg('relBizCategory'),
   }, (selectedItem, { merchantRelCode, aplyStartDate, endDate }) => {
     selectedItem.forEach((row) => {
       row.bizCategoryCode = row.instanceCode;
       row.merchantName = row.instanceName;
       row.bizCategoryRelCode = merchantRelCode; // 업종관계유형
       row.applyStart = aplyStartDate; // 적용시작년월일
       row.applyEnd = endDate; // 적용종료년월일
       row.process = 'C';
       row.relationInformationStatus = '01';
     });
     clickEventForGrid.addData(selectedItem);
     modifyFlag = true;
   });
});

/**
 * 서비스(Benefit)영역 관련서비스 추가버튼 클릭 처리
 * OHS 2017.02.21 수정 - 기존 그리드 1행추가에서 팝업형태로 변경
 */
onEvent('click','.add-rel-merchant-popup-btn',function(){
  PFPopup.selectMerchant2({}, function (selectedItems, {
    merchantRelCode,
    merchantTypeCode,
    aplyStartDate,
    endDate
  }) {
    // 전 가맹점
    if (merchantTypeCode === '01') {
      selectedItems = [{
        pdMerchantRelCode: merchantRelCode,
        merchantTypeCode,
        applyStart: aplyStartDate,
        applyEnd: endDate,
        process: 'C',
        relationInformationStatus: '01',
      }];

    }
    // 가맹점그룹 02
    else if (merchantTypeCode === '02') {
    	selectedItems.forEach((row) => {
    		row.merchantNumber = row.merchantGroupCode;
            row.merchantName = row.merchantGroupName;
            row.pdMerchantRelCode = merchantRelCode;
            row.merchantTypeCode = merchantTypeCode;
            row.applyStart = aplyStartDate; // 적용시작년월일
            row.applyEnd = endDate; // 적용종료년월일
            row.process = 'C';
            row.relationInformationStatus = '01';
    	});

    // 개별가맹점 03
    } else if (merchantTypeCode === '03') {
      selectedItems.forEach((row) => {
        row.merchantNumber = row.merchantCode;
        row.merchantName = row.merchantName;
        row.pdMerchantRelCode = merchantRelCode;
        row.merchantTypeCode = merchantTypeCode;
        row.applyStart = aplyStartDate; // 적용시작년월일
        row.applyEnd = endDate; // 적용종료년월일
        row.process = 'C';
        row.relationInformationStatus = '01';
      });
    }
    clickEventForGrid.addData(selectedItems);

    modifyFlag = true;
  });
});

onEvent('click','.class-stru-mgmt-btn',function(){
    parent.parameter = pdInfoDscd;
    // OHS 20171030 - 메뉴체계 변경에 따른 class name 수정
    parent.$('.configurator ul a.classification').click();
});

onEvent('click','.rel-save-btn',function(){

    if(!isHaveProject()){
        haveNotTask();
        return;
    }

    var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
    if(isNotMyTask(projectId)){
        return;
    };

    if(currentEventGrid === '2-3'){
        var gridData = clickEventForGrid.getAllData();
        for(var i in gridData){
            if(gridData[i].process != 'D' && (gridData[i].pdDocumentDistinctionCode == '' || gridData[i].pdDocumentDistinctionCode == null ||
                gridData[i].documentId == '' || gridData[i].documentId == null)){
                PFComponent.showMessage(bxMsg('Z_EmptyInputValue'), 'warning');
                return;
            }
        }
    }

    var gridDate = gridDeleteDate.concat(clickEventForGrid.getAllData());
    relDataSave(gridDate,clickSaveEventForUrl,projectId);

});


/**********************************************************************************************************************
 * render function
 **********************************************************************************************************************/

function renderBaseInfo() {
    var baseMenu,configTabRendered = false;
    gridRendered = false;
    var productBaseData;

    $el.find('.pf-cp-info-wrap').addClass('active');
    $el.find('.pf-cp-base-list-wrap').elementReady(function() {


        PFUI.use('pfui/tree',function(Tree){
            baseMenu = new Tree.TreeList({
                render : '.pf-cp-base-list-wrap',
                elCls: 'pf-cp-base-list',
                dirCls: '',
                leafCls: '',
                nodes : [
                    {id : '1', text : bxMsg('DPM100HeaderSring1')},
                    {id : '2', text : bxMsg('DPM100HeaderSring2'), expanded : true, children : relNodesChildren }
                ]
            });
            baseMenu.render();
            baseMenu.setSelection( baseMenu.getItemAt(0) );
            baseMenu.on('itemcontextmenu',function(ev){
                return false;
            });
            baseMenu.on('itemdblclick', function(ev) {
                if(!modifyFlag){
                    var tpl;
                    tpl = (ev.item.id === '1') ? baseInfoMngFormTpl : relInfoGridTpl;
                    renderBasePage(tpl, ev.item.id);
                    gridRendered = false;
                }else{
                    PFComponent.showConfirm(bxMsg('warningDontSaved'), function() {
                        var tpl;
                        tpl = (ev.item.id === '1') ? baseInfoMngFormTpl : relInfoGridTpl;
                        renderBasePage(tpl, ev.item.id);
                        gridRendered = false;
                        modifyFlag = false; // resetFormModifed();
                    }, function() {
                        return;
                    });
                }

                //var tpl;
                //tpl = (ev.item.id === '1') ? baseInfoMngFormTpl : relInfoGridTpl;
                //renderBasePage(tpl, ev.item.id);
                //gridRendered = false;
            });
        });

    });

    renderBasePage(baseInfoMngFormTpl, '1');
}

var tagsChanged = new Map();
function renderBasePage(basePageTpl, gridId) {
    currentEventGrid = gridId;
    if(tntInstId != $('.pf-cp-base-info').find('.tntInstId').val()){
        $('.pf-cp-base-info').find('.rel-save-btn').prop('disabled',true);
        $('.pf-cp-base-info').find('.pf-cp-product-info-delete-btn').prop('disabled',true);
    }

    //var loginTntInstId = $('.product-factory-header', parent.document).find('.login-tntInst-id').text();
    var hash = selectRequestParam.split('&');
    var requestParam = {
        code : hash[0].split('=')[1],
        path : hash[1].split('=')[1],
        tntInstId : hash[2].split('=')[1],
        pdInfoDscd : pdInfoDscd,
        commonHeaderMessage : '{"loginTntInstId" : "' + getLoginTntInstId() + '", "lastModifier"   : "' + getLoginUserId + '"}'
    }


    PFRequest.get('/product/getProductBase.json', requestParam, {
        success: function (productBaseDetailData) {

        	modifyFlag = false;

            setTaskRibbonInput(productBaseDetailData.projectBaseVO.projectId, productBaseDetailData.projectBaseVO.name);

            //dont remove from here
            conditionRequestParam = {
                businessDistinctionCode: productBaseDetailData.firstCatalogId,
                productTypeCode: productBaseDetailData.secondCatalogId,
                productTemplateCode: productBaseDetailData.productTemplateCode,
                code: productBaseDetailData.code,
                tntInstId: productBaseDetailData.tntInstId,
                pdInfoDscd: pdInfoDscd
            };

            if (firstConditionTabRender) {
                renderConditionTree(conditionRequestParam);
                firstConditionTabRender = false;
            }
            //to here. it's necessary to render condition tab.

            var treeId,
                traceArr = [],
                tempId = '',
                firstIdx = true,
                treeCode;

            var hashString = PFUtil.getHash();

            hashString.split('&').forEach(function (el) {
                if (el.split('=')[0] === 'path') {
                    treeId = el.split('=')[1];
                } else if (el.split('=')[0] === 'code') {
                    treeCode = el.split('=')[1];
                }
            });

            treeId.split('.').forEach(function (el, idx) {

                    if (firstIdx) {
                        tempId = el;
                        firstIdx = false;
                    } else {
                        tempId = tempId + '.' + el;
                    }

                    traceArr.push(tempId);
                }
            );

            traceTree.traceList = traceArr;
            traceTree.traceList.push(treeCode);
            traceTree.depth = 0;
            renderProductNavTree();

            var methodMap = {};

            switch (pdInfoDscd) {
                case pdInfoDscd_Product :
                    methodMap = {
                        '201': renderRelCustomerSegmentGrid,
                        '202': renderRelCustomerGrid,
                        '203': renderRelDocumentGrid,
                        '204': renderProductRelProductGrid,        // 관련상품(상품-상품)
                        '205': renderRelBranchGrid,
                        '206': renderProductNmGrid,
                        '207': renderEtcInfoGrid,
                        '208': renderProductCategoryGrid,
                        '209': renderRelemployeeGrid,
                        '210': renderBankbookTextGrid,
                        '211': renderProductRelServiceGrid,        // 관련서비스(상품-서비스)
                        '212': renderRelIntRtStructureGrid,
                        '213': renderProductRelPointGrid           //관련포인트(상품-포인트)
                    };
                    break;

                case pdInfoDscd_Service :
                    methodMap = {
                        '201': renderRelMerchantGrid,
                        '202': renderRelBizCategory,
                        '203': renderRelServiceGrid,        		// 관련서비스 (서비스-서비스)
                        '204': renderProductCategoryGrid,
                        '205': renderEtcInfoGrid,
                        '206': renderRelBranchGrid,
                        '207': renderServiceRelProductGrid,        //관련상품(서비스-상품)
                        '208': renderRelCustomerGrid,
                        '209': renderServiceRelPointGrid
                    };
                    break;

                case pdInfoDscd_Point :
                    methodMap = {
                        '201': renderRelDocumentGrid,
                        '202': renderPointRelPointGrid,				// 관련포인트(포인트-포인트)
                        '203': renderRelBranchGrid,
                        '204': renderProductNmGrid,
                        '205': renderEtcInfoGrid,
                        '206': renderProductCategoryGrid,
                        '207': renderRelemployeeGrid,
                        '208': renderPointRelProductGrid,			// 관련포인트(포인트-상품)
                    };
                    break;
            }

            var baseInfoData = productBaseDetailData;
            productBaseData = productBaseDetailData;
            clickEventForCode = productBaseData.code;   // product code
            productInfo = productBaseDetailData;

            if (gridId === '2') {
                return false;
            }


            $el.find('.pf-cp-base-info').html(basePageTpl(baseInfoData));
            $('.class-stru-mgmt-btn').hide();   // 숨김 -> 상품분류 화멘에서만 show

            // 2017.08.23 yujin 임시코딩
            if($('.pf-cp-product-info-base-form .allianceContractNumber').length > 0
               && $('.pf-cp-product-info-base-form .allianceContractNumber').val().length > 0){
            	bindConditionName($('.pf-cp-product-info-base-form .allianceContractNumber'), $('.pf-cp-product-info-base-form .cndName'));
            }

        	// OHS 2017.04.04 추가 - 조회된 Product Status Hidden Input에 세팅
        	$('.product-base-info-mgmt-status').find('input').val(baseInfoData.productStatus);

            // 2017.01.25 OHS 로직 추가, 상품의 적용종료일자가 과거이고 상태가 판매중이면 상태를 해제 상태로 변경할 수 있도록 추가
            // 과거
            if(PFUtil.compareDateTime(commonConfig.currentXDate, XDate(baseInfoData.saleEnd)) == -1 && (baseInfoData.productStatus === '04')){
                makeProductStatusConcellation = function() {
                	var productStatusCombo = [];
                	// 판매중
                    var $option = $('<option>');
                    $option.val('04');
                    $option.text(codeMapObj.ProductStatusCode['04']);
                    productStatusCombo.push($option);

                    // 해제
                    var $option = $('<option>');
                    $option.val('06');
                    $option.text(codeMapObj.ProductStatusCode['06']);
                    productStatusCombo.push($option);

                    $('.product-base-info-mgmt-status').append('<select class="bx-form-item bx-compoenent-small" style="width:155px;"></select>');
                    $('.product-base-info-mgmt-status').find('select').html(productStatusCombo);
                    $('.product-base-info-mgmt-status').find('select').val(baseInfoData.productStatus);
                };

            	makeProductStatusConcellation();
            }
            // 미래 or 현재
            else {
             	// set enum
            	$('.product-base-info-mgmt-status').text(codeMapObj.ProductStatusCode[baseInfoData.productStatus]);
            }

            // 상품/서비스/포인트 화면에 따른 처리
            if(pdInfoDscd == pdInfoDscd_Product) {	// 상품
                $('.product-base-info-firstCatalogId').text('['+baseInfoData.firstCatalogId+'] '+codeMapObj.ProductCategoryLevelOneCode[baseInfoData.firstCatalogId]);
            }
            else if(pdInfoDscd == pdInfoDscd_Service) {	// 서비스
                $('.product-base-info-firstCatalogId').text('['+baseInfoData.firstCatalogId+'] '+codeMapObj.ServiceCategoryLevelOneCode[baseInfoData.firstCatalogId]);

                renderComboBox('BenefitBaseDscd'		 , $('.benefitBaseDscd')			, baseInfoData.benefitBaseDscd);				// 혜택기반구분코드 콤보
                renderComboBox('BnftPrcsngPotCode'		 , $('.processingPointOfTimeDscd')	, baseInfoData.processingPointOfTimeDscd);		// 처리시점구분코드 콤보
                renderComboBox('DomesticForeignSalesDscd', $('.domesticAndForeignSalesDscd'), baseInfoData.domesticAndForeignSalesDscd);	//국내외매출구분코드 콤보

                // 제공조건존재여부 체크
                if ($('.provideConditionExistYn').val() == 'Y') {
                    $('.provideConditionExistYnCheck').prop('checked', true);
                }
            }
            else if(pdInfoDscd == pdInfoDscd_Point) {	// 포인트
                $('.product-base-info-firstCatalogId').text('['+baseInfoData.firstCatalogId+'] '+codeMapObj.PointCategoryLevelOneCode[baseInfoData.firstCatalogId]);
            }
            productInfoForm = PFComponent.makeYGForm($el.find('.pf-cp-base-info .pf-cp-product-info-base-form'));

            if (gridId == '1') {
                if(writeYn != 'Y' || (selectedTreeItem && selectedTreeItem.writeYn == 'N') ||
                    (parent.g_pdBaseRelAuthority['base'] && parent.g_pdBaseRelAuthority['base'] == 'N')){

                    $('.write-btn').hide();
                }
            }else{
                if(writeYn != 'Y' || (selectedTreeItem && selectedTreeItem.writeYn == 'N') ||
                    (parent.g_pdBaseRelAuthority['rel'] && parent.g_pdBaseRelAuthority['rel'] == 'N')){

                    $('.write-btn').hide();
                }

                if(methodMap[gridId]){
                	methodMap[gridId]();
                }else{
                	renderProductRelInfoGrid(gridId);
                }

            }

            // 수정가능 상태가 아니면
            if (baseInfoData.productStatus != '01') {

            	$('.allianceContractNumber').prop('disabled', true);		// 제휴계약번호
            	$('.benefitBaseDscd').prop('disabled', true);				// 혜택기반구분코드
            	$('.campaignId').prop('disabled', true);					// 캠페인ID
            	$('.processingPointOfTimeDscd').prop('disabled', true);		// 처리시점구분코드
            	$('.domesticAndForeignSalesDscd').prop('disabled', true);	// 국내외매출구분코드
            	$('.packageYn-check').prop('disabled', true);				// 패키지여부 disabled
            	$('.pf-cp-product-info-delete-btn').prop('disabled', true);	// 삭제버튼 disabled

            	// 해제 상태인 경우
	            if(baseInfoData.productStatus === '06') {
	            	$('.pf-cp-product-info-save-btn').prop('disabled', true); // 저장버튼 disabled
	            }
            }

            var packageGridWrap = $el.find('.pf-base-package-grid-wrap');
            if ($('.packageYn-check-value').val() == 'Y') {
                $('.packageYn-check').prop('checked', true);
                packageGridWrap.show();
                renderPackageGrid(productBaseDetailData);
            }

            setProductTypeDistinctionCode(productBaseDetailData.productTypeDistinctionCode);
            PFUtil.getDatePicker(true);


            // hashtag
            if (gridId === '1' && pdInfoDscd === '01') { // 서비스, 포인트에는 해시태그 적용하지 않음. 기본정보 관리에서만 적용.
              var productCode = $el.find('.product-base-info-code').text();
              var req = {
                  tntInstId: tntInstId,
                  pdInfoDscd: pdInfoDscd,
                  productCode: productCode,
              };
              PFRequest.get('/product/queryProductHashtagForList.json', req, {
                success: function (responseData) {
                  PFComponent.makeTagBox({
                    targetClass: 'hashtag',
                    initialTags: responseData.map(function(v) {
                      return v.hashtag;
                    }),
                    onAdd: function(tag) {
                      tagsChanged.set(tag, {
                        hashtag: tag,
                        productCode: productCode,
                        process: 'C'
                      });
                    },
                    onRemove: function(tag) {
                      tagsChanged.set(tag, {
                        hashtag: tag,
                        productCode: productCode,
                        process: 'D'
                      });
                    }
                  });
                  tagsChanged.clear();

                  // autocomplete
                  let input = $el.find('.hashtag input');
                  input.autocomplete({
                    lookup: responseData.map(function(v) {
                      return {
                        value: v.hashtag,
                        data: v.hashtag
                      };
                    }),
                    onSelect: function(suggestion) {
                      input.val('');
                    }
                  });
                },
                bxmHeader: {
                  application: 'PF_Factory',
                  service: 'PdService',
                  operation: 'queryProductHashtagForList'
                }
              });
            }
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'PdService',
            operation: 'queryPd'
        }
    });

}

// 1. package grid
function renderPackageGrid(productBaseDetailData) {
    gridRendered = true;
    $('.pf-base-package-grid-wrap').show();
    $('.pf-base-package-grid').empty();

    clickEventForGrid = PFComponent.makeExtJSGrid({
        fields: [
            'code', 'relationInformationStatus',
            'relatedProductCode','relatedProductName','isPackageMandatoryProduct',
            'applyStart', 'applyEnd'
        ],
        gridConfig: {
            renderTo: '.pf-base-package-grid',
            columns: [
                {text: bxMsg('DPS0101String17'), flex: 1.5,  align: 'center', sortable: false, dataIndex: 'relatedProductCode'},
                {text: bxMsg('DPM10002Sring7'), flex: 1,  align: 'center', sortable: false, dataIndex: 'relatedProductName'},
                getStatusOfGrid(),
                getAppyDateCellOfGrid('applyStart'),
                getAppyDateCellOfGrid('applyEnd'),
                {xtype: 'checkcolumn', text: bxMsg('DPS0101String14'),  align: 'center', width: 80, align: 'center', sortable: false, dataIndex: 'isPackageMandatoryProduct',
                    listeners: {
                        checkchange: function(column, rowIndex, checked, eOpts){
                            if(clickEventForGrid.store.getAt(rowIndex).get('process') != 'C'){
                                clickEventForGrid.store.getAt(rowIndex).set('process', 'U');
                            }
                        }
                    }
                },
                gridDestoryRowOfGrid()
            ],
            plugins: [getGridCellEditiongPlugin()],
            listeners: makePackageGridListeners()
        }
    });

    var gridData;
    if(productBaseDetailData && productBaseDetailData.productRelationVO.voList) {
        gridData = productBaseDetailData.productRelationVO.voList;
    }else{
        gridData = [];
    }
    clickEventForGrid.setData(gridData);
    clickEventForNewData = {};
}

// 2-1. 고객세그먼트
function renderRelCustomerSegmentGrid() {
    currentPage = 'relCustSgmt';
    gridRendered = false;

    var requestData = {'code': clickEventForCode };
    var hash = selectRequestParam.split('&');
    requestData.tntInstId =  hash[2].split('=')[1];
    requestData.pdInfoDscd = pdInfoDscd;    // 01.상품
    requestData.commonHeaderMessage = '{"loginTntInstId" : "' + getLoginTntInstId() + '", "lastModifier"   : "' + getLoginUserId() + '"}';

    PFRequest.get('/product/queryProductCustomerSegmentRelationForList.json',requestData,{
        success: function (responseData) {

            if(responseData) {
                gridDeleteDate = [];
                clickEventForGrid = PFComponent.makeExtJSGrid({
                    fields: ['customerSegmentCode', 'relationInformationStatus', 'applyStart', 'applyEnd',
                        'relationType', 'relationPdInfoDscd', 'process'],
                    gridConfig: {
                        renderTo: '.pf-base-rel-info-grid',
                        columns: [
                            makeComboOfRelGrid(bxMsg('DPS0102String6'), 'flex', 1, 'customerSegmentCode', 'ProductCustomerSegmentCode'),
                            getStatusOfGrid(),    // 상태
                            getAppyDateCellOfGrid('applyStart'),
                            getAppyDateCellOfGrid('applyEnd'),
                            gridDestoryRowOfGrid()
                        ],
                        plugins: [getGridCellEditiongPlugin()],
                        listeners: makeRelGridListeners() //makeRelGridListeners(gridListener)
                    }
                });
                setRelGridSaveEventProperty(responseData.voList, {}, '/product/updateProductCustomerSegmentRelation.json','updateCustomerSegmentRelation');

            }
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'PdRelationService',
            operation: 'queryListCustomerSegmentRelation'
        }
    })
}
// 2-2. (현재 사용안함)
function renderRelCustomerGrid() {
    currentPage = 'relCust';
    gridRendered = false;

    var requestData = {'code': clickEventForCode };
    var hash = selectRequestParam.split('&');
    requestData.tntInstId =  hash[2].split('=')[1];
    requestData.pdInfoDscd = pdInfoDscd;    // 01.상품
    requestData.commonHeaderMessage = '{"loginTntInstId" : "' + getLoginTntInstId() + '", "lastModifier"   : "' + getLoginUserId() + '"}';

    PFRequest.get('/product/queryProductCustomerRelationForList.json',requestData, {
        success: function (responseData) {
            if (responseData) {
                gridDeleteDate = [];
                clickEventForGrid = PFComponent.makeExtJSGrid({
                    fields: ['customerRelationType', 'customerRelationId', 'applyStart', 'applyEnd', 'relationInformationStatus', 'process'],

                    gridConfig: {
                        renderTo: '.pf-base-rel-info-grid',
                        columns: [
                            makeComboOfRelGrid(bxMsg('pdCustRelCd'), 'flex', 1, 'customerRelationType', 'ProductInvolvedpartyCode'),
                            {text: bxMsg('custId'), flex: 1, dataIndex: 'customerRelationId',
                                editor: {
                                }
                            },
                            getStatusOfGrid(),    // 상태
                            getAppyDateCellOfGrid('applyStart'),
                            getAppyDateCellOfGrid('applyEnd'),
                            gridDestoryRowOfGrid()
                        ],
                        plugins: [getGridCellEditiongPlugin()],
                        listeners: makeRelGridListeners()
                    }
                });
                // OHS 2017.12.04 수정 -> queryListCustomerRelation => updateCustomerRelation BXM method name 수정
                setRelGridSaveEventProperty(responseData.voList, {}, '/product/updateProductCustomerRelation.json','updateCustomerRelation');
            }
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'PdRelationService',
            operation: 'queryListCustomerRelation'
        }
    });
}

// 2-3.
function renderRelDocumentGrid() {

    currentPage = 'document';
    gridRendered = false;
    $el.find('.pf-cp-base-rel-info-grid-tpl').addClass('document-grid');

    var requestData = {'code': clickEventForCode };
    var loginTntInstId = $('.product-factory-header', parent.document).find('.login-tntInst-id').text();
    var hash = selectRequestParam.split('&');
    requestData.tntInstId =  hash[2].split('=')[1];
    requestData.pdInfoDscd = pdInfoDscd;    // 01.상품
    requestData.commonHeaderMessage = '{"loginTntInstId" : "' + loginTntInstId + '", "lastModifier"   : "' + getLoginUserId() + '"}';

    PFRequest.get('/product/queryProductDocumentRelationForList.json', requestData, {

        success: function (responseData) {
            if(responseData) {
                $('.pf-base-rel-info-grid').empty();
                gridDeleteDate = [];
                clickEventForGrid = PFComponent.makeExtJSGrid({
                    pageAble:true,
                    fields: [
                        'code', 'pdDocumentDistinctionCode', 'documentId',
                        'documentContent','documentSequenceNumber','isMandatory','relationInformationStatus',
                        'applyStart', 'applyEnd', 'process'
                    ],
                    gridConfig: {
                        renderTo: '.pf-base-rel-info-grid',
                        columns: [
                            makeComboOfRelGrid(bxMsg('DPS0104String1'), 'width', 100, 'pdDocumentDistinctionCode', 'ProductDocumentTypeCode'),
                            {text: bxMsg('DocumentId'), width: 100, dataIndex: 'documentId',  align: 'center', sortable: false, editor:{allowBlank:false}},   // 문서ID
                            {text: bxMsg('DPS0104String4'), width: 80, dataIndex: 'isMandatory',  align: 'center', sortable: false, xtype:'checkcolumn',

                                listeners: {
                                    checkchange: function(column, rowIndex, checked, eOpts){
                                        if(clickEventForGrid.store.getAt(rowIndex).get('process') != 'C'){
                                            clickEventForGrid.store.getAt(rowIndex).set('process', 'U');
                                        }
                                    }


                                }},        // 필수여부
                            {text: bxMsg('DPS0104String9'), width: 180, dataIndex: 'documentContent',  align: 'center', sortable: false, editor:{allowBlank:false}},
                            getStatusOfGrid(),    // 상태
                            getAppyDateCellOfGrid('applyStart'),
                            getAppyDateCellOfGrid('applyEnd'),
                            gridDestoryRowOfGrid()
                        ],
                        plugins: [getGridCellEditiongPlugin()],
                        listeners: makeRelGridListeners()
                    }
                });

                setRelGridSaveEventProperty(responseData.voList, {'isMandatory' : true}, '/product/updateProductDocumentRelation.json','updateDocumentRelation');
            }
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'PdRelationService',
            operation: 'queryListDocumentRelation'
        }
    })
};


// 2-5.
function renderRelBranchGrid() {
    currentPage = 'relBranch';
    gridRendered = false;

    var requestData = {'code': clickEventForCode };
    var loginTntInstId = $('.product-factory-header', parent.document).find('.login-tntInst-id').text();
    var hash = selectRequestParam.split('&');
    requestData.tntInstId =  hash[2].split('=')[1];
    requestData.pdInfoDscd = pdInfoDscd;    // 01.상품
    requestData.commonHeaderMessage = '{"loginTntInstId" : "' + loginTntInstId + '", "lastModifier"   : "' + getLoginUserId() + '"}';

    PFRequest.get('/product/queryProductBranchRelationForList.json', requestData,{
        success: function (responseData) {
            var errorMessage;
            if(responseData) {
                gridDeleteDate = [];
                clickEventForGrid = PFComponent.makeExtJSGrid({
                    fields: [
                        'code', 'relationInformationStatus', 'branchRelationType','branchCode',
                        'applyStart', 'applyEnd', 'process'
                    ],
                    gridConfig: {
                        renderTo: '.pf-base-rel-info-grid',
                        columns: [
                            makeComboOfRelGrid(bxMsg('DPP0109String1'), 'flex', 1, 'branchRelationType', 'ProductBranchRelationTypeCode'),
                            makeComboOfRelGrid(bxMsg('DPP0109String3'), 'flex', 1, 'branchCode', 'ProductBranchCode'),
                            getStatusOfGrid(),    // 상태
                            getAppyDateCellOfGrid('applyStart'),
                            getAppyDateCellOfGrid('applyEnd'),
                            gridDestoryRowOfGrid()
                        ],
                        plugins: [getGridCellEditiongPlugin()],
                        listeners: makeRelGridListeners()
                    }
                });

                setRelGridSaveEventProperty(responseData.voList, {}, '/product/updateProductBranchRelation.json','updateBranchRelation');

            }
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'PdRelationService',
            operation: 'queryListBranchRelation'
        }
    });
}

// 2-**
function renderRelChannelGrid() {
    currentPage = 'relChannel';
    gridRendered = false;

    var requestData = {'code': clickEventForCode };
    var loginTntInstId = $('.product-factory-header', parent.document).find('.login-tntInst-id').text();
    var hash = selectRequestParam.split('&');
    requestData.tntInstId =  hash[2].split('=')[1];
    requestData.pdInfoDscd = pdInfoDscd;    // 01.상품
    requestData.commonHeaderMessage = '{"loginTntInstId" : "' + loginTntInstId + '", "lastModifier"   : "' + getLoginUserId() + '"}';

    PFRequest.get('/product/queryProductChannelRelationForList.json', requestData,{
        success: function (responseData) {

            if(responseData) {
                gridDeleteDate = [];
                clickEventForGrid = PFComponent.makeExtJSGrid({
                    fields: [
                        'code','productChannelRelation', 'productChannelCode', 'relationInformationStatus',
                        'applyStart', 'applyEnd', 'process'
                    ],
                    gridConfig: {
                        renderTo: '.pf-base-rel-info-grid',
                        columns: [
                            makeComboOfRelGrid(bxMsg('DPP0109String1'), 'flex', 1, 'productChannelRelation', 'ProductChannelRelationTypeCode'),
                            makeComboOfRelGrid(bxMsg('DPS0109String1'), 'flex', 1, 'productChannelCode', 'ProductChannelCode'),
                            getStatusOfGrid(),    // 상태
                            getAppyDateCellOfGrid('applyStart'),
                            getAppyDateCellOfGrid('applyEnd'),
                            gridDestoryRowOfGrid()
                        ],
                        plugins: [getGridCellEditiongPlugin()],
                        listeners: makeRelGridListeners()
                    }
                });// grid end

                setRelGridSaveEventProperty(responseData.voList, {}, '/product/updateProductChannelRelation.json','updateChannelRelation');

            }

        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'PdRelationService',
            operation: 'queryListChannelRelation'
        }
    });
}

// 2-6.
function renderProductNmGrid() {
    currentPage = 'productNm';
    gridRendered = false;

    var requestData = {'code': clickEventForCode };
    //var loginTntInstId = $('.product-factory-header', parent.document).find('.login-tntInst-id').text();
    var hash = selectRequestParam.split('&');
    requestData.tntInstId =  hash[2].split('=')[1];
    requestData.pdInfoDscd = pdInfoDscd;    // 01.상품
    requestData.commonHeaderMessage = '{"loginTntInstId" : "' + getLoginTntInstId() + '", "lastModifier"   : "' + getLoginUserId() + '"}';

    var pdNameLabel = bxMsg('DPS0113String3');
    var pdNameTpColumn = makeComboOfRelGrid(bxMsg('DPS0113String1'), 'width', 100, 'productAliasNameType', 'ProductAliasNameTypeCode');
    if(pdInfoDscd == pdInfoDscd_Point){		// 포인트
    	pdNameTpColumn = makeComboOfRelGrid(bxMsg('pointNmTp'), 'width', 100, 'productAliasNameType', 'PointAliasNameTypeCode');
    	pdNameLabel = bxMsg('PointName');
    }else if(pdInfoDscd == pdInfoDscd_Service){	// 서비스명
    	// 2017.09.05. 현재 없음.
    }

    PFRequest.get('/product/queryProductAliasNameForList.json',requestData,{
        success: function (responseData) {

            if(responseData) {
                gridDeleteDate = [];
                clickEventForGrid = PFComponent.makeExtJSGrid({
                    pageAble:true,
                    fields: [
                        'code', 'languageCode', 'productAliasName','productAliasNameType','relationInformationStatus',
                        'applyStart', 'applyEnd', 'process'
                    ],
                    gridConfig: {
                        renderTo: '.pf-base-rel-info-grid',
                        columns: [
                            pdNameTpColumn,
                            makeComboOfRelGrid(bxMsg('DPS0113String2'), 'width', 100, 'languageCode', 'LanguageCode'),
                            {text: pdNameLabel, flex: 1, dataIndex: 'productAliasName', align: 'center', sortable: false,
                                editor:{
                                    allowBlank: false,
                                    listeners: {
                                        'change': function(_this, newValue, oldValue, eOpts) {
                                            modifyFlag = true;
                                        }
                                    }
                                }
                            },
                            getStatusOfGrid(),    // 상태
                            getAppyDateCellOfGrid('applyStart'),
                            getAppyDateCellOfGrid('applyEnd'),
                            gridDestoryRowOfGrid()
                        ],
                        plugins: [getGridCellEditiongPlugin()],
                        listeners: makeRelGridListeners()
                    }
                });

                setRelGridSaveEventProperty(responseData.voList, {}, '/product/updateProductAliasName.json','updateAliasName');

            }
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'PdRelationService',
            operation: 'queryListAliasName'
        }
    })
}

// 2-7. 부가정보
function renderEtcInfoGrid() {
    currentPage = 'etcInfo';
    gridRendered = false;

    var requestData = {'code': clickEventForCode };
    var loginTntInstId = $('.product-factory-header', parent.document).find('.login-tntInst-id').text();
    var hash = selectRequestParam.split('&');
    requestData.tntInstId =  hash[2].split('=')[1];
    requestData.pdInfoDscd = pdInfoDscd;    // 01.상품 02.서비스 03.포인트
    requestData.commonHeaderMessage = '{"loginTntInstId" : "' + loginTntInstId + '", "lastModifier"   : "' + getLoginUserId() + '"}';

    var addInfoTpColumn = makeComboOfRelGrid(bxMsg('DPP0116String1'), 'width', 100, 'additionalInformationType', 'ProductAdditionalInfoTypeCode');
    if(pdInfoDscd == pdInfoDscd_Point){		// 포인트부가정보유형구분코드
    	addInfoTpColumn = makeComboOfRelGrid(bxMsg('DPP0116String1'), 'width', 100, 'additionalInformationType', 'PointAdditionalInfoTypeCode');
    }else if(pdInfoDscd == pdInfoDscd_Service){	// 혜택부가정보유형구분코드
    	addInfoTpColumn = makeComboOfRelGrid(bxMsg('DPP0116String1'), 'width', 100, 'additionalInformationType', 'BnftAdditionalInfoTypeCode');
    }


    PFRequest.get('/product/queryProductAdditionInfoForList.json',requestData,{
        success: function (responseData) {
            var errorMessage;
            if(responseData) {
                gridDeleteDate = [];
                var gridListener = {
                    cellclick : function(_this, td, cellIndex, record, tr, rowIndex, e, eOpts){

                    	if(cellIndex===1){
                            renderProductAdditionalInfoPopup(record, td);
                          }

                        var applyEndIndex = 2;
                        var isDisable = beforeGridCellSelect(record.data.relationInformationStatus);
                        if(isDisable && cellIndex != $(tr).children().size()-applyEndIndex ){
                            return false;
                        }
                    }
                }

                clickEventForGrid = PFComponent.makeExtJSGrid({
                    fields: [
                        'code','relationInformationStatus','additionalInformationType','additionalInformationContent',
                        'applyStart', 'applyEnd', 'process'
                    ],
                    gridConfig: {
                        renderTo: '.pf-base-rel-info-grid',
                        columns: [
                            addInfoTpColumn,
                            {text: bxMsg('DPP0116String3'), flex: 1, dataIndex: 'additionalInformationContent', sortable: false, align: 'center'},
                            getStatusOfGrid(),    // 상태
                            getAppyDateCellOfGrid('applyStart'),
                            getAppyDateCellOfGrid('applyEnd'),
                            gridDestoryRowOfGrid()
                        ],
                        plugins: [getGridCellEditiongPlugin()],
                        listeners: makeRelGridListeners(gridListener)
                    }
                });

                setRelGridSaveEventProperty(responseData.voList, {}, '/product/updateProductAdditionInfo.json','updateAdditionInfo');

            }
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'PdRelationService',
            operation: 'queryListAdditionInfo'
        }
    })
}

// 2-8.
function renderProductCategoryGrid() {
    currentPage = 'productCategory';
    gridRendered = false;

    $('.add-rel-info-btn').hide();
    $('.rel-save-btn').hide();
    $('.class-stru-mgmt-btn').show();

    var requestData = {'pdInformationCode': clickEventForCode };
    var loginTntInstId = $('.product-factory-header', parent.document).find('.login-tntInst-id').text();
    var hash = selectRequestParam.split('&');
    requestData.tntInstId =  hash[2].split('=')[1];
    requestData.pdInfoDscd = pdInfoDscd;
    requestData.commonHeaderMessage = '{"loginTntInstId" : "' + loginTntInstId + '", "lastModifier"   : "' + getLoginUserId() + '"}';

    PFRequest.get('/classification/getListClassificationInformationRelation.json',requestData,{
        success: function (responseData) {

            var errorMessage;
            if(responseData) {
                gridDeleteDate = [];
                clickEventForGrid = PFComponent.makeExtJSGrid({
                    fields: [ 'activeYn', 'applyStartDate', 'applyEndDate', 'classificationCode', 'classificationStructureDistinctionCode',
                        'classificationStructureName', 'navigation', 'process'
                    ],
                    gridConfig: {
                        renderTo: '.pf-base-rel-info-grid',
                        columns: [
                            {text: bxMsg('ClassificationName'), flex: 1, dataIndex: 'classificationStructureName',  align: 'center'},
                            {text: bxMsg('Subclassification'), flex: 1, dataIndex: 'navigation',  align: 'center',
                            	renderer: function(value) {

                            		var navigationArr = value.split('.');
                            		var navigationStr = '';

                            		navigationArr.forEach(function(navi){
                            			if(navigationStr == ''){
                            				navigationStr = navi;
                            			}else {
                            				navigationStr = navigationStr + ' > ' + navi;
                            			}
                            		});
                            		return navigationStr;
                        		}
                            },
                            {
                                text : bxMsg('DPS0101String6'),
                                width : 100,
                                align: 'center',
                                dataIndex : 'activeYn',
                                renderer : function(value){
                                    return codeMapObj['TemplateActiveYnCode'][value];
                                }
                            },    // 상태
                            getAppyDateCellOfGrid('applyStartDate'),
                            getAppyDateCellOfGrid('applyEndDate')
                        ],
                    }
                });

                setRelGridSaveEventProperty(responseData.voList, {}, '/product/updateProductClassification.json');

            }
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'ClassificationInformationRelationService',
            operation: 'queryListClassificationInformationRelation'
        }
    })
}

// 2-9.
function renderRelemployeeGrid(){
    currentPage = 'document';
    gridRendered = false;

    var gridListener = {
        cellclick : function(_this, td, cellIndex, record, tr, rowIndex, e, eOpts) {

            var applyEndIndex = 2;
            var isDisable = beforeGridCellSelect(record.data.relationInformationStatus);
            if(isDisable && cellIndex != $(tr).children().size()-applyEndIndex ){
                return false;
            }

            if (cellIndex == 1 || cellIndex == 2) {
                PFPopup.selectEmployee({}, function (selectItem) {
                    $(tr).find('td').eq(1).find('div').text(selectItem.staffId);
                    $(tr).find('td').eq(2).find('div').text(selectItem.staffName);
                    record.data.employeeId = selectItem.staffId;
                    record.data.employeeName = selectItem.staffName;
                });

            }
        }
    }

    var requestData = {'code': clickEventForCode };
    var loginTntInstId = $('.product-factory-header', parent.document).find('.login-tntInst-id').text();
    var hash = selectRequestParam.split('&');
    requestData.tntInstId =  hash[2].split('=')[1];
    requestData.pdInfoDscd = pdInfoDscd;
    requestData.commonHeaderMessage = '{"loginTntInstId" : "' + loginTntInstId + '", "lastModifier"   : "' + getLoginUserId() + '"}';

    PFRequest.get('/product/queryProductEmployeeRelationForList.json', requestData, {
        success: function (responseData) {

            var errorMessage;
            if(responseData) {
                gridDeleteDate = [];
                clickEventForGrid = PFComponent.makeExtJSGrid({
                    fields: [
                        'employeeRelationType','employeeId','employeeName','applyStart','applyEnd',  'code', 'relationInformationStatus', 'process'
                    ],
                    gridConfig: {
                        renderTo: '.pf-base-rel-info-grid',
                        columns: [
                            makeComboOfRelGrid(bxMsg('relType'), 'flex', 1, 'employeeRelationType','ProductEmployeeRelationTypeCode'),
                            {text: bxMsg('employeeNumber'), flex: 1, dataIndex: 'employeeId', sortable: false, align: 'center'},
                            {text: bxMsg('employeeName'), flex: 1, dataIndex: 'employeeName', sortable: false, align: 'center'},
                            getStatusOfGrid(),    // 상태
                            getAppyDateCellOfGrid('applyStart'),
                            getAppyDateCellOfGrid('applyEnd'),
                            gridDestoryRowOfGrid()
                        ],
                        plugins: [getGridCellEditiongPlugin()],
                        listeners: makeRelGridListeners(gridListener)
                    }
                });

                setRelGridSaveEventProperty(responseData.voList, {}, '/product/updateProductEmployeeRelation.json', 'updateEmployeeRelation');
            }
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'PdRelationService',
            operation: 'queryListEmployeeRelation'
        }
    });

}

// 2-10.
function renderBankbookTextGrid(){
    currentPage = 'document';
    gridRendered = false;


    var requestData = {'code': clickEventForCode };
    var loginTntInstId = $('.product-factory-header', parent.document).find('.login-tntInst-id').text();
    var hash = selectRequestParam.split('&');
    requestData.tntInstId =  hash[2].split('=')[1];
    requestData.pdInfoDscd = pdInfoDscd;
    requestData.commonHeaderMessage =  '{"loginTntInstId" : "' + loginTntInstId + '", "lastModifier"   : "' + getLoginUserId() + '"}';

    PFRequest.get('/product/queryProductPassbookInfoForList.json', requestData,{
        success: function (responseData) {
            var errorMessage;
            if(responseData) {
                gridDeleteDate = [];
                var gridListener = {
                    cellclick : function(_this, td, cellIndex, record, tr, rowIndex, e, eOpts) {

                        var applyEndIndex = 2;
                        var isDisable = beforeGridCellSelect(record.data.relationInformationStatus);
                        if(isDisable && cellIndex != $(tr).children().size()-applyEndIndex ){
                            return false;
                        }

                        if (cellIndex == 2) {
                          renderProductPassbookInfoPopup(record, td);
                        }
                    }
                }

                clickEventForGrid = PFComponent.makeExtJSGrid({
                    fields: [
                        'passbookInformationTextType','passbookInformationType','passbookInformationContent',
                        'applyStart','applyEnd',  'code', 'relationInformationStatus', 'process'
                    ],
                    gridConfig: {
                        renderTo: '.pf-base-rel-info-grid',
                        columns: [
                            makeComboOfRelGrid(bxMsg('wordsType'), 'flex', 1, 'passbookInformationTextType', 'ProductPassbookPrintTextTypeCode'),
                            makeComboOfRelGrid(bxMsg('wordsClassificationCode'), 'flex', 1, 'passbookInformationType', 'ProductPassbookPrintTypeCode'),
                            {text: bxMsg('wordsContent'), flex: 1, dataIndex: 'passbookInformationContent', sortable: false, align: 'center'},
                            getStatusOfGrid(),    // 상태
                            getAppyDateCellOfGrid('applyStart'),
                            getAppyDateCellOfGrid('applyEnd'),
                            gridDestoryRowOfGrid()
                        ],
                        plugins: [getGridCellEditiongPlugin()],
                        listeners: makeRelGridListeners(gridListener)
                    }
                });
                setRelGridSaveEventProperty(responseData.voList, {}, '/product/updateProductPassbookInfo.json','updatePassbookInfo');
            }
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'PdRelationService',
            operation: 'queryListPassbookInfo'
        }
    });
}

// 관련상품
// type : S(single), M(multi)
function renderRelProductGrid(requestData, type) {

	var gridListener;


	gridListener = {
        cellclick : function(_this, td, cellIndex, record, tr, rowIndex, e, eOpts) {

	        var applyEndIndex = 2;
	        var isDisable = beforeGridCellSelect(record.data.relationInformationStatus);
	        if(isDisable && cellIndex != $(tr).children().size()-applyEndIndex ){
	            return false;
	        }

	        if (type == 'S' && (cellIndex == 1 || cellIndex == 2 || cellIndex == 3 || cellIndex == 4)) {

	            var submitEvent = function (data, firstCategory ,secondCategory, thirdCategory) {
	                // 2018.01.22 - single select 팝업으로 변경.
	                /*if(data.length > 1){
	                    PFComponent.showMessage(bxMsg('multiProductSelectError'), 'warning');
	                    return;
	                }
	                // 2017.02.07 OHS 추가 - 팝업의 Row를 선택하지않고 확인을 눌렀을때 스크립트오류 발생
	                else if(data.length < 1){
	                	// 대상을 선택해주세요
	                	PFComponent.showMessage(bxMsg('Z_TargetSelect'), 'warning');
	                	return;

	                }*/

                  record.set('relatedProductCode', data.code);
                  record.set('relatedProductName', data.name);

                  if(data.code  === '*'){
                      record.set('relatedProductCodeLabel', data.name);
                  }else{
                      record.set('relatedProductCodeLabel', data.code);
                  }


                    // ** : 전상품
                  if (data.code !== '**') {
                      record.set('businessDistinctionCode1', firstCategory);

                      //전체가 아니면
                      if(data.code !== '*' ){
                          var requestParam = {};
                          requestParam.pdInfoDscd = requestData.relationPdInfoDscd;
                          requestParam.id = data.fullPath;

                          // 2017.02.07 OHS 수정 - 상품템플릿 잘라오는 substring 수정
                          // requestParam.code = data[0].fullPath.substring(6,13);
                          requestParam.code = data.fullPath.substring(data.fullPath.lastIndexOf('.') + 1, data.fullPath.length);

                          requestParam.firstCatalogId = data.fullPath.substring(0,2);
                          requestParam.secondCatalogId = data.fullPath.substring(3,5);

                          PFRequest.get('/product/template/getProductTemplate.json', requestParam, {
                              success: function (responseData) {
                                  record.set('industryDistinctionCode1', responseData.industryDistinctionCode);
                                  record.set('productTypeCode1', responseData.secondCatalogId);
                                  record.set('productTypeName1', responseData.secondCatalogName);
                                  record.set('productTemplateCode1', responseData.code);
                                  record.set('productTemplateName1', responseData.name);
                              },
                              bxmHeader: {
                                  application: 'PF_Factory',
                                  service: 'PdTemplateService',
                                  operation: 'queryPdTemplate'
                              }
                          });
                      }
                      //전체
                      else{
                          if(secondCategory) {
                              record.set('industryDistinctionCode1', secondCategory.industryDistinctionCode);
                              record.set('productTypeCode1', secondCategory.id.substr(3, 4));
                              record.set('productTypeName1', secondCategory.name);
                          }
                          // OHS 20171207 추가 secondCategory 정보와 thirdCategory 정보가 존재하면 thirdCategory(템플릿) 정보까지 세팅
                          if(secondCategory && thirdCategory){
                            record.set('productTemplateCode1', thirdCategory.id.substr(thirdCategory.id.lastIndexOf('.') + 1)); // 템플릿코드
                            record.set('productTemplateName1', thirdCategory.name);
                          }
                          else if(secondCategory && !thirdCategory){
                              record.set('productTemplateCode1', '*');
                              record.set('productTemplateName1', bxMsg('Z_All'));
                          }
                      }
                  }
                  //전상품 선택
                  else{
                      record.set('businessDistinctionCode1', '*');
                      record.set('productTypeCode1', '*');
                      record.set('productTemplateCode1', '*');
                      record.set('relatedProductCode', '*');
                      record.set('productTemplateName1', bxMsg('Z_All'));
                      record.set('productTypeName1', bxMsg('Z_All'));
                      record.set('relatedProductName', bxMsg('Z_All'));
                      record.set('relatedProductCodeLabel', bxMsg('Z_All'));
                  }
	            };

	            // 상품
	            if(requestData.relationPdInfoDscd == pdInfoDscd_Product) {
                    if(pdInfoDscd === pdInfoDscd_Service){
                        PFPopup.selectProduct({
                          pdInfoDscd: pdInfoDscd_Product,
                          isSelectTemplate: true,
                          isSelectAllProduct: true,
                        }, submitEvent);
                    }else{
                        PFPopup.selectProduct({
                          pdInfoDscd: pdInfoDscd_Product,
                          isSelectTemplate: true,
                        }, submitEvent);
                    }
	            }
	            // 서비스일때
	            else if(requestData.relationPdInfoDscd == pdInfoDscd_Service) {
	              PFPopup.selectProduct({
	                pdInfoDscd: pdInfoDscd_Service,
	                isSelectTemplate: true,
	              }, submitEvent);
	            }
	            // 포인트일때
	            else if(requestData.relationPdInfoDscd == pdInfoDscd_Point) {
	              PFPopup.selectProduct({
	                pdInfoDscd: pdInfoDscd_Point,
	                isSelectTemplate: true,
	              }, submitEvent);
	            }
	        }
	    }
	}

    PFRequest.get('/product/queryProductRelationForList.json', requestData, {

        success: function (responseData) {

            if(responseData) {
                gridDeleteDate = [];
                var combo, relatedProductType, relatedProductTemplate, relatedProductCodeHeader, relatedProductNameHeader;
                var converseRateColumn;

                if(requestData.relationPdInfoDscd == pdInfoDscd_Product) {       // 상품

                	// 상품-상품
                	if(pdInfoDscd == pdInfoDscd_Product){
                		combo = makeComboOfRelGrid(bxMsg('DPP0109String1'), 'width', 100, 'betweenProductRelation', 'ProductRelationTypeCode');
                	}
                    // 서비스-상품
                    else if(pdInfoDscd == pdInfoDscd_Service){
                		combo = makeComboOfRelGrid(bxMsg('DPP0109String1'), 'width', 100, 'betweenProductRelation', 'BnftProductRelTypecode');
                	}
                	// 포인트-상품
                	else if(pdInfoDscd == pdInfoDscd_Point){
                		combo = makeComboOfRelGrid(bxMsg('DPP0109String1'), 'width', 100, 'betweenProductRelation', 'PointProductRelTypeCode');
                	}
                    relatedProductType = bxMsg('DPS0101String11');
                    relatedProductTemplate = bxMsg('DPS0101String3');
                    relatedProductCodeHeader = bxMsg('DPS0101String17');
                    relatedProductNameHeader = bxMsg('DPM10002Sring7');

                }else if(requestData.relationPdInfoDscd == pdInfoDscd_Service){  // 서비스

                	// 상품-서비스
                	if(pdInfoDscd == pdInfoDscd_Product){
                		combo = makeComboOfRelGrid(bxMsg('DPP0109String1'), 'width', 100, 'betweenProductRelation', 'ServiceRelationTypeCode');
                	}
                	// 서비스-서비스
                	else if(pdInfoDscd == pdInfoDscd_Service){
                		combo = makeComboOfRelGrid(bxMsg('DPP0109String1'), 'width', 100, 'betweenProductRelation', 'BenefitRelTypeDscd');
                	}
                    relatedProductType =  bxMsg('ServiceType');
                    relatedProductTemplate = bxMsg('ServiceTemplate');
                    relatedProductCodeHeader = bxMsg('ServiceCode');
                    relatedProductNameHeader = bxMsg('ServiceName');

                }else if(requestData.relationPdInfoDscd == pdInfoDscd_Point){  // 포인트

                    // 상품-포인트
                    if(pdInfoDscd == pdInfoDscd_Product){
                        combo = makeComboOfRelGrid(bxMsg('DPP0109String1'), 'width', 100, 'betweenProductRelation', 'PointRelationTypeCode');
                    }
                	// 서비스-포인트
                	else if(pdInfoDscd == pdInfoDscd_Service){
                		combo = makeComboOfRelGrid(bxMsg('DPP0109String1'), 'width', 100, 'betweenProductRelation', 'BnftPointRelTypecode');
                	}
                	// 포인트-포인트
                	else if(pdInfoDscd == pdInfoDscd_Point){
                		combo = makeComboOfRelGrid(bxMsg('DPP0109String1'), 'width', 100, 'betweenProductRelation', 'PointRelTypeCode');

                		converseRateColumn = {
                                text: bxMsg('converseRate'),
                                width: 100,
                                dataIndex: 'conversionRate',
                                sortable: false,
                                editor:{allowBlank:false},
                                style: 'text-align:center',
                                align: 'right',
                                renderer: function(value, metadata, record) {
                                    return PFValidation.gridFloatCheckRenderer(value, 19, 2);
                                }
                            };
                	}

                    relatedProductType =  bxMsg('PointType');
                    relatedProductTemplate = bxMsg('PointTemplate');
                    relatedProductCodeHeader = bxMsg('PointCode');
                    relatedProductNameHeader = bxMsg('PointName');
                }


                if(responseData.voList && responseData.voList.length > 0) {
                    responseData.voList.forEach(function (item, index) {
                        if(item.productTypeCode1 === '*') {
                            item.productTypeName1 = bxMsg('Z_All');
                        }
                        if (item.productTemplateCode1 === '*') {
                            item.productTemplateName1 = bxMsg('Z_All');
                        }
                        if (item.relatedProductCode === '*') {
                            item.relatedProductName = bxMsg('Z_All');
                        }
                        if(item.relatedProductCode === '*'){
                            item.relatedProductCodeLabel = bxMsg('Z_All');;
                        }else{
                            item.relatedProductCodeLabel = item.relatedProductCode;
                        }

                    });
                }

                var columns = [
                    combo,
                    {text:relatedProductType , width: 100, align: 'center', sortable: false, dataIndex: 'productTypeName1'},
                    {text:relatedProductTemplate, width: 100, align: 'center', sortable: false, dataIndex: 'productTemplateName1'},
                    {text:relatedProductCodeHeader , width: 100, align: 'center', sortable: false, dataIndex: 'relatedProductCodeLabel'},
                    {text:relatedProductNameHeader , width: 100, align: 'center', sortable: false, dataIndex: 'relatedProductName'}
                ];

                if(converseRateColumn){
                	columns.push(converseRateColumn);
                }
                columns.push(getStatusOfGrid());	   				 // 상태
        		columns.push(getAppyDateCellOfGrid('applyStart'));
				columns.push(getAppyDateCellOfGrid('applyEnd'));
				columns.push(gridDestoryRowOfGrid());

                clickEventForGrid = PFComponent.makeExtJSGrid({
                    fields: [
                        'code', 'relationInformationStatus','industryDistinctionCode1','businessDistinctionCode1',
                        'productTypeCode1', 'productTypeName1', 'productTemplateCode1','productTemplateName1','relatedProductCode',
                        'relatedProductCodeLabel','relatedProductName','betweenProductRelation',
                        'applyStart', 'applyEnd', 'relationPdInfoDscd', 'process', 'conversionRate'
                    ],
                    gridConfig: {
                        renderTo: '.pf-base-rel-info-grid',
                        columns: columns,
//                        [
//                            combo,
//                            {text:relatedProductType , width: 100, align: 'center', sortable: false, dataIndex: 'productTypeName1'},
//                            {text:relatedProductTemplate, width: 100, align: 'center', sortable: false, dataIndex: 'productTemplateName1'},
//                            {text:relatedProductCodeHeader , width: 100, align: 'center', sortable: false, dataIndex: 'relatedProductCodeLabel'},
//                            {text:relatedProductNameHeader , width: 100, align: 'center', sortable: false, dataIndex: 'relatedProductName'},
//                            getStatusOfGrid(),    // 상태
//                            getAppyDateCellOfGrid('applyStart'),
//                            getAppyDateCellOfGrid('applyEnd'),
//                            gridDestoryRowOfGrid()
//                        ],
                        plugins: [getGridCellEditiongPlugin()],
                        listeners: makeRelGridListeners(gridListener),

                    }
                });

                if(responseData.voList == null) responseData.voList = [];

                setRelGridSaveEventProperty(responseData.voList, {}, '/product/updateProductRelation.json', 'updateRelation');

            }
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'PdRelationService',
            operation: 'queryListRelation'
        }
    })

}

// 상품-상품 관계
function renderProductRelProductGrid(){

	currentPage = 'relProduct';
	gridRendered = false;

	//add class specially only for add button of relative product menu
	$el.find('.pf-cp-base-rel-info-grid-tpl').find('.add-rel-info-btn').removeClass('add-rel-info-btn').addClass('add-rel-product-btn');

	requestData = {
	    'code': clickEventForCode,                   // product code
	    'packageProductDistinctionCode': '03'
	};     // 03. 비복합상품/非组合产品

	var loginTntInstId = $('.product-factory-header', parent.document).find('.login-tntInst-id').text();
	var hash = selectRequestParam.split('&');
	requestData.tntInstId = hash[2].split('=')[1];
	requestData.pdInfoDscd = pdInfoDscd_Product;
	requestData.relationPdInfoDscd = pdInfoDscd_Product;       // 01.상품
	requestData.commonHeaderMessage = '{"loginTntInstId" : "' + loginTntInstId + '", "lastModifier"   : "' + getLoginUserId() + '"}';

	renderRelProductGrid(requestData, 'S');
}

// 상품-서비스 관계
function renderProductRelServiceGrid(){
    currentPage = 'relService';
    gridRendered = false;

    // OHS 2017.02.21 추가 - 서비스영역일경우 분기처리
	$el.find('.pf-cp-base-rel-info-grid-tpl').find('.add-rel-info-btn').removeClass('add-rel-info-btn').addClass('add-rel-service-popup-btn');

    var loginTntInstId = $('.product-factory-header', parent.document).find('.login-tntInst-id').text();
    var hash = selectRequestParam.split('&');
    var requestData = { 'code': clickEventForCode,              // product code
        'tntInstId' : hash[2].split('=')[1],
        'pdInfoDscd': pdInfoDscd_Product,           // 01.product
        'relationPdInfoDscd' : pdInfoDscd_Service,  // 02.service
        'packageProductDistinctionCode': '04',
        'commonHeaderMessage' : '{"loginTntInstId" : "' + loginTntInstId + '", "lastModifier"   : "' + getLoginUserId() + '"}'};

    renderRelProductGrid(requestData, 'M');

}

// 상품-포인트 관계
function renderProductRelPointGrid(requsetData){
    currentPage = 'relPoint';
    gridRendered = false;

    // add  class
    $el.find('.pf-cp-base-rel-info-grid-tpl').find('.add-rel-info-btn').removeClass('add-rel-info-btn').addClass('add-rel-point-btn');

    var loginTntInstId = $('.product-factory-header', parent.document).find('.login-tntInst-id').text();
    var hash = selectRequestParam.split('&');
    var requestData = { 'code': clickEventForCode,  // product code
        'tntInstId' : hash[2].split('=')[1],
        'pdInfoDscd': pdInfoDscd_Product,           // 01.product
        'relationPdInfoDscd' : pdInfoDscd_Point,    // 03.point
        'packageProductDistinctionCode': '05',
        'commonHeaderMessage' : '{"loginTntInstId" : "' + loginTntInstId + '", "lastModifier"   : "' + getLoginUserId() + '"}'};

    renderRelProductGrid(requestData, 'S');
}

// 서비스-상품 관계(싱글. 단, 전상품 선택 가능)
function renderServiceRelProductGrid(requsetData){
	currentPage = 'relProduct';
	gridRendered = false;

	//add class specially only for add button of relative product menu
	$el.find('.pf-cp-base-rel-info-grid-tpl').find('.add-rel-info-btn').removeClass('add-rel-info-btn').addClass('add-rel-product-btn');

	requestData = {
	    'code': clickEventForCode,                   // product code
	    'packageProductDistinctionCode': '03'
	};     // 03. 비복합상품/非组合产品

	var loginTntInstId = $('.product-factory-header', parent.document).find('.login-tntInst-id').text();
	var hash = selectRequestParam.split('&');
	requestData.tntInstId = hash[2].split('=')[1];
	requestData.pdInfoDscd = pdInfoDscd_Service;
	requestData.relationPdInfoDscd = pdInfoDscd_Product;       // 01.상품
	requestData.commonHeaderMessage = '{"loginTntInstId" : "' + loginTntInstId + '", "lastModifier"   : "' + getLoginUserId() + '"}';

	renderRelProductGrid(requestData, 'S');
}

//서비스 - 서비스 관계(S)
function renderRelServiceGrid(requsetDatas){
    currentPage = 'relService';
	gridRendered = false;

    // add  class
    $el.find('.pf-cp-base-rel-info-grid-tpl').find('.add-rel-info-btn').removeClass('add-rel-info-btn').addClass('add-rel-service-popup-btn');

    var loginTntInstId = $('.product-factory-header', parent.document).find('.login-tntInst-id').text();
    var hash = selectRequestParam.split('&');
    var requestData = { 'code': clickEventForCode,              // service code
        'tntInstId' : hash[2].split('=')[1],
        'pdInfoDscd': pdInfoDscd_Service,    // 02.service
        'relationPdInfoDscd' : pdInfoDscd_Service,  // 02.service
        'packageProductDistinctionCode': '04',
        'commonHeaderMessage' : '{"loginTntInstId" : "' + loginTntInstId + '", "lastModifier"   : "' + getLoginUserId() + '"}'};

    renderRelProductGrid(requestData, 'S');

}

//서비스 - 포인트 관계(S)
function renderServiceRelPointGrid(requsetDatas){
	currentPage = 'relPoint'; // OHS 20171205 수정 - relService -> relPoint
	gridRendered = false;

    // add  class
    $el.find('.pf-cp-base-rel-info-grid-tpl').find('.add-rel-info-btn').removeClass('add-rel-info-btn').addClass('add-rel-point-btn');

        var loginTntInstId = $('.product-factory-header', parent.document).find('.login-tntInst-id').text();
        var hash = selectRequestParam.split('&');
        var requestData = { 'code': clickEventForCode,  // service code
            'tntInstId' : hash[2].split('=')[1],
            'pdInfoDscd': pdInfoDscd_Service,             // 02.service
            'relationPdInfoDscd' : pdInfoDscd_Point,  // 03.point
            'packageProductDistinctionCode': '05',
            'commonHeaderMessage' : '{"loginTntInstId" : "' + loginTntInstId + '", "lastModifier"   : "' + getLoginUserId() + '"}'};

        renderRelProductGrid(requestData, 'S');

}

// 포인트-상품 관계
function renderPointRelProductGrid(requsetData) {
	currentPage = 'relProduct';
    gridRendered = false;

    // add  class
    $el.find('.pf-cp-base-rel-info-grid-tpl').find('.add-rel-info-btn').removeClass('add-rel-info-btn').addClass('add-rel-product-popup-btn');

    var loginTntInstId = $('.product-factory-header', parent.document).find('.login-tntInst-id').text();
    var hash = selectRequestParam.split('&');
    var requestData = { 'code': clickEventForCode,  // product code
        'tntInstId' : hash[2].split('=')[1],
        'pdInfoDscd': pdInfoDscd_Point,             // 03.point
        'relationPdInfoDscd' : pdInfoDscd_Product,  // 01.product
        //'packageProductDistinctionCode': '05', OHS 20171206 수정 - 관련상품은 '03' 임.
        'packageProductDistinctionCode': '03',
        'commonHeaderMessage' : '{"loginTntInstId" : "' + loginTntInstId + '", "lastModifier"   : "' + getLoginUserId() + '"}'};

    renderRelProductGrid(requestData, 'M');
}

// 포인트-포인트 관계
function renderPointRelPointGrid(requestData) {
	currentPage = 'relPoint';
    gridRendered = false;

    // add  class
    $el.find('.pf-cp-base-rel-info-grid-tpl').find('.add-rel-info-btn').removeClass('add-rel-info-btn').addClass('add-rel-point-btn');

    var loginTntInstId = $('.product-factory-header', parent.document).find('.login-tntInst-id').text();
    var hash = selectRequestParam.split('&');
    var requestData = { 'code': clickEventForCode,              // product code
        'tntInstId' : hash[2].split('=')[1],
        'pdInfoDscd': pdInfoDscd_Point,           // 01.product
        'relationPdInfoDscd' : pdInfoDscd_Point,  // 02.service
        'packageProductDistinctionCode': '05',
        'commonHeaderMessage' : '{"loginTntInstId" : "' + loginTntInstId + '", "lastModifier"   : "' + getLoginUserId() + '"}'};

    renderRelProductGrid(requestData, 'S');
}

// 관련금리체계
function renderRelIntRtStructureGrid(){
    currentPage = 'intRtStructure';
    gridRendered = false;

    $('.add-rel-info-btn').hide();
    $('.rel-save-btn').hide();
    //$('.class-stru-mgmt-btn').show();

    var requestData = $.extend(true, {}, conditionRequestParam);
    var loginTntInstId = $('.product-factory-header', parent.document).find('.login-tntInst-id').text();
    requestData.bizDscd = requestData.businessDistinctionCode;
    requestData.productCode = requestData.code;
    delete requestData.businessDistinctionCode;
    delete requestData.code;
    requestData.commonHeaderMessage = '{"loginTntInstId" : "' + loginTntInstId + '", "lastModifier"   : "' + getLoginUserId() + '"}';

    PFRequest.get('/interestRateStructure/ProductRelationQueryPdInterestRateStructureRelationListController.json',requestData,{
        success: function (responseData) {

            var errorMessage;
            if(responseData) {
                gridDeleteDate = [];
                clickEventForGrid = PFComponent.makeExtJSGrid({
                    fields: [
                        "tntInstId","pdInfoDscd","applyStartDate","applyEndDate", "intRtStructureCode", "intRtStructureName", "intRtStructureContent"
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
                        renderTo: '.pf-base-rel-info-grid',
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
                            //{text: bxMsg('DPS0101String11'),  width:100, dataIndex: 'productTypeName', style: 'text-align:center'},

                            // 상품템플릿
                            //{text: bxMsg('DPS0101String3'),  width:120, dataIndex: 'productTemplateName', style: 'text-align:center'},

                            // 상품
                            //{text: bxMsg('pdCd'),  width:150, dataIndex: 'productCode', style: 'text-align:center'},
                            //{text: bxMsg('pdNm'),  flex:1, dataIndex: 'productName', style: 'text-align:center'},

                            {text: bxMsg('intRtStrctrName'),  flex:1.5, dataIndex: 'intRtStructureName', style: 'text-align:center'},

                            {text: bxMsg('formulaCntnt'),  flex:1, dataIndex: 'intRtStructureContent', style: 'text-align:center'},

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
                            }
                        ],
                        listeners:{
                            scope: this,
                        }
                    }
                });

                setRelGridSaveEventProperty(responseData.voList, {}, '');

            }
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'InterestRateStructureService',
            operation: 'queryPdInterestRateStructureRelationList'
        }
    })
}

// 관련가맹점
function renderRelMerchantGrid(){

    currentPage = 'relMerchant';
    gridRendered = false;

    // OHS 2017.02.21 추가 - 서비스영역일경우 분기처리
    if(pdInfoDscd == pdInfoDscd_Service) {
    	$el.find('.pf-cp-base-rel-info-grid-tpl').find('.add-rel-info-btn').removeClass('add-rel-info-btn').addClass('add-rel-merchant-popup-btn');
    }

    var gridListener = {
        cellclick : function(_this, td, cellIndex, record, tr, rowIndex, e, eOpts) {

            var applyEndIndex = 2;
            var isDisable = beforeGridCellSelect(record.data.relationInformationStatus);
            if(isDisable && cellIndex != $(tr).children().size()-applyEndIndex ){
                return false;
            }

            if (cellIndex == 2 || cellIndex == 3) {

                var submitEvent;

                if (record.data.merchantTypeCode == "02") {  // 가맹점그룹
                    PFPopup.selectMerchantGroup({}, function (selectItem) {
                        $(tr).find('td').eq(2).find('div').text(selectItem.merchantGroupCode);
                        $(tr).find('td').eq(3).find('div').text(selectItem.merchantGroupName);
                        record.data.merchantNumber = selectItem.merchantGroupCode;
                        record.data.merchantName = selectItem.merchantGroupName;
                    });

                }else if(record.data.merchantTypeCode == "03"){
                    PFPopup.selectMerchant({}, function (selectItem) {
                        $(tr).find('td').eq(2).find('div').text(selectItem.merchantCode);
                        $(tr).find('td').eq(3).find('div').text(selectItem.merchantName);
                        record.data.merchantNumber = selectItem.merchantCode;
                        record.data.merchantName = selectItem.merchantName;
                    });
                }
            }
        }
    };

    var requestData = {'code': clickEventForCode };
    var loginTntInstId = $('.product-factory-header', parent.document).find('.login-tntInst-id').text();
    var hash = selectRequestParam.split('&');
    requestData.tntInstId =  hash[2].split('=')[1];
    requestData.pdInfoDscd = pdInfoDscd;
    requestData.commonHeaderMessage = '{"loginTntInstId" : "' + loginTntInstId + '", "lastModifier"   : "' + getLoginUserId() + '"}';

    PFRequest.get('/product/getListProductMerchantRelation.json', requestData,{
        success: function (responseData) {
            var errorMessage;
            if(responseData) {
                gridDeleteDate = [];
                clickEventForGrid = PFComponent.makeExtJSGrid({
                    fields: [
                        'code', 'pdRelStatusCode', 'relationInformationStatus',
                        'pdMerchantRelCode','merchantTypeCode',
                        'merchantNumber', 'merchantName',
                        'applyStart', 'applyEnd', 'process'
                    ],
                    gridConfig: {
                        renderTo: '.pf-base-rel-info-grid',
                        columns: [
                            makeComboOfRelGrid(bxMsg('merchantRelType'), 'flex', 1, 'pdMerchantRelCode', 'BnftMrchntRelTypeCode'),
                            makeComboOfRelGrid(bxMsg('merchantTypeDistinction'), 'flex', 1, 'merchantTypeCode', 'merchantTypeDistinction'),
                            {text: bxMsg('merchantNo'), flex: 1, dataIndex: 'merchantNumber', sortable: false, align: 'center'},
                            {text: bxMsg('merchantName'), flex: 1, dataIndex: 'merchantName', sortable: false, align: 'center'},
                            getStatusOfGrid(),    // 상태
                            getAppyDateCellOfGrid('applyStart'),
                            getAppyDateCellOfGrid('applyEnd'),
                            gridDestoryRowOfGrid()
                        ],
                        plugins: [getGridCellEditiongPlugin()],
                        listeners: makeRelGridListeners(gridListener)
                    }
                });

                setRelGridSaveEventProperty(responseData.voList, {}, '/product/saveProductMerchantRelation.json','savePdMerchantRelation');

            }
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'PdRelationService',
            operation: 'queryPdMerchantRelationList'
        }
    });
}

// 관련업종
function renderRelBizCategory(){
    currentPage = 'relMerchant';
    gridRendered = false;

    // OHS 2017.02.21 추가 - 서비스영역일경우 팝업호출을 위한 분기처리
    if(pdInfoDscd == pdInfoDscd_Service) {
    	$el.find('.pf-cp-base-rel-info-grid-tpl').find('.add-rel-info-btn').removeClass('add-rel-info-btn').addClass('add-rel-biz-category-popup-btn');
    }

    var gridListener = {
        cellclick : function(_this, td, cellIndex, record, tr, rowIndex, e, eOpts) {

            var applyEndIndex = 2;
            var isDisable = beforeGridCellSelect(record.data.relationInformationStatus);
            if(isDisable && cellIndex != $(tr).children().size()-applyEndIndex ){
                return false;
            }

            if (cellIndex == 1 || cellIndex == 2) {
                PFPopup.selectCommonCodeDetail({ code: 'P0086', codeNm: 'relBizCategory' }, function (selectItem) {
                    $(tr).find('td').eq(1).find('div').text(selectItem.instanceCode);
                    $(tr).find('td').eq(2).find('div').text(selectItem.instanceName);
                    record.data.bizCategoryCode = selectItem.instanceCode;
                    record.data.merchantName = selectItem.instanceName;
                });

            }
        }
    };

    var requestData = {'code': clickEventForCode };
    var loginTntInstId = $('.product-factory-header', parent.document).find('.login-tntInst-id').text();
    var hash = selectRequestParam.split('&');
    requestData.tntInstId =  hash[2].split('=')[1];
    requestData.pdInfoDscd = pdInfoDscd;
    requestData.commonHeaderMessage = '{"loginTntInstId" : "' + loginTntInstId + '", "lastModifier"   : "' + getLoginUserId() + '"}';

    PFRequest.get('/product/getListProductBizCategoryRelation.json', requestData,{
        success: function (responseData) {
            var errorMessage;
            if(responseData) {
                gridDeleteDate = [];
                clickEventForGrid = PFComponent.makeExtJSGrid({
                    fields: [
                        'code', 'relationInformationStatus', 'bizCategoryRelCode',
                        'bizCategoryCode',
                        {name:'bizCategoryCodeName',
                            convert: function(newValue, record){
                                return codeMapObj.BusinessCategoryCode[record.get('bizCategoryCode')];

                            }},
                        'applyStart', 'applyEnd', 'process'
                    ],
                    gridConfig: {
                        renderTo: '.pf-base-rel-info-grid',
                        columns: [
                            makeComboOfRelGrid(bxMsg('relationType'), 'flex', 1, 'bizCategoryRelCode', 'BnftMrchntRelTypeCode'),
                            {text: bxMsg('bizCategoryCode'), flex: 1, dataIndex: 'bizCategoryCode', sortable: false, align: 'center'},
                            {text: bxMsg('bizCategoryCodeName'), flex: 1, dataIndex: 'bizCategoryCodeName', sortable: false, align: 'center'},
                            getStatusOfGrid(),    // 상태
                            getAppyDateCellOfGrid('applyStart'),
                            getAppyDateCellOfGrid('applyEnd'),
                            gridDestoryRowOfGrid()
                        ],
                        plugins: [getGridCellEditiongPlugin()],
                        listeners: makeRelGridListeners(gridListener)
                    }
                });

                setRelGridSaveEventProperty(responseData.voList, {}, '/product/updateProductBizCategoryRelation.json','updatePdBusinessCategoryRelation');

            }
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'PdRelationService',
            operation: 'queryPdBusinessCategoryRelationList'
        }
    });
}


// 상품관계정보
function renderProductRelInfoGrid(gridId){
    currentPage = 'relInfo';
    gridRendered = false;

    var requestParam = {
		pdInfoDscd : pdInfoDscd
	  , relTpCd : gridId
	}

	PFRequest.get('/common/relation/getListPdRelationConfiguration.json', requestParam, {
        success: function (responseData) {
        	if(responseData.length>0){
        		renderGrid(responseData[0]);
        	}
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'PdRelationConfigurationService',
            operation: 'getListPdRelationConfiguration'
        }
	});


    function renderGrid(data){

    	var fieldList = data.fieldList;

    	var fields = [
            'code', 'relationInformationStatus', 'pdTgtRelCd','tgtCd', 'relCntnt',
            'applyStart', 'applyEnd', 'process',
            {
                name: 'relTpCd',
                convert: function(newValue, record) {
                    return data.relTpCd;
                }
            }
        ];

    	var columns = [];
    	addColumns(columns, data.fieldList);

    	columns.push(getStatusOfGrid('pdRelStsCd'));    // 상태
		columns.push(getAppyDateCellOfGrid('applyStart'));
		columns.push(getAppyDateCellOfGrid('applyEnd'));
		columns.push(gridDestoryRowOfGrid());

		var gridListener = {
	        cellclick : function(_this, td, cellIndex, record, tr, rowIndex, e, eOpts) {

	        }
	    };

    	clickEventForGrid = PFComponent.makeExtJSGrid({
            fields: fields,
            gridConfig: {
                renderTo: '.pf-base-rel-info-grid',
                columns: columns,
                plugins: [getGridCellEditiongPlugin()],
                listeners: makeRelGridListeners()
            }
        });

	    var requestData = {'code': clickEventForCode };
	    var loginTntInstId = $('.product-factory-header', parent.document).find('.login-tntInst-id').text();
	    var hash = selectRequestParam.split('&');
	    requestData.tntInstId =  hash[2].split('=')[1];
	    requestData.pdInfoDscd = pdInfoDscd;
	    requestData.relTpCd = data.relTpCd;
	    requestData.commonHeaderMessage = '{"loginTntInstId" : "' + loginTntInstId + '", "lastModifier"   : "' + getLoginUserId() + '"}';

	    PFRequest.get('/product/queryProductRelationInfoForList.json', requestData,{
	        success: function (responseData) {
	            var errorMessage;
	            if(responseData) {
	                gridDeleteDate = [];
	                setRelGridSaveEventProperty(responseData.voList, {}, '/product/updateProductRelationInfo.json','updateProductRelationInfo');
	            }
	        },
	        bxmHeader: {
	            application: 'PF_Factory',
	            service: 'PdRelationService',
	            operation: 'queryProductRelationInfoForList'
	        }
	    });

    }

    function addColumns(columns, fieldList){

    	// 순서를 유지하기 위함.
    	var pdTgtRelCdColumn = $.grep(fieldList, function(el){
    		return el.field == 'pd_tgt_rel_cd';
    	});
    	if(pdTgtRelCdColumn.length>0){
    		addColumn(columns, pdTgtRelCdColumn[0]);
    	};

    	var tgtCdColumn = $.grep(fieldList, function(el){
    		return el.field == 'tgt_cd';
    	});
    	if(tgtCdColumn.length>0){
    		addColumn(columns, tgtCdColumn[0]);
    	};

    	var relCntntColumn = $.grep(fieldList, function(el){
    		return el.field == 'rel_cntnt';
    	});
    	if(relCntntColumn.length>0){
    		addColumn(columns, relCntntColumn[0]);
    	};
	}

	function addColumn(columns, el){

		el.field = el.field.replace(/_([a-z])/g, function (g) { return g[1].toUpperCase(); });

		if(el.dmnCd != null && el.dmnCd != ''){
			columns.push(makeComboOfRelGrid(el.fieldNm, 'flex', 1, el.field, el.dmnNm));
		}else{
			columns.push({text: el.fieldNm, flex: 1, dataIndex: el.field, sortable: false, align: 'center', editor:{}});
		}

	};
}


/**********************************************************************************************************************
 * popup
 **********************************************************************************************************************/


/**********************************************************************************************************************
 * user defined function
 **********************************************************************************************************************/

function setRelGridSaveEventProperty(gridData, createGridRowData, saveUrl, operation){
    clickEventForGrid.setData(gridData);
    clickEventForNewData = createGridRowData;
    clickSaveEventForUrl = saveUrl;
    clickOperation = operation;
}

function setNewGridData(clickEventForCode,clickEventForNewData,clickEventForGrid){
    clickEventForNewData.code = clickEventForCode;
    clickEventForNewData.relationInformationStatus = '01';

    var applyStart = PFUtil.getNextDate() + ' 00:00:00';
    var applyEnd = '9999-12-31 23:59:59';

    clickEventForNewData.applyStart = applyStart;
    clickEventForNewData.applyEnd = applyEnd;
    clickEventForNewData.process = 'C';

    clickEventForGrid.addData(clickEventForNewData);

    modifyFlag = true;
}


function relDataSave (gridData,url,projectId) {
    var requestData = {};
    requestData.code = clickEventForCode;
    requestData.voList = gridData;
    requestData.projectId = projectId;
    requestData.pdInfoDscd = pdInfoDscd;    // 01.상품

    var saveFlag = true;

    if(currentPage=='relCust'){
      // 입력 길이 체크 추가
      for (let rel of gridData) {
        if (!PFValidation.finalLengthCheck('', 15, rel.customerRelationId)) return;
      }
    }else if(currentPage=='relProduct'){
        requestData.packageProductDistinctionCode = '03';
    }else if(currentPage=='relService'){
        requestData.packageProductDistinctionCode = '04';
    }else if(currentPage=='relPoint'){
        requestData.packageProductDistinctionCode = '05';
    }
    else if(currentPage=='productNm'){
        var reg = /[`~!@#$%^&*+=|\\\'\";:\/?.,]/;
        $.each(requestData.voList,function(index, row){
            if(reg.test(row.productAliasName)){
                PFComponent.showMessage(bxMsg('specialCharacterMsg'), 'warning');
                saveFlag = false;
            }
        })
    }else if(currentPage == 'relInfo'){
    	requestData.relTpCd = currentEventGrid;
    }

    if(!modifyFlag){
		// 변경된 정보가 없습니다.
		PFComponent.showMessage(bxMsg('nothingToSave'), 'warning');
		return;
	}

    if(saveFlag){

        var loginTntInstId = $('.product-factory-header', parent.document).find('.login-tntInst-id').text();
        var hash = selectRequestParam.split('&');
        requestData.tntInstId =  hash[2].split('=')[1];
        requestData.commonHeaderMessage = {loginTntInstId:loginTntInstId, lastModifier:getLoginUserId()};

        PFRequest.post(url,requestData,{
            success: function (responseData) {
                if(responseData) {
                    PFComponent.showMessage(bxMsg('workSuccess'), 'success');
                    renderBasePage(relInfoGridTpl, currentEventGrid);
                    modifyFlag = true; 	// resetFormModifed();
                }
            },
            bxmHeader: {
                application: 'PF_Factory',
                service: 'PdRelationService',
                operation: clickOperation
            }

        });
    }
}


// bind combo
function setProductTypeDistinctionCode(code){
    var options = [];
    $.each(codeArrayObj['ProductTypeDistinctionCode'],function(index, code){
        var $option = $('<option>');
        $option.val(code.code);
        $option.text(code.name);
        options.push($option);
    });

    $('.product-type-distinction-code').html(options);
    $('.product-type-distinction-code option[value="'+code+'"]').prop('selected',true);
}

function getAppyDateCellOfGrid(dataIndex){
    var cellTitle;
    if(dataIndex === 'applyStart' || dataIndex === 'applyStartDate'){
        cellTitle = bxMsg('DPP0127String6');
    }else{
        cellTitle = bxMsg('DPP0127String7');
    }
    var applyStartCell = {
        text: cellTitle, width:150, sortable: false, dataIndex: dataIndex, align: 'center',
        editor: {
            allowBlank: false,
            listeners: getApplyDateCellListeners(dataIndex)
        },
        listeners: {
            click: function() {
                selectedCellIndex = $(arguments[1]).parent().index();
            }
        }
    }

    return applyStartCell;
}

function gridDestoryRowOfGrid(){
    var destoryCell = {
        xtype: 'actioncolumn', width: 35, align: 'center', sortable: false,
        renderer:function(val, metadata, record){
            this.items[0].icon = '/images/x-delete-16.png';
        },
        items: [{
            icon: '',
            handler: function (grid, rowIndex, colIndex, item, e, record) {
                if(record.data.relationInformationStatus=='01' || getSelectedProjectId() && isEmergency(getSelectedProjectId())){
                    if(record.data.process != 'C') {
                        record.data.process = 'D';
                        gridDeleteDate.push(record.data);
                    }
                    record.destroy();
                    modifyFlag = true;
                }else{
                    PFComponent.showMessage(bxMsg('dontDeleteActiveTypeConditionTemplate'), 'warning');
                }
            }
        }]
    }

    return destoryCell;
}

function makeRelGridListeners(listeners){
    var gridListeners = makeGridDefaultListener(2);

    if(listeners){
        $.each(listeners, function(name, event){
            gridListeners[name] = event;
        })
    }

    return gridListeners;
}

function makePackageGridListeners(){
    //return makeGridDefaultListener(3);
    var gridListeners = {
        scope: this,
        cellclick   //cellmousedown
            : function(_this, td, cellIndex, record, tr, rowIndex, e, eOpts ){
            var isDisable = beforeGridCellSelect(record.data.relationInformationStatus);
            if(isDisable && cellIndex != $(tr).children().size()-applyEndIndex ){
                return false;
            }

            if (cellIndex == 0 || cellIndex == 1) {

                var submitEvent = function(data) {
                    record.set('relatedProductCode', data.code);
                    record.set('relatedProductName', data.name);
                };

                // 상품일때
                //if(requestData.relationPdInfoDscd == pdInfoDscd_Product) {
                PFPopup.selectProduct({ pdInfoDscd: pdInfoDscd_Product }, submitEvent);
                //}
                // 서비스일때
                //else if(requestData.relationPdInfoDscd == pdInfoDscd_Service) {
                //    makeSearchServiceListPopup(submitEvent);
                //}

            }
        }
    };

    return gridListeners;
}


function makeGridDefaultListener(applyEndIndex){
    var gridListeners = {
        scope: this,
        cellclick   //cellmousedown
            : function(_this, td, cellIndex, record, tr, rowIndex, e, eOpts ){
            var isDisable = beforeGridCellSelect(record.data.relationInformationStatus);
            if(isDisable && cellIndex != $(tr).children().size()-applyEndIndex ){
                return false;
            }
        }
    };

    return gridListeners;
}

function beforeGridCellSelect(relationInformationStatus){
    // 개발과제가 Emergency
    if(getSelectedProjectId() && isEmergency(getSelectedProjectId())){
        return false;
    }

    // 개발과제상태 상품정보수정
    if(getSelectedProjectId() && isUpdateStatus(getSelectedProjectId())){
        return false;
    }

    // 판매중일때
    if(relationInformationStatus === '04'){
        return true;
    }

    return false;
};

function getApplyDateCellListeners(targetIndex){
    return {
        focus: function(_this) {
            var isNextDay = true;
            if(getSelectedProjectId() && (isEmergency(getSelectedProjectId()) || isUpdateStatus(getSelectedProjectId()))){
                isNextDay == false;
            }
            PFUtil.getGridDateTimePicker(_this, targetIndex, clickEventForGrid, selectedCellIndex, isNextDay);
        },
        blur: function(_this, e){
            if(targetIndex == 'applyStart'){
                PFUtil.checkDate(e.target);
            }else if(targetIndex == 'applyEnd'){
                PFUtil.checkDate(e.target, '9999-12-31 23:59:59');
            }
        }
    };
};

function getGridCellEditiongPlugin(){
    return Ext.create('Ext.grid.plugin.CellEditing', {
        clicksToEdit: 1,
        listeners : {
            afteredit: function(e, editor){
                if(editor.originalValue !=  editor.value){

                    if(editor.field != 'applyEnd' && (editor.record.get('process') == null || editor.record.get('process').length == 0)){
                        var originalData = $.extend(true, {}, editor.record.data);
                        originalData[editor.field] = editor.record.modified[editor.field];
                        originalData['process'] = 'D';
                        gridDeleteDate.push(originalData);

                        editor.record.set('process', 'C');
                    }

                    else if(editor.record.get('process') != 'C') {
                        editor.record.set('process', 'U');
                    }

                    modifyFlag = true;
                }
            }
        }
    });
}

function getStatusOfGrid(){
    var statusCell = {
        text : bxMsg('DPS0101String6'),
        width : 100,
        align: 'center',
        dataIndex : 'relationInformationStatus',
        renderer : function(value){
            return codeMapObj['ProductStatusCode'][value];
        }
    }

    return statusCell;
}

function makeComboOfRelGrid(title, sizeType, size, dataIndex, enumName){
    var combo = {
        text: title, dataIndex: dataIndex, align: 'center', sortable: false,
        renderer: function(value) {
            return codeMapObj[enumName][value];
        },
        editor: {
            xtype: 'combo',
            typeAhead: true,
            triggerAction: 'all',
            displayField: 'name',
            valueField: 'code',
            editable: false,
            store: new Ext.data.Store({
                fields: ['name', 'code'],
                data: codeArrayObj[enumName]
            }),
            listeners: {
                'change': function(_this, newValue, oldValue, eOpts) {
                    modifyFlag = true;
                }
            }
        }
    }

    combo[sizeType] = size;

    return combo;
};

function renderProductListPopupByMulti(pdInfoDscd, isSelectTemplate) {
  PFPopup.selectProductByMulti({ pdInfoDscd, isSelectTemplate },
      (selectProduct, {
        firstCategory,
        secondCategory,
        thirdCategory,
        serviceRelationTypeCode,
        aplyStartDate,
        endDate,
      }) => {
        // submitEvent === undefined이면 '추가버튼'을 클릭하여 신규row생성
        selectProduct.forEach((row) => {
          row.applyStart = aplyStartDate; // 적용시작년월일
          row.applyEnd = endDate; // 적용종료년월일
          row.betweenProductRelation = serviceRelationTypeCode; // 서비스관계유형
          row.relatedProductCode = row.code;
          row.relatedProductName = row.name;
          row.process = 'C';
          row.relationInformationStatus = '01';
          row.relationPdInfoDscd = pdInfoDscd;

          if (row.code !== '*') {
            row.relatedProductCodeLabel = row.code;
            row.businessDistinctionCode1 = firstCategory;

            const requestParam = {};
            requestParam.pdInfoDscd = pdInfoDscd;
            requestParam.id = row.fullPath;

            // 2017.02.07 OHS 수정 - 상품템플릿 잘라오는 substring 수정
            // requestParam.code = data[0].fullPath.substring(6,13);
            requestParam.code = row.fullPath.substring(selectProduct[0].fullPath.lastIndexOf('.') + 1, selectProduct[0].fullPath.length);

            requestParam.firstCatalogId = row.fullPath.substring(0, 2);
            requestParam.secondCatalogId = row.fullPath.substring(3, 5);

            PFRequest.get('/product/template/getProductTemplate.json', requestParam, {
              success(responseData) {
                row.industryDistinctionCode1 = responseData.industryDistinctionCode;
                row.productTypeCode1 = responseData.secondCatalogId;
                row.productTypeName1 = responseData.secondCatalogName;
                row.productTemplateCode1 = responseData.code;
                row.productTemplateName1 = responseData.name;
              },
              bxmHeader: {
                application: 'PF_Factory',
                service: 'PdTemplateService',
                operation: 'queryPdTemplate',
              },
              async: false,
            });
          } else {
            row.relatedProductCodeLabel = row.name;

            if (secondCategory) {
              row.industryDistinctionCode1 = secondCategory.industryDistinctionCode;
              row.productTypeCode1 = secondCategory.id.substr(3, 4);
              row.productTypeName1 = secondCategory.name;
            }
            if (secondCategory && !thirdCategory) {
              row.productTemplateCode1 = '*';
              row.productTemplateName1 = bxMsg('Z_All');
            }
          }
        });
        clickEventForGrid.addData(selectProduct);
        modifyFlag = true;
      });
}