/**
 * data migration setting java script
 * @author Product Factory Team
 * @version $$id: main.js, v 0.1 $$
 */
$(function() {
	// 메인화면 초기세팅(데이터이행단계설정화면)
    renderMigrationStep();

    // 이행설정구분코드 세팅, default value : 데이터이행단계설정
    $('.migration-config-dscd').elementReady(function() {
    	makeComboBox('migrationConfigDscd', '.migration-config-dscd', '01');
    });
    $el.find('.pf-migration-setting-dscd-area').html(migrationStepFormTpl());
    renderMigrationStepListGrid();

    if(writeYn != 'Y'){
        $('.write-btn').hide();
    }
});

var deleteList = [];

//이행대상테이블 목록
var tables = [];
tables.push(
    {tableName:'PD_MIG_BNFT_PRVD_CND_M', logicalTableName:bxMsg('pd_mig_bnft_prvd_cnd')},
    {tableName:'PD_MIG_BNFT_RULE_M', logicalTableName:bxMsg('pd_mig_bnft_rule')},
    {tableName:'PD_MIG_CL_M', logicalTableName:bxMsg('pd_mig_cl')},
    {tableName:'PD_MIG_CND_M', logicalTableName:bxMsg('pd_mig_cnd')},
    {tableName:'PD_MIG_FEE_DC_M', logicalTableName:bxMsg('pd_mig_fee_dc')},
    {tableName:'PD_MIG_PRVD_CND_M', logicalTableName:bxMsg('pd_mig_prvd_cnd')},
    
    {tableName:'PD_MIG_CD_MAP_M', logicalTableName:bxMsg('pd_mig_cd_map_m')},
    {tableName:'PD_MIG_PD_M', logicalTableName:bxMsg('pd_mig_pd_m')},
    {tableName:'PD_MIG_PD_REL_M', logicalTableName:bxMsg('pd_mig_pd_rel_m')}
);
var tableMap = PFUtil.convertArrayToMap(tables, 'tableName', 'logicalTableName', 'table');

$('body').css('overflow-y','scroll');

var $el = $('.pf-migration-setting');
var projectTypeListTpl,migrationStepFormTpl, activitySearchPopup;

var migrationStepListGrid;
var migrationClassListGrid;
var form;

var onEvent = PFUtil.makeEventBinder($el);

// 데이터이행설정관리 메인
var migrationMainFormTpl = getTemplate('migrationMainFormTpl');
// 데이터이행단계설정
var migrationStepFormTpl = getTemplate('migrationStepFormTpl');
// 데이터이행클래스설정
var migrationClassFormTpl = getTemplate('migrationClassFormTpl');

PFComponent.toolTip($el);

/******************************************************************************************************************
 * 이벤트 함수
 ******************************************************************************************************************/
onEvent('click', 'a', function(e) { e.preventDefault(); });

// 초기화버튼 클릭시
onEvent('click','.pf-reset-form-btn',function(e) {
	PFComponent.makeYGForm($('.pf-migration-setting-dscd-area table')).reset();

	if($('.migration-config-dscd').val() == '01') {
		migrationStepListGrid.resetData();
	}
	else {
		migrationClassListGrid.resetData();
	}
});

// 조회버튼 클릭시
onEvent('click', '.pf-migration-list-inquiry-btn', function(e) {
	if($('.migration-config-dscd').val() == '01') {
		searchMigrationStepList();
	}
	else {
	    searchMigrationClassList();
	}
});

// 신규버튼 클릭시
onEvent('click', '.pf-migration-step-create-popup-btn', function(e) {
	if($('.migration-config-dscd').val() == '01') {
	    var defaultParam = {
	        "work" : "CREATE"
	    }
	    renderMigrationStepConfigDetailPopup(defaultParam);
	}
	else {
	    var newData = {
	        	applyStartDate : PFUtil.getNextDate() + ' ' + '00:00:00',
	        	applyEndDate : '9999-12-31 23:59:59',
	            process : 'C',
	            classUsageDscd : '02'
	    };
	    migrationClassListGrid.addData(newData);
	}
});

