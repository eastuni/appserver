/******************************************************************************************************************
 * 오브젝트 관리 팝업
 ******************************************************************************************************************/
function renderObjectManagePopup(data){
    const objectManagementPopupTpl = getTemplate('objectManagementPopupTpl'); // 오브젝트관리 신규 팝업
    var button = [];

    // 저장 버튼
    button.push({
        text: bxMsg('ButtonBottomString1'), elCls: 'button button-primary write-btn',
        handler: function () {
        	saveObject(data.work, this);
        }
    });

    // 취소 버튼
    button.push({text:bxMsg('ButtonBottomString16'), elCls:'button button-primary',handler:function(){
        this.close();
    }});


    // 팝업 호출
    PFComponent.makePopup({
        title: bxMsg('ObjectManagement'),           // 오브젝트 관리
        contents: objectManagementPopupTpl(data),
        width:420,
        height:280,
        buttons: button,
        modifyFlag : 'readonly',
        listeners: {
            afterRenderUI: function() {
              var objectId = $('.objectId').val();
              if(objectId !== '' && objectId !== null){
                 $('.objectId').prop('disabled', true);
              }
              $(".objectId").keyup(function(event){
            	  if (!(event.keyCode >=37 && event.keyCode<=40)) {
            		  var inputVal = $(this).val();
            		  $(this).val(inputVal.replace(/[^a-z0-9]/gi,''));
            	  }
              });
              renderComboBox("ObjectTypeDscd", $('.cls-str-obj-tp-dscd-select'));
              $('.cls-str-obj-tp-dscd-select').val(data.objectTypeDscd);
            }
        }
    });
}

// 콤보바인딩함수
function renderComboBox(code, selector){

    var options = [];

    $.each(codeMapObj[code], function (code, name) {
        var $option = $('<option>');

        $option.val(code);
        $option.text(name);

        options.push($option);
    });

    selector.html(options);
}



/******************************************************************************************************************
 * 속성 관리 팝업
 ******************************************************************************************************************/
function renderAttributeManagePopup() {
	var button = [];

	// 저장 버튼
	button.push({
		text: bxMsg('ButtonBottomString1'),
		elCls: 'button button-primary write-btn',
        handler: function () {
        	saveAttribute();
        }
	});

	// 선택 버튼
    button.push({
    	text:bxMsg('select'),
    	elCls:'button button-primary',
    	handler:function(){
    		var selectedData = attributeGrid.getSelectedItem();

            if(selectedData == '') {
            	return;
            }

            selectedData.forEach(function(el) {
                if (el.atrbtId == '') {
                	return;
                }

                el['applyStartDate'] = PFUtil.getNextDate() + ' 00:00:00';
                el['applyEndDate'] = '9999-12-31 23:59:59';
                el['process'] = 'C';
            });

            objectAttributeRelGrid.addData(selectedData);

            this.close();
    	}
    });

    // 닫기 버튼
    button.push({
    	text:bxMsg('ButtonBottomString17'),
    	elCls:'button button-primary',
    	handler:function(){
    		this.close();
    	}
    });

    const attributeManagementPopupTpl = getTemplate('attributeManagementPopupTpl');	// 속성관리 팝업

    // 팝업호출
    PFComponent.makePopup({
        title: bxMsg('AttributeManagement'),	// 속성관리
        contents: attributeManagementPopupTpl(),
        width:900,
        height:420,
        buttons: button,
        modifyFlag : 'readonly',
        contentsEvent:{
            // 검색버튼 클릭시
            'click .eav-attribute-search-btn': function() {

                // 속성목록조회
                searchAttributeList();
            },

            // 속성추가 버튼 클릭
            'click .eav-attribute-add-btn': function() {
            	var newData = {
            			process : 'C'
            	};

            	// 그리드에 row 추가
            	attributeGrid.addData(newData);
            }
        },

        listeners: {
            afterRenderUI: function() {
            	attributeGrid = renderAttributeGrid();

            	// 속성목록조회
            	searchAttributeList();
            }
        }
    });
}

