/**
 * product relation java script
 * @author Product Factory Team
 * @version $$id: main.js, v 0.1 $$
 */
$(function() {
    renderProductRelationList();                         // 메인화면 초기세팅

    if(writeYn != 'Y'){
        $('.write-btn').hide();
    }
});


$('body').css('overflow-y','scroll');
var $el = $('.pf-cp');
var onEvent = PFUtil.makeEventBinder($el);
var lengthVlad = PFValidation.realTimeLengthCheck($('body'));
lengthVlad('.task-valid-100',100);
PFComponent.toolTip($el);

var productRelationListTpl = getTemplate('productRelationListTpl');
var productRelationListGrid;

var selectedCellIndex;

var deleteList = [];
/******************************************************************************************************************
 * 사용자 함수
 ******************************************************************************************************************/
// 메인화면 초기세팅
function renderProductRelationList(){

    $('.pf-page-conts').html(productRelationListTpl());

    renderComboBox("PdInfoDscd", $('.pd-info-dscd'),'01', true);

    PFUtil.getDatePicker();
    // $('.base-date').val(PFUtil.getToday());

    productRelationListGrid = renderProductRelationListGrid();

    searchProductRelation();
}


/******************************************************************************************************************
 * 이벤트 함수
 ******************************************************************************************************************/
//조회버튼
onEvent('click', '.product-relation-list-inquiry-btn', function (e) {
    searchProductRelation();
});

//추가버튼
onEvent('click', '.product-relation-add-btn', function() {
    var newData = {
        process : 'C',
        dtlExstncYn : 'Y',
        fieldList : []
    };
    productRelationListGrid.addData(newData);

});


//행복사버튼
onEvent('click', '.copy-row-btn', function() {
    var newData = productRelationListGrid.getSelectedItem()[0];
    if(!newData) return;
    var tempProcess = newData.process;
    newData.process = 'C';
    var index = productRelationListGrid.store.indexOf(productRelationListGrid.getSelectedRecords()[0]);
    productRelationListGrid.store.insert(index+1, newData);
    productRelationListGrid.selectRow(index+1);
    newData.process = tempProcess;

});

//초기화버튼
onEvent('click', '.grid-reset-btn', function() {
    PFComponent.makeYGForm($('.pf-product-relation-list-form')).reset();
    $('.pd-info-dscd').val('01');
    productRelationListGrid.resetData();

});

//저장버튼
onEvent('click', '.product-relation-save-btn', function() {
    var gridData = productRelationListGrid.getAllData();
    var requestParam = {};


    var updatList =  $.grep(deleteList.concat(gridData), function(el, i){
        return  el.process != null && el.process != '';
    });
    
    if(!updatList || updatList.length < 1) {
        PFComponent.showMessage(bxMsg('nothingToSave'), 'warning');
        return;
    }

    requestParam['voList'] = updatList;

    PFRequest.post('/common/relation/savePdRelationConfiguration.json', requestParam, {
        success: function(responseData) {
            PFComponent.showMessage(bxMsg('workSuccess'), 'success');
            searchProductRelation();
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'PdRelationConfigurationService',
            operation: 'savePdRelationConfiguration'
        }
    });
});


function searchProductRelation(){
    var requestParam = PFComponent.makeYGForm($('.pf-product-relation-list-form')).getData();

    if((requestParam.itemValue === null || requestParam.itemValue === "") && (requestParam.itemKeyValue === null || requestParam.itemKeyValue === "")){
    	PFComponent.showMessage(bxMsg('searchCndValid'), 'warning');
    	return;
    }


    PFRequest.get('/common/relation/getListPdRelationConfiguration.json', requestParam, {
        success: function(responseData) {

            productRelationListGrid.setData(responseData);
            deleteList = [];

        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'PdRelationConfigurationService',
            operation: 'getListPdRelationConfiguration'
        }
    });
}

/**
 * 그리드
 */