//행복사버튼
onEvent('click', '.copy-row-btn', function() {
    var newData = migrationClassListGrid.getSelectedItem()[0];
    if(!newData) return;
    var tempProcess = newData.process;
    newData.process = 'C';
    newData.classId = '';
    newData.classUsageDscd = '02';
    var index = migrationClassListGrid.store.indexOf(migrationClassListGrid.getSelectedRecords()[0]);
    migrationClassListGrid.store.insert(index+1, newData);
    migrationClassListGrid.selectRow(index+1);
    newData.process = tempProcess;

});

// 이행설정구분코드 콤보값 변경
onEvent('change', '.migration-config-dscd', function(e) {
	var value = $(e.currentTarget).val();
	// 이행설정단계구분코드
	if(value == '01') {
		$el.find('.pf-migration-setting-dscd-area').html(migrationStepFormTpl());
		$('.copy-row-btn').css('display', 'none');
		$('.migration-class-save-btn').css('display', 'none');
		renderMigrationStepListGrid();
		migrationClassListGrid = null;
	}
	else {
		$el.find('.pf-migration-setting-dscd-area').html(migrationClassFormTpl());
		$('.copy-row-btn').css('display', 'block');
		$('.migration-class-save-btn').css('display', 'block');
	    PFUtil.getDatePicker();
	    renderMigrationClassListGrid();
	    migrationStepListGrid = null;
	}
});

//저장버튼
onEvent('click', '.migration-class-save-btn', function() {
    var gridData = migrationClassListGrid.getAllData();
    var voList =  $.grep(deleteList.concat(gridData), function(el, i){
        return  el.process != null && el.process != '';
    });

    if(!voList || voList.length == 0) {
        PFComponent.showMessage(bxMsg('nothingToSave'), 'warning');
        return;
    }

    var duplicateFlag = false;
    // 중복체크
    for(var i = 0; i < gridData.length; i++) {
    	var duplicateCount = 0;
    	for(var j = 0; j < gridData.length; j++) {
    		if(gridData[i].classNm == gridData[j].classNm
    				&& gridData[i].beanNm == gridData[j].beanNm) {

    				// 구간중복체크
    				if((gridData[i].applyStartDate >= gridData[j].applyStartDate && gridData[i].applyStartDate <= gridData[j].applyEndDate)
    						|| (gridData[i].applyStartDate < gridData[j].applyStartDate && gridData[i].applyEndDate > gridData[j].applyEndDate)) {

		    			console.log("gridData[i].classNm :" + gridData[i].classNm);
		    			console.log("gridData[j].classNm :" + gridData[j].classNm);

		    			console.log("gridData[i].beanNm :" + gridData[i].beanNm);
		    			console.log("gridData[j].beanNm :" + gridData[j].beanNm);

		    			console.log("gridData[i].applyStartDate :" + gridData[i].applyStartDate);
		    			console.log("gridData[j].applyEndDate :" + gridData[j].applyEndDate);

		    			duplicateCount++;
    				}
    		}
    	}

    	if(duplicateCount > 1) {
    		duplicateFlag = true;
    	}
    }


    if(duplicateFlag) {
        PFComponent.showMessage(bxMsg('duplicateDataMigClass'), 'warning');
        return;
    }

    var voList =  $.grep(deleteList.concat(gridData), function(el, i){
        return  el.process != null && el.process != '';
    });

    var requestParam = {};
    requestParam['voList'] = voList;

    PFRequest.post('/common/dynamic/saveDynamicCallClass.json', requestParam, {
        success: function(responseData) {
            PFComponent.showMessage(bxMsg('workSuccess'), 'success');
            searchMigrationClassList();
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'DynamicCallClassService',
            operation: 'saveDynamicCallClass'
        }
    });
});

/******************************************************************************************************************
 * 사용자 함수
 ******************************************************************************************************************/

// 메인화면 초기세팅
function renderMigrationStep() {
    $('.pf-page-conts').html(migrationMainFormTpl());
}

// 데이터이행단계 목록조회
function searchMigrationStepList(){
	var requestData = PFComponent.makeYGForm($('.migration-step-query-table')).getData();
    PFRequest.get("/migrationstep/getListMigrationStep.json" , requestData, {
        success: function(responseData) {
        	migrationStepListGrid.setData(responseData);
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'MigrationStepService',
            operation: 'getListMigrationStep'
        }
    });
}