// 속성저장
let	attributeGrid;				// 속성그리드 in 속성관리 POPUP
function saveAttribute() {
	var gridData = attributeGrid.getAllData();

	var checkMandatory = true;
	gridData.forEach(function(el){
		// atrbtId','atrbtNm', 'atrbtDesc', 'atrbtTpDscd', 'dataTpDscd','refCmnCd', 'process'
		if(el.atrbtId == '' || el.atrbtId.lenght == 0
			|| el.atrbtNm  == '' || el.atrbtNm.lenght == 0
			|| el.atrbtTpDscd == '' || el.atrbtTpDscd.lenght == 0
			|| el.dataTpDscd == '' || el.dataTpDscd.lenght == 0) {
			PFComponent.showMessage(bxMsg('mandatoryInputIsEmpty'), 'warning');
			checkMandatory = false;
		}
	});

	if(!checkMandatory){
		return;
	}

	var requestParam = {};
	gridData = gridData.concat(attributeDeleteList);
	requestParam['voList'] = gridData;

	// 변경된 내용이 없으면 저장하지 않음
	if (gridData !== undefined) {
		var changeFlag = false;

		for (var i = 0; i < gridData.length; i++) {
        	if (gridData[i].process !== null) {
        		changeFlag = true;
        		break;
        	}
		}

		if (changeFlag == false) {
			PFComponent.showMessage(bxMsg('nothingToSave'), 'warning');
			return;
		}
	}

	PFRequest.post('/eav/saveAttribute.json', requestParam, {
        success: function(responseData) {
    		var gridData = attributeGrid.getAllData();

    		if(gridData !== undefined){
	            for (var i = 0; i < gridData.length; i++) {
	            	gridData[i].process = null
				}
        	}

    		attributeDeleteList = [];

            PFComponent.showMessage(bxMsg('workSuccess'), 'success');
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'EAVService',
            operation: 'saveAttribute'
        }
    });
}


// 속성목록 그리드 in 속성관리 POPUP
function renderAttributeGrid() {
	var grid = PFComponent.makeExtJSGrid({
        pageAble: true,
        fields: ['atrbtId','atrbtNm', 'atrbtDesc', 'atrbtTpDscd', 'dataTpDscd','refCmnCd', 'process'],
        gridConfig: {
        	selModel: Ext.create('Ext.selection.CheckboxModel', {mode: 'MULTI'}),	// 체크박스
            renderTo: '.eav-attribute-grid',
            columns: [
                // 속성ID
                {text: bxMsg('AttributeId'), flex: 1, dataIndex: 'atrbtId',editor: {}},

                // 속성명
                {text: bxMsg('AttributeName'), flex: 1, dataIndex: 'atrbtNm',editor: {}},

                // 속성설명
                {text: bxMsg('AttributeDescription'), flex: 2, dataIndex: 'atrbtDesc',editor: {}},

                // 속성유형
                {text: bxMsg('AttributeTypeDscd'), flex: 0.5, dataIndex: 'atrbtTpDscd',
                    renderer: function(value) {
                        return codeMapObj.attributeTypeDscd[value] || value;
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
                            data: codeArrayObj['attributeTypeDscd']
                        })
                    }
                },

                // 데이터타입
                {text: bxMsg('DataTypeDscd'), flex: 0.5, dataIndex: 'dataTpDscd',
                    renderer: function(value) {
                        return codeMapObj.dataTpDscd[value] || value;
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
                            data: codeArrayObj['dataTpDscd']
                        })
                    }
                },

                // delete row
                {xtype: 'actioncolumn', width: 35, align: 'center', sortable: false,
                 items: [{
                        icon: '/images/x-delete-16.png',
                        handler: function (grid, rowIndex, colIndex, item, e, record) {
                            if(record.data.process != 'C') {
                                record.data.process = 'D';
                                attributeDeleteList.push(record.data);
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
//                            if(editor.field == 'atrbtId') {
//                                return false;
//                            }
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

// 속성관리 POPUP - 속성목록 조회
function searchAttributeList(){
	var requestParam = {
		'tntInstId' : tntInstId,
	    'atrbtId': $('.pf-eav-attribute-manage-form .attributeId').val(),
	    'atrbtNm': $('.pf-eav-attribute-manage-form .attributeName').val(),
	};

	// 속성조회
    PFRequest.get('/eav/getAttributeList.json', requestParam, {
        success: function(responseData) {

        	attributeDeleteList = [];
        	attributeGrid.setData(responseData);
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'EAVService',
            operation: 'getAttributeList'
        }
    });
}