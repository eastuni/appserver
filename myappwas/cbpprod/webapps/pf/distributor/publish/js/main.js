/**
 * publish java script
 * @author Product Factory Team
 * @version $$id: main.js, v 0.1 $$
 */
$(function() {

    setMainTapLeftPosition();

    // Publish Base Info Rendering
    renderPublishBase();

    // Publish Grid Info Rendering
    renderPublishGrid();

    $('.publish-search-btn').click();
    $('body').css('overflow-y', 'scroll');

    if(writeYn != 'Y'){
        $('.write-btn').hide();
    }
});

// Page Root jQuery Element
var $el = $('.pf-publish');

// Publish Form Template
var publishFormTpl;

// Publish Form
var publishForm;

// Publish Detail Form
var publishDetailForm;

// Publish Grid
var publishGrid;

// Publish Detail Grid
var publishDetailGrid;

//Add Approval Popup Grid
var addApprovalPopupGrid;

// Project Object Info
var productInfoTpl;

//var publishApprovalForm;

var selectedResultIndex;

const  MODIFIABLE = '01';
const  APPROVALREQUEST = '02';
const  APPROVALCOMPLETE = '03';
const  DEVDISTRIBUTING = '04';
const  DEVDISTRIBUTESUCCESS = '05';
const  DEVDISTRIBUTEFAIL = '06';
const  PRODUCTIONDISTRIBUTING ='07';
const  PRODUCTIONDISTRIBUTESUCCESS = '08';
const  PRODUCTIONDISTRIBUTEFAIL = '09';
const  P_PRODUCTIONDISTRIBUTING ='11';
const  P_PRODUCTIONDISTRIBUTESUCCESS = '12';
const  P_PRODUCTIONDISTRIBUTEFAIL = '13';

var onEvent = PFUtil.makeEventBinder($el);
PFComponent.toolTip($el); // icon tooltip 적용

var columnCodeMap = {
    pdInfoDscd :'PdInfoDscd',
    cmpxCndYn :'ProductConditionClassifyCode',
    pdStsCd :'ProductStatusCode',
    bizDscd :'ProductCategoryLevelOneCode',
    intRtAplyBaseDayCd:'IntRtAplyBaseDayCode',
    cndValDcsnLvlCd:'ProductConditionAgreeLevelCode',
    crncyCd:'CurrencyCode',
    intRtDataTpCd:'InterestTypeCode',
    frctnAplyWayCd:'FrctnAplyWayCode',
    intRtAplyWayCd:'ProductConditionInterestApplyTypeCode',
    blwUndrDscd:'RangeBlwUnderTypeCode',
    msurUnitCd:'ProductMeasurementUnitCode',
    pdDocDscd:'ProductDocumentTypeCode',
    pdTpDscd:'ProductTypeDistinctionCode'
}


onEvent('click', 'a', function(e) { e.preventDefault(); });

// Serch for publish Event
onEvent('click', '.publish-search-btn', function() {
    // Publish List Query
    // Input Data Setting
    var requestData = publishForm.getData();
    requestData.endDate = requestData.endDate.substr(0,10)+' 23:59:59';

    var statusListString;
    if(requestData.status.length > 0) {
        statusListString = ""
        for (var i = 0; i < requestData.status.length; i++) {
            statusListString += requestData.status[i] + ",";
        }
        requestData.statusList = statusListString.substr(0, statusListString.length - 1);
    }
    delete requestData.status;
    PFRequest.get('/publish/queryPublishBaseInfoForList.json' , requestData, {
        success: function(responseData) {
            publishGrid.setData(responseData);
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'PublishService',
            operation: 'queryListPublishBase'
        }
    });
});


// new Insert Publish Button
onEvent('click', '.publish-new-btn', function(e) {
    // Default Parameter Setting
    // new Insert Status only "03" : PUBLISH_READY(发布准备)
    var defaultParam = {
        "registerUserId" : getLoginUserId(),
        "status" : "01"
    }

    // Publish Detail Popup Open
    renderPublishDetailPopup(defaultParam);
});

// 초기화 버튼 입력 처리
onEvent('click', '.publish-init-btn', function(e) {
    // Publish Main Clear
    publishForm.reset();
    $('.publish-status-code-list').val('');
    $('.publish-status-code-list').multiselect('reload', '');
    publishGrid.setData([]);

    PFUtil.getDatePicker();
    // Set default start, end date
    $('.start-date').val(PFUtil.addMonths(PFUtil.getToday(),-1));
    $('.end-date').val(PFUtil.getToday());
});