// 데이터이행클래스 목록조회
function searchMigrationClassList(){
    var requestParam = PFComponent.makeYGForm($('.migration-class-query-table')).getData();
    requestParam.classUsageDscd = '02';
    requestParam.classNm = requestParam.migrationTableName;

    PFRequest.get('/common/dynamic/getListDynamicCallClass.json', requestParam, {
        success: function(responseData) {
        	deleteList = [];
        	migrationClassListGrid.setData(responseData);
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'DynamicCallClassService',
            operation: 'getListDynamicCallClass'
        }
    });
}

/******************************************************************************************************************
 * Rendering 그리드
 ******************************************************************************************************************/
function renderMigrationStepListGrid() {
	$('.pf-migration-setting-list-grid').empty();
    migrationStepListGrid = PFComponent.makeExtJSGrid({
        fields: [
            "migrationStepId", "migrationStepNm", "executeSeq",
        ],
        gridConfig: {
            renderTo: '.pf-migration-setting-list-grid',
            columns: [
                {text: bxMsg('migrationStepId'), flex:  1  , dataIndex: 'migrationStepId'},
                {text: bxMsg('migrationStepNm'), width: 400, dataIndex: 'migrationStepNm'},
                {text: bxMsg('executeSeq'), flex:  1  , dataIndex: 'executeSeq'}
            ],
            listeners: {
                scope: this,
                itemdblclick : function(tree, record) {
                	if(record.data) {
                		record.data.dataMigrationStepId = record.data.migrationStepId
                	}
                	// 이행단계정보 상세조회
                    PFRequest.get('/migrationstep/getMigrationStep.json',record.data,{
                        success: function(responseData){
                            responseData.work = "UPDATE";
                            renderMigrationStepConfigDetailPopup(responseData);
                        },
                        bxmHeader: {
                            application: 'PF_Factory',
                            service: 'MigrationStepService',
                            operation: 'getMigrationStep'
                        }
                    });
                },
                afterrender : function(){
                	// 초기조회
                	searchMigrationStepList();
                }
            }
        }
    });
}

/******************************************************************************************************************
 * Rendering 그리드
 ******************************************************************************************************************/
function renderMigrationClassListGrid() {
	$('.pf-migration-setting-list-grid').empty();
	migrationClassListGrid = PFComponent.makeExtJSGrid({
        pageAble: true,
        fields: ['classId', 'applyStartDate', 'applyEndDate', 'classUsageDscd', 'classCntnt', 'beanNm', 'classNm', 'lastModifier', 'gmtLastModify', 'process'],
        gridConfig: {
            renderTo: '.pf-migration-setting-list-grid',
            columns: [
                // 이행테이블
                {text: bxMsg('migrationTableName'), flex: 2, dataIndex: 'classNm',editor: {}},

                // 빈명
                {text: bxMsg('beanName'), flex: 3, dataIndex: 'beanNm',editor: {}},

                {text: bxMsg('DPP0127String6'), flex: 2, dataIndex: 'applyStartDate',
                    editor: {
                        allowBlank: false,
                        listeners: {
                            focus: function(_this) {
                                PFUtil.getGridDateTimePicker(_this, 'applyStart', migrationClassListGrid, selectedCellIndex, true);
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
                                PFUtil.getGridDateTimePicker(_this, 'applyEnd', migrationClassListGrid, selectedCellIndex, true);
                            }
                        }
                    },
                    listeners: {
                        click: function() {
                            selectedCellIndex = $(arguments[1]).parent().index();
                        }
                    }
                },

                // 이행설명
				{text: bxMsg('migTableContent'), flex: 5, dataIndex: 'classCntnt', editor: {}},


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
                },
                afterrender : function(){
                	// 초기조회
                	searchMigrationClassList();
                }
            }
        }
    });
}


/**
 * 콤보조립을 위한 함수
 * @param codeName
 * @param renderTo
 */
function makeComboBox(codeName, renderTo, defaultValue) {
	if(!codeName || !renderTo) return;

    var options = [];
    var $defaultOption = $('<option>');
    $.each(codeMapObj[codeName], function(key,value){
        var $option = $('<option>');
        $option.val(key);
        $option.text(value);

        options.push($option);
    });
    $(renderTo).html(options);

    if (defaultValue) {
    	$(renderTo).val(defaultValue);
    }
}