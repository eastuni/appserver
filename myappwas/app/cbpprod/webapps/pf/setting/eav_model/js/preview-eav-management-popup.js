function renderPreviewPopup(){
	var eavManagementTpl = getTemplate('previewEAVManagementPopupTpl');
    var button = [];

    // 닫기 버튼
    button.push({
    	text:bxMsg('ButtonBottomString17'),
    	elCls:'button button-primary',
    	handler:function(){
    		this.close();
    	}
    });

    // 팝업 호출
    PFComponent.makePopup({
        title: gObjectName, // 오브젝트명
        elCls: 'pf-eav-management',
        contents: eavManagementTpl(),
        width:1017,
        height:300,
        buttons: button,
        modifyFlag : 'readonly',
        listeners: {
            afterRenderUI: function() {
            	searchEAVScreenConfigInfoListForGridHeader(); // 조회
                //searchEAVValueObjectDetailList(); // 값조회 주석

            	$('.pf-pd-eav-management-grid-form').find('input').prop('disabled', true);
            	$('.pf-eav-management').find('.pfui-stdmod-body').css('overflow-y', 'auto');
            	$('.pf-eav-management').find('.pf-panel-header').remove();
            }
        }
    });
}

//EAV 화면구성 조회
function searchEAVScreenConfigInfoListForGridHeader() {
	// Set input
    var requestParam = {
    	'tntInstId' : tntInstId,
    	'objectId': gObjectId
   	};

    PFRequest.get('/eav/getEAVScreenConfigInfoList.json', requestParam, {
    	async: false,
        success: function(responseData) {

        	var titleConditionInfo = '';
           	if(responseData) {

           		var gridHeaderArr = [];
        		responseData.forEach(function(el, index) {
        			var title = '';
        			var labelIndex = 0;
        			// 01 : 라벨
        			if(el.screenConfigWayDscd == '01') {

        				if(el.defaultValue) {
            				title = '<th style="width:155px">' + el.atrbtNm + '</th>' +
                            '<td><input type="text" class="bx-form-item bx-compoenent-small"'
            					+ 'data-form-param="' + el.atrbtId + '" default-value="' + el.defaultValue + '" dataTpDscd="' + el.dataTpDscd
                            	+ '" value="' + el.defaultValue + '"' + '/></td>';
        				}
        				else {
            				title = '<th style="width:155px">' + el.atrbtNm + '</th>' +
                            '<td><input type="text" class="bx-form-item bx-compoenent-small" data-form-param="' + el.atrbtId + '" dataTpDscd="' + el.dataTpDscd + '"/></td>';
        				}

        	 			if(((labelIndex+1)%2) == 1) {
            				titleConditionInfo = titleConditionInfo + '<tr class="add-tr">' + title;
            			}
            			else{
            				titleConditionInfo = titleConditionInfo + title + '</tr>'
            			}
        	 			labelIndex++;
        			}
        			// 02 : 그리드헤더
        			else if(el.screenConfigWayDscd == '02') {
        				gridHeaderArr.push(el);
        			}
        		});
        	}

            $('.pd-eav-management-query-table .add-tr').remove();
            $('.pd-eav-management-query-table').append(titleConditionInfo);

            if(gridHeaderArr && gridHeaderArr.length > 0) {
            	$('.pf-pd-eav-management-grid-form').find('.pf-pd-eav-management-list-grid').css('display', 'block');
            	$('.pf-eav-management .middle-grid').css('height', '90px');
            	// Grid 처리
            	renderGridHeaderArr(gridHeaderArr);
            }
            else {
            	// 라벨형식과 그리드형식 모두 데이터가 없을경우 message를 보여줌
            	if(titleConditionInfo == '') {
            		// 화면구성 미리보기를 위한 정보가 부족합니다.\n 화면구성을 확인하세요.
            		var $span = "<div>" + bxMsg('notenoughEAVScreenInfo') + "</div>";
            		$('.pd-eav-management-query-table').append($span);
            	}
            	$('.pf-eav-management .middle-grid').css('height', '0px');
            	$('.pf-pd-eav-management-grid-form').find('.pf-pd-eav-management-list-grid').css('display', 'none');
            }
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'EAVService',
            operation: 'getEAVScreenConfigInfoList'
        }
    });
}
//EAV Object 상세 값 목록조회
function searchEAVValueObjectDetailList() {
	// Set input
	var requestParam = {
			'tntInstId' : tntInstId,
			'objectId': gObjectId
	};

	PFRequest.get('/eav/getEAVObjectValueDetailInfoList.json', requestParam, {
		success: function(responseData) {
			console.log('responseData :' + responseData);

			if(responseData && responseData.voList) {

				responseData.voList.forEach(function(el, index) {
				    $.each($('.pf-eav-management').find('input'), function(prop, val) {
				        if($(val).attr('data-form-param') && $(val).attr('data-form-param') == el.atrbtId) {
				        	$(val).val(el.atrbtVal);
				        	responseData.voList.splice(index, 1);
				        }
				    });
				});

				if(responseData.voList && responseData.voList.length > 0) {
					if(!eavManagementGrid) return;
					var fields = eavManagementGrid.store.model.getFields();

					var valSeqNbrMap = {};
					responseData.voList.forEach(function(el, index) {

						var gridData = {};
						if(valSeqNbrMap[el.valSeqNbr]) {
							var gridData = valSeqNbrMap[el.valSeqNbr];

							gridData[el.atrbtId] = el.atrbtId;
							gridData[el.atrbtId + '_value'] = el.atrbtVal;
							gridData[el.atrbtId + '_key'] = el.atrbtId;
							//gridData['dataTpDscd'] = el.dataTpDscd;

							valSeqNbrMap[el.valSeqNbr] = gridData;

				           	fields.push({
				            	name : el.atrbtId + '_value',
				            	style: 'text-align:center'
				            });
				           	fields.push({
				           		name : el.atrbtId + '_key',
				           		style: 'text-align:center'
				           	});
						}
						else {
							gridData.valSeqNbr = el.valSeqNbr;
							gridData[el.atrbtId] = el.atrbtId;
							gridData[el.atrbtId + '_value'] = el.atrbtVal;
							gridData[el.atrbtId + '_key'] = el.atrbtId;

							valSeqNbrMap[el.valSeqNbr] = gridData;

				           	fields.push({
				            	name : el.atrbtId + '_value',
				            	style: 'text-align:center'
				            });
				           	fields.push({
				           		name : el.atrbtId + '_key',
				           		style: 'text-align:center'
				           	});
						}
					});

					eavManagementGrid.store.model.setFields(fields);
					var newGridData = Object.values(valSeqNbrMap);
					if(newGridData && newGridData.length > 0) {
						eavManagementGrid.setData(newGridData);
					}
				}
			}
		},
		bxmHeader: {
			application: 'PF_Factory',
			service: 'EAVService',
			operation: 'getEAVScreenConfigInfoList'
		}
	});
}