// Load Template in HTML
// pf-publish-list-form-tpl : 배포 스크립트
publishFormTpl = getTemplate('publishFormTpl');
productInfoTpl = getTemplate('productInfoTpl');
//addApprovalPopup = Handlebars.compile($('#add-approval-popup').html());
/**
 * Rendering Publish Base Start
 */
function renderPublishBase() {
    // 마크업1에 html 삽입
    $el.find('.pf-page-conts').html(publishFormTpl());
    publishForm = PFComponent.makeYGForm($('.pf-publish-list-form'));

    PFUtil.getDatePicker();
    // Set default start, end date
    $('.start-date').val(PFUtil.addMonths(PFUtil.getToday(),-1));
    $('.end-date').val(PFUtil.getToday());

    //make coboBox
    var options = [];

    var $defaultOption = $('<option>');

    $.each(codeMapObj['PublishStatusCode'], function(key,value){
        var $option = $('<option>');

        $option.val(key);
        $option.text(value);

        options.push($option);
    });

    $('.publish-status-code-list').html(options);

    $('select[multiple]').multiselect();

}


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

function renderProductSubTab(subDatas) {
    PFUI.use('pfui/tab',function(Tab){
        var tab = new Tab.Tab({
            render : '#product-sub-info-tab',
            elCls : 'nav-tabs',
            autoRender: true,
            children:[
                {text:bxMsg('DTE00003_Title'),value:subDatas[0], index:1},
                {text:bxMsg('DTE00002_Title'),value:subDatas[1], index:2},
                {text:bxMsg('MTM0100String3'),value:subDatas[2], index:3},
                {text:bxMsg('DPE00001_Title'),value:subDatas[3], index:4}
            ]
        });
        tab.on('selectedchange',function (ev) {
            var item = ev.item;
            renderTargetObjectGrid(item.get('value'), item.get('index'));
        });

        tab.setSelected(tab.getItemAt(0), 1);

    });
}

/***********************************************************************************************************************
 *  그리드 함수
 **********************************************************************************************************************/

// Publish Grid Information Rendering
function renderPublishGrid() {
    publishGrid = PFComponent.makeExtJSGrid({
        fields: ['publishId', 'status', 'registerUserId','registerUserName', 'projectId', 'projectName',{
            name: 'statusName',
            convert: function(newValue, record) {
                var statusName = codeMapObj.PublishStatusCode[record.get('status')];
                return statusName;
            }
        }],
        gridConfig: {
            renderTo: '.pf-publish .pf-publish-grid',
            columns: [
                // 1. DAS0101String3 : 배포ID
                // 2. DAS0101String22 : 개발과제ID
                // 3. DAS0101String23 : 개발과제명
                // 4. DAS0101String5 : 배포상태
                // 5. DAS0101String7 : 등록사원
                {text: bxMsg('DAS0101String3'), flex: 1, dataIndex: 'publishId', style: 'text-align:center', align: 'center'},
                {text: bxMsg('DAS0101String22'), flex: 1, dataIndex: 'projectId', style: 'text-align:center', align: 'center'},
                {text: bxMsg('DAS0101String23'), flex: 1, dataIndex: 'projectName', style: 'text-align:center', align: 'center'},
                {text: bxMsg('DAS0101String5'), flex: 1, dataIndex: 'statusName', style: 'text-align:center',  align: 'center'},
                {text: bxMsg('DAS0101String7'), flex: 1, dataIndex: 'registerUserName', style: 'text-align:center',  align: 'center'}
            ],
            // 이벤트처리
            listeners: {
                scope: this,
                itemdblclick: function (tree, record) {
                    var requestParam = {
                        "publishId" : record.data.publishId
                    }

                    // Render PublishDetail Popup Page
                    PFRequest.get('/publish/getProjectBaseInfo.json', requestParam, {
                        success : function(responseData) {
                            // Render PublishDetail Popup Page
                            renderPublishDetailPopup(responseData);
                        },
                        bxmHeader: {
                            application: 'PF_Factory',
                            service: 'PublishService',
                            operation: 'queryPublishBase'
                        }
                    });
                }
            }
        }
    });
}



