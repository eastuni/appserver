/**
 * role user java script
 * @author Product Factory Team
 * @version $$id: main.js, v 0.1 $$
 */
$(function() {
    renderRoleUserRelList();                         // 메인화면 초기세팅

    if(writeYn != 'Y'){
        $('.write-btn').hide();
    }
});

$('body').css('overflow-y','scroll');

var $el = $('.pf-cru');
var onEvent = PFUtil.makeEventBinder($el);
var lengthVlad = PFValidation.realTimeLengthCheck($('body'));
lengthVlad('.task-valid-100',100);
PFComponent.toolTip($el);

var roleUserRelGrid;
var form;
var selectedCellIndex;                  // grid calendar
var roleObj={}, roleArrayObj;           // 그리드 콤보 바인딩을 위함
var deleteRoleList = [], deleteRoleUserList = [];

var roleUserRelListTpl;
roleUserRelListTpl = getTemplate('roleUserRelListTpl');

var modifyFlag = false;

/******************************************************************************************************************
 * 이벤트 함수
 ******************************************************************************************************************/

onEvent('click', 'a', function(e) { e.preventDefault(); });


// 초기화버튼 클릭시
onEvent('click','.pf-reset-form-btn',function(e) {
    form.reset();
    roleUserRelGrid.resetData();

    $('.start-date').val(PFUtil.getToday());
    $('.end-date').val(PFUtil.getToday());

});

// 조회버튼 클릭시
onEvent('click', '.role-user-list-inquiry-btn', function(e) {
    searchRoleUserRelList();
});

// 추가버튼 클릭시
onEvent('click', '.role-user-add-btn', function(e) {

    var newData = {
        roleId : $('.role-select').val(),
        applyStart : PFUtil.getToday() + ' ' + '00:00:00',
        applyEnd : '9999-12-31 23:59:59',
        process : 'C'               // create
    };

    roleUserRelGrid.addData(newData);
    modifyFlag = true;
});

// 저장버튼 클릭시
onEvent('click', '.role-user-save-btn', function(e) {
    saveRoleUserRel();
});

// 사용자 클릭시
onEvent('focus', '.user-id', function(e) {
	$('.user-id').blur(); // OHS20180725 - blur처리하여 팝업이 무한생성되는것을 방지
    PFPopup.selectEmployee({}, function(selectItem) {
    	if(!selectItem) {
    		$('.user-id').val('');
            $('.user-name').val('');
    	}
    	else {
    		$('.user-id').val(selectItem.staffId);
            $('.user-name').val(selectItem.staffName);
    	}
    });
});


onEvent('click', '.role-management-btn', function(e) {
    renderRoleManagementPopup();
})


/******************************************************************************************************************
 * 사용자 함수
 ******************************************************************************************************************/

// 메인화면 초기세팅
function renderRoleUserRelList() {

    $('.pf-page-conts').html(roleUserRelListTpl());
    form = PFComponent.makeYGForm($('.role-user-query-table'));

    PFUtil.getDatePicker();
    renderRoleComboBox(true);

    $('.start-date').val(PFUtil.getToday());
    $('.end-date').val(PFUtil.getToday());
}

// 역할 콤보 바인딩
function renderRoleComboBox(loadYn) {
    PFRequest.get('/common/role/getRoleMasterList.json',{
        async: false,
        success: function(response) {
            roleArrayObj = response;
            var options = [];

            var $defaultOption = $('<option>');
            $defaultOption.val('');
            $defaultOption.text(bxMsg('Z_All'));
            options.push($defaultOption);

            $.each(response, function(index, role){
                var $option = $('<option>');
                $option.val(role.roleId);
                $option.text(role.roleNm);
                options.push($option);

                roleObj[role.roleId] = role.roleNm;
            });
            $('.role-select').html(options);

            if(loadYn) {
                roleUserRelGrid = renderRoleUserRelGrid();        // 그리드 조회
            }
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'RoleMasterService',
            operation: 'queryListRoleMaster'
        }
    });
}

// 조회
function searchRoleUserRelList(){
    loadGridData(roleUserRelGrid,form.getData());
}

// 그리드데이터 Load
function loadGridData(grid, data) {
    var option = {
        'isReset' : true,
        bxmHeader: {
            application: 'PF_Factory',
            service: 'RoleUserRelationService',
            operation: 'queryListRoleUserRelation'
        }
    };

    grid.loadData(data,option);
    deleteRoleUserList = [];
    modifyFlag = false;
}


/******************************************************************************************************************
 * BIZ 함수(서비스 호출)
 ******************************************************************************************************************/

