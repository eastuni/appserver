/**
 * numbering java script
 * @author Product Factory Team
 * @version $$id: main.js, v 0.1 $$
 */
$(function() {
    renderNumberingList(); // 메인화면 초기세팅
    PFComponent.toolTip($el); // icon tooltip 적용
    if(writeYn != 'Y'){
        $('.write-btn').hide();
    }
});


$('body').css('overflow-y','scroll');
var $el = $('.pf-nbrg');
var onEvent = PFUtil.makeEventBinder($el);
var lengthVlad = PFValidation.realTimeLengthCheck($('body'));
lengthVlad('.task-valid-100',100);


var numberingListTpl = getTemplate('numberingListTpl');

var numberingListGrid;
var numberingDigitGrid;

var deleteList = [];
var deleteTotDigitCntPopupList = [];
var deletePreFixPopupList = []; // 참조키설정 삭제대상

var dscdComboDatas = []; // 구분코드 조회데이터(콤보조립) - 기관코드별 구분코드 조회 (공통코드)
var dscdMapDatas = {};
/******************************************************************************************************************
 * 사용자 함수
 ******************************************************************************************************************/
// 메인화면 초기세팅
function renderNumberingList(){
    $('.pf-page-conts').html(numberingListTpl());

    // 1. 기관코드 Distinct 조회 후 콤보조립
    //searchDistinctTntInstId();
    renderTntInstComboBox($el.find('.tntInstId'), getLoginTntInstId());
    // 2. 기관별 dscd 조회 후 콤보조립
    searchDistinctDscdByTntInstId();
    // 3. 그리드
    numberingListGrid = renderNumberingGrid();
    // 2017.01.03 화면로딩시 조회
    searchNumbering();
}

/**
 * Distinct 기관코드 조회
 */
function searchDistinctTntInstId(){
    var requestParam = PFComponent.makeYGForm($('.pf-numbering-list-form')).getData();
    PFRequest.get('/tenantinstitution/getListDistinctTenantInstitution.json', requestParam, {
        success: function(responseData) {
            // 기관코드 콤보 조립
            var options = [];
            if (responseData) {
                $.each(responseData, function (index, data) {
                    var $option = $('<option>');
                    $option.val(data.tntInstId);
                    $option.text(data.tntInstId);
                    options.push($option);
                });
            }
            $('.tntInstId').html(options);

            var loginTntInstId = getLoginTntInstId();
            if(loginTntInstId) {
                $('.tntInstId').val(loginTntInstId);
            }
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'TenantInstitutionService',
            operation: 'getListDistinctTenantInstitution'
        }
    });
}

/**
 * 기관코드 별 NBRG_OBJ_DSCD[채번대상구분코드] 조회
 */
function searchDistinctDscdByTntInstId(){
	// TODO : 현재 화면에서 기관코드를 선택할 수 있어 기관코드별 공통코드 조회를 하고있음.
	// 만약 공통코드 변경가능성이 있다면 현재기관의 채번규칙만 조회하고 채번대상구분코드는 조회된 공통코드정보를 가지고 세팅해야함.
    var requestParam = {
        tntInstId : $('.tntInstId').val() == null ? getLoginTntInstId() : $('.tntInstId').val(),
        domainCode: 'P0095'
    }
    PFRequest.get('/commonCode/getCommonCodeDetailList.json',requestParam, {
        success: function(responseData) {

            var option = [];
            var $option = $('<option>');
            $option.val('');
            $option.text(bxMsg('Z_All'));
            option.push($option);

            if (responseData) {
                $.each(responseData, function (index, data) {

                    if (data.activeYn == 'Y') {
                        var $option = $('<option>');
                        $option.val(data.instanceCode);
                        $option.text(data.instanceName);
                        option.push($option);

                        var dscdComboData = {
                            'dscd': data.instanceCode,
                            'dscdNm' : data.instanceName
                        }

                        dscdComboDatas.push(dscdComboData);
                        dscdMapDatas[data.instanceCode] = dscdComboData;
                    }
                });
            }
            $('.dscd').html(option);
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'CommonCodeDetailService',
            operation: 'queryListCommonCodeDetail'
        }
    });
}

