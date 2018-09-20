const roleManagementTpl = getTemplate('roleManagementTpl');

// 역할관리팝업
var popupModifyFlag = false;
function renderRoleManagementPopup(){

	popupModifyFlag = false;
    var grid;

    PFComponent.makePopup({
        title: bxMsg('Role'),
        width: 300,
        height: 350,
        contents: roleManagementTpl(),
        modifyFlag : 'popup',
        buttons: [
            // 저장버튼
            {text:bxMsg('ButtonBottomString1'), elCls:'button button-primary write-btn', handler:function() {

            	// OHS 20171207 추가 - 역할명이 빈값이면 저장불가 ( 역할ID는 채번 )
            	if(grid.getAllData() && grid.getAllData().length > 0) {
            		var returnFlag = false;
            		grid.getAllData().forEach(function(el) {
                		// 필수값 누락 체크
                		if( (!el.roleNm || el.roleNm == '')) {
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
                    voList: grid.getAllData().concat(deleteRoleList)
                };

            	if(!popupModifyFlag){
            		// 변경된 정보가 없습니다.
            		PFComponent.showMessage(bxMsg('nothingToSave'), 'warning');
            		return;
            	}

                PFRequest.post('/common/role/saveRoleMaster.json', requestParam, {
                    success: function(responseData) {
                        if (responseData === true) {
                            PFComponent.showMessage(bxMsg('workSuccess'), 'success');
                            deleteRoleList = [];
                            getRoleMasterList();        // 그리드재조회
                            renderRoleComboBox(false);  // 콤보재조회 (화면을 reload 해야 할 수도 있음.

                            //그리드 재조회
                            $('.pf-cru-role-user-list-grid').empty();
                            //바닥 그리드 재조회(역할별사용자관리 그리드)
                            roleUserRelGrid = renderRoleUserRelGrid();

                        }
                    },
                    bxmHeader: {
                        application: 'PF_Factory',
                        service: 'RoleMasterService',
                        operation: 'saveRoleMaster'
                    }
                });

            }},
            {text:bxMsg('RightPane_Command1'), elCls:'button button-primary', handler:function(){
            	popupModifyFlag = false;
                this.close();       // 닫기
            }}
        ],
        contentsEvent: {
            'click .role-add-btn': function(e) {
                grid.addData({
                    roleId: '',
                    roleNm: '',
                    iqrySeq: '',
                    process: 'C'
                });
                popupModifyFlag = true;
            }
        },
        listeners: {
            afterRenderUI: function() {

                if(writeYn != 'Y'){
                    $('.write-btn').hide();
                }

                grid = PFComponent.makeExtJSGrid({
                    fields: ['roleId', 'roleNm', 'iqrySeq', 'process'],
                    gridConfig: {
                        renderTo: '.popup-role-management-grid',
                        columns: [
                            {text: bxMsg('SUM0103String1'), width: 80, dataIndex: 'roleId', disabled: true},
                            {text: bxMsg('SUM0103String2'), width: 80, dataIndex: 'roleNm',editor:{allowBlank:false}},
                            {text: bxMsg('inquirysequence'), flex: 1, dataIndex: 'iqrySeq',editor:{allowBlank:false}},
                            {
                                xtype: 'actioncolumn', width: 35, align: 'center',
                                items: [{
                                    icon: '/images/x-delete-16.png',
                                    handler: function (grid, rowIndex, colIndex, item, e, record) {
                                        if(record.data.process != 'C') {
                                            record.data.process = 'D';
                                            deleteRoleList.push(record.data);
                                        }
                                        record.destroy();
                                        popupModifyFlag = true;
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
                                           popupModifyFlag = true;
                                       }
                                    }
                                }
                            })
                        ]
                        ,
                        listeners: {

                        }
                    }
                });

                getRoleMasterList();
            }
        }
    });

    function getRoleMasterList() {
        deleteRoleList = [];
        PFRequest.get('/common/role/getRoleMasterList.json', {}, {
            success: function (responseData) {
                grid.setData(responseData);
                popupModifyFlag = false;
            },
            bxmHeader: {
                application: 'PF_Factory',
                service: 'RoleMasterService',
                operation: 'queryListRoleMaster'
            }
        });
    }
}