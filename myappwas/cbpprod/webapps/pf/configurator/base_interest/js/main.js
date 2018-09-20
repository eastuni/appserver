/**
 * base interest java script
 * @author Product Factory Team
 * @version $$id: main.js, v 0.1 $$
 */
$(function() {
    renderBaseInterestList();                         // 메인화면 초기세팅
    baseIntMngGrid = renderBaseIngMngGrid();        // 그리드 조회
    searchBaseInterest();

    if(writeYn != 'Y'){
        $('.write-btn').hide();
    }
});

$('body').css('overflow-y','scroll');

var $el = $('.pf-ci');
var baseIntListTpl;

var baseIntMngGrid;
var form;
var selectedCellIndex;
var tntInstId;
var gridDeleteData = [];
var modifyFlag = false;

var onEvent = PFUtil.makeEventBinder($el);
PFComponent.toolTip($el); // icon tooltip 적용
var lengthVlad = PFValidation.realTimeLengthCheck($('body'));

lengthVlad('.task-valid-100',100);

baseIntListTpl = getTemplate('baseIntListTpl');

/******************************************************************************************************************
 * 이벤트 함수
 ******************************************************************************************************************/

    //
onEvent('click', 'a', function(e) { e.preventDefault(); });

onEvent('change', '.pf-multi-entity', function(e){

    tntInstId = $el.find('.pf-multi-entity').val();

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

});

// 초기화버튼 클릭시
onEvent('click','.pf-reset-form-btn',function(e) {
    form.reset();
    baseIntMngGrid.resetData();

    var today =  PFUtil.getToday();
    $('.start-date').val(today);
    $('.end-date').val(today);

    var $gridFooter =  $('.grid-paging-footer');
    $gridFooter.find('span').text('');
    $gridFooter.find('.grid-page-input').val('1');

    modifyFlag = false;
});

// 조회버튼 클릭시
onEvent('click', '.base-int-list-inquiry-btn', function(e) {
    searchBaseInterest();
});

// 추가버튼 클릭시
onEvent('click', '.base-int-add-btn', function(e) {

    var applyStart = PFUtil.getNextDate() + ' ' + '00:00:00';
    var applyEnd = '9999-12-31 23:59:59';

    var newData = {
        applyStart : applyStart,
        applyEnd : applyEnd,
        isAdd : 'Y'
    };

    baseIntMngGrid.addData(newData);
    modifyFlag = true;

    $('.rel-delete-btn').prop('disabled', true);  // 삭제버튼 비활성
});

//행복사버튼
onEvent('click', '.copy-row-btn', function() {
    var param = {'isAdd' :'Y',
                 'applyStart' : PFUtil.getNextDate() + ' ' + '00:00:00' };
    baseIntMngGrid.copyRow(param);
    modifyFlag = true;
});


// 저장버튼 클릭시
onEvent('click', '.rel-save-btn', function(e) {
    saveBaseInterest();
});

// 삭제버튼 클릭시
onEvent('click', '.rel-delete-btn', function(e) {
    deleteBaseInterest();
});

/******************************************************************************************************************
 * 사용자 함수
 ******************************************************************************************************************/

// 메인화면 초기세팅
function renderBaseInterestList() {

    $('.pf-page-conts').html(baseIntListTpl());
    form = PFComponent.makeYGForm($('.base-int-query-table'));

    setTntInstComboBox();

    renderComboBox("BaseIntRtKndCode", $('.base-int-kind-code'), null, true, bxMsg('Z_All'));

    PFUtil.getDatePicker();

    var today =  PFUtil.getToday();
    $('.start-date').val(today);
    $('.end-date').val(today);

    $('.rel-delete-btn').prop('disabled', true);  // 삭제버튼 비활성

}

// 기관코드 콤보 바인딩
function setTntInstComboBox() {
    tntInstId = getLoginTntInstId();
    renderTntInstComboBox($el.find('.pf-multi-entity'), tntInstId);

    if (!getMortherYn()) {
        $el.find('.pf-multi-entity-yn').hide();
    }
}

// 조회
function searchBaseInterest(){
    var requestData = form.getData();
    requestData.applyEnd = requestData.applyEnd.split(' ')[0].concat(' 23:59:59');
    requestData.baseIntRtKndCode = $('.base-int-kind-code').val();
    requestData.tntInstId = tntInstId;

    loadGridData(baseIntMngGrid,requestData);
    modifyFlag = false;
}

// 그리드데이터 Load
function loadGridData(grid, data) {
    var option = {
        'isReset' : true,
        bxmHeader: {
            application: 'PF_Factory',
            service: 'BaseInterestMasterService',
            operation: 'queryListBaseInterestMaster'
        }
    };

    grid.loadData(data,option);
    $('.rel-delete-btn').prop('disabled', false);  // 삭제버튼 활성
}


/******************************************************************************************************************
 * BIZ 함수(서비스 호출)
 ******************************************************************************************************************/