// 그리드 조회
function renderRoleUserRelGrid() {
    var grid = PFComponent.makeExtJSGrid({
        url: '/common/role/getRoleUserRelationList.json',
        httpMethod: 'get',
        fields: [
            'roleId',"staffId", "staffNm", "applyStart", "applyEnd", "process"
        ],
        //dataRoot: 'list',
        gridConfig: {
            renderTo: '.pf-cru-role-user-list-grid',
            columns: [
                // role Id
                {text: bxMsg('Role'),  flex:1, dataIndex: 'roleId', style: 'text-align:center',
                    renderer: function(value) {
                        return roleObj[value] || value;
                    },
                    editor: {
                        xtype: 'combo',
                        typeAhead: true,
                        triggerAction: 'all',
                        displayField: 'roleNm',
                        valueField: 'roleId',
                        editable: false,
                        store: new Ext.data.Store({
                            fields: ['roleId', 'roleNm'],
                            data: roleArrayObj
                        })
                    }},

                // 사용자 ID
                {text: bxMsg('DTP0302String3'), flex:1, dataIndex: 'staffId', style: 'text-align:center'},

                // 사용자명
                {text: bxMsg('DTP0302String2'), flex:1, dataIndex: 'staffNm', style: 'text-align:center'},

                // 적용시작일자
                {text: bxMsg('DPP0127String6'), flex:1,dataIndex:'applyStart', align: 'center',
                    editor: {
                        allowBlank: false,
                        listeners: {
                            focus: function(_this) {
                                PFUtil.getGridDateTimePicker(_this, 'applyStart', grid, selectedCellIndex);
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
                                PFUtil.getGridDateTimePicker(_this, 'applyEnd', grid, selectedCellIndex);
                            }
                        }
                    },
                    listeners: {
                        click: function() {
                            selectedCellIndex = $(arguments[1]).parent().index();
                        }
                    }
                },

                // 삭제
                {
                    xtype: 'actioncolumn', width: 35, align: 'center',
                    items: [{
                        icon: '/images/x-delete-16.png',
                        handler: function (grid, rowIndex, colIndex, item, e, record) {
                            if(record.data.process != 'C') {
                                record.data.process = 'D';
                                deleteRoleUserList.push(record.data);
                            }
                            record.destroy();
                            modifyFlag = true;
                        }
                    }]
                }
            ],
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1,
                    listeners:{
                        beforeedit:function(e, editor){
                            if(editor.record.get('process') != 'C'
                                && (editor.field == 'roleId' ||
                                editor.field == 'staffId'     ||
                                editor.field == 'staffNm'     ||
                                editor.field == 'applyStart' )) {
                                return false;
                            }
                        },
                        afteredit: function(e, editor){
                            if(editor.originalValue !=  editor.value && editor.record.get('process') != 'C'){
                                editor.record.set('process', 'U');
                                modifyFlag = true;
                            }
                        }
                    }
                })
            ],
            listeners: {
                afterrender : function(){
                    searchRoleUserRelList();       // 조회
                },
                cellclick : function(_this, td, cellIndex, record, tr, rowIndex, e, eOpts) {
                    if ((cellIndex == 1 || cellIndex == 2) && record.data.process == 'C') {
                        PFPopup.selectEmployee({}, function (selectItem) {
                            if(selectItem) {
                                $(tr).find('td').eq(1).find('div').text(selectItem.staffId);
                                $(tr).find('td').eq(2).find('div').text(selectItem.staffName);
                                record.data.staffId = selectItem.staffId;
                                record.data.staffNm = selectItem.staffName;
                            }
                        });

                    }
                }
            }
        }
    });

    return grid;
}

// 그리드 저장
function saveRoleUserRel(){

	// OHS 20171207 추가 - 역할, 사용자ID, 적용시작, 종료일이 빈값이면 저장불가
	if(roleUserRelGrid.getAllData() && roleUserRelGrid.getAllData().length > 0) {
		var returnFlag = false;
		roleUserRelGrid.getAllData().forEach(function(el) {
    		// 필수값 누락 체크
    		if( (!el.roleId || el.roleId == '')
    			|| (!el.staffId || el.staffId == '')
    			|| (!el.applyStart || el.applyStart == '')
    			|| (!el.applyEnd || el.applyEnd == '')) {
    			returnFlag = true;
    		}
    	});

     	if(returnFlag) {
        	// 필수 입력값이 비어있습니다.
            PFComponent.showMessage(bxMsg('mandatoryInputIsEmpty'), 'warning');
    		return;
    	}
	}

    var requestParam = {
        voList: roleUserRelGrid.getAllData().concat(deleteRoleUserList)
    };

    if(!modifyFlag){
		// 변경된 정보가 없습니다.
		PFComponent.showMessage(bxMsg('nothingToSave'), 'warning');
		return;
	}

    PFRequest.post('/common/role/saveRoleUserRelation.json', requestParam, {
        success: function(responseData) {
            if (responseData === true) {
                PFComponent.showMessage(bxMsg('workSuccess'), 'success');
                deleteRoleUserList = [];
                searchRoleUserRelList();
            }
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'RoleUserRelationService',
            operation: 'saveRoleUserRelation'
        }
    });
}
