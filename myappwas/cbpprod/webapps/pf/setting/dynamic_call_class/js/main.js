/**
 * dynamic call class java script
 * @author Product Factory Team
 * @version $$id: main.js, v 0.1 $$
 */
$(function() {
    renderDynamicCallClassList();                         // 메인화면 초기세팅

    if(writeYn != 'Y'){
        $('.write-btn').hide();
    }
});


$('body').css('overflow-y','scroll');
var $el = $('.pf-cd');
var onEvent = PFUtil.makeEventBinder($el);
var lengthVlad = PFValidation.realTimeLengthCheck($('body'));
lengthVlad('.task-valid-100',100);
PFComponent.toolTip($el);

var dynamicCallClassListTpl = getTemplate('dynamicCallClassListTpl');

var dynamicCallClassListGrid;

var selectedCellIndex;

var deleteList = [];
/******************************************************************************************************************
 * 사용자 함수
 ******************************************************************************************************************/
// 메인화면 초기세팅
function renderDynamicCallClassList(){

    $('.pf-page-conts').html(dynamicCallClassListTpl());

    renderComboBox("ClassUsageDscd", $('.class-usage-dscd'),'01', true);

    PFUtil.getDatePicker();
    $('.base-date').val(PFUtil.getToday());


    dynamicCallClassListGrid = renderDynamicCallClassListGrid();

    searchDynamicCallClass();
}


/******************************************************************************************************************
 * 이벤트 함수
 ******************************************************************************************************************/
//조회버튼
onEvent('click', '.dynamic-call-class-list-inquiry-btn', function (e) {
    searchDynamicCallClass();
});

//추가버튼
onEvent('click', '.dynamic-call-class-add-btn', function() {
    var newData = {
    	applyStartDate : PFUtil.getNextDate() + ' ' + '00:00:00',
    	applyEndDate : '9999-12-31 23:59:59',
        process : 'C'
    };
    dynamicCallClassListGrid.addData(newData);

});


//행복사버튼
onEvent('click', '.copy-row-btn', function() {
    var newData = dynamicCallClassListGrid.getSelectedItem()[0];
    // OHS 2016.10.26 undefined script error 방지
    if(!newData) return;
    var tempProcess = newData.process;
    newData.process = 'C';
    delete newData.classId;
    var index = dynamicCallClassListGrid.store.indexOf(dynamicCallClassListGrid.getSelectedRecords()[0]);
    dynamicCallClassListGrid.store.insert(index+1, newData);
    dynamicCallClassListGrid.selectRow(index+1);
    newData.process = tempProcess;

});

//초기화버튼
onEvent('click', '.grid-reset-btn', function() {
    PFComponent.makeYGForm($('.pf-dynamic-call-class-list-form')).reset();
    $('.class-usage-dscd').val('01');
    dynamicCallClassListGrid.resetData();
    $('.base-date').val(PFUtil.getToday());
});

//저장버튼
onEvent('click', '.dynamic-call-class-save-btn', function() {
    var gridData = dynamicCallClassListGrid.getAllData();

    var voList =  $.grep(deleteList.concat(gridData), function(el, i){
        return  el.process != null && el.process != '';
    });
    
    // grid data가 없으면 저장하지않음.
    if(!voList || voList.length < 1) {
        PFComponent.showMessage(bxMsg('nothingToSave'), 'warning');
        return;
    }

    var requestParam = {};
    requestParam['voList'] = voList;

    PFRequest.post('/common/dynamic/saveDynamicCallClass.json', requestParam, {
        success: function(responseData) {
            PFComponent.showMessage(bxMsg('workSuccess'), 'success');
            searchDynamicCallClass();
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'DynamicCallClassService',
            operation: 'saveDynamicCallClass'
        }
    });
});


function searchDynamicCallClass(){
    var requestParam = PFComponent.makeYGForm($('.pf-dynamic-call-class-list-form')).getData();

    if((requestParam.itemValue === null || requestParam.itemValue === "") && (requestParam.itemKeyValue === null || requestParam.itemKeyValue === "")){
    	PFComponent.showMessage(bxMsg('searchCndValid'), 'warning');
    	return;
    }


    PFRequest.get('/common/dynamic/getListDynamicCallClass.json', requestParam, {
        success: function(responseData) {

            dynamicCallClassListGrid.setData(responseData);

        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'DynamicCallClassService',
            operation: 'getListDynamicCallClass'
        }
    });
}

/**
 * 그리드
 */
function renderDynamicCallClassListGrid(){
    var grid = PFComponent.makeExtJSGrid({
        pageAble: true,
        fields: ['classId', 'applyStartDate', 'applyEndDate', 'classUsageDscd', 'classCntnt', 'beanNm', 'classNm', 'lastModifier', 'gmtLastModify', 'process'],
        gridConfig: {
            renderTo: '.dynamic-call-class-grid',
            columns: [
                // 검증ID
//				{text: bxMsg('classId'), flex: 1, dataIndex: 'classId',
//				    editor: {
//
//				    }
//				},

				// 용도구분
                {text: bxMsg('useDistinction'), flex: 1, dataIndex: 'classUsageDscd',
                    renderer: function(value) {
                        return codeMapObj.ClassUsageDscd[value] || value;
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
                            data: codeArrayObj['ClassUsageDscd']
                        })
                    }
                },
                // 클래스명
                {text: bxMsg('classNm'), flex: 2, dataIndex: 'classNm',editor: {}},

                // 빈명
                {text: bxMsg('beanName'), flex: 3, dataIndex: 'beanNm',editor: {}},

                {text: bxMsg('DPP0127String6'), flex: 2, dataIndex: 'applyStartDate',
                    editor: {
                        allowBlank: false,
                        listeners: {
                            focus: function(_this) {
                                PFUtil.getGridDateTimePicker(_this, 'applyStart', grid, selectedCellIndex, false);
                            }
                        }
                    },
                    listeners: {
                        click: function() {
                            selectedCellIndex = $(arguments[1]).parent().index();
                        }
                    }
                },
                {text: bxMsg('DPP0127String7'), flex: 2, dataIndex: 'applyEndDate',
                    editor: {
                        allowBlank: false,
                        listeners: {
                            focus: function(_this) {
                                PFUtil.getGridDateTimePicker(_this, 'applyEnd', grid, selectedCellIndex, false);
                            }
                        }
                    },
                    listeners: {
                        click: function() {
                            selectedCellIndex = $(arguments[1]).parent().index();
                        }
                    }
                },

                // 검증설명
				{text: bxMsg('classCntnt'), flex: 5, dataIndex: 'classCntnt', editor: {}},


                {   // delete row
                    xtype: 'actioncolumn', width: 35, align: 'center', sortable: false,
                    items: [{
                        icon: '/images/x-delete-16.png',
                        handler: function (grid, rowIndex, colIndex, item, e, record) {
                            if(record.data.process != 'C') {
                                record.data.process = 'D';
                                deleteList.push(record.data);
                            }
                            record.destroy();
                        }
                    }]
                }

            ],
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1,
                    listeners:{
                        afteredit: function(e, editor){
                            if(editor.originalValue !=  editor.value && editor.record.get('process') != 'C'){
                                editor.record.set('process', 'U');
                            }
                        },
                        beforeedit:function(e, editor){
                            if(editor.field == 'classId') {
                                return false;
                            }
                        }
                    }
                })
            ],
            listeners: {
                scope: this,
                itemdblclick : function(tree, record){
                }
            }
        }
    });
    return grid;
}