// 그리드 조회
function renderBaseIngMngGrid() {
    var grid = PFComponent.makeExtJSGrid({
        url: '/baseInterest/getBaseInterestMasterList.json',
        httpMethod: 'get',
        //pageAble: true,
        //paging: true,
        //pageSize: 14,
        fields: [
            "checked", "baseIntRtKndCode","currencyCode","applyStart","applyEnd", "baseInterest", "isAdd", "isUpdate"
        ],
        //dataRoot: 'list',
        gridConfig: {
            renderTo: '.pf-ci-base-int-list-grid',
            columns: [
                // 선택
                {
                    xtype: 'checkcolumn',
                    text: bxMsg('DPS0121_21String4'),
                    align: 'center',
                    width: 40,
                    sortable: false,
                    dataIndex: 'checked'
                },

                // 기준금리종류
                {text: bxMsg('BaseInterestKind'),  flex:1.5, dataIndex: 'baseIntRtKndCode', style: 'text-align:center',
                    renderer: function(value) {
                        return codeMapObj.BaseIntRtKndCode[value] || value;
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
                            data: codeArrayObj['BaseIntRtKndCode']
                        })
                    }},

                // 통화
                {text: bxMsg('currencyCode'),  flex:0.5, dataIndex: 'currencyCode', style: 'text-align:center',
                    renderer: function(value) {
                        return value;//codeMapObj.CurrencyCode[value] || value;
                    },
                    editor: {
                        xtype: 'combo',
                        typeAhead: true,
                        triggerAction: 'all',
                        displayField: 'code',
                        valueField: 'code',
                        editable: false,
                        store: new Ext.data.Store({
                            fields: ['code', 'name'],
                            data: codeArrayObj['CurrencyCode']
                        })
                    }},

                // 적용시작일자
                {text: bxMsg('DPP0127String6'), flex:1,dataIndex:'applyStart', align: 'center',
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
                {text: bxMsg('DPP0127String7'), flex:1, dataIndex:'applyEnd', align: 'center',
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

                // 기준금리
                {
                    text: bxMsg('baseInterest'),
                    flex: 1,
                    dataIndex: 'baseInterest',
                    sortable: false,
                    editor:{allowBlank:false},
                    style: 'text-align:center',
                    align: 'right',
                    renderer: function(value, metadata, record) {
                        //return PFValidation.gridFloatCheckRenderer(value, 19, 2);
                    	// OHS 20171213 수정 - DECIMAL 11, 8에 맞게 수정
                    	return PFValidation.gridFloatCheckRenderer(value, 3, 8);
                    },
                    // OHS 20171213 추가
                    editor: {
                        xtype: 'textfield',
                        allowBlank: false,
                        selectOnFocus: true,
                        listeners: {
                            'render': function (cmp) {
                                cmp.getEl()
                                    .on('keydown', function (e) {
                                    	PFValidation.gridFloatCheckKeydown(e, 3, 8);
                                    })
                                    .on('keyup', function (e) {
                                    	PFValidation.gridFloatCheckKeyup(e, 3, 8);
                                    })
                            }
                        }
                    }
                }
            ],
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1,
                    listeners:{
                        beforeedit:function(e, editor){

                            var projectId = getSelectedProjectId();
                            if( projectId && (isEmergency(projectId) || isUpdateStatus(projectId)) ){
                                // emergency 일때는 모두 수정 가능
                            }
                            else if(editor.record.data.isAdd !== 'Y'
                                && (editor.field == 'baseIntRtKndCode' ||
                                    editor.field == 'currencyCode'     ||
                                    editor.field == 'applyStart'       ||
                                    editor.field == 'baseInterest')) {
                                return false;
                            }
                        },
                        afteredit: function(e, editor){
                            if(editor.originalValue !=  editor.value){
                                if(editor.field != 'applyEnd' && (editor.record.get('isAdd') == null || editor.record.get('isAdd') == '')){
                                    var originalData = $.extend(true, {}, editor.record.data);
                                    originalData[editor.field] = editor.record.modified[editor.field];
                                    gridDeleteData.push(originalData);      // 삭제 후
                                    editor.record.set('isAdd', 'Y');        // 추가
                                }else{
                                    editor.record.set('isUpdate', 'Y');
                                }
                            }
                        }
                    }
                })
            ]
        }
    });

    return grid;
}

// 그리드 저장
function saveBaseInterest(){

    var voList = [];
    baseIntMngGrid.getAllData().forEach(function(el){
        if(el.isUpdate == 'Y' || el.isAdd == 'Y') {
            delete el.isUpdate;
            voList.push(el);
        }
    });

    // grid data가 없으면 저장하지않음.
    if((!gridDeleteData || gridDeleteData.length < 1)
    		&& (!voList || voList.length < 1)) {
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

    // 삭제된 데이터가 있으면 삭제 호출
    if(gridDeleteData && gridDeleteData.length > 0){
        deleteBaseInterest(gridDeleteData);
    }

    var requestData = {
        projectId : projectId,
        tntInstId : tntInstId,
        voList : voList
    }

    PFRequest.post('/baseInterest/saveBaseInterestMaster.json', requestData, {
        success: function(responseData) {
            if (responseData === true) {
                PFComponent.showMessage(bxMsg('workSuccess'), 'success');
                modifyFlag = false;
                searchBaseInterest();
            }
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'BaseInterestMasterService',
            operation: 'saveBaseInterestMaster'
        }
    });
}

// 삭제
function deleteBaseInterest(gridDeleteData){

    var voList = [];
    if(gridDeleteData){
        voList = gridDeleteData;
    }else{
        baseIntMngGrid.getAllData().forEach(function(el){
            if(el.checked) {
                voList.push(el);
            }
        });
    }

    // grid data가 없으면 삭제하지않음.
    if(!voList || voList.length < 1) {
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

    var requestData = {
        projectId : projectId,
        tntInstId: tntInstId,
        voList : voList
    }

    PFRequest.post('/baseInterest/deleteBaseInterestMaster.json', requestData, {
        success: function(responseData) {
            if (responseData === true) {
                PFComponent.showMessage(bxMsg('workSuccess'), 'success');
                modifyFlag = false;
                searchBaseInterest();
                gridDeleteData = [];
            }
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'BaseInterestMasterService',
            operation: 'deleteBaseInterestMaster'
        }
    });
}