// EAV Management 그리드
function renderGridHeaderArr(title) {

    var fields = ['process', 'valSeqNbr', 'atrbtId', 'dataTpDscd'];
    var columns = [];

    arrGridTitleData = [];

    $('.pf-pd-eav-management-list-grid').empty();


    if(title) {
        title.forEach(function(el) {
            fields.push({
            	name : el.atrbtId + '_key',
            	style: 'text-align:center'
            });

            columns.push({header: '<div style="text-align:center">' + el.atrbtNm + '</br>('+ el.atrbtId +') </div>',
            	flex: 1 , dataIndex: el.atrbtId + '_key', defaultValue: el.defaultValue, dataTpDscd : el.dataTpDscd,
            	renderer: function(value, p, record) {
            		// 입력값이 없을경우 default value로 값 세팅
            		if((!value || value == '' ) && p && p.column && p.column.defaultValue && record.data.process == 'C') {

            			record.set(p.column.dataIndex, p.column.defaultValue);
            			record.set('dataTpDscd', p.column.dataTpDscd);
            			return p.column.defaultValue;
            		}
            		else {
            			if(p.column && p.column.dataIndex == value + '_key') {
            				record.set(p.column.dataIndex, record.data[value + '_value']);
            				record.set('dataTpDscd', p.column.dataTpDscd);
            				return record.data[value + '_value'];
            			}
            			else {
            				record.set(p.column.dataIndex, value);
            				record.set('dataTpDscd', p.column.dataTpDscd);
            				return value;
            			}
            		}
            	},
                style: 'text-align:center'
            });
        });
    }

    eavManagementGrid = PFComponent.makeExtJSGrid({
        fields:fields,
        gridConfig: {
            renderTo: '.pf-pd-eav-management-list-grid',
            columns: columns,
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1,
                    listeners:{
                    }
                })
            ],
            listeners: {
                'viewready' : function(_this, eOpts){
                }
            }
        }
    });
}