/******************************************************************************************************************
 * 이벤트 함수
 ******************************************************************************************************************/
//조회버튼
onEvent('click', '.numbering-list-inquiry-btn', function (e) {
    searchNumbering();
});


/**
 * 총자릿수관리 추가버튼 클릭
 */
onEvent('click', '.numbering-add-btn', function() {
  renderNumberingAddPopup();
});

//초기화버튼
onEvent('click', '.grid-reset-btn', function() {
    PFComponent.makeYGForm($('.pf-numbering-list-form')).reset();
    numberingListGrid.resetData();
});

//저장버튼
onEvent('click', '.numbering-save-btn', function() {
    var gridData = numberingListGrid.getAllData();
    var requestParam = {};
    requestParam['voList'] = gridData.concat(deleteList);

    if(getLoginTntInstId() !== $el.find('.tntInstId').val()){
    	PFComponent.showMessage(bxMsg('numberingWriteAuthFail'), 'warning');
    	return;
    }
    
	if(!requestParam['voList'] || requestParam['voList'].length < 1) {
        PFComponent.showMessage(bxMsg('nothingToSave'), 'warning');
        return;
	}

    PFRequest.post('/numbering/saveNumbering.json', requestParam, {
        success: function(responseData) {
            PFComponent.showMessage(bxMsg('workSuccess'), 'success');
            searchNumbering();
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'NumberingService',
            operation: 'saveNumbering'
        }
    });
});

//기관콤보 변경
onEvent('change', '.tntInstId', function(){
	searchDistinctDscdByTntInstId();
});

/**
 * 채번규칙조회
 */
function searchNumbering(){
    var requestParam = PFComponent.makeYGForm($('.pf-numbering-list-form')).getData();
    PFRequest.get('/numbering/getListNumbering.json', requestParam, {
        success: function(responseData) {
            deleteList = [];
            numberingListGrid.setData(responseData);
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'NumberingService',
            operation: 'getListNumbering'
        }
    });
}

/**
 * 채번규칙 메인 그리드
 */
function renderNumberingGrid(){
    var grid = PFComponent.makeExtJSGrid({
        pageAble: true,
        fields: ['tntInstId', 'dscd','refKey','lastNbr', 'totDigitCnt', 'lastModifier', 'gmtLastModify', 'process'],
        gridConfig: {
            renderTo: '.numbering-grid',
            columns: [
                {text: bxMsg('dscd'), flex: 0.5, dataIndex: 'dscd',
                    editor: {}
                },
                {text: bxMsg('dscdNm'), flex: 1, dataIndex: 'dscd',
                    renderer: function(value) {
                        return dscdMapDatas[value] ? dscdMapDatas[value].dscdNm : value;
                    }
                },
                {text: bxMsg('refKey'), flex: 1, dataIndex: 'refKey',
                    editor: {}
                },
                {text: bxMsg('lastNbr'), flex: 1, dataIndex: 'lastNbr',
                    editor: {}
                },
                {text: bxMsg('totDigitCnt'), flex: 1, dataIndex: 'totDigitCnt',
                    editor: {maxLength:2}
                },
                // delete row
                {
                    xtype: 'actioncolumn', width: 35, align: 'center', sortable: false,
                    items: [{
                        icon: '/images/x-delete-16.png',
                        handler: function (grid, rowIndex, colIndex, item, e, record) {
                        	
                           	// 정상 삭제는 되나, 관련 데이터가 있는 경우 warning message 추가 필요. "데이터가 있는데 진짜 삭제하시겠습니까"							
                        	PFComponent.showConfirm(bxMsg('existsNbrgDataDeleteCheck'), function() {
                                if(record.data.process != 'C') {
                                    record.data.process = 'D';
                                    deleteList.push(record.data);
                                }
                                record.destroy();
                            }, function() {
                                return;
                            });
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
                        beforeedit:function(e, editor) {
                            // 'C'가 아니면 구분코드, 참조키 수정불가
                            if (editor.record.data.process !== 'C'
                                && (editor.field == 'dscd' || editor.field == 'refKey')) {
                                return false;
                            }
                            // 자릿수는 항상수정불가. 팝업을통해서만 가능
                            else if(editor.field == 'totDigitCnt') {
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