function renderProductRelationListGrid(){
    var grid = PFComponent.makeExtJSGrid({
        pageAble: true,
        fields: [
             'pdInfoDscd','relTpCd', 'relTpNm', 'inqrySeq', 'useYn','dtlExstncYn', 'fieldList', 'process',
             {
	            name: 'useYnB',
	            convert: function (newValue, record) {
	               if (record.get('useYn') == 'Y') {
	                   return true;
	                }
	                return false;
	             }
	         },
	         {
		            name: 'dtlExstncYnB',
		            convert: function (newValue, record) {
		               if (record.get('dtlExstncYn') == 'Y') {
		                   return true;
		                }
		                return false;
		             }
		         }
         ],
        gridConfig: {
            renderTo: '.product-relation-grid',
            columns: [
				// 상품정보구분코드
                {text: bxMsg('pdInfoDscd'), flex: 1, dataIndex: 'pdInfoDscd',
                    renderer: function(value) {
                        return codeMapObj.PdInfoDscd[value] || value;
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
                            data: codeArrayObj['PdInfoDscd']
                        })
                    }
                },
                // 관계유형코드
                {text: bxMsg('relationTypeCode'), flex: 1, dataIndex: 'relTpCd',editor: {}},

                // 관계유형명
                {text: bxMsg('relationTypeName'), flex: 2, dataIndex: 'relTpNm',editor: {}},

                // 조회순서
                {text: bxMsg('inquirysequence'), flex: 1, dataIndex: 'inqrySeq',editor: {}},

                // 사용여부
				{xtype: 'checkcolumn', text: bxMsg('PAS0301String4'), width: 60, dataIndex: 'useYnB',
                    listeners: {
                        checkchange: function(column, rowIndex, checked, eOpts) {
                        	if(checked){
                                grid.store.getAt(rowIndex).set('useYn', 'Y');
                            }else{
                                grid.store.getAt(rowIndex).set('useYn', 'N');
                            }
                            if(grid.store.getAt(rowIndex).get('process') != 'C'){
                                grid.store.getAt(rowIndex).set('process', 'U');
                            }
                        }
                    }
                },
                // 상세정보
				{xtype: 'checkcolumn', text: bxMsg('detailInfo'), width: 60, dataIndex: 'dtlExstncYnB', disabled:true,
                    listeners: {
                        checkchange: function(column, rowIndex, checked, eOpts) {
                        	if(checked){
                                grid.store.getAt(rowIndex).set('dtlExstncYn', 'Y');
                            }else{
                                grid.store.getAt(rowIndex).set('dtlExstncYn', 'N');
                            }
                            if(grid.store.getAt(rowIndex).get('process') != 'C'){
                                grid.store.getAt(rowIndex).set('process', 'U');
                            }
                        }
                    }
                },
				{	// edit 버튼
                    xtype: 'actioncolumn', width: 35, align: 'center',
                    renderer: function(value, p, record) {

                    	if(record.get('dtlExstncYn') == 'Y'){
                        	// renderConditionGroupDetailInfoManagerPopup(record, data, _this, rowIndex);
                        }else{
//                        	item.disable(); //ld = true;
                        }
                        // return codeMapObj.PdInfoDscd[value] || value;
                    },
                    items: [{
                        icon: '/images/edit-icon30.png',
                        handler: function (_this, rowIndex, colIndex, item, e, record) {
                            if(record.get('dtlExstncYn') == 'Y'){
                            	renderPdRelationConfigDetailPopup(record);
                            }else{
                            	// 기본관계정보는 삭제할 수 없습니다.
                        		PFComponent.showMessage(bxMsg('dontdeleteBaseRelation'), 'warning');
                            }
                        }
                    }]
                },
                {   // delete row
                    xtype: 'actioncolumn', width: 35, align: 'center', sortable: false,
                    items: [{
                        icon: '/images/x-delete-16.png',
                        handler: function (grid, rowIndex, colIndex, item, e, record) {
                        	if(record.get('dtlExstncYn') == 'Y'){
	                            if(record.data.process != 'C') {
	                                record.data.process = 'D';
	                                deleteList.push(record.data);
	                            }
	                            record.destroy();
                        	}else{
                        		// 기본관계정보는 삭제할 수 없습니다.
                        		PFComponent.showMessage(bxMsg('dontdeleteBaseRelation'), 'warning');
                        	}
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
                            if(editor.field === 'relTpCd' && editor.record.get('process') !== 'C') {
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