// Publish Grid Information Rendering
function renderPublishProjectGrid(responseData) {
    // Grid Empty
    $('.pf-publish-detail-tpl .pf-publish-detail-grid').empty();
    publishDetailForm = PFComponent.makeYGForm($('.pf-publish-detail-table'));
    publishDetailGrid = PFComponent.makeExtJSGrid({
        fields: ["projectId", "name"],
        gridConfig: {
            renderTo: '.pf-publish-detail-tpl .pf-publish-detail-grid',
            columns: [
                // 1. DAS0101String3 : 개발과제ID
                // 2. DAS0101String5 : 개발과제명
                {text: bxMsg('PAS0201String3'), flex: 1, dataIndex: 'projectId', style: 'text-align:center', align: 'center'},
                {text: bxMsg('PAS0201String2'), flex: 1, dataIndex: 'name', style: 'text-align:center',  align: 'center'},
                {
                    xtype: 'actioncolumn', width: 35, align: 'center',
                    renderer:function(val, metadata, record){
                        if(publishDetailForm.getData().status == MODIFIABLE){
                            this.items[0].icon = '/images/x-delete-16.png';
                        }
                    },
                    items: [{
                        //icon: '/images/x-delete-16.png',
                        icon: '',
                        handler: function (grid, rowIndex, colIndex, item, e, record) {
                            var status = publishDetailForm.getData().status;
                            if(status != MODIFIABLE) {
                                // Don't Delete
                                return;
                            }
                            $('.add-publish-projectId-btn').show();
                            $('.search-pd-info-chng-btn').hide();
                            record.destroy();
                        }
                    }]
                }
            ]
        }
    });
    if(responseData) {
        publishDetailGrid.setData(responseData);
    }

    if (responseData && responseData.status == MODIFIABLE && publishDetailGrid.getAllData.length == 0) {
        $('.add-publish-projectId-btn').show();
        $('.search-pd-info-chng-btn').hide();
    } else {
        $('.add-publish-projectId-btn').hide();
        $('.search-pd-info-chng-btn').show();
    }
}



function renderTargetObjectGrid(data, tabIndex) {
    var columns = [];
    if(tabIndex == 1) {
        // ConditionTemplate
        columns[0] = "MTM0300String15";
        columns[1] = "MTM0300String16";
    } else if(tabIndex == 2) {
        // ConditionGroupTemplate
        columns[0] = "MTM0200String1";
        columns[1] = "MTM0200String18";
    } else if(tabIndex == 3) {
        // ProductTemplate
        columns[0] = "MTM0100String10";
        columns[1] = "MTM0100String12";
    } else {
        // Product
        columns[0] = "DPP0107String1";
        columns[1] = "DPP0107String4";
    }

    $('.target-obj-grid').empty().elementReady(function() {
        var grid = PFComponent.makeExtJSGrid({
            fields: [
                "targetObjectCode","targetObjectName","targetObjectType","firstCatalogId","secondCatalogId","fullPath"
            ],
            gridConfig: {
                renderTo: '.target-obj-grid',
                columns: [
                    {text: bxMsg(columns[0]), flex: 1, dataIndex: 'targetObjectCode'},
                    {text: bxMsg(columns[1]), flex: 1.5, dataIndex: 'targetObjectName'},
                ],
                listeners: {
                    scope: this,
                    itemdblclick : function(tree, record){

                        var pathname;
                        var hash, protocol;

                        switch (record.data.targetObjectType){
                            case '01' :
                                pathname = '/designer/condition_template/index.htm';
                                hash = '#conditionCode='+record.data.targetObjectCode;
                                break;
                            case '02' :
                                pathname = '/designer/condition_group_template/index.htm';
                                hash = '#conditionGroupTemplateCode='+record.data.targetObjectCode;
                                break;
                            case '03' :
                                pathname = '/designer/product_template/index.htm';
                                hash = '#firstCatalogId='+ record.data.firstCatalogId
                                    +'&secondCatalogId='+record.data.secondCatalogId
                                    +'&code='+record.data.targetObjectCode
                                    +'&id='+record.data.fullPath;
                                break;
                            case '04' :
                                pathname = '/configurator/product/index.htm';
                                hash = '#code=' + record.data.targetObjectCode + '&' + 'path=' + record.data.fullPath;
                                break;
                        }
                        protocol = (location.host.substr(0,5) === location.protocol) ? '' : location.protocol + '//';

                        window.open(protocol + location.host + pathname + hash, '_blank');

                    }
                }
            }
        });
        grid.setData(data);
    });
}
