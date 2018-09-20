/**
 * Select role.
 * @param {Object} config
 * @param {boolean} [config.multi=false] Allow multi select.
 * @param {boolean} [config.readOnly=false] Create popup as read-only mode.
 * @param {String} [config.title=bxMsg('employeeSearch')] Title of popup.
 * @param {PFPopup~employeeCallback} callback The callback that handles the response.
 */
PFPopup.selectRole = function({
	  multi = false,
	  readOnly = false,
	  title = bxMsg('roleSearch')
}, callback = function(){} ) {

	const popupTpl = PFPopup.getPopupTemplate('role');
	let grid;

	PFComponent.makePopup({
        title: title,
        width: 300,
        height: 350,
        contents: popupTpl(),
        buttons: [
            // 확인버튼
            {
            	text:bxMsg('Z_OK'), elCls:'button button-primary',
            	handler:function(){
            		const selected = grid.getSelectedItem();
            		if(multi){ // return multiple results
            			callback(selected);
            		}else if (selected.length > 0) { // return one result
            			callback(selected[0]);
                    }
            		this.close();       // 닫기
            	}
            },
            // 닫기버튼
            {
            	text:bxMsg('RightPane_Command1'), elCls:'button button-primary',
            	handler:function(){
            		this.close();       // 닫기
            	}
            }
        ],
        listeners: {
            afterRenderUI: function() {

                if(writeYn != 'Y'){
                    $('.write-btn').hide();
                }

                grid = PFComponent.makeExtJSGrid({
                    fields: ['roleId', 'roleNm', 'iqrySeq', 'process'],
                    gridConfig: {
                    	selModel: PFPopup.getCheckboxModel(multi, readOnly),
                        renderTo: '.popup-role-grid',
                        columns: [
                            {text: bxMsg('SUM0103String1'), width: 80, dataIndex: 'roleId'},
                            {text: bxMsg('SUM0103String2'), flex:1 , dataIndex: 'roleNm'},
                        ]
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
            },
            bxmHeader: {
                application: 'PF_Factory',
                service: 'RoleMasterService',
                operation: 'queryListRoleMaster'
            }
        });
    }
};






