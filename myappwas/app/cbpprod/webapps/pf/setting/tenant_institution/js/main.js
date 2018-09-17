/**
 * tenant institution java script
 * @author Product Factory Team
 * @version $$id: main.js, v 0.1 $$
 */
$(function() {
    renderTenantInstitutionList();                         // 메인화면 초기세팅

    if(writeYn != 'Y'){
        $('.write-btn').hide();
    }
});


$('body').css('overflow-y','scroll');
var $el = $('.pf-tnt-inst');
var onEvent = PFUtil.makeEventBinder($el);
var lengthVlad = PFValidation.realTimeLengthCheck($('body'));
lengthVlad('.task-valid-100',100);

var tenantInstitutionListTpl = getTemplate('tenantInstitutionListTpl');

var tenantInstitutionListGrid;

var selectedCellIndex;

var deleteList = [];
/******************************************************************************************************************
 * 사용자 함수
 ******************************************************************************************************************/
// 메인화면 초기세팅
function renderTenantInstitutionList(){

    $('.pf-page-conts').html(tenantInstitutionListTpl());
    tenantInstitutionListGrid = renderTenantInstitutionGrid();
    PFComponent.toolTip($el);

    // 2017.01.03 화면 로딩시 전체조회
    searchTenantInstitution();
}


/******************************************************************************************************************
 * 이벤트 함수
 ******************************************************************************************************************/
//조회버튼
onEvent('click', '.tenant-institution-list-inquiry-btn', function (e) {
    searchTenantInstitution();
});

//추가버튼
onEvent('click', '.tenant-institution-add-btn', function() {
    var newData = {
        process : 'C'
    };
    tenantInstitutionListGrid.addData(newData);

});


//행복사버튼
onEvent('click', '.copy-row-btn', function() {
    var newData = tenantInstitutionListGrid.getSelectedItem()[0];
    // OHS 2016.10.26 undefined script error 방지
    if(!newData) return;
    var tempProcess = newData.process;
    newData.process = 'C';
    tenantInstitutionListGrid.copyRow(newData);
    newData.process = tempProcess;

});

//초기화버튼
onEvent('click', '.grid-reset-btn', function() {
    PFComponent.makeYGForm($('.pf-tenant-institution-list-form')).reset();
    tenantInstitutionListGrid.resetData();
});

//저장버튼
onEvent('click', '.tenant-institution-save-btn', function() {
    var gridData = tenantInstitutionListGrid.getAllData();
    var requestParam = {};
    requestParam['voList'] = gridData.concat(deleteList);

    if(!requestParam['voList'] || requestParam['voList'].length < 1) {
        PFComponent.showMessage(bxMsg('nothingToSave'), 'warning');
        return;
    }
    PFRequest.post('/tenantinstitution/saveTenantInstitution.json', requestParam, {
        success: function(responseData) {
            PFComponent.showMessage(bxMsg('workSuccess'), 'success');
            searchTenantInstitution();
            
            // 2018.01.31 저장 성공하면 deleteList 초기화
            deleteList.splice(0, deleteList.length);
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'TenantInstitutionService',
            operation: 'saveTenantInstitution'
        }
    });
});


function searchTenantInstitution(){
    var tntInstId = $('.tntInstId').val().split(' ').join('');
    var mthrTntInstId = $('.mthrTntInstId').val().split(' ').join('');
    var requestParam = PFComponent.makeYGForm($('.pf-tenant-institution-list-form')).getData();
    requestParam.tntInstId = tntInstId;
    requestParam.mthrTntInstId = mthrTntInstId;

    if($('.pf-tenant-institution-list-form .tntInstId').val() == '') {
        requestParam.tntInstId = 'TNT_INST_ALL_QUERY';
    }

    PFRequest.get('/tenantinstitution/getListTenantInstitution.json', requestParam, {
        success: function(responseData) {
            tenantInstitutionListGrid.setData(responseData);
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'TenantInstitutionService',
            operation: 'getListTenantInstitution'
        }
    });
}

/**
 * 그리드
 */
function renderTenantInstitutionGrid(){
    var grid = PFComponent.makeExtJSGrid({
        pageAble: true,
        fields: ['tntInstId', 'tntInstNm','mthrTntInstId','mthrYn', 'inqrySeq',
             {
                name: 'mthrYnB',
                convert: function (newValue, record) {
                    if (record.get('mthrYn') == 'Y') {
                        return true;
                    }
                    return false;
                }
            }, 'lastModifier', 'gmtLastModify', 'process'],
        gridConfig: {
            renderTo: '.tenant-institution-grid',
            columns: [
                {text: bxMsg('tntInstId'), flex: 1, dataIndex: 'tntInstId',
                    editor: {}
                },
                {text: bxMsg('tntInstNm'), flex: 1, dataIndex: 'tntInstNm',
                    editor: {}
                },
                {text: bxMsg('mthrTntInstId'), flex: 1, dataIndex: 'mthrTntInstId',
                    editor: {}
                },
                {xtype: 'checkcolumn', text: bxMsg('mthrYn'), flex:1, dataIndex: 'mthrYnB',
                    listeners: {
                        checkchange: function(column, rowIndex, checked, eOpts){

                            if(checked){
                                grid.store.getAt(rowIndex).set('mthrYn', 'Y');
                            }
                            else{
                                grid.store.getAt(rowIndex).set('mthrYn', 'N');
                            }
                        }
                }},
                {text: bxMsg('inqrySeq'), width: 60, align: 'center', dataIndex: 'inqrySeq',
                    editor: {
                      xtype: "numberfield"
                    }
                },
                // delete row
                {
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
                            // 'C'가 아니면 PK인 tntInstId는 수정불가
                            if(editor.record.data.process !== 'C'
                                && (editor.field == 'tntInstId')) {
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