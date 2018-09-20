/**
 * multi language java script
 * @author Product Factory Team
 * @version $$id: main.js, v 0.1 $$
 */
$(function() {
    renderMultiLanguageList();                         // 메인화면 초기세팅

    if(writeYn != 'Y'){
        $('.write-btn').hide();
    }
});


$('body').css('overflow-y','scroll');
var $el = $('.pf-crm');
var onEvent = PFUtil.makeEventBinder($el);
var lengthVlad = PFValidation.realTimeLengthCheck($('body'));
lengthVlad('.task-valid-100',100);
PFComponent.toolTip($el);

var multiLanguageListTpl = getTemplate('multiLanguageListTpl');

var multiLanguageListGrid;

var selectedCellIndex;

var deleteList = [];
/******************************************************************************************************************
 * 사용자 함수
 ******************************************************************************************************************/
// 메인화면 초기세팅
function renderMultiLanguageList(){

    $('.pf-page-conts').html(multiLanguageListTpl());
    renderComboBox("multiLanguageTypeDscd", $('.item-dscd'),null, true);
    renderComboBox("LanguageCode", $('.lang-dscd'),null, true);
    multiLanguageListGrid = renderMultiLanguageGrid();
}


/******************************************************************************************************************
 * 이벤트 함수
 ******************************************************************************************************************/
//조회버튼
onEvent('click', '.multi-language-list-inquiry-btn', function (e) {
    searchMultiLanguage();
});

//추가버튼
onEvent('click', '.multi-language-add-btn', function() {
    var newData = {
        applyStartDt : PFUtil.getNextDate() + ' ' + '00:00:00',
        applyEndDt : '9999-12-31 23:59:59',
        process : 'C'
    };
    multiLanguageListGrid.addData(newData);

});


//행복사버튼
onEvent('click', '.copy-row-btn', function() {
    var newData = multiLanguageListGrid.getSelectedItem()[0];
    // OHS 2016.10.26 undefined script error 방지
    if(!newData) return;
    var tempProcess = newData.process;
    newData.process = 'C';
    var index = multiLanguageListGrid.store.indexOf(multiLanguageListGrid.getSelectedRecords()[0]);
    multiLanguageListGrid.store.insert(index+1, newData);
    multiLanguageListGrid.selectRow(index+1);
    newData.process = tempProcess;

});

//초기화버튼
onEvent('click', '.grid-reset-btn', function() {
    PFComponent.makeYGForm($('.pf-multi-language-list-form')).reset();
    deleteList = [];
    multiLanguageListGrid.resetData();
});

//저장버튼
onEvent('click', '.multi-language-save-btn', function() {
    var gridData = multiLanguageListGrid.getAllData();

    var requestParam = {};
    gridData = gridData.concat(deleteList);
    requestParam['voList'] = gridData.concat(deleteList);

    // grid data가 없으면 저장하지않음.
    if(!gridData || gridData.length < 1) {
        PFComponent.showMessage(bxMsg('nothingToSave'), 'warning');
        return;
    }

    PFRequest.post('/multilanguage/saveMultilanguage.json', requestParam, {
        success: function(responseData) {
    		var gridData = multiLanguageListGrid.getAllData();

    		if(gridData !== undefined){
	            for (var i = 0; i < gridData.length; i++) {

	            	gridData[i].process = null

				}
        	}

    		deleteList = [];

            PFComponent.showMessage(bxMsg('workSuccess'), 'success');
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'MultiLanguageItemManagementMasterService',
            operation: 'saveMultiLanguageItemManagementMaster'
        }
    });
});


function searchMultiLanguage(){
    var requestParam = PFComponent.makeYGForm($('.pf-multi-language-list-form')).getData();

    if((requestParam.itemDscd === null || requestParam.itemDscd === "") && (requestParam.languageDscd === null || requestParam.languageDscd === "")){
    	PFComponent.showMessage(bxMsg('searchCndValid'), 'warning');
    	return;
    }


    PFRequest.get('/multilanguage/getListMultilanguage.json', requestParam, {
        success: function(responseData) {

        	deleteList = [];
            multiLanguageListGrid.setData(responseData);

        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'MultiLanguageItemManagementMasterService',
            operation: 'queryListMultiLanguageItemManagementMaster'
        }
    });
}

/**
 * 그리드
 */
function renderMultiLanguageGrid(){
    var grid = PFComponent.makeExtJSGrid({
        pageAble: true,
        fields: ['itemDscd', 'itemKeyValue','languageDscd','itemValue', 'applyStartDt', 'applyEndDt', 'lastModifier', 'gmtLastModify', 'process'],
        gridConfig: {
            renderTo: '.multi-language-grid',
            columns: [
                {text: bxMsg('itemDscd'), flex: 1, dataIndex: 'itemDscd',
                    renderer: function(value) {
                        return codeMapObj.multiLanguageTypeDscd[value] || value;
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
                            data: codeArrayObj['multiLanguageTypeDscd']
                        })
                    }
                },
                {text: bxMsg('itemKeyValue'), flex: 1, dataIndex: 'itemKeyValue',
                    editor: {

                    }
                },
                {text: bxMsg('DPS0113String2'), flex: 1, dataIndex: 'languageDscd',
                    renderer: function(value) {
                        return codeMapObj.LanguageCode[value] || value;
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
                            data: codeArrayObj['LanguageCode']
                        })
                    }
                },
                {text: bxMsg('itemValue'), flex: 1, dataIndex: 'itemValue',
                    editor: {

                    }
                },
                {text: bxMsg('DPP0127String6'), flex: 1, dataIndex: 'applyStartDt',
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
                {text: bxMsg('DPP0127String7'), flex: 1, dataIndex: 'applyEndDt',
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
                            if(editor.record.data.process !== 'C'
                                && (editor.field == 'itemDscd' ||
                                editor.field == 'itemKeyValue' ||
                                editor.field == 'languageDscd' ||
                                editor.field == 'applyStartDt')) {
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